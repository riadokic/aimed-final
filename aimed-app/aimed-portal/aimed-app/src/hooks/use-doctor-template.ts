"use client";

import { useState, useEffect } from "react";
import type { FieldMetadata } from "@/types/aimed";
import { useAuth } from "@/components/auth/auth-provider";

interface DoctorTemplateState {
  fields: FieldMetadata[] | null;
  templateName: string | null;
  loading: boolean;
}

/**
 * Fetches the current doctor's template metadata from Supabase.
 * Returns null fields if no template exists.
 */
export function useDoctorTemplate(): DoctorTemplateState {
  const { user } = useAuth();
  const [state, setState] = useState<DoctorTemplateState>({
    fields: null,
    templateName: null,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setState({ fields: null, templateName: null, loading: false });
      return;
    }

    let cancelled = false;

    async function fetchTemplate() {
      try {
        const res = await fetch("/api/templates");
        if (!res.ok) throw new Error("Failed to fetch template");
        const data = await res.json();

        if (!cancelled && data.success && data.template) {
          setState({
            fields: data.template.fields_metadata as FieldMetadata[],
            templateName: data.template.template_name || null,
            loading: false,
          });
        } else if (!cancelled) {
          setState({ fields: null, templateName: null, loading: false });
        }
      } catch {
        if (!cancelled) {
          setState({ fields: null, templateName: null, loading: false });
        }
      }
    }

    fetchTemplate();
    return () => { cancelled = true; };
  }, [user]);

  return state;
}
