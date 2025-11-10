import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Accept many possible date forms and return "-" if missing/invalid.
 */
function formatDate(dateValue: string | number | Date | null | undefined): string {
  if (!dateValue) return "-";
  try {
    // dayjs accepts Date | number | string
    const d = dayjs.utc(dateValue as any).tz(dayjs.tz.guess());
    if (!d.isValid()) return "-";
    return d.format("DD MMM YYYY hh:mm A");
  } catch (e) {
    // be defensive — if dayjs throws for any input, return fallback
    return "-";
  }
}

export { formatDate };