import { formatEastern } from "./time";

export function formatDuration(
  minutes: number | string | null | undefined,
): string {
  if (!minutes) return "Duration unknown";
  const mins = Number(minutes);
  if (isNaN(mins)) return String(minutes); // Fallback if it's a string like "1 hour"

  const h = Math.floor(mins / 60);
  const m = mins % 60;

  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h} hour${h > 1 ? "s" : ""}`;
  return `${m} min${m !== 1 ? "s" : ""}`;
}

export function formatPrice(
  amount: number | null | undefined,
  currency = "$",
  locale = "en-US",
): string {
  const value = amount ?? 0;

  return `${currency}${value.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

type DateFormatOption = "short" | "long" | "datetime";

const DATE_FORMAT_OPTIONS: Record<
  DateFormatOption,
  Intl.DateTimeFormatOptions
> = {
  short: { day: "numeric", month: "short" },
  long: { day: "numeric", month: "long", year: "numeric" },
  datetime: {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
};

export function formatDate(
  date: string | null | undefined,
  format: DateFormatOption = "long",
  fallback = "Date unknown",
): string {
  if (!date) return fallback;
  return new Date(date).toLocaleDateString(
    "en-US",
    DATE_FORMAT_OPTIONS[format],
  );
}

export function formatDateTimeLocal(date?: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return "";
  }
  const pad = (value: number) => String(value).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
}

export function parseDateTimeLocal(value: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (isNaN(date.getTime())) return undefined;
  return date;
}

export function formatInitials(value: string): string {
  if (!value) return "";
  const words = value.trim().split(/\s+/);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

export function formatTimeTo12Hour(timeStr: string): string {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return timeStr;
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${ampm}`;
}

export function formatOrderNumber(
  orderNumber: string | null | undefined,
): string {
  if (!orderNumber) return "N/A";
  return orderNumber.split("-").pop() ?? orderNumber;
}

export function formatEasternDate(
  date: string | null | undefined,
  format: "short" | "long" | "datetime" = "long",
  fallback = "Date unknown",
): string {
  if (!date) return fallback;
  const map = {
    short: "MMM d",
    long: "MMMM d, yyyy",
    datetime: "MMMM d, yyyy 'at' h:mm a",
  };
  return formatEastern(date, map[format]);
}
