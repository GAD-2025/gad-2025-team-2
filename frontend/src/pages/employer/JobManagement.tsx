import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jobsAPI } from '@/api/endpoints';
import type { Job } from '@/types';

interface JobWithStats extends Job {
  applicantCount: number;
  viewCount: number;
}

export const JobManagement = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'paused' | 'closed'>('all');
  const [jobs, setJobs] = useState<JobWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployerJobs = async () => {
      try {
        setLoading(true);
        // Fetch all jobs from API
        const response = await jobsAPI.list({ limit: 100 });
        const jobsWithStats: JobWithStats[] = (response.data || []).map((job: any) => ({
          ...job,
          applicantCount: job.applications || 0,
          viewCount: job.views || 0,
        }));
        setJobs(jobsWithStats);
        console.log(`Loaded ${jobsWithStats.length} jobs for employer`);
      } catch (error) {
        console.error('공고 로딩 오류:', error);
        toast.error('공고를 불러오는데 실패했습니다');
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployerJobs();
  }, []);


  const filteredJobs = activeFilter === 'all' 
    ? jobs 
    : jobs.filter(j => j.status === activeFilter);

  const getStatusInfo = (status: Job['status']) => {
    switch (status) {
      case 'active':
        return { label: '모집중', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '✓' };
      case 'paused':
        return { label: '일시중지', bg: 'bg-amber-100', text: 'text-amber-700', icon: '⏸' };
      case 'closed':
        return { label: '마감', bg: 'bg-gray-100', text: 'text-gray-700', icon: '✕' };
    }
  };

  const statusCounts = {
    all: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    paused: jobs.filter(j => j.status === 'paused').length,
    closed: jobs.filter(j => j.status === 'closed').length
  };

  const handleStatusToggle = async (jobId: string, currentStatus: Job['status'], e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      const response = await fetch(`http://localhost:8000/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('상태 변경 실패');
      }

      // 로컬 상태 업데이트
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      ));

      toast.success(newStatus === 'active' ? '공고가 활성화되었습니다' : '공고가 일시중지되었습니다');
    } catch (error) {
      console.error('상태 변경 오류:', error);
      toast.error('상태 변경에 실패했습니다');
    }
  };

  const handleDelete = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('정말 이 공고를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('삭제 실패');
      }

      // 로컬 상태에서 제거
      setJobs(prev => prev.filter(job => job.id !== jobId));
      toast.success('공고가 삭제되었습니다');
    } catch (error) {
      console.error('삭제 오류:', error);
      toast.error('공고 삭제에 실패했습니다');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-white border-b border-line-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-text-900">공고 관리</h1>
            <p className="text-[13px] text-text-500 mt-1">
              총 {jobs.length}개의 공고
            </p>
          </div>
          <button
            onClick={() => navigate('/employer/job-create')}
            className="px-4 py-2 bg-mint-600 hover:bg-mint-700 text-white 
                     rounded-[12px] text-[14px] font-medium transition-colors
                     flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 공고
          </button>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-line-200 px-4 overflow-x-auto">
        <div className="flex gap-2 py-3">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-[12px] text-[14px] font-medium whitespace-nowrap transition-all ${
              activeFilter === 'all'
                ? 'bg-mint-600 text-white'
                : 'bg-gray-100 text-text-700 hover:bg-gray-200'
            }`}
          >
            전체 ({statusCounts.all})
          </button>
          <button
            onClick={() => setActiveFilter('active')}
            className={`px-4 py-2 rounded-[12px] text-[14px] font-medium whitespace-nowrap transition-all ${
              activeFilter === 'active'
                ? 'bg-mint-600 text-white'
                : 'bg-gray-100 text-text-700 hover:bg-gray-200'
            }`}
          >
            모집중 ({statusCounts.active})
          </button>
          <button
            onClick={() => setActiveFilter('paused')}
            className={`px-4 py-2 rounded-[12px] text-[14px] font-medium whitespace-nowrap transition-all ${
              activeFilter === 'paused'
                ? 'bg-mint-600 text-white'
                : 'bg-gray-100 text-text-700 hover:bg-gray-200'
            }`}
          >
            일시중지 ({statusCounts.paused})
          </button>
          <button
            onClick={() => setActiveFilter('closed')}
            className={`px-4 py-2 rounded-[12px] text-[14px] font-medium whitespace-nowrap transition-all ${
              activeFilter === 'closed'
                ? 'bg-mint-600 text-white'
                : 'bg-gray-100 text-text-700 hover:bg-gray-200'
            }`}
          >
            마감 ({statusCounts.closed})
          </button>
        </div>
      </div>

      {/* Jobs List */}
      <div className="p-4 space-y-3">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-[15px] text-text-500 mb-4">등록된 공고가 없습니다</p>
            <button
              onClick={() => navigate('/employer/job-create')}
              className="px-6 py-3 bg-mint-600 hover:bg-mint-700 text-white 
                       rounded-[12px] text-[14px] font-medium transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              첫 공고 등록하기
            </button>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const statusInfo = getStatusInfo(job.status);
            return (
              <div
                key={job.id}
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="bg-white rounded-[16px] p-4 border border-line-200 
                         hover:border-mint-600/30 hover:shadow-soft transition-all cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[17px] font-bold text-text-900">
                        {job.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-[6px] text-[11px] font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-[14px] text-text-700 font-medium mb-1">
                      {job.employer?.shopName}
                    </p>
                    <p className="text-[13px] text-text-500">
                      {job.location || job.employer?.address}
                    </p>
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-center gap-4 mb-3 pb-3 border-b border-line-200">
                  <div className="flex items-center gap-1 text-[13px]">
                    <svg className="w-4 h-4 text-mint-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-mint-600">
                      시급 {job.wage?.toLocaleString() || 0}원
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[13px] text-text-700">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{job.workHours}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-3 text-[13px] text-text-500">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>지원자 {job.applicantCount}명</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>조회 {job.viewCount}회</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(job.postedAt || job.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {job.status !== 'closed' && (
                    <button
                      onClick={(e) => handleStatusToggle(job.id, job.status, e)}
                      className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-text-900 
                               rounded-[8px] text-[13px] font-medium transition-colors"
                    >
                      {job.status === 'active' ? '일시중지' : '다시 모집'}
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/employer/job-edit/${job.id}`);
                    }}
                    className="flex-1 px-3 py-2 bg-mint-100 hover:bg-mint-200 text-mint-700 
                             rounded-[8px] text-[13px] font-medium transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={(e) => handleDelete(job.id, e)}
                    className="px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 
                             rounded-[8px] text-[13px] font-medium transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

