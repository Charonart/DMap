import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import styles from "./Chip.module.scss"

const chipVariants = cva(
  styles.base,
  {
    variants: {
      variant: {
        default: styles.default,
        outline: styles.outline,
        selected: styles.selected,
      },
      size: {
        default: styles.sizeDefault,
        sm: styles.sizeSm,
        lg: styles.sizeLg,
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {
  icon?: React.ReactNode;
}

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, variant, size, icon, children, ...props }, ref) => {
    return (
      <button
        className={cn(chipVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {icon && <span className={styles.iconSlot}>{icon}</span>}
        {children}
      </button>
    )
  }
)
Chip.displayName = "Chip"

export { Chip, chipVariants }
