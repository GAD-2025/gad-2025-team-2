-- posts 테이블 마이그레이션 (데이터 보존)
USE team2_db;

-- 1단계: 백업 테이블 생성
CREATE TABLE posts_backup AS SELECT * FROM posts;

-- 2단계: 기존 테이블 삭제
DROP TABLE IF EXISTS posts;

-- 3단계: 새 테이블 생성 (VARCHAR(255) id 사용)
CREATE TABLE posts (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4단계: 백업에서 데이터 복원
-- id가 정수였다면 문자열로 변환, 이미 문자열이었다면 그대로 사용
INSERT INTO posts (id, user_id, title, body, created_at)
SELECT 
    CONCAT('post-', id) as id,  -- 정수 id를 문자열로 변환 (예: 1 -> 'post-1')
    user_id,
    title,
    body,
    created_at
FROM posts_backup;

-- 5단계: 복원 확인
SELECT * FROM posts;

-- 6단계: 확인 후 백업 테이블 삭제 (선택사항)
-- DROP TABLE IF EXISTS posts_backup;
