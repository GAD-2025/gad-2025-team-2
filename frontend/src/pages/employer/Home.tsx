import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { SearchBar } from '@/components/SearchBar';
import { Section } from '@/components/Section';
import { ApplicantCard } from '@/components/ApplicantCard';
import { QuickMenuGrid } from '@/components/QuickMenuGrid';
import { GuideCard } from '@/components/GuideCard';
import { usersAPI } from '@/api/endpoints';
import type { JobSeeker } from '@/types';

export const EmployerHome = () => {
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState<JobSeeker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true);
        // For now, use empty array until applicants API is ready
        // TODO: Implement applicants API endpoint
        setApplicants([]);
        console.log('Employer home loaded');
      } catch (error) {
        console.error('지원자 로딩 오류:', error);
        toast.error('데이터를 불러오는데 실패했습니다');
        setApplicants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, []);

  const quickMenuItems = [
    { id: 'new-posting', icon: '📝', label: '새 공고 등록', iconBg: 'bg-mint-100' },
    { id: 'applicants', icon: '📍', label: '지원자 확인', iconBg: 'bg-mint-100' },
    { id: 'interview', icon: '⭐', label: '인재 검색', iconBg: 'bg-mint-100' },
    { id: 'profile', icon: '⚡', label: '우리 매장 프로필', iconBg: 'bg-mint-100' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-primary-mint px-4 pt-3 pb-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white text-[22px] font-bold">WorkFair</h1>
          <button className="text-white" aria-label="Notifications">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
        <SearchBar placeholder="이름, 국적, 비자로 검색..." />
      </header>

      {/* AI Recommendations */}
      <Section 
        title="고용주님을 위한 AI 맞춤 인재 추천" 
        icon="📌"
        action={
          <button className="text-text-secondary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        }
      >
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-hide">
          {applicants.map((applicant) => (
            <ApplicantCard key={applicant.id} applicant={applicant} variant="featured" />
          ))}
        </div>
      </Section>

      {/* Quick Menu */}
      <Section title="빠른 메뉴" icon="🔍">
        <div className="grid grid-cols-2 gap-3 px-4">
          {quickMenuItems.map((item) => (
            <button
              key={item.id}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-card border border-border hover:border-primary-mint transition-all"
            >
              <div className={`w-12 h-12 ${item.iconBg} rounded-full flex items-center justify-center text-2xl mb-2`}>
                {item.icon}
              </div>
              <span className="text-[14px] font-medium text-text-primary">{item.label}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* We Match Applicants List */}
      <Section title="우리 매장 지원자 목록" icon="🔎">
        <div className="px-4 space-y-3">
          {applicants.map((applicant) => (
            <ApplicantCard key={applicant.id} applicant={applicant} />
          ))}
        </div>
      </Section>

      {/* Guide cards */}
      <Section title="생활 꿀팁 & 필수 가이드" icon="🧭">
        <div className="flex gap-3 overflow-x-auto px-4 pb-6 snap-x snap-mandatory scrollbar-hide">
          <GuideCard
            title="외국인 채용 시 꼭 알아야 할"
            description="필수 가이드"
            image=""
            emoji="💼"
          />
          <GuideCard
            title="외국인 직원 4대 보험 및"
            description="세금 안내"
            image=""
            emoji="📋"
          />
        </div>
      </Section>
    </div>
  );
};



