# AIMED Auth & Database Setup Plan (for Claude Code)

Ovaj dokument služi kao master instrukcija za **Claude Code** da izvrši backend i sigurnosnu konfiguraciju AIMED portala koristeći Supabase MCP.

## 1. Google OAuth Autentifikacija

Dodati podršku za prijavu putem Google-a.

* **Frontend Status** : Već implementirani ![](vscode-file://vscode-app/Applications/Antigravity.app/Contents/Resources/app/extensions/theme-symbols/src/icons/files/react-ts.svg)

  GoogleButton i `auth/callback` ruta.

* **Zadatak** : Osigurati da PKCE flow radi ispravno i da je Google konfigurisan kao provider u Supabase-u.

## 2. Konfiguracija Baze Podataka (Supabase MCP)

### Korak A: Tabela `profiles`

Kreirati tabelu povezanu sa `auth.users`:

* **Tabela** : `profiles`
* **Kolone** :
* ![](vscode-file://vscode-app/Applications/Antigravity.app/Contents/Resources/app/extensions/theme-symbols/src/icons/files/react-ts.svg)

  id: `uuid` (Primary Key, references `auth.users`)
* `full_name`: ![](vscode-file://vscode-app/Applications/Antigravity.app/Contents/Resources/app/extensions/theme-symbols/src/icons/files/react-ts.svg)

  text (Ime i prezime doktora)
* `specialization`: ![](vscode-file://vscode-app/Applications/Antigravity.app/Contents/Resources/app/extensions/theme-symbols/src/icons/files/react-ts.svg)

  text (Specijalizacija)
* `clinic_name`: ![](vscode-file://vscode-app/Applications/Antigravity.app/Contents/Resources/app/extensions/theme-symbols/src/icons/files/react-ts.svg)

  text (Naziv klinike/ordinacije)
* `updated_at`: `timestamp with time zone` (default `now()`)

 **Triger** : Automatsko kreiranje profila i inicijalnih postavki prilikom registracije novog korisnika.

### Korak B: Tabela `doctor_settings`

Sinhronizacija postavki za Word šablone i print headere:

* **Tabela** : `doctor_settings`
* **Kolone** :
* ![](vscode-file://vscode-app/Applications/Antigravity.app/Contents/Resources/app/extensions/theme-symbols/src/icons/files/react-ts.svg)

  id: `uuid` (Primary Key, references `profiles.id`)
* `word_template_path`: ![](vscode-file://vscode-app/Applications/Antigravity.app/Contents/Resources/app/extensions/theme-symbols/src/icons/files/react-ts.svg)

  text
* `pdf_header_config`: `jsonb` (default `{}`)
* `updated_at`: `timestamp with time zone`

### Korak C: Row Level Security (RLS)

* Aktivirati RLS na svim tabelama (`profiles`, `doctor_settings`).
* Zabraniti javni pristup.
* Dozvoliti korisnicima pristup samo sopstvenim podacima: `auth.uid() = id`.

## 3. n8n Webhook Sigurnost

Osigurati da n8n Webhook ne prihvata anonimne zahtjeve.

* **Izmjena** : Ažurirati ![](vscode-file://vscode-app/Applications/Antigravity.app/Contents/Resources/app/extensions/theme-symbols/src/icons/files/ts.svg)

  src/app/api/submit/route.ts da uključuje `Authorization: Bearer {{session.access_token}}` u headerima.

* n8n će koristiti ovaj token za validaciju sesije.

## 4. Dodatne instrukcije

* **Tipovi** : Generisati TypeScript tipove iz baze i sačuvati u `@/types/supabase.ts`.
* **Lokalizacija** : Prevesti sve preostale sistemske poruke (greške pri registraciji, potvrda emaila) na bosanski jezik.

---

 **Napomena za Claude Code** : Koristi MCP za izvršavanje SQL migracija i provjeru polisa u realnom vremenu.
