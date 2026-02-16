import type { ReportSection, ParsedReport } from "@/types/aimed";

/** Standard medical report sections */
const STANDARD_SECTIONS = ["ANAMNEZA", "STATUS", "DIJAGNOZA", "TERAPIJA", "PREPORUKE"];

/** Sections the AI sometimes hallucinates — these are filtered out */
const FILTERED_SECTIONS = ["PODACI O PACIJENTU", "DATUM PREGLEDA", "ZAKLJUČAK"];

/**
 * Maps composite/variant headers to their standard base section.
 * E.g. "PREPORUKE/KONTROLE" → "PREPORUKE", "TERAPIJA:" → "TERAPIJA"
 */
function normalizeHeader(header: string): string {
  // Strip trailing punctuation (:, ., /)
  let cleaned = header.replace(/[\s:./\-]+$/g, "").trim();
  // For composite headers like "PREPORUKE/KONTROLE", take the first part
  if (cleaned.includes("/")) {
    const first = cleaned.split("/")[0].trim();
    if (STANDARD_SECTIONS.includes(first)) return first;
  }
  return cleaned;
}

/**
 * Parses the plain-text `report_text` from n8n into structured sections.
 *
 * Expected format:
 *   SECTION HEADER (ALL CAPS)
 *   Content below the header...
 *
 *   NEXT SECTION
 *   More content...
 *
 * Warnings are lines matching [NAPOMENA: ...].
 */
export function parseReport(text: string): ParsedReport {
  const lines = text.split("\n");
  const sections: ReportSection[] = [];
  const warnings: string[] = [];
  let currentSection: ReportSection | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      // Preserve blank lines within section content
      if (currentSection && currentSection.content) {
        currentSection.content += "\n";
      }
      continue;
    }

    // Check for warnings
    if (trimmed.startsWith("[NAPOMENA")) {
      warnings.push(trimmed);
      continue;
    }

    // Check for section header: ALL CAPS, at least 3 characters, no lowercase
    if (isSectionHeader(trimmed)) {
      if (currentSection) {
        currentSection.content = currentSection.content.trim();
        sections.push(currentSection);
      }
      const normalized = normalizeHeader(trimmed);
      // Skip hallucinated sections
      if (FILTERED_SECTIONS.includes(normalized)) {
        currentSection = null;
        continue;
      }
      currentSection = { title: normalized, content: "" };
    } else if (currentSection) {
      currentSection.content +=
        (currentSection.content ? "\n" : "") + trimmed;
    }
  }

  if (currentSection) {
    currentSection.content = currentSection.content.trim();
    sections.push(currentSection);
  }

  return { sections, warnings, rawText: text };
}

/** Heuristic: a line is a section header if it's ALL CAPS, 3+ chars, and contains at least one letter */
function isSectionHeader(line: string): boolean {
  if (line.length < 3) return false;
  // Must have at least one letter
  if (!/[A-ZČĆŠĐŽ]/.test(line)) return false;
  // Must be uppercase (allow spaces, digits, slashes, dashes, dots)
  return line === line.toUpperCase() && /^[A-ZČĆŠĐŽ0-9\s/\-.:]+$/.test(line);
}

/** Converts parsed sections back to plain text (for clipboard copy), filtering out empty ones */
export function sectionsToPlainText(sections: ReportSection[]): string {
  return sections
    .filter((s) => s.content.trim().length > 0)
    .map((s) => `${s.title}\n${s.content}`)
    .join("\n\n");
}
