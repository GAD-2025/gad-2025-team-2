# 데이터베이스 마이그레이션 가이드

## 1단계: applications 테이블에 필드 추가

MySQL 워크벤치에서 다음 SQL을 실행하세요:

```sql
-- applications 테이블에 필드 추가
ALTER TABLE applications 
ADD COLUMN interviewData TEXT NULL COMMENT '면접 제안 정보 (JSON)',
ADD COLUMN acceptanceData TEXT NULL COMMENT '합격 안내 정보 (JSON)',
ADD COLUMN coordinationMessages TEXT NULL COMMENT '조율 메시지 목록 (JSON 배열)',
ADD COLUMN firstWorkDateConfirmed VARCHAR(50) NULL COMMENT '채용 확정된 첫 출근 날짜 (YYYY-MM-DD)';
```

## 2단계: posts 테이블 생성 (아직 없다면)

MySQL 워크벤치에서 다음 SQL을 실행하세요:

```sql
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(50) PRIMARY KEY COMMENT '게시글 ID',
    user_id VARCHAR(50) NOT NULL COMMENT '작성자 ID (signup_users.id 참조)',
    title VARCHAR(255) NOT NULL COMMENT '제목',
    body TEXT NOT NULL COMMENT '본문 내용',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES signup_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='게시글 테이블';
```

## 확인 방법

마이그레이션이 성공했는지 확인:

```sql
-- applications 테이블 구조 확인
DESCRIBE applications;

-- posts 테이블 구조 확인
DESCRIBE posts;
```

## 롤백 (필요한 경우)

필드를 제거하려면:

```sql
-- applications 테이블에서 필드 제거
ALTER TABLE applications 
DROP COLUMN interviewData,
DROP COLUMN acceptanceData,
DROP COLUMN coordinationMessages,
DROP COLUMN firstWorkDateConfirmed;
```

## 주의사항

- 기존 데이터는 유지됩니다 (새 필드는 NULL로 시작)
- 마이그레이션 전에 데이터베이스 백업을 권장합니다
- 외래키 제약조건이 있는 경우 signup_users 테이블이 존재하는지 확인하세요
