"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoogleButton } from "@/components/auth/google-button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Pogrešan email ili lozinka"
          : "Greška pri prijavi. Pokušajte ponovo."
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
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

      {/* Logo */}
      <div className="mb-8 flex justify-center">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aimed-black">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          <span className="text-xl font-semibold text-aimed-black tracking-tight">AiMED</span>
        </Link>
      </div>

      <div className="rounded-2xl border border-aimed-gray-200 bg-aimed-white p-6 sm:p-8 shadow-sm">
        <h1 className="text-base font-semibold text-aimed-black mb-1">Prijava</h1>
        <p className="text-xs text-aimed-gray-400 mb-6">
          Prijavite se na svoj AiMED račun
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

          <div>
            <label className="mb-1 block text-xs font-medium text-aimed-gray-500">
              Lozinka
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
            className="rounded-lg bg-aimed-black px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-aimed-gray-900 disabled:opacity-50"
          >
            {loading ? "Prijava..." : "Prijavite se"}
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

        <GoogleButton label="Prijavi se putem Google-a" />

        <div className="mt-4 flex flex-col items-center gap-2">
          <Link
            href="/reset-password"
            className="text-xs text-aimed-gray-400 hover:text-aimed-black transition-colors"
          >
            Zaboravili ste lozinku?
          </Link>
          <p className="text-xs text-aimed-gray-400">
            Nemate račun?{" "}
            <Link href="/registracija" className="font-medium text-aimed-black hover:underline">
              Registrujte se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
