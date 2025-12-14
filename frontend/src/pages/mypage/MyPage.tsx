import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { TrustFlipCard } from "@/components/TrustFlipCard";
import { VerificationList } from "@/components/VerificationList";
import { ResumeSection } from "@/components/ResumeSection";
import type { Profile, Verifications, Resume } from "@/types/profile";
import { getSignupUser, getJobSeekerProfile, getStores, getEmployerProfile, type SignupUserData, type JobSeekerProfileData, type StoreData, type EmployerProfileData } from '@/api/endpoints';

export const MyPage = () => {
  const { userMode, user, clearAuth } = useAuthStore();
  const mainStoreFromAuth = useAuthStore((s) => s.mainStore);
  const signupUserId = useAuthStore((s) => s.signupUserId);
  const navigate = useNavigate();
  const [showVerifications, setShowVerifications] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signupUserData, setSignupUserData] = useState<SignupUserData | null>(null);
  const [profileData, setProfileData] = useState<JobSeekerProfileData | null>(null);
  const [stores, setStores] = useState<StoreData[]>([]);
<<<<<<< HEAD
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
=======
  const [employerProfileData, setEmployerProfileData] = useState<EmployerProfileData | null>(null);
>>>>>>> e7a5e19 (WIP: save local changes before pulling origin/main)

  // Load user data from database
  useEffect(() => {
    const loadUserData = async () => {
      try {
  const userId = signupUserId || user?.id || localStorage.getItem('signup_user_id');
        if (!userId) {
          console.error('No user ID found');
          toast.error('로그인 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
          navigate('/signin', { replace: true });
          setLoading(false);
          return;
        }

        // Prefill immediately from auth store mainStore for instant UX
        try {
          if (mainStoreFromAuth) {
            setStores([mainStoreFromAuth]);
          }
        } catch (e) {
          console.warn('Failed to use mainStore from auth store:', e);
        }

        // Fetch signup user data
        const userData = await getSignupUser(userId);
        setSignupUserData(userData);

        // 구직자인 경우에만 job seeker profile 가져오기
        if (userData.role === 'job_seeker') {
          try {
            const profile = await getJobSeekerProfile(userId);
            setProfileData(profile);
          } catch (error) {
            console.log('Profile not found yet (user might not have completed onboarding)');
          }
        }
        // 고용주인 경우 프로필과 매장 목록 가져오기
        if (userData.role === 'employer') {
          try {
            try {
              const ep = await getEmployerProfile(userId);
              setEmployerProfileData(ep);
            } catch (e) {
              console.info('Failed to load employer profile (fallback):', e);
            }

            console.log(`Fetching stores for employer user_id: ${userId}`);
            const storesData = await getStores(userId);
            console.log(`Loaded ${storesData.length} stores:`, storesData);
            if (storesData.length > 0) {
              const mainStore = storesData.find(s => s.is_main);
              if (mainStore) {
                console.log('기본매장 발견:', mainStore);
              } else {
                console.warn('기본매장이 없습니다. 모든 매장:', storesData);
              }
            } else {
              console.warn('등록된 매장이 없습니다. 온보딩 시 기본매장이 생성되었는지 확인하세요.');
            }
            setStores(storesData);
          } catch (error) {
            console.error('Failed to load stores:', error);
            setStores([]);
          }
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, [user?.id, navigate]);

  // 프로필 사진 가져오기
  const profilePhoto = localStorage.getItem('profile_photo') || undefined;

  const profile: Profile = {
    name: signupUserData?.name || localStorage.getItem('user_name') || "사용자",
    role: (signupUserData?.role === 'employer' ? 'employer' : 'jobseeker') as "jobseeker" | "employer",
    avatarUrl: profilePhoto,
    joinedAtISO: signupUserData?.created_at || new Date().toISOString(),
    metrics: {
      reviews: 0,
    },
  };

  const verifications: Verifications = {
    idVerified: "verified",
    visaVerified: "pending",
    contactVerified: "verified",
    educationVerified: "pending",
    criminalRecordVerified: "not_required",
    lastUpdatedISO: new Date().toISOString(),
  };

  // Parse skills from JSON string if available
  const parseSkills = (skillsJson: string | null): string[] => {
    if (!skillsJson) return [];
    try {
      const parsed = JSON.parse(skillsJson);
      if (parsed.workSkills && Array.isArray(parsed.workSkills)) {
        return parsed.workSkills;
      }
      return [];
    } catch {
      return [];
    }
  };

  const isEmployer = signupUserData?.role === 'employer';

  const resume: Resume = {
    birthYear: signupUserData?.birthdate ? new Date(signupUserData.birthdate).getFullYear() : undefined,
    country: "대한민국",
    city: profileData?.preferred_regions && profileData.preferred_regions.length > 0 
      ? profileData.preferred_regions.join(", ") 
      : "미설정",
    nationality: signupUserData?.nationality_name || "미설정",
    visaType: "미설정",
    visaExpiryISO: "2025-12-31T00:00:00Z",
    languages: [
      { code: "ko", level: "B1" },
    ],
    desiredRoles: profileData?.preferred_jobs || [],
    skills: parseSkills(profileData?.experience_skills || null),
    availability: {
      days: profileData?.work_days_of_week || [],
      timeRange: profileData?.work_start_time && profileData?.work_end_time
        ? `${profileData.work_start_time}-${profileData.work_end_time}`
        : "미설정",
    },
    hobbies: [],
    pets: "없음",
    introShort: profileData?.experience_introduction 
      ? profileData.experience_introduction.substring(0, 100) 
      : "프로필을 작성해주세요!",
    introLong: profileData?.experience_introduction || "프로필 수정에서 자기소개를 작성할 수 있습니다.",
    contacts: {
      // 구직자: 이메일 숨김, 전화번호만 노출
      // 고용주: 전화번호 숨김, 이메일만 노출
      email: isEmployer ? (signupUserData?.email || user?.email || "미설정") : undefined,
      phone: isEmployer ? undefined : (signupUserData?.phone || user?.phone || "미설정"),
      kakao: "",
      whatsapp: "",
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-700">로딩 중...</div>
      </div>
    );
  }

  const handleVerifyClick = (type: string) => {
    alert(`${type} 인증 페이지 (구현 예정)`);
  };

  const handleResumeEdit = () => {
    navigate("/profile/edit");
  };

  const handleLogout = () => {
    // zustand 스토어 클리어 (localStorage의 auth-storage와 token도 함께 정리됨)
    clearAuth();
    
    // 추가 localStorage 항목 클리어
    try {
      useAuthStore.getState().setSignupUserId(null);
    } catch (e) {
      localStorage.removeItem('signup_user_id');
    }
    localStorage.removeItem('profile_photo');
    localStorage.removeItem('user_role');
    
    toast.success('로그아웃되었습니다');
    
    // 회원가입 페이지로 이동
    navigate('/signup', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-white border-b border-line-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-[20px] font-bold text-text-900">프로필</h1>
          <button
            onClick={handleResumeEdit}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-[12px] 
                     text-[13px] font-medium text-text-900 transition-colors"
          >
            수정하기
          </button>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Trust Flip Card */}
        <TrustFlipCard
          profile={profile}
          verifications={verifications}
          onDetailClick={() => setShowVerifications(!showVerifications)}
        />

        {/* Verifications Section */}
        {showVerifications && (
          <div className="space-y-3">
            <h2 className="text-[18px] font-bold text-text-900">본인 인증</h2>
            <VerificationList
              verifications={verifications}
              onVerifyClick={handleVerifyClick}
            />
          </div>
        )}

        {/* 나의 매장 섹션 (고용주만) */}
        {isEmployer && (
          <div className="bg-white rounded-[16px] border border-line-200 p-5">
            <h2 className="text-[18px] font-bold text-text-900 mb-4">나의 매장</h2>
            <div className="space-y-3">
              {stores.length > 0 ? (
                <>
                  {stores.map((store) => (
<<<<<<< HEAD
                    <div key={store.id}>
                      <div
                        onClick={() => {
                          if (!store.is_main) {
                            setSelectedStoreId(selectedStoreId === store.id ? null : store.id);
                          }
                        }}
                        className={`relative bg-white rounded-[12px] border p-4 cursor-pointer transition-all ${
                          selectedStoreId === store.id && !store.is_main
                            ? 'border-mint-600 shadow-md'
                            : 'border-line-200'
                        }`}
                      >
                        {/* 기본 매장 태그 - 오른쪽 상단 */}
                        {store.is_main && (
                          <span className="absolute top-4 right-4 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[11px] font-semibold rounded-full">
                            기본가게
                          </span>
                        )}
                        {/* 가게 이름 - 위에 표시 */}
                        <h3 className="text-[16px] font-bold text-text-900 mb-2 pr-20">
                          {store.store_name}
                        </h3>
                        {/* 가게 위치 - 아래에 표시 */}
                        <p className="text-[13px] text-text-700">
                          {store.address}
                          {store.address_detail && ` ${store.address_detail}`}
                        </p>
                      </div>
                      
                      {/* 선택된 매장에 대한 액션 버튼들 (기본가게가 아닌 경우만) */}
                      {selectedStoreId === store.id && !store.is_main && (
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
                                const userId = localStorage.getItem('signup_user_id');
                                if (!userId) {
                                  toast.error('로그인 정보를 찾을 수 없습니다.');
                                  return;
                                }
                                
                                const response = await fetch(`${API_BASE_URL}/employer/stores/${userId}/${store.id}/set-main`, {
                                  method: 'PATCH',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                });
                                
                                if (!response.ok) {
                                  throw new Error('기본가게 설정에 실패했습니다');
                                }
                                
                                toast.success('기본가게로 설정되었습니다');
                                setSelectedStoreId(null);
                                
                                // 매장 목록 다시 불러오기
                                const storesData = await getStores(userId);
                                setStores(storesData);
                              } catch (error: any) {
                                console.error('기본가게 설정 실패:', error);
                                toast.error(error.message || '기본가게 설정에 실패했습니다');
                              }
                            }}
                            className="flex-1 px-4 py-2 bg-mint-600 text-white rounded-[8px] text-[13px] font-medium hover:bg-mint-700 transition-colors"
                          >
                            기본가게로 등록
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/employer/store-edit/${store.id}`);
                            }}
                            className="flex-1 px-4 py-2 bg-gray-100 text-text-900 rounded-[8px] text-[13px] font-medium hover:bg-gray-200 transition-colors"
                          >
                            가게 정보 수정
                          </button>
                        </div>
=======
                    <div
                      key={store.id}
                      className="relative bg-white rounded-[12px] border border-line-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* 기본 매장 태그 - 오른쪽 상단 */}
                      {store.is_main && (
                        <span className="absolute top-4 right-4 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[11px] font-semibold rounded-full">
                          기본매장
                        </span>
>>>>>>> e7a5e19 (WIP: save local changes before pulling origin/main)
                      )}
                    </div>
                  ))}
                </>
              ) : (
                // If no stores but we have employer profile data (from onboarding), show it as a fallback
                employerProfileData ? (
                  <div className="text-[14px] text-text-500 py-4">
                    <div className="text-center font-semibold text-text-900">{employerProfileData.company_name}</div>
                    <div className="text-center text-text-700 mt-1">{employerProfileData.address}{employerProfileData.address_detail ? ` ${employerProfileData.address_detail}` : ''}</div>
                    <p className="text-[13px] text-text-500 text-center mt-2">(온보딩에서 입력한 회사 정보입니다 — 매장 레코드가 생성되지 않아 기본 매장이 표시되지 않습니다)</p>
                  </div>
                ) : (
                  <p className="text-[14px] text-text-500 text-center py-4">
                    등록된 매장이 없습니다
                  </p>
                )
              )}
              <button
                onClick={() => navigate('/employer/store-add')}
                className="w-full h-[48px] bg-mint-600 text-white rounded-[12px] text-[15px] font-semibold hover:bg-mint-700 transition-colors"
              >
                매장 추가 등록하기
              </button>
            </div>
          </div>
        )}

        {/* Resume Details Toggle */}
        <button
          onClick={() => setShowResume(!showResume)}
          className="w-full bg-white rounded-[16px] border border-line-200 p-4 
                   hover:border-mint-600/30 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-mint-100 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-mint-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <span className="text-[15px] font-semibold text-text-900">
              {showResume ? "프로필 상세 접기" : "프로필 상세 보기"}
            </span>
          </div>
          <svg
            className={`w-5 h-5 text-text-700 transition-transform ${
              showResume ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Resume Section */}
        {showResume && (
          <div className="space-y-3">
            <h2 className="text-[18px] font-bold text-text-900">상세 정보</h2>
            <ResumeSection resume={resume} onEdit={handleResumeEdit} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-[16px] border border-line-200 overflow-hidden">
          <button
            onClick={() => {
              if (userMode === "employer") {
                navigate("/employer/schedule");
              } else {
                navigate("/jobseeker/schedule");
              }
            }}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-line-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-mint-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-mint-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-[15px] font-medium text-text-900">
                일정 관리
              </span>
            </div>
            <svg
              className="w-5 h-5 text-text-700"
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

          

          <button
            onClick={() => {
              if (isEmployer) {
                navigate("/employer/coming-soon", { state: { message: "기능을 준비 중입니다.", iconType: "message" } });
              } else {
                navigate("/employer/coming-soon", { state: { message: "기능을 준비 중입니다.", iconType: "message" } });
              }
            }}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-line-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-mint-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-mint-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <span className="text-[15px] font-medium text-text-900">
                메시지
              </span>
            </div>
            <svg
              className="w-5 h-5 text-text-700"
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

          <button
            onClick={() => {
              if (isEmployer) {
                navigate("/employer/coming-soon", { state: { message: "더욱 개인화된 알림 경험을 제공하기 위해\n알림 설정 페이지를 준비하고 있습니다.", iconType: "bell" } });
              } else {
                navigate("/employer/coming-soon", { state: { message: "더욱 개인화된 알림 경험을 제공하기 위해\n알림 설정 페이지를 준비하고 있습니다.", iconType: "bell" } });
              }
            }}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-line-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-mint-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-mint-600"
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
              </div>
              <span className="text-[15px] font-medium text-text-900">
                알림 설정
              </span>
            </div>
            <svg
              className="w-5 h-5 text-text-700"
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
          <button
            onClick={() => {
              if (isEmployer) {
                navigate("/employer/coming-soon", { state: { message: "사용자에게 더 편리한 언어 설정 기능을 제공하기 위해\n페이지를 준비하고 있습니다.", iconType: "language" } });
              } else {
                navigate("/employer/coming-soon", { state: { message: "사용자에게 더 편리한 언어 설정 기능을 제공하기 위해\n페이지를 준비하고 있습니다.", iconType: "language" } });
              }
            }}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-line-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-mint-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-mint-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
              </div>
              <span className="text-[15px] font-medium text-text-900">
                언어 설정
              </span>
            </div>
            <svg
              className="w-5 h-5 text-text-700"
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
                    <button
            onClick={() => {
              if (isEmployer) {
                navigate("/employer/help");
              } else {
                navigate("/jobseeker/help");
              }
            }}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-mint-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-mint-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-[15px] font-medium text-text-900">
                도움말
              </span>
            </div>
            <svg
              className="w-5 h-5 text-text-700"
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
          
          {/* 로그아웃 버튼 */}
          <button 
            onClick={handleLogout}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-red-50 transition-colors border-t border-line-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <span className="text-[15px] font-medium text-red-600">
                로그아웃
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
