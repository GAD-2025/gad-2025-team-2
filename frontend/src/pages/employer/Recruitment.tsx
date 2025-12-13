import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface Applicant {
  id: string; // seekerId
  applicationId: string;
  name: string;
  age: number;
  nationality: string;
  avatar?: string;
  jobTitle: string;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  languageLevel: string;
  experience: string;
  tags: string[];
}

export const Recruitment = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'reviewed' | 'accepted' | 'rejected'>('all');
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      
      // Get user ID
      const userId = localStorage.getItem('signup_user_id');
      if (!userId) {
        toast.error('로그인이 필요합니다');
        return;
      }

      // Get all applications for this employer using userId
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const applicationsRes = await fetch(`${API_BASE_URL}/applications?userId=${userId}`);
      if (!applicationsRes.ok) {
        throw new Error('지원 내역을 가져올 수 없습니다');
      }
      const applications = await applicationsRes.json();

      // Transform to Applicant format
      const applicantsData: Applicant[] = applications
        .filter((app: any) => app.jobseeker) // Only include apps with jobseeker info
        .map((app: any) => {
          const seeker = app.jobseeker;
          let experience = [];
          try {
            experience = typeof seeker.experience === 'string' 
              ? JSON.parse(seeker.experience || '[]')
              : (seeker.experience || []);
          } catch {
            experience = [];
          }
          
          const expStr = experience.length > 0 
            ? experience.map((e: any) => {
                if (typeof e === 'string') return e;
                return `${e.role || ''} ${e.years || ''}년`.trim();
              }).filter(Boolean).join(', ')
            : '경력 없음';
          
          // Extract tags from preferences or experience
          const tags: string[] = [];
          try {
            const preferences = typeof seeker.preferences === 'string'
              ? JSON.parse(seeker.preferences || '{}')
              : (seeker.preferences || {});
            // Add tags based on preferences if needed
          } catch {}

          return {
            id: app.seekerId, // seekerId로 상세 조회
            applicationId: app.applicationId,
            name: seeker.name || '이름 없음',
            age: 28, // Default age, can be calculated from birthdate if available
            nationality: seeker.nationality || '국적 없음',
            jobTitle: app.job?.title || '공고 제목 없음',
            appliedDate: app.appliedAt || new Date().toISOString(),
            status: app.status === 'applied' ? 'pending' :
                    app.status === 'hired' ? 'accepted' :
                    app.status === 'rejected' ? 'rejected' : 'reviewed',
            languageLevel: seeker.languageLevel || '정보 없음',
            experience: expStr,
            tags: tags
          };
        });

      setApplicants(applicantsData);
    } catch (error) {
      console.error('지원자 목록 로딩 실패:', error);
      toast.error('지원자 목록을 불러오는데 실패했습니다');
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for fallback (remove later)
  const mockApplicants: Applicant[] = [
    {
      id: '1',
      name: '소피아',
      age: 28,
      nationality: '우즈베키스탄',
      jobTitle: '서빙 스태프',
      appliedDate: '2025-01-08',
      status: 'pending',
      languageLevel: 'Lv.2',
      experience: '레스토랑 2년',
      tags: ['영어 가능', '주말 근무 가능']
    },
    {
      id: '2',
      name: '응웬',
      age: 25,
      nationality: '베트남',
      jobTitle: '주방 보조',
      appliedDate: '2025-01-07',
      status: 'reviewed',
      languageLevel: 'Lv.3',
      experience: '요리 경력 3년',
      tags: ['베트남어 원어민', '장기 근무 가능']
    },
    {
      id: '3',
      name: '마리아',
      age: 30,
      nationality: '필리핀',
      jobTitle: '매장 관리',
      appliedDate: '2025-01-06',
      status: 'accepted',
      languageLevel: 'Lv.4',
      experience: '매장 관리 5년',
      tags: ['영어 원어민', '리더십']
    },
    {
      id: '4',
      name: '알렉스',
      age: 27,
      nationality: '미국',
      jobTitle: '서빙 스태프',
      appliedDate: '2025-01-05',
      status: 'rejected',
      languageLevel: 'Lv.1',
      experience: '서빙 경력 1년',
      tags: ['영어 원어민']
    }
  ];

  const filteredApplicants = activeFilter === 'all' 
    ? applicants 
    : applicants.filter(a => a.status === activeFilter);

  const getStatusBadge = (status: Applicant['status']) => {
    switch (status) {
      case 'pending':
        return { label: '검토 대기', bg: 'bg-amber-100', text: 'text-amber-700' };
      case 'reviewed':
        return { label: '검토 완료', bg: 'bg-blue-100', text: 'text-blue-700' };
      case 'accepted':
        return { label: '채용 확정', bg: 'bg-emerald-100', text: 'text-emerald-700' };
      case 'rejected':
        return { label: '불합격', bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  };

  const statusCounts = {
    all: applicants.length,
    pending: applicants.filter(a => a.status === 'pending').length,
    reviewed: applicants.filter(a => a.status === 'reviewed').length,
    accepted: applicants.filter(a => a.status === 'accepted').length,
    rejected: applicants.filter(a => a.status === 'rejected').length
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-white border-b border-line-200 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-[20px] font-bold text-text-900">지원자 관리</h1>
        <p className="text-[13px] text-text-500 mt-1">
          총 {applicants.length}명의 지원자
        </p>
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
            onClick={() => setActiveFilter('pending')}
            className={`px-4 py-2 rounded-[12px] text-[14px] font-medium whitespace-nowrap transition-all ${
              activeFilter === 'pending'
                ? 'bg-mint-600 text-white'
                : 'bg-gray-100 text-text-700 hover:bg-gray-200'
            }`}
          >
            대기 ({statusCounts.pending})
          </button>
          <button
            onClick={() => setActiveFilter('reviewed')}
            className={`px-4 py-2 rounded-[12px] text-[14px] font-medium whitespace-nowrap transition-all ${
              activeFilter === 'reviewed'
                ? 'bg-mint-600 text-white'
                : 'bg-gray-100 text-text-700 hover:bg-gray-200'
            }`}
          >
            검토 완료 ({statusCounts.reviewed})
          </button>
          <button
            onClick={() => setActiveFilter('accepted')}
            className={`px-4 py-2 rounded-[12px] text-[14px] font-medium whitespace-nowrap transition-all ${
              activeFilter === 'accepted'
                ? 'bg-mint-600 text-white'
                : 'bg-gray-100 text-text-700 hover:bg-gray-200'
            }`}
          >
            합격 ({statusCounts.accepted})
          </button>
        </div>
      </div>

      {/* Applicants List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-text-500">불러오는 중...</p>
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-[15px] text-text-500">해당하는 지원자가 없습니다</p>
          </div>
        ) : (
          filteredApplicants.map((applicant) => {
            const statusBadge = getStatusBadge(applicant.status);
            return (
              <div
                key={applicant.applicationId}
                onClick={() => navigate(`/employer/applicant/${applicant.id}`)}
                className="bg-white rounded-[16px] p-4 border border-line-200 
                         hover:border-mint-600/30 hover:shadow-soft transition-all cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-mint-100 to-mint-200 
                               rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                    {applicant.avatar || '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[16px] font-bold text-text-900">
                        {applicant.name}, {applicant.age}세
                      </h3>
                      <span className={`px-2 py-0.5 rounded-[6px] text-[11px] font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <p className="text-[13px] text-text-500">
                      {applicant.nationality} · {applicant.jobTitle}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-text-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Info */}
                <div className="flex items-center gap-4 mb-3 text-[13px] text-text-700">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <span>{applicant.languageLevel}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{applicant.experience}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {applicant.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-mint-100 text-mint-700 rounded-[6px] text-[11px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-line-200">
                  <span className="text-[12px] text-text-500">
                    {new Date(applicant.appliedDate).toLocaleDateString('ko-KR')} 지원
                  </span>
                  {applicant.status === 'pending' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/employer/applicant/${applicant.id}`);
                      }}
                      className="px-3 py-1.5 bg-mint-600 hover:bg-mint-700 text-white 
                               rounded-[8px] text-[12px] font-medium transition-colors"
                    >
                      검토하기
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

