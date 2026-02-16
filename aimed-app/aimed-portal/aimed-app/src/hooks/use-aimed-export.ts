"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/auth-provider";
import { toast } from "@/components/ui/toast";
import type { PatientInfo, BrandingData } from "@/lib/pdf-generator";
import { generatePdf } from "@/lib/pdf-generator";
import { generateWord } from "@/lib/word-generator";
import type { ReportSection, ReportMode } from "@/types/aimed";

export function useAimedExport() {
  const { user } = useAuth();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [wordLoading, setWordLoading] = useState(false);
  const brandingRef = useRef<BrandingData | null>(null);

  // Fetch branding data from Supabase on mount
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("full_name, specialization, clinic_name, branding_logo_url, branding_signature_url, branding_stamp_url, clinic_info")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        brandingRef.current = {
          doctorName: data.full_name || undefined,
          doctorSpecialization: data.specialization || undefined,
          clinicName: data.clinic_name || undefined,
          logoUrl: data.branding_logo_url || undefined,
          signatureUrl: data.branding_signature_url || undefined,
          stampUrl: data.branding_stamp_url || undefined,
          clinicInfo: data.clinic_info || undefined,
        };
      });
  }, [user]);

  const exportPdf = useCallback(
    async (sections: ReportSection[], patient: PatientInfo, mode: ReportMode = "new") => {
      if (!user) return;
      setPdfLoading(true);
      try {
        toast("Generisanje PDF-a...", "info");
        await generatePdf({
          sections,
          patient,
          mode,
          branding: brandingRef.current || undefined,
        });
        toast("PDF uspješno kreiran", "success");
      } catch (error) {
        console.error("PDF export error:", error);
        toast("Greška pri kreiranju PDF-a. Pokušajte ponovo.", "error");
      } finally {
        setPdfLoading(false);
      }
    },
    [user]
  );

  const exportWord = useCallback(
    async (sections: ReportSection[], patient: PatientInfo, mode: ReportMode = "new") => {
      if (!user) return;
      setWordLoading(true);
      try {
        toast("Generisanje Word dokumenta...", "info");
        await generateWord({
          sections,
          patient,
          mode,
          branding: brandingRef.current || undefined,
        });
        toast("Word dokument uspješno kreiran", "success");
      } catch (error) {
        console.error("Word export error:", error);
        toast("Greška pri kreiranju dokumenta. Pokušajte ponovo.", "error");
      } finally {
        setWordLoading(false);
      }
    },
    [user]
  );

  return { exportPdf, exportWord, pdfLoading, wordLoading };
}
