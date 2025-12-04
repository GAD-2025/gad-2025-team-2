import { EmployerSignupData } from '../../hooks/useEmployerSignupWizard';

interface BusinessTypeStepProps {
  formData: EmployerSignupData;
  updateFormData: (updates: Partial<EmployerSignupData>) => void;
}

export function BusinessTypeStep({ formData, updateFormData }: BusinessTypeStepProps) {
  const options = [
    { value: 'business', label: '개인/법인 사업자예요' },
    { value: 'individual', label: '사업자가 아니에요' },
  ] as const;

  return (
    <div className="mx-auto flex h-full w-full max-w-[420px] flex-col bg-white px-6 pt-20 pb-32">
      <h1 className="mb-6 text-[26px] font-bold text-gray-900">
        사업자 여부를 선택해 주세요
      </h1>

      <div className="flex-1 space-y-4">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => updateFormData({ businessType: option.value })}
            className={`w-full rounded-xl border-2 px-6 py-5 text-left text-[17px] font-medium transition-all ${
              formData.businessType === option.value
                ? 'border-primary-mint bg-mint-50 text-primary-mint'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* 정보 안내 */}
      <div className="mt-4 rounded-xl bg-gray-50 p-4">
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-gray-900">
              정보코드로 회사를 추가하고 싶으신가요?
            </p>
            <p className="mt-1 text-[13px] text-gray-600">
              정보코드로 회사 추가는 프로파일ID 분석에 등록된 회사만 빈도로만
              가능해요. 분석에 문의해 주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

