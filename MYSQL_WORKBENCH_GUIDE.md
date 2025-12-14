# MySQL Workbench에서 SQL 실행 방법

## 📋 실행 방법

### 방법 1: SQL 파일 열기
1. MySQL Workbench 실행
2. `File` → `Open SQL Script...` (또는 `Ctrl+O`)
3. `check_jobs_store_info_simple.sql` 파일 선택
4. `Execute` 버튼 클릭 (또는 `Ctrl+Shift+Enter`)

### 방법 2: 직접 쿼리 입력
1. MySQL Workbench 실행
2. 왼쪽 Schemas 패널에서 `team2_db` 더블클릭 (선택됨)
3. 상단 메뉴에서 `Query` → `New Query Tab` (또는 `Ctrl+T`)
4. 아래 SQL 쿼리 복사해서 붙여넣기:

```sql
USE team2_db;

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

5. `Execute` 버튼 클릭 (또는 `Ctrl+Shift+Enter`)

## 🔍 결과 확인

### 정상적인 경우
- `shop_name`, `shop_address`, `shop_address_detail`, `shop_phone`, `store_id` 컬럼에 값이 표시됨
- 최근 등록한 공고의 매장 정보가 선택한 매장 정보와 일치함

### 문제가 있는 경우
- `shop_name`, `shop_address`, `store_id` 등이 모두 `NULL`로 표시됨
- 이 경우 백엔드 로그를 확인해야 함

## 📝 추가 확인 쿼리

### 매장 정보가 NULL인 공고 확인
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
WHERE shop_name IS NULL 
   OR shop_address IS NULL
   OR store_id IS NULL
ORDER BY createdAt DESC;
```

### 특정 공고의 상세 정보 확인
```sql
USE team2_db;

SELECT *
FROM jobs
WHERE id = 'job-id-here';  -- 실제 job ID로 변경
```

## ⚠️ 주의사항

1. **데이터베이스 선택**: `USE team2_db;` 문을 먼저 실행하거나, 왼쪽 Schemas 패널에서 `team2_db`를 선택해야 합니다.

2. **쿼리 실행**: 쿼리를 선택한 후 `Execute` 버튼을 클릭하거나 `Ctrl+Shift+Enter`를 누르세요.

3. **결과 확인**: 하단의 "Result Grid" 탭에서 결과를 확인할 수 있습니다.

