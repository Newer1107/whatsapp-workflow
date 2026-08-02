/**
 * Pure domain logic for the office desk: queue ordering, pulse rail state,
 * appointment splitting, weekly traffic derivation and the SLA summary.
 *
 * Everything here is a pure function of its inputs (no fetches, no React,
 * no Date.now()) so it can be unit-tested offline with node:test.
 */

import type { Appointment, Thread } from "./types";
import { fmtClock } from "./format";

/** Pulse rail states (DESIGN.md section 6). */
export type PulseState =
  | "idle"
  | "incoming"
  | "live"
  | "typing"
  | "unread"
  | "routed"
  | "closed";

/** Oldest unanswered first (SLA order), then most recent activity. */
export function queueOrder(threads: Thread[]): Thread[] {
  const needsAttention = threads.filter((t) => t.status === "unread" || t.status === "open");
  return needsAttention.sort((a, b) => {
    const aLast = a.messages[a.messages.length - 1];
    const bLast = b.messages[b.messages.length - 1];
    const aUnanswered = aLast?.direction === "inbound" && aLast.author !== "system";
    const bUnanswered = bLast?.direction === "inbound" && bLast.author !== "system";
    if (aUnanswered !== bUnanswered) return aUnanswered ? -1 : 1;
    return new Date(a.lastActivityAt).getTime() - new Date(b.lastActivityAt).getTime();
  });
}

/** Map a thread to its rail state (DESIGN.md section 6). */
export function pulseStateFor(
  thread: { status: Thread["status"]; unread: number },
  selected: boolean,
): PulseState {
  if (thread.status === "closed") return "closed";
  if (thread.status === "routed") return "routed";
  if (selected) return "typing";
  if (thread.unread > 0) return "incoming"; // pings once, settles to unread
  return "live";
}

const MONTHS = new Map([
  ["january", 0], ["february", 1], ["march", 2], ["april", 3],
  ["may", 4], ["june", 5], ["july", 6], ["august", 7],
  ["september", 8], ["october", 9], ["november", 10], ["december", 11],
]);

export function parseAppointmentSlot(value: string | undefined, now = new Date()): string | null {
  const text = value?.trim();
  if (!text) return null;

  const iso = new Date(text);
  if (!Number.isNaN(iso.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(text)) return iso.toISOString();

  const match = text.match(
    /^(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)(?:\s+(\d{4}))?(?:\s+(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?$/i,
  );
  if (!match) return null;

  const [, dayText, monthText, yearText, hourText, minuteText, meridiem] = match;
  const month = MONTHS.get(monthText.toLowerCase());
  if (month === undefined) return null;

  const hour = hourText ? Number(hourText) : 9;
  const minute = minuteText ? Number(minuteText) : 0;
  if (hour > 23 || minute > 59 || (meridiem && hour > 12)) return null;

  const localHour = meridiem
    ? (hour % 12) + (meridiem.toLowerCase() === "pm" ? 12 : 0)
    : hour;
  const year = yearText ? Number(yearText) : now.getFullYear();
  const candidate = new Date(year, month, Number(dayText), localHour, minute, 0, 0);
  if (Number.isNaN(candidate.getTime()) || candidate.getMonth() !== month || candidate.getDate() !== Number(dayText)) return null;
  if (!yearText && candidate.getTime() < now.getTime()) candidate.setFullYear(year + 1);
  return candidate.toISOString();
}

/** Split appointments into upcoming (soonest first) and past (latest first). */
export function splitByTime(appointments: Appointment[]): {
  upcoming: Appointment[];
  past: Appointment[];
} {
  const now = Date.now();
  const upcoming = appointments
    .filter((a) => new Date(a.startsAt).getTime() >= now)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  const past = appointments
    .filter((a) => new Date(a.startsAt).getTime() < now)
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
  return { upcoming, past };
}

/** Busiest hour label ("HH:00") from today's inbound messages; "No activity" when empty. */
export function derivedBusiestHour(threads: Thread[]): string {
  const today = new Date().toDateString();
  const hours = new Map<number, number>();
  for (const message of threads.flatMap((thread) => thread.messages)) {
    const at = new Date(message.at);
    if (message.direction === "inbound" && at.toDateString() === today) {
      hours.set(at.getHours(), (hours.get(at.getHours()) ?? 0) + 1);
    }
  }
  const busiest = [...hours.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  return busiest === undefined ? "No activity" : `${String(busiest).padStart(2, "0")}:00`;
}

/** One-line SLA summary for the app bar: "2 unanswered · oldest 09:41". */
export function slaSummary(threads: Thread[]): string {
  const waiting = threads.filter((thread) => thread.status === "unread" || thread.status === "open");
  const unanswered = waiting.filter((thread) => thread.messages[thread.messages.length - 1]?.direction === "inbound");
  const totalUnread = waiting.reduce((total, thread) => total + thread.unread, 0);
  if (unanswered.length === 0) return "Queue clear";

  const oldest = unanswered.reduce((a, b) =>
    new Date(a.messages[a.messages.length - 1]?.at ?? 0).getTime() <
    new Date(b.messages[b.messages.length - 1]?.at ?? 0).getTime()
      ? a
      : b,
  );
  return `${totalUnread} unanswered · oldest ${fmtClock(oldest.messages[oldest.messages.length - 1]?.at ?? new Date().toISOString())}`;
}
