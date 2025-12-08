import { BusinessType } from '../types';

interface BusinessTypeStepProps {
  businessType: BusinessType | null;
  businessLicense: File | null;
  onSelectBusinessType: (type: BusinessType) => void;
  onBusinessLicenseChange: (file: File | null) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function BusinessTypeStep({
  businessType,
  businessLicense,
  onSelectBusinessType,
  onBusinessLicenseChange,
  onNext,
  onPrev,
}: BusinessTypeStepProps) {
  const canProceed = businessType === 'business_owner' && businessLicense !== null;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col bg-white px-4 pb-10 pt-8">
      <header className="mb-6 flex items-center gap-2">
        <button type="button" onClick={onPrev} className="text-lg text-gray-700">
          ←
        </button>
        <span className="flex-1 text-center text-base font-semibold text-gray-900">
          회사 추가
        </span>
        <div className="w-6" /> {/* 뒤로가기와 균형 맞추기 */}
      </header>

      <h1 className="mb-6 text-xl font-semibold text-gray-900">
        사업자 등록증을 등록해 주세요
      </h1>

      <div className="mb-6 space-y-3">
        {/* 사업자 등록증 등록하기 버튼 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-gray-900">
            사업자 등록증 <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              if (file) {
                onSelectBusinessType('business_owner');
                onBusinessLicenseChange(file);
              }
            }}
            className="hidden"
            id="businessLicense"
          />
          <label
            htmlFor="businessLicense"
            className="flex items-center justify-center w-full h-12 px-4 bg-emerald-50 rounded-xl border-2 border-emerald-500
                     text-sm font-semibold text-emerald-700 cursor-pointer hover:bg-emerald-100 transition-colors"
          >
            {businessLicense ? (
              <span className="text-emerald-600">{businessLicense.name}</span>
            ) : (
              <span>사업자 등록증 등록하기</span>
            )}
          </label>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="mt-auto pt-10">
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className={`h-12 w-full rounded-full text-base font-semibold text-white transition ${
            canProceed
              ? 'bg-emerald-500 hover:bg-emerald-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          다음
        </button>
      </div>
    </div>
  );
}




