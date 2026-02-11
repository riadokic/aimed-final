"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  loadSettings,
  saveSettings,
  clearHistory,
  loadHistory,
  type AppSettings,
} from "@/lib/report-storage";
import { toast } from "@/components/ui/toast";
import { formatBosnianDate } from "@/lib/utils";
import { generatePdfBlob } from "@/lib/pdf-generator";
import { clearAllData, loadConsent, revokeConsent } from "@/lib/gdpr";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function PostavkePage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);
  const [consentDate, setConsentDate] = useState<string | null>(null);
  const templateInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const localSettings = loadSettings();
    setSettings(localSettings);
    const consent = loadConsent();
    if (consent?.acceptedAt) setConsentDate(consent.acceptedAt);

    // Sync profile from Supabase if local fields are empty
    if (user && (!localSettings.doctorName && !localSettings.specialty)) {
      const supabase = createClient();
      supabase
        .from("profiles")
        .select("full_name, specialization, clinic_name")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            const merged = {
              ...localSettings,
              doctorName: localSettings.doctorName || data.full_name || "",
              specialty: localSettings.specialty || data.specialization || "",
              clinicName: localSettings.clinicName || data.clinic_name || "",
            };
            setSettings(merged);
            saveSettings(merged);
          }
        });
    }
  }, [user]);

  function handleChange<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  }

  async function handleSave() {
    if (!settings) return;
    saveSettings(settings);
    setSaved(true);
    toast("Postavke sačuvane", "success");

    // Sync profile fields to Supabase for cross-session persistence
    if (user) {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({
          full_name: settings.doctorName,
          specialization: settings.specialty,
          clinic_name: settings.clinicName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }
  }

  async function handleExportZip() {
    setZipLoading(true);
    try {
      const JSZip = (await import("jszip")).default;
      const { saveAs } = await import("file-saver");
      const history = loadHistory();
      if (history.length === 0) {
        toast("Nema nalaza za izvoz", "info");
        return;
      }

      const currentSettings = settings ?? loadSettings();
      const zip = new JSZip();

      for (const entry of history) {
        const patientName = entry.patient.name || "Nepoznat_pacijent";
        const safeName = patientName
          .replace(/[^a-zA-Z0-9\u010d\u0107\u017e\u0161\u0111\u010c\u0106\u017d\u0160\u0110\s_-]/g, "")
          .replace(/\s+/g, "_");
        const date = formatBosnianDate(entry.createdAt)
          .replace(/\./g, "-")
          .replace(/-$/, "");

        const pdfBlob = await generatePdfBlob({
          sections: entry.sections,
          patient: entry.patient,
          mode: entry.mode,
          clinicName: currentSettings.clinicName || undefined,
          doctorName: currentSettings.doctorName || undefined,
        });

        zip.file(`${safeName}/${date}_Nalaz.pdf`, pdfBlob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `aimed_export_${new Date().toISOString().slice(0, 10)}.zip`);
      toast("ZIP arhiva izvezena", "success");
    } catch {
      toast("Greška pri generisanju ZIP-a", "error");
    } finally {
      setZipLoading(false);
    }
  }

  function handleClearHistory() {
    clearHistory();
    setShowClearConfirm(false);
    toast("Historija obrisana", "info");
  }

  async function handleDeleteAllData() {
    setShowDeleteAllConfirm(false);
    // Clear all localStorage data first
    clearAllData();
    revokeConsent();
    try { localStorage.removeItem("aimed_profile_completed"); } catch { /* ignore */ }
    // Navigate immediately, then sign out in background
    router.push("/login");
    router.refresh();
    try { await signOut(); } catch { /* ignore signOut errors during cleanup */ }
  }

  function handleTemplateUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".docx")) {
      toast("Samo .docx fajlovi su podržani", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setSettings((prev) =>
        prev
          ? { ...prev, templateDocxBase64: base64, templateDocxName: file.name }
          : prev
      );
      setSaved(false);
      toast("Šablon učitan", "success");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleRemoveTemplate() {
    setSettings((prev) =>
      prev ? { ...prev, templateDocxBase64: "", templateDocxName: "" } : prev
    );
    setSaved(false);
  }

  if (!settings) return null;

  return (
    <>
      <Header title="Postavke" description="Konfigurirajte aplikaciju prema vašim potrebama" />
      <div className="px-8 py-8">
        <div className="mx-auto max-w-2xl flex flex-col gap-6">

          {/* Doctor Info */}
          <Card>
            <div className="mb-5 flex items-center gap-2">
              <DoctorIcon className="h-4 w-4 text-aimed-gray-500" />
              <p className="text-xs font-semibold uppercase tracking-wider text-aimed-gray-500">
                Podaci o ljekaru
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SettingsField
                label="Ime i prezime"
                placeholder="Dr. Marko Marković"
                value={settings.doctorName}
                onChange={(v) => handleChange("doctorName", v)}
              />
              <SettingsField
                label="Specijalnost"
                placeholder="Internista"
                value={settings.specialty}
                onChange={(v) => handleChange("specialty", v)}
              />
              <SettingsField
                label="Naziv klinike / ordinacije"
                placeholder="Opća bolnica Sarajevo"
                value={settings.clinicName}
                onChange={(v) => handleChange("clinicName", v)}
                className="col-span-2"
              />
            </div>
          </Card>

          {/* Template Upload */}
          <Card>
            <div className="mb-5 flex items-center gap-2">
              <TemplateIcon className="h-4 w-4 text-aimed-gray-500" />
              <p className="text-xs font-semibold uppercase tracking-wider text-aimed-gray-500">
                Word šablon (.docx)
              </p>
            </div>
            <p className="mb-4 text-xs text-aimed-gray-400">
              Učitajte vaš Word šablon koji će se koristiti za sve Word eksporte. Šablon bi trebao sadržavati strukturu nalaza koju želite.
            </p>
            <input
              ref={templateInputRef}
              type="file"
              accept=".docx"
              onChange={handleTemplateUpload}
              className="hidden"
            />
            {settings.templateDocxName ? (
              <div className="flex items-center gap-3 rounded-lg border border-aimed-gray-200 px-4 py-3">
                <DocxIcon className="h-5 w-5 text-aimed-blue" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-aimed-black truncate">{settings.templateDocxName}</p>
                  <p className="text-xs text-aimed-gray-400">Šablon učitan</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => templateInputRef.current?.click()}>
                    Zamijeni
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRemoveTemplate} className="text-aimed-red hover:text-aimed-red">
                    Ukloni
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => templateInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-aimed-gray-300 py-4 text-sm text-aimed-gray-500 transition-colors hover:border-aimed-gray-400 hover:text-aimed-black"
              >
                <UploadIcon className="h-4 w-4" />
                Učitaj .docx šablon
              </button>
            )}
          </Card>

          {/* App Settings */}
          <Card>
            <div className="mb-5 flex items-center gap-2">
              <GearIcon className="h-4 w-4 text-aimed-gray-500" />
              <p className="text-xs font-semibold uppercase tracking-wider text-aimed-gray-500">
                Aplikacija
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <ToggleField
                label="Automatski kopiraj za HIS"
                description="Kada nalaz bude gotov, automatski kopiraj tekst u clipboard"
                checked={settings.autoCopyHIS}
                onChange={(v) => handleChange("autoCopyHIS", v)}
              />
              <div>
                <label className="mb-1 block text-xs font-medium text-aimed-gray-500">
                  Preferirani format izvoza
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="exportFormat"
                      checked={settings.preferredExport === "pdf"}
                      onChange={() => handleChange("preferredExport", "pdf")}
                      className="accent-aimed-black"
                    />
                    <span className="text-sm text-aimed-black">PDF</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="exportFormat"
                      checked={settings.preferredExport === "word"}
                      onChange={() => handleChange("preferredExport", "word")}
                      className="accent-aimed-black"
                    />
                    <span className="text-sm text-aimed-black">Word (.docx)</span>
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* Data Management */}
          <Card>
            <div className="mb-5 flex items-center gap-2">
              <ShieldIcon className="h-4 w-4 text-aimed-gray-500" />
              <p className="text-xs font-semibold uppercase tracking-wider text-aimed-gray-500">
                Sigurnost i podaci
              </p>
            </div>
            <p className="mb-4 text-xs text-aimed-gray-400">
              Svi podaci se čuvaju lokalno na vašem uređaju. Ništa se ne šalje na server.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" size="sm" onClick={handleExportZip} disabled={zipLoading}>
                <ZipIcon className="h-3.5 w-3.5" />
                {zipLoading ? "Generišem..." : "Izvezi sve (ZIP)"}
              </Button>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-aimed-red/30 bg-aimed-red-light px-3 py-1.5 text-xs font-medium text-aimed-red transition-colors duration-200 hover:border-aimed-red/50 hover:bg-aimed-red/10"
              >
                <TrashIcon className="h-3.5 w-3.5" />
                Obriši cijelu historiju
              </button>
            </div>
          </Card>

          {/* GDPR & Privacy */}
          <Card>
            <div className="mb-5 flex items-center gap-2">
              <PrivacyIcon className="h-4 w-4 text-aimed-gray-500" />
              <p className="text-xs font-semibold uppercase tracking-wider text-aimed-gray-500">
                Privatnost i GDPR
              </p>
            </div>

            {consentDate && (
              <p className="mb-4 text-xs text-aimed-gray-400">
                Saglasnost prihvaćena: {formatBosnianDate(consentDate)}
              </p>
            )}

            <div className="space-y-3">
              <p className="text-xs text-aimed-gray-400 leading-relaxed">
                Vaši medicinski podaci se čuvaju isključivo na Vašem uređaju.
                Audio snimci se automatski brišu odmah nakon transkripcije.
                Imate pravo na brisanje svih podataka u bilo kom trenutku.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowDeleteAllConfirm(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-aimed-red/30 bg-aimed-red-light px-3 py-1.5 text-xs font-medium text-aimed-red transition-colors duration-200 hover:border-aimed-red/50 hover:bg-aimed-red/10"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  Obriši SVE moje podatke
                </button>
              </div>
            </div>
          </Card>

          {/* Delete All Data Confirmation Modal */}
          {showDeleteAllConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowDeleteAllConfirm(false)}>
              <div className="mx-4 w-full max-w-sm rounded-2xl bg-aimed-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-aimed-red-light mx-auto mb-4">
                  <TrashIcon className="h-6 w-6 text-aimed-red" />
                </div>
                <h3 className="text-center text-sm font-semibold text-aimed-black mb-2">
                  Obrisati SVE podatke?
                </h3>
                <p className="text-center text-xs text-aimed-gray-400 mb-6">
                  Ova radnja je nepovratna. Svi Vaši nalazi, postavke, saglasnost i lokalni podaci će biti trajno obrisani. Bićete odjavljeni.
                </p>
                <div className="flex gap-3">
                  <Button variant="secondary" className="flex-1" size="sm" onClick={() => setShowDeleteAllConfirm(false)}>
                    Otkaži
                  </Button>
                  <Button variant="danger" className="flex-1" size="sm" onClick={handleDeleteAllData}>
                    Obriši sve i odjavi me
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Clear Confirmation Modal */}
          {showClearConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowClearConfirm(false)}>
              <div className="mx-4 w-full max-w-sm rounded-2xl bg-aimed-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-aimed-red-light mx-auto mb-4">
                  <TrashIcon className="h-6 w-6 text-aimed-red" />
                </div>
                <h3 className="text-center text-sm font-semibold text-aimed-black mb-2">
                  Obrisati cijelu historiju?
                </h3>
                <p className="text-center text-xs text-aimed-gray-400 mb-6">
                  Ova radnja se ne može poništiti. Svi sačuvani nalazi će biti trajno obrisani.
                </p>
                <div className="flex gap-3">
                  <Button variant="secondary" className="flex-1" size="sm" onClick={() => setShowClearConfirm(false)}>
                    Otkaži
                  </Button>
                  <Button variant="danger" className="flex-1" size="sm" onClick={handleClearHistory}>
                    Obriši sve
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Save */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saved}>
              {saved ? "Sačuvano" : "Sačuvaj postavke"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Field Components ──

function SettingsField({
  label,
  placeholder,
  value,
  onChange,
  className,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium text-aimed-gray-500">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-aimed-gray-200 px-3 py-2 text-sm text-aimed-black placeholder:text-aimed-gray-400 outline-none transition-colors duration-200 focus:border-aimed-black"
      />
    </div>
  );
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-aimed-black">{label}</p>
        <p className="text-xs text-aimed-gray-400">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
          checked ? "bg-aimed-black" : "bg-aimed-gray-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

// ── Icons ──

function DoctorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

function GearIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function PrivacyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}

function TemplateIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
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

function DocxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

function ZipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
  );
}
