'use client';
import React, { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { AuthModal } from './AuthModal';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Attempt to silently retrieve the user on mount
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      {children}
      {/* Global Auth Modal that pops up over EVERYTHING over the entire tree */}
      <AuthModal />
    </>
  );
}
