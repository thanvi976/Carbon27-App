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

