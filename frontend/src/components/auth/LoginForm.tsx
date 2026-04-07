'use client';
import React, { useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import axiosInstance from '@/lib/axios';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Mail, Lock, Loader2 } from 'lucide-react';
import styles from '@/styles/primitives.module.scss';

export function LoginForm({ onSuccess, onSwitchToRegister }: { onSuccess?: () => void, onSwitchToRegister?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { checkAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      await axiosInstance.post('/auth/login', { email, password });
      await checkAuth();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formStack}>
      <div className={styles.fieldGroup}>
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="email@example.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          leftIcon={<Mail className="w-4 h-4" />}
        />
      </div>

      <div className={styles.fieldGroup}>
        <Label htmlFor="password">Mật khẩu</Label>
        <Input 
          id="password" 
          type="password" 
          placeholder="••••••••" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          leftIcon={<Lock className="w-4 h-4" />}
        />
      </div>

      {errorMsg && <p className={styles.errorText}>{errorMsg}</p>}

      <Button type="submit" variant="primary" style={{width:'100%'}} disabled={loading}>
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Đăng Nhập"}
      </Button>

      <div className={styles.switchText}>
        Chưa có tài khoản?{' '}
        <button type="button" onClick={onSwitchToRegister} className={styles.switchLink}>
          Đăng ký ngay
        </button>
      </div>
    </form>
  );
}
