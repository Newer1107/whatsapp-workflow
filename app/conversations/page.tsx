"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ThreadStatus } from "@/lib/types";
import { usePortal } from "@/lib/use-portal";
import ConversationsDesk from "@/components/ConversationsDesk";

const STATUS_OPTIONS: { value: ThreadStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "unread", label: "Unread" },
  { value: "routed", label: "Routed" },
  { value: "closed", label: "Closed" },
];

export default function ConversationsPage() {
  return (
    <Suspense fallback={<main className="page" />}>
      <ConversationsPageInner />
    </Suspense>
  );
}

function ConversationsPageInner() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<ThreadStatus | "all">("all");

  const portal = usePortal();
  const { threads, loading, error, offline, retry, lastUpdated, actionError, clearActionError, selected, select } =
    portal;

  const shown = status === "all" ? threads : threads.filter((t) => t.status === status);

  // The queue deep-link (?thread=) selects the right conversation on load.
  // Guarded by a ref so a manual list selection is never overridden.
  const urlThread = searchParams?.get("thread") ?? "";
  const handledUrl = useRef<string | null>(null);
  useEffect(() => {
    if (urlThread && handledUrl.current !== urlThread && threads.some((t) => t.id === urlThread)) {
      handledUrl.current = urlThread;
      select(urlThread);
    }
  }, [urlThread, threads, select]);

  return (
    <main className="page">
      <section aria-label="Conversations">
        <h1 className="hero-title">Conversations</h1>
        <p className="hero-sub">
          Live WhatsApp threads with parents, oldest unanswered first
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

      <div className="toolbar" role="group" aria-label="Filter conversations">
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
          {shown.length} {shown.length === 1 ? "conversation" : "conversations"}
        </span>
      </div>

      <ConversationsDesk
        threads={shown}
        selectedId={selected?.id ?? null}
        selectedThread={selected}
        onSelect={select}
        loading={loading && !error}
        emptyTitle="No conversations here yet."
        emptyCopy="Live threads with parents will appear here as they arrive."
        busyThreads={portal.busyThreads}
        onReply={portal.reply}
        onRoute={portal.route}
        onCloseThread={portal.close}
        onEscalate={portal.escalate}
      />
    </main>
  );
}
