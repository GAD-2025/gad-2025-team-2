# 공고 관리 페이지 매장 정보 표시 수정 완료

## 🔍 발견된 문제

### 문제
데이터베이스에는 매장 정보(`shop_name`, `shop_address`, `store_id`)가 정상적으로 저장되어 있지만, **공고 관리 페이지**에서 기본 `employer` 정보를 표시하고 있었습니다.

### 수정 전 코드
```typescript
<p>{job.employer?.shopName}</p>
<p>{job.location || job.employer?.address}</p>
```

### 수정 후 코드
```typescript
<p>{job.shop_name || job.employer?.shopName}</p>
<p>{job.shop_address || job.location || job.employer?.address}</p>
```

## ✅ 수정 완료

### 수정된 파일
- `frontend/src/pages/employer/JobManagement.tsx`
  - 매장명: `job.shop_name` 우선 사용, 없으면 `job.employer?.shopName`
  - 주소: `job.shop_address` 우선 사용, 없으면 `job.location` 또는 `job.employer?.address`

## 🧪 테스트 방법

### 1. 데이터베이스 확인
MySQL Workbench에서 다음 쿼리 실행:
```sql
USE team2_db;

SELECT 
    id,
    title,
    shop_name,
    shop_address,
    store_id,
    createdAt
FROM jobs
ORDER BY createdAt DESC
LIMIT 5;
```

**예상 결과**: `shop_name`, `shop_address`, `store_id`에 값이 있어야 합니다.

### 2. 공고 관리 페이지 확인
1. http://localhost:5173/employer/job-management 접속
2. 등록한 공고 카드 확인:
   - **매장명**이 선택한 매장명으로 표시되는지 확인
   - **주소**가 선택한 매장 주소로 표시되는지 확인

### 3. 새 공고 등록 테스트
1. http://localhost:5173/employer/job-create 접속
2. **기본 매장이 아닌 다른 매장 선택**
3. 공고 정보 입력 후 등록
4. 공고 관리 페이지에서 확인:
   - 선택한 매장명과 주소가 표시되는지 확인

## 📋 확인 사항

### 데이터베이스에 저장 확인
- ✅ `shop_name` - 선택한 매장명
- ✅ `shop_address` - 선택한 매장 주소
- ✅ `shop_address_detail` - 선택한 매장 상세 주소
- ✅ `shop_phone` - 선택한 매장 전화번호
- ✅ `store_id` - 선택한 매장 ID

### 프론트엔드 표시 확인
- ✅ 공고 관리 페이지: 선택한 매장 정보 표시
- ✅ 구직자 홈: 선택한 매장 정보 표시 (이미 수정됨)
- ✅ 공고 상세 페이지: 선택한 매장 정보 표시 (이미 수정됨)

## 📝 참고

- 선택한 매장 정보가 있으면 그것을 우선 사용하고, 없으면 기본 `employer` 정보를 사용합니다.
- 이는 하위 호환성을 위한 fallback 메커니즘입니다.
- 기존에 등록된 공고는 매장 정보가 NULL일 수 있으므로, 기본 `employer` 정보가 표시됩니다.

모든 수정이 완료되었습니다! 이제 공고 관리 페이지에서도 선택한 매장 정보가 정확히 표시됩니다. 🎉

