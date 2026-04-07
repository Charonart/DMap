'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/useAuthStore';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ContributionsList } from '@/components/profile/ContributionsList';
import { SavedPlacesList } from '@/components/profile/SavedPlacesList';
import { LeaderboardTab } from '@/components/profile/LeaderboardTab';
import { SettingsTab } from '@/components/profile/SettingsTab';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from './ProfileOverlay.module.scss';
import { cn } from '@/lib/utils';

export function ProfileOverlay() {
  const { isProfileOpen, setProfileOpen, user } = useAuthStore();

  // Fetch fresh profile data when overlay opens
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['user.profile'],
    queryFn: async () => {
      const res = await axiosInstance.get('/users/profile');
      return res.data.data;
    },
    enabled: isProfileOpen && !!user,
    staleTime: 30 * 1000, // refetch after 30s
  });

  if (!isProfileOpen || !user) return null;

  // Use fresh profile data, fall back to auth store user
  const displayUser = profileData || user;

  return (
    <div className={styles.overlayRoot}>
      {/* Top Header Row of Overlay */}
      <div className={styles.header}>
        <h2 className={styles.title}>Hồ sơ cá nhân</h2>
        <Button variant="ghost" size="icon" onClick={() => setProfileOpen(false)}>
          <X className="w-6 h-6 text-on-surface-variant" />
        </Button>
      </div>

      {/* Main Content Scrollable Area */}
      <div className={cn(styles.scrollArea, "no-scrollbar")}>
        <div className={styles.contentWrapper}>
          <section className={styles.cardSection}>
            {isLoading ? (
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <Skeleton style={{ width: '4rem', height: '4rem', borderRadius: '9999px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <Skeleton style={{ width: '60%', height: '1.25rem', marginBottom: '0.5rem' }} />
                    <Skeleton style={{ width: '80%', height: '0.875rem' }} />
                  </div>
                </div>
              </div>
            ) : (
              <ProfileHeader user={displayUser} />
            )}

            <div className={styles.tabsContainer}>
              <Tabs defaultValue="contributions" className="w-full">
                <TabsList className={styles.tabsList}>
                  <TabsTrigger value="contributions" className={styles.tabTrigger}>Đóng góp của tôi</TabsTrigger>
                  <TabsTrigger value="saved" className={styles.tabTrigger}>Đã lưu</TabsTrigger>
                  <TabsTrigger value="leaderboard" className={styles.tabTrigger}>Bảng vàng</TabsTrigger>
                  <TabsTrigger value="settings" className={styles.tabTrigger}>Cài đặt</TabsTrigger>
                </TabsList>
                
                <TabsContent value="contributions" className={styles.tabContent}>
                  <ContributionsList />
                </TabsContent>
                
                <TabsContent value="saved" className={styles.tabContent}>
                  <SavedPlacesList />
                </TabsContent>
                
                <TabsContent value="leaderboard" className={styles.tabContent}>
                  <LeaderboardTab />
                </TabsContent>

                <TabsContent value="settings" className={styles.tabContent}>
                  <SettingsTab user={displayUser} />
                </TabsContent>
              </Tabs>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
