// We are providing a very lightweight custom toast system for DMap
// Radix Toast logic requires managing state contexts, whereas a lightweight solution is easier to bundle
import * as React from "react"
import { cn } from "@/lib/utils"

// Since a complete Radix Toast system involves complex dispatch logic, 
// we will export simple stylistic Toast wrappers here, and the implementation in Sandbox 
// will just demonstrate the visual M3 styles of the Toast components themselves.

export function Toast({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-center justify-between space-x-4 overflow-hidden rounded-md border border-outline/20 bg-surface-container-highest p-4 pr-6 text-on-surface shadow-m3-lg transition-all",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
export function ToastTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-label font-semibold", className)} {...props} />
}
export function ToastDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-body opacity-90", className)} {...props} />
}
