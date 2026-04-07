'use client';
import React from 'react';
import { UserMenu } from '@/components/layout/UserMenu';
import styles from './FloatingHeader.module.scss';

export function FloatingHeader({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <div className={styles.logoSlot}>
        <img src="/logo.png" alt="DMap Logo" className={styles.logo} />
      </div>

      {/* The SearchBar component gets injected here */}
      <div className={styles.searchSlot}>
        {children}
      </div>

      <div className={styles.userSlot}>
        <UserMenu />
      </div>
    </>
  );
}
