"use client";

import Link from "next/link";
import { ArrowRight, Mic, FileText, LogIn } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-12 md:pt-56 md:pb-32 px-6 overflow-hidden radial-glow selection:bg-black selection:text-white">
      {/* Side Decorative Portal Hints */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        {/* Left Hint - Audio In Activity */}
        <div className="absolute top-[35%] left-[5%] xl:left-[10%] animate-float-hero group pointer-events-auto">
          <div className="bg-white/55 backdrop-blur-md border border-zinc-200/80 p-4 rounded-3xl shadow-2xl shadow-zinc-200/30 flex flex-col gap-3 w-52 transform -rotate-3 transition-all duration-300 ease-in-out cursor-default group-hover:scale-105 group-hover:border-[2px] group-hover:border-zinc-300 group-hover:bg-white/70 group-hover:shadow-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                  Audio In
                </span>
              </div>
              <Mic className="w-3 h-3 text-zinc-300" />
            </div>
            <div className="space-y-1.5 px-1">
              <div className="h-1.5 w-full bg-zinc-100 rounded-full" />
              <div className="h-1.5 w-2/3 bg-zinc-50 rounded-full" />
            </div>
          </div>
        </div>

        {/* Right Hint - AI Processing Card */}
        <div className="absolute top-[32%] right-[5%] xl:right-[10%] animate-float-hero-delayed group pointer-events-auto">
          <div className="bg-white/55 backdrop-blur-md border border-zinc-200/80 p-5 rounded-[2rem] shadow-2xl shadow-zinc-200/30 w-56 space-y-4 transform rotate-2 transition-all duration-300 ease-in-out cursor-default group-hover:scale-105 group-hover:border-[2px] group-hover:border-zinc-300 group-hover:bg-white/70 group-hover:shadow-3xl">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-zinc-50 rounded-lg flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-black/30" />
              </div>
              <div>
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                  AI Strukturiranje
                </p>
              </div>
            </div>
            <div className="h-[1px] w-full bg-zinc-200/30 rounded-full overflow-hidden">
              <div className="h-full bg-black animate-progress-bar" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto text-center space-y-8 md:space-y-12 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 bg-white shadow-sm animate-reveal max-w-full overflow-hidden">
          <span className="flex h-2 w-2 rounded-full bg-blue-500 shrink-0"></span>
          <span className="text-[9px] md:text-[12px] font-semibold text-zinc-600 uppercase tracking-widest truncate">
            Inteligentna medicinska dokumentacija
          </span>
          <ArrowRight className="w-3 h-3 text-zinc-400 shrink-0" />
        </div>

        <div className="space-y-3 md:space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-black leading-[0.95] animate-reveal [animation-delay:100ms] break-words">
            Vi diktirate, <br />
            <span className="text-zinc-300">AiMED piše.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl md:text-2xl text-zinc-500 font-normal leading-relaxed animate-reveal [animation-delay:200ms]">
            Bez komplikovanih IT integracija. Vaš diktat postaje savršen
            medicinski izvještaj za manje od 60 sekundi.
          </p>
        </div>

        <div className="flex flex-col items-center pt-4 animate-reveal [animation-delay:300ms]">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            {/* Primary CTA: Registracija */}
            <Link
              href="/registracija"
              className="bg-black text-white w-[240px] py-4 rounded-2xl text-[16px] font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 group shadow-2xl shadow-zinc-200/50"
            >
              Započni besplatno
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Secondary CTA: Prijava */}
            <Link
              href="/login"
              className="bg-white text-black w-[240px] py-4 rounded-2xl text-[16px] font-bold border border-zinc-200 hover:bg-zinc-50 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <LogIn className="w-5 h-5" />
              Prijava za doktore
            </Link>
          </div>

          {/* Compliance badges */}
          <div className="mt-12 inline-flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14">
            {/* ISO 27001 */}
            <div className="group flex items-center gap-3 cursor-default">
              <img
                src="https://www.globalspedition.com/wp-content/uploads/2023/09/Logo-ISO-27001.png"
                alt="ISO 27001"
                className="h-9 w-9 object-contain grayscale opacity-60 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
              />
              <div className="text-left">
                <p className="text-[13px] font-bold text-zinc-500 leading-none tracking-wide">ISO</p>
                <p className="text-[11px] font-medium text-zinc-400 leading-none tracking-wide mt-0.5">27001:2022</p>
              </div>
            </div>

            {/* GDPR */}
            <div className="group flex items-center gap-3 cursor-default">
              <img
                src="https://www.loginradius.com/assets/compliance/gdpr-compliant/gdpr-compliant.webp"
                alt="GDPR Compliant"
                className="h-9 w-auto object-contain grayscale opacity-60 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
              />
              <div className="text-left">
                <p className="text-[13px] font-bold text-zinc-500 leading-none tracking-wide">GDPR</p>
                <p className="text-[11px] font-medium text-zinc-400 leading-none tracking-wide mt-0.5">COMPLIANT</p>
              </div>
            </div>

            {/* ZZLP BiH */}
            <div className="group flex items-center gap-3 cursor-default">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/f/f9/Bosnia_and_Herzegovina_Coats_of_Arms.png"
                alt="BiH grb"
                className="h-9 w-auto object-contain grayscale opacity-60 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
              />
              <div className="text-left">
                <p className="text-[13px] font-bold text-zinc-500 leading-none tracking-wide">ZZLP</p>
                <p className="text-[11px] font-medium text-zinc-400 leading-none tracking-wide mt-0.5">USKLAĐENO</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
