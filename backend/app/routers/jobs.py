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
    store_id: Optional[str] = Query(default=None, description="매장 ID로 필터링"),
    user_id: Optional[str] = Query(default=None, description="고용주 user_id로 필터링 (해당 고용주의 모든 매장 공고)"),
    sort: Optional[str] = Query(
        default=None,
        description="Preset filter: high-wage, popular, trusted, short-term",
    ),
    limit: int = Query(default=20, le=100),
    offset: int = 0,
    session: Session = Depends(get_session),
):
    """List jobs with filters"""
    from app.models import Store
    
    statement = select(Job)
    if query:
        statement = statement.where(Job.title.like(f"%{query}%"))
    if location:
        statement = statement.where(Job.location.like(f"%{location}%"))
    if industry:
        statement = statement.where(Job.category.like(f"%{industry}%"))
    if languageLevel:
        statement = statement.where(Job.requiredLanguage.like(f"%{languageLevel}%"))
    if store_id:
        statement = statement.where(Job.store_id == store_id)
    if user_id and user_id.strip():
        # 고용주의 모든 매장 ID 가져오기
        stores_stmt = select(Store).where(Store.user_id == user_id)
        stores = session.exec(stores_stmt).all()
        store_ids = [store.id for store in stores]
        
        print(f"[DEBUG] list_jobs - user_id 필터링:")
        print(f"  user_id: {user_id}")
        print(f"  매장 개수: {len(stores)}")
        print(f"  매장 IDs: {store_ids}")
        
        if store_ids:
            # 매장이 있으면: 해당 매장의 공고 + store_id가 NULL인 공고 (레거시 공고)
            from sqlalchemy import or_
            statement = statement.where(
                or_(
                    Job.store_id.in_(store_ids),
                    Job.store_id.is_(None)  # store_id가 NULL인 공고도 포함
                )
            )
            print(f"[DEBUG] list_jobs - 매장 필터 적용: {store_ids} 또는 NULL")
        else:
            # 매장이 없으면: store_id가 NULL인 공고만 (레거시 공고)
            statement = statement.where(Job.store_id.is_(None))
            print(f"[DEBUG] list_jobs - 매장이 없음, store_id가 NULL인 공고만 조회")

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
        # Status filter는 공고 관리 페이지에서 필요하므로 제거
        # if hasattr(job, 'status') and job.status != 'active':
        #     continue

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
        job_dict["wage_type"] = getattr(job, 'wage_type', 'hourly') or 'hourly'
        job_dict["store_id"] = getattr(job, 'store_id', None)
        job_dict["shop_name"] = getattr(job, 'shop_name', None)
        job_dict["shop_address"] = getattr(job, 'shop_address', None)
        job_dict["shop_address_detail"] = getattr(job, 'shop_address_detail', None)
        job_dict["shop_phone"] = getattr(job, 'shop_phone', None)

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
    # requiredVisa가 문자열/JSON 형태 모두 안전하게 처리
    try:
        job_dict["requiredVisa"] = json.loads(job.requiredVisa)
    except Exception:
        job_dict["requiredVisa"] = job.requiredVisa if isinstance(job.requiredVisa, list) else []
    count_row = session.exec(
        select(func.count(Application.applicationId)).where(Application.jobId == job.id)
    ).first()
    job_dict["applicationsCount"] = count_row or 0
    job_dict["isTrusted"] = is_trusted
    job_dict["wage_type"] = getattr(job, 'wage_type', 'hourly') or 'hourly'
    job_dict["store_id"] = getattr(job, 'store_id', None)
    job_dict["shop_name"] = getattr(job, 'shop_name', None)
    job_dict["shop_address"] = getattr(job, 'shop_address', None)
    job_dict["shop_address_detail"] = getattr(job, 'shop_address_detail', None)
    job_dict["shop_phone"] = getattr(job, 'shop_phone', None)
    
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
    job_status = request.status if request.status else 'active'
    
    # 디버깅: 받은 매장 정보 확인
    print(f"[DEBUG] create_job - 받은 매장 정보:")
    print(f"  shop_name: {request.shop_name}")
    print(f"  shop_address: {request.shop_address}")
    print(f"  shop_address_detail: {request.shop_address_detail}")
    print(f"  shop_phone: {request.shop_phone}")
    print(f"  store_id: {request.store_id}")
    
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
        wage_type=request.wage_type if request.wage_type else 'hourly',
        workDays=request.work_days,
        workHours=request.work_hours,
        deadline=request.deadline,
        positions=request.positions,
        requiredLanguage=request.required_language,
        requiredVisa=json.dumps(request.required_visa),
        benefits=request.benefits,
        createdAt=current_time,
        postedAt=current_time,
        status=job_status,
        views=0,
        applications=0,
        location=location,
        shop_name=request.shop_name,
        shop_address=request.shop_address,
        shop_address_detail=request.shop_address_detail,
        shop_phone=request.shop_phone,
        store_id=request.store_id,
    )
    
    # 디버깅: 저장할 Job 객체 확인
    print(f"[DEBUG] create_job - 저장할 Job 객체:")
    print(f"  job_id: {job_id}")
    print(f"  employerId: {employer.id}")
    print(f"  title: {job.title}")
    print(f"  status: {job_status}")
    print(f"  shop_name: {job.shop_name}")
    print(f"  shop_address: {job.shop_address}")
    print(f"  shop_address_detail: {job.shop_address_detail}")
    print(f"  shop_phone: {job.shop_phone}")
    print(f"  store_id: {job.store_id}")
    
    try:
        session.add(job)
        session.commit()
        session.refresh(job)
        
        # 데이터베이스에 실제로 저장되었는지 확인
        verify_stmt = select(Job).where(Job.id == job_id)
        verified = session.exec(verify_stmt).first()
        if verified:
            print(f"[DEBUG] create_job - 데이터베이스 저장 확인됨: {verified.id}")
            print(f"  verified.employerId: {verified.employerId}")
            print(f"  verified.title: {verified.title}")
            print(f"  verified.status: {verified.status}")
        else:
            print(f"[ERROR] create_job - 데이터베이스 저장 실패! job_id: {job_id}")
    except Exception as e:
        print(f"[ERROR] create_job - 공고 저장 중 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        raise
    
    return JobResponse(
        id=job.id,
        employer_id=job.employerId,
        title=job.title,
        description=job.description,
        category=job.category,
        wage=job.wage,
        wage_type=getattr(job, 'wage_type', 'hourly') or 'hourly',
        work_days=job.workDays,
        work_hours=job.workHours,
        deadline=job.deadline,
        positions=job.positions,
        required_language=job.requiredLanguage,
        required_visa=request.required_visa,
        benefits=job.benefits,
        created_at=job.createdAt,
        employer=employer.dict(),
        shop_name=getattr(job, 'shop_name', None),
        shop_address=getattr(job, 'shop_address', None),
        shop_address_detail=getattr(job, 'shop_address_detail', None),
        shop_phone=getattr(job, 'shop_phone', None),
        store_id=getattr(job, 'store_id', None),
    )

