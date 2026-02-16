"use client";

import { useState, useEffect } from "react";
import { hasValidConsent, acceptConsent } from "@/lib/gdpr";
import { useAuth } from "@/components/auth/auth-provider";

export function ConsentGate({ children }: { children: React.ReactNode }) {
  const [consented, setConsented] = useState<boolean | null>(null);
  const [showDeclined, setShowDeclined] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setConsented(hasValidConsent(user?.id));
  }, [user?.id]);

  // Loading state — don't flash modal
  if (consented === null) return null;

  if (consented) return <>{children}</>;

  function handleAccept() {
    acceptConsent(user?.id);
    setConsented(true);
  }

  function handleDecline() {
    setShowDeclined(true);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-aimed-white">
      <div className="mx-4 w-full max-w-lg">
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
          <h1 className="text-base font-semibold text-aimed-black mb-1">
            Zaštita Vaših Podataka
          </h1>
          <p className="text-xs text-aimed-gray-400 mb-6">
            Prije korištenja AiMED aplikacije, molimo da pročitate kako obrađujemo Vaše podatke.
          </p>

          {showDeclined ? (
            <div className="text-center py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-aimed-amber-light mx-auto mb-4">
                <InfoIcon className="h-6 w-6 text-aimed-amber" />
              </div>
              <p className="text-sm font-medium text-aimed-black mb-2">
                Saglasnost je potrebna
              </p>
              <p className="text-xs text-aimed-gray-400 mb-6 max-w-sm mx-auto">
                Bez Vaše saglasnosti nije moguće koristiti AiMED.
                Ako imate pitanja o zaštiti podataka, kontaktirajte
                nas na: info@cee-med.com
              </p>
              <button
                onClick={() => setShowDeclined(false)}
                className="text-sm font-medium text-aimed-black underline underline-offset-2"
              >
                Nazad na saglasnost
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                <ConsentSection
                  title="Kako AiMED funkcioniše"
                  items={[
                    "Transkripcija govora u tekst",
                    "Formatiranje teksta u medicinski nalaz",
                  ]}
                />
                <ConsentSection
                  title="Audio snimak"
                  items={[
                    "Koristi se isključivo za transkripciju",
                    "Automatski se briše odmah nakon obrade",
                    "Ne čuva se nigdje trajno",
                  ]}
                />
                <ConsentSection
                  title="Medicinski nalaz"
                  items={[
                    "Čuva se samo na Vašem uređaju (lokalno)",
                    "Ne šalje se niti čuva na eksternim serverima",
                    "Vi kontrolišete sve svoje podatke",
                  ]}
                />
                <ConsentSection
                  title="Podaci o pacijentima"
                  items={[
                    "Nikad ne napuštaju Vaš uređaj",
                    "Upisujete ih lokalno nakon kreiranja nalaza",
                  ]}
                />
                <ConsentSection
                  title="Vaša prava"
                  items={[
                    "Možete obrisati sve svoje podatke u bilo kom trenutku",
                    "Možete povući saglasnost u bilo kom trenutku",
                    "Možete exportovati svoje nalaze prije brisanja",
                  ]}
                />
                <div>
                  <p className="text-xs font-semibold text-aimed-gray-500 mb-1.5">
                    Eksterni servisi
                  </p>
                  <p className="text-xs text-aimed-gray-400 leading-relaxed">
                    Vaši audio podaci se obrađuju putem OpenAI i
                    Anthropic. Ovi servisi ne čuvaju podatke nakon obrade.
                  </p>
                </div>
              </div>

              <div className="border-t border-aimed-gray-200 pt-5">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAccept}
                    className="flex-1 rounded-lg bg-aimed-black px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-aimed-gray-900"
                  >
                    Prihvatam
                  </button>
                  <button
                    onClick={handleDecline}
                    className="flex-1 rounded-lg border border-aimed-gray-200 px-5 py-2.5 text-sm font-medium text-aimed-gray-500 transition-colors duration-200 hover:border-aimed-gray-400 hover:text-aimed-black"
                  >
                    Ne prihvatam
                  </button>
                </div>
                <p className="mt-3 text-center text-[10px] text-aimed-gray-400">
                  Verzija uslova: 1.0
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ConsentSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold text-aimed-gray-500 mb-1.5">{title}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-xs text-aimed-gray-400 leading-relaxed">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-aimed-gray-300" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
  );
}
