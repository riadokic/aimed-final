"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Patient } from "@/types/aimed";

type PatientFormData = Omit<Patient, "id" | "doctor_id" | "created_at" | "updated_at">;

interface PatientFormProps {
  initialData?: Partial<PatientFormData>;
  onSubmit: (data: PatientFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

const EMPTY_FORM: PatientFormData = {
  first_name: "",
  last_name: "",
  jmbg: "",
  date_of_birth: "",
  phone: "",
  email: "",
  address: "",
};

export function PatientForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Sačuvaj",
}: PatientFormProps) {
  const [form, setForm] = useState<PatientFormData>({
    ...EMPTY_FORM,
    ...initialData,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(key: keyof PatientFormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError("Ime i prezime su obavezni.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch {
      setError("Greška pri čuvanju. Pokušajte ponovo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Ime *"
            placeholder="Marko"
            value={form.first_name}
            onChange={(v) => handleChange("first_name", v)}
          />
          <FormField
            label="Prezime *"
            placeholder="Marković"
            value={form.last_name}
            onChange={(v) => handleChange("last_name", v)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="JMBG"
            placeholder="1234567890123"
            value={form.jmbg || ""}
            onChange={(v) => handleChange("jmbg", v)}
          />
          <FormField
            label="Datum rođenja"
            type="date"
            value={form.date_of_birth || ""}
            onChange={(v) => handleChange("date_of_birth", v)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Telefon"
            placeholder="+387 61 123 456"
            value={form.phone || ""}
            onChange={(v) => handleChange("phone", v)}
          />
          <FormField
            label="Email"
            type="email"
            placeholder="pacijent@email.com"
            value={form.email || ""}
            onChange={(v) => handleChange("email", v)}
          />
        </div>
        <FormField
          label="Adresa"
          placeholder="Ul. Maršala Tita 1, 71000 Sarajevo"
          value={form.address || ""}
          onChange={(v) => handleChange("address", v)}
        />

        {error && (
          <p className="text-xs text-aimed-red">{error}</p>
        )}

        <div className="pt-2 flex justify-end">
          {onCancel && (
            <Button type="button" variant="secondary" size="md" onClick={onCancel} className="mr-3">
              Otkaži
            </Button>
          )}
          <Button type="submit" size="md" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? "Čuvanje..." : submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function FormField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-aimed-gray-500">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-aimed-gray-200 px-3 py-2 text-sm text-aimed-black placeholder:text-aimed-gray-400 outline-none transition-colors duration-200 focus:border-aimed-black"
      />
    </div>
  );
}
