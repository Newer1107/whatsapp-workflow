import Link from "next/link";
import type { StaffEvent } from "@/lib/types";
import { fmtFull, initials } from "@/lib/format";

interface EventListProps {
  events: StaffEvent[];
  loading?: boolean;
  /** Event ids with an action in flight — their buttons disable. */
  busy?: ReadonlySet<string>;
  onTake: (id: string) => void;
  onEscalate: (id: string) => void;
  onResolve: (id: string) => void;
  onCancel: (id: string) => void;
  emptyTitle?: string;
  emptyCopy?: string;
}

const STATUS_LABEL: Record<StaffEvent["status"], string> = {
  open: "Open",
  taken: "Taken",
  escalated: "Escalated",
  resolved: "Resolved",
  cancelled: "Cancelled",
};

function EventBadge({ status }: { status: StaffEvent["status"] }) {
  return <span className={`badge badge-${status}`}>{STATUS_LABEL[status]}</span>;
}

/** Staff event worklist: one row per event with its state rail and the
 *  actions that status allows. Every action posts through the adapter. */
export default function EventList({
  events,
  loading = false,
  busy,
  onTake,
  onEscalate,
  onResolve,
  onCancel,
  emptyTitle = "No events yet.",
  emptyCopy = "New events raised from parent messages will appear here.",
}: EventListProps) {
  if (loading) {
    return (
      <div className="events" role="status" aria-label="Loading events">
        {[0, 1, 2].map((i) => (
          <div className="event-row" key={i}>
            <div className="event-main">
              <div className="skeleton line w60" />
              <div className="skeleton line w40" style={{ marginTop: 8 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="empty">
        <p className="empty-title">{emptyTitle}</p>
        <p className="empty-copy">{emptyCopy}</p>
      </div>
    );
  }

  return (
    <div className="events">
      {events.map((event) => {
        const active = event.status === "open" || event.status === "taken" || event.status === "escalated";
        const pending = busy?.has(event.id) ?? false;
        return (
          <div className="event-row" key={event.id}>
            <span className="event-rail" data-status={event.status} aria-hidden="true" />
            <span className="event-main">
              <span className="event-top">
                <span className="event-title">{event.title}</span>
                <EventBadge status={event.status} />
              </span>
              <span className="event-meta">
                <span className="event-kind">{event.kind}</span>
                {event.priority === "urgent" && <span className="badge badge-urgent">urgent</span>}
                <span>{fmtFull(event.createdAt)}</span>
                {event.assignedTo && <span>· with {event.assignedTo}</span>}
              </span>
              <span className="event-context">
                {event.parent && (
                  <span className="event-person">
                    <span className="initials-sm" aria-hidden="true">
                      {initials(event.parent.name)}
                    </span>
                    {event.parent.name}
                    {event.student ? ` · ${event.student.name} (${event.student.homeroom})` : ""}
                  </span>
                )}
                {!event.parent && event.student && (
                  <span className="event-person">
                    {event.student.name} ({event.student.homeroom})
                  </span>
                )}
                {event.threadId && (
                  <Link className="event-thread-link" href={`/conversations?thread=${event.threadId}`}>
                    Open conversation
                  </Link>
                )}
              </span>
              {active && (
                <span className="event-actions">
                  {event.status === "open" && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={pending}
                      onClick={() => onTake(event.id)}
                    >
                      Take
                    </button>
                  )}
                  {event.status !== "escalated" && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      disabled={pending}
                      onClick={() => onEscalate(event.id)}
                    >
                      Escalate
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={pending}
                    onClick={() => onResolve(event.id)}
                  >
                    Resolve
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm ghost-danger"
                    disabled={pending}
                    onClick={() => onCancel(event.id)}
                  >
                    Cancel
                  </button>
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
