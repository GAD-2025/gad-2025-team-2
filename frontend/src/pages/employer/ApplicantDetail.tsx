// @ts-nocheck
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Header } from '@/components/Header';
import { Tag } from '@/components/Tag';
import { BottomCTA, CTAButton } from '@/components/BottomCTA';
import { getJobSeekerProfile, type JobSeekerProfileData, applicationsAPI } from '@/api/endpoints';
import { InterviewProposalModal, type InterviewProposalData } from '@/components/InterviewProposalModal';
import { AcceptanceGuideModal, type AcceptanceGuideData } from '@/components/AcceptanceGuideModal';
import { useAuthStore } from '@/store/useAuth';
import { API_BASE_URL } from '@/api/client';

export const ApplicantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState<JobSeekerProfileData | null>(null);
  const [hiring, setHiring] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showAcceptanceGuideModal, setShowAcceptanceGuideModal] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<'pending' | 'reviewed' | 'accepted' | 'rejected' | 'hold' | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [coordinationMessages, setCoordinationMessages] = useState<Array<{ message: string; sentAt: string; from?: string }>>([]);
  const [interviewData, setInterviewData] = useState<any>(null); // API에서 가져온 면접 제안 데이터
  const [showInterviewEditModal, setShowInterviewEditModal] = useState(false);
  const [originalInterviewProposal, setOriginalInterviewProposal] = useState<InterviewProposalData | null>(null);

  useEffect(() => {
    const fetchApplicant = async () => {
      if (!id) {
        toast.error('지원자 ID가 없습니다');
        navigate('/employer/home');
        return;
      }
      
      try {
        setLoading(true);
        console.log('[LOGIN] 지원자 정보 로딩 시도:', id);
        const data = await getJobSeekerProfile(id);
        console.log('[SUCCESS] 지원자 정보 로딩 성공:', data);
        setApplicant(data);
        
        // 저장된 지원자 목록 확인
        const savedApplicants = JSON.parse(localStorage.getItem('saved_applicants') || '[]');
        setIsSaved(savedApplicants.includes(id));
        
        // 지원서 상태 확인 (진행중 여부 확인)
        const signupUserId = useAuthStore.getState().signupUserId;
        const userId = signupUserId || localStorage.getItem('signup_user_id');
        if (userId) {
          const applicationsRes = await fetch(`${API_BASE_URL}/applications?userId=${userId}`);
          if (applicationsRes.ok) {
            const applications = await applicationsRes.json();
            const application = applications.find((app: any) => 
              app.seekerId === id || app.seeker?.id === id || app.jobseeker?.user_id === id
            );
            if (application) {
              setApplicationId(application.applicationId);
              // 백엔드 상태 확인
              const backendStatus = application.status;
              
              // API에서 면접 제안 데이터 확인 (우선), localStorage는 fallback
              const apiInterviewData = application.interviewData;
              const hasInterviewProposal = !!apiInterviewData || !!localStorage.getItem(`interview_proposal_${application.applicationId}`);
              
              // 면접 제안 데이터 저장 (API 우선)
              if (apiInterviewData) {
                setInterviewData(apiInterviewData);
              } else {
                // localStorage fallback
                const interviewProposalKey = `interview_proposal_${application.applicationId}`;
                const proposalData = localStorage.getItem(interviewProposalKey);
                if (proposalData) {
                  const proposal = JSON.parse(proposalData);
                  setInterviewData(proposal);
                }
              }
              
              if (backendStatus === 'reviewed' || hasInterviewProposal) {
                setApplicationStatus('reviewed');
              } else if (backendStatus === 'applied') {
                setApplicationStatus('pending');
              } else if (backendStatus === 'accepted' || backendStatus === 'hired') {
                setApplicationStatus('accepted');
              } else if (backendStatus === 'rejected') {
                setApplicationStatus('rejected');
              } else if (backendStatus === 'hold') {
                setApplicationStatus('hold');
              }
              
              // 조율 메시지 로드 (API 우선, localStorage fallback)
              if (application.coordinationMessages && application.coordinationMessages.length > 0) {
                setCoordinationMessages(application.coordinationMessages);
              } else {
                // localStorage fallback
                const interviewProposalKey = `interview_proposal_${application.applicationId}`;
                const proposalData = localStorage.getItem(interviewProposalKey);
                if (proposalData) {
                  const proposal = JSON.parse(proposalData);
                  if (proposal.coordinationMessages && proposal.coordinationMessages.length > 0) {
                    setCoordinationMessages(proposal.coordinationMessages);
                  }
                }
              }
            }
          }
        }
      } catch (error: any) {
        console.error('[ERROR] 지원자 정보 로딩 실패:', error);
        const errorMessage = error?.message || '지원자 정보를 불러오는데 실패했습니다';
        if (errorMessage.includes('Profile not found') || errorMessage.includes('404')) {
          toast.error('지원자 정보를 찾을 수 없습니다');
        } else {
          toast.error('지원자 정보를 불러오는데 실패했습니다');
        }
        // 에러 발생 시 홈으로 돌아가기 전에 약간의 지연
        setTimeout(() => {
          navigate('/employer/home');
        }, 1500);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicant();
  }, [id, navigate]);

  const handleHire = async () => {
    if (!id) return;
    setShowInterviewModal(true);
  };

  const handleInterviewSubmit = async (data: InterviewProposalData, isEdit: boolean = false) => {
    if (!id) return;
    
    try {
      setHiring(true);
      console.log('면접 제안 데이터:', data, 'isEdit:', isEdit);
      
      // 지원서 ID를 찾기 위해 applications API 호출
      const signupUserId = useAuthStore.getState().signupUserId;
      const userId = signupUserId || localStorage.getItem('signup_user_id');
      
      if (!userId) {
        toast.error('로그인이 필요합니다.');
        return;
      }
      
      // 현재 고용주의 모든 지원서 목록에서 해당 구직자의 지원서 찾기
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const applicationsRes = await fetch(`${API_BASE_URL}/applications?userId=${userId}`);
      
      if (!applicationsRes.ok) {
        toast.error('지원서 정보를 불러올 수 없습니다. 다시 시도해주세요.');
        return;
      }
      
      const applications = await applicationsRes.json();
      const application = applications.find((app: any) => 
        app.seekerId === id || app.seeker?.id === id || app.jobseeker?.user_id === id
      );
      
      if (!application || !application.applicationId) {
        toast.error('지원서를 찾을 수 없습니다. 다시 시도해주세요.');
        return;
      }
      
      // 수정인 경우 기존 coordinationMessages 유지
      let existingCoordinationMessages: any[] = [];
      if (isEdit && application.coordinationMessages) {
        existingCoordinationMessages = application.coordinationMessages;
      } else if (isEdit) {
        // localStorage에서도 확인 (fallback)
        const existingProposalKey = `interview_proposal_${application.applicationId}`;
        const existingProposalData = localStorage.getItem(existingProposalKey);
        if (existingProposalData) {
          const existingProposal = JSON.parse(existingProposalData);
          existingCoordinationMessages = existingProposal.coordinationMessages || [];
        }
      }
      
      // API로 면접 제안 데이터 업데이트
      try {
        // 지원 상태를 'reviewed' (진행중)로 업데이트
        await applicationsAPI.update(application.applicationId, 'reviewed');
        
        // 면접 제안 데이터 업데이트
        const interviewProposalPayload = {
          selectedDates: data.selectedDates,
          time: data.time || undefined,
          duration: data.duration || undefined,
          message: data.message || undefined,
          allDatesSame: data.allDatesSame,
          allDatesTimeSlots: data.allDatesTimeSlots,
          dateSpecificTimes: data.dateSpecificTimes,
          isConfirmed: isEdit, // 수정인 경우 확정
        };
        
        await applicationsAPI.updateInterviewProposal(application.applicationId, interviewProposalPayload);
        
        console.log('[SUCCESS] 면접 제안 API 업데이트 성공:', {
          applicationId: application.applicationId,
          jobId: application.jobId,
          seekerId: id,
          isEdit
        });
        
        // localStorage에도 저장 (fallback 및 기존 코드 호환성)
        const interviewProposal = {
          selectedDates: data.selectedDates,
          dates: data.selectedDates,
          time: data.time,
          duration: data.duration,
          message: data.message,
          allDatesSame: data.allDatesSame,
          allDatesTimeSlots: data.allDatesTimeSlots,
          dateSpecificTimes: data.dateSpecificTimes,
          status: 'pending' as const,
          isRead: false,
          coordinationMessages: existingCoordinationMessages,
          isConfirmed: isEdit,
          confirmedAt: isEdit ? new Date().toISOString() : undefined,
          coordinationStatus: isEdit ? 'confirmed' : undefined,
        };
        localStorage.setItem(`interview_proposal_${application.applicationId}`, JSON.stringify(interviewProposal));
        
        if (isEdit) {
          setShowInterviewEditModal(false);
          setOriginalInterviewProposal(null);
          toast.success('면접 내용이 수정 확정되었습니다');
          // 수정 후 페이지 새로고침하여 변경사항 반영
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } else {
          setShowInterviewModal(false);
          toast.success('면접 제안이 전송되었습니다');
          // 면접 제안 완료 화면으로 이동
          navigate('/employer/interview-proposed', {
            state: {
              interviewData: data,
              applicantName: applicant?.name,
            },
          });
        }
      } catch (apiError) {
        console.error('[ERROR] API 업데이트 실패:', apiError);
        // API 실패 시 localStorage fallback (기존 동작 유지)
        const interviewProposal = {
          selectedDates: data.selectedDates,
          dates: data.selectedDates,
          time: data.time,
          duration: data.duration,
          message: data.message,
          allDatesSame: data.allDatesSame,
          allDatesTimeSlots: data.allDatesTimeSlots,
          dateSpecificTimes: data.dateSpecificTimes,
          status: 'pending' as const,
          isRead: false,
          coordinationMessages: existingCoordinationMessages,
        };
        if (isEdit) {
          interviewProposal.isConfirmed = true;
          interviewProposal.confirmedAt = new Date().toISOString();
          interviewProposal.coordinationStatus = 'confirmed';
        }
        localStorage.setItem(`interview_proposal_${application.applicationId}`, JSON.stringify(interviewProposal));
        
        // 상태는 업데이트 시도 (실패해도 계속 진행)
        try {
          await applicationsAPI.update(application.applicationId, 'reviewed');
        } catch (e) {
          console.error('상태 업데이트 실패:', e);
        }
        
        if (isEdit) {
          setShowInterviewEditModal(false);
          setOriginalInterviewProposal(null);
          toast.success('면접 내용이 수정되었습니다 (로컬 저장)');
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } else {
          setShowInterviewModal(false);
          toast.success('면접 제안이 전송되었습니다 (로컬 저장)');
          navigate('/employer/interview-proposed', {
            state: {
              interviewData: data,
              applicantName: applicant?.name,
            },
          });
        }
      }
    } catch (error) {
      console.error('[ERROR] 면접 제안 처리 실패:', error);
      toast.error('면접 제안 전송 중 오류가 발생했습니다');
    } finally {
      setHiring(false);
    }
  };

  const handleStartChat = () => {
    navigate('/employer/coming-soon');
  };

  const handleCall = () => {
    if (!applicant?.phone) {
      toast.error('전화번호 정보가 없습니다');
      return;
    }
    // 전화 걸기
    window.location.href = `tel:${applicant.phone}`;
  };

  const handleSave = () => {
    if (!id) return;
    
    const savedApplicants = JSON.parse(localStorage.getItem('saved_applicants') || '[]');
    
    if (isSaved) {
      // 저장 해제
      const updated = savedApplicants.filter((savedId: string) => savedId !== id);
      localStorage.setItem('saved_applicants', JSON.stringify(updated));
      setIsSaved(false);
      toast.success('저장이 해제되었습니다');
    } else {
      // 저장
      if (!savedApplicants.includes(id)) {
        savedApplicants.push(id);
        localStorage.setItem('saved_applicants', JSON.stringify(savedApplicants));
        setIsSaved(true);
        toast.success('저장되었습니다');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-mint-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!applicant) return null;

  const skills = applicant.experience_skills ? [applicant.experience_skills] : [];
  const introduction = applicant.experience_introduction || '자기소개가 없습니다.';
  const birth = applicant.birthdate ? new Date(applicant.birthdate) : null;
  const age = birth ? Math.max(0, Math.floor((Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25))) : null;
  const flagEmoji = (codeOrName?: string | null) => {
    if (!codeOrName) return '🌏';
    const nameMap: Record<string, string> = {
      '우즈베키스탄': 'UZ',
      '필리핀': 'PH',
      '베트남': 'VN',
      '태국': 'TH',
      '몽골': 'MN',
      '중국': 'CN',
      '한국': 'KR',
    };
    const code = (codeOrName.length === 2 ? codeOrName : nameMap[codeOrName]) || codeOrName;
    const upper = code.toUpperCase();
    if (upper.length === 2) {
      const cp = (c: string) => c.codePointAt(0)! - 0x41 + 0x1F1E6;
      return String.fromCodePoint(cp(upper[0]), cp(upper[1]));
    }
    return '🌏';
  };

  // Parse skills/abilities from experience_skills
  // 온보딩에서 선택한 언어능력이나 스킬을 제대로 파싱
  const parsedSkills = (() => {
    if (!applicant.experience_skills) return [];
    
    // 문자열이면 JSON 파싱 시도
    try {
      const parsed = JSON.parse(applicant.experience_skills);
      
      // 배열인 경우
      if (Array.isArray(parsed)) {
        return parsed.filter(skill => skill && String(skill).trim() !== '');
      }
      
      // 객체인 경우 - 값들을 추출
      if (typeof parsed === 'object' && parsed !== null) {
        const values = Object.values(parsed)
          .flatMap((v) => {
            if (Array.isArray(v)) return v;
            if (v && String(v).trim() !== '') return [String(v)];
            return [];
          })
          .filter(Boolean);
        return values;
      }
      
      // 단순 문자열인 경우
      if (typeof parsed === 'string' && parsed.trim() !== '') {
        return [parsed];
      }
    } catch (_e) {
      // JSON 파싱 실패 시 문자열로 처리
      if (typeof applicant.experience_skills === 'string' && applicant.experience_skills.trim() !== '') {
        // 쉼표로 구분된 문자열인 경우
        if (applicant.experience_skills.includes(',')) {
          return applicant.experience_skills.split(',').map(s => s.trim()).filter(Boolean);
        }
        return [applicant.experience_skills];
      }
    }
    
    return [];
  })();

  // 경력(경험) 필드를 보기 좋게 변환
  const careerText = (() => {
    const raw = (applicant as any).experience_career;
    if (!raw) return '';
    if (typeof raw !== 'string') return String(raw);
    try {
      const obj = JSON.parse(raw);
      if (obj && typeof obj === 'object') {
        const parts: string[] = [];
        if (Array.isArray(obj.workSkills) && obj.workSkills.length) {
          parts.push(`스킬: ${obj.workSkills.join(', ')}`);
        }
        if (Array.isArray(obj.strengths) && obj.strengths.length) {
          parts.push(`강점: ${obj.strengths.join(', ')}`);
        }
        if (Array.isArray(obj.mbti) && obj.mbti.length) {
          parts.push(`MBTI: ${obj.mbti.join(', ')}`);
        }
        const plainValues = Object.values(obj).filter(
          (v) => typeof v === 'string' && v.trim().length > 0
        ) as string[];
        if (parts.length === 0 && plainValues.length > 0) {
          return plainValues.join(', ');
        }
        return parts.join(' · ');
      }
    } catch (_e) {
      // fall through
    }
    return raw;
  })();

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header showBack title="지원자 상세 정보" />

      <div className="p-4">
        {/* Profile Card - 이미지처럼 밝은 민트색 배경 */}
        <div className="bg-gradient-to-br from-mint-50 to-mint-100 border border-mint-200 rounded-[16px] p-5 mb-5 relative">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-mint-200 to-mint-300 rounded-full flex items-center justify-center text-3xl flex-shrink-0 shadow-sm">
              👤
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-[22px] font-bold text-text-900 mb-1.5">
                {applicant.name}{age ? ` ${age}세` : ''}
              </h1>
              <div className="flex items-center gap-1.5 text-[14px] text-text-700 mb-2">
                <span className="text-xl">{flagEmoji(applicant.nationality_code)}</span>
                <span className="font-medium">{applicant.nationality_code || '국적 미상'}</span>
              </div>
              <div className="space-y-1.5">
                <p className="text-[13px] text-text-700">
                  비자: <span className="font-medium">{(applicant as any).visa_type ?? (applicant as any).visaType ?? '미입력'}</span>
                </p>
                {careerText && (
                  <p className="text-[13px] text-mint-700 font-semibold">
                    경력: {careerText}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tags - 능력/스킬 태그 표시 */}
          {parsedSkills.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {parsedSkills.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-white border border-mint-300 text-mint-700 rounded-full text-[12px] font-medium shadow-sm"
                >
                  {String(skill)}
                </span>
              ))}
            </div>
          )}
          
          {/* 진행중 상태일 때 면접 제안 내용 표시 및 수정 기능 */}
          {applicationStatus === 'reviewed' && applicationId && (() => {
            // API 데이터 우선, localStorage fallback
            let proposal = interviewData;
            if (!proposal) {
              const interviewProposalKey = `interview_proposal_${applicationId}`;
              const interviewProposalData = localStorage.getItem(interviewProposalKey);
              proposal = interviewProposalData ? JSON.parse(interviewProposalData) : null;
            }
            
            const interviewResponseKey = `interview_response_${applicationId}`;
            const responseData = localStorage.getItem(interviewResponseKey);
            const response = responseData ? JSON.parse(responseData) : null;
            
            // 고용주 입장에서는 구직자가 보낸 메시지만 표시
            // coordinationMessages state 사용 (API 또는 localStorage에서 로드됨)
            const messages = coordinationMessages.filter((msg: any) => msg.from === 'jobseeker');
            
            // 구직자가 보낸 조율 메시지 중 면접 수정 요청이 있는지 확인
            const hasModificationRequest = messages.some((msg: any) => 
              msg.message && msg.message.trim().length > 0
            );
            
            return (
              <div className="mt-3 pt-3 border-t border-mint-200 space-y-3">
                {/* 면접 제안 내용 표시 */}
                {proposal && (
                  <div className="bg-white border border-mint-200 rounded-[8px] p-4">
                    <h4 className="text-[14px] font-semibold text-text-900 mb-3">면접 제안 내용</h4>
                    {proposal.allDatesSame && proposal.allDatesTimeSlots ? (
                      <div className="space-y-2">
                        <div>
                          <p className="text-[12px] text-text-600 mb-1">선택된 날짜</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(proposal.selectedDates || proposal.dates || []).map((date: string) => {
                              const d = new Date(date);
                              return (
                                <span key={date} className="px-2 py-1 bg-mint-100 text-mint-700 rounded-[6px] text-[11px] font-medium">
                                  {d.getMonth() + 1}/{d.getDate()}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <p className="text-[12px] text-text-600 mb-1">시간 슬롯</p>
                          <div className="space-y-1">
                            {proposal.allDatesTimeSlots.map((slot: any, idx: number) => (
                              <div key={idx} className="px-2 py-1 bg-gray-50 rounded-[6px] text-[11px] text-text-700">
                                {slot.time} ({slot.duration}분)
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : proposal.dateSpecificTimes && Object.keys(proposal.dateSpecificTimes).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(proposal.dateSpecificTimes).map(([date, slots]: [string, any]) => {
                          const d = new Date(date);
                          return (
                            <div key={date} className="border-b border-line-100 pb-2 last:border-b-0">
                              <p className="text-[12px] font-medium text-text-700 mb-1">
                                {d.getMonth() + 1}월 {d.getDate()}일
                              </p>
                              <div className="space-y-1">
                                {(Array.isArray(slots) ? slots : []).map((slot: any, idx: number) => (
                                  <div key={idx} className="px-2 py-1 bg-gray-50 rounded-[6px] text-[11px] text-text-700">
                                    {slot.time} ({slot.duration}분)
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (proposal.selectedDates || proposal.dates) && (proposal.selectedDates?.length > 0 || proposal.dates?.length > 0) ? (
                      // 기본 형식: 날짜만 있고 시간 슬롯이 없는 경우
                      <div className="space-y-2">
                        <div>
                          <p className="text-[12px] text-text-600 mb-1">선택된 날짜</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(proposal.selectedDates || proposal.dates || []).map((date: string) => {
                              const d = new Date(date);
                              return (
                                <span key={date} className="px-2 py-1 bg-mint-100 text-mint-700 rounded-[6px] text-[11px] font-medium">
                                  {d.getMonth() + 1}/{d.getDate()}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        {proposal.time && (
                          <div>
                            <p className="text-[12px] text-text-600 mb-1">시간</p>
                            <p className="text-[13px] text-text-700">{proposal.time}</p>
                          </div>
                        )}
                        {proposal.duration && (
                          <div>
                            <p className="text-[12px] text-text-600 mb-1">소요 시간</p>
                            <p className="text-[13px] text-text-700">{proposal.duration}분</p>
                          </div>
                        )}
                      </div>
                    ) : null}
                    {proposal.message && (
                      <div className="mt-2 pt-2 border-t border-line-100">
                        <p className="text-[12px] text-text-600 mb-1">전달 메시지</p>
                        <p className="text-[12px] text-text-700">{proposal.message}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {proposal && !response && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-[8px]">
                    <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-[13px] font-medium text-blue-700">면접 제안 대기 중</span>
                  </div>
                )}
                {response && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-[8px] border ${
                    response.response === 'accepted' 
                      ? 'bg-mint-50 border-mint-200'
                      : response.response === 'rejected'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}>
                    <span className={`text-[13px] font-medium ${
                      response.response === 'accepted' 
                        ? 'text-mint-700'
                        : response.response === 'rejected'
                        ? 'text-red-700'
                        : 'text-amber-700'
                    }`}>
                      {response.response === 'accepted' ? '✓ 면접 수락함' : response.response === 'rejected' ? '✗ 면접 거절함' : '⏸ 면접 보류함'}
                    </span>
                  </div>
                )}
                
                {/* 조율 메시지 표시 */}
                {messages.length > 0 && (
                  <div className="bg-white border border-mint-200 rounded-[8px] p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px]">💬</span>
                        <h4 className="text-[13px] font-semibold text-text-900">조율 메시지 ({messages.length}개)</h4>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-[120px] overflow-y-auto">
                      {messages.map((msg: { message: string; sentAt?: string; from?: string; type?: string; requestedDate?: string }, idx: number) => (
                        <div key={idx} className="bg-mint-50 rounded-[6px] p-2.5">
                          <p className="text-[12px] text-text-700">{msg.message}</p>
                          {/* 첫 출근 날짜 수정 요청인 경우 수정 버튼 표시 */}
                          {msg.type === 'date_modification_request' && msg.requestedDate && applicationStatus === 'accepted' && (
                            <button
                              onClick={() => {
                                // 첫 출근 수정 페이지로 이동
                                navigate(`/employer/first-work-date-edit/${id}`);
                              }}
                              className="mt-2 px-3 py-1.5 bg-mint-600 text-white rounded-[6px] text-[11px] font-medium hover:bg-mint-700 transition-colors"
                            >
                              첫 출근 수정하기
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 면접 일정 조율 버튼 - 구직자가 수정 요청 메시지를 보낸 경우에만 표시 */}
                {hasModificationRequest && proposal?.isConfirmed !== true && (
                  <button
                    onClick={() => {
                      if (proposal) {
                        // 원본 면접 제안 데이터를 InterviewProposalData 형식으로 변환
                        const originalData: InterviewProposalData = {
                          selectedDates: proposal.selectedDates || proposal.dates || [],
                          time: proposal.time || '',
                          duration: proposal.duration || 30,
                          message: proposal.message || '',
                          allDatesSame: proposal.allDatesSame !== undefined ? proposal.allDatesSame : true,
                          allDatesTimeSlots: proposal.allDatesTimeSlots,
                          dateSpecificTimes: proposal.dateSpecificTimes,
                        };
                        setOriginalInterviewProposal(originalData);
                        setShowInterviewEditModal(true);
                      }
                    }}
                    className="w-full py-2.5 bg-mint-600 text-white rounded-[8px] text-[13px] font-medium hover:bg-mint-700 transition-colors"
                  >
                    면접 일정 조율하기
                  </button>
                )}
                
                {/* 면접 확정 상태 표시 */}
                {proposal?.isConfirmed && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-[8px]">
                    <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-[13px] font-medium text-blue-700">면접 확정</span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Self Introduction */}
        <div className="mb-5">
          <h2 className="text-[17px] font-bold text-text-900 mb-3">자기소개</h2>
          <div className="bg-mint-50 rounded-[12px] p-4">
            <p className="text-[14px] text-text-700 leading-relaxed whitespace-pre-wrap">
              {introduction}
            </p>
          </div>
        </div>

        {/* 능력/스킬 섹션 */}
        <div className="mb-5">
          <h2 className="text-[17px] font-bold text-text-900 mb-3">능력/스킬</h2>
          {parsedSkills.length > 0 ? (
            <div className="bg-white border border-line-200 rounded-[12px] p-4">
              <div className="space-y-2.5">
                {parsedSkills.map((skill, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1.5 border-b border-line-100 last:border-b-0">
                    <span className="text-[14px] text-text-700 font-medium">{String(skill)}</span>
                    {/* 언어능력인 경우 레벨 표시, 스킬인 경우는 표시 안 함 */}
                    {String(skill).includes('한국어') || String(skill).includes('영어') || String(skill).includes('언어') ? (
                      <span className="px-3 py-1 bg-mint-100 border border-mint-300 text-mint-700 rounded-full text-[12px] font-medium">
                        {String(skill).includes('한국어') ? 'L1-2' : String(skill).includes('영어') ? 'IELTS 9.0' : 'L1-2'}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-line-200 rounded-[12px] p-4">
              <p className="text-[14px] text-text-500 text-center">미입력</p>
            </div>
          )}
        </div>

        {/* Work Availability */}
        <div className="mb-5">
          <h2 className="text-[17px] font-bold text-text-900 mb-3">근무 가능 시간</h2>
          <div className="bg-white border border-line-200 rounded-[12px] p-4 space-y-3">
            {(() => {
              const hasData = applicant.work_days_of_week?.length || applicant.work_start_time || applicant.work_available_dates?.length;
              
              if (!hasData) {
                return (
                  <p className="text-[14px] text-text-500 text-center py-2">미입력</p>
                );
              }
              
              return (
                <>
                  {applicant.work_days_of_week?.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="text-[13px] font-semibold text-text-600 min-w-[50px]">요일</span>
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {(() => {
                          const days = typeof applicant.work_days_of_week === 'string' 
                            ? JSON.parse(applicant.work_days_of_week || '[]')
                            : applicant.work_days_of_week;
                          const dayMap: Record<string, string> = {
                            'MON': '월', 'TUE': '화', 'WED': '수', 'THU': '목',
                            'FRI': '금', 'SAT': '토', 'SUN': '일'
                          };
                          return days.map((day: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 bg-mint-50 border border-mint-200 text-mint-700 rounded-[6px] text-[12px] font-medium"
                            >
                              {dayMap[day] || day}
                            </span>
                          ));
                        })()}
                      </div>
                    </div>
                  )}
                  
                  {applicant.work_start_time && applicant.work_end_time && (
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-text-600 min-w-[50px]">시간</span>
                      <span className="text-[14px] text-text-700 font-medium">
                        {applicant.work_start_time} ~ {applicant.work_end_time}
                      </span>
                    </div>
                  )}
                  
                  {applicant.work_available_dates?.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="text-[13px] font-semibold text-text-600 min-w-[50px]">가능 날짜</span>
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {(() => {
                          const dates = typeof applicant.work_available_dates === 'string'
                            ? JSON.parse(applicant.work_available_dates || '[]')
                            : applicant.work_available_dates;
                          return dates.slice(0, 5).map((date: string, idx: number) => {
                            const d = new Date(date);
                            return (
                              <span
                                key={idx}
                                className="px-2.5 py-1 bg-gray-50 border border-gray-200 text-text-700 rounded-[6px] text-[12px] font-medium"
                              >
                                {d.getMonth() + 1}/{d.getDate()}
                              </span>
                            );
                          }).concat(
                            dates.length > 5 ? [<span key="more" className="text-[12px] text-text-500">+{dates.length - 5}개</span>] : []
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar - 진행중 상태에 따라 다른 버튼 표시 */}
      {applicationStatus === 'reviewed' && applicationId ? (
        // 진행중: 합격/보류/불합격 버튼
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-line-200 px-3 py-3 safe-area-bottom z-50 shadow-lg">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowAcceptanceGuideModal(true);
              }}
              className="flex-1 h-11 rounded-[10px] bg-emerald-600 text-white font-medium text-[14px] flex items-center justify-center hover:bg-emerald-700 transition-colors"
            >
              합격
            </button>
            <button
              onClick={async () => {
                if (!applicationId) return;
                try {
                  await applicationsAPI.update(applicationId, 'hold');
                  toast.success('보류 처리되었습니다');
                  setApplicationStatus('hold');
                  navigate('/employer/recruitment?filter=interview_result&result=hold');
                } catch (error) {
                  console.error('보류 처리 실패:', error);
                  toast.error('보류 처리에 실패했습니다');
                }
              }}
              className="flex-1 h-11 rounded-[10px] bg-amber-500 text-white font-medium text-[14px] flex items-center justify-center hover:bg-amber-600 transition-colors"
            >
              보류
            </button>
            <button
              onClick={async () => {
                if (!applicationId) return;
                if (confirm('이 지원자와 관련된 정보는 삭제됩니다. 정말 불합격 처리하시겠습니까?')) {
                  try {
                    await applicationsAPI.update(applicationId, 'rejected');
                    toast.success('불합격 처리되었습니다');
                    setApplicationStatus('rejected');
                    navigate('/employer/recruitment?filter=interview_result&result=rejected');
                  } catch (error) {
                    console.error('불합격 처리 실패:', error);
                    toast.error('불합격 처리에 실패했습니다');
                  }
                }
              }}
              className="flex-1 h-11 rounded-[10px] bg-red-500 text-white font-medium text-[14px] flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              불합격
            </button>
          </div>
        </div>
      ) : applicationStatus === 'accepted' && applicationId ? (
        // 합격 상태: 면접 진행 단계 표시
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-line-200 px-4 py-4 safe-area-bottom z-50 shadow-lg">
          {(() => {
            // 면접 제안 데이터 확인 (API 우선)
            let proposal = interviewData;
            if (!proposal) {
              const interviewProposalKey = `interview_proposal_${applicationId}`;
              const interviewProposalData = localStorage.getItem(interviewProposalKey);
              proposal = interviewProposalData ? JSON.parse(interviewProposalData) : null;
            }
            
            // 면접 응답 확인
            const interviewResponseKey = `interview_response_${applicationId}`;
            const responseData = localStorage.getItem(interviewResponseKey);
            const response = responseData ? JSON.parse(responseData) : null;
            
            if (response?.status === 'rejected') {
              return (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-[10px]">
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-[14px] font-medium text-red-700">면접 거부됨</span>
                  </div>
                </div>
              );
            }
            
            if (proposal?.isConfirmed) {
              return (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-[10px]">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-[14px] font-medium text-blue-700">면접 확정됨</span>
                  </div>
                </div>
              );
            }
            
            return (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-[10px]">
                  <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[14px] font-medium text-amber-700">면접 확정 기다리는 중</span>
                </div>
              </div>
            );
          })()}
        </div>
      ) : applicationStatus === 'pending' || !applicationStatus ? (
        // 신규/기타: 저장/채팅/면접제안하기 버튼
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-line-200 px-3 py-3 safe-area-bottom z-50 shadow-lg">
          <div className="flex items-center gap-2">
            {/* 저장 아이콘 - 모바일 크기에 맞게 */}
            <button
              onClick={handleSave}
              className={`w-11 h-11 rounded-[10px] flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                isSaved
                  ? 'bg-mint-600 border-mint-600'
                  : 'bg-white border-mint-600'
              }`}
            >
              <svg
                className={`w-5 h-5 ${isSaved ? 'text-white' : 'text-mint-600'}`}
                fill={isSaved ? 'currentColor' : 'none'}
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

            {/* 채팅 버튼 - 모바일 크기에 맞게 */}
            <button
              onClick={handleStartChat}
              className="flex-1 h-11 rounded-[10px] border-2 border-mint-600 bg-white text-mint-600 font-medium text-[13px] flex items-center justify-center gap-1.5 hover:bg-mint-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              채팅
            </button>

            {/* 면접 제안하기 버튼 - 모바일 크기에 맞게 */}
            <button
              onClick={handleHire}
              disabled={hiring}
              className="flex-1 h-11 rounded-[10px] bg-mint-600 text-white font-medium text-[13px] flex items-center justify-center hover:bg-mint-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {hiring ? '처리 중...' : '면접 제안하기'}
            </button>
          </div>
        </div>
      ) : null}

      {/* 면접 제안 모달 */}
      <InterviewProposalModal
        isOpen={showInterviewModal || showInterviewEditModal}
        onClose={() => {
          setShowInterviewModal(false);
          setShowInterviewEditModal(false);
          setOriginalInterviewProposal(null);
        }}
        onSubmit={(data) => {
          handleInterviewSubmit(data, showInterviewEditModal);
          if (showInterviewEditModal) {
            setShowInterviewEditModal(false);
            setOriginalInterviewProposal(null);
          }
        }}
        applicantName={applicant?.name}
        initialData={showInterviewEditModal ? originalInterviewProposal : undefined}
        coordinationMessages={showInterviewEditModal && applicationId ? (() => {
          const interviewProposalKey = `interview_proposal_${applicationId}`;
          const interviewProposalData = localStorage.getItem(interviewProposalKey);
          const proposal = interviewProposalData ? JSON.parse(interviewProposalData) : null;
          const allMessages = proposal?.coordinationMessages || [];
          return allMessages.filter((msg: any) => msg.from === 'jobseeker');
        })() : []}
      />

      {/* 합격 안내 모달 */}
      <AcceptanceGuideModal
        isOpen={showAcceptanceGuideModal}
        onClose={() => setShowAcceptanceGuideModal(false)}
        onConfirm={async (data: AcceptanceGuideData) => {
          if (!applicationId) return;
          try {
            // API로 합격 안내 데이터 저장
            await applicationsAPI.updateAcceptanceGuide(applicationId, {
              documents: data.documents,
              workAttire: data.workAttire || [],
              workNotes: data.workNotes || [],
              firstWorkDate: data.firstWorkDate,
              firstWorkTime: data.firstWorkTime,
              coordinationMessage: data.coordinationMessage,
            });
            
            // 상태를 'accepted'로 업데이트
            await applicationsAPI.update(applicationId, 'accepted');
            
            // localStorage에도 저장 (fallback 및 기존 코드 호환성)
            localStorage.setItem(`acceptance_guide_${applicationId}`, JSON.stringify({
              ...data,
              isHired: false,
              hiredAt: null,
            }));
            
            toast.success('합격 안내가 전송되었습니다');
            setApplicationStatus('accepted');
            setShowAcceptanceGuideModal(false);
            
            // 면접결과 섹션의 합격 필터로 이동
            navigate('/employer/recruitment?filter=interview_result&result=accepted');
          } catch (error) {
            console.error('[ERROR] 합격 처리 실패:', error);
            // API 실패 시 localStorage fallback 시도
            try {
              localStorage.setItem(`acceptance_guide_${applicationId}`, JSON.stringify(data));
              toast.success('합격 안내가 저장되었습니다 (로컬 저장)');
              setApplicationStatus('accepted');
              setShowAcceptanceGuideModal(false);
              navigate('/employer/recruitment?filter=interview_result&result=accepted');
            } catch (fallbackError) {
              toast.error('합격 처리에 실패했습니다');
            }
          }
        }}
        applicantName={applicant?.name}
      />
    </div>
  );
};

