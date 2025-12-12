-- posts 테이블 재생성 (기존 데이터가 없다면)
USE team2_db;

-- 기존 테이블 삭제 (주의: 데이터가 모두 삭제됩니다!)
DROP TABLE IF EXISTS posts;

-- 새로 생성 (문자열 ID 사용)
CREATE TABLE posts (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
