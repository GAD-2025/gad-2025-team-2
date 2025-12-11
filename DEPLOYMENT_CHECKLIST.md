# 배포 체크리스트

## ✅ Posts 기능 (새로 추가)

### 1. MySQL Workbench에서 Posts 테이블 생성
```sql
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테스트 데이터 삽입 (선택사항)
INSERT INTO posts (user_id, title, body) VALUES
('employer-test-001', '첫 번째 게시글', '이것은 첫 번째 게시글의 내용입니다.'),
('employer-test-001', '두 번째 게시글', '이것은 두 번째 게시글의 내용입니다.'),
('employer-test-002', '세 번째 게시글', '이것은 세 번째 게시글의 내용입니다.');
```

**이것만 하면 Posts API는 작동합니다!** ✅

---

## ✅ 기본 매장 기능 (이미 구현됨)

### 확인 사항
- **Store 테이블**: 이미 존재해야 함 (온보딩 시 자동 생성)
- **기본 매장 자동 생성**: `backend/app/routers/auth.py`의 `signup_employer` 함수에 이미 구현됨
- **마이페이지 UI**: 프론트엔드 코드 수정 완료
- **공고 등록 페이지**: 프론트엔드 코드 수정 완료

### 작동 확인 방법
1. 고용주 온보딩 완료 시 기본 매장이 자동 생성되는지 확인
2. 마이페이지에서 기본 매장이 표시되는지 확인
3. 공고 등록 페이지에서 매장 목록이 표시되는지 확인

---

## ⚠️ 배포 서버에 반영해야 할 사항

### 백엔드 변경사항
1. **새로운 파일**: `backend/app/routers/posts.py` (Posts API)
2. **수정된 파일**: `backend/app/main.py` (posts router 추가)

### 프론트엔드 변경사항
1. **수정된 파일**: 
   - `frontend/src/pages/mypage/MyPage.tsx` (기본 매장 UI)
   - `frontend/src/pages/employer/JobCreate.tsx` (매장 선택 UI, 매장 추가 버튼 제거)
2. **새로운 파일**: 
   - `frontend/src/pages/PostsPage.tsx` (Posts 페이지 - 선택사항)

### 배포 방법
1. **GitHub에 push** (자동 배포가 설정되어 있다면 자동 반영)
2. **또는** 배포 서버에 직접 접속하여 코드 업데이트

---

## 📋 요약

### Posts 기능만 사용하려면
- ✅ MySQL Workbench에 Posts 테이블 생성만 하면 됨

### 기본 매장 기능 사용하려면
- ✅ 이미 구현되어 있음 (추가 작업 불필요)
- ⚠️ 배포 서버에 프론트엔드 코드 변경사항 반영 필요

### 모든 기능 사용하려면
1. ✅ MySQL Workbench에 Posts 테이블 생성
2. ⚠️ 배포 서버에 백엔드 코드 변경사항 반영 (Posts API)
3. ⚠️ 배포 서버에 프론트엔드 코드 변경사항 반영 (UI 수정)

---

## 🔍 확인 방법

### Posts API 테스트
```bash
curl https://route.nois.club:3002/api/posts
```

### 기본 매장 기능 테스트
1. 고용주 회원가입 → 온보딩 완료
2. 마이페이지 접속 → 기본 매장 표시 확인
3. 공고 등록 페이지 접속 → 매장 목록 표시 확인

