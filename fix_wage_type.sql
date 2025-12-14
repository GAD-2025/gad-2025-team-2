-- 데이터베이스 선택
USE team2_db;

-- jobs 테이블에 wage_type 필드 추가
ALTER TABLE jobs 
ADD COLUMN wage_type VARCHAR(20) DEFAULT 'hourly' 
COMMENT '급여 타입: hourly(시급), weekly(주급), monthly(월급)';

