import { BirthdateBottomSheet } from './components/BirthdateBottomSheet';
import { RoleSelectStep } from './components/RoleSelectStep';
import { TermsStep } from './components/TermsStep';
import { UserInfoStep } from './components/UserInfoStep';
import { ProgressBar } from './components/ProgressBar';
import { useSignupWizard } from './hooks/useSignupWizard';
import { EmployerSignupWizard } from './EmployerSignupWizard';

export default function SignupWizard() {
  const {
    step,
    values,
    selectRole,
    handleInputChange,
    handlePhoneChange,
    handleGenderSelect,
    handleNationalitySelect,
    nationalities,
    goNext,
    goPrev,
    canProceed,
    openBirthdateSheet,
    closeBirthdateSheet,
    birthdateSheetOpen,
    confirmBirthdate,
    birthdateSelection,
    handleBirthdatePick,
    birthdateDisplay,
    years,
    months,
    days,
    toggleTerms,
  } = useSignupWizard();

  // 고용주 선택 시 고용주 회원가입 플로우로 이동
  if (values.role === 'employer' && step > 1) {
    return <EmployerSignupWizard />;
  }

  // 전체 프로그레스 바 단계 (회원가입 2단계 + 온보딩 7단계 = 총 9단계)
  const getProgressStep = () => {
    if (step === 2) return 1; // 회원정보 입력
    if (step === 4) return 2; // 약관 동의
    return 0;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Bar - 역할 선택 단계에서는 숨김, 전체 9단계 중 현재 위치 표시 */}
      {step > 1 && <ProgressBar currentStep={getProgressStep()} totalSteps={9} />}
      
      {step === 1 && (
        <RoleSelectStep selectedRole={values.role} onSelect={selectRole} />
      )}
      {step === 2 && (
        <UserInfoStep
          values={values}
          birthdateLabel={birthdateDisplay}
          onChange={handleInputChange}
          onPhoneChange={handlePhoneChange}
          onOpenBirthdate={openBirthdateSheet}
          onGenderSelect={handleGenderSelect}
          onNationalitySelect={handleNationalitySelect}
          nationalities={nationalities}
          onNext={goNext}
          onPrev={goPrev}
          canProceed={canProceed}
        />
      )}
      {step === 4 && (
        <TermsStep
          name={values.name || '회원'}
          terms={values.terms}
          onToggle={toggleTerms}
          onPrev={goPrev}
          onNext={goNext}
          canProceed={canProceed}
        />
      )}

      <BirthdateBottomSheet
        open={birthdateSheetOpen}
        selection={birthdateSelection}
        years={years}
        months={months}
        days={days}
        onChange={handleBirthdatePick}
        onClose={closeBirthdateSheet}
        onConfirm={confirmBirthdate}
      />
    </div>
  );
}

