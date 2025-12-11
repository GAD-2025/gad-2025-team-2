interface CompanyNameStepProps {
  companyName: string;
  onChangeCompanyName: (name: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

const MAX_COMPANY_NAME_LENGTH = 40;

export function CompanyNameStep({
  companyName,
  onChangeCompanyName,
  onNext,
  onPrev,
}: CompanyNameStepProps) {
  const canProceed = companyName.trim().length > 0;
  const remainingChars = MAX_COMPANY_NAME_LENGTH - companyName.length;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_COMPANY_NAME_LENGTH) {
      onChangeCompanyName(value);
    }
  };

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
        회사 이름을 입력해 주세요
      </h1>

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="company-name" className="text-sm font-medium text-gray-900">
            회사 이름 *
          </label>
          <span className="text-xs text-gray-500">
            {companyName.length}/{MAX_COMPANY_NAME_LENGTH}
          </span>
        </div>
        <input
          id="company-name"
          type="text"
          value={companyName}
          onChange={handleChange}
          placeholder="회사 이름을 입력해 주세요"
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-base transition focus:border-emerald-500 focus:outline-none"
          maxLength={MAX_COMPANY_NAME_LENGTH}
        />
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





