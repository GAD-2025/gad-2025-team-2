from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import Optional, List
import uuid
from datetime import datetime

from app.db import get_session
from app.models import Application
from app.schemas import ApplicationCreate, ApplicationUpdate

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("", response_model=dict, status_code=201)
async def create_application(
    request: ApplicationCreate,
    session: Session = Depends(get_session),
):
    """Create new application"""
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
    session: Session = Depends(get_session),
):
    """List applications with filters"""
    statement = select(Application)
    
    if seekerId:
        statement = statement.where(Application.seekerId == seekerId)
    if jobId:
        statement = statement.where(Application.jobId == jobId)
    
    applications = session.exec(statement).all()
    return [{
        "applicationId": app.applicationId,
        "seekerId": app.seekerId,
        "jobId": app.jobId,
        "status": app.status,
        "appliedAt": app.appliedAt,
        "updatedAt": app.updatedAt,
        "hiredAt": app.hiredAt,
    } for app in applications]


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

