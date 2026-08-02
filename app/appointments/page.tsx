"use client";

import { useState } from "react";
import type { Appointment, AppointmentStatus } from "@/lib/types";
import { usePortal } from "@/lib/use-portal";
import AppointmentList from "@/components/AppointmentList";

const STATUS_OPTIONS: { value: AppointmentStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "requested", label: "Requested" },
  { value: "confirmed", label: "Confirmed" },
  { value: "declined", label: "Declined" },
  { value: "completed", label: "Completed" },
];

export default function AppointmentsPage() {
  const [status, setStatus] = useState<AppointmentStatus | "all">("all");
  const portal = usePortal();
  const { appointments, loading, error, offline, retry, lastUpdated, actionError, clearActionError } = portal;

  const shown = status === "all" ? appointments : appointments.filter((a) => a.status === status);

  return (
    <main className="page">
      <section aria-label="Appointments">
        <h1 className="hero-title">Appointments</h1>
        <p className="hero-sub">
          Bookings and meetings requested by parents, upcoming first
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

      <div className="toolbar" role="group" aria-label="Filter appointments">
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
          {shown.length} {shown.length === 1 ? "appointment" : "appointments"}
        </span>
      </div>

      <AppointmentList
        appointments={shown}
        loading={loading && !error}
        busy={portal.busyAppointments}
        onConfirm={portal.confirmAppointment}
        onDecline={portal.declineAppointment}
        onComplete={portal.completeAppointment}
        emptyTitle="No appointments here yet."
        emptyCopy="Bookings requested by parents will appear here as they are made."
      />
    </main>
  );
}
