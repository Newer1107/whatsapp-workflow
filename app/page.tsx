"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { fmtRowTime } from "@/lib/format";
import { queueOrder } from "@/lib/logic";
import { usePortal } from "@/lib/use-portal";
import Stats from "@/components/Stats";
import ConversationList from "@/components/ConversationList";
import EventList from "@/components/EventList";
import AppointmentList from "@/components/AppointmentList";

const ACTIVE_EVENT_STATUSES = new Set(["open", "taken", "escalated"]);

export default function OverviewPage() {
  const router = useRouter();
  const portal = usePortal();
  const {
    threads,
    events,
    appointments,
    loading,
    error,
    offline,
    retry,
    lastUpdated,
    actionError,
    clearActionError,
  } = portal;

  const queue = queueOrder(threads);
  const openEvents = events.filter((e) => ACTIVE_EVENT_STATUSES.has(e.status)).slice(0, 5);
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <main className="page">
      <section aria-label="Overview">
        <h1 className="hero-title">Morning Register</h1>
        <p className="hero-sub">
          {today} · messages from parents land here, oldest unanswered first
          {lastUpdated ? ` · updated ${fmtRowTime(new Date(lastUpdated).toISOString())}` : ""}.
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

      <Stats stats={portal.stats} threads={threads} loading={loading && !error} />

      <section className="panel" aria-label="Today's queue">
        <div className="panel-header">
          <h2 className="section-title">Today&apos;s queue</h2>
          <span className="spacer" />
          {!loading && (
            <span className="t-meta">
              {queue.length} {queue.length === 1 ? "thread" : "threads"} need attention
            </span>
          )}
          <Link href="/conversations" className="panel-link">
            All conversations
          </Link>
        </div>
        <ConversationList
          threads={queue}
          selectedId={null}
          onSelect={(id) => router.push(`/conversations?thread=${id}`)}
          loading={loading && !error}
          emptyTitle="No messages yet. The queue is quiet."
          emptyCopy="New parent messages will appear here, oldest unanswered first."
        />
      </section>

      <div className="split-grid">
        <section className="panel" aria-label="Open events">
          <div className="panel-header">
            <h2 className="section-title">Events</h2>
            <span className="spacer" />
            {!loading && <span className="t-meta">{openEvents.length} active</span>}
            <Link href="/events" className="panel-link">
              All events
            </Link>
          </div>
          <EventList
            events={openEvents}
            loading={loading && !error}
            busy={portal.busyEvents}
            onTake={portal.take}
            onEscalate={portal.escalateEvent}
            onResolve={portal.resolveEvent}
            onCancel={portal.cancelEvent}
            emptyTitle="No open events."
            emptyCopy="Events raised from parent messages appear here until they are resolved."
          />
        </section>

        <section className="panel" aria-label="Upcoming appointments">
          <div className="panel-header">
            <h2 className="section-title">Appointments</h2>
            <span className="spacer" />
            <Link href="/appointments" className="panel-link">
              All appointments
            </Link>
          </div>
          <AppointmentList
            appointments={appointments}
            loading={loading && !error}
            busy={portal.busyAppointments}
            onConfirm={portal.confirmAppointment}
            onDecline={portal.declineAppointment}
            onComplete={portal.completeAppointment}
            emptyTitle="No appointments."
            emptyCopy="Bookings requested by parents will appear here."
          />
        </section>
      </div>
    </main>
  );
}
