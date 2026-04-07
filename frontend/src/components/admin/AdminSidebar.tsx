'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MapPin, BadgeCheck, Flag, Users, ArrowLeft } from 'lucide-react';
import styles from '@/app/admin/AdminLayout.module.scss';
import clsx from 'clsx';

const NAV_ITEMS = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/admin/pois', label: 'Duyệt trạm Map', icon: MapPin },
  { href: '/admin/claims', label: 'Xác nhận Chủ sở hữu', icon: BadgeCheck },
  { href: '/admin/reports', label: 'Báo cáo vi phạm', icon: Flag },
  { href: '/admin/users', label: 'Quản lý thành viên', icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div style={{ padding: '0.25rem', borderRadius: '0.75rem', display: 'flex', width: '2.5rem', height: '2.5rem', overflow: 'hidden' }}>
          <img src="/logo.png" alt="DMap Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>DMap Admin</span>
      </div>

      <nav className={styles.sidebarNav}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={clsx(styles.navLink, isActive && styles.active)}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-outline-variant)' }}>
        <Link 
          href="/"
          className={styles.navLink}
          style={{ color: 'var(--color-error)' }}
        >
          <ArrowLeft className="w-5 h-5" />
          Rời khỏi Admin
        </Link>
      </div>
    </aside>
  );
}
