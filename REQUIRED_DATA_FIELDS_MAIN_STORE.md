# 기본가게 설정 기능 구현에 필요한 데이터 필드

## 📋 데이터베이스 필드 리스트

### `stores` 테이블에 필요한 필드 (이미 존재)

다음 필드들이 `stores` 테이블에 이미 존재합니다:

| 필드명 | 타입 | NULL 허용 | 설명 |
|--------|------|-----------|------|
| `is_main` | BOOLEAN | NO | 기본가게 여부 (DEFAULT FALSE) |
| `user_id` | VARCHAR(255) | NO | 고용주 사용자 ID |
| `store_name` | VARCHAR(255) | NO | 매장명 |
| `address` | VARCHAR(500) | NO | 주소 |
| `address_detail` | VARCHAR(500) | YES | 상세 주소 |
| `phone` | VARCHAR(50) | YES | 전화번호 |
| `industry` | VARCHAR(100) | YES | 업종 |
| `business_license` | VARCHAR(255) | YES | 사업자 등록증 |
| `management_role` | VARCHAR(50) | YES | 관리 역할 |
| `store_type` | VARCHAR(50) | YES | 매장 유형 |
| `created_at` | DATETIME | NO | 생성일시 |
| `updated_at` | DATETIME | NO | 수정일시 |

### 데이터베이스 수정 필요 여부

**필요 없음** - 모든 필드가 이미 존재하며, 추가 수정이 필요하지 않습니다.

### 필드 확인 SQL

```sql
USE team2_db;

DESCRIBE stores;

-- 또는 특정 필드만 확인
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'team2_db'
  AND TABLE_NAME = 'stores'
  AND COLUMN_NAME = 'is_main';
```

## 📝 참고

- `is_main` 필드는 기본가게 여부를 나타냅니다.
- 기본가게는 하나만 설정 가능하므로, 새로운 기본가게를 설정할 때는 기존 기본가게의 `is_main`을 `False`로 변경해야 합니다.
- 백엔드 API에서 이 로직을 처리합니다.

