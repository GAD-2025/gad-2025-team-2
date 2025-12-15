import { useEffect, useState } from 'react';
import { KOREA_REGIONS } from '@/constants/locations';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  languageLevel: string[];
  locations: string[];
  experience: string[];
  visas?: string | null;
  city?: string | null;
}

export const FilterModal = ({ isOpen, onClose, onApply, initialFilters }: FilterModalProps) => {
  const [selectedFilters, setSelectedFilters] = useState<FilterState>(
    initialFilters || {
      languageLevel: [],
      locations: [],
      experience: [],
      visas: null,
      city: null,
    }
  );

  const languageLevels = ['Lv.1 기초', 'Lv.2 초급', 'Lv.3 중급', 'Lv.4 상급'];
  const cities = Object.keys(KOREA_REGIONS);
  const districts = selectedFilters.city ? KOREA_REGIONS[selectedFilters.city] || [] : [];
  const experiences = ['경력 없음', '1년 미만', '1-2년', '2-3년', '3년 이상'];
  const workPreferences = ['주말', '평일', '무관'];
  const visaOptions = ['E-9', 'H-2', 'F-4', 'F-5', 'F-6', 'D-10'];

  // 초기 필터값이 바뀌면 모달 상태도 동기화
  useEffect(() => {
    if (initialFilters) {
      setSelectedFilters(initialFilters);
    }
  }, [initialFilters]);

  if (!isOpen) return null;

  const toggleVisa = (value: string) => {
    setSelectedFilters((prev) => ({ ...prev, visas: prev.visas === value ? null : value }));
  };

  const toggleFilter = (category: 'languageLevel' | 'locations' | 'experience', value: string) => {
    setSelectedFilters((prev) => {
      const currentValues = prev[category] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      return { ...prev, [category]: newValues };
    });
  };

  const selectCity = (city: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      city,
      // 도시를 바꾸면 구 선택 초기화
      locations: [],
    }));
  };

  const handleApply = () => {
    onApply(selectedFilters);
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
      <div className="relative w-full max-w-[500px] bg-white rounded-t-[24px] shadow-xl 
                    animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-line-200 px-4 py-4 flex items-center rounded-t-[24px]">
          <button onClick={onClose} className="p-3 -ml-3 flex items-center justify-center">
            <svg className="w-6 h-6 text-text-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="flex-1 text-center text-[18px] font-bold text-text-900 -ml-10">
            검색 조건 설정
          </h2>
        </div>

        {/* Content */}
        <div className="px-4 py-6 pb-24">
          {/* 언어 능력 */}
          <div className="mb-8">
            <h3 className="text-[16px] font-semibold text-text-900 mb-3">언어 능력</h3>
            <div className="flex flex-wrap gap-2">
              {languageLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => toggleFilter('languageLevel', level)}
                  className={`px-4 py-2 rounded-full text-[14px] font-medium transition-colors ${
                    selectedFilters.languageLevel.includes(level)
                      ? 'bg-mint-600 text-white'
                      : 'bg-gray-100 text-text-700 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* 거주지 */}
          <div className="mb-8">
          <h3 className="text-[16px] font-semibold text-text-900 mb-3">지역 설정</h3>
          <p className="text-[12px] text-text-500 mb-2">시/도를 선택한 뒤 구/군을 고르세요.</p>
          {/* 1단계: 시/도 선택 - 가로 스크롤 */}
          <div className="mb-3 overflow-x-auto">
            <div className="flex flex-nowrap gap-2 pb-2 min-w-full items-center">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => selectCity(city)}
                className={`shrink-0 px-4 py-2 rounded-full text-[14px] font-medium transition-colors whitespace-nowrap ${
                  selectedFilters.city === city
                    ? 'bg-mint-600 text-white'
                    : 'bg-gray-100 text-text-700 hover:bg-gray-200'
                }`}
              >
                {city}
              </button>
            ))}
            </div>
          </div>
          {/* 2단계: 구/군 선택 - 가로 스크롤 */}
          {selectedFilters.city && (
            <div className="overflow-x-auto">
              <div className="flex flex-nowrap gap-2 pb-2 min-w-full items-center">
                {districts.map((location) => (
                  <button
                    key={location}
                    onClick={() => toggleFilter('locations', location)}
                    className={`shrink-0 px-4 py-2 rounded-full text-[14px] font-medium transition-colors whitespace-nowrap ${
                      selectedFilters.locations.includes(location)
                        ? 'bg-mint-600 text-white'
                        : 'bg-gray-100 text-text-700 hover:bg-gray-200'
                    }`}
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>
          )}
          </div>

          {/* 경력사항 */}
          <div className="mb-8">
            <h3 className="text-[16px] font-semibold text-text-900 mb-3">경력사항</h3>
            <div className="flex flex-wrap gap-2">
              {experiences.map((exp) => (
                <button
                  key={exp}
                  onClick={() => toggleFilter('experience', exp)}
                  className={`px-4 py-2 rounded-full text-[14px] font-medium transition-colors ${
                    selectedFilters.experience.includes(exp)
                      ? 'bg-mint-600 text-white'
                      : 'bg-gray-100 text-text-700 hover:bg-gray-200'
                  }`}
                >
                  {exp}
                </button>
              ))}
            </div>
          </div>

          {/* 근무 조건 */}
          <div className="mb-8">
            <h3 className="text-[16px] font-semibold text-text-900 mb-3">근무 조건</h3>
            <div className="flex flex-wrap gap-2">
              {workPreferences.map((pref) => (
                <button
                  key={pref}
                  onClick={() => toggleFilter('experience', pref)}
                  className={`px-4 py-2 rounded-full text-[14px] font-medium transition-colors ${
                    selectedFilters.experience.includes(pref)
                      ? 'bg-mint-600 text-white'
                      : 'bg-gray-100 text-text-700 hover:bg-gray-200'
                  }`}
                >
                  {pref}
                </button>
              ))}
            </div>
          </div>

          {/* 비자 종류 */}
          <div className="mb-8">
            <h3 className="text-[16px] font-semibold text-text-900 mb-3">비자 종류</h3>
            <div className="flex flex-wrap gap-2">
              {visaOptions.map((v) => (
                <button
                  key={v}
                  onClick={() => toggleVisa(v)}
                  className={`px-4 py-2 rounded-full text-[14px] font-medium transition-colors ${
                    selectedFilters.visas === v
                      ? 'bg-mint-600 text-white'
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
            className="w-full h-[52px] bg-mint-600 text-white rounded-[14px] text-[16px] 
                     font-semibold hover:bg-mint-700 transition-colors"
          >
            필터 적용하기
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

