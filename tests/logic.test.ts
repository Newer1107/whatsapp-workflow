import { test } from "node:test";
import assert from "node:assert/strict";
import type { Appointment, Message, Thread } from "../lib/types.ts";
import { fmtClock } from "../lib/format.ts";
import {
  derivedBusiestHour,
  pulseStateFor,
  queueOrder,
  slaSummary,
  splitByTime,
} from "../lib/logic.ts";

function msg(id: string, direction: Message["direction"], at: string, author: Message["author"] = "parent"): Message {
  return { id, direction, author, body: "hello", at };
}

function thread(id: string, status: Thread["status"], last: Message | null, extra?: Partial<Thread>): Thread {
  return {
    id,
    status,
    unread: 0,
    parent: { id: `p-${id}`, name: "Ritu Sharma", phone: "", relation: "Mother" },
    students: [],
    messages: last ? [last] : [],
    lastActivityAt: last?.at ?? "2024-01-01T09:00:00.000Z",
    ...extra,
  };
}

test("queueOrder puts unanswered inbound threads first, then by oldest activity", () => {
  const answered = thread("t1", "open", msg("m1", "outbound", "2024-01-01T09:00:00.000Z"));
  const unansweredOld = thread("t2", "unread", msg("m2", "inbound", "2024-01-01T08:00:00.000Z"));
  const unansweredNew = thread("t3", "open", msg("m3", "inbound", "2024-01-01T10:00:00.000Z"));
  const closed = thread("t4", "closed", msg("m4", "outbound", "2024-01-01T11:00:00.000Z"));

  const ordered = queueOrder([closed, answered, unansweredNew, unansweredOld]);
  assert.deepEqual(ordered.map((t) => t.id), ["t2", "t3", "t1"]);
});

test("pulseStateFor resolves every rail state", () => {
  assert.equal(pulseStateFor({ status: "closed", unread: 0 }, false), "closed");
  assert.equal(pulseStateFor({ status: "routed", unread: 0 }, false), "routed");
  assert.equal(pulseStateFor({ status: "open", unread: 0 }, true), "typing");
  assert.equal(pulseStateFor({ status: "open", unread: 3 }, false), "incoming");
  assert.equal(pulseStateFor({ status: "open", unread: 0 }, false), "live");
});

test("splitByTime separates upcoming (soonest first) from past (latest first)", () => {
  const pastOld = { id: "a1", title: "", status: "requested" as const, startsAt: "2020-01-01T09:00:00.000Z", parent: { id: "p1", name: "A", phone: "", relation: "Mother" } } satisfies Appointment;
  const pastNew = { ...pastOld, id: "a2", startsAt: "2020-01-05T09:00:00.000Z" } satisfies Appointment;
  const upcomingLater = { ...pastOld, id: "a3", startsAt: new Date(Date.now() + 86_400_000).toISOString() } satisfies Appointment;
  const upcomingSoon = { ...pastOld, id: "a4", startsAt: new Date(Date.now() + 3_600_000).toISOString() } satisfies Appointment;
  const boundary = { ...pastOld, id: "a5", startsAt: new Date().toISOString() } satisfies Appointment;

  const { upcoming, past } = splitByTime([pastOld, upcomingLater, pastNew, upcomingSoon, boundary]);
  assert.deepEqual(upcoming.map((a) => a.id), ["a5", "a4", "a3"]);
  assert.deepEqual(past.map((a) => a.id), ["a2", "a1"]);
});

test("derivedBusiestHour counts today's inbound messages per hour", () => {
  const d = new Date();
  d.setHours(9, 30, 0, 0);
  const nine = d.toISOString();
  const d2 = new Date();
  d2.setHours(9, 45, 0, 0);
  const nine2 = d2.toISOString();
  const d3 = new Date();
  d3.setHours(14, 0, 0, 0);
  const two = d3.toISOString();

  const t1 = thread("t1", "open", msg("m1", "inbound", nine));
  const t2 = thread("t2", "open", msg("m2", "inbound", nine2));
  const t3 = thread("t3", "open", msg("m3", "inbound", two));
  assert.equal(derivedBusiestHour([t1, t2, t3]), "09:00");
  assert.equal(derivedBusiestHour([]), "No activity");
});

test("slaSummary reports Queue clear when nothing waits", () => {
  const t1 = thread("t1", "routed", msg("m1", "outbound", "2024-01-01T09:00:00.000Z"));
  assert.equal(slaSummary([t1]), "Queue clear");
});

test("slaSummary counts unanswered and shows the oldest", () => {
  const oldest = "2024-01-01T08:10:00.000Z";
  const t1 = thread("t1", "unread", msg("m1", "inbound", oldest), { unread: 2 });
  const t2 = thread("t2", "open", msg("m2", "inbound", "2024-01-01T09:30:00.000Z"));
  const summary = slaSummary([t1, t2]);
  assert.match(summary, /^2 unanswered · oldest /);
  assert.ok(summary.endsWith(fmtClock(oldest)));
});
