interface OnboardingProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgressBar({ currentStep, totalSteps }: OnboardingProgressBarProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  return (
    <div className="w-full px-6 py-4">
      <div className="mx-auto w-full max-w-[420px]">
        <div className="flex items-center">
          {steps.map((step, index) => (
            <div key={step} className="flex flex-1 items-center">
              {/* 동그라미 */}
              <div className="relative flex items-center justify-center">
                <div
                  className={`h-3 w-3 rounded-full transition-all ${
                    step <= currentStep ? 'bg-primary-mint' : 'bg-gray-300'
                  }`}
                />
              </div>

              {/* 연결선 (마지막 단계 제외) */}
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-1 flex-1 transition-all ${
                    step < currentStep ? 'bg-primary-mint' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
