import { useState } from 'react';
import { toast } from 'react-toastify';

interface InterviewProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InterviewProposalData) => void;
  applicantName?: string;
}

export interface InterviewProposalData {
  selectedDates: string[]; // YYYY-MM-DD format
  time: string; // HH:mm format
  duration: number; // minutes
  message: string;
}

export const InterviewProposalModal = ({
  isOpen,
  onClose,
  onSubmit,
  applicantName = '지원자',
}: InterviewProposalModalProps) => {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customTime, setCustomTime] = useState<string>('');
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [duration, setDuration] = useState<number>(30);
  const [customDuration, setCustomDuration] = useState<string>('');
  const [useCustomDuration, setUseCustomDuration] = useState(false);
  const [message, setMessage] = useState<string>('');

  // 시간 옵션 생성 (30분 단위, 09:00 ~ 20:00)
  const timeOptions = [];
  for (let hour = 9; hour <= 20; hour++) {
    timeOptions.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 20) {
      timeOptions.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  // 소요 시간 옵션 (10분 단위, 10분 ~ 120분)
  const durationOptions = [];
  for (let minutes = 10; minutes <= 120; minutes += 10) {
    durationOptions.push(minutes);
  }

  // 캘린더 날짜 생성 (오늘부터 14일 후까지)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDateSelectable = (date: Date): boolean => {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    const todayOnly = new Date(today);
    todayOnly.setHours(0, 0, 0, 0);
    
    const diffTime = dateOnly.getTime() - todayOnly.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 14;
  };

  const toggleDate = (date: Date) => {
    if (!isDateSelectable(date)) return;
    const dateStr = formatDate(date);
    setSelectedDates((prev) =>
      prev.includes(dateStr)
        ? prev.filter((d) => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  const isDateSelected = (date: Date): boolean => {
    return selectedDates.includes(formatDate(date));
  };

  const handleSubmit = () => {
    if (selectedDates.length === 0) {
      toast.error('면접 가능한 날짜를 최소 1개 이상 선택해주세요');
      return;
    }

    const finalTime = useCustomTime ? customTime : selectedTime;
    if (!finalTime) {
      toast.error('면접 시간을 선택해주세요');
      return;
    }

    const finalDuration = useCustomDuration
      ? parseInt(customDuration)
      : duration;
    if (!finalDuration || finalDuration < 10) {
      toast.error('면접 소요 시간을 올바르게 입력해주세요 (최소 10분)');
      return;
    }

    onSubmit({
      selectedDates,
      time: finalTime,
      duration: finalDuration,
      message,
    });
  };

  if (!isOpen) return null;

  // 현재 월의 날짜들 생성
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfMonth = currentMonth.getDay();
  const calendarDays: (Date | null)[] = [];

  // 빈 칸 추가
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // 날짜 추가
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    calendarDays.push(date);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 (어두운 배경) */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 팝업 */}
      <div className="relative bg-mint-600 rounded-[24px] p-6 w-[90%] max-w-md max-h-[90vh] overflow-y-auto">
        {/* 화면 제목 */}
        <div className="mb-6">
          <h2 className="text-[20px] font-bold text-white mb-1">
            면접 제안하기
          </h2>
          <p className="text-[14px] text-white/90">
            면접 가능한 일자와 시간을 선택하세요
          </p>
        </div>

        {/* 날짜 선택 섹션 (하얀색 배경) */}
        <div className="bg-white rounded-[16px] p-4 mb-4">
          <h3 className="text-[16px] font-bold text-text-900 mb-3">
            날짜 선택
          </h3>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {/* 요일 헤더 */}
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <div
                key={day}
                className="text-center text-[12px] font-medium text-text-500 py-1"
              >
                {day}
              </div>
            ))}
            {/* 날짜 */}
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-10" />;
              }

              const isSelectable = isDateSelectable(date);
              const isSelected = isDateSelected(date);
              const dateOnly = new Date(date);
              dateOnly.setHours(0, 0, 0, 0);
              const todayOnly = new Date(today);
              todayOnly.setHours(0, 0, 0, 0);
              const isToday = dateOnly.getTime() === todayOnly.getTime();

              return (
                <button
                  key={formatDate(date)}
                  onClick={() => toggleDate(date)}
                  disabled={!isSelectable}
                  className={`h-10 rounded-[8px] text-[13px] font-medium transition-all ${
                    !isSelectable
                      ? 'text-gray-300 cursor-not-allowed'
                      : isSelected
                      ? 'bg-mint-600 text-white'
                      : isToday
                      ? 'bg-mint-100 text-mint-700 border border-mint-300'
                      : 'text-text-700 hover:bg-mint-50'
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          {selectedDates.length > 0 && (
            <div className="mt-3 pt-3 border-t border-line-200">
              <p className="text-[12px] text-text-500 mb-1">선택된 날짜:</p>
              <div className="flex flex-wrap gap-2">
                {selectedDates.map((date) => {
                  const d = new Date(date);
                  return (
                    <span
                      key={date}
                      className="px-2 py-1 bg-mint-100 text-mint-700 rounded-[6px] text-[12px] font-medium"
                    >
                      {d.getMonth() + 1}/{d.getDate()}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 시간대 선택 섹션 (하얀색 배경) */}
        <div className="bg-white rounded-[16px] p-4 mb-4">
          <h3 className="text-[16px] font-bold text-text-900 mb-3">
            시간대 선택
          </h3>
          <div className="space-y-3">
            {/* 가능한 시간 */}
            <div>
              <label className="block text-[14px] font-medium text-text-700 mb-2">
                가능한 시간
              </label>
              <div className="flex gap-2">
                <select
                  value={useCustomTime ? 'custom' : selectedTime}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setUseCustomTime(true);
                    } else {
                      setUseCustomTime(false);
                      setSelectedTime(e.target.value);
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-line-200 rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-mint-500"
                >
                  <option value="">시간 선택</option>
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                  <option value="custom">직접 입력</option>
                </select>
                {useCustomTime && (
                  <input
                    type="time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="flex-1 px-3 py-2 border border-line-200 rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-mint-500"
                  />
                )}
              </div>
            </div>

            {/* 면접 진행 소요 시간 */}
            <div>
              <label className="block text-[14px] font-medium text-text-700 mb-2">
                면접 진행 소요 시간
              </label>
              <div className="flex gap-2">
                <select
                  value={useCustomDuration ? 'custom' : duration.toString()}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setUseCustomDuration(true);
                    } else {
                      setUseCustomDuration(false);
                      setDuration(parseInt(e.target.value));
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-line-200 rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-mint-500"
                >
                  {durationOptions.map((mins) => (
                    <option key={mins} value={mins}>
                      {mins}분
                    </option>
                  ))}
                  <option value="custom">직접 입력</option>
                </select>
                {useCustomDuration && (
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    placeholder="분"
                    className="flex-1 px-3 py-2 border border-line-200 rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-mint-500"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 전달할 메시지 섹션 (하얀색 배경) */}
        <div className="bg-white rounded-[16px] p-4 mb-4">
          <h3 className="text-[16px] font-bold text-text-900 mb-3">
            전달할 메시지
          </h3>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="면접 제안 메시지를 입력하세요 (선택사항)"
            className="w-full px-3 py-2 border border-line-200 rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-mint-500 resize-none"
            rows={4}
          />
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white text-mint-600 rounded-[12px] font-medium text-[14px] hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              selectedDates.length === 0 ||
              (!useCustomTime && !selectedTime) ||
              (useCustomTime && !customTime) ||
              (useCustomDuration && !customDuration)
            }
            className="flex-1 px-4 py-3 bg-white text-mint-600 rounded-[12px] font-medium text-[14px] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white"
          >
            면접 제안 보내기
          </button>
        </div>
      </div>
    </div>
  );
};

