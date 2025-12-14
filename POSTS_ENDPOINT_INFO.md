# GET /api/posts 엔드포인트 정보

## ✅ 이미 구현되어 있습니다!

### 1. 백엔드 엔드포인트
- **파일**: `backend/app/routers/posts.py`
- **경로**: `GET /api/posts`
- **응답 형식**: `{ "posts": PostRead[] }`

### 2. Posts 테이블 CREATE 문
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

### 3. React 컴포넌트
- **파일**: `frontend/src/pages/PostsPage.tsx`
- **기능**: `GET /api/posts` 호출 및 화면에 표시
- **라우트**: `/posts` (이미 설정되어 있음)

## 📋 테이블 필드 상세

| 필드명 | 타입 | 설명 |
|--------|------|------|
| `id` | VARCHAR(255) | 게시글 ID (Primary Key) |
| `user_id` | VARCHAR(255) | 작성자 ID (NOT NULL) |
| `title` | VARCHAR(500) | 제목 (NOT NULL) |
| `body` | TEXT | 본문 내용 (NOT NULL) |
| `created_at` | DATETIME | 생성 일시 (기본값: CURRENT_TIMESTAMP) |

## 🔧 백엔드 코드 (Python/FastAPI)

```python
# backend/app/routers/posts.py
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
```

## 🎨 프론트엔드 코드 (React/TypeScript)

```typescript
// frontend/src/pages/PostsPage.tsx
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';

interface Post {
  id: string;
  user_id: string;
  title: string;
  body: string;
  created_at: string;
}

export const PostsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const response = await fetch(`${API_BASE_URL}/api/posts`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (err) {
        console.error('Posts 로딩 오류:', err);
        setError(err instanceof Error ? err.message : '게시글을 불러오는데 실패했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // ... 나머지 렌더링 코드
};
```

## 🧪 테스트 방법

1. **MySQL에서 테이블 생성**:
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

2. **테스트 데이터 삽입** (선택사항):
   ```sql
   INSERT INTO posts (id, user_id, title, body, created_at) VALUES
   ('post-1', 'user-1', '첫 번째 게시글', '이것은 첫 번째 게시글입니다.', NOW()),
   ('post-2', 'user-2', '두 번째 게시글', '이것은 두 번째 게시글입니다.', NOW());
   ```

3. **프론트엔드에서 접속**:
   - `/posts` 경로로 접속
   - 게시글 목록이 표시되는지 확인

## ✅ 결론

**모든 기능이 이미 구현되어 있습니다!**
- 백엔드 엔드포인트: ✅
- 데이터베이스 테이블: ✅ (CREATE 문 제공)
- React 컴포넌트: ✅

**추가 작업이 필요하지 않습니다!** 🎉


