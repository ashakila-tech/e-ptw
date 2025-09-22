// utils/date.ts

/**
 * Format an ISO string or Date into a human-friendly string
 * Example: "2025-09-22T11:17:51.914Z" → "Sep 22, 2025, 11:17 AM"
 */
export function formatDate(date?: string | Date | null): string {
  if (!date) return "—";

  const parsed = typeof date === "string" ? new Date(date) : date;

  if (isNaN(parsed.getTime())) return "Invalid Date";

  return parsed.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
