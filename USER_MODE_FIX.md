# 고용주/구직자 화면 구분 수정 완료

## ✅ 수정 완료 사항

### 1. 로그인 시 userMode 설정
- `SignIn.tsx`에서 로그인 성공 시 `useAuthStore`의 `setUserMode` 호출
- API 응답의 `data.role`을 사용하여 올바른 role 확인
- `response.role` → `data.role`로 수정 (axios response 구조 반영)

### 2. 페이지 진입 시 userMode 설정
- `EmployerHome.tsx`: 고용주 홈 페이지 진입 시 `setUserMode('employer')` 호출
- `JobSeekerHome.tsx`: 구직자 홈 페이지 진입 시 `setUserMode('jobseeker')` 호출

### 3. AutoRedirect 개선
- `AutoRedirect.tsx`에서 사용자 role 확인 후 `setUserMode` 호출
- 저장된 role이 있으면 그것을 사용하여 리다이렉트

### 4. 토큰 저장
- 로그인 성공 시 토큰을 `localStorage`에 저장

## 🔧 수정된 파일

1. **frontend/src/pages/auth/SignIn.tsx**
   - `useAuthStore` import 추가
   - `setUserMode` 호출 추가
   - `data.role` 사용하도록 수정
   - 토큰 저장 추가

2. **frontend/src/pages/employer/EmployerHome.tsx**
   - `useAuthStore` import 추가
   - 페이지 진입 시 `setUserMode('employer')` 호출

3. **frontend/src/pages/jobseeker/Home.tsx**
   - `useAuthStore` import 추가
   - 페이지 진입 시 `setUserMode('jobseeker')` 호출

4. **frontend/src/pages/auth/AutoRedirect.tsx**
   - `useAuthStore` import 추가
   - role 확인 후 `setUserMode` 호출

## 🎯 동작 방식

1. **로그인 시**:
   - API 응답에서 `data.role` 확인
   - `setUserMode`로 올바른 모드 설정
   - role에 따라 `/employer/home` 또는 `/jobseeker/home`으로 리다이렉트

2. **페이지 진입 시**:
   - `EmployerHome` 진입 시 자동으로 `userMode = 'employer'` 설정
   - `JobSeekerHome` 진입 시 자동으로 `userMode = 'jobseeker'` 설정

3. **BottomNav 표시**:
   - `userMode`에 따라 고용주/구직자 탭 표시
   - 고용주: 홈, 채용, 공고관리, 마이
   - 구직자: 홈, 공고, 학습, 네트워킹, 마이

## 🧪 테스트 방법

1. **고용주 로그인**:
   - 고용주 계정으로 로그인
   - `/employer/home`으로 리다이렉트 확인
   - 하단 네비게이션에 "홈, 채용, 공고관리, 마이" 탭 표시 확인

2. **구직자 로그인**:
   - 구직자 계정으로 로그인
   - `/jobseeker/home`으로 리다이렉트 확인
   - 하단 네비게이션에 "홈, 공고, 학습, 네트워킹, 마이" 탭 표시 확인

3. **페이지 이동**:
   - 고용주 홈에서 다른 페이지로 이동 후 돌아와도 고용주 네비게이션 유지
   - 구직자 홈에서 다른 페이지로 이동 후 돌아와도 구직자 네비게이션 유지

**이제 고용주와 구직자 화면이 올바르게 구분되어 표시됩니다!** 🎉


