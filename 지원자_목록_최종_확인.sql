-- 지원자 목록 문제 최종 확인 (employer-c33d319f)
USE team2_db;

-- =============================================
-- 실제 프론트엔드에서 사용하는 userId: employer-c33d319f
-- =============================================
SET @actual_user_id = 'employer-c33d319f';

-- 1. employer_profile 확인
SELECT 
    '1. employer_profile' as step,
    ep.id as profile_id,
    ep.user_id,
    ep.company_name
FROM employer_profiles ep
WHERE ep.user_id COLLATE utf8mb4_unicode_ci = @actual_user_id COLLATE utf8mb4_unicode_ci;

-- 2. employer 확인 (profile.id = businessNo)
SELECT 
    '2. employer' as step,
    e.id as employer_id,
    e.businessNo,
    e.shopName
FROM employers e
WHERE CAST(e.businessNo AS CHAR) COLLATE utf8mb4_unicode_ci = (
    SELECT CAST(ep.id AS CHAR) COLLATE utf8mb4_unicode_ci 
    FROM employer_profiles ep 
    WHERE ep.user_id COLLATE utf8mb4_unicode_ci = @actual_user_id COLLATE utf8mb4_unicode_ci
);

-- 3. 이 employer의 공고 확인
SELECT 
    '3. 공고 목록' as step,
    j.id as job_id,
    j.title,
    j.employerId,
    j.store_id
FROM jobs j
WHERE CAST(j.employerId AS CHAR) COLLATE utf8mb4_unicode_ci = (
    SELECT CAST(e.id AS CHAR) COLLATE utf8mb4_unicode_ci 
    FROM employers e 
    WHERE CAST(e.businessNo AS CHAR) COLLATE utf8mb4_unicode_ci = (
        SELECT CAST(ep.id AS CHAR) COLLATE utf8mb4_unicode_ci 
        FROM employer_profiles ep 
        WHERE ep.user_id COLLATE utf8mb4_unicode_ci = @actual_user_id COLLATE utf8mb4_unicode_ci
    )
);

-- 4. 이 공고들의 지원 내역 확인
SELECT 
    '4. 지원 내역' as step,
    a.applicationId,
    a.seekerId,
    a.jobId,
    a.status,
    a.appliedAt,
    j.title as job_title,
    j.employerId
FROM applications a
INNER JOIN jobs j ON a.jobId = j.id
WHERE CAST(j.employerId AS CHAR) COLLATE utf8mb4_unicode_ci = (
    SELECT CAST(e.id AS CHAR) COLLATE utf8mb4_unicode_ci 
    FROM employers e 
    WHERE CAST(e.businessNo AS CHAR) COLLATE utf8mb4_unicode_ci = (
        SELECT CAST(ep.id AS CHAR) COLLATE utf8mb4_unicode_ci 
        FROM employer_profiles ep 
        WHERE ep.user_id COLLATE utf8mb4_unicode_ci = @actual_user_id COLLATE utf8mb4_unicode_ci
    )
)
ORDER BY a.appliedAt DESC;

-- =============================================
-- 5. 문제 진단: 어디서 끊어지는지 확인
-- =============================================

-- 5-1. employer_profile은 있는데 employer가 없는 경우
SELECT 
    '문제: employer_profile은 있지만 employer 없음' as problem,
    ep.id as profile_id,
    ep.user_id
FROM employer_profiles ep
WHERE ep.user_id COLLATE utf8mb4_unicode_ci = @actual_user_id COLLATE utf8mb4_unicode_ci
  AND NOT EXISTS (
      SELECT 1 FROM employers e WHERE CAST(e.businessNo AS CHAR) COLLATE utf8mb4_unicode_ci = CAST(ep.id AS CHAR) COLLATE utf8mb4_unicode_ci
  );

-- 5-2. employer는 있는데 공고가 없는 경우
SELECT 
    '문제: employer는 있지만 공고 없음' as problem,
    e.id as employer_id,
    e.businessNo
FROM employers e
WHERE CAST(e.businessNo AS CHAR) COLLATE utf8mb4_unicode_ci = (
    SELECT CAST(ep.id AS CHAR) COLLATE utf8mb4_unicode_ci 
    FROM employer_profiles ep 
    WHERE ep.user_id COLLATE utf8mb4_unicode_ci = @actual_user_id COLLATE utf8mb4_unicode_ci
)
  AND NOT EXISTS (
      SELECT 1 FROM jobs j WHERE CAST(j.employerId AS CHAR) COLLATE utf8mb4_unicode_ci = CAST(e.id AS CHAR) COLLATE utf8mb4_unicode_ci
  );

-- 5-3. 공고는 있는데 지원 내역이 없는 경우
SELECT 
    '문제: 공고는 있지만 지원 내역 없음' as problem,
    j.id as job_id,
    j.title,
    j.employerId
FROM jobs j
WHERE CAST(j.employerId AS CHAR) COLLATE utf8mb4_unicode_ci = (
    SELECT CAST(e.id AS CHAR) COLLATE utf8mb4_unicode_ci 
    FROM employers e 
    WHERE CAST(e.businessNo AS CHAR) COLLATE utf8mb4_unicode_ci = (
        SELECT CAST(ep.id AS CHAR) COLLATE utf8mb4_unicode_ci 
        FROM employer_profiles ep 
        WHERE ep.user_id COLLATE utf8mb4_unicode_ci = @actual_user_id COLLATE utf8mb4_unicode_ci
    )
)
  AND NOT EXISTS (
      SELECT 1 FROM applications a WHERE CAST(a.jobId AS CHAR) COLLATE utf8mb4_unicode_ci = CAST(j.id AS CHAR) COLLATE utf8mb4_unicode_ci
  );

-- =============================================
-- 6. 최종 요약
-- =============================================
SELECT 
    '최종 요약' as step,
    (SELECT COUNT(*) FROM employer_profiles WHERE user_id COLLATE utf8mb4_unicode_ci = @actual_user_id COLLATE utf8mb4_unicode_ci) as profile_count,
    (SELECT COUNT(*) FROM employers e 
     WHERE CAST(e.businessNo AS CHAR) COLLATE utf8mb4_unicode_ci = (
         SELECT CAST(ep.id AS CHAR) COLLATE utf8mb4_unicode_ci 
         FROM employer_profiles ep 
         WHERE ep.user_id COLLATE utf8mb4_unicode_ci = @actual_user_id COLLATE utf8mb4_unicode_ci
     )) as employer_count,
    (SELECT COUNT(*) FROM jobs j 
     WHERE CAST(j.employerId AS CHAR) COLLATE utf8mb4_unicode_ci = (
         SELECT CAST(e.id AS CHAR) COLLATE utf8mb4_unicode_ci 
         FROM employers e 
         WHERE CAST(e.businessNo AS CHAR) COLLATE utf8mb4_unicode_ci = (
             SELECT CAST(ep.id AS CHAR) COLLATE utf8mb4_unicode_ci 
             FROM employer_profiles ep 
             WHERE ep.user_id COLLATE utf8mb4_unicode_ci = @actual_user_id COLLATE utf8mb4_unicode_ci
         )
     )) as job_count,
    (SELECT COUNT(*) FROM applications a 
     INNER JOIN jobs j ON CAST(a.jobId AS CHAR) COLLATE utf8mb4_unicode_ci = CAST(j.id AS CHAR) COLLATE utf8mb4_unicode_ci
     WHERE CAST(j.employerId AS CHAR) COLLATE utf8mb4_unicode_ci = (
         SELECT CAST(e.id AS CHAR) COLLATE utf8mb4_unicode_ci 
         FROM employers e 
         WHERE CAST(e.businessNo AS CHAR) COLLATE utf8mb4_unicode_ci = (
             SELECT CAST(ep.id AS CHAR) COLLATE utf8mb4_unicode_ci 
             FROM employer_profiles ep 
             WHERE ep.user_id COLLATE utf8mb4_unicode_ci = @actual_user_id COLLATE utf8mb4_unicode_ci
         )
     )) as application_count;
