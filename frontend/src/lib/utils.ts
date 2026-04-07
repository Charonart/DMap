import { clsx, type ClassValue } from "clsx";

/**
 * Utility to smartly merge Tailwind classes
 * Crucial when using CVA (Class Variance Authority) to resolve conflicting classes
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
