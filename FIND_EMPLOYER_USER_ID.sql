-- 고용주 user_id 찾기 및 지원 내역 확인

USE team2_db;

-- 1단계: 모든 고용주 user_id 확인
SELECT 
    ep.user_id,
    ep.id as profile_id,
    e.id as employer_id,
    e.businessNo
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
ORDER BY ep.user_id;

-- 2단계: 특정 고용주의 지원 내역 확인 (위에서 찾은 user_id 사용)
-- 예시: user_id가 'user-123'인 경우
SELECT 
    ep.user_id,
    e.id as employer_id,
    j.id as job_id,
    j.title as job_title,
    a.applicationId,
    a.seekerId,
    a.status,
    a.appliedAt
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
LEFT JOIN jobs j ON j.employerId = e.id
LEFT JOIN applications a ON a.jobId = j.id
WHERE ep.user_id = '여기에_위에서_찾은_user_id_입력'
ORDER BY a.appliedAt DESC;

-- 3단계: 모든 고용주의 지원 내역 요약 (user_id별로)
SELECT 
    ep.user_id,
    e.id as employer_id,
    COUNT(DISTINCT j.id) as 공고수,
    COUNT(a.applicationId) as 지원수
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
LEFT JOIN jobs j ON j.employerId = e.id
LEFT JOIN applications a ON a.jobId = j.id
GROUP BY ep.user_id, e.id
ORDER BY 지원수 DESC;


