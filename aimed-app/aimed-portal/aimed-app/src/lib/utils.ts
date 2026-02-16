import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a Date to Bosnian convention: DD.MM.YYYY. (trailing dot after year).
 * Accepts a Date object or ISO string.
 */
export function formatBosnianDate(input?: Date | string): string {
  const d = input ? new Date(input) : new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}.`;
}
