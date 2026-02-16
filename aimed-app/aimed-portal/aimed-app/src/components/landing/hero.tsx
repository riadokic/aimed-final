"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Mic, FileText, LogIn } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-36 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden radial-glow">
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 bg-white shadow-sm animate-reveal">
          <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
          <span className="text-[8px] md:text-[12px] font-semibold text-zinc-600 uppercase tracking-widest">
            Inteligentna medicinska dokumentacija
          </span>
          <ArrowRight className="w-3 h-3 text-zinc-400" />
        </div>

        <div className="space-y-3 md:space-y-6">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-9xl font-bold tracking-tighter text-black leading-[0.95] animate-reveal [animation-delay:100ms]">
            Vi diktirate, <br />
            <span className="text-zinc-300">AIMED piše</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl md:text-2xl text-zinc-500 font-normal leading-relaxed animate-reveal [animation-delay:200ms]">
            Bez komplikovanih IT integracija. Vaš diktat postaje savršen
            medicinski izvještaj za manje od 60 sekundi.
          </p>
        </div>

        <div className="flex flex-col items-center pt-4 animate-reveal [animation-delay:300ms]">
          <div className="flex flex-col sm:flex-row items-start justify-center gap-8">
            {/* Primary CTA: Registracija */}
            <div className="flex flex-col items-center gap-4">
              <Link
                href="https://cal.eu/aimed/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black text-white w-[240px] py-4 rounded-2xl text-[16px] font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 group shadow-2xl shadow-zinc-200/50"
              >
                Započni besplatno
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-default group">
                <ShieldCheck className="w-4 h-4 text-zinc-900 group-hover:text-blue-500 transition-colors" />
                <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-[0.2em]">
                  GDPR Compliant
                </span>
              </div>
            </div>

            {/* Secondary CTA: Prijava */}
            <div className="flex flex-col items-center gap-4">
              <Link
                href="/login"
                className="bg-white text-black w-[240px] py-4 rounded-2xl text-[16px] font-bold border border-zinc-200 hover:bg-zinc-50 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <LogIn className="w-5 h-5" />
                Prijava za doktore
              </Link>
              <div className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-default group">
                <ShieldCheck className="w-4 h-4 text-zinc-900 group-hover:text-blue-500 transition-colors" />
                <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-[0.2em]">
                  ZZLP usklađeno
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
