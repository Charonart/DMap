import { cn } from "@/lib/utils"
import styles from "@/styles/primitives.module.scss"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(styles.skeleton, className)}
      {...props}
    />
  )
}

export { Skeleton }
