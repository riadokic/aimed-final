# Implementation Plan - Exports, Workflow & Auth

## User Review Required

IMPORTANT

**Dictation Saving Logic** : We will move the database saving trigger so it only fires when a user explicitly clicks "Preuzmi PDF", "Preuzmi Word", or "Kopiraj za HIS". This ensures that "Retried" or "Cancelled" dictations do not count towards usage limits.

## Proposed Changes

### 1. Export Layout Refinements

### [MODIFY]

pdf-generator.ts

* Adjust HTML/CSS to match the spacing and font styles of the Word export.
* Verify `html2pdf.js` integration and fix the "not working" issue (likely resource loading or container ID mismatch).

### 2. Report Update

When a report is about to be updated, a recording is done, and then when the doctor edits the new report, it is made as a new report, not an update of old one. The idea is to enable easy new reports for ongoing patients where not a lont changes each time.


3. UI Fixes

Please make sure the scrollability on all devices is intact. I cannot see the entire page when I am on mobile, regardless where. Pls fix this.

### 4. Authentication Testing Strategy (TestSprite)

#### Overview

TestSprite is used for automated E2E testing of the AIMED portal's authentication flows. Below is the testing strategy covering OAuth, email auth, edge cases, and freeze scenarios.

#### Test Suites

**Suite 1: Email Sign-Up Flow**

| #   | Test Case               | Steps                                                                                         | Expected Result                                                                   |
| --- | ----------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1.1 | Successful registration | Fill all fields (name, specialization, clinic, email, password, confirm), accept GDPR, submit | Success screen: "Provjerite email" with confirmation link prompt                  |
| 1.2 | Password mismatch       | Enter different passwords in password & confirm fields                                        | Error: "Lozinke se ne podudaraju"                                                 |
| 1.3 | Short password          | Enter password < 8 chars                                                                      | Error: "Lozinka mora imati najmanje 8 karaktera"                                  |
| 1.4 | GDPR not accepted       | Fill all fields correctly but leave GDPR unchecked                                            | Submit button disabled; if forced: error "Morate prihvatiti Politiku Privatnosti" |
| 1.5 | Duplicate email         | Register with already-registered email                                                        | Error with link: "Nalog sa ovim emailom vec postoji. Prijavite se ovdje"          |
| 1.6 | Empty required fields   | Leave email or password empty                                                                 | Browser validation prevents submission                                            |
| 1.7 | Nazad button            | Click "Nazad" arrow                                                                           | Navigate back to home page (/)                                                    |

**Suite 2: Email Sign-In Flow**

| #   | Test Case                | Steps                             | Expected Result                     |
| --- | ------------------------ | --------------------------------- | ----------------------------------- |
| 2.1 | Successful login         | Enter valid credentials, submit   | Redirect to /dashboard              |
| 2.2 | Wrong password           | Enter valid email, wrong password | Error: "Pogresan email ili lozinka" |
| 2.3 | Non-existent email       | Enter unregistered email          | Error: "Pogresan email ili lozinka" |
| 2.4 | Nazad button             | Click "Nazad" arrow               | Navigate back to home page (/)      |
| 2.5 | Navigate to registration | Click "Registrujte se" link       | Navigate to /registracija           |
| 2.6 | Password reset link      | Click "Zaboravili ste lozinku?"   | Navigate to /reset-password         |

**Suite 3: Google OAuth Flow**

| #   | Test Case                 | Steps                                                        | Expected Result                                                    |
| --- | ------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------ |
| 3.1 | Login via Google          | Click "Prijavi se putem Google-a"                            | Google consent screen opens, after approval redirect to /dashboard |
| 3.2 | Register via Google       | Click "Registruj se putem Google-a"                          | Google consent screen, new account created, redirect to /dashboard |
| 3.3 | Cancel Google consent     | Start Google flow, click cancel                              | Return to login/register page, no error                            |
| 3.4 | Existing email via Google | Google account email matches existing email/password account | Account linked or appropriate error                                |

**Suite 4: Session & Freeze Scenarios**

| #   | Test Case                       | Steps                                          | Expected Result                                          |
| --- | ------------------------------- | ---------------------------------------------- | -------------------------------------------------------- |
| 4.1 | Session persistence             | Login, close browser, reopen app               | User still logged in (Supabase session cookie)           |
| 4.2 | Session expiry                  | Wait for session to expire (or manually clear) | Redirected to /login on next navigation                  |
| 4.3 | Concurrent tabs                 | Login in tab A, logout in tab B                | Tab A detects logout on next action, redirects to /login |
| 4.4 | Network disconnect during login | Submit login form with network off             | Loading spinner, then timeout/error after reconnect      |
| 4.5 | Rapid double-submit             | Click login button twice quickly               | Only one request sent (button disabled during loading)   |
| 4.6 | Page freeze during auth         | Trigger heavy computation during auth callback | Auth callback completes after unfreeze, session saved    |

**Suite 5: Protected Route Access**

| #   | Test Case                             | Steps                                 | Expected Result                        |
| --- | ------------------------------------- | ------------------------------------- | -------------------------------------- |
| 5.1 | Unauthenticated access to /dashboard  | Navigate to /dashboard without login  | Redirect to /login                     |
| 5.2 | Unauthenticated access to /novi-nalaz | Navigate to /novi-nalaz without login | Redirect to /login                     |
| 5.3 | Unauthenticated access to /postavke   | Navigate to /postavke without login   | Redirect to /login                     |
| 5.4 | Post-logout access                    | Logout, press back button             | Redirect to /login (middleware blocks) |

#### TestSprite Configuration Notes

- Use `data-testid` attributes on key elements (login form, register form, error messages)
- Google OAuth tests require TestSprite's OAuth simulation or a dedicated test Google account
- Session tests may require cookie manipulation via TestSprite's browser context API
- Freeze tests can be simulated using `page.evaluate(() => { while(true) {} })` for a timed duration

---

### 5. GDPR Framework for n8n

#### Problem Statement

AIMED's n8n workflows process medical audio recordings and patient data (dictation -> transcription -> structured report). Even though n8n is self-hosted, GDPR compliance requires a systematic approach to data handling, retention, and audit logging.

#### Recommended Architecture: Wrapper Pattern + Data Lifecycle Controls

**Layer 1: Data Minimization at Entry**

- Audio files are already deleted immediately after transcription (existing behavior)
- The webhook payload should strip any unnecessary PII before entering n8n
- Patient identifiers (JMBG, name) should NOT be sent to n8n — only the audio blob and doctor/session metadata
- The structured report is returned to the client, which handles patient association

**Layer 2: n8n Workflow Hardening**

```
[Webhook In] → [Transcribe (Whisper)] → [Delete Audio Node] → [LLM Structure] → [Return JSON]
                                              ↑
                                    Immediate deletion
                                    No disk persistence
```

Best practices for each node:

- **Webhook node**: Accept only `multipart/form-data`, validate auth token, reject oversized payloads
- **Transcription node**: Use in-memory processing, never write audio to disk. If using an external API (OpenAI Whisper), ensure a DPA (Data Processing Agreement) is in place
- **Audio deletion**: Add an explicit "Delete Binary Data" node immediately after transcription — don't rely on garbage collection
- **LLM node**: If using OpenAI/Anthropic, ensure: (a) DPA signed, (b) data retention disabled via API settings, (c) EU endpoint if available
- **Response node**: Return structured JSON only, no logging of patient data

**Layer 3: Execution Log Sanitization**
n8n stores execution logs that may contain request/response data:

- Set `EXECUTIONS_DATA_PRUNE=true` and `EXECUTIONS_DATA_MAX_AGE=24` (hours) in n8n env
- Set `EXECUTIONS_DATA_SAVE_ON_ERROR=none` to prevent error payloads being stored
- Alternatively, set `EXECUTIONS_DATA_SAVE_ON_SUCCESS=none` for zero-retention
- Use n8n's built-in "Prune Executions" settings to auto-delete after 24h

**Layer 4: Infrastructure Controls**

- **Encryption at rest**: Ensure the n8n server volume is encrypted (LUKS/dm-crypt or cloud-native encryption)
- **Encryption in transit**: All webhook endpoints must use HTTPS/TLS 1.2+
- **Access control**: n8n admin panel should be behind VPN or IP allowlist. Use n8n's built-in user management
- **Hosting location**: EU-based server (Hetzner, OVH, or equivalent) to avoid cross-border data transfers
- **No third-party analytics**: Disable n8n telemetry (`N8N_DIAGNOSTICS_ENABLED=false`)

**Layer 5: Audit & Documentation**

- Maintain a Record of Processing Activities (ROPA) document listing:
  - What data is processed (audio recordings, transcription text)
  - Purpose (medical report generation)
  - Retention period (ephemeral — deleted within seconds/minutes)
  - Legal basis (legitimate interest + explicit user consent via GDPR checkbox)
- Log each workflow execution timestamp (without payload) for audit trail
- Document your DPAs with any external AI providers

**Langdock / Alternative Services**
Langdock is an EU-based AI gateway that could replace direct OpenAI/Anthropic API calls:

- **Pros**: Built-in GDPR compliance, EU data residency, DPA included, audit logs, no data retention by default
- **Cons**: Additional cost layer, potential latency, vendor lock-in
- **Recommendation**: Use Langdock only if you're using external LLM APIs (not self-hosted models). If using self-hosted Whisper + self-hosted LLM, Langdock is unnecessary. For OpenAI Whisper API specifically, Langdock or a similar EU proxy adds meaningful GDPR value.


#### Summary Checklist

- [ ] Audio deleted immediately after transcription (code-level)
- [ ] No patient PII sent to n8n (only audio + doctor session ID)
- [ ] n8n execution logs pruned within 24h
- [ ] DPA signed with any external AI provider
- [ ] HTTPS enforced on all webhook endpoints
- [ ] n8n server hosted in EU with encrypted storage
- [ ] n8n telemetry disabled
- [ ] ROPA document maintained
- [ ] User consent collected at registration (existing GDPR checkbox)
