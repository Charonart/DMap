'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormSection, FormGroup } from '@/components/ui/FormLayout';
import { User, Lock, Save, Loader2, KeyRound } from 'lucide-react';
import styles from './ProfileOverlay.module.scss';
import { useAuthStore } from '@/stores/useAuthStore';

interface SettingsTabProps {
  user: any;
}

export function SettingsTab({ user }: SettingsTabProps) {
  const [username, setUsername] = useState(user?.username || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [nameToast, setNameToast] = useState('');
  const [passToast, setPassToast] = useState('');

  const queryClient = useQueryClient();
  const { checkAuth } = useAuthStore();

  const nameMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.put('/users/profile', { username: username.trim() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user.profile'] });
      checkAuth(); // refetch auth store
      setNameToast('Đã lưu tên hiển thị thành công!');
      setTimeout(() => setNameToast(''), 3000);
    },
    onError: (err: any) => {
      setNameToast(err.response?.data?.message || 'Không thể đổi tên');
      setTimeout(() => setNameToast(''), 3000);
    }
  });

  const passMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.put('/users/profile', { 
        oldPassword, 
        newPassword 
      });
    },
    onSuccess: () => {
      setOldPassword('');
      setNewPassword('');
      setPassToast('Đã đổi mật khẩu thành công!');
      setTimeout(() => setPassToast(''), 3000);
    },
    onError: (err: any) => {
      setPassToast(err.response?.data?.message || 'Mật khẩu cũ không chính xác');
      setTimeout(() => setPassToast(''), 3000);
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem 0' }}>
      
      {/* 1. Update Name */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
          <User className="w-5 h-5" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Thông tin cá nhân</h3>
        </div>
        
        <FormSection>
          <FormGroup label="Tên hiển thị">
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Input 
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
              />
              <Button 
                variant="outline" 
                onClick={() => nameMutation.mutate()}
                disabled={nameMutation.isPending || !username.trim() || username === user?.username}
                style={{ flexShrink: 0 }}
              >
                {nameMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Lưu
              </Button>
            </div>
          </FormGroup>
          {nameToast && <p style={{ fontSize: '0.875rem', color: nameToast.includes('thành công') ? 'var(--color-primary)' : 'var(--color-error)' }}>{nameToast}</p>}
        </FormSection>
      </section>

      {/* 2. Change Password */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-on-surface)' }}>
          <KeyRound className="w-5 h-5" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Bảo mật</h3>
        </div>

        <FormSection>
          <FormGroup label="Mật khẩu hiện tại">
            <Input 
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              placeholder="Nhập mật khẩu cũ..."
              leftIcon={<Lock className="w-4 h-4" />}
            />
          </FormGroup>
          
          <FormGroup label="Mật khẩu mới">
            <Input 
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới..."
              leftIcon={<Lock className="w-4 h-4" />}
            />
          </FormGroup>

          <Button 
            variant="outline"
            onClick={() => passMutation.mutate()}
            disabled={passMutation.isPending || !oldPassword || newPassword.length < 6}
            style={{ width: '100%' }}
          >
            {passMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Đổi mật khẩu'}
          </Button>
          
          {passToast && <p style={{ fontSize: '0.875rem', color: passToast.includes('thành công') ? 'var(--color-primary)' : 'var(--color-error)' }}>{passToast}</p>}
        </FormSection>
      </section>

    </div>
  );
}
