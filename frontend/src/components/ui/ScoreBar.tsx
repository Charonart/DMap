import * as React from "react"
import { cn } from "@/lib/utils"
import styles from "@/styles/primitives.module.scss"

interface ScoreBarProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number;
}

export function ScoreBar({ score, className, ...props }: ScoreBarProps) {
  const safeScore = Math.min(Math.max(score, 0), 10);
  const percentage = (safeScore / 10) * 100;
  const isUnrated = safeScore < 1;

  let fillColor = 'var(--color-score-unrated)';
  if (safeScore >= 9) fillColor = 'var(--color-score-excellent)';
  else if (safeScore >= 7) fillColor = 'var(--color-score-good)';
  else if (safeScore >= 5) fillColor = 'var(--color-score-fair)';
  else if (safeScore >= 3) fillColor = 'var(--color-score-poor)';
  else if (safeScore >= 1) fillColor = 'var(--color-score-inaccessible)';

  return (
    <div className={cn(styles.scoreBarTrack, className)} {...props}>
      {!isUnrated && (
        <div
          className={styles.scoreBarFill}
          style={{ width: `${percentage}%`, backgroundColor: fillColor }}
        />
      )}
    </div>
  )
}
