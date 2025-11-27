interface IntroductionStepProps {
  introductionData: string;
  onChangeData: (value: string) => void;
  onNext: () => void;
  onSkip: () => void;
  onPrev: () => void;
}

export function IntroductionStep({
  introductionData,
  onChangeData,
  onNext,
  onSkip,
  onPrev,
}: IntroductionStepProps) {
  const maxLength = 50000;
  const currentLength = introductionData.length;
  const canProceed = introductionData.trim().length > 0;

  return (
    <div className="mx-auto flex h-screen w-full max-w-[420px] flex-col bg-white px-4 pb-32">
      <header className="mb-4 flex items-center gap-2 pt-4">
        <button type="button" onClick={onPrev} className="text-[26px] text-gray-700">
          ←
        </button>
        <span className="flex-1 text-center text-[19px] font-semibold text-gray-900">
          자기소개
        </span>
      </header>

      <h1 className="mb-2 text-[22px] font-semibold text-gray-900">자기소개</h1>
      <p className="mb-4 text-[15px] text-gray-500">
        {currentLength}/{maxLength}
      </p>
      <p className="mb-4 text-[15px] text-gray-500">
        최대한 다양한 모습을 보여주시면좋습니다.
      </p>

      <div className="flex-1 overflow-y-auto pb-2">
        <textarea
          value={introductionData}
          onChange={(e) => onChangeData(e.target.value)}
          placeholder="최소 20자 입력해주세요."
          maxLength={maxLength}
          rows={12}
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 focus:border-primary-mint focus:outline-none focus:ring-1 focus:ring-primary-mint resize-none"
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

