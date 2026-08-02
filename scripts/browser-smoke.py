"""
Browser layout smoke check (dev tooling; not part of npm test).

Builds the portal against a local mock read endpoint, serves it, and drives
Chromium (Playwright) across all four routes at desktop and mobile widths,
asserting no horizontal overflow, no console errors, and that page loads
never issue an action POST. Screenshots go to the system temp dir.

Usage: python scripts/browser-smoke.py
"""

import http.server
import json
import os
import subprocess
import sys
import tempfile
import threading
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
MOCK_PORT = int(os.environ.get("SMOKE_MOCK_PORT", "4187"))
APP_PORT = int(os.environ.get("SMOKE_APP_PORT", "4190"))
NEXT_BIN = ROOT / "node_modules" / "next" / "dist" / "bin" / "next"

ACTION_POSTS = {"count": 0}
FAILURES = []
SHOT_DIR = Path(tempfile.gettempdir()) / "portal-shots"


def today_iso():
    return time.strftime("%Y-%m-%d")


def desk_payload():
    now_ms = time.time() * 1000
    day = time.strftime("%a")
    return {
        "threads": [
            {
                "id": "c-1",
                "status": "unread",
                "unread": 2,
                "parent": {"id": "p-1", "name": "Ritu Sharma", "phone": "+91 90000 00000", "relation": "Mother"},
                "students": [{"id": "s-1", "name": "Aisha Sharma", "homeroom": "7A", "cohort": "Year 7"}],
                "messages": [
                    {"id": "m-1", "direction": "inbound", "author": "parent", "body": "Absence: Aisha home sick today with a fever and won't be in.", "at": _iso(now_ms - 7200000)},
                    {"id": "m-2", "direction": "inbound", "author": "parent", "body": "Could you let the attendance office know?", "at": _iso(now_ms - 3600000)},
                ],
                "lastActivityAt": _iso(now_ms - 3600000),
            },
            {
                "id": "c-2",
                "status": "open",
                "parent": {"id": "p-2", "name": "Vikram Mehta", "phone": "", "relation": "Father"},
                "students": [{"id": "s-2", "name": "Kabir Mehta", "homeroom": "4B", "cohort": "Year 4"}],
                "messages": [
                    {"id": "m-3", "direction": "inbound", "author": "parent", "body": "Is there any update on the school bus route change for Kabir? The current route misses our street and my wife is concerned about the long walk home in winter.", "at": _iso(now_ms - 5400000)},
                    {"id": "m-4", "direction": "outbound", "author": "attendant", "body": "We have forwarded this to the transport office; they will reply shortly.", "at": _iso(now_ms - 4800000)},
                ],
                "lastActivityAt": _iso(now_ms - 4800000),
            },
            {
                "id": "c-3",
                "status": "routed",
                "routeTo": "Finance office",
                "parent": {"id": "p-3", "name": "Sneha Iyer", "phone": "", "relation": "Guardian"},
                "students": [{"id": "s-3", "name": "Diya Iyer", "homeroom": "2C", "cohort": "Year 2"}],
                "messages": [
                    {"id": "m-5", "direction": "inbound", "author": "parent", "body": "Please share the pending fee balance for Diya.", "at": _iso(now_ms - 90000000)},
                    {"id": "m-6", "direction": "outbound", "author": "attendant", "body": "Routed to the finance office for the balance.", "at": _iso(now_ms - 89000000)},
                ],
                "lastActivityAt": _iso(now_ms - 89000000),
            },
        ],
        "events": [
            {
                "eventId": "ev-1",
                "conversationKey": "c-1",
                "type": "absence",
                "body": "Aisha home sick",
                "status": "open",
                "priority": "urgent",
                "createdAt": _iso(now_ms - 3600000),
            },
            {
                "eventId": "ev-2",
                "type": "late bus",
                "title": "Bus 12 running late on route 4",
                "status": "taken",
                "assignee": "Mrs. D'Souza",
                "createdAt": _iso(now_ms - 7200000),
            },
        ],
        "appointments": [
            {
                "appointmentId": "ap-1",
                "conversationKey": "c-1",
                "parentName": "Ritu Sharma",
                "studentName": "Aisha Sharma",
                "requestedSlot": _iso(now_ms + 86400000),
                "reason": "Admissions tour",
                "status": "requested",
                "createdAt": _iso(now_ms),
            },
            {
                "appointmentId": "ap-2",
                "parentName": "Vikram Mehta",
                "requestedSlot": _iso(now_ms - 86400000),
                "reason": "Meeting with principal",
                "status": "confirmed",
                "createdAt": _iso(now_ms - 172800000),
            },
        ],
        "stats": {
            "metrics": {
                "inboundToday": 3,
                "repliedToday": 1,
                "responseRatePct": 33,
                "avgFirstResponseMin": 8,
                "openThreads": 2,
                "busiestHour": "09:00",
                "slaOldestMinutes": 60,
            },
            "weekly": [
                {"day": "Mon", "date": "2024-05-06", "inbound": 0, "outbound": 0},
                {"day": "Tue", "date": "2024-05-07", "inbound": 0, "outbound": 0},
                {"day": "Wed", "date": "2024-05-08", "inbound": 0, "outbound": 0},
                {"day": "Thu", "date": "2024-05-09", "inbound": 0, "outbound": 0},
                {"day": "Fri", "date": "2024-05-10", "inbound": 0, "outbound": 0},
                {"day": "Sat", "date": "2024-05-11", "inbound": 0, "outbound": 0},
                {"day": day, "date": today_iso(), "inbound": 3, "outbound": 1},
            ],
        },
    }


def _iso(ms):
    return time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime(ms / 1000))


class Handler(http.server.BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path == "/threads":
            body = json.dumps(desk_payload()).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._cors()
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_error(404)

    def do_POST(self):
        if self.path == "/action":
            ACTION_POSTS["count"] += 1
            body = b'{"ok": true}'
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._cors()
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_error(404)

    def log_message(self, *args):
        pass


def run_next(args, env):
    return subprocess.Popen(
        ["node", str(NEXT_BIN), *args],
        cwd=str(ROOT),
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        shell=False,
    )


def main():
    mock = http.server.ThreadingHTTPServer(("127.0.0.1", MOCK_PORT), Handler)
    threading.Thread(target=mock.serve_forever, daemon=True).start()

    env = {
        **os.environ,
        "NEXT_PUBLIC_WHATSAPP_PORTAL_READ_API_URL": f"http://127.0.0.1:{MOCK_PORT}/threads",
        "NEXT_PUBLIC_WHATSAPP_PORTAL_ACTION_API_URL": f"http://127.0.0.1:{MOCK_PORT}/action",
    }

    server = None
    try:
        build = subprocess.run(
            ["node", str(NEXT_BIN), "build"], cwd=str(ROOT), env=env, capture_output=True, text=True
        )
        if build.returncode != 0:
            print(build.stdout)
            print(build.stderr)
            raise SystemExit("next build failed")

        server = run_next(["start", "-p", str(APP_PORT)], env)
        base = f"http://127.0.0.1:{APP_PORT}"

        import urllib.request

        deadline = time.time() + 90
        while True:
            try:
                with urllib.request.urlopen(base + "/", timeout=2) as res:
                    if res.status == 200:
                        break
            except Exception:
                pass
            if time.time() > deadline:
                raise SystemExit("app did not become reachable")
            time.sleep(0.5)

        SHOT_DIR.mkdir(parents=True, exist_ok=True)
        routes = [
            ("/", "Morning Register", "Ritu Sharma"),
            ("/conversations", "Conversations", "Ritu Sharma"),
            ("/events", "Events", "Aisha home sick"),
            ("/appointments", "Appointments", "Admissions tour"),
        ]
        viewports = [
            ("desktop", 1440, 900),
            ("tablet-wide", 1024, 768),
            ("tablet", 768, 900),
            ("mobile", 390, 844),
        ]

        with sync_playwright() as p:
            for label, width, height in viewports:
                for path, needle, hydrated in routes:
                    browser = p.chromium.launch(headless=True)
                    page = browser.new_page(viewport={"width": width, "height": height})
                    errors = []
                    page.on("console", lambda m, errs=errors: errs.append(m.text) if m.type == "error" else None)
                    page.on("pageerror", lambda e, errs=errors: errs.append(str(e)))
                    page.goto(base + path, wait_until="networkidle")
                    page.wait_for_timeout(1500)  # let the poll hydrate rows

                    body_text = page.inner_text("body")
                    has_needle = needle in body_text
                    has_data = hydrated in body_text
                    overflow = page.evaluate("document.documentElement.scrollWidth > window.innerWidth")
                    # Desk interaction: clicking a queue row opens the thread pane/sheet.
                    if path == "/conversations":
                        row = page.query_selector(".thread-row")
                        if row:
                            row.click()
                            page.wait_for_timeout(400)
                            if page.query_selector(".desk.has-thread .thread-pane") is None:
                                FAILURES.append(f"[{label}] desk thread pane did not open on /conversations")

                    page.screenshot(path=str(SHOT_DIR / f"{label}-{path.strip('/') or 'home'}.png"))
                    browser.close()

                    if not has_needle:
                        FAILURES.append(f"[{label}] {path} missing text {needle!r}")
                    if not has_data:
                        FAILURES.append(f"[{label}] {path} did not hydrate data {hydrated!r}")
                    if overflow:
                        FAILURES.append(f"[{label}] {path} overflows horizontally")
                    if errors:
                        FAILURES.append(f"[{label}] {path} console errors: {errors[:2]}")
                    print(f"checked {label} {path} (needle={'ok' if has_needle else 'MISSING'}, hydrated={'ok' if has_data else 'MISSING'}, overflow={overflow})")

        if ACTION_POSTS["count"] != 0:
            FAILURES.append(f"action POSTs issued during page loads: {ACTION_POSTS['count']}")
        else:
            print("action POSTs during page loads: 0 (ok)")
    finally:
        if server is not None:
            server.kill()
        mock.shutdown()

    if FAILURES:
        print("\nFAILURES:")
        for f in FAILURES:
            print("  -", f)
        sys.exit(1)
    print("browser smoke: all routes render, no overflow, no console errors, no action POSTs")
    print("screenshots:", SHOT_DIR)


if __name__ == "__main__":
    main()
