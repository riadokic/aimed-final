import type { ReportSection } from "@/types/aimed";
import type { PatientInfo } from "@/lib/pdf-generator";

// ── Draft Storage ──

const STORAGE_KEY = "aimed_draft_report";

interface StoredReport {
  sections: ReportSection[];
  patient: PatientInfo;
  mode: "new" | "update";
  savedAt: string;
}

/** Save the current report draft to localStorage */
export function saveDraft(data: Omit<StoredReport, "savedAt">): void {
  try {
    const stored: StoredReport = { ...data, savedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

/** Load a saved draft from localStorage, if any */
export function loadDraft(): StoredReport | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredReport;
  } catch {
    return null;
  }
}

/** Clear the draft (on "Novi nalaz" or explicit "Obriši") */
export function clearDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

/** Check if a draft exists */
export function hasDraft(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

// ── Report History ──

const HISTORY_KEY = "aimed_reports_history";

export interface HistoryEntry {
  id: string;
  sections: ReportSection[];
  patient: PatientInfo;
  mode: "new" | "update";
  createdAt: string;
}

/** Load all history entries */
export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

/** Save a report to history (deduplicates: same patient name + sections + same date = skip) */
export function saveToHistory(data: Omit<HistoryEntry, "id" | "createdAt">): void {
  try {
    const history = loadHistory();
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Build a fingerprint from patient name + section contents
    const contentKey = data.sections
      .map((s) => `${s.title}:${s.content}`)
      .join("|");
    const patientKey = data.patient.name || "";

    // Check if an entry with the same fingerprint exists from today
    const isDuplicate = history.some((existing) => {
      if (existing.createdAt.slice(0, 10) !== today) return false;
      if ((existing.patient.name || "") !== patientKey) return false;
      const existingContent = existing.sections
        .map((s) => `${s.title}:${s.content}`)
        .join("|");
      return existingContent === contentKey;
    });

    if (isDuplicate) return;

    const entry: HistoryEntry = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    history.unshift(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Storage full or unavailable
  }
}

/** Delete a single report from history */
export function deleteFromHistory(id: string): void {
  try {
    const history = loadHistory().filter((e) => e.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Ignore
  }
}

/** Clear all history */
export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // Ignore
  }
}

/** Export all history as JSON string */
export function exportHistory(): string {
  return JSON.stringify(loadHistory(), null, 2);
}

// ── Settings ──

const SETTINGS_KEY = "aimed_settings";

export interface AppSettings {
  doctorName: string;
  specialty: string;
  clinicName: string;
  autoCopyHIS: boolean;
  preferredExport: "pdf" | "word";
  /** Base64-encoded .docx template file */
  templateDocxBase64: string;
  /** Original filename of uploaded template */
  templateDocxName: string;
}

const defaultSettings: AppSettings = {
  doctorName: "",
  specialty: "",
  clinicName: "",
  autoCopyHIS: false,
  preferredExport: "pdf",
  templateDocxBase64: "",
  templateDocxName: "",
};

/** Load settings */
export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

/** Save settings */
export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore
  }
}
