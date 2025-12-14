# 매장 정보 저장 문제 해결 완료

## 🔍 발견된 문제

### 원인
백엔드에서 Pydantic 모델의 필드에 접근할 때 `getattr(request, 'shop_name', None)`을 사용하고 있었습니다. 하지만 Pydantic 모델에서는 직접 접근(`request.shop_name`)해야 제대로 작동합니다.

### 문제 코드 (수정 전)
```python
shop_name=getattr(request, 'shop_name', None),
shop_address=getattr(request, 'shop_address', None),
store_id=getattr(request, 'store_id', None),
```

### 수정 코드 (수정 후)
```python
shop_name=request.shop_name,
shop_address=request.shop_address,
shop_address_detail=request.shop_address_detail,
shop_phone=request.shop_phone,
store_id=request.store_id,
```

## ✅ 수정 완료

### 1. 백엔드 수정 (`backend/app/routers/jobs.py`)
- `getattr` 대신 직접 접근으로 변경
- 디버깅 로그 추가 (받은 매장 정보, 저장할 Job 객체)

### 2. 프론트엔드 수정 (`frontend/src/pages/employer/JobCreate.tsx`)
- 디버깅 로그 추가 (선택한 매장, 전송할 데이터)

## 📋 데이터베이스 확인 방법

### 1. jobs 테이블 구조 확인
```sql
USE team2_db;
DESCRIBE jobs;
```

필요한 필드:
- `shop_name` VARCHAR(255) NULL
- `shop_address` VARCHAR(500) NULL
- `shop_address_detail` VARCHAR(500) NULL
- `shop_phone` VARCHAR(50) NULL
- `store_id` VARCHAR(255) NULL

### 2. 저장된 매장 정보 확인
`check_jobs_store_info.sql` 파일 실행:
```sql
SELECT 
    id,
    title,
    shop_name,
    shop_address,
    shop_address_detail,
    shop_phone,
    store_id,
    createdAt
FROM jobs
ORDER BY createdAt DESC
LIMIT 10;
```

### 3. 필드가 없는 경우 추가
`add_store_fields_to_jobs.sql` 파일 실행

## 🧪 테스트 방법

### 1. 브라우저 콘솔 확인
1. http://localhost:5173/employer/job-create 접속
2. 개발자 도구 콘솔 열기 (F12)
3. **다른 매장 선택** (기본 매장이 아닌)
4. 공고 정보 입력 후 등록
5. 콘솔에서 확인:
   ```
   === 공고 등록 데이터 ===
   선택한 매장: {id: "...", store_name: "...", address: "..."}
   전송할 jobData: {shop_name: "...", shop_address: "...", store_id: "..."}
   ```

### 2. 백엔드 로그 확인
백엔드 서버 터미널에서 확인:
```
[DEBUG] create_job - 받은 매장 정보:
  shop_name: 매장명
  shop_address: 주소
  store_id: store-id
[DEBUG] create_job - 저장할 Job 객체:
  shop_name: 매장명
  shop_address: 주소
  store_id: store-id
```

### 3. 데이터베이스 확인
1. MySQL Workbench에서 `check_jobs_store_info.sql` 실행
2. 최근 등록한 공고의 `shop_name`, `shop_address`, `store_id` 확인
3. 선택한 매장 정보와 일치하는지 확인

### 4. 공고 조회 확인
1. http://localhost:5173/employer/job-management 접속
2. 등록한 공고의 주소가 선택한 매장 주소로 표시되는지 확인
3. http://localhost:5173/jobseeker/home 접속
4. 공고 카드의 매장명과 주소가 선택한 매장 정보로 표시되는지 확인

## 📝 예상 결과

수정 후:
- ✅ 프론트엔드에서 선택한 매장 정보가 콘솔에 정확히 표시됨
- ✅ 백엔드에서 받은 매장 정보가 로그에 정확히 표시됨
- ✅ 데이터베이스에 선택한 매장 정보가 정확히 저장됨
- ✅ 공고 조회 시 선택한 매장 정보가 정확히 표시됨

## ⚠️ 주의사항

1. **기존 공고**: 이미 등록된 공고는 매장 정보가 NULL일 수 있습니다. 새로운 공고부터 정상적으로 저장됩니다.

2. **기존 공고 수정**: 기존 공고의 매장 정보를 수정하려면:
   ```sql
   UPDATE jobs
   SET 
       shop_name = '매장명',
       shop_address = '주소',
       shop_address_detail = '상세주소',
       shop_phone = '전화번호',
       store_id = 'store-id'
   WHERE id = 'job-id';
   ```

3. **데이터베이스 필드 확인**: `add_store_fields_to_jobs.sql`을 실행하여 필드가 있는지 확인하세요.

## 🔗 관련 파일

- `STORE_INFO_DATABASE_ISSUE.md` - 상세 진단 및 해결 방법
- `check_jobs_store_info.sql` - 저장된 매장 정보 확인 SQL
- `add_store_fields_to_jobs.sql` - 필드 추가 SQL

백엔드 서버가 자동으로 재시작되었습니다. 이제 테스트해보세요! 🎉


