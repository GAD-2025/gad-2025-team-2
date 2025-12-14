-- terms_marketing_optional 컬럼 추가 스크립트
-- 구직자 회원가입 오류 해결용

USE team2_db;

-- 컬럼이 이미 있는지 확인하고 없으면 추가
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'team2_db' 
    AND TABLE_NAME = 'signup_users' 
    AND COLUMN_NAME = 'terms_marketing_optional'
);

-- 컬럼이 없으면 추가
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE signup_users ADD COLUMN terms_marketing_optional BOOLEAN DEFAULT FALSE COMMENT ''선택 약관 동의 (마케팅)'' AFTER terms_sms_optional',
    'SELECT ''Column terms_marketing_optional already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 확인
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'team2_db'
AND TABLE_NAME = 'signup_users'
AND COLUMN_NAME LIKE 'terms_%'
ORDER BY ORDINAL_POSITION;
