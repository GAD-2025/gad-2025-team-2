from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
import uuid
from datetime import datetime

from app.db import get_session
from app.models import EmployerProfile, SignupUser
from app.schemas import EmployerProfileResponse, EmployerProfileCreate

router = APIRouter(prefix="/employer", tags=["employer"])


@router.get("/profile/{user_id}", response_model=EmployerProfileResponse)
async def get_employer_profile(user_id: str, session: Session = Depends(get_session)):
    """Get employer profile by user_id"""
    statement = select(EmployerProfile).where(EmployerProfile.user_id == user_id)
    profile = session.exec(statement).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="고용주 프로필을 찾을 수 없습니다.")
    
    return EmployerProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        business_type=profile.business_type,
        company_name=profile.company_name,
        address=profile.address,
        address_detail=profile.address_detail,
        created_at=profile.created_at.isoformat(),
        updated_at=profile.updated_at.isoformat(),
    )


@router.post("/profile", response_model=EmployerProfileResponse, status_code=201)
async def create_or_update_employer_profile(
    payload: EmployerProfileCreate, session: Session = Depends(get_session)
):
    """Create or update employer profile for a signup user"""
    user = session.exec(select(SignupUser).where(SignupUser.id == payload.user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="해당 사용자(고용주)를 찾을 수 없습니다.")
    if user.role != "employer":
        raise HTTPException(status_code=400, detail="고용주가 아닌 사용자입니다.")

    existing = session.exec(select(EmployerProfile).where(EmployerProfile.user_id == payload.user_id)).first()

    if existing:
        existing.business_type = payload.business_type
        existing.company_name = payload.company_name
        existing.address = payload.address
        existing.address_detail = payload.address_detail
        existing.updated_at = datetime.utcnow()
        session.add(existing)
        session.commit()
        session.refresh(existing)
        profile = existing
    else:
        profile = EmployerProfile(
            id=f"profile-{uuid.uuid4().hex[:8]}",
            user_id=payload.user_id,
            business_type=payload.business_type,
            company_name=payload.company_name,
            address=payload.address,
            address_detail=payload.address_detail,
        )
        session.add(profile)
        session.commit()
        session.refresh(profile)

    return EmployerProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        business_type=profile.business_type,
        company_name=profile.company_name,
        address=profile.address,
        address_detail=profile.address_detail,
        created_at=profile.created_at.isoformat(),
        updated_at=profile.updated_at.isoformat(),
    )
