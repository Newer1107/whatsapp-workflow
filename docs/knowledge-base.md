# Seth Govardhan Biyani School (SGBS) — Knowledge Base for WhatsApp Chatbot

**Purpose:** This document is the single source of truth for anyone building or training the SGBS WhatsApp chatbot. It contains everything the bot needs to know about the school, plus notes on what it should and should not say.

**Last updated:** August 2026
**Owner:** Suvaran Agrawal, Marketing Head, SGBS

---

## 0. How to use this document

- **Sections 1–9** are public-facing facts. The bot can share any of this freely with parents.
- **Section 10** is the admission process — the bot should guide parents through it stage by stage.
- **Section 11** is a ready-made FAQ bank written in parent language. Use these as intent/response pairs.
- **Section 12** covers escalation — what the bot must never answer on its own.
- **Section 13** records information status — what has been filled in, what is generic (and marked as "confirm with office"), and what is intentionally left out (fee structure). Anything the bot is not allowed to guess must be routed to a human per §12.

**Bot persona:** Warm, clear, respectful. Addresses parents as "you," never over-promises, never quotes fees or dates that aren't in this document. Short WhatsApp-length replies (2–5 lines) with an option to get more detail.

---

## 1. School identity

| Field | Detail |
|---|---|
| Full name | Seth Govardhan Biyani School |
| Short name / abbreviation | SGBS |
| Also known as | SGB, DeepJyoti School, Seth Govardhan Biyani International School |
| Brand line | "DeepJyoti School powered by SGB" |
| Board | ICSE |
| Grades offered | Nursery through Grade 10 |
| Location | Mira Road (East), Mumbai, Maharashtra |
| Parent organisation | Biyani's Education Group |
| Website | www.sgbis.in |
| Email | sgbinternationalschool@gmail.com |
| Email (alt) | reachus@deepjyotischool.org |
| Phone (admissions) | +91 7045288224 |
| Address | Poonam Sagar Road, next to New Municipal Hospital, Poonam Sagar Complex, Mira Road East, Mumbai, Maharashtra 401107 |
| Google Maps | https://maps.app.goo.gl/n8WACYgbaZueMH5p9 |
| Instagram | @sgbs_mumbai (verified) |

**Important naming note for the bot:** The entire school runs under **one name — Seth Govardhan Biyani School** — across all grades. It is *not* split into separately-named schools by grade band. If a parent asks "is DeepJyoti a different school?" the answer is no: it is the same school, same campus, same management.

**Credibility anchor:** SGBS is backed by the established name of Biyani's Education Group. Whenever a parent expresses doubt about the school being new, the bot should lead with the Group's track record and the option to visit the campus or watch the school tour video.

---

## 2. Leadership

| Role | Name |
|---|---|
| Director, Biyani's Education Group | Yashvardhan Biyani |
| Admissions approval authority | Shamashree ma'am *(internal — see §12)* |

---

## 3. Academic structure, grade by grade

The **Reggio Emilia-inspired approach runs across the entire school — Nursery through Grade 10**, not just in pre-primary. This is the single most important curriculum point. Most schools apply Reggio only to early years; SGBS carries the philosophy all the way up.

### Pre-primary — Nursery, Junior KG, Senior KG
- Reggio Emilia-inspired, heavily activity-based learning
- **No textbooks.** Children have only an art book, craft stationery, and notebooks for writing skills
- Each child has their own personal space in the classroom where their stationery stays at school
- Classrooms open directly to the outdoors — children can step outside without walking through the building
- Outdoor pottery unit
- Farmland access on the same floor

### Grades 1–4 — the "No Bag Model"
- Children do not carry bags to and from school. Lockers are provided outside the classrooms
- **Exam-free.** Assessment is done through CCE (Continuous and Comprehensive Evaluation)
- **Urban farming is mandatory** for these grades
- Classrooms fitted with high-end projectors

### Grades 5–6
- Continue in regular classrooms with high-end projectors
- Additions to the curriculum: **Financial Literacy, Olympiad preparation, and Coding**
- No lockers at this stage (lockers are for Grades 1–4)

### Grades 7–10 — the "No Classroom Model"
- Students do not have a fixed classroom. They move to a **dedicated subject lab** for each subject, the way a university runs
- **8 subject labs:** Mathematics, Physics, Chemistry, Biology, AI, STEM & Robotics, Lingual, Political Science
- All labs are equipped with **AI smart boards**

### Age eligibility (by grade)

| Grade | Age range |
|---|---|
| Playgroup | 2.5 – 3.5 years |
| Nursery | 3.5 – 4.5 years |
| Junior KG | 4.5 – 5.5 years |
| Senior KG | 5.5 – 6.5 years |
| Grade I onwards | 6.5 years and above |

*Age is counted as of the admission cut-off date for the academic year; the admissions team confirms the exact cut-off for each intake.*

---

## 4. Faculty and class size

- **Teacher-to-student ratio: 1:30**
- **Class size capped at 30 children** — no class exceeds this
- All teachers hold **at least a BA degree** and bring years of classroom experience
- The school positions its faculty as expert faculty

---

## 5. Campus, floor by floor

The building has four levels. This is also the exact walk order used in the school tour video.

### Ground floor
- Nursery, Junior KG and Senior KG classrooms
- Each pre-primary classroom has a door leading directly outside the building
- Pottery unit, set up outdoors just outside the building
- Farmland (used for the urban farming programme)

### First floor
- **All subject labs:** Physics, Chemistry, Biology, Maths, Lingual, Political Science
- Two Grade 1 classrooms, with lockers placed outside the classrooms

### Second floor
- Classrooms for Grades 2 to 6
- Lockers outside classrooms for Grades 2, 3 and 4

### Third floor
- **AI lab** (doubles as the computer lab)
- **STEM and Robotics lab**
- **Auditorium** — stage, two podiums for student debates, projector, high-end speakers, and a full mirror across the back wall for dance practice

---

## 6. Facilities

| Facility | Status |
|---|---|
| School ground | Available. SGBS is education-oriented rather than sports-oriented — it is not a full competitive sports ground |
| Library | Under development, expected ready by **October 2026** |
| Canteen | Coming **October–November 2026**, in place for next year's admissions |
| Medical room | Available on campus |
| School transport | Buses available |
| CCTV | Every corner of the school covered, except washrooms |
| Drinking water | RO setup on alternate floors — first and third |
| Washrooms | On all four floors (ground, first, second, third) |
| Projectors | In all Grade 1–6 classrooms |
| AI smart boards | In all labs |

**Handling the sports question honestly:** If a parent asks about sports facilities, the bot should not oversell. Correct framing: the school has a ground and runs inter-house sports competitions, but its focus and investment are on academics, labs and experiential learning. Parents looking for a sports-first school should know this upfront — it saves everyone's time.

---

## 7. Student life

### Houses
Four houses, all named after trees:
- **Maple**
- **Cedar**
- **Oak**
- **Teak**

Inter-house competitions run right through the year — debate, sports, and others. Houses accumulate points across the year, and the winning house is awarded by the school at year end. **A house is assigned automatically** to every child on admission through the school ERP.

### Student elections
The school runs **proper student elections using EVM machines that the students built themselves in school.** This is a strong differentiator — it demonstrates the STEM and civic-learning philosophy in one story. The bot should use this whenever a parent asks "what makes your school different?"

---

## 8. Key differentiators (USP summary for quick bot replies)

When a parent asks the broad question — "why should I choose SGBS?" — these are the eight points to draw from:

1. **Reggio Emilia-inspired across all grades**, Nursery to Grade 10, not just pre-primary
2. **No Bag Model** for Grades 1–4 — lockers, no daily bag load
3. **Exam-free CCE assessment** for Grades 1–4
4. **No Classroom Model** for Grades 7–10 — 8 dedicated subject labs with AI smart boards
5. **Mandatory urban farming** with real farmland on campus
6. **Financial literacy, coding and Olympiad prep** built into Grades 5–6
7. **Student-built EVMs and real student elections**
8. **1:30 ratio, classes capped at 30**, ICSE board, backed by Biyani's Education Group

---

## 9. Marketing assets the bot can send

| Asset | Use |
|---|---|
| School brochure (Nursery–Grade 10, single document) | Send on request, or with the welcome message |
| School tour video (10–15 min, English voiceover, features Yashvardhan sir on camera) | Send to parents who cannot visit the campus in person. A QR code for this video also appears on the printed brochure |
| Instagram @sgbs_mumbai | Share for day-to-day school life and activity content |

---

## 10. Admission process — step by step

The school's ERP/app is **Edusprint**, which handles lead capture, the admission form, approvals, payment links and house assignment. The process is deliberately automation-heavy because the admin team is small — the chatbot should carry as much of the front end as possible.

### Stage 1 — Inquiry
Three channels, handled differently:

| Channel | What happens |
|---|---|
| **Walk-in** | Details captured on an iPad directly into Edusprint. Parent receives **login credentials + welcome email** |
| **Telephonic** | Details taken on the call. Parent receives **welcome email only**, and is asked to visit the school |
| **Social media** | Leads imported from Instagram/Facebook into Edusprint. **Welcome email only** — no credentials issued |

*The WhatsApp chatbot becomes a fourth channel and should be mapped into Edusprint the same way.*

**The welcome email contains:** school information, the school tour video, and the brochure.

### Stage 2 — Admission form
- Parent logs in to Edusprint
- Pays **Rs 1,000** for the admission form
- Gets **3 working days** to complete and submit the form (it is a long form — tell parents this upfront so they set aside time)

### Stage 3 — Internal review
- The submitted form goes to Shamashree ma'am for a decision on whether the child is taken forward
- On approval, the parent receives an email with the **interaction appointment schedule** and a **gate pass**

### Stage 4 — Interaction and readiness test
- **Who attends:** the child and **both parents**. If the parents are divorced, one parent. If the child is an orphan, the legal guardian
- **Readiness test:** held for every child, covering **English and Math**, approximately **30 minutes**

### Stage 5 — Final approval and payment
- After the interaction and test, Shamashree ma'am gives the final go-ahead, marked on Edusprint
- Parent receives a **payment link in the app** with **72 hours** to pay:
  - **One-time admission fee** — non-refundable
  - **Security deposit** — refundable
  - **First installment** of fees
- Payment modes under consideration: UPI/GPay, bank transfer, debit/credit card and DD. The final list will be confirmed together with the fee structure before launch.

### Stage 6 — Post-admission handover
The family receives a **handbook** covering:
- Important dates, school start date, annual vacations and holidays
- Rules on attendance, bus charges, dispersal, uniform, bag, homework, PTA and PTM
- Book list

Then:
- A **house is assigned automatically** via Edusprint
- The child is handed their **bag, books and ID card**

---

## 11. FAQ bank — parent questions and approved answers

These are written the way a parent actually asks them. Use them directly as intent/response pairs.

### About the school

**Q: Which board is the school affiliated to?**
A: We are an ICSE school, offering classes from Nursery through Grade 10.

**Q: Where is the school located?**
A: We are at Poonam Sagar Road, next to New Municipal Hospital, Poonam Sagar Complex, Mira Road East, Mumbai, Maharashtra 401107. Here's our location on Google Maps: https://maps.app.goo.gl/n8WACYgbaZueMH5p9

**Q: Is DeepJyoti School the same as SGBS?**
A: Yes — same school, same campus. We operate under one name, Seth Govardhan Biyani School, across all grades. "DeepJyoti School powered by SGB" is our brand line.

**Q: The school is new — how do I know it's reliable?**
A: SGBS is run by Biyani's Education Group, an established name in education. The best way to judge for yourself is to visit the campus — we would be happy to arrange a tour. If you can't come in person, we can send you our full school tour video.

**Q: What makes your school different from others in the area?**
A: A few things: our Reggio Emilia-inspired approach runs across every grade, not just pre-primary. Grades 1–4 are bag-free and exam-free. Grades 7–10 don't have fixed classrooms at all — students move to 8 dedicated subject labs. Every child does urban farming on our own campus farmland. And our students run real elections using EVM machines they built themselves.

**Q: How many children are there in a class?**
A: Classes are capped at 30 children, with a 1:30 teacher-to-student ratio.

**Q: What are the qualifications of the teachers?**
A: All our teachers hold at least a BA degree and bring years of teaching experience.

### About academics

**Q: Do children have to carry a school bag?**
A: Not in Grades 1 to 4 — we follow a No Bag Model, with lockers outside every classroom.

**Q: Are there exams in the lower grades?**
A: Grades 1 to 4 are exam-free. We use CCE — Continuous and Comprehensive Evaluation — instead.

**Q: What is the No Classroom Model?**
A: From Grade 7 to Grade 10, students don't sit in one fixed classroom. They move to a dedicated lab for each subject — Maths, Physics, Chemistry, Biology, AI, STEM & Robotics, Lingual and Political Science. All eight labs have AI smart boards.

**Q: Do you teach coding?**
A: Yes. Coding is introduced from Grade 5, alongside Financial Literacy and Olympiad preparation. We also have a dedicated AI lab and a STEM & Robotics lab.

**Q: Do pre-primary children have textbooks or homework?**
A: No textbooks for pre-primary. Children have an art book, craft stationery, and notebooks for writing skills. The approach is heavily activity-based.

**Q: What is urban farming?**
A: We have farmland on our campus, and Grades 1 to 4 do urban farming as a mandatory part of the curriculum — children actually grow things.

### About facilities

**Q: Is there a library?**
A: Our library is currently under development and will be ready by October 2026.

**Q: Is there a canteen?**
A: A canteen is being set up and will be in place by October–November 2026.

**Q: How good are the sports facilities?**
A: We have a school ground and run inter-house sports competitions through the year. That said, we're an education-oriented school — our main investment is in academics, labs and experiential learning rather than competitive sports.

**Q: Is the school safe?**
A: We have CCTV coverage in every corner of the school other than washrooms, a medical room on campus, and controlled entry with gate passes for visitors.

**Q: Is transport available?**
A: Yes, we have school buses. Routes and charges depend on your location and the academic year — our admissions team will confirm the route available for your address. You can reach them at +91 7045288224.

**Q: What are the school timings?**
A: School timings are set by grade band and follow the academic calendar. For exact start and end times for your child's grade, please contact the admissions team at +91 7045288224.

**Q: What about drinking water?**
A: RO drinking water is available on campus.

### About admissions

**Q: How do I apply?**
A: The first step is an inquiry — you can visit the school, call us, or share your details right here. We'll send you a welcome email with our brochure and school tour video, and set up your login for the admission form.

**Q: What does the admission form cost?**
A: The admission form fee is Rs 1,000, paid through our app.

**Q: How long do I get to fill the form?**
A: You get 3 working days from payment. It's a detailed form, so please set aside some time for it.

**Q: Is there an entrance test?**
A: Every child takes a readiness test of about 30 minutes, covering English and Math. There is also an interaction with the child and parents.

**Q: Do both parents need to come for the interaction?**
A: Yes, both parents attend along with the child. If the parents are divorced, one parent may attend. For a child under legal guardianship, the guardian attends.

**Q: What are the fees?**
A: The complete fee structure for the upcoming academic year is being finalised and has not been published yet. Once it is confirmed, it will be shared here. For any fee queries, please contact the admissions team at +91 7045288224 and they will guide you. *(The bot must never quote a fee amount other than the Rs 1,000 admission form fee — §12.)*

**Q: When do admissions open / what is the deadline?**
A: Admissions for the academic year typically open around October–November and run through the first half of the year, subject to seat availability. For the exact opening and closing dates for your child's grade, please contact the admissions team at +91 7045288224.

**Q: Can I visit the school?**
A: Yes, absolutely — we'd encourage it. Campus visits and tours are available on request; you can reach the admissions team at +91 7045288224 to schedule a visit. If you can't come in person, we can send you our school tour video.

**Q: What age does my child need to be for admission?**
A: We take children from 2.5 years onwards: Playgroup (2.5–3.5 years), Nursery (3.5–4.5), Junior KG (4.5–5.5), Senior KG (5.5–6.5), and Grade I onwards from 6.5 years. The admissions team confirms the exact cut-off date for each intake.

---

## 12. What the bot must NOT do

1. **Never quote a fee amount other than the Rs 1,000 admission form fee.** All other fees must be routed to a human until §13 is filled in.
2. **Never confirm or deny admission.** Admission decisions are made internally after the form review, the interaction and the readiness test. The bot only explains the process.
3. **Never name internal staff to parents.** Approval names like Shamashree ma'am are for internal workflow only — the bot should say "our admissions team" or "the school."
4. **Never guess.** If a question isn't covered in this document, the answer is: *"Let me get that confirmed for you — someone from our admissions team will reply shortly."* Then hand off.
5. **Never promise a seat, a specific class section, a house, or a bus route.**
6. **Never share another parent's or child's information.**
7. **Don't oversell sports, library or canteen** — the library and canteen are dated commitments (Oct/Nov 2026), and should be stated as such.

**Escalation triggers — hand to a human immediately:**
- Any fee, discount, scholarship or refund question
- Complaints, grievances, or anything involving a specific child's welfare
- Transfer certificates or mid-year admissions
- Medical or special-needs requirements
- Anything a parent asks twice that the bot hasn't answered satisfactorily

---

## 13. Information status — what is filled and what is intentionally left out

### Filled (confirmed)

- [x] **Full postal address** with landmark and Google Maps pin — Poonam Sagar Road, next to New Municipal Hospital, Poonam Sagar Complex, Mira Road East, Maharashtra 401107. Maps: https://maps.app.goo.gl/n8WACYgbaZueMH5p9
- [x] **Phone number(s)** — +91 7045288224 (admissions help line). Office hours: Monday–Saturday, 9:00 AM – 5:00 PM (generic; confirm with school)
- [x] **Email** — sgbinternationalschool@gmail.com
- [x] **Age eligibility by grade** with cutoff — Playgroup 2.5–3.5, Nursery 3.5–4.5, Junior KG 4.5–5.5, Senior KG 5.5–6.5, Grade I onwards 6.5+ (§3)

### Filled (generic, typical Indian school — bot may use, but flag as "please confirm with the office")

- [x] **School timings** — Pre-primary typically 9:00 AM – 12:30 PM; Grades 1–10 typically 8:00 AM – 2:30 PM (generic; confirm per grade before quoting)
- [x] **Admission calendar** — applications open around October–November, academic year begins June (generic; confirm exact dates)
- [x] **Documents required for admission** — birth certificate, previous school's report card / transfer certificate (for Grades 2+), parent photo ID, child's photographs, address proof (generic; confirm exact list)
- [x] **Uniform details** — uniform is prescribed by the school and is typically sourced from an authorized vendor; cost and list shared at admission (generic)
- [x] **School bus routes / transport charges** — buses cover Mira Road and surrounding areas; routes and charges depend on location and are confirmed by the transport office (generic; confirm coverage)
- [x] **Visiting hours / tour booking** — visits by appointment via +91 7045288224 (generic)
- [x] **Year established / ICSE affiliation number** — ICSE-affiliated; affiliation number and establishment year available on request from the admissions office (generic; confirm exact values)
- [x] **Mid-year / transfer admission policy** — generally allowed subject to seat availability and an interaction/readiness check; transfer certificate required (generic; confirm with office)
- [x] **Class strength / seat availability** — classes capped at 30 (§4); current seat availability per grade confirmed by the admissions team (generic)
- [x] **After-school activities / clubs** — inter-house competitions throughout the year, student elections, plus the labs and experiential programmes described in §3–§7 (generic; confirm current club list)
- [x] **Results / achievements** — student-built EVMs and house system are the flagship differentiators (§7); specific board results / Olympiad wins on request (generic)
- [x] **Hindi and Marathi support** — Yes, the bot should respond in Hindi and Marathi if the parent writes in those languages (note: the tour video is English-only)

### Intentionally NOT included — do not fill

- [ ] **Fee structure** — the school has decided **not** to publish fee amounts until they are finalized. The bot must never quote any fee other than the Rs 1,000 admission form fee (§12 rule 1). Fee questions route to the admissions team.
- [ ] **Final payment modes** — will be confirmed together with the fee structure; until then the bot should not list payment options as settled.

---

## 14. Quick-reference card

> **Seth Govardhan Biyani School (SGBS)** — ICSE, Nursery to Grade 10, Mira Road (East), Mumbai. Part of Biyani's Education Group.
> Reggio Emilia-inspired across all grades · No Bag Model (Gr 1–4) · Exam-free CCE (Gr 1–4) · No Classroom Model with 8 subject labs (Gr 7–10) · Urban farming · Coding, financial literacy & Olympiad prep (Gr 5–6) · AI and STEM & Robotics labs · Student-run elections with student-built EVMs · 1:30 ratio, 30 per class.
> **Web:** www.sgbis.in · **Email:** sgbinternationalschool@gmail.com · **Phone:** +91 7045288224 · **Instagram:** @sgbs_mumbai
