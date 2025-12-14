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
        ${isFeatured ? 'min-w-[340px] w-[340px] border border-mint-600/35 p-2 flex flex-col' : 'border border-border p-4'}
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
      <div className="flex items-start gap-2 mb-1">
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

      {/* Info */}
      <div className="space-y-0.5 mb-1">
        {/* 능력/스킬 섹션 */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            {(skills.workSkills.length > 0 || skills.strengths.length > 0 || skills.mbti.length > 0) ? (
              <div className="space-y-0.5">
                {skills.workSkills.length > 0 && (
                  <div>
                    <p className="text-[9px] text-text-500 mb-0.5">업무 스킬</p>
                    <div className="flex flex-wrap gap-0.5">
                      {skills.workSkills.map((skill: string, idx: number) => (
                        <span key={idx} className="px-1 py-0.5 bg-mint-100 text-mint-700 rounded-[4px] text-[9px] font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {skills.strengths.length > 0 && (
                  <div>
                    <p className="text-[9px] text-text-500 mb-0.5">강점</p>
                    <div className="flex flex-wrap gap-0.5">
                      {skills.strengths.map((strength: string, idx: number) => (
                        <span key={idx} className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded-[4px] text-[9px] font-medium">
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {skills.mbti.length > 0 && (
                  <div>
                    <p className="text-[9px] text-text-500 mb-0.5">성격 유형</p>
                    <div className="flex flex-wrap gap-0.5">
                      {skills.mbti.map((mbti: string, idx: number) => (
                        <span key={idx} className="px-1 py-0.5 bg-purple-100 text-purple-700 rounded-[4px] text-[9px] font-medium">
                          {mbti}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-text-500">능력/스킬: 미입력</p>
            )}
            
            <div className="space-y-0 text-[11px] mt-0.5">
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
          
          {/* 태그를 오른쪽에 배치 */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            {(() => {
              const preferDays = applicant.preferences.preferDays || [];
              const allDays = ['월', '화', '수', '목', '금', '토', '일'];
              const hasAllDays = allDays.every(day => preferDays.includes(day));
              
              if (hasAllDays && preferDays.length >= 7) {
                return (
                  <>
                    <span className="px-1.5 py-0.5 bg-white border border-line-200 text-text-700 rounded-[6px] text-[10px] font-medium whitespace-nowrap">
                      모든 요일 출근 가능
                    </span>
                    {applicant.preferences.area && (
                      <span className="px-1.5 py-0.5 bg-white border border-line-200 text-text-700 rounded-[6px] text-[10px] font-medium whitespace-nowrap">
                        {applicant.preferences.area} 거주
                      </span>
                    )}
                  </>
                );
              } else if (preferDays.length > 0) {
                return (
                  <>
                    {preferDays.slice(0, 2).map((day) => (
                      <span key={day} className="px-1.5 py-0.5 bg-white border border-line-200 text-text-700 rounded-[6px] text-[10px] font-medium whitespace-nowrap">
                        {day} 근무 가능
                      </span>
                    ))}
                    {preferDays.length > 2 && (
                      <span className="px-1.5 py-0.5 bg-white border border-line-200 text-text-700 rounded-[6px] text-[10px] font-medium whitespace-nowrap">
                        +{preferDays.length - 2}
                      </span>
                    )}
                    {applicant.preferences.area && (
                      <span className="px-1.5 py-0.5 bg-white border border-line-200 text-text-700 rounded-[6px] text-[10px] font-medium whitespace-nowrap">
                        {applicant.preferences.area} 거주
                      </span>
                    )}
                  </>
                );
              } else {
                return applicant.preferences.area ? (
                  <span className="px-1.5 py-0.5 bg-white border border-line-200 text-text-700 rounded-[6px] text-[10px] font-medium whitespace-nowrap">
                    {applicant.preferences.area} 거주
                  </span>
                ) : null;
              }
            })()}
          </div>
        </div>
      </div>

      {/* Tags and CTA Row */}
      {isFeatured ? (
        <div className="flex flex-col gap-3 mt-auto">
          {/* 근무 가능 요일 - 통일된 레이아웃 */}
          <div className="min-h-[48px] flex flex-col gap-1.5">
            {(() => {
              const preferDays = applicant.preferences.preferDays || [];
              const allDays = ['월', '화', '수', '목', '금', '토', '일'];
              const hasAllDays = allDays.every(day => preferDays.includes(day));
              
              if (hasAllDays && preferDays.length >= 7) {
                // 모든 요일 출근 가능
                return (
                  <div className="flex gap-1">
                    <span className="px-2 py-1 bg-mint-100 text-mint-700 rounded-[8px] text-[11px] font-medium border border-mint-300">
                      모든 요일 출근 가능
                    </span>
                    {applicant.preferences.area && (
                      <span className="px-2 py-1 bg-white border border-line-200 text-text-700 rounded-[8px] text-[11px] font-medium">
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
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1 flex-wrap">
                      {firstRow.map((day) => (
                        <span key={day} className="px-2 py-1 bg-white border border-line-200 text-text-700 rounded-[8px] text-[11px] font-medium whitespace-nowrap">
                          {day} 근무 가능
                        </span>
                      ))}
                    </div>
                    {(secondRow.length > 0 || applicant.preferences.area) && (
                      <div className="flex gap-1 flex-wrap">
                        {secondRow.map((day) => (
                          <span key={day} className="px-2 py-1 bg-white border border-line-200 text-text-700 rounded-[8px] text-[11px] font-medium whitespace-nowrap">
                            {day} 근무 가능
                          </span>
                        ))}
                        {applicant.preferences.area && (
                          <span className="px-2 py-1 bg-white border border-line-200 text-text-700 rounded-[8px] text-[11px] font-medium whitespace-nowrap">
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
                  <div className="flex gap-1">
                    {applicant.preferences.area && (
                      <span className="px-2 py-1 bg-white border border-line-200 text-text-700 rounded-[8px] text-[11px] font-medium">
                        {applicant.preferences.area} 거주
                      </span>
                    )}
                  </div>
                );
              }
            })()}
          </div>
          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              className={`w-9 h-9 rounded-[8px] flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                isBookmarked
                  ? 'bg-mint-600 border-mint-600'
                  : 'bg-white border-mint-600'
              }`}
            >
              <svg
                className={`w-3.5 h-3.5 ${isBookmarked ? 'text-white' : 'text-mint-600'}`}
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
              className="flex-1 h-9 rounded-[8px] border-2 border-mint-600 bg-white text-mint-600 font-medium text-[11px] flex items-center justify-center gap-1 hover:bg-mint-50 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              채팅
            </button>
            <button
              onClick={handleInterviewProposal}
              className="flex-1 h-9 rounded-[8px] bg-mint-600 text-white font-medium text-[11px] flex items-center justify-center hover:bg-mint-700 transition-colors"
            >
              면접 제안하기
            </button>
          </div>
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

