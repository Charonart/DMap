'use client';
import { useMapStore } from '@/hooks/useMapStore';
import { MapPin, Navigation, Flag } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import styles from './MapContextMenu.module.scss';
import { cn } from '@/lib/utils';

export function MapContextMenu() {
  const { contextMenu, setContextMenu } = useMapStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    if (contextMenu) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [contextMenu, setContextMenu]);

  if (!contextMenu) return null;

  return (
    <div 
      ref={menuRef}
      className={styles.menu}
      style={{ left: contextMenu.x, top: contextMenu.y }}
    >
      <div className={styles.coordHeader}>
        <p className={styles.coordLabel}>Tọa độ đã chọn</p>
        <p className={styles.coordValue}>
          {contextMenu.lat.toFixed(5)}, {contextMenu.lng.toFixed(5)}
        </p>
      </div>

      <button className={styles.menuItem}
         onClick={() => {
            const { isAuthenticated, setAuthModalOpen } = useAuthStore.getState();
            if (!isAuthenticated) {
              setAuthModalOpen(true, 'login');
            } else {
              const { setIsCreatingPOI } = useMapStore.getState();
              setIsCreatingPOI(true, [contextMenu.lng, contextMenu.lat]);
            }
            setContextMenu(null);
         }}
      >
        <MapPin className="w-4 h-4" />
        <span>Thêm địa điểm tại đây</span>
      </button>

      <button className={styles.menuItem}
         onClick={() => setContextMenu(null)}
      >
        <Navigation className="w-4 h-4" />
        <span>Đo khoảng cách</span>
      </button>

      <button className={cn(styles.menuItem, styles.danger)}
         onClick={() => setContextMenu(null)}
      >
        <Flag className="w-4 h-4" />
        <span>Báo cáo vấn đề dữ liệu</span>
      </button>
    </div>
  );
}
