import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { JobSeeker } from '@/types';

interface ApplicantCardProps {
  applicant: JobSeeker;
  variant?: 'default' | 'featured';
}

export const ApplicantCard = ({ applicant, variant = 'default' }: ApplicantCardProps) => {
  const navigate = useNavigate();
  const isFeatured = variant === 'featured';
  const [isBookmarked, setIsBookmarked] = useState(false);

  // 저장 상태 확인
  useEffect(() => {
    const savedApplicants = JSON.parse(localStorage.getItem('saved_applicants') || '[]');
    const applicantId = applicant.userId || applicant.id;
    setIsBookmarked(savedApplicants.includes(applicantId));
  }, [applicant.userId, applicant.id]);

  const experience = applicant.experience?.[0];
  const ageLabel = applicant.age ? `${applicant.age}세` : '';

  const flagEmoji = (codeOrName?: string) => {
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

  // 백엔드 엔드포인트는 user_id를 기대하므로 userId를 우선 사용
  const applicantId = applicant.userId || applicant.id;

  // 저장 버튼 핸들러
  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const savedApplicants = JSON.parse(localStorage.getItem('saved_applicants') || '[]');
    if (isBookmarked) {
      const updated = savedApplicants.filter((id: string) => id !== applicantId);
      localStorage.setItem('saved_applicants', JSON.stringify(updated));
      setIsBookmarked(false);
    } else {
      savedApplicants.push(applicantId);
      localStorage.setItem('saved_applicants', JSON.stringify(savedApplicants));
      setIsBookmarked(true);
    }
  };

  // 채팅 핸들러
  const handleChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/chat/${applicantId}`);
  };

  // 면접 제안 핸들러
  const handleInterviewProposal = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/employer/applicant/${applicantId}`);
  };

  // experience_skills 파싱 함수
  const parseSkills = (skillsData: any) => {
    if (!skillsData) return { workSkills: [], strengths: [], mbti: [] };
    
    try {
      if (typeof skillsData === 'string') {
        const parsed = JSON.parse(skillsData);
        return {
          workSkills: parsed.workSkills || [],
          strengths: parsed.strengths || [],
          mbti: parsed.mbti || []
        };
      }
      if (typeof skillsData === 'object') {
        return {
          workSkills: skillsData.workSkills || [],
          strengths: skillsData.strengths || [],
          mbti: skillsData.mbti || []
        };
      }
    } catch (e) {
      console.error('Failed to parse skills:', e);
    }
    return { workSkills: [], strengths: [], mbti: [] };
  };

  const skills = parseSkills((applicant as any).experience_skills || (applicant as any).experienceSkills);
  
  return (
    <div
      onClick={() => navigate(`/applicant/${applicantId}`)}
      className={`
        bg-white rounded-card cursor-pointer snap-start relative
        transition-all duration-120 hover:shadow-card active:scale-[0.98]
        ${isFeatured ? 'min-w-[340px] w-[340px] border border-mint-600/35 p-[14px] flex flex-col' : 'border border-border p-4'}
      `}
    >
      {/* 저장 버튼 (우측 상단) */}
      {isFeatured && (
        <button
          onClick={handleSave}
          className="absolute top-[14px] right-[14px] w-10 h-10 bg-mint-600 rounded-full 
                   flex items-center justify-center hover:bg-mint-700 transition-colors z-10"
        >
          <svg 
            className="w-5 h-5 text-white" 
            fill={isBookmarked ? "currentColor" : "none"} 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      )}

      {/* Profile */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-[60px] h-[60px] bg-gradient-to-br from-mint-100 to-mint-200 rounded-full 
                      flex items-center justify-center overflow-hidden flex-shrink-0">
          <span className="text-3xl">👤</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-semibold text-text-900 mb-1">
            {applicant.name} {ageLabel}
          </h3>
          <div className="flex items-center gap-1 text-[13px] text-text-700">
            <span>{flagEmoji(applicant.nationalityCode || applicant.nationality)}</span>
            <span>{applicant.nationality || applicant.nationalityCode || '국적 미상'}</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-3">
        {/* 능력/스킬 섹션 */}
        {(skills.workSkills.length > 0 || skills.strengths.length > 0 || skills.mbti.length > 0) ? (
          <div className="space-y-1.5">
            {skills.workSkills.length > 0 && (
              <div>
                <p className="text-[11px] text-text-500 mb-1">업무 스킬</p>
                <div className="flex flex-wrap gap-1">
                  {skills.workSkills.map((skill: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 bg-mint-100 text-mint-700 rounded-[6px] text-[11px] font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {skills.strengths.length > 0 && (
              <div>
                <p className="text-[11px] text-text-500 mb-1">강점</p>
                <div className="flex flex-wrap gap-1">
                  {skills.strengths.map((strength: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-[6px] text-[11px] font-medium">
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {skills.mbti.length > 0 && (
              <div>
                <p className="text-[11px] text-text-500 mb-1">성격 유형</p>
                <div className="flex flex-wrap gap-1">
                  {skills.mbti.map((mbti: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-[6px] text-[11px] font-medium">
                      {mbti}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-[13px] text-text-500">능력/스킬: 미입력</p>
        )}
        
        <div className="space-y-[2px] text-[13px]">
          <p className="text-text-900">
            <span className="text-text-700">비자:</span> {applicant.visaType || '미입력'}
          </p>
          {experience && (
            <p className="text-mint-600 font-medium">
              경력: {experience.role} {experience.years}년 근무
            </p>
          )}
        </div>
      </div>

      {/* Tags and CTA Row */}
      {isFeatured ? (
        <div className="flex flex-col gap-3 mt-auto">
          <div className="flex gap-2 flex-wrap">
            {applicant.preferences.preferDays?.map((day) => (
              <span key={day} className="px-[10px] py-[4px] bg-white border border-line-200 text-text-700 rounded-[12px] text-[12px] font-medium">
                {day} 근무 가능
              </span>
            ))}
            {applicant.preferences.area && (
              <span className="px-[10px] py-[4px] bg-white border border-line-200 text-text-700 rounded-[12px] text-[12px] font-medium">
                {applicant.preferences.area} 거주
              </span>
            )}
          </div>
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className={`w-11 h-11 rounded-[10px] flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                isBookmarked
                  ? 'bg-mint-600 border-mint-600'
                  : 'bg-white border-mint-600'
              }`}
            >
              <svg
                className={`w-5 h-5 ${isBookmarked ? 'text-white' : 'text-mint-600'}`}
                fill={isBookmarked ? 'currentColor' : 'none'}
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
            <button
              onClick={handleChat}
              className="flex-1 h-11 rounded-[10px] border-2 border-mint-600 bg-white text-mint-600 font-medium text-[13px] flex items-center justify-center gap-1.5 hover:bg-mint-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              채팅
            </button>
            <button
              onClick={handleInterviewProposal}
              className="flex-1 h-11 rounded-[10px] bg-mint-600 text-white font-medium text-[13px] flex items-center justify-center hover:bg-mint-700 transition-colors"
            >
              면접 제안하기
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Tags */}
          <div className="flex gap-2 mb-3 flex-wrap">
            {applicant.preferences.preferDays?.map((day) => (
              <span key={day} className="px-[10px] py-[4px] bg-mint-100 text-mint-600 rounded-[12px] text-[12px] font-medium">
                {day} 근무 가능
              </span>
            ))}
            {applicant.preferences.area && (
              <span className="px-[10px] py-[4px] bg-white border border-line-200 text-text-700 rounded-[12px] text-[12px] font-medium">
                {applicant.preferences.area} 거주
              </span>
            )}
          </div>
          {/* CTA */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/applicant/${applicantId}`);
            }}
            className="w-full h-[44px] bg-mint-600 text-white rounded-[12px] 
                     text-[15px] font-semibold hover:bg-mint-700 transition-colors"
          >
            연락하기
          </button>
        </>
      )}
    </div>
  );
};

