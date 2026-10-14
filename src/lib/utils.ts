import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Склеивает классы Tailwind (нужно компонентам shadcn и Magic UI).
// Сейчас сайт эти компоненты (папка src/components/ui) не использует, см. docs/CODE.md, раздел 11
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
