'use client';
import React, { useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import axiosInstance from '@/lib/axios';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import styles from '@/styles/primitives.module.scss';

export function RegisterForm({ onSuccess, onSwitchToLogin }: { onSuccess?: () => void, onSwitchToLogin?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { checkAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      await axiosInstance.post('/auth/register', { email, password, username });
      await checkAuth();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrorMsg(err.response.data.errors.map((e: any) => e.msg).join(', '));
      } else {
        setErrorMsg(err.response?.data?.message || 'Đăng ký thất bại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formStack}>
      <div className={styles.fieldGroup}>
        <Label htmlFor="reg-email">Email</Label>
        <Input 
          id="reg-email" 
          type="email" 
          placeholder="email@example.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          leftIcon={<Mail className="w-4 h-4" />}
        />
      </div>

      <div className={styles.fieldGroup}>
        <Label htmlFor="reg-username">Tên hiển thị</Label>
        <Input 
          id="reg-username" 
          type="text" 
          placeholder="DMap Explorer" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          leftIcon={<User className="w-4 h-4" />}
        />
      </div>

      <div className={styles.fieldGroup}>
        <Label htmlFor="reg-password">Mật khẩu</Label>
        <Input 
          id="reg-password" 
          type="password" 
          placeholder="Tối thiểu 6 ký tự" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          leftIcon={<Lock className="w-4 h-4" />}
        />
      </div>

      {errorMsg && <p className={styles.errorText}>{errorMsg}</p>}

      <Button type="submit" variant="primary" style={{width:'100%'}} disabled={loading}>
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Đăng Ký"}
      </Button>

      <div className={styles.switchText}>
        Đã có tài khoản?{' '}
        <button type="button" onClick={onSwitchToLogin} className={styles.switchLink}>
          Đăng nhập
        </button>
      </div>
    </form>
  );
}
