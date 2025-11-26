import { useState, useEffect } from 'react';

interface ExperienceDetailStepProps {
  selectedSections: string[];
  experienceData: {
    career: string;
    license: string;
    skills: string;
    introduction: string;
  };
  onChangeData: (field: string, value: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function ExperienceDetailStep({
  selectedSections,
  experienceData,
  onChangeData,
  onNext,
  onPrev,
}: ExperienceDetailStepProps) {
  const [careers, setCareers] = useState<string[]>([]);
  const [currentCareer, setCurrentCareer] = useState('');

  useEffect(() => {
    if (experienceData.career) {
      setCareers(experienceData.career.split('\n').filter(c => c.trim() !== ''));
    }
  }, []); // Run only once on mount

  const handleAddCareer = () => {
    if (currentCareer.trim()) {
      const newCareers = [...careers, currentCareer.trim()];
      setCareers(newCareers);
      setCurrentCareer('');
      onChangeData('career', newCareers.join('\n'));
    }
  };

  const handleRemoveCareer = (indexToRemove: number) => {
    const newCareers = careers.filter((_, index) => index !== indexToRemove);
    setCareers(newCareers);
    onChangeData('career', newCareers.join('\n'));
  };

  const canSubmit = selectedSections.every((section) => {
    if (section === 'career') {
      return careers.length > 0;
    }
    const value = experienceData[section as keyof typeof experienceData];
    return value && value.trim().length > 0;
  });

  const getSectionLabel = (sectionId: string) => {
    const labels: Record<string, string> = {
      career: '경력',
      license: '면허/자격증',
      skills: '재능/스킬',
      introduction: '자기소개',
    };
    return labels[sectionId] || sectionId;
  };

  const getPlaceholder = (sectionId: string) => {
    const placeholders: Record<string, string> = {
      career: '예: 카페 바리스타 6개월, 식당 홀서빙 1년',
      license: '예: 운전면허증 2종, 조리사 자격증',
      skills: '예: 요리, 청소, 컴퓨터 활용',
      introduction: '자신을 소개해주세요',
    };
    return placeholders[sectionId] || '';
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col bg-white px-4 pb-10">
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
        <div className="w-8" />
      </header>

      {/* 진행 단계 표시 */}
      <div className="mb-6 text-center">
        <span className="text-[15px] text-gray-500">Step 3 (3/3)</span>
      </div>

      {/* 제목 */}
      <h1 className="mb-2 text-[22px] font-semibold text-gray-900">
        추가 정보
      </h1>
      <p className="mb-6 text-[15px] text-gray-500">
      경력은 최대 40개까지 추가 가능해요.
      <br />
      추가한 경력은 장단기순, 최근 근무일 순으로 보여져요.
      </p>

      {/* 입력 필드 */}
      <div className="mb-6 space-y-6">
        {selectedSections.map((sectionId) => (
          <div key={sectionId}>
            <label className="mb-2 block text-[15px] font-medium text-gray-700">
              {getSectionLabel(sectionId)}
            </label>
            {sectionId === 'career' ? (
              <>
                {/* Career cards */}
                <div className="space-y-2 mb-3">
                  {careers.map((career, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg bg-gray-100 p-3 text-sm">
                      <span className="text-gray-800 flex-1">{career}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCareer(index)}
                        className="ml-2 text-red-500 font-semibold"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>

                {/* Career input */}
                <textarea
                  value={currentCareer}
                  onChange={(e) => setCurrentCareer(e.target.value)}
                  placeholder={getPlaceholder(sectionId)}
                  rows={3}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 focus:border-primary-mint focus:outline-none focus:ring-1 focus:ring-primary-mint"
                />

                {/* Add button */}
                {currentCareer.trim().length > 0 && (
                    <button
                        type="button"
                        onClick={handleAddCareer}
                        className="mt-3 w-full rounded-full bg-primary-mint py-3 text-[15px] font-semibold text-white"
                    >
                        + 경력 추가하기
                    </button>
                )}
              </>
            ) : (
              <textarea
                value={experienceData[sectionId as keyof typeof experienceData]}
                onChange={(e) => onChangeData(sectionId, e.target.value)}
                placeholder={getPlaceholder(sectionId)}
                rows={4}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 focus:border-primary-mint focus:outline-none focus:ring-1 focus:ring-primary-mint"
              />
            )}
          </div>
        ))}
      </div>

      {/* 하단 버튼 */}
      <div className="mt-auto space-y-3">
        <button
          type="button"
          onClick={onNext}
          className="w-full rounded-full px-4 py-3 text-[17px] font-semibold bg-gray-200 text-gray-700"
        >
          건너뛰기
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canSubmit}
          className={`w-full rounded-full px-4 py-3 text-[17px] font-semibold ${
            canSubmit
              ? 'bg-primary-mint text-white'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          저장하기
        </button>
      </div>
    </div>
  );
}

