import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuth';

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { userMode } = useAuthStore();

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
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
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
              <div className="w-6 h-6 flex items-center justify-center">
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

