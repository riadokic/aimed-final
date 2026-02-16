"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/auth-provider";
import type { Patient } from "@/types/aimed";

type PatientInsert = Omit<Patient, "id" | "doctor_id" | "created_at" | "updated_at">;
type PatientUpdate = Partial<PatientInsert>;

/** Convert empty strings to null so Postgres doesn't choke on e.g. date columns */
function stripEmpty<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj };
  for (const key in out) {
    if (out[key] === "") (out as Record<string, unknown>)[key] = null;
  }
  return out;
}

export function usePatients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const listPatients = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("patients")
      .select("*")
      .eq("doctor_id", user.id)
      .order("updated_at", { ascending: false });
    setPatients(data ?? []);
    setLoading(false);
  }, [user, supabase]);

  const searchPatients = useCallback(
    async (query: string) => {
      if (!user) return;
      setLoading(true);
      const q = `%${query}%`;
      const { data } = await supabase
        .from("patients")
        .select("*")
        .eq("doctor_id", user.id)
        .or(`first_name.ilike.${q},last_name.ilike.${q},jmbg.ilike.${q}`)
        .order("updated_at", { ascending: false })
        .limit(20);
      setPatients(data ?? []);
      setLoading(false);
    },
    [user, supabase]
  );

  const getPatient = useCallback(
    async (id: string): Promise<Patient | null> => {
      const { data } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .single();
      return data;
    },
    [supabase]
  );

  const createPatient = useCallback(
    async (input: PatientInsert): Promise<Patient | null> => {
      if (!user) return null;
      const clean = stripEmpty(input);
      const { data, error } = await supabase
        .from("patients")
        .insert({ ...clean, doctor_id: user.id })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    [user, supabase]
  );

  const updatePatient = useCallback(
    async (id: string, updates: PatientUpdate): Promise<Patient | null> => {
      const { data, error } = await supabase
        .from("patients")
        .update(stripEmpty(updates))
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    [supabase]
  );

  const deletePatient = useCallback(
    async (id: string): Promise<void> => {
      const { error } = await supabase.from("patients").delete().eq("id", id);
      if (error) throw new Error(error.message);
      setPatients((prev) => prev.filter((p) => p.id !== id));
    },
    [supabase]
  );

  return {
    patients,
    loading,
    listPatients,
    searchPatients,
    getPatient,
    createPatient,
    updatePatient,
    deletePatient,
  };
}
