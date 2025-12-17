import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface WorkDateCoordinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { firstWorkDate: string; firstWorkTime?: string; coordinationMessage?: string }) => void;
  applicantName?: string;
  currentFirstWorkDate?: string; // 현재 첫 출근 날짜 (YYYY-MM-DD)
  currentFirstWorkTime?: string; // 현재 첫 출근 시간 (HH:mm)
}

export const WorkDateCoordinationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  applicantName,
  currentFirstWorkDate,
  currentFirstWorkTime
}: WorkDateCoordinationModalProps) => {
  const [firstWorkDate, setFirstWorkDate] = useState<string>('');
  const [firstWorkTime, setFirstWorkTime] = useState<string>('');
  const [customTime, setCustomTime] = useState<string>('');
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [currentMonthOffset, setCurrentMonthOffset] = useState<number>(0);
  const [coordinationMessage, setCoordinationMessage] = useState('');

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      // 현재 날짜/시간으로 초기화 (없으면 오늘 날짜)
      setFirstWorkDate(currentFirstWorkDate || '');
      setFirstWorkTime(currentFirstWorkTime || '09:00');
      setCustomTime('');
      setUseCustomTime(false);
      setCoordinationMessage('');
      setCurrentMonthOffset(0);
    }
  }, [isOpen, currentFirstWorkDate, currentFirstWorkTime]);

  if (!isOpen) return null;

  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth() + currentMonthOffset, 1);
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = currentMonth.getDay();

  const timeOptions = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = selectedDate.toISOString().split('T')[0];
    setFirstWorkDate(dateStr);
  };

  const handleConfirm = () => {
    if (!firstWorkDate) {
      toast.error('첫 출근 날짜를 선택해주세요');
      return;
    }

    const finalTime = useCustomTime && customTime ? customTime : firstWorkTime;
    
    onConfirm({
      firstWorkDate,
      firstWorkTime: finalTime,
      coordinationMessage: coordinationMessage.trim() || undefined,
    });
  };

  const getDateClasses = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    const isSelected = firstWorkDate === dateStr;
    const isToday = dateStr === today.toISOString().split('T')[0];
    const isPast = date < today;

    return `
      aspect-square rounded-[8px] flex items-center justify-center text-[13px] font-medium transition-colors
      ${isSelected 
        ? 'bg-mint-600 text-white' 
        : isPast
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
        : isToday
        ? 'bg-mint-100 text-mint-700 border-2 border-mint-300'
        : 'bg-white text-text-700 border border-line-200 hover:bg-mint-50 hover:border-mint-300 cursor-pointer'
      }
    `;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[24px] p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] font-bold text-text-900">첫 출근 일자 조율</h2>
          <button
            onClick={onClose}
            className="text-text-500 hover:text-text-900"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {applicantName && (
          <p className="text-[14px] text-text-700 mb-4">
            <span className="font-semibold">{applicantName}</span>님의 첫 출근 일자를 조율합니다.
          </p>
        )}

        {/* 캘린더 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setCurrentMonthOffset(currentMonthOffset - 1)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-[16px] font-semibold text-text-900">
              {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
            </h3>
            <button
              onClick={() => setCurrentMonthOffset(currentMonthOffset + 1)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <div key={day} className="text-center text-[11px] font-medium text-text-500 py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* 빈 칸 */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {/* 날짜 */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const isPast = date < today;
              
              return (
                <button
                  key={day}
                  onClick={() => !isPast && handleDateClick(day)}
                  disabled={isPast}
                  className={getDateClasses(day)}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* 시간 선택 */}
        <div className="mb-6">
          <label className="block text-[14px] font-semibold text-text-900 mb-2">첫 출근 시간</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {timeOptions.map((time) => (
              <button
                key={time}
                onClick={() => {
                  setFirstWorkTime(time);
                  setUseCustomTime(false);
                }}
                className={`px-4 py-2 rounded-[8px] text-[13px] font-medium transition-colors ${
                  !useCustomTime && firstWorkTime === time
                    ? 'bg-mint-600 text-white'
                    : 'bg-white border border-line-200 text-text-700 hover:bg-mint-50 hover:border-mint-300'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="customTime"
              checked={useCustomTime}
              onChange={(e) => setUseCustomTime(e.target.checked)}
              className="w-4 h-4 text-mint-600 border-line-200 rounded focus:ring-mint-500"
            />
            <label htmlFor="customTime" className="text-[13px] text-text-700">직접 입력</label>
            {useCustomTime && (
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="ml-2 px-3 py-2 border border-line-200 rounded-[8px] text-[13px] focus:outline-none focus:ring-2 focus:ring-mint-500"
              />
            )}
          </div>
        </div>

        {/* 조율 메시지 */}
        <div className="mb-6">
          <label className="block text-[14px] font-semibold text-text-900 mb-2">조율 메시지 (선택)</label>
          <textarea
            value={coordinationMessage}
            onChange={(e) => setCoordinationMessage(e.target.value)}
            placeholder="첫 출근 일자 조율에 대한 메시지를 입력하세요"
            className="w-full px-3 py-2 border border-line-200 rounded-[8px] text-[13px] focus:outline-none focus:ring-2 focus:ring-mint-500 resize-none"
            rows={3}
          />
        </div>

        {/* 선택된 날짜/시간 표시 */}
        {firstWorkDate && (
          <div className="mb-6 p-4 bg-mint-50 border border-mint-200 rounded-[12px]">
            <p className="text-[13px] text-text-600 mb-1">선택된 첫 출근 일시</p>
            <p className="text-[15px] font-semibold text-text-900">
              {new Date(firstWorkDate).toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'short'
              })}
              {' '}
              {(useCustomTime && customTime ? customTime : firstWorkTime) || '시간 미정'}
            </p>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-[12px] font-medium text-[14px] hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 bg-mint-600 text-white rounded-[12px] font-medium text-[14px] hover:bg-mint-700 transition-colors"
          >
            확정하기
          </button>
        </div>
      </div>
    </div>
  );
};

