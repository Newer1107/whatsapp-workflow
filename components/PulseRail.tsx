import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { PulseState } from "@/lib/logic";
import { pulseStateFor } from "@/lib/logic";

export type { PulseState };
export { pulseStateFor };

/**
 * 4px pulse rail. `incoming` plays one 600ms ping then settles to `unread`,
 * mirroring "ping, settle, ping" — the eye tracks message flow in one stroke.
 */
export default function PulseRail({ state, unread }: { state: PulseState; unread: number }) {
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (state === "incoming") {
      const id = setTimeout(() => setSettled(true), 620);
      return () => clearTimeout(id);
    }
    setSettled(false);
  }, [state]);

  const shown: PulseState = state === "incoming" && settled ? "unread" : state;
  const capped = Math.min(Math.max(unread, 1), 8); // scaleY capped at row height
  const style = { "--unread": capped } as CSSProperties;

  return (
    <div
      className="pulse-rail"
      data-pulse={shown}
      style={shown === "unread" ? style : undefined}
      aria-hidden="true"
    />
  );
}
