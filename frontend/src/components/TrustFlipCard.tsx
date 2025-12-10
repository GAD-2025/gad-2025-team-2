import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Profile, Verifications } from '@/types/profile';

interface TrustFlipCardProps {
  profile: Profile;
  verifications: Verifications;
  onDetailClick: () => void;
}

export const TrustFlipCard = ({ profile, verifications, onDetailClick }: TrustFlipCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const joinedYears = new Date().getFullYear() - new Date(profile.joinedAtISO).getFullYear();
  const verificationDate = new Date(verifications.lastUpdatedISO);
  const verificationDateStr = `${verificationDate.getFullYear()}년 ${verificationDate.getMonth() + 1}월`;

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div 
      className="relative h-[200px] w-full cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={isFlipped ? "통계로 돌아가기" : "인증 정보 보기"}
    >
      <motion.div
        className="absolute inset-0 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
      >
        {/* Front: Stats */}
        <div
          className="absolute inset-0 bg-white rounded-[24px] p-5"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex flex-col justify-between h-full">
            {/* Top Section */}
            <div className="flex items-start gap-4">
              {/* Profile Image */}
              <div className="relative flex-shrink-0">
                <div className="w-[80px] h-[80px] bg-gradient-to-br from-mint-100 to-mint-200 
                              rounded-full flex items-center justify-center overflow-hidden">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">👤</span>
                  )}
                </div>
                {/* Verification Badge */}
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-mint-600 rounded-full 
                              flex items-center justify-center border-2 border-white">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* Name & Role */}
              <div className="flex-1 min-w-0">
                <h2 className="text-[24px] font-bold text-text-900 mb-1">
                  {profile.name}
                </h2>
                <p className="text-[14px] text-text-500">
                  {profile.role === 'jobseeker' ? '구직자' : '고용주'}
                </p>
              </div>

              {/* Shield Icon */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-mint-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-mint-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Bottom Section: Metrics */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <div className="text-[20px] font-bold text-text-900">
                  {profile.metrics.reviews}<span className="text-[14px] font-normal text-text-500">개</span>
                </div>
                <div className="text-[11px] text-text-500">후기</div>
              </div>
              <div>
                <div className="text-[20px] font-bold text-text-900">
                  {joinedYears}<span className="text-[14px] font-normal text-text-500">년</span>
                </div>
                <div className="text-[11px] text-text-500">가입 기간</div>
              </div>
            </div>
          </div>
        </div>

        {/* Back: Verification */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-mint-500 to-teal-500 
                     rounded-[24px] p-5 text-white"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-[20px] font-bold mb-1.5">{profile.name}</h3>
                <p className="text-[13px] text-white/90">
                  {verificationDateStr} 인증 완료
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden 
                            flex items-center justify-center">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">👤</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="flex-1 mb-3">
              <p className="text-[13px] leading-relaxed text-white/95">
                WorkFair는 신뢰 형성을 위해 본인/비자 인증을 실시합니다. 제3자 출처나 정부 발급 신분증을 통해 정보를 확인합니다.
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDetailClick();
                }}
                className="text-[14px] font-semibold underline hover:text-white/80 transition-colors"
              >
                자세히 보기
              </button>
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full 
                            flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hint text */}
      <p className="text-center text-[11px] text-text-500 mt-2">
        카드를 탭하여 {isFlipped ? '통계' : '인증 정보'}를 확인하세요
      </p>
    </div>
  );
};
