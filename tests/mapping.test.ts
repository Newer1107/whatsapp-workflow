import { test } from "node:test";
import assert from "node:assert/strict";
import { mapRawPayload } from "../lib/data.ts";
import type { RawPortalPayload } from "../lib/data.ts";

test("mapRawPayload maps events with all fallbacks", () => {
  const raw: RawPortalPayload = {
    threads: [],
    events: [
      {
        eventId: "ev-1",
        conversationKey: "c-9",
        type: "absence",
        body: "Aisha home sick",
        status: "open",
        assignee: "Mrs. D",
        createdAt: "2024-05-06T08:00:00.000Z",
      },
      {
        eventId: "ev-2",
        status: "resolved",
        createdAt: "2024-05-06T08:10:00.000Z",
      },
    ],
    appointments: [],
    stats: { metrics: { inboundToday: 3, repliedToday: 2, responseRatePct: 66, avgFirstResponseMin: 5, openThreads: 1, busiestHour: "10:00", slaOldestMinutes: 4 }, weekly: [] },
  };
  const out = mapRawPayload(raw);

  assert.equal(out.events.length, 2);
  assert.equal(out.events[0].id, "ev-1");
  assert.equal(out.events[0].title, "Aisha home sick"); // body fallback for title
  assert.equal(out.events[0].kind, "absence"); // type → kind
  assert.equal(out.events[0].threadId, "c-9");
  assert.equal(out.events[0].assignedTo, "Mrs. D");
  assert.equal(out.events[0].note, "Aisha home sick");
  assert.equal(out.events[0].createdAt, "2024-05-06T08:00:00.000Z");

  // no title/body/type → defaults
  assert.equal(out.events[1].title, "Staff event");
  assert.equal(out.events[1].kind, "request");
  assert.equal(out.events[1].threadId, undefined);
});

test("mapRawPayload maps appointments with all fallbacks", () => {
  const raw: RawPortalPayload = {
    threads: [],
    events: [],
    appointments: [
      {
        appointmentId: "ap-1",
        conversationKey: "c-3",
        parentName: "Ritu Sharma",
        studentName: "Aisha",
        requestedSlot: "2024-05-08T10:00:00.000Z",
        reason: "Admissions tour",
        status: "requested",
        notes: "bring report card",
        createdAt: "2024-05-06T09:00:00.000Z",
      },
      {
        appointmentId: "ap-2",
        status: "confirmed",
        createdAt: "2024-05-06T09:00:00.000Z",
      },
    ],
  };
  const out = mapRawPayload(raw);

  assert.equal(out.appointments.length, 2);
  const first = out.appointments[0];
  assert.equal(first.id, "ap-1");
  assert.equal(first.title, "Admissions tour");
  assert.equal(first.status, "requested");
  assert.equal(first.parent.name, "Ritu Sharma");
  assert.equal(first.parent.id, "c-3");
  assert.equal(first.student?.name, "Aisha");
  assert.equal(first.startsAt, "2024-05-08T10:00:00.000Z");
  assert.equal(first.note, "bring report card");

  const second = out.appointments[1];
  assert.equal(second.title, "Appointment request");
  assert.equal(second.parent.name, "Parent");
  assert.equal(second.student, undefined);
  assert.equal(second.startsAt, "2024-05-06T09:00:00.000Z"); // falls back to createdAt
});

test("mapRawPayload defaults missing sections without crashing", () => {
  const out = mapRawPayload({});
  assert.deepEqual(out.threads, []);
  assert.deepEqual(out.events, []);
  assert.deepEqual(out.appointments, []);
  assert.deepEqual(out.stats.weekly, []);
  assert.equal(out.stats.metrics.openThreads, 0);
  assert.equal(out.stats.metrics.slaOldestMinutes, null);
});

test("mapRawPayload passes threads and stats through untouched", () => {
  const thread = {
    id: "t1",
    status: "unread" as const,
    unread: 1,
    parent: { id: "p1", name: "Ritu Sharma", phone: "", relation: "Mother" },
    students: [],
    messages: [],
    lastActivityAt: "2024-05-06T08:00:00.000Z",
  };
  const weekly = [{ day: "Mon", date: "2024-05-06", inbound: 4, outbound: 2 }];
  const out = mapRawPayload({ threads: [thread], stats: { metrics: { inboundToday: 4, repliedToday: 2, responseRatePct: 50, avgFirstResponseMin: 3, openThreads: 1, busiestHour: "09:00", slaOldestMinutes: 5 }, weekly } });
  assert.deepEqual(out.threads, [thread]);
  assert.deepEqual(out.stats.weekly, weekly);
});
