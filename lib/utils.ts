import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { iconRegistry } from "./icons-registry";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number): Promise<unknown> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getIcon(name?: string | null) {
  if (!name) return null;
  return iconRegistry[name as keyof typeof iconRegistry] ?? null;
}
