import React from 'react';
import { cn } from '@/lib/utils';

export function DropdownContainer({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-xl border border-outline/20 shadow-m3-lg z-50 overflow-hidden", className)} {...props}>
      {children}
    </div>
  );
}

export function DropdownHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-4 border-b border-outline/10", className)} {...props}>
      {children}
    </div>
  );
}

export function DropdownGroup({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("py-2", className)} {...props}>
      {children}
    </div>
  );
}

interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  danger?: boolean;
}

export function DropdownItem({ children, icon, danger, className, ...props }: DropdownItemProps) {
  return (
    <button
      className={cn(
        "w-full text-left px-4 py-2 transition-colors flex items-center gap-3 text-body",
        danger 
          ? "hover:bg-error-container hover:text-error text-error" 
          : "hover:bg-surface-dim text-on-surface",
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
