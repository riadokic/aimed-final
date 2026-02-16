import type { ReportSection } from "@/types/aimed";

/**
 * Estimate minutes saved by using AI dictation vs manual typing.
 *
 * Rule: every 10 words of dictated text saves 7 seconds.
 * We use the report section content as a proxy for transcript length.
 */
export function calculateTimeSaved(sections: ReportSection[]): number {
  const text = sections.map((s) => s.content).join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words === 0) return 0;

  // 10 words → 7 seconds saved → convert to minutes
  return (words / 10) * 7 / 60;
}
