-- 고용주 user_id로 지원 내역 확인하기

USE team2_db;

-- ============================================
-- 예시 1: 첫 번째 고용주 (employer-05cea39d)의 지원 내역 확인
-- ============================================
SELECT 
    ep.user_id as 고용주_user_id,
    e.id as employer_id,
    j.id as job_id,
    j.title as 공고제목,
    a.applicationId as 지원서ID,
    a.seekerId as 구직자_user_id,
    a.status as 상태,
    a.appliedAt as 지원일시
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
LEFT JOIN jobs j ON j.employerId = e.id
LEFT JOIN applications a ON a.jobId = j.id
WHERE ep.user_id = 'employer-05cea39d'  -- ← 여기를 위에서 본 user_id로 변경!
ORDER BY a.appliedAt DESC;

-- ============================================
-- 예시 2: 두 번째 고용주 (employer-07c3c47e)의 지원 내역 확인
-- ============================================
SELECT 
    ep.user_id as 고용주_user_id,
    e.id as employer_id,
    j.id as job_id,
    j.title as 공고제목,
    a.applicationId as 지원서ID,
    a.seekerId as 구직자_user_id,
    a.status as 상태,
    a.appliedAt as 지원일시
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
LEFT JOIN jobs j ON j.employerId = e.id
LEFT JOIN applications a ON a.jobId = j.id
WHERE ep.user_id = 'employer-07c3c47e'  -- ← 여기를 위에서 본 user_id로 변경!
ORDER BY a.appliedAt DESC;

-- ============================================
-- 모든 고용주의 지원 내역 한번에 보기 (추천!)
-- ============================================
SELECT 
    ep.user_id as 고용주_user_id,
    e.id as employer_id,
    COUNT(DISTINCT j.id) as 공고수,
    COUNT(a.applicationId) as 지원수,
    GROUP_CONCAT(DISTINCT j.title SEPARATOR ' | ') as 공고목록
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
LEFT JOIN jobs j ON j.employerId = e.id
LEFT JOIN applications a ON a.jobId = j.id
GROUP BY ep.user_id, e.id
ORDER BY 지원수 DESC, 공고수 DESC;


