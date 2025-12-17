// @ts-nocheck
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface InterviewProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InterviewProposalData) => void;
  applicantName?: string;
}

export interface InterviewProposalData {
  selectedDates: string[]; // YYYY-MM-DD format
  time: string; // HH:mm format (모든 날짜 동일할 때, 첫 번째 시간)
  duration: number; // minutes (모든 날짜 동일할 때, 첫 번째 소요시간)
  message: string;
  dateSpecificTimes?: Record<string, { time: string; duration: number }[]>; // 날짜별 시간/소요시간 배열
  allDatesSame: boolean; // 모든 날짜 동일 여부
  allDatesTimeSlots?: { time: string; duration: number }[]; // 모든 날짜 동일 모드에서 여러 시간 슬롯
}

export const InterviewProposalModal = ({
  isOpen,
  onClose,
  onSubmit,
  applicantName = '지원자',
  initialData,
  coordinationMessages = [],
}: InterviewProposalModalProps) => {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [allDatesSame, setAllDatesSame] = useState<boolean>(false); // 모든 날짜 동일 체크박스 (기본값: 개별 설정)
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customTime, setCustomTime] = useState<string>('');
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [duration, setDuration] = useState<number>(30);
  const [customDuration, setCustomDuration] = useState<string>('');
  const [useCustomDuration, setUseCustomDuration] = useState(false);
  const [message, setMessage] = useState<string>('');
  
  // 모든 날짜 동일 모드에서 여러 시간 슬롯
  const [allDatesTimeSlots, setAllDatesTimeSlots] = useState<Array<{ time: string; duration: number; useCustomTime?: boolean; customTime?: string; useCustomDuration?: boolean; customDuration?: string }>>([
    { time: '', duration: 30 }
  ]);
  
  // 날짜별 시간/소요시간 저장 (날짜별로 다를 때) - 배열로 변경
  const [dateSpecificTimes, setDateSpecificTimes] = useState<Record<string, Array<{ time: string; duration: number; useCustomTime?: boolean; customTime?: string; useCustomDuration?: boolean; customDuration?: string }>>>({});
  
  // 저장된 날짜별 시간 슬롯 (저장 버튼을 누른 것들)
  const [savedDateTimes, setSavedDateTimes] = useState<Record<string, Array<{ time: string; duration: number; useCustomTime?: boolean; customTime?: string; useCustomDuration?: boolean; customDuration?: string }>>>({});
  
  // 모든 날짜 동일 모드에서 저장된 시간 슬롯
  const [savedAllDatesTimeSlots, setSavedAllDatesTimeSlots] = useState<Array<{ time: string; duration: number }>>([]);
  
  // 현재 시간 슬롯을 설정할 날짜 (하나만 선택)
  const [selectedDateForTimeSlot, setSelectedDateForTimeSlot] = useState<string | null>(null);
  
  // 현재 표시할 월 (0 = 현재 월, 1 = 다음 달, ...)
  const [currentMonthOffset, setCurrentMonthOffset] = useState<number>(0);

  // 모달이 열릴 때마다 상태 초기화 또는 초기 데이터 로드
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // 수정 모드: 초기 데이터로 채우기
        setSelectedDates(initialData.selectedDates || []);
        setAllDatesSame(initialData.allDatesSame !== undefined ? initialData.allDatesSame : false);
        setSelectedTime(initialData.time || '');
        setCustomTime('');
        setUseCustomTime(false);
        setDuration(initialData.duration || 30);
        setCustomDuration('');
        setUseCustomDuration(false);
        setMessage(initialData.message || '');
        setDateSpecificTimes(initialData.dateSpecificTimes || {});
        setSelectedDateForTimeSlot(null);
        if (initialData.allDatesSame && initialData.allDatesTimeSlots) {
          setAllDatesTimeSlots(initialData.allDatesTimeSlots);
          setSavedAllDatesTimeSlots(initialData.allDatesTimeSlots);
        } else {
          setAllDatesTimeSlots([{ time: '', duration: 30 }]);
          setSavedAllDatesTimeSlots([]);
        }
        if (initialData.dateSpecificTimes) {
          setSavedDateTimes(initialData.dateSpecificTimes);
        } else {
          setSavedDateTimes({});
        }
        setCurrentMonthOffset(0);
      } else {
        // 새로 만들기 모드: 초기화 (날짜별 개별 설정이 기본)
        setSelectedDates([]);
        setAllDatesSame(false); // 기본값: 날짜별 개별 설정
        setSelectedTime('');
        setCustomTime('');
        setUseCustomTime(false);
        setDuration(30);
        setCustomDuration('');
        setUseCustomDuration(false);
        setMessage('');
        setDateSpecificTimes({});
        setSavedDateTimes({});
        setSelectedDateForTimeSlot(null);
        setAllDatesTimeSlots([{ time: '', duration: 30 }]);
        setSavedAllDatesTimeSlots([]);
        setCurrentMonthOffset(0);
      }
    }
  }, [isOpen, initialData]);

  // selectedDates가 변경될 때 제거된 날짜의 편집 중인 데이터 정리
  useEffect(() => {
    if (!allDatesSame) {
      setDateSpecificTimes((prev) => {
        const updated = { ...prev };
        let hasChanges = false;
        
        // 제거된 날짜의 편집 중인 데이터 정리 (저장된 것은 유지)
        Object.keys(prev).forEach((date) => {
          if (!selectedDates.includes(date)) {
            delete updated[date];
            hasChanges = true;
          }
        });
        
        return hasChanges ? updated : prev;
      });
      
      // 선택된 날짜가 제거되면 선택 해제
      if (selectedDateForTimeSlot && !selectedDates.includes(selectedDateForTimeSlot)) {
        setSelectedDateForTimeSlot(null);
      }
    }
  }, [selectedDates, allDatesSame, selectedDateForTimeSlot]);

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

  // 현재 월 기준으로 3달 후까지 선택 가능
  const maxSelectableDate = new Date(today);
  maxSelectableDate.setMonth(maxSelectableDate.getMonth() + 3);
  
  const isDateSelectable = (date: Date): boolean => {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    const todayOnly = new Date(today);
    todayOnly.setHours(0, 0, 0, 0);
    const maxDateOnly = new Date(maxSelectableDate);
    maxDateOnly.setHours(0, 0, 0, 0);
    
    return dateOnly.getTime() >= todayOnly.getTime() && dateOnly.getTime() <= maxDateOnly.getTime();
  };

  const toggleDate = (date: Date) => {
    if (!isDateSelectable(date)) return;
    const dateStr = formatDate(date);
    setSelectedDates((prev) => {
      const isRemoving = prev.includes(dateStr);
      let newDates: string[];
      
      if (isRemoving) {
        // 날짜 제거
        newDates = prev.filter((d) => d !== dateStr);
        // 날짜 제거 시 해당 날짜의 시간 정보도 제거
        setDateSpecificTimes((prevTimes) => {
          const newTimes = { ...prevTimes };
          delete newTimes[dateStr];
          return newTimes;
        });
        setSavedDateTimes((prevSaved) => {
          const newSaved = { ...prevSaved };
          delete newSaved[dateStr];
          return newSaved;
        });
        // 선택된 날짜가 제거되면 선택 해제
        if (selectedDateForTimeSlot === dateStr) {
          setSelectedDateForTimeSlot(null);
        }
      } else {
        // 날짜 추가 - 날짜 순서대로 정렬
        newDates = [...prev, dateStr].sort((a, b) => {
          return new Date(a).getTime() - new Date(b).getTime();
        });
        // 새 날짜 추가 시 초기 시간 슬롯 생성 (저장되지 않은 상태)
        setDateSpecificTimes((prevTimes) => {
          if (!prevTimes[dateStr] && !savedDateTimes[dateStr]) {
            return {
              ...prevTimes,
              [dateStr]: [{ time: '', duration: 30 }],
            };
          }
          return prevTimes;
        });
        // 날짜를 선택하면 자동으로 해당 날짜의 시간 슬롯 설정 탭 표시
        setSelectedDateForTimeSlot(dateStr);
        // 저장된 날짜를 다시 선택한 경우 편집 가능하도록 복사
        if (savedDateTimes[dateStr] && !dateSpecificTimes[dateStr]) {
          setDateSpecificTimes((prev) => ({
            ...prev,
            [dateStr]: savedDateTimes[dateStr].map(slot => ({
              ...slot,
              useCustomTime: false,
              customTime: '',
              useCustomDuration: false,
              customDuration: '',
            })),
          }));
        }
      }
      
      return newDates;
    });
  };
  
  // 날짜 클릭 시 해당 날짜의 시간 슬롯 설정 탭 표시
  const handleDateClickForTimeSlot = (date: string) => {
    setSelectedDateForTimeSlot(date);
    // 해당 날짜의 시간 슬롯이 없으면 초기화
    if (!dateSpecificTimes[date] && !savedDateTimes[date]) {
      setDateSpecificTimes((prev) => ({
        ...prev,
        [date]: [{ time: '', duration: 30 }],
      }));
    } else if (savedDateTimes[date] && !dateSpecificTimes[date]) {
      // 저장된 날짜를 다시 편집할 때는 저장된 데이터를 복사 (편집 가능하도록)
      setDateSpecificTimes((prev) => ({
        ...prev,
        [date]: savedDateTimes[date].map(slot => ({
          ...slot,
          useCustomTime: false,
          customTime: '',
          useCustomDuration: false,
          customDuration: '',
        })),
      }));
    }
  };
  
  // 모든 날짜 동일 모드에서 시간 슬롯 저장
  const handleSaveAllDatesTimeSlots = () => {
    if (allDatesTimeSlots.length === 0) {
      toast.error('시간 슬롯을 최소 1개 이상 설정해주세요');
      return;
    }
    
    // 모든 슬롯이 유효한지 검증
    for (let i = 0; i < allDatesTimeSlots.length; i++) {
      const slot = allDatesTimeSlots[i];
      const finalTime = slot.useCustomTime ? slot.customTime : slot.time;
      if (!finalTime) {
        toast.error(`${i + 1}번째 시간 슬롯의 시간을 선택해주세요`);
        return;
      }
      const finalDuration = slot.useCustomDuration
        ? parseInt(slot.customDuration || '0')
        : slot.duration;
      if (!finalDuration || finalDuration < 10) {
        toast.error(`${i + 1}번째 시간 슬롯의 소요 시간을 올바르게 입력해주세요 (최소 10분)`);
        return;
      }
    }
    
    // 저장
    setSavedAllDatesTimeSlots(
      allDatesTimeSlots.map(slot => ({
        time: slot.useCustomTime ? (slot.customTime || '') : slot.time,
        duration: slot.useCustomDuration
          ? parseInt(slot.customDuration || '0')
          : slot.duration,
      }))
    );
    
    toast.success('저장되었습니다');
  };
  
  // 모든 날짜 동일 모드에서 변경사항 확인
  const hasAllDatesChanges = () => {
    if (savedAllDatesTimeSlots.length === 0) return false;
    if (savedAllDatesTimeSlots.length !== allDatesTimeSlots.length) return true;
    
    for (let i = 0; i < savedAllDatesTimeSlots.length; i++) {
      const savedSlot = savedAllDatesTimeSlots[i];
      const editingSlot = allDatesTimeSlots[i];
      const savedTime = savedSlot.time || '';
      const editingTime = editingSlot.useCustomTime ? (editingSlot.customTime || '') : (editingSlot.time || '');
      const savedDuration = savedSlot.duration || 0;
      const editingDuration = editingSlot.useCustomDuration
        ? parseInt(editingSlot.customDuration || '0')
        : (editingSlot.duration || 0);
      
      if (savedTime !== editingTime || savedDuration !== editingDuration) {
        return true;
      }
    }
    return false;
  };
  
  // 현재 선택된 날짜의 시간 슬롯 저장
  const handleSaveDateTimes = (date: string) => {
    const currentSlots = dateSpecificTimes[date];
    if (!currentSlots || currentSlots.length === 0) {
      toast.error('시간 슬롯을 최소 1개 이상 설정해주세요');
      return;
    }
    
    // 모든 슬롯이 유효한지 검증
    for (let i = 0; i < currentSlots.length; i++) {
      const slot = currentSlots[i];
      const finalTime = slot.useCustomTime ? slot.customTime : slot.time;
      if (!finalTime) {
        toast.error(`${i + 1}번째 시간 슬롯의 시간을 선택해주세요`);
        return;
      }
      const finalDuration = slot.useCustomDuration
        ? parseInt(slot.customDuration || '0')
        : slot.duration;
      if (!finalDuration || finalDuration < 10) {
        toast.error(`${i + 1}번째 시간 슬롯의 소요 시간을 올바르게 입력해주세요 (최소 10분)`);
        return;
      }
    }
    
    // 저장
    setSavedDateTimes((prev) => ({
      ...prev,
      [date]: currentSlots.map(slot => ({
        time: slot.useCustomTime ? (slot.customTime || '') : slot.time,
        duration: slot.useCustomDuration
          ? parseInt(slot.customDuration || '0')
          : slot.duration,
      })),
    }));
    
    toast.success('저장되었습니다');
  };
  
  // 현재 선택된 날짜의 시간 슬롯 수정 저장
  const handleUpdateDateTimes = (date: string) => {
    handleSaveDateTimes(date);
  };

  const isDateSelected = (date: Date): boolean => {
    return selectedDates.includes(formatDate(date));
  };

  const handleSubmit = () => {
    if (selectedDates.length === 0) {
      toast.error('면접 가능한 날짜를 최소 1개 이상 선택해주세요');
      return;
    }

    if (allDatesSame) {
      // 모든 날짜 동일 모드 - 저장된 시간 슬롯 사용 (저장되지 않았으면 현재 편집 중인 것 사용)
      const validTimeSlots: { time: string; duration: number }[] = savedAllDatesTimeSlots.length > 0 
        ? savedAllDatesTimeSlots 
        : [];
      
      // 저장된 것이 없으면 현재 편집 중인 것 검증
      if (validTimeSlots.length === 0) {
        for (let i = 0; i < allDatesTimeSlots.length; i++) {
          const slot = allDatesTimeSlots[i];
          const finalTime = slot.useCustomTime ? slot.customTime : slot.time;
          if (!finalTime) {
            toast.error(`${i + 1}번째 시간 슬롯의 시간을 선택해주세요`);
            return;
          }

          const finalDuration = slot.useCustomDuration
            ? parseInt(slot.customDuration || '0')
            : slot.duration;
          if (!finalDuration || finalDuration < 10) {
            toast.error(`${i + 1}번째 시간 슬롯의 소요 시간을 올바르게 입력해주세요 (최소 10분)`);
            return;
          }

          validTimeSlots.push({
            time: finalTime,
            duration: finalDuration,
          });
        }
      }

      if (validTimeSlots.length === 0) {
        toast.error('시간 슬롯을 저장해주세요');
        return;
      }

      onSubmit({
        selectedDates,
        time: validTimeSlots[0].time, // 첫 번째 시간 (호환성)
        duration: validTimeSlots[0].duration, // 첫 번째 소요시간 (호환성)
        message,
        allDatesSame: true,
        allDatesTimeSlots: validTimeSlots,
      });
    } else {
      // 날짜별로 다를 때 - 저장된 날짜별 시간 슬롯 검증
      const dateTimes: Record<string, { time: string; duration: number }[]> = {};
      let hasError = false;

      for (const date of selectedDates) {
        const savedSlots = savedDateTimes[date];
        if (!savedSlots || savedSlots.length === 0) {
          const d = new Date(date);
          toast.error(`${d.getMonth() + 1}월 ${d.getDate()}일의 시간 슬롯을 저장해주세요`);
          hasError = true;
          break;
        }

        dateTimes[date] = savedSlots;
      }

      if (hasError) return;

      onSubmit({
        selectedDates,
        time: '', // 날짜별로 다를 때는 빈 문자열
        duration: 0,
        message,
        dateSpecificTimes: dateTimes,
        allDatesSame: false,
      });
    }
  };

  if (!isOpen) return null;

  // 현재 표시할 월 계산
  const displayMonth = new Date(today.getFullYear(), today.getMonth() + currentMonthOffset, 1);
  const daysInMonth = getDaysInMonth(displayMonth);
  const firstDayOfMonth = displayMonth.getDay();
  const calendarDays: (Date | null)[] = [];

  // 빈 칸 추가
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // 날짜 추가
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(
      displayMonth.getFullYear(),
      displayMonth.getMonth(),
      day
    );
    calendarDays.push(date);
  }

  // 월 이동 함수
  const goToPreviousMonth = () => {
    if (currentMonthOffset > 0) {
      setCurrentMonthOffset(currentMonthOffset - 1);
    }
  };

  const goToNextMonth = () => {
    const maxMonth = 3; // 현재 월 기준 3달 후까지
    if (currentMonthOffset < maxMonth) {
      setCurrentMonthOffset(currentMonthOffset + 1);
    }
  };

  // 날짜별 시간 슬롯 업데이트 함수
  const updateDateTimeSlot = (date: string, slotIndex: number, field: 'time' | 'duration' | 'useCustomTime' | 'customTime' | 'useCustomDuration' | 'customDuration', value: any) => {
    setDateSpecificTimes((prev) => {
      const currentSlots = prev[date] || [{ time: '', duration: 30 }];
      const newSlots = [...currentSlots];
      newSlots[slotIndex] = {
        ...newSlots[slotIndex],
        [field]: value,
      };
      return {
        ...prev,
        [date]: newSlots,
      };
    });
  };

  // 날짜별 시간 슬롯 추가
  const addDateTimeSlot = (date: string) => {
    setDateSpecificTimes((prev) => {
      const currentSlots = prev[date] || [{ time: '', duration: 30 }];
      return {
        ...prev,
        [date]: [...currentSlots, { time: '', duration: 30 }],
      };
    });
  };

  // 날짜별 시간 슬롯 삭제
  const removeDateTimeSlot = (date: string, slotIndex: number) => {
    setDateSpecificTimes((prev) => {
      const currentSlots = prev[date] || [];
      if (currentSlots.length <= 1) return prev; // 최소 1개는 유지
      const newSlots = currentSlots.filter((_, i) => i !== slotIndex);
      return {
        ...prev,
        [date]: newSlots,
      };
    });
  };

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
            {initialData ? '조율 메시지를 바탕으로 면접 일정을 수정하세요.' : '면접 가능한 일자와 시간을 선택하세요'}
          </h2>
        </div>

        {/* 구직자가 보낸 조율 메시지 표시 (수정 모드일 때만) */}
        {initialData && coordinationMessages.length > 0 && (
          <div className="bg-white rounded-[16px] p-4 mb-4">
            <h3 className="text-[14px] font-semibold text-text-900 mb-3">구직자 조율 메시지</h3>
            <div className="space-y-2 max-h-[120px] overflow-y-auto">
              {coordinationMessages.map((msg, idx) => (
                <div key={idx} className="bg-mint-50 rounded-[8px] p-3 border border-mint-200">
                  <p className="text-[13px] text-text-700 whitespace-pre-wrap">{msg.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 날짜 선택 섹션 (하얀색 배경) */}
        <div className="bg-white rounded-[16px] p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[16px] font-bold text-text-900">
              날짜 선택
            </h3>
            {/* 월 이동 버튼 */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousMonth}
                disabled={currentMonthOffset === 0}
                className="w-7 h-7 rounded-[6px] flex items-center justify-center border border-line-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-mint-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-[13px] font-medium text-text-700 min-w-[80px] text-center">
                {displayMonth.getFullYear()}년 {displayMonth.getMonth() + 1}월
              </span>
              <button
                onClick={goToNextMonth}
                disabled={currentMonthOffset >= 3}
                className="w-7 h-7 rounded-[6px] flex items-center justify-center border border-line-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-mint-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
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
              <p className="text-[12px] text-text-500 mb-2">선택된 날짜 ({selectedDates.length}개):</p>
              <div className="flex flex-wrap gap-2">
                {[...selectedDates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).map((date) => {
                  const d = new Date(date);
                  const isSaved = savedDateTimes[date] && savedDateTimes[date].length > 0;
                  const isSelected = selectedDateForTimeSlot === date;
                  return (
                    <button
                      key={date}
                      onClick={() => handleDateClickForTimeSlot(date)}
                      className={`px-2.5 py-1.5 rounded-[6px] text-[12px] font-medium transition-all ${
                        isSelected
                          ? 'bg-mint-600 text-white'
                          : isSaved
                          ? 'bg-mint-100 text-mint-700 border border-mint-300'
                          : 'bg-gray-100 text-text-700 border border-gray-200'
                      }`}
                    >
                      <span>{d.getMonth() + 1}/{d.getDate()}</span>
                      {isSaved && (
                        <span className="ml-1.5 text-[11px]">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 시간대 선택 섹션 (하얀색 배경) */}
        <div className="bg-white rounded-[16px] p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[16px] font-bold text-text-900">
              시간대 선택
            </h3>
            {/* 모든 날짜 동일 체크박스 */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allDatesSame}
                onChange={(e) => {
                  setAllDatesSame(e.target.checked);
                  // 체크박스 해제 시 날짜별 시간 초기화
                  if (!e.target.checked) {
                    setDateSpecificTimes({});
                  }
                }}
                className="w-4 h-4 rounded border-line-300 text-mint-600 focus:ring-mint-500 focus:ring-2"
              />
              <span className="text-[13px] text-text-700 font-medium">모든 날짜 동일</span>
            </label>
          </div>
          
          {allDatesSame ? (
            // 모든 날짜 동일 모드 - 여러 시간 슬롯
            <div className="space-y-4">
              {selectedDates.length > 0 && (
                <div className="mb-3 pb-2 border-b border-line-200">
                  <p className="text-[12px] text-text-500 mb-1.5">선택된 날짜:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDates.map((date) => {
                      const d = new Date(date);
                      return (
                        <span
                          key={date}
                          className="px-2 py-1 bg-mint-100 text-mint-700 rounded-[6px] text-[11px] font-medium"
                        >
                          {d.getMonth() + 1}/{d.getDate()}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              {allDatesTimeSlots.map((slot, slotIndex) => (
                <div key={slotIndex} className="border border-line-200 rounded-[10px] p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[14px] font-semibold text-text-900">
                      시간 슬롯 {slotIndex + 1}
                    </h4>
                    {allDatesTimeSlots.length > 1 && (
                      <button
                        onClick={() => {
                          setAllDatesTimeSlots(prev => prev.filter((_, i) => i !== slotIndex));
                        }}
                        className="text-red-500 hover:text-red-700 text-[12px] font-medium"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {/* 가능한 시간 */}
                    <div>
                      <label className="block text-[13px] font-medium text-text-700 mb-1.5">
                        가능한 시간
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={slot.useCustomTime ? 'custom' : slot.time}
                          onChange={(e) => {
                            const newSlots = [...allDatesTimeSlots];
                            if (e.target.value === 'custom') {
                              newSlots[slotIndex] = { ...slot, useCustomTime: true };
                            } else {
                              newSlots[slotIndex] = { ...slot, useCustomTime: false, time: e.target.value };
                            }
                            setAllDatesTimeSlots(newSlots);
                          }}
                          className="flex-1 px-3 py-2 border border-line-200 rounded-[8px] text-[13px] focus:outline-none focus:ring-2 focus:ring-mint-500"
                        >
                          <option value="">시간 선택</option>
                          {timeOptions.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                          <option value="custom">직접 입력</option>
                        </select>
                        {slot.useCustomTime && (
                          <input
                            type="time"
                            value={slot.customTime || ''}
                            onChange={(e) => {
                              const newSlots = [...allDatesTimeSlots];
                              newSlots[slotIndex] = { ...slot, customTime: e.target.value };
                              setAllDatesTimeSlots(newSlots);
                            }}
                            className="flex-1 px-3 py-2 border border-line-200 rounded-[8px] text-[13px] focus:outline-none focus:ring-2 focus:ring-mint-500"
                          />
                        )}
                      </div>
                    </div>

                    {/* 면접 진행 소요 시간 */}
                    <div>
                      <label className="block text-[13px] font-medium text-text-700 mb-1.5">
                        면접 진행 소요 시간
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={slot.useCustomDuration ? 'custom' : slot.duration.toString()}
                          onChange={(e) => {
                            const newSlots = [...allDatesTimeSlots];
                            if (e.target.value === 'custom') {
                              newSlots[slotIndex] = { ...slot, useCustomDuration: true };
                            } else {
                              newSlots[slotIndex] = { ...slot, useCustomDuration: false, duration: parseInt(e.target.value) };
                            }
                            setAllDatesTimeSlots(newSlots);
                          }}
                          className="flex-1 px-3 py-2 border border-line-200 rounded-[8px] text-[13px] focus:outline-none focus:ring-2 focus:ring-mint-500"
                        >
                          {durationOptions.map((mins) => (
                            <option key={mins} value={mins}>
                              {mins}분
                            </option>
                          ))}
                          <option value="custom">직접 입력</option>
                        </select>
                        {slot.useCustomDuration && (
                          <input
                            type="number"
                            min="10"
                            step="10"
                            value={slot.customDuration || ''}
                            onChange={(e) => {
                              const newSlots = [...allDatesTimeSlots];
                              newSlots[slotIndex] = { ...slot, customDuration: e.target.value };
                              setAllDatesTimeSlots(newSlots);
                            }}
                            placeholder="분"
                            className="flex-1 px-3 py-2 border border-line-200 rounded-[8px] text-[13px] focus:outline-none focus:ring-2 focus:ring-mint-500"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* 시간 슬롯 추가 버튼 */}
              <button
                onClick={() => {
                  setAllDatesTimeSlots(prev => [...prev, { time: '', duration: 30 }]);
                }}
                className="w-full py-2.5 border-2 border-dashed border-mint-300 rounded-[10px] text-mint-600 text-[13px] font-medium hover:bg-mint-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                시간 슬롯 추가
              </button>
              
              {/* 저장/수정 버튼 */}
              <div className="mt-4 pt-3 border-t border-line-200">
                {savedAllDatesTimeSlots.length === 0 ? (
                  <button
                    onClick={handleSaveAllDatesTimeSlots}
                    className="w-full py-2.5 bg-mint-600 text-white rounded-[10px] text-[13px] font-medium hover:bg-mint-700 transition-colors"
                  >
                    저장
                  </button>
                ) : hasAllDatesChanges() ? (
                  <button
                    onClick={handleSaveAllDatesTimeSlots}
                    className="w-full py-2.5 bg-mint-600 text-white rounded-[10px] text-[13px] font-medium hover:bg-mint-700 transition-colors"
                  >
                    수정
                  </button>
                ) : (
                  <div className="w-full py-2.5 bg-mint-100 text-mint-700 rounded-[10px] text-[13px] font-medium text-center">
                    저장됨
                  </div>
                )}
              </div>
            </div>
          ) : (
            // 날짜별로 다를 때 - 선택한 날짜의 시간 슬롯만 표시
            <div className="space-y-4">
              {selectedDates.length === 0 ? (
                <p className="text-[13px] text-text-500 text-center py-3">
                  먼저 날짜를 선택해주세요
                </p>
              ) : !selectedDateForTimeSlot ? (
                <p className="text-[13px] text-text-500 text-center py-3">
                  위에서 날짜를 클릭하여 시간 슬롯을 설정해주세요
                </p>
              ) : (
                (() => {
                  // 선택된 날짜의 시간 슬롯 (편집 중이면 dateSpecificTimes, 아니면 savedDateTimes)
                  const dateTimeSlots = dateSpecificTimes[selectedDateForTimeSlot] || savedDateTimes[selectedDateForTimeSlot] || [{ time: '', duration: 30 }];
                  const d = new Date(selectedDateForTimeSlot);
                  const dateLabel = `${d.getMonth() + 1}월 ${d.getDate()}일`;
                  const isSaved = savedDateTimes[selectedDateForTimeSlot] && savedDateTimes[selectedDateForTimeSlot].length > 0;
                  
                  // 변경사항 확인: 저장된 데이터와 현재 편집 중인 데이터 비교
                  const hasChanges = (() => {
                    if (!isSaved || !dateSpecificTimes[selectedDateForTimeSlot]) return false;
                    const saved = savedDateTimes[selectedDateForTimeSlot];
                    const editing = dateSpecificTimes[selectedDateForTimeSlot];
                    
                    if (saved.length !== editing.length) return true;
                    
                    for (let i = 0; i < saved.length; i++) {
                      const savedSlot = saved[i];
                      const editingSlot = editing[i];
                      const savedTime = savedSlot.time || '';
                      const editingTime = editingSlot.useCustomTime ? (editingSlot.customTime || '') : (editingSlot.time || '');
                      const savedDuration = savedSlot.duration || 0;
                      const editingDuration = editingSlot.useCustomDuration
                        ? parseInt(editingSlot.customDuration || '0')
                        : (editingSlot.duration || 0);
                      
                      if (savedTime !== editingTime || savedDuration !== editingDuration) {
                        return true;
                      }
                    }
                    return false;
                  })();
                  
                  return (
                    <div className="border border-line-200 rounded-[10px] p-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-[14px] font-semibold text-text-900">
                          {dateLabel}
                        </h4>
                        {isSaved && (
                          <span className="px-2 py-1 bg-mint-100 text-mint-700 rounded-[6px] text-[11px] font-medium">
                            저장됨
                          </span>
                        )}
                      </div>
                      <div className="space-y-3">
                        {dateTimeSlots.map((slot, slotIndex) => (
                          <div key={slotIndex} className="border border-line-200 rounded-[8px] p-3 bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[12px] font-medium text-text-600">시간 슬롯 {slotIndex + 1}</span>
                              {dateTimeSlots.length > 1 && (
                                <button
                                  onClick={() => removeDateTimeSlot(selectedDateForTimeSlot, slotIndex)}
                                  className="text-red-500 hover:text-red-700 text-[11px] font-medium"
                                >
                                  삭제
                                </button>
                              )}
                            </div>
                            <div className="space-y-2.5">
                              {/* 가능한 시간 */}
                              <div>
                                <label className="block text-[12px] font-medium text-text-700 mb-1">
                                  가능한 시간
                                </label>
                                <div className="flex gap-2">
                                  <select
                                    value={slot.useCustomTime ? 'custom' : (slot.time || '')}
                                    onChange={(e) => {
                                      if (e.target.value === 'custom') {
                                        updateDateTimeSlot(selectedDateForTimeSlot, slotIndex, 'useCustomTime', true);
                                      } else {
                                        updateDateTimeSlot(selectedDateForTimeSlot, slotIndex, 'useCustomTime', false);
                                        updateDateTimeSlot(selectedDateForTimeSlot, slotIndex, 'time', e.target.value);
                                      }
                                    }}
                                    className="flex-1 px-2.5 py-1.5 border border-line-200 rounded-[8px] text-[12px] focus:outline-none focus:ring-2 focus:ring-mint-500"
                                  >
                                    <option value="">시간 선택</option>
                                    {timeOptions.map((time) => (
                                      <option key={time} value={time}>
                                        {time}
                                      </option>
                                    ))}
                                    <option value="custom">직접 입력</option>
                                  </select>
                                  {slot.useCustomTime && (
                                    <input
                                      type="time"
                                      value={slot.customTime || ''}
                                      onChange={(e) => updateDateTimeSlot(selectedDateForTimeSlot, slotIndex, 'customTime', e.target.value)}
                                      className="flex-1 px-2.5 py-1.5 border border-line-200 rounded-[8px] text-[12px] focus:outline-none focus:ring-2 focus:ring-mint-500"
                                    />
                                  )}
                                </div>
                              </div>

                              {/* 면접 진행 소요 시간 */}
                              <div>
                                <label className="block text-[12px] font-medium text-text-700 mb-1">
                                  면접 진행 소요 시간
                                </label>
                                <div className="flex gap-2">
                                  <select
                                    value={slot.useCustomDuration ? 'custom' : (slot.duration?.toString() || '30')}
                                    onChange={(e) => {
                                      if (e.target.value === 'custom') {
                                        updateDateTimeSlot(selectedDateForTimeSlot, slotIndex, 'useCustomDuration', true);
                                      } else {
                                        updateDateTimeSlot(selectedDateForTimeSlot, slotIndex, 'useCustomDuration', false);
                                        updateDateTimeSlot(selectedDateForTimeSlot, slotIndex, 'duration', parseInt(e.target.value));
                                      }
                                    }}
                                    className="flex-1 px-2.5 py-1.5 border border-line-200 rounded-[8px] text-[12px] focus:outline-none focus:ring-2 focus:ring-mint-500"
                                  >
                                    {durationOptions.map((mins) => (
                                      <option key={mins} value={mins}>
                                        {mins}분
                                      </option>
                                    ))}
                                    <option value="custom">직접 입력</option>
                                  </select>
                                  {slot.useCustomDuration && (
                                    <input
                                      type="number"
                                      min="10"
                                      step="10"
                                      value={slot.customDuration || ''}
                                      onChange={(e) => updateDateTimeSlot(selectedDateForTimeSlot, slotIndex, 'customDuration', e.target.value)}
                                      placeholder="분"
                                      className="flex-1 px-2.5 py-1.5 border border-line-200 rounded-[8px] text-[12px] focus:outline-none focus:ring-2 focus:ring-mint-500"
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* 시간 슬롯 추가 버튼 */}
                        <button
                          onClick={() => addDateTimeSlot(selectedDateForTimeSlot)}
                          className="w-full py-2 border-2 border-dashed border-mint-300 rounded-[8px] text-mint-600 text-[12px] font-medium hover:bg-mint-50 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          시간 슬롯 추가
                        </button>
                      </div>
                      
                      {/* 저장/수정 버튼 */}
                      <div className="mt-4 pt-3 border-t border-line-200">
                        {!isSaved ? (
                          <button
                            onClick={() => handleSaveDateTimes(selectedDateForTimeSlot)}
                            className="w-full py-2.5 bg-mint-600 text-white rounded-[10px] text-[13px] font-medium hover:bg-mint-700 transition-colors"
                          >
                            저장
                          </button>
                        ) : hasChanges ? (
                          <button
                            onClick={() => handleUpdateDateTimes(selectedDateForTimeSlot)}
                            className="w-full py-2.5 bg-mint-600 text-white rounded-[10px] text-[13px] font-medium hover:bg-mint-700 transition-colors"
                          >
                            수정
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          )}
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
              (allDatesSame && (
                (!useCustomTime && !selectedTime) ||
                (useCustomTime && !customTime) ||
                (useCustomDuration && !customDuration)
              ))
            }
            className="flex-1 px-4 py-3 bg-white text-mint-600 rounded-[12px] font-medium text-[14px] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white"
          >
            {initialData ? '수정 후 확정하기' : '면접 제안 보내기'}
          </button>
        </div>
      </div>
    </div>
  );
};


