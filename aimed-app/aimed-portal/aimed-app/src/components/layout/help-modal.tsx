"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    title: "Dashboard",
    subtitle: "Kontrolna ploča",
    icon: DashboardStepIcon,
    content: (
      <>
        <p className="text-sm text-aimed-gray-700 leading-relaxed mb-3">
          Na glavnom ekranu vidite statistiku vaših diktata i historiju zadnjih nalaza.
        </p>
        <p className="text-sm text-aimed-gray-700 leading-relaxed">
          Dugme <strong className="text-aimed-black">&quot;Novi nalaz&quot;</strong> je vaša polazna
          tačka za svaki novi unos. Možete ga naći na Dashboard-u kao i u bočnom meniju.
        </p>
      </>
    ),
  },
  {
    title: "Novi nalaz",
    subtitle: "Kreiranje nalaza",
    icon: MicStepIcon,
    content: (
      <>
        <div className="space-y-3">
          <HelpStep number={1} label="Pokretanje">
            Kliknite na &quot;Novi nalaz&quot;. Sistem će automatski učitati vaše preferirane rubrike iz postavki.
          </HelpStep>
          <HelpStep number={2} label="Diktiranje">
            Kliknite na ikonu mikrofona i govorite prirodno. AiMED prepoznaje medicinsku terminologiju, lijekove i dijagnoze na našem jeziku.
          </HelpStep>
          <HelpStep number={3} label="Strukturiranje">
            Dok vi govorite, naša vještačka inteligencija automatski raspoređuje izgovoreno u odgovarajuće rubrike (Anamneza, Status, Terapija...).
          </HelpStep>
          <HelpStep number={4} label="Validacija">
            Sistem automatski provjerava lijekove kroz Registar lijekova BiH i dodaje MKB-10 šifre za prepoznate dijagnoze.
          </HelpStep>
          <HelpStep number={5} label="Generisanje">
            Kada ste zadovoljni tekstom, kliknite &quot;Generiši nalaz&quot;. Sistem kreira finalni dokument (Word ili PDF) spreman za print.
          </HelpStep>
        </div>
      </>
    ),
  },
  {
    title: "Ažuriranje",
    subtitle: "Postojeći nalaz",
    icon: UpdateStepIcon,
    content: (
      <>
        <p className="text-sm text-aimed-gray-700 leading-relaxed mb-3">
          Imate pacijenta koji dolazi na kontrolu ili ima sličnu anamnezu?
        </p>
        <div className="space-y-3">
          <HelpStep number={1} label="Odaberite nalaz">
            U &quot;Novi nalaz&quot; kliknite na opciju &quot;Ažuriraj postojeći&quot;, pretražite pacijenta i pronađite prethodni nalaz.
          </HelpStep>
          <HelpStep number={2} label="Diktirajte izmjene">
            Sistem učitava sve stare podatke, a vi samo diktirajte izmjene (npr. &quot;Status nepromijenjen, u terapiju dodati...&quot;). AiMED ažurira samo relevantne dijelove.
          </HelpStep>
        </div>
      </>
    ),
  },
  {
    title: "Postavke",
    subtitle: "Personalizacija",
    icon: SettingsStepIcon,
    content: (
      <>
        <p className="text-sm text-aimed-gray-700 leading-relaxed mb-3">
          U sekciji &quot;Postavke&quot; možete sami definisati nazive rubrika koje želite u nalazu. AiMED će se trenutno prilagoditi vašem novom formatu.
        </p>
        <div className="rounded-xl border border-aimed-gray-200 bg-aimed-gray-50 p-4 space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-aimed-gray-500">Savjeti</p>
          <Tip icon="mic" text="Ne morate govoriti robotski. Govorite kao da diktirate kolegi." />
          <Tip icon="edit" text="Ako uočite grešku u transkripciji, možete je ručno korigovati u editoru prije konačnog generisanja." />
          <Tip icon="shield" text="Svi vaši podaci su enkriptovani i obrađuju se u skladu sa GDPR standardima i ISO 27001 protokolima." />
        </div>
      </>
    ),
  },
];

export function HelpModal({ open, onClose }: HelpModalProps) {
  const [step, setStep] = useState(0);

  // Reset to first step when modal opens
  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const goNext = useCallback(() => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else onClose();
  }, [step, onClose]);

  const goPrev = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  if (!open) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full max-w-lg rounded-2xl border border-aimed-gray-200 shadow-2xl",
          "bg-aimed-white/95 dark:bg-aimed-white/90 backdrop-blur-xl",
          "animate-reveal"
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-aimed-gray-400 hover:bg-aimed-gray-100 hover:text-aimed-black transition-colors"
          aria-label="Zatvori"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-aimed-gray-400 mb-3">
            Pomoć — Korak {step + 1} od {STEPS.length}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-aimed-accent text-white">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-aimed-black">{current.title}</h2>
              <p className="text-xs text-aimed-gray-500">{current.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex gap-1.5 px-6 pb-4">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                i === step
                  ? "w-8 bg-aimed-accent"
                  : i < step
                    ? "w-4 bg-aimed-gray-400"
                    : "w-4 bg-aimed-gray-200"
              )}
              aria-label={`Korak ${i + 1}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-6 pb-4 min-h-[200px]">
          {current.content}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-aimed-gray-200 px-6 py-4">
          <button
            onClick={goPrev}
            disabled={step === 0}
            className="rounded-lg px-4 py-2 text-sm font-medium text-aimed-gray-500 transition-colors hover:text-aimed-black disabled:opacity-0 disabled:pointer-events-none"
          >
            Nazad
          </button>
          <button
            onClick={goNext}
            className="rounded-lg bg-aimed-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-aimed-accent-hover"
          >
            {isLast ? "Razumijem" : "Dalje"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function HelpStep({ number, label, children }: { number: number; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aimed-accent text-[10px] font-bold text-white mt-0.5">
        {number}
      </div>
      <div>
        <p className="text-sm font-medium text-aimed-black">{label}</p>
        <p className="text-sm text-aimed-gray-500 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function Tip({ icon, text }: { icon: "mic" | "edit" | "shield"; text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-aimed-gray-100 mt-0.5">
        {icon === "mic" && <MicTipIcon className="h-3 w-3 text-aimed-gray-500" />}
        {icon === "edit" && <EditTipIcon className="h-3 w-3 text-aimed-gray-500" />}
        {icon === "shield" && <ShieldTipIcon className="h-3 w-3 text-aimed-gray-500" />}
      </div>
      <p className="text-xs text-aimed-gray-700 leading-relaxed">{text}</p>
    </div>
  );
}

/* ─── Icons ─── */

function DashboardStepIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
    </svg>
  );
}

function MicStepIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
    </svg>
  );
}

function UpdateStepIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
    </svg>
  );
}

function SettingsStepIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function MicTipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
    </svg>
  );
}

function EditTipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
    </svg>
  );
}

function ShieldTipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}
