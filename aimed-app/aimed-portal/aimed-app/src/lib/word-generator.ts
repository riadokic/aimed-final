import {
  Document,
  Paragraph,
  TextRun,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Packer,
  type ITableCellBorders,
} from "docx";
import { saveAs } from "file-saver";
import type { ReportSection } from "@/types/aimed";
import type { PatientInfo, BrandingData } from "@/lib/pdf-generator";
import { formatBosnianDate } from "@/lib/utils";
import { loadSettings } from "@/lib/report-storage";

/** Fetch an image URL as Uint8Array for docx ImageRun */
async function fetchImageBuffer(url: string): Promise<{ data: Uint8Array; width: number; height: number } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const arrayBuf = await blob.arrayBuffer();

    // Load into an Image to get natural dimensions
    const dataUrl = URL.createObjectURL(blob);
    const dims = await new Promise<{ width: number; height: number }>((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(dataUrl);
      };
      img.onerror = () => {
        resolve({ width: 200, height: 60 });
        URL.revokeObjectURL(dataUrl);
      };
      img.src = dataUrl;
    });

    return { data: new Uint8Array(arrayBuf), ...dims };
  } catch {
    return null;
  }
}

/** Scale image to fit within maxW x maxH while preserving aspect ratio (EMU units) */
function fitImage(w: number, h: number, maxW: number, maxH: number): { width: number; height: number } {
  const scale = Math.min(maxW / w, maxH / h, 1);
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}

export interface WordOptions {
  sections: ReportSection[];
  patient: PatientInfo;
  mode: "new" | "update";
  branding?: BrandingData;
  clinicName?: string;
  doctorName?: string;
  /** Base64-encoded .docx template (from settings) */
  templateDocxBase64?: string;
}

const noBorders: ITableCellBorders = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};

/**
 * Generates a professional .docx medical report and triggers download.
 * If a template exists (passed or from settings), uses docxtemplater.
 * Otherwise falls back to programmatic generation via the `docx` library.
 */
export async function generateWord(options: WordOptions): Promise<void> {
  // Always try to get the template — from the options OR from settings
  let templateBase64 = options.templateDocxBase64;
  if (!templateBase64) {
    const settings = loadSettings();
    if (settings.templateDocxBase64) {
      templateBase64 = settings.templateDocxBase64;
    }
  }

  // Resolve clinicName / doctorName: branding > explicit props > localStorage settings
  const settings = loadSettings();
  const clinicName = options.branding?.clinicInfo?.name || options.clinicName || settings.clinicName || undefined;
  const doctorName = options.branding?.doctorName || options.doctorName || settings.doctorName || undefined;

  if (templateBase64) {
    await generateFromTemplate({
      ...options,
      templateDocxBase64: templateBase64,
      clinicName,
      doctorName,
    });
    return;
  }

  // ── Programmatic generation (no template) ──
  const { sections, patient, branding } = options;
  const date = formatBosnianDate();

  // Pre-fetch branding images
  const [logoImg, signatureImg, stampImg] = await Promise.all([
    branding?.logoUrl ? fetchImageBuffer(branding.logoUrl) : null,
    branding?.signatureUrl ? fetchImageBuffer(branding.signatureUrl) : null,
    branding?.stampUrl ? fetchImageBuffer(branding.stampUrl) : null,
  ]);

  const children: (Paragraph | Table)[] = [];
  const clinicInfo = branding?.clinicInfo;

  // ── Header: Logo (left) + Clinic Info (right) ──
  const headerCells: TableCell[] = [];

  // Column 1: Logo
  headerCells.push(
    new TableCell({
      borders: noBorders,
      width: { size: 50, type: WidthType.PERCENTAGE },
      children: logoImg ? [
        new Paragraph({
          children: [
            new ImageRun({
              data: logoImg.data,
              transformation: fitImage(logoImg.width, logoImg.height, 160, 60),
              type: "png",
            }),
          ],
        }),
      ] : (clinicName ? [
        new Paragraph({
          children: [new TextRun({ text: clinicName, bold: true, size: 28, font: "Arial" })],
        }),
      ] : []),
    })
  );

  // Column 2: Clinic Info
  const infoParts: TextRun[] = [];
  if (clinicName && logoImg) {
    infoParts.push(new TextRun({ text: clinicName, bold: true, size: 22, font: "Arial" }), new TextRun({ break: 1 }));
  }
  if (clinicInfo?.address) {
    infoParts.push(new TextRun({ text: clinicInfo.address, size: 18, color: "333333", font: "Arial" }), new TextRun({ break: 1 }));
  }
  if (clinicInfo?.website) {
    infoParts.push(new TextRun({ text: clinicInfo.website, size: 18, color: "333333", font: "Arial" }), new TextRun({ break: 1 }));
  }
  if (clinicInfo?.phone) {
    infoParts.push(new TextRun({ text: clinicInfo.phone, size: 18, color: "333333", font: "Arial" }));
  }

  headerCells.push(
    new TableCell({
      borders: noBorders,
      width: { size: 50, type: WidthType.PERCENTAGE },
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: infoParts,
        }),
      ],
    })
  );

  children.push(
    new Table({
      borders: noBorders,
      rows: [new TableRow({ children: headerCells })],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),
    new Paragraph({ spacing: { before: 400, after: 200 }, children: [] })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 400 },
      children: [new TextRun({ text: "SPECIJALISTIČKI NALAZ", bold: true, size: 36, font: "Arial" })],
    })
  );

  // Column labels cell helper
  const labelCell = (text: string, widthPercent = 20) => new TableCell({
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
    },
    shading: { fill: "FAFAFA" },
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20, font: "Arial", color: "333333" })] })],
  });

  const valueCell = (text: string | undefined, widthPercent = 30, colSpan = 1) => new TableCell({
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
    },
    columnSpan: colSpan,
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    children: [new Paragraph({ children: [new TextRun({ text: (text && text.trim() ? text : "—"), size: 20, font: "Arial" })] })],
  });

  children.push(
    new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({ text: "Podaci o pacijentu", bold: true, size: 22, font: "Arial" })],
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [labelCell("Ime i prezime:"), valueCell(patient.name, 80, 3)],
        }),
        new TableRow({
          children: [
            labelCell("Datum rođenja:"), valueCell(patient.dateOfBirth),
            labelCell("JMBG:"), valueCell(patient.jmbg),
          ],
        }),
        new TableRow({
          children: [
            labelCell("Adresa:"), valueCell(patient.address),
            labelCell("Telefon:"), valueCell(patient.contact),
          ],
        }),
        new TableRow({
          children: [labelCell("Datum pregleda:"), valueCell(date, 80, 3)],
        }),
      ],
    }),
    new Paragraph({ spacing: { after: 300 }, children: [] })
  );

  // ── Report Sections ──
  for (const section of sections) {
    if (!section.content.trim()) continue;

    children.push(
      new Paragraph({
        spacing: { before: 200, after: 80 },
        children: [new TextRun({ text: section.title, bold: true, size: 22, font: "Times New Roman" })],
      })
    );

    for (const line of section.content.split("\n")) {
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [new TextRun({ text: line, size: 22, font: "Times New Roman" })],
        })
      );
    }
  }

  // ── Footer: Signature Block on right ──
  const signatureCells: Paragraph[] = [];

  // Images (Signature & Stamp) side by side
  const sigRowParts: ImageRun[] = [];
  if (signatureImg) {
    const transformation = fitImage(signatureImg.width, signatureImg.height, 120, 50);
    sigRowParts.push(new ImageRun({ data: signatureImg.data, transformation, type: "png" }));
  }
  if (stampImg) {
    const transformation = fitImage(stampImg.width, stampImg.height, 120, 80);
    sigRowParts.push(new ImageRun({ data: stampImg.data, transformation, type: "png" }));
  }

  if (sigRowParts.length > 0) {
    signatureCells.push(new Paragraph({ alignment: AlignmentType.CENTER, children: sigRowParts, spacing: { after: 100 } }));
  }

  // Doctor Info
  const doctorSpecialization = branding?.doctorSpecialization;
  signatureCells.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.NONE, size: 0 } },
      spacing: { before: 100 },
      children: [
        new TextRun({ text: doctorName ? `Dr. ${doctorName}` : "Ljekar specijalista", bold: true, size: 22, font: "Arial" }),
        ...(doctorSpecialization ? [new TextRun({ break: 1, text: doctorSpecialization, size: 22, color: "444444", font: "Arial" })] : []),
      ],
    })
  );

  children.push(
    new Table({
      borders: noBorders,
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({ borders: noBorders, width: { size: 60, type: WidthType.PERCENTAGE }, children: [] }),
            new TableCell({
              borders: noBorders,
              width: { size: 40, type: WidthType.PERCENTAGE },
              children: signatureCells,
            }),
          ],
        }),
      ],
    })
  );

  // ── Build & Download ──
  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const dateStr = formatBosnianDate();
  const filename = patient.name
    ? `nalaz_${patient.name.replace(/\s+/g, "_")}_${dateStr}.docx`
    : `nalaz_${dateStr}.docx`;

  saveAs(blob, filename);
}

/**
 * Generates a .docx from an uploaded template using docxtemplater.
 * Supports both {SINGLE} and {{DOUBLE}} brace placeholder styles.
 */
async function generateFromTemplate(options: WordOptions): Promise<void> {
  const PizZip = (await import("pizzip")).default;
  const Docxtemplater = (await import("docxtemplater")).default;

  const { sections, patient, templateDocxBase64, clinicName, doctorName } = options;

  // Decode base64 to binary
  const binaryStr = atob(templateDocxBase64!);
  const zip = new PizZip(binaryStr);

  // Detect delimiter style: check raw XML for {{ patterns
  const xmlContent = zip.file("word/document.xml")?.asText() ?? "";
  const usesDoubleBraces = /\{\{[A-Z_]+\}\}/.test(xmlContent);

  const delimiterOptions = usesDoubleBraces
    ? { delimiters: { start: "{{", end: "}}" } }
    : {};

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    ...delimiterOptions,
  });

  // Build section content map (normalize titles: uppercase, strip trailing punctuation)
  const sectionMap: Record<string, string> = {};
  for (const s of sections) {
    const key = s.title.toUpperCase().replace(/[\s:./\-]+$/g, "").trim();
    sectionMap[key] = s.content;
  }

  const date = formatBosnianDate();

  doc.render({
    ANAMNEZA: sectionMap["ANAMNEZA"] || "",
    STATUS: sectionMap["STATUS"] || "",
    DIJAGNOZA: sectionMap["DIJAGNOZA"] || "",
    TERAPIJA: sectionMap["TERAPIJA"] || "",
    PREPORUKE: sectionMap["PREPORUKE"] || "",
    IME_PACIJENTA: patient.name || "",
    DATUM_RODJENJA: patient.dateOfBirth || "",
    JMBG: patient.jmbg || "",
    KONTAKT: patient.contact || "",
    DATUM: date,
    DOKTOR: doctorName || "",
    KLINIKA: clinicName || "",
  });

  const out = doc.getZip().generate({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });

  const dateStr = formatBosnianDate();
  const filename = patient.name
    ? `nalaz_${patient.name.replace(/\s+/g, "_")}_${dateStr}.docx`
    : `nalaz_${dateStr}.docx`;

  saveAs(out, filename);
}
