-- 매장 정보가 실제로 저장되어 있는지 확인
USE team2_db;

-- 최근 등록된 공고의 매장 정보 상세 확인
SELECT 
    id,
    title,
    shop_name AS '매장명',
    shop_address AS '매장주소',
    shop_address_detail AS '상세주소',
    shop_phone AS '전화번호',
    store_id AS '매장ID',
    location AS '위치',
    category AS '업종',
    createdAt AS '등록일시'
FROM jobs
ORDER BY createdAt DESC
LIMIT 5;

-- NULL이 아닌 매장 정보가 있는 공고 개수 확인
SELECT 
    COUNT(*) AS '전체 공고 수',
    COUNT(shop_name) AS '매장명 있는 공고',
    COUNT(shop_address) AS '주소 있는 공고',
    COUNT(store_id) AS '매장ID 있는 공고'
FROM jobs;

-- 매장 정보가 있는 공고만 확인
SELECT 
    id,
    title,
    shop_name,
    shop_address,
    store_id,
    createdAt
FROM jobs
WHERE shop_name IS NOT NULL
   AND shop_address IS NOT NULL
   AND store_id IS NOT NULL
ORDER BY createdAt DESC
LIMIT 10;


