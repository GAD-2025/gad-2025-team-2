-- WorkFair Test Data
-- 테스트용 고용주 및 구직자 데이터
-- 이 파일을 실행하여 개발/테스트용 데이터를 생성합니다

USE workfair;

-- 1. 테스트용 고용주 회원 생성 (기본 비밀번호: 123456)
-- SHA256('123456') = 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
INSERT INTO signup_users (id, role, name, phone, email, password, birthdate, gender, nationality_code, terms_tos_required, terms_privacy_required, created_at) VALUES
('employer-test-001', 'employer', '김사장', '010-1111-2222', 'employer1@test.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', NULL, NULL, 'KR', TRUE, TRUE, NOW()),
('employer-test-002', 'employer', '이대표', '010-3333-4444', 'employer2@test.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', NULL, NULL, 'KR', TRUE, TRUE, NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name), password=VALUES(password);

-- 2. 고용주 프로필 생성
INSERT INTO employer_profiles (id, user_id, business_type, company_name, address, address_detail, created_at, updated_at) VALUES
('emp-profile-001', 'employer-test-001', 'business', '왕십리 스타벅스', '서울 성동구 왕십리로 123', '1층', NOW(), NOW()),
('emp-profile-002', 'employer-test-002', 'business', '강남역 맛있는집', '서울 강남구 테헤란로 234', '지하 1층', NOW(), NOW())
ON DUPLICATE KEY UPDATE company_name=VALUES(company_name);

-- 3. 레거시 Employers 테이블 (Job과 연결용)
INSERT INTO employers (id, businessNo, shopName, industry, address, openHours, contact, minLanguageLevel, baseWage, schedule, rating) VALUES
('emp-001', 'emp-profile-001', '왕십리 스타벅스', '카페', '서울 성동구 왕십리로 123', '07:00-22:00', 'employer1@test.com', 'Lv.2 초급', 12000, '주 5일', 4.8),
('emp-002', 'emp-profile-002', '강남역 맛있는집', '음식점', '서울 강남구 테헤란로 234', '11:00-23:00', 'employer2@test.com', 'Lv.2 초급', 13000, '주 6일', 4.5)
ON DUPLICATE KEY UPDATE shopName=VALUES(shopName);

-- 4. 테스트용 구직자 회원 생성 (기본 비밀번호: 123456)
INSERT INTO signup_users (id, role, name, phone, email, password, birthdate, gender, nationality_code, terms_tos_required, terms_privacy_required, created_at) VALUES
('seeker-1', 'job_seeker', '소피아', '010-1234-5678', 'sophia@test.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '1998-05-10', 'female', 'UZ', TRUE, TRUE, NOW()),
('seeker-test-001', 'job_seeker', '수정', '010-5555-6666', 'sujung@test.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '1995-03-15', 'female', 'UZ', TRUE, TRUE, NOW()),
('seeker-test-002', 'job_seeker', '알렉스', '010-7777-8888', 'alex@test.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '1992-07-20', 'male', 'PH', TRUE, TRUE, NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name), password=VALUES(password);

-- 5. 구직자 프로필 생성
INSERT INTO job_seeker_profiles (id, user_id, preferred_regions, preferred_jobs, work_days_of_week, experience_career, created_at, updated_at) VALUES
('seeker-profile-1', 'seeker-1', '["용산구", "종로구"]', '["카페", "음식점"]', '["SAT", "SUN"]', '레스토랑 2년 근무 경험', NOW(), NOW()),
('seeker-profile-001', 'seeker-test-001', '["종로구", "성동구"]', '["카페", "음식점"]', '["SAT", "SUN"]', '카페 2년 근무 경험', NOW(), NOW()),
('seeker-profile-002', 'seeker-test-002', '["강남구", "서초구"]', '["편의점", "카페"]', '["MON", "TUE", "WED", "THU", "FRI"]', '편의점 1년 근무 경험', NOW(), NOW())
ON DUPLICATE KEY UPDATE preferred_regions=VALUES(preferred_regions);

-- 6. 레거시 JobSeekers 테이블 (Application과 연결용)
INSERT INTO jobseekers (id, name, nationality, phone, languageLevel, visaType, availability, experience, preferences) VALUES
(
    'seeker-1', 
    '소피아', 
    '우즈베키스탄', 
    '010-1234-5678', 
    'L1-2', 
    'C-4', 
    '주말 가능',
    '[{"role": "레스토랑", "years": 2, "description": "카페/커피전문점에서 2년간 바리스타 및 서빙 경험"}]',
    '{"skills": ["영어 가능", "스페인어 가능", "용산구 거주", "주말 근무 가능"], "introduction": "안녕하세요, 저는 소피아입니다. 한국 문화와 K-pop을 좋아해서 우즈베키스탄에서부터 한국어를 열심히 공부했습니다. 이전 레스토랑에서 서빙 아르바이트를 하며 손님들을 응대했고 주문을 받는 경험을 쌓았습니다. 밝고 긍정적인 성격이라 처음 보는 사람들과도 잘 어울리고 맡은 일은 적극적으로 꾸준하게 지키려는 편입니다. 빨리 일을 배워서 매장에 도움이 되는 성실한 직원이 되겠습니다. 잘 부탁드립니다!"}'
),
('seeker-001', '수정', '우즈베키스탄', '010-5555-6666', 'Lv.3 중급', 'C-4', '주말 가능', '[{"role": "카페", "years": 2}]', '{}'),
('seeker-002', '알렉스', '필리핀', '010-7777-8888', 'Lv.2 초급', 'F-4', '평일 가능', '[{"role": "편의점", "years": 1}]', '{}'),
(
    'seeker-003', 
    '마리아', 
    '베트남', 
    '010-2222-3333', 
    'Lv.4 상급', 
    'F-5', 
    '전일 가능',
    '[{"role": "음식점", "years": 3, "description": "한식당 홀 서빙 3년 경력"}]',
    '{"skills": ["한국어 능숙", "성실함", "장기근무 가능"], "introduction": "한국에서 3년간 일한 경험이 있습니다. 한국어 의사소통에 문제없고 성실하게 일합니다."}'
),
(
    'seeker-004', 
    '후안', 
    '필리핀', 
    '010-4444-5555', 
    'Lv.2 초급', 
    'E-9', 
    '평일 오전',
    '[{"role": "편의점", "years": 1}]',
    '{"skills": ["영어 가능", "평일 오전 가능"], "introduction": "성실하게 일하겠습니다. 영어로 의사소통 가능합니다."}'
)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 7. 학습 진도 데이터
INSERT INTO learning_progress (id, seekerId, currentLevel, completedLessons, totalLessons, progressPercent) VALUES
('progress-001', 'seeker-001', 'Lv.3 중급', 12, 20, 60),
('progress-002', 'seeker-002', 'Lv.2 초급', 8, 20, 40)
ON DUPLICATE KEY UPDATE progressPercent=VALUES(progressPercent);

-- 8. 공고 데이터 (5개)
INSERT INTO jobs (
    id, employerId, title, description, category, wage, workDays, workHours, 
    deadline, positions, requiredLanguage, requiredVisa, benefits, employerMessage,
    createdAt, status, views, applications, postedAt, location
) VALUES
(
    'job-test-001',
    'emp-001',
    '카페 바리스타 구인',
    '왕십리역 근처 스타벅스에서 함께 일할 바리스타를 모집합니다. 커피에 관심있고 친절하신 분을 찾습니다.',
    '카페',
    13000,
    '주 5일 (월-금)',
    '09:00-18:00',
    '2025-02-28T23:59:59Z',
    2,
    'Lv.2 초급',
    '["E-9", "H-2", "F-4"]',
    '커피 관련 자격증 우대, 영어 가능자 우대',
    '밝고 긍정적인 분위기의 매장입니다. 복지 좋아요!',
    NOW(),
    'active',
    45,
    3,
    NOW(),
    '서울 성동구'
),
(
    'job-test-002',
    'emp-002',
    '주방 보조 아르바이트',
    '강남역 맛있는집에서 주방 보조를 구합니다. 요리 경험 없어도 괜찮습니다!',
    '음식점',
    14000,
    '주 6일',
    '11:00-20:00',
    '2025-02-15T23:59:59Z',
    3,
    'Lv.1 기초',
    '["E-9", "H-2"]',
    '장기근무 가능자 우대',
    '식사 제공, 4대보험 가입 가능합니다.',
    NOW(),
    'active',
    67,
    8,
    NOW(),
    '서울 강남구'
),
(
    'job-test-003',
    'emp-001',
    '주말 알바 (토일만)',
    '주말에만 근무 가능한 단기 알바생을 찾습니다. 학생 환영!',
    '카페',
    12500,
    '주 2일 (토-일)',
    '10:00-19:00',
    '2025-03-10T23:59:59Z',
    1,
    'Lv.2 초급',
    '["F-4", "F-5", "F-6"]',
    '학생 환영, 장기근무 가능자 우대',
    '주말만 일하고 싶으신 분! 편한 분위기에서 일해요.',
    NOW(),
    'active',
    89,
    12,
    NOW(),
    '서울 성동구'
),
(
    'job-test-004',
    'emp-002',
    '홀 서빙 스태프',
    '강남역 맛있는집 홀 서빙 스태프를 모집합니다. 친절하고 밝은 분 환영합니다.',
    '음식점',
    13500,
    '주 5일 (협의가능)',
    '17:00-22:00',
    '2025-02-20T23:59:59Z',
    2,
    'Lv.3 중급',
    '["E-9", "H-2", "F-4", "F-5"]',
    '한국어 능숙자 우대, 서빙 경험자 우대',
    '저녁 시간대만 근무! 팁도 있어요. 분위기 좋은 매장입니다.',
    NOW(),
    'active',
    134,
    15,
    NOW(),
    '서울 강남구'
),
(
    'job-test-005',
    'emp-001',
    '오전 시간대 카페 알바',
    '오전에만 일할 수 있는 분을 찾습니다. 주부, 학생 모두 환영!',
    '카페',
    12000,
    '주 3일 (월수금)',
    '07:00-13:00',
    '2025-02-25T23:59:59Z',
    1,
    'Lv.2 초급',
    '["H-2", "F-4", "F-5", "F-6"]',
    '오전 시간대만 가능하신 분, 성실하신 분',
    '아침 일찍 시작해서 오후는 자유롭게! 조용한 오전 시간대입니다.',
    NOW(),
    'active',
    56,
    6,
    NOW(),
    '서울 성동구'
)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 완료 메시지
SELECT '============================================' as '';
SELECT '✅ 테스트 데이터가 성공적으로 생성되었습니다!' as message;
SELECT '============================================' as '';
SELECT '' as '';
SELECT '📋 생성된 데이터:' as '';
SELECT '- 고용주 계정: employer-test-001, employer-test-002' as info;
SELECT '- 구직자 계정: seeker-test-001, seeker-test-002' as info;
SELECT '- 공고 5개 생성 완료' as info;
SELECT '' as '';
SELECT '🌐 접속 정보:' as '';
SELECT '- 백엔드: http://localhost:8000' as info;
SELECT '- 프론트엔드: http://localhost:5173' as info;
SELECT '' as '';
SELECT '📝 다음 단계:' as '';
SELECT '1. 백엔드 서버 실행: cd backend && python -m uvicorn app.main:app --reload' as step;
SELECT '2. 프론트엔드 실행: cd frontend && npm run dev' as step;
SELECT '3. 구직자 페이지 접속: http://localhost:5173/jobseeker/home' as step;
SELECT '============================================' as '';

