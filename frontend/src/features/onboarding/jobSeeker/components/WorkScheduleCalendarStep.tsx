import { useState, useMemo } from 'react';

interface WorkScheduleCalendarStepProps {
  availableDates: string[];
  onToggleDate: (dateString: string) => void;
  onConfirm: () => void;
  onPrev: () => void;
}

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

// 날짜 유틸리티 함수들
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

export function WorkScheduleCalendarStep({
  availableDates,
  onToggleDate,
  onConfirm,
  onPrev,
}: WorkScheduleCalendarStepProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // 2026년 1월까지만 이동 가능
  const maxYear = 2026;
  const maxMonth = 0; // 0 = January

  const canGoNext = currentYear < maxYear || (currentYear === maxYear && currentMonth < maxMonth);

  const goToNextMonth = () => {
    if (canGoNext) {
      if (currentMonth === 11) {
        setCurrentYear(currentYear + 1);
        setCurrentMonth(0);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const goToPrevMonth = () => {
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    
    if (currentYear === todayYear && currentMonth === todayMonth) {
      // 이미 오늘 월이면 이전으로 갈 수 없음
      return;
    }
    
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);

    // 빈 칸 추가 (첫 번째 날짜 전)
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // 날짜 추가
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentYear, currentMonth, day));
    }

    return days;
  }, [currentYear, currentMonth]);

  const monthYearLabel = `${currentYear}년 ${currentMonth + 1}월`;

  const canConfirm = availableDates.length > 0;

  return (
    <div className="mx-auto flex h-screen w-full max-w-[420px] flex-col bg-white px-4 pb-24">
      <header className="mb-4 flex items-center gap-2 pt-4">
        <button type="button" onClick={onPrev} className="text-[26px] text-gray-700">
          ←
        </button>
        <span className="flex-1 text-center text-[19px] font-semibold text-gray-900">
          근무 가능 스케줄
        </span>
      </header>

      <div className="mb-4">
        <h1 className="mb-2 text-[22px] font-semibold text-gray-900">희망 근무 시작일*</h1>
        <p className="text-[15px] text-gray-500">
          근무 가능한 스케줄을 모두 입력하시면 맞춤 추천 구인/구직 정보를 드릴게요.
        </p>
      </div>

      {/* 월 네비게이션 */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={goToPrevMonth}
          disabled={currentYear === today.getFullYear() && currentMonth === today.getMonth()}
          className={`px-3 py-1 text-[15px] ${
            currentYear === today.getFullYear() && currentMonth === today.getMonth()
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-700'
          }`}
        >
          ←
        </button>
        <span className="text-[17px] font-semibold text-gray-900">{monthYearLabel}</span>
        <button
          type="button"
          onClick={goToNextMonth}
          disabled={!canGoNext}
          className={`px-3 py-1 text-[15px] ${canGoNext ? 'text-gray-700' : 'text-gray-300'}`}
        >
          →
        </button>
      </div>

      {/* 캘린더 */}
      <div className="mb-6">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="text-center text-[13px] font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dateString = formatDate(date);
            const isSelected = availableDates.includes(dateString);
            const isTodayDate = isToday(date);
            // 오늘 이전 날짜는 선택 불가 (오늘 포함 가능)
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            todayStart.setHours(0, 0, 0, 0);
            const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            dateStart.setHours(0, 0, 0, 0);
            const isPast = dateStart < todayStart;

            return (
              <button
                key={dateString}
                type="button"
                onClick={() => !isPast && onToggleDate(dateString)}
                disabled={isPast}
                className={`aspect-square rounded-full text-[15px] font-medium transition ${
                  isSelected
                    ? 'bg-primary-mint text-white'
                    : isTodayDate
                      ? 'bg-mint-100 text-primary-mint'
                      : isPast
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 max-w-[420px] mx-auto">
        <button
          type="button"
          onClick={onConfirm}
          disabled={!canConfirm}
          className={`h-12 w-full rounded-full text-[17px] font-semibold text-white transition ${
            canConfirm ? 'bg-primary-mint' : 'bg-gray-200 text-gray-400'
          }`}
        >
          확인
        </button>
      </div>
    </div>
  );
}

