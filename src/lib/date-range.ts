/**
 * Local-calendar date helpers.
 *
 * `date.toISOString().split("T")[0]` is the wrong way to name a calendar day.
 * `toISOString()` renders the UTC date, and Nigeria is UTC+1, so a local
 * midnight becomes 23:00 on the *previous* UTC day. Two symptoms of that:
 *
 *  - "today" only rolled over at 1am, because between 00:00 and 00:59 Lagos
 *    time the UTC date was still yesterday;
 *  - the shift calendar rendered each shift one cell late, because every cell's
 *    local-midnight Date stringified to the day before.
 *
 * Everything here reads the browser's local calendar fields directly.
 */

/** `YYYY-MM-DD` for the local calendar day of `d` (defaults to now). */
export function toLocalISODate(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** The date filters every stats surface offers. */
export type DatePeriod =
  | "today"
  | "yesterday"
  | "this_week"
  | "this_month"
  | "custom";

export interface DateRange {
  dateFrom: string;
  dateTo: string;
}

export const DATE_PERIOD_OPTIONS: { value: DatePeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This week" },
  { value: "this_month", label: "This month" },
  { value: "custom", label: "Custom range" },
];

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Resolve a period to an inclusive local-calendar `dateFrom`/`dateTo`.
 * Week starts Sunday and month on the 1st — calendar-anchored, not rolling.
 */
export function resolveDatePeriodRange(
  period: DatePeriod,
  customStart?: string,
  customEnd?: string,
): DateRange {
  const today = toLocalISODate();

  switch (period) {
    case "yesterday": {
      const d = startOfToday();
      d.setDate(d.getDate() - 1);
      const y = toLocalISODate(d);
      return { dateFrom: y, dateTo: y };
    }
    case "this_week": {
      const d = startOfToday();
      d.setDate(d.getDate() - d.getDay());
      return { dateFrom: toLocalISODate(d), dateTo: today };
    }
    case "this_month": {
      const d = startOfToday();
      d.setDate(1);
      return { dateFrom: toLocalISODate(d), dateTo: today };
    }
    case "custom":
      return {
        dateFrom: customStart || customEnd || today,
        dateTo: customEnd || customStart || today,
      };
    case "today":
    default:
      return { dateFrom: today, dateTo: today };
  }
}
