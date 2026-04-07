'use client';
import React from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export function AuthModal() {
  const { isAuthModalOpen, authModalView, setAuthModalOpen } = useAuthStore();

  const isLogin = authModalView === 'login';

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => setAuthModalOpen(open, authModalView)}>
      <DialogContent>
        <DialogHeader style={{ marginBottom: '1rem' }}>
          <DialogTitle style={{ textAlign: 'center', color: 'var(--color-primary)' }}>
            {isLogin ? 'Đăng nhập DMap' : 'Tạo tài khoản mới'}
          </DialogTitle>
          <DialogDescription style={{ textAlign: 'center' }}>
            {isLogin 
              ? 'Chào mừng bạn quay lại. Hãy đăng nhập để tiếp tục đóng góp!'
              : 'Gia nhập cộng đồng DMap để đánh giá và cảnh báo điểm đến.'}
          </DialogDescription>
        </DialogHeader>

        {isLogin ? (
          <LoginForm 
            onSuccess={() => setAuthModalOpen(false)} 
            onSwitchToRegister={() => setAuthModalOpen(true, 'register')}
          />
        ) : (
          <RegisterForm 
            onSuccess={() => setAuthModalOpen(false)} 
            onSwitchToLogin={() => setAuthModalOpen(true, 'login')}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
