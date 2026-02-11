# AIMED Workflow System - Kompletna Dokumentacija

## Pregled Sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          AIMED ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                         FRONTEND (Next.js)                        │  │
│   │                                                                   │  │
│   │   [Novi Nalaz]     [Ažuriraj Postojeći]                          │  │
│   │        │                    │                                     │  │
│   │        └────────┬───────────┘                                     │  │
│   │                 │                                                 │  │
│   │                 ▼                                                 │  │
│   │         [Snimanje Diktata]                                        │  │
│   │                 │                                                 │  │
│   │                 ▼                                                 │  │
│   │   ┌─────────────────────────────┐                                │  │
│   │   │  POST /AIMED-transcribe     │ ──────────────────┐            │  │
│   │   │  Body: audio (binary)       │                   │            │  │
│   │   └─────────────────────────────┘                   │            │  │
│   │                 │                                   │            │  │
│   │                 ▼                                   ▼            │  │
│   │   ┌─────────────────────────────┐      ┌─────────────────────┐  │  │
│   │   │  Response:                   │      │     n8n BACKEND     │  │  │
│   │   │  {                           │      │                     │  │  │
│   │   │    success: true,            │◄─────│  Whisper + Claude   │  │  │
│   │   │    sections: {               │      │                     │  │  │
│   │   │      ANAMNEZA: "...",        │      └─────────────────────┘  │  │
│   │   │      STATUS: "...",          │                               │  │
│   │   │      DIJAGNOZA: "...",       │                               │  │
│   │   │      TERAPIJA: "...",        │                               │  │
│   │   │      PREPORUKE: "..."        │                               │  │
│   │   │    }                         │                               │  │
│   │   │  }                           │                               │  │
│   │   └─────────────────────────────┘                               │  │
│   │                 │                                                │  │
│   │                 ▼                                                │  │
│   │   ┌─────────────────────────────┐                               │  │
│   │   │      UI EDITOR               │                               │  │
│   │   │  - Editabilne sekcije        │                               │  │
│   │   │  - Podaci o pacijentu        │                               │  │
│   │   │  - Dodaj/obriši sekciju      │                               │  │
│   │   └─────────────────────────────┘                               │  │
│   │                 │                                                │  │
│   │        ┌───────┴───────┐                                        │  │
│   │        ▼               ▼                                        │  │
│   │  [Export Word]   [Export PDF]                                   │  │
│   │        │               │                                        │  │
│   │        └───────┬───────┘                                        │  │
│   │                │                                                 │  │
│   │                ▼                                                 │  │
│   │   ┌─────────────────────────────┐                               │  │
│   │   │  POST /AIMED-export         │ ──────────────────┐           │  │
│   │   │  Body: {                    │                   │           │  │
│   │   │    sections: {...},         │                   │           │  │
│   │   │    patient: {...},          │                   ▼           │  │
│   │   │    output_format: "pdf"     │      ┌─────────────────────┐ │  │
│   │   │  }                          │      │     n8n BACKEND     │ │  │
│   │   └─────────────────────────────┘      │                     │ │  │
│   │                 │                       │  Template + PDF Gen │ │  │
│   │                 ▼                       │                     │ │  │
│   │   ┌─────────────────────────────┐      └─────────────────────┘ │  │
│   │   │  Response: Binary File       │◄─────────────────────────────┘ │  │
│   │   │  (.docx or .pdf)             │                               │  │
│   │   └─────────────────────────────┘                               │  │
│   │                 │                                                │  │
│   │                 ▼                                                │  │
│   │         [Browser Download]                                       │  │
│   │                                                                  │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## WORKFLOW 1: AIMED-transcribe

### Endpoint
```
POST https://your-n8n.com/webhook/AIMED-transcribe
Content-Type: multipart/form-data
```

### Request
```
audio: <binary file> (WebM, MP3, WAV - max 25MB)
```

### Response
```json
{
  "success": true,
  "sections": {
    "ANAMNEZA": "Pacijent se žali na bolove u leđima koji traju 7 dana...",
    "STATUS": "Bolna osjetljivost lumbalne kičme. Lasegue negativan.",
    "DIJAGNOZA": "Lumbalgia acuta (M54.5)",
    "TERAPIJA": "Ibuprofen 400mg 3x1 tokom 7 dana.",
    "PREPORUKE": null
  },
  "metadata": {
    "generatedAt": "2026-01-22T15:30:00.000Z",
    "datumNalaza": "22.1.2026.",
    "version": "AIMED-transcribe-v2"
  }
}
```

### Workflow Nodes

```
[Webhook] → [Whisper] → [Claude JSON] → [Parse & Validate] → [Response]
```

| Node | Funkcija |
|------|----------|
| Webhook | Prima audio fajl |
| Whisper | Transkribuje na bosanski/hrvatski |
| Claude JSON | Strukturira u 5 sekcija, vraća JSON |
| Parse & Validate | Validira JSON, dodaje metadata |
| Response | Vraća strukturirani response |

---

## WORKFLOW 2: AIMED-export

### Endpoint
```
POST https://your-n8n.com/webhook/AIMED-export
Content-Type: application/json
```

### Request
```json
{
  "sections": {
    "ANAMNEZA": "Editovani tekst anamneze...",
    "STATUS": "Editovani tekst statusa...",
    "DIJAGNOZA": "Editovana dijagnoza...",
    "TERAPIJA": "Editovana terapija...",
    "PREPORUKE": "Editovane preporuke...",
    "CUSTOM_SEKCIJA": "Ako je doktor dodao novu sekciju"
  },
  "patient": {
    "name": "Marko Marković",
    "dob": "15.03.1975",
    "jmbg": "1503975123456"
  },
  "doctor": {
    "name": "Dr. Amela Hodžić",
    "specialty": "spec. interne medicine",
    "institution": "Poliklinika Medica"
  },
  "source_type": "template",
  "output_format": "pdf"
}
```

### Response

**Za PDF:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="nalaz-2026-01-22.pdf"
<binary PDF data>
```

**Za DOCX:**
```json
{
  "success": true,
  "format": "docx",
  "content": "<HTML string za frontend konverziju>",
  "message": "Frontend koristi html-docx-js za konverziju"
}
```

### Workflow Nodes

```
[Webhook] → [Prepare Data] → [Switch Format] ─┬─► [Generate DOCX] → [Response]
                                               │
                                               └─► [Generate PDF] → [Response Binary]
```

---

## Claude Prompt za JSON Extraction

```
Ti si medicinski asistent za strukturiranje ljekarskih nalaza u Bosni i Hercegovini.

## TVOJ ZADATAK
Primi transkribirani tekst sa glasovnog snimka ljekara i vrati ISKLJUČIVO JSON objekat sa medicinskim sekcijama.

## IZLAZNI FORMAT (STROGO)
Vrati SAMO validan JSON objekat. NIKAKAV drugi tekst, objašnjenje, ili markdown.

{
  "ANAMNEZA": "tekst ili null",
  "STATUS": "tekst ili null",
  "DIJAGNOZA": "tekst ili null",
  "TERAPIJA": "tekst ili null",
  "PREPORUKE": "tekst ili null"
}

## PRAVILA

### 1. NEMA HALUCINACIJA
- Ako sekcija NIJE pomenuta u diktatu, vrijednost MORA biti null
- NIKADA ne izmišljaj sadržaj
- Samo prepiši i formatiraj ono što je doktor rekao

### 2. FORMATIRANJE TEKSTA
- Ispravi gramatičke i pravopisne greške
- Koristi bosansku medicinsku terminologiju
- Latinski termini samo za dijagnoze (npr. Lumbalgia acuta)
- Brojeve piši numerički (500mg, ne petsto miligrama)
- MKB-10 šifre u zagradi ako ih doktor pomene

### 3. SEKCIJE
- ANAMNEZA: Razlog dolaska, tegobe, trajanje, dosadašnja terapija
- STATUS: Fizikalni nalaz, vitalni znaci
- DIJAGNOZA: Latinski naziv + MKB-10 ako je pomenut
- TERAPIJA: Lijekovi sa dozama i trajanjem
- PREPORUKE: Kontrola, upute, upućivanja

### 4. TAČNOST
- Doze lijekova prepiši IDENTIČNO (500mg, 3x1, 7 dana)
- Ne zaokružuj i ne mijenjaj brojeve
- Ako nešto nije jasno, prepiši kako je rečeno

## PRIMJER

Ulaz: "Pacijent se žali na bolove u leđima zadnjih sedam dana, pojačava se pri saginjanju. Na pregledu bolna osjetljivost lumbalne kičme. Dijagnoza lumbalgia. Dajem ibuprofen 400 tri puta dnevno sedam dana."

Izlaz:
{
  "ANAMNEZA": "Pacijent se žali na bolove u leđima koji traju 7 dana. Bol se pojačava pri saginjanju.",
  "STATUS": "Bolna osjetljivost lumbalne kičme.",
  "DIJAGNOZA": "Lumbalgia (M54.5)",
  "TERAPIJA": "Ibuprofen 400mg 3x1 tokom 7 dana.",
  "PREPORUKE": null
}
```

---

## Frontend Integration Guide

### 1. Transkripcija (React Hook)

```typescript
// hooks/useAimedTranscribe.ts

interface TranscribeResponse {
  success: boolean;
  sections: {
    ANAMNEZA: string | null;
    STATUS: string | null;
    DIJAGNOZA: string | null;
    TERAPIJA: string | null;
    PREPORUKE: string | null;
  };
  metadata: {
    generatedAt: string;
    datumNalaza: string;
  };
}

export function useAimedTranscribe() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transcribe = async (audioBlob: Blob): Promise<TranscribeResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('https://your-n8n.com/webhook/AIMED-transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data: TranscribeResponse = await response.json();
      return data;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri transkripciji');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { transcribe, isLoading, error };
}
```

### 2. Export (React Hook)

```typescript
// hooks/useAimedExport.ts

interface ExportRequest {
  sections: Record<string, string | null>;
  patient: {
    name: string;
    dob: string;
    jmbg?: string;
  };
  doctor?: {
    name: string;
    specialty?: string;
    institution?: string;
  };
  output_format: 'docx' | 'pdf';
}

export function useAimedExport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportReport = async (request: ExportRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://your-n8n.com/webhook/AIMED-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      if (request.output_format === 'pdf') {
        // PDF - download binary
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nalaz-${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // DOCX - koristi html-docx-js
        const data = await response.json();
        if (data.content) {
          // Import html-docx-js dynamically
          const htmlDocx = await import('html-docx-js/dist/html-docx');
          const docxBlob = htmlDocx.asBlob(data.content);
          const url = URL.createObjectURL(docxBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `nalaz-${new Date().toISOString().split('T')[0]}.docx`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri exportu');
    } finally {
      setIsLoading(false);
    }
  };

  return { exportReport, isLoading, error };
}
```

---

## DOCX Template Sistem (Za Kasnije sa Supabase)

### Šablon sa Placeholderima

Kada implementiraš Supabase, doktor može uploadovati .docx sa ovim placeholderima:

```
{{DATUM}}
{{PACIJENT_IME}}
{{PACIJENT_DOB}}
{{PACIJENT_JMBG}}
{{DOKTOR_IME}}
{{DOKTOR_SPECIJALNOST}}
{{ANAMNEZA}}
{{STATUS}}
{{DIJAGNOZA}}
{{TERAPIJA}}
{{PREPORUKE}}
```

### Carbone.io Integracija (Preporučeno)

Za pravi .docx templating, koristi Carbone.io:

1. Doktor uploada .docx šablon na Supabase Storage
2. n8n poziva Carbone API sa šablonom + podacima
3. Carbone vraća popunjeni .docx

```javascript
// n8n Code node za Carbone
const carboneUrl = 'https://api.carbone.io/render';

const response = await fetch(carboneUrl, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${carboneApiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    template: templateBase64, // Šablon iz Supabase
    data: templateData,       // Podaci za zamjenu
    convertTo: 'pdf'          // ili 'docx'
  })
});
```

---

## Checklist za Implementaciju

### Faza 1: Transcribe Workflow
- [ ] Importaj AIMED-transcribe-workflow.json u n8n
- [ ] Poveži OpenAI credentials
- [ ] Poveži Anthropic credentials
- [ ] Testiraj sa audio fajlom
- [ ] Verifikuj JSON response format

### Faza 2: Export Workflow
- [ ] Importaj AIMED-export-workflow.json u n8n
- [ ] Poveži PDFShift credentials (za PDF)
- [ ] Testiraj PDF export
- [ ] Implementiraj DOCX fallback u frontendu

### Faza 3: Frontend Integration
- [ ] Implementiraj useAimedTranscribe hook
- [ ] Implementiraj useAimedExport hook
- [ ] Kreiraj UI editor za sekcije
- [ ] Dodaj Export buttone (Word/PDF)

### Faza 4: Supabase (Kasnije)
- [ ] Setup Supabase projekat
- [ ] Kreiraj tabele za templates i history
- [ ] Implementiraj template upload
- [ ] Implementiraj history nalaza
- [ ] Integriši Carbone.io za pravi DOCX templating

---

## Troubleshooting

### Problem: Claude ne vraća validan JSON

**Rješenje:** Code node ima fallback koji pokušava parsirati response. Ako ne uspije, vraća sirovi tekst u ANAMNEZA polju.

### Problem: PDF export ne radi

**Provjeri:**
1. PDFShift credentials
2. PDFShift API limit (50 besplatnih/mjesec)
3. HTML content encoding

### Problem: DOCX ne izgleda dobro

**Rješenje:** Za MVP, koristi PDF. Za pravi DOCX, implementiraj Carbone.io kada dodaš Supabase.

### Problem: Audio nije prepoznat

**Provjeri:**
1. Audio format (WebM, MP3, WAV)
2. Veličina < 25MB
3. Binary property name je "audio0"
