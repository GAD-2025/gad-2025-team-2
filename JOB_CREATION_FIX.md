# 공고 등록 → 데이터베이스 저장 → 구직자/고용주 표시 문제 해결

## 🔧 수정 사항

### 1. 공고 생성 시 데이터베이스 저장 검증 강화
- 저장 전/후 상세 로깅 추가
- commit 후 실제 저장 여부 확인
- status가 'active'인지 확인 (구직자에게 보이는지)
- 에러 발생 시 rollback 처리

### 2. 공고 조회 로직 개선
- 구직자용: `status = 'active'`인 공고만 조회
- 고용주용: 모든 상태의 공고 조회 (자신의 공고)
- 각 조회 타입별 상세 로깅 추가

## 📋 확인 방법

### 1단계: 공고 등록 후 데이터베이스 확인

MySQL Workbench에서 `VERIFY_JOB_CREATION.sql` 실행:

```sql
USE team2_db;

-- 가장 최근 등록된 공고 확인
SELECT 
    j.id as 공고ID,
    j.title as 공고제목,
    j.employerId as 고용주_ID,
    j.status as 상태,
    j.store_id as 매장ID,
    j.createdAt as 생성일시,
    CASE 
        WHEN j.status = 'active' THEN '✅ 구직자에게 보임'
        ELSE '❌ 구직자에게 안 보임'
    END as 구직자_표시여부
FROM jobs j
ORDER BY j.createdAt DESC
LIMIT 1;
```

**확인 사항:**
- [ ] 공고가 데이터베이스에 저장되었는가?
- [ ] `status`가 `'active'`인가? (구직자에게 보이려면 필수)
- [ ] `employerId`가 올바른가?

### 2단계: 백엔드 로그 확인

공고 등록 시 백엔드 로그에서 확인:
```
[DEBUG] create_job - 데이터베이스에 저장 시작...
[DEBUG] create_job - commit 완료
[DEBUG] create_job - ✅ 데이터베이스 저장 확인됨!
  job_id: job-xxx
  status: active
[DEBUG] create_job - ✅ 구직자에게 보일 공고 (status=active)
```

### 3단계: 구직자용 공고 조회 확인

구직자로 로그인 → 공고 목록 페이지 접속:
- 백엔드 로그에서:
  ```
  [DEBUG] list_jobs - 구직자용 조회: active 상태 공고만 필터링
  [DEBUG] list_jobs - 조회된 공고 개수: N
  ```

### 4단계: 고용주용 공고 조회 확인

고용주로 로그인 → 공고관리 페이지 접속:
- 백엔드 로그에서:
  ```
  [DEBUG] list_jobs - 고용주용 조회: 모든 상태 공고 조회
  [DEBUG] list_jobs - 조회된 공고 개수: N
  ```

## 🐛 가능한 문제와 해결

### 문제 1: 공고가 데이터베이스에 저장되지 않음
**증상**: 백엔드 로그에 `❌ 데이터베이스 저장 실패!`
**원인**: 트랜잭션 롤백 또는 데이터베이스 연결 문제
**해결**: 백엔드 로그의 에러 메시지 확인

### 문제 2: 공고는 저장되지만 구직자에게 안 보임
**증상**: `status`가 `'active'`가 아님
**원인**: 공고 생성 시 `status`가 잘못 설정됨
**해결**: 백엔드 코드에서 `status = 'active'`로 설정 확인

### 문제 3: 고용주에게만 보이고 구직자에게 안 보임
**증상**: 데이터베이스에는 있지만 구직자 조회 시 안 보임
**원인**: `list_jobs`에서 `status = 'active'` 필터링 문제
**해결**: 이미 수정됨 (구직자용 조회 시 active만 필터링)

## 📝 데이터베이스 확인 SQL

### 공고가 저장되었는지 확인
```sql
USE team2_db;
SELECT * FROM jobs ORDER BY createdAt DESC LIMIT 5;
```

### 구직자에게 보이는 공고 확인
```sql
USE team2_db;
SELECT COUNT(*) as 구직자에게_보이는_공고수 FROM jobs WHERE status = 'active';
```

### 특정 고용주의 공고 확인
```sql
USE team2_db;
SELECT * FROM jobs WHERE employerId = '여기에_고용주_ID_입력' ORDER BY createdAt DESC;
```

## ✅ 다음 단계

1. **백엔드 서버 재시작** (자동으로 재시작됨)
2. **고용주로 로그인 → 공고 등록**
3. **백엔드 로그 확인** (위 체크리스트 참조)
4. **MySQL에서 공고 확인** (`VERIFY_JOB_CREATION.sql` 실행)
5. **구직자로 로그인 → 공고 목록 확인**
6. **고용주로 로그인 → 공고관리 확인**

백엔드 서버가 자동으로 재시작되었습니다. 이제 테스트해보세요!

