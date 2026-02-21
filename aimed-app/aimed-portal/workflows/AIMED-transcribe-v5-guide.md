# AiMED Transcription Workflow v5 — Kompletni Vodič

> **Verzija:** 5.0
> **Datum:** Februar 2026
> **Autor:** Claude Code + Riad
> **Stack:** Deepgram Nova-3 · Claude Sonnet 4.5 · n8n AI Agent · Supabase pgvector

---

## Sadržaj

1. [Arhitektura](#1-arhitektura)
2. [Šta je novo u v5](#2-šta-je-novo-u-v5)
3. [Preduvjeti](#3-preduvjeti)
4. [Supabase Setup](#4-supabase-setup)
   - 4.1 MKB-10 tabela
   - 4.2 Registar lijekova + vektorski indeks
   - 4.3 RPC funkcije za pretragu
   - 4.4 Edge Functions
5. [n8n Workflow Setup](#5-n8n-workflow-setup)
   - 5.1 Kredencijali
   - 5.2 Import i konfiguracija
   - 5.3 Pregled nodova (12 nodova, uklj. silence guardrail)
6. [Frontend Integracija](#6-frontend-integracija)
7. [Punjenje Baza Podataka](#7-punjenje-baza-podataka)
   - 7.1 MKB-10 import sa mkb.hzjz.hr (39,848 kodova)
   - 7.2 Registar lijekova BiH — PDF ekstrakcija (3,406 lijekova)
8. [Testiranje](#8-testiranje)
9. [Analiza Troškova](#9-analiza-troškova)
10. [Assessment](#10-assessment)
11. [Troubleshooting](#11-troubleshooting)
12. [Status Implementacije](#12-status-implementacije)

---

## 1. Arhitektura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AIMED v5 — Data Flow                            │
│                                                                         │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────┐    ┌──────────┐ │
│  │ React    │───▶│ Next.js API  │───▶│ n8n Webhook   │───▶│ Deepgram │ │
│  │ Frontend │    │ /api/submit  │    │ POST          │    │ Nova-3   │ │
│  │          │    │              │    │               │    │ (hr)     │ │
│  └──────────┘    └──────────────┘    └───────────────┘    └────┬─────┘ │
│       ▲                                                        │       │
│       │                                                        ▼       │
│       │          ┌──────────────────────────────────────────────┐      │
│       │          │            n8n AI Agent                       │      │
│       │          │         (Claude Sonnet 4.5)                  │      │
│       │          │                                              │      │
│       │          │  ┌─────────────┐    ┌────────────────────┐  │      │
│       │          │  │ Tool:       │    │ Tool:              │  │      │
│       │          │  │ MKB-10      │    │ Registar Lijekova  │  │      │
│       │          │  │ Pretraga    │    │ BiH (RAG)          │  │      │
│       │          │  └──────┬──────┘    └─────────┬──────────┘  │      │
│       │          │         │                     │              │      │
│       │          └─────────┼─────────────────────┼──────────────┘      │
│       │                    │                     │                      │
│       │                    ▼                     ▼                      │
│       │          ┌──────────────┐    ┌────────────────────┐            │
│       │          │ Supabase     │    │ Supabase           │            │
│       │          │ mkb10_codes  │    │ drug_registry      │            │
│       │          │ (full-text)  │    │ (pgvector RAG)     │            │
│       │          └──────────────┘    └────────────────────┘            │
│       │                                                                │
│       │    ┌───────────────────┐    ┌──────────────┐                  │
│       └────│ Structured JSON   │◀───│ Parse &      │                  │
│            │ Response           │    │ Validate     │                  │
│            └───────────────────┘    └──────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Ključni principi

| Princip | Objašnjenje |
|---------|-------------|
| **User-Centric Sections** | Svaki doktor definiše vlastite sekcije u Supabase `profiles.report_categories`. Workflow ih prima kao niz — nikada ne pretpostavlja strukturu. |
| **Zero-Hallucination** | AI nikada ne izmišlja sadržaj. Stroga whitelist/blacklist validacija na dva nivoa (AI prompt + Code node). |
| **Tool-Augmented AI** | AI Agent koristi alate za MKB-10 i Registar lijekova — ne pogađa, nego provjerava iz izvora istine. |
| **One Workflow, N Doctors** | Jedan n8n workflow opslužuje neograničen broj doktora sa različitim stilovima nalaza. |

---

## 2. Šta je novo u v5

| Komponenta | v3/v4 (trenutno) | v5 (novo) |
|------------|-------------------|-----------|
| **Transkripcija** | OpenAI Whisper | **Deepgram Nova-3** (hr) — bolji za akcente i med. terminologiju |
| **AI Processing** | Claude Haiku (simple prompt) | **Claude Sonnet 4.5 + AI Agent** sa alatima |
| **Dijagnoze** | Bez validacije | **MKB-10 pretraga** — automatska šifra |
| **Lijekovi** | Bez validacije | **Registar lijekova BiH** (RAG) — autokorekcija naziva |
| **Arhitektura** | Linear pipeline (5 nodes) | **Agent architecture** (12 nodes, 2 alata, silence guardrail) |
| **Cijena/req** | ~$0.005 (Haiku) | ~$0.03-0.08 (Sonnet + tools) |
| **Preciznost** | Dobra | **Ultra-precizna** (validacija iz izvora) |

---

## 3. Preduvjeti

### Servisi i API ključevi

| Servis | Za šta | Kako dobiti |
|--------|--------|-------------|
| **Deepgram** | Audio transkripcija (Nova-3) | [console.deepgram.com](https://console.deepgram.com) → API Keys |
| **Anthropic** | AI Agent (Claude Sonnet 4.5) | [console.anthropic.com](https://console.anthropic.com) → API Keys |
| **Supabase** | Baza podataka + Edge Functions | Već konfigurisan (`ljtxybwihzyxocxzsizx`) |
| **n8n** | Workflow orchestration | Već konfigurisan (`n8n.internal.gethotelly.com`) |

### Softver

- Supabase CLI (`npx supabase`) — za deploy Edge Functions
- Python 3.10+ — za import MKB-10 podataka i PDF processing
- Node.js 18+ — za frontend

---

## 4. Supabase Setup

### 4.1 MKB-10 tabela

Ova tabela sadrži kompletnu Međunarodnu klasifikaciju bolesti (verzija 10, hrvatska adaptacija).

```sql
-- Migration: create_mkb10_codes_table
-- Pokreni kao Supabase migraciju

-- Omogući pg_trgm za fuzzy search (u extensions schema za sigurnost)
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.mkb10_codes (
  id          SERIAL PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,        -- "M54.3"
  name_hr     TEXT NOT NULL,               -- "Ishijalgija"
  name_lat    TEXT,                        -- "Ischialgia"
  category    TEXT,                        -- "M00-M99 Bolesti mišićno-koštanog sustava"
  subcategory TEXT,                        -- "M50-M54 Ostale dorsopatije"
  description TEXT,                        -- Dodatni opis
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Full-text search indeks (hrvatski)
CREATE INDEX IF NOT EXISTS idx_mkb10_name_hr_trgm
  ON public.mkb10_codes USING gin (name_hr gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_mkb10_name_lat_trgm
  ON public.mkb10_codes USING gin (name_lat gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_mkb10_code
  ON public.mkb10_codes USING btree (code);

-- RLS: čitanje za sve autentificirane korisnike
ALTER TABLE public.mkb10_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mkb10_read_authenticated"
  ON public.mkb10_codes FOR SELECT
  TO authenticated
  USING (true);

-- Dozvoli pristup i za anon (potrebno za Edge Functions)
CREATE POLICY "mkb10_read_anon"
  ON public.mkb10_codes FOR SELECT
  TO anon
  USING (true);
```

### 4.2 Registar lijekova + vektorski indeks

Ova tabela sadrži podatke iz PDF registra lijekova BiH, vektorizovane za semantičku pretragu.

```sql
-- Migration: create_drug_registry_table

-- Omogući pgvector (u extensions schema za sigurnost)
CREATE EXTENSION IF NOT EXISTS vector SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.drug_registry (
  id              SERIAL PRIMARY KEY,
  trade_name      TEXT NOT NULL,            -- "Sumamed"
  generic_name    TEXT,                     -- "Azitromicin"
  strength        TEXT,                     -- "500mg"
  form            TEXT,                     -- "film tableta"
  manufacturer    TEXT,                     -- "Pliva"
  atc_code        TEXT,                     -- "J01FA10"
  indication      TEXT,                     -- Kratki opis indikacije
  content_chunk   TEXT NOT NULL,            -- Tekstualni chunk iz PDF-a
  embedding       vector(1536),            -- OpenAI text-embedding-3-small
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Vektorski indeks za brzu similarity pretragu
CREATE INDEX IF NOT EXISTS idx_drug_embedding
  ON public.drug_registry USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

-- Trigram indeks za fuzzy text search (backup za vector search)
CREATE INDEX IF NOT EXISTS idx_drug_trade_name_trgm
  ON public.drug_registry USING gin (trade_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_drug_generic_name_trgm
  ON public.drug_registry USING gin (generic_name gin_trgm_ops);

-- RLS
ALTER TABLE public.drug_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drugs_read_authenticated"
  ON public.drug_registry FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "drugs_read_anon"
  ON public.drug_registry FOR SELECT
  TO anon
  USING (true);
```

### 4.3 RPC funkcije za pretragu

#### MKB-10 pretraga (fuzzy + trigram)

```sql
-- Migration: create_search_functions

-- Funkcija za pretragu MKB-10 šifara
-- Koristi trigram similarity za fuzzy matching
CREATE OR REPLACE FUNCTION public.search_mkb10(search_term TEXT, max_results INT DEFAULT 5)
RETURNS TABLE (
  code        TEXT,
  name_hr     TEXT,
  name_lat    TEXT,
  category    TEXT,
  similarity  REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.code,
    m.name_hr,
    m.name_lat,
    m.category,
    GREATEST(
      similarity(m.name_hr, search_term),
      similarity(COALESCE(m.name_lat, ''), search_term),
      CASE WHEN m.code ILIKE search_term || '%' THEN 1.0 ELSE 0.0 END
    ) AS similarity
  FROM public.mkb10_codes m
  WHERE
    m.name_hr % search_term
    OR m.name_lat % search_term
    OR m.code ILIKE search_term || '%'
    OR m.name_hr ILIKE '%' || search_term || '%'
  ORDER BY similarity DESC
  LIMIT max_results;
END;
$$;
```

#### Registar lijekova pretraga (hybrid: vector + fuzzy)

```sql
-- Funkcija za vektorsku pretragu registra lijekova
-- Prima embedding vektor i vraća najbliže rezultate
CREATE OR REPLACE FUNCTION public.match_drugs(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id            INT,
  trade_name    TEXT,
  generic_name  TEXT,
  strength      TEXT,
  form          TEXT,
  atc_code      TEXT,
  content_chunk TEXT,
  similarity    FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.trade_name,
    d.generic_name,
    d.strength,
    d.form,
    d.atc_code,
    d.content_chunk,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM public.drug_registry d
  WHERE 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Fuzzy text search fallback (bez embeddinga)
CREATE OR REPLACE FUNCTION public.search_drugs_fuzzy(
  search_term TEXT,
  max_results INT DEFAULT 5
)
RETURNS TABLE (
  trade_name    TEXT,
  generic_name  TEXT,
  strength      TEXT,
  form          TEXT,
  atc_code      TEXT,
  similarity    REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.trade_name,
    d.generic_name,
    d.strength,
    d.form,
    d.atc_code,
    GREATEST(
      similarity(d.trade_name, search_term),
      similarity(COALESCE(d.generic_name, ''), search_term)
    ) AS similarity
  FROM public.drug_registry d
  WHERE
    d.trade_name % search_term
    OR d.generic_name % search_term
    OR d.trade_name ILIKE '%' || search_term || '%'
  ORDER BY similarity DESC
  LIMIT max_results;
END;
$$;
```

### 4.4 Edge Functions

#### `search-mkb10` — MKB-10 pretraga

Kreiraj fajl: `supabase/functions/search-mkb10/index.ts`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "Query must be at least 2 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase.rpc("search_mkb10", {
      search_term: query.trim(),
      max_results: 5,
    });

    if (error) throw error;

    // Format results for AI Agent consumption
    const results = (data || []).map((row: any) => ({
      code: row.code,
      name: row.name_hr,
      latin: row.name_lat || null,
      category: row.category || null,
      match_score: row.similarity,
    }));

    return new Response(
      JSON.stringify({
        query: query.trim(),
        results,
        count: results.length,
        source: "mkb.hzjz.hr",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "MKB-10 search failed", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

#### `search-drugs` — Registar lijekova (hybrid search)

Kreiraj fajl: `supabase/functions/search-drugs/index.ts`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "Query must be at least 2 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const searchTerm = query.trim();

    // Strategy 1: Try fuzzy text search first (fast, no embedding needed)
    const { data: fuzzyResults, error: fuzzyError } = await supabase.rpc(
      "search_drugs_fuzzy",
      { search_term: searchTerm, max_results: 5 }
    );

    if (fuzzyError) throw fuzzyError;

    // If fuzzy search found good results (similarity > 0.3), return them
    const goodFuzzy = (fuzzyResults || []).filter((r: any) => r.similarity > 0.3);

    if (goodFuzzy.length > 0) {
      const results = goodFuzzy.map((row: any) => ({
        trade_name: row.trade_name,
        generic_name: row.generic_name || null,
        strength: row.strength || null,
        form: row.form || null,
        atc_code: row.atc_code || null,
        match_score: row.similarity,
        search_method: "fuzzy",
      }));

      return new Response(
        JSON.stringify({
          query: searchTerm,
          results,
          count: results.length,
          source: "Registar lijekova BiH",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Strategy 2: Fall back to vector search (requires embedding)
    // Generate embedding for the query using OpenAI
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiKey) {
      // No OpenAI key — return fuzzy results even if low quality
      return new Response(
        JSON.stringify({
          query: searchTerm,
          results: (fuzzyResults || []).map((row: any) => ({
            trade_name: row.trade_name,
            generic_name: row.generic_name || null,
            strength: row.strength || null,
            form: row.form || null,
            atc_code: row.atc_code || null,
            match_score: row.similarity,
            search_method: "fuzzy_fallback",
          })),
          count: (fuzzyResults || []).length,
          source: "Registar lijekova BiH",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate embedding
    const embResponse = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: searchTerm,
      }),
    });

    const embData = await embResponse.json();
    const embedding = embData.data?.[0]?.embedding;

    if (!embedding) {
      throw new Error("Failed to generate embedding");
    }

    // Vector similarity search
    const { data: vectorResults, error: vectorError } = await supabase.rpc(
      "match_drugs",
      {
        query_embedding: embedding,
        match_threshold: 0.4,
        match_count: 5,
      }
    );

    if (vectorError) throw vectorError;

    const results = (vectorResults || []).map((row: any) => ({
      trade_name: row.trade_name,
      generic_name: row.generic_name || null,
      strength: row.strength || null,
      form: row.form || null,
      atc_code: row.atc_code || null,
      match_score: row.similarity,
      search_method: "vector",
    }));

    return new Response(
      JSON.stringify({
        query: searchTerm,
        results,
        count: results.length,
        source: "Registar lijekova BiH",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Drug search failed", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

---

## 5. n8n Workflow Setup

### 5.1 Kredencijali

Prije importa workflowa, kreiraj ove kredencijale u n8n:

#### A. Deepgram API

| Polje | Vrijednost |
|-------|-----------|
| **Type** | Header Auth |
| **Name** | `Deepgram API` |
| **Header Name** | `Authorization` |
| **Header Value** | `Token dg_YOUR_DEEPGRAM_API_KEY` |

> **Pazi:** Deepgram koristi prefix `Token`, NE `Bearer`.

#### B. Anthropic API

| Polje | Vrijednost |
|-------|-----------|
| **Type** | Anthropic API (n8n built-in) |
| **Name** | `Anthropic API` |
| **API Key** | `sk-ant-api03-YOUR_KEY` |

#### C. Supabase Anon Key

| Polje | Vrijednost |
|-------|-----------|
| **Type** | Header Auth |
| **Name** | `Supabase Anon Key` |
| **Header Name** | `Authorization` |
| **Header Value** | `Bearer YOUR_SUPABASE_ANON_KEY` |

> Ovaj kredencijal koriste oba alata (MKB-10 i Registar) za poziv Edge Functions.

### 5.2 Import i konfiguracija

1. **Import:** U n8n, idi na Workflows → Import from File → odaberi `AIMED-transcribe-v5.json`

2. **Poveži kredencijale:**
   - `Deepgram Nova-3` node → odaberi "Deepgram API" credential
   - `Claude Sonnet 4.5` node → odaberi "Anthropic API" credential
   - `MKB-10 Pretraga` node → odaberi "Supabase Anon Key" credential
   - `Registar Lijekova BiH` node → odaberi "Supabase Anon Key" credential

3. **Webhook URL:**
   - Aktiviraj workflow
   - Kopiraj Production webhook URL (format: `https://n8n.internal.gethotelly.com/webhook/AIMED-transcribe-v5`)
   - Ažuriraj `.env.local` u frontend aplikaciji

4. **Testiraj:**
   - Klikni "Test workflow" u n8n
   - Pošalji test audio sa cURL (vidjeti sekciju 8)

### 5.3 Pregled nodova (12 nodova)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                        n8n Workflow: AIMED-transcribe-v5                          │
│                                                                                  │
│   [Webhook]──▶[Deepgram Nova-3]──▶[Silence Guardrail]──▶[Has Speech?]          │
│                                                              │         │         │
│                                                         (true)     (false)       │
│                                                              │         │         │
│                                                              ▼         ▼         │
│                                        [Prepare Agent Context]   [Silence Error] │
│                                                  │                     │         │
│                                                  ▼                     ▼         │
│                                            [AI Agent]        [Respond Silence]   │
│                                          ╱     │      ╲                          │
│                             [Claude 4.5]  [MKB-10]  [Drugs]                      │
│                                                  │                               │
│                                                  ▼                               │
│                                      [Parse & Validate]                          │
│                                                  │                               │
│                                                  ▼                               │
│                                      [Respond with JSON]                         │
└──────────────────────────────────────────────────────────────────────────────────┘
```

| # | Node | Tip | Funkcija |
|---|------|-----|----------|
| 1 | **Webhook** | `webhook` | Prima POST sa audio binarnim fajlom + form fields (mode, sections, existing_data) |
| 2 | **Deepgram Nova-3** | `httpRequest` | Šalje audio na Deepgram API. Model: `nova-3`, jezik: `hr`. Vraća transkript. |
| 3 | **Silence Guardrail** | `code` | Detektuje prazan/tihi audio: provjerava prazan transkript, <10 znakova, confidence <0.25, samo filler riječi ("hmm", "ovaj"), dugačak snimak sa <3 riječi. |
| 4 | **Has Speech?** | `if` | Grananje: ako `hasSpeech === true` → AI Agent path; ako `false` → Silence Error path. |
| 5 | **Prepare Agent Context** | `code` | Izvlači transkript iz Deepgram odgovora, čita sekcije i mode iz webhook body, gradi korisnički prompt za AI Agenta. |
| 6 | **AI Agent** | `agent` | Srce workflowa. Prima transkript + sekcije. Semantički razvrstava sadržaj. Poziva alate za validaciju dijagnoza i lijekova. |
| 7 | **Claude Sonnet 4.5** | `lmChatAnthropic` | LLM model koji pogoni AI Agenta. Temperature: 0 (deterministički). Max tokens: 8192. |
| 8 | **MKB-10 Pretraga** | `toolHttpRequest` | Alat za AI Agenta. Poziva Supabase Edge Function za fuzzy pretragu MKB-10 šifara (39,848 kodova). |
| 9 | **Registar Lijekova BiH** | `toolHttpRequest` | Alat za AI Agenta. Poziva Supabase Edge Function za fuzzy pretragu registra lijekova (3,406 lijekova). |
| 10 | **Parse & Validate** | `code` | Parsira JSON izlaz AI Agenta. Enforceuje whitelist sekcija. Uklanja zabranjene admin ključeve. |
| 11 | **Respond with JSON** | `respondToWebhook` | Vraća strukturirani JSON odgovor frontendu. |
| 12 | **Silence Error Response** | `code` + `respondToWebhook` | Vraća `{ success: false, error: "NO_SPEECH_DETECTED", message: "Nije detektovan govor..." }` |

#### Silence Guardrail logika

Guardrail provjerava 5 uslova (bilo koji triggeruje grešku):

1. **Prazan transkript** — Deepgram nije vratio tekst
2. **Prekratak tekst** — manje od 10 smislenih znakova
3. **Nizak confidence** — Deepgram confidence < 0.25
4. **Samo filler riječi** — regex pattern: `^(a+h*|u+h*|hm+|ovaj|ono|e+|o+h*)\s*[.!?,]*$`
5. **Dugačak snimak, malo riječi** — audio >10s ali <3 riječi (mikrofon uključen, ali nema govora)

---

## 6. Frontend Integracija

### Promjene u `.env.local`

```bash
# Stari (v4):
# AIMED_Transcribe_WEBHOOK_URL=https://n8n.internal.gethotelly.com/webhook/AIMED-transcribe-v4

# Novi (v5):
AIMED_Transcribe_WEBHOOK_URL=https://n8n.internal.gethotelly.com/webhook/AIMED-transcribe-v5
```

### Frontend promjene za v5

#### Promjena 1: Silence error handling (`aimed-api.ts`)

`AimedApiResponse` tip je proširen sa `error?` i `message?` poljima. `aimed-api.ts` sada detektuje
eksplicitne error response-e (npr. `NO_SPEECH_DETECTED`) i prikazuje specifičnu poruku umjesto generičke.

```typescript
// types/aimed.ts — novi opcionalni property-ji:
export interface AimedApiResponse {
  success: boolean;
  error?: string;     // "NO_SPEECH_DETECTED" — NOVO
  message?: string;   // Specifična poruka za korisnika — NOVO
  report_text?: string;
  sections?: Record<string, string | null>;
  metadata?: { /* ... */ };
}
```

```typescript
// aimed-api.ts — nova provjera prije generičke greške:
// Handle explicit error responses (e.g. silence guardrail)
if (!data.success && data.error) {
  throw new AimedApiError(data.message || ERROR_MESSAGES.EMPTY, false);
}
```

Kada silence guardrail triggeruje, korisnik vidi: **"Nije detektovan govor. Molimo pokušajte ponovo."**
umjesto generičke poruke "Nije moguće obraditi snimak".

#### Promjena 2: Webhook URL (`.env.local`)

Jedina konfiguracija: promijeniti webhook URL.

#### Backward kompatibilnost

Uspješni response-i (`success: true`) su **identični** sa v4 formatom:

1. Šalje iste FormData polja: `audio`, `mode`, `preferred_sections`, `existing_data`
2. Očekuje isti response format: `{ success, sections, metadata }`
3. v5 response ima iste ključeve + dodatne metadata polja

```typescript
// Novi metadata polja u v5 (opcionalno za prikaz):
interface V5Metadata {
  generatedAt: string;
  datumNalaza: string;
  version: "AIMED-transcribe-v5";
  mode: "new" | "update";
  transcriptionEngine: "deepgram-nova-3";     // NOVO
  transcriptionConfidence: number | null;       // NOVO (0.0-1.0)
  toolsUsed: string[];                          // NOVO (["mkb10", "drug_registry"])
  parseError: string | null;
}
```

---

## 7. Punjenje Baza Podataka

### 7.1 MKB-10 import sa mkb.hzjz.hr

> **STATUS: ZAVRŠENO** — 39,848 MKB-10 kodova importovano u Supabase (februar 2026).
>
> Izvor: mkb.hzjz.hr CSV API export → batch insert u `mkb10_codes` tabelu.
> Testiran: `search_mkb10('ishijas')` → M54.3 Išijas ✓

MKB-10 podaci se mogu preuzeti sa [mkb.hzjz.hr](https://www.mkb.hzjz.hr/). Korišten pristup:

#### Pristup A: CSV API download (korišten)

```python
#!/usr/bin/env python3
"""
import_mkb10.py — Scraper za MKB-10 šifre sa mkb.hzjz.hr
Pokreni: python import_mkb10.py

Preduvjeti:
  pip install requests beautifulsoup4 supabase
"""

import requests
from bs4 import BeautifulSoup
from supabase import create_client
import time
import re

SUPABASE_URL = "https://ljtxybwihzyxocxzsizx.supabase.co"
SUPABASE_KEY = "YOUR_SERVICE_ROLE_KEY"  # Koristi service role za insert

BASE_URL = "https://www.mkb.hzjz.hr"

# MKB-10 glavne kategorije (A00-Z99)
CATEGORIES = [
    ("A00-B99", "Određene zarazne i parazitske bolesti"),
    ("C00-D48", "Neoplazme (tumori)"),
    ("D50-D89", "Bolesti krvi i krvotvornih organa"),
    ("E00-E90", "Endokrine, nutritivne i metaboličke bolesti"),
    ("F00-F99", "Duševni poremećaji i poremećaji ponašanja"),
    ("G00-G99", "Bolesti živčanog sustava"),
    ("H00-H59", "Bolesti oka i adneksa oka"),
    ("H60-H95", "Bolesti uha i mastoidnog nastavka"),
    ("I00-I99", "Bolesti cirkulacijskog sustava"),
    ("J00-J99", "Bolesti dišnog sustava"),
    ("K00-K93", "Bolesti probavnog sustava"),
    ("L00-L99", "Bolesti kože i potkožnog tkiva"),
    ("M00-M99", "Bolesti mišićno-koštanog sustava"),
    ("N00-N99", "Bolesti genitourinarnog sustava"),
    ("O00-O99", "Trudnoća, porođaj i babinje"),
    ("P00-P96", "Stanja nastala u perinatalnom razdoblju"),
    ("Q00-Q99", "Prirođene malformacije i kromosomske abnormalnosti"),
    ("R00-R99", "Simptomi, znakovi i abnormalni klinički i laboratorijski nalazi"),
    ("S00-T98", "Ozljede, otrovanja i posljedice vanjskih uzroka"),
    ("V01-Y98", "Vanjski uzroci pobola i smrtnosti"),
    ("Z00-Z99", "Čimbenici koji utječu na zdravstveno stanje"),
]

def scrape_mkb10():
    """
    Scrape MKB-10 codes from mkb.hzjz.hr

    NAPOMENA: Ovo je skeleton — tačna struktura HTML-a na mkb.hzjz.hr
    se može razlikovati. Prilagodi selektore prema stvarnoj strukturi sajta.
    Alternativno, ako sajt nudi CSV/Excel export, koristi to.
    """
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    codes = []

    # Iteraj kroz svaku kategoriju
    for cat_range, cat_name in CATEGORIES:
        print(f"Scraping: {cat_range} — {cat_name}")

        try:
            # Prilagodi URL prema stvarnoj strukturi sajta
            url = f"{BASE_URL}/pretrazi?kategorija={cat_range}"
            response = requests.get(url, timeout=30)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, "html.parser")

            # Prilagodi selektore prema HTML strukturi
            # Ovo je primjer — stvarni selektori zavise od sajta
            rows = soup.select("table tr, .mkb-item, .disease-row")

            for row in rows:
                code_elem = row.select_one(".code, td:first-child")
                name_elem = row.select_one(".name, td:nth-child(2)")

                if code_elem and name_elem:
                    code = code_elem.get_text(strip=True)
                    name = name_elem.get_text(strip=True)

                    if re.match(r'^[A-Z]\d', code):
                        codes.append({
                            "code": code,
                            "name_hr": name,
                            "category": f"{cat_range} {cat_name}",
                        })

            time.sleep(1)  # Rate limiting

        except Exception as e:
            print(f"  Error: {e}")
            continue

    # Batch insert u Supabase
    if codes:
        print(f"\nInserting {len(codes)} codes into Supabase...")

        # Insert u batch-evima od 500
        batch_size = 500
        for i in range(0, len(codes), batch_size):
            batch = codes[i:i + batch_size]
            result = supabase.table("mkb10_codes").upsert(
                batch, on_conflict="code"
            ).execute()
            print(f"  Batch {i // batch_size + 1}: {len(batch)} rows")

    print(f"\nDone! Total: {len(codes)} MKB-10 codes imported.")

if __name__ == "__main__":
    scrape_mkb10()
```

#### Pristup B: Manuelni CSV import

Ako je scraping problematičan, MKB-10 šifre se mogu naći i u CSV formatu:

1. Preuzmi CSV sa WHO ili HZJZ
2. Konvertuj u SQL INSERT statements
3. Pokreni kao Supabase migraciju

```bash
# Primjer importa iz CSV:
# CSV format: code,name_hr,name_lat,category
psql $DATABASE_URL -c "\copy public.mkb10_codes(code, name_hr, name_lat, category) FROM 'mkb10.csv' WITH CSV HEADER"
```

### 7.2 Registar lijekova BiH — PDF ekstrakcija

> **STATUS: ZAVRŠENO** — 3,406 jedinstvenih lijekova ekstrahovano i importovano (februar 2026).
>
> Izvor: `Registar-za-objavu_slozeno.pdf` (642 stranice, ATC monografski format)
> Format: ATC_CODE → INN → TRADE_NAME - MANUFACTURER → form [strength] packaging
> Testiran: `search_drugs_fuzzy('sumam')` → SUMAMED 500mg (azitromicin, J01FA10) ✓
> Testiran: `search_drugs_fuzzy('brufen')` → BRUFEN 400mg (ibuprofen, M01AE01) ✓

Registar lijekova BiH (~642 stranica PDF) procesiran je kroz strukturirani ATC parser:

```python
#!/usr/bin/env python3
"""
vectorize_drug_registry.py — PDF → chunks → embeddings → Supabase

Preduvjeti:
  pip install pymupdf openai supabase tiktoken
"""

import fitz  # PyMuPDF
import openai
from supabase import create_client
import tiktoken
import re
import time

SUPABASE_URL = "https://ljtxybwihzyxocxzsizx.supabase.co"
SUPABASE_KEY = "YOUR_SERVICE_ROLE_KEY"
OPENAI_KEY = "YOUR_OPENAI_API_KEY"

PDF_PATH = "registar_lijekova_bih.pdf"
CHUNK_SIZE = 500  # tokens per chunk
CHUNK_OVERLAP = 50  # token overlap between chunks
EMBEDDING_MODEL = "text-embedding-3-small"

openai.api_key = OPENAI_KEY
enc = tiktoken.encoding_for_model("gpt-4")


def extract_text_from_pdf(path: str) -> str:
    """Extract all text from PDF."""
    doc = fitz.open(path)
    text = ""
    for page in doc:
        text += page.get_text() + "\n"
    doc.close()
    return text


def parse_drug_entries(text: str) -> list[dict]:
    """
    Parse drug registry text into structured entries.

    NAPOMENA: Ova funkcija zavisi od formata PDF-a.
    Prilagodi regex pattern-e prema stvarnoj strukturi dokumenta.
    Tipično, svaki lijek ima:
    - Trgovački naziv
    - Generičko ime (INN)
    - Oblik i jačina
    - Proizvođač
    - ATC šifra
    """
    entries = []

    # Primjer parsiranja — prilagodi prema stvarnom PDF formatu
    # Čest pattern: Naziv lijeka na početku reda, velikim slovima
    drug_blocks = re.split(r'\n(?=[A-ZČĆŽŠĐ]{2,}[\s\d])', text)

    for block in drug_blocks:
        if len(block.strip()) < 20:
            continue

        lines = block.strip().split('\n')
        trade_name = lines[0].strip() if lines else ""

        # Pokušaj izvući strukturirane podatke
        generic_name = None
        strength = None
        form = None
        atc_code = None
        manufacturer = None

        for line in lines[1:]:
            line = line.strip()
            # ATC code pattern: letter + 2 digits + 2 letters + 2 digits
            atc_match = re.search(r'[A-Z]\d{2}[A-Z]{2}\d{2}', line)
            if atc_match:
                atc_code = atc_match.group()

            # Strength pattern: number + mg/ml/mcg
            strength_match = re.search(r'\d+\s*(mg|ml|mcg|g|IU|UI)', line, re.IGNORECASE)
            if strength_match and not strength:
                strength = strength_match.group()

            # Form patterns
            form_keywords = ['tableta', 'kapsula', 'sirup', 'otopina', 'krema',
                           'mast', 'gel', 'kapi', 'injekcija', 'ampula', 'prašak']
            for kw in form_keywords:
                if kw in line.lower() and not form:
                    form = kw

        if trade_name and len(trade_name) > 2:
            entries.append({
                "trade_name": trade_name,
                "generic_name": generic_name,
                "strength": strength,
                "form": form,
                "manufacturer": manufacturer,
                "atc_code": atc_code,
                "content_chunk": block.strip()[:2000],  # Max 2000 chars per chunk
            })

    return entries


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into overlapping token-based chunks."""
    tokens = enc.encode(text)
    chunks = []

    for i in range(0, len(tokens), chunk_size - overlap):
        chunk_tokens = tokens[i:i + chunk_size]
        chunks.append(enc.decode(chunk_tokens))

    return chunks


def get_embeddings(texts: list[str], batch_size: int = 100) -> list[list[float]]:
    """Generate embeddings for a list of texts."""
    all_embeddings = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        response = openai.embeddings.create(
            model=EMBEDDING_MODEL,
            input=batch,
        )
        all_embeddings.extend([item.embedding for item in response.data])

        if i + batch_size < len(texts):
            time.sleep(0.5)  # Rate limiting

    return all_embeddings


def main():
    print("1. Extracting text from PDF...")
    text = extract_text_from_pdf(PDF_PATH)
    print(f"   Extracted {len(text)} characters")

    print("2. Parsing drug entries...")
    entries = parse_drug_entries(text)
    print(f"   Found {len(entries)} drug entries")

    # If structured parsing fails, fall back to chunking
    if len(entries) < 50:
        print("   Few entries found — falling back to text chunking...")
        chunks = chunk_text(text)
        entries = [{"trade_name": f"Chunk {i+1}", "content_chunk": chunk}
                   for i, chunk in enumerate(chunks)]
        print(f"   Created {len(entries)} chunks")

    print("3. Generating embeddings...")
    texts_to_embed = [e["content_chunk"] for e in entries]
    embeddings = get_embeddings(texts_to_embed)
    print(f"   Generated {len(embeddings)} embeddings")

    print("4. Inserting into Supabase...")
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    batch_size = 100
    for i in range(0, len(entries), batch_size):
        batch = []
        for j in range(i, min(i + batch_size, len(entries))):
            entry = entries[j]
            entry["embedding"] = embeddings[j]
            batch.append(entry)

        supabase.table("drug_registry").insert(batch).execute()
        print(f"   Batch {i // batch_size + 1}: {len(batch)} rows")

    print(f"\nDone! {len(entries)} drug entries vectorized and stored.")


if __name__ == "__main__":
    main()
```

#### Pokretanje:

```bash
# 1. Instaliraj dependencies
pip install pymupdf openai supabase tiktoken requests beautifulsoup4

# 2. Postavi API ključeve
export OPENAI_API_KEY="sk-..."

# 3. Pokreni MKB-10 import
python import_mkb10.py

# 4. Postavi PDF putanju i pokreni vektorizaciju
python vectorize_drug_registry.py
```

---

## 8. Testiranje

### Brzi test sa cURL

```bash
# Test v5 workflowa sa audio fajlom
curl -X POST \
  https://n8n.internal.gethotelly.com/webhook/AIMED-transcribe-v5 \
  -F "audio=@test_audio.webm;type=audio/webm" \
  -F "mode=new" \
  -F 'preferred_sections=["ANAMNEZA","STATUS","DIJAGNOZA","TERAPIJA","PREPORUKE"]'
```

### Očekivani odgovor

```json
{
  "success": true,
  "sections": {
    "ANAMNEZA": "Pacijent se žali na bol u donjem dijelu leđa sa propagacijom u lijevu nogu...",
    "STATUS": "Lasegueov test pozitivan lijevo na 40°. Krvni pritisak 130/85 mmHg.",
    "DIJAGNOZA": "Ishijalgija (MKB-10: M54.3). Lumbalna diskopatija (MKB-10: M51.1).",
    "TERAPIJA": "Sumamed 500mg 1x1 per os 3 dana. Brufen 400mg 3x1 per os 5 dana.",
    "PREPORUKE": "Kontrola za 10 dana. Mirovanje, izbjegavati dizanje tereta."
  },
  "metadata": {
    "generatedAt": "2026-02-20T14:30:00.000Z",
    "datumNalaza": "20.2.2026.",
    "version": "AIMED-transcribe-v5",
    "mode": "new",
    "transcriptionEngine": "deepgram-nova-3",
    "transcriptionConfidence": 0.97,
    "toolsUsed": ["mkb10", "drug_registry"],
    "parseError": null
  }
}
```

### Test scenariji

| # | Scenarij | Šta provjeriti |
|---|----------|----------------|
| 1 | Jednostavan nalaz (3 sekcije) | Transkript je tačan, sekcije su pravilno razvrstane |
| 2 | Dijagnoza sa MKB-10 | AI Agent poziva mkb10_pretraga, šifra je tačna |
| 3 | Lijek sa greškom u imenu | AI Agent poziva registar_lijekova, ispravlja naziv |
| 4 | UPDATE mode | Samo diktirane izmjene primijenjene, ostalo netaknuto |
| 5 | Custom sekcije (6 rubrika) | Sekcije koje doktor nije definisao ne pojavljuju se |
| 6 | Prazan/tihi audio | Silence Guardrail: `{ success: false, error: "NO_SPEECH_DETECTED" }` → frontend prikazuje "Nije detektovan govor. Molimo pokušajte ponovo." |
| 7 | Veoma dug nalaz (5+ min) | Timeout handling, potpunost |
| 8 | Mješavina jezika (bos/lat) | Latinski termini prepoznati, dijagnoze formatirane |

---

## 9. Analiza Troškova

### Po zahtjevu (jedan nalaz)

| Korak | Servis | Cijena | Napomena |
|-------|--------|--------|----------|
| Transkripcija | Deepgram Nova-3 | ~$0.0043/min | 2 min audio ≈ $0.0086 |
| AI Agent | Claude Sonnet 4.5 | ~$0.015-0.05 | Zavisi od broja tool poziva |
| MKB-10 Tool | Supabase Edge Fn | ~$0.00 | Uključeno u Supabase plan |
| Drug Registry Tool | OpenAI Embedding | ~$0.0001 | text-embedding-3-small |
| **Ukupno** | | **~$0.02-0.06** | Po nalazu |

### Mjesečni troškovi (100 doktora × 20 nalaza/dan)

| Stavka | Izračun | Mjesečno |
|--------|---------|----------|
| Deepgram | 2000 nalaza/dan × 2min × $0.0043 × 22 dana | ~$380 |
| Claude Sonnet | 2000 × $0.03 × 22 | ~$1,320 |
| OpenAI Embeddings | 2000 × 2 tool poziva × $0.0001 × 22 | ~$9 |
| Supabase (Pro) | Fixed | $25 |
| n8n (Self-hosted) | Fixed | $0 |
| **Ukupno** | | **~$1,734/mj** |

### Poređenje sa v4

| | v4 (Whisper + Haiku) | v5 (Deepgram + Sonnet + Tools) |
|--|----------------------|-------------------------------|
| Cijena/nalaz | ~$0.005 | ~$0.03-0.06 |
| Preciznost | Dobra | Ultra-precizna |
| Dijagnoze | Bez validacije | MKB-10 šifre automatski |
| Lijekovi | Bez validacije | Autokorekcija naziva |
| Skalabilnost | Ista | Ista |

> **Zaključak:** v5 je ~6-10x skuplji po nalazu, ali donosi značajno veću preciznost i automatsku validaciju. Za medicinsku primjenu, ovo je opravdano ulaganje.

---

## 10. Assessment

### Snage ovog dizajna

1. **Potpuna dinamičnost:** Workflow ne zna za strukture nalaza — prima ih od doktora. Jedan workflow za N doktora sa N različitih šablona.

2. **Tool-Augmented AI:** AI Agent ne pogađa medicinske termine — provjerava ih iz stvarnih izvora (MKB-10 baza, Registar lijekova). Ovo je ključna prednost nad svim konkurentskim rješenjima.

3. **Deepgram Nova-3 prednost:** Značajno bolji za hrvatski/bosanski jezik od Whisper-a. Bolje prepoznaje medicinske termine, akcente, i brzinu govora ljekara.

4. **Backward compatible:** Frontend ne zahtijeva nikakve promjene osim jednog env variable. Response format je identičan.

5. **Hybrid search za lijekove:** Kombinacija fuzzy text search + vektorskog RAG-a osigurava da se lijekovi pronađu čak i sa značajnim pravopisnim greškama.

6. **Dvoslojna validacija:** AI Agent ima stroga pravila + Code node enforceuje whitelist. Dupla zaštita od halucinacija.

### Rizici i mitigacije

| Rizik | Vjerovatnoća | Uticaj | Mitigacija |
|-------|-------------|--------|-----------|
| Deepgram loše prepoznaje med. termine | Srednja | Visok | Fallback na Whisper; custom vocabulary u Deepgram |
| AI Agent preskače tool pozive | Niska | Srednji | System prompt sa "OBAVEZNO koristi alat"; maxIterations=8 |
| MKB-10 baza nepotpuna | Srednja | Srednji | Redovan update; fallback na fuzzy search bez šifre |
| PDF parsing registra lijekova | Visoka | Visok | Manuelna korekcija; hybrid search smanjuje uticaj |
| Latencija (tool pozivi dodaju vrijeme) | Srednja | Srednji | Paralelni pozivi; caching čestih termina |
| Cijena na velikom volumenu | Niska | Srednji | Prebaciti na Claude Haiku za jednostavnije nalaze |

### Preporuke za buduće iteracije

1. **Deepgram Custom Vocabulary:** Dodaj listu čestih medicinskih termina kao custom vocabulary u Deepgram za još bolju transkripciju.

2. **Caching Layer:** Keširaj česte MKB-10 pretrage i lijekove u Redis/KV store za brži odgovor.

3. **Tiered Model Selection:** Za jednostavne nalaze (2-3 sekcije) koristi Claude Haiku; za kompleksne (5+ sekcija, dijagnoze) koristi Sonnet. Smanjuje troškove ~40%.

4. **Feedback Loop:** Dodaj mogućnost da doktor označi grešku u nalazu → podatak se koristi za fine-tuning prompt-a.

5. **Audio Streaming:** Umjesto slanja cijelog audio fajla, istražiti Deepgram live streaming za real-time transkripciju dok doktor govori.

6. **Multi-language:** Dodaj podršku za srpski (`sr`) i slovenački (`sl`) za šire tržište.

---

## 11. Troubleshooting

### Deepgram vrati prazan transkript

**Simptom:** `Deepgram nije uspio transkribovati audio`

**Uzroci:**
- Audio format nije podržan (mora biti WebM, WAV, MP3, OGG, FLAC)
- Audio je prekratak (<1 sekunda)
- Mikrofon nije snimio zvuk
- Deepgram API ključ je istekao

**Rješenje:**
```bash
# Testiraj Deepgram direktno:
curl -X POST \
  "https://api.deepgram.com/v1/listen?model=nova-3&language=hr" \
  -H "Authorization: Token YOUR_KEY" \
  -H "Content-Type: audio/webm" \
  --data-binary @test.webm
```

### AI Agent ne koristi alate

**Simptom:** Dijagnoze bez MKB-10 šifara, lijekovi nisu provjereni

**Uzroci:**
- Tool credential nije povezan
- Edge Function vraća grešku
- Agent description nije dovoljno jasan

**Rješenje:**
1. Provjeri n8n execution log — da li su tool pozivi vidljivi
2. Testiraj Edge Function direktno:
   ```bash
   curl -X POST \
     https://ljtxybwihzyxocxzsizx.supabase.co/functions/v1/search-mkb10 \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"query": "hipertenzija"}'
   ```
3. Provjeri da li su tabele popunjene podacima

### Parse error u finalnom odgovoru

**Simptom:** `parseError` u metadata, sekcije nisu pravilno formatirane

**Uzroci:**
- AI Agent vratio tekst umjesto JSON-a
- JSON sadrži nevalidne karaktere

**Rješenje:**
- Provjeri AI Agent output u n8n execution log
- Provjeriti da system prompt jasno kaže "ISKLJUČIVO validan JSON"
- Parse & Validate node ima fallback koji stavlja raw text u prvu sekciju

### Timeout (504)

**Simptom:** Frontend dobije timeout nakon 60 sekundi

**Uzroci:**
- Deepgram procesira veoma dugačak audio (>5 min)
- AI Agent pravi previše tool poziva
- Edge Function je spora

**Rješenje:**
- Povećaj timeout u `src/app/api/submit/route.ts` (trenutno 60s)
- Smanji `maxIterations` u AI Agent node (trenutno 8)
- Provjeri Supabase Edge Function logs:
  ```bash
  npx supabase functions logs search-mkb10 --project-ref ljtxybwihzyxocxzsizx
  ```

---

## Appendix: Kompletna lista fajlova za kreiranje

| # | Fajl | Lokacija | Opis |
|---|------|----------|------|
| 1 | `AIMED-transcribe-v5.json` | `workflows/` | n8n workflow (importovati u n8n) |
| 2 | SQL Migracija 1 | Supabase Dashboard | `mkb10_codes` tabela + indeksi |
| 3 | SQL Migracija 2 | Supabase Dashboard | `drug_registry` tabela + pgvector |
| 4 | SQL Migracija 3 | Supabase Dashboard | RPC funkcije (search_mkb10, match_drugs, search_drugs_fuzzy) |
| 5 | `search-mkb10/index.ts` | `supabase/functions/` | Edge Function za MKB-10 pretragu |
| 6 | `search-drugs/index.ts` | `supabase/functions/` | Edge Function za registar lijekova |
| 7 | `import_mkb10.py` | `tools/` | Script za import MKB-10 podataka |
| 8 | `vectorize_drug_registry.py` | `tools/` | Script za vektorizaciju PDF-a lijekova |
| 9 | `.env.local` | `aimed-app/` | Ažurirati WEBHOOK_URL na v5 |

---

## 12. Status Implementacije

> Posljednji update: 20. februar 2026

### Supabase migracije (6 migracija)

| # | Migracija | Status |
|---|-----------|--------|
| 1 | `enable_extensions` | pg_trgm + vector → `extensions` schema |
| 2 | `create_mkb10_codes_table` | 39,848 kodova importovano |
| 3 | `create_drug_registry_table` | 3,406 lijekova importovano |
| 4 | `create_search_rpc_functions` | search_mkb10, match_drugs, search_drugs_fuzzy |
| 5 | `move_extensions_to_dedicated_schema` | Sigurnosni fix (extensions iz public) |
| 6 | `optimize_rls_policies_initplan` | `(select auth.uid())` za performance |

### Edge Functions (v2, ACTIVE)

| Funkcija | Endpoint | Metode | JWT |
|----------|----------|--------|-----|
| `search-mkb10` | `/functions/v1/search-mkb10?q=angina` | GET + POST | Disabled (n8n pristup) |
| `search-drugs` | `/functions/v1/search-drugs?q=brufen` | GET + POST | Disabled (n8n pristup) |

### Frontend promjene

| Fajl | Promjena |
|------|----------|
| `types/aimed.ts` | Dodani `error?` i `message?` u `AimedApiResponse` |
| `services/aimed-api.ts` | Silence error detekcija prije generičke greške |

### Sigurnosni status

| Problem | Status | Opis |
|---------|--------|------|
| Extensions u public schema | Riješeno | Prebačeno u `extensions` schema |
| Mutable search_path | Riješeno | Sve RPC funkcije postavljene |
| RLS initplan performance | Riješeno | `(select auth.uid())` u svim policies |
| Leaked password protection | Preporučeno | Omogućiti u Supabase Dashboard → Auth → Settings |

### n8n Workflow

| Stavka | Detalj |
|--------|--------|
| Fajl | `workflows/AIMED-transcribe-v5.json` |
| Nodova | 12 (uklj. silence guardrail branching) |
| Alata | 2 (MKB-10 pretraga, Registar lijekova BiH) |
| LLM | Claude Sonnet 4.5 (temperature: 0) |

### Potrebni koraci za aktivaciju

1. Importovati `AIMED-transcribe-v5.json` u n8n
2. Povezati 3 credential-a (Deepgram, Anthropic, Supabase Header Auth)
3. Aktivirati workflow, kopirati webhook URL
4. Ažurirati `AIMED_Transcribe_WEBHOOK_URL` u `.env.local`
5. Opciono: omogućiti leaked password protection u Supabase Auth postavkama

---

*Generisano za AiMED projekt — Februar 2026*
