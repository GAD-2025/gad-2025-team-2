from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
import uuid

from app.db import get_session
from app.models import EmployerProfile, SignupUser
from app.schemas import EmployerProfileResponse

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

