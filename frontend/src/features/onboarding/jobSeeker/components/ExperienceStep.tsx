interface ExperienceStepProps {
  selectedSections: string[];
  onToggleSection: (sectionId: string) => void;
  onNext: () => void;
  onSkip: () => void;
  onPrev: () => void;
}

const EXPERIENCE_SECTIONS = [
  { id: 'career', label: '경력', icon: '💼' },
  { id: 'license', label: '면허/자격증', icon: '📜' },
  { id: 'skills', label: '재능/스킬', icon: '⭐' },
  { id: 'introduction', label: '자기소개', icon: '✍️' },
];

export function ExperienceStep({
  selectedSections,
  onToggleSection,
  onNext,
  onSkip,
  onPrev,
}: ExperienceStepProps) {
  const hasSelections = selectedSections.length > 0;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col bg-white px-4 pb-10 pt-8">
      {/* 헤더 */}
      <header className="mb-6 flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          className="text-[26px] text-gray-700"
        >
          ←
        </button>
        <span className="flex-1 text-center text-[19px] font-semibold text-gray-900">
          프로필 작성
        </span>
        <div className="w-8" /> {/* 균형을 위한 spacer */}
      </header>

      {/* 진행 단계 표시 */}
      <div className="mb-6 text-center">
        <span className="text-[15px] text-gray-500">Step 2 (2/3)</span>
      </div>

      {/* 제목 */}
      <h1 className="mb-2 text-[22px] font-semibold text-gray-900">
        경력 정보
      </h1>
      <p className="mb-6 text-[15px] text-gray-500">
        나의 강점을 직업인게 되는 일들이네요.<br />
        시작날짜와 가장 관심있는 보면의 될 거예요.
      </p>

      {/* 경력 섹션 선택 */}
      <div className="mb-6 space-y-3">
        {EXPERIENCE_SECTIONS.map((section) => {
          const isSelected = selectedSections.includes(section.id);
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onToggleSection(section.id)}
              className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left transition-colors ${
                isSelected
                  ? 'border-primary-mint bg-mint-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* 체크박스 */}
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-md border-2 ${
                  isSelected
                    ? 'border-primary-mint bg-primary-mint'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {isSelected && (
                  <svg
                    className="h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>

              {/* 아이콘과 라벨 */}
              <span className="text-[24px]">{section.icon}</span>
              <span className="flex-1 text-[17px] font-medium text-gray-900">
                {section.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 하단 버튼 */}
      <div className="mt-auto flex flex-col gap-3">
        <button
          type="button"
          onClick={onNext}
          disabled={!hasSelections}
          className={`w-full rounded-full px-4 py-3 text-[17px] font-semibold ${
            hasSelections
              ? 'bg-primary-mint text-white'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          경력 추가
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="w-full rounded-full border border-gray-300 bg-white px-4 py-3 text-[17px] font-semibold text-gray-700"
        >
          아직 경력이 없어요
        </button>
      </div>
    </div>
  );
}

