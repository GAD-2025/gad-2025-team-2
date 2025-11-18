'use client';

import { BirthdateBottomSheet } from './components/BirthdateBottomSheet';
import { RoleSelectStep } from './components/RoleSelectStep';
import { TermsStep } from './components/TermsStep';
import { UserInfoStep } from './components/UserInfoStep';
import { useSignupWizard } from './hooks/useSignupWizard';

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

  return (
    <div className="min-h-screen bg-gray-50">
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

