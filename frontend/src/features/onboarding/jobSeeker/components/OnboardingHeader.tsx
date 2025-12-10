import React from 'react';
import { OnboardingProgressBar } from './OnboardingProgressBar';

interface OnboardingHeaderProps {
  title: string;
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
}

export function OnboardingHeader({ title, currentStep, totalSteps, onBack }: OnboardingHeaderProps) {
  return (
    <div className="bg-white">
      <OnboardingProgressBar currentStep={currentStep} totalSteps={totalSteps} />

      <div className="mx-auto max-w-[420px] px-4">
        <header className="mb-3 flex items-center gap-2 pt-4">
          <button onClick={onBack} className="text-[26px] text-text-600 hover:text-text-900">←</button>
          <span className="flex-1 text-center text-base font-semibold text-gray-900">{title}</span>
        </header>
      </div>
    </div>
  );
}

export default OnboardingHeader;
