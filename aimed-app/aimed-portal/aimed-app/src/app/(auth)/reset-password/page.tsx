"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      setError("Greška pri slanju. Pokušajte ponovo.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex justify-center">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aimed-accent">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          <span className="text-xl font-semibold text-aimed-black tracking-tight">AiMED</span>
        </Link>
      </div>

      <div className="rounded-2xl border border-aimed-gray-200 bg-aimed-white p-6 sm:p-8 shadow-sm">
        {success ? (
          <div className="text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-aimed-green-light mx-auto mb-4">
              <MailIcon className="h-6 w-6 text-aimed-green" />
            </div>
            <h1 className="text-base font-semibold text-aimed-black mb-2">
              Email poslan
            </h1>
            <p className="text-xs text-aimed-gray-400 mb-4">
              Ako račun sa ovim emailom postoji, poslali smo link za resetovanje lozinke.
            </p>
            <Link
              href="/login"
              className="text-xs font-medium text-aimed-black hover:underline"
            >
              Nazad na prijavu
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-base font-semibold text-aimed-black mb-1">
              Resetujte lozinku
            </h1>
            <p className="text-xs text-aimed-gray-400 mb-6">
              Unesite email adresu i poslaćemo Vam link za resetovanje.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  className="w-full rounded-lg border border-aimed-gray-200 px-3 py-2.5 text-sm text-aimed-black placeholder:text-aimed-gray-400 outline-none transition-colors duration-200 focus:border-aimed-black"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-aimed-red-light px-3 py-2 text-xs font-medium text-aimed-red">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-aimed-accent px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-aimed-accent-hover disabled:opacity-50"
              >
                {loading ? "Slanje..." : "Pošalji link"}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-aimed-gray-400">
              <Link href="/login" className="font-medium text-aimed-black hover:underline">
                Nazad na prijavu
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
}
