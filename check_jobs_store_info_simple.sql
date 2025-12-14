-- jobs 테이블에 저장된 매장 정보 확인
-- MySQL Workbench에서 이 파일을 열어서 실행하거나, 아래 쿼리를 복사해서 실행하세요

USE team2_db;

-- 최근 등록된 공고 10개의 매장 정보 확인
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


