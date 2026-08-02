/**
 * Offline end-to-end smoke test.
 *
 * Builds the portal with the read/action URLs pointed at a local mock
 * server, serves the built app, requests all four routes, and proves that a
 * plain page load never issues an action POST.
 *
 * Usage: npm run test:e2e   (override ports with E2E_APP_PORT if needed)
 */

import { spawn } from "node:child_process";
import http from "node:http";
import net from "node:net";
import { once } from "node:events";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let actionPosts = 0;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function deskPayload() {
  const today = todayIso();
  const day = new Date().toLocaleDateString("en-GB", { weekday: "short" });
  return {
    threads: [
      {
        id: "c-1",
        status: "unread",
        unread: 1,
        parent: { id: "p-1", name: "Ritu Sharma", phone: "+91 90000 00000", relation: "Mother" },
        students: [{ id: "s-1", name: "Aisha Sharma", homeroom: "7A", cohort: "Year 7" }],
        messages: [
          { id: "m-1", direction: "inbound", author: "parent", body: "Absence: Aisha home sick today.", at: new Date(Date.now() - 3_600_000).toISOString() },
        ],
        lastActivityAt: new Date(Date.now() - 3_600_000).toISOString(),
      },
    ],
    events: [
      {
        eventId: "ev-1",
        conversationKey: "c-1",
        type: "absence",
        body: "Aisha home sick",
        status: "open",
        createdAt: new Date(Date.now() - 3_600_000).toISOString(),
      },
    ],
    appointments: [
      {
        appointmentId: "ap-1",
        conversationKey: "c-1",
        parentName: "Ritu Sharma",
        studentName: "Aisha Sharma",
        requestedSlot: new Date(Date.now() + 86_400_000).toISOString(),
        reason: "Admissions tour",
        status: "requested",
        createdAt: new Date().toISOString(),
      },
    ],
    stats: {
      metrics: {
        inboundToday: 1,
        repliedToday: 0,
        responseRatePct: 0,
        avgFirstResponseMin: 12,
        openThreads: 1,
        busiestHour: "09:00",
        slaOldestMinutes: 60,
      },
      weekly: [
        { day: "Mon", date: "2024-05-06", inbound: 0, outbound: 0 },
        { day: "Tue", date: "2024-05-07", inbound: 0, outbound: 0 },
        { day: "Wed", date: "2024-05-08", inbound: 0, outbound: 0 },
        { day: "Thu", date: "2024-05-09", inbound: 0, outbound: 0 },
        { day: "Fri", date: "2024-05-10", inbound: 0, outbound: 0 },
        { day: "Sat", date: "2024-05-11", inbound: 0, outbound: 0 },
        { day: day, date: today, inbound: 1, outbound: 0 },
      ],
    },
  };
}

const mock = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/action") {
    actionPosts += 1;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  if (req.method === "GET" && req.url === "/threads") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(deskPayload()));
    return;
  }
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("not found");
});

function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, "127.0.0.1", () => {
      const port = s.address().port;
      s.close(() => resolve(port));
    });
    s.on("error", reject);
  });
}

function runNode(args, env) {
  const child = spawn(process.execPath, args, { cwd: root, env, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
  let out = "";
  let err = "";
  child.stdout.on("data", (d) => (out += d));
  child.stderr.on("data", (d) => (err += d));
  const result = new Promise((resolve) => child.on("exit", (code) => resolve({ code, out, err })));
  return { child, result };
}

async function waitForText(url, expected, tries = 40) {
  for (let i = 0; i < tries; i += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        if (text.includes(expected)) return true;
      }
    } catch {
      // server not up yet
    }
    await sleep(250);
  }
  return false;
}

async function main() {
  await new Promise((resolve) => mock.listen(0, "127.0.0.1", resolve));
  const mockPort = mock.address().port;

  const env = {
    ...process.env,
    NEXT_PUBLIC_WHATSAPP_PORTAL_READ_API_URL: `http://127.0.0.1:${mockPort}/threads`,
    NEXT_PUBLIC_WHATSAPP_PORTAL_ACTION_API_URL: `http://127.0.0.1:${mockPort}/action`,
  };

  let nextProcess = null;
  const failures = [];
  try {
    const build = runNode([nextBin, "build"], env);
    const buildResult = await build.result;
    if (buildResult.code !== 0) {
      console.error(buildResult.out);
      console.error(buildResult.err);
      throw new Error("next build failed");
    }

    const appPort = process.env.E2E_APP_PORT ? Number(process.env.E2E_APP_PORT) : await freePort();
    const appUrl = `http://127.0.0.1:${appPort}`;
    const started = runNode([nextBin, "start", "-p", String(appPort)], env);
    nextProcess = started.child;

    const routes = [
      { path: "/", needle: "Morning Register" },
      { path: "/conversations", needle: "Conversations" },
      { path: "/events", needle: "Events" },
      { path: "/appointments", needle: "Appointments" },
    ];

    for (const route of routes) {
      const ok = await waitForText(appUrl + route.path, route.needle);
      if (!ok) failures.push(`route ${route.path} did not serve "${route.needle}"`);
      else console.log(`ok   ${route.path} (served "${route.needle}")`);
    }

    await sleep(1200);

    if (actionPosts !== 0) {
      failures.push(`expected 0 action POSTs, mock received ${actionPosts}`);
    } else {
      console.log("ok   no action POST issued by page loads");
    }
  } finally {
    if (nextProcess) nextProcess.kill();
    await new Promise((resolve) => mock.close(resolve));
  }

  if (failures.length > 0) {
    console.error(`FAIL (${failures.length}):`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log("e2e smoke: all routes served, no action POSTs");
}

main().catch((error) => {
  console.error("e2e smoke failed:", error);
  process.exit(1);
});
