import type { AimedApiResponse, ReportMode } from "@/types/aimed";

const TIMEOUT_MS = 60_000; // 60 seconds
const MAX_RETRIES = 2;
const RETRY_DELAYS = [1000, 3000]; // exponential backoff

// ── Error messages (Bosnian) ──

const ERROR_MESSAGES = {
  NETWORK: "Nema internet konekcije. Provjerite vezu i pokušajte ponovo.",
  SERVER: "Server trenutno nije dostupan. Pokušajte ponovo za nekoliko minuta.",
  TIMEOUT: "Obrada traje predugo. Pokušajte sa kraćim snimkom.",
  EMPTY: "Nije moguće obraditi snimak. Provjerite kvalitet audio zapisa.",
  NO_URL: "Webhook URL nije konfigurisan. Provjerite .env.local postavke.",
  UNKNOWN: "Došlo je do greške. Pokušajte ponovo.",
} as const;

export class AimedApiError extends Error {
  constructor(
    message: string,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = "AimedApiError";
  }
}

// ── File extension helper ──

function getFileExtension(blob: Blob): string {
  if (blob.type.includes("webm")) return "webm";
  if (blob.type.includes("mp4")) return "mp4";
  if (blob.type.includes("wav")) return "wav";
  return "webm";
}

// ── Core API call ──

interface SubmitOptions {
  audioBlob: Blob;
  mode?: ReportMode;
  existingReport?: string;
  doctorId?: string;
  existingData?: Record<string, string>;
  preferredSections?: string[];
}

async function submitOnce(options: SubmitOptions): Promise<AimedApiResponse> {
  const ext = getFileExtension(options.audioBlob);
  const formData = new FormData();
  formData.append("audio", options.audioBlob, `recording.${ext}`);

  // Mode-specific fields
  if (options.mode && options.mode !== "new") {
    formData.append("mode", options.mode);
  }
  if (options.mode === "update" && options.existingReport) {
    formData.append("existing_report", options.existingReport);
  }
  if (options.doctorId) {
    formData.append("doctor_id", options.doctorId);
  }
  if (options.existingData) {
    formData.append("existing_data", JSON.stringify(options.existingData));
  }
  if (options.preferredSections && options.preferredSections.length > 0) {
    formData.append("preferred_sections", JSON.stringify(options.preferredSections));
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // Route through Next.js API proxy to avoid CORS issues
    const response = await fetch("/api/submit", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const isServer = response.status >= 500;
      throw new AimedApiError(
        isServer ? ERROR_MESSAGES.SERVER : ERROR_MESSAGES.UNKNOWN,
        false
      );
    }

    const data: AimedApiResponse = await response.json();

    // Validate: need either sections or report_text
    if (data.success && data.sections) {
      return data;
    }

    if (!data.success || !data.report_text) {
      throw new AimedApiError(ERROR_MESSAGES.EMPTY, false);
    }

    return data;
  } catch (err) {
    clearTimeout(timeout);

    if (err instanceof AimedApiError) throw err;

    if (err instanceof DOMException && err.name === "AbortError") {
      throw new AimedApiError(ERROR_MESSAGES.TIMEOUT, false);
    }

    if (err instanceof TypeError) {
      throw new AimedApiError(ERROR_MESSAGES.NETWORK, true);
    }

    throw new AimedApiError(ERROR_MESSAGES.UNKNOWN, false);
  }
}

// ── Public API with retry ──

export async function submitRecording(options: SubmitOptions): Promise<AimedApiResponse> {
  let lastError: AimedApiError | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await submitOnce(options);
    } catch (err) {
      lastError = err instanceof AimedApiError ? err : new AimedApiError(ERROR_MESSAGES.UNKNOWN);

      // Only retry network errors
      if (!lastError.retryable || attempt >= MAX_RETRIES) {
        throw lastError;
      }

      // Wait before retry
      await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
    }
  }

  throw lastError ?? new AimedApiError(ERROR_MESSAGES.UNKNOWN);
}
