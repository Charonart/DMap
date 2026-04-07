'use client';
import React, { useState } from 'react';
import { Slider } from '@/components/ui/Slider';
import { Label } from '@/components/ui/Label';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import styles from '@/styles/primitives.module.scss';

export function ScoreFilterSlider() {
  const [minScore, setMinScore] = useState(5);

  return (
    <div className={styles.breakdownCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Label>Lọc theo Điểm tối thiểu</Label>
        <ScoreBadge score={minScore} />
      </div>
      <div>
        <Slider 
          defaultValue={[5]} 
          min={0} 
          max={10} 
          step={1} 
          onValueChange={(val) => setMinScore(val[0])} 
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)', marginTop: '0.5rem', padding: '0 0.25rem' }}>
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>
    </div>
  );
}
