import React from 'react';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, Edit3, MapPin, Award } from 'lucide-react';
import styles from '@/styles/primitives.module.scss';

interface ProfileHeaderProps {
  user: {
    username: string;
    email: string;
    role: string;
    trust_score: number;
    created_at?: string;
  };
  onEditClick?: () => void;
}

export function ProfileHeader({ user, onEditClick }: ProfileHeaderProps) {
  return (
    <div>
      <div className={styles.profileHeader}>
        <div className={styles.profileAvatar}>
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className={styles.profileInfo}>
          <h1 className={styles.profileName}>{user.username}</h1>
          <p className={styles.profileEmail}>{user.email}</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
            <span className={styles.roleBadge}>{user.role}</span>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-primary)', backgroundColor: 'rgba(11,87,208,0.1)', padding: '2px 0.5rem', borderRadius: '9999px' }}>
              Uy tín: {user.trust_score}
            </span>
          </div>
          {user.created_at && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
              <MapPin className="w-3 h-3" /> Tham gia từ {new Date(user.created_at).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>
      </div>
      
      {onEditClick && (
        <div style={{ padding: '0 1.5rem 1rem', display: 'flex' }}>
          <Button variant="outline" onClick={onEditClick} style={{ gap: '0.5rem' }}>
            <Edit3 className="w-4 h-4" />
            Chỉnh sửa hồ sơ
          </Button>
        </div>
      )}
    </div>
  );
}
