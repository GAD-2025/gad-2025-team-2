import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuth';

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { userMode } = useAuthStore();

  // 모드에 따라 홈 경로 변경
  const homePath = userMode === 'employer' ? '/employer/home' : '/jobseeker/home';

  // 모드에 따라 다른 탭 표시
  const tabs = userMode === 'employer' 
    ? [
        { id: 'home', label: '홈', icon: '🏠', path: homePath },
        { id: 'recruitment', label: '채용', icon: '💼', path: '/recruitment' },
        { id: 'job-management', label: '공고관리', icon: '📋', path: '/job-management' },
        { id: 'mypage', label: '마이', icon: '👤', path: '/mypage' },
      ]
    : [
        { id: 'home', label: '홈', icon: '🏠', path: homePath },
        { id: 'jobs', label: '공고', icon: '💼', path: '/jobs' },
        { id: 'learning', label: '학습', icon: '📚', path: '/learning' },
        { id: 'network', label: '네트워킹', icon: '🌐', path: '/network' },
        { id: 'mypage', label: '마이', icon: '👤', path: '/mypage' },
      ];

  const isActive = (tabId: string, path: string) => {
    if (tabId === 'home') {
      // 홈 탭은 현재 모드에 맞는 홈 페이지에 있을 때 활성화
      return location.pathname.startsWith('/jobseeker/home') || location.pathname.startsWith('/employer/home');
    }
    return location.pathname.startsWith(path);
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
              <span className="text-[22px]">{tab.icon}</span>
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

