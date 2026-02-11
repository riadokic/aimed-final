import type { ReportSection } from "@/types/aimed";

/**
 * Estimate minutes saved by using AI dictation vs manual typing.
 *
 * Assumptions:
 * - Average manual typing speed for medical text: ~120 words/min
 * - Manual overhead factor: 1.3× (formatting, corrections, lookups)
 * - AI processing + doctor review: ~1 minute flat per report
 */
export function calculateTimeSaved(sections: ReportSection[]): number {
  const text = sections.map((s) => s.content).join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words === 0) return 0;

  const manualMin = (words / 120) * 1.3;
  const aiMin = 1.0;
  return Math.max(0, manualMin - aiMin);
}
