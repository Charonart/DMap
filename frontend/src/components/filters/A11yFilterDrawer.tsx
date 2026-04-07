'use client';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';
import { Filter, Layers } from 'lucide-react';
import { useMapStore } from '@/hooks/useMapStore';
import { FormSection } from '@/components/ui/FormLayout';
import styles from './A11yFilterDrawer.module.scss';

export function A11yFilterDrawer() {
  const { filterFeatures, setFilterFeatures, filterMinScore, setFilterMinScore } = useMapStore();
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, boolean>>({});
  const [minScore, setMinScore] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, boolean> = {};
      filterFeatures.forEach(f => initial[f] = true);
      setSelectedFeatures(initial);
      setMinScore(filterMinScore || 0);
    }
  }, [isOpen, filterFeatures, filterMinScore]);

  const { data: features } = useQuery({
    queryKey: ['accessibility-features'],
    queryFn: async () => {
      const res = await axiosInstance.get('/accessibility-features');
      return res.data.data;
    },
    staleTime: 60 * 60 * 1000
  });

  const toggleFeature = (id: string) => {
    setSelectedFeatures(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const groupedFeatures = features?.reduce((acc: any, feature: any) => {
    const group = feature.feature_group || 'Khác';
    if (!acc[group]) acc[group] = [];
    acc[group].push(feature);
    return acc;
  }, {});

  const storeActiveCount = filterFeatures.length + (filterMinScore && filterMinScore > 0 ? 1 : 0);

  const handleApply = () => {
    const selectedKeys = Object.keys(selectedFeatures).filter(k => selectedFeatures[k]);
    setFilterFeatures(selectedKeys);
    setFilterMinScore(minScore > 0 ? minScore : null);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedFeatures({});
    setFilterFeatures([]);
    setMinScore(0);
    setFilterMinScore(null);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <SheetTrigger asChild>
        <button className={styles.triggerBtn}>
          <Filter className="w-5 h-5" />
          {storeActiveCount > 0 && (
            <span className={styles.badge}>{storeActiveCount}</span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" padding="default">
        <SheetHeader>
          <SheetTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            Bộ lọc Trợ Năng
          </SheetTitle>
        </SheetHeader>
        
        <div className={styles.filterBody}>
          <FormSection>
            <h3 className={styles.groupTitle} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Điểm tiếp cận tối thiểu</span>
              <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{minScore > 0 ? `${minScore} / 10` : 'Bất kỳ'}</span>
            </h3>
            <div style={{ padding: '0.5rem 0' }}>
              <input 
                type="range" 
                min="0" 
                max="10" 
                step="1"
                value={minScore}
                onChange={(e) => setMinScore(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-outline)', marginTop: '0.25rem' }}>
                <span>0</span>
                <span>10</span>
              </div>
            </div>
          </FormSection>

          {groupedFeatures && Object.entries(groupedFeatures).map(([group, feats]: [string, any]) => (
            <FormSection key={group}>
              <h3 className={styles.groupTitle}>{group}</h3>
              <div className={styles.featureGrid}>
                {feats.map((feat: any) => (
                  <div key={feat.id} className={styles.featureItem}>
                    <Checkbox 
                      id={`feat-${feat.id}`} 
                      checked={!!selectedFeatures[feat.id]}
                      onCheckedChange={() => toggleFeature(feat.id)}
                    />
                    <Label htmlFor={`feat-${feat.id}`} className={styles.featureLabel}>
                      {feat.name_vi || feat.name}
                    </Label>
                  </div>
                ))}
              </div>
            </FormSection>
          ))}
        </div>

        <div className={styles.filterActions}>
          <Button variant="outline" className={styles.filterActionBtn} onClick={handleClear}>
            Xóa Lọc
          </Button>
          <Button variant="primary" className={styles.filterActionBtn} onClick={handleApply}>
            Áp Dụng Lọc
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
