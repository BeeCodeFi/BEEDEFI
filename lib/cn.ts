import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * The `cn` helper. Combines `clsx` (which handles conditional classes and arrays)
 * with `tailwind-merge` (which resolves conflicting Tailwind utilities by keeping
 * the last one — e.g. `cn("px-2", "px-4")` returns `"px-4"`, not `"px-2 px-4"`).
 *
 * Use everywhere you compose class names from props.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
