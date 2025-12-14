# 공고가 데이터베이스에는 있지만 프론트엔드에 안 보이는 문제

## 🔍 확인된 사실

MySQL Workbench에서 확인:
- `jobs` 테이블에 **2개의 공고**가 있음:
  - `job-32f47b15`: "도자기 설명하실분 구해요"
  - `job-a816ea17`: "친절한 홀 서버 구해요!"
- 둘 다 `employerId: emp-24cc67db`, `status: active`

**문제**: 프론트엔드에서 공고가 안 보임

## 🔍 문제 진단

### 1단계: 백엔드 API 확인

백엔드 서버가 실행 중인 상태에서:

```bash
# 브라우저에서 직접 접속
http://localhost:8000/jobs
```

또는

```bash
# curl로 확인
curl http://localhost:8000/jobs
```

**결과:**
- 공고 목록이 JSON으로 반환되면 → 백엔드 API는 정상
- 에러가 나오면 → 백엔드 API 문제

### 2단계: 프론트엔드에서 API 호출 확인

1. **F12** → **Network 탭** 선택
2. **공고관리 페이지 접속**
3. `/jobs` GET 요청 찾기
4. 클릭해서 확인:
   - **Status**: 200? 500? 404?
   - **Response**: 공고 데이터가 있나요?

### 3단계: 고용주 연결 확인

```sql
USE team2_db;

-- employerId로 고용주 정보 확인
SELECT 
    e.id as employer_id,
    e.businessNo as 사업자번호,
    ep.user_id as 고용주_user_id,
    COUNT(j.id) as 공고수
FROM employers e
LEFT JOIN employer_profiles ep ON ep.id = e.businessNo
LEFT JOIN jobs j ON j.employerId = e.id
WHERE e.id = 'emp-24cc67db'
GROUP BY e.id, e.businessNo, ep.user_id;
```

### 4단계: 프론트엔드 필터 확인

공고관리 페이지에서:
- 필터가 "전체"로 설정되어 있나요?
- 특정 상태 필터가 적용되어 있나요?
- 가게 선택 드롭다운이 올바르게 설정되어 있나요?

## 🐛 가능한 문제들

### 문제 1: 백엔드 API가 공고를 반환하지 않음
**증상**: `/jobs` GET 요청이 빈 배열 반환
**원인**: `user_id` 필터가 잘못 적용됨
**해결**: 백엔드 `list_jobs` 함수 확인

### 문제 2: 프론트엔드에서 필터링 문제
**증상**: API는 공고를 반환하지만 화면에 안 보임
**원인**: 프론트엔드 필터 로직 문제
**해결**: `JobManagement.tsx` 필터 로직 확인

### 문제 3: 고용주 연결 문제
**증상**: 공고는 있지만 특정 고용주와 연결 안 됨
**원인**: `employer_profiles`와 `employers` 연결 문제
**해결**: `CREATE_MISSING_EMPLOYERS.sql` 실행

## 📋 체크리스트

- [ ] 백엔드 서버가 실행 중인가요?
- [ ] `http://localhost:8000/jobs` 접속 시 공고 목록이 보이나요?
- [ ] Network 탭에서 `/jobs` GET 요청이 보이나요?
- [ ] `/jobs` GET 요청의 Response에 공고 데이터가 있나요?
- [ ] 프론트엔드 콘솔에 에러가 있나요?
- [ ] 공고관리 페이지의 필터가 올바르게 설정되어 있나요?

## 🔧 다음 단계

1. **백엔드 API 직접 확인** (`http://localhost:8000/jobs`)
2. **Network 탭에서 `/jobs` GET 요청 확인**
3. **프론트엔드 콘솔 로그 확인**

결과를 알려주시면 정확한 해결 방법을 제시하겠습니다!


