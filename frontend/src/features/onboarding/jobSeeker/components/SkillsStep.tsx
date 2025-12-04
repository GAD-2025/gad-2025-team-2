import { useState, useEffect } from 'react';

interface SkillsStepProps {
  skillsData?: string;
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
        rounded-lg px-4 py-2.5 text-[13px] font-medium
        transition-all duration-200 border
        ${
          isSelected
            ? 'bg-mint-50 text-mint-600 border-mint-300 cursor-not-allowed'
            : 'bg-white text-gray-700 border-gray-200 hover:border-mint-400 hover:bg-mint-50 hover:text-mint-600 active:scale-95'
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
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <h3 className="text-[14px] font-semibold text-gray-800">{title}</h3>
        <svg 
          className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="mt-2 px-2 py-3 flex flex-wrap gap-2">
          {keywords.map((keyword) => (
            <RecommendationTag
              key={keyword}
              keyword={keyword}
              isSelected={selectedKeywords.includes(keyword)}
              onClick={() => onSelectKeyword(keyword)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function SkillsStep({
  skillsData,
  onChangeData,
  onNext,
  onSkip,
  onPrev,
}: SkillsStepProps) {
  const [workSkills, setWorkSkills] = useState<string[]>([]);
  const [newWorkSkill, setNewWorkSkill] = useState('');
  const [strengths, setStrengths] = useState<string[]>([]);
  const [newStrength, setNewStrength] = useState('');
  const [mbti, setMbti] = useState<string[]>([]);
  const [newMbti, setNewMbti] = useState('');

  // Load initial data from skillsData prop
  useEffect(() => {
    if (skillsData) {
      try {
        const parsed = JSON.parse(skillsData);
        if (parsed.workSkills) setWorkSkills(parsed.workSkills);
        if (parsed.strengths) setStrengths(parsed.strengths);
        if (parsed.mbti) setMbti(parsed.mbti);
      } catch (error) {
        console.error('Failed to parse skills data:', error);
      }
    }
  }, [skillsData]);
  
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

  // 확인 버튼 활성화 조건: 업무 스킬 OR 강점 OR MBTI 중 하나라도 입력
  const canConfirm = workSkills.length > 0 || strengths.length > 0 || mbti.length > 0;

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
                  className="rounded-lg bg-mint-600 px-4 py-2.5 text-[14px] text-white font-medium flex items-center gap-2 hover:bg-mint-700 transition-colors shadow-sm"
                >
                  {skill}
                  <span className="text-white text-[16px] font-bold">×</span>
                </button>
              ))}
            </div>
          )}

          {/* 추천 키워드 */}
          <div className="rounded-xl bg-white border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[16px]">💡</span>
              <p className="text-[15px] font-semibold text-gray-800">추천 키워드</p>
            </div>
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
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-[14px] text-white font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
                >
                  {strength}
                  <span className="text-white text-[16px] font-bold">×</span>
                </button>
              ))}
            </div>
          )}

          {/* 추천 키워드 */}
          <div className="rounded-xl bg-white border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[16px]">💡</span>
              <p className="text-[15px] font-semibold text-gray-800">추천 키워드</p>
            </div>
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
                  className="rounded-lg bg-purple-600 px-4 py-2.5 text-[14px] text-white font-medium flex items-center gap-2 hover:bg-purple-700 transition-colors shadow-sm"
                >
                  {m}
                  <span className="text-white text-[16px] font-bold">×</span>
                </button>
              ))}
            </div>
          )}

          {/* 추천 키워드 */}
          <div className="rounded-xl bg-white border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[16px]">💡</span>
              <p className="text-[15px] font-semibold text-gray-800">추천 키워드</p>
            </div>
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
            disabled={!canConfirm}
            className={`h-12 w-full rounded-full text-[17px] font-semibold transition ${
              canConfirm
                ? 'bg-primary-mint text-white hover:bg-primary-mint/90'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            확인
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

