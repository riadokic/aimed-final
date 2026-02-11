# UI Design Guidelines — AIMED

## Design Philosophy: Scientific Minimalism

AIMED portal je "tihi asistent" — ne zahtijeva pažnju, već je tu kad treba. Inspirisan Attio-om i medicinskom preciznošću, dizajn koristi **Scientific Minimalism**: grayscale paleta eliminira vizuelni šum, boja služi isključivo za status i akcije.

### Core Principles
1. **Redukcija kognitivnog opterećenja** — Grayscale dominira. Boja = status signal (crvena tačka = snimanje, zelena = uspjeh).
2. **Bento Grid kao temelj** — Sve je smješteno u strogi grid sistem koji simulira organizovanost medicinskog kartona.
3. **Taktički feedback** — Svaki klik ima suptilnu animaciju (smooth easing) — osjećaj responzivnosti i luksuza.
4. **Whitespace je feature** — Generozni razmaci, nikad gužva.
5. **Zero decoration** — Nema gradijenata, nema sjena, nema ikona radi ikona.

---

## Color Palette

### Grayscale (Primary — 95% interfejsa)
```
--aimed-black:    #1a1a1a    /* Primary text, primary buttons */
--aimed-gray-900: #2d2d2d    /* Secondary text */
--aimed-gray-700: #4b5563    /* Tertiary text */
--aimed-gray-500: #6b7280    /* Labels, placeholders */
--aimed-gray-400: #9ca3af    /* Disabled text, subtle borders */
--aimed-gray-200: #e5e7eb    /* Card borders, dividers */
--aimed-gray-100: #f3f4f6    /* Hover backgrounds, bento card bg */
--aimed-gray-50:  #f9fafb    /* Page background */
--aimed-white:    #ffffff    /* Card surfaces */
```

### Status Colors (Sparingly — only for meaning)
```
--aimed-red:        #dc2626    /* Recording active dot, destructive */
--aimed-red-glow:   rgba(220, 38, 38, 0.15)  /* Recording pulse glow */
--aimed-green:      #16a34a    /* Success confirmation */
--aimed-green-light:#f0fdf4    /* Success background */
--aimed-amber:      #d97706    /* Warnings, [NAPOMENA] */
--aimed-amber-light:#fffbeb    /* Warning background */
--aimed-blue:       #2563eb    /* Links, accent (landing page only) */
--aimed-blue-light: #dbeafe    /* Accent background (landing page only) */
```

### Key Rule
In-app portal: **Almost no blue.** Black buttons, grayscale cards, color only for status.
Landing page: Blue accent allowed for CTAs and branding.

---

## Typography

- **Font**: `Inter` (subsets: latin, latin-ext for č, ć, š, ž, đ)
- **Base size**: 14px (`text-sm`)
- **Headings**: `font-semibold`, never bold
- **Body**: `font-normal`, `text-aimed-gray-900`
- **Labels**: `text-xs font-medium text-aimed-gray-500 uppercase tracking-wider`

### Scale
| Element | Tailwind Class |
|---------|---------------|
| Page title | `text-xl font-semibold text-aimed-black` |
| Section title | `text-sm font-semibold text-aimed-black uppercase tracking-wider` |
| Body text | `text-sm text-aimed-gray-900 leading-relaxed` |
| Label / meta | `text-xs font-medium text-aimed-gray-500 uppercase tracking-wider` |
| Stat number | `text-2xl font-semibold text-aimed-black tabular-nums` |
| Small / hint | `text-xs text-aimed-gray-400` |

---

## Bento Grid System

Bento grid je organizacioni princip cijelog portala. Kartice su rigidne, ravne, sa tankim borderima.

### Card Base
```
bg-aimed-white border border-aimed-gray-200 rounded-2xl p-6
```
- Rounded corners: `rounded-2xl` (16px) — jedina "mekša" stvar u dizajnu
- **No shadows ever** — samo border
- Hover (interactive cards): `hover:border-aimed-gray-400 transition-colors duration-200`

### Grid Layouts
```css
/* Dashboard stat row (4 columns) */
grid grid-cols-4 gap-4

/* Report sections (2 columns) */
grid grid-cols-2 gap-4

/* Single wide + sidebar */
grid grid-cols-3 gap-4  /* col-span-2 + col-span-1 */

/* Full width */
col-span-full
```

### Card Variants
```
Stat Card:     p-5, label top (xs, gray-500, uppercase), value large (2xl, semibold, black)
Content Card:  p-6, title top (sm, semibold), body below (sm, gray-700)
Action Card:   p-6, interactive hover, cursor-pointer
Editor Card:   p-6, contenteditable body, focus ring (border-aimed-black)
```

---

## Buttons

### Primary (Black — in-app default)
```
bg-aimed-black text-white hover:bg-aimed-gray-900
rounded-lg px-5 py-2.5 text-sm font-medium
transition-colors duration-200
```

### Secondary (Outline)
```
bg-aimed-white text-aimed-black border border-aimed-gray-200
hover:bg-aimed-gray-50 hover:border-aimed-gray-400
rounded-lg px-5 py-2.5 text-sm font-medium
transition-colors duration-200
```

### Ghost
```
text-aimed-gray-500 hover:text-aimed-black hover:bg-aimed-gray-100
rounded-lg px-3 py-1.5 text-sm font-medium
transition-colors duration-200
```

### Danger
```
bg-aimed-red text-white hover:bg-red-700
rounded-lg px-5 py-2.5 text-sm font-medium
```

### Icon Button
```
p-2 rounded-lg text-aimed-gray-400 hover:text-aimed-black hover:bg-aimed-gray-100
transition-colors duration-200
```

---

## Sidebar

- Width: `w-60` (240px)
- Background: `bg-aimed-white` sa right border
- Logo area: AIMED logo + name, `h-16`, border-bottom
- Nav items: `text-sm text-aimed-gray-600 hover:bg-aimed-gray-100 rounded-lg px-3 py-2.5`
- Active item: `bg-aimed-gray-100 text-aimed-black font-medium`
- Bottom: Settings link + user info

Inspiracija: Rentful screenshot sidebar — čist, ikone lijevo, tekst desno, active state sa subtle bg.

---

## Three Application States (Dictation Page)

### State 1: IDLE
```
┌──────────────────────────────────────────────┐
│                                              │
│    Bento Card (centered, max-w-lg)           │
│                                              │
│    ┌────────────────────────────────────┐    │
│    │  Microphone icon (gray)            │    │
│    │  "Započni diktiranje"              │    │
│    │  Privacy notice (subtle text)      │    │
│    │                                    │    │
│    │     [ Započni diktiranje ]          │    │
│    │     (Black button, full width)     │    │
│    └────────────────────────────────────┘    │
│                                              │
└──────────────────────────────────────────────┘
```

### State 2: RECORDING (The Live Window)
```
┌──────────────────────────────────────────────┐
│                                              │
│    Bento Card (dark variant: bg-aimed-gray-900) │
│                                              │
│    ┌────────────────────────────────────┐    │
│    │  ● SNIMANJE           03:24       │    │
│    │  (red dot pulsing)    (MM:SS)     │    │
│    │                                    │    │
│    │  ▁▂▃▅▆▅▃▂▁▂▃▅▆▅▃▂▁               │    │
│    │  (waveform animation, color #555)  │    │
│    │                                    │    │
│    │  "...pacijent navodi bolove u      │    │
│    │   lumbalnom dijelu..."             │    │
│    │  (live transcript preview, gray)   │    │
│    │                                    │    │
│    │  [ Pauziraj ]    [ Završi ]       │    │
│    │  (ghost white)   (white bg, dark) │    │
│    └────────────────────────────────────┘    │
│                                              │
│    ⓘ Ne izgovarajte lične podatke pacijenta  │
│                                              │
└──────────────────────────────────────────────┘
```

Recording card je **inverted** — tamna pozadina (`bg-aimed-gray-900`, tekst bijeli).
Ovo vizuelno signalizira "aktivan režim" bez korištenja boje.

Red dot: jedini element u boji. Pulsira sa glow efektom.

### State 3: PROCESSING (Skeleton Loaders)
```
┌──────────────────────────────────────────────┐
│                                              │
│    Bento Grid (2 cols)                       │
│                                              │
│    ┌─────────────┐  ┌─────────────────┐     │
│    │ ░░░░░░░░░░░ │  │ ░░░░░░░░░░░░░░ │     │
│    │ ANAMNEZA    │  │ STATUS          │     │
│    │ ░░░░░░░░░░░ │  │ ░░░░░░░░░░░░░░ │     │
│    │ ░░░░░░░     │  │ ░░░░░░░        │     │
│    └─────────────┘  └─────────────────┘     │
│    ┌─────────────┐  ┌─────────────────┐     │
│    │ ░░░░░░░░░░░ │  │ ░░░░░░░░░░░░░░ │     │
│    │ DIJAGNOZA   │  │ TERAPIJA        │     │
│    │ ░░░░░░░░░░░ │  │ ░░░░░░░░░░░░░░ │     │
│    └─────────────┘  └─────────────────┘     │
│                                              │
│    "Obrađujem vaš nalaz..."                  │
│                                              │
└──────────────────────────────────────────────┘
```

Skeleton cards: `bg-aimed-gray-100` sa pulsing animacijom.
Section titles vidljivi odmah, content "stiže".

### State 4: EDITING (Structured Vertical Stack)
```
┌──────────────────────────────────────────────┐
│  Toolbar: [Kopiraj za HIS] [Preuzmi PDF]     │
│                                              │
│  Vertical Stack (single column, max-w-2xl)   │
│                                              │
│  ┌───────────────────────────────────────┐   │
│  │ ANAMNEZA                □ Uredan nalaz│   │
│  │ Pacijent, 45 godina, dolazi zbog      │   │
│  │ bolova u lumbalnom dijelu kičme...    │   │
│  │ [contenteditable]                     │   │
│  └───────────────────────────────────────┘   │
│  ┌───────────────────────────────────────┐   │
│  │ STATUS                  □ Uredan nalaz│   │
│  │ Palpaciona bolnost paravertebralne    │   │
│  │ muskulature L4-L5...                  │   │
│  │ [contenteditable]                     │   │
│  └───────────────────────────────────────┘   │
│  ┌───────────────────────────────────────┐   │
│  │ DIJAGNOZA                             │   │
│  │ M54.5 Lumbalgia acuta                 │   │
│  │ [MKB-10 auto-suggest dropdown]        │   │
│  └───────────────────────────────────────┘   │
│  ┌───────────────────────────────────────┐   │
│  │ TERAPIJA                              │   │
│  │ Ibuprofen 400mg 3x1, 7 dana          │   │
│  │ [contenteditable]                     │   │
│  └───────────────────────────────────────┘   │
│  ┌───────────────────────────────────────┐   │
│  │ PREPORUKE                             │   │
│  │ Kontrola za 7 dana. Mirovanje...     │   │
│  │ [contenteditable]                     │   │
│  └───────────────────────────────────────┘   │
│                                              │
│  ┌── Podaci o pacijentu (lokalno) ───────┐   │
│  │ Ime: [________]  JMBG: [___________]  │   │
│  │ Datum rođenja: [DD.MM.GGGG.]          │   │
│  └───────────────────────────────────────┘   │
│                                              │
└──────────────────────────────────────────────┘
```

Layout: `flex flex-col gap-4 max-w-2xl mx-auto`. Svaka sekcija je zasebna kartica, jedna ispod druge. Čitljivije, prirodniji tok kao pravi medicinski nalaz.

**Focus Mode**: Klik na sekciju → `border-aimed-black`, ostali boxovi `opacity-60`.

**"Uredan nalaz" macro**: Checkbox u kutu svakog boxa, jednim klikom popunjava standardnim tekstom.

---

## Animations & Micro-interactions

### Allowed Animations
- **Hover states**: `transition-colors duration-200 ease-out`
- **Recording red dot**: `animate-pulse` + custom glow
- **Waveform**: CSS/Canvas animacija, boja `#555`, suptilna
- **Skeleton pulse**: `animate-pulse` na `bg-aimed-gray-100`
- **Text appear (typewriter)**: Kad report stiže, tekst se pojavljuje postepeno
- **Focus mode**: `transition-opacity duration-300` za blur ostalih kartica
- **Card hover**: `transition-colors duration-200` za border

### Forbidden
- Page transitions
- Bouncing/spring animations
- Parallax
- 3D transforms
- Hover scale effects (except record button in idle)

---

## Recording Waveform

Tokom snimanja, centralna kartica prikazuje waveform vizualizaciju.

- Canvas element, visina ~80px
- Boja talasa: `#555555` (tamno siva, NE boja)
- Smooth, organski oblik (ne pikselizirani bar graph)
- Reaguje na audio input volume
- Kad je tiho: ravna linija sa minimalnim šumom
- Kad ljekar govori: dinamični talasi

---

## Skeleton Loaders

Dok se čeka odgovor sa n8n-a:

```
Skeleton line:  h-3 bg-aimed-gray-200 rounded-full animate-pulse
Skeleton block: h-20 bg-aimed-gray-100 rounded-xl animate-pulse
```

Sekcije se prikazuju kao prazne bento kartice sa:
- Section title (vidljiv odmah, `text-xs uppercase`)
- 3-4 skeleton linija ispod (raznih dužina: w-full, w-3/4, w-1/2)
- Subtle pulse animacija

---

## PDF Export Modal

Elegantni modal za preuzimanje nalaza:

```
┌─── Preuzmi nalaz ────────────────────────┐
│                                          │
│  Preview (scaled down report)            │
│  ┌────────────────────────────────────┐  │
│  │  [Logo klinike]                    │  │
│  │  SPECIJALISTIČKI NALAZ             │  │
│  │  ...                               │  │
│  │              [Pečat] [Potpis]       │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Šablon:                                 │
│  ○ Osnovni  ○ Klinički  ○ Privatni       │
│                                          │
│  [ Preuzmi PDF ]  (black button)         │
│                                          │
└──────────────────────────────────────────┘
```

---

## Settings Page

### Sekcije
1. **Lični podaci**: Ime, Prezime, Specijalizacija, Faksimil broj
2. **Klinika**: Naziv ustanove, Adresa, Kontakt telefon
3. **Branding**: Upload logotipa klinike, upload digitalnog pečata (PNG, transparentna pozadina)
4. **Privatnost**: "Obriši sve podatke" button, GDPR info
5. **Jezik sučelja**: Bosanski / English (buduće tržište)

Layout: Bento grid, svaka sekcija u zasebnoj kartici.

---

## Lokalizacija (BiH Standard)

### Formati
- **Datum**: DD.MM.GGGG. (obavezna tačka na kraju: 15.01.2026.)
- **Vrijeme**: HH:MM (24-satni: 14:30)
- **Valuta**: KM (za buduće module)
- **Pismo**: Latinica (nikad ćirilica)
- **Dijakritici**: Obavezni (č, ć, š, ž, đ, dž)

### UI Copy (Bosanski)
- "Započni diktiranje" (Start dictation)
- "Završi" (Finish)
- "Pauziraj" / "Nastavi" (Pause / Resume)
- "Snimanje" (Recording — status label)
- "Obrađujem vaš nalaz..." (Processing your report...)
- "Kopiraj za HIS" (Copy for HIS — plain text)
- "Preuzmi PDF" (Download PDF)
- "Uredan nalaz" (Normal finding — macro button)
- "Novi nalaz" (New report)
- "Historija nalaza" (Report history)
- "Postavke" (Settings)
- "Obriši sve podatke" (Delete all data)
- "Greška pri obradi" (Processing error)
- "Pokušajte ponovo" (Try again)

### Medicinski termini
Izbjegavati tuđice. Koristiti BiH medicinsku praksu:
- "Nalaz" (ne "report")
- "Pregled" (ne "examination")
- "Terapija" (ne "treatment plan")
- "Dijagnoza" (ne "diagnosis" u UI copy)
- MKB-10 kodovi za dijagnoze (bosanski nazivi)
