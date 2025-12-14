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

  // Parse skills if JSON string
  const parsedSkills = (() => {
    if (!applicant.experience_skills) return [];
    try {
      const parsed = JSON.parse(applicant.experience_skills);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === 'object') {
        return Object.values(parsed).flatMap((v) => (Array.isArray(v) ? v : [String(v)]));
      }
    } catch (_e) {
      /* ignore */
    }
    return [applicant.experience_skills];
  })();

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header showBack title="지원자 상세 정보" />

      <div className="p-4">
        {/* Profile Card */}
        <div className="bg-white border-2 border-mint-600 rounded-[16px] p-4 mb-5 relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-mint-100 to-mint-200 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
              👤
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-[20px] font-bold text-text-900 mb-1">
                {applicant.name}{age ? ` ${age}세` : ''}
              </h1>
              <div className="flex items-center gap-1 text-[14px] text-text-500">
                <span>{flagEmoji(applicant.nationality_code)}</span>
                <span>{applicant.nationality_code || '국적 미상'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-[14px] text-text-700">
              언어 능력: {parsedSkills.length ? parsedSkills.join(', ') : applicant.experience_skills || '미입력'}
            </p>
            <p className="text-[14px] text-text-700">
              비자: {(applicant as any).visa_type ?? (applicant as any).visaType ?? '미입력'}
            </p>
            {applicant.experience_career && (
              <p className="text-[14px] text-mint-700 font-medium">
                경력: {applicant.experience_career}
              </p>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {parsedSkills.length > 0 ? parsedSkills.map((skill: string, index: number) => (
              <span
                key={index}
                className="px-2.5 py-1 bg-mint-100 text-mint-700 rounded-[8px] text-[12px] font-medium"
              >
                {skill}
              </span>
            )) : skills.map((skill: string, index: number) => (
              <span
                key={index}
                className="px-2.5 py-1 bg-mint-100 text-mint-700 rounded-[8px] text-[12px] font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
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

        {/* Language Skills */}
        {(parsedSkills.length > 0 || applicant.experience_skills) && (
          <div className="mb-5">
            <h2 className="text-[17px] font-bold text-text-900 mb-3">언어능력</h2>
            <div className="flex flex-wrap gap-2">
              {parsedSkills.length > 0 ? parsedSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-mint-100 text-mint-700 rounded-[8px] text-[13px] font-medium"
                >
                  {skill}
                </span>
              )) : (
                <span className="px-3 py-1.5 bg-mint-100 text-mint-700 rounded-[8px] text-[13px] font-medium">
                  {applicant.experience_skills || '미입력'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Work Availability */}
        <div className="mb-5">
          <h2 className="text-[17px] font-bold text-text-900 mb-3">근무 가능 시간</h2>
          <div className="bg-gray-50 rounded-[12px] p-4">
            <p className="text-[14px] text-text-700 leading-relaxed">
              {applicant.work_days_of_week?.length || applicant.work_start_time || applicant.work_available_dates?.length
                ? [
                    applicant.work_days_of_week?.length ? `요일: ${applicant.work_days_of_week.join(', ')}` : null,
                    applicant.work_start_time && applicant.work_end_time ? `시간: ${applicant.work_start_time} ~ ${applicant.work_end_time}` : null,
                    applicant.work_available_dates?.length ? `가능 날짜: ${applicant.work_available_dates.slice(0, 3).join(', ')}${applicant.work_available_dates.length > 3 ? ' 외' : ''}` : null
                  ].filter(Boolean).join(', ')
                : '미입력'}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-line-200 px-4 py-3 safe-area-bottom">
        <div className="flex items-center gap-3">
          {/* 저장 아이콘 */}
          <button
            onClick={handleSave}
            className={`w-12 h-12 rounded-[12px] flex items-center justify-center border-2 transition-all ${
              isSaved
                ? 'bg-mint-600 border-mint-600'
                : 'bg-white border-mint-600'
            }`}
          >
            <svg
              className={`w-6 h-6 ${isSaved ? 'text-white' : 'text-mint-600'}`}
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

          {/* 채팅 버튼 */}
          <button
            onClick={handleStartChat}
            className="flex-1 h-12 rounded-[12px] border-2 border-mint-600 bg-white text-mint-600 font-medium text-[14px] flex items-center justify-center gap-2 hover:bg-mint-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            채팅
          </button>

          {/* 면접 제안하기 버튼 */}
          <button
            onClick={handleHire}
            disabled={hiring}
            className="flex-1 h-12 rounded-[12px] bg-mint-600 text-white font-medium text-[14px] flex items-center justify-center hover:bg-mint-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

