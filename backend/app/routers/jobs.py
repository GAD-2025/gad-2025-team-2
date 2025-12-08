from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from sqlalchemy import func
from typing import Optional, List
import json
import uuid

from app.db import get_session
from app.models import Job, Employer, EmployerProfile, SignupUser, Application
from app.schemas import JobCreateRequest, JobResponse

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("", response_model=List[dict])
async def list_jobs(
    query: Optional[str] = None,
    location: Optional[str] = None,
    industry: Optional[str] = None,
    languageLevel: Optional[str] = None,
    visaType: Optional[str] = None,
    sort: Optional[str] = Query(
        default=None,
        description="Preset filter: high-wage, popular, trusted, short-term",
    ),
    limit: int = Query(default=20, le=100),
    offset: int = 0,
    session: Session = Depends(get_session),
):
    """List jobs with filters"""
    statement = select(Job)
    if query:
        statement = statement.where(Job.title.like(f"%{query}%"))
    if location:
        statement = statement.where(Job.location.like(f"%{location}%"))
    if industry:
        statement = statement.where(Job.category.like(f"%{industry}%"))
    if languageLevel:
        statement = statement.where(Job.requiredLanguage.like(f"%{languageLevel}%"))

    jobs = session.exec(statement.offset(offset).limit(limit)).all()

    # Preload application counts for popularity sorting/filtering
    app_counts = dict(
        session.exec(
            select(Application.jobId, func.count(Application.applicationId)).group_by(Application.jobId)
        ).all()
    )
    
    # Get employer info for each job
    result = []
    for job in jobs:
        employer_stmt = select(Employer).where(Employer.id == job.employerId)
        employer = session.exec(employer_stmt).first()
        # Basic active filter
        if hasattr(job, 'status') and job.status != 'active':
            continue

        # Filter by visaType if provided
        try:
            required_visas = json.loads(job.requiredVisa) if job.requiredVisa else []
        except Exception:
            required_visas = []

        if visaType:
            # required_visas may be list or string; normalize
            if isinstance(required_visas, list):
                if visaType not in required_visas:
                    continue
            else:
                if visaType not in str(required_visas):
                    continue

        # Derive trust flag from employer profile (사업자등록증/인증 여부)
        is_trusted = False
        employer_profile = None
        if employer and employer.businessNo:
            employer_profile = session.exec(
                select(EmployerProfile).where(EmployerProfile.id == employer.businessNo)
            ).first()
        if employer_profile:
            if getattr(employer_profile, "business_license", None):
                is_trusted = True
            if getattr(employer_profile, "is_verified", False):
                is_trusted = True

        job_dict = job.dict()
        job_dict["employer"] = employer.dict() if employer else {}
        job_dict["requiredVisa"] = required_visas
        job_dict["applicationsCount"] = app_counts.get(job.id, 0)
        job_dict["isTrusted"] = is_trusted

        # Quick-menu preset filters
        if sort == "high-wage" and job.wage < 11000:
            continue
        if sort == "popular" and app_counts.get(job.id, 0) <= 0:
            continue
        if sort == "trusted" and not is_trusted:
            continue
        result.append(job_dict)
    
    # Sorting for presets
    if sort == "high-wage":
        result.sort(key=lambda x: x.get("wage", 0), reverse=True)
    elif sort == "popular":
        result.sort(key=lambda x: x.get("applicationsCount", 0), reverse=True)
    elif sort == "trusted":
        result.sort(key=lambda x: x.get("postedAt") or x.get("createdAt") or "", reverse=True)
    else:
        # Default: latest first if postedAt exists
        result.sort(key=lambda x: x.get("postedAt") or x.get("createdAt") or "", reverse=True)

    return result


@router.get("/{job_id}", response_model=dict)
async def get_job(job_id: str, session: Session = Depends(get_session)):
    """Get single job detail"""
    statement = select(Job).where(Job.id == job_id)
    job = session.exec(statement).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get employer
    employer_stmt = select(Employer).where(Employer.id == job.employerId)
    employer = session.exec(employer_stmt).first()
    employer_profile = None
    is_trusted = False
    if employer and employer.businessNo:
        employer_profile = session.exec(
            select(EmployerProfile).where(EmployerProfile.id == employer.businessNo)
        ).first()
    if employer_profile:
        if getattr(employer_profile, "business_license", None):
            is_trusted = True
        if getattr(employer_profile, "is_verified", False):
            is_trusted = True
    
    job_dict = job.dict()
    job_dict["employer"] = employer.dict() if employer else {}
    job_dict["requiredVisa"] = json.loads(job.requiredVisa)
    job_dict["applicationsCount"] = session.exec(
        select(func.count(Application.applicationId)).where(Application.jobId == job.id)
    ).one()[0]
    job_dict["isTrusted"] = is_trusted
    
    return job_dict


@router.patch("/{job_id}/status")
async def update_job_status(
    job_id: str, 
    status_data: dict,
    session: Session = Depends(get_session)
):
    """Update job status (active, paused, closed)"""
    statement = select(Job).where(Job.id == job_id)
    job = session.exec(statement).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    new_status = status_data.get('status')
    if new_status not in ['active', 'paused', 'closed']:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    job.status = new_status
    session.add(job)
    session.commit()
    session.refresh(job)
    
    return {"message": "Status updated successfully", "status": new_status}


@router.delete("/{job_id}")
async def delete_job(job_id: str, session: Session = Depends(get_session)):
    """Delete a job posting"""
    statement = select(Job).where(Job.id == job_id)
    job = session.exec(statement).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    session.delete(job)
    session.commit()
    
    return {"message": "Job deleted successfully"}


@router.put("/{job_id}")
async def update_job(
    job_id: str,
    job_data: dict,
    session: Session = Depends(get_session)
):
    """Update a job posting"""
    statement = select(Job).where(Job.id == job_id)
    job = session.exec(statement).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Update job fields
    if 'title' in job_data:
        job.title = job_data['title']
    if 'description' in job_data:
        job.description = job_data['description']
    if 'category' in job_data:
        job.category = job_data['category']
    if 'wage' in job_data:
        job.wage = job_data['wage']
    if 'work_days' in job_data:
        job.workDays = job_data['work_days']
    if 'work_hours' in job_data:
        job.workHours = job_data['work_hours']
    if 'deadline' in job_data:
        job.deadline = job_data['deadline']
    if 'positions' in job_data:
        job.positions = job_data['positions']
    if 'required_language' in job_data:
        job.requiredLanguage = job_data['required_language']
    if 'required_visa' in job_data:
        job.requiredVisa = json.dumps(job_data['required_visa'])
    if 'benefits' in job_data:
        job.benefits = job_data['benefits']
    if 'employer_message' in job_data:
        job.employerMessage = job_data['employer_message']
    
    session.add(job)
    session.commit()
    session.refresh(job)
    
    return {"message": "Job updated successfully", "job_id": job.id}


@router.post("", response_model=JobResponse, status_code=201)
async def create_job(request: JobCreateRequest, session: Session = Depends(get_session)):
    """Create a new job posting"""
    # Get EmployerProfile
    employer_profile = session.get(EmployerProfile, request.employer_profile_id)
    if not employer_profile:
        raise HTTPException(status_code=404, detail="고용주 프로필을 찾을 수 없습니다.")
    
    # Get SignupUser for employer info
    signup_user_stmt = select(SignupUser).where(SignupUser.id == employer_profile.user_id)
    signup_user = session.exec(signup_user_stmt).first()
    if not signup_user:
        raise HTTPException(status_code=404, detail="사용자 정보를 찾을 수 없습니다.")
    
    # Create or get Employer record (legacy table for compatibility)
    employer_stmt = select(Employer).where(Employer.businessNo == employer_profile.id)
    employer = session.exec(employer_stmt).first()
    
    if not employer:
        employer = Employer(
            id=f"emp-{uuid.uuid4().hex[:8]}",
            businessNo=employer_profile.id,
            shopName=employer_profile.company_name,
            industry="기타",  # Default, can be extended
            address=employer_profile.address,
            openHours="09:00-18:00",  # Default
            contact=signup_user.email or "",
            minLanguageLevel=request.required_language,
            baseWage=request.wage,
            schedule=request.work_hours,
        )
        session.add(employer)
        session.commit()
        session.refresh(employer)
    
    # Create Job
    from datetime import datetime
    job_id = f"job-{uuid.uuid4().hex[:8]}"
    current_time = datetime.utcnow().isoformat()
    
    # Determine status from request or default to 'active'
    job_status = getattr(request, 'status', 'active') or 'active'
    
    # Use location from request if provided, otherwise extract from address
    location = request.location or None
    if not location and request.shop_address:
        parts = request.shop_address.split()
        if len(parts) >= 2:
            location = f"{parts[0]} {parts[1]}"
    elif not location and employer.address:
        parts = employer.address.split()
        if len(parts) >= 2:
            location = f"{parts[0]} {parts[1]}"
    
    job = Job(
        id=job_id,
        employerId=employer.id,
        title=request.title,
        description=request.description,
        category=request.category,
        wage=request.wage,
        workDays=request.work_days,
        workHours=request.work_hours,
        deadline=request.deadline,
        positions=request.positions,
        requiredLanguage=request.required_language,
        requiredVisa=json.dumps(request.required_visa),
        benefits=request.benefits,
        employerMessage=request.employer_message,
        createdAt=current_time,
        postedAt=current_time,
        status=job_status,
        views=0,
        applications=0,
        location=location,
        shop_name=getattr(request, 'shop_name', None),
        shop_address=getattr(request, 'shop_address', None),
        shop_address_detail=getattr(request, 'shop_address_detail', None),
        shop_phone=getattr(request, 'shop_phone', None),
    )
    
    session.add(job)
    session.commit()
    session.refresh(job)
    
    return JobResponse(
        id=job.id,
        employer_id=job.employerId,
        title=job.title,
        description=job.description,
        category=job.category,
        wage=job.wage,
        work_days=job.workDays,
        work_hours=job.workHours,
        deadline=job.deadline,
        positions=job.positions,
        required_language=job.requiredLanguage,
        required_visa=request.required_visa,
        benefits=job.benefits,
        employer_message=job.employerMessage,
        created_at=job.createdAt,
        employer=employer.dict(),
    )

