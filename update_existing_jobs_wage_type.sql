-- 기존 공고 데이터에 wage_type 기본값 설정
USE team2_db;

-- 1. 현재 상태 확인
SELECT id, title, wage, wage_type FROM jobs LIMIT 10;

-- 2. wage_type이 NULL이거나 빈 문자열인 경우 'hourly'로 설정
UPDATE jobs 
SET wage_type = 'hourly' 
WHERE wage_type IS NULL OR wage_type = '';

-- 3. 확인
SELECT id, title, wage, wage_type FROM jobs LIMIT 10;
