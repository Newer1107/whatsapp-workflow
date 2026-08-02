"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePortal } from "@/lib/use-portal";
import { slaSummary } from "@/lib/logic";

const SCHOOL_NAME = "Riverside Public School";
const OFFICE_HOURS = "WhatsApp office · 8:00 – 16:00";

const NAV_LINKS = [
  { href: "/", label: "Overview", match: (p: string) => p === "/" },
  { href: "/conversations", label: "Conversations", match: (p: string) => p.startsWith("/conversations") },
  { href: "/events", label: "Events", match: (p: string) => p.startsWith("/events") },
  { href: "/appointments", label: "Appointments", match: (p: string) => p.startsWith("/appointments") },
] as const;

function Emblem() {
  return (
    <span className="emblem" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 6.5C10 5 7 4.8 4.5 5.5v12.6c2.5-.7 5.5-.5 7.5 1 2-1.5 5-1.7 7.5-1V5.5C17 4.8 14 5 12 6.5Z" />
        <path d="M12 6.5v12.6" />
        <path d="M9.4 8.6c-1.2-.5-2.6-.6-3.9-.3" />
        <path d="M14.6 8.6c1.2-.5 2.6-.6 3.9-.3" />
      </svg>
    </span>
  );
}

function clockNow(): string {
  return new Date().toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** Masthead + status bar. Reads the queue summary and connection state from
 *  the shared portal provider — no separate poll loop of its own. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [clock, setClock] = useState("");
  const { threads, offline, lastUpdated } = usePortal();

  useEffect(() => {
    setClock(clockNow());
    const tick = setInterval(() => setClock(clockNow()), 1000);
    return () => clearInterval(tick);
  }, []);

  const sla = threads.length > 0 || lastUpdated !== null ? slaSummary(threads) : "";
  const unanswered = sla.length > 0 && sla !== "Queue clear";

  return (
    <div className="shell">
      <header className="masthead">
        <div className="masthead-inner">
          <Emblem />
          <div className="brand">
            <div className="brand-name">{SCHOOL_NAME}</div>
            <div className="brand-sub">{OFFICE_HOURS}</div>
          </div>
          <nav className="nav" aria-label="Portal sections">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link"
                aria-current={link.match(pathname) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="appbar">
          <div className="appbar-inner">
            <span className={`live-indicator${offline ? " is-offline" : ""}`}>
              <span className="live-dot" aria-hidden="true" />
              {offline ? "Offline" : "Live"}
            </span>
            <span className={`sla-note${unanswered ? " sla-warn" : ""}`}>
              {sla || "Loading queue…"}
            </span>
            <time className="clock" aria-label="Office clock">
              {clock}
            </time>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
