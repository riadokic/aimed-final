/**
 * Standalone test for the Template Intelligence Engine.
 * Run: node src/templates/test-discovery.mjs
 */
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Extraction Layer (same as route.ts) ──

function extractPlaceholders(html) {
  const regex = /\{\{(\w+)\}\}/g;
  const results = [];
  const seen = new Set();
  let match;

  while ((match = regex.exec(html)) !== null) {
    const key = match[1];
    if (seen.has(key)) continue;
    seen.add(key);

    const start = Math.max(0, match.index - 120);
    const end = Math.min(html.length, match.index + match[0].length + 120);

    const rawBefore = html.slice(start, match.index);
    const rawAfter = html.slice(match.index + match[0].length, end);
    const before = rawBefore.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const after = rawAfter.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

    results.push({ key, before, after });
  }

  return results;
}

// ── AI Layer ──

async function analyzeWithAI(placeholders) {
  const anthropic = new Anthropic();

  const contextBlock = placeholders
    .map(
      (p, i) =>
        `${i + 1}. Ključ: "{{${p.key}}}"\n   Tekst prije: "${p.before}"\n   Tekst poslije: "${p.after}"`
    )
    .join("\n\n");

  console.log(`\n🔍 Sending ${placeholders.length} placeholders to Claude for analysis...\n`);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Ti si medicinski AI asistent specijaliziran za bosanskohercegovačku medicinsku dokumentaciju.

Analiziraj sljedeće placeholder ključeve pronađene u HTML šablonu medicinskog nalaza. Za svaki ključ, na osnovu okolnog teksta, odredi:
1. "meaning": Kratko objašnjenje na bosanskom šta taj placeholder predstavlja (npr. "Istisna frakcija lijeve komore")
2. "type": Jedan od: "text" (slobodan tekst), "measurement" (mjerenje sa jedinicom), "date" (datum), "identifier" (ime, protokol, ID), "numeric" (broj bez jedinice), "list" (nabrajanje)

Placeholder-i i njihov kontekst:

${contextBlock}

Odgovori ISKLJUČIVO validnim JSON nizom u formatu:
[
  { "key": "placeholder_key", "meaning": "objašnjenje", "type": "tip" }
]

Bez dodatnog teksta, samo JSON.`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("AI did not return valid JSON array");
  return JSON.parse(jsonMatch[0]);
}

// ── Main ──

async function main() {
  const htmlPath = join(__dirname, "cardiology-echo-template.html");
  const html = readFileSync(htmlPath, "utf-8");

  console.log("📄 Loaded template:", htmlPath);

  // Step 1: Extract
  const contexts = extractPlaceholders(html);
  console.log(`\n✅ Extracted ${contexts.length} unique placeholders:`);
  contexts.forEach((c) => console.log(`   {{${c.key}}}`));

  // Step 2: AI Analysis
  const metadata = await analyzeWithAI(contexts);

  console.log(`\n🧠 AI Semantic Analysis Results:\n`);
  console.log(JSON.stringify(metadata, null, 2));

  console.log(`\n✅ Discovery complete: ${metadata.length} fields analyzed.`);
}

main().catch(console.error);
