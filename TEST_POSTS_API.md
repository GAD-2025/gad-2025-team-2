# Posts API 테스트 방법

## 방법 1: 브라우저에서 직접 접속 (가장 간단)

브라우저 주소창에 입력:
```
https://route.nois.club:3002/api/posts
```

**예상 결과:**
- ✅ **성공**: JSON 데이터가 표시됨
  ```json
  {
    "posts": [
      {
        "id": 1,
        "user_id": "employer-test-001",
        "title": "첫 번째 게시글",
        "body": "이것은 첫 번째 게시글의 내용입니다.",
        "created_at": "2025-01-XX..."
      }
    ]
  }
  ```

- ❌ **실패**: "Not Found" 또는 404 에러
  → Posts API가 배포 서버에 반영되지 않음

---

## 방법 2: PowerShell에서 curl 사용

```powershell
curl https://route.nois.club:3002/api/posts
```

또는 더 자세한 정보:
```powershell
Invoke-WebRequest -Uri "https://route.nois.club:3002/api/posts" -Method GET
```

---

## 방법 3: FastAPI 문서에서 확인

1. 브라우저에서 접속:
   ```
   https://route.nois.club:3002/docs
   ```

2. `/api/posts` 엔드포인트가 있는지 확인
3. 있으면 "Try it out" 버튼 클릭하여 테스트

---

## 방법 4: 프론트엔드에서 테스트

Posts 페이지를 라우터에 추가하고 접속:
```typescript
// frontend/src/router.tsx에 추가
import { PostsPage } from './pages/PostsPage';

// 라우트 추가
{
  path: '/posts',
  element: <PostsPage />,
}
```

그 다음 브라우저에서:
```
http://localhost:5173/posts
```

---

## 현재 상태 확인

### 테스트 결과
- ❌ **API 응답**: `{"detail":"Not Found"}`
- **의미**: Posts API가 배포 서버에 아직 반영되지 않음

### 해결 방법
1. **GitHub에 push** (자동 배포가 설정되어 있다면)
   ```bash
   git add backend/app/routers/posts.py
   git add backend/app/main.py
   git commit -m "Posts API 추가"
   git push origin main
   ```

2. **또는** 배포 서버 관리자에게 백엔드 코드 업데이트 요청

---

## 확인 체크리스트

- [x] Posts 테이블 생성 완료 (MySQL Workbench에서 확인됨)
- [ ] Posts API 배포 서버 반영 (아직 안 됨)
- [ ] 프론트엔드 Posts 페이지 (선택사항)

