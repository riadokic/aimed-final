"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GoogleButton } from "@/components/auth/google-button";
import { saveSettings, loadSettings } from "@/lib/report-storage";
import { acceptConsent } from "@/lib/gdpr";

export default function RegistracijaPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [gdprAccepted, setGdprAccepted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Lozinka mora imati najmanje 8 karaktera");
      return;
    }

    if (password !== confirmPassword) {
      setError("Lozinke se ne podudaraju");
      return;
    }

    if (!gdprAccepted) {
      setError("Morate prihvatiti Politiku Privatnosti za nastavak");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          specialization,
          clinic_name: clinicName,
        },
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        setError("already_registered");
      } else {
        setError("Greška pri registraciji. Pokušajte ponovo.");
      }
      setLoading(false);
      return;
    }

    // Supabase returns a fake user with empty identities when the email already exists
    // (security feature to not leak whether an email is registered)
    if (data?.user?.identities?.length === 0) {
      setError("already_registered");
      setLoading(false);
      return;
    }

    // Bridge to localStorage so settings are available immediately on first login
    const currentSettings = loadSettings();
    saveSettings({
      ...currentSettings,
      doctorName: fullName || currentSettings.doctorName,
      specialty: specialization || currentSettings.specialty,
      clinicName: clinicName || currentSettings.clinicName,
    });

    // Store GDPR consent so ConsentGate won't block after first login
    acceptConsent(data?.user?.id);

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aimed-black">
              <span className="text-sm font-bold text-white">A</span>
            </div>
            <span className="text-xl font-semibold text-aimed-black tracking-tight">AiMED</span>
          </Link>
        </div>
        <div className="rounded-2xl border border-aimed-gray-200 bg-aimed-white p-6 sm:p-8 shadow-sm text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-aimed-green-light mx-auto mb-4">
            <CheckIcon className="h-6 w-6 text-aimed-green" />
          </div>
          <h1 className="text-base font-semibold text-aimed-black mb-2">
            Provjerite email
          </h1>
          <p className="text-xs text-aimed-gray-400 mb-4">
            Poslali smo Vam link za potvrdu na <span className="font-medium text-aimed-black">{email}</span>.
            Kliknite na link da aktivirate račun.
          </p>
          <Link
            href="/login"
            className="text-xs font-medium text-aimed-black hover:underline"
          >
            Nazad na prijavu
          </Link>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-aimed-gray-200 px-3 py-2.5 text-sm text-aimed-black placeholder:text-aimed-gray-400 outline-none transition-colors duration-200 focus:border-aimed-black";

  return (
    <>
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-aimed-gray-400 transition-colors hover:text-aimed-black"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Nazad
        </Link>
      </div>

      <div className="mb-8 flex justify-center">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aimed-black">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          <span className="text-xl font-semibold text-aimed-black tracking-tight">AIMED</span>
        </Link>
      </div>

      <div className="rounded-2xl border border-aimed-gray-200 bg-aimed-white p-5 sm:p-8 shadow-sm">
        <h1 className="text-base font-semibold text-aimed-black mb-1">Registracija</h1>
        <p className="text-xs text-aimed-gray-400 mb-6">
          Kreirajte svoj AiMED račun
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Profile fields */}
          <div>
            <label className="mb-1 block text-xs font-medium text-aimed-gray-500">
              Ime i prezime
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Dr. Marko Marković"
              required
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-aimed-gray-500">
                Specijalnost
              </label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="Internista"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-aimed-gray-500">
                Klinika
              </label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="Opća bolnica"
                className={inputClass}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-aimed-gray-200" />

          {/* Auth fields */}
          <div>
            <label className="mb-1 block text-xs font-medium text-aimed-gray-500">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vašemail@klinika.ba"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-aimed-gray-500">
              Lozinka
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 karaktera"
              required
              minLength={8}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-aimed-gray-500">
              Potvrdite lozinku
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ponovite lozinku"
              required
              className={inputClass}
            />
          </div>

          {/* GDPR Consent */}
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={gdprAccepted}
              onChange={(e) => setGdprAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-aimed-black rounded"
            />
            <span className="text-xs text-aimed-gray-500 leading-relaxed">
              Pročitao/la sam i prihvatam{" "}
              <Link
                href="/politika-privatnosti"
                target="_blank"
                className="font-medium text-aimed-black underline underline-offset-2"
              >
                Politiku Privatnosti
              </Link>{" "}
              i GDPR uslove korištenja
            </span>
          </label>

          {error && (
            <div className="rounded-lg bg-aimed-red-light px-3 py-2 text-xs font-medium text-aimed-red">
              {error === "already_registered" ? (
                <p>
                  Nalog sa ovim emailom već postoji.{" "}
                  <Link href="/login" className="underline font-bold text-aimed-black hover:text-aimed-gray-900">
                    Prijavite se ovdje
                  </Link>
                </p>
              ) : (
                <p>{error}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !gdprAccepted}
            className="rounded-lg bg-aimed-black px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-aimed-gray-900 disabled:opacity-50"
          >
            {loading ? "Registracija..." : "Registrujte se"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-aimed-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-aimed-gray-400">
            <span className="bg-aimed-white px-2">ili</span>
          </div>
        </div>

        <GoogleButton label="Registruj se putem Google-a" />

        <p className="mt-4 text-center text-xs text-aimed-gray-400">
          Već imate račun?{" "}
          <Link href="/login" className="font-medium text-aimed-black hover:underline">
            Prijavite se
          </Link>
        </p>
      </div>
    </>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}
