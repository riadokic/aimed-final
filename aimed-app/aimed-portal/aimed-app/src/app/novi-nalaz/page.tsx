"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { DictationFlow } from "@/components/recording/dictation-flow";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { FileUpload } from "@/components/ui/file-upload";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReportMode, UploadedReport } from "@/types/aimed";

const MODES: { key: ReportMode; label: string; description: string }[] = [
  {
    key: "new",
    label: "Novi nalaz",
    description: "Diktirajte kompletno novi medicinski nalaz",
  },
  {
    key: "update",
    label: "Ažuriraj postojeći",
    description: "Učitajte nalaz i diktirajte izmjene",
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
  const [uploadedFile, setUploadedFile] = useState<UploadedReport | null>(null);
  const [flowStarted, setFlowStarted] = useState(false);

  function handleReset() {
    setFlowStarted(false);
    setUploadedFile(null);
  }

  // Once recording starts, hide the mode selector
  if (flowStarted) {
    return (
      <>
        <Header
          title={mode === "update" ? "Ažuriranje nalaza" : "Novi nalaz"}
          description={
            mode === "update" && uploadedFile
              ? `Ažurirate: ${uploadedFile.name}`
              : "Snimite glasovnu diktaciju za kreiranje medicinskog nalaza"
          }
        />
        <div className="px-8 py-8">
          <div className="mx-auto max-w-3xl">
            <ErrorBoundary
              fallbackTitle="Greška u procesu diktiranja"
              fallbackDescription="Došlo je do neočekivane greške. Vaši podaci su sačuvani lokalno — pokušajte ponovo."
              onReset={handleReset}
            >
              <DictationFlow mode={mode} uploadedFile={uploadedFile} onReset={handleReset} />
            </ErrorBoundary>
          </div>
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
          {/* Mode selector — responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => {
                  setMode(m.key);
                  if (m.key !== "update") setUploadedFile(null);
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
              <NewModeCard onStart={() => setFlowStarted(true)} />
            )}
            {mode === "update" && (
              <UpdateModeCard
                uploadedFile={uploadedFile}
                onFileSelect={setUploadedFile}
                onClear={() => setUploadedFile(null)}
                onStart={() => setFlowStarted(true)}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Mode cards ──

function NewModeCard({ onStart }: { onStart: () => void }) {
  return (
    <Card className="flex flex-col items-center gap-5 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-aimed-gray-100">
        <MicrophoneIcon className="h-7 w-7 text-aimed-gray-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-aimed-black">Započni diktiranje</p>
        <p className="mt-2 text-xs leading-relaxed text-aimed-gray-400">
          Diktirajte medicinski nalaz jasno i prirodno.
          AI će automatski strukturirati vaš nalaz.
        </p>
      </div>
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

function UpdateModeCard({
  uploadedFile,
  onFileSelect,
  onClear,
  onStart,
}: {
  uploadedFile: UploadedReport | null;
  onFileSelect: (f: UploadedReport) => void;
  onClear: () => void;
  onStart: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-aimed-gray-500">
          Korak 1
        </p>
        <p className="mb-4 text-sm text-aimed-gray-700">
          Učitajte postojeći nalaz pacijenta
        </p>
        <FileUpload
          onFileSelect={onFileSelect}
          onClear={onClear}
          selectedFile={uploadedFile}
        />
      </Card>

      <Card className={cn(!uploadedFile && "opacity-50 pointer-events-none")}>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-aimed-gray-500">
          Korak 2
        </p>
        <p className="mb-4 text-sm text-aimed-gray-700">
          Diktirajte šta želite ažurirati, promijeniti ili ukloniti
        </p>
        <button
          className="w-full rounded-lg bg-aimed-black px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-aimed-gray-900 disabled:opacity-40 disabled:pointer-events-none"
          disabled={!uploadedFile}
          onClick={onStart}
        >
          Započni diktiranje izmjena
        </button>
        <p className="mt-3 text-xs text-aimed-gray-400">
          AI će ažurirati samo medicinske sekcije. Administrativni podaci, zaglavlje i podaci o pacijentu neće biti mijenjani.
        </p>
      </Card>
    </div>
  );
}

// ── Icons ──

function MicrophoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
    </svg>
  );
}
