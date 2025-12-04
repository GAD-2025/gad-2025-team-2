interface PreferredRegionStepProps {
  selectedRegions: string[];
  onRegionSelect: (regions: string[]) => void;
  onNext: () => void;
  onSkip: () => void;
  onPrev: () => void;
}

const REGIONS = [
  '서울',
  '경기',
  '인천',
  '부산',
  '대구',
  '광주',
  '대전',
  '울산',
  '세종',
];

export function PreferredRegionStep({
  selectedRegions,
  onRegionSelect,
  onNext,
  onSkip,
  onPrev,
}: PreferredRegionStepProps) {
  const handleSelect = (region: string) => {
    if (selectedRegions.includes(region)) {
      onRegionSelect(selectedRegions.filter((r) => r !== region));
    } else {
      onRegionSelect([...selectedRegions, region]);
    }
  };

  const hasSelection = selectedRegions.length > 0;

  return (
    <div className="mx-auto flex h-screen w-full max-w-[420px] flex-col bg-white px-4 pb-24">
      <header className="mb-4 flex items-center gap-2 pt-4">
        <button type="button" onClick={onPrev} className="text-[26px]">
          ←
        </button>
        <span className="flex-1 text-center text-[19px] font-semibold text-gray-900">
          희망 근무 지역
        </span>
      </header>

      <h1 className="mb-2 text-[22px] font-semibold text-gray-900">
        희망 근무 지역을 선택해주세요
      </h1>
      <p className="mb-4 text-[15px] text-gray-500">
        원하는 동네의 일자리를 찾아드려요! 지역을 선택해 주세요.
      </p>

      <div className="flex-1 overflow-y-auto space-y-2.5 pb-2">
        {REGIONS.map((region) => {
          const isSelected = selectedRegions.includes(region);
          return (
            <button
              key={region}
              type="button"
              onClick={() => handleSelect(region)}
              className={`w-full rounded-2xl border px-4 py-4 text-left ${
                isSelected
                  ? 'border-primary-mint bg-mint-50 text-primary-mint'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-medium">{region}</span>
                {isSelected && (
                  <span className="text-primary-mint">✓</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 max-w-[420px] mx-auto">
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onNext}
            disabled={!hasSelection}
            className={`h-12 w-full rounded-full text-[17px] font-semibold transition ${
              hasSelection
                ? 'bg-primary-mint text-white'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            다음
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="h-12 w-full rounded-full border border-gray-300 bg-white text-[17px] font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            건너뛰기
          </button>
        </div>
      </div>
    </div>
  );
}

