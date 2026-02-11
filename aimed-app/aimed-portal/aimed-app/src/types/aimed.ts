export interface ReportSection {
  title: string;
  content: string;
}

export interface ParsedReport {
  sections: ReportSection[];
  warnings: string[];
  rawText: string;
}

export interface AimedApiResponse {
  success: boolean;
  report_text: string;
}

export type RecordingState = "idle" | "recording" | "paused";

export type AppState = "idle" | "recording" | "uploading" | "processing" | "done" | "error";

// ── Report Modes ──

/** The three ways a doctor can create/update a report */
export type ReportMode = "new" | "update" | "template";

/** An uploaded file (PDF or Word) for update mode */
export interface UploadedReport {
  file: File;
  name: string;
  type: "pdf" | "docx";
  /** Size in bytes */
  size: number;
}

/** A report template with placeholder sections */
export interface ReportTemplate {
  id: string;
  name: string;
  /** Original file reference */
  fileName: string;
  /** Detected placeholder keys, e.g. ["ANAMNEZA", "DIJAGNOZA"] */
  placeholders: string[];
  /** Raw template content (HTML or text with {{PLACEHOLDER}} markers) */
  content: string;
  createdAt: string;
}
