import { create } from 'zustand';
import axiosInstance from '@/lib/axios';

interface User {
  id: string;
  email: string;
  username: string;
  role: 'member' | 'moderator' | 'admin';
  status: 'active' | 'banned';
  trust_score: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean; // True when app first loads to check session
  isAuthModalOpen: boolean;
  authModalView: 'login' | 'register';
  isProfileOpen: boolean;
  setUser: (user: User | null) => void;
  setAuthModalOpen: (isOpen: boolean, view?: 'login' | 'register') => void;
  setProfileOpen: (isOpen: boolean) => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  isAuthModalOpen: false,
  authModalView: 'login',
  isProfileOpen: false,

  setAuthModalOpen: (isOpen, view = 'login') => set({ isAuthModalOpen: isOpen, authModalView: view }),
  setProfileOpen: (isOpen) => set({ isProfileOpen: isOpen }),

  setUser: (user) => set({ user, isAuthenticated: !!user, isInitializing: false }),

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/auth/me');
      // Backend returns { status: 'success', data: { user: {...} } }
      if (res.data?.data?.user) {
        set({ user: res.data.data.user, isAuthenticated: true, isInitializing: false });
      } else {
        set({ user: null, isAuthenticated: false, isInitializing: false });
      }
    } catch (error) {
      // 401 or network error
      set({ user: null, isAuthenticated: false, isInitializing: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.warn('Logout failed or network err');
    } finally {
      // Clear local state anyway
      set({ user: null, isAuthenticated: false });
    }
  }
}));
