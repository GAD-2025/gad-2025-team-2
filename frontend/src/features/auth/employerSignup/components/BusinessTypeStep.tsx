import { BusinessType } from '../types';

interface BusinessTypeStepProps {
  businessType: BusinessType | null;
  onSelectBusinessType: (type: BusinessType) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function BusinessTypeStep({
  businessType,
  onSelectBusinessType,
  onNext,
  onPrev,
}: BusinessTypeStepProps) {
  const canProceed = businessType !== null;

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
        사업자 여부를 선택해 주세요
      </h1>

      <div className="mb-6 space-y-3">
        <button
          type="button"
          onClick={() => onSelectBusinessType('business_owner')}
          className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
            businessType === 'business_owner'
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-200 bg-white'
          }`}
        >
          <p
            className={`text-base font-semibold ${
              businessType === 'business_owner' ? 'text-emerald-700' : 'text-gray-900'
            }`}
          >
            개인/법인사업자예요
          </p>
        </button>

        <button
          type="button"
          onClick={() => onSelectBusinessType('not_business_owner')}
          className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
            businessType === 'not_business_owner'
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-200 bg-white'
          }`}
        >
          <p
            className={`text-base font-semibold ${
              businessType === 'not_business_owner' ? 'text-emerald-700' : 'text-gray-900'
            }`}
          >
            사업자가 아니에요
          </p>
        </button>
      </div>

      {/* 안내 텍스트 */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-start gap-2">
          <span className="text-gray-500">ℹ️</span>
          <div className="flex-1 space-y-1 text-xs text-gray-600">
            <p>정모코드로 회사를 추가하고 싶으신가요?</p>
            <p>
              정모코드로 회사 추가는 모맹이즈 본사에 등록된 휴대폰 번호로만 가능해요. 본사에
              문의해 주세요.
            </p>
          </div>
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



