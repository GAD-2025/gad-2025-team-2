import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { SearchBar } from "@/components/SearchBar";
import { FilterChips } from "@/components/FilterChips";
import { FilterModal, type FilterState } from "@/components/FilterModal";
import { JobCard } from "@/components/JobCard";
import { QuickMenuGrid } from "@/components/QuickMenuGrid";
import { GuideCard } from "@/components/GuideCard";
import { JobCardSkeleton } from "@/components/Skeleton";
import { SafetyNoticeModal } from "@/components/SafetyNoticeModal";
import { jobsAPI, getSignupUser, getJobSeekerProfile } from "@/api/endpoints";
import { KOREA_REGIONS } from "@/constants/locations";
import { LESSONS_DATA, type Lesson } from "@/data/lessons";
import { VISA_OPTIONS } from "@/constants/profile";
import type { Job } from "@/types";
import type { JobSeekerProfileData } from "@/api/endpoints";
import { useAuthStore } from "@/store/useAuth";

interface LessonWithProgress extends Lesson {
  completed: boolean;
  progress: number;
}

export const JobSeekerHome = () => {
  const navigate = useNavigate();
  const { setUserMode } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [showSafetyNotice, setShowSafetyNotice] = useState(false);
  const [userName, setUserName] = useState<string>("사용자");
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    languageLevel: [],
    locations: [],
    experience: [],
    visas: null,
  });

  const [lessonsWithProgress, setLessonsWithProgress] = useState<LessonWithProgress[]>([]);
  const userLevel = localStorage.getItem('userLevel');
  const getLevelNumber = (level: string): number => {
    const match = level.match(/Lv\.(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };
  const userLevelNumber = userLevel ? getLevelNumber(userLevel) : 0;

  useEffect(() => {
    const calculateProgress = () => {
      const newLessonsWithProgress = LESSONS_DATA.map(lesson => {
        const progressKey = `lesson-progress-${lesson.id}`;
        let completedTopicsCount = 0;
        
        try {
          const savedProgress = localStorage.getItem(progressKey);
          if (savedProgress) {
            const progressData = JSON.parse(savedProgress);
            if (progressData && progressData.completedTopics) {
              completedTopicsCount = new Set(progressData.completedTopics).size;
            }
          }
        } catch (e) {
          console.error("Failed to parse progress data for lesson " + lesson.id, e);
        }

        const totalTopics = lesson.topics.length;
        const progress = totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;
        
        return {
          ...lesson,
          progress,
          completed: progress === 100,
        };
      });
      setLessonsWithProgress(newLessonsWithProgress);
    };

    calculateProgress();
  }, []);

  const unlockedLessons = lessonsWithProgress.filter(lesson => getLevelNumber(lesson.level) <= userLevelNumber);
  const totalProgress = unlockedLessons.reduce((sum, lesson) => sum + lesson.progress, 0);
  const currentProgress = unlockedLessons.length > 0 ? Math.round(totalProgress / unlockedLessons.length) : 0;

  // Set user mode to jobseeker when entering this page
  useEffect(() => {
    setUserMode('jobseeker');
  }, [setUserMode]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const signupUserId = localStorage.getItem("signup_user_id");

        // 기본 데이터 호출
        const [jobsRes, signupUser, jobProfile] = await Promise.all([
          jobsAPI.list({ limit: 10 }),
          signupUserId ? getSignupUser(signupUserId).catch(() => null) : Promise.resolve(null),
          signupUserId ? getJobSeekerProfile(signupUserId).catch(() => null) : Promise.resolve(null),
        ]);

        if (jobsRes.data) {
          setJobs(jobsRes.data);
          console.log(`Loaded ${jobsRes.data.length} jobs from API`);
        } else {
          setJobs([]);
          console.log('No jobs available');
        }

        // 이름/필터 프리필
        if (signupUser) {
          setUserName(signupUser.name || "사용자");
        } else {
          const storedName = localStorage.getItem("signup_user_name");
          if (storedName) setUserName(storedName);
        }

        const nextFilters: FilterState = {
          languageLevel: [],
          locations: [],
          experience: [],
          visas: null,
          city: null,
        };

        const profile = jobProfile as JobSeekerProfileData | null;
        if (profile?.visaType && VISA_OPTIONS.includes(profile.visaType)) {
          nextFilters.visas = profile.visaType;
        }
        if (profile?.preferred_regions && profile.preferred_regions.length > 0) {
          nextFilters.locations = profile.preferred_regions.filter(Boolean);
        }

        // 도시 추론: 선호 지역이 포함된 시/도를 찾는다
        const inferCity = () => {
          const regions = profile?.preferred_regions || [];
          for (const [cityName, districtList] of Object.entries(KOREA_REGIONS)) {
            const match = regions.find(
              (r) =>
                districtList.includes(r) ||
                r.replace(/\s+/g, '').includes(cityName.replace(/(특별시|광역시|특별자치도|도|\s)/g, ''))
            );
            if (match) return cityName;
          }
          return null;
        };
        const city = inferCity();
        if (city) {
          nextFilters.city = city;
          // 도시가 정해졌다면 해당 도시의 구/군에 포함되는 값만 남긴다
          const districts = KOREA_REGIONS[city] || [];
          nextFilters.locations = (profile?.preferred_regions || []).filter((r) => districts.includes(r));
        }

        const workDays = profile?.work_days_of_week;
        if (Array.isArray(workDays) && workDays.length > 0) {
          const daysStr = workDays.join(",");
          if (/(토|일|SAT|SUN)/i.test(daysStr)) nextFilters.experience.push("주말");
          if (/(월|화|수|목|금|MON|TUE|WED|THU|FRI)/i.test(daysStr)) nextFilters.experience.push("평일");
        }

        setAppliedFilters((prev) => ({
          ...prev,
          ...nextFilters,
        }));
      } catch (error) {
        console.error("데이터 로딩 오류:", error);
        toast.error("데이터를 불러오는데 실패했습니다");
        setJobs([]); // API 호출 실패 시 빈 배열
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Safety Notice Modal 표시 여부 확인
  useEffect(() => {
    const fromOnboarding = searchParams.get("from") === "onboarding";
    const hideFlag =
      typeof window !== "undefined" &&
      localStorage.getItem("hideSafetyNotice") === "true";

    if (fromOnboarding && !hideFlag) {
      setShowSafetyNotice(true);
    }
  }, [searchParams]);

  const handleFilterApply = (filters: FilterState) => {
    setAppliedFilters(filters);
    console.log("Applied filters:", filters);
    // TODO: 필터 적용 로직 추가 (API 호출 등)
  };

  // 선택된 필터들을 하나의 배열로 합치기
  const getSelectedFiltersArray = () => {
    return [
      ...(appliedFilters.city ? [appliedFilters.city] : []),
      ...appliedFilters.locations,
      ...appliedFilters.languageLevel,
      ...appliedFilters.experience,
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
            <svg
              className="w-[18px] h-[18px] text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>
        </div>
        <SearchBar />
      </header>

      {/* Recommended filters */}
      <div className="bg-white border-b border-line-200">
        <FilterChips
          filters={getSelectedFiltersArray()}
          title={`${userName}님께 추천하는 맞춤 필터`}
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

      <div className="px-8 mt-8 mb-4">
        <div className="bg-mint-100 rounded-[20px] p-5" onClick={() => navigate('/learning')}>
          {userLevel ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[13px] text-mint-700 opacity-90 mb-1">현재 학습 레벨</p>
                  <h2 className="text-[24px] font-bold text-mint-700">{userLevel}</h2>
                </div>
                <div className="text-right">
                  <p className="text-[32px] font-bold text-mint-600">{currentProgress}%</p>
                  <p className="text-[12px] text-mint-600 opacity-90">완료</p>
                </div>
              </div>
              <div className="relative w-full h-3 bg-mint-200 rounded-full overflow-hidden mb-4">
                <div
                  className="absolute left-0 top-0 h-full bg-mint-400 rounded-full transition-all"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-2">
              <h2 className="text-[18px] font-bold text-mint-700 mb-2">아직 측정된 레벨이 없어요</h2>
              <p className="text-[14px] text-mint-600 opacity-90 mb-4">레벨 테스트로 나의 한국어 실력을 확인해보세요!</p>
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('/learning');
            }}
            className="w-full h-[44px] bg-white text-mint-600 rounded-[12px] font-semibold hover:bg-gray-50 transition-colors"
          >
            학습 시작하기
          </button>
        </div>
      </div>

      {/* AI recommendations */}
      <div className="pt-4 bg-background mb-4">
        {/* Section header */}
        <div className="flex items-center justify-between px-8 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[16px]">🚀</span>
            <h2 className="text-[18px] font-semibold text-text-900">
              {userName}님을 위한 맞춤 공고
            </h2>
          </div>
          <button className="text-text-700">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
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
              jobs
                .slice(0, 10)
                .map((job) => (
                  <JobCard key={job.id} job={job} variant="featured" />
                ))
            )}
          </div>
        </div>
      </div>

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
          <h2 className="text-[18px] font-semibold text-text-900">
            생활 꿀팁 & 필수 가이드
          </h2>
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
      <SafetyNoticeModal isOpen={showSafetyNotice} onClose={() => setShowSafetyNotice(false)} />
    </div>
  );
};
