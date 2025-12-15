from fastapi import APIRouter, Depends, HTTPException, Body
from sqlmodel import Session, select
from typing import List, Optional
import json

from app.db import get_session
from app.models import SignupUser, JobSeeker, JobSeekerProfile, Nationality
from app.schemas import ProfileData
from app.routers.auth import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/me", response_model=ProfileData)
async def get_my_profile(
    current_user: SignupUser = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get the combined profile for the currently authenticated job seeker.
    """
    if current_user.role != 'job_seeker':
        raise HTTPException(status_code=403, detail="Only job seekers have this profile type.")

    user_id = current_user.id
    
    # Fetch data from all three tables
    signup_user = session.get(SignupUser, user_id)
    jobseeker = session.exec(select(JobSeeker).where(JobSeeker.id == user_id)).first()
    job_seeker_profile = session.exec(select(JobSeekerProfile).where(JobSeekerProfile.user_id == user_id)).first()
    
    if not signup_user:
        # This should not happen if the user is authenticated
        raise HTTPException(status_code=404, detail="Authenticated user not found in signup_users.")

    # Handle cases where profiles might not exist yet
    if not jobseeker:
        jobseeker = JobSeeker(id=user_id, name=signup_user.name) # Create a placeholder if needed
    if not job_seeker_profile:
        job_seeker_profile = JobSeekerProfile(id=f"profile-{user_id}", user_id=user_id)

    # Combine data into the response schema
    skills = []
    if job_seeker_profile.experience_skills:
        try:
            # Assuming skills are stored as a JSON string array, e.g., '["skill1", "skill2"]'
            parsed_skills = json.loads(job_seeker_profile.experience_skills)
            if isinstance(parsed_skills, list):
                skills = parsed_skills
        except (json.JSONDecodeError, TypeError):
            # Fallback for simple comma-separated strings
            skills = [s.strip() for s in job_seeker_profile.experience_skills.split(',') if s.strip()]

    return ProfileData(
        name=signup_user.name,
        email=signup_user.email,
        phone=signup_user.phone,
        nationality_code=signup_user.nationality_code,
        birthdate=str(signup_user.birthdate) if signup_user.birthdate else None,
        visaType=job_seeker_profile.visa_type or jobseeker.visaType,
        languageLevel=jobseeker.languageLevel,
        location=jobseeker.location,
        skills=skills,
        bio=job_seeker_profile.experience_introduction
    )


@router.put("/me", response_model=ProfileData)
async def update_my_profile(
    profile_update: ProfileData,
    current_user: SignupUser = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update the combined profile for the currently authenticated job seeker.
    """
    if current_user.role != 'job_seeker':
        raise HTTPException(status_code=403, detail="Only job seekers can update this profile type.")

    user_id = current_user.id

    # Fetch existing records
    signup_user = session.get(SignupUser, user_id)
    jobseeker = session.get(JobSeeker, user_id)
    job_seeker_profile = session.exec(select(JobSeekerProfile).where(JobSeekerProfile.user_id == user_id)).first()

    if not signup_user:
        raise HTTPException(status_code=404, detail="Authenticated user not found.")
    
    # Create profiles if they don't exist
    if not jobseeker:
        jobseeker = JobSeeker(id=user_id, name=signup_user.name)
        session.add(jobseeker)
    if not job_seeker_profile:
        job_seeker_profile = JobSeekerProfile(id=f"profile-{user_id}", user_id=user_id)
        session.add(job_seeker_profile)

    # Update fields in each model
    
    # 1. signup_users table
    signup_user.name = profile_update.name
    signup_user.email = profile_update.email
    signup_user.phone = profile_update.phone
    # 국적 코드가 DB에 없으면 새로 추가 후 연결 (없는 값 때문에 FK 에러가 나던 문제 방지)
    if profile_update.nationality_code:
        nationality = session.get(Nationality, profile_update.nationality_code)
        if not nationality:
            nationality = Nationality(
                code=profile_update.nationality_code,
                name=profile_update.nationality_code,
                phone_code=""
            )
            session.add(nationality)
            session.commit()
        signup_user.nationality_code = nationality.code
    else:
        signup_user.nationality_code = None
    if profile_update.birthdate:
        signup_user.birthdate = profile_update.birthdate

    # 2. jobseekers table
    jobseeker.visaType = profile_update.visaType
    jobseeker.languageLevel = profile_update.languageLevel
    jobseeker.location = profile_update.location
    jobseeker.name = profile_update.name # Sync name

    # 3. job_seeker_profiles table
    job_seeker_profile.visa_type = profile_update.visaType # Sync visaType
    job_seeker_profile.experience_introduction = profile_update.bio
    # Store skills as a JSON string
    job_seeker_profile.experience_skills = json.dumps(profile_update.skills)

    session.commit()
    
    # Refresh data to get the latest state from the DB
    session.refresh(signup_user)
    session.refresh(jobseeker)
    session.refresh(job_seeker_profile)
    
    # Return the updated data in the same combined format
    return ProfileData(
        name=signup_user.name,
        email=signup_user.email,
        phone=signup_user.phone,
        nationality_code=signup_user.nationality_code,
        birthdate=str(signup_user.birthdate) if signup_user.birthdate else None,
        visaType=job_seeker_profile.visa_type,
        languageLevel=jobseeker.languageLevel,
        location=jobseeker.location,
        skills=profile_update.skills,
        bio=job_seeker_profile.experience_introduction
    )