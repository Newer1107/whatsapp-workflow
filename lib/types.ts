/**
 * Domain model for the WhatsApp school office portal.
 *
 * Vocabulary follows DESIGN.md section 4: a Thread is one continuous
 * conversation between the school number and one parent, keyed to the
 * parent (not the student); a thread can reference several students.
 *
 * All timestamps are ISO 8601 strings so a real backend can serialize them
 * the same way.
 */

export type ThreadStatus = "unread" | "open" | "routed" | "closed";

export type MessageDirection = "inbound" | "outbound";

/** Who wrote the message, shown on the timeline. */
export type MessageAuthor = "parent" | "attendant" | "system";

export interface Message {
  id: string;
  direction: MessageDirection;
  author: MessageAuthor;
  /** Plain text. Demo only; a real backend would ship an optional text payload. */
  body: string;
  at: string; // ISO 8601
}

export interface ParentRecord {
  id: string;
  name: string;
  phone: string;
  relation: string; // "Mother", "Father", "Guardian"
}

export interface StudentRecord {
  id: string;
  name: string;
  homeroom: string; // e.g. "7A"
  cohort: string; // e.g. "Year 7"
}

export interface Thread {
  id: string;
  parent: ParentRecord;
  students: StudentRecord[];
  status: ThreadStatus;
  /** Unanswered inbound messages waiting on the attendant. */
  unread: number;
  /** Destination when status === "routed". */
  routeTo?: string;
  /** Full message timeline, oldest first. */
  messages: Message[];
  /** Last activity on the thread (in or out). */
  lastActivityAt: string;
}

export interface OverviewMetrics {
  inboundToday: number;
  repliedToday: number;
  responseRatePct: number;
  avgFirstResponseMin: number;
  openThreads: number;
  /** Hour label with the most inbound traffic, e.g. "10:00". */
  busiestHour: string;
  /** Oldest unanswered message age in minutes; null when the queue is clear. */
  slaOldestMinutes: number | null;
}

export interface DayActivity {
  /** Short weekday label, e.g. "Mon". */
  day: string;
  /** ISO date (yyyy-mm-dd). */
  date: string;
  inbound: number;
  outbound: number;
}

export interface PortalStats {
  metrics: OverviewMetrics;
  weekly: DayActivity[];
}

/** A staff destination a thread can be routed to. */
export const ROUTE_TARGETS = [
  "Finance office",
  "Transport office",
  "Principal's office",
  "Attendance office",
] as const;

export type RouteTarget = (typeof ROUTE_TARGETS)[number];

/**
 * Staff event: an operational task raised by a parent message (absence,
 * late bus, pickup change, fee query) or by the office itself. It is the
 * work item that a thread produces, so it carries an optional link back to
 * the conversation it came from.
 */
export type EventStatus = "open" | "taken" | "escalated" | "resolved" | "cancelled";

export type EventPriority = "normal" | "urgent";

export interface StaffEvent {
  id: string;
  /** Short human title, e.g. "Absence — Aisha home sick". */
  title: string;
  /** Kind of event, e.g. "absence", "late bus", "pickup change". */
  kind: string;
  status: EventStatus;
  priority?: EventPriority;
  /** Who raised the event, when known. */
  parent?: ParentRecord;
  /** The student the event is about, when known. */
  student?: StudentRecord;
  /** Conversation this event came from, when linked. */
  threadId?: string;
  /** Staff member currently holding the event ("taken"). */
  assignedTo?: string;
  note?: string;
  createdAt: string; // ISO 8601
}

/** Appointment between the office and a parent/guardian. */
export type AppointmentStatus = "requested" | "confirmed" | "declined" | "completed" | "cancelled";

export interface Appointment {
  id: string;
  /** Short title, e.g. "Admissions tour", "Meeting with principal". */
  title: string;
  status: AppointmentStatus;
  parent: ParentRecord;
  student?: StudentRecord;
  startsAt: string; // ISO 8601
  endsAt?: string; // ISO 8601
  location?: string;
  note?: string;
}

/** Single payload of the live read endpoint. */
export interface PortalPayload {
  threads: Thread[];
  events: StaffEvent[];
  appointments: Appointment[];
  stats: PortalStats;
}
