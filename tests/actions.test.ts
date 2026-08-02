import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cancelEventPayload,
  closePayload,
  completeAppointmentPayload,
  confirmAppointmentPayload,
  declineAppointmentPayload,
  escalateEventPayload,
  escalatePayload,
  replyPayload,
  resolveEventPayload,
  routePayload,
  takeEventPayload,
} from "../lib/data.ts";

test("reply payload contract", () => {
  assert.deepEqual(replyPayload("c-1", "Noted."), { action: "reply", conversationKey: "c-1", body: "Noted." });
});

test("route payload contract", () => {
  assert.deepEqual(routePayload("c-1", "Finance office"), { action: "route", conversationKey: "c-1", routeTo: "Finance office" });
});

test("close payload contract", () => {
  assert.deepEqual(closePayload("c-1"), { action: "close", conversationKey: "c-1" });
});

test("thread escalate payload contract", () => {
  assert.deepEqual(escalatePayload("c-1"), { action: "escalate", conversationKey: "c-1" });
});

test("event payload contracts", () => {
  assert.deepEqual(takeEventPayload("ev-1"), { action: "event_take", eventId: "ev-1" });
  assert.deepEqual(escalateEventPayload("ev-1"), { action: "event_escalate", eventId: "ev-1" });
  assert.deepEqual(resolveEventPayload("ev-1"), { action: "event_resolve", eventId: "ev-1" });
  assert.deepEqual(cancelEventPayload("ev-1"), { action: "event_cancel", eventId: "ev-1" });
});

test("appointment payload contracts", () => {
  assert.deepEqual(confirmAppointmentPayload("ap-1"), { action: "appointment_confirm", appointmentId: "ap-1", status: "confirmed" });
  assert.deepEqual(declineAppointmentPayload("ap-1"), { action: "appointment_decline", appointmentId: "ap-1", status: "declined" });
  assert.deepEqual(completeAppointmentPayload("ap-1"), { action: "appointment_complete", appointmentId: "ap-1", status: "completed" });
});
