// lib/time.ts
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { parseISO } from "date-fns";

const TIMEZONE = "America/New_York";

/** Get the current date/time in Eastern Time */
export function getEasternNow(): Date {
  return toZonedTime(new Date(), TIMEZONE);
}

/** Format a date in Eastern Time using a date-fns format string */
export function formatEastern(
  date: Date | string | number,
  formatStr: string,
): string {
  const dateObj = typeof date === "string" ? parseISO(date) : new Date(date);
  return formatInTimeZone(dateObj, TIMEZONE, formatStr);
}

/** Parse a date string (with or without offset) and return a Date in Eastern Time */
export function parseEastern(dateStr: string): Date {
  return toZonedTime(parseISO(dateStr), TIMEZONE);
}

/** Convert a local Date + time selection to a UTC ISO string with Eastern offset */
export function toEasternISO(
  date: Date,
  timeStr?: string, // "HH:mm"
): string {
  const dt = new Date(date);
  if (timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    dt.setHours(hours || 0, minutes || 0, 0, 0);
  }
  return formatInTimeZone(dt, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

/** Get the date part (YYYY-MM-DD) in Eastern Time for a given date or ISO string */
export function getEasternDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatInTimeZone(d, TIMEZONE, "yyyy-MM-dd");
}

/** Get the day of week (e.g., "Monday") in Eastern Time */
export function getEasternDay(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatInTimeZone(d, TIMEZONE, "EEEE");
}

/** Get tomorrow's date in Eastern Time (without time) */
export function getEasternTomorrow(): Date {
  const now = getEasternNow();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}
