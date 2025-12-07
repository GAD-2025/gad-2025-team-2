import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { SearchBar } from '@/components/SearchBar';
import { FilterChips } from '@/components/FilterChips';
import { FilterModal, type FilterState } from '@/components/FilterModal';
import { JobCard } from '@/components/JobCard';
import { JobCardSkeleton } from '@/components/Skeleton';
import { jobsAPI } from '@/api/endpoints';
import { JOB_PRESET_DESCRIPTIONS } from '@/constants/presets';
import type { Job } from '@/types';

export const JobList = () => {
  const navigate = useNavigate();
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
  const headerTitle =
    sortParam === 'high-wage'
      ? '높은 시급'
      : sortParam === 'popular'
      ? '인기 공고'
      : sortParam === 'trusted'
      ? '신뢰 공고'
      : sortParam === 'short-term'
      ? '단기 알바'
      : '공고';

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        // Fetch jobs from API
        const response = await jobsAPI.list({ limit: 50, visaType: appliedFilters.visas || undefined });
        const activeJobs = (response.data || []).filter((job: any) => job.status === 'active');
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
  }, [appliedFilters]);

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
        <h1 className="text-[20px] font-bold text-text-900 mb-2">{headerTitle}</h1>
        {sortParam && JOB_PRESET_DESCRIPTIONS[sortParam] && (
          <p className="text-sm text-text-600 mb-3">{JOB_PRESET_DESCRIPTIONS[sortParam]}</p>
        )}
        <SearchBar placeholder="직종, 지역으로 검색..." />
      </header>

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
        {/* Section header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[16px]">📄</span>
          <h2 className="text-[18px] font-semibold text-text-900">새로 올라온 공고</h2>
        </div>

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
    </div>
  );
};

