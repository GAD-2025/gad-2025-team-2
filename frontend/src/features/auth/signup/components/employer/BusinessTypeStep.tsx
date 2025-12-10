import { EmployerSignupData } from '../../hooks/useEmployerSignupWizard';
import { useState } from 'react';

interface BusinessTypeStepProps {
  formData: EmployerSignupData;
  updateFormData: (updates: Partial<EmployerSignupData>) => void;
}

export function BusinessTypeStep({ formData, updateFormData }: BusinessTypeStepProps) {
  const [businessLicense, setBusinessLicense] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setBusinessLicense(file);
      updateFormData({ businessType: 'business' });
    }
  };

  // businessLicense가 있으면 다음 버튼 활성화
  const hasBusinessLicense = businessLicense !== null;

  return (
    <div className="mx-auto flex h-full w-full max-w-[420px] flex-col bg-white px-6 pt-4 pb-32">
      <h1 className="mb-3 text-[26px] font-bold text-gray-900">
        사업자 등록증을 등록해 주세요
      </h1>

      <div className="flex-1 space-y-4">
        {/* 사업자 등록증 등록하기 버튼 */}
        <div className="rounded-xl border-2 border-gray-300 bg-white p-4">
          <label className="mb-3 block text-[15px] font-semibold text-gray-900">
            사업자 등록증 <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="businessLicense"
          />
          <label
            htmlFor="businessLicense"
            className="flex items-center justify-center w-full h-14 px-4 bg-mint-50 rounded-xl border-2 border-primary-mint
                     text-[16px] font-semibold text-primary-mint cursor-pointer hover:bg-mint-100 transition-colors"
          >
            {businessLicense ? (
              <span className="text-primary-mint">{businessLicense.name}</span>
            ) : (
              <span>사업자 등록증 등록하기</span>
            )}
          </label>
        </div>
      </div>
    </div>
  );
}

