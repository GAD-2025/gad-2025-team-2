from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from app.db import get_session
from app.models import Post
from app.schemas import PostRead

router = APIRouter(prefix="/posts", tags=["posts"])

@router.get("/", response_model=List[PostRead])
async def get_all_posts(session: Session = Depends(get_session)):
    """
    Retrieve all posts.
    """
    posts = session.exec(select(Post)).all()
    return posts

@router.get("/{post_id}", response_model=PostRead)
async def get_post_by_id(post_id: str, session: Session = Depends(get_session)):
    """
    Retrieve a single post by its ID.
    """
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post