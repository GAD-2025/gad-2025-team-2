-- posts 테이블의 id 컬럼을 VARCHAR로 변경 (기존 데이터가 있다면)
USE team2_db;

-- 주의: 이 방법은 기존 데이터가 있을 때 복잡할 수 있습니다.
-- 1. 먼저 기존 데이터 확인
SELECT * FROM posts;

-- 2. 기존 데이터가 없다면:
--    DROP TABLE posts; 후 CREATE TABLE로 재생성하는 것이 더 간단합니다.

-- 3. 기존 데이터가 있다면:
--    임시 테이블로 데이터 백업 후 재생성하는 것이 안전합니다.


