# GET /api/posts 엔드포인트 정보

## ✅ 구현 완료

### 백엔드 (Python/FastAPI)

**파일**: `backend/app/routers/posts.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

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
    posts = session.exec(select(Post).order_by(Post.created_at.desc())).all()
    return {"posts": [PostRead(
        id=post.id,
        user_id=post.user_id,
        title=post.title,
        body=post.body,
        created_at=post.created_at
    ) for post in posts]}

@router.get("/{post_id}", response_model=PostRead)
async def get_post_by_id(post_id: str, session: Session = Depends(get_session)):
    """
    Retrieve a single post by its ID.
    """
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
```

### 엔드포인트 정보

- **URL**: `GET http://localhost:8000/api/posts`
- **응답 형식**: `{ "posts": PostRead[] }`
- **PostRead 스키마**:
  - `id`: string
  - `user_id`: string
  - `title`: string
  - `body`: string
  - `created_at`: datetime

## 📋 posts 테이블 CREATE 문

**파일**: `posts_table_final.sql`

```sql
USE team2_db;

CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## ✅ React에서 GET /api/posts 호출 및 표시

**파일**: `frontend/src/pages/PostsPage.tsx`

이미 구현되어 있습니다. 다음 기능을 포함합니다:

1. **fetch로 GET /api/posts 호출**
2. **로딩 상태 표시**
3. **에러 처리**
4. **게시글 목록 표시**
5. **날짜 포맷팅**

### 주요 코드

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const response = await fetch(`${API_BASE_URL}/api/posts`);

if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
}

const data = await response.json();
setPosts(data.posts || []);
```

### 라우트 설정

**파일**: `frontend/src/router.tsx`

```typescript
{
  path: '/posts',
  element: <PostsPage />,
}
```

### 접속 URL

- http://localhost:5173/posts

## 🧪 테스트 방법

1. **백엔드 서버 실행 확인**
   - http://localhost:8000/docs 접속
   - `/api/posts` 엔드포인트 확인

2. **프론트엔드에서 테스트**
   - http://localhost:5173/posts 접속
   - 게시글 목록이 표시되는지 확인

3. **API 직접 테스트**
   ```bash
   curl http://localhost:8000/api/posts
   ```

## 📝 참고

- 모든 구현이 완료되어 있습니다.
- 추가 작업이 필요하지 않습니다.
