import { useState } from 'react';

type TabType = 'language' | 'license' | 'awards';

interface LicenseStepProps {
  // licenseData: string; // Removed as it's not actively used now
  onChangeData: (value: string) => void;
  onNext: () => void;
  onSkip: () => void;
  onPrev: () => void;
}

export function LicenseStep({
  // licenseData, // Removed
  onChangeData,
  onNext,
  onSkip,
  onPrev,
}: LicenseStepProps) {
  const [activeTab, setActiveTab] = useState<TabType>('language');
  const [languageLevel, setLanguageLevel] = useState<string>('');
  const [hasStudyAbroad, setHasStudyAbroad] = useState(false);
  const [hasOfficialTest, setHasOfficialTest] = useState(false);
  const [newOfficialExam, setNewOfficialExam] = useState('');
  const [officialExams, setOfficialExams] = useState<string[]>([]);
  const [additionalLanguageInfo, setAdditionalLanguageInfo] = useState('');
  const [additionalLanguageInfoList, setAdditionalLanguageInfoList] = useState<string[]>([]);
  const [newLicense, setNewLicense] = useState('');
  const [licenses, setLicenses] = useState<string[]>([]);
  const [newAward, setNewAward] = useState('');
  const [awards, setAwards] = useState<string[]>([]);
  
  // const canProceed = licenseData.trim().length > 0; // Removed

  const handleAddOfficialExam = () => {
    if (newOfficialExam.trim()) {
      setOfficialExams([...officialExams, newOfficialExam.trim()]);
      setNewOfficialExam('');
    }
  };

  const handleDeleteOfficialExam = (index: number) => {
    setOfficialExams(officialExams.filter((_, i) => i !== index));
  };

  const handleAddAdditionalInfo = () => {
    if (additionalLanguageInfo.trim()) {
      setAdditionalLanguageInfoList([...additionalLanguageInfoList, additionalLanguageInfo.trim()]);
      setAdditionalLanguageInfo('');
    }
  };

  const handleDeleteAdditionalInfo = (index: number) => {
    setAdditionalLanguageInfoList(additionalLanguageInfoList.filter((_, i) => i !== index));
  };

  const handleAddLicense = () => {
    if (newLicense.trim()) {
      setLicenses([...licenses, newLicense.trim()]);
      setNewLicense('');
    }
  };

  const handleDeleteLicense = (index: number) => {
    setLicenses(licenses.filter((_, i) => i !== index));
  };

  const handleAddAward = () => {
    if (newAward.trim()) {
      setAwards([...awards, newAward.trim()]);
      setNewAward('');
    }
  };

  const handleDeleteAward = (index: number) => {
    setAwards(awards.filter((_, i) => i !== index));
  };

  // 확인 버튼 활성화 조건: 언어 레벨 선택 OR 공인시험 추가 OR 추가정보 OR 자격증 OR 수상/수료/활동
  const canConfirm = languageLevel !== '' || 
                     officialExams.length > 0 || 
                     additionalLanguageInfoList.length > 0 || 
                     licenses.length > 0 || 
                     awards.length > 0;

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

            {hasOfficialTest && (
              <div className="mb-4">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newOfficialExam}
                    onChange={(e) => setNewOfficialExam(e.target.value)}
                    placeholder="예: IELTS 9.0"
                    className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 focus:border-primary-mint focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-mint"
                  />
                  <button
                    type="button"
                    onClick={handleAddOfficialExam}
                    className="rounded-2xl bg-primary-mint px-4 py-3 text-[15px] font-semibold text-white hover:bg-primary-mint/90"
                  >
                    추가
                  </button>
                </div>
                {officialExams.length > 0 && (
                  <div className="space-y-2">
                    {officialExams.map((exam, index) => (
                      <div key={index} className="flex items-center justify-between rounded-xl bg-gray-100 px-4 py-3 text-[15px]">
                        <span>{exam}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteOfficialExam(index)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mb-2">
              <textarea
                value={additionalLanguageInfo}
                onChange={(e) => setAdditionalLanguageInfo(e.target.value)}
                placeholder="추가 어학 관련 정보 (예: 영어권 국가 거주 경험)"
                rows={4}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 focus:border-primary-mint focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-mint mb-2"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddAdditionalInfo}
                  className="w-fit rounded-2xl bg-primary-mint px-4 py-2 text-[15px] font-semibold text-white hover:bg-primary-mint/90"
                >
                  추가
                </button>
              </div>
            </div>
            {additionalLanguageInfoList.length > 0 && (
              <div className="space-y-2">
                {additionalLanguageInfoList.map((info, index) => (
                  <div key={index} className="flex items-center justify-between rounded-xl bg-gray-100 px-4 py-3 text-[15px]">
                    <span>{info}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteAdditionalInfo(index)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 자격증 탭 */}
        {activeTab === 'license' && (
          <>
            <h1 className="mb-4 text-[22px] font-semibold text-gray-900">자격증</h1>
            
            <div className="mb-4">
              <label className="mb-2 block text-[15px] font-medium text-gray-700">
                자격증 이름
              </label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newLicense}
                  onChange={(e) => setNewLicense(e.target.value)}
                  placeholder="예: 운전면허 1종 보통"
                  className="flex-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[15px] placeholder:text-gray-400 focus:border-primary-mint focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddLicense}
                  className="rounded-2xl bg-primary-mint px-4 py-3 text-[15px] font-semibold text-white hover:bg-primary-mint/90"
                >
                  추가
                </button>
              </div>
            </div>
            
            {licenses.length > 0 && (
              <div className="space-y-2">
                {licenses.map((license, index) => (
                  <div key={index} className="flex items-center justify-between rounded-xl bg-gray-100 px-4 py-3 text-[15px]">
                    <span>{license}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteLicense(index)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 수상, 수료, 활동 탭 */}
        {activeTab === 'awards' && (
          <>
            <h1 className="mb-4 text-[22px] font-semibold text-gray-900">수상, 수료, 활동</h1>
            
            <div className="mb-4">
              <label className="mb-2 block text-[15px] font-medium text-gray-700">
                내용
              </label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newAward}
                  onChange={(e) => setNewAward(e.target.value)}
                  placeholder="예: 우수사원상"
                  className="flex-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[15px] placeholder:text-gray-400 focus:border-primary-mint focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddAward}
                  className="rounded-2xl bg-primary-mint px-4 py-3 text-[15px] font-semibold text-white hover:bg-primary-mint/90"
                >
                  추가
                </button>
              </div>
            </div>

            {awards.length > 0 && (
              <div className="space-y-2">
                {awards.map((award, index) => (
                  <div key={index} className="flex items-center justify-between rounded-xl bg-gray-100 px-4 py-3 text-[15px]">
                    <span>{award}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteAward(index)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 max-w-[420px] mx-auto">
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => {
              const data = [
                ...officialExams.map(exam => `공인시험: ${exam}`),
                ...additionalLanguageInfoList.map(info => `추가정보: ${info}`),
                ...licenses.map(license => `자격증: ${license}`),
                ...awards.map(award => `수상/수료/활동: ${award}`)
              ].join(', ');
              onChangeData(data);
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
