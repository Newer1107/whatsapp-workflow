"use client";

import { useState } from "react";
import type { StaffEvent, EventStatus } from "@/lib/types";
import { usePortal } from "@/lib/use-portal";
import EventList from "@/components/EventList";

const STATUS_OPTIONS: { value: EventStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "taken", label: "Taken" },
  { value: "escalated", label: "Escalated" },
  { value: "resolved", label: "Resolved" },
  { value: "cancelled", label: "Cancelled" },
];

export default function EventsPage() {
  const [status, setStatus] = useState<EventStatus | "all">("all");
  const portal = usePortal();
  const { events, loading, error, offline, retry, lastUpdated, actionError, clearActionError } = portal;

  const shown = status === "all" ? events : events.filter((e) => e.status === status);

  return (
    <main className="page">
      <section aria-label="Events">
        <h1 className="hero-title">Events</h1>
        <p className="hero-sub">
          Staff events raised from parent messages, newest first
          {lastUpdated ? ` · updated ${new Date(lastUpdated).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}` : ""}.
        </p>
      </section>

      {actionError && (
        <div className="error-strip" role="alert">
          {actionError}
          <button type="button" className="btn btn-secondary btn-sm" onClick={clearActionError}>
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="error-strip" role="alert">
          The office data could not be reached.
          <button type="button" className="btn btn-secondary btn-sm" onClick={retry}>
            Retry
          </button>
        </div>
      )}

      {offline && (
        <div className="offline-strip" role="status">
          Connection lost. Showing the last loaded data — reconnecting automatically.
        </div>
      )}

      <div className="toolbar" role="group" aria-label="Filter events">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`filter-chip${status === opt.value ? " active" : ""}`}
            aria-pressed={status === opt.value}
            onClick={() => setStatus(opt.value)}
          >
            {opt.label}
          </button>
        ))}
        <span className="spacer" />
        <span className="t-meta">
          {shown.length} {shown.length === 1 ? "event" : "events"}
        </span>
      </div>

      <EventList
        events={shown}
        loading={loading && !error}
        busy={portal.busyEvents}
        onTake={portal.take}
        onEscalate={portal.escalateEvent}
        onResolve={portal.resolveEvent}
        onCancel={portal.cancelEvent}
        emptyTitle="No events here yet."
        emptyCopy="Events raised from parent messages will appear here as they happen."
      />
    </main>
  );
}
