-- 공고 등록 후 데이터베이스 저장 확인

USE team2_db;

-- ============================================
-- 1단계: 최근 등록된 공고 확인
-- ============================================
SELECT 
    j.id as 공고ID,
    j.title as 공고제목,
    j.employerId as 고용주_ID,
    j.store_id as 매장ID,
    j.status as 상태,
    j.createdAt as 생성일시,
    j.postedAt as 게시일시
FROM jobs j
ORDER BY j.createdAt DESC
LIMIT 10;

-- ============================================
-- 2단계: 공고와 고용주 연결 확인
-- ============================================
SELECT 
    j.id as 공고ID,
    j.title as 공고제목,
    j.employerId as 고용주_ID,
    e.id as employer_존재여부,
    e.businessNo as 사업자번호,
    j.status as 공고상태,
    j.createdAt as 생성일시
FROM jobs j
LEFT JOIN employers e ON e.id = j.employerId
ORDER BY j.createdAt DESC
LIMIT 10;

-- ============================================
-- 3단계: 고용주별 공고 개수 확인
-- ============================================
SELECT 
    e.id as 고용주_ID,
    e.businessNo as 사업자번호,
    COUNT(j.id) as 공고수,
    COUNT(CASE WHEN j.status = 'active' THEN 1 END) as 활성공고수
FROM employers e
LEFT JOIN jobs j ON j.employerId = e.id
GROUP BY e.id, e.businessNo
ORDER BY 공고수 DESC;

-- ============================================
-- 4단계: 특정 고용주의 공고 확인
-- ============================================
-- (employerId를 실제 고용주 ID로 변경하세요)
SELECT 
    j.id as 공고ID,
    j.title as 공고제목,
    j.status as 상태,
    j.store_id as 매장ID,
    j.shop_name as 가게명,
    j.createdAt as 생성일시
FROM jobs j
WHERE j.employerId = '여기에_고용주_ID_입력'
ORDER BY j.createdAt DESC;

-- ============================================
-- 5단계: 구직자에게 보여질 공고 확인 (active 상태)
-- ============================================
SELECT 
    COUNT(*) as 구직자에게_보여질_공고수
FROM jobs
WHERE status = 'active';

SELECT 
    j.id as 공고ID,
    j.title as 공고제목,
    j.employerId as 고용주_ID,
    j.status as 상태,
    j.createdAt as 생성일시
FROM jobs j
WHERE j.status = 'active'
ORDER BY j.createdAt DESC
LIMIT 20;

-- ============================================
-- 6단계: 공고 등록 후 즉시 확인 (가장 최근 공고)
-- ============================================
SELECT 
    '=== 가장 최근 등록된 공고 ===' as 확인항목,
    j.id as 공고ID,
    j.title as 공고제목,
    j.employerId as 고용주_ID,
    j.status as 상태,
    j.store_id as 매장ID,
    j.createdAt as 생성일시,
    CASE 
        WHEN j.status = 'active' THEN '✅ 구직자에게 보임'
        ELSE '❌ 구직자에게 안 보임'
    END as 구직자_표시여부
FROM jobs j
ORDER BY j.createdAt DESC
LIMIT 1;


