"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/auth-provider";
import type { Report, ReportSection } from "@/types/aimed";

interface ReportInsert {
  patient_id: string;
  content: { sections: ReportSection[] };
  report_date: string;
  type: string;
  recording_url?: string;
}

interface ReportUpdate {
  content?: { sections: ReportSection[] };
  type?: string;
}

/** Report joined with patient name for listing */
export interface ReportWithPatient extends Report {
  patients: {
    first_name: string;
    last_name: string;
    jmbg?: string;
    date_of_birth?: string;
    phone?: string;
    email?: string;
    address?: string;
  } | null;
}

export function useReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const getReportsByPatient = useCallback(
    async (patientId: string) => {
      setLoading(true);
      const { data } = await supabase
        .from("reports")
        .select("*")
        .eq("patient_id", patientId)
        .order("report_date", { ascending: false });
      setReports(data ?? []);
      setLoading(false);
      return data ?? [];
    },
    [supabase]
  );

  const listReports = useCallback(async () => {
    if (!user) return [];
    setLoading(true);
    const { data } = await supabase
      .from("reports")
      .select("*, patients(first_name, last_name, jmbg, date_of_birth, phone, email, address)")
      .eq("doctor_id", user.id)
      .order("report_date", { ascending: false });
    const result = (data ?? []) as ReportWithPatient[];
    setLoading(false);
    return result;
  }, [user, supabase]);

  const getReport = useCallback(
    async (id: string): Promise<Report | null> => {
      const { data } = await supabase
        .from("reports")
        .select("*")
        .eq("id", id)
        .single();
      return data;
    },
    [supabase]
  );

  const createReport = useCallback(
    async (input: ReportInsert): Promise<Report | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("reports")
        .insert({ ...input, doctor_id: user.id })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    [user, supabase]
  );

  const updateReport = useCallback(
    async (id: string, updates: ReportUpdate): Promise<Report | null> => {
      const { data, error } = await supabase
        .from("reports")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    [supabase]
  );

  const deleteReport = useCallback(
    async (id: string): Promise<void> => {
      const { error } = await supabase.from("reports").delete().eq("id", id);
      if (error) throw new Error(error.message);
      setReports((prev) => prev.filter((r) => r.id !== id));
    },
    [supabase]
  );

  return {
    reports,
    loading,
    getReportsByPatient,
    listReports,
    getReport,
    createReport,
    updateReport,
    deleteReport,
  };
}
