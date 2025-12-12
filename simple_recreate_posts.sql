-- 간단한 방법: 데이터 삭제하고 새로 시작
USE team2_db;

-- 기존 테이블 삭제 (데이터 모두 삭제됨!)
DROP TABLE IF EXISTS posts;

-- 새 테이블 생성
CREATE TABLE posts (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
