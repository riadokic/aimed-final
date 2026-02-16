import type { ReportSection } from "@/types/aimed";
import type { ClinicInfo } from "@/types/aimed";
import { formatBosnianDate } from "@/lib/utils";

export interface PatientInfo {
  name: string;
  dateOfBirth: string;
  jmbg: string;
  contact: string;
  email?: string;
  address?: string;
}

export interface BrandingData {
  logoUrl?: string;
  signatureUrl?: string;
  stampUrl?: string;
  clinicInfo?: ClinicInfo;
  clinicName?: string;
  doctorName?: string;
  doctorSpecialization?: string;
}

export interface PdfOptions {
  sections: ReportSection[];
  patient: PatientInfo;
  mode: "new" | "update";
  branding?: BrandingData;
  /** @deprecated Use branding.clinicInfo.name */
  clinicName?: string;
  /** @deprecated Use branding.doctorName */
  doctorName?: string;
}

/** Pre-resolved branding with images converted to base64 data URLs */
interface ResolvedBranding {
  logoDataUrl?: string;
  signatureDataUrl?: string;
  stampDataUrl?: string;
  clinicInfo?: ClinicInfo;
  clinicName?: string;
  doctorName?: string;
  doctorSpecialization?: string;
}

/** Fetch an image URL and return a base64 data URL (avoids CORS issues in html2canvas) */
async function fetchAsDataUrl(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}

/** Pre-fetch all branding images as base64 data URLs */
async function resolveBranding(branding?: BrandingData): Promise<ResolvedBranding> {
  if (!branding) return {};

  const [logoDataUrl, signatureDataUrl, stampDataUrl] = await Promise.all([
    branding.logoUrl ? fetchAsDataUrl(branding.logoUrl) : undefined,
    branding.signatureUrl ? fetchAsDataUrl(branding.signatureUrl) : undefined,
    branding.stampUrl ? fetchAsDataUrl(branding.stampUrl) : undefined,
  ]);

  return {
    logoDataUrl,
    signatureDataUrl,
    stampDataUrl,
    clinicInfo: branding.clinicInfo,
    clinicName: branding.clinicName,
    doctorName: branding.doctorName,
    doctorSpecialization: branding.doctorSpecialization,
  };
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
        const el = clonedDoc.querySelector("[data-pdf-root]") as HTMLElement | null;
        if (el) {
          el.style.position = "static";
          el.style.left = "auto";
          el.style.visibility = "visible";
        }
      },
    },
    jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
    pagebreak: { mode: ["css", "legacy"] },
  };
}

/** Create a truly hidden off-screen container (no visual flash) */
function createOffscreenContainer(html: string): HTMLDivElement {
  const el = document.createElement("div");
  el.setAttribute("data-pdf-root", "");
  el.innerHTML = html;
  el.style.position = "absolute";
  el.style.left = "-9999px";
  el.style.top = "0";
  el.style.visibility = "hidden";
  el.style.overflow = "hidden";
  el.style.pointerEvents = "none";
  el.style.zIndex = "-1";
  return el;
}

/** Dynamically import html2pdf.js (handles both ESM default and CJS module formats) */
async function loadHtml2Pdf() {
  const mod = await import("html2pdf.js");
  // html2pdf.js may expose the factory as .default or as the module itself
  const factory = typeof mod.default === "function" ? mod.default : (mod as unknown as () => unknown);
  return factory;
}

/**
 * Generates a professional medical report PDF and triggers download.
 */
export async function generatePdf(options: PdfOptions): Promise<void> {
  const html2pdf = await loadHtml2Pdf();

  // Pre-fetch branding images as base64 to avoid CORS blank-canvas issues
  const resolved = await resolveBranding(options.branding);
  const html = buildPrintHtml(options, resolved);

  const container = createOffscreenContainer(html);
  document.body.appendChild(container);

  const dateStr = formatBosnianDate();
  const filename = options.patient.name
    ? `nalaz_${options.patient.name.replace(/\s+/g, "_")}_${dateStr}.pdf`
    : `nalaz_${dateStr}.pdf`;

  try {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => setTimeout(resolve, 300));
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const worker = (html2pdf as any)();
    await worker.set(html2pdfConfig(filename)).from(container).save();
  } catch (err) {
    console.error("PDF generation failed:", err);
    throw err;
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Generates a PDF blob (without triggering download).
 */
export async function generatePdfBlob(options: PdfOptions): Promise<Blob> {
  const html2pdf = await loadHtml2Pdf();

  const resolved = await resolveBranding(options.branding);
  const html = buildPrintHtml(options, resolved);

  const container = createOffscreenContainer(html);
  document.body.appendChild(container);

  try {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => setTimeout(resolve, 300));
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const worker = (html2pdf as any)();
    const blob: Blob = await worker
      .set(html2pdfConfig())
      .from(container)
      .outputPdf("blob");

    return blob;
  } finally {
    document.body.removeChild(container);
  }
}

function buildPrintHtml(options: PdfOptions, resolved: ResolvedBranding = {}): string {
  const { sections, patient, branding } = options;
  const date = formatBosnianDate();

  // Resolve names
  const clinicName = resolved.clinicName || branding?.clinicName || resolved.clinicInfo?.name || branding?.clinicInfo?.name || options.clinicName;
  const doctorName = resolved.doctorName || branding?.doctorName || options.doctorName;
  const doctorSpecialization = resolved.doctorSpecialization || branding?.doctorSpecialization;
  const clinicInfo = resolved.clinicInfo || branding?.clinicInfo;
  const logoUrl = resolved.logoDataUrl || branding?.logoUrl;
  const signatureUrl = resolved.signatureDataUrl || branding?.signatureUrl;
  const stampUrl = resolved.stampDataUrl || branding?.stampUrl;

  // ── Section HTML (matches Word export styling) ──
  const sectionHtml = sections
    .filter((s) => s.content.trim().length > 0)
    .map(
      (s) => `
      <div style="margin-bottom: 20px; page-break-inside: avoid;">
        <p style="font-size: 11pt; font-weight: bold; margin: 0 0 6px 0; color: #1a1a1a; font-family: 'Times New Roman', serif;">
          ${escapeHtml(s.title)}
        </p>
        <p style="font-size: 11pt; line-height: 1.55; margin: 0; white-space: pre-wrap; font-family: 'Times New Roman', serif;">
          ${escapeHtml(s.content)}
        </p>
      </div>`
    )
    .join("\n");

  // ── Header: Logo (left) + Clinic Info (right) ──
  const headerHtml = `
    <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
      <div style="flex-shrink: 0; min-height: 80px;">
        ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" style="max-height: 80px; max-width: 200px;" crossorigin="anonymous" />` : (clinicName ? `<p style="font-size: 14pt; font-weight: bold; margin: 0;">${escapeHtml(clinicName)}</p>` : "")}
      </div>
      <div style="text-align: right; font-size: 10pt; color: #333; line-height: 1.4;">
        ${clinicName && logoUrl ? `<p style="font-weight: bold; margin: 0 0 2px 0; font-size: 11pt;">${escapeHtml(clinicName)}</p>` : ""}
        ${clinicInfo?.address ? `<p style="margin: 0;">${escapeHtml(clinicInfo.address)}</p>` : ""}
        ${clinicInfo?.website ? `<p style="margin: 0;">${escapeHtml(clinicInfo.website)}</p>` : ""}
        ${clinicInfo?.phone ? `<p style="margin: 0;">${escapeHtml(clinicInfo.phone)}</p>` : ""}
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
      <p style="font-size: 18pt; font-weight: bold; margin: 0; letter-spacing: 1px;">SPECIJALISTIČKI NALAZ</p>
    </div>`;

  // ── Patient Info ──
  const patientRows: string[] = [];
  patientRows.push(`
    <tr>
      <td style="width: 140px; padding: 6px 12px; border: 1px solid #ddd; background: #fafafa; font-weight: bold;">Ime i prezime:</td>
      <td colspan="3" style="padding: 6px 12px; border: 1px solid #ddd;">${escapeHtml(patient.name)}</td>
    </tr>
  `);

  patientRows.push(`
    <tr>
      <td style="width: 140px; padding: 6px 12px; border: 1px solid #ddd; background: #fafafa; font-weight: bold;">Datum rođenja:</td>
      <td style="width: 140px; padding: 6px 12px; border: 1px solid #ddd;">${escapeHtml(patient.dateOfBirth)}</td>
      <td style="width: 80px; padding: 6px 12px; border: 1px solid #ddd; background: #fafafa; font-weight: bold;">JMBG:</td>
      <td style="padding: 6px 12px; border: 1px solid #ddd;">${escapeHtml(patient.jmbg)}</td>
    </tr>
  `);

  patientRows.push(`
    <tr>
      <td style="width: 140px; padding: 6px 12px; border: 1px solid #ddd; background: #fafafa; font-weight: bold;">Datum pregleda:</td>
      <td style="width: 140px; padding: 6px 12px; border: 1px solid #ddd;">${date}</td>
      <td style="width: 80px; padding: 6px 12px; border: 1px solid #ddd; background: #fafafa; font-weight: bold;">Telefon:</td>
      <td style="padding: 6px 12px; border: 1px solid #ddd;">${escapeHtml(patient.contact)}</td>
    </tr>
  `);

  patientRows.push(`
    <tr>
      <td style="width: 140px; padding: 6px 12px; border: 1px solid #ddd; background: #fafafa; font-weight: bold;">Adresa:</td>
      <td colspan="3" style="padding: 6px 12px; border: 1px solid #ddd;">${escapeHtml(patient.address || "")}</td>
    </tr>
  `);

  const patientHtml = `
    <div style="margin-bottom: 25px;">
      <p style="font-size: 11pt; font-weight: bold; margin: 0 0 10px 0;">Podaci o pacijentu</p>
      <table style="width: 100%; font-size: 10.5pt; border-collapse: collapse; table-layout: fixed;">
        ${patientRows.join("")}
      </table>
    </div>`;

  // ── Footer: Signature (right) ──
  const footerHtml = `
    <div style="margin-top: 60px; display: flex; flex-direction: column; align-items: flex-end;">
      <div style="width: 300px; text-align: center;">
        <div style="height: 60px; display: flex; align-items: flex-end; justify-content: center; gap: 20px; margin-bottom: 8px;">
          ${signatureUrl ? `<img src="${escapeHtml(signatureUrl)}" style="max-height: 50px; max-width: 120px;" crossorigin="anonymous" />` : ""}
          ${stampUrl ? `<img src="${escapeHtml(stampUrl)}" style="max-height: 80px; max-width: 120px;" crossorigin="anonymous" />` : ""}
        </div>
        <div style="border-top: 1px solid transparent; padding-top: 5px;">
          <p style="margin: 0; font-weight: bold; font-size: 10.5pt; font-family: Arial, sans-serif;">${doctorName ? `Dr. ${escapeHtml(doctorName)}` : "Ljekar specijalista"}</p>
          ${doctorSpecialization ? `<p style="margin: 2px 0 0 0; font-size: 9.5pt; color: #444; font-family: Arial, sans-serif;">${escapeHtml(doctorSpecialization)}</p>` : ""}
        </div>
      </div>
    </div>`;

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; padding: 20px; background: white;">
      ${headerHtml}
      ${patientHtml}
      ${sectionHtml}
      ${footerHtml}
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
