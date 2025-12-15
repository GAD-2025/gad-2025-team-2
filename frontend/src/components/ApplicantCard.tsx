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

  const ageLabel = applicant.age ? `${applicant.age}세` : '';

  // 미리보기용 태그: workSkills/strengths/mbti에서 최대 2개만 노출
  const skillPreview = (() => {
    const tags: string[] = [];
    const raw = (applicant as any).experience_skills;
    try {
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed)) tags.push(...parsed);
        else if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.workSkills)) tags.push(...parsed.workSkills);
          if (Array.isArray(parsed.strengths)) tags.push(...parsed.strengths);
          if (Array.isArray(parsed.mbti)) tags.push(...parsed.mbti);
        }
      }
    } catch (_e) {
      if (typeof raw === 'string' && raw.trim()) tags.push(raw.trim());
    }
    return tags.filter(Boolean).slice(0, 2);
  })();

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
    navigate('/employer/coming-soon');
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
        ${
          isFeatured
            ? 'min-w-[300px] w-[300px] border border-mint-600/40 px-3 pt-2 pb-1.5 flex flex-col gap-1.5 h-[175px]'
            : 'border border-border px-3 py-3 flex flex-col gap-2 h-[190px]'
        }
      `}
    >
      {/* 저장 버튼 (우측 상단) */}
      {isFeatured && (
        <button
          onClick={handleSave}
          className="absolute top-2 right-2 w-7 h-7 bg-mint-600 rounded-full 
                   flex items-center justify-center hover:bg-mint-700 transition-colors z-10"
        >
          <svg 
            className="w-3 h-3 text-white" 
            fill={isBookmarked ? "currentColor" : "none"} 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      )}

      {/* Profile */}
      <div className="flex items-start gap-3 mb-0.5">
        <div className="w-[40px] h-[40px] bg-gradient-to-br from-mint-100 to-mint-200 rounded-full 
                      flex items-center justify-center overflow-hidden flex-shrink-0">
          <span className="text-lg">👤</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-semibold text-text-900 mb-0 leading-tight">
            {applicant.name} {ageLabel}
          </h3>
          <div className="flex items-center gap-1 text-[11px] text-text-700">
            <span>{flagEmoji(applicant.nationalityCode || applicant.nationality)}</span>
            <span>{applicant.nationality || applicant.nationalityCode || '국적 미상'}</span>
          </div>
        </div>
      </div>

      {/* Info - 간략 표시 */}
      <div className="flex items-start gap-3 mb-1">
        <div className="flex-1 min-w-0 space-y-1">
          {skillPreview.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {skillPreview.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-mint-100 text-mint-700 rounded-[10px] text-[11px] font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-text-500 mb-0">능력/스킬: 미입력</p>
          )}
          <p className="text-[11px] text-text-700 leading-tight">
            비자: <span className="font-semibold">{applicant.visaType || '미입력'}</span>
          </p>
        </div>

        <div className="flex flex-col gap-0.5 flex-shrink-0">
          {(() => {
            const preferDays = applicant.preferences.preferDays || [];
            const tags: string[] = [];
            if (preferDays.length) {
              tags.push(...preferDays.slice(0, 2).map((d) => `${d} 근무 가능`));
              if (preferDays.length > 2) tags.push(`+${preferDays.length - 2}`);
            }
            if (applicant.preferences.area) tags.push(`${applicant.preferences.area} 거주`);
            return tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 bg-white border border-line-200 text-text-700 rounded-[6px] text-[10px] font-medium whitespace-nowrap"
              >
                {tag}
              </span>
            ));
          })()}
        </div>
      </div>

      {/* Action Buttons */}
      {isFeatured ? (
        <div className="flex items-center gap-2 mt-auto">
          <button
            onClick={handleSave}
            className={`w-10 h-10 rounded-[8px] flex items-center justify-center border-2 transition-all flex-shrink-0 ${
              isBookmarked
                ? 'bg-mint-600 border-mint-600'
                : 'bg-white border-mint-600'
            }`}
          >
            <svg
              className={`w-2.5 h-2.5 ${isBookmarked ? 'text-white' : 'text-mint-600'}`}
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
            className="flex-1 h-10 rounded-[8px] border-2 border-mint-600 bg-white text-mint-600 font-semibold text-[12px] flex items-center justify-center gap-1 hover:bg-mint-50 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            채팅
          </button>
          <button
            onClick={handleInterviewProposal}
            className="flex-1 h-10 rounded-[8px] bg-mint-600 text-white font-semibold text-[12px] flex items-center justify-center hover:bg-mint-700 transition-colors"
          >
            면접 제안하기
          </button>
        </div>
      ) : (
        <>
          {/* Tags - 통일된 레이아웃 */}
          <div className="flex flex-col gap-1 mb-2">
            {(() => {
              const preferDays = applicant.preferences.preferDays || [];
              const allDays = ['월', '화', '수', '목', '금', '토', '일'];
              const hasAllDays = allDays.every(day => preferDays.includes(day));
              
              if (hasAllDays && preferDays.length >= 7) {
                // 모든 요일 출근 가능
                return (
                  <div className="flex gap-2">
                    <span className="px-[10px] py-[4px] bg-mint-100 text-mint-600 rounded-[12px] text-[12px] font-medium">
                      모든 요일 출근 가능
                    </span>
                    {applicant.preferences.area && (
                      <span className="px-[10px] py-[4px] bg-white border border-line-200 text-text-700 rounded-[12px] text-[12px] font-medium">
                        {applicant.preferences.area} 거주
                      </span>
                    )}
                  </div>
                );
              } else if (preferDays.length > 0) {
                // 요일별로 표시 (2줄 고정 레이아웃)
                const firstRow = preferDays.slice(0, 4);
                const secondRow = preferDays.slice(4);
                return (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex gap-1.5 flex-wrap">
                      {firstRow.map((day) => (
                        <span key={day} className="px-[10px] py-[4px] bg-mint-100 text-mint-600 rounded-[12px] text-[12px] font-medium whitespace-nowrap">
                          {day} 근무 가능
                        </span>
                      ))}
                    </div>
                    {(secondRow.length > 0 || applicant.preferences.area) && (
                      <div className="flex gap-1.5 flex-wrap">
                        {secondRow.map((day) => (
                          <span key={day} className="px-[10px] py-[4px] bg-mint-100 text-mint-600 rounded-[12px] text-[12px] font-medium whitespace-nowrap">
                            {day} 근무 가능
                          </span>
                        ))}
                        {applicant.preferences.area && (
                          <span className="px-[10px] py-[4px] bg-white border border-line-200 text-text-700 rounded-[12px] text-[12px] font-medium whitespace-nowrap">
                            {applicant.preferences.area} 거주
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              } else {
                // 근무 가능 요일이 없는 경우
                return (
                  <div className="flex gap-2">
                    {applicant.preferences.area && (
                      <span className="px-[10px] py-[4px] bg-white border border-line-200 text-text-700 rounded-[12px] text-[12px] font-medium">
                        {applicant.preferences.area} 거주
                      </span>
                    )}
                  </div>
                );
              }
            })()}
          </div>
          {/* CTA */}
          <div className="mt-auto">
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
          </div>
        </>
      )}
    </div>
  );
};

