'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Chip } from '@/components/ui/Chip';
import { useMapStore } from '@/hooks/useMapStore';
import { CategoryIconBadge, getAllIcon } from '@/lib/categoryMeta';
import styles from './CategoryRow.module.scss';

export function CategoryRow() {
  const { filterCategoryId, setFilterCategoryId } = useMapStore();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axiosInstance.get('/categories');
      return res.data.data;
    },
    staleTime: 60 * 60 * 1000
  });

  return (
    <div className={styles.scrollContainer}>
      <div className={styles.chipRow}>
        <Chip 
          variant={filterCategoryId === null ? 'selected' : 'default'}
          onClick={() => setFilterCategoryId(null)}
          icon={<span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 24, height: 24, borderRadius: '50%',
            backgroundColor: filterCategoryId === null ? 'var(--color-primary)' : 'var(--color-outline)',
            color: '#fff',
          }}>{getAllIcon(14)}</span>}
        >
          Tất cả
        </Chip>
        {categories?.map((cat: any) => (
          <Chip 
            key={cat.id} 
            variant={filterCategoryId === cat.id ? 'selected' : 'default'}
            onClick={() => setFilterCategoryId(cat.id)}
            icon={<CategoryIconBadge iconKey={cat.icon} categoryName={cat.name} size={24} />}
          >
            {cat.name_vi || cat.category_vi || cat.name || cat.category}
          </Chip>
        ))}
      </div>
    </div>
  );
}
