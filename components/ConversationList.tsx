import type { Thread } from "@/lib/types";
import { fmtRowTime, initials, isOld } from "@/lib/format";
import PulseRail, { pulseStateFor } from "@/components/PulseRail";

interface ConversationListProps {
  threads: Thread[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
  emptyTitle?: string;
  emptyCopy?: string;
}

/** Office queue: one button-row per thread with its pulse rail and unread. */
export default function ConversationList({
  threads,
  selectedId,
  onSelect,
  loading = false,
  emptyTitle = "No messages yet. The queue is quiet.",
  emptyCopy = "New parent messages will appear here, oldest unanswered first.",
}: ConversationListProps) {
  if (loading) {
    return (
      <div className="queue" role="status" aria-label="Loading conversations">
        {[0, 1, 2, 3].map((i) => (
          <div className="skeleton-row" key={i}>
            <div className="skeleton disc" />
            <div className="thread-main" style={{ flex: 1 }}>
              <div className="skeleton line w40" />
              <div className="skeleton line w60" style={{ marginTop: 8 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="empty">
        <p className="empty-title">{emptyTitle}</p>
        <p className="empty-copy">{emptyCopy}</p>
      </div>
    );
  }

  return (
    <div className="queue">
      {threads.map((t) => {
        const last = t.messages[t.messages.length - 1];
        const selected = t.id === selectedId;
        const old = last ? isOld(last.at) : false;
        return (
          <button
            type="button"
            key={t.id}
            className="thread-row"
            aria-selected={selected}
            onClick={() => onSelect(t.id)}
          >
            <span className="rail-slot">
              <PulseRail state={pulseStateFor(t, selected)} unread={t.unread} />
            </span>
            <span className="initials" aria-hidden="true">
              {initials(t.parent.name)}
            </span>
            <span className="thread-main">
              <span className="thread-top">
                <span className="thread-name">{t.parent.name}</span>
                {t.unread > 0 && (
                  <span className="unread-disc" aria-label={`${t.unread} unanswered`}>
                    {t.unread}
                  </span>
                )}
                <span className="thread-time">{last ? fmtRowTime(last.at) : "—"}</span>
              </span>
              <span className="thread-preview">{last ? last.body : ""}</span>
              <span className="thread-meta">
                {t.unread > 0 && <span className="badge badge-open">Unread</span>}
                {old && <span className="badge badge-old">old</span>}
                <span>
                  {t.students.map((s) => s.name).join(", ")} · {t.students.map((s) => s.homeroom).join(", ")}
                </span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
