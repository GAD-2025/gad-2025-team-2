import { EmployerSignupData } from '../../hooks/useEmployerSignupWizard';

interface EmployerInfoStepProps {
  formData: EmployerSignupData;
  updateFormData: (updates: Partial<EmployerSignupData>) => void;
}

export function EmployerInfoStep({ formData, updateFormData }: EmployerInfoStepProps) {
  return (
    <div className="flex h-full flex-col bg-white px-6 pt-24 pb-6">
      <h1 className="mb-10 text-[26px] font-bold text-gray-900">
        정보를 입력해 주세요
      </h1>

      <div className="flex-1 space-y-6">
        {/* 이름 입력 */}
        <div>
          <label className="mb-2 flex items-center text-[15px] font-medium text-gray-700">
            이름 <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="입력하세요"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-[17px] text-gray-900 placeholder-gray-400 focus:border-primary-mint focus:outline-none focus:ring-1 focus:ring-primary-mint"
          />
          <p className="mt-1.5 text-[13px] text-gray-500">최소 2자 이상 입력해 주세요</p>
        </div>

        {/* 이메일 입력 */}
        <div>
          <label className="mb-2 flex items-center text-[15px] font-medium text-gray-700">
            이메일 <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            placeholder="입력하세요"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-[17px] text-gray-900 placeholder-gray-400 focus:border-primary-mint focus:outline-none focus:ring-1 focus:ring-primary-mint"
          />
        </div>
      </div>
    </div>
  );
}

