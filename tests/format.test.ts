import { test } from "node:test";
import assert from "node:assert/strict";
import { fmtAgeMinutes, fmtClock, fmtFull, fmtRowTime, initials, isOld } from "../lib/format.ts";

test("fmtClock renders a stable 24h HH:MM", () => {
  const out = fmtClock("2024-05-06T09:05:00.000Z");
  assert.match(out, /^\d{2}:\d{2}$/);
  const out2 = fmtClock("2024-05-06T21:35:00.000Z");
  assert.match(out2, /^\d{2}:\d{2}$/);
});

test("fmtRowTime renders a time for today and a short date otherwise", () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  assert.match(fmtRowTime(today.toISOString()), /^\d{2}:\d{2}$/);

  const old = new Date(Date.UTC(2020, 2, 12, 12, 0, 0)); // noon UTC avoids day drift
  assert.equal(fmtRowTime(old.toISOString()), "12 Mar");
});

test("fmtFull includes a weekday, day, month and time", () => {
  const out = fmtFull("2024-05-06T09:05:00.000Z");
  assert.match(out, /(Mon|Mon\.)/);
  assert.match(out, /\d{2}:\d{2}/);
});

test("fmtAgeMinutes humanizes minutes, hours and days", () => {
  assert.equal(fmtAgeMinutes(0), "0m");
  assert.equal(fmtAgeMinutes(30), "30m");
  assert.equal(fmtAgeMinutes(59), "59m");
  assert.equal(fmtAgeMinutes(60), "1h");
  assert.equal(fmtAgeMinutes(125), "2h");
  assert.equal(fmtAgeMinutes(1500), "1d");
});

test("isOld is true past 24h and false for now", () => {
  assert.equal(isOld("2020-01-01T00:00:00.000Z"), true);
  assert.equal(isOld(new Date().toISOString()), false);
});

test("initials takes up to two words, uppercased", () => {
  assert.equal(initials("Ritu Sharma"), "RS");
  assert.equal(initials("  Ada   Lovelace "), "AL");
  assert.equal(initials("Plato"), "P");
  assert.equal(initials(""), "");
});
