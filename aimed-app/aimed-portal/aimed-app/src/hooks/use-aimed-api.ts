"use client";

import { useState, useCallback } from "react";
import { submitRecording, AimedApiError } from "@/services/aimed-api";
import { parseReport } from "@/lib/report-parser";
import type { ParsedReport, ReportMode } from "@/types/aimed";

export type ApiState = "idle" | "uploading" | "processing" | "done" | "error";

interface UseAimedApiReturn {
  state: ApiState;
  report: ParsedReport | null;
  error: string | null;
  submit: (audioBlob: Blob, options?: {
    mode?: ReportMode;
    existingReport?: string;
    template?: string;
  }) => Promise<void>;
  reset: () => void;
}

export function useAimedApi(): UseAimedApiReturn {
  const [state, setState] = useState<ApiState>("idle");
  const [report, setReport] = useState<ParsedReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (audioBlob: Blob, options?: {
    mode?: ReportMode;
    existingReport?: string;
    template?: string;
  }) => {
    setState("uploading");
    setError(null);
    setReport(null);

    try {
      setState("processing");
      const reportText = await submitRecording({
        audioBlob,
        mode: options?.mode,
        existingReport: options?.existingReport,
        template: options?.template,
      });

      const parsed = parseReport(reportText);
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
