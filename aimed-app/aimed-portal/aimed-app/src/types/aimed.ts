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
  /** Error code from n8n (e.g. NO_SPEECH_DETECTED) */
  error?: string;
  /** Human-readable error message from n8n */
  message?: string;
  /** Plain text report from n8n */
  report_text?: string;
  /** Structured sections from n8n (key-value) */
  sections?: Record<string, string | null>;
  metadata?: {
    generatedAt: string;
    datumNalaza: string;
    version: string;
    parseError?: string | null;
  };
}

export type RecordingState = "idle" | "recording" | "paused";

export type AppState = "idle" | "recording" | "uploading" | "processing" | "done" | "error";

// ── Report Modes ──

/** The two ways a doctor can create/update a report */
export type ReportMode = "new" | "update";

/** An uploaded file (PDF or Word) for update mode */
export interface UploadedReport {
  file: File;
  name: string;
  type: "pdf" | "docx";
  /** Size in bytes */
  size: number;
}

// ── Patient & Report (Supabase) ──

export interface Patient {
  id: string;
  doctor_id: string;
  first_name: string;
  last_name: string;
  jmbg?: string;
  date_of_birth?: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  patient_id: string;
  doctor_id: string;
  content: { sections: ReportSection[] };
  report_date: string;
  type: string;
  recording_url?: string;
  created_at: string;
  updated_at: string;
}

// ── Doctor Profile (extended) ──

export interface ClinicInfo {
  name?: string;
  address?: string;
  phone?: string;
  website?: string;
}

export interface DoctorProfile {
  id: string;
  full_name?: string;
  specialization?: string;
  clinic_name?: string;
  branding_logo_url?: string;
  branding_stamp_url?: string;
  branding_signature_url?: string;
  report_categories: string[];
  clinic_info: ClinicInfo;
  gdpr_accepted_at?: string;
  updated_at: string;
}
