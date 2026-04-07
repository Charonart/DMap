'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { UserMenu } from '@/components/layout/UserMenu';
import { Loader2 } from 'lucide-react';
import styles from './AdminLayout.module.scss';
import titleStyles from '@/styles/primitives.module.scss';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isInitializing, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Only redirect if we have finished checking auth and user is definitely not admin
    if (!isInitializing) {
      if (!isAuthenticated || !user) {
        router.replace('/');
      } else if (user.role !== 'admin' && user.role !== 'moderator') {
        router.replace('/');
      }
    }
  }, [isInitializing, isAuthenticated, user, router]);

  // Show loading screen while auth is verifying
  if (isInitializing || !isAuthenticated || (user?.role !== 'admin' && user?.role !== 'moderator')) {
    return (
      <div className={styles.loadingScreen}>
        <Loader2 className="w-10 h-10 animate-spin" />
        <h2 className={titleStyles.titleLarge}>Đang kiểm tra quyền hạn...</h2>
      </div>
    );
  }

  return (
    <div className={styles.adminRoot}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <header className={styles.headerBar}>
          <UserMenu />
        </header>
        <main className={styles.contentBody}>
          {children}
        </main>
      </div>
    </div>
  );
}
