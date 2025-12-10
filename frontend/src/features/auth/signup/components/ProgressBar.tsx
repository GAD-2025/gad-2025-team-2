interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  compact?: boolean;
}

export function ProgressBar({ currentStep, totalSteps, compact = false }: ProgressBarProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  const containerClass = compact
    ? 'mx-auto w-full max-w-[160px] px-2 py-2'
    : 'mx-auto w-full max-w-[420px] px-4 py-6';

  const circleSize = compact ? 'h-3 w-3' : 'h-4 w-4';
  const checkSize = compact ? 'h-2 w-2' : 'h-2.5 w-2.5';
  const lineMargin = compact ? 'mx-1 h-0.5' : 'mx-1.5 h-0.5';

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step} className="flex flex-1 items-center">
            {/* 동그라미 */}
            <div className="relative flex flex-col items-center">
              <div
                className={`flex ${circleSize} items-center justify-center rounded-full transition-all ${
                  step < currentStep
                    ? 'bg-primary-mint'
                    : step === currentStep
                    ? 'bg-primary-mint'
                    : 'bg-gray-300'
                }`}
              >
                {step < currentStep && (
                  // 완료된 단계는 체크 표시
                  <svg
                    className={`${checkSize} text-white`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>

            {/* 연결선 (마지막 단계 제외) */}
            {index < steps.length - 1 && (
              <div
                className={`${lineMargin} flex-1 transition-all ${
                  step < currentStep ? 'bg-primary-mint' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

