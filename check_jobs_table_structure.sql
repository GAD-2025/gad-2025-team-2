-- jobs 테이블 구조 확인
USE team2_db;

DESCRIBE jobs;

-- 필요한 필드가 있는지 확인
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


