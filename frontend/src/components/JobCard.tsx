import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Job } from '@/types';
import { Tag } from './Tag';
import { CTAButton } from './BottomCTA';
import { formatCurrency, getDaysUntil } from '@/utils/date';

interface JobCardProps {
  job: Job;
  variant?: 'default' | 'featured';
}

export const JobCard = ({ job, variant = 'default' }: JobCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const daysLeft = getDaysUntil(job.deadline);
  const isFeatured = variant === 'featured';

  return (
    <div
      onClick={() => navigate(`/job/${job.id}`)}
      className={`
        bg-white rounded-[16px] cursor-pointer snap-start
        transition-all duration-120 hover:shadow-card active:scale-[0.98]
        ${isFeatured ? 'min-w-[320px] w-[320px] border-2 border-mint-600 p-4 flex flex-col' : 'border border-border p-4'}
      `}
    >
      {/* Title + Trusted badge */}
      <div className="flex items-center gap-2 mb-2">
        {job.isTrusted && (
          <span className="px-[8px] py-[4px] rounded-[10px] bg-sky-100 text-sky-700 text-[11px] font-semibold">
            안심 기업
          </span>
        )}
        <h3 className="text-[16px] font-bold text-text-900 line-clamp-1">{job.title}</h3>
      </div>

      {/* Company info */}
      <div className="flex items-center gap-1.5 mb-1">
        <svg className="w-[14px] h-[14px] text-text-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span className="text-[13px] text-text-700">{job.employer.shopName}</span>
      </div>

      <div className="flex items-center gap-1.5 mb-3">
        <svg className="w-[14px] h-[14px] text-text-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-[13px] text-text-700 line-clamp-1">
          {job.location || job.employer.address.split(' ').slice(0, 2).join(' ')}
        </span>
      </div>

      {/* Wage */}
      <div className="mb-3">
        <span className="text-[15px] font-bold text-mint-600">
          {job.wage_type === 'hourly' ? '시급' : job.wage_type === 'weekly' ? '주급' : '월급'} {job.wage.toLocaleString()}원
        </span>
      </div>

      {/* Tags and Button Row */}
      {isFeatured ? (
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <span className="px-[9px] py-[3px] bg-mint-100 text-mint-600 rounded-[8px] text-[11px] font-medium">
              {job.requiredLanguage}
            </span>
            {job.requiredVisa[0] && (
              <span className="px-[9px] py-[3px] bg-white border border-line-200 text-text-700 rounded-[8px] text-[11px] font-medium">
                비자:{job.requiredVisa[0]}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/job/${job.id}`);
            }}
            className="px-3 py-1.5 bg-mint-600 text-white rounded-[16px] 
                     text-[13px] font-semibold hover:bg-mint-700 transition-colors flex-shrink-0"
          >
            지원하기
          </button>
        </div>
      ) : (
        <>
          {/* Tags */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <Tag variant="mint" size="sm">
              {job.requiredLanguage}
            </Tag>
            {job.requiredVisa[0] && (
              <Tag variant="outline-gray" size="sm">
                {job.requiredVisa[0]}
              </Tag>
            )}
          </div>

          {/* Apply button */}
          <CTAButton
            variant="primary"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/job/${job.id}`);
            }}
          >
            {t('job.apply')}
          </CTAButton>
        </>
      )}
    </div>
  );
};

