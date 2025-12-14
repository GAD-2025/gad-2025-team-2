import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuth';

export function AutoRedirect() {
  const navigate = useNavigate();
  const { setUserMode } = useAuthStore();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const signupUserId = useAuthStore.getState().signupUserId;
      const userId = signupUserId || localStorage.getItem('signup_user_id');
      const savedRole = localStorage.getItem('user_role');
      
      // 가입하지 않은 경우 -> 회원가입 페이지
      if (!userId) {
        navigate('/signup', { replace: true });
        return;
      }

      // 가입한 경우 -> role에 따라 홈으로
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const response = await fetch(`${API_BASE_URL}/auth/signup-user/${userId}`);
        if (!response.ok) {
          // 사용자 정보 없으면 회원가입으로
            try { useAuthStore.getState().setSignupUserId(null); } catch (e) { localStorage.removeItem('signup_user_id'); }
            navigate('/signup', { replace: true });
          return;
        }

        const userData = await response.json();
        const userRole = userData.role || savedRole || 'job_seeker';
        
        // Set user mode based on role
        if (userRole === 'employer') {
          setUserMode('employer');
          navigate('/employer/home', { replace: true });
        } else {
          setUserMode('jobseeker');
          navigate('/jobseeker/home', { replace: true });
        }
      } catch (error) {
        console.error('Failed to check user status:', error);
        // 에러 시 저장된 role로 리다이렉트
        if (savedRole === 'employer') {
          setUserMode('employer');
          navigate('/employer/home', { replace: true });
        } else {
          setUserMode('jobseeker');
          navigate('/jobseeker/home', { replace: true });
        }
      }
    };

    checkAuthAndRedirect();
  }, [navigate, setUserMode]);

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

