# WorkFair 프로젝트 설정 가이드

## 🚀 빠른 시작

### 1. 데이터베이스 설정

```bash
# MySQL 접속
mysql -u root -p

# 데이터베이스 스키마 생성
source schema.sql

# 테스트 데이터 생성 (필수!)
source test_data.sql
```

### 2. 백엔드 실행

```bash
cd backend

# 가상환경 생성 (처음 한 번만)
python -m venv venv

# 가상환경 활성화
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 서버 실행
python -m uvicorn app.main:app --reload --port 8000
```

### 3. 프론트엔드 실행

```bash
cd frontend

# 의존성 설치 (처음 한 번만)
npm install

# 개발 서버 실행
npm run dev
```

## 🧪 테스트

공고 등록 플로우 테스트는 [TESTING_GUIDE.md](./TESTING_GUIDE.md)를 참조하세요.

## 📁 주요 파일 구조

```
gad-2025-team-2/
├── schema.sql              # 데이터베이스 스키마
├── test_data.sql          # 테스트용 초기 데이터
├── TESTING_GUIDE.md       # 테스트 가이드
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI 앱
│   │   ├── models.py      # 데이터베이스 모델
│   │   ├── routers/       # API 엔드포인트
│   │   │   ├── jobs.py    # 공고 관련 API
│   │   │   └── employer.py # 고용주 관련 API
│   │   └── schemas.py     # Pydantic 스키마
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── employer/  # 고용주 페이지
    │   │   │   ├── JobCreate.tsx      # 공고 등록
    │   │   │   └── JobManagement.tsx  # 공고 관리
    │   │   └── jobseeker/ # 구직자 페이지
    │   │       ├── Home.tsx           # 홈 (공고 표시)
    │   │       ├── JobList.tsx        # 공고 목록
    │   │       └── JobDetail.tsx      # 공고 상세
    │   └── api/
    │       └── endpoints.ts # API 호출
    └── package.json
```

## 🔑 주요 변경사항

### ✅ Mock 데이터 제거
- 모든 페이지에서 Mock 데이터 대신 실제 API 연동
- `mockJobs` import 제거
- 실시간 데이터베이스 데이터 사용

### ✅ 데이터베이스 스키마 업데이트
- `jobs` 테이블에 `status`, `views`, `applications`, `postedAt`, `location` 필드 추가
- 테스트용 고용주 및 구직자 데이터 추가

### ✅ API 연동 완료
- 공고 등록: `POST /jobs`
- 공고 조회: `GET /jobs`
- 공고 상세: `GET /jobs/{job_id}`
- 고용주 프로필: `GET /employer/profile/{user_id}`

## 🎯 플로우

```
고용주 로그인
    ↓
공고 등록 페이지 (/employer/job-create)
    ↓
폼 작성 및 등록 버튼 클릭
    ↓
POST /jobs API 호출
    ↓
MySQL DB에 저장
    ↓
구직자 페이지에서 실시간 조회
    ↓
- 홈 페이지: AI 맞춤 공고
- 공고 목록 페이지: 전체 공고
- 공고 상세 페이지: 상세 정보
```

## 🐛 트러블슈팅

### 데이터베이스 연결 오류
- MySQL 서버가 실행 중인지 확인
- `backend/.env` 파일의 데이터베이스 설정 확인

### 공고가 표시되지 않음
- `test_data.sql` 실행 확인
- 브라우저 Console에서 API 응답 확인 (F12)
- `curl http://localhost:8000/jobs`로 API 직접 확인

### 공고 등록 시 404 에러
- localStorage에 `signup_user_id` 확인:
  ```javascript
  localStorage.setItem('signup_user_id', 'employer-test-001')
  ```
- 페이지 새로고침

## 📞 지원

문제가 발생하면 [TESTING_GUIDE.md](./TESTING_GUIDE.md)의 "문제 해결" 섹션을 참조하세요.

