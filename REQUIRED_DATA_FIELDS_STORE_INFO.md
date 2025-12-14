# 매장 정보 표시 기능 구현에 필요한 데이터 필드

## 📋 데이터베이스 필드 리스트

### `jobs` 테이블에 필요한 필드

다음 필드들이 `jobs` 테이블에 존재해야 합니다:

| 필드명 | 타입 | NULL 허용 | 설명 |
|--------|------|-----------|------|
| `shop_name` | VARCHAR(255) | YES | 선택한 매장명 |
| `shop_address` | VARCHAR(500) | YES | 선택한 매장 주소 |
| `shop_address_detail` | VARCHAR(500) | YES | 선택한 매장 상세 주소 |
| `shop_phone` | VARCHAR(50) | YES | 선택한 매장 전화번호 |
| `store_id` | VARCHAR(255) | YES | 선택한 매장 ID (stores.id 참조) |

### 필드 추가 SQL

필드가 없는 경우 다음 SQL을 실행하세요:

```sql
USE team2_db;

ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS shop_name VARCHAR(255) NULL 
COMMENT '선택한 매장명';

ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS shop_address VARCHAR(500) NULL 
COMMENT '선택한 매장 주소';

ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS shop_address_detail VARCHAR(500) NULL 
COMMENT '선택한 매장 상세 주소';

ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS shop_phone VARCHAR(50) NULL 
COMMENT '선택한 매장 전화번호';

ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS store_id VARCHAR(255) NULL 
COMMENT '선택한 매장 ID (stores.id 참조)';
```

### 필드 확인 SQL

```sql
USE team2_db;

DESCRIBE jobs;

-- 또는 특정 필드만 확인
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'team2_db'
  AND TABLE_NAME = 'jobs'
  AND COLUMN_NAME IN ('shop_name', 'shop_address', 'shop_address_detail', 'shop_phone', 'store_id');
```

## 📝 참고

- 이 필드들은 선택적(optional)입니다. NULL을 허용합니다.
- 선택한 매장 정보가 있으면 그것을 사용하고, 없으면 기본 `employer` 정보를 사용합니다.
- `store_id`는 `stores` 테이블의 `id`를 참조합니다.

