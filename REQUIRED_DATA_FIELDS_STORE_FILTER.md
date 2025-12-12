# 가게별 공고 필터링 기능 - 필요한 데이터 필드

## 📋 데이터베이스 필드 추가

### 1. `jobs` 테이블에 추가할 필드

```sql
ALTER TABLE jobs 
ADD COLUMN store_id VARCHAR(255) NULL 
COMMENT '매장 ID (stores.id 참조)';
```

**필드 정보:**
- **필드명**: `store_id`
- **타입**: `VARCHAR(255)`
- **NULL 허용**: `YES` (기존 공고는 NULL 가능)
- **설명**: 매장 ID를 저장하여 가게별 공고 필터링 가능
- **외래키**: `stores.id` 참조 (선택사항)

### 2. 기존 데이터 업데이트 (선택사항)

기존 공고에 `store_id`를 설정하려면:

```sql
USE team2_db;

-- shop_name과 일치하는 매장 찾아서 store_id 업데이트
UPDATE jobs j
INNER JOIN stores s ON j.shop_name = s.store_name
SET j.store_id = s.id
WHERE j.store_id IS NULL;
```

## 📊 관련 테이블 구조

### `stores` 테이블 (이미 존재)
- `id` (VARCHAR(255), PRIMARY KEY) - 매장 ID
- `user_id` (VARCHAR(255)) - 고용주 ID
- `store_name` (VARCHAR) - 매장명
- `is_main` (BOOLEAN) - 대표 매장 여부
- 기타 매장 정보 필드들

### `jobs` 테이블 (수정됨)
- `id` (VARCHAR(255), PRIMARY KEY) - 공고 ID
- `employerId` (VARCHAR(255)) - 고용주 ID
- `store_id` (VARCHAR(255), NULL) - **새로 추가된 필드**
- `shop_name` (VARCHAR, NULL) - 매장명 (기존 필드)
- 기타 공고 정보 필드들

## 🔄 데이터 흐름

1. **공고 등록 시:**
   - 사용자가 매장 선택 → `selectedStore.id` 저장
   - `JobCreateRequest`에 `store_id` 포함
   - `jobs` 테이블에 `store_id` 저장

2. **공고 조회 시:**
   - `GET /jobs?store_id={store_id}` 파라미터로 필터링
   - `store_id`가 NULL이면 모든 공고 조회

3. **가게별 필터링:**
   - 프론트엔드에서 매장 목록 조회 (`GET /employer/stores/{user_id}`)
   - 선택한 매장의 `id`로 공고 필터링

## ✅ 구현 완료 사항

1. ✅ `Job` 모델에 `store_id` 필드 추가
2. ✅ `JobCreateRequest` 스키마에 `store_id` 필드 추가
3. ✅ 공고 생성 시 `store_id` 저장
4. ✅ 공고 조회 API에 `store_id` 필터 파라미터 추가
5. ✅ 공고 조회 응답에 `store_id` 포함
6. ✅ 프론트엔드 `JobCreate`에서 `store_id` 전송
7. ✅ 프론트엔드 `JobManagement`에 가게별 드롭다운 추가
8. ✅ 매장 목록 조회 및 필터링 로직 구현

## 🚀 다음 단계

1. **MySQL Workbench에서 실행:**
   ```sql
   USE team2_db;
   ALTER TABLE jobs 
   ADD COLUMN store_id VARCHAR(255) NULL 
   COMMENT '매장 ID (stores.id 참조)';
   ```

2. **백엔드 서버 재시작:**
   - 변경사항 반영을 위해 백엔드 서버 재시작

3. **테스트:**
   - 새 공고 등록 시 매장 선택 확인
   - 공고 관리 페이지에서 가게별 필터링 테스트
