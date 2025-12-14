import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuth';
import { useState, useEffect } from 'react';

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { userMode } = useAuthStore();
  const [unreadInterviewCount, setUnreadInterviewCount] = useState(0);

  // 모드에 따라 홈 경로 변경
  const homePath = userMode === 'employer' ? '/employer/home' : '/jobseeker/home';

  // 모드에 따라 다른 탭 표시
  const tabs = userMode === 'employer' 
    ? [
        { 
          id: 'home', 
          label: '홈', 
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ), 
          path: homePath 
        },
        { 
          id: 'recruitment', 
          label: '채용', 
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.564 23.564 0 0112 15c-3.248 0-6.326-.749-9-2.255M15 7a2 2 0 11-4 0 2 2 0 014 0zm-5 4a2 2 0 11-4 0 2 2 0 014 0zm9-2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ), 
          path: '/recruitment' 
        },
        { 
          id: 'job-management', 
          label: '공고관리', 
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          ), 
          path: '/job-management' 
        },
        { 
          id: 'mypage', 
          label: '마이', 
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ), 
          path: '/mypage' 
        },
      ]
    : [
        { 
          id: 'home', 
          label: '홈', 
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ), 
          path: homePath 
        },
        { 
          id: 'jobs', 
          label: '공고', 
          icon: (
            <div className="relative">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              {unreadInterviewCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-[8px] text-white font-bold">{unreadInterviewCount > 9 ? '9+' : unreadInterviewCount}</span>
                </span>
              )}
            </div>
          ), 
          path: '/jobs' 
        },
        { 
          id: 'learning', 
          label: '학습', 
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ), 
          path: '/learning' 
        },
        { 
          id: 'network', 
          label: '네트워킹', 
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="4" r="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="4" cy="12" r="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="20" cy="12" r="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="20" r="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              
              <line x1="12" y1="6" x2="12" y2="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="12" y1="14" x2="12" y2="18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="6" y1="12" x2="10" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="14" y1="12" x2="18" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ),
          path: '/network' 
        },        
        { 
          id: 'mypage', 
          label: '마이', 
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ), 
          path: '/mypage' 
        },
      ];

  const isActive = (tabId: string, path: string) => {
    const isOnHomePage = location.pathname === '/jobseeker/home' || location.pathname === '/employer/home' || 
                         location.pathname.startsWith('/jobseeker/home/') || location.pathname.startsWith('/employer/home/');
    
    if (tabId === 'home') {
      // 홈 탭은 현재 모드에 맞는 홈 페이지에 있을 때만 활성화
      return isOnHomePage;
    }
    
    // 홈 페이지에 있을 때는 다른 탭들이 활성화되지 않도록
    if (isOnHomePage) {
      return false;
    }
    
    // 홈 페이지가 아닐 때는 일반적인 경로 매칭 로직 사용
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // 지원자 상세 페이지에서는 내비게이션 바 숨기기
  const shouldHideNav = location.pathname.startsWith('/employer/applicant/') || 
                        location.pathname.startsWith('/employer/applicants/') ||
                        (location.pathname.startsWith('/applicant/') && userMode === 'employer');

  // 구직자 모드일 때 면접 제안 알림 개수 확인
  useEffect(() => {
    if (userMode === 'jobseeker') {
      const checkUnreadInterviews = () => {
        const signupUserId = useAuthStore.getState().signupUserId;
        const userId = signupUserId || localStorage.getItem('signup_user_id');
        if (!userId) {
          setUnreadInterviewCount(0);
          return;
        }

        // localStorage에서 모든 면접 제안 키 찾기
        let count = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('interview_proposal_')) {
            try {
              const proposal = JSON.parse(localStorage.getItem(key) || '{}');
              if (proposal && !proposal.isRead && proposal.status === 'pending') {
                count++;
              }
            } catch (e) {
              // 파싱 실패 시 무시
            }
          }
        }
        setUnreadInterviewCount(count);
      };

      checkUnreadInterviews();
      // 주기적으로 확인 (5초마다)
      const interval = setInterval(checkUnreadInterviews, 5000);
      // 페이지 포커스 시에도 확인
      const handleFocus = () => checkUnreadInterviews();
      window.addEventListener('focus', handleFocus);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [userMode, location.pathname]);

  if (shouldHideNav) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-100 z-40" style={{ paddingBottom: '34px' }}>
      <div className="mx-auto max-w-[480px] bg-white border-t border-line-200 flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const active = isActive(tab.id, tab.path);
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`
                flex flex-col items-center justify-center flex-1 h-full gap-1
                transition-colors
                ${active ? 'text-mint-600' : 'text-text-500'}
              `}
              aria-label={tab.label}
            >
              <div className="w-6 h-6 flex items-center justify-center relative">
                {tab.icon}
              </div>
              <span className={`text-[10px] ${active ? 'font-semibold' : 'font-regular'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

