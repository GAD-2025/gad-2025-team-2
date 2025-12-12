# 매장 정보 표시 문제 해결 완료

## ✅ 수정 완료 사항

### 문제
고용주가 공고 등록 시 다른 매장을 선택해도 기본 매장 정보로 공고가 등록되는 문제

### 해결 방법

#### 1. 백엔드 수정
- **`backend/app/schemas.py`**: `JobResponse` 스키마에 `shop_name`, `shop_address`, `shop_address_detail`, `shop_phone`, `store_id` 필드 추가
- **`backend/app/routers/jobs.py`**:
  - `create_job`: 선택한 매장 정보를 `JobResponse`에 포함
  - `list_jobs`: `job_dict`에 선택한 매장 정보 필드 추가
  - `get_job`: `job_dict`에 선택한 매장 정보 필드 추가

#### 2. 프론트엔드 수정
- **`frontend/src/types/index.ts`**: `Job` 인터페이스에 `shop_name`, `shop_address`, `shop_address_detail`, `shop_phone`, `store_id` 필드 추가
- **`frontend/src/pages/jobseeker/JobDetail.tsx`**:
  - 업직종: `job.category || job.employer.industry` 사용
  - 주소: `job.shop_address || job.location || job.employer.address` 사용
  - 전화번호: `job.shop_phone || job.employer.phone` 사용
- **`frontend/src/components/JobCard.tsx`**:
  - 매장명: `job.shop_name || job.employer.shopName` 사용
  - 주소: `job.shop_address || job.location || job.employer.address` 사용

## 📋 데이터베이스 필드 확인

### `jobs` 테이블에 필요한 필드 (이미 존재해야 함)
다음 필드들이 `jobs` 테이블에 이미 존재하는지 확인하세요:

```sql
-- jobs 테이블 구조 확인
DESCRIBE jobs;
```

필요한 필드:
- `shop_name` VARCHAR(255) NULL
- `shop_address` VARCHAR(500) NULL
- `shop_address_detail` VARCHAR(500) NULL
- `shop_phone` VARCHAR(50) NULL
- `store_id` VARCHAR(255) NULL

### 필드가 없는 경우 추가 SQL

```sql
USE team2_db;

-- shop_name 필드 추가 (없는 경우)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS shop_name VARCHAR(255) NULL 
COMMENT '선택한 매장명';

-- shop_address 필드 추가 (없는 경우)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS shop_address VARCHAR(500) NULL 
COMMENT '선택한 매장 주소';

-- shop_address_detail 필드 추가 (없는 경우)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS shop_address_detail VARCHAR(500) NULL 
COMMENT '선택한 매장 상세 주소';

-- shop_phone 필드 추가 (없는 경우)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS shop_phone VARCHAR(50) NULL 
COMMENT '선택한 매장 전화번호';

-- store_id 필드 추가 (없는 경우)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS store_id VARCHAR(255) NULL 
COMMENT '선택한 매장 ID (stores.id 참조)';
```

## 🧪 테스트 방법

1. **백엔드 서버 재시작**
   - 백엔드 서버가 자동으로 재시작되었는지 확인
   - http://localhost:8000/docs 접속하여 API 문서 확인

2. **공고 등록 테스트**
   - http://localhost:5173/employer/job-create 접속
   - 기본 매장이 아닌 다른 매장 선택
   - 공고 정보 입력 후 등록
   - 등록된 공고의 매장 정보가 선택한 매장 정보로 표시되는지 확인

3. **공고 조회 테스트**
   - http://localhost:5173/jobseeker/home 접속
   - 등록한 공고가 선택한 매장 정보로 표시되는지 확인
   - 공고 상세 페이지에서도 선택한 매장 정보가 표시되는지 확인

## 📝 참고

- 선택한 매장 정보가 있으면 그것을 우선 사용하고, 없으면 기본 `employer` 정보를 사용합니다.
- 이는 하위 호환성을 위한 fallback 메커니즘입니다.
