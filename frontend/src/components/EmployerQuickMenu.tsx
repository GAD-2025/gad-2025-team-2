import { useNavigate } from 'react-router-dom';

interface MenuItem {
  id: string;
  icon: JSX.Element;
  label: string;
  path: string;
}

export const EmployerQuickMenu = () => {
  const navigate = useNavigate();
  
  const menuItems: MenuItem[] = [
    { 
      id: 'new-posting', 
      icon: (
        <svg className="w-5 h-5 text-mint-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ), 
      label: '새 공고 등록',
      path: '/employer/job-create'
    },
    { 
      id: 'applicants', 
      icon: (
        <svg className="w-5 h-5 text-mint-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ), 
      label: '지원자 확인',
      path: '/recruitment'
    },
    { 
      id: 'search', 
      icon: (
        <svg className="w-5 h-5 text-mint-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ), 
      label: '인재 검색',
      path: '/filters/applicant'
    },
    { 
      id: 'profile', 
      icon: (
        <svg className="w-5 h-5 text-mint-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ), 
      label: '우리 매장 프로필',
      path: '/profile/edit'
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 px-8">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => navigate(item.path)}
          className="flex flex-col items-center justify-center h-[74px] bg-white rounded-card-sm 
                   border border-line-200 hover:border-mint-600 transition-all active:scale-95"
        >
          <div className="w-7 h-7 bg-mint-100 rounded-full flex items-center justify-center mb-2">
            {item.icon}
          </div>
          <span className="text-[14px] font-medium text-text-900">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

