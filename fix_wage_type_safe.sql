-- wage_type 수정 (Safe Update Mode 대응)
USE team2_db;

-- Safe Update Mode 비활성화 (임시)
SET SQL_SAFE_UPDATES = 0;

-- wage_type이 NULL이거나 빈 문자열인 경우 'hourly'로 설정
UPDATE jobs 
SET wage_type = 'hourly' 
WHERE wage_type IS NULL OR wage_type = '';

-- Safe Update Mode 다시 활성화
SET SQL_SAFE_UPDATES = 1;

-- 확인
SELECT id, title, wage, wage_type FROM jobs LIMIT 10;

