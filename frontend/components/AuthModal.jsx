'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/components/AuthModal.module.css';

export default function AuthModal({ onClose }) {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', username: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      login(data.user);
      if (onClose) onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <div className={styles.header}>
          <h2 id="auth-title" className={styles.title}>{isLogin ? 'Đăng Nhập' : 'Đăng Ký'}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          
          {!isLogin && (
            <div className={styles.formGroup}>
              <label htmlFor="username">Tên hiển thị</label>
              <input 
                id="username" type="text" name="username" 
                value={formData.username} onChange={handleChange} 
                required placeholder="Tên của bạn"
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input 
              id="email" type="email" name="email" 
              value={formData.email} onChange={handleChange} 
              required placeholder="Email của bạn"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Mật khẩu</label>
            <input 
              id="password" type="password" name="password" 
              value={formData.password} onChange={handleChange} 
              required placeholder="Nhập mật khẩu"
            />
          </div>

          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? 'Đang tải...' : (isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản')}
          </button>

          <p className={styles.toggleText}>
            {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button type="button" className={styles.btnToggle} onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
