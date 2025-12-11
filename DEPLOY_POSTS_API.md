# Posts API 배포 가이드

## 현재 상태

- ❌ **Posts API**: 로컬에만 있음 (GitHub에 없음)
- ❌ **배포 서버**: Posts API 없음
- ✅ **데이터베이스**: Posts 테이블 생성 완료

## 배포 방법

### 1단계: 변경사항 확인

```bash
git status
```

확인해야 할 파일:
- `backend/app/routers/posts.py` (새 파일)
- `backend/app/main.py` (수정됨 - posts router 추가)

### 2단계: Git에 추가

```bash
git add backend/app/routers/posts.py
git add backend/app/main.py
```

### 3단계: 커밋

```bash
git commit -m "feat: Posts API 추가 (GET /api/posts)"
```

### 4단계: GitHub에 push

```bash
git push origin main
```

### 5단계: 자동 배포 확인

- 자동 배포가 설정되어 있다면 자동으로 반영됨
- 몇 분 후 배포 서버에서 확인:
  ```
  https://route.nois.club:3002/api/posts
  ```

## 확인 방법

### 배포 후 테스트

1. **브라우저에서**:
   ```
   https://route.nois.club:3002/api/posts
   ```

2. **FastAPI 문서에서**:
   ```
   https://route.nois.club:3002/docs
   ```
   - `/api/posts` 엔드포인트가 보이는지 확인

3. **성공 응답 예시**:
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

## 문제 해결

### 자동 배포가 안 되는 경우

배포 서버 관리자에게 요청:
- Posts API 코드 배포 요청
- `backend/app/routers/posts.py` 파일 제공
- `backend/app/main.py`의 변경사항 제공

