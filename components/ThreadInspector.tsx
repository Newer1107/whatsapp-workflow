"use client";

import type { Thread } from "@/lib/types";
import { fmtFull } from "@/lib/format";

interface ThreadInspectorProps {
  thread: Thread | null;
  onClose?: () => void;
}

export default function ThreadInspector({ thread, onClose }: ThreadInspectorProps) {
  return (
    <div className="inspector">
      <div className="inspector-head">
        <span className="inspector-title">Register</span>
        {onClose && (
          <button type="button" className="inspector-close" onClick={onClose} aria-label="Close register">
            ×
          </button>
        )}
      </div>

      {!thread ? (
        <div className="inspector-section">
          <p className="hero-sub">Select a conversation to see the register entry.</p>
        </div>
      ) : (
        <>
          <div className="inspector-section">
            <div className="inspector-heading">PARENT</div>
            <div className="context-item">
              <div className="context-label">{thread.parent.relation}</div>
              <div className="context-value">{thread.parent.name}</div>
              <div className="context-note">{thread.parent.phone}</div>
            </div>
          </div>

          <div className="inspector-section">
            <div className="inspector-heading">STUDENTS</div>
            {thread.students.length === 0 ? (
              <p className="hero-sub">No students linked to this thread.</p>
            ) : (
              <div className="ledger">
                {thread.students.map((s) => (
                  <div className="ledger-row" key={s.id}>
                    <span className="ledger-label">{s.cohort}</span>
                    <span className="ledger-value">
                      {s.name} · {s.homeroom}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="inspector-section">
            <div className="inspector-heading">THREAD</div>
            <div className="ledger">
              <div className="ledger-row">
                <span className="ledger-label">Status</span>
                <span className="ledger-value">
                  {thread.status === "unread" ? "Unread" : thread.status === "open" ? "Open" : thread.status === "routed" ? `Routed · ${thread.routeTo}` : "Closed"}
                </span>
              </div>
              <div className="ledger-row">
                <span className="ledger-label">Unanswered</span>
                <span className="ledger-value">{thread.unread}</span>
              </div>
              <div className="ledger-row">
                <span className="ledger-label">Messages</span>
                <span className="ledger-value">{thread.messages.length}</span>
              </div>
              <div className="ledger-row">
                <span className="ledger-label">Last activity</span>
                <span className="ledger-value">{fmtFull(thread.lastActivityAt)}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
