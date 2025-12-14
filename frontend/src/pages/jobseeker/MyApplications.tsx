import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Header } from '@/components/Header';
import { applicationsAPI, jobsAPI } from '@/api/endpoints';
import { useAuthStore } from '@/store/useAuth';
import type { Job } from '@/types';

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  shopName: string;
  wage: number;
  location: string;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
}

// Backend status to frontend status mapping
const mapStatus = (backendStatus: string): Application['status'] => {
  switch (backendStatus) {
    case 'applied':
      return 'pending';
    case 'hired':
      return 'accepted';
    case 'rejected':
      return 'rejected';
    default:
      return 'pending';
  }
};

export const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'reviewed' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      // Get current user ID (prefer zustand-migrated value)
      const signupUserId = useAuthStore.getState().signupUserId;
      const userId = signupUserId || localStorage.getItem('signup_user_id');
      if (!userId) {
        console.error('No user ID found');
        toast.error('로그인이 필요합니다');
        navigate('/signin');
        return;
      }

      // Fetch applications from backend
      const applicationsResponse = await applicationsAPI.list(userId);
      console.log('Fetched applications:', applicationsResponse.data);

      // If no applications, show empty state
      if (!applicationsResponse.data || applicationsResponse.data.length === 0) {
        setApplications([]);
        return;
      }

      // Fetch job details for each application
      const applicationsWithJobDetails = await Promise.all(
        applicationsResponse.data.map(async (app: any) => {
          try {
            const jobResponse = await jobsAPI.get(app.jobId);
            const job: Job = jobResponse.data;
            
            return {
              id: app.applicationId,
              jobId: app.jobId,
              jobTitle: job.title,
              shopName: job.employer?.name || job.employer?.industry || '회사명 미등록',
              wage: job.wage,
              location: job.employer?.address || '위치 미등록',
              appliedDate: app.appliedAt.split('T')[0], // Extract date from ISO string
              status: mapStatus(app.status),
            } as Application;
          } catch (error) {
            console.error(`Failed to fetch job ${app.jobId}:`, error);
            // Return a fallback application entry
            return {
              id: app.applicationId,
              jobId: app.jobId,
              jobTitle: '공고 정보를 불러올 수 없습니다',
              shopName: '정보 없음',
              wage: 0,
              location: '정보 없음',
              appliedDate: app.appliedAt.split('T')[0],
              status: mapStatus(app.status),
            } as Application;
          }
        })
      );

      setApplications(applicationsWithJobDetails);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      toast.error('지원 내역을 불러오는데 실패했습니다');
      // Fallback to empty array on error
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Application['status']) => {
    const statusConfig = {
      pending: { label: '대기중', color: 'bg-yellow-100 text-yellow-700' },
      reviewed: { label: '검토중', color: 'bg-blue-100 text-blue-700' },
      accepted: { label: '합격', color: 'bg-mint-100 text-mint-600' },
      rejected: { label: '불합격', color: 'bg-red-100 text-red-600' }
    };

    const config = statusConfig[status];
    return (
      <span className={`px-[10px] py-[4px] rounded-[8px] text-[12px] font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  };

  const filteredApplications = activeFilter === 'all' 
    ? applications 
    : applications.filter(app => app.status === activeFilter);

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    reviewed: applications.filter(a => a.status === 'reviewed').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="지원 현황" showBack />

      {/* Status Filter */}
      <div className="bg-white border-b border-line-200 p-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-mint-600 text-white'
                : 'bg-background text-text-700 border border-line-200 hover:border-mint-600'
            }`}
          >
            전체 ({statusCounts.all})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
              activeFilter === 'pending'
                ? 'bg-mint-600 text-white'
                : 'bg-background text-text-700 border border-line-200 hover:border-mint-600'
            }`}
          >
            대기중 ({statusCounts.pending})
          </button>
          <button
            onClick={() => setActiveFilter('reviewed')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
              activeFilter === 'reviewed'
                ? 'bg-mint-600 text-white'
                : 'bg-background text-text-700 border border-line-200 hover:border-mint-600'
            }`}
          >
            검토중 ({statusCounts.reviewed})
          </button>
          <button
            onClick={() => setActiveFilter('accepted')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
              activeFilter === 'accepted'
                ? 'bg-mint-600 text-white'
                : 'bg-background text-text-700 border border-line-200 hover:border-mint-600'
            }`}
          >
            합격 ({statusCounts.accepted})
          </button>
          <button
            onClick={() => setActiveFilter('rejected')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
              activeFilter === 'rejected'
                ? 'bg-mint-600 text-white'
                : 'bg-background text-text-700 border border-line-200 hover:border-mint-600'
            }`}
          >
            불합격 ({statusCounts.rejected})
          </button>
        </div>
      </div>

      {/* Applications List */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-text-500">불러오는 중...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-text-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-text-500 text-[15px]">지원 내역이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                onClick={() => navigate(`/jobs/${app.jobId}`)}
                className="bg-white rounded-[16px] p-4 shadow-card border border-line-200
                         hover:shadow-soft transition-all cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-[16px] font-semibold text-text-900 mb-1">
                      {app.jobTitle}
                    </h3>
                    <p className="text-[14px] text-text-700 mb-2">{app.shopName}</p>
                  </div>
                  {getStatusBadge(app.status)}
                </div>

                {/* Details */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-2 text-[13px]">
                    <svg className="w-4 h-4 text-text-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-mint-600">시급 {formatCurrency(app.wage)}원</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px]">
                    <svg className="w-4 h-4 text-text-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-text-700">{app.location}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-line-200">
                  <span className="text-[12px] text-text-500">
                    지원일: {formatDate(app.appliedDate)}
                  </span>
                  {app.status === 'accepted' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/messages/chat/${app.jobId}`);
                      }}
                      className="px-3 py-1.5 bg-mint-600 text-white rounded-[16px] text-[12px] 
                               font-semibold hover:bg-mint-700 transition-colors"
                    >
                      사장님께 연락하기
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

