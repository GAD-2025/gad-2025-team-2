import { useState, useEffect, useRef } from 'react';
import { KOREA_REGIONS } from '@/constants/locations';

interface EmployerFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: EmployerFilterState) => void;
  initialFilters?: EmployerFilterState;
}

export interface EmployerFilterState {
  languageLevel: string;
  city?: string | null;
  locations: string[]; // 구/군
  experience: string;
  workSchedule: string[];
  visas?: string | null;
}

export const EmployerFilterModal = ({ isOpen, onClose, onApply, initialFilters }: EmployerFilterModalProps) => {
  const [selectedFilters, setSelectedFilters] = useState<EmployerFilterState>(
    initialFilters || {
      languageLevel: '',
      city: null,
      locations: [],
      experience: '',
      workSchedule: [],
      visas: null,
    }
  );
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(initialFilters?.city || null);

  // 브라우저 뒤로가기 이벤트 처리
  useEffect(() => {
    if (!isOpen) return;

    // 모달이 열릴 때 history에 상태 추가
    window.history.pushState({ modalOpen: true }, '', window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      // 모달이 열려있을 때 뒤로가기를 누르면 모달만 닫기
      onClose();
      // 현재 페이지에 머물기 위해 다시 pushState
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  // 버튼 클릭 이벤트를 직접 바인딩
  useEffect(() => {
    if (!isOpen || !backButtonRef.current) return;
    
    const button = backButtonRef.current;
    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('직접 바인딩된 클릭 이벤트');
      onClose();
    };

    button.addEventListener('click', handleClick);
    return () => {
      button.removeEventListener('click', handleClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 선택된 city는 state로, district들은 selectedFilters.locations에 저장
  const languageLevels = [
    { id: 'lv1', label: 'Lv.1 기초' },
    { id: 'lv2', label: 'Lv.2 초급' },
    { id: 'lv3', label: 'Lv.3 중급' },
    { id: 'lv4', label: 'Lv.4 상급' }
  ];

  const cityNames = Object.keys(KOREA_REGIONS);

  const experiences = [
    '경력 무관', '1년 미만', '1-2년', '2-3년', '3년 이상'
  ];

  const workSchedules = [
    '주말', '평일', '주 2-3일', '주 4-5일', '풀타임', '무관'
  ];

  const visaOptions = ['E-9', 'H-2', 'F-4', 'F-5', 'F-6', 'D-10'];

  const setVisa = (value: string) => {
    setSelectedFilters((prev) => ({ ...prev, visas: prev.visas === value ? null : value }));
  };

  const setLanguageLevel = (value: string) => {
    setSelectedFilters((prev) => ({ ...prev, languageLevel: value }));
  };

  const setCity = (value: string) => {
    setSelectedCity(value);
    // 도시 바꾸면 구/군 초기화
    setSelectedFilters((prev) => ({ ...prev, city: value, locations: [] }));
  };

  const toggleDistrict = (value: string) => {
    setSelectedFilters((prev) => {
      const current = prev.locations || [];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, locations: next, city: selectedCity };
    });
  };

  const toggleLocation = (value: string) => {
    setSelectedFilters((prev) => {
      const currentLocations = prev.locations;
      const newLocations = currentLocations.includes(value)
        ? currentLocations.filter((v) => v !== value)
        : [...currentLocations, value];
      return { ...prev, locations: newLocations };
    });
  };

  const setExperience = (value: string) => {
    setSelectedFilters((prev) => ({ ...prev, experience: value }));
  };

  const toggleWorkSchedule = (value: string) => {
    setSelectedFilters((prev) => {
      const currentSchedule = prev.workSchedule;
      const newSchedule = currentSchedule.includes(value)
        ? currentSchedule.filter((v) => v !== value)
        : [...currentSchedule, value];
      return { ...prev, workSchedule: newSchedule };
    });
  };

  const handleApply = () => {
    onApply(selectedFilters);
    onClose();
  };

  const handleBackClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('뒤로가기 버튼 클릭됨');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-[500px] bg-white rounded-t-[24px] shadow-xl 
                    animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-line-200 px-4 py-4 flex items-center rounded-t-[24px] z-10">
          <button 
            ref={backButtonRef}
            onClick={handleBackClick}
            onMouseDown={(e) => e.preventDefault()}
            className="relative min-w-[44px] min-h-[44px] p-2 -ml-2 cursor-pointer 
                     flex items-center justify-center
                     hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors
                     touch-manipulation"
            type="button"
            aria-label="뒤로가기"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <svg 
              className="w-6 h-6 text-text-900 pointer-events-none" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              style={{ pointerEvents: 'none' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="flex-1 text-center text-[18px] font-bold text-text-900 -ml-10">
            검색 조건 설정
          </h2>
        </div>

        {/* Content */}
        <div className="px-4 py-6 pb-32">
          {/* 언어 능력 */}
          <div className="mb-8">
            <h3 className="text-[17px] font-bold text-text-900 mb-4">언어 능력</h3>
            <div className="flex flex-wrap gap-2">
              {languageLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setLanguageLevel(level.label)}
                  className={`px-5 py-3 rounded-full text-[14px] font-medium transition-all ${
                    selectedFilters.languageLevel === level.label
                      ? 'bg-mint-600 text-white shadow-sm'
                      : 'bg-gray-100 text-text-700 hover:bg-gray-200'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* 거주지: 시/도 → 구/군 */}
          <div className="mb-8">
            <h3 className="text-[17px] font-bold text-text-900 mb-4">지역 설정</h3>
            {/* 시/도 선택 */}
            <div className="flex flex-wrap gap-2 mb-3">
              {cityNames.map((city) => (
                <button
                  key={city}
                  onClick={() => setCity(city)}
                  className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                    selectedCity === city
                      ? 'bg-mint-600 text-white shadow-sm'
                      : 'bg-gray-100 text-text-700 hover:bg-gray-200'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
            {/* 구/군 선택 */}
            {selectedCity && (
              <div className="flex flex-wrap gap-2">
                {(KOREA_REGIONS[selectedCity] || []).map((district) => (
                  <button
                    key={district}
                    onClick={() => toggleDistrict(district)}
                    className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                      selectedFilters.locations.includes(district)
                        ? 'bg-mint-600 text-white shadow-sm'
                        : 'bg-gray-100 text-text-700 hover:bg-gray-200'
                    }`}
                  >
                    {district}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 경력사항 */}
          <div className="mb-8">
            <h3 className="text-[17px] font-bold text-text-900 mb-4">경력사항</h3>
            <div className="flex flex-wrap gap-2">
              {experiences.map((exp) => (
                <button
                  key={exp}
                  onClick={() => setExperience(exp)}
                  className={`px-5 py-3 rounded-full text-[14px] font-medium transition-all ${
                    selectedFilters.experience === exp
                      ? 'bg-mint-600 text-white shadow-sm'
                      : 'bg-gray-100 text-text-700 hover:bg-gray-200'
                  }`}
                >
                  {exp}
                </button>
              ))}
            </div>
          </div>

          {/* 근무 가능 시간 */}
          <div className="mb-8">
            <h3 className="text-[17px] font-bold text-text-900 mb-4">근무 가능 시간</h3>
            <div className="flex flex-wrap gap-2">
              {workSchedules.map((schedule) => (
                <button
                  key={schedule}
                  onClick={() => toggleWorkSchedule(schedule)}
                  className={`px-5 py-3 rounded-full text-[14px] font-medium transition-all ${
                    selectedFilters.workSchedule.includes(schedule)
                      ? 'bg-mint-600 text-white shadow-sm'
                      : 'bg-gray-100 text-text-700 hover:bg-gray-200'
                  }`}
                >
                  {schedule}
                </button>
              ))}
            </div>
          </div>

          {/* 비자 종류 */}
          <div className="mb-8">
            <h3 className="text-[17px] font-bold text-text-900 mb-4">비자 종류</h3>
            <div className="flex flex-wrap gap-2">
              {visaOptions.map((v) => (
                <button
                  key={v}
                  onClick={() => setVisa(v)}
                  className={`px-5 py-3 rounded-full text-[14px] font-medium transition-all ${
                    selectedFilters.visas === v
                      ? 'bg-mint-600 text-white shadow-sm'
                      : 'bg-gray-100 text-text-700 hover:bg-gray-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer - Apply Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-line-200 p-4"
             style={{ maxWidth: '500px', margin: '0 auto' }}>
          <button
            onClick={handleApply}
            className="w-full h-[56px] bg-mint-600 text-white rounded-[16px] text-[17px] 
                     font-bold hover:bg-mint-700 transition-colors shadow-sm"
          >
            적용하기
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

