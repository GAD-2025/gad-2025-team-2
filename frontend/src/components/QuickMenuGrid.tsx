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
        // heart icon for '신뢰 공고'
        <svg className="w-5 h-5 text-mint-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" fill="currentColor" />
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

