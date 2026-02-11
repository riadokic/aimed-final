# AIMED Master Workflow

## Objective
Build a production-ready Next.js frontend for AIMED (AI Medical Dictation) — a web app that lets doctors in Bosnia and Herzegovina dictate medical reports via voice, which get automatically transcribed, formatted, and prepared for print/PDF.

---

## 1. Backend API Spec (n8n Workflow)

### Endpoint
```
POST /webhook/AIMED
Content-Type: multipart/form-data
```

### Request
| Field | Type | Description |
|-------|------|-------------|
| `audio` | Binary (file) | Audio recording from doctor's microphone |
| `mode` | String (optional) | `"new"` (default), `"update"`, or `"template"` |
| `existing_report` | String (optional) | Extracted text from uploaded PDF/Word (update mode only) |
| `template` | String (optional) | Template content with `{{PLACEHOLDER}}` markers (template mode only) |

The webhook expects a binary file upload with the field name `audio`. Supported formats: WebM, WAV, MP3 (any format Whisper supports). For update/template modes, additional fields are sent as form fields alongside the audio.

### Response
```json
{
  "success": true,
  "report_text": "DATUM PREGLEDA\n12.01.2025.\n\nPODACI O PACIJENTU\nMarko Markovic, 45 godina\n\nANAMNEZA\n..."
}
```

### Processing Pipeline (what happens inside n8n)
1. **Webhook** receives audio binary
2. **OpenAI Whisper** transcribes audio (language: `hr`)
3. **Claude API** formats transcription into structured medical report with sections:
   - DATUM PREGLEDA
   - PODACI O PACIJENTU
   - ANAMNEZA
   - STATUS
   - DIJAGNOZA
   - TERAPIJA
   - PREPORUKE / KONTROLA
4. **Response** returns JSON with `success` and `report_text`

### Error Cases (currently unhandled in n8n — frontend must handle gracefully)
- Empty audio file → likely Whisper error
- Inaudible/noisy recording → empty or garbage transcription
- API timeout → no response
- Claude formatting failure → malformed text

### Cost Analysis
Current per-request cost estimate:
- Whisper: ~$0.006/min of audio
- Claude Sonnet: ~$0.01-0.03 per report (depending on length)
- **Total: ~$0.02-0.04 per report**

#### Optimization — APPROVED
Switch to `claude-haiku` for formatting (~$0.002-0.006 per report). **50-70% cost saving.**

#### Medical Terminology — IMPORTANT
The n8n Claude prompt must be updated:
- Prioritize **lokalne medicinske termine** korištene u BiH praksi
- Latinski termini SAMO gdje ljekar eksplicitno kaže latinski naziv
- NE prioritizirati latinsku terminologiju po defaultu
- Baza medicinskih termina treba biti prilagođena BiH zdravstvenom sistemu

---

## 2. Frontend Architecture

### Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth & DB**: Supabase (auth, user management, admin panel data)
- **Audio**: MediaRecorder API (browser native)
- **PDF**: Client-side generation (html2pdf.js or react-pdf)
- **State**: React hooks (no external state library needed)

### Core Features (MVP)
1. **Record Audio** — Hold/toggle button to record doctor's dictation
2. **Submit & Wait** — Send audio to n8n webhook, show loading state
3. **Display Report** — Render formatted medical report with sections
4. **Edit Report** — Allow doctor to correct/modify before finalizing
5. **Export PDF** — Generate printable PDF from the report
6. **Copy Text** — One-click copy of report text
7. **Auth (Supabase)** — Login/register, session management
8. **Admin Panel** — Account overview, emails, enterprise support (e.g. hospital with multiple doctors under one roof)
9. **Existing Report Update Mode** — Upload PDF/Word, dictate changes, AI surgically updates medical sections only
10. **Template-Based Report Mode** — Upload template with placeholders, AI fills only variable sections

### Report Modes

The app supports three distinct report creation modes:

#### A. New Report (default)
Standard flow: dictate → AI structures → edit → export.

#### B. Existing Report Update Mode
1. Doctor uploads existing PDF or Word report (drag & drop or click)
2. Doctor dictates what to update, change, or remove
3. AI updates ONLY medical content sections (anamneza, dijagnoza, terapija, preporuke, etc.)
4. AI NEVER modifies: administrative content, headers, patient-identifying information, institutional branding
5. Result shows updated report with amber badge indicating it's an update

**n8n webhook changes for update mode:**
- Request includes `existing_report` field (extracted text from uploaded document)
- Request includes `mode: "update"` field
- Claude prompt instructs: "Ažuriraj SAMO medicinske sekcije na osnovu diktiranih izmjena. NE MIJENJAJ administrativne podatke, zaglavlje, podatke o pacijentu."

#### C. Template-Based Report Mode
1. Doctor uploads their own report template in Settings (once)
2. Templates contain placeholders: `{{ANAMNEZA}}`, `{{DIJAGNOZA}}`, `{{TERAPIJA}}`, etc.
3. When creating a report, AI populates ONLY these placeholder sections
4. All fixed layout, wording, institutional branding, and static content remain untouched

**n8n webhook changes for template mode:**
- Request includes `template` field (template content with placeholders)
- Request includes `mode: "template"` field
- Claude prompt instructs: "Popuni SAMO označene sekcije ({{PLACEHOLDER}}) na osnovu diktiranog teksta. SVE ostalo ostaje nepromijenjeno."

### Future Features (Post-MVP)
- Report history (database-backed via Supabase)
- Patient database integration
- Bulk export

---

## 3. Build Phases

### Phase 1: Foundation
**Objective**: Working Next.js project with routing, layout, and design system.

Tasks:
- [ ] Initialize Next.js project with TypeScript + Tailwind
- [ ] Set up folder structure (see proposed structure below)
- [ ] Create base layout component (Attio-style minimal design)
- [ ] Create design tokens (colors, typography, spacing)
- [ ] Build reusable UI components (Button, Card, Input, Loading)
- [ ] Set up responsive layout with sidebar navigation

**Checkpoint**: Show running app with layout and navigation. Get approval before proceeding.

---

### Phase 2: Audio Recording
**Objective**: Doctor can record audio in the browser.

Tasks:
- [ ] Implement MediaRecorder hook (`useAudioRecorder`)
- [ ] Build recording UI (record button with visual feedback)
- [ ] Add recording timer display
- [ ] Handle browser permissions (microphone access)
- [ ] Audio format: WebM (best browser support)
- [ ] Test on Chrome, Safari, Firefox

**Checkpoint**: Demo recording functionality. Get approval before proceeding.

---

### Phase 3: API Integration
**Objective**: Audio goes to n8n, formatted report comes back.

Tasks:
- [ ] Create API service layer (`services/aimed-api.ts`)
- [ ] Implement audio upload as multipart/form-data
- [ ] Add loading states and progress indication
- [ ] Handle all error cases (timeout, server error, empty response)
- [ ] Parse response and display structured report
- [ ] Add retry mechanism for failed requests

**Checkpoint**: Full flow working — record, submit, see report. Get approval before proceeding.

---

### Phase 4: Report Display & Editing
**Objective**: Transform raw API response into a professional, editable medical document interface.

Tasks:
- [ ] **State Partitioning**: Implement local state in `DictationFlow` to mirror `api.report`, allowing real-time edits without re-calling the API.
- [ ] **Smart Section Merger**: 
    - Ensure the UI always renders the "Standard 5" (ANAMNEZA, STATUS, DIJAGNOZA, TERAPIJA, PREPORUKE).
    - Map API response sections to these slots; leave slots empty/skeleton if the AI didn't provide them.
    - Append "Dynamic" sections (those requested via "Add field X") at the end.
- [ ] **Rich Section Editor**:
    - Build `SectionCard` component using `contentEditable` for natural typing.
    - Implement Auto-save logic to local state on `blur`.
    - Visual feedback for "Focused" vs "Blurred" sections (Attio-style focus mode).
- [ ] **Warning & Note System**:
    - Regex parser to detect `[NAPOMENA: ...]` markers.
    - Render warnings as distinct, subtle alerts (amber-light background) within the report flow.
- [ ] **HIS Copy Logic**:
    - Implementation of `sectionsToPlainText` helper.
    - Requirement: Filter out empty sections and internal AI [NAPOMENA] warnings for the final HIS copy.
    - Requirement: Add "Copied!" tactical feedback (2s duration).

**Checkpoint**: Report can be fully customized by the doctor; copy-to-HIS results in clean, professional text.

---

### Phase 5: PDF Export & Polish
**Objective**: Finalize the "Final Output" quality and overall application feel.

Tasks:
- [ ] **Professional PDF Engine**:
    - Integrate `html2pdf.js` for client-side generation.
    - Create a hidden "Print Template" that uses standard medical typography (Times New Roman fallback, 11pt-12pt).
    - Include institutional branding placeholders (Clinic Name, Doctor Name, Date, Signature line).
- [ ] **State Transitions & UX**:
    - Implement Framer Motion transitions between `Recording` → `Processing` → `Result` states.
    - Use "Skeleton Loader" (`SkeletonCard`) during the 5-15s AI processing window to reduce perceived latency.
- [ ] **Global Error Handling**:
    - Setup React Error Boundaries for the main dictation flow.
    - Friendly error states for "API Offline", "Microphone Blocked", or "Internal Error".
- [ ] **Storage & Retention (MVP)**:
    - Implement `localStorage` persistence so a doctor doesn't lose a report if they refresh before copying/saving.
    - Auto-clear logic on "New Report" or explicit "Clear Data" click.

**Checkpoint**: App feels like a premium enterprise tool (Linear/Attio level polish) and produces print-ready PDFs.

---

### Phase 6: Authentication & Admin
**Objective**: Supabase auth, user management, admin panel.

Tasks:
- [ ] Set up Supabase project (auth, database)
- [ ] Implement login/register pages
- [ ] Session management and protected routes
- [ ] Admin panel — account list, emails, usage metrics
- [ ] Enterprise model — organization with multiple doctors
- [ ] Row Level Security policies in Supabase

**Checkpoint**: Complete MVP ready for doctor testing. Final review.

---

## 4. Security & GDPR Compliance

AIMED procesira zdravstvene podatke — GDPR kategorija "posebni podaci" (Član 9). Ova sekcija je OBAVEZNA za svaku fazu razvoja.

### Princip 1: ZERO AUDIO RETENTION
- Audio blob se šalje na n8n webhook → Whisper transkribuje → audio se ODMAH briše
- n8n execution history NE SMIJE logovati audio binary
- Browser briše audio blob iz memorije nakon uspješnog API odgovora
- Nigdje ne postoji trajni zapis glasa ljekara

### Princip 2: ZERO RAW TRANSCRIPT RETENTION
- Sirova Whisper transkripcija postoji SAMO u n8n execution memoriji
- Prosljeđuje se Claude-u za formatiranje, zatim se odbacuje
- API response sadrži SAMO formatirani nalaz, nikad sirovi tekst
- n8n execution logging MORA biti DISABLED za ovaj workflow

### Princip 3: LOCAL-FIRST DATA
- MVP: Formatirani nalazi se čuvaju SAMO u browser localStorage
- Korisnik može exportovati (PDF/print)
- Korisnik može obrisati SVE lokalne podatke jednim klikom
- NEMA cloud storage nalaza u MVP-u
- Supabase čuva SAMO: auth podatke, usage metrike — NIKAD medicinski sadržaj

### Princip 4: NO PATIENT IDENTIFIERS IN TRANSIT
- Pacijent podaci (ime, JMBG, adresa) se NE šalju na backend
- Audio NE SMIJE sadržavati identifikatore — ljekar ih dodaje naknadno
- Frontend dodaje polja za pacijent info NAKON što formatirani nalaz stigne
- Ovo drastično minimizira rizik data breach-a u tranzitu

### Princip 5: EXPLICIT CONSENT
- Pri prvom korištenju: GDPR consent modal (full-screen, ne može se zaobići)
- Objašnjava: šta se procesira, koji API-ji, koliko dugo se čuva
- Bez consent-a = aplikacija je BLOKIRANA
- Consent se čuva u localStorage sa timestamp-om

### Princip 6: RIGHT TO DELETE
- "Obriši sve moje podatke" button u Postavkama
- Briše: localStorage kompletno, consent status, sve lokalne nalaze
- Potvrda brisanja sa upozorenjem
- Resetuje app na početno stanje

### Implementacija u n8n (AŽURIRATI WORKFLOW)
1. Disable "Save Execution Data" za AIMED workflow
2. Osigurati da Whisper node ne loguira output
3. Response vraća SAMO `report_text`, nikad sirovi transcript
4. Dodati error handling koji ne leakuje podatke u error messages

### Frontend Security Checklist
- [ ] Audio blob se briše iz memorije nakon uspješnog upload-a
- [ ] localStorage se enkriptuje (ili se koristi sessionStorage za dodatnu sigurnost)
- [ ] GDPR consent modal blokira pristup do prihvatanja
- [ ] "Obriši podatke" funkcionalno briše SVE
- [ ] Nema patient identifiers u API request-u
- [ ] Error messages ne sadrže medicinske podatke
- [ ] HTTPS only (enforced via Next.js config)

---

## 5. Key Technical Decisions

### Why client-side PDF (not n8n)?
The n8n workflow already generates HTML but doesn't return it. Rather than modifying the workflow, we generate PDF on the client:
- No additional API calls
- Doctor sees exactly what they'll get
- Can edit before export
- Zero additional cost

### Auth via Supabase (MVP requirement)
- Supabase handles auth (email/password), session management
- Admin panel: owner sees all accounts, emails, usage
- Enterprise model: hospital account with multiple doctors under one organization
- Supabase Row Level Security for data isolation between organizations

### Why Tailwind + no component library?
- Attio-style requires custom design, not Material UI defaults
- Tailwind gives full control with minimal overhead
- Faster iteration than styled-components

### Audio format choice
- **WebM** (Opus codec): Best quality-to-size ratio, supported in Chrome/Firefox
- **Fallback**: WAV for Safari if needed
- Whisper handles both formats

---

## 6. Environment Variables

```env
NEXT_PUBLIC_AIMED_WEBHOOK_URL=https://your-n8n-instance.com/webhook/AIMED
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 7. Proposed Next.js Folder Structure

```
aimed-app/
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with sidebar
│   │   ├── page.tsx                # Main dictation page
│   │   ├── globals.css             # Tailwind + global styles
│   │   └── novi-nalaz/
│   │       └── page.tsx            # New report page (recording + result)
│   ├── components/
│   │   ├── ui/                     # Reusable UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── loading-spinner.tsx
│   │   │   └── toast.tsx
│   │   ├── layout/                 # Layout components
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── page-container.tsx
│   │   ├── recording/              # Audio recording components
│   │   │   ├── record-button.tsx
│   │   │   ├── recording-timer.tsx
│   │   │   └── audio-visualizer.tsx
│   │   └── report/                 # Report display components
│   │       ├── report-viewer.tsx
│   │       ├── report-editor.tsx
│   │       ├── report-section.tsx
│   │       └── report-actions.tsx
│   ├── hooks/                      # Custom React hooks
│   │   ├── use-audio-recorder.ts
│   │   └── use-aimed-api.ts
│   ├── services/                   # API and external services
│   │   └── aimed-api.ts
│   ├── lib/                        # Utilities
│   │   ├── report-parser.ts        # Parse report_text into sections
│   │   └── pdf-generator.ts        # Client-side PDF generation
│   └── types/                      # TypeScript types
│       └── aimed.ts                # Report, Section, APIResponse types
├── .env.local
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── package.json
```

---

## 9. Templating & Injection Strategy

To support "Update Mode" and "Template Mode", the application must handle existing documents as either a source of truth or a visual shell.

### A. Data Extraction (The "Input" Side)
- **PDF Extraction**: Use `pdf-parse` (on a small serverless function) or `pdf-lib` (client-side) to pull raw text. 
- **Word (.docx) Extraction**: Use `mammoth.js` to convert `.docx` directly to clean HTML/Text.
- **Workflow**:
    - File uploaded -> `FileReader` API -> Library parsing -> String sent to `/api/submit` as `existing_report`.

### B. Template Injection (The "Output" Side)
We leverage two different strategies based on the doctor's preference:

#### 1. The .docx Template Approach (Pixel Perfect)
- **Library**: `docx-templates`. 
- **Mechanism**: 
    1. Doctor uploads a `.docx` in Settings with `{{ANAMNEZA}}`, `{{DIJAGNOZA}}`, etc.
    2. App stores this binary in Supabase/localStorage.
    3. When the AI returns report sections, we run `createReport({ template, data: sections })`.
    4. Result: A downloadable `.docx` that looks exactly like their original, but filled.

#### 2. The HTML/PDF Shell Approach (Modern Print)
- **Mechanism (Mode B Update)**: 
    1. The AI is sent the *entire* old report + dictation. 
    2. Claude returns a surgically updated full text. 
    3. The UI renders this updated text into our professional "Clean PDF" template (Phase 5).
- **Benefit**: Ensures the final document is always clean, consistent, and accessible, even if the source was a messy old scan.

### C. Implementation in n8n
- The Claude prompt must be aware of the "Template" context.
- **Instruction**: "If a template is provided, map your findings to the template's keys. If a finding doesn't fit a key, discard it unless it's critical, then add it to PREPORUKE."

---

## 10. Success Criteria (Updated)
1. Register/login to the app
2. Press record and dictate a medical report
3. See the formatted report appear with proper sections
4. Edit any section if needed
5. Export to PDF or copy text
6. Admin can see all accounts and manage organizations
7. The whole flow feels fast and professional
8. Doctor can upload an old PDF, record "Promijeni terapiju na Sumamed", and get a new PDF with *only* that change applied.
9. Doctor can set a "Personal Template" in settings that all new reports follow automatically.
