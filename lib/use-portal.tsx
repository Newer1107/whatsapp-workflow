"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Appointment, PortalPayload, PortalStats, RouteTarget, StaffEvent, Thread } from "@/lib/types";
import {
  cancelEvent,
  closeThread,
  completeAppointment,
  confirmAppointment,
  declineAppointment,
  escalateEvent,
  escalateThread,
  fetchPortal,
  replyToThread,
  resolveEvent,
  routeThread,
  takeEvent,
} from "@/lib/data";

const POLL_MS = 5000;

/**
 * Busy keys for in-flight actions, one per logical target so a double click
 * (or Enter + click) can never issue two POSTs for the same item.
 */
export const BUSY_THREAD_PREFIX = "thread:";
export const BUSY_EVENT_PREFIX = "event:";
export const BUSY_APPOINTMENT_PREFIX = "appointment:";

export interface PortalState {
  threads: Thread[];
  events: StaffEvent[];
  appointments: Appointment[];
  stats: PortalStats | null;
  loading: boolean;
  error: boolean;
  offline: boolean;
  retry: () => void;
  lastUpdated: number | null;
  actionError: string | null;
  clearActionError: () => void;
  selectedId: string | null;
  select: (id: string | null) => void;
  selected: Thread | null;
  /** Thread ids with an action in flight — disable their buttons. */
  busyThreads: ReadonlySet<string>;
  /** Event ids with an action in flight — disable their buttons. */
  busyEvents: ReadonlySet<string>;
  /** Appointment ids with an action in flight — disable their buttons. */
  busyAppointments: ReadonlySet<string>;
  reply: (threadId: string, body: string) => void;
  route: (threadId: string, target: RouteTarget) => void;
  close: (threadId: string) => void;
  escalate: (threadId: string) => void;
  take: (eventId: string) => void;
  escalateEvent: (eventId: string) => void;
  resolveEvent: (eventId: string) => void;
  cancelEvent: (eventId: string) => void;
  confirmAppointment: (appointmentId: string) => void;
  declineAppointment: (appointmentId: string) => void;
  completeAppointment: (appointmentId: string) => void;
}

/**
 * Owns the whole office desk: threads, events, appointments and stats,
 * polled every 5 seconds. A failed poll after a successful load flips to
 * `offline` while keeping the last data; a failed first load is `error`.
 * Every mutation posts through the action adapter, then reloads.
 *
 * This is the single poll/state source. AppShell and every page consume it
 * via `usePortal`; nothing fetches the read endpoint on its own.
 */
export function PortalProvider({ children }: { children: ReactNode }) {
  const [payload, setPayload] = useState<PortalPayload | null>(null);
  const [error, setError] = useState(false);
  const [offline, setOffline] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const hasData = useRef(false);
  const inFlight = useRef(false);
  const busyKeys = useRef<Set<string>>(new Set());
  const [busy, setBusy] = useState<ReadonlySet<string>>(() => new Set());

  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const data = await fetchPortal();
      hasData.current = true;
      setPayload(data);
      setError(false);
      setOffline(false);
      setLastUpdated(Date.now());
    } catch {
      if (hasData.current) {
        setOffline(true);
      } else {
        setError(true);
      }
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  /** Post an action once. The key stays busy through the follow-up reload so
   *  a repeated click is ignored instead of double-submitting. */
  const run = useCallback(
    async (key: string, mutate: () => Promise<void>) => {
      if (busyKeys.current.has(key)) return;
      busyKeys.current.add(key);
      setBusy(new Set(busyKeys.current));
      setActionError(null);
      try {
        await mutate();
      } catch {
        setActionError("The action did not reach the office. Check the connection and try again.");
      }
      await load();
      busyKeys.current.delete(key);
      setBusy(new Set(busyKeys.current));
    },
    [load],
  );

  const reply = useCallback((threadId: string, body: string) => void run(BUSY_THREAD_PREFIX + threadId, () => replyToThread(threadId, body)), [run]);
  const route = useCallback((threadId: string, target: RouteTarget) => void run(BUSY_THREAD_PREFIX + threadId, () => routeThread(threadId, target)), [run]);
  const close = useCallback((threadId: string) => void run(BUSY_THREAD_PREFIX + threadId, () => closeThread(threadId)), [run]);
  const escalate = useCallback((threadId: string) => void run(BUSY_THREAD_PREFIX + threadId, () => escalateThread(threadId)), [run]);

  const take = useCallback((eventId: string) => void run(BUSY_EVENT_PREFIX + eventId, () => takeEvent(eventId)), [run]);
  const escalateOne = useCallback((eventId: string) => void run(BUSY_EVENT_PREFIX + eventId, () => escalateEvent(eventId)), [run]);
  const resolve = useCallback((eventId: string) => void run(BUSY_EVENT_PREFIX + eventId, () => resolveEvent(eventId)), [run]);
  const cancel = useCallback((eventId: string) => void run(BUSY_EVENT_PREFIX + eventId, () => cancelEvent(eventId)), [run]);

  const confirm = useCallback((appointmentId: string) => void run(BUSY_APPOINTMENT_PREFIX + appointmentId, () => confirmAppointment(appointmentId)), [run]);
  const decline = useCallback((appointmentId: string) => void run(BUSY_APPOINTMENT_PREFIX + appointmentId, () => declineAppointment(appointmentId)), [run]);
  const complete = useCallback((appointmentId: string) => void run(BUSY_APPOINTMENT_PREFIX + appointmentId, () => completeAppointment(appointmentId)), [run]);

  const selected = payload?.threads.find((t) => t.id === selectedId) ?? null;

  const state = useMemo<PortalState>(() => {
    const busyThreads = new Set<string>();
    const busyEvents = new Set<string>();
    const busyAppointments = new Set<string>();
    for (const key of busy) {
      if (key.startsWith(BUSY_THREAD_PREFIX)) busyThreads.add(key.slice(BUSY_THREAD_PREFIX.length));
      else if (key.startsWith(BUSY_EVENT_PREFIX)) busyEvents.add(key.slice(BUSY_EVENT_PREFIX.length));
      else if (key.startsWith(BUSY_APPOINTMENT_PREFIX)) busyAppointments.add(key.slice(BUSY_APPOINTMENT_PREFIX.length));
    }
    return {
      threads: payload?.threads ?? [],
      events: payload?.events ?? [],
      appointments: payload?.appointments ?? [],
      stats: payload?.stats ?? null,
      loading: payload === null && !error,
      error,
      offline,
      retry: () => void load(),
      lastUpdated,
      actionError,
      clearActionError: () => setActionError(null),
      selectedId,
      select: setSelectedId,
      selected,
      busyThreads,
      busyEvents,
      busyAppointments,
      reply,
      route,
      close,
      escalate,
      take,
      escalateEvent: escalateOne,
      resolveEvent: resolve,
      cancelEvent: cancel,
      confirmAppointment: confirm,
      declineAppointment: decline,
      completeAppointment: complete,
    };
  }, [payload, error, offline, lastUpdated, actionError, selectedId, selected, busy, load, reply, route, close, escalate, take, escalateOne, resolve, cancel, confirm, decline, complete]);

  return <PortalContext.Provider value={state}>{children}</PortalContext.Provider>;
}

const PortalContext = createContext<PortalState | null>(null);

export function usePortal(): PortalState {
  const ctx = useContext(PortalContext);
  if (!ctx) {
    throw new Error("usePortal must be used within a PortalProvider");
  }
  return ctx;
}
