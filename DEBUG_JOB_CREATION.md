# 공고 등록 문제 디버깅 가이드

## 🔍 문제 상황
고용주가 공고를 등록했는데 데이터베이스에 저장되지 않음

## ✅ 확인 단계

### 1단계: 데이터베이스에 공고가 있는지 확인

MySQL Workbench에서 실행:

```sql
USE team2_db;

-- 전체 공고 개수 확인
SELECT COUNT(*) as 전체_공고수 FROM jobs;

-- 최근 공고 확인
SELECT 
    j.id,
    j.title,
    j.employerId,
    j.status,
    j.createdAt
FROM jobs j
ORDER BY j.createdAt DESC
LIMIT 20;
```

**결과:**
- 공고가 있으면 → 다음 단계로 진행
- 공고가 없으면 → 공고 생성 로직 문제

### 2단계: 공고 생성 시 백엔드 로그 확인

고용주로 로그인 → 공고 등록 → 백엔드 로그 확인:

다음 로그들이 보이나요?
```
[DEBUG] create_job - 받은 매장 정보:
  shop_name: ...
  shop_address: ...
[DEBUG] create_job - 공고 저장 시작:
  job_id: ...
  employerId: ...
  title: ...
[DEBUG] create_job - 데이터베이스 저장 확인됨: ...
```

**만약 로그가 안 보이면:**
- API 요청이 백엔드에 도달하지 않은 것
- 프론트엔드에서 요청이 실패한 것

### 3단계: 프론트엔드에서 공고 등록 확인

1. **F12** → **Console 탭** 확인
2. 공고 등록 버튼 클릭
3. 다음 로그 확인:
   - `공고 등록 성공:` 로그가 보이나요?
   - 에러 메시지가 있나요?

4. **Network 탭** 확인:
   - `/jobs` POST 요청이 보이나요?
   - Status가 `201 Created`인가요?
   - Response에 job 데이터가 있나요?

### 4단계: 고용주 연결 확인

```sql
USE team2_db;

-- 고용주 user_id로 공고 확인
SELECT 
    ep.user_id as 고용주_user_id,
    e.id as employer_id,
    j.id as 공고ID,
    j.title,
    j.status,
    j.createdAt
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
LEFT JOIN jobs j ON j.employerId = e.id
WHERE ep.user_id = '여기에_고용주_user_id_입력'
ORDER BY j.createdAt DESC;
```

## 🐛 가능한 문제들

### 문제 1: API 요청이 안 감
**증상**: Network 탭에 `/jobs` POST 요청이 없음
**원인**: 프론트엔드에서 요청이 실패하거나 전송되지 않음
**해결**: `JobCreate.tsx`의 공고 등록 로직 확인

### 문제 2: 500 에러
**증상**: Network 탭에서 `/jobs` 요청이 500
**원인**: 백엔드에서 에러 발생
**해결**: 백엔드 로그에서 `[ERROR]` 메시지 확인

### 문제 3: 데이터베이스 저장 실패
**증상**: 백엔드 로그에 `[ERROR] create_job - 데이터베이스 저장 실패!`
**원인**: `session.commit()` 실패 또는 트랜잭션 롤백
**해결**: 데이터베이스 연결 상태 확인

### 문제 4: employer_profiles와 employers 연결 안 됨
**증상**: 공고는 생성되지만 고용주와 연결 안 됨
**원인**: `employers` 테이블에 레코드가 없음
**해결**: `CREATE_MISSING_EMPLOYERS.sql` 실행

## 📋 체크리스트

- [ ] 백엔드 서버가 실행 중인가요?
- [ ] 프론트엔드가 실행 중인가요?
- [ ] 고용주로 로그인했나요?
- [ ] 공고 등록 시 브라우저 콘솔에 에러가 있나요?
- [ ] Network 탭에서 `/jobs` POST 요청이 보이나요?
- [ ] 백엔드 로그에 `[DEBUG] create_job` 로그가 보이나요?
- [ ] MySQL에서 공고가 실제로 저장되었나요?

## 🔧 다음 단계

1. **MySQL에서 공고 개수 확인** (위 SQL 실행)
2. **공고 등록 시 백엔드 로그 확인**
3. **Network 탭에서 `/jobs` POST 요청 확인**
4. **결과를 알려주시면 정확한 해결 방법 제시하겠습니다!**


