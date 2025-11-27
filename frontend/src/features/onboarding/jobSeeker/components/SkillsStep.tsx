import { useState } from 'react';

interface SkillsStepProps {
  skillsData: string;
  onChangeData: (value: string) => void;
  onNext: () => void;
  onSkip: () => void;
  onPrev: () => void;
}

export function SkillsStep({
  skillsData,
  onChangeData,
  onNext,
  onSkip,
  onPrev,
}: SkillsStepProps) {
  const [activeTab, setActiveTab] = useState<'language' | 'license' | 'awards'>('language');
  const [inputValue, setInputValue] = useState('');
  
  const skills = skillsData ? skillsData.split(',').map(s => s.trim()).filter(Boolean) : [];

  const handleAddSkill = () => {
    if (inputValue.trim()) {
      const currentSkills = skillsData ? skillsData.split(',').map(s => s.trim()).filter(Boolean) : [];
      if (!currentSkills.includes(inputValue.trim())) {
        onChangeData([...currentSkills, inputValue.trim()].join(', '));
      }
      setInputValue('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    const currentSkills = skillsData ? skillsData.split(',').map(s => s.trim()).filter(Boolean) : [];
    onChangeData(currentSkills.filter(s => s !== skill).join(', '));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSkill();
    }
  };

  return (
    <div className="mx-auto flex h-screen w-full max-w-[420px] flex-col bg-white pb-24">
      <header className="mb-4 flex items-center gap-2 bg-white px-4 py-4 shadow-sm">
        <button type="button" onClick={onPrev} className="text-[24px] text-gray-700">
          ←
        </button>
        <span className="flex-1 text-center text-[19px] font-semibold text-gray-900">
          재능/스킬
        </span>
        <div className="w-6" />
      </header>

      {/* 탭 */}
      <div className="mb-4 flex border-b border-gray-200 px-4">
        <button
          onClick={() => setActiveTab('language')}
          className={`pb-3 px-4 text-[15px] font-medium ${
            activeTab === 'language'
              ? 'text-primary-mint border-b-2 border-primary-mint'
              : 'text-gray-500'
          }`}
        >
          어학능력
        </button>
        <button
          onClick={() => setActiveTab('license')}
          className={`pb-3 px-4 text-[15px] font-medium ${
            activeTab === 'license'
              ? 'text-primary-mint border-b-2 border-primary-mint'
              : 'text-gray-500'
          }`}
        >
          자격증
        </button>
        <button
          onClick={() => setActiveTab('awards')}
          className={`pb-3 px-4 text-[15px] font-medium ${
            activeTab === 'awards'
              ? 'text-primary-mint border-b-2 border-primary-mint'
              : 'text-gray-500'
          }`}
        >
          수상, 수료, 활동
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-2">
        {/* 나의 업무 스킬 */}
        <div className="mb-6">
          <h2 className="mb-3 text-[17px] font-semibold text-gray-900">나의 업무 스킬</h2>
          <div className="rounded-2xl border-2 border-dashed border-primary-mint bg-primary-mint/5 p-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="키워드 입력 후 Enter"
              className="w-full border-0 bg-transparent text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="mt-2 text-[15px] font-medium text-primary-mint"
            >
              + 추가하기
            </button>
          </div>
        </div>

        {/* 나의 강점 */}
        <div className="mb-6">
          <h2 className="mb-3 text-[17px] font-semibold text-gray-900">나의 강점</h2>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <button
                  key={`${skill}-${index}`}
                  onClick={() => handleRemoveSkill(skill)}
                  className="rounded-full bg-blue-50 px-4 py-2 text-[14px] text-blue-600 border border-blue-200 flex items-center gap-2"
                >
                  {skill}
                  <span className="text-blue-400">×</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <button
                type="button"
                className="text-[15px] font-medium text-gray-400"
              >
                + 추가하기
              </button>
            </div>
          )}
        </div>

        {/* 나의 MBTI */}
        <div className="mb-6">
          <h2 className="mb-3 text-[17px] font-semibold text-gray-900">나의 MBTI</h2>
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <button
              type="button"
              className="text-[15px] font-medium text-gray-400"
            >
              + 추가하기
            </button>
          </div>
        </div>

        {/* 자기소개 */}
        <div className="mb-6">
          <h2 className="mb-3 text-[17px] font-semibold text-gray-900">자기소개</h2>
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <button
              type="button"
              className="text-[15px] font-medium text-gray-400"
            >
              + 추가하기
            </button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 max-w-[420px] mx-auto">
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onNext}
            className="w-full rounded-xl bg-primary-mint px-4 py-3.5 text-[17px] font-semibold text-white"
          >
            저장하기
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-[17px] font-semibold text-gray-700"
          >
            건너뛰기
          </button>
        </div>
      </div>
    </div>
  );
}

