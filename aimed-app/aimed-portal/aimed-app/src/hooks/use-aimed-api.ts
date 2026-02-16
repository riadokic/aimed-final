"use client";

import { useState, useCallback } from "react";
import { submitRecording, AimedApiError } from "@/services/aimed-api";
import { parseReport } from "@/lib/report-parser";
import type { ParsedReport, ReportMode, ReportSection } from "@/types/aimed";

export type ApiState = "idle" | "uploading" | "processing" | "done" | "error";

interface SubmitOptions {
  mode?: ReportMode;
  existingReport?: string;
  doctorId?: string;
  existingData?: Record<string, string>;
  preferredSections?: string[];
}

interface UseAimedApiReturn {
  state: ApiState;
  report: ParsedReport | null;
  error: string | null;
  submit: (audioBlob: Blob, options?: SubmitOptions) => Promise<void>;
  reset: () => void;
}

/** Convert structured JSON sections to ReportSection array */
function parseStructuredSections(sections: Record<string, string | null>): ReportSection[] {
  return Object.entries(sections)
    .filter(([key]) => !key.startsWith("_"))
    .map(([key, value]) => ({
      title: key,
      content: value ?? "",
    }));
}

export function useAimedApi(): UseAimedApiReturn {
  const [state, setState] = useState<ApiState>("idle");
  const [report, setReport] = useState<ParsedReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (audioBlob: Blob, options?: SubmitOptions) => {
    setState("uploading");
    setError(null);
    setReport(null);

    try {
      setState("processing");
      const data = await submitRecording({
        audioBlob,
        mode: options?.mode,
        existingReport: options?.existingReport,
        doctorId: options?.doctorId,
        existingData: options?.existingData,
        preferredSections: options?.preferredSections,
      });

      let parsed: ParsedReport;

      if (data.sections) {
        // Structured sections from n8n (key-value)
        const sections = parseStructuredSections(data.sections);
        const warnings: string[] = [];
        if (data.sections._napomene) {
          warnings.push(String(data.sections._napomene));
        }
        if (data.metadata?.parseError) {
          warnings.push("Greška pri parsiranju AI odgovora — provjerite rezultate.");
        }
        parsed = {
          sections,
          warnings,
          rawText: JSON.stringify(data.sections, null, 2),
        };
      } else {
        // Plain text fallback: parse into sections
        parsed = parseReport(data.report_text ?? "");
      }

      setReport(parsed);
      setState("done");
    } catch (err) {
      const message =
        err instanceof AimedApiError
          ? err.message
          : "Došlo je do greške. Pokušajte ponovo.";
      setError(message);
      setState("error");
    }
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setReport(null);
    setError(null);
  }, []);

  return { state, report, error, submit, reset };
}
