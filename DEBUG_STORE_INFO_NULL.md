# 매장 정보가 NULL로 저장되는 문제 진단

## 🔍 현재 상황

데이터베이스 쿼리 결과:
- `shop_name`: NULL
- `shop_address`: NULL
- `store_id`: NULL

## 📋 확인해야 할 사항

### 1. 기존 공고 vs 새 공고
**중요**: 이미지에 보이는 공고들(`job-32f47b15`, `job-a816ea17`)은 **수정 전에 등록된 공고**일 수 있습니다.

**해결 방법**: 새로운 공고를 등록해서 테스트해야 합니다.

### 2. 백엔드 로그 확인
백엔드 서버 터미널에서 다음 로그를 확인하세요:

```
[DEBUG] create_job - 받은 매장 정보:
  shop_name: 매장명 (또는 None)
  shop_address: 주소 (또는 None)
  store_id: store-id (또는 None)
[DEBUG] create_job - 저장할 Job 객체:
  shop_name: 매장명 (또는 None)
  shop_address: 주소 (또는 None)
  store_id: store-id (또는 None)
```

**만약 로그에 `None`이 표시되면**: 프론트엔드에서 데이터를 보내지 않고 있는 것입니다.

### 3. 브라우저 콘솔 확인
공고 등록 시 브라우저 콘솔(F12)에서 다음 로그를 확인하세요:

```
=== 공고 등록 데이터 ===
선택한 매장: {id: "...", store_name: "...", address: "..."}
전송할 jobData: {shop_name: "...", shop_address: "...", store_id: "..."}
```

**만약 `shop_name`, `shop_address`, `store_id`가 `undefined`이면**: 매장 선택이 제대로 되지 않은 것입니다.

## 🧪 테스트 방법

### 단계 1: 새 공고 등록
1. http://localhost:5173/employer/job-create 접속
2. **개발자 도구 콘솔 열기** (F12)
3. **기본 매장이 아닌 다른 매장 선택** (중요!)
4. 공고 정보 입력
5. 등록 버튼 클릭

### 단계 2: 콘솔 로그 확인
콘솔에서 다음을 확인:
- `=== 공고 등록 데이터 ===` 로그
- `선택한 매장:` 객체에 `store_name`, `address`, `id`가 있는지
- `전송할 jobData:` 객체에 `shop_name`, `shop_address`, `store_id`가 있는지

### 단계 3: 백엔드 로그 확인
백엔드 서버 터미널에서 확인:
- `[DEBUG] create_job - 받은 매장 정보:` 로그
- `shop_name`, `shop_address`, `store_id` 값이 있는지

### 단계 4: 데이터베이스 확인
새로 등록한 공고의 ID를 확인하고:
```sql
USE team2_db;

SELECT 
    id,
    title,
    shop_name,
    shop_address,
    store_id,
    createdAt
FROM jobs
WHERE id = '새로-등록한-공고-ID';
```

## 🔧 가능한 문제와 해결 방법

### 문제 1: 프론트엔드에서 매장을 선택하지 않음
**증상**: 콘솔에 `selectedStore`가 `null`이거나 `undefined`

**해결**: 공고 등록 페이지에서 반드시 매장을 선택해야 합니다.

### 문제 2: 프론트엔드에서 데이터를 보내지 않음
**증상**: 콘솔에 `jobData`에 `shop_name`, `shop_address`, `store_id`가 없음

**해결**: `JobCreate.tsx`의 `jobData` 객체에 필드가 포함되어 있는지 확인

### 문제 3: 백엔드에서 데이터를 받지 못함
**증상**: 백엔드 로그에 `shop_name: None`, `shop_address: None` 등

**해결**: 
- `JobCreateRequest` 스키마에 필드가 있는지 확인
- Pydantic 모델이 제대로 파싱하는지 확인

### 문제 4: 데이터베이스에 저장되지 않음
**증상**: 백엔드 로그에는 값이 있지만 데이터베이스에는 NULL

**해결**:
- `Job` 모델에 필드가 있는지 확인
- SQLAlchemy가 필드를 인식하는지 확인
- 데이터베이스 테이블에 컬럼이 있는지 확인

## 📝 다음 단계

1. **새 공고 등록**: 기존 공고가 아닌 새로운 공고를 등록
2. **로그 확인**: 브라우저 콘솔과 백엔드 로그 모두 확인
3. **결과 공유**: 로그 결과를 알려주시면 추가로 진단하겠습니다

## ⚠️ 중요

기존에 등록된 공고들은 매장 정보가 NULL일 수 있습니다. **반드시 새로운 공고를 등록해서 테스트**해야 합니다.

