import { useNavigate } from 'react-router-dom';
import { OnboardingFormValues } from '../types';

interface OnboardingCompleteStepProps {
  values: OnboardingFormValues;
  onGoToHome: () => void;
}

const JOB_CATEGORIES: Record<string, string> = {
  store: '매장관리 · 판매',
  service: '서비스',
  serving: '서빙',
  kitchen: '주방',
  labor: '단순노무 · 분류 · 택배',
  delivery: '배달 · 운송 · 운전',
  event: '행사 · 스텝 · 미디어',
  office: '사무 · 회계 · 관리',
  sales: '영업 · 마케팅',
};

const DAYS_OF_WEEK_MAP: Record<string, string> = {
  월: '월',
  화: '화',
  수: '수',
  목: '목',
  금: '금',
  토: '토',
  일: '일',
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[date.getDay()];
    return `${year}.${month}.${day}(${dayName})`;
  } catch {
    return dateString;
  }
};

export function OnboardingCompleteStep({
  values,
  onGoToHome,
}: OnboardingCompleteStepProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/signup');
  };

  // localStorage에서 회원가입 시 입력한 이름 가져오기
  const userName =
    typeof window !== 'undefined'
      ? localStorage.getItem('signup_user_name') || '회원님'
      : '회원님';

  // 프로필 요약 데이터 준비
  const preferredJobLabels = values.preferredJobs
    .map((id) => JOB_CATEGORIES[id] || id)
    .join(', ');

  const firstAvailableDate =
    values.workSchedule.availableDates.length > 0
      ? formatDate(values.workSchedule.availableDates[0])
      : '미정';

  const workDaysLabel = values.workSchedule.daysOfWeek
    .map((day) => DAYS_OF_WEEK_MAP[day] || day)
    .join(', ');

  const workTimeLabel =
    values.workSchedule.startTime && values.workSchedule.endTime
      ? `${values.workSchedule.startTime} ~ ${values.workSchedule.endTime}`
      : '미정';

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col bg-white">
      {/* 헤더 */}
      <header className="flex items-center gap-2 px-4 pt-8 pb-6">
        <button type="button" onClick={handleBack} className="text-lg text-gray-700">
          ←
        </button>
        <span className="flex-1 text-center text-base font-semibold text-gray-900">
          프로필 작성
        </span>
        <div className="w-6" /> {/* 균형을 위한 빈 공간 */}
      </header>

      {/* 스크롤 가능한 내용 영역 */}
      <div className="flex-1 overflow-y-auto px-4">
        {/* 완료 배지 영역 */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-emerald-50">
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold text-emerald-500">100</span>
              <span className="text-2xl">🎉</span>
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-semibold text-gray-900">
            프로필 작성을 마쳤어요!
          </h1>
          <p className="text-sm text-gray-500">
            완성된 내 프로필을 살펴보세요.
          </p>
        </div>

        {/* 프로필 요약 카드 */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gray-200" />
              <div>
                <p className="text-base font-semibold text-gray-900">{userName}</p>
                <p className="text-sm text-gray-500">구직자</p>
              </div>
            </div>
            <button
              type="button"
              className="text-sm text-gray-400"
              aria-label="편집"
            >
              ✏️
            </button>
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-4">
            {/* 희망 지역 */}
            {values.preferredRegions.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">희망 지역</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {values.preferredRegions.join(', ')}
                  </span>
                  <button
                    type="button"
                    className="text-xs text-gray-400"
                    aria-label="변경"
                  >
                    변경
                  </button>
                </div>
              </div>
            )}

            {/* 희망 업무 */}
            {values.preferredJobs.length > 0 && (
              <div className="flex items-start justify-between">
                <span className="text-sm text-gray-500">희망 업무</span>
                <span className="max-w-[60%] text-right text-sm font-medium text-gray-900">
                  {preferredJobLabels}
                </span>
              </div>
            )}

            {/* 희망 근무 시작일 */}
            {values.workSchedule.availableDates.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">희망 근무 시작일</span>
                <span className="text-sm font-medium text-gray-900">
                  {firstAvailableDate}
                </span>
              </div>
            )}

            {/* 근무 가능 요일/시간 */}
            {(values.workSchedule.daysOfWeek.length > 0 ||
              (values.workSchedule.startTime && values.workSchedule.endTime)) && (
              <div className="flex items-start justify-between">
                <span className="text-sm text-gray-500">근무 가능 요일/시간</span>
                <div className="max-w-[60%] text-right">
                  {workDaysLabel && (
                    <div className="mb-1 flex flex-wrap justify-end gap-1">
                      {values.workSchedule.daysOfWeek.map((day) => (
                        <span
                          key={day}
                          className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
                        >
                          {DAYS_OF_WEEK_MAP[day] || day}
                        </span>
                      ))}
                    </div>
                  )}
                  {workTimeLabel && (
                    <span className="text-sm font-medium text-gray-900">
                      {workTimeLabel}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 하단 버튼 (고정) */}
      <div className="border-t border-gray-100 px-4 pb-6 pt-4">
        <button
          type="button"
          onClick={onGoToHome}
          className="h-12 w-full rounded-full bg-emerald-500 text-base font-semibold text-white transition hover:bg-emerald-600"
        >
          내 주변 알바 찾기
        </button>
      </div>
    </div>
  );
}



