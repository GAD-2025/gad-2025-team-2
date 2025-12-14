import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';

export const InterviewProposed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const interviewData = location.state?.interviewData;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header showBack title="면접 제안 완료" />

      <div className="p-4">
        {/* Success Message */}
        <div className="bg-white rounded-[16px] p-6 mb-5 text-center">
          <div className="w-20 h-20 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-mint-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-[20px] font-bold text-text-900 mb-2">
            면접 제안이 전송되었습니다
          </h2>
          <p className="text-[14px] text-text-500">
            지원자에게 면접 일정이 전달되었습니다
          </p>
        </div>

        {/* Interview Details */}
        {interviewData && (
          <div className="bg-white rounded-[16px] p-5 mb-5">
            <h3 className="text-[16px] font-bold text-text-900 mb-4">
              제안한 면접 일정
            </h3>
            <div className="space-y-3">
              {/* 선택된 날짜 */}
              <div>
                <p className="text-[13px] font-medium text-text-500 mb-2">
                  선택된 날짜
                </p>
                <div className="flex flex-wrap gap-2">
                  {interviewData.selectedDates.map((date: string) => {
                    const d = new Date(date);
                    return (
                      <span
                        key={date}
                        className="px-3 py-1.5 bg-mint-100 text-mint-700 rounded-[8px] text-[13px] font-medium"
                      >
                        {d.getMonth() + 1}/{d.getDate()}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* 시간 */}
              <div>
                <p className="text-[13px] font-medium text-text-500 mb-1">
                  면접 시간
                </p>
                <p className="text-[14px] text-text-900">
                  {interviewData.time}
                </p>
              </div>

              {/* 소요 시간 */}
              <div>
                <p className="text-[13px] font-medium text-text-500 mb-1">
                  예상 소요 시간
                </p>
                <p className="text-[14px] text-text-900">
                  {interviewData.duration}분
                </p>
              </div>

              {/* 메시지 */}
              {interviewData.message && (
                <div>
                  <p className="text-[13px] font-medium text-text-500 mb-1">
                    전달 메시지
                  </p>
                  <p className="text-[14px] text-text-700 whitespace-pre-wrap">
                    {interviewData.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/recruitment')}
            className="w-full h-[52px] bg-mint-600 text-white rounded-[12px] text-[16px] font-semibold hover:bg-mint-700 transition-colors"
          >
            채용 탭으로 돌아가기
          </button>
          <button
            onClick={() => navigate('/employer/home')}
            className="w-full h-[52px] bg-white border-2 border-line-200 text-text-700 rounded-[12px] text-[16px] font-semibold hover:bg-gray-50 transition-colors"
          >
            홈으로 가기
          </button>
        </div>
      </div>
    </div>
  );
};

