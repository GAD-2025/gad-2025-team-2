interface LicenseStepProps {
  licenseData: string;
  onChangeData: (value: string) => void;
  onNext: () => void;
  onSkip: () => void;
  onPrev: () => void;
}

export function LicenseStep({
  licenseData,
  onChangeData,
  onNext,
  onSkip,
  onPrev,
}: LicenseStepProps) {
  const canProceed = licenseData.trim().length > 0;

  return (
    <div className="mx-auto flex h-screen w-full max-w-[420px] flex-col bg-white px-4 pb-32">
      <header className="mb-4 flex items-center gap-2 pt-4">
        <button type="button" onClick={onPrev} className="text-[26px] text-gray-700">
          ←
        </button>
        <span className="flex-1 text-center text-[19px] font-semibold text-gray-900">
          면허/자격증
        </span>
      </header>

      <div className="mb-4">
        <div className="flex gap-4 border-b border-gray-200">
          <button className="pb-3 text-[15px] font-medium text-primary-mint border-b-2 border-primary-mint">
            어학능력
          </button>
          <button className="pb-3 text-[15px] text-gray-500">
            자격증
          </button>
          <button className="pb-3 text-[15px] text-gray-500">
            수상, 수료, 활동
          </button>
        </div>
      </div>

      <h1 className="mb-2 text-[22px] font-semibold text-gray-900">어학능력</h1>

      <div className="flex-1 overflow-y-auto pb-2">
        <div className="mb-4">
          <label className="mb-2 block text-[15px] font-medium text-gray-700">
            어학 선택
          </label>
          <select className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[15px]">
            <option>어학 선택</option>
          </select>
        </div>

        <div className="mb-4">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[14px]">
              상<br />
              <span className="text-[12px] text-gray-500">회화 능숙</span>
            </button>
            <button className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[14px]">
              중<br />
              <span className="text-[12px] text-gray-500">일상 대화</span>
            </button>
            <button className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[14px]">
              하<br />
              <span className="text-[12px] text-gray-500">간단 대화</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-primary-mint" />
            <span className="text-[15px]">어학연수 경험 있음</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-primary-mint" />
            <span className="text-[15px]">공인시험 등록</span>
          </label>
        </div>

        <textarea
          value={licenseData}
          onChange={(e) => onChangeData(e.target.value)}
          placeholder="예: 운전면허증 2종, 조리사 자격증"
          rows={4}
          className="mt-4 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 focus:border-primary-mint focus:outline-none focus:ring-1 focus:ring-primary-mint"
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 max-w-[420px] mx-auto">
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onNext}
            disabled={!canProceed}
            className={`w-full rounded-full px-4 py-3 text-[17px] font-semibold ${
              canProceed
                ? 'bg-primary-mint text-white'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            저장하기
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="w-full rounded-full border border-gray-300 bg-white px-4 py-3 text-[17px] font-semibold text-gray-700"
          >
            건너뛰기
          </button>
        </div>
      </div>
    </div>
  );
}

