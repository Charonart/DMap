import * as React from "react"

import { cn } from "@/lib/utils"
import styles from "./Input.module.scss"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className={cn(styles.wrapper, className)}>
        {leftIcon && (
          <div className={cn(styles.icon, styles.left)}>
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            styles.inputRoot,
            leftIcon && styles.hasLeftIcon,
            rightIcon && styles.hasRightIcon
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className={cn(styles.icon, styles.right)}>
            {rightIcon}
          </div>
        )}
      </div>
    )
  }
)
export interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  leftIcon?: React.ReactNode;
}

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, leftIcon, children, ...props }, ref) => {
    return (
      <div className={cn(styles.wrapper, className)}>
        {leftIcon && (
          <div className={cn(styles.icon, styles.left)}>
            {leftIcon}
          </div>
        )}
        <select
          className={cn(
            styles.selectRoot,
            leftIcon && styles.hasLeftIcon
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {/* Dropdown chevron fix */}
        <div className={cn(styles.icon, styles.chevron)}>
          ▼
        </div>
      </div>
    )
  }
)
NativeSelect.displayName = "NativeSelect"

export { Input, NativeSelect }
