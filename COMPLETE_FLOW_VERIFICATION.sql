-- 전체 플로우 검증 SQL

USE team2_db;

-- ============================================
-- 1단계: 지원 내역 확인 (가장 중요!)
-- ============================================
SELECT 
    '=== 지원 내역 확인 ===' as 단계,
    COUNT(*) as 전체_지원수
FROM applications;

SELECT 
    a.applicationId,
    a.seekerId as 구직자_user_id,
    a.jobId as 공고ID,
    a.status,
    a.appliedAt,
    j.title as 공고제목,
    j.employerId as 고용주_ID
FROM applications a
LEFT JOIN jobs j ON a.jobId = j.id
ORDER BY a.appliedAt DESC
LIMIT 10;

-- ============================================
-- 2단계: 공고 확인
-- ============================================
SELECT 
    '=== 공고 확인 ===' as 단계,
    COUNT(*) as 전체_공고수
FROM jobs;

SELECT 
    j.id as 공고ID,
    j.title,
    j.employerId as 고용주_ID,
    j.store_id,
    j.status,
    j.createdAt
FROM jobs j
ORDER BY j.createdAt DESC
LIMIT 10;

-- ============================================
-- 3단계: 고용주 연결 확인 (핵심!)
-- ============================================
SELECT 
    '=== 고용주 연결 확인 ===' as 단계,
    ep.user_id as 고용주_user_id,
    ep.id as profile_id,
    e.id as employer_id,
    e.businessNo as 사업자번호,
    COUNT(DISTINCT j.id) as 공고수,
    COUNT(a.applicationId) as 지원수
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
LEFT JOIN jobs j ON j.employerId = e.id
LEFT JOIN applications a ON a.jobId = j.id
GROUP BY ep.user_id, ep.id, e.id, e.businessNo
ORDER BY 지원수 DESC, 공고수 DESC;

-- ============================================
-- 4단계: 특정 고용주의 전체 연결 체인 확인
-- ============================================
-- (user_id를 실제 고용주 user_id로 변경하세요)
SELECT 
    '=== 특정 고용주 연결 체인 ===' as 단계,
    ep.user_id as 고용주_user_id,
    ep.id as profile_id,
    e.id as employer_id,
    e.businessNo as 사업자번호,
    j.id as 공고ID,
    j.title as 공고제목,
    a.applicationId as 지원서ID,
    a.seekerId as 구직자_user_id,
    a.status as 지원상태,
    a.appliedAt as 지원일시
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
LEFT JOIN jobs j ON j.employerId = e.id
LEFT JOIN applications a ON a.jobId = j.id
WHERE ep.user_id = '여기에_고용주_user_id_입력'
ORDER BY a.appliedAt DESC, j.createdAt DESC;

-- ============================================
-- 5단계: 연결 문제 진단
-- ============================================
SELECT 
    '=== 연결 문제 진단 ===' as 단계,
    'employer_profiles 개수' as 항목,
    COUNT(*) as 개수
FROM employer_profiles

UNION ALL

SELECT 
    'employers 개수',
    COUNT(*)
FROM employers

UNION ALL

SELECT 
    'employer_profiles → employers 연결',
    COUNT(*)
FROM employer_profiles ep
INNER JOIN employers e ON e.businessNo = ep.id

UNION ALL

SELECT 
    'employers → jobs 연결',
    COUNT(*)
FROM employers e
INNER JOIN jobs j ON j.employerId = e.id

UNION ALL

SELECT 
    'jobs → applications 연결',
    COUNT(*)
FROM jobs j
INNER JOIN applications a ON a.jobId = j.id

UNION ALL

SELECT 
    '전체 체인 (employer_profiles → applications)',
    COUNT(*)
FROM employer_profiles ep
INNER JOIN employers e ON e.businessNo = ep.id
INNER JOIN jobs j ON j.employerId = e.id
INNER JOIN applications a ON a.jobId = j.id;

