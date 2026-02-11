import {
  Document,
  Paragraph,
  TextRun,
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
import type { PatientInfo } from "@/lib/pdf-generator";
import { formatBosnianDate } from "@/lib/utils";
import { loadSettings } from "@/lib/report-storage";

export interface WordOptions {
  sections: ReportSection[];
  patient: PatientInfo;
  mode: "new" | "update" | "template";
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

  // Also fill in clinicName / doctorName from settings if not provided
  const settings = loadSettings();
  const clinicName = options.clinicName || settings.clinicName || undefined;
  const doctorName = options.doctorName || settings.doctorName || undefined;

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
  const { sections, patient } = options;
  const date = formatBosnianDate();

  const children: (Paragraph | Table)[] = [];

  // ── Header ──
  if (clinicName) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [new TextRun({ text: clinicName, bold: true, size: 26, font: "Times New Roman" })],
      })
    );
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: "MEDICINSKI NALAZ", bold: true, size: 32, font: "Times New Roman" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: `Datum: ${date}`, size: 20, color: "666666", font: "Times New Roman" })],
    }),
    new Paragraph({
      spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
      children: [],
    })
  );

  // ── Patient Info (as table) ──
  const patientRows: TableRow[] = [];
  const fields: [string, string][] = [
    ["Ime i prezime:", patient.name],
    ["Datum rođenja:", patient.dateOfBirth],
    ["JMBG:", patient.jmbg],
    ["Kontakt:", patient.contact],
  ];

  for (const [label, value] of fields) {
    if (!value) continue;
    patientRows.push(
      new TableRow({
        children: [
          new TableCell({
            borders: noBorders,
            width: { size: 2400, type: WidthType.DXA },
            children: [
              new Paragraph({
                children: [new TextRun({ text: label, size: 22, color: "666666", font: "Times New Roman" })],
              }),
            ],
          }),
          new TableCell({
            borders: noBorders,
            children: [
              new Paragraph({
                children: [new TextRun({ text: value, size: 22, font: "Times New Roman" })],
              }),
            ],
          }),
        ],
      })
    );
  }

  if (patientRows.length > 0) {
    children.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({ text: "PODACI O PACIJENTU", bold: true, size: 20, color: "666666", font: "Times New Roman" }),
        ],
      }),
      new Table({
        rows: patientRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      }),
      new Paragraph({ spacing: { after: 200 }, children: [] })
    );
  }

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

  // ── Footer ──
  children.push(
    new Paragraph({
      spacing: { before: 400 },
      border: { top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
      children: [],
    })
  );

  if (doctorName) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `Dr. ${doctorName}`, size: 20, font: "Times New Roman" })],
      })
    );
  } else {
    children.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: "___________________________", size: 20, color: "999999", font: "Times New Roman" })],
      }),
      new Paragraph({
        children: [new TextRun({ text: "Potpis ljekara", size: 18, color: "666666", font: "Times New Roman" })],
      })
    );
  }

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
