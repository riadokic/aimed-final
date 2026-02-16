"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { DictationFlow } from "@/components/recording/dictation-flow";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PatientForm } from "@/components/patient/patient-form";
import { Card } from "@/components/ui/card";
import { usePatients } from "@/hooks/use-patients";
import { useReports } from "@/hooks/use-reports";
import { cn } from "@/lib/utils";
import { formatBosnianDate } from "@/lib/utils";
import type { ReportMode, Patient, Report } from "@/types/aimed";

const MODES: { key: ReportMode; label: string; description: string }[] = [
  {
    key: "new",
    label: "Kreiraj nalaz",
    description: "Unesite podatke o pacijentu i diktirajte nalaz",
  },
  {
    key: "update",
    label: "Ažuriraj postojeći",
    description: "Pronađite pacijenta i ažurirajte postojeći nalaz",
  },
];

function getInitialMode(params: URLSearchParams): ReportMode {
  const m = params.get("mode");
  if (m === "update") return m;
  return "new";
}

export default function NoviNalazPage() {
  return (
    <Suspense>
      <NoviNalazContent />
    </Suspense>
  );
}

function NoviNalazContent() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<ReportMode>(() => getInitialMode(searchParams));
  const [flowStarted, setFlowStarted] = useState(false);

  // Patient state
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientLoading, setPatientLoading] = useState(false);

  // Update mode: selected report
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const { getPatient } = usePatients();

  // Auto-load patient from ?patient= query param and jump to recording
  const autoStarted = useRef(false);
  useEffect(() => {
    const patientId = searchParams.get("patient");
    if (!patientId || autoStarted.current) return;
    autoStarted.current = true;
    setPatientLoading(true);
    getPatient(patientId).then((p) => {
      if (p) {
        setSelectedPatient(p);
        setFlowStarted(true);
      }
      setPatientLoading(false);
    });
  }, [searchParams, getPatient]);

  function handleReset() {
    setFlowStarted(false);
    setSelectedPatient(null);
    setSelectedReport(null);
  }

  // Once recording starts, show DictationFlow
  if (flowStarted && selectedPatient) {
    return (
      <>
        <Header
          title={mode === "update" ? "Ažuriranje nalaza" : "Novi nalaz"}
          description={
            mode === "update"
              ? `Ažurirate nalaz za: ${selectedPatient.first_name} ${selectedPatient.last_name}`
              : `Pacijent: ${selectedPatient.first_name} ${selectedPatient.last_name}`
          }
        />
        <div className="px-8 py-8">
          <div className="mx-auto max-w-3xl">
            <ErrorBoundary
              fallbackTitle="Greška u procesu diktiranja"
              fallbackDescription="Došlo je do neočekivane greške. Pokušajte ponovo."
              onReset={handleReset}
            >
              <DictationFlow
                mode={mode}
                patient={selectedPatient}
                existingReport={selectedReport}
                onReset={handleReset}
              />
            </ErrorBoundary>
          </div>
        </div>
      </>
    );
  }

  if (patientLoading) {
    return (
      <>
        <Header title="Novi nalaz" description="Učitavam podatke o pacijentu..." />
        <div className="px-8 py-8 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-aimed-gray-200 border-t-aimed-black" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Novi nalaz"
        description="Odaberite način kreiranja medicinskog nalaza"
      />
      <div className="px-8 py-8">
        <div className="mx-auto max-w-3xl">
          {/* Mode selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => {
                  setMode(m.key);
                  setSelectedPatient(null);
                  setSelectedReport(null);
                }}
                className={cn(
                  "rounded-2xl border p-5 text-left transition-all duration-200",
                  mode === m.key
                    ? "border-aimed-black bg-aimed-white"
                    : "border-aimed-gray-200 bg-aimed-white hover:border-aimed-gray-400"
                )}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors duration-200",
                      mode === m.key ? "border-aimed-black" : "border-aimed-gray-300"
                    )}
                  >
                    {mode === m.key && (
                      <div className="h-2.5 w-2.5 rounded-full bg-aimed-black" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-aimed-black">{m.label}</p>
                </div>
                <p className="text-xs text-aimed-gray-400 pl-[30px]">{m.description}</p>
              </button>
            ))}
          </div>

          {/* Mode-specific content */}
          <div className="mt-6">
            {mode === "new" && (
              <NewModeFlow
                selectedPatient={selectedPatient}
                onPatientCreated={setSelectedPatient}
                onStart={() => setFlowStarted(true)}
                onChangePatient={() => setSelectedPatient(null)}
              />
            )}
            {mode === "update" && (
              <UpdateModeFlow
                selectedPatient={selectedPatient}
                selectedReport={selectedReport}
                onPatientSelected={setSelectedPatient}
                onReportSelected={setSelectedReport}
                onStart={() => setFlowStarted(true)}
                onChangePatient={() => {
                  setSelectedPatient(null);
                  setSelectedReport(null);
                }}
                onChangeReport={() => setSelectedReport(null)}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── New mode: patient-form → ready → start ──

function NewModeFlow({
  selectedPatient,
  onPatientCreated,
  onStart,
  onChangePatient,
}: {
  selectedPatient: Patient | null;
  onPatientCreated: (p: Patient) => void;
  onStart: () => void;
  onChangePatient: () => void;
}) {
  const { createPatient } = usePatients();

  async function handleSubmit(data: Omit<Patient, "id" | "doctor_id" | "created_at" | "updated_at">) {
    const patient = await createPatient(data);
    if (patient) onPatientCreated(patient);
  }

  // Step 2: Patient selected → ready to record
  if (selectedPatient) {
    return (
      <Card className="flex flex-col items-center gap-5 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-aimed-gray-100">
          <UserIcon className="h-7 w-7 text-aimed-gray-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-aimed-black">
            {selectedPatient.first_name} {selectedPatient.last_name}
          </p>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-xs text-aimed-gray-400">
            {selectedPatient.jmbg && <span>JMBG: {selectedPatient.jmbg}</span>}
            {selectedPatient.date_of_birth && (
              <span>Rođ: {formatBosnianDate(selectedPatient.date_of_birth)}</span>
            )}
            {selectedPatient.phone && <span>Tel: {selectedPatient.phone}</span>}
          </div>
        </div>
        <button
          onClick={onChangePatient}
          className="text-xs text-aimed-gray-400 underline hover:text-aimed-black transition-colors"
        >
          Promijeni podatke
        </button>
        <button
          className="w-full max-w-xs rounded-lg bg-aimed-black px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-aimed-gray-900"
          onClick={onStart}
        >
          Započni diktiranje
        </button>
        <p className="text-xs text-aimed-gray-400">
          Ne izgovarajte lične podatke pacijenta (ime, JMBG).
        </p>
      </Card>
    );
  }

  // Step 1: Fill in patient info
  return (
    <div>
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-aimed-gray-500">
        Podaci o pacijentu
      </p>
      <PatientForm
        onSubmit={handleSubmit}
        submitLabel="Nastavi"
      />
    </div>
  );
}

// ── Update mode: search patient → select report → ready ──

function UpdateModeFlow({
  selectedPatient,
  selectedReport,
  onPatientSelected,
  onReportSelected,
  onStart,
  onChangePatient,
  onChangeReport,
}: {
  selectedPatient: Patient | null;
  selectedReport: Report | null;
  onPatientSelected: (p: Patient) => void;
  onReportSelected: (r: Report) => void;
  onStart: () => void;
  onChangePatient: () => void;
  onChangeReport: () => void;
}) {
  // Step 3: Report selected → ready to record
  if (selectedPatient && selectedReport) {
    return (
      <Card className="flex flex-col items-center gap-5 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-aimed-gray-100">
          <DocumentIcon className="h-7 w-7 text-aimed-gray-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-aimed-black">
            {selectedPatient.first_name} {selectedPatient.last_name}
          </p>
          <p className="mt-1 text-xs text-aimed-gray-400">
            Nalaz od {formatBosnianDate(selectedReport.report_date)} · {selectedReport.type}
          </p>
          <p className="mt-2 text-xs text-aimed-gray-400 max-w-sm">
            {selectedReport.content.sections
              .slice(0, 2)
              .map((s) => s.title)
              .join(", ")}
            {selectedReport.content.sections.length > 2 && "..."}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onChangeReport}
            className="text-xs text-aimed-gray-400 underline hover:text-aimed-black transition-colors"
          >
            Drugi nalaz
          </button>
          <button
            onClick={onChangePatient}
            className="text-xs text-aimed-gray-400 underline hover:text-aimed-black transition-colors"
          >
            Drugi pacijent
          </button>
        </div>
        <button
          className="w-full max-w-xs rounded-lg bg-aimed-black px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-aimed-gray-900"
          onClick={onStart}
        >
          Diktiraj izmjene
        </button>
        <p className="text-xs text-aimed-gray-400">
          AI će ažurirati samo medicinske sekcije. Administrativni podaci neće biti mijenjani.
        </p>
      </Card>
    );
  }

  // Step 2: Patient selected → show their reports
  if (selectedPatient) {
    return (
      <ReportSelector
        patient={selectedPatient}
        onSelect={onReportSelected}
        onBack={onChangePatient}
      />
    );
  }

  // Step 1: Search and select patient
  return <PatientSearch onSelect={onPatientSelected} />;
}

// ── Patient search for update mode ──

function PatientSearch({ onSelect }: { onSelect: (p: Patient) => void }) {
  const { patients, loading, searchPatients, listPatients } = usePatients();
  const [query, setQuery] = useState("");

  useEffect(() => {
    listPatients();
  }, [listPatients]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        searchPatients(query);
      } else {
        listPatients();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchPatients, listPatients]);

  return (
    <div>
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-aimed-gray-500">
        Korak 1 — Odaberite pacijenta
      </p>
      <input
        type="text"
        placeholder="Pretražite po imenu ili JMBG..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-lg border border-aimed-gray-200 px-4 py-2.5 text-sm text-aimed-black placeholder:text-aimed-gray-400 outline-none transition-colors duration-200 focus:border-aimed-black mb-4"
        autoFocus
      />

      {loading && (
        <p className="text-center text-xs text-aimed-gray-400 py-6">Učitavanje...</p>
      )}

      {!loading && patients.length === 0 && (
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <UserIcon className="h-7 w-7 text-aimed-gray-300" />
          <p className="text-sm text-aimed-gray-400">
            {query ? "Nema rezultata" : "Nemate registrovanih pacijenata"}
          </p>
        </Card>
      )}

      {!loading && patients.length > 0 && (
        <div className="flex flex-col gap-2">
          {patients.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className="flex items-center gap-3 rounded-xl border border-aimed-gray-200 bg-aimed-white p-4 text-left transition-colors duration-200 hover:border-aimed-gray-400 hover:bg-aimed-gray-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-aimed-gray-100 shrink-0">
                <span className="text-sm font-semibold text-aimed-gray-500">
                  {p.first_name[0]}{p.last_name[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-aimed-black truncate">
                  {p.first_name} {p.last_name}
                </p>
                <p className="text-xs text-aimed-gray-400">
                  {p.jmbg && `JMBG: ${p.jmbg}`}
                  {p.jmbg && p.date_of_birth && " · "}
                  {p.date_of_birth && `Rođ: ${formatBosnianDate(p.date_of_birth)}`}
                </p>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-aimed-gray-300 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Report selector (folder-like) for update mode ──

function ReportSelector({
  patient,
  onSelect,
  onBack,
}: {
  patient: Patient;
  onSelect: (r: Report) => void;
  onBack: () => void;
}) {
  const { reports, loading, getReportsByPatient } = useReports();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    getReportsByPatient(patient.id);
  }, [patient.id, getReportsByPatient]);

  return (
    <div>
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-aimed-gray-500">
        Korak 2 — Odaberite nalaz
      </p>

      {/* Patient header card */}
      <div className="flex items-center gap-3 rounded-xl border border-aimed-black bg-aimed-white p-4 mb-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-aimed-gray-100 shrink-0">
          <span className="text-sm font-semibold text-aimed-gray-500">
            {patient.first_name[0]}{patient.last_name[0]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-aimed-black">
            {patient.first_name} {patient.last_name}
          </p>
          <p className="text-xs text-aimed-gray-400">
            {patient.jmbg && `JMBG: ${patient.jmbg}`}
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-xs text-aimed-gray-400 underline hover:text-aimed-black transition-colors shrink-0"
        >
          Promijeni
        </button>
      </div>

      {/* Reports — folder-like with left border */}
      <div className="ml-5 border-l-2 border-aimed-gray-200 pl-5 pt-3">
        {loading && (
          <p className="text-center text-xs text-aimed-gray-400 py-6">Učitavanje nalaza...</p>
        )}

        {!loading && reports.length === 0 && (
          <Card className="flex flex-col items-center gap-3 py-8 text-center">
            <DocumentIcon className="h-6 w-6 text-aimed-gray-300" />
            <p className="text-xs text-aimed-gray-400">Ovaj pacijent nema prethodnih nalaza</p>
          </Card>
        )}

        {!loading &&
          reports.map((r) => {
            const isExpanded = expandedId === r.id;
            return (
              <div key={r.id} className="mb-2">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : r.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border bg-aimed-white p-4 text-left transition-colors duration-200",
                    isExpanded
                      ? "border-aimed-black"
                      : "border-aimed-gray-200 hover:border-aimed-gray-400 hover:bg-aimed-gray-50"
                  )}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-aimed-gray-100 shrink-0">
                    <DocumentIcon className="h-4 w-4 text-aimed-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-aimed-black">
                        {formatBosnianDate(r.report_date)}
                      </p>
                      <span className="rounded-full bg-aimed-gray-100 px-2 py-0.5 text-xs text-aimed-gray-500">
                        {r.type}
                      </span>
                    </div>
                    <p className="text-xs text-aimed-gray-400 truncate">
                      {r.content.sections
                        .filter((s) => s.content.trim())
                        .slice(0, 2)
                        .map((s) => s.title)
                        .join(", ")}
                    </p>
                  </div>
                  <ChevronRightIcon
                    className={cn(
                      "h-4 w-4 text-aimed-gray-300 shrink-0 mt-1 transition-transform duration-200",
                      isExpanded && "rotate-90"
                    )}
                  />
                </button>

                {/* Expanded section preview */}
                {isExpanded && (
                  <div className="mt-1 rounded-xl border border-aimed-gray-200 bg-aimed-gray-50 p-4 space-y-3">
                    {r.content.sections
                      .filter((s) => s.content.trim())
                      .map((s) => (
                        <div key={s.title}>
                          <p className="text-xs font-semibold uppercase tracking-wider text-aimed-gray-500 mb-1">
                            {s.title}
                          </p>
                          <p className="text-sm text-aimed-gray-700 whitespace-pre-wrap line-clamp-3">
                            {s.content}
                          </p>
                        </div>
                      ))}
                    <button
                      onClick={() => onSelect(r)}
                      className="w-full rounded-lg bg-aimed-black px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-aimed-gray-900"
                    >
                      Odaberi ovaj nalaz
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ── Icons ──

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
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

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}
