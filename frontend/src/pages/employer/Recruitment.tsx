import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { InterviewProposalModal, type InterviewProposalData } from '@/components/InterviewProposalModal';
import { AcceptanceGuideModal, type AcceptanceGuideData } from '@/components/AcceptanceGuideModal';
import { useAuthStore } from '@/store/useAuth';
import { getStores, type StoreData } from '@/api/endpoints';

// localStorage 변경 감지를 위한 커스텀 훅
const useLocalStorage = (key: string) => {
  const [value, setValue] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem(key) || '[]');
    }
    return [];
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setValue(JSON.parse(localStorage.getItem(key) || '[]'));
    };

    window.addEventListener('storage', handleStorageChange);
    // 같은 탭에서의 변경도 감지하기 위해 interval 사용
    const interval = setInterval(() => {
      const newValue = JSON.parse(localStorage.getItem(key) || '[]');
      if (JSON.stringify(newValue) !== JSON.stringify(value)) {
        setValue(newValue);
      }
    }, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [key, value]);

  return value;
};

interface Applicant {
  id: string;
  userId?: string; // 지원자의 user_id (지원자 상세 페이지에서 필요)
  applicationId?: string; // 지원서 ID
  name: string;
  age: number;
  nationality: string;
  avatar?: string;
  jobTitle: string;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'hold';
  languageLevel: string;
  experience: string;
  tags: string[];
  storeId?: string; // 공고의 store_id
}

export const Recruitment = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'all' | 'new' | 'in_progress' | 'interview_result' | 'saved'>('all');
  const [interviewResultFilter, setInterviewResultFilter] = useState<'accepted' | 'hold' | 'rejected' | null>(null);
  
  // URL 쿼리 파라미터로 필터 초기화
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filterParam = params.get('filter');
    const resultParam = params.get('result');
    
    if (filterParam === 'interview_result') {
      setActiveFilter('interview_result');
      if (resultParam === 'accepted' || resultParam === 'hold' || resultParam === 'rejected') {
        setInterviewResultFilter(resultParam);
      }
    }
  }, []);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const savedApplicantIds = useLocalStorage('saved_applicants');
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [showAcceptanceGuideModal, setShowAcceptanceGuideModal] = useState(false);
  const [selectedApplicantForAcceptance, setSelectedApplicantForAcceptance] = useState<Applicant | null>(null);
  const [stores, setStores] = useState<StoreData[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [applicantToReject, setApplicantToReject] = useState<Applicant | null>(null);

  useEffect(() => {
    const loadStores = async () => {
      const signupUserId = useAuthStore.getState().signupUserId;
      const userId = signupUserId || localStorage.getItem('signup_user_id');
      if (userId) {
        try {
          const storesData = await getStores(userId);
          setStores(storesData);
        } catch (error) {
          console.error('매장 목록 로딩 오류:', error);
          setStores([]);
        }
      }
    };
    loadStores();
    fetchApplicants();
  }, [selectedStoreId]);

  // 페이지가 포커스될 때마다 지원자 목록 새로고침 (면접 제안 후 상태 업데이트를 위해)
  useEffect(() => {
    const handleFocus = () => {
      fetchApplicants();
    };
    
    // visibilitychange 이벤트도 추가 (탭 전환 시)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchApplicants();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      
      // Get user ID (prefer zustand-migrated value)
      const signupUserId = useAuthStore.getState().signupUserId;
      const userId = signupUserId || localStorage.getItem('signup_user_id');
      if (!userId) {
        toast.error('로그인이 필요합니다');
        return;
      }

      // Get all applications for this employer using userId
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const applicationsRes = await fetch(`${API_BASE_URL}/applications?userId=${userId}`);
      if (!applicationsRes.ok) {
        throw new Error('지원 내역을 가져올 수 없습니다');
      }
      const applications = await applicationsRes.json();
      console.log('[DEBUG] Applications response:', applications);
      console.log('[DEBUG] Applications count:', applications.length);
      console.log('[DEBUG] User ID used:', userId);
      
      // 응답이 배열이 아닌 경우 처리
      if (!Array.isArray(applications)) {
        console.error('[ERROR] Applications response is not an array:', applications);
        setApplicants([]);
        setLoading(false);
        return;
      }
      
      if (applications.length === 0) {
        console.warn('[WARNING] 지원 내역이 없습니다. 다음을 확인하세요:');
        console.warn('  1. 구직자가 실제로 지원했는지 확인');
        console.warn('  2. employer_profiles와 employers 연결 확인');
        console.warn('  3. jobs.employerId가 올바른지 확인');
        setApplicants([]);
        setLoading(false);
        return;
      }

      // Transform to Applicant format
      const applicantsData: Applicant[] = applications
        .filter((app: any) => {
          const hasSeekerId = !!app.seekerId;
          const hasJobseeker = !!app.jobseeker;
          if (!hasSeekerId && !hasJobseeker) {
            console.warn('[WARNING] Filtered out application (no seekerId or jobseeker):', app);
            console.warn('[WARNING] Application data:', JSON.stringify(app, null, 2));
          }
          return hasSeekerId || hasJobseeker;
        })
        .map((app: any) => {
          const seeker = app.jobseeker || {};
          // seekerId는 user_id와 동일 (Application.seekerId는 signup_user_id)
          // 백엔드 응답의 app_dict에 seekerId가 포함되어 있음 (app.dict()에 포함)
          const userId = app.seekerId; // app.seekerId는 필수이므로 이것을 사용
          
          if (!userId) {
            console.error('[ERROR] seekerId가 없는 지원서:', app);
            console.error('[ERROR] 전체 application 데이터:', JSON.stringify(app, null, 2));
          }
          
          console.log('[DEBUG] Processing applicant:', { 
            applicationId: app.applicationId, 
            seekerId: app.seekerId, 
            userId,
            hasJobseeker: !!app.jobseeker,
            jobseekerKeys: app.jobseeker ? Object.keys(app.jobseeker) : [],
            job: app.job,
            jobStoreId: app.job?.store_id || app.job?.storeId
          });
          
          let experience = [];
          try {
            experience = typeof seeker.experience === 'string' 
              ? JSON.parse(seeker.experience || '[]')
              : (seeker.experience || []);
          } catch {
            experience = [];
          }
          
          const expStr = experience.length > 0 
            ? experience.map((e: any) => {
                if (typeof e === 'string') return e;
                return `${e.role || ''} ${e.years || ''}년`.trim();
              }).filter(Boolean).join(', ')
            : '경력 없음';
          
          // Extract tags from preferences or experience
          const tags: string[] = [];
          try {
            const preferences = typeof seeker.preferences === 'string'
              ? JSON.parse(seeker.preferences || '{}')
              : (seeker.preferences || {});
            // Add tags based on preferences if needed
          } catch {}

          // store_id 추출 (여러 방법 시도)
          const storeId = app.job?.store_id || app.job?.storeId || app.job?.store_id || null;
          
          console.log('[DEBUG] Applicant store_id:', {
            applicationId: app.applicationId,
            job: app.job,
            store_id: app.job?.store_id,
            storeId: app.job?.storeId,
            finalStoreId: storeId
          });
          
          // 면접 제안 데이터 확인 (localStorage에서) - applicationId만 확인 (공고별로 구분)
          const interviewProposalKey = `interview_proposal_${app.applicationId}`;
          const interviewProposalData = localStorage.getItem(interviewProposalKey);
          const hasInterviewProposal = !!interviewProposalData;
          
          // 상태 결정: 백엔드 상태를 우선하되, 면접 제안이 있으면 'reviewed'로 설정
          let finalStatus: Applicant['status'];
          if (app.status === 'applied') {
            // 백엔드 상태가 'applied'이지만 면접 제안이 있으면 'reviewed'로 변경
            finalStatus = hasInterviewProposal ? 'reviewed' : 'pending';
          } else if (app.status === 'hired') {
            finalStatus = 'accepted';
          } else if (app.status === 'rejected') {
            finalStatus = 'rejected';
          } else if (app.status === 'hold') {
            finalStatus = 'hold';
          } else if (app.status === 'reviewed' || hasInterviewProposal) {
            // 면접 제안이 있거나 상태가 'reviewed'면 'reviewed' (진행중)
            finalStatus = 'reviewed';
          } else {
            finalStatus = 'pending';
          }
          
          return {
            id: app.applicationId,
            userId: userId, // 지원자의 user_id (지원자 상세 페이지에서 필요) - app.seekerId는 signup_user_id
            applicationId: app.applicationId,
            name: seeker.name || '이름 없음',
            age: 28, // Default age, can be calculated from birthdate if available
            nationality: seeker.nationality || '국적 없음',
            jobTitle: app.job?.title || '공고 제목 없음',
            appliedDate: app.appliedAt || new Date().toISOString(),
            status: finalStatus,
            languageLevel: seeker.languageLevel || '정보 없음',
            experience: expStr,
            tags: tags,
            storeId: storeId // 공고의 store_id 추가
          };
        });

      console.log('[DEBUG] Transformed applicants count:', applicantsData.length);
      console.log('[DEBUG] Transformed applicants:', applicantsData);
      setApplicants(applicantsData);
    } catch (error) {
      console.error('지원자 목록 로딩 실패:', error);
      console.error('Error details:', error);
      toast.error('지원자 목록을 불러오는데 실패했습니다');
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for fallback (remove later)
  const mockApplicants: Applicant[] = [
    {
      id: '1',
      name: '소피아',
      age: 28,
      nationality: '우즈베키스탄',
      jobTitle: '서빙 스태프',
      appliedDate: '2025-01-08',
      status: 'pending',
      languageLevel: 'Lv.2',
      experience: '레스토랑 2년',
      tags: ['영어 가능', '주말 근무 가능']
    },
    {
      id: '2',
      name: '응웬',
      age: 25,
      nationality: '베트남',
      jobTitle: '주방 보조',
      appliedDate: '2025-01-07',
      status: 'reviewed',
      languageLevel: 'Lv.3',
      experience: '요리 경력 3년',
      tags: ['베트남어 원어민', '장기 근무 가능']
    },
    {
      id: '3',
      name: '마리아',
      age: 30,
      nationality: '필리핀',
      jobTitle: '매장 관리',
      appliedDate: '2025-01-06',
      status: 'accepted',
      languageLevel: 'Lv.4',
      experience: '매장 관리 5년',
      tags: ['영어 원어민', '리더십']
    },
    {
      id: '4',
      name: '알렉스',
      age: 27,
      nationality: '미국',
      jobTitle: '서빙 스태프',
      appliedDate: '2025-01-05',
      status: 'rejected',
      languageLevel: 'Lv.1',
      experience: '서빙 경력 1년',
      tags: ['영어 원어민']
    }
  ];

  const filteredApplicants = (() => {
    let filtered = applicants;
    
    // 가게별 필터링
    if (selectedStoreId) {
      filtered = filtered.filter(a => a.storeId === selectedStoreId);
      console.log('[DEBUG] 가게별 필터링:', {
        selectedStoreId,
        totalApplicants: applicants.length,
        filteredCount: filtered.length,
        storeIds: applicants.map(a => a.storeId)
      });
    }
    
    // 상태별 필터링
    if (activeFilter === 'all') {
      return filtered;
    } else if (activeFilter === 'saved') {
      return filtered.filter(a => savedApplicantIds.includes(a.userId || ''));
    } else if (activeFilter === 'new') {
      // 신규: 새로 지원한 사람들 (status가 pending)
      return filtered.filter(a => a.status === 'pending');
    } else if (activeFilter === 'in_progress') {
      // 진행중: 면접 제안 보낸 사람들 (status가 reviewed)
      return filtered.filter(a => a.status === 'reviewed');
    } else if (activeFilter === 'interview_result') {
      // 면접결과: 합격/보류/불합격
      if (interviewResultFilter === 'accepted') {
        return filtered.filter(a => a.status === 'accepted');
      } else if (interviewResultFilter === 'hold') {
        return filtered.filter(a => a.status === 'hold');
      } else if (interviewResultFilter === 'rejected') {
        return filtered.filter(a => a.status === 'rejected');
      }
      // interviewResultFilter가 null이면 모든 면접결과 상태 표시
      return filtered.filter(a => a.status === 'accepted' || a.status === 'hold' || a.status === 'rejected');
    }
    return filtered;
  })();

  const getStatusBadge = (status: Applicant['status']) => {
    switch (status) {
      case 'pending':
        return { label: '신규', bg: 'bg-amber-100', text: 'text-amber-700' };
      case 'reviewed':
        return { label: '진행중', bg: 'bg-blue-100', text: 'text-blue-700' };
      case 'accepted':
        return { label: '합격', bg: 'bg-emerald-100', text: 'text-emerald-700' };
      case 'rejected':
        return { label: '불합격', bg: 'bg-gray-100', text: 'text-gray-700' };
      case 'hold':
        return { label: '보류', bg: 'bg-amber-100', text: 'text-amber-700' };
      default:
        return { label: '알 수 없음', bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  };

  const statusCounts = {
    all: applicants.length,
    new: applicants.filter(a => a.status === 'pending').length,
    in_progress: applicants.filter(a => a.status === 'reviewed').length,
    interview_result: applicants.filter(a => a.status === 'accepted' || a.status === 'hold' || a.status === 'rejected').length,
    saved: applicants.filter(a => savedApplicantIds.includes(a.userId || '')).length
  };

  const interviewResultCounts = {
    accepted: applicants.filter(a => a.status === 'accepted').length,
    hold: applicants.filter(a => a.status === 'hold').length,
    rejected: applicants.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-white border-b border-line-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-text-900">지원자 관리</h1>
            <p className="text-[13px] text-text-500 mt-1">
              총 {applicants.length}명의 지원자
            </p>
          </div>
          {/* 저장한 지원자 보기 버튼 */}
          <button
            onClick={() => {
              setActiveFilter('saved');
              setInterviewResultFilter(null);
            }}
            className={`p-2 rounded-[10px] transition-all ${
              activeFilter === 'saved'
                ? 'bg-mint-600 text-white'
                : 'bg-gray-100 text-text-700 hover:bg-gray-200'
            }`}
            title="저장한 지원자"
          >
            <svg
              className="w-5 h-5"
              fill={activeFilter === 'saved' ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Filter Tabs - 전체, 신규, 진행중, 면접결과, 가게선택 */}
      <div className="bg-white border-b border-line-200 px-4">
        <div className="flex gap-1.5 py-2.5 items-center justify-between">
          <div className="flex gap-1.5 items-center flex-1 min-w-0 overflow-x-auto">
            <button
              onClick={() => {
                setActiveFilter('all');
                setInterviewResultFilter(null);
              }}
              className={`px-3 py-2 rounded-[10px] text-[12px] font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-mint-600 text-white'
                  : 'bg-gray-100 text-text-700 hover:bg-gray-200'
              }`}
            >
              전체 ({statusCounts.all})
            </button>
            <button
              onClick={() => {
                setActiveFilter('new');
                setInterviewResultFilter(null);
              }}
              className={`px-3 py-2 rounded-[10px] text-[12px] font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeFilter === 'new'
                  ? 'bg-mint-600 text-white'
                  : 'bg-gray-100 text-text-700 hover:bg-gray-200'
              }`}
            >
              신규 ({statusCounts.new})
            </button>
            <button
              onClick={() => {
                setActiveFilter('in_progress');
                setInterviewResultFilter(null);
              }}
              className={`px-3 py-2 rounded-[10px] text-[12px] font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeFilter === 'in_progress'
                  ? 'bg-mint-600 text-white'
                  : 'bg-gray-100 text-text-700 hover:bg-gray-200'
              }`}
            >
              진행중 ({statusCounts.in_progress})
            </button>
            <button
              onClick={() => {
                setActiveFilter('interview_result');
                setInterviewResultFilter(null);
              }}
              className={`px-3 py-2 rounded-[10px] text-[12px] font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeFilter === 'interview_result'
                  ? 'bg-mint-600 text-white'
                  : 'bg-gray-100 text-text-700 hover:bg-gray-200'
              }`}
            >
              면접결과 ({statusCounts.interview_result})
            </button>
          </div>
          
          {/* 가게 선택 드롭다운 - 필터 탭 줄 오른쪽 끝 */}
          <div className="relative flex-shrink-0 ml-2">
            <button
              onClick={(e) => {
                if (stores.length > 0) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setDropdownPosition({
                    top: rect.bottom + window.scrollY + 8,
                    right: window.innerWidth - rect.right,
                  });
                  setShowStoreDropdown(!showStoreDropdown);
                } else {
                  toast.info('등록된 매장이 없습니다. 마이페이지에서 매장을 추가하세요.');
                }
              }}
              className="px-3 py-2 rounded-[10px] text-[12px] font-medium bg-white border border-line-200 
                       text-text-700 hover:bg-gray-50 transition-all flex items-center gap-1.5 whitespace-nowrap
                       disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={stores.length === 0}
            >
              <span className="inline-block max-w-[70px] truncate">
                {selectedStoreId === null
                  ? '가게선택'
                  : stores.find(s => s.id === selectedStoreId)?.store_name || '가게선택'}
              </span>
              <svg 
                className={`w-3 h-3 transition-transform flex-shrink-0 ${showStoreDropdown ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* 면접결과 서브 필터 - 면접결과 탭 선택 시 표시 */}
        {activeFilter === 'interview_result' && (
          <div className="flex gap-1.5 py-2.5 items-center border-t border-line-200 overflow-x-auto">
            <button
              onClick={() => setInterviewResultFilter(null)}
              className={`px-2.5 py-1.5 rounded-[10px] text-[11px] font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                interviewResultFilter === null
                  ? 'bg-mint-600 text-white'
                  : 'bg-gray-100 text-text-700 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setInterviewResultFilter('accepted')}
              className={`px-2.5 py-1.5 rounded-[10px] text-[11px] font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                interviewResultFilter === 'accepted'
                  ? 'bg-mint-600 text-white'
                  : 'bg-gray-100 text-text-700 hover:bg-gray-200'
              }`}
            >
              합격 ({interviewResultCounts.accepted})
            </button>
            <button
              onClick={() => setInterviewResultFilter('hold')}
              className={`px-2.5 py-1.5 rounded-[10px] text-[11px] font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                interviewResultFilter === 'hold'
                  ? 'bg-mint-600 text-white'
                  : 'bg-gray-100 text-text-700 hover:bg-gray-200'
              }`}
            >
              보류 ({interviewResultCounts.hold})
            </button>
            <button
              onClick={() => setInterviewResultFilter('rejected')}
              className={`px-2.5 py-1.5 rounded-[10px] text-[11px] font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                interviewResultFilter === 'rejected'
                  ? 'bg-mint-600 text-white'
                  : 'bg-gray-100 text-text-700 hover:bg-gray-200'
              }`}
            >
              불합격 ({interviewResultCounts.rejected})
            </button>
          </div>
        )}
      </div>
      
      {/* 드롭다운 메뉴 */}
      {showStoreDropdown && stores.length > 0 && dropdownPosition && (
        <>
          <div 
            className="fixed inset-0 z-[100]" 
            onClick={() => {
              setShowStoreDropdown(false);
              setDropdownPosition(null);
            }}
          />
          <div 
            className="fixed w-48 bg-white border border-line-200 rounded-[12px] 
                      shadow-lg z-[101] max-h-60 overflow-y-auto"
            style={{
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 전체 옵션 - 가장 먼저 */}
            <button
              onClick={() => {
                setSelectedStoreId(null);
                setShowStoreDropdown(false);
                setDropdownPosition(null);
              }}
              className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-gray-50 first:rounded-t-[12px] ${
                selectedStoreId === null ? 'bg-mint-50 text-mint-700 font-medium' : 'text-text-700'
              }`}
            >
              전체
            </button>
            {stores.map((store) => (
              <button
                key={store.id}
                onClick={() => {
                  setSelectedStoreId(store.id);
                  setShowStoreDropdown(false);
                  setDropdownPosition(null);
                }}
                className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-gray-50 last:rounded-b-[12px] ${
                  selectedStoreId === store.id ? 'bg-mint-50 text-mint-700 font-medium' : 'text-text-700'
                }`}
              >
                {store.store_name}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Applicants List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-text-500">불러오는 중...</p>
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-[15px] text-text-500">해당하는 지원자가 없습니다</p>
          </div>
        ) : (
          filteredApplicants.map((applicant) => {
            const statusBadge = getStatusBadge(applicant.status);
            return (
              <div
                key={applicant.id}
                onClick={() => {
                  // 지원자 상세 페이지는 user_id가 필요하므로 userId를 우선 사용
                  const targetId = applicant.userId || applicant.id;
                  navigate(`/employer/applicant/${targetId}`);
                }}
                className="bg-white rounded-[16px] p-4 border border-line-200 
                         hover:border-mint-600/30 hover:shadow-soft transition-all cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-mint-100 to-mint-200 
                               rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                    {applicant.avatar || '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[16px] font-bold text-text-900">
                        {applicant.name}, {applicant.age}세
                      </h3>
                      <span className={`px-2 py-0.5 rounded-[6px] text-[11px] font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <p className="text-[13px] text-text-500">
                      {applicant.nationality} · {applicant.jobTitle}
                    </p>
                    {/* 진행중 섹션에서 구직자 응답 상태 표시 */}
                    {activeFilter === 'in_progress' && applicant.status === 'reviewed' && applicant.applicationId && (() => {
                      const interviewResponseKey = `interview_response_${applicant.applicationId}`;
                      const responseData = localStorage.getItem(interviewResponseKey);
                      const response = responseData ? JSON.parse(responseData) : null;
                      
                      // 조율 메시지 확인
                      const interviewProposalKey = `interview_proposal_${applicant.applicationId}`;
                      const proposalData = localStorage.getItem(interviewProposalKey);
                      const proposal = proposalData ? JSON.parse(proposalData) : null;
                      const hasCoordinationMessage = proposal?.coordinationMessages && proposal.coordinationMessages.length > 0;
                      
                      // 면접 제안이 있지만 아직 응답이 없으면 "면접 제안 대기중" 표시
                      const hasInterviewProposal = !!proposalData;
                      
                      if (hasInterviewProposal || response || hasCoordinationMessage) {
                        return (
                          <div className="mt-2 space-y-1.5">
                            {!response && hasInterviewProposal && (
                              <span className="inline-block px-2.5 py-1 rounded-[6px] text-[11px] font-medium bg-gray-100 text-gray-700">
                                ⏳ 면접 제안 대기중
                              </span>
                            )}
                            {response && (
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2.5 py-1 rounded-[6px] text-[11px] font-medium ${
                                  response.response === 'accepted' 
                                    ? 'bg-mint-100 text-mint-700 border border-mint-300'
                                    : response.response === 'rejected'
                                    ? 'bg-mint-200 text-mint-800 border border-mint-400'
                                    : 'bg-mint-300 text-mint-900 border border-mint-500'
                                }`}>
                                  {response.response === 'accepted' ? '✓ 수락함' : response.response === 'rejected' ? '✗ 거절함' : '⏸ 보류함'}
                                </span>
                                {response.respondedAt && (
                                  <span className="text-[10px] text-text-500">
                                    {new Date(response.respondedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} 응답
                                  </span>
                                )}
                              </div>
                            )}
                            {hasCoordinationMessage && (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="px-2.5 py-1 rounded-[6px] text-[11px] font-medium bg-blue-100 text-blue-700 border border-blue-300">
                                    💬 조율 메시지 {proposal.coordinationMessages.length}개
                                  </span>
                                  {proposal.coordinationMessages[proposal.coordinationMessages.length - 1]?.sentAt && (
                                    <span className="text-[10px] text-text-500">
                                      {new Date(proposal.coordinationMessages[proposal.coordinationMessages.length - 1].sentAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                    </span>
                                  )}
                                </div>
                                {/* 최근 메시지 미리보기 */}
                                <div className="bg-blue-50 border border-blue-200 rounded-[6px] p-2">
                                  <p className="text-[11px] text-blue-800 line-clamp-2">
                                    {proposal.coordinationMessages[proposal.coordinationMessages.length - 1]?.message}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <svg className="w-5 h-5 text-text-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Info */}
                <div className="flex items-center gap-4 mb-3 text-[13px] text-text-700">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <span>{applicant.languageLevel}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{applicant.experience}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {applicant.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-mint-100 text-mint-700 rounded-[6px] text-[11px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-line-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[12px] text-text-500">
                      {new Date(applicant.appliedDate).toLocaleDateString('ko-KR')} 지원
                    </span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {activeFilter === 'in_progress' && applicant.status === 'reviewed' ? (
                      // 진행중 섹션: 합격/불합격/보류 버튼 (항상 표시)
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // 지원자 상세 페이지로 이동하여 합격 안내 모달 표시
                            const targetId = applicant.userId || applicant.id;
                            navigate(`/employer/applicant/${targetId}`);
                          }}
                          className="flex-1 h-10 rounded-[10px] bg-emerald-600 text-white font-medium text-[13px] flex items-center justify-center hover:bg-emerald-700 transition-colors"
                        >
                          합격
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setApplicantToReject(applicant);
                            setShowRejectConfirm(true);
                          }}
                          className="flex-1 h-10 rounded-[10px] bg-red-500 text-white font-medium text-[13px] flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          불합격
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!applicant.applicationId) return;
                            try {
                              const { applicationsAPI } = await import('@/api/endpoints');
                              await applicationsAPI.update(applicant.applicationId, 'hold');
                              setApplicants(prev => prev.map(a => 
                                a.applicationId === applicant.applicationId 
                                  ? { ...a, status: 'hold' as const }
                                  : a
                              ));
                              // 면접결과 섹션의 보류 필터로 자동 이동
                              setActiveFilter('interview_result');
                              setInterviewResultFilter('hold');
                              navigate('/employer/recruitment?filter=interview_result&result=hold', { replace: true });
                              toast.success('보류 처리되었습니다');
                            } catch (error) {
                              console.error('보류 처리 실패:', error);
                              toast.error('보류 처리에 실패했습니다');
                            }
                          }}
                          className="flex-1 h-10 rounded-[10px] bg-amber-500 text-white font-medium text-[13px] flex items-center justify-center hover:bg-amber-600 transition-colors"
                        >
                          보류
                        </button>
                      </>
                    ) : activeFilter === 'interview_result' && interviewResultFilter === 'hold' && applicant.status === 'hold' ? (
                      // 보류 섹션: 합격/불합격 버튼
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // 지원자 상세 페이지로 이동하여 합격 안내 모달 표시
                            const targetId = applicant.userId || applicant.id;
                            navigate(`/employer/applicant/${targetId}`);
                          }}
                          className="flex-1 h-10 rounded-[10px] bg-emerald-600 text-white font-medium text-[13px] flex items-center justify-center hover:bg-emerald-700 transition-colors"
                        >
                          합격
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setApplicantToReject(applicant);
                            setShowRejectConfirm(true);
                          }}
                          className="flex-1 h-10 rounded-[10px] bg-red-500 text-white font-medium text-[13px] flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          불합격
                        </button>
                      </>
                    ) : (
                      // 기본: 저장/채팅/면접 제안하기 버튼
                      <>
                        {/* 저장 버튼 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const applicantId = applicant.userId || applicant.id;
                            const savedApplicants = JSON.parse(localStorage.getItem('saved_applicants') || '[]');
                            
                            if (savedApplicants.includes(applicantId)) {
                              const updated = savedApplicants.filter((id: string) => id !== applicantId);
                              localStorage.setItem('saved_applicants', JSON.stringify(updated));
                              toast.success('저장이 해제되었습니다');
                            } else {
                              savedApplicants.push(applicantId);
                              localStorage.setItem('saved_applicants', JSON.stringify(savedApplicants));
                              toast.success('저장되었습니다');
                            }
                            // localStorage 변경을 감지하기 위해 페이지 새로고침 또는 상태 업데이트
                            window.dispatchEvent(new Event('storage'));
                          }}
                          className={`w-10 h-10 rounded-[10px] flex items-center justify-center border-2 transition-all ${
                            savedApplicantIds.includes(applicant.userId || applicant.id)
                              ? 'bg-mint-600 border-mint-600'
                              : 'bg-white border-mint-600'
                          }`}
                        >
                          <svg
                            className={`w-5 h-5 ${
                              savedApplicantIds.includes(applicant.userId || applicant.id)
                                ? 'text-white'
                                : 'text-mint-600'
                            }`}
                            fill={savedApplicantIds.includes(applicant.userId || applicant.id) ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                            />
                          </svg>
                        </button>

                        {/* 채팅 버튼 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const applicantId = applicant.userId || applicant.id;
                            const conversationId = `conv-${applicantId}`;
                            navigate(`/messages/${conversationId}`);
                          }}
                          className="flex-1 h-10 rounded-[10px] border-2 border-mint-600 bg-white text-mint-600 font-medium text-[13px] flex items-center justify-center gap-1.5 hover:bg-mint-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          채팅
                        </button>

                        {/* 면접 제안하기 버튼 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const applicantId = applicant.userId || applicant.id;
                            setSelectedApplicantId(applicantId);
                            setShowInterviewModal(true);
                          }}
                          className="flex-1 h-10 rounded-[10px] bg-mint-600 text-white font-medium text-[13px] flex items-center justify-center hover:bg-mint-700 transition-colors"
                        >
                          면접 제안하기
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 면접 제안 모달 */}
      <InterviewProposalModal
        isOpen={showInterviewModal}
        onClose={() => {
          setShowInterviewModal(false);
          setSelectedApplicantId(null);
        }}
        onSubmit={async (data: InterviewProposalData) => {
          if (!selectedApplicantId) return;
          
          try {
            console.log('면접 제안 데이터:', data);
            
            // 지원서 ID 찾기
            const applicant = applicants.find(a => (a.userId || a.id) === selectedApplicantId);
            if (!applicant || !applicant.applicationId) {
              toast.error('지원서 정보를 찾을 수 없습니다');
              return;
            }
            
            // 면접제안 데이터를 로컬스토리지에 저장 (구직자가 확인할 수 있도록)
            const interviewProposal = {
              dates: data.selectedDates,
              time: data.time,
              duration: data.duration,
              message: data.message,
              status: 'pending' as const,
              isRead: false,
              allDatesTimeSlots: data.allDatesTimeSlots,
              dateSpecificTimes: data.dateSpecificTimes,
            };
            localStorage.setItem(`interview_proposal_${applicant.applicationId}`, JSON.stringify(interviewProposal));
            
            // 지원 상태를 'reviewed' (진행중)로 업데이트
            try {
              const { applicationsAPI } = await import('@/api/endpoints');
              await applicationsAPI.update(applicant.applicationId, 'reviewed');
              
              // 로컬 상태도 업데이트
              setApplicants(prev => prev.map(a => 
                a.applicationId === applicant.applicationId 
                  ? { ...a, status: 'reviewed' as const }
                  : a
              ));
            } catch (error) {
              console.error('지원 상태 업데이트 실패:', error);
              // 상태 업데이트 실패해도 면접 제안은 계속 진행
            }
            
            // TODO: 실제 API 호출
            // await applicationsAPI.proposeInterview(selectedApplicantId, data);
            await new Promise(resolve => setTimeout(resolve, 500));
            setShowInterviewModal(false);
            setSelectedApplicantId(null);
            toast.success('면접 제안이 전송되었습니다');
            
            // 면접 제안 완료 페이지로 이동
            navigate('/employer/interview-proposed', {
              state: {
                interviewData: data,
                applicantName: applicant.name,
              },
            });
          } catch (error) {
            toast.error('면접 제안 전송 중 오류가 발생했습니다');
          }
        }}
        applicantName={applicants.find(a => (a.userId || a.id) === selectedApplicantId)?.name}
      />

      {/* 불합격 확인 팝업 */}
      {showRejectConfirm && applicantToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowRejectConfirm(false);
              setApplicantToReject(null);
            }}
          />
          <div className="relative bg-white rounded-[24px] p-6 w-[90%] max-w-md">
            <h2 className="text-[20px] font-bold text-text-900 mb-4">
              불합격 처리
            </h2>
            <p className="text-[14px] text-text-700 mb-6">
              이 지원자와 관련된 정보는 삭제됩니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!applicantToReject.applicationId) return;
                  try {
                    const { applicationsAPI } = await import('@/api/endpoints');
                    await applicationsAPI.update(applicantToReject.applicationId, 'rejected');
                    setApplicants(prev => prev.map(a => 
                      a.applicationId === applicantToReject.applicationId 
                        ? { ...a, status: 'rejected' as const }
                        : a
                    ));
                    // 면접결과 섹션의 불합격 필터로 자동 이동
                    setActiveFilter('interview_result');
                    setInterviewResultFilter('rejected');
                    navigate('/employer/recruitment?filter=interview_result&result=rejected', { replace: true });
                    toast.success('불합격 처리되었습니다');
                    setShowRejectConfirm(false);
                    setApplicantToReject(null);
                  } catch (error) {
                    console.error('불합격 처리 실패:', error);
                    toast.error('불합격 처리에 실패했습니다');
                  }
                }}
                className="flex-1 h-12 rounded-[12px] bg-red-500 text-white font-medium text-[14px] flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                불합격 (삭제하기)
              </button>
              <button
                onClick={async () => {
                  if (!applicantToReject.applicationId) return;
                  try {
                    const { applicationsAPI } = await import('@/api/endpoints');
                    await applicationsAPI.update(applicantToReject.applicationId, 'hold');
                    setApplicants(prev => prev.map(a => 
                      a.applicationId === applicantToReject.applicationId 
                        ? { ...a, status: 'hold' as const }
                        : a
                    ));
                    // 면접결과 섹션의 보류 필터로 자동 이동
                    setActiveFilter('interview_result');
                    setInterviewResultFilter('hold');
                    navigate('/employer/recruitment?filter=interview_result&result=hold', { replace: true });
                    toast.success('보류 처리되었습니다');
                    setShowRejectConfirm(false);
                    setApplicantToReject(null);
                  } catch (error) {
                    console.error('보류 처리 실패:', error);
                    toast.error('보류 처리에 실패했습니다');
                  }
                }}
                className="flex-1 h-12 rounded-[12px] bg-amber-500 text-white font-medium text-[14px] flex items-center justify-center hover:bg-amber-600 transition-colors"
              >
                보류
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 합격 안내 모달 */}
      {showAcceptanceGuideModal && selectedApplicantForAcceptance && (
        <AcceptanceGuideModal
          isOpen={showAcceptanceGuideModal}
          onClose={() => {
            setShowAcceptanceGuideModal(false);
            setSelectedApplicantForAcceptance(null);
          }}
          onConfirm={async (data: AcceptanceGuideData) => {
            if (!selectedApplicantForAcceptance.applicationId) return;
            try {
              const { applicationsAPI } = await import('@/api/endpoints');
              await applicationsAPI.update(selectedApplicantForAcceptance.applicationId, 'accepted');
              // 합격 안내 데이터 저장
              localStorage.setItem(`acceptance_guide_${selectedApplicantForAcceptance.applicationId}`, JSON.stringify(data));
              setApplicants(prev => prev.map(a => 
                a.applicationId === selectedApplicantForAcceptance.applicationId 
                  ? { ...a, status: 'accepted' as const }
                  : a
              ));
              // 면접결과 섹션의 합격 필터로 자동 이동
              setActiveFilter('interview_result');
              setInterviewResultFilter('accepted');
              // URL 업데이트
              navigate('/employer/recruitment?filter=interview_result&result=accepted', { replace: true });
              toast.success('합격 처리되었습니다');
              setShowAcceptanceGuideModal(false);
              setSelectedApplicantForAcceptance(null);
            } catch (error) {
              console.error('합격 처리 실패:', error);
              toast.error('합격 처리에 실패했습니다');
            }
          }}
          applicantName={selectedApplicantForAcceptance.name}
        />
      )}
    </div>
  );
};

