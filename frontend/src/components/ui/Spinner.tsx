import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: number | string;
}

export function Spinner({ className, size = 24, ...props }: SpinnerProps) {
  return (
    <Loader2 
      className={cn("animate-spin text-primary", className)} 
      width={size} 
      height={size} 
      {...props} 
    />
  )
}
