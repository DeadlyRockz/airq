import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges conditional class names with Tailwind conflict resolution.
 *
 * @param inputs - Class values, arrays, or conditional objects.
 * @returns A merged className string.
 * @example
 * cn("px-4 py-2", isActive && "bg-primary text-primary-foreground")
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
