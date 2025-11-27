import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/Header';
import { Tag } from '@/components/Tag';
import { BottomCTA, CTAButton } from '@/components/BottomCTA';

export const TalentFilter = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Single selection for language, location, and experience
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Lv.1 기초');
  const [selectedLocation, setSelectedLocation] = useState<string>('종로구');
  const [selectedExperience, setSelectedExperience] = useState<string>('경력 없음');
  // Multi-selection for work conditions
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  // Single selection handler
  const setSingleSelection = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string
  ) => {
    setter(value);
  };

  // Multi-selection handler (for work conditions)
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
    // Apply filters and navigate back
    navigate('/jobseeker/home');
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header showBack title={t('filter.title')} />

      <div className="p-4 space-y-6">
        {/* Language level */}
        <FilterSection title={t('filter.languageLevel')}>
          <div className="flex flex-wrap gap-2">
            {['Lv.1 기초', 'Lv.2 초급', 'Lv.3 중급', 'Lv.4 상급'].map(
              (level) => (
                <Tag
                  key={level}
                  variant="outline-mint"
                  active={selectedLanguage === level}
                  onClick={() => setSingleSelection(setSelectedLanguage, level)}
                >
                  {level}
                </Tag>
              )
            )}
          </div>
        </FilterSection>

        {/* Location */}
        <FilterSection title={t('filter.location')}>
          <div className="flex flex-wrap gap-2">
            {['종로구', '중구', '용산구', '성동구', '광진구', '동대문구', '중랑구', '성북구', '상관없음'].map(
              (location) => (
                <Tag
                  key={location}
                  variant="outline-mint"
                  active={selectedLocation === location}
                  onClick={() => setSingleSelection(setSelectedLocation, location)}
                >
                  {location}
                </Tag>
              )
            )}
          </div>
        </FilterSection>

        {/* Experience */}
        <FilterSection title={t('filter.experience')}>
          <div className="flex flex-wrap gap-2">
            {['경력 없음', '1년 미만', '1-2년', '2-3년', '3년 이상'].map((exp) => (
              <Tag
                key={exp}
                variant="outline-mint"
                active={selectedExperience === exp}
                onClick={() => setSingleSelection(setSelectedExperience, exp)}
              >
                {exp}
              </Tag>
            ))}
          </div>
        </FilterSection>

        {/* Work conditions */}
        <FilterSection title={t('filter.workConditions')}>
          <div className="flex flex-wrap gap-2">
            {['주말', '평일', '야간', '단기'].map((condition) => (
              <Tag
                key={condition}
                variant="outline-mint"
                active={selectedConditions.includes(condition)}
                onClick={() =>
                  toggleSelection(selectedConditions, setSelectedConditions, condition)
                }
              >
                {condition}
              </Tag>
            ))}
          </div>
        </FilterSection>
      </div>

      {/* Apply button */}
      <BottomCTA>
        <CTAButton variant="primary" fullWidth onClick={handleApply}>
          {t('filter.apply')}
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

