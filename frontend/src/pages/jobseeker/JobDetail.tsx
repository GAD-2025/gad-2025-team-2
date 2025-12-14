import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Header } from '@/components/Header';
import { ApplyModal } from '@/components/ApplyModal';
import { jobsAPI, applicationsAPI } from '@/api/endpoints';
import { formatCurrency, getDaysUntil, formatDate } from '@/utils/date';
import type { Job } from '@/types';

export const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await jobsAPI.get(id);
        setJob(res.data);
        console.log('Loaded job detail:', res.data);
      } catch (error: any) {
        console.error('공고 로딩 오류:', error);
        if (error.response?.status === 404) {
          toast.error('공고를 찾을 수 없습니다');
        } else {
          toast.error('공고를 불러오는데 실패했습니다');
        }
        navigate('/jobseeker/home');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, navigate]);

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? '저장이 해제되었습니다' : '공고가 저장되었습니다');
  };

  const handleApplyClick = () => {
    setIsApplyModalOpen(true);
  };

  const handleApplyWithBasicResume = async () => {
    if (!id) return;
    
    // Get user ID from localStorage
    const userId = localStorage.getItem('signup_user_id');
    if (!userId) {
      toast.error('로그인이 필요합니다');
      navigate('/auth/signin');
      return;
    }
    
    setIsApplyModalOpen(false);
    try {
      setApplying(true);
      console.log('[DEBUG] 지원하기 시작:', { userId, jobId: id });
      const response = await applicationsAPI.create(userId, id);
      console.log('[DEBUG] 지원 성공:', response.data);
      toast.success('지원이 완료되었습니다');
      navigate('/jobseeker/apply-done');
    } catch (error: any) {
      console.error('[ERROR] 지원 실패:', error);
      console.error('[ERROR] 지원 실패 상세:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      if (error.response?.status === 409) {
        toast.warning('이미 지원한 공고입니다');
      } else if (error.response?.status === 404) {
        toast.error('공고를 찾을 수 없습니다');
      } else if (error.response?.status === 500) {
        toast.error(`지원 중 오류가 발생했습니다: ${error.response?.data?.detail || '서버 오류'}`);
      } else {
        toast.error(`지원에 실패했습니다: ${error.response?.data?.detail || error.message || '알 수 없는 오류'}`);
      }
    } finally {
      setApplying(false);
    }
  };

  const handleEditResumeAndApply = () => {
    if (!id) return;
    setIsApplyModalOpen(false);
    navigate('/resume/edit', { state: { jobId: id } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background max-w-[480px] mx-auto">
        <Header showBack title="공고 상세 정보" />
        <div className="p-4">Loading...</div>
      </div>
    );
  }

  if (!job) return null;

  const daysLeft = getDaysUntil(job.deadline);

  return (
    <div className="min-h-screen bg-background pb-40 max-w-[480px] mx-auto">
      <Header showBack title="공고 상세 정보" />

      <div className="p-4">
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-[22px] font-bold text-text-900">{job.title}</h1>
            {job.isTrusted && (
              <span className="ml-auto px-[10px] py-[6px] rounded-[12px] bg-sky-100 text-sky-700 text-[12px] font-semibold">
                안심 기업
              </span>
            )}
            {job.employer.rating && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                <span className="text-[16px] font-semibold">{job.employer.rating}</span>
              </div>
            )}
          </div>
          <p className="text-[14px] text-text-700 mb-2">{job.category || job.employer.industry}</p>
          <div className="flex items-center gap-1 text-text-700 text-[14px]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{job.shop_address || job.location || job.employer.address}</span>
          </div>
        </div>


        <div className="mb-6">
          <h2 className="text-[18px] font-bold text-text-900 mb-4">근무 조건</h2>
          <div className="space-y-0 bg-white rounded-[16px] p-4 shadow-card">
            <InfoRow 
              label="급여" 
              value={`${(() => {
                const wageType = job.wage_type || 'hourly';
                return wageType === 'hourly' ? '시급' : wageType === 'weekly' ? '주급' : '월급';
              })()} ${job.wage.toLocaleString()}원`} 
              highlight 
            />
            <InfoRow label="근무기간" value={Array.isArray(job.workDays) ? `주 ${job.workDays.length}일, 6시간` : job.workDays} />
            <InfoRow label="근무요일 / 시간" value={job.workHours || "시간, 요일 협의"} />
            <InfoRow label="업직종" value={job.category || job.title} />
            <InfoRow label="언어요구사항">
              <span className="px-[10px] py-[4px] bg-mint-100 text-mint-600 rounded-[16px] text-[13px] font-medium border border-mint-600">
                {job.requiredLanguage}
              </span>
            </InfoRow>
            <InfoRow label="근무가능비자">
              <span className="px-[10px] py-[4px] bg-mint-100 border border-mint-600 text-mint-600 rounded-[16px] text-[13px] font-medium">
                비자:{job.requiredVisa[0]}
              </span>
            </InfoRow>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-[18px] font-bold text-text-900 mb-4">모집 조건</h2>
          <div className="space-y-0 bg-white rounded-[16px] p-4 shadow-card">
            <InfoRow label="모집 마감">
              <div className="flex items-center gap-2">
                <span className="px-[10px] py-[4px] bg-red-100 text-red-600 rounded-[12px] text-[13px] font-semibold">
                  D-{daysLeft}
                </span>
                <span className="text-text-900">{formatDate(job.deadline)}</span>
              </div>
            </InfoRow>
            <InfoRow label="모집 인원" value={`${job.positions}명`} />
            <InfoRow label="우대사항" value="인근 거주 우대, 영어 가능자 우대" />
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons - 메뉴바 위에 위치 */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-line-200 p-4 z-40">
        <div className="flex gap-2 w-full">
          <button
            onClick={handleSave}
            className={`w-[52px] h-[52px] flex-shrink-0 rounded-[12px] flex items-center justify-center transition-colors ${
              isSaved
                ? 'bg-mint-600 text-white'
                : 'bg-transparent text-gray-600 hover:bg-gray-50 border border-line-200'
            }`}
          >
            <svg className="w-6 h-6" fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isSaved ? 0 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          
          <button
            onClick={() => {
              const phone = job.shop_phone || job.employer.phone;
              if (phone) {
                window.location.href = `tel:${phone}`;
              } else {
                toast.info('전화번호 정보가 없습니다');
              }
            }}
            className="flex-1 h-[52px] bg-mint-100 text-mint-600 
                     rounded-[12px] text-[15px] font-semibold hover:bg-mint-200 
                     transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            전화
          </button>
          
          <button
            onClick={handleApplyClick}
            disabled={applying}
            className="flex-1 h-[52px] bg-mint-600 text-white rounded-[12px] text-[16px] 
                     font-semibold hover:bg-mint-700 transition-colors disabled:opacity-50"
          >
            지원하기
          </button>
        </div>
      </div>

      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onApplyWithBasicResume={handleApplyWithBasicResume}
        onEditResumeAndApply={handleEditResumeAndApply}
      />
    </div>
  );
};

interface InfoRowProps {
  label: string;
  value?: string;
  children?: React.ReactNode;
  highlight?: boolean;
}

const InfoRow = ({ label, value, children, highlight = false }: InfoRowProps) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-line-200 last:border-0">
      <span className="text-[14px] text-text-700">{label}</span>
      <div className={`text-[14px] text-right ${highlight ? 'text-mint-600 font-semibold' : 'text-text-900'}`}>
        {children || value}
      </div>
    </div>
  );
};
