-- WorkFair MySQL Database Schema
-- 작성일: 2025-01-04
-- 버전: 2.0 (Application flow support)

-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS workfair CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE workfair;

-- =============================================
-- 1. 국적 마스터 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS nationalities (
    code VARCHAR(10) PRIMARY KEY COMMENT '국적 코드 (예: KR, US)',
    name VARCHAR(100) NOT NULL COMMENT '국적명 (예: 대한민국(South Korea))',
    phone_code VARCHAR(10) NOT NULL COMMENT '전화 국가번호 (예: +82)',
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='국적 마스터 테이블';

-- =============================================
-- 2. 회원 기본 테이블(구직자/고용주 공용)
-- =============================================
CREATE TABLE IF NOT EXISTS signup_users (
    id VARCHAR(50) PRIMARY KEY COMMENT '사용자ID (예: employer-xxx, signup-xxx)',
    role VARCHAR(20) NOT NULL COMMENT '역할: job_seeker 또는 employer',
    name VARCHAR(100) NOT NULL COMMENT '이름',
    phone VARCHAR(20) NULL COMMENT '전화번호 (고용주 선택, 구직자 필수)',
    email VARCHAR(255) NULL COMMENT '이메일(구직자 선택, 고용주 필수)',
    password VARCHAR(255) NULL COMMENT '비밀번호 (해시)',
    birthdate DATE NULL COMMENT '생년월일 (고용주 선택, 구직자 필수)',
    gender VARCHAR(10) NULL COMMENT '성별: male, female (고용주 선택, 구직자 필수)',
    nationality_code VARCHAR(10) NULL COMMENT '국적 코드',
    terms_tos_required BOOLEAN DEFAULT FALSE COMMENT '필수 약관 동의 (이용약관)',
    terms_privacy_required BOOLEAN DEFAULT FALSE COMMENT '필수 약관 동의 (개인정보처리)',
    terms_sms_optional BOOLEAN DEFAULT FALSE COMMENT '선택 약관 동의 (SMS)',
    terms_marketing_optional BOOLEAN DEFAULT FALSE COMMENT '선택 약관 동의 (마케팅)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성시각',
    INDEX idx_role (role),
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    FOREIGN KEY (nationality_code) REFERENCES nationalities(code) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='회원 기본 정보 테이블';

-- =============================================
-- 3. 구직자 프로필 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS job_seeker_profiles (
    id VARCHAR(50) PRIMARY KEY COMMENT '프로필ID',
    user_id VARCHAR(50) NOT NULL COMMENT 'signup_users.id 참조',
    basic_info_file_name VARCHAR(255) NULL COMMENT '기본정보 파일명',
    preferred_regions TEXT NULL COMMENT '선호 지역 JSON 배열',
    preferred_jobs TEXT NULL COMMENT '선호 직종 JSON 배열',
    work_available_dates TEXT NULL COMMENT '근무 가능 날짜 JSON 배열 (YYYY-MM-DD)',
    work_start_time VARCHAR(10) NULL COMMENT '근무 시작 시간 (HH:mm)',
    work_end_time VARCHAR(10) NULL COMMENT '근무 종료 시간 (HH:mm)',
    work_days_of_week TEXT NULL COMMENT '근무 요일 JSON 배열 (예: ["MON", "TUE"])',
    experience_sections TEXT NULL COMMENT '경력 섹션 JSON 배열 (예: ["career", "license"])',
    experience_career TEXT NULL COMMENT '경력 정보',
    experience_license TEXT NULL COMMENT '자격증 정보',
    experience_skills TEXT NULL COMMENT '스킬 정보',
    experience_introduction TEXT NULL COMMENT '자기소개',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성시각',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정시각',
    FOREIGN KEY (user_id) REFERENCES signup_users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='구직자 프로필 테이블';

-- =============================================
-- 4. 고용주 프로필 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS employer_profiles (
    id VARCHAR(50) PRIMARY KEY COMMENT '프로필ID',
    user_id VARCHAR(50) NOT NULL COMMENT 'signup_users.id 참조',
    business_type VARCHAR(20) NOT NULL COMMENT '사업자 유형: business 또는 individual',
    company_name VARCHAR(200) NOT NULL COMMENT '회사/상호명',
    address VARCHAR(500) NOT NULL COMMENT '주소',
    address_detail VARCHAR(500) NULL COMMENT '상세 주소',
    business_license VARCHAR(255) NULL COMMENT '사업자등록증 파일명 또는 URL',
    is_verified BOOLEAN DEFAULT FALSE COMMENT '인증 여부',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성시각',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정시각',
    FOREIGN KEY (user_id) REFERENCES signup_users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='고용주 프로필 테이블';

-- =============================================
-- 4-1. 매장(가게) 테이블 (고용주 매장 관리)
-- =============================================
CREATE TABLE IF NOT EXISTS stores (
    id VARCHAR(50) PRIMARY KEY COMMENT '매장ID',
    user_id VARCHAR(50) NOT NULL COMMENT 'signup_users.id 참조 (고용주)',
    is_main BOOLEAN DEFAULT FALSE COMMENT '대표가게 여부 (기본매장)',
    store_name VARCHAR(200) NOT NULL COMMENT '매장명',
    address VARCHAR(500) NOT NULL COMMENT '주소',
    address_detail VARCHAR(500) NULL COMMENT '상세 주소',
    phone VARCHAR(20) NOT NULL COMMENT '전화번호',
    industry VARCHAR(100) NOT NULL COMMENT '업종',
    business_license VARCHAR(255) NULL COMMENT '사업자등록증 파일명 또는 URL',
    management_role VARCHAR(50) NOT NULL COMMENT '관리 역할: 본사 관리자, 지점 관리자',
    store_type VARCHAR(50) NOT NULL COMMENT '매장 유형: 직영점, 가맹점, 개인·독립 매장',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성시각',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정시각',
    FOREIGN KEY (user_id) REFERENCES signup_users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_main (is_main),
    INDEX idx_user_main (user_id, is_main)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='매장(가게) 테이블';

-- =============================================
-- 5. 구직자 테이블 (레거시 호환용)
-- =============================================
CREATE TABLE IF NOT EXISTS jobseekers (
    id VARCHAR(50) PRIMARY KEY COMMENT '구직자ID',
    name VARCHAR(100) NOT NULL COMMENT '이름',
    nationality VARCHAR(50) NOT NULL COMMENT '국적',
    phone VARCHAR(20) NOT NULL COMMENT '전화번호',
    languageLevel VARCHAR(50) NOT NULL COMMENT '언어 능력',
    visaType VARCHAR(50) NOT NULL COMMENT '비자 타입',
    availability VARCHAR(200) NOT NULL COMMENT '근무 가능 시간',
    location VARCHAR(255) NULL COMMENT '위치 정보 JSON',
    experience TEXT NULL COMMENT '경력 정보 JSON',
    preferences TEXT NULL COMMENT '선호사항 JSON',
    INDEX idx_nationality (nationality),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='구직자 테이블 (레거시)';

-- =============================================
-- 6. 고용주 테이블 (레거시 호환용)
-- =============================================
CREATE TABLE IF NOT EXISTS employers (
    id VARCHAR(50) PRIMARY KEY COMMENT '고용주ID',
    businessNo VARCHAR(50) NOT NULL COMMENT '사업자등록번호',
    shopName VARCHAR(200) NOT NULL COMMENT '상호명',
    industry VARCHAR(100) NOT NULL COMMENT '업종',
    address VARCHAR(500) NOT NULL COMMENT '주소',
    location VARCHAR(255) NULL COMMENT '위치 정보 JSON',
    openHours VARCHAR(200) NOT NULL COMMENT '영업시간',
    contact VARCHAR(50) NOT NULL COMMENT '연락처',
    media TEXT NULL COMMENT '미디어 URL JSON 배열',
    minLanguageLevel VARCHAR(50) NOT NULL COMMENT '최소 언어 능력',
    needVisa TEXT NULL COMMENT '필요 비자 JSON 배열',
    baseWage INT NOT NULL COMMENT '기본 시급',
    schedule VARCHAR(200) NOT NULL COMMENT '스케줄',
    rating FLOAT NULL COMMENT '평점',
    INDEX idx_shopName (shopName),
    INDEX idx_industry (industry)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='고용주 테이블 (레거시)';

-- =============================================
-- 7. 채용 공고 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(50) PRIMARY KEY COMMENT '공고ID',
    employerId VARCHAR(50) NOT NULL COMMENT '고용주ID (employers.id 참조)',
    title VARCHAR(200) NOT NULL COMMENT '공고 제목',
    description TEXT NOT NULL COMMENT '공고 설명',
    category VARCHAR(100) NOT NULL COMMENT '업직종',
    wage INT NOT NULL COMMENT '시급',
    workDays VARCHAR(200) NOT NULL COMMENT '근무 요일',
    workHours VARCHAR(200) NOT NULL COMMENT '근무 시간',
    deadline VARCHAR(50) NOT NULL COMMENT '마감일 (ISO8601)',
    positions INT NOT NULL COMMENT '모집 인원',
    requiredLanguage VARCHAR(50) NOT NULL COMMENT '필요 언어 능력',
    requiredVisa TEXT NULL COMMENT '필요 비자 JSON 배열',
    benefits TEXT NULL COMMENT '혜택',
    employerMessage TEXT NULL COMMENT '사장님의 한마디',
    createdAt VARCHAR(50) NOT NULL COMMENT '생성일시 (ISO8601)',
    status VARCHAR(20) DEFAULT 'active' COMMENT '상태: active, paused, closed',
    views INT DEFAULT 0 COMMENT '조회수',
    applications INT DEFAULT 0 COMMENT '지원자 수',
    postedAt VARCHAR(50) NULL COMMENT '게시일시 (ISO8601)',
    location VARCHAR(500) NULL COMMENT '위치 (주소)',
    shop_name VARCHAR(200) NULL COMMENT '가게 이름',
    shop_address VARCHAR(500) NULL COMMENT '가게 주소',
    shop_address_detail VARCHAR(500) NULL COMMENT '가게 상세 주소',
    shop_phone VARCHAR(20) NULL COMMENT '가게 전화번호',
    INDEX idx_employerId (employerId),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_location (location(255)),
    FOREIGN KEY (employerId) REFERENCES employers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='채용 공고 테이블';

-- =============================================
-- 8. 지원 내역 테이블 (핵심)
-- =============================================
CREATE TABLE IF NOT EXISTS applications (
    applicationId VARCHAR(50) PRIMARY KEY COMMENT '지원ID',
    seekerId VARCHAR(50) NOT NULL COMMENT '구직자ID (jobseekers.id 참조)',
    jobId VARCHAR(50) NOT NULL COMMENT '공고ID (jobs.id 참조)',
    status VARCHAR(20) DEFAULT 'applied' COMMENT '상태: applied, pending, reviewed, accepted, rejected, hired',
    appliedAt VARCHAR(50) NOT NULL COMMENT '지원일시 (ISO8601)',
    updatedAt VARCHAR(50) NOT NULL COMMENT '수정일시 (ISO8601)',
    hiredAt VARCHAR(50) NULL COMMENT '채용 확정일시 (ISO8601)',
    INDEX idx_seekerId (seekerId),
    INDEX idx_jobId (jobId),
    INDEX idx_status (status),
    INDEX idx_appliedAt (appliedAt),
    UNIQUE KEY unique_seeker_job (seekerId, jobId) COMMENT '중복 지원 방지',
    FOREIGN KEY (seekerId) REFERENCES jobseekers(id) ON DELETE CASCADE,
    FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='지원 내역 테이블';

-- =============================================
-- 9. 대화 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(50) PRIMARY KEY COMMENT '대화ID',
    participants TEXT NOT NULL COMMENT '참여자 ID JSON 배열',
    updatedAt VARCHAR(50) NOT NULL COMMENT '최근 업데이트일시 (ISO8601)',
    INDEX idx_updatedAt (updatedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='대화 테이블';

-- =============================================
-- 10. 메시지 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(50) PRIMARY KEY COMMENT '메시지ID',
    conversationId VARCHAR(50) NOT NULL COMMENT '대화ID (conversations.id 참조)',
    senderId VARCHAR(50) NOT NULL COMMENT '발신자ID',
    text TEXT NOT NULL COMMENT '메시지 내용',
    translatedText TEXT NULL COMMENT '번역된 내용',
    timestamp VARCHAR(50) NOT NULL COMMENT '발신일시 (ISO8601)',
    read BOOLEAN DEFAULT FALSE COMMENT '읽음 여부',
    INDEX idx_conversationId (conversationId),
    INDEX idx_timestamp (timestamp),
    INDEX idx_senderId (senderId),
    FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='메시지 테이블';

-- =============================================
-- 11. 학습 진행도 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS learning_progress (
    id VARCHAR(50) PRIMARY KEY COMMENT '진행도ID',
    seekerId VARCHAR(50) NOT NULL COMMENT '구직자ID (jobseekers.id 참조)',
    currentLevel VARCHAR(50) NOT NULL COMMENT '현재 레벨',
    completedLessons INT DEFAULT 0 COMMENT '완료한 레슨 수',
    totalLessons INT DEFAULT 100 COMMENT '전체 레슨 수',
    progressPercent INT DEFAULT 0 COMMENT '진행률 (%)',
    INDEX idx_seekerId (seekerId),
    FOREIGN KEY (seekerId) REFERENCES jobseekers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='학습 진행도 테이블';

-- =============================================
-- 12. 사용자 인증 테이블 (레거시 호환용)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY COMMENT '사용자ID',
    email VARCHAR(255) NOT NULL UNIQUE COMMENT '이메일',
    hashedPassword VARCHAR(255) NOT NULL COMMENT '해시된 비밀번호',
    role VARCHAR(20) NOT NULL COMMENT '역할: jobseeker 또는 employer',
    profileId VARCHAR(50) NOT NULL COMMENT '프로필ID (jobseekers.id 또는 employers.id 참조)',
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 인증 테이블 (레거시)';

-- =============================================
-- 뷰 생성: 구직자 지원 현황 조회용
-- =============================================
CREATE OR REPLACE VIEW v_jobseeker_applications AS
SELECT 
    a.applicationId,
    a.seekerId,
    a.jobId,
    a.status,
    a.appliedAt,
    a.updatedAt,
    a.hiredAt,
    j.title AS jobTitle,
    j.shop_name AS shopName,
    j.wage,
    j.location,
    j.category,
    j.workDays,
    j.workHours,
    j.employerId,
    e.shopName AS employerShopName
FROM applications a
INNER JOIN jobs j ON a.jobId = j.id
LEFT JOIN employers e ON j.employerId = e.id;

-- =============================================
-- 뷰 생성: 고용주 지원자 목록 조회용
-- =============================================
CREATE OR REPLACE VIEW v_employer_applicants AS
SELECT 
    a.applicationId,
    a.seekerId,
    a.jobId,
    a.status,
    a.appliedAt,
    a.updatedAt,
    a.hiredAt,
    js.id AS jobseekerId,
    js.name,
    js.nationality,
    js.phone,
    js.languageLevel,
    js.visaType,
    js.experience,
    js.preferences,
    j.title AS jobTitle,
    j.employerId,
    j.category
FROM applications a
INNER JOIN jobseekers js ON a.seekerId = js.id
INNER JOIN jobs j ON a.jobId = j.id;

-- =============================================
-- 인덱스 추가 최적화
-- =============================================
-- 지원 내역 조회 성능 향상
CREATE INDEX idx_applications_seeker_status ON applications(seekerId, status);
CREATE INDEX idx_applications_job_status ON applications(jobId, status);
CREATE INDEX idx_applications_applied_at_desc ON applications(appliedAt DESC);

-- 공고 조회 성능 향상
CREATE INDEX idx_jobs_employer_status ON jobs(employerId, status);
CREATE INDEX idx_jobs_category_location ON jobs(category, location(255));


