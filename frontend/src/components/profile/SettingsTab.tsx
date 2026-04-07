'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormSection, FormGroup } from '@/components/ui/FormLayout';
import { User, Lock, Save, Loader2, KeyRound } from 'lucide-react';
import styles from './SettingsTab.module.scss';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';

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
      checkAuth();
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
    <div className={styles.root}>
      
      {/* 1. Update Name */}
      <section className={styles.section}>
        <div className={cn(styles.sectionHeader, styles.primary)}>
          <User className="w-5 h-5" />
          <h3>Thông tin cá nhân</h3>
        </div>
        
        <FormSection>
          <FormGroup label="Tên hiển thị">
            <div className={styles.inputGroup}>
              <Input 
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
              />
              <Button 
                variant="outline" 
                onClick={() => nameMutation.mutate()}
                disabled={nameMutation.isPending || !username.trim() || username === user?.username}
              >
                {nameMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Lưu
              </Button>
            </div>
          </FormGroup>
          {nameToast && (
            <p className={cn(styles.toast, nameToast.includes('thành công') ? styles.success : styles.error)}>
              {nameToast}
            </p>
          )}
        </FormSection>
      </section>

      {/* 2. Change Password */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <KeyRound className="w-5 h-5" />
          <h3>Bảo mật</h3>
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
          
          {passToast && (
            <p className={cn(styles.toast, passToast.includes('thành công') ? styles.success : styles.error)}>
              {passToast}
            </p>
          )}
        </FormSection>
      </section>

    </div>
  );
}
