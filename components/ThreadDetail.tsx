import { useEffect, useRef, useState } from "react";
import type { Thread } from "@/lib/types";
import { ROUTE_TARGETS } from "@/lib/types";
import type { RouteTarget } from "@/lib/types";
import { fmtAgeMinutes, fmtFull, initials } from "@/lib/format";

interface ThreadDetailProps {
  thread: Thread;
  onBack: () => void;
  pending?: boolean;
  embedded?: boolean;
  onReply: (threadId: string, body: string) => void;
  onRoute: (threadId: string, target: RouteTarget) => void;
  onCloseThread: (threadId: string) => void;
  onEscalate: (threadId: string) => void;
}

const QUICK_REPLIES = [
  "Noted. We'll pass this to the right person and confirm shortly.",
  "Absence noted — no note needed unless your child is away more than 3 days.",
  "The finance office will share the balance within the hour.",
  "Thank you for letting us know.",
];

const IconBack = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

const IconBook = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

/**
 * Detail drawer/pane: parent sender, register context, full timeline, unread
 * divider, status, and Reply / Route / Close actions with an inline composer.
 */
export default function ThreadDetail({
  thread,
  onBack,
  pending = false,
  embedded = false,
  onReply,
  onRoute,
  onCloseThread,
  onEscalate,
}: ThreadDetailProps) {
  const [text, setText] = useState("");
  const [routeOpen, setRouteOpen] = useState(false);
  const [routeTarget, setRouteTarget] = useState<RouteTarget>(ROUTE_TARGETS[0]);
  const [closeOpen, setCloseOpen] = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  // Focus the composer when a conversation opens — reply-first flow.
  useEffect(() => {
    setText("");
    setRouteOpen(false);
    setCloseOpen(false);
    setEscalateOpen(false);
    const id = setTimeout(() => composerRef.current?.focus(), 80);
    return () => clearTimeout(id);
  }, [thread.id]);

  // Escape closes the drawer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack]);

  const last = thread.messages[thread.messages.length - 1];
  const waiting =
    (thread.status === "unread" || thread.status === "open") && last && last.direction === "inbound"
      ? Math.max(0, Math.round((Date.now() - new Date(last.at).getTime()) / 60_000))
      : null;
  const dividerAt = thread.unread > 0 ? Math.max(0, thread.messages.length - thread.unread) : -1;

  const send = () => {
    const body = text.trim();
    if (!body) return;
    onReply(thread.id, body);
    setText("");
    composerRef.current?.focus();
  };

  const confirmRoute = () => {
    onRoute(thread.id, routeTarget);
    setRouteOpen(false);
  };

  const confirmClose = () => {
    onCloseThread(thread.id);
    setCloseOpen(false);
  };

  const confirmEscalate = () => {
    onEscalate(thread.id);
    setEscalateOpen(false);
  };

  return (
    <>
      {!embedded && <div className="drawer-scrim" onClick={onBack} aria-hidden="true" />}
      <section
        className={embedded ? "thread-pane" : "thread-drawer"}
        role={embedded ? "region" : "dialog"}
        aria-modal={embedded ? undefined : "true"}
        aria-label={`Conversation with ${thread.parent.name}`}
      >
        {/* Header: sender, status, actions */}
        <header className="drawer-header">
          <div className="drawer-top">
            <button type="button" className="drawer-back" onClick={onBack} aria-label="Back to queue">
              <IconBack />
            </button>
            <div className="drawer-id">
              <p className="t-title">{thread.parent.name}</p>
              <div className="drawer-meta">
                <span>{thread.parent.relation}</span>
                <span className="drawer-phone">{thread.parent.phone}</span>
                <span aria-hidden="true">·</span>
                {thread.status === "unread" && <span className="badge badge-open">Unread</span>}
                {thread.status === "open" && <span className="badge badge-open">Open</span>}
                {thread.status === "routed" && (
                  <span className="badge badge-routed">Routed · {thread.routeTo}</span>
                )}
                {thread.status === "closed" && <span className="badge badge-closed">Closed</span>}
                {waiting !== null && (
                  <span className="badge badge-old">waiting {fmtAgeMinutes(waiting)}</span>
                )}
              </div>
            </div>
            <span className="initials" aria-hidden="true">
              {initials(thread.parent.name)}
            </span>
          </div>

          <div className="drawer-actions">
            <button
              type="button"
              className="btn btn-primary"
              disabled={pending}
              onClick={() => composerRef.current?.focus()}
            >
              Reply
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setRouteOpen((v) => !v);
                setCloseOpen(false);
                setEscalateOpen(false);
              }}
              aria-expanded={routeOpen}
              disabled={thread.status === "closed" || pending}
            >
              Route
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setEscalateOpen((v) => !v);
                setRouteOpen(false);
                setCloseOpen(false);
              }}
              aria-expanded={escalateOpen}
              disabled={thread.status === "closed" || pending}
            >
              Escalate
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setCloseOpen((v) => !v);
                setRouteOpen(false);
                setEscalateOpen(false);
              }}
              aria-expanded={closeOpen}
              disabled={thread.status === "closed" || pending}
            >
              Close
            </button>
          </div>

          {routeOpen && (
            <div className="inline-panel" role="group" aria-label="Route conversation">
              <p>Hand this conversation to another office. The parent's thread travels with it.</p>
              <select
                className="select"
                value={routeTarget}
                onChange={(e) => setRouteTarget(e.target.value as RouteTarget)}
                aria-label="Route to"
              >
                {ROUTE_TARGETS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <button type="button" className="btn btn-secondary btn-sm" disabled={pending} onClick={confirmRoute}>
                Confirm route
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRouteOpen(false)}>
                Cancel
              </button>
            </div>
          )}

          {escalateOpen && (
            <div className="inline-panel" role="group" aria-label="Escalate conversation">
              <p>Escalate this conversation to a supervisor? It stays open until someone picks it up.</p>
              <button type="button" className="btn btn-primary btn-sm" disabled={pending} onClick={confirmEscalate}>
                Escalate conversation
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEscalateOpen(false)}>
                Cancel
              </button>
            </div>
          )}

          {closeOpen && (
            <div className="inline-panel" role="group" aria-label="Close conversation">
              <p>Close this conversation? It will leave the queue and be marked resolved.</p>
              <button type="button" className="btn btn-secondary btn-sm" disabled={pending} onClick={confirmClose}>
                Close conversation
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCloseOpen(false)}>
                Cancel
              </button>
            </div>
          )}
        </header>

        {/* Register context strip */}
        <div className="context-strip">
          {thread.students.map((s) => (
            <div className="context-item" key={s.id}>
              <span className="context-icon">
                <IconBook />
              </span>
              <div>
                <div className="context-label">Student · register</div>
                <div className="context-value">{s.name}</div>
                <div className="context-note">
                  {s.cohort} · Homeroom {s.homeroom}
                </div>
              </div>
            </div>
          ))}
          <div className="context-item">
            <span className="context-icon">
              <IconBook />
            </span>
            <div>
              <div className="context-label">Thread</div>
              <div className="context-value">{thread.messages.length} messages</div>
              <div className="context-note">Last activity {fmtFull(thread.lastActivityAt)}</div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="timeline" aria-label="Message timeline">
          {thread.messages.map((m, i) => (
            <div key={m.id}>
              {i === dividerAt && (
                <div className="unread-divider" role="note">
                  {thread.unread} new since your last reply
                </div>
              )}
              <div className={`msg ${m.direction === "outbound" ? "outbound" : "inbound"} ${m.author === "system" ? "system" : ""}`}>
                <div className="msg-bubble">{m.body}</div>
                <div className="msg-meta">
                  <span className="msg-author">
                    {m.author === "parent"
                      ? thread.parent.name
                      : m.author === "attendant"
                        ? "Front desk"
                        : "System"}
                  </span>
                  <span>{fmtFull(m.at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Composer */}
        <footer className="composer">
          <div className="quick-replies" aria-label="Quick replies">
            {QUICK_REPLIES.map((q) => (
              <button type="button" key={q} className="qr" onClick={() => setText(q)}>
                {q.length > 44 ? `${q.slice(0, 44)}…` : q}
              </button>
            ))}
          </div>
          <div className="composer-row">
            <textarea
              ref={composerRef}
              className="composer-input"
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={`Reply to ${thread.parent.name.split(" ")[0]}…`}
              aria-label="Reply message"
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={send}
              disabled={text.trim().length === 0 || pending}
            >
              Send
            </button>
          </div>
          <div className="composer-foot">
            {text.length > 0 && (
              <span className="composer-count">{text.length} characters</span>
            )}
          </div>
        </footer>
      </section>
    </>
  );
}
