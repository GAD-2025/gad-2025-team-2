-- 구직자 지원 → 고용주 채용탭 표시 문제 진단

USE team2_db;

-- ============================================
-- 1단계: 고용주 user_id 찾기
-- ============================================
SELECT 
    ep.user_id as 고용주_user_id,
    ep.id as profile_id,
    e.id as employer_id,
    e.businessNo as 사업자번호
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
ORDER BY ep.user_id;

-- ============================================
-- 2단계: 지원 내역 확인 (전체)
-- ============================================
SELECT 
    a.applicationId,
    a.seekerId as 구직자_user_id,
    a.jobId,
    a.status,
    a.appliedAt,
    j.id as job_id,
    j.title as 공고제목,
    j.employerId as 고용주_ID
FROM applications a
LEFT JOIN jobs j ON a.jobId = j.id
ORDER BY a.appliedAt DESC;

-- ============================================
-- 3단계: 고용주별 지원 내역 확인
-- (위 1단계에서 찾은 user_id를 사용하세요)
-- ============================================
-- 예시: user_id가 'user-abc123'인 경우
SELECT 
    ep.user_id as 고용주_user_id,
    e.id as employer_id,
    j.id as job_id,
    j.title as 공고제목,
    a.applicationId,
    a.seekerId as 구직자_user_id,
    a.status,
    a.appliedAt
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
LEFT JOIN jobs j ON j.employerId = e.id
LEFT JOIN applications a ON a.jobId = j.id
WHERE ep.user_id = '여기에_1단계에서_찾은_user_id_입력'
ORDER BY a.appliedAt DESC;

-- ============================================
-- 4단계: 연결 체인 전체 확인 (문제 진단용)
-- ============================================
-- 이 쿼리는 모든 연결이 제대로 되어 있는지 확인합니다
SELECT 
    'applications' as 테이블,
    a.applicationId as ID,
    a.seekerId as 구직자_user_id,
    a.jobId as 공고ID,
    NULL as 고용주_ID,
    NULL as 고용주_user_id
FROM applications a
WHERE a.jobId IS NOT NULL

UNION ALL

SELECT 
    'jobs' as 테이블,
    j.id as ID,
    NULL as 구직자_user_id,
    j.id as 공고ID,
    j.employerId as 고용주_ID,
    NULL as 고용주_user_id
FROM jobs j

UNION ALL

SELECT 
    'employers' as 테이블,
    e.id as ID,
    NULL as 구직자_user_id,
    NULL as 공고ID,
    e.id as 고용주_ID,
    NULL as 고용주_user_id
FROM employers e

UNION ALL

SELECT 
    'employer_profiles' as 테이블,
    ep.id as ID,
    NULL as 구직자_user_id,
    NULL as 공고ID,
    NULL as 고용주_ID,
    ep.user_id as 고용주_user_id
FROM employer_profiles ep;

-- ============================================
-- 5단계: 간단한 연결 확인 (추천)
-- ============================================
-- 이 쿼리로 모든 고용주의 지원 내역을 한눈에 볼 수 있습니다
SELECT 
    ep.user_id as 고용주_user_id,
    e.id as employer_id,
    COUNT(DISTINCT j.id) as 공고수,
    COUNT(a.applicationId) as 지원수,
    GROUP_CONCAT(DISTINCT j.title SEPARATOR ', ') as 공고목록
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
LEFT JOIN jobs j ON j.employerId = e.id
LEFT JOIN applications a ON a.jobId = j.id
GROUP BY ep.user_id, e.id
ORDER BY 지원수 DESC, 공고수 DESC;


