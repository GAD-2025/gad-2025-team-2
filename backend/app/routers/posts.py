from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, text
from typing import List
from pydantic import BaseModel
from datetime import datetime

from app.db import get_session

router = APIRouter(prefix="/api", tags=["posts"])


class PostResponse(BaseModel):
    id: int
    user_id: str
    title: str
    body: str
    created_at: str


class PostsListResponse(BaseModel):
    posts: List[PostResponse]


@router.get("/posts", response_model=PostsListResponse)
async def get_posts(session: Session = Depends(get_session)):
    """
    Get all posts
    Returns a list of all posts ordered by created_at descending
    """
    try:
        # Use raw SQL to query posts table (works with both SQLite and MySQL)
        result = session.exec(
            text("SELECT id, user_id, title, body, created_at FROM posts ORDER BY created_at DESC")
        )
        
        posts = []
        for row in result:
            # Handle both SQLite (returns tuple) and MySQL (returns Row)
            row_data = row if hasattr(row, '_mapping') else row
            if hasattr(row_data, '_mapping'):
                # SQLAlchemy Row object (MySQL)
                posts.append(PostResponse(
                    id=row_data.id,
                    user_id=row_data.user_id,
                    title=row_data.title,
                    body=row_data.body,
                    created_at=row_data.created_at.isoformat() if isinstance(row_data.created_at, datetime) else str(row_data.created_at)
                ))
            else:
                # Tuple (SQLite)
                posts.append(PostResponse(
                    id=row_data[0],
                    user_id=row_data[1],
                    title=row_data[2],
                    body=row_data[3],
                    created_at=row_data[4].isoformat() if isinstance(row_data[4], datetime) else str(row_data[4])
                ))
        
        return PostsListResponse(posts=posts)
    except Exception as e:
        # If table doesn't exist or other error, return empty list
        print(f"Error fetching posts: {str(e)}")
        import traceback
        traceback.print_exc()
        return PostsListResponse(posts=[])

