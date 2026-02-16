# GDPR Compliance Guidelines — AIMED

## Pravni Kontekst

AIMED procesira **zdravstvene podatke** koji spadaju pod GDPR Član 9 — "posebne kategorije ličnih podataka". Ovo je najviši nivo zaštite u GDPR-u. Bosna i Hercegovina ima Zakon o zaštiti ličnih podataka (ZZLP) koji je usklađen sa GDPR principima.

Kršenje ovih principa nije samo tehnički problem — to je pravna odgovornost.

---

## Šest Principa

### 1. ZERO AUDIO RETENTION

**Pravilo**: Glasovni snimak ljekara ne smije postojati duže od vremena potrebnog za transkripciju.

**Frontend implementacija**:
```typescript
// Nakon uspješnog API odgovora
async function handleRecordingComplete(audioBlob: Blob) {
  try {
    const report = await submitToWebhook(audioBlob);
    // Uspjeh — odmah očisti audio iz memorije
    audioBlob = null as any;
    // MediaRecorder stream se zatvara
    stopMediaStream(stream);
    return report;
  } catch (error) {
    // Čak i pri grešci — audio se briše
    audioBlob = null as any;
    stopMediaStream(stream);
    throw error;
  }
}
```

**n8n implementacija**:
- Webhook prima audio → prosljeđuje Whisper-u → audio binary se ne čuva
- "Save Execution Data" MORA biti DISABLED
- Execution history ne smije sadržavati binary podatke

**Rezultat**: Nakon što Whisper vrati tekst, audio ne postoji nigdje u sistemu.

---

### 2. ZERO RAW TRANSCRIPT RETENTION

**Pravilo**: Sirova Whisper transkripcija ne smije biti perzistirana.

**Tok podataka u n8n**:
```
Audio → [Whisper] → sirovi tekst (u memoriji) → [Claude] → formatirani nalaz → Response
                     ↓
              Nikad se ne čuva.
              Ne loguira se.
              Ne vraća se klijentu.
```

**API Response sadrži SAMO**:
```json
{
  "success": true,
  "report_text": "FORMATIRANI NALAZ (ne sirovi tekst)"
}
```

**n8n podešavanja**:
- Workflow Settings → Save Execution Data: **OFF**
- Workflow Settings → Save Data On Error: **OFF** (error messages ne smiju sadržavati transcript)

---

### 3. LOCAL-FIRST DATA

**Pravilo**: Medicinski sadržaj nikad ne napušta browser nakon inicijalne obrade.

**Šta se čuva lokalno (localStorage)**:
```typescript
interface LocalReport {
  id: string;                  // UUID generisan na frontendu
  reportText: string;          // Formatirani nalaz
  patientName?: string;        // Dodaje ljekar naknadno
  createdAt: string;           // ISO timestamp
  updatedAt: string;           // ISO timestamp
}
```

**Šta se čuva u Supabase (cloud)**:
```
- Auth: email, password hash, session tokens
- Usage: broj generisanih nalaza (counter), timestamp zadnjeg korištenja
- Organization: ime organizacije, lista članova
- NIKAD: medicinski sadržaj, patient data, report text
```

**localStorage ključevi**:
```
aimed_reports      → LocalReport[]
aimed_consent      → { accepted: boolean, timestamp: string, version: string }
aimed_preferences  → { theme: string, language: string }
```

---

### 4. NO PATIENT IDENTIFIERS IN TRANSIT

**Pravilo**: Identifikacioni podaci pacijenta se nikad ne šalju na backend.

**UX Flow**:
```
1. Ljekar snima SAMO klinički sadržaj:
   "Pacijent, četrdeset pet godina, dolazi zbog bolova u lumbalnom dijelu..."
   NE: "Pacijent Marko Marković, JMBG 1234567890123..."

2. n8n vraća formatirani nalaz BEZ pacijent podataka

3. Frontend prikazuje nalaz + prazna polja za:
   - Ime i prezime pacijenta
   - Datum rođenja
   - JMBG (opciono)
   - Kontakt (opciono)

4. Ljekar popunjava pacijent podatke LOKALNO
   Ovi podaci NIKAD ne napuštaju browser.
```

**Frontend upozorenje pri snimanju**:
```
"Ne izgovarajte ime, prezime ili JMBG pacijenta.
Ove podatke ćete dodati nakon kreiranja nalaza."
```

**Zašto**: Čak i ako dođe do breach-a API komunikacije, napadač dobija samo anonimni klinički tekst bez mogućnosti identifikacije pacijenta.

---

### 5. EXPLICIT CONSENT

**Pravilo**: Korisnik mora eksplicitno pristati na obradu prije korištenja.

**Consent Modal** se prikazuje:
- Pri prvom otvaranju aplikacije
- Ako se consent verzija promijeni (npr. dodamo novi API)
- Ako korisnik obriše podatke i vrati se

**Consent je BLOKIRAJUĆI** — bez prihvatanja, aplikacija ne radi.

**Consent se čuva**:
```typescript
interface ConsentRecord {
  accepted: boolean;
  timestamp: string;       // ISO format
  version: string;         // "1.0" — povećati pri promjeni uslova
  ip?: string;             // Ne čuvamo IP u MVP-u
}
```

**Consent verzioniranje**:
- `1.0` — inicijalna verzija (MVP)
- Ako se promijene uslovi, povećati verziju → korisnik mora ponovo pristati

---

### 6. RIGHT TO DELETE

**Pravilo**: Korisnik može u svakom trenutku obrisati sve svoje podatke.

**"Obriši sve podatke" button u Postavkama**:

```typescript
function deleteAllData() {
  // 1. Prikaži confirmation dialog
  // "Jeste li sigurni? Ova radnja je nepovratna.
  //  Svi vaši nalazi i podešavanja će biti trajno obrisani."

  // 2. Obriši SVE iz localStorage
  localStorage.removeItem('aimed_reports');
  localStorage.removeItem('aimed_consent');
  localStorage.removeItem('aimed_preferences');

  // 3. Obriši i sessionStorage
  sessionStorage.clear();

  // 4. Redirect na početnu stranicu (consent modal će se ponovo pokazati)
}
```

**Važno**: Ovo briše samo lokalne podatke. Supabase auth podaci (email, sesija) se brišu separatno kroz "Obriši račun" opciju.

---

## Consent Modal — Kompletan Copy (Bosanski)

### Verzija 1.0

```
═══════════════════════════════════════════════════════

              AIMED — Zaštita Vaših Podataka

═══════════════════════════════════════════════════════

Prije korištenja AIMED aplikacije, molimo da pročitate
kako obrađujemo Vaše podatke.


KAKO AIMED FUNKCIONIŠE

Kada snimite glasovnu diktaciju, Vaš audio zapis se
šalje na obradu putem sigurne konekcije (HTTPS).

Obrada uključuje:
• Transkripciju govora u tekst (OpenAI Whisper)
• Formatiranje teksta u medicinski nalaz (Anthropic Claude)


ŠTA SE DEŠAVA SA VAŠIM PODACIMA

Audio snimak:
→ Koristi se ISKLJUČIVO za transkripciju
→ Automatski se briše odmah nakon obrade
→ Ne čuva se nigdje trajno

Medicinski nalaz:
→ Čuva se SAMO na Vašem uređaju (lokalno)
→ Ne šalje se niti čuva na eksternim serverima
→ Vi kontrolišete sve svoje podatke

Podaci o pacijentima:
→ Nikad ne napuštaju Vaš uređaj
→ Upisujete ih lokalno nakon kreiranja nalaza


VAŠA PRAVA

• Možete obrisati sve svoje podatke u bilo kom trenutku
  kroz opciju "Obriši podatke" u Postavkama
• Možete povući saglasnost u bilo kom trenutku
• Možete exportovati svoje nalaze prije brisanja


EKSTERNI SERVISI

Vaši audio podaci se obrađuju putem:
• OpenAI (transkripcija govora) — USA
• Anthropic (formatiranje teksta) — USA

Ovi servisi procesiraju podatke u skladu sa njihovim
privacy politikama i ne čuvaju podatke nakon obrade.


─────────────────────────────────────────────────────

□ Pročitao/la sam i razumijem kako AIMED
  obrađuje moje podatke

        [ Prihvatam ]        [ Ne prihvatam ]

─────────────────────────────────────────────────────

Verzija uslova: 1.0
Datum: {current_date}
```

### Ponašanje buttona

**"Prihvatam"**:
- Čuva consent u localStorage sa timestamp-om
- Preusmjerava na glavnu stranicu
- App postaje funkcionalan

**"Ne prihvatam"**:
- Prikazuje poruku:
  ```
  "Bez Vaše saglasnosti nije moguće koristiti AIMED.
   Ako imate pitanja o zaštiti podataka, kontaktirajte
   nas na: privacy@aimed.ba"
  ```
- App ostaje blokiran
- Korisnik može zatvoriti tab ili se vratiti i prihvatiti

---

## Tehnička Implementacija

### Consent Check (Root Layout)

```typescript
// Provjera pri svakom renderovanju
function useConsentCheck(): { hasConsent: boolean; consentVersion: string } {
  const CURRENT_VERSION = "1.0";

  const stored = localStorage.getItem('aimed_consent');
  if (!stored) return { hasConsent: false, consentVersion: CURRENT_VERSION };

  const consent = JSON.parse(stored) as ConsentRecord;
  if (!consent.accepted) return { hasConsent: false, consentVersion: CURRENT_VERSION };
  if (consent.version !== CURRENT_VERSION) return { hasConsent: false, consentVersion: CURRENT_VERSION };

  return { hasConsent: true, consentVersion: consent.version };
}
```

### Recording Privacy Notice

Prikazati PRIJE svakog snimanja (mali banner, ne modal):

```
ℹ️ Ne izgovarajte lične podatke pacijenta
   (ime, JMBG, adresa). Podatke o pacijentu
   ćete dodati nakon kreiranja nalaza.
```

### Error Message Sanitization

Error messages nikad ne smiju sadržavati medicinski sadržaj:

```typescript
function sanitizeError(error: unknown): string {
  // Nikad ne proslijediti raw API error korisniku
  // Nikad ne uključivati transcript ili report content u error
  if (error instanceof TypeError) return "NETWORK_ERROR";
  if (error instanceof Error && error.message.includes("timeout")) return "TIMEOUT_ERROR";
  return "UNKNOWN_ERROR";
}
```

---

## Checklist za Svaku Fazu

### Phase 2 (Audio Recording)
- [ ] Audio blob se nullira nakon slanja
- [ ] MediaStream se zatvara nakon snimanja
- [ ] Nema console.log sa audio podatcima
- [ ] Privacy notice vidljiv pri snimanju

### Phase 3 (API Integration)
- [ ] Request ne sadrži patient identifiers
- [ ] Response se ne logira u console (production)
- [ ] Error messages su sanitizirane
- [ ] Timeout čisti sve in-flight podatke

### Phase 4 (Report Display)
- [ ] Report se čuva u localStorage, ne u cloud
- [ ] Patient data polja su LOKALNA (ne šalju se)
- [ ] Copy/export ne uključuje metadata

### Phase 5 (PDF Export)
- [ ] PDF se generiše client-side
- [ ] PDF ne sadrži metadata (timestamps, user IDs u hidden polju)
- [ ] Print ne leakuje podatke

### Phase 6 (Auth)
- [ ] Supabase NE čuva medicinski sadržaj
- [ ] Usage metrike su anonimizirane (samo counter)
- [ ] "Obriši račun" briše sve podatke
- [ ] GDPR consent se provjerava i za auth-ovane korisnike

---

## Kontakt za Privacy Pitanja

Za MVP koristiti: privacy@aimed.ba (ili tvoj email)
Obavezno navesti u consent modalu.
