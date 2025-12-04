import { useState } from 'react';

interface SkillsStepProps {
  onChangeData: (value: string) => void;
  onNext: () => void;
  onSkip: () => void;
  onPrev: () => void;
}

// 추천 키워드 데이터 구조
const WORK_SKILLS_CATEGORIES = [
  {
    title: 'UX / 서비스 디자인',
    keywords: [
      'UX Research',
      'UX Design',
      'UI Design',
      'Service Blueprint',
      'Wireframing',
      'Prototyping',
      'Usability Testing',
    ],
  },
  {
    title: 'AI / Tech',
    keywords: [
      'Python',
      'React',
      'Node.js',
      'Prompt Engineering',
      'LLM Application Development',
      'Data Analysis',
      'Machine Learning Basics',
    ],
  },
  {
    title: '제품/비즈니스',
    keywords: [
      'Product Strategy',
      'Requirements Analysis',
      'Market Research',
      'A/B Testing',
      'Documentation (PRD)',
      'Problem Definition',
      'Rapid Experimentation',
    ],
  },
];

const STRENGTHS_CATEGORIES = [
  {
    title: '분석/문제 해결',
    keywords: [
      'Analytical Thinking',
      'Problem Solving',
      'Attention to Detail',
      'Strategic Thinking',
    ],
  },
  {
    title: '개인 성향/태도',
    keywords: [
      'Proactivity',
      'Persistence',
      'High Responsibility',
      'Fast Learning',
    ],
  },
  {
    title: '커뮤니케이션/협업',
    keywords: [
      'Communication',
      'User Empathy',
      'Team Collaboration',
      'Creative Thinking',
    ],
  },
];

const MBTI_CATEGORIES = [
  {
    title: '성격 유형',
    keywords: ['ENFP', 'INTJ', 'INFJ', 'ISTP', 'ENTP', 'ENFJ', 'ISTJ'],
  },
  {
    title: '성향 태그',
    keywords: ['Creative', 'Strategic', 'Intuitive', 'Analytical'],
  },
];

// 추천 태그 컴포넌트
interface RecommendationTagProps {
  keyword: string;
  isSelected: boolean;
  onClick: () => void;
}

function RecommendationTag({ keyword, isSelected, onClick }: RecommendationTagProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isSelected}
      className={`
        rounded-full px-3 py-2 text-[13px] font-medium
        transition-all duration-200
        ${
          isSelected
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-[#F3F5F7] text-gray-700 hover:bg-[#E0E7EA] hover:shadow-sm active:scale-95'
        }
      `}
    >
      {keyword}
    </button>
  );
}

// 카테고리 섹션 컴포넌트
interface CategorySectionProps {
  title: string;
  keywords: string[];
  selectedKeywords: string[];
  onSelectKeyword: (keyword: string) => void;
}

function CategorySection({ title, keywords, selectedKeywords, onSelectKeyword }: CategorySectionProps) {
  return (
    <div className="mb-4">
      <h3 className="mb-2 text-[13px] font-medium text-gray-600">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword) => (
          <RecommendationTag
            key={keyword}
            keyword={keyword}
            isSelected={selectedKeywords.includes(keyword)}
            onClick={() => onSelectKeyword(keyword)}
          />
        ))}
      </div>
    </div>
  );
}

export function SkillsStep({
  onChangeData,
  onNext,
  onSkip,
  onPrev,
}: SkillsStepProps) {
  const [workSkills, setWorkSkills] = useState<string[]>([]);
  const [newWorkSkill, setNewWorkSkill] = useState('');
  
  const handleAddWorkSkill = (skill?: string) => {
    const skillToAdd = skill || newWorkSkill.trim();
    if (skillToAdd) {
      if (!workSkills.includes(skillToAdd)) {
        setWorkSkills([...workSkills, skillToAdd]);
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

  const handleAddStrength = (strength?: string) => {
    const strengthToAdd = strength || newStrength.trim();
    if (strengthToAdd) {
      if (!strengths.includes(strengthToAdd)) {
        setStrengths([...strengths, strengthToAdd]);
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

  const handleAddMbti = (mbtiValue?: string) => {
    const mbtiToAdd = mbtiValue || newMbti.trim();
    if (mbtiToAdd) {
      setMbti([mbtiToAdd]);
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
        <div className="mb-8">
          <h2 className="mb-3 text-[17px] font-semibold text-gray-900">나의 업무 스킬</h2>
          
          {/* 입력 박스 */}
          <div className="rounded-2xl border-2 border-dashed border-primary-mint bg-primary-mint/5 p-4 mb-4">
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
              onClick={() => handleAddWorkSkill()}
              className="mt-2 text-[15px] font-medium text-primary-mint"
            >
              + 추가하기
            </button>
          </div>

          {/* 선택된 스킬 표시 */}
          {workSkills.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
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

          {/* 추천 키워드 */}
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="mb-3 text-[14px] font-medium text-gray-700">💡 추천 키워드</p>
            {WORK_SKILLS_CATEGORIES.map((category) => (
              <CategorySection
                key={category.title}
                title={category.title}
                keywords={category.keywords}
                selectedKeywords={workSkills}
                onSelectKeyword={handleAddWorkSkill}
              />
            ))}
          </div>
        </div>

        {/* 구분선 */}
        <div className="mb-8 border-t border-gray-200" />

        {/* 나의 강점 */}
        <div className="mb-8">
          <h2 className="mb-3 text-[17px] font-semibold text-gray-900">나의 강점</h2>
          
          {/* 입력 박스 */}
          <div className="rounded-2xl border-2 border-dashed border-primary-mint bg-primary-mint/5 p-4 mb-4">
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
              onClick={() => handleAddStrength()}
              className="mt-2 text-[15px] font-medium text-primary-mint"
            >
              + 추가하기
            </button>
          </div>

          {/* 선택된 강점 표시 */}
          {strengths.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
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

          {/* 추천 키워드 */}
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="mb-3 text-[14px] font-medium text-gray-700">💡 추천 키워드</p>
            {STRENGTHS_CATEGORIES.map((category) => (
              <CategorySection
                key={category.title}
                title={category.title}
                keywords={category.keywords}
                selectedKeywords={strengths}
                onSelectKeyword={handleAddStrength}
              />
            ))}
          </div>
        </div>

        {/* 구분선 */}
        <div className="mb-8 border-t border-gray-200" />

        {/* 나의 MBTI */}
        <div className="mb-6">
          <h2 className="mb-3 text-[17px] font-semibold text-gray-900">나의 MBTI</h2>
          
          {/* 입력 박스 */}
          <div className="rounded-2xl border-2 border-dashed border-primary-mint bg-primary-mint/5 p-4 mb-4">
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
              onClick={() => handleAddMbti()}
              className="mt-2 text-[15px] font-medium text-primary-mint"
            >
              + 추가하기
            </button>
          </div>

          {/* 선택된 MBTI 표시 */}
          {mbti.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
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

          {/* 추천 키워드 */}
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="mb-3 text-[14px] font-medium text-gray-700">💡 추천 키워드</p>
            {MBTI_CATEGORIES.map((category) => (
              <CategorySection
                key={category.title}
                title={category.title}
                keywords={category.keywords}
                selectedKeywords={mbti}
                onSelectKeyword={handleAddMbti}
              />
            ))}
          </div>
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

