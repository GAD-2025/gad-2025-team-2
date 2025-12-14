import { useNavigate } from 'react-router-dom';

interface MenuItem {
  id: string;
  icon: JSX.Element;
  label: string;
  path: string;
}

export const QuickMenuGrid = () => {
  const navigate = useNavigate();
  
  const menuItems: MenuItem[] = [
    { 
      id: 'high-wage', 
      icon: (
        <svg className="w-5 h-5 text-mint-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ), 
      label: '높은 시급',
      path: '/jobs?sort=high-wage'
    },
    { 
      id: 'popular', 
      icon: (
        // star icon for '인기 공고'
        <svg className="w-5 h-5 text-mint-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ), 
      label: '인기 공고',
      // navigate to jobs with a preset query for popularity sorting
      path: '/jobs?sort=popular'
    },
    { 
      id: 'trusted', 
      icon: (
        // outline heart icon for '신뢰 공고' (unfilled to match other icons)
        <svg className="w-5 h-5 text-mint-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.682l-7.682-7.682a4.5 4.5 0 010-6.364z" />
        </svg>
      ), 
      label: '신뢰 공고',
      // navigate to jobs sorted/filtered by trusted companies
      path: '/jobs?sort=trusted'
    },
    { 
      id: 'urgent', 
      icon: (
        <svg className="w-5 h-5 text-mint-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ), 
      label: '단기 알바',
      path: '/jobs?sort=short-term'
    },
    { 
      id: 'my-applications', 
      icon: (
        <svg className="w-5 h-5 text-mint-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ), 
      label: '지원 내역',
      path: '/my-applications'
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 px-8">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            // derive preset (sort) from menu item id or path
            const preset = item.id;
            navigate(
              item.path + (item.path.includes('?') ? '&from=quick' : '?from=quick'),
              { state: { from: 'quick', preset } }
            );
          }}
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

