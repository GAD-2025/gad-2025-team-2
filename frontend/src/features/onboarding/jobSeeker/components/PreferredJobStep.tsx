interface PreferredJobStepProps {
  selectedJobs: string[];
  onJobToggle: (jobId: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

const JOB_CATEGORIES = [
  { id: 'store', label: '매장관리 · 판매' },
  { id: 'service', label: '서비스' },
  { id: 'serving', label: '서빙' },
  { id: 'kitchen', label: '주방' },
  { id: 'labor', label: '단순노무 · 분류 · 택배' },
  { id: 'delivery', label: '배달 · 운송 · 운전' },
  { id: 'event', label: '행사 · 스텝 · 미디어' },
  { id: 'office', label: '사무 · 회계 · 관리' },
  { id: 'sales', label: '영업 · 마케팅' },
];

export function PreferredJobStep({
  selectedJobs,
  onJobToggle,
  onPrev,
  onNext,
}: PreferredJobStepProps) {
  const hasSelection = selectedJobs.length > 0;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col bg-white px-4 pb-10 pt-8">
      <header className="mb-6 flex items-center gap-2">
        <button type="button" onClick={onPrev} className="text-[26px]">
          ←
        </button>
        <span className="flex-1 text-center text-[19px] font-semibold text-gray-900">
          희망 업무
        </span>
      </header>

      <h1 className="mb-2 text-[22px] font-semibold text-gray-900">
        희망하는 업무를 모두 선택해주세요
      </h1>
      <p className="mb-6 text-[15px] text-gray-500">
        경험하고 싶은 업무를 모두 선택해 주세요.
      </p>

      <div className="mb-6 space-y-2">
        {JOB_CATEGORIES.map((category) => {
          const isSelected = selectedJobs.includes(category.id);
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onJobToggle(category.id)}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left ${
                isSelected
                  ? 'border-primary-mint bg-mint-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <span
                className={`text-[15px] font-medium ${
                  isSelected ? 'text-primary-mint' : 'text-gray-700'
                }`}
              >
                {category.label}
              </span>
              {isSelected && (
                <span className="text-primary-mint">✓</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-auto">
        <button
          type="button"
          onClick={onNext}
          disabled={!hasSelection}
          className={`h-12 w-full rounded-full text-[17px] font-semibold ${
            hasSelection
              ? 'bg-primary-mint text-white'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          다음
        </button>
      </div>
    </div>
  );
}

