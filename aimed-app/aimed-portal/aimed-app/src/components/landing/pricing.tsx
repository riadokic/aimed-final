"use client";

import React, { useState } from "react";
import { ArrowRight, Send, CheckCircle2 } from "lucide-react";

export default function Pricing() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");

    // In a real production environment, you would use a service like Formspree, 
    // Resend, or a custom Next.js API route to send the email to riad.okic@cee-med.com.
    // For now, we simulate the submission.

    setTimeout(() => {
      setStatus("success");
    }, 1500);
  };

  if (status === "success") {
    return (
      <section id="pricing" className="py-24 px-8 bg-white border-t border-zinc-100 min-h-[60vh] flex items-center">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-black tracking-tight">Hvala vam na interesovanju!</h2>
          <p className="text-zinc-500 text-lg">
            Vaša poruka je poslana. Naš tim će vas kontaktirati na navedenu email adresu u najkraćem mogućem roku.
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="text-blue-600 font-bold hover:underline pt-4"
          >
            Pošalji novu poruku
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      id="pricing"
      className="py-24 px-8 bg-white border-t border-zinc-100"
    >
      <div className="max-w-5xl mx-auto w-full">
        <div className="mb-20 text-center space-y-6">
          <h2 className="text-4xl md:text-6xl font-bold text-black tracking-tighter leading-[1.05]">
            Zatražite pristup <br /> AiMED platformi.
          </h2>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
            Trenutno smo u fazi prihvatanja novih korisnika putem direktnog upita kako bismo osigurali najbolju podršku za svaku ordinaciju.
          </p>
        </div>

        {/* Contact Form Container */}
        <div className="max-w-2xl mx-auto p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] border border-zinc-100 bg-white shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">
                  Ime i prezime *
                </label>
                <input
                  required
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Dr. Marko Marković"
                  className="w-full px-6 py-4 rounded-2xl border border-zinc-100 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">
                  Email adresa *
                </label>
                <input
                  required
                  type="email"
                  id="email"
                  name="email"
                  placeholder="marko@ordinacija.ba"
                  className="w-full px-6 py-4 rounded-2xl border border-zinc-100 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">
                  Broj telefona
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="+387 61 000 000"
                  className="w-full px-6 py-4 rounded-2xl border border-zinc-100 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="organization" className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">
                  Ustanova / Ordinacija
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  placeholder="Poliklinika AiMED"
                  className="w-full px-6 py-4 rounded-2xl border border-zinc-100 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">
                Poruka
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Pišite nam o vašim potrebama..."
                className="w-full px-6 py-4 rounded-2xl border border-zinc-100 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none"
              ></textarea>
            </div>

            <button
              disabled={status === "submitting"}
              type="submit"
              className="w-full bg-black text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-xl shadow-zinc-200/50"
            >
              {status === "submitting" ? (
                "Slanje..."
              ) : (
                <>
                  Pošalji upit
                  <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Enterprise Box */}
        <div className="mt-28 p-12 border-2 border-zinc-200/80 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-br from-white to-zinc-50/30 relative overflow-hidden group shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] transition-all duration-700 hover:border-zinc-300 hover:shadow-[0_35px_70px_-15px_rgba(0,0,0,0.25)]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

          <div className="space-y-3 relative z-10">
            <h4 className="text-2xl font-bold text-black tracking-tight">
              AiMED za zdravstvene ustanove
            </h4>
            <p className="text-zinc-500 text-lg font-normal">
              Kontaktirajte nas za bolničke integracije i grupne licence.
            </p>
          </div>
          <a
            href="mailto:info@cee-med.com?subject=Enterprise%20rješenja%20-%20Upit"
            className="relative z-10 flex items-center gap-2 text-black font-bold text-lg hover:gap-4 transition-all group"
          >
            Kontaktiraj prodaju
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}
