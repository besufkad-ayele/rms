/** Sales reporting periods in Africa/Addis_Ababa (UTC+3, no DST). */

export type SalesPeriod = "daily" | "weekly" | "monthly" | "yearly" | "all_time";

export const SALES_PERIOD_LABELS: Record<SalesPeriod, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
  all_time: "All Time",
};

const TZ_OFFSET_MS = 3 * 60 * 60 * 1000; // Africa/Addis_Ababa

/** Local calendar parts in Addis Ababa for a given instant. */
function addisParts(date = new Date()) {
  const local = new Date(date.getTime() + TZ_OFFSET_MS);
  return {
    y: local.getUTCFullYear(),
    m: local.getUTCMonth(),
    d: local.getUTCDate(),
    dow: local.getUTCDay(), // 0 Sun … 6 Sat
  };
}

/** Midnight Addis Ababa → UTC ISO string. */
function addisMidnightUtc(y: number, m: number, d: number): string {
  const utcMs = Date.UTC(y, m, d, 0, 0, 0, 0) - TZ_OFFSET_MS;
  return new Date(utcMs).toISOString();
}

export interface PeriodRange {
  period: SalesPeriod;
  label: string;
  from: string | null;
  to: string;
  displayFrom: string;
  displayTo: string;
}

function fmtDisplay(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Africa/Addis_Ababa",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Resolve inclusive period start (UTC ISO) for sales queries.
 * `anchorDate` is YYYY-MM-DD in Addis calendar (optional; defaults to today).
 */
export function resolvePeriodRange(
  period: SalesPeriod,
  anchorDate?: string
): PeriodRange {
  const now = new Date();
  const to = now.toISOString();
  const parts = anchorDate
    ? (() => {
        const [y, m, d] = anchorDate.split("-").map(Number);
        return { y, m: m - 1, d, dow: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
      })()
    : addisParts(now);

  if (period === "all_time") {
    return {
      period,
      label: SALES_PERIOD_LABELS[period],
      from: null,
      to,
      displayFrom: "Opening",
      displayTo: fmtDisplay(to),
    };
  }

  let from: string;

  if (period === "daily") {
    from = addisMidnightUtc(parts.y, parts.m, parts.d);
  } else if (period === "weekly") {
    // Week starts Monday
    const daysFromMonday = (parts.dow + 6) % 7;
    const monday = new Date(Date.UTC(parts.y, parts.m, parts.d));
    monday.setUTCDate(monday.getUTCDate() - daysFromMonday);
    from = addisMidnightUtc(
      monday.getUTCFullYear(),
      monday.getUTCMonth(),
      monday.getUTCDate()
    );
  } else if (period === "monthly") {
    from = addisMidnightUtc(parts.y, parts.m, 1);
  } else {
    // yearly
    from = addisMidnightUtc(parts.y, 0, 1);
  }

  // End of selected day if anchor is in the past (full day), else now
  let rangeTo = to;
  if (anchorDate) {
    const endMs =
      Date.UTC(parts.y, parts.m, parts.d, 23, 59, 59, 999) - TZ_OFFSET_MS;
    rangeTo = new Date(endMs).toISOString();
  }

  return {
    period,
    label: SALES_PERIOD_LABELS[period],
    from,
    to: rangeTo,
    displayFrom: fmtDisplay(from),
    displayTo: fmtDisplay(rangeTo),
  };
}
