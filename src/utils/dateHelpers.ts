export function isoNow(): string {
  return new Date().toISOString();
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

/** e.g. "March 17, 2026" — used on certificates */
export function formatCertificateDate(isoOrParseable: string): string {
  const d = new Date(isoOrParseable);
  if (Number.isNaN(d.getTime())) return isoOrParseable;
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function hoursSince(iso: string): number {
  const then = new Date(iso).getTime();
  const now = Date.now();
  return (now - then) / 36e5;
}

export function yyyyMm(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function daysInMonth(year: number, monthIndex0: number): number {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

/** Start-of-day in local timezone. */
function startOfLocalDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Whole calendar days between two instants (local dates). */
export function calendarDaysBetween(isoEarlier: string, isoLater: string): number {
  const a = startOfLocalDay(new Date(isoEarlier));
  const b = startOfLocalDay(new Date(isoLater));
  return Math.round((b - a) / 86400000);
}

export function isSameCalendarDay(iso: string, ref: Date = new Date()): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

export function isYesterdayCalendar(iso: string, ref: Date = new Date()): boolean {
  const y = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - 1);
  const d = new Date(iso);
  return d.getFullYear() === y.getFullYear() && d.getMonth() === y.getMonth() && d.getDate() === y.getDate();
}

