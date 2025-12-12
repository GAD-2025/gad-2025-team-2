-- jobs 테이블에 저장된 매장 정보 확인
USE team2_db;

-- 최근 등록된 공고들의 매장 정보 확인
SELECT 
    id,
    title,
    shop_name,
    shop_address,
    shop_address_detail,
    shop_phone,
    store_id,
    location,
    category,
    wage_type,
    wage,
    createdAt
FROM jobs
ORDER BY createdAt DESC
LIMIT 10;

-- 매장 정보가 NULL인 공고 확인
SELECT 
    id,
    title,
    shop_name,
    shop_address,
    store_id,
    createdAt
FROM jobs
WHERE shop_name IS NULL 
   OR shop_address IS NULL
   OR store_id IS NULL
ORDER BY createdAt DESC;

-- store_id별로 그룹화하여 확인
SELECT 
    store_id,
    COUNT(*) as job_count,
    GROUP_CONCAT(title SEPARATOR ', ') as job_titles
FROM jobs
WHERE store_id IS NOT NULL
GROUP BY store_id;
