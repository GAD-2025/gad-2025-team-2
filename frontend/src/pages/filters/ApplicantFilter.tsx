import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Tag } from '@/components/Tag';
import { BottomCTA, CTAButton } from '@/components/BottomCTA';

export const ApplicantFilter = () => {
  const navigate = useNavigate();

  const [selectedEmploymentType, setSelectedEmploymentType] = useState<string[]>(['아르바이트']);
  const [selectedPeriod, setSelectedPeriod] = useState<string[]>(['1개월 미만']);
  const [selectedDays, setSelectedDays] = useState<string[]>(['주말']);
  const [selectedTime, setSelectedTime] = useState<string[]>(['오전']);
  const [selectedVisa, setSelectedVisa] = useState<string | null>(null);

  const toggleSelection = (
    category: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    if (category.includes(value)) {
      setter(category.filter((item) => item !== value));
    } else {
      setter([...category, value]);
    }
  };

  const handleApply = () => {
    // Collect selected filters and navigate to employer home so results can be shown
    const filters = {
      employmentType: selectedEmploymentType,
      period: selectedPeriod,
      days: selectedDays,
      time: selectedTime,
      visas: selectedVisa,
    };
    navigate('/employer/home', { state: { filters } });
  };

  return (
    <div className="min-h-screen bg-white pb-24">
  <Header showBack title="인재 필터 설정" />

      <div className="p-4 space-y-6">
        {/* Employment Type */}
        <FilterSection title="고용 형태">
          <div className="flex flex-wrap gap-2">
            {['아르바이트', '계약직', '정규직', '인턴', '프리랜서'].map((type) => (
              <Tag
                key={type}
                variant="outline-mint"
                active={selectedEmploymentType.includes(type)}
                onClick={() => toggleSelection(selectedEmploymentType, setSelectedEmploymentType, type)}
              >
                {type}
              </Tag>
            ))}
          </div>
        </FilterSection>

        {/* Period */}
        <FilterSection title="근무 기간">
          <div className="flex flex-wrap gap-2">
            {['1개월 미만', '1-3개월', '3-6개월', '6개월 이상', '1년 이상'].map((period) => (
              <Tag
                key={period}
                variant="outline-mint"
                active={selectedPeriod.includes(period)}
                onClick={() => toggleSelection(selectedPeriod, setSelectedPeriod, period)}
              >
                {period}
              </Tag>
            ))}
          </div>
        </FilterSection>

        {/* Work Days */}
        <FilterSection title="근무 요일">
          <div className="flex flex-wrap gap-2">
            {['주말', '평일', '월수금', '화목', '합의 가능'].map((day) => (
              <Tag
                key={day}
                variant="outline-mint"
                active={selectedDays.includes(day)}
                onClick={() => toggleSelection(selectedDays, setSelectedDays, day)}
              >
                {day}
              </Tag>
            ))}
          </div>
        </FilterSection>

        {/* Work Time */}
        <FilterSection title="근무 시간">
          <div className="flex flex-wrap gap-2">
            {['오전', '오후', '저녁', '새벽', '시간 협의'].map((time) => (
              <Tag
                key={time}
                variant="outline-mint"
                active={selectedTime.includes(time)}
                onClick={() => toggleSelection(selectedTime, setSelectedTime, time)}
              >
                {time}
              </Tag>
            ))}
          </div>
        </FilterSection>

        {/* Location */}
        {/* Visa */}
        <FilterSection title="비자 조건">
          <div className="flex flex-wrap gap-2">
            {['E-9', 'H-2', 'F-4', 'F-5', 'F-6', 'D-10'].map((visa) => (
              <Tag
                key={visa}
                variant="outline-mint"
                active={selectedVisa === visa}
                onClick={() => setSelectedVisa(selectedVisa === visa ? null : visa)}
              >
                {visa}
              </Tag>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="지역">
          <div className="bg-mint-50 rounded-xl p-4 text-center">
            <p className="text-[14px] text-primary-mint font-medium">
              현재 위치 기준으로 자동 설정됩니다
            </p>
          </div>
        </FilterSection>
      </div>

      {/* Apply button */}
      <BottomCTA>
        <CTAButton variant="primary" fullWidth onClick={handleApply}>
          검색하기
        </CTAButton>
      </BottomCTA>
    </div>
  );
};

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
}

const FilterSection = ({ title, children }: FilterSectionProps) => {
  return (
    <div>
      <h3 className="text-[16px] font-bold text-text-primary mb-3">{title}</h3>
      {children}
    </div>
  );
};



