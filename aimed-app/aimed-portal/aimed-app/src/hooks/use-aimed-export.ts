import { useState } from "react";
import type { ReportSection } from "@/types/aimed";
import type { PatientInfo } from "@/lib/pdf-generator";
import { toast } from "@/components/ui/toast";
import { generateWord } from "@/lib/word-generator";

const EXPORT_URL = "/api/export";

type OutputFormat = "pdf" | "docx";

interface ExportParams {
  sections: ReportSection[];
  patient: PatientInfo;
  outputFormat: OutputFormat;
}

function buildRequestBody(params: ExportParams) {
  const sectionMap: Record<string, string> = {};
  for (const s of params.sections) {
    const key = s.title.toUpperCase().replace(/[\s:./\-]+$/g, "").trim();
    sectionMap[key] = s.content;
  }

  return {
    sections: sectionMap,
    patient: {
      name: params.patient.name || "",
      dob: params.patient.dateOfBirth || "",
    },
    output_format: params.outputFormat,
  };
}

function getFilename(format: OutputFormat): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const ext = format === "pdf" ? "pdf" : "docx";
  return `nalaz-${yyyy}-${mm}-${dd}.${ext}`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function useAimedExport() {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [wordLoading, setWordLoading] = useState(false);

  async function exportDocument(params: ExportParams): Promise<void> {
    const isLoading = params.outputFormat === "pdf" ? setPdfLoading : setWordLoading;
    isLoading(true);

    try {
      toast("Generisanje dokumenta...", "info");

      const body = buildRequestBody(params);
      console.log("Exporting to proxy:", EXPORT_URL);
      console.log("Export payload:", JSON.stringify(body, null, 2));

      const res = await fetch(EXPORT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      console.log("Proxy response status:", res.status);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      if (params.outputFormat === "pdf") {
        // Binary blob response
        const blob = await res.blob();
        triggerDownload(blob, getFilename("pdf"));
      } else {
        // Use programmatic generator for valid OpenXML .docx
        await generateWord({
          sections: params.sections,
          patient: params.patient,
          mode: "new" // default
        });
      }

      toast("Dokument uspješno kreiran", "success");
    } catch {
      toast("Greška pri kreiranju dokumenta. Pokušajte ponovo.", "error");
    } finally {
      isLoading(false);
    }
  }

  async function exportPdf(sections: ReportSection[], patient: PatientInfo) {
    await exportDocument({ sections, patient, outputFormat: "pdf" });
  }

  async function exportWord(sections: ReportSection[], patient: PatientInfo) {
    await exportDocument({ sections, patient, outputFormat: "docx" });
  }

  return { exportPdf, exportWord, pdfLoading, wordLoading };
}
