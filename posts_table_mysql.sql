-- Posts 테이블 생성 SQL (MySQL)
-- MySQL Workbench에서 실행하세요

-- 데이터베이스 선택 (배포 서버의 실제 데이터베이스 이름으로 변경하세요)
-- USE workfair;  -- 주석을 해제하고 실제 데이터베이스 이름으로 변경하세요

-- 또는 MySQL Workbench에서 왼쪽 Schemas 패널에서 데이터베이스를 더블클릭하여 선택하세요

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테스트 데이터 삽입 (선택사항)
INSERT INTO posts (user_id, title, body) VALUES
('employer-test-001', '첫 번째 게시글', '이것은 첫 번째 게시글의 내용입니다.'),
('employer-test-001', '두 번째 게시글', '이것은 두 번째 게시글의 내용입니다.'),
('employer-test-002', '세 번째 게시글', '이것은 세 번째 게시글의 내용입니다.');

