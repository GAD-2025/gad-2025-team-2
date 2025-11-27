-- Jobs 테이블에 누락된 컬럼 추가
-- 기존 데이터를 유지하면서 컬럼만 추가합니다

USE workfair;

-- 컬럼이 이미 있으면 에러가 발생할 수 있으므로, 하나씩 추가합니다
-- 에러가 나도 계속 진행합니다

-- 1. status 컬럼 추가
SET @s = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA='workfair' AND TABLE_NAME='jobs' AND COLUMN_NAME='status') > 0,
    'SELECT ''status column already exists'' AS info',
    'ALTER TABLE jobs ADD COLUMN status VARCHAR(20) DEFAULT ''active'' COMMENT ''공고 상태: active, paused, closed'''
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. views 컬럼 추가
SET @s = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA='workfair' AND TABLE_NAME='jobs' AND COLUMN_NAME='views') > 0,
    'SELECT ''views column already exists'' AS info',
    'ALTER TABLE jobs ADD COLUMN views INT DEFAULT 0 COMMENT ''조회수'''
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. applications 컬럼 추가
SET @s = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA='workfair' AND TABLE_NAME='jobs' AND COLUMN_NAME='applications') > 0,
    'SELECT ''applications column already exists'' AS info',
    'ALTER TABLE jobs ADD COLUMN applications INT DEFAULT 0 COMMENT ''지원자 수'''
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. postedAt 컬럼 추가
SET @s = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA='workfair' AND TABLE_NAME='jobs' AND COLUMN_NAME='postedAt') > 0,
    'SELECT ''postedAt column already exists'' AS info',
    'ALTER TABLE jobs ADD COLUMN postedAt VARCHAR(50) NULL COMMENT ''등록일시 (ISO8601)'''
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. location 컬럼 추가
SET @s = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA='workfair' AND TABLE_NAME='jobs' AND COLUMN_NAME='location') > 0,
    'SELECT ''location column already exists'' AS info',
    'ALTER TABLE jobs ADD COLUMN location VARCHAR(200) NULL COMMENT ''근무지 (간단 주소)'''
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 확인
SELECT '============================================' as '';
SELECT '✅ Jobs 테이블 업데이트 완료!' as message;
SELECT '============================================' as '';
SELECT '' as '';
SELECT '📋 Jobs 테이블 구조:' as '';
DESCRIBE jobs;

