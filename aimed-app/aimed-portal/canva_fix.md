# Claude Code Prompt — AiMED Canva Design Fix v2 (Edit Existing)

Paste this into Claude Code with Canva MCP access.
This edits the EXISTING presentation. Do NOT create a new one.

---

```
You are editing an existing Canva presentation for "AiMED" by CEE-MED d.o.o.
Open the existing design and apply every fix below precisely. Do not recreate slides.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GLOBAL RULE #1 — H1 FONT SIZE ON ALL LIGHT SLIDES (02–08)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROBLEM: H1 on every light slide is overflowing — last words like "pacijenata",
"vaše vrijeme", "minuta" are being cut off or pushed off-frame.

FIX:
- All H1 on slides 02–08: reduce to 44pt (down from 64pt)
- Line-height: 1.05
- Letter-spacing: -2%
- Resize the H1 text box to span at least 60% of slide height allowance
  so full text is always visible
- The faded second line (zinc-300 #D4D4D8) must be fully visible on-screen

SLIDE 02: Full H1 must read "Papiri umjesto pacijenata."
SLIDE 03: Full H1 must read "Premalo ljekara. Previše papira."
SLIDE 04: Full H1 must read "Govorite slobodno. AiMED strukturira sve ostalo."
SLIDE 05: Full H1 must read "Četiri koraka. Jedan klik."
SLIDE 06: Full H1 must read "Dva načina rada. Jedan cilj: vaše vrijeme."
           ⚠️ "vaše vrijeme" is currently cut off — fix text box height
SLIDE 07: Full H1 must read "Privatnost po dizajnu. Ne kao afterthought."
SLIDE 08: Full H1 must read "Spremni za rad za manje od 5 minuta."
           ⚠️ "minuta" is currently cut off — expand text box

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GLOBAL RULE #2 — BODY TEXT (ALL SLIDES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FIX:
- Font weight: Regular (400). NOT Medium, NOT SemiBold
- Size: 15–16pt
- Color: #3F3F46 (zinc-700)
- Line-height: 1.65
- Do NOT use pure black (#000000) for body text — only for headings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GLOBAL RULE #3 — CARD BORDERS & SHADOWS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FIX for ALL light cards (stat cards, feature cards, FAQ cards):
- Border: 1px solid #F4F4F5 (zinc-100) — barely visible
- Background: #FAFAFA (zinc-50)
- Shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)
- Radius: 16px
- Internal padding: 24px all sides (minimum)
- No thick visible outlines. No colored borders.

FIX for BLACK accent cards:
- Background: #000000, no border, no shadow
- Internal padding: 28px all sides

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX: SLIDE 06 — FUNKCIJE BENTO GRID (visible in screenshot)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ISSUE FROM SCREENSHOT:
- H1 second line "Jedan cilj: vaše" is clipped — "vrijeme" missing
- Bento cards look good structurally — keep layout as is
- The "NAJČEŠĆE KORIŠTENO" badge on the "Novi snimak" card looks correct

FIX:
- Expand H1 text frame downward until "vaše vrijeme." is fully visible
- Verify all 4 bento cards have at least 20px internal padding
- "Novi snimak" card body text: Regular 14pt zinc-600
- "Ažuriranje nalaza" card body text: Regular 13pt zinc-600
- "Privatnost po dizajnu" (black card): white text 15pt Regular, zinc-400 for body
- "Rad sa šablonima" card: Regular 13pt zinc-600
- All card icons: 20px, black (dark cards: white)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX: SLIDE 07 — SIGURNOST (visible in screenshot)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ISSUE FROM SCREENSHOT:
- H1 text overlaps the security list on the left column
- The black Q&A card on the right ("Ne. Nikada.") looks correct — keep

FIX:
- Reduce H1 to 40pt (this slide has more content than others)
- Move the H1 text box so there is a minimum 24px gap between it
  and the first security list item below
- The security list items: lock icon + text on same row, 14pt Regular zinc-700
- Each list item: 4px spacing between icon and text, 12px between items

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX: SLIDE 08 — PLATFORMA IZBLIZA (visible in screenshot)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ISSUE FROM SCREENSHOT:
- H1 "Spremni za rad za manje od 5" is clipped — "minuta" missing
- A "[No Title]" placeholder is visible in the portal mockup area on the right

FIX:
- Expand H1 frame — full text: "Spremni za rad za manje od 5 minuta."
- Delete the "[No Title]" placeholder text element immediately
- The 3 stacked mockup cards on the right: ensure they have proper titles:
  Top:    "Lista pacijenata" (zinc-400, 10pt ALL CAPS label)
  Middle: "Diktiranje u toku..." (white label, red pulsing dot indicator)
  Bottom: "Strukturirani nalaz" (zinc-400, 10pt ALL CAPS label)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX: SLIDE 09 — FAQ APPENDIX (visible in screenshot)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ISSUE FROM SCREENSHOT:
- All FAQ text is very small and nearly unreadable
- Primary audience is 45–65 year old doctors — text must be clearly legible

FIX:
- Q text (question): Bold, 14pt, black #0D1B2A
- A text (answer): Regular, 13pt, zinc-600 #52525B
- Minimum 16px spacing between Q and A within a card
- Minimum 20px spacing between cards
- Cards: 2-column layout, max 4 per column
- If all 8 Q&As don't fit at 14pt, split into TWO appendix slides (FAQ A + FAQ B)
- Do NOT reduce font below 13pt — readability for older doctors is priority

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX: SLIDE LABEL (small ALL CAPS text above H1)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROBLEM: Label appears too dark/prominent — competes with H1.

FIX (all slides):
- Color: #71717A (zinc-500)
- Size: 10pt
- Weight: Bold
- ALL CAPS, letter-spacing: +180
- Gap between label and H1: 10px

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX: LOGO CONSISTENCY (all slides)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Top-left corner: 32px from edges
- Black rounded square: 28×28px, radius 6px
- "AiMED" wordmark: Inter Bold, 14pt, color: black on light slides / white on dark slides
- Logo identical across ALL slides — do not allow any rescaling

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COPY REWRITE — TONE FOR 45+ YEAR OLD DOCTORS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The audience is doctors aged 45 and older. They are highly intelligent but
not necessarily tech-savvy. They are skeptical of buzzwords.
Rewrite the body/paragraph text on each slide using these principles:

TONE RULES:
- Write like a trusted colleague explaining something over coffee
- No startup jargon ("leverage", "disruptive", "seamless", "AI-powered")
- Use full sentences. No fragmented bullet lists in body text.
- Use analogies to medical practice they know ("like dictating to a nurse",
  "like having a medical secretary who never makes typos")
- Be honest about what the product does and what it does NOT do
- Emphasis on: saving time, not making errors, not replacing the doctor
- Avoid the word "AI" alone — always pair it: "AI asistent", "AI prepoznavanje"

Per-slide rewrites — replace the current body text with the following:

SLIDE 02 (Problem) — body narativ:
"Za svakog pacijenta postoji procedura koja se ponavlja:
otvori program, upiši anamnezu, provjeri dijagnozu po MKB-10
listi, odaberi lijek iz Registra, formatiraj nalaz, printaj i potpiši.
Svaki put. Za svaku osobu.
Zbrojeno: to su stotine sati godišnje koje ne provodite sa pacijentima."

SLIDE 04 (Rješenje) — body definicija:
"AiMED je web-aplikacija kojoj pristupate iz vašeg preglednika —
iste kao što otvarate email ili neku web stranicu.
Ne treba instalacija, ne treba poseban kompjuter.
Govorite na bosanskom, hrvatskom ili srpskom, potpuno prirodno,
kao što biste diktirali sestri ili kolegi.
AiMED to sluša, prepoznaje medicinske pojmove i za manje od
jedne minute složi kompletan nalaz spreman za potpis."

SLIDE 05 (Kako radi) — card bodies:
Card 01 "Snimanje":
"Otvorite AiMED u pregjedniku i pritisnite dugme za snimanje.
Govorite slobodno, kao što razgovarate s pacijentom."

Card 02 "Obrada":
"AiMED razumije naš medicinski rječnik: dijagnoze, lijekove,
latinske nazive. Preciznost: 98,6% (EUSIPCO 2022)."

Card 03 "Strukturiranje":
"Sistem sam prepoznaje šta je anamneza, šta dijagnoza,
šta terapija — i sve svrstava na pravo mjesto u nalazan."

Card 04 "Export":
"Pregledate nalaz, dodate potpis i pečat, i šaljete pacijentu.
Ili kopirate u vaš bolnički program jednim klikom."

SLIDE 06 (Funkcije) — card bodies:
"Novi snimak":
"Kliknete 'Snimi' i počnete govoriti. Ne morate ništa
drugoplanirati — sistem strukturira sve iz vašeg glasa."

"Ažuriranje nalaza":
"Imate pacijenta na kontroli? Recite samo što se promijenilo.
AiMED ažurira samo te dijelove, ostalo ostaje netaknuto."

"Rad sa šablonima":
"Imate obrazac koji koristite godinama? Učitate ga jednom.
AiMED ga popunjava iz vašeg diktatа, s vašim brandingom."

SLIDE 07 (Sigurnost) — Q&A card:
Q: "Hoće li AiMED čuvati ili dijeliti podatke mojih pacijenata?"
A: "Ne, nikada. Sve što govorite se obradi i odmah briše.
   Nijedan audio zapis ne ostaje pohranjen. Nikome."

SLIDE 08 (Platforma) — phase descriptions:
Phase 01: "Odete na aimed.cee-med.ba i registrujete se —
kao što biste napravili email nalog. Traje 2 minute."

Phase 02: "Unesete naziv vaše ordinacije, adresu i
broj licence. Učitate sliku pečata i potpisa."

Phase 03: "Dodajete logo — od tog trenutka svaki PDF
koji izađe iz AiMED-a nosi vaš branding, automatski."

Phase 04: "Unesete pacijenta jednom. Svaki sljedeći nalaz
za tu osobu vezuje se automatski uz njen karton."

Phase 05: "Pritisnete 'Snimi' i počnete diktirati. Odaberete
format i kliknete Export. Gotovo."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL CONSISTENCY CHECK AFTER ALL FIXES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. No text element clips or overflows its frame on any slide
2. All body text: Regular 400, 15–16pt, zinc-700
3. All labels: 10pt Bold ALL CAPS zinc-500, ls+180
4. FAQ text: minimum 13pt (split to 2 slides if needed)
5. No "[No Title]" or empty placeholder text boxes left on any slide
6. Logo: identical position and size on every slide
7. H1 faded line: always zinc-300 (#D4D4D8), never zinc-500 or darker
8. Page numbering: "0X / 09" (or 10 if FAQ is split), zinc-400 11pt bottom-right
9. Slide margins: minimum 48px content-to-edge on all slides
```
