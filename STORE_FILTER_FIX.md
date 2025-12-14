# 가게별 필터링 기능 수정 완료

## ✅ 완료된 작업

### 1. 백엔드 수정
- ✅ `GET /jobs` API에 `user_id` 파라미터 추가
- ✅ 고용주의 모든 매장 공고를 조회하도록 수정
- ✅ `store_id` 필터와 함께 사용 가능

### 2. 프론트엔드 수정
- ✅ 공고 관리 페이지에서 `user_id`로 필터링하도록 수정
- ✅ 드롭다운 UI 개선 (한 줄 표시, whitespace-nowrap 추가)

## 🔍 문제 원인

### 문제 1: 가게별 필터링이 작동하지 않음
- **원인**: `jobsAPI.list()`가 모든 공고를 반환하고 있었음
- **해결**: 백엔드에 `user_id` 파라미터 추가, 프론트엔드에서 고용주 ID 전달

### 문제 2: UI에서 "전체"가 여러 줄로 표시됨
- **원인**: 긴 매장명이 줄바꿈됨
- **해결**: `whitespace-nowrap` 클래스 추가, `flex-shrink-0` 추가

## 📋 데이터베이스 필드

### 이미 구현된 필드 (추가 작업 불필요)

| 테이블 | 필드명 | 타입 | 설명 |
|--------|--------|------|------|
| `jobs` | `store_id` | VARCHAR(255) | 매장 ID (stores.id 참조) |
| `stores` | `id` | VARCHAR(255) | 매장 ID (PK) |
| `stores` | `user_id` | VARCHAR(255) | 고용주 ID (signup_users.id) |
| `stores` | `store_name` | VARCHAR | 매장명 |

**추가 데이터베이스 작업 불필요** - 모든 필드가 이미 존재합니다.

## 🔧 수정된 파일

### 백엔드
- `backend/app/routers/jobs.py` - `user_id` 필터 추가

### 프론트엔드
- `frontend/src/pages/employer/JobManagement.tsx` - `user_id` 전달 및 UI 수정
- `frontend/src/api/endpoints.ts` - `jobsAPI.list`에 `user_id` 파라미터 추가

## 🧪 테스트 방법

1. **고용주로 로그인**
2. **공고 관리 페이지 접속**
3. **가게별 드롭다운 테스트:**
   - "전체" 선택 → 모든 매장의 공고 표시
   - 특정 매장 선택 → 해당 매장의 공고만 표시
4. **UI 확인:**
   - "전체" 텍스트가 한 줄로 표시되는지 확인
   - 드롭다운이 다른 버튼들과 구분되는지 확인

## 📝 Posts API 정보

### GET /api/posts 엔드포인트

**구현 위치**: `backend/app/routers/posts.py`

**Python 코드**:
```python
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

### posts 테이블 CREATE 문

**파일**: `posts_table_create.sql`

```sql
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(255) PRIMARY KEY COMMENT '게시글 ID',
    user_id VARCHAR(255) NOT NULL COMMENT '작성자 ID (signup_users.id 또는 users.id)',
    title VARCHAR(500) NOT NULL COMMENT '제목',
    body TEXT NOT NULL COMMENT '본문 내용',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='게시글 테이블';
```

### React에서 fetch로 GET /api/posts 호출

**파일**: `frontend/src/pages/PostsPage.tsx`

**코드**:
```typescript
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
```

## 🚀 다음 단계

1. **백엔드 서버 재시작** (이미 완료)
2. **테스트:**
   - 공고 관리 페이지에서 가게별 필터링 테스트
   - UI 확인

모든 수정이 완료되었습니다! 🎉

