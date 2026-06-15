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
