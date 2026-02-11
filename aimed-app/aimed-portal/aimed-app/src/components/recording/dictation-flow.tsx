"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton";
import { LiveWaveform } from "@/components/recording/live-waveform";
import { SectionCard } from "@/components/report/section-card";
import { useAudioRecorder, isDurationWarning } from "@/hooks/use-audio-recorder";
import { useAimedApi } from "@/hooks/use-aimed-api";
import { sectionsToPlainText } from "@/lib/report-parser";
import type { PatientInfo } from "@/lib/pdf-generator";
import { useAimedExport } from "@/hooks/use-aimed-export";
import { saveDraft, loadDraft, clearDraft, saveToHistory } from "@/lib/report-storage";
import type { ReportMode, UploadedReport, ReportSection } from "@/types/aimed";

const SKELETON_SECTIONS = ["ANAMNEZA", "STATUS", "DIJAGNOZA", "TERAPIJA", "PREPORUKE"];
const STANDARD_SECTIONS = ["ANAMNEZA", "STATUS", "DIJAGNOZA", "TERAPIJA", "PREPORUKE"];
const MIN_DURATION = 2;

/** Sections the AI sometimes hallucinates that we filter out */
const FILTERED_SECTIONS = ["PODACI O PACIJENTU", "DATUM PREGLEDA"];

const emptyPatient: PatientInfo = { name: "", dateOfBirth: "", jmbg: "", contact: "" };

// ── Motion variants ──

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3, ease: "easeOut" as const },
};

const staggerChildren = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const sectionVariant = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

/** Normalize a section title for matching: uppercase, strip trailing colons/punctuation/whitespace */
function normalizeTitle(title: string): string {
  return title.toUpperCase().replace(/[\s:./\-]+$/g, "").trim();
}

/** Auto-format date input: inserts dots after DD and MM */
function formatDateInput(value: string): string {
  const digits = value.replace(/[^\d]/g, "");
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 8)}`;
}

interface DictationFlowProps {
  mode: ReportMode;
  uploadedFile: UploadedReport | null;
  onReset: () => void;
}

export function DictationFlow({ mode, uploadedFile, onReset }: DictationFlowProps) {
  const [focusedSection, setFocusedSection] = useState<number | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const submittedRef = useRef(false);

  const recorder = useAudioRecorder();
  const api = useAimedApi();
  const { exportPdf, exportWord, pdfLoading, wordLoading } = useAimedExport();

  const [editedSections, setEditedSections] = useState<ReportSection[]>([]);
  const [patient, setPatient] = useState<PatientInfo>(emptyPatient);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");

  // Restore draft on mount (to survive refresh) — for "new" mode, reset patient data
  useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.sections.length > 0) {
      setEditedSections(draft.sections);
      // Only restore patient data if NOT starting fresh
      if (mode !== "new") {
        setPatient(draft.patient);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When API returns report, seed editable sections (Smart Section Merger)
  useEffect(() => {
    if (api.report) {
      const received = api.report.sections;

      // Filter out hallucinated/redundant sections
      const filtered = received.filter(
        (s) => !FILTERED_SECTIONS.includes(normalizeTitle(s.title))
      );

      // Standard sections first (case-insensitive + punctuation-stripped matching)
      const merged: ReportSection[] = STANDARD_SECTIONS.map((title) => {
        const found = filtered.find((s) => normalizeTitle(s.title) === title);
        return found ? { title, content: found.content } : { title, content: "" };
      });

      // Append dynamic sections not in the standard list
      filtered.forEach((s) => {
        const norm = normalizeTitle(s.title);
        if (!STANDARD_SECTIONS.includes(norm)) {
          merged.push({ ...s });
        }
      });

      setEditedSections(merged);
    }
  }, [api.report]);

  // Auto-persist to localStorage (debounced)
  useEffect(() => {
    if (editedSections.length === 0) return;
    const timer = setTimeout(() => {
      saveDraft({ sections: editedSections, patient, mode });
    }, 500);
    return () => clearTimeout(timer);
  }, [editedSections, patient, mode]);

  // Auto-start recording on mount
  useEffect(() => {
    recorder.startRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When audioBlob is produced, auto-submit to API
  const handleBlobReady = useCallback(() => {
    if (recorder.audioBlob && !submittedRef.current) {
      submittedRef.current = true;
      api.submit(recorder.audioBlob, { mode });
    }
  }, [recorder.audioBlob, api, mode]);

  useEffect(() => {
    handleBlobReady();
  }, [handleBlobReady]);

  function handleStopRecording() {
    if (recorder.duration < MIN_DURATION) return;
    recorder.stopRecording();
  }

  function handleReset() {
    recorder.resetRecording();
    api.reset();
    submittedRef.current = false;
    setFocusedSection(null);
    setEditedSections([]);
    setPatient(emptyPatient);
    clearDraft();
    onReset();
  }

  function handleRetry() {
    if (recorder.audioBlob) {
      const blob = recorder.audioBlob;
      api.reset();
      submittedRef.current = true;
      api.submit(blob, { mode });
    }
  }

  function handleSectionEdit(index: number, newContent: string) {
    setEditedSections((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], content: newContent };
      return updated;
    });
  }

  function handleAddCustomSection() {
    const title = newSectionTitle.trim().toUpperCase();
    if (!title) return;
    // Don't allow duplicates of standard sections
    if (STANDARD_SECTIONS.includes(title)) return;
    // Don't allow duplicates of already-added custom sections
    if (editedSections.some((s) => normalizeTitle(s.title) === title)) return;
    setEditedSections((prev) => [...prev, { title, content: "" }]);
    setNewSectionTitle("");
    setShowAddSection(false);
  }

  function handleRemoveCustomSection(index: number) {
    // Only allow removing non-standard sections
    const section = editedSections[index];
    if (STANDARD_SECTIONS.includes(normalizeTitle(section.title))) return;
    setEditedSections((prev) => prev.filter((_, i) => i !== index));
  }

  function handlePatientChange(field: keyof PatientInfo, value: string) {
    setPatient((prev) => ({ ...prev, [field]: value }));
  }

  function handleDateChange(value: string) {
    setPatient((prev) => ({ ...prev, dateOfBirth: formatDateInput(value) }));
  }

  async function handleCopyForHIS() {
    const text = sectionsToPlainText(editedSections);
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      // Fallback: ignored for now
    }
  }

  async function handleDownloadPdf() {
    await exportPdf(editedSections, patient);
    saveToHistory({ sections: editedSections, patient, mode });
  }

  async function handleDownloadWord() {
    await exportWord(editedSections, patient);
    saveToHistory({ sections: editedSections, patient, mode });
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  const isUpdate = mode === "update";

  // ── Determine which state to render ──
  type FlowState = "mic-error" | "api-error" | "recording" | "processing" | "editing";
  let flowState: FlowState = "recording";

  if (recorder.error) flowState = "mic-error";
  else if (api.state === "error") flowState = "api-error";
  else if (recorder.isRecording || (!recorder.audioBlob && api.state === "idle")) flowState = "recording";
  else if (api.state !== "done") flowState = "processing";
  else flowState = "editing";

  return (
    <AnimatePresence mode="wait">
      {flowState === "mic-error" && (
        <motion.div key="mic-error" {...fadeIn} className="mx-auto max-w-lg">
          <Card className="flex flex-col items-center gap-5 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-aimed-gray-100">
              <MicOffIcon className="h-7 w-7 text-aimed-red" />
            </div>
            <div>
              <p className="text-sm font-semibold text-aimed-black">Greška s mikrofonom</p>
              <p className="mt-2 text-xs leading-relaxed text-aimed-gray-500 max-w-sm">
                {recorder.error}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleReset}>Nazad</Button>
              <Button onClick={() => {
                recorder.resetRecording();
                submittedRef.current = false;
                recorder.startRecording();
              }}>
                Pokušaj ponovo
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {flowState === "api-error" && (
        <motion.div key="api-error" {...fadeIn} className="mx-auto max-w-lg">
          <Card className="flex flex-col items-center gap-5 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-aimed-gray-100">
              <AlertIcon className="h-7 w-7 text-aimed-red" />
            </div>
            <div>
              <p className="text-sm font-semibold text-aimed-black">Greška pri obradi</p>
              <p className="mt-2 text-xs leading-relaxed text-aimed-gray-500 max-w-sm">
                {api.error}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleReset}>Novi pokušaj</Button>
              {recorder.audioBlob && (
                <Button onClick={handleRetry}>Pokušaj ponovo</Button>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {flowState === "recording" && (
        <motion.div key="recording" {...fadeIn} className="mx-auto max-w-lg">
          {isUpdate && uploadedFile && (
            <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-aimed-gray-200 bg-aimed-white px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-aimed-gray-100">
                <DocumentIcon className="h-4 w-4 text-aimed-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-medium text-aimed-black">{uploadedFile.name}</p>
                <p className="text-xs text-aimed-gray-400">Diktirajte izmjene za ovaj nalaz</p>
              </div>
            </div>
          )}

          <Card variant="dark" className="flex flex-col gap-6 py-10">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aimed-red opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-aimed-red" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-aimed-gray-400">
                  {isUpdate ? "Snimanje izmjena" : "Snimanje"}
                </span>
              </div>
              <span className="font-mono text-lg font-semibold tabular-nums text-white">
                {formatTime(recorder.duration)}
              </span>
            </div>

            <LiveWaveform frequencyData={recorder.frequencyData} />

            {isDurationWarning(recorder.duration) && (
              <p className="px-2 text-center text-xs text-aimed-amber">
                Snimak se približava maksimalnom trajanju (10 min).
              </p>
            )}

            <div className="flex gap-3 px-2">
              <Button
                variant="ghost"
                className="flex-1 text-aimed-gray-400 hover:text-white hover:bg-white/10"
                onClick={handleReset}
              >
                Otkaži
              </Button>
              <button
                className="flex-1 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-aimed-black transition-colors duration-200 hover:bg-aimed-gray-100 disabled:opacity-40"
                onClick={handleStopRecording}
                disabled={recorder.duration < MIN_DURATION}
              >
                Završi
              </button>
            </div>
          </Card>
          <p className="mt-4 text-center text-xs text-aimed-gray-400">
            {isUpdate
              ? "Diktirajte samo izmjene — npr. \"Promijeni dijagnozu u...\", \"Dodaj u terapiju...\""
              : "Ne izgovarajte lične podatke pacijenta (ime, JMBG, adresa)."}
          </p>
        </motion.div>
      )}

      {flowState === "processing" && (
        <motion.div key="processing" {...fadeIn} className="mx-auto max-w-2xl">
          <motion.div className="flex flex-col gap-4" {...staggerChildren}>
            {SKELETON_SECTIONS.map((title) => (
              <motion.div key={title} variants={sectionVariant}>
                <SkeletonCard title={title} />
              </motion.div>
            ))}
          </motion.div>
          <p className="mt-6 text-center text-sm text-aimed-gray-400">
            {api.state === "uploading"
              ? "Šaljem snimak..."
              : isUpdate
                ? "Ažuriram nalaz..."
                : "Obrađujem vaš nalaz..."}
          </p>
        </motion.div>
      )}

      {flowState === "editing" && (
        <motion.div key="editing" {...fadeIn} className="mx-auto max-w-2xl">
          {isUpdate && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-aimed-amber-light px-3 py-2">
              <UpdateIcon className="h-4 w-4 text-aimed-amber" />
              <p className="text-xs font-medium text-aimed-amber">
                Ažurirani nalaz — pregledajte izmjene prije preuzimanja
              </p>
            </div>
          )}

          {api.report?.warnings && api.report.warnings.length > 0 && (
            <div className="mb-4 flex flex-col gap-2">
              {api.report.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-aimed-amber-light px-3 py-2">
                  <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-aimed-amber" />
                  <p className="text-xs text-aimed-amber">{w}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mb-6 flex items-center justify-between">
            <Button variant="secondary" size="sm" className="border border-aimed-gray-200" onClick={handleReset}>
              + Novi nalaz
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleCopyForHIS}>
                <ClipboardIcon className="h-3.5 w-3.5" />
                {copyFeedback ? "Kopirano!" : "Kopiraj za HIS"}
              </Button>
              <Button variant="secondary" size="sm" onClick={handleDownloadWord} disabled={wordLoading}>
                <WordIcon className="h-3.5 w-3.5" />
                {wordLoading ? "Generišem..." : "Preuzmi Word"}
              </Button>
              <Button size="sm" onClick={handleDownloadPdf} disabled={pdfLoading}>
                <DownloadIcon className="h-3.5 w-3.5" />
                {pdfLoading ? "Generišem..." : "Preuzmi PDF"}
              </Button>
            </div>
          </div>

          {/* Patient data — at the top, before report sections */}
          <Card className="mb-4">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-aimed-gray-500">
              Podaci o pacijentu
            </p>
            <p className="mb-3 text-xs text-aimed-gray-400">
              Ovi podaci se čuvaju samo na vašem uređaju.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Ime i prezime"
                placeholder="Unesite ime pacijenta"
                value={patient.name}
                onChange={(v) => handlePatientChange("name", v)}
              />
              <InputField
                label="Datum rođenja"
                placeholder="DD.MM.GGGG."
                value={patient.dateOfBirth}
                onChange={handleDateChange}
                maxLength={10}
              />
              <InputField
                label="JMBG"
                placeholder="Opciono"
                value={patient.jmbg}
                onChange={(v) => handlePatientChange("jmbg", v)}
              />
              <InputField
                label="Kontakt"
                placeholder="Opciono"
                value={patient.contact}
                onChange={(v) => handlePatientChange("contact", v)}
              />
            </div>
          </Card>

          <motion.div className="flex flex-col gap-4" {...staggerChildren}>
            {editedSections.map((section, index) => {
              const isCustom = !STANDARD_SECTIONS.includes(normalizeTitle(section.title));
              return (
                <motion.div key={section.title} variants={sectionVariant} className="relative">
                  <SectionCard
                    title={section.title}
                    content={section.content}
                    index={index}
                    isFocused={focusedSection === index}
                    isBlurred={focusedSection !== null && focusedSection !== index}
                    onFocus={setFocusedSection}
                    onBlur={() => setFocusedSection(null)}
                    onChange={handleSectionEdit}
                    showNormalToggle={section.title === "ANAMNEZA" || section.title === "STATUS"}
                  />
                  {isCustom && (
                    <button
                      onClick={() => handleRemoveCustomSection(index)}
                      className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-aimed-gray-100 text-aimed-gray-500 hover:bg-aimed-red-light hover:text-aimed-red transition-colors"
                      title="Ukloni sekciju"
                    >
                      <CloseSmallIcon className="h-3 w-3" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          {/* Add custom section */}
          <div className="mt-4">
            {showAddSection ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Naziv sekcije (npr. NAPOMENA)"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustomSection()}
                  className="flex-1 rounded-lg border border-aimed-gray-200 px-3 py-2 text-sm text-aimed-black placeholder:text-aimed-gray-400 outline-none transition-colors duration-200 focus:border-aimed-black"
                  autoFocus
                />
                <Button size="sm" onClick={handleAddCustomSection} disabled={!newSectionTitle.trim()}>
                  Dodaj
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setShowAddSection(false); setNewSectionTitle(""); }}>
                  Otkaži
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddSection(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-aimed-gray-300 py-3 text-sm text-aimed-gray-500 transition-colors hover:border-aimed-gray-400 hover:text-aimed-black"
              >
                <PlusIcon className="h-4 w-4" />
                Dodaj prilagođenu sekciju
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Input Field (controlled) ──

function InputField({
  label,
  placeholder,
  value,
  onChange,
  maxLength,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-aimed-gray-500">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        className="w-full rounded-lg border border-aimed-gray-200 px-3 py-2 text-sm text-aimed-black placeholder:text-aimed-gray-400 outline-none transition-colors duration-200 focus:border-aimed-black"
      />
    </div>
  );
}

// ── SVG Icons ──

function MicOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m18.364 18.364-3.068-3.068M7.5 7.5l-2.485 2.485m12.97 4.93L7.5 4.5a3 3 0 0 0-3 3v5.25m13.364 5.614A6 6 0 0 1 6 12.75v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 0 2.818-2.015" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

function UpdateIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
    </svg>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function WordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
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

function CloseSmallIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}
