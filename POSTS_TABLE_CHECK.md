# Posts 테이블 확인 및 수정 가이드

## ✅ 현재 상황

이미지에서 확인된 내용:
- `posts` 테이블이 **이미 존재**합니다
- 테이블에 **9개의 데이터**가 있습니다
- 테이블 구조가 올바른 것으로 보입니다

## 🔍 테이블 구조 확인

먼저 현재 테이블 구조를 정확히 확인하세요:

```sql
USE team2_db;

-- 테이블 구조 확인
DESCRIBE posts;

-- 또는 더 자세한 정보
SHOW CREATE TABLE posts;
```

## ⚠️ DROP TABLE을 실행하면 안 되는 경우

**기존 데이터를 보존하고 싶다면** `DROP TABLE`을 실행하지 마세요!

`DROP TABLE IF EXISTS posts;`를 실행하면:
- ❌ 기존 9개의 데이터가 **모두 삭제**됩니다
- ❌ 테이블이 삭제되고 새로 생성됩니다
- ❌ 데이터 복구가 불가능합니다

## ✅ 테이블 구조가 올바르다면

테이블 구조가 이미 올바르다면 (id가 VARCHAR(255), user_id가 VARCHAR(255) 등):
- **아무것도 할 필요가 없습니다!**
- 백엔드 서버만 재시작하면 됩니다
- `/api/posts` 엔드포인트가 정상 작동할 것입니다

## 🔧 테이블 구조를 수정해야 한다면

만약 테이블 구조에 문제가 있다면 (예: id가 INT인데 VARCHAR여야 함):

### 방법 1: ALTER TABLE 사용 (데이터 보존)
```sql
USE team2_db;

-- 예시: id 컬럼을 VARCHAR(255)로 변경 (데이터 보존)
ALTER TABLE posts MODIFY COLUMN id VARCHAR(255);

-- 예시: user_id 컬럼을 VARCHAR(255)로 변경
ALTER TABLE posts MODIFY COLUMN user_id VARCHAR(255) NOT NULL;

-- 예시: title 컬럼을 VARCHAR(500)로 변경
ALTER TABLE posts MODIFY COLUMN title VARCHAR(500) NOT NULL;
```

### 방법 2: DROP TABLE 사용 (데이터 삭제)
**주의: 이 방법은 모든 데이터를 삭제합니다!**

```sql
USE team2_db;

-- 기존 데이터 백업 (선택사항)
CREATE TABLE posts_backup AS SELECT * FROM posts;

-- 테이블 삭제 및 재생성
DROP TABLE IF EXISTS posts;

CREATE TABLE posts (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 📋 확인 체크리스트

1. **테이블 구조 확인**:
   ```sql
   USE team2_db;
   DESCRIBE posts;
   ```

2. **현재 구조가 올바른지 확인**:
   - `id`가 `VARCHAR(255)` 또는 `VARCHAR`인가?
   - `user_id`가 `VARCHAR(255)` 또는 `VARCHAR`인가?
   - `title`이 `VARCHAR(500)` 또는 `VARCHAR`인가?
   - `body`가 `TEXT`인가?
   - `created_at`이 `DATETIME`인가?

3. **구조가 올바르다면**:
   - ✅ **아무것도 할 필요 없습니다!**
   - 백엔드 서버만 재시작하세요

4. **구조가 올바르지 않다면**:
   - 기존 데이터를 보존하고 싶다면 → `ALTER TABLE` 사용
   - 기존 데이터를 삭제해도 된다면 → `DROP TABLE` 사용

## 🧪 테스트

테이블 구조 확인 후:

1. **백엔드 API 테스트**:
   ```
   http://localhost:8000/api/posts
   ```
   브라우저에서 열어서 응답 확인

2. **프론트엔드 테스트**:
   ```
   http://localhost:5173/posts
   ```
   접속하여 게시글 목록 확인

## 💡 권장 사항

**현재 테이블에 데이터가 있고 구조가 올바르다면:**
- ✅ **DROP TABLE을 실행하지 마세요!**
- ✅ 백엔드 서버만 재시작하세요
- ✅ `/api/posts` 엔드포인트를 테스트하세요

**테이블 구조에 문제가 있다면:**
- 먼저 `DESCRIBE posts;` 결과를 확인하세요
- 문제가 있는 컬럼만 `ALTER TABLE`로 수정하세요

