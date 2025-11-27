import { useState } from 'react';

type TabType = 'language' | 'license' | 'awards';

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
  const [activeTab, setActiveTab] = useState<TabType>('language');
  const [languageLevel, setLanguageLevel] = useState<string>('');
  const [hasStudyAbroad, setHasStudyAbroad] = useState(false);
  const [hasOfficialTest, setHasOfficialTest] = useState(false);
  
  const canProceed = licenseData.trim().length > 0;

  return (
    <div className="mx-auto flex h-screen w-full max-w-[420px] flex-col bg-white px-4 pb-32">
      <header className="mb-4 flex items-center gap-2 pt-4">
        <button type="button" onClick={onPrev} className="text-[24px] text-gray-700">
          ←
        </button>
        <span className="flex-1 text-center text-[19px] font-semibold text-gray-900">
          면허/자격증
        </span>
      </header>

      {/* 탭 */}
      <div className="mb-4">
        <div className="flex gap-1 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('language')}
            className={`pb-3 px-3 text-[15px] font-medium transition-colors ${
              activeTab === 'language'
                ? 'text-primary-mint border-b-2 border-primary-mint'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            어학능력
          </button>
          <button 
            onClick={() => setActiveTab('license')}
            className={`pb-3 px-3 text-[15px] font-medium transition-colors ${
              activeTab === 'license'
                ? 'text-primary-mint border-b-2 border-primary-mint'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            자격증
          </button>
          <button 
            onClick={() => setActiveTab('awards')}
            className={`pb-3 px-3 text-[15px] font-medium transition-colors ${
              activeTab === 'awards'
                ? 'text-primary-mint border-b-2 border-primary-mint'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            수상, 수료, 활동
          </button>
        </div>
      </div>

      {/* 탭 내용 */}
      <div className="flex-1 overflow-y-auto pb-2">
        {/* 어학능력 탭 */}
        {activeTab === 'language' && (
          <>
            <h1 className="mb-4 text-[22px] font-semibold text-gray-900">어학능력</h1>
            
            <div className="mb-4">
              <label className="mb-2 block text-[15px] font-medium text-gray-700">
                어학 선택
              </label>
              <select className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[15px] focus:border-primary-mint focus:outline-none">
                <option value="">어학 선택</option>
                <option value="korean">한국어</option>
                <option value="english">영어</option>
                <option value="japanese">일본어</option>
                <option value="chinese">중국어</option>
                <option value="spanish">스페인어</option>
                <option value="french">프랑스어</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-[15px] font-medium text-gray-700">
                수준
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setLanguageLevel('high')}
                  className={`rounded-2xl border px-4 py-3 text-[14px] transition-colors ${
                    languageLevel === 'high'
                      ? 'border-primary-mint bg-mint-50 text-primary-mint'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  상<br />
                  <span className="text-[12px] text-gray-500">회화 능숙</span>
                </button>
                <button 
                  onClick={() => setLanguageLevel('mid')}
                  className={`rounded-2xl border px-4 py-3 text-[14px] transition-colors ${
                    languageLevel === 'mid'
                      ? 'border-primary-mint bg-mint-50 text-primary-mint'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  중<br />
                  <span className="text-[12px] text-gray-500">일상 대화</span>
                </button>
                <button 
                  onClick={() => setLanguageLevel('low')}
                  className={`rounded-2xl border px-4 py-3 text-[14px] transition-colors ${
                    languageLevel === 'low'
                      ? 'border-primary-mint bg-mint-50 text-primary-mint'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  하<br />
                  <span className="text-[12px] text-gray-500">간단 대화</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hasStudyAbroad}
                  onChange={(e) => setHasStudyAbroad(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-primary-mint focus:ring-primary-mint" 
                />
                <span className="text-[15px]">어학연수 경험 있음</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hasOfficialTest}
                  onChange={(e) => setHasOfficialTest(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-primary-mint focus:ring-primary-mint" 
                />
                <span className="text-[15px]">공인시험 등록</span>
              </label>
            </div>

            <textarea
              placeholder="예: IELTS 9.0, DELE A1, TOPIK 3급"
              rows={4}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 focus:border-primary-mint focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-mint"
            />
          </>
        )}

        {/* 자격증 탭 */}
        {activeTab === 'license' && (
          <>
            <h1 className="mb-4 text-[22px] font-semibold text-gray-900">자격증</h1>
            
            <div className="mb-4">
              <label className="mb-2 block text-[15px] font-medium text-gray-700">
                자격증 종류
              </label>
              <select className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[15px] focus:border-primary-mint focus:outline-none">
                <option value="">선택하세요</option>
                <option value="driver">운전면허</option>
                <option value="forklift">지게차</option>
                <option value="cook">조리사</option>
                <option value="barista">바리스타</option>
                <option value="computer">컴퓨터활용능력</option>
                <option value="etc">기타</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-[15px] font-medium text-gray-700">
                취득일
              </label>
              <input 
                type="date"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[15px] focus:border-primary-mint focus:outline-none"
              />
            </div>

            <textarea
              value={licenseData}
              onChange={(e) => onChangeData(e.target.value)}
              placeholder="예: 운전면허 1종 보통, 조리사 자격증, 바리스타 2급"
              rows={4}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 focus:border-primary-mint focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-mint"
            />
          </>
        )}

        {/* 수상, 수료, 활동 탭 */}
        {activeTab === 'awards' && (
          <>
            <h1 className="mb-4 text-[22px] font-semibold text-gray-900">수상, 수료, 활동</h1>
            
            <div className="mb-4">
              <label className="mb-2 block text-[15px] font-medium text-gray-700">
                구분
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button className="rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-[14px] hover:border-primary-mint hover:bg-mint-50 transition-colors">
                  수상
                </button>
                <button className="rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-[14px] hover:border-primary-mint hover:bg-mint-50 transition-colors">
                  수료
                </button>
                <button className="rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-[14px] hover:border-primary-mint hover:bg-mint-50 transition-colors">
                  활동
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-[15px] font-medium text-gray-700">
                이름
              </label>
              <input 
                type="text"
                placeholder="예: 우수사원상, 한국어교육 수료증"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[15px] placeholder:text-gray-400 focus:border-primary-mint focus:outline-none"
              />
            </div>

            <textarea
              placeholder="예: 2024년 우수사원상 수상, 한국어 중급 교육 수료"
              rows={4}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 focus:border-primary-mint focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-mint"
            />
          </>
        )}
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
