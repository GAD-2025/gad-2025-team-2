import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Header } from '@/components/Header';
import { applicationsAPI, jobsAPI } from '@/api/endpoints';
import { useAuthStore } from '@/store/useAuth';
import type { Job } from '@/types';

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  shopName: string;
  wage: number;
  location: string;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'interview';
  interviewProposal?: {
    dates: string[];
    time: string;
    duration: number;
    message: string;
    status: 'pending' | 'accepted' | 'rejected' | 'hold';
    isRead: boolean;
    allDatesTimeSlots?: Array<{ time: string; duration: number }>;
    dateSpecificTimes?: Record<string, Array<{ time: string; duration: number }>>;
    coordinationMessages?: Array<{ message: string; sentAt: string; from?: string }>;
    isConfirmed?: boolean;
    coordinationStatus?: 'in_progress' | 'confirmed' | null;
  };
  acceptanceData?: {
    documents: string[];
    workAttire: string[];
    workNotes: string[];
    firstWorkDate?: string;
    firstWorkTime?: string;
    coordinationMessage?: string;
    createdAt?: string;
  };
  coordinationMessages?: Array<{ message: string; sentAt: string; from?: string; type?: string }>; // 출근 날짜 조율 메시지
  firstWorkDateConfirmed?: string; // 채용 확정된 첫 출근 날짜
}

// Backend status to frontend status mapping
const mapStatus = (backendStatus: string): Application['status'] => {
  switch (backendStatus) {
    case 'applied':
      return 'pending';
    case 'hired':
      return 'accepted';
    case 'rejected':
      return 'rejected';
    default:
      return 'pending';
  }
};

export const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'interview'>('all');
  const [selectedInterviewApp, setSelectedInterviewApp] = useState<Application | null>(null);
  const [showInterviewDetail, setShowInterviewDetail] = useState(false);
  const [coordinationMessage, setCoordinationMessage] = useState('');
  const [selectedAcceptedApp, setSelectedAcceptedApp] = useState<Application | null>(null);
  const [showAcceptanceDetail, setShowAcceptanceDetail] = useState(false);
  const [showHiredConfirmation, setShowHiredConfirmation] = useState(false);
  const [hiredApplicationId, setHiredApplicationId] = useState<string | null>(null);
  const [coordinationMessages, setCoordinationMessages] = useState<Record<string, string>>({});
  const [showWorkConfirmSuccess, setShowWorkConfirmSuccess] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  // 페이지가 포커스될 때마다 지원 내역 새로고침 (면접 제안 받은 후 상태 업데이트를 위해)
  useEffect(() => {
    const handleFocus = () => {
      fetchApplications();
    };
    
    // visibilitychange 이벤트도 추가 (탭 전환 시)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchApplications();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      // Get current user ID (prefer zustand-migrated value)
      const signupUserId = useAuthStore.getState().signupUserId;
      const userId = signupUserId || localStorage.getItem('signup_user_id');
      if (!userId) {
        console.error('No user ID found');
        toast.error('로그인이 필요합니다');
        navigate('/signin');
        return;
      }

      // Fetch applications from backend
      const applicationsResponse = await applicationsAPI.list(userId);
      console.log('Fetched applications:', applicationsResponse.data);

      // If no applications, show empty state
      if (!applicationsResponse.data || applicationsResponse.data.length === 0) {
        setApplications([]);
        return;
      }

      // Fetch job details for each application
      const applicationsWithJobDetails = await Promise.all(
        applicationsResponse.data.map(async (app: any) => {
          try {
            const jobResponse = await jobsAPI.get(app.jobId);
            const job: Job = jobResponse.data;
            
            // 면접제안 데이터 로드 (API 우선, localStorage fallback)
            let interviewProposal = app.interviewData || null;
            if (!interviewProposal) {
              // localStorage fallback
              const interviewProposalData = localStorage.getItem(`interview_proposal_${app.applicationId}`);
              interviewProposal = interviewProposalData ? JSON.parse(interviewProposalData) : null;
            }
            
            // API의 coordinationMessages 우선 사용
            const coordinationMessages = app.coordinationMessages || interviewProposal?.coordinationMessages || [];
            
            // 면접 제안이 있으면 상태와 관계없이 true (API에서 interviewData가 있거나 localStorage에 있으면)
            const hasInterviewProposal = !!interviewProposal;
            
            // 합격 안내 데이터 확인 (API 우선)
            let acceptanceData = app.acceptanceData || null;
            if (!acceptanceData) {
              // localStorage fallback
              const acceptanceKey = `acceptance_guide_${app.applicationId}`;
              const acceptanceDataStr = localStorage.getItem(acceptanceKey);
              acceptanceData = acceptanceDataStr ? JSON.parse(acceptanceDataStr) : null;
            }
            const hasAcceptanceGuide = !!acceptanceData;
            
            // 불합격 상태 확인
            const isRejected = app.status === 'rejected';
            
            // 상태 우선순위: 합격 > 불합격 > 면접제안 > 기타
            let finalStatus = mapStatus(app.status);
            if (hasAcceptanceGuide) {
              finalStatus = 'accepted';
            } else if (isRejected) {
              finalStatus = 'rejected';
            } else if (hasInterviewProposal) {
              // 면접 제안이 있으면 무조건 'interview' 상태로 설정
              finalStatus = 'interview';
            }
            
            return {
              id: app.applicationId,
              jobId: app.jobId,
              jobTitle: job.title,
              shopName: job.employer?.name || job.employer?.industry || '회사명 미등록',
              wage: job.wage,
              location: job.employer?.address || '위치 미등록',
              appliedDate: app.appliedAt.split('T')[0], // Extract date from ISO string
              status: finalStatus,
              interviewProposal: hasInterviewProposal ? {
                dates: interviewProposal.selectedDates || interviewProposal.dates || [],
                time: interviewProposal.time || '',
                duration: interviewProposal.duration || 30,
                message: interviewProposal.message || '',
                status: interviewProposal.status || 'pending',
                isRead: interviewProposal.isRead || false,
                allDatesTimeSlots: interviewProposal.allDatesTimeSlots,
                dateSpecificTimes: interviewProposal.dateSpecificTimes,
                coordinationMessages: coordinationMessages,
                isConfirmed: interviewProposal.isConfirmed || false,
                coordinationStatus: interviewProposal.coordinationStatus || null,
              } : undefined,
              acceptanceData: acceptanceData,
              coordinationMessages: (app as any).coordinationMessages || [], // API에서 가져온 조율 메시지 (출근 날짜 조율)
              firstWorkDateConfirmed: (app as any).firstWorkDateConfirmed || null, // API에서 가져온 채용 확정 날짜
            } as Application;
          } catch (error) {
            console.error(`Failed to fetch job ${app.jobId}:`, error);
            // Return a fallback application entry
            const appliedDate = app.appliedAt ? app.appliedAt.split('T')[0] : new Date().toISOString().split('T')[0];
            const fallbackStatus = mapStatus(app.status);
            
            // 면접 제안 데이터 확인 (API 우선, localStorage fallback)
            let interviewProposal = app.interviewData || null;
            if (!interviewProposal) {
              const interviewProposalData = localStorage.getItem(`interview_proposal_${app.applicationId}`);
              interviewProposal = interviewProposalData ? JSON.parse(interviewProposalData) : null;
            }
            const coordinationMessages = app.coordinationMessages || interviewProposal?.coordinationMessages || [];
            // 면접 제안이 있으면 상태와 관계없이 true
            const hasInterviewProposal = !!interviewProposal;
            
            // 합격 안내 데이터 확인 (API 우선)
            let acceptanceData = app.acceptanceData || null;
            if (!acceptanceData) {
              const acceptanceKey = `acceptance_guide_${app.applicationId}`;
              const acceptanceDataStr = localStorage.getItem(acceptanceKey);
              acceptanceData = acceptanceDataStr ? JSON.parse(acceptanceDataStr) : null;
            }
            const hasAcceptanceGuide = !!acceptanceData;
            
            // 불합격 상태 확인
            const isRejected = app.status === 'rejected';
            
            // 상태 우선순위: 합격 > 불합격 > 면접제안 > 기타
            let finalStatus = fallbackStatus;
            if (hasAcceptanceGuide) {
              finalStatus = 'accepted';
            } else if (isRejected) {
              finalStatus = 'rejected';
            } else if (hasInterviewProposal) {
              finalStatus = 'interview';
            }
            
            return {
              id: app.applicationId,
              jobId: app.jobId,
              jobTitle: '공고 정보를 불러올 수 없습니다',
              shopName: '정보 없음',
              wage: 0,
              location: '정보 없음',
              appliedDate,
              status: finalStatus,
              interviewProposal: hasInterviewProposal ? {
                dates: interviewProposal.selectedDates || interviewProposal.dates || [],
                time: interviewProposal.time || '',
                duration: interviewProposal.duration || 30,
                message: interviewProposal.message || '',
                status: interviewProposal.status || 'pending',
                isRead: interviewProposal.isRead || false,
                allDatesTimeSlots: interviewProposal.allDatesTimeSlots,
                dateSpecificTimes: interviewProposal.dateSpecificTimes,
                coordinationMessages: coordinationMessages,
                isConfirmed: interviewProposal.isConfirmed || false,
                coordinationStatus: interviewProposal.coordinationStatus || null,
              } : undefined,
              acceptanceData: acceptanceData,
              coordinationMessages: (app as any).coordinationMessages || [], // API에서 가져온 조율 메시지 (출근 날짜 조율)
              firstWorkDateConfirmed: (app as any).firstWorkDateConfirmed || null, // API에서 가져온 채용 확정 날짜
            } as Application;
          }
        })
      );

      setApplications(applicationsWithJobDetails);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      toast.error('지원 내역을 불러오는데 실패했습니다');
      // Fallback to empty array on error
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Application['status']) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      pending: { label: '대기중', color: 'bg-yellow-100 text-yellow-700' },
      reviewed: { label: '면접 제안', color: 'bg-blue-100 text-blue-700' },
      interview: { label: '면접 제안', color: 'bg-blue-100 text-blue-700' },
      accepted: { label: '합격', color: 'bg-mint-100 text-mint-600' },
      rejected: { label: '불합격', color: 'bg-red-100 text-red-600' }
    };

    const config = statusConfig[status] || { label: '알 수 없음', color: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-[10px] py-[4px] rounded-[8px] text-[12px] font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  };

  const filteredApplications = (() => {
    if (activeFilter === 'all') {
      return applications;
    } else if (activeFilter === 'interview') {
      // 면접제안 필터: status가 'interview'이거나 interviewProposal이 있는 경우 (단, 합격된 것은 제외)
      return applications.filter(app => 
        (app.status === 'interview' || !!app.interviewProposal) && app.status !== 'accepted'
      );
    } else if (activeFilter === 'pending') {
      // 대기중 필터: status가 'pending'이고 면접 제안이 없는 경우만
      return applications.filter(app => app.status === 'pending' && !app.interviewProposal);
    } else if (activeFilter === 'accepted') {
      // 합격 필터: 합격된 모든 지원서 표시 (채용 확정 전/후 모두 포함)
      return applications.filter(app => {
        return app.status === 'accepted';
      });
    } else {
      return applications.filter(app => app.status === activeFilter);
    }
  })();
  
  // 면접 제안이 있고 읽지 않은 지원서 개수 (합격된 것은 제외)
  const unreadInterviewCount = applications.filter(
    app => (app.status === 'interview' || !!app.interviewProposal) && 
           app.status !== 'accepted' &&
           app.interviewProposal && !app.interviewProposal.isRead
  ).length;

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending' && !a.interviewProposal).length,
    reviewed: applications.filter(a => a.status === 'reviewed').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    interview: applications.filter(a => (a.status === 'interview' || !!a.interviewProposal) && a.status !== 'accepted').length,
  };
  
  const handleInterviewResponse = async (app: Application, response: 'accepted' | 'rejected' | 'hold') => {
    if (!app.interviewProposal) return;
    
    try {
      // 면접 제안 응답을 localStorage에 저장 (고용주가 확인할 수 있도록)
      const interviewProposalKey = `interview_proposal_${app.id}`;
      const currentProposal = localStorage.getItem(interviewProposalKey);
      if (currentProposal) {
        const proposal = JSON.parse(currentProposal);
        proposal.status = response;
        proposal.responseAt = new Date().toISOString();
        localStorage.setItem(interviewProposalKey, JSON.stringify(proposal));
        
        // 고용주 알림 저장
        const employerNotificationKey = `interview_response_${app.id}`;
        localStorage.setItem(employerNotificationKey, JSON.stringify({
          applicationId: app.id,
          jobId: app.jobId,
          response: response,
          respondedAt: new Date().toISOString(),
        }));
        
        // 백엔드 interviewData 업데이트 (응답 상태 포함)
        try {
          await applicationsAPI.updateInterviewProposal(app.id, {
            selectedDates: proposal.dates || proposal.selectedDates || [],
            time: proposal.time || '',
            duration: proposal.duration || 30,
            message: proposal.message || '',
            allDatesSame: proposal.allDatesSame !== undefined ? proposal.allDatesSame : true,
            allDatesTimeSlots: proposal.allDatesTimeSlots,
            dateSpecificTimes: proposal.dateSpecificTimes,
            isConfirmed: proposal.isConfirmed || false, // 기존 확정 상태 유지
          });
        } catch (apiError) {
          console.error('면접 응답 API 업데이트 실패:', apiError);
        }
      }
      
      // 불합격인 경우 백엔드 상태도 'rejected'로 업데이트
      if (response === 'rejected') {
        try {
          await applicationsAPI.update(app.id, 'rejected');
        } catch (error) {
          console.error('백엔드 상태 업데이트 실패:', error);
        }
      }
      
      // 로컬 상태 업데이트 (면접 수락해도 바로 합격으로 가지 않음 - 사장님이 합격 버튼을 눌러야 함)
      setApplications(prev => prev.map(a => 
        a.id === app.id && a.interviewProposal
          ? {
              ...a,
              interviewProposal: {
                ...a.interviewProposal,
                status: response,
                isRead: true
              },
              // 면접 수락해도 상태는 'interview'로 유지 (사장님이 합격 버튼을 눌러야 'accepted'로 변경)
              // 불합격인 경우 'rejected'로 변경
              status: response === 'rejected' ? 'rejected' : a.status
            }
          : a
      ));
      
      toast.success(`면접 ${response === 'accepted' ? '수락' : response === 'rejected' ? '거절' : '보류'} 처리되었습니다`);
      if (response === 'accepted') {
        toast.info('사장님의 최종 결정을 기다려주세요');
      }
      setShowInterviewDetail(false);
      setCoordinationMessage('');
      fetchApplications(); // 상태 업데이트를 위해 다시 불러오기
    } catch (error) {
      console.error('면접 응답 처리 실패:', error);
      toast.error('처리 중 오류가 발생했습니다');
    }
  };
  
  const handleSendCoordinationMessage = async (app: Application) => {
    if (!coordinationMessage.trim()) {
      toast.error('메시지를 입력해주세요');
      return;
    }
    
    if (!app.interviewProposal) return;
    
    try {
      // 조율 메시지를 localStorage에 저장 (고용주가 확인할 수 있도록)
      const interviewProposalKey = `interview_proposal_${app.id}`;
      const currentProposal = localStorage.getItem(interviewProposalKey);
      if (currentProposal) {
        const proposal = JSON.parse(currentProposal);
        if (!proposal.coordinationMessages) {
          proposal.coordinationMessages = [];
        }
        proposal.coordinationMessages.push({
          message: coordinationMessage,
          sentAt: new Date().toISOString(),
          from: 'jobseeker',
        });
        localStorage.setItem(interviewProposalKey, JSON.stringify(proposal));
      }
      
      // 고용주 알림 저장
      const employerMessageKey = `coordination_message_${app.id}_${Date.now()}`;
      localStorage.setItem(employerMessageKey, JSON.stringify({
        applicationId: app.id,
        jobId: app.jobId,
        message: coordinationMessage,
        sentAt: new Date().toISOString(),
      }));
      
      // 로컬 상태 업데이트
      setApplications(prev => prev.map(a => 
        a.id === app.id && a.interviewProposal
          ? {
              ...a,
              interviewProposal: {
                ...a.interviewProposal,
                coordinationMessages: [
                  ...(a.interviewProposal.coordinationMessages || []),
                  { message: coordinationMessage, sentAt: new Date().toISOString() }
                ]
              }
            }
          : a
      ));
      
      toast.success('메시지가 전송되었습니다');
      setCoordinationMessage('');
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      toast.error('메시지 전송에 실패했습니다');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="지원 현황" showBack />

      {/* Status Filter */}
      <div className="bg-white border-b border-line-200 p-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-mint-600 text-white'
                : 'bg-background text-text-700 border border-line-200 hover:border-mint-600'
            }`}
          >
            전체 ({statusCounts.all})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
              activeFilter === 'pending'
                ? 'bg-mint-600 text-white'
                : 'bg-background text-text-700 border border-line-200 hover:border-mint-600'
            }`}
          >
            대기중 ({statusCounts.pending})
          </button>
          <button
            onClick={() => setActiveFilter('interview')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-colors relative ${
              activeFilter === 'interview'
                ? 'bg-mint-600 text-white'
                : 'bg-background text-text-700 border border-line-200 hover:border-mint-600'
            }`}
          >
            면접제안 ({statusCounts.interview})
            {unreadInterviewCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-[8px] text-white font-bold">{unreadInterviewCount}</span>
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveFilter('accepted')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
              activeFilter === 'accepted'
                ? 'bg-mint-600 text-white'
                : 'bg-background text-text-700 border border-line-200 hover:border-mint-600'
            }`}
          >
            합격 ({statusCounts.accepted})
          </button>
          <button
            onClick={() => setActiveFilter('rejected')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
              activeFilter === 'rejected'
                ? 'bg-mint-600 text-white'
                : 'bg-background text-text-700 border border-line-200 hover:border-mint-600'
            }`}
          >
            불합격 ({statusCounts.rejected})
          </button>
        </div>
      </div>

      {/* 합격안내 상세 모달 */}
      {showAcceptanceDetail && selectedAcceptedApp && (() => {
        // API 데이터 우선, localStorage fallback
        let acceptance = selectedAcceptedApp.acceptanceData || null;
        if (!acceptance) {
          const acceptanceKey = `acceptance_guide_${selectedAcceptedApp.id}`;
          const acceptanceDataStr = localStorage.getItem(acceptanceKey);
          acceptance = acceptanceDataStr ? JSON.parse(acceptanceDataStr) : null;
        }
        
        const isConfirmed = selectedAcceptedApp.acceptanceData?.firstWorkDateConfirmed || 
                           localStorage.getItem(`first_work_date_confirmed_${selectedAcceptedApp.id}`) === 'true';
        const localCoordinationMessage = coordinationMessages[selectedAcceptedApp.id] || '';
        const setLocalCoordinationMessage = (value: string) => {
          setCoordinationMessages(prev => ({ ...prev, [selectedAcceptedApp.id]: value }));
        };
        
        if (!acceptance) return null;
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-[24px] p-6 w-[90%] max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[18px] font-bold text-text-900">합격 안내</h2>
                <button
                  onClick={() => {
                    setShowAcceptanceDetail(false);
                    setSelectedAcceptedApp(null);
                  }}
                  className="text-text-500 hover:text-text-900"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* 공고 내용 간략 표시 */}
              <div className="bg-mint-50 rounded-[12px] p-4 mb-4">
                <h3 className="text-[16px] font-bold text-text-900 mb-2">{selectedAcceptedApp.jobTitle}</h3>
                <p className="text-[14px] text-text-700">{selectedAcceptedApp.shopName}</p>
                <p className="text-[13px] text-text-500 mt-1">{selectedAcceptedApp.location}</p>
              </div>
              
              {/* 첫 출근 안내 */}
              <div className="mb-4">
                <h3 className="text-[15px] font-semibold text-text-700 mb-3">첫 출근 안내</h3>
                <div className="bg-mint-50 rounded-[12px] p-4 space-y-3">
                  {(() => {
                    // firstWorkDateConfirmed 우선, 없으면 acceptanceData의 firstWorkDate 사용
                    const workDate = selectedAcceptedApp.firstWorkDateConfirmed || acceptance.firstWorkDate;
                    if (workDate) {
                      return (
                        <div>
                          <p className="text-[12px] text-text-600 mb-1">첫 출근 날짜</p>
                          <p className="text-[13px] font-medium text-text-900">
                            {new Date(workDate).toLocaleDateString('ko-KR', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric',
                              weekday: 'short'
                            })}
                            {acceptance.firstWorkTime && ` ${acceptance.firstWorkTime}`}
                            {selectedAcceptedApp.firstWorkDateConfirmed && (
                              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-[4px] text-[11px] font-medium">
                                확정됨
                              </span>
                            )}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  {acceptance.documents && acceptance.documents.length > 0 && (
                    <div>
                      <p className="text-[12px] text-text-600 mb-1">제출 서류</p>
                      <div className="flex flex-wrap gap-1">
                        {acceptance.documents.map((doc: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 bg-white text-mint-700 rounded-[6px] text-[11px] font-medium">
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {acceptance.workAttire && acceptance.workAttire.length > 0 && (
                    <div>
                      <p className="text-[12px] text-text-600 mb-1">근무 복장</p>
                      <div className="flex flex-wrap gap-1">
                        {acceptance.workAttire.map((attire: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 bg-white text-mint-700 rounded-[6px] text-[11px] font-medium">
                            {attire}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {acceptance.workNotes && acceptance.workNotes.length > 0 && (
                    <div>
                      <p className="text-[12px] text-text-600 mb-1">근무 시 유의 사항</p>
                      <div className="flex flex-wrap gap-1">
                        {acceptance.workNotes.map((note: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 bg-white text-mint-700 rounded-[6px] text-[11px] font-medium">
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* 조율 메시지 표시 (구직자 입장에서는 고용주가 보낸 메시지만 표시) */}
                  {(() => {
                    // API 데이터 우선, localStorage fallback
                    let allMessages: any[] = [];
                    if (selectedAcceptedApp.interviewProposal?.coordinationMessages) {
                      allMessages = selectedAcceptedApp.interviewProposal.coordinationMessages;
                    } else {
                      const coordinationKey = `coordination_messages_${selectedAcceptedApp.id}`;
                      const coordinationData = localStorage.getItem(coordinationKey);
                      if (coordinationData) {
                        allMessages = JSON.parse(coordinationData);
                      }
                    }
                    const employerMessages = allMessages.filter((msg: any) => msg.from === 'employer');
                    
                    if (employerMessages.length > 0) {
                      return (
                        <div className="pt-3 border-t border-mint-200">
                          <p className="text-[12px] text-text-600 mb-1">조율 메시지</p>
                          <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
                            {employerMessages.map((msg: any, idx: number) => (
                              <div key={idx} className="bg-white rounded-[6px] p-2 border border-mint-200">
                                <p className="text-[12px] text-text-900 whitespace-pre-wrap">{msg.message}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
              
              {/* 액션 버튼: 조율, 출근 확정, 출근 거부 */}
              <div className="space-y-2 mt-4">
                <button
                  onClick={async () => {
                    // 조율 버튼: 조율 메시지 입력 모달 표시
                    const message = prompt('조율 메시지를 입력하세요:');
                    if (message && message.trim()) {
                      try {
                        // API로 조율 메시지 전송 (출근 날짜 조율)
                        await applicationsAPI.addCoordinationMessage(selectedAcceptedApp.id, {
                          message: message.trim(),
                          type: 'work_date_coordination',
                        });
                        
                        // localStorage에도 저장 (fallback)
                        const coordinationKey = `coordination_messages_${selectedAcceptedApp.id}`;
                        const existingMessages = localStorage.getItem(coordinationKey);
                        const messages = existingMessages ? JSON.parse(existingMessages) : [];
                        messages.push({
                          message: message.trim(),
                          sentAt: new Date().toISOString(),
                          from: 'jobseeker',
                          type: 'work_date_coordination',
                        });
                        localStorage.setItem(coordinationKey, JSON.stringify(messages));
                        
                        toast.success('조율 메시지가 전송되었습니다');
                        setShowAcceptanceDetail(false);
                        setSelectedAcceptedApp(null);
                        fetchApplications();
                      } catch (error) {
                        console.error('조율 메시지 전송 실패:', error);
                        // API 실패 시 localStorage만 저장
                        const coordinationKey = `coordination_messages_${selectedAcceptedApp.id}`;
                        const existingMessages = localStorage.getItem(coordinationKey);
                        const messages = existingMessages ? JSON.parse(existingMessages) : [];
                        messages.push({
                          message: message.trim(),
                          sentAt: new Date().toISOString(),
                          from: 'jobseeker',
                        });
                        localStorage.setItem(coordinationKey, JSON.stringify(messages));
                        toast.success('조율 메시지가 저장되었습니다 (로컬 저장)');
                        setShowAcceptanceDetail(false);
                        setSelectedAcceptedApp(null);
                        fetchApplications();
                      }
                    }
                  }}
                  className="w-full py-3 bg-mint-50 text-mint-700 border border-mint-300 rounded-[12px] font-medium text-[14px] hover:bg-mint-100 transition-colors"
                >
                  조율
                </button>
                <button
                  onClick={async () => {
                    // 출근 확정: API로 채용 확정 처리
                    try {
                      await applicationsAPI.confirmWorkDate(selectedAcceptedApp.id, true);
                      
                      // localStorage에도 저장 (fallback)
                      localStorage.setItem(`first_work_date_confirmed_${selectedAcceptedApp.id}`, 'true');
                      
                      const acceptanceKey = `acceptance_guide_${selectedAcceptedApp.id}`;
                      const acceptanceData = localStorage.getItem(acceptanceKey);
                      if (acceptanceData) {
                        const acceptance = JSON.parse(acceptanceData);
                        acceptance.isHired = true;
                        acceptance.hiredAt = new Date().toISOString();
                        localStorage.setItem(acceptanceKey, JSON.stringify(acceptance));
                      }
                      
                      // 체크 팝업 표시 후 합격 섹션으로 이동
                      setShowWorkConfirmSuccess(true);
                      setShowAcceptanceDetail(false);
                      setSelectedAcceptedApp(null);
                      
                      // 애플리케이션 목록 새로고침
                      await fetchApplications();
                      
                      // 2초 후 팝업 닫고 합격 섹션으로 이동
                      setTimeout(() => {
                        setShowWorkConfirmSuccess(false);
                        setActiveFilter('accepted');
                        // 합격 섹션으로 스크롤
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }, 2000);
                    } catch (error) {
                      console.error('출근 확정 실패:', error);
                      // API 실패 시 localStorage만 저장
                      localStorage.setItem(`first_work_date_confirmed_${selectedAcceptedApp.id}`, 'true');
                      const acceptanceKey = `acceptance_guide_${selectedAcceptedApp.id}`;
                      const acceptanceData = localStorage.getItem(acceptanceKey);
                      if (acceptanceData) {
                        const acceptance = JSON.parse(acceptanceData);
                        acceptance.isHired = true;
                        acceptance.hiredAt = new Date().toISOString();
                        localStorage.setItem(acceptanceKey, JSON.stringify(acceptance));
                      }
                      // 실패 시에도 동일하게 처리
                      setShowWorkConfirmSuccess(true);
                      setShowAcceptanceDetail(false);
                      setSelectedAcceptedApp(null);
                      await fetchApplications();
                      setTimeout(() => {
                        setShowWorkConfirmSuccess(false);
                        setActiveFilter('accepted');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }, 2000);
                    }
                  }}
                  className="w-full py-3 bg-mint-500 text-white rounded-[12px] font-medium text-[14px] hover:bg-mint-600 transition-colors"
                >
                  출근 확정
                </button>
                <button
                  onClick={async () => {
                    if (confirm('정말 출근을 거부하시겠습니까?')) {
                      try {
                        // 백엔드 상태를 rejected로 업데이트
                        await applicationsAPI.update(selectedAcceptedApp.id, 'rejected');
                        
                        // localStorage에도 저장
                        const acceptanceKey = `acceptance_guide_${selectedAcceptedApp.id}`;
                        const acceptanceData = localStorage.getItem(acceptanceKey);
                        if (acceptanceData) {
                          const acceptance = JSON.parse(acceptanceData);
                          acceptance.isRejected = true;
                          acceptance.rejectedAt = new Date().toISOString();
                          localStorage.setItem(acceptanceKey, JSON.stringify(acceptance));
                        }
                        
                        toast.success('출근이 거부되었습니다');
                        setShowAcceptanceDetail(false);
                        setSelectedAcceptedApp(null);
                        fetchApplications();
                      } catch (error) {
                        console.error('출근 거부 실패:', error);
                        toast.error('출근 거부 처리에 실패했습니다');
                      }
                    }
                  }}
                  className="w-full py-3 bg-red-50 text-red-600 border border-red-200 rounded-[12px] font-medium text-[14px] hover:bg-red-100 transition-colors"
                >
                  출근 거부
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 면접제안 상세 모달 */}
      {showInterviewDetail && selectedInterviewApp && selectedInterviewApp.interviewProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] p-6 w-[90%] max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-bold text-text-900">면접 제안</h2>
              <button
                onClick={() => {
                  setShowInterviewDetail(false);
                  setSelectedInterviewApp(null);
                }}
                className="text-text-500 hover:text-text-900"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* 공고 내용 간략 표시 */}
            <div className="bg-mint-50 rounded-[12px] p-4 mb-4">
              <h3 className="text-[16px] font-bold text-text-900 mb-2">{selectedInterviewApp.jobTitle}</h3>
              <p className="text-[14px] text-text-700">{selectedInterviewApp.shopName}</p>
              <p className="text-[13px] text-text-500 mt-1">{selectedInterviewApp.location}</p>
            </div>
            
            {/* 면접 일정 요약 */}
            <div className="mb-4">
              <h3 className="text-[15px] font-semibold text-text-700 mb-3">
                {selectedInterviewApp.interviewProposal.isConfirmed 
                  ? '면접 확정' 
                  : selectedInterviewApp.interviewProposal.coordinationStatus === 'in_progress'
                  ? '조율중'
                  : '면접 제안'}
              </h3>
              {selectedInterviewApp.interviewProposal.isConfirmed && (
                <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-[8px]">
                  <p className="text-[12px] text-blue-700">
                    사장님이 조율 메시지를 바탕으로 면접 일정을 수정 확정하셨습니다.
                  </p>
                </div>
              )}
              {selectedInterviewApp.interviewProposal.coordinationStatus === 'in_progress' && !selectedInterviewApp.interviewProposal.isConfirmed && (
                <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-[8px]">
                  <p className="text-[12px] text-amber-700">
                    면접 일정 조율 중입니다. 사장님의 응답을 기다려주세요.
                  </p>
                </div>
              )}
              {!selectedInterviewApp.interviewProposal.isConfirmed && selectedInterviewApp.interviewProposal.coordinationStatus !== 'in_progress' && (
                <div className="mb-3 px-3 py-2 bg-mint-50 border border-mint-200 rounded-[8px]">
                  <p className="text-[12px] text-mint-700">
                    면접 제안을 받았습니다. 아래 일정을 확인하고 수락 또는 거절해주세요.
                  </p>
                </div>
              )}
              <div className="bg-mint-50 rounded-[12px] p-4 space-y-3">
                {/* 날짜 */}
                <div>
                  <span className="text-[13px] font-medium text-text-600 block mb-1.5">날짜</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedInterviewApp.interviewProposal.dates.map((date, idx) => {
                      const d = new Date(date);
                      return (
                        <span key={idx} className="px-2.5 py-1 bg-white border border-mint-300 text-mint-700 rounded-[6px] text-[12px] font-medium">
                          {d.getMonth() + 1}월 {d.getDate()}일
                        </span>
                      );
                    })}
                  </div>
                </div>
                
                {/* 시간 및 소요 시간 */}
                {selectedInterviewApp.interviewProposal.dateSpecificTimes ? (
                  // 날짜별로 다른 시간 슬롯
                  <div className="space-y-2">
                    {selectedInterviewApp.interviewProposal.dates.map((date) => {
                      const slots = selectedInterviewApp.interviewProposal?.dateSpecificTimes?.[date] || [];
                      const d = new Date(date);
                      return slots.length > 0 ? (
                        <div key={date} className="bg-white rounded-[8px] p-2.5 border border-mint-200">
                          <span className="text-[12px] font-medium text-text-600 block mb-1.5">
                            {d.getMonth() + 1}월 {d.getDate()}일
                          </span>
                          <div className="space-y-1.5">
                            {slots.map((slot, slotIdx) => (
                              <div key={slotIdx} className="text-[13px] text-text-700">
                                <span className="font-medium">{slot.time}</span>
                                <span className="text-text-500 ml-2">({slot.duration}분)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : selectedInterviewApp.interviewProposal.allDatesTimeSlots ? (
                  // 모든 날짜 동일한 시간 슬롯
                  <div>
                    <span className="text-[13px] font-medium text-text-600 block mb-1.5">시간</span>
                    <div className="space-y-1.5">
                      {selectedInterviewApp.interviewProposal.allDatesTimeSlots.map((slot, slotIdx) => (
                        <div key={slotIdx} className="text-[13px] text-text-700">
                          <span className="font-medium">{slot.time}</span>
                          <span className="text-text-500 ml-2">({slot.duration}분)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // 기본 형식 (하위 호환성)
                  <>
                    <div>
                      <span className="text-[13px] font-medium text-text-600 block mb-1.5">시간</span>
                      <span className="text-[14px] text-text-700 font-medium">{selectedInterviewApp.interviewProposal.time}</span>
                    </div>
                    <div>
                      <span className="text-[13px] font-medium text-text-600 block mb-1.5">소요 시간</span>
                      <span className="text-[14px] text-text-700 font-medium">{selectedInterviewApp.interviewProposal.duration}분</span>
                    </div>
                  </>
                )}
                
                {/* 면접 방식 (기본: 대면) */}
                <div>
                  <span className="text-[13px] font-medium text-text-600 block mb-1.5">면접 방식</span>
                  <span className="text-[14px] text-text-700">대면 면접</span>
                </div>
                
                {/* 메시지 */}
                {selectedInterviewApp.interviewProposal.message && (
                  <div className="pt-3 border-t border-mint-200">
                    <span className="text-[13px] font-medium text-text-600 block mb-1.5">전달 메시지</span>
                    <p className="text-[13px] text-text-700 whitespace-pre-wrap">{selectedInterviewApp.interviewProposal.message}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* 조율 메시지 입력 - 면접 확정 전에만 표시 */}
            {!selectedInterviewApp.interviewProposal.isConfirmed && (
              <div className="mb-4">
                <label className="block text-[14px] font-medium text-text-700 mb-2">조율: 메시지 보내기</label>
                <textarea
                  value={coordinationMessage}
                  onChange={(e) => setCoordinationMessage(e.target.value)}
                  placeholder="면접 일정 조율 메시지를 입력하세요"
                  className="w-full px-3 py-2 border border-line-200 rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-mint-500 resize-none"
                  rows={3}
                />
              </div>
            )}
            
            {/* 액션 버튼 */}
            <div className={`flex gap-2 ${selectedInterviewApp.interviewProposal.isConfirmed ? 'flex-col' : ''}`}>
              <button
                onClick={() => handleInterviewResponse(selectedInterviewApp, 'accepted')}
                className="flex-1 px-4 py-3 bg-mint-600 text-white rounded-[12px] font-medium text-[14px] hover:bg-mint-700 transition-colors"
              >
                수락
              </button>
              <button
                onClick={() => handleInterviewResponse(selectedInterviewApp, 'rejected')}
                className="flex-1 px-4 py-3 bg-red-100 text-red-700 rounded-[12px] font-medium text-[14px] hover:bg-red-200 transition-colors"
              >
                거절
              </button>
              {!selectedInterviewApp.interviewProposal.isConfirmed && (
                <button
                  onClick={async () => {
                    // 조율 버튼: 조율 메시지가 있으면 API로 보내기
                    if (!coordinationMessage.trim()) {
                      toast.error('조율 메시지를 입력해주세요');
                      return;
                    }
                    
                    try {
                      // API로 조율 메시지 전송 (면접 조율)
                      await applicationsAPI.addCoordinationMessage(selectedInterviewApp.id, {
                        message: coordinationMessage.trim(),
                        type: 'interview_coordination',
                      });
                      
                      // 면접 제안 업데이트 (coordinationStatus를 in_progress로 설정)
                      const interviewProposalKey = `interview_proposal_${selectedInterviewApp.id}`;
                      const currentProposal = localStorage.getItem(interviewProposalKey);
                      if (currentProposal) {
                        const proposal = JSON.parse(currentProposal);
                        if (!proposal.coordinationMessages) {
                          proposal.coordinationMessages = [];
                        }
                        proposal.coordinationMessages.push({
                          message: coordinationMessage.trim(),
                          sentAt: new Date().toISOString(),
                          from: 'jobseeker',
                        });
                        proposal.coordinationStatus = 'in_progress';
                        proposal.coordinationStartedAt = new Date().toISOString();
                        
                        // API에 isConfirmed=false, coordinationStatus를 반영하기 위해 updateInterviewProposal 호출
                        try {
                          await applicationsAPI.updateInterviewProposal(selectedInterviewApp.id, {
                            selectedDates: proposal.dates || proposal.selectedDates || [],
                            time: proposal.time || '',
                            duration: proposal.duration || 30,
                            message: proposal.message || '',
                            allDatesSame: proposal.allDatesSame !== undefined ? proposal.allDatesSame : true,
                            allDatesTimeSlots: proposal.allDatesTimeSlots,
                            dateSpecificTimes: proposal.dateSpecificTimes,
                            isConfirmed: false, // 조율 중이므로 아직 확정 아님
                          });
                        } catch (updateError) {
                          console.error('면접 제안 업데이트 실패:', updateError);
                        }
                        
                        localStorage.setItem(interviewProposalKey, JSON.stringify(proposal));
                      }
                      
                      toast.success('조율 메시지가 전송되었습니다');
                      setShowInterviewDetail(false);
                      setSelectedInterviewApp(null);
                      setCoordinationMessage('');
                      fetchApplications();
                    } catch (error) {
                      console.error('조율 메시지 전송 실패:', error);
                      toast.error('조율 메시지 전송에 실패했습니다');
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-blue-100 text-blue-700 rounded-[12px] font-medium text-[14px] hover:bg-blue-200 transition-colors"
                >
                  조율
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 합격 섹션 - 합격 공고 목록 + 채용 확정된 경우 캘린더 UI */}
      {activeFilter === 'accepted' && (() => {
        // 채용 확정 여부를 확인하는 헬퍼 함수
        const isHired = (app: Application): boolean => {
          // 1. API의 firstWorkDateConfirmed 확인 (최우선)
          if (app.firstWorkDateConfirmed) {
            return true;
          }
          
          // 2. localStorage의 first_work_date_confirmed 키 확인
          const confirmationKey = `first_work_date_confirmed_${app.id}`;
          const isConfirmed = localStorage.getItem(confirmationKey) === 'true';
          if (isConfirmed) {
            return true;
          }
          
          // 3. acceptanceData에서 isHired/hiredAt 확인 (localStorage)
          const acceptanceKey = `acceptance_guide_${app.id}`;
          const acceptanceDataStr = localStorage.getItem(acceptanceKey);
          if (acceptanceDataStr) {
            try {
              const data = JSON.parse(acceptanceDataStr);
              if (data.isHired === true || data.hiredAt) {
                return true;
              }
            } catch {}
          }
          
          // 4. API의 acceptanceData 확인
          if (app.acceptanceData) {
            const apiAcceptanceData = typeof app.acceptanceData === 'string' 
              ? (() => { try { return JSON.parse(app.acceptanceData); } catch { return null; } })()
              : app.acceptanceData;
            if (apiAcceptanceData && (apiAcceptanceData.isHired === true || apiAcceptanceData.hiredAt)) {
              return true;
            }
          }
          
          return false;
        };
        
        // 채용 확정되지 않은 합격 공고 (출근 확정을 누르지 않은 것만)
        const pendingAcceptedApps = filteredApplications.filter(app => {
          return !isHired(app);
        });
        
        // 채용 확정된 지원서 (첫 출근 날짜가 확정되고 출근 확정된 경우)
        const hiredApplications = filteredApplications.filter(app => {
          return isHired(app);
        });
        
        // 채용 확정된 지원서가 있으면 캘린더만 표시 (pendingAcceptedApps는 표시하지 않음)
        if (hiredApplications.length > 0) {
          // 첫 출근 날짜별로 그룹화 (API 데이터 우선)
          const groupedByDate: Record<string, Application[]> = {};
          hiredApplications.forEach(app => {
            let firstWorkDate: string | null = null;
            
            // API 데이터 우선: firstWorkDateConfirmed가 최우선
            if (app.firstWorkDateConfirmed) {
              firstWorkDate = app.firstWorkDateConfirmed;
            } else if (app.acceptanceData?.firstWorkDate) {
              firstWorkDate = app.acceptanceData.firstWorkDate;
            } else {
              // localStorage fallback
              const acceptanceKey = `acceptance_guide_${app.id}`;
              const acceptanceData = localStorage.getItem(acceptanceKey);
              if (acceptanceData) {
                try {
                  const acceptance = JSON.parse(acceptanceData);
                  firstWorkDate = acceptance.firstWorkDate || null;
                } catch {}
              }
            }
            
            if (firstWorkDate) {
              if (!groupedByDate[firstWorkDate]) {
                groupedByDate[firstWorkDate] = [];
              }
              groupedByDate[firstWorkDate].push(app);
            }
          });
          
          // 날짜 순서대로 정렬
          const sortedDates = Object.keys(groupedByDate).sort((a, b) => 
            new Date(a).getTime() - new Date(b).getTime()
          );
          
          // 현재 월의 날짜들 추출
          const today = new Date();
          const currentMonth = today.getMonth();
          const currentYear = today.getFullYear();
          const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
          const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
          
          return (
            <div className="p-4">
              {/* 캘린더 */}
              <div className="bg-white rounded-[16px] p-4 border border-line-200 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[16px] font-bold text-text-900">
                    {currentYear}년 {currentMonth + 1}월
                  </h3>
                  <span className="text-[12px] text-mint-600 font-medium bg-mint-50 px-2 py-1 rounded-[6px]">
                    첫 출근 날짜
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                    <div key={day} className="text-center text-[11px] font-medium text-text-500 py-1">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {/* 빈 칸 */}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  {/* 날짜 */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(currentYear, currentMonth, day);
                    const dateStr = date.toISOString().split('T')[0];
                    const hasHired = groupedByDate[dateStr] && groupedByDate[dateStr].length > 0;
                    const isToday = dateStr === today.toISOString().split('T')[0];
                    
                    return (
                      <div
                        key={day}
                        className={`aspect-square rounded-[6px] flex items-center justify-center text-[12px] font-medium transition-colors ${
                          hasHired
                            ? 'bg-mint-600 text-white'
                            : isToday
                            ? 'bg-mint-100 text-mint-700 border border-mint-300'
                            : 'bg-white text-text-700 border border-line-200'
                        }`}
                      >
                        {day}
                        {hasHired && (
                          <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* 날짜별 공고 목록 */}
              <div className="space-y-4 mb-6">
                {sortedDates.map(dateStr => {
                  const date = new Date(dateStr);
                  const appsForDate = groupedByDate[dateStr];
                  return (
                    <div key={dateStr} className="space-y-3">
                      <h4 className="text-[15px] font-semibold text-text-900">
                        {date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} ({appsForDate.length}개)
                      </h4>
                      {appsForDate.map(app => (
                        <div
                          key={app.id}
                          onClick={() => {
                            setSelectedAcceptedApp(app);
                            setShowAcceptanceDetail(true);
                          }}
                          className="bg-white rounded-[16px] p-4 border border-line-200 hover:border-mint-300 hover:shadow-soft transition-all cursor-pointer relative"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h3 className="text-[16px] font-semibold text-text-900 mb-1">
                                {app.jobTitle}
                              </h3>
                              <p className="text-[14px] text-text-700 mb-2">{app.shopName}</p>
                              <div className="flex items-center gap-2 text-[13px]">
                                <svg className="w-4 h-4 text-text-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-semibold text-mint-600">시급 {formatCurrency(app.wage)}원</span>
                              </div>
                            </div>
                            <span className="px-2 py-1 bg-mint-100 text-mint-700 rounded-[6px] text-[11px] font-medium whitespace-nowrap">
                              확정됨
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }
        
        // 채용 확정되지 않은 합격 공고 목록 표시 (채용 확정된 공고가 없을 때만)
        if (pendingAcceptedApps.length > 0 && hiredApplications.length === 0) {
          return (
            <div className="p-4">
              
              <div className="space-y-3">
                {pendingAcceptedApps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => {
                      setSelectedAcceptedApp(app);
                      setShowAcceptanceDetail(true);
                    }}
                    className="bg-white rounded-[16px] p-4 shadow-card border border-line-200 hover:shadow-soft transition-all cursor-pointer"
                  >
                    {/* 상태 배지 */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-[6px] text-[10px] font-medium">
                          합격
                        </span>
                        {(() => {
                          // 조율 상태 확인
                          const hasCoordinationMessages = app.coordinationMessages && app.coordinationMessages.length > 0;
                          const hasJobseekerMessages = app.coordinationMessages?.some((msg: any) => msg.from === 'jobseeker') || false;
                          const isConfirmed = !!app.firstWorkDateConfirmed;
                          
                          // 조율중: 구직자가 조율 메시지를 보냈고 아직 확정되지 않은 경우
                          if (hasJobseekerMessages && !isConfirmed) {
                            return (
                              <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-[6px] text-[10px] font-medium">
                                조율중
                              </span>
                            );
                          }
                          // 확정: 출근 확정된 경우
                          if (isConfirmed) {
                            return (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-[6px] text-[10px] font-medium">
                                확정됨
                              </span>
                            );
                          }
                          // 기본: 확정 대기 (조율 없이 바로 확정 가능한 상태)
                          return null;
                        })()}
                      </div>
                    </div>
                    
                    {/* 공고 정보 */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="text-[16px] font-bold text-text-900 mb-1">{app.jobTitle}</h3>
                        <p className="text-[14px] text-text-700 mb-2">{app.shopName}</p>
                        <p className="text-[13px] text-text-500 mb-3">{app.location}</p>
                      </div>
                      {app.firstWorkDateConfirmed && (
                        <span className="px-2 py-1 bg-mint-100 text-mint-700 rounded-[6px] text-[11px] font-medium whitespace-nowrap">
                          확정됨
                        </span>
                      )}
                    </div>
                    
                    {/* 합격 안내 미리보기 */}
                    {app.acceptanceData && (
                      <div className="mt-3 p-3 bg-mint-50 rounded-[10px] border border-mint-200">
                        <p className="text-[13px] font-semibold text-mint-700 mb-1">합격 안내가 도착했습니다</p>
                        {app.acceptanceData.firstWorkDate && (
                          <p className="text-[12px] text-text-600">
                            첫 출근: {new Date(app.acceptanceData.firstWorkDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                          </p>
                        )}
                        <p className="text-[11px] text-text-500 mt-1">카드를 눌러 상세 내용을 확인하세요</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        
        return null;
      })()}

      {/* 출근 확정 성공 팝업 */}
      {showWorkConfirmSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[20px] p-8 max-w-sm w-full text-center">
            <div className="w-20 h-20 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-mint-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-[24px] font-bold text-text-900 mb-3">채용이 확정되었습니다</h3>
            <p className="text-[14px] text-text-600">첫 출근 날짜와 유의사항을 잘 확인하여 주세요</p>
          </div>
        </div>
      )}

      {/* Applications List - 합격 섹션이 아닐 때만 표시 */}
      {activeFilter !== 'accepted' && (
        <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-text-500">불러오는 중...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-text-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-text-500 text-[15px]">지원 내역이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                onClick={() => {
                  // 면접제안 섹션이거나 면접 제안이 있는 경우 상세 모달 표시
                  if ((activeFilter === 'interview' || app.status === 'interview' || app.interviewProposal) && app.interviewProposal) {
                    setSelectedInterviewApp(app);
                    setShowInterviewDetail(true);
                    setCoordinationMessage('');
                    // 읽음 처리
                    if (!app.interviewProposal.isRead) {
                      const interviewProposalKey = `interview_proposal_${app.id}`;
                      const currentProposal = localStorage.getItem(interviewProposalKey);
                      if (currentProposal) {
                        const proposal = JSON.parse(currentProposal);
                        proposal.isRead = true;
                        localStorage.setItem(interviewProposalKey, JSON.stringify(proposal));
                      }
                      setApplications(prev => prev.map(a => 
                        a.id === app.id && a.interviewProposal
                          ? { ...a, interviewProposal: { ...a.interviewProposal, isRead: true } }
                          : a
                      ));
                    }
                  } else if (app.status === 'accepted') {
                    // 합격 섹션: 채용 확정된 것은 제외 (캘린더에서 클릭 가능)
                    const isHired = app.firstWorkDateConfirmed || 
                                   localStorage.getItem(`first_work_date_confirmed_${app.id}`) === 'true';
                    if (!isHired) {
                      // 채용 확정되지 않은 합격 공고만 팝업 표시
                      setSelectedAcceptedApp(app);
                      setShowAcceptanceDetail(true);
                    }
                  } else {
                    navigate(`/jobs/${app.jobId}`);
                  }
                }}
                className="bg-white rounded-[16px] p-4 shadow-card border border-line-200
                         hover:shadow-soft transition-all cursor-pointer relative"
              >
                {/* 상태 배지 및 알림 - 카드 상단에 별도 배치 */}
                <div className="flex items-center justify-between mb-2">
                  {/* 면접제안 섹션에서만 면접 관련 배지 표시 (합격 상태가 아닐 때만) */}
                  {app.interviewProposal && app.status !== 'accepted' && (
                    <div>
                      {app.interviewProposal.coordinationStatus === 'in_progress' && !app.interviewProposal.isConfirmed && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-[6px] text-[10px] font-medium">
                          조율중
                        </span>
                      )}
                      {app.interviewProposal.isConfirmed && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-[6px] text-[10px] font-medium">
                          면접 확정
                        </span>
                      )}
                    </div>
                  )}
                  {(!app.interviewProposal || app.status === 'accepted') && <div></div>}
                  {/* 읽지 않은 면접제안 빨간 동그라미 */}
                  {app.interviewProposal && !app.interviewProposal.isRead && (
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  )}
                  {!app.interviewProposal && <div></div>}
                </div>
                
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-[16px] font-semibold text-text-900 mb-1">
                      {app.jobTitle}
                    </h3>
                    <p className="text-[14px] text-text-700 mb-2">{app.shopName}</p>
                  </div>
                  {getStatusBadge(app.status)}
                </div>

                {/* Details */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-2 text-[13px]">
                    <svg className="w-4 h-4 text-text-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-mint-600">시급 {formatCurrency(app.wage)}원</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px]">
                    <svg className="w-4 h-4 text-text-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-text-700">{app.location}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-line-200">
                  <span className="text-[12px] text-text-500">
                    지원일: {formatDate(app.appliedDate)}
                  </span>
                  {app.status === 'accepted' && (() => {
                    // 합격 안내 데이터 확인 (API 우선)
                    const acceptance = app.acceptanceData || null;
                    
                    if (!acceptance) {
                      // localStorage fallback
                      const acceptanceKey = `acceptance_guide_${app.id}`;
                      const acceptanceDataStr = localStorage.getItem(acceptanceKey);
                      const localAcceptance = acceptanceDataStr ? JSON.parse(acceptanceDataStr) : null;
                      
                      if (!localAcceptance) {
                        return (
                          <div className="mt-3 p-3 bg-mint-50 rounded-[10px] border border-mint-200">
                            <p className="text-[13px] text-mint-700">합격 안내를 기다리고 있습니다.</p>
                          </div>
                        );
                      }
                      
                      // localStorage 데이터 표시
                      return (
                        <div className="mt-3 p-3 bg-mint-50 rounded-[10px] border border-mint-200">
                          <p className="text-[13px] font-semibold text-mint-700 mb-1">합격 안내가 도착했습니다</p>
                          {localAcceptance.firstWorkDate && (
                            <p className="text-[12px] text-text-600">
                              첫 출근: {new Date(localAcceptance.firstWorkDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                            </p>
                          )}
                          <p className="text-[11px] text-text-500 mt-1">카드를 눌러 상세 내용을 확인하세요</p>
                        </div>
                      );
                    }
                    
                    // API 데이터 표시
                    return (
                      <div className="mt-3 p-3 bg-mint-50 rounded-[10px] border border-mint-200">
                        <p className="text-[13px] font-semibold text-mint-700 mb-1">합격 안내가 도착했습니다</p>
                        {acceptance.firstWorkDate && (
                          <p className="text-[12px] text-text-600">
                            첫 출근: {new Date(acceptance.firstWorkDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                          </p>
                        )}
                        <p className="text-[11px] text-text-500 mt-1">카드를 눌러 상세 내용을 확인하세요</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      )}
    </div>
  );
};

