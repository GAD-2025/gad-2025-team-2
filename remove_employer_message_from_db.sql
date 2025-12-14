-- jobs 테이블에서 employerMessage 컬럼 제거
-- ⚠️ 주의: 이 작업은 되돌릴 수 없습니다. 백업을 권장합니다.

USE team2_db;

-- 1. 기존 데이터 확인 (선택사항)
SELECT 
    id,
    title,
    description,
    employerMessage,
    createdAt
FROM jobs
WHERE employerMessage IS NOT NULL
LIMIT 10;

-- 2. employerMessage 컬럼 제거
ALTER TABLE jobs
DROP COLUMN IF EXISTS employerMessage;

-- 3. 테이블 구조 확인
DESCRIBE jobs;

-- 4. 제거 확인
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'team2_db'
  AND TABLE_NAME = 'jobs'
  AND COLUMN_NAME = 'employerMessage';

-- 결과가 없으면 제거 성공

