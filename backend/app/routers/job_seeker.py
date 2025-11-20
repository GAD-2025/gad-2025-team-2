from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
import uuid
import json
from datetime import datetime

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
    work_available_dates_json = json.dumps(request.work_schedule.available_dates)
    work_days_of_week_json = json.dumps(request.work_schedule.days_of_week)

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
        existing.work_start_time = request.work_schedule.start_time
        existing.work_end_time = request.work_schedule.end_time
        existing.work_days_of_week = work_days_of_week_json
        existing.experience_sections = json.dumps(experience_sections)
        existing.experience_career = experience_career
        existing.experience_license = experience_license
        existing.experience_skills = experience_skills
        existing.experience_introduction = experience_introduction
        existing.updated_at = datetime.utcnow()
        session.add(existing)
        session.commit()
        session.refresh(existing)

        return JobSeekerProfileResponse(
            id=existing.id,
            user_id=existing.user_id,
            basic_info_file_name=existing.basic_info_file_name,
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
            work_start_time=request.work_schedule.start_time,
            work_end_time=request.work_schedule.end_time,
            work_days_of_week=work_days_of_week_json,
            experience_sections=json.dumps(experience_sections),
            experience_career=experience_career,
            experience_license=experience_license,
            experience_skills=experience_skills,
            experience_introduction=experience_introduction,
        )
        session.add(profile)
        session.commit()
        session.refresh(profile)

        return JobSeekerProfileResponse(
            id=profile.id,
            user_id=profile.user_id,
            basic_info_file_name=profile.basic_info_file_name,
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
        preferred_regions=json.loads(profile.preferred_regions),
        preferred_jobs=json.loads(profile.preferred_jobs),
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

