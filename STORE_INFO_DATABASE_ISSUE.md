# 매장 정보 저장 문제 진단 및 해결

## 🔍 문제 진단

### 발견된 문제
백엔드에서 `getattr(request, 'shop_name', None)`을 사용하고 있었는데, Pydantic 모델에서는 직접 접근(`request.shop_name`)해야 합니다.

### 수정 사항

#### 1. 백엔드 수정 (`backend/app/routers/jobs.py`)
- `getattr(request, 'shop_name', None)` → `request.shop_name`
- `getattr(request, 'shop_address', None)` → `request.shop_address`
- `getattr(request, 'shop_address_detail', None)` → `request.shop_address_detail`
- `getattr(request, 'shop_phone', None)` → `request.shop_phone`
- `getattr(request, 'store_id', None)` → `request.store_id`
- `getattr(request, 'wage_type', 'hourly')` → `request.wage_type if request.wage_type else 'hourly'`
- `getattr(request, 'status', 'active')` → `request.status if request.status else 'active'`

#### 2. 디버깅 로그 추가
- 프론트엔드: 선택한 매장 정보와 전송할 데이터 로그
- 백엔드: 받은 매장 정보와 저장할 Job 객체 로그

## 📋 데이터베이스 확인 방법

### 1. jobs 테이블 구조 확인
```sql
USE team2_db;
DESCRIBE jobs;
```

### 2. 저장된 매장 정보 확인
`check_jobs_store_info.sql` 파일 실행:
```sql
-- 최근 등록된 공고들의 매장 정보 확인
SELECT 
    id,
    title,
    shop_name,
    shop_address,
    shop_address_detail,
    shop_phone,
    store_id,
    location,
    createdAt
FROM jobs
ORDER BY createdAt DESC
LIMIT 10;
```

### 3. 매장 정보가 NULL인 공고 확인
```sql
SELECT 
    id,
    title,
    shop_name,
    shop_address,
    store_id,
    createdAt
FROM jobs
WHERE shop_name IS NULL 
   OR shop_address IS NULL
   OR store_id IS NULL
ORDER BY createdAt DESC;
```

### 4. store_id별 그룹화 확인
```sql
SELECT 
    store_id,
    COUNT(*) as job_count,
    GROUP_CONCAT(title SEPARATOR ', ') as job_titles
FROM jobs
WHERE store_id IS NOT NULL
GROUP BY store_id;
```

## 🧪 테스트 방법

### 1. 브라우저 콘솔 확인
1. http://localhost:5173/employer/job-create 접속
2. 개발자 도구 콘솔 열기 (F12)
3. 다른 매장 선택
4. 공고 등록
5. 콘솔에서 다음 로그 확인:
   - `=== 공고 등록 데이터 ===`
   - `선택한 매장:`
   - `전송할 jobData:`
   - `shop_name:`, `shop_address:`, `store_id:`

### 2. 백엔드 로그 확인
백엔드 서버 터미널에서 다음 로그 확인:
- `[DEBUG] create_job - 받은 매장 정보:`
- `[DEBUG] create_job - 저장할 Job 객체:`

### 3. 데이터베이스 확인
1. MySQL Workbench에서 `check_jobs_store_info.sql` 실행
2. 최근 등록한 공고의 `shop_name`, `shop_address`, `store_id` 확인
3. 선택한 매장 정보와 일치하는지 확인

## 🔧 추가 확인 사항

### jobs 테이블에 필드가 없는 경우
`add_store_fields_to_jobs.sql` 파일 실행하여 필드 추가

### 기존 공고 데이터 업데이트 (필요한 경우)
```sql
-- 특정 공고의 매장 정보 수동 업데이트 (예시)
UPDATE jobs
SET 
    shop_name = '매장명',
    shop_address = '주소',
    shop_address_detail = '상세주소',
    shop_phone = '전화번호',
    store_id = 'store-id'
WHERE id = 'job-id';
```

## 📝 예상 결과

수정 후:
1. 프론트엔드에서 선택한 매장 정보가 콘솔에 정확히 표시됨
2. 백엔드에서 받은 매장 정보가 로그에 정확히 표시됨
3. 데이터베이스에 선택한 매장 정보가 정확히 저장됨
4. 공고 조회 시 선택한 매장 정보가 정확히 표시됨

## ⚠️ 주의사항

- 기존에 등록된 공고는 매장 정보가 NULL일 수 있습니다.
- 새로운 공고부터 정상적으로 저장됩니다.
- 기존 공고를 수정하려면 수동으로 UPDATE 쿼리를 실행해야 합니다.

