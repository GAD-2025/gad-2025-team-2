# 구직자 지원 문제 해결 가이드

## 🔍 문제 진단 단계

### 1단계: 브라우저 콘솔 확인

1. **구직자로 로그인** → 공고 상세 페이지 접속
2. **F12** 눌러서 개발자 도구 열기
3. **Console 탭** 선택
4. **"지원하기" 버튼 클릭**
5. 다음 로그들을 확인:
   - `[DEBUG] 지원하기 시작:` - 이 로그가 보이나요?
   - `[ERROR] 지원 실패:` - 어떤 에러가 나오나요?
   - 네트워크 탭에서 `/applications` POST 요청 확인

### 2단계: 네트워크 탭 확인

1. **F12** → **Network 탭** 선택
2. **"지원하기" 버튼 클릭**
3. `/applications` 요청 찾기
4. 클릭해서 확인:
   - **Status**: 200? 400? 500? 404?
   - **Request Payload**: `{ seekerId: "...", jobId: "..." }` 형태인지
   - **Response**: 어떤 응답이 오나요?

### 3단계: 백엔드 로그 확인

백엔드 서버가 실행 중인 터미널에서 다음 로그들이 보이나요?

```
[DEBUG] create_application - 시작:
  seekerId: ...
  jobId: ...
[DEBUG] ensure_jobseeker_exists - 시작: seeker_id=...
[DEBUG] create_application - 지원서 생성 완료:
```

**만약 로그가 안 보인다면:**
- API 요청이 백엔드에 도달하지 않은 것
- 프론트엔드에서 요청이 실패한 것

### 4단계: 데이터베이스 확인

MySQL Workbench에서 실행:

```sql
USE team2_db;

-- 최근 지원 내역 확인
SELECT 
    a.applicationId,
    a.seekerId,
    a.jobId,
    a.status,
    a.appliedAt
FROM applications a
ORDER BY a.appliedAt DESC
LIMIT 10;

-- 구직자 정보 확인
SELECT id, name FROM jobseekers ORDER BY id DESC LIMIT 10;

-- signup_users 확인
SELECT id, name, role FROM signup_users WHERE role = 'jobseeker' ORDER BY id DESC LIMIT 10;
```

## 🐛 가능한 문제들

### 문제 1: API 요청이 안 감
**증상**: 브라우저 콘솔에 `[DEBUG] 지원하기 시작:` 로그가 없음
**원인**: 버튼 클릭 이벤트가 제대로 연결되지 않음
**해결**: `JobDetail.tsx` 파일 확인

### 문제 2: 404 에러
**증상**: Network 탭에서 `/applications` 요청이 404
**원인**: 백엔드 서버가 실행되지 않았거나 URL이 잘못됨
**해결**: 
- 백엔드 서버가 `http://localhost:8000`에서 실행 중인지 확인
- `VITE_API_BASE_URL` 환경 변수 확인

### 문제 3: 500 에러
**증상**: Network 탭에서 `/applications` 요청이 500
**원인**: 백엔드에서 에러 발생
**해결**: 백엔드 로그에서 `[ERROR]` 메시지 확인

### 문제 4: CORS 에러
**증상**: 브라우저 콘솔에 CORS 관련 에러
**원인**: 백엔드 CORS 설정 문제
**해결**: `backend/app/main.py`의 CORS 설정 확인

### 문제 5: 데이터베이스 연결 실패
**증상**: 백엔드 로그에 데이터베이스 연결 에러
**원인**: MySQL 연결 정보가 잘못됨
**해결**: `backend/app/db.py`의 데이터베이스 연결 정보 확인

## 📋 체크리스트

다음 항목들을 확인하세요:

- [ ] 백엔드 서버가 실행 중인가요? (`http://localhost:8000/docs` 접속 가능한지)
- [ ] 프론트엔드가 실행 중인가요? (`http://localhost:5173` 접속 가능한지)
- [ ] 구직자로 로그인했나요? (`localStorage.getItem('signup_user_id')` 값이 있나요?)
- [ ] 공고 ID가 올바른가요? (공고 상세 페이지 URL에 `id` 파라미터가 있나요?)
- [ ] 브라우저 콘솔에 에러가 있나요?
- [ ] Network 탭에서 `/applications` POST 요청이 보이나요?
- [ ] 백엔드 로그에 `[DEBUG] create_application` 로그가 보이나요?

## 🔧 다음 단계

위 체크리스트를 확인한 후, 어떤 단계에서 문제가 발생하는지 알려주세요:
1. 브라우저 콘솔에 어떤 로그/에러가 보이나요?
2. Network 탭에서 `/applications` 요청의 Status는 무엇인가요?
3. 백엔드 로그에 어떤 메시지가 보이나요?

이 정보를 알려주시면 정확한 해결 방법을 제시하겠습니다!

