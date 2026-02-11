"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { saveSettings, loadSettings } from "@/lib/report-storage";

const PROFILE_COMPLETED_KEY = "aimed_profile_completed";

export function ProfileCompletionGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [needsCompletion, setNeedsCompletion] = useState<boolean | null>(null);
  const [fullName, setFullName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Check if this user already completed their profile in this browser
    try {
      const completed = localStorage.getItem(PROFILE_COMPLETED_KEY);
      if (completed) {
        const parsed = JSON.parse(completed);
        if (parsed.userId === user.id) {
          setNeedsCompletion(false);
          return;
        }
      }
    } catch { /* ignore */ }

    // Check Supabase profile for missing fields
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("full_name, specialization, clinic_name")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (!data) {
          setNeedsCompletion(true);
          // Pre-fill from Google user metadata
          const meta = user.user_metadata;
          setFullName(meta?.full_name || meta?.name || "");
          return;
        }

        const hasProfile = data.specialization && data.clinic_name;
        if (hasProfile) {
          // Profile complete — mark as done and sync to localStorage
          markCompleted(user.id);
          syncToLocalStorage(data.full_name, data.specialization, data.clinic_name);
          setNeedsCompletion(false);
        } else {
          // Profile incomplete — show modal
          setFullName(data.full_name || user.user_metadata?.name || "");
          setSpecialization(data.specialization || "");
          setClinicName(data.clinic_name || "");
          setNeedsCompletion(true);
        }
      });
  }, [user]);

  if (needsCompletion === null) return null;
  if (!needsCompletion) return <>{children}</>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const supabase = createClient();

    // Update Supabase profile
    await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        specialization,
        clinic_name: clinicName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    // Sync to localStorage
    syncToLocalStorage(fullName, specialization, clinicName);
    markCompleted(user.id);

    setSaving(false);
    setNeedsCompletion(false);
  }

  const inputClass =
    "w-full rounded-lg border border-aimed-gray-200 px-3 py-2.5 text-sm text-aimed-black placeholder:text-aimed-gray-400 outline-none transition-colors duration-200 focus:border-aimed-black";

  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center bg-aimed-white">
      <div className="mx-4 w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aimed-black">
              <span className="text-sm font-bold text-white">A</span>
            </div>
            <span className="text-xl font-semibold text-aimed-black tracking-tight">AiMED</span>
          </div>
        </div>

        <div className="rounded-2xl border border-aimed-gray-200 bg-aimed-white p-6 sm:p-8 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-aimed-blue-light mx-auto mb-4">
            <DoctorIcon className="h-6 w-6 text-aimed-blue" />
          </div>
          <h1 className="text-center text-base font-semibold text-aimed-black mb-1">
            Dovršite Vaš profil
          </h1>
          <p className="text-center text-xs text-aimed-gray-400 mb-6">
            Trebamo još par podataka da bismo personalizirali Vaše nalaze.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-aimed-gray-500">
                Ime i prezime
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Marko Marković"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-aimed-gray-500">
                Specijalizacija
              </label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="Internista"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-aimed-gray-500">
                Bolnica / Ordinacija
              </label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="Opća bolnica Sarajevo"
                required
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-aimed-black px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-aimed-gray-900 disabled:opacity-50"
            >
              {saving ? "Spremam..." : "Sačuvaj i nastavi"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function markCompleted(userId: string) {
  try {
    localStorage.setItem(
      PROFILE_COMPLETED_KEY,
      JSON.stringify({ userId, completedAt: new Date().toISOString() })
    );
  } catch { /* ignore */ }
}

function syncToLocalStorage(
  fullName: string | null,
  specialization: string | null,
  clinicName: string | null
) {
  const current = loadSettings();
  saveSettings({
    ...current,
    doctorName: fullName || current.doctorName,
    specialty: specialization || current.specialty,
    clinicName: clinicName || current.clinicName,
  });
}

function DoctorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}
