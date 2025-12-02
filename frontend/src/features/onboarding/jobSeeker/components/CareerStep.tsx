import { useState } from 'react';

interface Career {
  id: string;
  companyName: string;
  position: string;
  startDate: string;
  endDate: string;
  months: number;
}

interface CareerStepProps {
  careerData: string;
  onChangeData: (value: string) => void;
  onNext: () => void;
  onSkip: () => void;
  onPrev: () => void;
}

export function CareerStep({
  careerData,
  onChangeData,
  onNext,
  onSkip,
  onPrev,
}: CareerStepProps) {
  // Parse career data from string to array (임시로 빈 배열 사용)
  const [careers, setCareers] = useState<Career[]>([]);
  const [isNewbie, setIsNewbie] = useState(false);
  
  const totalMonths = careers.reduce((sum, career) => sum + career.months, 0);

  const handleAddCareer = () => {
    // TODO: 경력 추가 모달 열기
    console.log('경력 추가');
  };

  const handleEditCareer = (id: string) => {
    // TODO: 경력 수정 모달 열기
    console.log('경력 수정:', id);
  };

  const handleDeleteCareer = (id: string) => {
    setCareers(careers.filter(c => c.id !== id));
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    // 임시 계산 로직
    return '1년 7개월';
  };

  return (
    <div className="mx-auto flex h-screen w-full max-w-[420px] flex-col bg-gray-50 pb-24">
      <header className="mb-4 flex items-center gap-2 bg-white px-4 py-4 shadow-sm">
        <button type="button" onClick={onPrev} className="text-[24px] text-gray-700">
          ←
        </button>
        <span className="flex-1 text-center text-[19px] font-semibold text-gray-900">
          경력
        </span>
        <div className="w-6" />
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-2">
        <h1 className="mb-2 text-[22px] font-semibold text-gray-900">
          총 경력 <span className="text-primary-mint">{totalMonths}개월</span>
        </h1>
        <p className="mb-4 text-[14px] text-gray-500">
          경력은 최대 40개까지 추가 가능해요.<br />
          최근 근무일 순으로 보여져요.
        </p>

        <div className="mb-4 space-y-3">
          <button
            type="button"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="text-[24px]">📋</span>
              <span className="text-[15px] font-medium text-gray-900">자원내역에서 불러오기</span>
            </div>
          </button>
          <button
            type="button"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="text-[24px]">📝</span>
              <span className="text-[15px] font-medium text-gray-900">근무계약에서 불러오기</span>
            </div>
          </button>

          {/* 경력 없는 신입 체크박스 */}
          <div 
            onClick={() => setIsNewbie(!isNewbie)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                isNewbie 
                  ? 'border-primary-mint bg-primary-mint' 
                  : 'border-gray-300'
              }`}>
                {isNewbie && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-[15px] font-medium text-gray-900">경력 없는 신입이에요!</span>
            </div>
          </div>
        </div>

        {/* 경력 목록 */}
        {careers.length > 0 && (
          <div className="space-y-3">
            {careers.map((career) => (
              <div
                key={career.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-1 text-[16px] font-semibold text-gray-900">
                      {career.companyName}
                    </h3>
                    <p className="mb-2 text-[14px] text-gray-600">
                      {career.startDate} ~ {career.endDate} ({calculateDuration(career.startDate, career.endDate)})
                    </p>
                    <p className="text-[14px] text-gray-500">{career.position}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditCareer(career.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCareer(career.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 경력 추가 버튼 */}
        <button
          type="button"
          onClick={handleAddCareer}
          className="mt-4 w-full rounded-2xl border-2 border-dashed border-gray-300 bg-white py-4 text-[15px] font-medium text-gray-600 hover:border-primary-mint hover:text-primary-mint"
        >
          + 경력 추가하기
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 max-w-[420px] mx-auto">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 rounded-xl bg-gray-200 px-4 py-3.5 text-[17px] font-semibold text-gray-700 hover:bg-gray-300 transition-colors"
          >
            나중에 추가하기
          </button>
          <button
            type="button"
            onClick={onNext}
            className="flex-1 rounded-xl bg-primary-mint px-4 py-3.5 text-[17px] font-semibold text-white hover:bg-primary-mint/90 transition-colors"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}

