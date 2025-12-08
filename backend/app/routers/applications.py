from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import Optional, List
import uuid
from datetime import datetime
import json

from app.db import get_session
from app.models import Application, Job, JobSeeker, Employer, SignupUser, JobSeekerProfile
from app.schemas import ApplicationCreate, ApplicationUpdate

router = APIRouter(prefix="/applications", tags=["applications"])


def ensure_jobseeker_exists(session: Session, seeker_id: str):
    """Ensure a JobSeeker row exists for the signup user so FK constraint passes."""
    js = session.get(JobSeeker, seeker_id)
    if js:
        return js

    signup_user = session.get(SignupUser, seeker_id)
    profile = session.exec(
        select(JobSeekerProfile).where(JobSeekerProfile.user_id == seeker_id)
    ).first()

    # Fallback defaults if profile data 부족
    name = signup_user.name if signup_user else "Unknown"
    nationality = signup_user.nationality_code if signup_user else "Unknown"
    phone = signup_user.phone if signup_user else ""
    language_level = "Lv.2 초급"
    visa_type = profile.visa_type if profile and profile.visa_type else "F-4"
    availability = "full-time"
    preferences = json.dumps({})
    experience = json.dumps([])

    js = JobSeeker(
        id=seeker_id,
        name=name,
        nationality=nationality,
        phone=phone,
        languageLevel=language_level,
        visaType=visa_type,
        availability=availability,
        preferences=preferences,
        experience=experience,
    )
    session.add(js)
    session.commit()
    session.refresh(js)
    return js


@router.post("", response_model=dict, status_code=201)
async def create_application(
    request: ApplicationCreate,
    session: Session = Depends(get_session),
):
    """Create new application"""
    # Ensure jobseeker exists for FK
    ensure_jobseeker_exists(session, request.seekerId)

    # Check for duplicate
    statement = select(Application).where(
        Application.seekerId == request.seekerId,
        Application.jobId == request.jobId
    )
    existing = session.exec(statement).first()
    
    if existing:
        raise HTTPException(status_code=409, detail="Already applied to this job")
    
    application = Application(
        applicationId=f"app-{uuid.uuid4().hex[:12]}",
        seekerId=request.seekerId,
        jobId=request.jobId,
        status="applied",
    )
    
    session.add(application)
    session.commit()
    session.refresh(application)
    
    return {
        "applicationId": application.applicationId,
        "seekerId": application.seekerId,
        "jobId": application.jobId,
        "status": application.status,
        "appliedAt": application.appliedAt,
        "updatedAt": application.updatedAt,
        "hiredAt": application.hiredAt,
    }


@router.get("", response_model=List[dict])
async def list_applications(
    seekerId: Optional[str] = None,
    jobId: Optional[str] = None,
    employerId: Optional[str] = None,
    userId: Optional[str] = None,  # For employer: signup_user_id
    session: Session = Depends(get_session),
):
    """List applications with filters and JOINed data"""
    # If userId is provided for employer, find employerId
    if userId and not employerId and not seekerId:
        from app.models import EmployerProfile, Employer, Job
        # Get employer profile
        profile_stmt = select(EmployerProfile).where(EmployerProfile.user_id == userId)
        profile = session.exec(profile_stmt).first()
        if profile:
            # Find employer by businessNo matching profile.id
            employer_stmt = select(Employer).where(Employer.businessNo == profile.id)
            employer = session.exec(employer_stmt).first()
            if employer:
                employerId = employer.id
    
    # Base query
    statement = select(Application)
    
    if seekerId:
        statement = statement.where(Application.seekerId == seekerId)
    if jobId:
        statement = statement.where(Application.jobId == jobId)
    
    applications = session.exec(statement).all()
    results = []
    
    for app in applications:
        app_dict = app.dict()
        
        # If filtering by seekerId, include Job information
        if seekerId:
            job = session.exec(select(Job).where(Job.id == app.jobId)).first()
            if job:
                job_dict = job.dict()
                # Get employer info
                employer = session.exec(select(Employer).where(Employer.id == job.employerId)).first()
                employer_dict = employer.dict() if employer else {}
                
                app_dict['job'] = {
                    'id': job_dict['id'],
                    'title': job_dict['title'],
                    'shopName': job_dict.get('shop_name') or employer_dict.get('shopName', ''),
                    'wage': job_dict['wage'],
                    'location': job_dict.get('location') or job_dict.get('shop_address', ''),
                    'category': job_dict['category'],
                    'workDays': job_dict['workDays'],
                    'workHours': job_dict['workHours'],
                    'employerId': job_dict['employerId'],
                }
        
        # If filtering by jobId or employerId, include JobSeeker information
        if jobId or employerId:
            seeker = session.exec(select(JobSeeker).where(JobSeeker.id == app.seekerId)).first()
            if seeker:
                seeker_dict = seeker.dict()
                # Parse JSON fields
                experience = []
                if seeker_dict.get('experience'):
                    try:
                        experience = json.loads(seeker_dict['experience']) if isinstance(seeker_dict['experience'], str) else seeker_dict['experience']
                    except:
                        experience = []
                
                preferences = {}
                if seeker_dict.get('preferences'):
                    try:
                        preferences = json.loads(seeker_dict['preferences']) if isinstance(seeker_dict['preferences'], str) else seeker_dict['preferences']
                    except:
                        preferences = {}
                
                app_dict['jobseeker'] = {
                    'id': seeker_dict['id'],
                    'name': seeker_dict['name'],
                    'nationality': seeker_dict['nationality'],
                    'phone': seeker_dict['phone'],
                    'languageLevel': seeker_dict['languageLevel'],
                    'visaType': seeker_dict['visaType'],
                    'experience': experience,
                    'preferences': preferences,
                }
        
        # If filtering by employerId (get all applications for employer's jobs)
        if employerId:
            job = session.exec(select(Job).where(Job.id == app.jobId).where(Job.employerId == employerId)).first()
            if not job:
                continue  # Skip if job doesn't belong to this employer
            app_dict['job'] = {
                'id': job.id,
                'title': job.title,
                'category': job.category,
            }
        
        results.append(app_dict)
    
    return results


@router.patch("/{application_id}", response_model=dict)
async def update_application(
    application_id: str,
    request: ApplicationUpdate,
    session: Session = Depends(get_session),
):
    """Update application status"""
    statement = select(Application).where(Application.applicationId == application_id)
    application = session.exec(statement).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    application.status = request.status
    application.updatedAt = datetime.utcnow().isoformat()
    
    if request.status == "hired":
        application.hiredAt = datetime.utcnow().isoformat()
    
    session.add(application)
    session.commit()
    session.refresh(application)
    
    return {
        "applicationId": application.applicationId,
        "seekerId": application.seekerId,
        "jobId": application.jobId,
        "status": application.status,
        "appliedAt": application.appliedAt,
        "updatedAt": application.updatedAt,
        "hiredAt": application.hiredAt,
    }

