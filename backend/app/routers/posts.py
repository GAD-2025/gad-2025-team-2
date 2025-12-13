from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
import traceback

from app.db import get_session
from app.models import Post
from app.schemas import PostRead

router = APIRouter(prefix="/api/posts", tags=["posts"])

@router.get("", response_model=dict)
async def get_all_posts(session: Session = Depends(get_session)):
    """
    Retrieve all posts.
    Returns: { "posts": PostRead[] }
    """
    try:
        posts = session.exec(select(Post).order_by(Post.created_at.desc())).all()
        print(f"[DEBUG] Found {len(posts)} posts")
        
        result = []
        for post in posts:
            try:
                result.append(PostRead(
                    id=post.id,
                    user_id=post.user_id,
                    title=post.title,
                    body=post.body,
                    created_at=post.created_at
                ))
            except Exception as e:
                print(f"[ERROR] Failed to serialize post {post.id}: {e}")
                traceback.print_exc()
                continue
        
        return {"posts": result}
    except Exception as e:
        print(f"[ERROR] Failed to fetch posts: {e}")
        traceback.print_exc()
        # 테이블이 없을 수도 있으므로 빈 배열 반환
        return {"posts": []}

@router.get("/{post_id}", response_model=PostRead)
async def get_post_by_id(post_id: str, session: Session = Depends(get_session)):
    """
    Retrieve a single post by its ID.
    """
    try:
        post = session.get(Post, post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        return PostRead(
            id=post.id,
            user_id=post.user_id,
            title=post.title,
            body=post.body,
            created_at=post.created_at
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Failed to fetch post {post_id}: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to fetch post: {str(e)}")