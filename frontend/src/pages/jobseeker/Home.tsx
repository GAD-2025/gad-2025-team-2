import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { SearchBar } from '@/components/SearchBar';
import { FilterChips } from '@/components/FilterChips';
import { FilterModal, type FilterState } from '@/components/FilterModal';
import { JobCard } from '@/components/JobCard';
import { ProgressCard } from '@/components/ProgressCard';
import { QuickMenuGrid } from '@/components/QuickMenuGrid';
import { GuideCard } from '@/components/GuideCard';
import { JobCardSkeleton } from '@/components/Skeleton';
import { SafetyNoticeModal } from '@/components/SafetyNoticeModal';
import { jobsAPI, learningAPI } from '@/api/endpoints';
import type { Job, LearningProgress } from '@/types';

export const JobSeekerHome = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [learningProgress, setLearningProgress] = useState<LearningProgress | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [showSafetyNotice, setShowSafetyNotice] = useState(false);
  // 기본 필터 설정 - 사용자의 실제 언어 레벨만 설정
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    languageLevel: ['Lv.3 중급'], // 수정님의 실제 언어 레벨
    locations: ['종로구'],
    experience: ['주말', '비자:C-4'],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch from API only - no mock data fallback
        const [jobsRes, progressRes] = await Promise.all([
          jobsAPI.list({ limit: 10 }),
          learningAPI.getSummary('seeker-test-001').catch(() => null),
        ]);
        
        // Set jobs from API (empty array if no data)
        setJobs(jobsRes.data || []);
        console.log(`Loaded ${jobsRes.data?.length || 0} jobs from API`);
        
        // Set learning progress if available
        if (progressRes) {
          setLearningProgress(progressRes.data);
        }
      } catch (error) {
        console.error('데이터 로딩 오류:', error);
        toast.error('데이터를 불러오는데 실패했습니다');
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Safety Notice Modal 표시 여부 확인
  useEffect(() => {
    const fromOnboarding = searchParams.get('from') === 'onboarding';
    const hideFlag = typeof window !== 'undefined' && localStorage.getItem('hideSafetyNotice') === 'true';
    
    if (fromOnboarding && !hideFlag) {
      setShowSafetyNotice(true);
    }
  }, [searchParams]);

  const handleFilterApply = (filters: FilterState) => {
    setAppliedFilters(filters);
    console.log('Applied filters:', filters);
    // TODO: 필터 적용 로직 추가 (API 호출 등)
  };

  // 선택된 필터들을 하나의 배열로 합치기
  const getSelectedFiltersArray = () => {
    return [
      ...appliedFilters.languageLevel,
      ...appliedFilters.locations,
      ...appliedFilters.experience,
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
        <SearchBar />
      </header>

      {/* Recommended filters */}
      <div className="bg-white border-b border-line-200">
        <FilterChips 
          filters={getSelectedFiltersArray()}
          title="수정님께 추천하는 맞춤 필터"
          icon="✨"
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

      {/* AI recommendations */}
      <div className="pt-4 bg-background mb-4">
        {/* Section header */}
        <div className="flex items-center justify-between px-8 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[16px]">🚀</span>
            <h2 className="text-[18px] font-semibold text-text-900">수정님을 위한 AI 맞춤 공고</h2>
          </div>
          <button className="text-text-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Horizontal Scroll */}
        <div className="ml-8 mr-8 overflow-x-auto pb-2">
          <div className="flex gap-3 snap-x snap-mandatory">
            {loading ? (
              <>
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
              </>
            ) : (
              jobs.slice(0, 3).map((job) => (
                <JobCard key={job.id} job={job} variant="featured" />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Learning progress */}
      {learningProgress && (
        <div className="px-8 mb-4">
          <ProgressCard
            title="현재 학습 상태"
            level={learningProgress.currentLevel}
            progress={learningProgress.progressPercent}
            completed={learningProgress.completedLessons}
            total={learningProgress.totalLessons}
            onClick={() => navigate('/learning')}
          />
        </div>
      )}

      <div className="pt-2 pb-4">
        {/* Section header */}
        <div className="flex items-center gap-2 px-8 mb-3">
          <span className="text-[16px]">🔎</span>
          <h2 className="text-[18px] font-semibold text-text-900">빠른 메뉴</h2>
        </div>
        <QuickMenuGrid />
      </div>

      {/* Guide cards */}
      <div className="pb-8 px-8">
        {/* Section header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[16px]">🍯</span>
          <h2 className="text-[18px] font-semibold text-text-900">생활 꿀팁 & 필수 가이드</h2>
        </div>
        
        {/* Grid - 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          <GuideCard
            title="구직자님! 최근 유행인 사기 수법 알아가세요"
            image="scam"
          />
          <GuideCard
            title="꼭! 알아야 할 오늘의 생활 한국어 표현"
            image="korean"
          />
        </div>
      </div>

      {/* Safety Notice Modal */}
      {showSafetyNotice && (
        <SafetyNoticeModal
          onClose={() => setShowSafetyNotice(false)}
          onNeverShowAgain={() => setShowSafetyNotice(false)}
        />
      )}
    </div>
  );
};

