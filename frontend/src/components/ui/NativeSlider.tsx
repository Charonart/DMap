import * as React from "react"
import { cn } from "@/lib/utils"
import styles from "@/styles/primitives.module.scss"

export interface NativeSliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  valueLabel?: string | number;
}

const NativeSlider = React.forwardRef<HTMLInputElement, NativeSliderProps>(
  ({ className, valueLabel, ...props }, ref) => {
    return (
      <div className={styles.sliderWrapper}>
        <input
          type="range"
          ref={ref}
          className={cn(styles.sliderInput, className)}
          {...props}
        />
        {valueLabel !== undefined && (
          <span className={styles.sliderValue}>{valueLabel}</span>
        )}
      </div>
    )
  }
)
NativeSlider.displayName = "NativeSlider"

export { NativeSlider }
