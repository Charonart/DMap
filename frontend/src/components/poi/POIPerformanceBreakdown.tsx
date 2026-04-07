'use client';
import React from 'react';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { Chip } from '@/components/ui/Chip';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/Accordion';
import styles from '@/styles/primitives.module.scss';

interface Feature {
  id: number;
  name: string;
  name_vi?: string;
  feature_group: string;
  is_available: boolean;
  quality_rating: number;
  note?: string;
}

interface GroupSummary {
  group: string;
  avgScore: number;
  features: Feature[];
}

function groupAndAverage(features: Feature[]): GroupSummary[] {
  const groups: Record<string, Feature[]> = {};
  
  for (const feat of features) {
    const g = feat.feature_group || 'Khác';
    if (!groups[g]) groups[g] = [];
    groups[g].push(feat);
  }

  return Object.entries(groups).map(([group, feats]) => {
    const available = feats.filter(f => f.is_available && f.quality_rating > 0);
    const avgScore = available.length > 0
      ? Math.round((available.reduce((sum, f) => sum + f.quality_rating, 0) / available.length) * 10) / 10
      : 0;
    return { group, avgScore, features: feats };
  }).sort((a, b) => b.avgScore - a.avgScore);
}

export function POIPerformanceBreakdown({ features }: { features: Feature[] }) {
  if (!features || features.length === 0) return null;

  const groups = groupAndAverage(features);
  const availableFeatures = features.filter(f => f.is_available);

  return (
    <div className={styles.breakdownRoot}>
      <h3 className={styles.breakdownTitle}>Mức Độ Tiếp Cận</h3>

      {/* Summary View: Average score per group */}
      <div className={styles.breakdownCard}>
        {groups.map((g) => (
          <div key={g.group} className={styles.breakdownRow}>
            <span className={styles.breakdownLabel}>{g.group}</span>
            <div className={styles.breakdownBarSlot}>
              <ScoreBar score={g.avgScore} />
            </div>
            <span className={styles.breakdownScore}>
              {g.avgScore > 0 ? g.avgScore : '—'}
            </span>
          </div>
        ))}
      </div>

      {/* Detail View: Accordion per group showing individual features */}
      <Accordion type="single" collapsible>
        <AccordionItem value="details">
          <AccordionTrigger style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 600 }}>
            Xem chi tiết từng tiện ích ({availableFeatures.length} tiện ích)
          </AccordionTrigger>
          <AccordionContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {groups.map((g) => (
                <div key={g.group}>
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {g.group}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {g.features.map((feat) => (
                      <div key={feat.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            width: '1.25rem', height: '1.25rem', borderRadius: '50%', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.625rem', fontWeight: 700,
                            backgroundColor: feat.is_available ? 'rgba(46,125,50,0.15)' : 'rgba(116,119,117,0.1)',
                            color: feat.is_available ? 'var(--color-score-good)' : 'var(--color-outline)',
                          }}>
                            {feat.is_available ? '✓' : '✗'}
                          </span>
                          <span style={{ flex: 1, fontSize: '0.8125rem', color: feat.is_available ? 'var(--color-on-surface)' : 'var(--color-outline)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {feat.name_vi || feat.name}
                          </span>
                          {feat.is_available && feat.quality_rating > 0 && (
                            <>
                              <div style={{ width: '3rem', flexShrink: 0 }}>
                                <ScoreBar score={feat.quality_rating} />
                              </div>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', width: '1.25rem', textAlign: 'right', flexShrink: 0 }}>
                                {feat.quality_rating}
                              </span>
                            </>
                          )}
                        </div>
                        {feat.is_available && feat.note && (
                          <div style={{ paddingLeft: '1.75rem', fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', fontStyle: 'italic', marginBottom: '0.25rem' }}>
                            "{feat.note}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Feature chips for available features */}
      {availableFeatures.length > 0 && (
        <div className={styles.featureChips}>
          {availableFeatures.map((f) => (
            <Chip key={f.id} size="sm">
              ✓ {f.name_vi || f.name}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}
