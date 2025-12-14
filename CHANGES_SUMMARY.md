# 변경 사항 요약

## ✅ 완료된 수정 사항

### 1. 고용주 합격 공고 필터링 수정
- **문제**: 합격된 공고가 "합격" 필터와 "채용 확정" 필터에 모두 표시됨
- **해결**: 채용 확정된 지원자는 "합격" 필터에서 제외, "채용 확정" 필터에만 표시
- **파일**: `frontend/src/pages/employer/Recruitment.tsx`
  - `interviewResultFilter === 'accepted'`에서 `!isHired(a)` 조건 추가
  - `interviewResultCounts.accepted` 계산 시 채용 확정 제외

### 2. 채용확정 캘린더 UI 개선
- **문제**: 캘린더가 첫 출근 날짜를 나타내는지 명확하지 않음
- **해결**: 캘린더 헤더에 "첫 출근 날짜" 배지 추가
- **파일**: 
  - `frontend/src/pages/employer/Recruitment.tsx` (고용주)
  - `frontend/src/pages/jobseeker/MyApplications.tsx` (구직자)

### 3. 고용주 면접결과->합격 섹션 UI 개선
- **문제**: 합격 상태에서 저장/채팅/면접제안하기 버튼이 표시됨
- **해결**: 합격 상태일 때 면접 진행 단계 표시 (면접 확정 기다리는 중, 면접 확정됨, 면접 거부됨)
- **파일**: `frontend/src/pages/employer/ApplicantDetail.tsx`
  - `applicationStatus === 'accepted'` 조건 추가
  - 면접 제안 데이터 확인 후 진행 단계 표시

### 4. 구직자 합격 섹션 개선
- **문제**: 출근 확정 후 공고가 사라짐
- **해결**: 
  - 채용 확정된 공고는 캘린더로 표시
  - 채용 확정되지 않은 합격 공고는 목록으로 표시
  - 둘 다 "합격" 섹션에 함께 표시
- **파일**: `frontend/src/pages/jobseeker/MyApplications.tsx`
  - `activeFilter === 'accepted'` 필터링 로직 수정
  - `pendingAcceptedApps`와 `hiredApplications` 분리
  - 채용 확정된 공고는 캘린더, 미확정은 목록으로 표시

### 5. 출근 확정 후에도 합격 섹션에 유지
- **문제**: 출근 확정 후 모달이 닫히고 공고가 사라짐
- **해결**: 
  - 출근 확정 후 모달은 닫지 않고 상태만 업데이트
  - `firstWorkDateConfirmed`를 즉시 반영하여 "확정됨" 표시
  - 합격 섹션에서 캘린더 UI로 이동
- **파일**: `frontend/src/pages/jobseeker/MyApplications.tsx`
  - 출근 확정 버튼 클릭 시 모달 유지
  - `firstWorkDateConfirmed` 즉시 업데이트

### 6. 첫 출근 날짜 표시 우선순위 수정
- **문제**: `firstWorkDateConfirmed`가 있으면 이를 우선 표시해야 함
- **해결**: `firstWorkDateConfirmed` 우선, 없으면 `acceptanceData.firstWorkDate` 사용
- **파일**:
  - `frontend/src/pages/jobseeker/MyApplications.tsx` (캘린더 그룹화, 합격 안내 상세)
  - `frontend/src/pages/employer/Recruitment.tsx` (캘린더 그룹화)

## 🔄 데이터 흐름

### 고용주 플로우
1. 합격 처리 → `status = 'accepted'`
2. 첫 출근 수정 및 확정 → `firstWorkDateConfirmed` 설정 → `status = 'hired'`
3. "합격" 필터: `status = 'accepted' && !isHired` 만 표시
4. "채용 확정" 필터: `isHired = true` 만 표시

### 구직자 플로우
1. 합격 안내 받음 → `status = 'accepted'`
2. 합격 섹션에 목록으로 표시
3. 출근 확정 → `firstWorkDateConfirmed` 설정 → `status = 'hired'`
4. 합격 섹션의 캘린더 UI로 이동하여 계속 표시

## 🧪 테스트 필요 항목

1. ✅ 고용주 합격 필터에서 채용 확정 제외 확인
2. ✅ 채용 확정 캘린더에 "첫 출근 날짜" 표시 확인
3. ✅ 고용주 합격 상태에서 면접 진행 단계 표시 확인
4. ✅ 구직자 합격 섹션에 목록 + 캘린더 함께 표시 확인
5. ✅ 구직자 출근 확정 후에도 합격 섹션에 유지 확인
6. ✅ `firstWorkDateConfirmed` 우선 사용 확인
