import type { ReportSection } from "@/types/aimed";
import { formatBosnianDate } from "@/lib/utils";
import { loadSettings } from "@/lib/report-storage";

export interface PatientInfo {
  name: string;
  dateOfBirth: string;
  jmbg: string;
  contact: string;
}

export interface PdfOptions {
  sections: ReportSection[];
  patient: PatientInfo;
  mode: "new" | "update" | "template";
  clinicName?: string;
  doctorName?: string;
}

/**
 * Shared html2pdf config. Uses `onclone` to ensure the cloned element is
 * visible to html2canvas (off-screen containers can produce blank output).
 */
function html2pdfConfig(filename?: string) {
  return {
    margin: [15, 15, 20, 15],
    ...(filename ? { filename } : {}),
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: 794,
      onclone: (clonedDoc: Document) => {
        // Ensure the cloned container is visible to html2canvas
        const el = clonedDoc.querySelector("[data-pdf-root]") as HTMLElement | null;
        if (el) {
          el.style.position = "static";
          el.style.left = "auto";
          el.style.visibility = "visible";
        }
      },
    },
    jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };
}

/** Resolve clinicName / doctorName from options or settings */
function resolveSettings(options: PdfOptions) {
  const settings = loadSettings();
  return {
    clinicName: options.clinicName || settings.clinicName || undefined,
    doctorName: options.doctorName || settings.doctorName || undefined,
  };
}

/**
 * Generates a professional medical report PDF and triggers download.
 */
export async function generatePdf(options: PdfOptions): Promise<void> {
  const html2pdf = (await import("html2pdf.js")).default;

  const resolved = resolveSettings(options);
  const html = buildPrintHtml({ ...options, ...resolved });

  const container = document.createElement("div");
  container.setAttribute("data-pdf-root", "");
  container.innerHTML = html;
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  document.body.appendChild(container);

  const dateStr = formatBosnianDate();
  const filename = options.patient.name
    ? `nalaz_${options.patient.name.replace(/\s+/g, "_")}_${dateStr}.pdf`
    : `nalaz_${dateStr}.pdf`;

  try {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => setTimeout(resolve, 150));
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const worker = html2pdf() as any;
    await worker.set(html2pdfConfig(filename)).from(container).save();
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Generates a PDF blob (without triggering download).
 * Used by ZIP export to bundle multiple PDFs.
 */
export async function generatePdfBlob(options: PdfOptions): Promise<Blob> {
  const html2pdf = (await import("html2pdf.js")).default;

  const resolved = resolveSettings(options);
  const html = buildPrintHtml({ ...options, ...resolved });

  const container = document.createElement("div");
  container.setAttribute("data-pdf-root", "");
  container.innerHTML = html;
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  document.body.appendChild(container);

  try {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => setTimeout(resolve, 150));
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const worker = html2pdf() as any;
    const blob: Blob = await worker
      .set(html2pdfConfig())
      .from(container)
      .outputPdf("blob");

    return blob;
  } finally {
    document.body.removeChild(container);
  }
}

function buildPrintHtml(options: PdfOptions): string {
  const { sections, patient, clinicName, doctorName } = options;
  const date = formatBosnianDate();

  const sectionHtml = sections
    .filter((s) => s.content.trim().length > 0)
    .map(
      (s) => `
      <div style="margin-bottom: 14px; page-break-inside: avoid;">
        <p style="font-size: 11pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0; color: #333;">
          ${escapeHtml(s.title)}
        </p>
        <p style="font-size: 11pt; line-height: 1.6; margin: 0; white-space: pre-wrap;">
          ${escapeHtml(s.content)}
        </p>
      </div>`
    )
    .join("\n");

  return `
    <div style="font-family: 'Times New Roman', Times, serif; color: #1a1a1a; padding: 10px;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #ccc; padding-bottom: 16px;">
        ${clinicName ? `<p style="font-size: 13pt; font-weight: bold; margin: 0 0 4px 0;">${escapeHtml(clinicName)}</p>` : ""}
        <p style="font-size: 16pt; font-weight: bold; margin: 0; letter-spacing: 1px;">MEDICINSKI NALAZ</p>
        <p style="font-size: 10pt; color: #666; margin: 4px 0 0 0;">Datum: ${date}</p>
      </div>

      <!-- Patient Info -->
      ${patient.name || patient.dateOfBirth || patient.jmbg
      ? `
      <div style="margin-bottom: 20px; padding: 10px; background: #f9f9f9; border: 1px solid #e5e5e5; border-radius: 4px;">
        <p style="font-size: 10pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 6px 0; color: #666;">Podaci o pacijentu</p>
        <table style="font-size: 11pt; border-collapse: collapse;">
          ${patient.name ? `<tr><td style="padding: 2px 12px 2px 0; color: #666;">Ime i prezime:</td><td style="padding: 2px 0;">${escapeHtml(patient.name)}</td></tr>` : ""}
          ${patient.dateOfBirth ? `<tr><td style="padding: 2px 12px 2px 0; color: #666;">Datum rođenja:</td><td style="padding: 2px 0;">${escapeHtml(patient.dateOfBirth)}</td></tr>` : ""}
          ${patient.jmbg ? `<tr><td style="padding: 2px 12px 2px 0; color: #666;">JMBG:</td><td style="padding: 2px 0;">${escapeHtml(patient.jmbg)}</td></tr>` : ""}
          ${patient.contact ? `<tr><td style="padding: 2px 12px 2px 0; color: #666;">Kontakt:</td><td style="padding: 2px 0;">${escapeHtml(patient.contact)}</td></tr>` : ""}
        </table>
      </div>`
      : ""
    }

      <!-- Report Sections -->
      ${sectionHtml}

      <!-- Footer -->
      <div style="margin-top: 40px; border-top: 1px solid #ccc; padding-top: 16px;">
        <div style="display: flex; justify-content: space-between; font-size: 10pt;">
          <div>
            ${doctorName ? `<p style="margin: 0;">Dr. ${escapeHtml(doctorName)}</p>` : `<p style="margin: 0; color: #999;">___________________________</p><p style="margin: 4px 0 0 0; color: #666; font-size: 9pt;">Potpis ljekara</p>`}
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; color: #999;">___________________________</p>
            <p style="margin: 4px 0 0 0; color: #666; font-size: 9pt;">Pečat ustanove</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
