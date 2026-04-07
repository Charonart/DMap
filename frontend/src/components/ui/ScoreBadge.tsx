import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Star, CheckCircle2, Diamond, Triangle, XCircle, CircleDashed } from 'lucide-react';
import styles from '@/styles/primitives.module.scss';

export const scoreBadgeVariants = cva(
  styles.scoreBadge,
  {
    variants: {
      intent: {
        excellent: styles.scoreExcellent,
        good: styles.scoreGood,
        fair: styles.scoreFair,
        poor: styles.scorePoor,
        inaccessible: styles.scoreInaccessible,
        unrated: styles.scoreUnrated,
      },
      size: {
        default: styles.scoreSizeDefault,
        lg: styles.scoreSizeLg,
        sm: styles.scoreSizeSm,
      },
    },
    defaultVariants: {
      intent: 'unrated',
      size: 'default',
    },
  }
);

interface ScoreBadgeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>, VariantProps<typeof scoreBadgeVariants> {
  score: number;
}

export function ScoreBadge({ score, size, className, ...props }: ScoreBadgeProps) {
  let intent: VariantProps<typeof scoreBadgeVariants>['intent'] = 'unrated';
  let Icon = CircleDashed;
  let label = 'Chưa có';

  if (score >= 9) { intent = 'excellent'; Icon = Star; }
  else if (score >= 7) { intent = 'good'; Icon = CheckCircle2; }
  else if (score >= 5) { intent = 'fair'; Icon = Diamond; }
  else if (score >= 3) { intent = 'poor'; Icon = Triangle; }
  else if (score >= 1) { intent = 'inaccessible'; Icon = XCircle; }

  const isUnrated = score < 1;

  return (
    <div className={cn(scoreBadgeVariants({ intent, size, className }))} {...props}>
      <Icon className="w-4 h-4" strokeWidth={isUnrated ? 2 : 3} />
      <span>{isUnrated ? label : Number(score).toFixed(1)}</span>
    </div>
  );
}
