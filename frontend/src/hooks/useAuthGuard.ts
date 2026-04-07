import { useAuthStore } from '@/stores/useAuthStore';

/**
 * Auth guard hook: returns a function that checks auth before executing callback.
 * If user is not logged in, opens the login modal instead.
 */
export function useAuthGuard() {
  const { isAuthenticated, setAuthModalOpen } = useAuthStore();

  /** Wrap any action that requires authentication */
  const requireAuth = (callback: () => void) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true, 'login');
      return;
    }
    callback();
  };

  return { requireAuth, isAuthenticated };
}
