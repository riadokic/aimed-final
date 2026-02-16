const CONSENT_KEY = "aimed_gdpr_consent";
const CURRENT_VERSION = "1.0";

export interface ConsentRecord {
  accepted: boolean;
  acceptedAt: string;
  version: string;
  userId?: string;
}

/** Check if user has valid GDPR consent for the current version and specific user */
export function hasValidConsent(userId?: string): boolean {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const consent = JSON.parse(raw) as ConsentRecord;
    if (!consent.accepted || consent.version !== CURRENT_VERSION) return false;
    // If userId provided, consent must match that user
    if (userId && consent.userId && consent.userId !== userId) return false;
    return true;
  } catch {
    return false;
  }
}

/** Save GDPR consent acceptance for a specific user */
export function acceptConsent(userId?: string): void {
  const record: ConsentRecord = {
    accepted: true,
    acceptedAt: new Date().toISOString(),
    version: CURRENT_VERSION,
    userId,
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
}

/** Revoke consent — also clears all app data */
export function revokeConsent(): void {
  localStorage.removeItem(CONSENT_KEY);
}

/** Load current consent record (if any) */
export function loadConsent(): ConsentRecord | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentRecord;
  } catch {
    return null;
  }
}

/** Get the current consent version */
export function getConsentVersion(): string {
  return CURRENT_VERSION;
}

/** Clear ALL application data — GDPR Right to Delete */
export function clearAllData(): void {
  localStorage.removeItem("aimed_draft_report");
  localStorage.removeItem("aimed_reports_history");
  localStorage.removeItem("aimed_settings");
  localStorage.removeItem(CONSENT_KEY);
  sessionStorage.clear();
}
