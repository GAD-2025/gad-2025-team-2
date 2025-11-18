'use client';

import { EmployerInfoStep } from './components/EmployerInfoStep';
import { EmployerWarningModal } from './components/EmployerWarningModal';
import { EmployerRuleAgreementStep } from './components/EmployerRuleAgreementStep';
import { useEmployerSignup } from './hooks/useEmployerSignup';

// 간단한 이메일 형식 검증
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function EmployerSignupWizard() {
  const {
    step,
    state,
    isSubmitting,
    error,
    goPrev,
    handleNameChange,
    handleEmailChange,
    handleNextFromInfo,
    handleConfirmGoRules,
    handleAgreeToRules,
  } = useEmployerSignup();

  // Step 1에서 다음 버튼 활성화 조건
  const canProceedStep1 =
    state.name.trim() !== '' && state.email.trim() !== '' && isValidEmail(state.email);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Step 1: 정보 입력 화면 */}
      {step === 1 && (
        <EmployerInfoStep
          name={state.name}
          email={state.email}
          onNameChange={handleNameChange}
          onEmailChange={handleEmailChange}
          onNext={handleNextFromInfo}
          onPrev={() => {
            // Step 1에서 뒤로가면 역할 선택 화면으로 이동
            window.location.href = '/signup';
          }}
          canProceed={canProceedStep1}
          error={error}
        />
      )}

      {/* Step 2: 경고 모달 (Step 1 화면 위에 오버레이) */}
      {step === 2 && (
        <>
          {/* 배경으로 Step 1 화면 렌더링 */}
          <div className="opacity-50">
            <EmployerInfoStep
              name={state.name}
              email={state.email}
              onNameChange={handleNameChange}
              onEmailChange={handleEmailChange}
              onNext={handleNextFromInfo}
              onPrev={goPrev}
              canProceed={canProceedStep1}
              error={error}
            />
          </div>
          {/* 모달 오버레이 */}
          <EmployerWarningModal
            open={true}
            onConfirmGoRules={handleConfirmGoRules}
            onSkip={handleConfirmGoRules} // "다음에 할게요"도 Step 3으로 이동
          />
        </>
      )}

      {/* Step 3: 규정 동의 화면 */}
      {step === 3 && (
        <EmployerRuleAgreementStep
          onPrev={goPrev}
          onAgreeRules={handleAgreeToRules}
          isSubmitting={isSubmitting}
          error={error}
        />
      )}
    </div>
  );
}

