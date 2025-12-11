# 기본 매장이 마이페이지에 안 보이는 문제 해결

## 문제 상황

- 마이페이지에 "등록된 매장이 없습니다" 표시
- 콘솔 에러: `Failed to fetch stores for user employer-xxx: 404 Not Found`
- 배포 서버에서 `/employer/stores/{user_id}` 엔드포인트가 404 반환

## 원인 분석

### 가능한 원인 1: Employer Router가 배포 서버에 없음
- `/employer/stores/{user_id}` 엔드포인트가 배포 서버에 없을 수 있음
- 확인: `https://route.nois.club:3002/docs`에서 `/employer` 섹션이 있는지 확인

### 가능한 원인 2: 온보딩 시 기본 매장이 생성되지 않음
- 온보딩 완료 시 기본 매장이 자동 생성되어야 하는데 생성되지 않았을 수 있음
- 확인: 배포 서버의 MySQL에서 `stores` 테이블 확인

### 가능한 원인 3: 데이터베이스 연결 문제
- 배포 서버의 백엔드가 MySQL에 연결되지 않았을 수 있음

## 해결 방법

### 1단계: 배포 서버 API 문서 확인

브라우저에서 접속:
```
https://route.nois.club:3002/docs
```

확인 사항:
- `/employer` 섹션이 있는지
- `/employer/stores/{user_id}` 엔드포인트가 있는지

### 2단계: MySQL에서 기본 매장 확인

MySQL Workbench에서:
```sql
USE team2_db;

-- 사용자의 매장 확인
SELECT * FROM stores WHERE user_id = 'employer-b9951ccf';

-- 또는 모든 매장 확인
SELECT * FROM stores;
```

### 3단계: 기본 매장이 없으면 수동 생성

온보딩 시 기본 매장이 생성되지 않았다면, MySQL에서 수동으로 생성:

```sql
USE team2_db;

-- 사용자의 EmployerProfile 확인
SELECT * FROM employer_profiles WHERE user_id = 'employer-b9951ccf';

-- 기본 매장 수동 생성 (EmployerProfile 정보 사용)
INSERT INTO stores (
    id, 
    user_id, 
    is_main, 
    store_name, 
    address, 
    address_detail, 
    phone, 
    industry, 
    management_role, 
    store_type
) 
SELECT 
    CONCAT('store-', SUBSTRING(MD5(RAND()), 1, 8)),
    user_id,
    TRUE,
    company_name,
    address,
    address_detail,
    '',
    '기타',
    '본사 관리자',
    '직영점'
FROM employer_profiles
WHERE user_id = 'employer-b9951ccf'
AND NOT EXISTS (
    SELECT 1 FROM stores WHERE stores.user_id = employer_profiles.user_id
);
```

### 4단계: Employer Router 배포 확인

만약 `/employer` 엔드포인트가 없다면:
- `backend/app/routers/employer.py`가 배포 서버에 있는지 확인
- `backend/app/main.py`에 `app.include_router(employer.router)`가 있는지 확인

## 빠른 해결책

가장 빠른 방법은 MySQL에서 기본 매장을 수동으로 생성하는 것입니다:

1. MySQL Workbench에서 `team2_db` 선택
2. 위의 INSERT 쿼리 실행 (user_id를 실제 사용자 ID로 변경)
3. 마이페이지 새로고침

