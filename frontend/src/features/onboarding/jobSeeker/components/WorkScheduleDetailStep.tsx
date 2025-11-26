import { useState } from 'react';
import { WorkSchedule } from '../types';

interface WorkScheduleDetailStepProps {
  workSchedule: WorkSchedule;
  onChangeTime: (startTime: string | null, endTime: string | null) => void;
  onToggleDay: (dayCode: string) => void;
  onToggleAllDays: () => void;
  onPrev: () => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

const TIME_OPTIONS = Array.from({ length: 25 }, (_, i) => {
  const hour = String(i).padStart(2, '0');
  return `${hour}:00`;
});

const DAYS_OF_WEEK = ['월', '화', '수', '목', '금', '토', '일'];

export function WorkScheduleDetailStep({
  workSchedule,
  onChangeTime,
  onToggleDay,
  onToggleAllDays,
  onPrev,
  onSubmit,
  isSubmitting,
}: WorkScheduleDetailStepProps) {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isAnytime, setIsAnytime] = useState(false);

  const { startTime, endTime, daysOfWeek } = workSchedule;

  const isAllDaysSelected = DAYS_OF_WEEK.every((day) => daysOfWeek.includes(day));

  // 무관이 체크되어 있거나, 시간이 모두 선택되어 있으면 확인 가능
  const canConfirm = (isAnytime || (startTime !== null && endTime !== null)) && daysOfWeek.length > 0;

  const handleTimeDisplayClick = () => {
    if (!isAnytime) {
      setShowTimePicker(!showTimePicker);
    }
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStartTime = e.target.value || null;
    onChangeTime(newStartTime, endTime);
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEndTime = e.target.value || null;
    onChangeTime(startTime, newEndTime);
  };

  const handleAnytimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsAnytime(checked);
    if (checked) {
      // 무관 선택 시 시간을 "00:00"으로 설정 (백엔드에서 무관으로 처리하도록)
      onChangeTime('00:00', '00:00');
      setShowTimePicker(false);
    } else {
      // 무관 해제 시 시간 초기화
      onChangeTime(null, null);
    }
  };

  const handleComplete = async () => {
    if (!canConfirm || isSubmitting) return;
    await onSubmit();
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col bg-white px-4 pb-10">
      <header className="mb-6 flex items-center gap-2">
        <button type="button" onClick={onPrev} className="text-[26px] text-gray-700">
          ←
        </button>
        <span className="flex-1 text-center text-[19px] font-semibold text-gray-900">
          근무 가능 스케줄
        </span>
      </header>

      <div className="mb-6">
        <h1 className="mb-2 text-[22px] font-semibold text-gray-900">근무 가능 요일 / 시간</h1>
        <p className="text-[15px] text-gray-500">
          추후에 수정이 가능해요.
        </p>
      </div>

      {/* 시간 섹션 */}
      <div className="mb-6">
        <label className="mb-2 block text-[15px] font-medium text-gray-700">시간</label>
        
        {/* 시간 표시 영역 (클릭 가능) */}
        <button
          type="button"
          onClick={handleTimeDisplayClick}
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left"
          disabled={isAnytime}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isAnytime ? (
                <span className="text-[17px] text-gray-400">무관</span>
              ) : startTime && endTime ? (
                <span className="text-[17px] font-medium text-gray-900">
                  {startTime} ~ {endTime}
                </span>
              ) : (
                <span className="text-[17px] text-gray-400">시간을 선택해주세요</span>
              )}
            </div>
            {!isAnytime && <span className="text-gray-400">{showTimePicker ? '▲' : '▼'}</span>}
          </div>
        </button>

        {/* 시간 선택 드롭다운 */}
        {showTimePicker && (
          <div className="mt-2 rounded-2xl border border-gray-200 bg-white p-4">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex-1">
                <label className="mb-2 block text-[13px] text-gray-500">시작 시간</label>
                <select
                  value={startTime || ''}
                  onChange={handleStartTimeChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[17px] text-gray-900"
                >
                  <option value="">선택</option>
                  {TIME_OPTIONS.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="mb-2 block text-[13px] text-gray-500">종료 시간</label>
                <select
                  value={endTime || ''}
                  onChange={handleEndTimeChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[17px] text-gray-900"
                >
                  <option value="">선택</option>
                  {TIME_OPTIONS.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anytime"
                checked={isAnytime}
                onChange={handleAnytimeChange}
                className="h-4 w-4 rounded border-gray-300 text-primary-mint"
              />
              <label htmlFor="anytime" className="text-[15px] text-gray-700">
                무관
              </label>
            </div>
          </div>
        )}
      </div>

      {/* 요일 섹션 */}
      <div className="mb-6">
        <label className="mb-3 block text-[15px] font-medium text-gray-700">
          적용할 요일
        </label>
        
        <div className="mb-3">
          <button
            type="button"
            onClick={onToggleAllDays}
            className={`rounded-full border px-4 py-2 text-[15px] font-medium transition ${
              isAllDaysSelected
                ? 'border-primary-mint bg-primary-mint text-white'
                : 'border-gray-300 bg-white text-gray-700'
            }`}
          >
            전체
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = daysOfWeek.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => onToggleDay(day)}
                className={`flex-1 rounded-full border px-4 py-3 text-[15px] font-medium transition ${
                  isSelected
                    ? 'border-primary-mint bg-primary-mint text-white'
                    : 'border-gray-300 bg-white text-gray-700'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="mt-auto pt-10">
        <button
          type="button"
          onClick={handleComplete}
          disabled={!canConfirm || isSubmitting}
          className={`h-12 w-full rounded-full text-[17px] font-semibold text-white transition ${
            canConfirm && !isSubmitting
              ? 'bg-primary-mint'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          {isSubmitting ? '저장 중...' : '확인'}
        </button>
      </div>
    </div>
  );
}

