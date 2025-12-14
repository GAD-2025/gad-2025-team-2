-- 공고의 store_id 확인 및 수정

USE team2_db;

-- ============================================
-- 1단계: 공고의 store_id 확인
-- ============================================
SELECT 
    j.id as 공고ID,
    j.title as 공고제목,
    j.employerId as 고용주_ID,
    j.store_id as 매장ID,
    j.shop_name as 가게명,
    CASE 
        WHEN j.store_id IS NULL THEN '❌ store_id 없음'
        ELSE '✅ store_id 있음'
    END as 상태
FROM jobs j
ORDER BY j.createdAt DESC;

-- ============================================
-- 2단계: 고용주의 매장 확인
-- ============================================
-- (user_id를 실제 고용주 user_id로 변경하세요)
SELECT 
    ep.user_id as 고용주_user_id,
    s.id as 매장ID,
    s.name as 매장명,
    COUNT(j.id) as 공고수
FROM employer_profiles ep
LEFT JOIN stores s ON s.user_id = ep.user_id
LEFT JOIN jobs j ON j.store_id = s.id
WHERE ep.user_id = '여기에_고용주_user_id_입력'
GROUP BY ep.user_id, s.id, s.name;

-- ============================================
-- 3단계: 공고와 매장 연결 확인
-- ============================================
SELECT 
    j.id as 공고ID,
    j.title,
    j.employerId,
    j.store_id,
    s.id as 매장ID,
    s.name as 매장명,
    s.user_id as 매장_소유자_user_id
FROM jobs j
LEFT JOIN stores s ON s.id = j.store_id
ORDER BY j.createdAt DESC;

-- ============================================
-- 4단계: store_id가 NULL인 공고 확인
-- ============================================
SELECT 
    COUNT(*) as store_id_NULL인_공고수
FROM jobs
WHERE store_id IS NULL;


