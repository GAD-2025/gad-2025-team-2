import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Header } from '@/components/Header';
import { getJobSeekerProfile, type JobSeekerProfileData, applicationsAPI } from '@/api/endpoints';
import { useAuthStore } from '@/store/useAuth';

export const FirstWorkDateEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState<JobSeekerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [firstWorkDate, setFirstWorkDate] = useState<string>('');
  const [firstWorkTime, setFirstWorkTime] = useState<string>('');
  const [customTime, setCustomTime] = useState<string>('');
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [currentMonthOffset, setCurrentMonthOffset] = useState<number>(0);
  const [coordinationMessage, setCoordinationMessage] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        toast.error('지원자 ID가 없습니다');
        navigate('/employer/recruitment');
        return;
      }

      try {
        setLoading(true);
        const data = await getJobSeekerProfile(id);
        setApplicant(data);

        // 지원서 ID 찾기
        const signupUserId = useAuthStore.getState().signupUserId;
        const userId = signupUserId || localStorage.getItem('signup_user_id');
        if (userId) {
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
          const applicationsRes = await fetch(`${API_BASE_URL}/applications?userId=${userId}`);
          if (applicationsRes.ok) {
            const applications = await applicationsRes.json();
            const application = applications.find((app: any) => 
              app.seekerId === id || app.seeker?.id === id || app.jobseeker?.user_id === id
            );
            if (application) {
              setApplicationId(application.applicationId);
              
              // 기존 첫 출근 날짜 로드 (API 우선, localStorage fallback)
              const apiAcceptanceData = application.acceptanceData;
              if (apiAcceptanceData) {
                setFirstWorkDate(apiAcceptanceData.firstWorkDate || '');
                setFirstWorkTime(apiAcceptanceData.firstWorkTime || '');
              } else {
                // localStorage fallback
                const acceptanceKey = `acceptance_guide_${application.applicationId}`;
                const acceptanceData = localStorage.getItem(acceptanceKey);
                if (acceptanceData) {
                  const acceptance = JSON.parse(acceptanceData);
                  setFirstWorkDate(acceptance.firstWorkDate || '');
                  setFirstWorkTime(acceptance.firstWorkTime || '');
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
        toast.error('데이터를 불러오는데 실패했습니다');
        navigate('/employer/recruitment');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);


  const handleSave = async () => {
    if (!applicationId || !firstWorkDate) {
      toast.error('첫 출근 날짜를 선택해주세요');
      return;
    }

    try {
      // API로 첫 출근 날짜 업데이트
      await applicationsAPI.updateFirstWorkDate(applicationId, {
        firstWorkDate: firstWorkDate,
        firstWorkTime: useCustomTime ? customTime : firstWorkTime,
        coordinationMessage: coordinationMessage.trim() || undefined,
      });

      // localStorage에도 저장 (fallback)
      const acceptanceKey = `acceptance_guide_${applicationId}`;
      const acceptanceData = localStorage.getItem(acceptanceKey);
      if (acceptanceData) {
        const acceptance = JSON.parse(acceptanceData);
        acceptance.firstWorkDate = firstWorkDate;
        acceptance.firstWorkTime = useCustomTime ? customTime : firstWorkTime;
        localStorage.setItem(acceptanceKey, JSON.stringify(acceptance));
      }

      toast.success('첫 출근 날짜가 수정되었습니다');
      navigate(`/employer/applicant/${id}`);
    } catch (error) {
      console.error('[ERROR] 첫 출근 날짜 수정 실패:', error);
      // API 실패 시 localStorage만 저장 (fallback)
      try {
        const acceptanceKey = `acceptance_guide_${applicationId}`;
        const acceptanceData = localStorage.getItem(acceptanceKey);
        if (acceptanceData) {
          const acceptance = JSON.parse(acceptanceData);
          acceptance.firstWorkDate = firstWorkDate;
          acceptance.firstWorkTime = useCustomTime ? customTime : firstWorkTime;
          localStorage.setItem(acceptanceKey, JSON.stringify(acceptance));
        }
        toast.success('첫 출근 날짜가 저장되었습니다 (로컬 저장)');
        navigate(`/employer/applicant/${id}`);
      } catch (fallbackError) {
        toast.error('저장에 실패했습니다');
      }
    }
  };

  const handleConfirm = async () => {
    if (!applicationId || !firstWorkDate) {
      toast.error('첫 출근 날짜를 선택해주세요');
      return;
    }

    try {
      // API로 첫 출근 날짜 업데이트
      await applicationsAPI.updateFirstWorkDate(applicationId, {
        firstWorkDate: firstWorkDate,
        firstWorkTime: useCustomTime ? customTime : firstWorkTime,
        coordinationMessage: coordinationMessage.trim() || undefined,
      });

      // API로 출근 확정 처리 (채용 확정)
      await applicationsAPI.confirmWorkDate(applicationId, true);

      // localStorage에도 저장 (fallback)
      const acceptanceKey = `acceptance_guide_${applicationId}`;
      const acceptanceData = localStorage.getItem(acceptanceKey);
      if (acceptanceData) {
        const acceptance = JSON.parse(acceptanceData);
        acceptance.firstWorkDate = firstWorkDate;
        acceptance.firstWorkTime = useCustomTime ? customTime : firstWorkTime;
        acceptance.isHired = true;
        acceptance.hiredAt = new Date().toISOString();
        localStorage.setItem(acceptanceKey, JSON.stringify(acceptance));
      }

      // 채용 확정 완료 페이지로 이동
      navigate(`/employer/hired-confirmation/${applicationId}`, {
        state: { applicantName: applicant?.name }
      });
    } catch (error) {
      console.error('[ERROR] 채용 확정 실패:', error);
      // API 실패 시 localStorage만 저장하고 페이지 이동 (fallback)
      try {
        const acceptanceKey = `acceptance_guide_${applicationId}`;
        const acceptanceData = localStorage.getItem(acceptanceKey);
        if (acceptanceData) {
          const acceptance = JSON.parse(acceptanceData);
          acceptance.firstWorkDate = firstWorkDate;
          acceptance.firstWorkTime = useCustomTime ? customTime : firstWorkTime;
          acceptance.isHired = true;
          acceptance.hiredAt = new Date().toISOString();
          localStorage.setItem(acceptanceKey, JSON.stringify(acceptance));
        }
        localStorage.setItem(`first_work_date_confirmed_${applicationId}`, 'true');
        toast.success('채용이 확정되었습니다 (로컬 저장)');
        navigate(`/employer/hired-confirmation/${applicationId}`, {
          state: { applicantName: applicant?.name }
        });
      } catch (fallbackError) {
        toast.error('확정에 실패했습니다');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text-500">불러오는 중...</p>
      </div>
    );
  }

  const today = new Date();
  const displayMonth = new Date(today.getFullYear(), today.getMonth() + currentMonthOffset, 1);
  const daysInMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = displayMonth.getDay();

  const timeOptions = [];
  for (let hour = 9; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeStr);
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="첫 출근 일정 수정" showBack />

      <div className="p-4 space-y-4">
        {/* 지원자 정보 */}
        <div className="bg-white rounded-[16px] p-4 border border-line-200">
          <h3 className="text-[16px] font-bold text-text-900 mb-2">
            {applicant?.name || '지원자'}
          </h3>
          <p className="text-[14px] text-text-500">{applicant?.nationality_code || '국적 정보 없음'}</p>
        </div>

        {/* 첫 출근 날짜 선택 */}
        <div className="bg-white rounded-[16px] p-4 border border-line-200">
          <h3 className="text-[15px] font-semibold text-text-900 mb-3">첫 출근 날짜</h3>
          
          {/* 월 이동 */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setCurrentMonthOffset(prev => Math.max(0, prev - 1))}
              disabled={currentMonthOffset === 0}
              className="w-8 h-8 rounded-[6px] flex items-center justify-center border border-line-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-mint-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h4 className="text-[14px] font-semibold text-text-900">
              {displayMonth.getFullYear()}년 {displayMonth.getMonth() + 1}월
            </h4>
            <button
              onClick={() => setCurrentMonthOffset(prev => prev + 1)}
              className="w-8 h-8 rounded-[6px] flex items-center justify-center border border-line-200 hover:bg-mint-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* 캘린더 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <div key={day} className="text-center text-[11px] font-medium text-text-500 py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
              const dateStr = date.toISOString().split('T')[0];
              const isSelected = firstWorkDate === dateStr;
              const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
              
              return (
                <button
                  key={day}
                  onClick={() => !isPast && setFirstWorkDate(dateStr)}
                  disabled={isPast}
                  className={`aspect-square rounded-[6px] flex items-center justify-center text-[12px] font-medium transition-colors ${
                    isSelected
                      ? 'bg-mint-600 text-white'
                      : isPast
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-text-700 border border-line-200 hover:border-mint-300'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* 첫 출근 시간 선택 */}
        <div className="bg-white rounded-[16px] p-4 border border-line-200">
          <h3 className="text-[15px] font-semibold text-text-900 mb-3">첫 출근 시간</h3>
          <div className="space-y-2">
            <select
              value={useCustomTime ? '' : firstWorkTime}
              onChange={(e) => {
                setFirstWorkTime(e.target.value);
                setUseCustomTime(false);
              }}
              disabled={useCustomTime}
              className="w-full px-3 py-2 border border-line-200 rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-mint-500 disabled:bg-gray-100"
            >
              <option value="">시간 선택</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useCustomTime"
                checked={useCustomTime}
                onChange={(e) => setUseCustomTime(e.target.checked)}
                className="w-4 h-4 text-mint-600 border-line-200 rounded focus:ring-mint-500"
              />
              <label htmlFor="useCustomTime" className="text-[13px] text-text-700">
                직접 입력
              </label>
            </div>
            {useCustomTime && (
              <input
                type="text"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                placeholder="예: 09:00"
                className="w-full px-3 py-2 border border-line-200 rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-mint-500"
              />
            )}
          </div>
        </div>

        {/* 조율 메시지 */}
        <div className="bg-white rounded-[16px] p-4 border border-line-200">
          <h3 className="text-[15px] font-semibold text-text-900 mb-3">조율 메시지</h3>
          <textarea
            value={coordinationMessage}
            onChange={(e) => setCoordinationMessage(e.target.value)}
            placeholder="조율 메시지를 입력하세요"
            rows={3}
            className="w-full px-3 py-2 border border-line-200 rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-mint-500 resize-none"
          />
        </div>

        {/* 버튼 */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-line-200 px-4 py-3 safe-area-bottom z-50 shadow-lg">
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 h-11 rounded-[10px] bg-gray-100 text-gray-700 font-medium text-[14px] hover:bg-gray-200 transition-colors"
            >
              저장
            </button>
            <button
              onClick={handleConfirm}
              disabled={!firstWorkDate}
              className="flex-1 h-11 rounded-[10px] bg-mint-600 text-white font-medium text-[14px] hover:bg-mint-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              수정 후 확정하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

