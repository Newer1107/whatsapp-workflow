"use client";

import { useState } from "react";
import type { RouteTarget, Thread } from "@/lib/types";
import ConversationList from "@/components/ConversationList";
import ThreadDetail from "@/components/ThreadDetail";
import ThreadInspector from "@/components/ThreadInspector";

interface ConversationsDeskProps {
  threads: Thread[];
  selectedId: string | null;
  selectedThread?: Thread | null;
  onSelect: (id: string | null) => void;
  loading?: boolean;
  emptyTitle?: string;
  emptyCopy?: string;
  busyThreads: ReadonlySet<string>;
  onReply: (threadId: string, body: string) => void;
  onRoute: (threadId: string, target: RouteTarget) => void;
  onCloseThread: (threadId: string) => void;
  onEscalate: (threadId: string) => void;
}

export default function ConversationsDesk({
  threads,
  selectedId,
  selectedThread,
  onSelect,
  loading = false,
  emptyTitle,
  emptyCopy,
  busyThreads,
  onReply,
  onRoute,
  onCloseThread,
  onEscalate,
}: ConversationsDeskProps) {
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const selected = selectedThread ?? threads.find((t) => t.id === selectedId) ?? null;
  const deskClass = [
    "desk",
    selected ? "has-thread" : "",
    inspectorOpen ? "inspector-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={deskClass}>
      <div className="desk-pane desk-queue" role="region" aria-label="Conversation queue">
        <ConversationList
          threads={threads}
          selectedId={selectedId}
          onSelect={(id) => {
            onSelect(id);
            setInspectorOpen(false);
          }}
          loading={loading}
          emptyTitle={emptyTitle}
          emptyCopy={emptyCopy}
        />
      </div>

      <div className="desk-pane desk-thread" role="region" aria-label="Conversation thread">
        {selected ? (
          <ThreadDetail
            thread={selected}
            embedded
            onBack={() => onSelect(null)}
            pending={busyThreads.has(selected.id)}
            onReply={onReply}
            onRoute={onRoute}
            onCloseThread={onCloseThread}
            onEscalate={onEscalate}
          />
        ) : (
          <div className="desk-empty">
            <p className="hero-sub">Select a conversation to read and reply.</p>
          </div>
        )}
      </div>

      <div className="desk-pane desk-inspector" role="region" aria-label="Register">
        <ThreadInspector
          thread={selected}
          onClose={inspectorOpen ? () => setInspectorOpen(false) : undefined}
        />
      </div>

      <button
        type="button"
        className="inspector-toggle"
        aria-expanded={inspectorOpen}
        onClick={() => setInspectorOpen((v) => !v)}
      >
        {inspectorOpen ? "Hide" : "Show"} register
      </button>
    </div>
  );
}
