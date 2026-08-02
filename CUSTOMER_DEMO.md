# Customer demonstration guide

Use this script to demonstrate the school office product to a principal,
administrator, or owner. Keep the portal open on one screen and WhatsApp or
the n8n execution view on a second screen.

## Demo story

The story has two people:

- **Parent**: reports an absence or asks for staff help. The office replies,
  routes the conversation, and creates a follow-up event.
- **Visitor**: asks about admissions or a school tour. The office records the
  enquiry and shows how it can be handed to the admissions team.

The demo workflow returns simulated replies only. It is intentionally safe for
sales calls and does not send WhatsApp messages or write to the school portal.

## Start the portal locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. For a production-like demonstration:

```bash
npm run typecheck
npm test
npm run build
npm start
```

## Parent demo

### Spoken story

> “A parent sends a message that their child is absent today. The office sees
> it in the queue, replies once, and leaves a clear record for the next staff
> member.”

### Suggested actions

1. Open `/` and select the oldest parent conversation.
2. Click **Reply** and send:

```text
Thank you for letting us know. We have recorded the absence and the office
will follow up if anything else is needed.
```

3. Open `/events` and show the follow-up event.
4. Resolve the event and refresh the queue.

### What to point out

- The parent is not lost in a personal inbox.
- The reply, event, status, and timestamp are visible to the whole office.
- A manager can review the work without opening WhatsApp message by message.

## Visitor demo

### Spoken story

> “A visitor wants to know how to enquire about the school. The office can
> capture the request, route it to admissions, and keep the next action clear.”

### Suggested actions

1. Open `/conversations`.
2. Select a visitor or admissions enquiry.
3. Use **Route** and choose the admissions or front-office queue.
4. Open `/appointments` and demonstrate confirming or declining a tour slot.

### What to point out

- Admissions enquiries become work items instead of disappearing in chat.
- The office can see requested slots and current appointment status.
- The same workflow can later connect to a verified school knowledge base.

## Safe n8n demo requests

The customer demo workflow is available at the live n8n instance as
`School Office Customer Demo` (`pEx4LoXFx31HW1aS`). Its production endpoint is:

```text
https://n8n.raunaktech.site/webhook/22d2d497-619b-47d8-ac4e-71047d537929/school-office-demo/conversation
```

It accepts `POST` JSON:

```bash
curl -X POST "https://n8n.raunaktech.site/webhook/22d2d497-619b-47d8-ac4e-71047d537929/school-office-demo/conversation" \
  -H "Content-Type: application/json" \
  -d '{"persona":"parent","message":"My child is absent today"}'
```

## Sales conversation scripts

These are the best live prompts to use when showing a school owner what the
system replaces: repeated phone calls, untracked WhatsApp messages, and manual
handoffs between admissions and the front desk.

### Script A: admissions enquiry to booked meeting

Send or say:

```text
I am moving my child to your school next term. What documents and fees should I prepare?
```

Then follow up:

```text
Please book an admissions meeting for 10 August at 4pm. Student: Aarav Mehta. Parent: Neha Mehta.
```

Open `/conversations` to show the context and `/appointments` to show the
office record. The selling point is the complete journey from question to
qualified admissions follow-up.

### Script B: one parent, two office teams

```text
My daughter is absent today and I also need to ask about the school bus for tomorrow.
```

Then:

```text
Please send the bus question to the transport office and keep the absence noted for the front desk.
```

Open `/events` and `/conversations`. Explain that staff see actionable work,
not just a long chat transcript.

### Script C: sensitive escalation with a private follow-up

```text
I need to report a serious concern about a teacher. I do not want to repeat the details to several people.
```

Then:

```text
The teacher is Mr Sharma, my child is Rishit Singh, and it happened today. Please mark this urgent and ask the principal's office to follow up privately.
```

Show the priority event and its source conversation. This demonstrates careful
handoff, not an AI pretending to investigate. For a real safeguarding case,
always follow the school's official safeguarding process as well.

### Script D: complex office-day request

```text
I have three things: tell me the Grade 5 admission documents, note that my son will be absent tomorrow, and help me book a meeting with admissions next Tuesday afternoon.
```

When asked for details:

```text
Student: Kabir Mehta. Parent: Poonam Mehta. Book the meeting for 3pm if available.
```

Show the conversation, event/request, and appointment views in that order. This
is the strongest demonstration of replacing several separate office calls.

### Script E: safe clarification

```text
Book an appointment for tomorrow morning.
```

Wait for the agent to ask for the purpose and names, then provide them. This
shows the system gathers missing details instead of inventing a booking.

For resilience, also try:

```text
Book an appointment for yesterday at 3pm.
```

The production-safe behavior is to ask for a corrected future slot. Never use
an invalid or past booking as a successful customer demonstration.

## What to say while demonstrating

- “The agent answers the routine question immediately.”
- “It remembers the parent and student when the booking details arrive.”
- “The office gets a record that can be confirmed, routed, or followed up.”
- “The conversation is still visible, so staff do not lose context.”
- “For sensitive or uncertain cases, it hands off instead of pretending.”

Do not promise exact fees, appointment availability, or safeguarding outcomes
unless those facts are connected to the school's approved source of truth.

Visitor example:

```bash
curl -X POST "https://n8n.raunaktech.site/webhook/22d2d497-619b-47d8-ac4e-71047d537929/school-office-demo/conversation" \
  -H "Content-Type: application/json" \
  -d '{"persona":"visitor","message":"I want to learn about admissions"}'
```

Expected response shape:

```json
{
  "ok": true,
  "persona": "visitor",
  "receivedMessage": "I want to learn about admissions",
  "reply": "...",
  "nextStep": "..."
}
```

The workflow has no credentials and no external side effects. Replace its
simulated response nodes only when the owner approves connecting a real school
knowledge base or notification channel.

## Value-add conversation points

- **Service continuity:** staff can take over without asking the parent to
  repeat the story.
- **Accountability:** every action has a timestamp and a visible state.
- **SLA visibility:** the queue makes unanswered work and ageing conversations
  obvious.
- **Human control:** sensitive complaints remain staff events and are not
  falsely marked as resolved by AI.
- **Future expansion:** admissions, transport, fee questions, attendance, and
  appointment requests can share the same action contract.

## Before handing it to a customer

- Verify the Meta WhatsApp credential in n8n. An expired token causes office
  reply actions to fail even when the portal request itself is valid.
- Verify both n8n webhook URLs in `.env.local` before building the image.
- Run the production checklist in `README.md`.
- Demonstrate one successful reply, one route, and one event resolution.
- Never use a real student's sensitive information in a sales demo.
