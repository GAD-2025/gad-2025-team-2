import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import type { StoreData } from '@/api/endpoints';

export type UserMode = 'jobseeker' | 'employer';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  userMode: UserMode;
  // quick access to the employer's main store (if any)
  mainStore: StoreData | null;
  // temporary storage for the signup user id (migrating off localStorage)
  signupUserId: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setUserMode: (mode: UserMode) => void;
  setMainStore: (store: StoreData | null) => void;
  setSignupUserId: (id: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      userMode: 'jobseeker', // 기본값은 구직자 모드
      mainStore: null,
      signupUserId: null,
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },
      clearAuth: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage'); // zustand persist 스토리지도 제거
        // clear signupUserId as well when logging out
        localStorage.removeItem('signup_user_id');
        set({ user: null, token: null, isAuthenticated: false, mainStore: null, signupUserId: null });
      },
      setUserMode: (mode) => {
        set({ userMode: mode });
      },
      setMainStore: (store) => {
        set({ mainStore: store });
      },
      setSignupUserId: (id) => {
        // keep backward compatibility by also setting localStorage
        try {
          if (id === null) {
            localStorage.removeItem('signup_user_id');
          } else {
            localStorage.setItem('signup_user_id', id);
          }
        } catch (e) {
          // ignore localStorage errors
        }
        set({ signupUserId: id });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

