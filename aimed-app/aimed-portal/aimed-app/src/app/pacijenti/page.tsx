"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { PatientForm } from "@/components/patient/patient-form";
import { formatBosnianDate } from "@/lib/utils";
import { usePatients } from "@/hooks/use-patients";
import { useReports } from "@/hooks/use-reports";
import { useAimedExport } from "@/hooks/use-aimed-export";
import { toast } from "@/components/ui/toast";
import type { Patient, Report, ReportSection } from "@/types/aimed";
import type { PatientInfo } from "@/lib/pdf-generator";

type PeriodFilter = "danas" | "mjesec" | "svi";

export default function PacijentiPage() {
  const router = useRouter();
  const { patients, loading, listPatients, searchPatients, createPatient, updatePatient, deletePatient } = usePatients();
  const { getReportsByPatient, updateReport } = useReports();
  const { exportPdf, exportWord, pdfLoading, wordLoading } = useAimedExport();

  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [patientReports, setPatientReports] = useState<Record<string, Report[]>>({});
  const [reportsLoading, setReportsLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("svi");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Inline report viewer state
  const [openReportId, setOpenReportId] = useState<string | null>(null);
  const [editingSections, setEditingSections] = useState<{ reportId: string; sections: ReportSection[] } | null>(null);

  useEffect(() => {
    listPatients();
  }, [listPatients]);

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (value.trim()) {
          searchPatients(value.trim());
        } else {
          listPatients();
        }
      }, 300);
    },
    [searchPatients, listPatients]
  );

  // Temporal filtering: filter patients whose most recent report falls within the period
  const filteredPatients = useMemo(() => {
    if (periodFilter === "svi") return patients;
    const now = new Date();
    let start: Date;
    if (periodFilter === "danas") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return patients.filter((p) => {
      const reports = patientReports[p.id];
      if (!reports || reports.length === 0) return false;
      // Most recent report
      const latest = reports[0];
      return new Date(latest.report_date) >= start;
    });
  }, [patients, periodFilter, patientReports]);

  async function handleExpand(patientId: string) {
    if (expandedId === patientId) {
      setExpandedId(null);
      setOpenReportId(null);
      setEditingSections(null);
      return;
    }
    setExpandedId(patientId);
    setEditingId(null);
    setOpenReportId(null);
    setEditingSections(null);

    setReportsLoading(patientId);
    const reports = await getReportsByPatient(patientId);
    setPatientReports((prev) => ({ ...prev, [patientId]: reports }));
    setReportsLoading(null);
  }

  async function handleCreatePatient(data: Omit<Patient, "id" | "doctor_id" | "created_at" | "updated_at">) {
    await createPatient(data);
    setShowAddForm(false);
    await listPatients();
  }

  async function handleUpdatePatient(id: string, data: Partial<Omit<Patient, "id" | "doctor_id" | "created_at" | "updated_at">>) {
    await updatePatient(id, data);
    setEditingId(null);
    await listPatients();
  }

  async function handleDelete(id: string) {
    await deletePatient(id);
    setDeleteConfirm(null);
    setExpandedId(null);
  }

  function patientToInfo(p: Patient): PatientInfo {
    return {
      name: `${p.first_name} ${p.last_name}`,
      dateOfBirth: p.date_of_birth ? formatBosnianDate(p.date_of_birth) : "",
      jmbg: p.jmbg ?? "",
      contact: p.phone ?? "",
      email: p.email ?? "",
      address: p.address ?? "",
    };
  }

  function handleOpenReport(reportId: string) {
    if (openReportId === reportId) {
      setOpenReportId(null);
      setEditingSections(null);
    } else {
      setOpenReportId(reportId);
      setEditingSections(null);
    }
  }

  function startEditSections(report: Report) {
    setEditingSections({
      reportId: report.id,
      sections: report.content.sections.map((s) => ({ ...s })),
    });
  }

  function handleSectionChange(index: number, content: string) {
    if (!editingSections) return;
    setEditingSections((prev) => {
      if (!prev) return prev;
      const updated = [...prev.sections];
      updated[index] = { ...updated[index], content };
      return { ...prev, sections: updated };
    });
  }

  async function saveReportEdit() {
    if (!editingSections) return;
    await updateReport(editingSections.reportId, {
      content: { sections: editingSections.sections },
    });
    // Refresh reports for this patient
    if (expandedId) {
      const reports = await getReportsByPatient(expandedId);
      setPatientReports((prev) => ({ ...prev, [expandedId]: reports }));
    }
    setEditingSections(null);
    toast("Nalaz ažuriran", "info");
  }

  async function handleReportPdf(report: Report, patient: Patient) {
    const sections = editingSections?.reportId === report.id ? editingSections.sections : report.content.sections;
    await exportPdf(sections, patientToInfo(patient));
  }

  async function handleReportWord(report: Report, patient: Patient) {
    const sections = editingSections?.reportId === report.id ? editingSections.sections : report.content.sections;
    await exportWord(sections, patientToInfo(patient));
  }

  const filterOptions: { key: PeriodFilter; label: string }[] = [
    { key: "danas", label: "Danas" },
    { key: "mjesec", label: "Ovaj mjesec" },
    { key: "svi", label: "Svi" },
  ];

  const displayPatients = periodFilter === "svi" ? patients : filteredPatients;

  return (
    <>
      <Header
        title="Pacijenti"
        description="Pregled i upravljanje pacijentima"
        action={
          <Button size="md" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Otkaži" : "Dodaj pacijenta"}
          </Button>
        }
      />
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Add patient form */}
          {showAddForm && (
            <PatientForm
              onSubmit={handleCreatePatient}
              onCancel={() => setShowAddForm(false)}
              submitLabel="Dodaj pacijenta"
            />
          )}

          {/* Search + temporal filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aimed-gray-400" />
              <input
                type="text"
                placeholder="Pretražite po imenu, prezimenu ili JMBG..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-xl border border-aimed-gray-200 bg-aimed-white py-2.5 pl-10 pr-4 text-sm text-aimed-black placeholder:text-aimed-gray-400 outline-none transition-colors duration-200 focus:border-aimed-black"
              />
            </div>
            <div className="flex gap-1.5">
              {filterOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setPeriodFilter(opt.key)}
                  className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors duration-200 ${periodFilter === opt.key
                    ? "bg-aimed-accent text-white"
                    : "bg-aimed-white text-aimed-gray-500 border border-aimed-gray-200 hover:border-aimed-gray-400"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Patient list */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-aimed-gray-200 border-t-aimed-black" />
            </div>
          ) : displayPatients.length === 0 ? (
            <Card className="py-12 text-center">
              <p className="text-sm text-aimed-gray-400">
                {search || periodFilter !== "svi" ? "Nema rezultata pretrage" : "Nemate dodanih pacijenata"}
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {displayPatients.map((patient) => (
                <div key={patient.id}>
                  {/* Patient card */}
                  <Card
                    variant={expandedId === patient.id ? "default" : "interactive"}
                    className={expandedId === patient.id ? "rounded-b-none border-b-0" : ""}
                  >
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => handleExpand(patient.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-aimed-gray-100">
                          <span className="text-sm font-medium text-aimed-gray-500">
                            {patient.first_name[0]}{patient.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-aimed-black">
                            {patient.first_name} {patient.last_name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-aimed-gray-400">
                            {patient.jmbg && <span>JMBG: {patient.jmbg}</span>}
                            {patient.phone && <span>{patient.phone}</span>}
                          </div>
                        </div>
                      </div>
                      <ChevronIcon
                        className={`h-4 w-4 text-aimed-gray-400 transition-transform duration-200 ${expandedId === patient.id ? "rotate-180" : ""
                          }`}
                      />
                    </div>
                  </Card>

                  {/* Expanded content */}
                  {expandedId === patient.id && (
                    <Card className="rounded-t-none border-t border-aimed-gray-100 space-y-5">
                      {/* Edit / View patient info */}
                      {editingId === patient.id ? (
                        <PatientForm
                          initialData={patient}
                          onSubmit={(data) => handleUpdatePatient(patient.id, data)}
                          onCancel={() => setEditingId(null)}
                          submitLabel="Sačuvaj izmjene"
                        />
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-aimed-black">Podaci o pacijentu</h3>
                            <div className="flex gap-2">
                              <Button size="sm" variant="secondary" onClick={() => setEditingId(patient.id)}>
                                Uredi
                              </Button>
                              {deleteConfirm === patient.id ? (
                                <div className="flex gap-1">
                                  <Button size="sm" variant="danger" onClick={() => handleDelete(patient.id)}>
                                    Potvrdi
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(null)}>
                                    Ne
                                  </Button>
                                </div>
                              ) : (
                                <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(patient.id)}>
                                  Obriši
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <InfoRow label="JMBG" value={patient.jmbg} />
                            <InfoRow label="Datum rođenja" value={patient.date_of_birth ? formatBosnianDate(patient.date_of_birth) : undefined} />
                            <InfoRow label="Telefon" value={patient.phone} />
                            <InfoRow label="Email" value={patient.email} />
                            <InfoRow label="Adresa" value={patient.address} className="col-span-2" />
                          </div>
                        </div>
                      )}

                      {/* Divider */}
                      <div className="border-t border-aimed-gray-100" />

                      {/* Patient reports */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-aimed-black">Nalazi</h3>
                          <button
                            onClick={() => router.push(`/novi-nalaz?patient=${patient.id}`)}
                            className="rounded-lg bg-aimed-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-aimed-accent-hover"
                          >
                            Kreiraj nalaz
                          </button>
                        </div>

                        {reportsLoading === patient.id ? (
                          <div className="flex justify-center py-4">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-aimed-gray-200 border-t-aimed-black" />
                          </div>
                        ) : (patientReports[patient.id] ?? []).length === 0 ? (
                          <p className="py-4 text-center text-xs text-aimed-gray-400">
                            Nema nalaza za ovog pacijenta
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {(patientReports[patient.id] ?? []).map((report) => (
                              <div key={report.id}>
                                {/* Report row */}
                                <div
                                  className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${openReportId === report.id
                                    ? "border-aimed-black bg-aimed-gray-50"
                                    : "border-aimed-gray-100 hover:border-aimed-gray-300"
                                    }`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-aimed-black">
                                      {formatBosnianDate(report.report_date)}
                                    </p>
                                    <p className="text-xs text-aimed-gray-400">
                                      {report.content?.sections?.length ?? 0} sekcija
                                      {report.type && ` · ${report.type}`}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleReportWord(report, patient)}
                                      disabled={wordLoading}
                                      title="Preuzmi Word"
                                    >
                                      <WordIcon className="h-4 w-4" />
                                    </Button>
                                    {/* PDF export temporarily disabled
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleReportPdf(report, patient)}
                                      disabled={pdfLoading}
                                      title="Preuzmi PDF"
                                    >
                                      <DownloadIcon className="h-4 w-4" />
                                    </Button>
                                    */}
                                    <Button
                                      size="sm"
                                      variant={openReportId === report.id ? "secondary" : "ghost"}
                                      onClick={() => handleOpenReport(report.id)}
                                    >
                                      {openReportId === report.id ? "Zatvori" : "Otvori"}
                                    </Button>
                                  </div>
                                </div>

                                {/* Inline report viewer */}
                                {openReportId === report.id && (
                                  <div className="ml-4 mt-2 mb-3 rounded-xl border border-aimed-gray-200 bg-aimed-white p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs font-semibold uppercase tracking-wider text-aimed-gray-500">
                                        Sekcije nalaza
                                      </p>
                                      {editingSections?.reportId === report.id ? (
                                        <button
                                          onClick={saveReportEdit}
                                          className="text-xs text-aimed-black font-medium underline"
                                        >
                                          Sačuvaj izmjene
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => startEditSections(report)}
                                          className="text-xs text-aimed-gray-400 underline hover:text-aimed-black transition-colors"
                                        >
                                          Uredi nalaz
                                        </button>
                                      )}
                                    </div>
                                    {(editingSections?.reportId === report.id
                                      ? editingSections.sections
                                      : report.content.sections
                                    )
                                      .filter((s) => s.content.trim())
                                      .map((s, idx) => (
                                        <div key={s.title}>
                                          <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-aimed-gray-500">
                                              {s.title}
                                            </p>
                                            <button
                                              onClick={async () => {
                                                await navigator.clipboard.writeText(s.content);
                                                toast("Kopirano", "info");
                                              }}
                                              className="text-aimed-gray-400 hover:text-aimed-black transition-colors"
                                              title="Kopiraj sekciju"
                                            >
                                              <CopyIcon className="h-3.5 w-3.5" />
                                            </button>
                                          </div>
                                          {editingSections?.reportId === report.id ? (
                                            <textarea
                                              className="w-full rounded-lg border border-aimed-gray-200 px-3 py-2 text-sm text-aimed-gray-700 outline-none focus:border-aimed-black resize-y"
                                              value={s.content}
                                              onChange={(e) => handleSectionChange(idx, e.target.value)}
                                              rows={3}
                                            />
                                          ) : (
                                            <p className="text-sm text-aimed-gray-700 whitespace-pre-wrap">
                                              {s.content}
                                            </p>
                                          )}
                                        </div>
                                      ))}

                                    {/* Export buttons for inline viewer */}
                                    <div className="flex gap-2 pt-2 border-t border-aimed-gray-100">
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => handleReportWord(report, patient)}
                                        disabled={wordLoading}
                                      >
                                        <WordIcon className="h-3.5 w-3.5" />
                                        {wordLoading ? "Generišem..." : "Preuzmi Word"}
                                      </Button>
                                      {/* PDF export temporarily disabled
                                      <Button
                                        size="sm"
                                        onClick={() => handleReportPdf(report, patient)}
                                        disabled={pdfLoading}
                                      >
                                        <DownloadIcon className="h-3.5 w-3.5" />
                                        {pdfLoading ? "Generišem..." : "Preuzmi PDF"}
                                      </Button>
                                      */}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Small components ──

function InfoRow({ label, value, className }: { label: string; value?: string; className?: string }) {
  if (!value) return null;
  return (
    <div className={className}>
      <p className="text-xs text-aimed-gray-400">{label}</p>
      <p className="text-aimed-black">{value}</p>
    </div>
  );
}

// ── Icons ──

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
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

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
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
