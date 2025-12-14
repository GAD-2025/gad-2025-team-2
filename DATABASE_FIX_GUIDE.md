# 데이터베이스 수정 가이드

## 🔍 발견된 문제

### 1. 업직종 표시 문제
- **문제**: 구직자가 공고를 볼 때 업직종이 공고 제목이나 '기타'로 표시됨
- **원인**: 
  - `JobDetail.tsx`에서 `업직종`에 `job.title`을 표시하고 있음 (잘못됨)
  - `job.category`를 표시해야 함
- **해결**: 프론트엔드 코드 수정 완료 ✅

### 2. 급여 타입 표시 문제
- **문제**: 주급/월급으로 설정했는데도 항상 '시급'으로 표시됨
- **원인**: 
  - `jobs` 테이블에 `wage_type` 필드가 없음
  - 공고 등록 시 `wage_type`을 저장하지 않음
  - 프론트엔드에서 항상 '시급'으로 하드코딩되어 있음
- **해결**: 
  - 백엔드 모델/스키마에 `wage_type` 필드 추가 완료 ✅
  - 프론트엔드 표시 로직 수정 완료 ✅

## 📋 MySQL Workbench에서 수정할 필드

### `jobs` 테이블에 추가할 필드

```sql
ALTER TABLE jobs 
ADD COLUMN wage_type VARCHAR(20) DEFAULT 'hourly' 
COMMENT '급여 타입: hourly(시급), weekly(주급), monthly(월급)';
```

**필드 정보:**
- **필드명**: `wage_type`
- **타입**: `VARCHAR(20)`
- **기본값**: `'hourly'`
- **설명**: 급여 타입을 구분하는 필드
- **가능한 값**: `'hourly'`, `'weekly'`, `'monthly'`

### 기존 데이터 업데이트 (선택사항)

기존 공고들의 `wage_type`을 기본값으로 설정하려면:

```sql
UPDATE jobs 
SET wage_type = 'hourly' 
WHERE wage_type IS NULL OR wage_type = '';
```

## ✅ 수정 완료된 항목

1. ✅ `Job` 모델에 `wage_type` 필드 추가
2. ✅ `JobCreateRequest` 스키마에 `wage_type` 필드 추가
3. ✅ 공고 등록 시 `wage_type` 저장하도록 수정
4. ✅ 공고 조회 시 `wage_type` 반환하도록 수정
5. ✅ `JobCard`에서 `wage_type`에 따라 표시하도록 수정
6. ✅ `JobDetail`에서 `category`와 `wage_type` 표시 수정
7. ✅ `Job` 타입에 `wage_type` 필드 추가

## 🚀 다음 단계

1. **MySQL Workbench에서 실행:**
   ```sql
   ALTER TABLE jobs 
   ADD COLUMN wage_type VARCHAR(20) DEFAULT 'hourly';
   ```

2. **기존 공고 업데이트 (선택사항):**
   ```sql
   UPDATE jobs 
   SET wage_type = 'hourly' 
   WHERE wage_type IS NULL OR wage_type = '';
   ```

3. **테스트:**
   - 새 공고 등록 시 주급/월급 선택 후 저장
   - 구직자 화면에서 공고 확인
   - 업직종과 급여 타입이 올바르게 표시되는지 확인

