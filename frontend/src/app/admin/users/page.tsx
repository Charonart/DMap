'use client';
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader2, ShieldCheck, Mail, ShieldAlert, Lock, Unlock } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === 'admin';

  const { data, isLoading } = useQuery({
    queryKey: ['admin.users'],
    queryFn: async () => {
      const res = await axiosInstance.get('/admin/users');
      return res.data.data;
    },
    enabled: isAdmin // only fetch if admin
  });

  const banMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string | number, status: 'active' | 'banned' }) => {
      await axiosInstance.put(`/admin/users/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.users'] });
      queryClient.invalidateQueries({ queryKey: ['admin.stats'] });
    }
  });

  if (!isAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', color: 'var(--color-outline)' }}>
        <ShieldAlert className="w-16 h-16 mb-4" />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-on-surface)' }}>Quyền truy cập bị từ chối</h2>
        <p>Tính năng quản lý người dùng chỉ dành cho SuperAdmin.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const users = data || [];

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Quản lý thành viên</h1>
      <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: '2rem' }}>
        Theo dõi và quản lý tài khoản người dùng, cấp quyền, khóa tài khoản chống phá hoại.
      </p>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {users.map((user: any) => (
          <Card key={user.id} style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', padding: '1rem 1.5rem', gap: '1.5rem' }}>
            <div style={{
              width: '3rem', height: '3rem', borderRadius: '50%',
              backgroundColor: user.status === 'banned' ? '#b3261e15' : 'var(--color-surface-dim)',
              color: user.status === 'banned' ? 'var(--color-error)' : 'var(--color-on-surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
            }}>
              {(user.username || user.email || 'U').charAt(0).toUpperCase()}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, textDecoration: user.status === 'banned' ? 'line-through' : 'none' }}>
                  {user.username || user.email}
                </h3>
                {user.role === 'admin' ? (
                  <span style={{ fontSize: '0.625rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: 700 }}>ADMIN</span>
                ) : user.role === 'moderator' ? (
                  <span style={{ fontSize: '0.625rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', backgroundColor: '#eebf09', color: '#fff', fontWeight: 700 }}>MOD</span>
                ) : (
                  <span style={{ fontSize: '0.625rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', backgroundColor: 'var(--color-surface-dim)', color: 'var(--color-on-surface-variant)', fontWeight: 700 }}>USER</span>
                )}
                
                {user.status === 'banned' && (
                  <span style={{ fontSize: '0.625rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', backgroundColor: '#b3261e15', color: 'var(--color-error)', fontWeight: 700, marginLeft: 'auto' }}>
                    ĐÃ BỊ KHÓA
                  </span>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: 'var(--color-on-surface-variant)', marginTop: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Mail className="w-3.5 h-3.5" /> {user.email}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ShieldCheck className="w-3.5 h-3.5" /> Điểm uy tín: {user.trust_score}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {/* Cannot ban yourself */}
              {user.id !== currentUser?.id && user.role !== 'admin' && (
                <>
                  {user.status === 'banned' ? (
                    <Button 
                      variant="outline"
                      onClick={() => banMutation.mutate({ id: user.id, status: 'active' })}
                      disabled={banMutation.isPending}
                    >
                      <Unlock className="w-4 h-4 mr-2" /> Mở khóa
                    </Button>
                  ) : (
                    <Button 
                      variant="outline"
                      onClick={() => banMutation.mutate({ id: user.id, status: 'banned' })}
                      disabled={banMutation.isPending}
                      style={{ color: 'var(--color-error)', borderColor: '#b3261e40' }}
                    >
                      <Lock className="w-4 h-4 mr-2" /> Khóa (Ban)
                    </Button>
                  )}
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
