from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
import uuid
import json
from datetime import datetime
from typing import Optional

from app.db import get_session
from app.models import JobSeekerProfile
from app.schemas import JobSeekerProfileCreate, JobSeekerProfileResponse

router = APIRouter(prefix="/job-seeker", tags=["job-seeker"])


@router.post("/profile", response_model=JobSeekerProfileResponse, status_code=201)
async def create_job_seeker_profile(
    request: JobSeekerProfileCreate, session: Session = Depends(get_session)
):
    """Create or update job seeker profile"""
    # Check if profile already exists
    statement = select(JobSeekerProfile).where(
        JobSeekerProfile.user_id == request.user_id
    )
    existing = session.exec(statement).first()

    # Convert work_schedule to DB format
    if request.work_schedule:
        work_available_dates_json = json.dumps(request.work_schedule.available_dates)
        work_days_of_week_json = json.dumps(request.work_schedule.days_of_week)
        work_start_time = request.work_schedule.start_time
        work_end_time = request.work_schedule.end_time
    else:
        work_available_dates_json = json.dumps([])
        work_days_of_week_json = json.dumps([])
        work_start_time = None
        work_end_time = None

    # Extract experience data
    experience_sections = []
    experience_career = None
    experience_license = None
    experience_skills = None
    experience_introduction = None
    
    if request.experience:
        experience_sections = request.experience.sections
        experience_data = request.experience.data
        experience_career = experience_data.get('career')
        experience_license = experience_data.get('license')
        experience_skills = experience_data.get('skills')
        experience_introduction = experience_data.get('introduction')

    if existing:
        # Update existing profile
        existing.basic_info_file_name = request.basic_info_file_name
        existing.preferred_regions = json.dumps(request.preferred_regions)
        existing.preferred_jobs = json.dumps(request.preferred_jobs)
        existing.work_available_dates = work_available_dates_json
        existing.work_start_time = work_start_time
        existing.work_end_time = work_end_time
        existing.work_days_of_week = work_days_of_week_json
        existing.experience_sections = json.dumps(experience_sections)
        existing.experience_career = experience_career
        existing.experience_license = experience_license
        existing.experience_skills = experience_skills
        existing.experience_introduction = experience_introduction
        # Persist visa type if provided
        existing.visa_type = getattr(request, 'visa_type', None)
        existing.updated_at = datetime.utcnow()
        session.add(existing)
        session.commit()
        session.refresh(existing)

        return JobSeekerProfileResponse(
            id=existing.id,
            user_id=existing.user_id,
            basic_info_file_name=existing.basic_info_file_name,
            visa_type=existing.visa_type,
            preferred_regions=json.loads(existing.preferred_regions),
            preferred_jobs=json.loads(existing.preferred_jobs),
            work_available_dates=json.loads(existing.work_available_dates),
            work_start_time=existing.work_start_time,
            work_end_time=existing.work_end_time,
            work_days_of_week=json.loads(existing.work_days_of_week),
            experience_sections=json.loads(existing.experience_sections),
            experience_career=existing.experience_career,
            experience_license=existing.experience_license,
            experience_skills=existing.experience_skills,
            experience_introduction=existing.experience_introduction,
            created_at=existing.created_at.isoformat(),
            updated_at=existing.updated_at.isoformat(),
        )
    else:
        # Create new profile
        profile_id = f"profile-{uuid.uuid4().hex[:8]}"
        profile = JobSeekerProfile(
            id=profile_id,
            user_id=request.user_id,
            basic_info_file_name=request.basic_info_file_name,
            preferred_regions=json.dumps(request.preferred_regions),
            preferred_jobs=json.dumps(request.preferred_jobs),
            work_available_dates=work_available_dates_json,
            work_start_time=work_start_time,
            work_end_time=work_end_time,
            work_days_of_week=work_days_of_week_json,
            experience_sections=json.dumps(experience_sections),
            experience_career=experience_career,
            experience_license=experience_license,
            experience_skills=experience_skills,
            experience_introduction=experience_introduction,
            visa_type=getattr(request, 'visa_type', None),
        )
        session.add(profile)
        session.commit()
        session.refresh(profile)

        return JobSeekerProfileResponse(
            id=profile.id,
            user_id=profile.user_id,
            basic_info_file_name=profile.basic_info_file_name,
            visa_type=profile.visa_type,
            preferred_regions=json.loads(profile.preferred_regions),
            preferred_jobs=json.loads(profile.preferred_jobs),
            work_available_dates=json.loads(profile.work_available_dates),
            work_start_time=profile.work_start_time,
            work_end_time=profile.work_end_time,
            work_days_of_week=json.loads(profile.work_days_of_week),
            experience_sections=json.loads(profile.experience_sections),
            experience_career=profile.experience_career,
            experience_license=profile.experience_license,
            experience_skills=profile.experience_skills,
            experience_introduction=profile.experience_introduction,
            created_at=profile.created_at.isoformat(),
            updated_at=profile.updated_at.isoformat(),
        )


@router.get("/profiles", response_model=list)
async def list_job_seeker_profiles(
    limit: int = 50,
    offset: int = 0,
    visa_type: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """List all job seeker profiles"""
    from app.models import SignupUser
    
    statement = select(JobSeekerProfile).offset(offset).limit(limit)
    profiles = session.exec(statement).all()
    
    result = []
    for profile in profiles:
        # filter by visa_type if requested
        if visa_type:
            if not profile.visa_type or profile.visa_type != visa_type:
                continue
        # Get user info
        user_stmt = select(SignupUser).where(SignupUser.id == profile.user_id)
        user = session.exec(user_stmt).first()
        
        profile_dict = {
            "id": profile.id,
            "visa_type": profile.visa_type,
            "user_id": profile.user_id,
            "name": user.name if user else "Unknown",
            "nationality": user.nationality_code if user else "Unknown",
            "birthdate": user.birthdate if user else None,
            "preferred_regions": json.loads(profile.preferred_regions) if profile.preferred_regions else [],
            "preferred_jobs": json.loads(profile.preferred_jobs) if profile.preferred_jobs else [],
            "work_available_dates": json.loads(profile.work_available_dates) if profile.work_available_dates else [],
            "work_start_time": profile.work_start_time,
            "work_end_time": profile.work_end_time,
            "work_days_of_week": json.loads(profile.work_days_of_week) if profile.work_days_of_week else [],
            "experience_skills": profile.experience_skills,
            "experience_introduction": profile.experience_introduction,
            "created_at": profile.created_at.isoformat(),
        }
        result.append(profile_dict)
    
    return result


@router.get("/profile/{user_id}", response_model=JobSeekerProfileResponse)
async def get_job_seeker_profile(
    user_id: str, session: Session = Depends(get_session)
):
    """Get job seeker profile by user_id"""
    statement = select(JobSeekerProfile).where(JobSeekerProfile.user_id == user_id)
    profile = session.exec(statement).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return JobSeekerProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        basic_info_file_name=profile.basic_info_file_name,
        preferred_regions=json.loads(profile.preferred_regions) if profile.preferred_regions else [],
        preferred_jobs=json.loads(profile.preferred_jobs) if profile.preferred_jobs else [],
        work_available_dates=json.loads(profile.work_available_dates) if profile.work_available_dates else [],
        work_start_time=profile.work_start_time,
        work_end_time=profile.work_end_time,
        work_days_of_week=json.loads(profile.work_days_of_week) if profile.work_days_of_week else [],
        experience_sections=json.loads(profile.experience_sections) if profile.experience_sections else [],
        experience_career=profile.experience_career,
        experience_license=profile.experience_license,
        experience_skills=profile.experience_skills,
        experience_introduction=profile.experience_introduction,
        created_at=profile.created_at.isoformat(),
        updated_at=profile.updated_at.isoformat(),
    )

