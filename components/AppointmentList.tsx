import type { Appointment } from "@/lib/types";
import { fmtClock, fmtFull, initials } from "@/lib/format";
import { splitByTime } from "@/lib/logic";

interface AppointmentListProps {
  appointments: Appointment[];
  loading?: boolean;
  /** Appointment ids with an action in flight — their buttons disable. */
  busy?: ReadonlySet<string>;
  onConfirm: (id: string) => void;
  onDecline: (id: string) => void;
  onComplete: (id: string) => void;
  emptyTitle?: string;
  emptyCopy?: string;
}

const STATUS_LABEL: Record<Appointment["status"], string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  declined: "Declined",
  completed: "Completed",
  cancelled: "Cancelled",
};

function AppointmentBadge({ status }: { status: Appointment["status"] }) {
  return <span className={`badge badge-appt-${status}`}>{STATUS_LABEL[status]}</span>;
}

function AppointmentRow({
  appointment,
  busy,
  onConfirm,
  onDecline,
  onComplete,
}: {
  appointment: Appointment;
  busy: boolean;
  onConfirm: (id: string) => void;
  onDecline: (id: string) => void;
  onComplete: (id: string) => void;
}) {
  return (
    <div className="appointment-row">
      <span className="appointment-when">
        <span className="appointment-day">{fmtFull(appointment.startsAt)}</span>
        {appointment.endsAt && <span className="appointment-end">to {fmtClock(appointment.endsAt)}</span>}
      </span>
      <span className="appointment-main">
        <span className="event-top">
          <span className="appointment-title">{appointment.title}</span>
          <AppointmentBadge status={appointment.status} />
        </span>
        <span className="event-meta">
          <span className="event-person">
            <span className="initials-sm" aria-hidden="true">
              {initials(appointment.parent.name)}
            </span>
            {appointment.parent.name} · {appointment.parent.relation}
            {appointment.student ? ` · ${appointment.student.name} (${appointment.student.homeroom})` : ""}
          </span>
          {appointment.location && <span>· {appointment.location}</span>}
        </span>
        {appointment.status === "requested" && (
          <span className="event-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={busy}
              onClick={() => onConfirm(appointment.id)}
            >
              Confirm
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm ghost-danger"
              disabled={busy}
              onClick={() => onDecline(appointment.id)}
            >
              Decline
            </button>
          </span>
        )}
        {appointment.status === "confirmed" && (
          <span className="event-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={busy}
              onClick={() => onComplete(appointment.id)}
            >
              Complete
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm ghost-danger"
              disabled={busy}
              onClick={() => onDecline(appointment.id)}
            >
              Decline
            </button>
          </span>
        )}
      </span>
    </div>
  );
}

/** Appointment ledger: upcoming first, then past, each with the actions its
 *  status allows. */
export default function AppointmentList({
  appointments,
  loading = false,
  busy,
  onConfirm,
  onDecline,
  onComplete,
  emptyTitle = "No appointments.",
  emptyCopy = "Bookings and meetings requested by parents will appear here.",
}: AppointmentListProps) {
  if (loading) {
    return (
      <div className="appointments" role="status" aria-label="Loading appointments">
        {[0, 1, 2].map((i) => (
          <div className="appointment-row" key={i}>
            <div className="appointment-main">
              <div className="skeleton line w60" />
              <div className="skeleton line w40" style={{ marginTop: 8 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="empty">
        <p className="empty-title">{emptyTitle}</p>
        <p className="empty-copy">{emptyCopy}</p>
      </div>
    );
  }

  const { upcoming, past } = splitByTime(appointments);

  return (
    <div className="appointments">
      {upcoming.length > 0 && <h3 className="list-section-title">Upcoming</h3>}
      {upcoming.map((a) => (
        <AppointmentRow
          key={a.id}
          appointment={a}
          busy={busy?.has(a.id) ?? false}
          onConfirm={onConfirm}
          onDecline={onDecline}
          onComplete={onComplete}
        />
      ))}
      {past.length > 0 && <h3 className="list-section-title">Past</h3>}
      {past.map((a) => (
        <AppointmentRow
          key={a.id}
          appointment={a}
          busy={busy?.has(a.id) ?? false}
          onConfirm={onConfirm}
          onDecline={onDecline}
          onComplete={onComplete}
        />
      ))}
    </div>
  );
}
