# 구직자 지원 생성 문제 디버깅 가이드

## 🔍 문제 상황
구직자가 공고에 지원하기를 눌렀는데 `applications` 테이블에 레코드가 생성되지 않음

## ✅ 백엔드 개선 사항

### 1. 에러 핸들링 강화
- `create_application` 함수에 전체 try-except 추가
- 각 단계별 상세 로깅 추가
- 에러 발생 시 명확한 에러 메시지 반환

### 2. 디버그 로깅 추가
- 지원 시작 시점 로깅
- jobseeker 확인/생성 과정 로깅
- 공고 확인 로깅
- 지원서 생성 완료 로깅

## 🧪 테스트 방법

### 1. 구직자로 로그인
- 구직자 계정으로 로그인
- `localStorage.getItem('signup_user_id')` 값 확인

### 2. 공고에 지원하기
- 공고 상세 페이지에서 "지원하기" 버튼 클릭
- 브라우저 콘솔 확인:
  - `[DEBUG] 지원하기 시작:` 로그 확인
  - `[DEBUG] 지원 성공:` 또는 `[ERROR] 지원 실패:` 로그 확인

### 3. 백엔드 로그 확인
백엔드 터미널에서 다음 로그들을 확인:
```
[DEBUG] create_application - 시작:
[DEBUG] ensure_jobseeker_exists - 시작:
[DEBUG] ensure_jobseeker_exists - jobseeker 확인/생성 완료
[DEBUG] create_application - 공고 확인 완료:
[DEBUG] create_application - 지원서 생성 완료:
```

### 4. MySQL에서 확인
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
```

## 🔧 문제 진단 체크리스트

### 체크 1: 구직자 정보 확인
```sql
USE team2_db;

-- signup_users에 구직자가 있는지 확인
SELECT id, name, role FROM signup_users WHERE role = 'jobseeker' ORDER BY id DESC LIMIT 10;

-- jobseekers 테이블에 레코드가 있는지 확인
SELECT id, name FROM jobseekers ORDER BY id DESC LIMIT 10;

-- job_seeker_profiles에 온보딩 정보가 있는지 확인
SELECT user_id, visa_type FROM job_seeker_profiles ORDER BY user_id DESC LIMIT 10;
```

### 체크 2: 공고 확인
```sql
USE team2_db;

-- 공고가 있는지 확인
SELECT id, title, employerId FROM jobs ORDER BY createdAt DESC LIMIT 10;
```

### 체크 3: 지원 내역 확인
```sql
USE team2_db;

-- 지원 내역이 생성되었는지 확인
SELECT 
    a.applicationId,
    a.seekerId,
    a.jobId,
    a.status,
    a.appliedAt,
    j.title as 공고제목
FROM applications a
LEFT JOIN jobs j ON a.jobId = j.id
ORDER BY a.appliedAt DESC
LIMIT 10;
```

## 🐛 가능한 문제 원인

### 1. signup_user가 없는 경우
- **증상**: `ensure_jobseeker_exists`에서 에러 발생
- **해결**: 구직자 회원가입이 제대로 완료되었는지 확인

### 2. 공고가 없는 경우
- **증상**: `Job not found` 에러
- **해결**: 공고 ID가 올바른지 확인

### 3. 중복 지원인 경우
- **증상**: `Already applied to this job` 에러 (409)
- **해결**: 정상 동작 (이미 지원한 공고)

### 4. 데이터베이스 연결 문제
- **증상**: `session.commit()` 실패
- **해결**: 데이터베이스 연결 상태 확인

## 📝 다음 단계

1. **백엔드 서버 재시작** 후 테스트
2. **브라우저 콘솔**에서 에러 메시지 확인
3. **백엔드 로그**에서 상세 에러 확인
4. **MySQL**에서 실제 데이터 확인

백엔드 로그를 확인하여 정확한 문제 지점을 파악하세요! 🔍

