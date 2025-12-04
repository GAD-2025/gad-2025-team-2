import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

export type UserMode = 'jobseeker' | 'employer';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  userMode: UserMode;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setUserMode: (mode: UserMode) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      userMode: 'jobseeker', // 기본값은 구직자 모드
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },
      clearAuth: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage'); // zustand persist 스토리지도 제거
        set({ user: null, token: null, isAuthenticated: false });
      },
      setUserMode: (mode) => {
        set({ userMode: mode });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

