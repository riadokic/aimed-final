"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { saveSettings, loadSettings } from "@/lib/report-storage";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { ClinicInfo } from "@/types/aimed";

const PROFILE_COMPLETED_KEY = "aimed_profile_completed";
const DEFAULT_CATEGORIES = ["ANAMNEZA", "STATUS", "DIJAGNOZA", "TERAPIJA", "PREPORUKE"];
const TOTAL_STEPS = 4;

// ── Gate (unchanged detection logic) ──

export function ProfileCompletionGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [needsCompletion, setNeedsCompletion] = useState<boolean | null>(null);
  const [initialData, setInitialData] = useState<{
    fullName: string;
    specialization: string;
    clinicName: string;
    reportCategories: string[];
    clinicInfo: ClinicInfo;
  } | null>(null);

  useEffect(() => {
    if (!user) return;

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

    const supabase = createClient();
    supabase
      .from("profiles")
      .select("full_name, specialization, clinic_name, report_categories, clinic_info")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (!data) {
          setNeedsCompletion(true);
          const meta = user.user_metadata;
          setInitialData({
            fullName: meta?.full_name || meta?.name || "",
            specialization: "",
            clinicName: "",
            reportCategories: DEFAULT_CATEGORIES,
            clinicInfo: {},
          });
          return;
        }

        const hasProfile = data.specialization && data.clinic_name;
        if (hasProfile) {
          markCompleted(user.id);
          syncToLocalStorage(data.full_name, data.specialization, data.clinic_name);
          setNeedsCompletion(false);
        } else {
          setInitialData({
            fullName: data.full_name || user.user_metadata?.name || "",
            specialization: data.specialization || "",
            clinicName: data.clinic_name || "",
            reportCategories:
              Array.isArray(data.report_categories) && data.report_categories.length > 0
                ? data.report_categories
                : DEFAULT_CATEGORIES,
            clinicInfo:
              data.clinic_info && typeof data.clinic_info === "object"
                ? (data.clinic_info as ClinicInfo)
                : {},
          });
          setNeedsCompletion(true);
        }
      });
  }, [user]);

  if (needsCompletion === null) return null;
  if (!needsCompletion) return <>{children}</>;

  return (
    <OnboardingWizard
      userId={user!.id}
      initial={initialData!}
      onComplete={() => setNeedsCompletion(false)}
    />
  );
}

// ── Wizard ──

interface WizardProps {
  userId: string;
  initial: {
    fullName: string;
    specialization: string;
    clinicName: string;
    reportCategories: string[];
    clinicInfo: ClinicInfo;
  };
  onComplete: () => void;
}

function OnboardingWizard({ userId, initial, onComplete }: WizardProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1 — Doctor info
  const [fullName, setFullName] = useState(initial.fullName);
  const [specialization, setSpecialization] = useState(initial.specialization);

  // Step 2 — Clinic info
  const [clinicName, setClinicName] = useState(initial.clinicName);
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo>(initial.clinicInfo);

  // Step 3 — Report categories
  const [categories, setCategories] = useState<string[]>(initial.reportCategories);
  const [newCategory, setNewCategory] = useState("");

  // Step 4 — Branding
  const [brandingLogoUrl, setBrandingLogoUrl] = useState<string | null>(null);
  const [brandingStampUrl, setBrandingStampUrl] = useState<string | null>(null);
  const [brandingSignatureUrl, setBrandingSignatureUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  // ── Navigation ──

  function goNext() {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else finish();
  }

  function goBack() {
    if (step > 1) setStep(step - 1);
  }

  function skip() {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else finish();
  }

  async function finish() {
    setSaving(true);
    try {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          specialization,
          clinic_name: clinicName || null,
          clinic_info: clinicInfo,
          report_categories: categories,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      syncToLocalStorage(fullName, specialization, clinicName);
      markCompleted(userId);
      toast("Profil uspješno postavljen", "success");
      onComplete();
    } catch {
      toast("Greška pri spremanju. Pokušajte ponovo.", "error");
    } finally {
      setSaving(false);
    }
  }

  // ── Category handlers ──

  function handleAddCategory() {
    const trimmed = newCategory.trim().toUpperCase();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      toast("Ova sekcija već postoji", "info");
      return;
    }
    setCategories((prev) => [...prev, trimmed]);
    setNewCategory("");
  }

  function handleRemoveCategory(index: number) {
    setCategories((prev) => prev.filter((_, i) => i !== index));
  }

  function handleMoveCategory(index: number, direction: "up" | "down") {
    setCategories((prev) => {
      const arr = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  }

  // ── Branding upload ──

  const handleBrandingUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "stamp" | "signature") => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";

      if (!file.type.startsWith("image/")) {
        toast("Samo slike su podržane (PNG, JPG, WebP, SVG)", "error");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast("Maksimalna veličina: 2 MB", "error");
        return;
      }

      setUploading(type);
      try {
        const supabase = createClient();
        const ext = file.name.split(".").pop() || "png";
        const path = `${userId}/${type}.${ext}`;

        await supabase.storage.from("branding").remove([path]);

        const { error: uploadError } = await supabase.storage
          .from("branding")
          .upload(path, file, { upsert: true });
        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("branding").getPublicUrl(path);

        const url = `${publicUrl}?t=${Date.now()}`;

        const column = `branding_${type}_url` as const;
        await supabase
          .from("profiles")
          .update({ [column]: url, updated_at: new Date().toISOString() })
          .eq("id", userId);

        if (type === "logo") setBrandingLogoUrl(url);
        else if (type === "stamp") setBrandingStampUrl(url);
        else setBrandingSignatureUrl(url);

        toast(
          `${type === "logo" ? "Logo" : type === "stamp" ? "Pečat" : "Potpis"} učitan`,
          "success",
        );
      } catch {
        toast("Greška pri uploadu. Pokušajte ponovo.", "error");
      } finally {
        setUploading(null);
      }
    },
    [userId],
  );

  // ── Validation per step ──

  const canProceed =
    step === 1
      ? fullName.trim() !== "" && specialization.trim() !== ""
      : step === 3
        ? categories.length > 0
        : true;

  const isOptional = step === 2 || step === 4;
  const isLastStep = step === TOTAL_STEPS;

  // ── Render ──

  const inputClass =
    "w-full rounded-lg border border-aimed-gray-200 px-3 py-2.5 text-sm text-aimed-black placeholder:text-aimed-gray-400 outline-none transition-colors duration-200 focus:border-aimed-black";

  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center bg-aimed-white overflow-y-auto py-8">
      <div className="mx-4 w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aimed-black">
              <span className="text-sm font-bold text-white">A</span>
            </div>
            <span className="text-xl font-semibold text-aimed-black tracking-tight">AiMED</span>
          </div>
        </div>

        {/* Step dots */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i + 1 === step
                  ? "w-6 bg-aimed-black"
                  : i + 1 < step
                    ? "w-2 bg-aimed-black"
                    : "w-2 bg-aimed-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-aimed-gray-200 bg-aimed-white p-6 sm:p-8 shadow-sm">
          {/* Step 1 — Doctor info */}
          {step === 1 && (
            <>
              <StepHeader
                icon={<DoctorIcon className="h-6 w-6 text-aimed-blue" />}
                title="Podaci o ljekaru"
                subtitle="Osnovno o Vama — ovo je obavezno."
              />
              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-aimed-gray-500">
                    Ime i prezime
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Marko Marković"
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
                    className={inputClass}
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 2 — Clinic info */}
          {step === 2 && (
            <>
              <StepHeader
                icon={<BuildingIcon className="h-6 w-6 text-aimed-blue" />}
                title="Podaci o ordinaciji"
                subtitle="Koriste se u zaglavlju nalaza. Možete preskočiti i podesiti kasnije."
              />
              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-aimed-gray-500">
                    Naziv klinike / ordinacije
                  </label>
                  <input
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder="Opća bolnica Sarajevo"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-aimed-gray-500">
                    Adresa
                  </label>
                  <input
                    type="text"
                    value={clinicInfo.address || ""}
                    onChange={(e) => setClinicInfo((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Ul. Maršala Tita 1, 71000 Sarajevo"
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-aimed-gray-500">
                      Telefon
                    </label>
                    <input
                      type="text"
                      value={clinicInfo.phone || ""}
                      onChange={(e) => setClinicInfo((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+387 33 123 456"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-aimed-gray-500">
                      Web stranica
                    </label>
                    <input
                      type="text"
                      value={clinicInfo.website || ""}
                      onChange={(e) => setClinicInfo((p) => ({ ...p, website: e.target.value }))}
                      placeholder="www.ordinacija.ba"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 3 — Report sections */}
          {step === 3 && (
            <>
              <StepHeader
                icon={<ListIcon className="h-6 w-6 text-aimed-blue" />}
                title="Sekcije nalaza"
                subtitle="Definirajte koje sekcije AI treba generisati u nalazu."
              />
              <div className="flex flex-col gap-2">
                {categories.map((cat, i) => (
                  <div
                    key={`${cat}-${i}`}
                    className="flex items-center gap-2 rounded-lg border border-aimed-gray-200 bg-aimed-white px-3 py-2"
                  >
                    <span className="flex-1 text-sm text-aimed-black">{cat}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveCategory(i, "up")}
                        disabled={i === 0}
                        className="rounded p-1 text-aimed-gray-400 transition-colors hover:bg-aimed-gray-100 hover:text-aimed-black disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ChevronUpIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveCategory(i, "down")}
                        disabled={i === categories.length - 1}
                        className="rounded p-1 text-aimed-gray-400 transition-colors hover:bg-aimed-gray-100 hover:text-aimed-black disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ChevronDownIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(i)}
                        className="rounded p-1 text-aimed-gray-400 transition-colors hover:bg-aimed-red-light hover:text-aimed-red"
                      >
                        <CloseIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                    placeholder="Nova sekcija..."
                    className="flex-1 rounded-lg border border-aimed-gray-200 px-3 py-2 text-sm text-aimed-black placeholder:text-aimed-gray-400 outline-none transition-colors duration-200 focus:border-aimed-black"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleAddCategory}
                    disabled={!newCategory.trim()}
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                    Dodaj
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Step 4 — Branding */}
          {step === 4 && (
            <>
              <StepHeader
                icon={<ImageIcon className="h-6 w-6 text-aimed-blue" />}
                title="Branding nalaza"
                subtitle="Učitajte logo, pečat i potpis za nalaze. Možete preskočiti i podesiti kasnije."
              />
              <div className="grid grid-cols-3 gap-4">
                <BrandingSlot
                  label="Logo"
                  imageUrl={brandingLogoUrl}
                  isUploading={uploading === "logo"}
                  onUpload={(e) => handleBrandingUpload(e, "logo")}
                />
                <BrandingSlot
                  label="Pečat"
                  imageUrl={brandingStampUrl}
                  isUploading={uploading === "stamp"}
                  onUpload={(e) => handleBrandingUpload(e, "stamp")}
                />
                <BrandingSlot
                  label="Potpis"
                  imageUrl={brandingSignatureUrl}
                  isUploading={uploading === "signature"}
                  onUpload={(e) => handleBrandingUpload(e, "signature")}
                />
              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-6 flex items-center gap-3">
            {step > 1 && (
              <Button variant="ghost" size="sm" onClick={goBack}>
                <ArrowLeftIcon className="h-3.5 w-3.5" />
                Nazad
              </Button>
            )}
            <div className="flex-1" />
            {isOptional && (
              <Button variant="ghost" size="sm" onClick={skip} disabled={saving}>
                Preskoči
              </Button>
            )}
            <Button
              onClick={isLastStep ? finish : goNext}
              disabled={!canProceed || saving}
              size="md"
            >
              {saving
                ? "Spremam..."
                : isLastStep
                  ? "Završi"
                  : "Dalje"}
            </Button>
          </div>
        </div>

        {/* Hint */}
        <p className="mt-4 text-center text-[11px] text-aimed-gray-400">
          Sve se može promijeniti kasnije u Postavkama.
        </p>
      </div>
    </div>
  );
}

// ── Step Header ──

function StepHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-aimed-blue-light mx-auto mb-3">
        {icon}
      </div>
      <h1 className="text-center text-base font-semibold text-aimed-black mb-1">{title}</h1>
      <p className="text-center text-xs text-aimed-gray-400">{subtitle}</p>
    </div>
  );
}

// ── Branding Slot ──

function BrandingSlot({
  label,
  imageUrl,
  isUploading,
  onUpload,
}: {
  label: string;
  imageUrl: string | null;
  isUploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-medium text-aimed-gray-500">{label}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={onUpload}
        className="hidden"
      />
      {imageUrl ? (
        <div
          className="h-20 w-20 rounded-xl border border-aimed-gray-200 bg-aimed-white p-1.5 flex items-center justify-center overflow-hidden cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          <img src={imageUrl} alt={label} className="max-h-full max-w-full object-contain" />
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-aimed-gray-200 bg-aimed-white text-aimed-gray-400 transition-colors hover:border-aimed-gray-400 hover:text-aimed-black disabled:opacity-50"
        >
          {isUploading ? (
            <SpinnerIcon className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <UploadIcon className="h-4 w-4" />
              <span className="text-[10px]">Učitaj</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ── Helpers ──

function markCompleted(userId: string) {
  try {
    localStorage.setItem(
      PROFILE_COMPLETED_KEY,
      JSON.stringify({ userId, completedAt: new Date().toISOString() }),
    );
  } catch { /* ignore */ }
}

function syncToLocalStorage(
  fullName: string | null,
  specialization: string | null,
  clinicName: string | null,
) {
  const current = loadSettings();
  saveSettings({
    ...current,
    doctorName: fullName || current.doctorName,
    specialty: specialization || current.specialty,
    clinicName: clinicName || current.clinicName,
  });
}

// ── Icons ──

function DoctorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );
}

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
