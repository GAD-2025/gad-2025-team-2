-- WorkFair MySQL Database Schema
-- 생성일: 2024
-- 버전: 1.0

-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS workfair CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE workfair;

-- =============================================
-- 1. 국적 마스터 데이터 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS nationalities (
    code VARCHAR(10) PRIMARY KEY COMMENT '국가 코드 (예: KR, US)',
    name VARCHAR(100) NOT NULL COMMENT '국가명 (예: 대한민국 (South Korea))',
    phone_code VARCHAR(10) NOT NULL COMMENT '전화 국가번호 (예: +82)',
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='국적 마스터 데이터';

-- =============================================
-- 2. 회원 기본 정보 테이블 (구직자/고용주 공통)
-- =============================================
CREATE TABLE IF NOT EXISTS signup_users (
    id VARCHAR(50) PRIMARY KEY COMMENT '사용자 ID (예: employer-xxx, signup-xxx)',
    role VARCHAR(20) NOT NULL COMMENT '역할: job_seeker 또는 employer',
    name VARCHAR(100) NOT NULL COMMENT '이름',
    phone VARCHAR(20) NULL COMMENT '전화번호 (구직자 필수, 고용주 선택)',
    email VARCHAR(255) NULL COMMENT '이메일 (고용주 필수, 구직자 선택)',
    birthdate DATE NULL COMMENT '생년월일 (구직자 필수, 고용주 선택)',
    gender VARCHAR(10) NULL COMMENT '성별: male, female (구직자 필수, 고용주 선택)',
    nationality_code VARCHAR(10) NULL COMMENT '국적 코드',
    terms_tos_required BOOLEAN DEFAULT FALSE COMMENT '필수 약관 동의 (이용약관)',
    terms_privacy_required BOOLEAN DEFAULT FALSE COMMENT '필수 약관 동의 (개인정보처리)',
    terms_sms_optional BOOLEAN DEFAULT FALSE COMMENT '선택 약관 동의 (SMS)',
    terms_marketing_optional BOOLEAN DEFAULT FALSE COMMENT '선택 약관 동의 (마케팅)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    INDEX idx_role (role),
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    FOREIGN KEY (nationality_code) REFERENCES nationalities(code) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='회원 기본 정보';

-- =============================================
-- 3. 구직자 프로필 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS job_seeker_profiles (
    id VARCHAR(50) PRIMARY KEY COMMENT '프로필 ID',
    user_id VARCHAR(50) NOT NULL COMMENT 'signup_users.id 참조',
    basic_info_file_name VARCHAR(255) NULL COMMENT '기본 정보 파일명',
    preferred_regions TEXT NULL COMMENT '희망 근무 지역 (JSON 배열)',
    preferred_jobs TEXT NULL COMMENT '희망 직무 (JSON 배열)',
    work_available_dates TEXT NULL COMMENT '근무 가능 날짜 (JSON 배열, YYYY-MM-DD)',
    work_start_time VARCHAR(10) NULL COMMENT '근무 시작 시간 (HH:mm)',
    work_end_time VARCHAR(10) NULL COMMENT '근무 종료 시간 (HH:mm)',
    work_days_of_week TEXT NULL COMMENT '근무 요일 (JSON 배열, 예: ["MON","TUE"])',
    experience_sections TEXT NULL COMMENT '경력 섹션 (JSON 배열, 예: ["career","license"])',
    experience_career TEXT NULL COMMENT '경력 상세',
    experience_license TEXT NULL COMMENT '자격증 상세',
    experience_skills TEXT NULL COMMENT '기술 상세',
    experience_introduction TEXT NULL COMMENT '자기소개',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES signup_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='구직자 상세 프로필';

-- =============================================
-- 4. 고용주 프로필 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS employer_profiles (
    id VARCHAR(50) PRIMARY KEY COMMENT '프로필 ID',
    user_id VARCHAR(50) NOT NULL COMMENT 'signup_users.id 참조',
    business_type VARCHAR(20) NOT NULL COMMENT '사업자 유형: business(사업자) 또는 individual(개인)',
    company_name VARCHAR(200) NOT NULL COMMENT '회사명',
    address VARCHAR(500) NOT NULL COMMENT '주소',
    address_detail VARCHAR(200) NULL COMMENT '상세 주소',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    INDEX idx_user_id (user_id),
    INDEX idx_company_name (company_name),
    FOREIGN KEY (user_id) REFERENCES signup_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='고용주 상세 프로필';

-- =============================================
-- 5. 고용주 테이블 (레거시, Job 연결용)
-- =============================================
CREATE TABLE IF NOT EXISTS employers (
    id VARCHAR(50) PRIMARY KEY COMMENT '고용주 ID',
    businessNo VARCHAR(100) NOT NULL COMMENT '사업자 번호',
    shopName VARCHAR(200) NOT NULL COMMENT '상호명',
    industry VARCHAR(100) NOT NULL COMMENT '업종',
    address VARCHAR(500) NOT NULL COMMENT '주소',
    location TEXT NULL COMMENT '위치 정보 (JSON GeoPoint)',
    openHours VARCHAR(100) NOT NULL COMMENT '운영시간',
    contact VARCHAR(100) NOT NULL COMMENT '연락처',
    media TEXT NULL COMMENT '미디어 URL (JSON 배열)',
    minLanguageLevel VARCHAR(50) NOT NULL COMMENT '최소 언어 수준',
    needVisa TEXT NULL COMMENT '필요 비자 (JSON 배열)',
    baseWage INT NOT NULL COMMENT '기본 급여',
    schedule VARCHAR(200) NOT NULL COMMENT '일정',
    rating DECIMAL(3,2) NULL COMMENT '평점 (1.00-5.00)',
    INDEX idx_industry (industry),
    INDEX idx_shopName (shopName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='고용주 정보 (레거시)';

-- =============================================
-- 6. 공고 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(50) PRIMARY KEY COMMENT '공고 ID',
    employerId VARCHAR(50) NOT NULL COMMENT 'employers.id 참조',
    title VARCHAR(200) NOT NULL COMMENT '공고 제목',
    description TEXT NOT NULL COMMENT '공고 설명',
    category VARCHAR(100) NOT NULL COMMENT '업종/카테고리',
    wage INT NOT NULL COMMENT '시급',
    workDays VARCHAR(100) NOT NULL COMMENT '근무 요일',
    workHours VARCHAR(100) NOT NULL COMMENT '근무 시간',
    deadline VARCHAR(50) NOT NULL COMMENT '마감일 (ISO8601)',
    positions INT NOT NULL COMMENT '모집 인원',
    requiredLanguage VARCHAR(50) NOT NULL COMMENT '요구 언어 수준',
    requiredVisa TEXT NULL COMMENT '요구 비자 (JSON 배열)',
    benefits TEXT NULL COMMENT '우대 사항',
    employerMessage TEXT NULL COMMENT '사장님 한마디',
    createdAt VARCHAR(50) NOT NULL COMMENT '생성일시 (ISO8601)',
    status VARCHAR(20) DEFAULT 'active' COMMENT '공고 상태: active, paused, closed',
    views INT DEFAULT 0 COMMENT '조회수',
    applications INT DEFAULT 0 COMMENT '지원자 수',
    postedAt VARCHAR(50) NULL COMMENT '등록일시 (ISO8601)',
    location VARCHAR(200) NULL COMMENT '근무지 (간단 주소)',
    INDEX idx_employer (employerId),
    INDEX idx_category (category),
    INDEX idx_deadline (deadline),
    INDEX idx_status (status),
    FOREIGN KEY (employerId) REFERENCES employers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='채용 공고';

-- =============================================
-- 7. 구직자 테이블 (레거시)
-- =============================================
CREATE TABLE IF NOT EXISTS jobseekers (
    id VARCHAR(50) PRIMARY KEY COMMENT '구직자 ID',
    name VARCHAR(100) NOT NULL COMMENT '이름',
    nationality VARCHAR(50) NOT NULL COMMENT '국적',
    phone VARCHAR(20) NOT NULL COMMENT '전화번호',
    languageLevel VARCHAR(50) NOT NULL COMMENT '언어 수준',
    visaType VARCHAR(50) NOT NULL COMMENT '비자 유형',
    availability VARCHAR(100) NOT NULL COMMENT '근무 가능 시간',
    location TEXT NULL COMMENT '위치 정보 (JSON GeoPoint)',
    experience TEXT NULL COMMENT '경력 (JSON 배열)',
    preferences TEXT NULL COMMENT '선호 사항 (JSON 객체)',
    INDEX idx_nationality (nationality),
    INDEX idx_visaType (visaType)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='구직자 정보 (레거시)';

-- =============================================
-- 8. 지원 내역 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS applications (
    applicationId VARCHAR(50) PRIMARY KEY COMMENT '지원 ID',
    seekerId VARCHAR(50) NOT NULL COMMENT 'jobseekers.id 참조',
    jobId VARCHAR(50) NOT NULL COMMENT 'jobs.id 참조',
    status VARCHAR(20) DEFAULT 'applied' COMMENT '상태: applied, hired, rejected',
    appliedAt VARCHAR(50) NOT NULL COMMENT '지원일시 (ISO8601)',
    updatedAt VARCHAR(50) NOT NULL COMMENT '수정일시 (ISO8601)',
    hiredAt VARCHAR(50) NULL COMMENT '채용일시 (ISO8601)',
    INDEX idx_seeker (seekerId),
    INDEX idx_job (jobId),
    INDEX idx_status (status),
    FOREIGN KEY (seekerId) REFERENCES jobseekers(id) ON DELETE CASCADE,
    FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='지원 내역';

-- =============================================
-- 9. 대화방 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(50) PRIMARY KEY COMMENT '대화방 ID',
    participants TEXT NULL COMMENT '참여자 ID 목록 (JSON 배열)',
    updatedAt VARCHAR(50) NOT NULL COMMENT '마지막 업데이트 (ISO8601)',
    INDEX idx_updatedAt (updatedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='대화방';

-- =============================================
-- 10. 메시지 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(50) PRIMARY KEY COMMENT '메시지 ID',
    conversationId VARCHAR(50) NOT NULL COMMENT 'conversations.id 참조',
    senderId VARCHAR(50) NOT NULL COMMENT '발신자 ID',
    text TEXT NOT NULL COMMENT '메시지 내용',
    translatedText TEXT NULL COMMENT '번역된 메시지',
    timestamp VARCHAR(50) NOT NULL COMMENT '전송일시 (ISO8601)',
    `read` BOOLEAN DEFAULT FALSE COMMENT '읽음 여부',
    INDEX idx_conversation (conversationId),
    INDEX idx_sender (senderId),
    INDEX idx_timestamp (timestamp),
    FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='메시지';

-- =============================================
-- 11. 학습 진도 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS learning_progress (
    id VARCHAR(50) PRIMARY KEY COMMENT '진도 ID',
    seekerId VARCHAR(50) NOT NULL COMMENT 'jobseekers.id 참조',
    currentLevel VARCHAR(50) NOT NULL COMMENT '현재 레벨',
    completedLessons INT DEFAULT 0 COMMENT '완료한 레슨 수',
    totalLessons INT DEFAULT 100 COMMENT '전체 레슨 수',
    progressPercent INT DEFAULT 0 COMMENT '진도율 (%)',
    INDEX idx_seeker (seekerId),
    FOREIGN KEY (seekerId) REFERENCES jobseekers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='학습 진도';

-- =============================================
-- 12. 사용자 인증 테이블 (레거시)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY COMMENT '사용자 ID',
    email VARCHAR(255) NOT NULL UNIQUE COMMENT '이메일',
    hashedPassword VARCHAR(255) NOT NULL COMMENT '해시된 비밀번호',
    role VARCHAR(20) NOT NULL COMMENT '역할: jobseeker, employer',
    profileId VARCHAR(50) NOT NULL COMMENT '프로필 ID (JobSeeker.id 또는 Employer.id)',
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 인증 정보 (레거시)';

-- =============================================
-- 국적 데이터 초기 삽입
-- =============================================
INSERT INTO nationalities (code, name, phone_code) VALUES
('KR', '대한민국 (South Korea)', '+82'),
('US', 'United States', '+1'),
('CA', 'Canada', '+1'),
('JP', '日本 (Japan)', '+81'),
('CN', '中国 (China)', '+86'),
('VN', 'Việt Nam (Vietnam)', '+84'),
('TH', 'ประเทศไทย (Thailand)', '+66'),
('PH', 'Philippines', '+63'),
('ID', 'Indonesia', '+62'),
('MY', 'Malaysia', '+60'),
('SG', 'Singapore', '+65'),
('TW', '台灣 (Taiwan)', '+886'),
('HK', '香港 (Hong Kong)', '+852'),
('MO', '澳門 (Macau)', '+853'),
('IN', 'India', '+91'),
('BD', 'Bangladesh', '+880'),
('PK', 'Pakistan', '+92'),
('NP', 'Nepal', '+977'),
('LK', 'Sri Lanka', '+94'),
('MM', 'Myanmar', '+95'),
('KH', 'Cambodia', '+855'),
('LA', 'Laos', '+856'),
('MN', 'Mongolia', '+976'),
('KZ', 'Kazakhstan', '+7'),
('UZ', 'Uzbekistan', '+998'),
('RU', 'Russia', '+7'),
('AU', 'Australia', '+61'),
('NZ', 'New Zealand', '+64'),
('GB', 'United Kingdom', '+44'),
('FR', 'France', '+33'),
('DE', 'Germany', '+49')
ON DUPLICATE KEY UPDATE name=VALUES(name), phone_code=VALUES(phone_code);

-- =============================================
-- 스키마 정보
-- =============================================
-- 회원가입 플로우:
-- 1. 구직자 회원가입:
--    - signup_users 테이블에 기본 정보 저장 (이름, 전화, 생년월일, 성별, 국적)
--    - job_seeker_profiles 테이블에 온보딩 정보 저장 (희망 지역, 직무, 근무 시간, 경력)
--
-- 2. 고용주 회원가입:
--    - signup_users 테이블에 기본 정보 저장 (이름, 이메일)
--    - employer_profiles 테이블에 회사 정보 저장 (사업자 유형, 회사명, 주소)
--
-- 3. 공고 등록:
--    - employers 테이블에 고용주 정보 자동 생성
--    - jobs 테이블에 공고 정보 저장
-- =============================================

