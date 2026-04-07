'use client';
import React, { useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { UserCircle, LogOut, Bookmark, User as UserIcon, Medal, ShieldCheck } from 'lucide-react';
import styles from './UserMenu.module.scss';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function UserMenu() {
  const { user, isAuthenticated, setAuthModalOpen, setProfileOpen, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <button 
        className={cn(styles.avatarBtn, styles.avatarLogin)}
        onClick={() => setAuthModalOpen(true, 'login')}
        aria-label="Đăng nhập"
      >
        <UserCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className={styles.wrapper}>
      <button 
        className={cn(styles.avatarBtn, styles.avatarUser)}
        onClick={() => setOpen(!open)}
        aria-label="Menu người dùng"
      >
        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
      </button>

      {open && (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} />
          
          <div className={styles.dropdownCard}>
            <div className={styles.dropdownHeader}>
              <p className={styles.userName}>{user?.username}</p>
              <p className={styles.userEmail}>{user?.email}</p>
              <span className={styles.roleBadge}>{user?.role}</span>
            </div>
            
            <div className={styles.menuGroup}>
              <button className={styles.menuItem} onClick={() => { setProfileOpen(true); setOpen(false); }}>
                <UserIcon className="w-4 h-4" style={{ color: 'var(--color-on-surface-variant)' }} />
                Hồ sơ cá nhân
              </button>
              <button className={styles.menuItem} onClick={() => setOpen(false)}>
                <Bookmark className="w-4 h-4" style={{ color: 'var(--color-on-surface-variant)' }} />
                Địa điểm đã lưu
              </button>
              <button className={styles.menuItem} onClick={() => setOpen(false)}>
                <Medal className="w-4 h-4" style={{ color: 'var(--color-on-surface-variant)'}} />
                Bảng Thành Tích
              </button>
            </div>
            
            {(user?.role === 'admin' || user?.role === 'moderator') && (
              <div className={cn(styles.menuGroup, styles.menuGroupBorder)}>
                <button className={styles.menuItem} onClick={() => { setOpen(false); router.push('/admin'); }}>
                  <ShieldCheck className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                  <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Khu vực Quản trị (Admin)</span>
                </button>
              </div>
            )}
            
            <div className={cn(styles.menuGroup, styles.menuGroupBorder)}>
              <button 
                className={cn(styles.menuItem, styles.menuItemDanger)}
                onClick={() => { logout(); setOpen(false); }}
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
