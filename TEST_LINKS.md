# 테스트 링크 및 플로우 가이드

## 🌐 서버 주소

### 백엔드 API
- **API 서버**: http://localhost:8000
- **API 문서 (Swagger)**: http://localhost:8000/docs
- **ReDoc 문서**: http://localhost:8000/redoc

### 프론트엔드
- **프론트엔드 서버**: http://localhost:5173

---

## 📋 전체 플로우 테스트 가이드

### 1️⃣ 고용주 - 면접 제안 및 확정

1. **고용주 로그인**
   - http://localhost:5173/employer/login
   - 로그인 후 → http://localhost:5173/employer/home

2. **지원자 확인 및 면접 제안**
   - http://localhost:5173/employer/recruitment
   - 지원자 카드 클릭 → 지원자 상세 페이지
   - "면접 제안하기" 버튼 클릭
   - 면접 일정 입력 → "면접 제안 전송"

3. **면접 일정 수정 및 확정**
   - 지원자 상세 페이지에서 "면접 일정 조율하기" 버튼 클릭
   - 일정 수정 후 "수정 후 확정하기" 클릭
   - → 구직자에게 "면접 확정" 상태 표시

---

### 2️⃣ 고용주 - 합격 처리

1. **합격 처리**
   - 지원자 상세 페이지 (면접 결과 섹션)
   - "합격" 버튼 클릭
   - 근무 전 유의사항 입력:
     - 제출 서류
     - 근무 복장
     - 근무 시 유의사항
     - 첫 출근 날짜/시간
     - 조율 메시지 (선택)
   - "전송" 버튼 클릭
   - → 구직자에게 합격 안내 표시

---

### 3️⃣ 구직자 - 면접 제안 확인

1. **구직자 로그인**
   - http://localhost:5173/jobseeker/login
   - 로그인 후 → http://localhost:5173/jobseeker/home

2. **면접 제안 확인**
   - http://localhost:5173/jobseeker/my-applications
   - "면접 제안" 섹션에서 면접 제안 카드 클릭
   - 면접 일정 확인
   - "수락" / "거절" / "조율" 버튼 선택
   - 면접 확정 시 "면접 확정" 배지 표시

---

### 4️⃣ 구직자 - 합격 안내 확인

1. **합격 안내 확인**
   - http://localhost:5173/jobseeker/my-applications
   - "합격" 섹션에서 합격 안내 카드 클릭
   - 근무 전 유의사항, 첫 출근 일정 확인
   - 조율 메시지 확인 (있는 경우)

2. **액션 선택**
   - **조율**: 첫 출근 일정 조율 요청
   - **출근 확정**: 첫 출근 일정 확정
   - **출근 거부**: 합격 거부

---

### 5️⃣ 조율 → 채용 확정

1. **구직자: 조율 메시지 전송**
   - 합격 안내 상세 페이지
   - "조율" 버튼 클릭
   - 조율 메시지 입력 → 전송

2. **고용주: 조율 메시지 확인 및 수정**
   - 지원자 상세 페이지 (합격 섹션)
   - 조율 메시지 확인
   - "첫 출근 수정하기" 버튼 클릭
   - http://localhost:5173/employer/first-work-date-edit/{지원자ID}
   - 첫 출근 날짜/시간 수정
   - 조율 메시지 입력 (선택)
   - "수정 후 확정하기" 버튼 클릭
   - → 채용 확정 완료 페이지

3. **캘린더 UI 확인**
   - **고용주**: http://localhost:5173/employer/recruitment
     - 필터: "면접결과" → "채용 확정"
     - 날짜별 지원자 캘린더 확인
   - **구직자**: http://localhost:5173/jobseeker/my-applications
     - 필터: "합격"
     - 자신의 출근 날짜 캘린더 확인

---

## 🔍 API 엔드포인트 테스트

### 면접 제안
```
POST /applications/{application_id}/interview-proposal
Content-Type: application/json

{
  "selectedDates": ["2025-01-15", "2025-01-16"],
  "time": "14:00",
  "duration": 30,
  "message": "면접 안내 메시지",
  "allDatesSame": true,
  "isConfirmed": false
}
```

### 합격 안내
```
POST /applications/{application_id}/acceptance-guide
Content-Type: application/json

{
  "documents": ["신분증", "이력서"],
  "workAttire": ["운동화", "편한 복장"],
  "workNotes": ["9시 출근", "점심시간 12:00-13:00"],
  "firstWorkDate": "2025-01-20",
  "firstWorkTime": "09:00",
  "coordinationMessage": "첫 출근 안내"
}
```

### 첫 출근 날짜 수정
```
POST /applications/{application_id}/first-work-date
Content-Type: application/json

{
  "firstWorkDate": "2025-01-22",
  "firstWorkTime": "10:00",
  "coordinationMessage": "일정 변경 안내"
}
```

### 조율 메시지
```
POST /applications/{application_id}/coordination-message
Content-Type: application/json

{
  "message": "출근 날짜를 변경하고 싶습니다",
  "type": "date_modification_request"
}
```

### 출근 확정
```
POST /applications/{application_id}/confirm-work-date
Content-Type: application/json

{
  "confirmed": true
}
```

---

## 📊 데이터 확인

### 지원서 목록 조회
```
GET /applications?userId={user_id}
```

응답에 포함되는 필드:
- `interviewData`: 면접 제안 정보 (JSON)
- `acceptanceData`: 합격 안내 정보 (JSON)
- `coordinationMessages`: 조율 메시지 배열 (JSON)
- `firstWorkDateConfirmed`: 채용 확정된 첫 출근 날짜 (YYYY-MM-DD)

---

## ⚠️ 주의사항

1. **데이터베이스 마이그레이션**
   - `backend/migrations/add_application_fields.sql` 실행 필요
   - applications 테이블에 4개 필드 추가

2. **테스트 데이터**
   - 고용주와 구직자 계정이 필요합니다
   - 지원서(Application)가 생성되어 있어야 합니다

3. **상태 흐름**
   - `applied` → `reviewed` (면접 제안) → `accepted` (합격) → `hired` (채용 확정)

---

## 🐛 문제 해결

### 서버가 시작되지 않는 경우
1. 포트 충돌 확인: `netstat -ano | findstr :8000` (백엔드), `netstat -ano | findstr :5173` (프론트)
2. 의존성 설치 확인: `npm install` (프론트), `pip install -r requirements.txt` (백엔드)
3. 환경 변수 확인: `.env` 파일 확인

### API 오류가 발생하는 경우
1. 백엔드 로그 확인
2. 데이터베이스 연결 확인
3. CORS 설정 확인
