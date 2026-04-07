'use client';
import React from 'react';
import { Menu } from 'lucide-react';
import { UserMenu } from '@/components/layout/UserMenu';
import styles from './FloatingHeader.module.scss';

export function FloatingHeader({ children }: { children?: React.ReactNode }) {
  return (
    <>
      {/* Left Hamburger Menu for Mobile / Main Navigation */}
      <button className={styles.menuBtn} aria-label="Menu">
        <Menu className="w-5 h-5 z-999999" />
      </button>
      
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
