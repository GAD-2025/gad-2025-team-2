from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.db import get_session
from app.models import Nationality
from app.schemas import NationalityResponse

router = APIRouter(prefix="/meta", tags=["meta"])


@router.get("/nationalities", response_model=list[NationalityResponse])
async def get_nationalities(session: Session = Depends(get_session)):
    """Get all nationalities"""
    statement = select(Nationality)
    nationalities = session.exec(statement).all()
    return [NationalityResponse(code=n.code, name=n.name) for n in nationalities]

