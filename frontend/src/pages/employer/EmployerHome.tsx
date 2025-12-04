import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { SearchBar } from '@/components/SearchBar';
import { FilterChips } from '@/components/FilterChips';
import { EmployerFilterModal, type EmployerFilterState } from '@/components/EmployerFilterModal';
import { ApplicantCard } from '@/components/ApplicantCard';
import { EmployerQuickMenu } from '@/components/EmployerQuickMenu';
import { GuideCard } from '@/components/GuideCard';
import { listJobSeekers } from '@/api/endpoints';
import type { JobSeeker } from '@/types';

export const EmployerHome = () => {
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState<JobSeeker[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  // 기본 필터 설정
  const [appliedFilters, setAppliedFilters] = useState<EmployerFilterState>({
    languageLevel: 'Lv.1 기초: 일상적인 의사소통 가능',
    locations: ['종로구'],
    experience: '경력 무관',
    workSchedule: ['주말'],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const jobSeekers = await listJobSeekers(20);
        
        // Convert API response to JobSeeker type
        const formattedApplicants: JobSeeker[] = jobSeekers.map((seeker) => ({
          id: seeker.id,
          name: seeker.name,
          nationality: seeker.nationality,
          age: calculateAge(seeker.birthdate),
          languageLevel: 'Lv.2 중급', // Default value
          visaType: 'E-9',
          experience: '1년',
          location: seeker.preferred_regions[0] || '서울',
          rating: 4.5,
          matchScore: 85,
          workSchedule: seeker.work_days_of_week,
          skills: parseSkills(seeker.experience_skills),
          introduction: seeker.experience_introduction || '',
          verified: true,
        }));
        
        setApplicants(formattedApplicants);
        console.log(`Loaded ${formattedApplicants.length} job seekers`);
      } catch (error) {
        console.error('데이터 로딩 오류:', error);
        toast.error('데이터를 불러오는데 실패했습니다');
        setApplicants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateAge = (birthdate: string | null): number => {
    if (!birthdate) return 25;
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const parseSkills = (skillsJson: string | null): string[] => {
    if (!skillsJson) return [];
    try {
      const parsed = JSON.parse(skillsJson);
      return [...(parsed.workSkills || []), ...(parsed.strengths || [])];
    } catch {
      return [];
    }
  };

  const handleFilterApply = (filters: FilterState) => {
    setAppliedFilters(filters);
    console.log('Applied filters:', filters);
    // TODO: 필터 적용 로직 추가 (API 호출 등)
  };

  // 선택된 필터들을 하나의 배열로 합치기
  const getSelectedFiltersArray = () => {
    // 언어 레벨은 "Lv.1 기초" 형태로 표시
    const langShort = appliedFilters.languageLevel.split(':')[0];
    
    return [
      langShort,
      ...appliedFilters.locations,
      appliedFilters.experience,
      ...appliedFilters.workSchedule,
    ];
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with branding - Mint background */}
      <header className="bg-mint-600 px-8 pt-4 pb-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white text-[24px] font-bold">WorkFair</h1>
          <button 
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center" 
            aria-label="Notifications"
          >
            <svg className="w-[18px] h-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
        <SearchBar placeholder="이름, 국적, 비자로 검색..." />
      </header>

      {/* Filter Section */}
      <div className="bg-white border-b border-line-200">
        <FilterChips 
          filters={getSelectedFiltersArray()}
          title="인재 필터 설정"
          icon="⚙️"
          onFilterClick={() => setIsFilterModalOpen(true)}
        />
      </div>

      {/* Filter Modal */}
      <EmployerFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleFilterApply}
        initialFilters={appliedFilters}
      />

      {/* AI talent recommendations carousel */}
      <div className="pt-4 pb-4">
        {/* Section header */}
        <div className="flex items-center justify-between px-8 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[16px]">🚀</span>
            <h2 className="text-[18px] font-semibold text-text-900">고용주님을 위한 AI 맞춤 인재 추천</h2>
          </div>
          <button className="text-text-700">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Carousel */}
        <div className="ml-8 mr-8 overflow-x-auto pb-2">
          <div className="flex gap-3 snap-x snap-mandatory scrollbar-hide">
            {loading ? (
              <>
                <div className="min-w-[340px] w-[340px] h-[200px] bg-white rounded-card border border-line-200 animate-pulse" />
                <div className="min-w-[340px] w-[340px] h-[200px] bg-white rounded-card border border-line-200 animate-pulse" />
                <div className="min-w-[340px] w-[340px] h-[200px] bg-white rounded-card border border-line-200 animate-pulse" />
              </>
            ) : (
              applicants.map((applicant) => (
                <ApplicantCard key={applicant.id} applicant={applicant} variant="featured" />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick menu */}
      <div className="pb-4">
        {/* Section header */}
        <div className="flex items-center gap-2 px-8 mb-3">
          <span className="text-[16px]">🔎</span>
          <h2 className="text-[18px] font-semibold text-text-900">빠른 메뉴</h2>
        </div>
        <EmployerQuickMenu />
      </div>

      {/* Guide cards */}
      <div className="pb-8">
        {/* Section header */}
        <div className="flex items-center gap-2 px-8 mb-3">
          <span className="text-[16px]">🍯</span>
          <h2 className="text-[18px] font-semibold text-text-900">생활 꿀팁 & 필수 가이드</h2>
        </div>
        
        {/* Carousel */}
        <div className="ml-8 mr-8 overflow-x-auto pb-2">
          <div className="flex gap-3 snap-x snap-mandatory scrollbar-hide">
            <GuideCard
              title="외국인 채용 시 꼭! 알아야 할 필수 가이드"
              image="hiring"
            />
            <GuideCard
              title="외국인 직원 4대 보험 및 세금 안내"
              image="insurance"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

