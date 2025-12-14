import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { SearchBar } from '@/components/SearchBar';
import { FilterChips } from '@/components/FilterChips';
import { FilterModal, type FilterState } from '@/components/FilterModal';
import { JobCard } from '@/components/JobCard';
import { JobCardSkeleton } from '@/components/Skeleton';
import { jobsAPI } from '@/api/endpoints';
import { JOB_PRESET_DESCRIPTIONS } from '@/constants/presets';
import type { Job } from '@/types';
import { MyApplications } from './MyApplications';

export const JobList = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'jobs' | 'applications'>('jobs'); // 탭 전환: 공고 / 내 지원 내역
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    languageLevel: ['Lv.3 중급'],
    locations: ['종로구'],
    experience: ['1-2년'],
    visas: null,
  });
  const [searchParams] = useSearchParams();
  const sortParam = searchParams.get('sort') || '';
  const fromParam = searchParams.get('from') || '';
  const location = useLocation();
  const navFrom = (location.state as any)?.from || '';
  const navPreset = (location.state as any)?.preset || (location.state as any)?.sort || '';
  const sortPreset = sortParam || navPreset || '';
  // Also hide when a sort preset is active (e.g., ?sort=popular)
  const hideNewJobs = Boolean(sortParam) || Boolean(navPreset) || fromParam === 'quick' || navFrom === 'quick';
  const isDefaultJobs = !sortParam && !navPreset && fromParam !== 'quick' && navFrom !== 'quick';
  const headerTitle =
    sortParam === 'high-wage'
      ? '높은 시급'
      : sortParam === 'popular'
      ? '인기 공고'
      : sortParam === 'trusted'
      ? '신뢰 공고'
      : sortParam === 'short-term'
      ? '단기 알바'
  : isDefaultJobs
  ? '어떤 일을 찾고 계시나요?'
      : '공고';
  // Increase header/subtitle size slightly when navigated from quick menu or using a preset
  const headerSizeClass = hideNewJobs ? 'text-[22px]' : 'text-[20px]';
  const subtitleSizeClass = hideNewJobs ? 'text-base' : 'text-sm';

  useEffect(() => {
    // Debug: log navigation and params so we can verify detection when clicking QuickMenu
    console.log('JobList params:', { sortParam, fromParam, navFrom, hideNewJobs });

    const fetchJobs = async () => {
      if (viewMode !== 'jobs') return; // 내 지원 내역 탭에서는 공고 조회 안 함
      try {
        setLoading(true);
        // Fetch jobs from API
        const response = await jobsAPI.list({
          limit: 50,
          visaType: appliedFilters.visas || undefined,
          sort: sortPreset || undefined,
        });
        let activeJobs = (response.data || []).filter((job: any) => job.status === 'active');

        // Fallback 클라이언트 필터링 (백엔드에서 정렬/필터가 안 먹을 때 대비)
        activeJobs = activeJobs.filter((job: any) => {
          const applicationsCount = job.applicationsCount ?? job.applications ?? 0;
          const isTrusted =
            job.isTrusted ||
            Boolean(job?.employer?.business_license) ||
            Boolean(job?.employer?.is_verified);

          if (sortPreset === 'high-wage') return job.wage >= 11000;
          if (sortPreset === 'popular') return applicationsCount > 0;
          if (sortPreset === 'trusted') return isTrusted;
          // 단기 알바는 기존 기준 없음 -> 서버 기준 사용, 없으면 전체 유지
          return true;
        });

        // Sorting fallback
        if (sortPreset === 'high-wage') {
          activeJobs.sort((a: any, b: any) => (b.wage ?? 0) - (a.wage ?? 0));
        } else if (sortPreset === 'popular') {
          activeJobs.sort(
            (a: any, b: any) =>
              (b.applicationsCount ?? b.applications ?? 0) -
              (a.applicationsCount ?? a.applications ?? 0)
          );
        }

        setJobs(activeJobs);
        console.log(`Loaded ${activeJobs.length} active jobs from API`);
      } catch (error) {
        console.error('공고 로딩 오류:', error);
        toast.error('공고를 불러오는데 실패했습니다');
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [appliedFilters, sortPreset, viewMode]);

  const handleFilterApply = (filters: FilterState) => {
    setAppliedFilters(filters);
    console.log('Applied filters:', filters);
    // TODO: 필터 적용 로직 추가 (API 호출 등)
  };

  const getSelectedFiltersArray = () => {
    return [
      ...appliedFilters.languageLevel,
      ...appliedFilters.locations,
      ...appliedFilters.experience,
      ...(appliedFilters.visas ? [appliedFilters.visas] : []),
    ];
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with search */}
      <header className="bg-white border-b border-line-200 px-4 pt-4 pb-3 sticky top-0 z-10">
        <h1 className={`${headerSizeClass} font-bold text-text-900 mb-2`}>{headerTitle}</h1>
        {sortParam && JOB_PRESET_DESCRIPTIONS[sortParam] && (
          <p className={`${subtitleSizeClass} text-text-600 mb-3`}>{JOB_PRESET_DESCRIPTIONS[sortParam]}</p>
        )}
        <SearchBar placeholder="직종, 지역으로 검색..." />
      </header>

      {/* Tabs: 공고 찾기 / 내 지원 내역 */}
      <div className="bg-white border-b border-line-200 px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('jobs')}
            className={`flex-1 h-10 rounded-full text-[14px] font-semibold transition-colors ${
              viewMode === 'jobs'
                ? 'bg-mint-600 text-white'
                : 'bg-background text-text-700 border border-line-200 hover:border-mint-600'
            }`}
          >
            공고 찾기
          </button>
          <button
            onClick={() => setViewMode('applications')}
            className={`flex-1 h-10 rounded-full text-[14px] font-semibold transition-colors ${
              viewMode === 'applications'
                ? 'bg-mint-600 text-white'
                : 'bg-background text-text-700 border border-line-200 hover:border-mint-600'
            }`}
          >
            내 지원 내역
          </button>
        </div>
      </div>

      {viewMode === 'applications' && (
        <div className="bg-background">
          <MyApplications />
        </div>
      )}

      {viewMode === 'jobs' && (
        <>
          {/* Filters */}
          <div className="bg-white border-b border-line-200">
            <FilterChips 
              filters={getSelectedFiltersArray()}
              title="필터 설정"
              icon="⚙️"
              onFilterClick={() => setIsFilterModalOpen(true)}
            />
          </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleFilterApply}
        initialFilters={appliedFilters}
      />

          {/* Job Cards Section */}
          <div className="px-4 py-4">
            {/* Section header (hidden when navigated from quick menu) */}
            {!hideNewJobs && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[16px]">📄</span>
                <h2 className="text-[18px] font-semibold text-text-900">새로 올라온 공고</h2>
              </div>
            )}

            {/* Job Grid */}
            <div className="grid grid-cols-1 gap-3">
              {loading ? (
                <>
                  <JobCardSkeleton />
                  <JobCardSkeleton />
                  <JobCardSkeleton />
                  <JobCardSkeleton />
                </>
              ) : jobs.length > 0 ? (
                jobs.map((job) => (
                  <div key={job.id} onClick={() => navigate(`/job/${job.id}`)}>
                    <JobCard job={job} variant="default" />
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-text-500 text-[15px]">공고가 없습니다</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

