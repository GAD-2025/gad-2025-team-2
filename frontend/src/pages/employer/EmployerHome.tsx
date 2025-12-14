import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { SearchBar } from '@/components/SearchBar';
import { FilterChips } from '@/components/FilterChips';
import { EmployerFilterModal, type EmployerFilterState } from '@/components/EmployerFilterModal';
import { ApplicantCard } from '@/components/ApplicantCard';
import { EmployerQuickMenu } from '@/components/EmployerQuickMenu';
import { GuideCard } from '@/components/GuideCard';
import { listJobSeekers } from '@/api/endpoints';
import type { JobSeeker } from '@/types';
import { useAuthStore } from '@/store/useAuth';

export const EmployerHome = () => {
  const navigate = useNavigate();
  const { setUserMode } = useAuthStore();
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

  const location = useLocation();

  // Set user mode to employer when entering this page
  useEffect(() => {
    setUserMode('employer');
  }, [setUserMode]);

  // If navigation provided filters (e.g., from ApplicantFilter), merge them into appliedFilters on mount
  useEffect(() => {
    const navFilters = (location.state as any)?.filters;
    if (navFilters && Object.keys(navFilters).length > 0) {
      setAppliedFilters((prev) => ({ ...prev, ...(navFilters as Partial<EmployerFilterState>) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch applicants whenever appliedFilters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const jobSeekers = await listJobSeekers(20, { visa_type: appliedFilters.visas || undefined });

        // Convert API response to JobSeeker type
        const formattedApplicants: JobSeeker[] = jobSeekers.map((seeker) => {
          const s: any = seeker;
          const birth = s.birthdate ? new Date(s.birthdate) : null;
          const age = birth ? Math.max(0, Math.floor((Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25))) : null;
          
          // user_id가 필수이므로 확인
          if (!s.user_id) {
            console.warn('[WARNING] 지원자 데이터에 user_id가 없습니다:', s);
          }
          
          return {
            id: s.id || s.user_id, // profile id 또는 user_id
            userId: s.user_id, // 백엔드 엔드포인트는 user_id를 기대하므로 필수
            name: s.name || '이름 없음',
            nationality: s.nationality || '국적 미상',
            nationalityCode: s.nationality || s.nationality_code,
            birthdate: s.birthdate,
            phone: s.phone || '',
            languageLevel: s.language_level || '언어 능력 미입력',
            visaType: s.visa_type || (appliedFilters.visas || '미입력'),
            availability: s.availability || '즉시',
            location: s.location ? { lat: s.location.lat, lng: s.location.lng } : undefined,
            experience: [],
            preferences: {
              industries: [],
              wageRange: { min: 0, max: 0 },
              area: s.preferred_regions?.[0] || '',
              radiusKm: 5,
              preferDays: s.work_days_of_week || [],
            },
            // store derived age inside experience tags if needed later
            age,
            // experience_skills를 JobSeeker 타입에 추가 (타입 확장 필요할 수 있음)
            experience_skills: s.experience_skills || null,
          } as JobSeeker & { experience_skills?: string | null };
        });

        setApplicants(formattedApplicants);
        console.log(`[SUCCESS] Loaded ${formattedApplicants.length} job seekers`);
      } catch (error: any) {
        console.error('[ERROR] 데이터 로딩 오류:', error);
        // 404 등으로 실패해도 UI는 빈 목록으로 표시 (토스트는 표시하지 않음)
        setApplicants([]);
        // 심각한 에러만 토스트 표시
        if (error?.message && !error.message.includes('404')) {
          toast.error('지원자 목록을 불러오는데 실패했습니다');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [appliedFilters]);

  

  const handleFilterApply = (filters: EmployerFilterState) => {
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
      ...(appliedFilters.visas ? [appliedFilters.visas] : []),
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
          title="검색 조건 설정"
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

