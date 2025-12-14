from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.db import get_session
from app.models import LearningProgress
from app.schemas import LevelTestSubmit

router = APIRouter(tags=["learning"])


def map_topik_to_lv(label: str) -> str:
    """Map TOPIK-style labels to frontend 'Lv.x' labels.

    Examples:
      'TOPIK 1급' -> 'Lv.1 기초'
      'TOPIK 2급' -> 'Lv.2 초급'
      'TOPIK 3급' -> 'Lv.3 중급'
      anything else -> 'Lv.4 상급'
    """
    if not label:
        return "Lv.1 기초"
    l = label.upper()
    if "TOPIK 1" in l or "1급" in l:
        return "Lv.1 기초"
    if "TOPIK 2" in l or "2급" in l:
        return "Lv.2 초급"
    if "TOPIK 3" in l or "3급" in l:
        return "Lv.3 중급"
    return "Lv.4 상급"


@router.get("/learning/summary", response_model=dict)
async def get_learning_summary(
    seekerId: str = Query(...),
    session: Session = Depends(get_session),
):
    """Get learning progress summary for a jobseeker"""
    statement = select(LearningProgress).where(LearningProgress.seekerId == seekerId)
    progress = session.exec(statement).first()
    
    if not progress:
        # Return default
        return {
            "seekerId": seekerId,
            # Use frontend-consistent labels (Lv.1 기초, Lv.2 초급, ...)
            "currentLevel": "Lv.1 기초",
            "completedLessons": 3,
            "totalLessons": 6,
            "progressPercent": 65
        }
    
    return progress.dict()


@router.post("/leveltest")
async def submit_level_test(
    request: LevelTestSubmit,
    session: Session = Depends(get_session),
):
    """Submit level test answers"""
    # Process test and determine level
    # This is a placeholder implementation
    
    statement = select(LearningProgress).where(LearningProgress.seekerId == request.seekerId)
    progress = session.exec(statement).first()
    
    if progress:
        # In real implementation, determine TOPIK result from submitted answers.
        # Placeholder assigns a TOPIK result then maps it to frontend label.
        raw_result = "TOPIK 2급"
        mapped = map_topik_to_lv(raw_result)
        progress.currentLevel = mapped
        session.add(progress)
        session.commit()

        return {"success": True, "level": mapped}

    # If no existing record, still return a mapped placeholder
    raw_result = "TOPIK 2급"
    return {"success": True, "level": map_topik_to_lv(raw_result)}

