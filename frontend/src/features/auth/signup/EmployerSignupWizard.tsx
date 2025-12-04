import { useEmployerSignupWizard } from './hooks/useEmployerSignupWizard';
import { EmployerInfoStep } from './components/employer/EmployerInfoStep';
import { NotificationPermissionModal } from './components/employer/NotificationPermissionModal';
import { EmployerTermsModal } from './components/employer/EmployerTermsModal';
import { BusinessTypeStep } from './components/employer/BusinessTypeStep';
import { CompanyNameStep } from './components/employer/CompanyNameStep';
import { CompanyAddressStep } from './components/employer/CompanyAddressStep';
import { ProgressBar } from './components/ProgressBar';

export function EmployerSignupWizard() {
  const {
    step,
    formData,
    updateFormData,
    goNext,
    goPrev,
    skipToNext,
    canProceed,
    showNotificationModal,
    showTermsModal,
    handleNotificationSkip,
    handleGoToSettings,
    handleTermsAgree,
  } = useEmployerSignupWizard();

  const renderStep = () => {
    switch (step) {
      case 1:
        return <EmployerInfoStep formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <BusinessTypeStep formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <CompanyNameStep formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <CompanyAddressStep formData={formData} updateFormData={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative flex h-screen flex-col bg-gray-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white">
        <div className="mx-auto max-w-[420px]">
          <ProgressBar currentStep={step} totalSteps={4} />
        </div>
      </div>

      {/* Back Button */}
      <div className="fixed top-6 left-0 right-0 z-20">
        <div className="mx-auto max-w-[420px] px-4">
          <button
            onClick={goPrev}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto">
        {renderStep()}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-6 py-4 shadow-lg">
        <div className="mx-auto flex max-w-[420px] flex-col items-center gap-2">
          <button
            onClick={goNext}
            disabled={!canProceed()}
            className="w-full rounded-xl bg-primary-mint py-3.5 text-[16px] font-semibold text-white transition-colors hover:bg-primary-mint/90 disabled:bg-gray-300 disabled:text-gray-500"
          >
            다음
          </button>
          <p className="text-[13px] text-gray-600">
            로그인/가입에 어려움이 있으신가요?{' '}
            <button className="font-medium text-primary-mint underline">
              고객센터
            </button>
          </p>
        </div>
      </div>

      {/* Notification Permission Modal */}
      <NotificationPermissionModal
        isOpen={showNotificationModal}
        onClose={handleNotificationSkip}
        onGoToSettings={handleGoToSettings}
      />

      {/* Terms Modal */}
      <EmployerTermsModal
        isOpen={showTermsModal}
        onClose={() => {}}
        onAgree={handleTermsAgree}
      />
    </div>
  );
}

export default EmployerSignupWizard;

