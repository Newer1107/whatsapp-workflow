/** Small presentational formatters. Pure and locale-stable (24h clock). */

const DAY = 86_400_000;

export function fmtClock(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Row timestamp: time today, "12 Mar" otherwise. */
export function fmtRowTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) return fmtClock(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function fmtFull(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Humanized age like "4m", "2h", "1d" for SLA display. */
export function fmtAgeMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 24 * 60) return `${Math.round(minutes / 60)}h`;
  return `${Math.round(minutes / (24 * 60))}d`;
}

/** True when the activity is more than 24h old (renders the stale tag). */
export function isOld(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() > DAY;
}

/** Initials for the register-style disc: "Ritu Sharma" → "RS". */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}
