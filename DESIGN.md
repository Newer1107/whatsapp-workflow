# DESIGN.md: WhatsApp School Operations Portal

Status: contract (decision-complete, implementable as-is)
App: `whatsapp-portal/`, a standalone Next.js + React app, plain CSS.
This document is the single source of truth for look and feel. Every color,
size, and state below is a decision, not a suggestion.

---

## 1. The human and the job

The portal is a control room for the person who runs the school's WhatsApp
business number during office hours (roughly 8:00 to 16:00): the front desk
attendant, office coordinator, or admissions clerk. They sit at it for a
shift. Parents message it all day: absences, late buses, pickup changes, fee
queries, "is my child in class?".

What they must do, in order of frequency:

1. See what needs their attention right now, without clicking anything.
2. Reply fast with the parent's and student's context already on screen.
3. Route what they cannot answer (finance, transport, principal) without
   losing the thread.
4. Know, at all times, whether the system is handling a message or it is on
   them.

The feel is **calm and operational**. The office is noisy; the screen must not
add noise. Nothing blinks unless something is happening this second. Green
means "live, right now" and nothing else.

---

## 2. Goals

- **Glanceable backlog.** Unread volume and oldest-waiting message are
  readable from the corner of the eye.
- **Context without searching.** A parent's thread carries the student,
  homeroom, and recent history next to the conversation, not behind a lookup.
- **Legible flow.** Incoming message, agent replying, done: the eye follows the
  life of each thread in one motion.
- **Safe handoff.** Every thread can be routed, reassigned, or closed, and the
  route is visible on the row.

---

## 3. Design pillars

1. **Paper and ink.** The portal is a desk, not a stage. Warm off-white
   surfaces, ruled hairlines, graphite ink.
2. **Green is a signal, not a theme.** The WhatsApp green appears in exactly
   two places: live status and the primary action. Anywhere else is a bug.
3. **Flow over charts.** The signature is the conversation pulse rail. There
   are no decorative animated charts.
4. **Every state is designed.** Loading, empty, stale, error, and offline are
   explicit, never browser defaults.

This is the deliberate opposite of the voice-agent dashboard in `frontend/`
(dark graphite `#0d0d0f`, blue `#3B82F6` accent, animated recharts cards,
uppercase micro-labels). Two screens may never be open and confused with each
other: one is the night shift, this is the morning office.

---

## 4. Domain vocabulary

Shared names for UI copy and code identifiers.

| Term | Meaning |
|---|---|
| Thread | One continuous conversation between the school number and one parent/guardian, possibly covering several students |
| Parent | The human on the other side; threads are keyed to the parent, not the student |
| Student | The child the thread is about; a thread can reference several |
| Cohort / homeroom | The student's class group, shown for identity, never as a grouping control |
| Register | The canonical student/parent record the thread pulls context from |
| Unread backlog | Messages that arrived with no reply or no acknowledgement yet |
| Live | A message is moving through the system right now (streaming in, agent typing, tool running) |
| Typing | The automated attendant is composing a reply |
| Routed | The thread was handed to a named human or another office |
| Closed | Thread resolved; it leaves the queue |
| SLA | Oldest unanswered message age; visible per thread, one summary in the header |
| Office queue | The conversation list itself |
| Quick reply | A staff-authored saved answer inserted into the composer |

UI copy rules: sentence case everywhere, plain verbs ("Reply", "Route",
"Close"). No "wow", no exclamation marks in system text, no uppercase labels.

---

## 5. Color world

Where the palette comes from, not what we applied: the school office desk in
the morning. Cream paper and ruled notebook lines, pencil graphite, kraft
paper on the notice board, and the single small green WhatsApp dot that means
"online right now". The palette is warm because the room is warm; green is
rare because in the real room it is rare.

### Palette

| Token | Value | Use |
|---|---|---|
| `--paper` | `#FAF7F2` | Page base. Warm cream, never pure white |
| `--paper-raised` | `#FFFDF8` | Cards, panes, surfaces above the base |
| `--paper-inset` | `#F1EBE0` | Inputs and fields; slightly darker, reads "type here" |
| `--ink` | `#2E2A24` | Primary text, unread badges, filled controls. Warm near-black |
| `--ink-2` | `#5C564C` | Secondary text |
| `--ink-3` | `#8A837A` | Muted text: timestamps, helper copy |
| `--ink-faint` | `#B8B1A5` | Disabled text, placeholder |
| `--line` | `#E5DED1` | Standard hairline border, ruled-notebook feel |
| `--line-soft` | `#EFE9DE` | Softer separation (list dividers) |
| `--line-strong` | `#C9BEAC` | Emphatic border: hover rows, focus rings |
| `--green` | `#00A884` | Live status + primary action. Nothing else |
| `--green-strong` | `#00876C` | Primary action hover/pressed |
| `--green-soft` | `#E4F4EE` | Tint behind live-status text and pulse rails |
| `--moss` | `#5F7A48` | Semantic success (confirmed, verified). Never pulses; stays quiet so the bright green keeps its meaning |
| `--ochre` | `#B07E2A` | Semantic warning (about to time out) |
| `--brick` | `#B3502F` | Semantic error. Warm brick, part of the ink world, not a cold red |
| `--shadow` | `#3A332A` | Only for raised overlays (modal scrim uses it as low-alpha black) |

Semantics: `--green` is reserved for *liveness* (message streaming, agent
typing, connection online) and the *primary action*. Unread volume, verified
states, and success use ink and `--moss` so the bright green keeps meaning by
rarity. Contrast: `--ink` on `--paper` is ~13:1; `--ink-2` on `--paper` is
~7:1; `--ink-3` on `--paper` is ~4.5:1 (muted, not used for essential data).

---

## 6. Signature: the conversation pulse rail

The one element that makes this product this product: a 4px vertical rail on
the left edge of every thread row. It shows message flow and unread state in
one stroke of ink and green.

### Anatomy

```
┌──────────────────────────────┐
│ │  Ritu Sharma   · 09:41     │   ← rail (4px) + row
│ │  Absence: Aisha home sick  │
└──────────────────────────────┘
```

The rail is a real column (16px wide including gutters, the 4px line centered
in it), rendered in plain CSS, no canvas.

### Rail states (exact)

| State | Visual | Motion |
|---|---|---|
| `idle` | 1px hairline `--line` | none |
| `incoming` | 4px `--green` segment, brief downward ping | one `translateY` ping, 600ms, ease-out, then settles to static `--green` while the message is live |
| `live` | 4px static `--green` | none (green is already the signal) |
| `typing` | 4px `--green` with a 6px `--green-strong` dot at its foot | dot bobs up/down 12px, 900ms ease-in-out, infinite, opacity 0.35 to 1 |
| `unread` | 4px `--ink` fill that grows from the bottom of the rail with the unread count, capped at the row height | fill animates `scaleY` from 0, 200ms; the unread count badge beside it stays static |
| `routed` | 4px `--ink-3` with a 2px gap (broken line via `background-image` gradient) | none |
| `closed` | 1px `--line-soft`, no fill | none |

Rules:

- `incoming` fires once per message and settles to `live`; a second message
  replays it. This is the "flow" the eye tracks: ping, settle, ping.
- `unread` overrides `live` when there is unanswered backlog: ink fill means
  "on you", green means "in motion". They never fight; unread wins.
- `typing` only appears on the thread the attendant is reading or replying to.
- Motion is `transform` and `opacity` only, GPU-composited, and fully disabled
  under `prefers-reduced-motion` (states collapse to their static colors).

### Implementation contract

- One `div.pulse-rail` per row, `width: 4px; border-radius: 999px`.
- State as data attributes: `data-pulse="idle|incoming|live|typing|unread|routed|closed"`.
- Fill height via `transform: scaleY(calc(var(--unread) * 0.1))` with
  `transform-origin: bottom` so the CSS variable carries the count.
- Keyframes defined once, referenced by all rows; no per-row animation
  definitions.

---

## 7. Tokens (exact CSS)

Declared once in `:root`, consumed everywhere. Values from section 5 plus
sizing, radius, elevation, and motion tokens.

```css
:root {
  /* color */
  --paper: #FAF7F2; --paper-raised: #FFFDF8; --paper-inset: #F1EBE0;
  --ink: #2E2A24; --ink-2: #5C564C; --ink-3: #8A837A; --ink-faint: #B8B1A5;
  --line: #E5DED1; --line-soft: #EFE9DE; --line-strong: #C9BEAC;
  --green: #00A884; --green-strong: #00876C; --green-soft: #E4F4EE;
  --moss: #5F7A48; --ochre: #B07E2A; --brick: #B3502F; --shadow: #3A332A;

  /* type */
  --font-serif: ui-serif, Georgia, "Times New Roman", serif;
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  --font-mono: ui-monospace, "SF Mono", "Cascadia Mono", Consolas, monospace;

  /* spacing: 4px base */
  --sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px;
  --sp-5: 20px; --sp-6: 24px; --sp-8: 32px; --sp-10: 40px; --sp-12: 48px;

  /* radius: sharp, like paper corners */
  --r-sm: 4px; --r-md: 8px; --r-lg: 12px; --r-full: 999px;

  /* layout */
  --pane-list: 360px;      /* conversation list width */
  --pane-inspector: 300px; /* right inspector width */
  --content-max: 720px;    /* composer / thread text column */

  /* motion */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --dur-fast: 120ms; --dur-base: 200ms; --dur-ping: 600ms;

  /* elevation: borders only, no drop shadows */
  --border-standard: 1px solid var(--line);
  --border-soft: 1px solid var(--line-soft);
  --border-strong: 1px solid var(--line-strong);
}
```

Depth strategy: **borders-only**. Elevation comes from surface color shifts
(`--paper` < `--paper-raised` < `--paper-inset`) plus hairlines. The single
drop shadow (`--shadow` at low alpha) exists only for modal overlays and the
toast stack, never for resting cards.

---

## 8. Typography

Three stacks, each with a job, none of them webfonts (no downloads, no layout
shift, no dependency):

- `--font-serif` for the masthead and the school name. Institutional, like the
  letterhead. Used for the app title and empty-state headlines only.
- `--font-sans` for everything interactive and readable. The system stack
  stays calm and renders instantly.
- `--font-mono` for numerals that must align in columns: timestamps, counts,
  SLAs, unread badges. Tabular by construction.

### Scale

| Step | Size / weight / line-height | Use |
|---|---|---|
| `t-display` | 24px / 600 / 1.3, serif | Empty states, section titles in the inspector |
| `t-title` | 17px / 600 / 1.4, sans | Thread row parent name, pane headers |
| `t-body` | 15px / 400 / 1.5, sans | Message text, row previews. Base size |
| `t-label` | 13px / 500 / 1.4, sans | Field labels, button text, tab labels |
| `t-meta` | 12px / 400 / 1.4, sans | Timestamps, helper copy, SLA |
| `t-mono` | 13px / 500 / 1.4, mono | Counts, times, unread badges |

Rules:

- Sentence case everywhere. No uppercase labels, no letterspaced micro-type
  (that is the voice dashboard's dialect; we do not speak it).
- Message text and row previews cap at `65ch`; the thread column is
  `--content-max`.
- `letter-spacing` stays `0` except `-0.01em` on `t-display`.
- Emphasis in message previews: `font-weight: 600` on the parent name only.
  No color emphasis in body copy.

---

## 9. Spacing and layout

Base unit is 4px (`--sp-1`). Stack in multiples: 4, 8, 12, 16, 20, 24, 32,
40, 48. No off-scale values anywhere.

### The three panes

```
┌──────────────────────────────────────────────────────────┐
│ App bar  [School name · Live ● · SLA 2 · Search · Clock] │
├──────────────┬──────────────────────────┬────────────────┤
│ Office queue │ Thread                   │ Inspector      │
│ (360px)      │ (flex, ≤720px text)      │ (300px)        │
│ pulse rails  │ messages + composer      │ student record │
│ unread first │                          │ quick replies  │
├──────────────┴──────────────────────────┴────────────────┤
```

- **Office queue** (`--pane-list`): the list of threads, sorted by oldest
  unanswered first (SLA order), each row with its pulse rail. This is the
  operator's primary surface.
- **Thread**: selected conversation. Messages read top to bottom with a quiet
  ruled divider between turns, composer pinned to the bottom.
- **Inspector** (`--pane-inspector`): register context for the thread's
  parent and students: names, homeroom, recent history, routing status,
  quick replies. Collapsible; closed by default on load when the window is
  under 1280px.
- **App bar**: the school name in serif, a single live indicator (green dot +
  "Live"), one SLA summary ("2 unanswered · oldest 09:41"), search, and the
  office clock. No icons in the bar except the live dot; search is a plain
  input.

Row rhythm: rows are `--sp-3` tall content with `--sp-3` vertical padding and
`--sp-4` horizontal, separated by `--border-soft` dividers. Panes separate
with `--border-standard` on the shared edge, never two different borders on
the same seam.

---

## 10. Depth and surface

- One elevation rule: base `--paper`, raised `--paper-raised`, inset
  `--paper-inset`. Cards and panes are `--paper-raised` with `--border-standard`.
  Inputs are `--paper-inset` with `--border-standard`, and darken text fills
  as you type.
- No drop shadows on resting elements. No gradients anywhere. No glass, no
  blur, no translucency (the office is opaque and so is this UI).
- Radius: controls `--r-sm` (4px), panes and cards `--r-md` (8px), the pulse
  rail and unread badges `--r-full`. Sharp corners belong to tables and the
  queue list (radius 0), like a register page.
- Hover is a surface change, not a glow: rows shift to `--paper-inset`,
  buttons darken by one step.

---

## 11. Component states

Every interactive element defines default, hover, active/pressed,
focus-visible, and disabled. Every data surface defines loading, empty,
error, and stale.

### Buttons

| Kind | Default | Hover | Pressed | Disabled |
|---|---|---|---|---|
| Primary (the one green action, e.g. "Send") | `--green` bg, `#FFF` text | `--green-strong` | `--green-strong`, 1px down via transform | 40% opacity, `not-allowed` cursor |
| Secondary (e.g. "Route") | `--paper-raised`, `--border-standard`, `--ink` text | `--paper-inset` | `--paper-inset` + `--border-strong` | 40% opacity |
| Ghost (e.g. "Close") | transparent, `--ink-2` text | `--paper-inset` | `--paper-inset` + `--line-strong` text | 40% opacity |

Focus-visible for all: 2px `--line-strong` outline, 2px offset, no glow.
`*:disabled { cursor: not-allowed; }` applies globally.

### Thread row (queue)

Default: `--paper` bg, parent name `--ink` t-title, preview `--ink-2` t-body
truncated to one line, timestamp `--ink-3` t-meta. Unread adds the ink badge
(filled `--ink` disc, `--paper` count text) beside the name and the rail fill.
Hover: `--paper-inset`. Selected: `--paper-raised` with `--border-strong` on
the left inside edge. Reading the row clears its unread badge.

### Inputs and composer

Default: `--paper-inset` bg, `--border-standard`, `--ink` text, placeholder
`--ink-faint`. Focus: `--border-strong` border (no ring, no glow). Disabled:
`--ink-faint` text, `--line-soft` border. The composer shows a live character
count in `--ink-3` t-meta only while the attendant types; the Send button is
the page's only `--green` element.

### Badges

Unread: filled `--ink` disc, `--paper` mono count. Routed: outline chip,
`--ink-3` border and text. Verified/success: `--moss` text on `--green-soft`?
No: verified uses `--moss` text, transparent bg, check glyph only. Live:
`--green` text on `--green-soft`. Error: `--brick` text on a `--paper-inset`
strip, never a red flash.

### Data states

| State | Behavior |
|---|---|
| Loading (queue/thread) | Skeleton rows: 1px `--line-soft` blocks on `--paper-raised`, no spinner except a small one in the composer while sending |
| Empty (no threads) | Serif t-display headline + one sentence in `--ink-2`, centered in the pane. "No messages yet. The queue is quiet." |
| Error (API down) | `--brick` strip across the top of the pane with the action "Retry"; the rail collapses to `idle` hairlines. The office still reads the last loaded data beneath it |
| Stale | Timestamps > 24h render in `--ink-3` with a faint `--ochre` "old" tag on the row; the SLA summary flags oldest-waiting in `--ochre` |

### Live indicator (app bar)

A 6px `--green` dot with a 2px `--green` ring at 40% opacity that breathes
(opacity only, 2s, ease-in-out) while the connection is up. Static `--ink-3`
dot when offline, with the word "Offline" replacing "Live".

### Motion rules

- Incoming ping: `--dur-ping` (600ms) ease-out, one shot.
- All other motion: `--dur-fast` or `--dur-base`, `--ease-out`.
- `prefers-reduced-motion: reduce` kills all animation and keeps static color
  states, matching the pattern already used in `frontend/app/globals.css`.

---

## 12. Responsive rules

Breakpoints: `640px` (mobile), `1024px` (tablet), `1280px` (desktop). The
portal is designed desktop-first because it is a fixed-desk tool, then
degrades honestly.

| Width | Behavior |
|---|---|
| ≥1280px | Three panes. Inspector open by default |
| 1024 to 1279px | Three panes, inspector collapsed to a slide-over opened from the thread header |
| 640 to 1023px | Two panes: queue and thread. Selecting a thread opens the thread over the queue with a back affordance in the app bar |
| <640px | Thread-first: the queue becomes a pull-down sheet; the pulse rail stays on every queue row so unread is visible before opening; the composer remains full-width and pinned |

Any width: the pulse rail is always present on queue rows; unread must never
require opening the thread. The inspector is never a full-screen page on
mobile; it stays an overlay so the conversation is never lost.

---

## 13. Rejected defaults (what this is not)

Named against the voice-agent dashboard in `frontend/` and generic admin
patterns, so nobody "improves" the portal back into them:

1. **Dark graphite + blue accent** → rejected for warm paper + ink. The voice
   dashboard owns the night; this portal owns the morning.
2. **`#3B82F6` blue anywhere** → rejected. The only signal color is the
   WhatsApp green, and only for liveness and the primary action.
3. **Animated recharts metric cards** → rejected. No decorative charts.
   Metrics are type: big tabular numerals, `--ink` on `--paper`.
4. **Uppercase letterspaced micro-labels** → rejected. Sentence case, no
   tracking.
5. **Pure-white cards on colored backgrounds, drop shadows on cards** →
   rejected. Warm `--paper-raised` surfaces with ruled hairlines.
6. **Status-chip spam** (a badge on every row for every state) → rejected.
   States live in the pulse rail and ink; one badge per row max, unread only.
7. **Avatars and circular photos everywhere** → rejected. Initials on a
   `--paper-inset` disc, register-style; one per thread.
8. **Confetti, emoji, gradients, glassmorphism** → rejected outright. The
   office is opaque, quiet, and does not celebrate.
9. **"Modern dashboard" boilerplate copy** → rejected. Copy is plain and
   operational: "Reply", "Route", "No messages yet."

---

## 14. Implementation notes (Next.js + React + plain CSS)

- One `:root` token block (section 7) in a single `tokens.css` imported by the
  app layout. No CSS-in-JS, no Tailwind for the portal, no new dependencies.
- Theme is light-only by decision: the voice dashboard is the dark screen, the
  portal is the light screen, and the pair is the distinction. Do not add a
  dark mode to v1.
- The pulse rail is one component (section 6) driven by data attributes;
  every state is a class or `data-pulse` value, no per-row animation
  definitions.
- Motion is `transform`/`opacity` keyframes only, and the global
  `prefers-reduced-motion` guard (same pattern as the existing app) collapses
  every animation to its static color state.
- Fonts are system stacks (section 8): no font files, no preload, no layout
  shift.
- Demo data arrives later behind an API adapter. Screens must render every
  state (section 11) with mock data from day one so the adapter has nothing
  new to teach the UI.
- Definition of done for any screen: all states render (default, hover,
  focus, disabled, loading, empty, error, stale), the pulse rail honors its
  states, contrast holds to the section 5 floor, and the screen reads calm at
  a glance from across the office.

