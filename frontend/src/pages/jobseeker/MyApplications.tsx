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
    coordinationMessages?: Array<{ message: string; sentAt: string }>;
  };
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
            
            // 면접제안 데이터 로드 (로컬스토리지 또는 API에서)
            // status가 'reviewed'이거나 'applied'이면 면접제안이 있는 것으로 간주
            const interviewProposalData = localStorage.getItem(`interview_proposal_${app.applicationId}`);
            const interviewProposal = interviewProposalData ? JSON.parse(interviewProposalData) : null;
            const hasInterviewProposal = (app.status === 'reviewed' || app.status === 'applied') && interviewProposal;
            
            // 면접 제안이 있으면 상태를 'interview'로 변경 (대기중에서 면접제안 섹션으로 이동)
            const finalStatus = hasInterviewProposal ? 'interview' : mapStatus(app.status);
            
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
                dates: interviewProposal.dates || [],
                time: interviewProposal.time || '',
                duration: interviewProposal.duration || 30,
                message: interviewProposal.message || '',
                status: interviewProposal.status || 'pending',
                isRead: interviewProposal.isRead || false,
                allDatesTimeSlots: interviewProposal.allDatesTimeSlots,
                dateSpecificTimes: interviewProposal.dateSpecificTimes,
                coordinationMessages: interviewProposal.coordinationMessages || [],
              } : undefined,
            } as Application;
          } catch (error) {
            console.error(`Failed to fetch job ${app.jobId}:`, error);
            // Return a fallback application entry
            const appliedDate = app.appliedAt ? app.appliedAt.split('T')[0] : new Date().toISOString().split('T')[0];
            const fallbackStatus = mapStatus(app.status);
            
            // 면접 제안 데이터 확인 (fallback이어도 확인)
            const interviewProposalData = localStorage.getItem(`interview_proposal_${app.applicationId}`);
            const interviewProposal = interviewProposalData ? JSON.parse(interviewProposalData) : null;
            const hasInterviewProposal = interviewProposal && (app.status === 'reviewed' || app.status === 'applied');
            const finalStatus = hasInterviewProposal ? 'interview' : fallbackStatus;
            
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
                dates: interviewProposal.dates || [],
                time: interviewProposal.time || '',
                duration: interviewProposal.duration || 30,
                message: interviewProposal.message || '',
                status: interviewProposal.status || 'pending',
                isRead: interviewProposal.isRead || false,
                allDatesTimeSlots: interviewProposal.allDatesTimeSlots,
                dateSpecificTimes: interviewProposal.dateSpecificTimes,
                coordinationMessages: interviewProposal.coordinationMessages || [],
              } : undefined,
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
      // 면접제안 필터: status가 'interview'인 경우만 (면접 제안 받은 지원서)
      return applications.filter(app => app.status === 'interview');
    } else if (activeFilter === 'pending') {
      // 대기중 필터: status가 'pending'이고 면접 제안이 없는 경우만
      return applications.filter(app => app.status === 'pending' && !app.interviewProposal);
    } else {
      return applications.filter(app => app.status === activeFilter);
    }
  })();
  
  // 면접 제안이 있고 읽지 않은 지원서 개수
  const unreadInterviewCount = applications.filter(
    app => app.status === 'interview' && 
           app.interviewProposal && !app.interviewProposal.isRead
  ).length;

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending' && !a.interviewProposal).length,
    reviewed: applications.filter(a => a.status === 'reviewed').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    interview: applications.filter(a => a.status === 'interview').length,
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
              <h3 className="text-[15px] font-semibold text-text-700 mb-3">면접 일정이 확정되었어요</h3>
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
            
            {/* 조율 메시지 입력 */}
            <div className="mb-4">
              <label className="block text-[14px] font-medium text-text-700 mb-2">조율: 메시지 보내기</label>
              <textarea
                value={coordinationMessage}
                onChange={(e) => setCoordinationMessage(e.target.value)}
                placeholder="면접 일정 조율 메시지를 입력하세요"
                className="w-full px-3 py-2 border border-line-200 rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-mint-500 resize-none"
                rows={3}
              />
              <button
                onClick={() => handleSendCoordinationMessage(selectedInterviewApp)}
                className="mt-2 w-full px-4 py-2 bg-mint-600 text-white rounded-[8px] text-[14px] font-medium hover:bg-mint-700 transition-colors"
              >
                메시지 보내기
              </button>
            </div>
            
            {/* 액션 버튼 */}
            <div className="flex gap-2">
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
              <button
                onClick={() => handleInterviewResponse(selectedInterviewApp, 'hold')}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-[12px] font-medium text-[14px] hover:bg-gray-200 transition-colors"
              >
                보류
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Applications List */}
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
                  if ((activeFilter === 'interview' || app.status === 'interview') && app.interviewProposal) {
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
                  } else {
                    navigate(`/jobs/${app.jobId}`);
                  }
                }}
                className="bg-white rounded-[16px] p-4 shadow-card border border-line-200
                         hover:shadow-soft transition-all cursor-pointer relative"
              >
                {/* 읽지 않은 면접제안 빨간 동그라미 */}
                {app.interviewProposal && !app.interviewProposal.isRead && (
                  <span className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
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
                  {app.status === 'accepted' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/messages/chat/${app.jobId}`);
                      }}
                      className="px-3 py-1.5 bg-mint-600 text-white rounded-[16px] text-[12px] 
                               font-semibold hover:bg-mint-700 transition-colors"
                    >
                      사장님께 연락하기
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

