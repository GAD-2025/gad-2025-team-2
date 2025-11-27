from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import Optional, List
import json
import uuid

from app.db import get_session
from app.models import Job, Employer, EmployerProfile, SignupUser
from app.schemas import JobCreateRequest, JobResponse

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("", response_model=List[dict])
async def list_jobs(
    query: Optional[str] = None,
    location: Optional[str] = None,
    industry: Optional[str] = None,
    languageLevel: Optional[str] = None,
    visaType: Optional[str] = None,
    limit: int = Query(default=20, le=100),
    offset: int = 0,
    session: Session = Depends(get_session),
):
    """List jobs with filters"""
    statement = select(Job).offset(offset).limit(limit)
    jobs = session.exec(statement).all()
    
    # Get employer info for each job
    result = []
    for job in jobs:
        employer_stmt = select(Employer).where(Employer.id == job.employerId)
        employer = session.exec(employer_stmt).first()
        
        job_dict = job.dict()
        job_dict["employer"] = employer.dict() if employer else {}
        job_dict["requiredVisa"] = json.loads(job.requiredVisa)
        result.append(job_dict)
    
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
    
    job_dict = job.dict()
    job_dict["employer"] = employer.dict() if employer else {}
    job_dict["requiredVisa"] = json.loads(job.requiredVisa)
    
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
        status="active",
        views=0,
        applications=0,
        location=employer.address.split()[:2].__str__() if employer.address else None,
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

