import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Склеивает классы Tailwind (нужно компонентам shadcn и Magic UI)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
