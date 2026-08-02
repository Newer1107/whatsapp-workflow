import type {
  Appointment,
  PortalPayload,
  PortalStats,
  RouteTarget,
  StaffEvent,
  Thread,
} from "./types";
import { parseAppointmentSlot } from "./logic";

/**
 * Data adapter for the live n8n webhook endpoints. The read endpoint returns
 * the whole desk in one payload; every office action POSTs a small JSON body
 * to the action endpoint. URLs are env-driven (NEXT_PUBLIC_*), never
 * hardcoded, and no credentials live in this repo.
 *
 * `mapRawPayload` and the `*Payload` builders are pure so the wire contract
 * is testable offline; only `fetchPortal` and `action` touch the network.
 */

const READ_API_URL = process.env.NEXT_PUBLIC_WHATSAPP_PORTAL_READ_API_URL;
const ACTION_API_URL = process.env.NEXT_PUBLIC_WHATSAPP_PORTAL_ACTION_API_URL;

/** Shape the read endpoint actually returns for events. */
export interface RawEvent {
  eventId: string;
  conversationKey?: string;
  type?: string;
  title?: string;
  body?: string;
  status: StaffEvent["status"];
  assignee?: string;
  createdAt: string;
}

/** Shape the read endpoint actually returns for appointments. */
export interface RawAppointment {
  appointmentId: string;
  conversationKey?: string;
  parentName?: string;
  studentName?: string;
  requestedSlot?: string;
  reason?: string;
  status: Appointment["status"] | "proposed";
  notes?: string;
  createdAt: string;
}

/** Shape the read endpoint returns for the whole desk. */
export interface RawPortalPayload {
  threads?: Thread[];
  events?: RawEvent[];
  appointments?: RawAppointment[];
  stats?: PortalStats;
}

const EMPTY_METRICS: PortalStats["metrics"] = {
  inboundToday: 0,
  repliedToday: 0,
  responseRatePct: 0,
  avgFirstResponseMin: 0,
  openThreads: 0,
  busiestHour: "",
  slaOldestMinutes: null,
};

function normalizeAppointmentStatus(status: RawAppointment["status"]): Appointment["status"] {
  return status === "proposed" ? "requested" : status;
}

/** Translate the raw wire shape into the UI domain model. Pure. */
export function mapRawPayload(raw: RawPortalPayload): PortalPayload {
  return {
    threads: raw.threads ?? [],
    events: (raw.events ?? []).map((event) => ({
      id: event.eventId,
      title: event.title || event.body || "Staff event",
      kind: event.type || "request",
      status: event.status,
      threadId: event.conversationKey || undefined,
      assignedTo: event.assignee || undefined,
      note: event.body || undefined,
      createdAt: event.createdAt,
    })),
    appointments: (raw.appointments ?? []).map((appointment) => ({
      id: appointment.appointmentId,
      title: appointment.reason || "Appointment request",
      status: normalizeAppointmentStatus(appointment.status),
      parent: {
        id: appointment.conversationKey || appointment.appointmentId,
        name: appointment.parentName || "Parent",
        phone: "",
        relation: "Parent",
      },
      student: appointment.studentName
        ? { id: appointment.studentName, name: appointment.studentName, homeroom: "", cohort: "" }
        : undefined,
      startsAt: parseAppointmentSlot(appointment.requestedSlot) ?? appointment.createdAt,
      note: appointment.notes || undefined,
    })),
    stats: raw.stats
      ? { metrics: raw.stats.metrics ?? EMPTY_METRICS, weekly: raw.stats.weekly ?? [] }
      : { metrics: EMPTY_METRICS, weekly: [] },
  };
}

async function portalRequest<T>(baseUrl: string | undefined, init?: RequestInit): Promise<T> {
  if (!baseUrl) {
    throw new Error("Missing WhatsApp portal API URL");
  }

  const response = await fetch(baseUrl, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Portal API returned ${response.status}`);
  }

  return (await response.json()) as T;
}

/** The live read endpoint returns the whole desk in one payload. */
export async function fetchPortal(): Promise<PortalPayload> {
  return mapRawPayload(await portalRequest<RawPortalPayload>(READ_API_URL));
}

/**
 * Action payload contracts — the exact JSON bodies POSTed to the action
 * endpoint. Pure and exported so tests pin the live workflow schema.
 */
export function replyPayload(threadId: string, body: string): Record<string, string> {
  return { action: "reply", conversationKey: threadId, body };
}

export function routePayload(threadId: string, routeTo: RouteTarget): Record<string, string> {
  return { action: "route", conversationKey: threadId, routeTo };
}

export function closePayload(threadId: string): Record<string, string> {
  return { action: "close", conversationKey: threadId };
}

export function escalatePayload(threadId: string): Record<string, string> {
  return { action: "escalate", conversationKey: threadId };
}

export function takeEventPayload(eventId: string): Record<string, string> {
  return { action: "event_take", eventId };
}

export function escalateEventPayload(eventId: string): Record<string, string> {
  return { action: "event_escalate", eventId };
}

export function resolveEventPayload(eventId: string): Record<string, string> {
  return { action: "event_resolve", eventId };
}

export function cancelEventPayload(eventId: string): Record<string, string> {
  return { action: "event_cancel", eventId };
}

export function confirmAppointmentPayload(appointmentId: string): Record<string, string> {
  return { action: "appointment_confirm", appointmentId, status: "confirmed" };
}

export function declineAppointmentPayload(appointmentId: string): Record<string, string> {
  return { action: "appointment_decline", appointmentId, status: "declined" };
}

export function completeAppointmentPayload(appointmentId: string): Record<string, string> {
  return { action: "appointment_complete", appointmentId, status: "completed" };
}

async function action(body: Record<string, string>): Promise<void> {
  await portalRequest(ACTION_API_URL, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function replyToThread(threadId: string, body: string): Promise<void> {
  return action(replyPayload(threadId, body));
}

export function routeThread(threadId: string, routeTo: RouteTarget): Promise<void> {
  return action(routePayload(threadId, routeTo));
}

export function closeThread(threadId: string): Promise<void> {
  return action(closePayload(threadId));
}

export function escalateThread(threadId: string): Promise<void> {
  return action(escalatePayload(threadId));
}

export function takeEvent(eventId: string): Promise<void> {
  return action(takeEventPayload(eventId));
}

export function escalateEvent(eventId: string): Promise<void> {
  return action(escalateEventPayload(eventId));
}

export function resolveEvent(eventId: string): Promise<void> {
  return action(resolveEventPayload(eventId));
}

export function cancelEvent(eventId: string): Promise<void> {
  return action(cancelEventPayload(eventId));
}

export function confirmAppointment(appointmentId: string): Promise<void> {
  return action(confirmAppointmentPayload(appointmentId));
}

export function declineAppointment(appointmentId: string): Promise<void> {
  return action(declineAppointmentPayload(appointmentId));
}

export function completeAppointment(appointmentId: string): Promise<void> {
  return action(completeAppointmentPayload(appointmentId));
}
