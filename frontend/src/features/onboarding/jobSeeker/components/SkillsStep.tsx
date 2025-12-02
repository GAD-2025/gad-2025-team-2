import { useState } from 'react';

interface SkillsStepProps {
  onChangeData: (value: string) => void;
  onNext: () => void;
  onSkip: () => void;
  onPrev: () => void;
}

export function SkillsStep({
  onChangeData,
  onNext,
  onSkip,
  onPrev,
}: SkillsStepProps) {
  const [workSkills, setWorkSkills] = useState<string[]>([]);
  const [newWorkSkill, setNewWorkSkill] = useState('');
  
  const handleAddWorkSkill = () => {
    if (newWorkSkill.trim()) {
      if (!workSkills.includes(newWorkSkill.trim())) {
        setWorkSkills([...workSkills, newWorkSkill.trim()]);
      }
      setNewWorkSkill('');
    }
  };

  const handleRemoveWorkSkill = (skill: string) => {
    setWorkSkills(workSkills.filter(s => s !== skill));
  };

  const handleWorkSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddWorkSkill();
    }
  };

  const [strengths, setStrengths] = useState<string[]>([]);
  const [newStrength, setNewStrength] = useState('');

  const handleAddStrength = () => {
    if (newStrength.trim()) {
      if (!strengths.includes(newStrength.trim())) {
        setStrengths([...strengths, newStrength.trim()]);
      }
      setNewStrength('');
    }
  };

  const handleRemoveStrength = (strength: string) => {
    setStrengths(strengths.filter(s => s !== strength));
  };

  const handleStrengthKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddStrength();
    }
  };

  const [mbti, setMbti] = useState<string[]>([]);
  const [newMbti, setNewMbti] = useState('');

  const handleAddMbti = () => {
    if (newMbti.trim()) {
      setMbti([newMbti.trim()]);
      setNewMbti('');
    }
  };

  const handleRemoveMbti = (mbtiToRemove: string) => {
    setMbti(mbti.filter(m => m !== mbtiToRemove));
  };

  const handleMbtiKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddMbti();
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



      <div className="flex-1 overflow-y-auto px-4 pb-2">
        {/* 나의 업무 스킬 */}
        <div className="mb-6">
          <h2 className="mb-3 text-[17px] font-semibold text-gray-900">나의 업무 스킬</h2>
          <div className="rounded-2xl border-2 border-dashed border-primary-mint bg-primary-mint/5 p-4">
            <input
              type="text"
              value={newWorkSkill}
              onChange={(e) => setNewWorkSkill(e.target.value)}
              onKeyPress={handleWorkSkillKeyPress}
              placeholder="키워드 입력 후 Enter"
              className="w-full border-0 bg-transparent text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddWorkSkill}
              className="mt-2 text-[15px] font-medium text-primary-mint"
            >
              + 추가하기
            </button>
          </div>
          {workSkills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {workSkills.map((skill, index) => (
                <button
                  key={`${skill}-${index}`}
                  onClick={() => handleRemoveWorkSkill(skill)}
                  className="rounded-full bg-mint-100 px-4 py-2 text-[14px] text-mint-700 border border-mint-200 flex items-center gap-2"
                >
                  {skill}
                  <span className="text-mint-500">×</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 나의 강점 */}
        <div className="mb-6">
          <h2 className="mb-3 text-[17px] font-semibold text-gray-900">나의 강점</h2>
          <div className="rounded-2xl border-2 border-dashed border-primary-mint bg-primary-mint/5 p-4">
            <input
              type="text"
              value={newStrength}
              onChange={(e) => setNewStrength(e.target.value)}
              onKeyPress={handleStrengthKeyPress}
              placeholder="키워드 입력 후 Enter"
              className="w-full border-0 bg-transparent text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddStrength}
              className="mt-2 text-[15px] font-medium text-primary-mint"
            >
              + 추가하기
            </button>
          </div>
          {strengths.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {strengths.map((strength, index) => (
                <button
                  key={`${strength}-${index}`}
                  onClick={() => handleRemoveStrength(strength)}
                  className="rounded-full bg-blue-50 px-4 py-2 text-[14px] text-blue-600 border border-blue-200 flex items-center gap-2"
                >
                  {strength}
                  <span className="text-blue-400">×</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 나의 MBTI */}
        <div className="mb-6">
          <h2 className="mb-3 text-[17px] font-semibold text-gray-900">나의 MBTI</h2>
          <div className="rounded-2xl border-2 border-dashed border-primary-mint bg-primary-mint/5 p-4">
            <input
              type="text"
              value={newMbti}
              onChange={(e) => setNewMbti(e.target.value)}
              onKeyPress={handleMbtiKeyPress}
              placeholder="MBTI 입력 후 Enter"
              className="w-full border-0 bg-transparent text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddMbti}
              className="mt-2 text-[15px] font-medium text-primary-mint"
            >
              + 추가하기
            </button>
          </div>
          {mbti.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {mbti.map((m, index) => (
                <button
                  key={`${m}-${index}`}
                  onClick={() => handleRemoveMbti(m)}
                  className="rounded-full bg-green-50 px-4 py-2 text-[14px] text-green-600 border border-green-200 flex items-center gap-2"
                >
                  {m}
                  <span className="text-green-400">×</span>
                </button>
              ))}
            </div>
          )}
        </div>


      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 max-w-[420px] mx-auto">
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => {
              const data = {
                workSkills,
                strengths,
                mbti,
              };
              onChangeData(JSON.stringify(data));
              onNext();
            }}
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

