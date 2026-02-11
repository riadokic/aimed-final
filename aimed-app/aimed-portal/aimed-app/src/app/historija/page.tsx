"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  loadHistory,
  deleteFromHistory,
  type HistoryEntry,
} from "@/lib/report-storage";
import { useAimedExport } from "@/hooks/use-aimed-export";
import { toast } from "@/components/ui/toast";
import { formatBosnianDate } from "@/lib/utils";

type PeriodFilter = "danas" | "mjesec" | "svi";
type DateGroup = "Danas" | "Jučer" | "Prošla sedmica" | "Ranije";

const DATE_GROUPS: DateGroup[] = ["Danas", "Jučer", "Prošla sedmica", "Ranije"];

/** Classify an ISO date string into a display group relative to now */
function getDateGroup(iso: string): DateGroup {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const oneWeekAgo = new Date(startOfToday);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const d = new Date(iso);
  if (d >= startOfToday) return "Danas";
  if (d >= startOfYesterday) return "Jučer";
  if (d >= oneWeekAgo) return "Prošla sedmica";
  return "Ranije";
}

export default function HistorijaPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("svi");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<DateGroup>>(new Set());

  const { exportPdf, exportWord } = useAimedExport();

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  /** Period-filtered entries */
  const periodFiltered = useMemo(() => {
    if (periodFilter === "svi") return history;
    const now = new Date();
    if (periodFilter === "danas") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return history.filter((e) => new Date(e.createdAt) >= start);
    }
    // mjesec
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return history.filter((e) => new Date(e.createdAt) >= start);
  }, [history, periodFilter]);

  /** Search-filtered entries (on top of period filter) */
  const filtered = useMemo(() => {
    if (!search.trim()) return periodFiltered;
    const q = search.toLowerCase();
    return periodFiltered.filter(
      (e) =>
        e.patient.name.toLowerCase().includes(q) ||
        e.sections.some((s) => s.content.toLowerCase().includes(q))
    );
  }, [periodFiltered, search]);

  /** Group filtered entries by date */
  const grouped = useMemo(() => {
    const map = new Map<DateGroup, HistoryEntry[]>();
    for (const group of DATE_GROUPS) map.set(group, []);
    for (const entry of filtered) {
      const group = getDateGroup(entry.createdAt);
      map.get(group)!.push(entry);
    }
    // Only return groups that have entries
    return DATE_GROUPS.filter((g) => map.get(g)!.length > 0).map((g) => ({
      label: g,
      entries: map.get(g)!,
    }));
  }, [filtered]);

  function toggleGroup(group: DateGroup) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  }

  function handleDelete(id: string) {
    deleteFromHistory(id);
    setHistory((prev) => prev.filter((e) => e.id !== id));
    toast("Nalaz obrisan", "info");
  }

  async function handleDownloadPdf(entry: HistoryEntry) {
    await exportPdf(entry.sections, entry.patient);
  }

  async function handleDownloadWord(entry: HistoryEntry) {
    await exportWord(entry.sections, entry.patient);
  }

  function formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString("bs-BA", { hour: "2-digit", minute: "2-digit" });
  }

  const modeLabel: Record<string, string> = {
    new: "Novi",
    update: "Ažuriranje",
    template: "Šablon",
  };

  const filterOptions: { key: PeriodFilter; label: string }[] = [
    { key: "danas", label: "Danas" },
    { key: "mjesec", label: "Ovaj mjesec" },
    { key: "svi", label: "Svi" },
  ];

  return (
    <>
      <Header title="Historija nalaza" description="Pregledajte i upravljajte prethodnim nalazima" />
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-3xl">
          {/* Filters row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              placeholder="Pretraži po imenu pacijenta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-lg border border-aimed-gray-200 px-4 py-2.5 text-sm text-aimed-black placeholder:text-aimed-gray-400 outline-none transition-colors duration-200 focus:border-aimed-black"
            />
            <div className="flex gap-1.5">
              {filterOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setPeriodFilter(opt.key)}
                  className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors duration-200 ${periodFilter === opt.key
                      ? "bg-aimed-black text-white"
                      : "bg-aimed-white text-aimed-gray-500 border border-aimed-gray-200 hover:border-aimed-gray-400"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <Card className="flex flex-col items-center gap-5 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-aimed-gray-100">
                <ClockIcon className="h-7 w-7 text-aimed-gray-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-aimed-black">
                  {search || periodFilter !== "svi" ? "Nema rezultata" : "Nema sačuvanih nalaza"}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-aimed-gray-400 max-w-sm">
                  {search || periodFilter !== "svi"
                    ? "Pokušajte s drugim terminom pretrage ili promijenite filter."
                    : "Kada kreirate nalaz i preuzmete PDF ili Word, on će biti automatski sačuvan ovdje."}
                </p>
              </div>
              {!search && periodFilter === "svi" && (
                <Link
                  href="/novi-nalaz"
                  className="rounded-lg bg-aimed-black px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-aimed-gray-900"
                >
                  + Novi nalaz
                </Link>
              )}
            </Card>
          ) : (
            <div className="flex flex-col gap-6">
              {grouped.map(({ label, entries }) => {
                const isCollapsed = collapsedGroups.has(label);
                return (
                  <div key={label}>
                    {/* Group header */}
                    <button
                      onClick={() => toggleGroup(label)}
                      className="flex w-full items-center gap-2 mb-3 group"
                    >
                      <ChevronIcon
                        className={`h-3.5 w-3.5 text-aimed-gray-400 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""
                          }`}
                      />
                      <span className="text-xs font-semibold uppercase tracking-wider text-aimed-gray-500">
                        {label}
                      </span>
                      <span className="text-xs text-aimed-gray-400">
                        ({entries.length})
                      </span>
                    </button>

                    {/* Entries */}
                    {!isCollapsed && (
                      <div className="flex flex-col gap-3">
                        {entries.map((entry) => (
                          <Card key={entry.id} className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-semibold text-aimed-black truncate">
                                    {entry.patient.name || "Nepoznat pacijent"}
                                  </p>
                                  <span className="shrink-0 rounded-full bg-aimed-gray-100 px-2 py-0.5 text-xs font-medium text-aimed-gray-500">
                                    {modeLabel[entry.mode] || entry.mode}
                                  </span>
                                </div>
                                <p className="text-xs text-aimed-gray-400">
                                  {formatBosnianDate(entry.createdAt)} u {formatTime(entry.createdAt)}
                                  {entry.patient.dateOfBirth && ` · Rođ: ${entry.patient.dateOfBirth}`}
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                                  title="Detalji"
                                >
                                  <EyeIcon className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownloadWord(entry)}
                                  title="Preuzmi Word"
                                >
                                  <WordIcon className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownloadPdf(entry)}
                                  title="Preuzmi PDF"
                                >
                                  <DownloadIcon className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(entry.id)}
                                  title="Obriši"
                                  className="text-aimed-red hover:text-aimed-red hover:bg-aimed-red-light"
                                >
                                  <TrashIcon className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>

                            {/* Expanded detail view */}
                            {expandedId === entry.id && (
                              <div className="mt-4 border-t border-aimed-gray-200 pt-4 space-y-3">
                                {entry.sections
                                  .filter((s) => s.content.trim())
                                  .map((s) => (
                                    <div key={s.title}>
                                      <p className="text-xs font-semibold uppercase tracking-wider text-aimed-gray-500 mb-1">
                                        {s.title}
                                      </p>
                                      <p className="text-sm text-aimed-gray-700 whitespace-pre-wrap">{s.content}</p>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Icons ──

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
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

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}
