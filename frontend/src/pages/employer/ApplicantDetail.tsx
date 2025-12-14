import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Header } from '@/components/Header';
import { Tag } from '@/components/Tag';
import { BottomCTA, CTAButton } from '@/components/BottomCTA';
import { getJobSeekerProfile, type JobSeekerProfileData } from '@/api/endpoints';
import { InterviewProposalModal, type InterviewProposalData } from '@/components/InterviewProposalModal';

export const ApplicantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState<JobSeekerProfileData | null>(null);
  const [hiring, setHiring] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);

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

  const handleInterviewSubmit = async (data: InterviewProposalData) => {
    if (!id) return;
    
    try {
      setHiring(true);
      console.log('면접 제안 데이터:', data);
      // TODO: 실제 API 호출
      // await applicationsAPI.proposeInterview(id, data);
      await new Promise(resolve => setTimeout(resolve, 500));
      setShowInterviewModal(false);
      // 면접 제안 완료 화면으로 이동
      navigate('/employer/interview-proposed', {
        state: {
          interviewData: data,
          applicantName: applicant?.name,
        },
      });
    } catch (error) {
      toast.error('면접 제안 전송 중 오류가 발생했습니다');
    } finally {
      setHiring(false);
    }
  };

  const handleStartChat = () => {
    // 실제로는 conversation을 생성하거나 기존 conversation을 찾아서 이동
    // 임시로 conv-1로 이동 (Mock)
    const conversationId = `conv-${id}`;
    navigate(`/messages/${conversationId}`);
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
                {applicant.experience_career && (
                  <p className="text-[13px] text-mint-700 font-semibold">
                    경력: {applicant.experience_career}
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

      {/* Bottom Action Bar - 모바일 화면 크기에 맞게 조정, 내비게이션 바 대신 표시 */}
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

      {/* 면접 제안 모달 */}
      <InterviewProposalModal
        isOpen={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
        onSubmit={handleInterviewSubmit}
        applicantName={applicant?.name}
      />
    </div>
  );
};

