import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Header } from '@/components/Header';

export const HiredConfirmation = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const applicantName = location.state?.applicantName || '지원자';

  useEffect(() => {
    // 3초 후 채용 확정 섹션으로 이동
    const timer = setTimeout(() => {
      navigate('/employer/recruitment?filter=interview_result&result=hired');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] p-8 max-w-md w-full text-center shadow-lg">
        <div className="mb-6">
          <div className="w-20 h-20 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-mint-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-[24px] font-bold text-text-900 mb-2">
            채용 확정이 되었습니다
          </h2>
          <p className="text-[16px] text-text-600">
            {applicantName}님의 첫 출근 일정이 확정되었습니다.
          </p>
        </div>
        
        <div className="bg-mint-50 rounded-[12px] p-4 mb-6">
          <p className="text-[14px] text-text-700">
            채용 확정 섹션에서 첫 출근 날짜를 확인할 수 있습니다.
          </p>
        </div>

        <button
          onClick={() => navigate('/employer/recruitment?filter=interview_result&result=hired')}
          className="w-full py-3 bg-mint-600 text-white rounded-[12px] font-medium text-[16px] hover:bg-mint-700 transition-colors"
        >
          채용 확정 섹션으로 이동
        </button>
      </div>
    </div>
  );
};

