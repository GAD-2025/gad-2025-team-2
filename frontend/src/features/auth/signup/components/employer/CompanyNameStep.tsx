import { EmployerSignupData } from '../../hooks/useEmployerSignupWizard';

interface CompanyNameStepProps {
  formData: EmployerSignupData;
  updateFormData: (updates: Partial<EmployerSignupData>) => void;
}

export function CompanyNameStep({ formData, updateFormData }: CompanyNameStepProps) {
  return (
    <div className="mx-auto flex h-full w-full max-w-[420px] flex-col bg-white px-6 pt-20 pb-32">
      <h1 className="mb-6 text-[26px] font-bold text-gray-900">
        회사 이름을 입력해 주세요
      </h1>

      <div className="flex-1">
        <div>
          <label className="mb-2 flex items-center text-[15px] font-medium text-gray-700">
            회사 이름 <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => updateFormData({ companyName: e.target.value })}
            placeholder="회사 이름을 입력해 주세요"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-[17px] text-gray-900 placeholder-gray-400 focus:border-primary-mint focus:outline-none focus:ring-1 focus:ring-primary-mint"
          />
          <p className="mt-1.5 text-[13px] text-gray-500">
            0/30
          </p>
        </div>
      </div>
    </div>
  );
}

