import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { JobSeeker } from '@/types';

interface ApplicantCardProps {
  applicant: JobSeeker;
  variant?: 'default' | 'featured';
}

export const ApplicantCard = ({ applicant, variant = 'default' }: ApplicantCardProps) => {
  const navigate = useNavigate();
  const isFeatured = variant === 'featured';
  const [isBookmarked, setIsBookmarked] = useState(false);

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
  
  return (
    <div
      onClick={() => navigate(`/applicant/${applicantId}`)}
      className={`
        bg-white rounded-card cursor-pointer snap-start relative
        transition-all duration-120 hover:shadow-card active:scale-[0.98]
        ${isFeatured ? 'min-w-[340px] w-[340px] border border-mint-600/35 p-[14px] flex flex-col' : 'border border-border p-4'}
      `}
    >
      {/* Bookmark button (featured only) */}
      {isFeatured && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsBookmarked(!isBookmarked);
          }}
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
      <div className="space-y-[2px] mb-3 text-[13px]">
        <p className="text-text-900">
          <span className="text-text-700">언어 능력:</span> {applicant.languageLevel || '미입력'}
        </p>
        <p className="text-text-900">
          <span className="text-text-700">비자:</span> {applicant.visaType || '미입력'}
        </p>
        {experience && (
          <p className="text-mint-600 font-medium">
            경력: {experience.role} {experience.years}년 근무
          </p>
        )}
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

