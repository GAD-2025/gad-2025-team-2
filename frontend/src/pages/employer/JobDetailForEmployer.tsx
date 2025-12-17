import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Header } from '@/components/Header';
import { jobsAPI } from '@/api/endpoints';
import { formatCurrency, getDaysUntil, formatDate } from '@/utils/date';
import type { Job } from '@/types';
import { API_BASE_URL } from '@/api/client';

export const JobDetailForEmployer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

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
        navigate('/job-management');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, navigate]);

  const handleStatusToggle = async () => {
    if (!job) return;
    
    try {
      const newStatus = job.status === 'active' ? 'paused' : 'active';
      const response = await fetch(`${API_BASE_URL}/jobs/${job.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('상태 변경 실패');
      }

      setJob({ ...job, status: newStatus });
      toast.success(newStatus === 'active' ? '공고가 활성화되었습니다' : '공고가 일시중지되었습니다');
    } catch (error) {
      console.error('상태 변경 오류:', error);
      toast.error('상태 변경에 실패했습니다');
    }
  };

  const handleEdit = () => {
    navigate(`/employer/job-edit/${id}`);
  };

  const handleDelete = async () => {
    if (!job || !confirm('정말 이 공고를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${job.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('삭제 실패');
      }

      toast.success('공고가 삭제되었습니다');
      navigate('/job-management');
    } catch (error) {
      console.error('삭제 오류:', error);
      toast.error('공고 삭제에 실패했습니다');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-mint-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-text-700">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const daysLeft = getDaysUntil(job.deadline);
  const statusInfo = job.status === 'active' 
    ? { label: '모집중', bg: 'bg-emerald-100', text: 'text-emerald-700' }
    : job.status === 'paused'
    ? { label: '일시중지', bg: 'bg-amber-100', text: 'text-amber-700' }
    : { label: '마감', bg: 'bg-gray-100', text: 'text-gray-700' };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header showBack title="공고 상세 정보" />

      <div className="p-4 space-y-4 mb-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-[8px] text-[13px] font-medium ${statusInfo.bg} ${statusInfo.text}`}>
            {statusInfo.label}
          </span>
          {daysLeft !== null && (
            <span className={`text-[14px] font-semibold ${daysLeft <= 3 ? 'text-red-600' : 'text-text-700'}`}>
              D-{daysLeft}
            </span>
          )}
        </div>

        {/* Title */}
        <div className="bg-white rounded-[16px] p-5 shadow-card">
          <h1 className="text-[22px] font-bold text-text-900 mb-2">{job.title}</h1>
          <p className="text-[15px] text-text-700">{job.shop_name || job.employer?.shopName}</p>
          <p className="text-[14px] text-text-500 mt-1">{job.shop_address || job.location || job.employer?.address}</p>
          {job.shop_phone && (
            <p className="text-[14px] text-text-500 mt-1">
              📞 {job.shop_phone}
            </p>
          )}
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-[16px] p-5 shadow-card">
          <h2 className="text-[16px] font-bold text-text-900 mb-3">통계</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-[24px] font-bold text-mint-600">{job.applications || 0}</div>
              <div className="text-[13px] text-text-500 mt-1">지원자</div>
            </div>
            <div className="text-center">
              <div className="text-[24px] font-bold text-text-900">{job.views || 0}</div>
              <div className="text-[13px] text-text-500 mt-1">조회수</div>
            </div>
            <div className="text-center">
              <div className="text-[24px] font-bold text-text-900">{job.positions}</div>
              <div className="text-[13px] text-text-500 mt-1">모집인원</div>
            </div>
          </div>
        </div>

        {/* Work Conditions */}
        <div className="bg-white rounded-[16px] p-5 shadow-card">
          <h2 className="text-[16px] font-bold text-text-900 mb-3">근무 조건</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-text-700">급여</span>
              <span className="text-[15px] font-semibold text-mint-600">
                시급 {formatCurrency(job.wage)}원
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-text-700">근무요일</span>
              <span className="text-[14px] text-text-900">{job.workDays}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-text-700">근무시간</span>
              <span className="text-[14px] text-text-900">{job.workHours}</span>
            </div>
          </div>
        </div>

        {/* Recruitment Conditions */}
        <div className="bg-white rounded-[16px] p-5 shadow-card">
          <h2 className="text-[16px] font-bold text-text-900 mb-3">모집 조건</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-text-700">언어요구사항</span>
              <span className="text-[14px] text-text-900">{job.requiredLanguage}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-[14px] text-text-700">근무가능비자</span>
              <span className="text-[14px] text-text-900 text-right">
                {job.requiredVisa?.join(', ') || '제한없음'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-text-700">모집 마감</span>
              <span className="text-[14px] text-text-900">{formatDate(job.deadline)}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {job.description && (
          <div className="bg-white rounded-[16px] p-5 shadow-card">
            <h2 className="text-[16px] font-bold text-text-900 mb-3">공고 설명</h2>
            <p className="text-[14px] text-text-700 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>
        )}


        {/* Benefits */}
        {job.benefits && (
          <div className="bg-white rounded-[16px] p-5 shadow-card">
            <h2 className="text-[16px] font-bold text-text-900 mb-3">우대사항</h2>
            <p className="text-[14px] text-text-700 leading-relaxed">
              {job.benefits}
            </p>
          </div>
        )}

        {/* Action Buttons Section - 공고 관리 버튼 (맨 아래) */}
        <div className="bg-transparent p-0 mt-4">
          <div className="flex gap-3">
            {/* 일시중지/다시 모집 버튼 */}
            {job.status !== 'closed' && (
              <button
                onClick={handleStatusToggle}
                className="flex-1 h-[52px] bg-gray-200 hover:bg-gray-300 text-gray-700 
                         rounded-[12px] text-[15px] font-semibold transition-colors"
              >
                {job.status === 'active' ? '일시중지' : '다시 모집'}
              </button>
            )}

            {/* 수정 버튼 */}
            <button
              onClick={handleEdit}
              className="flex-1 h-[52px] bg-mint-100 hover:bg-mint-200 text-mint-700 
                       rounded-[12px] text-[15px] font-semibold transition-colors"
            >
              수정
            </button>

            {/* 삭제 버튼 */}
            <button
              onClick={handleDelete}
              className="flex-1 h-[52px] bg-rose-100 hover:bg-rose-200 text-rose-700 
                       rounded-[12px] text-[15px] font-semibold transition-colors"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

