import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/Label';
import styles from './FormLayout.module.scss';

export function FormSection({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(styles.section, className)} {...props}>
      {children}
    </div>
  );
}

interface FormHeaderProps extends React.HTMLAttributes<HTMLHeadingElement> {
  icon?: React.ReactNode;
}

export function FormHeader({ children, icon, className, ...props }: FormHeaderProps) {
  return (
    <h3 className={cn(styles.header, className)} {...props}>
      {icon}
      {children}
    </h3>
  );
}

interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
}

export function FormGroup({ children, label, htmlFor, required, className, ...props }: FormGroupProps) {
  return (
    <div className={cn(styles.group, className)} {...props}>
      {label && (
        <Label htmlFor={htmlFor}>
          {label} {required && <span className={styles.requiredAsterisk}>*</span>}
        </Label>
      )}
      {children}
    </div>
  );
}
