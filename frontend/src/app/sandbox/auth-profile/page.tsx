import React from 'react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ContributionsList } from '@/components/profile/ContributionsList';
import { SavedPlacesList } from '@/components/profile/SavedPlacesList';
import { LeaderboardTab } from '@/components/profile/LeaderboardTab';
import { AuthModal } from '@/components/auth/AuthModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

export default function AuthProfileSandbox() {
  const mockUser = {
    username: 'DMap_Explorer_99',
    email: 'explorer99@gmail.com',
    role: 'member',
    trust_score: 85,
    created_at: '2026-01-15T00:00:00.000Z'
  };

  return (
    <div className="min-h-screen bg-surface p-4 md:p-8">
      {/* Global Auth Modal will be hidden by default but initialized */}
      <AuthModal />

      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-h1 mb-2">User Profile & Auth UI</h1>
          <p className="text-body text-on-surface-variant">Sandbox để kiểm tra màn hình cá nhân và Leaderboard.</p>
        </div>

        {/* Cấu trúc Profile Page */}
        <section className="bg-surface-container-lowest rounded-2xl shadow-m3-sm overflow-hidden border border-outline/10">
          
          <ProfileHeader user={mockUser} />

          <div className="p-6 pt-0">
            <Tabs defaultValue="contributions" className="w-full">
              <TabsList className="w-full flex">
                <TabsTrigger value="contributions" className="flex-1">Đóng góp của tôi</TabsTrigger>
                <TabsTrigger value="saved" className="flex-1">Đã lưu</TabsTrigger>
                <TabsTrigger value="leaderboard" className="flex-1">Bảng vàng</TabsTrigger>
              </TabsList>
              
              <TabsContent value="contributions" className="mt-6">
                <ContributionsList />
              </TabsContent>
              
              <TabsContent value="saved" className="mt-6">
                <SavedPlacesList />
              </TabsContent>
              
              <TabsContent value="leaderboard" className="mt-6">
                <LeaderboardTab />
              </TabsContent>
            </Tabs>
          </div>
        </section>

      </div>
    </div>
  );
}
