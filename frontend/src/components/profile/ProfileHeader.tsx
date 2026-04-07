import React from 'react';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, Edit3, MapPin, Award } from 'lucide-react';
import styles from './ProfileHeader.module.scss';
import primStyles from '@/styles/primitives.module.scss';

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
    <div className={styles.root}>
      <div className={styles.headerRoot}>
        <div className={styles.avatar}>
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className={styles.info}>
          <h1 className={styles.name}>{user.username}</h1>
          <p className={styles.email}>{user.email}</p>
          <div className={styles.badgeRow}>
            <span className={primStyles.roleBadge}>{user.role}</span>
            <span className={styles.trustBadge}>
              Uy tín: {user.trust_score}
            </span>
          </div>
          {user.created_at && (
            <p className={styles.joinedDate}>
              <MapPin className="w-3 h-3" />
              Tham gia {new Date(user.created_at).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>
      </div>
      
      {onEditClick && (
        <div className={styles.editButtonContainer}>
          <Button variant="outline" onClick={onEditClick} style={{ gap: '0.5rem', width: '100%' }}>
            <Edit3 className="w-4 h-4" />
            Chỉnh sửa hồ sơ
          </Button>
        </div>
      )}
    </div>
  );
}
