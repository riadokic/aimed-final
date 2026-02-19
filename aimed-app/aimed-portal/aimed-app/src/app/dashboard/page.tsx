"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { calculateTimeSaved } from "@/lib/analytics";
import { formatBosnianDate } from "@/lib/utils";
import { useReports, type ReportWithPatient } from "@/hooks/use-reports";

export default function HomePage() {
  const [history, setHistory] = useState<ReportWithPatient[]>([]);
  const { listReports, loading } = useReports();

  useEffect(() => {
    // Load initial data
    listReports().then(setHistory);
  }, [listReports]);

  const stats = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const today = history.filter((e) => new Date(e.created_at) >= startOfDay).length;
    const thisMonth = history.filter((e) => new Date(e.created_at) >= startOfMonth).length;

    const totalMinSaved = history.reduce(
      (sum, e) => sum + calculateTimeSaved(e.content.sections),
      0
    );

    return { today, thisMonth, total: history.length, minutesSaved: Math.round(totalMinSaved) };
  }, [history]);

  const recentEntries = useMemo(() => history.slice(0, 5), [history]);

  function formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString("bs-BA", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <>
      <Header title="Dashboard" description="Pregled aktivnosti i brzi pristup" />
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-4xl">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <p className="text-xs font-medium uppercase tracking-wider text-aimed-gray-500">
                Danas
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-aimed-black">{stats.today}</p>
              <p className="mt-1 text-xs text-aimed-gray-400">nalaza kreirano</p>
            </Card>
            <Card>
              <p className="text-xs font-medium uppercase tracking-wider text-aimed-gray-500">
                Ovaj mjesec
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-aimed-black">{stats.thisMonth}</p>
              <p className="mt-1 text-xs text-aimed-gray-400">nalaza ukupno</p>
            </Card>
            <Card>
              <p className="text-xs font-medium uppercase tracking-wider text-aimed-gray-500">
                Ukupno
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-aimed-black">{stats.total}</p>
              <p className="mt-1 text-xs text-aimed-gray-400">nalaza u historiji</p>
            </Card>
            <Card>
              <p className="text-xs font-medium uppercase tracking-wider text-aimed-gray-500">
                Ušteđeno
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-aimed-black">{stats.minutesSaved}</p>
              <p className="mt-1 text-xs text-aimed-gray-400">minuta ukupno</p>
            </Card>
          </div>

          {/* CTA cards */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Card className="flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-semibold text-aimed-black">Novi nalaz</h2>
                <p className="mt-1 text-sm text-aimed-gray-500">
                  Diktirajte medicinski nalaz glasom. AI transkribuje, formatira i priprema za print.
                </p>
              </div>
              <Link
                href="/novi-nalaz"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-aimed-accent px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-aimed-accent-hover"
              >
                Započni diktiranje
              </Link>
            </Card>
            <Card className="flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-semibold text-aimed-black">Ažuriraj postojeći nalaz</h2>
                <p className="mt-1 text-sm text-aimed-gray-500">
                  Učitajte PDF ili Word nalaz, pa diktirajte šta treba promijeniti.
                </p>
              </div>
              <Link
                href="/novi-nalaz?mode=update"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-aimed-gray-200 bg-aimed-white px-5 py-2.5 text-sm font-medium text-aimed-black transition-colors duration-200 hover:border-aimed-gray-400 hover:bg-aimed-gray-50"
              >
                Učitaj nalaz
              </Link>
            </Card>
          </div>

          {/* Zadnji nalazi */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-aimed-black">Zadnji nalazi</h2>
              {history.length > 0 && (
                <Link href="/historija" className="text-xs font-medium text-aimed-gray-500 hover:text-aimed-black transition-colors">
                  Vidi sve →
                </Link>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-aimed-gray-200 border-t-aimed-black" />
              </div>
            ) : recentEntries.length === 0 ? (
              <Card className="flex flex-col items-center gap-4 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-aimed-gray-100">
                  <ClockIcon className="h-6 w-6 text-aimed-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-aimed-black">Nema sačuvanih nalaza</p>
                  <p className="mt-1 text-xs text-aimed-gray-400">
                    Kada kreirate nalaz i preuzmete PDF ili Word, on će se pojaviti ovdje.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="flex flex-col gap-2">
                {recentEntries.map((entry) => (
                  <Card key={entry.id} className="p-3.5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-aimed-black truncate">
                            {entry.patients
                              ? `${entry.patients.first_name} ${entry.patients.last_name}`
                              : "Nepoznat pacijent"}
                          </p>
                          <span className="shrink-0 rounded-full bg-aimed-gray-100 px-2 py-0.5 text-xs font-medium text-aimed-gray-500">
                            {entry.type}
                          </span>
                        </div>
                        <p className="text-xs text-aimed-gray-400 mt-0.5">
                          {formatBosnianDate(entry.created_at)} u {formatTime(entry.created_at)}
                        </p>
                      </div>
                      <Link
                        href="/historija"
                        className="shrink-0 text-xs font-medium text-aimed-gray-400 hover:text-aimed-black transition-colors"
                      >
                        Detalji →
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}
