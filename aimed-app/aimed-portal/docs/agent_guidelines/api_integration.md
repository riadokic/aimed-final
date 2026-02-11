# API Integration Guidelines — AIMED

## n8n Webhook API

### Endpoint
```
POST {NEXT_PUBLIC_AIMED_WEBHOOK_URL}
```

The webhook URL is stored in `.env.local` and accessed via `process.env.NEXT_PUBLIC_AIMED_WEBHOOK_URL`.

---

## Request Format

### Sending Audio
```typescript
const formData = new FormData();
formData.append('audio', audioBlob, 'recording.webm');

const response = await fetch(webhookUrl, {
  method: 'POST',
  body: formData,
  // Do NOT set Content-Type header — browser sets it with boundary
});
```

### Audio Requirements
- **Format**: WebM (Opus codec) preferred, WAV as fallback
- **Max duration**: Practical limit ~10 minutes (Whisper handles up to 25MB)
- **Sample rate**: Browser default (usually 48kHz) is fine
- **Channels**: Mono preferred (smaller file)

---

## Response Format

### Success
```json
{
  "success": true,
  "report_text": "DATUM PREGLEDA\n12.01.2025.\n\nPODACI O PACIJENTU\n..."
}
```

### Parsing report_text
The `report_text` field contains plain text with consistent structure:
- Section headers are ALL CAPS on their own line
- Content follows below each header
- Sections separated by blank lines
- Warnings formatted as `[NAPOMENA: description]`

Known sections (in order):
1. `DATUM PREGLEDA`
2. `PODACI O PACIJENTU`
3. `ANAMNEZA`
4. `STATUS`
5. `DIJAGNOZA`
6. `TERAPIJA`
7. `PREPORUKE / KONTROLA`

Not all sections appear in every report — depends on what the doctor dictated.

### Report Parser Logic
```typescript
interface ReportSection {
  title: string;
  content: string;
}

interface ParsedReport {
  sections: ReportSection[];
  warnings: string[];
  rawText: string;
}

function parseReport(text: string): ParsedReport {
  const lines = text.split('\n');
  const sections: ReportSection[] = [];
  const warnings: string[] = [];
  let currentSection: ReportSection | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) continue;

    // Check for warnings
    if (trimmed.startsWith('[NAPOMENA')) {
      warnings.push(trimmed);
      continue;
    }

    // Check for section header (ALL CAPS, length > 2)
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 2) {
      if (currentSection) sections.push(currentSection);
      currentSection = { title: trimmed, content: '' };
    } else if (currentSection) {
      currentSection.content += (currentSection.content ? '\n' : '') + trimmed;
    }
  }

  if (currentSection) sections.push(currentSection);

  return { sections, warnings, rawText: text };
}
```

---

## Error Handling

### Network Errors
```typescript
try {
  const response = await fetch(webhookUrl, { ... });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error('Processing failed');
  }

  return data.report_text;
} catch (error) {
  if (error instanceof TypeError) {
    // Network error — no internet or server down
    throw new Error('NETWORK_ERROR');
  }
  throw error;
}
```

### Timeout
Set a timeout of 60 seconds. Whisper + Claude processing typically takes 10-30 seconds depending on audio length.

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 60000);

const response = await fetch(webhookUrl, {
  method: 'POST',
  body: formData,
  signal: controller.signal,
});

clearTimeout(timeout);
```

### User-Facing Error Messages (Bosnian)
| Error | Message |
|-------|---------|
| Network error | "Nema internet konekcije. Provjerite vezu i pokušajte ponovo." |
| Server error (5xx) | "Server trenutno nije dostupan. Pokušajte ponovo za nekoliko minuta." |
| Timeout | "Obrada traje predugo. Pokušajte sa kraćim snimkom." |
| Empty response | "Nije moguće obraditi snimak. Provjerite kvalitet audio zapisa." |
| Unknown | "Došlo je do greške. Pokušajte ponovo." |

---

## Retry Strategy

- Max 2 automatic retries for network errors only
- No retry for server errors (4xx/5xx) — show error immediately
- Exponential backoff: 1s, then 3s
- Always let user manually retry with a button

---

## Request/Response Hook Pattern

```typescript
// hooks/use-aimed-api.ts
function useAimedApi() {
  const [state, setState] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [report, setReport] = useState<ParsedReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitRecording = async (audioBlob: Blob) => {
    setState('uploading');
    setError(null);

    try {
      setState('processing');
      const reportText = await sendAudio(audioBlob);
      const parsed = parseReport(reportText);
      setReport(parsed);
      setState('done');
    } catch (err) {
      setError(getErrorMessage(err));
      setState('error');
    }
  };

  const reset = () => {
    setState('idle');
    setReport(null);
    setError(null);
  };

  return { state, report, error, submitRecording, reset };
}
```

---

## Security Notes

- Webhook URL is public (NEXT_PUBLIC_) — this is acceptable for MVP
- n8n webhook has no authentication — consider adding API key header in production
- Audio data is sent over HTTPS
- No patient data is stored on the frontend (stateless)
- For production: add rate limiting on n8n side
