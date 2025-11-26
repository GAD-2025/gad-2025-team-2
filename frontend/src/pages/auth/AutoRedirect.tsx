import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function AutoRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const userId = localStorage.getItem('signup_user_id');
      
      // 가입하지 않은 경우 -> 회원가입 페이지
      if (!userId) {
        navigate('/signup', { replace: true });
        return;
      }

      // 가입한 경우 -> role에 따라 홈으로
      try {
        const response = await fetch(`http://localhost:8000/auth/signup-user/${userId}`);
        if (!response.ok) {
          // 사용자 정보 없으면 회원가입으로
          localStorage.removeItem('signup_user_id');
          navigate('/signup', { replace: true });
          return;
        }

        const userData = await response.json();
        
        if (userData.role === 'employer') {
          navigate('/employer/home', { replace: true });
        } else {
          navigate('/jobseeker/home', { replace: true });
        }
      } catch (error) {
        console.error('Failed to check user status:', error);
        // 에러 시 회원가입으로
        navigate('/signup', { replace: true });
      }
    };

    checkAuthAndRedirect();
  }, [navigate]);

  // 로딩 중 표시
  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary-mint border-t-transparent"></div>
        <p className="text-[16px] text-gray-600">로딩 중...</p>
      </div>
    </div>
  );
}

