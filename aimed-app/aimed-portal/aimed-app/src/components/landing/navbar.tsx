"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronDown, Stethoscope, ArrowRight } from "lucide-react";

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, sectionId: string) => {
      e.preventDefault();
      scrollToSection(sectionId);
    },
    []
  );

  const menuItems = [
    {
      label: "Proizvod",
      links: [
        { label: "Kako radi?", sectionId: "features" },
        { label: "Integracije", sectionId: "integration" },
        { label: "Iskustva kolega", sectionId: "testimonials" },
      ],
    },
    {
      label: "Resursi",
      links: [
        { label: "Česta pitanja", sectionId: "faq" },
        { label: "Cjenovnik", sectionId: "pricing" },
        { label: "GDPR sigurnost", sectionId: "features" },
      ],
    },
  ];

  return (
    <nav
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 w-[95%] max-w-5xl ${isScrolled ? "top-4" : "top-8"}`}
    >
      <div
        className={`flex items-center justify-between px-6 py-2.5 rounded-2xl border transition-all duration-500 ${isScrolled ? "bg-white/90 backdrop-blur-xl border-zinc-200 shadow-xl shadow-zinc-200/20" : "bg-white border-zinc-100 shadow-sm"}`}
      >
        <div className="flex items-center gap-10">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <Stethoscope className="text-white w-4 h-4" />
            </div>
            <span className="text-base font-semibold tracking-tight text-black uppercase">
              AiMED
            </span>
          </button>

          <div className="hidden md:flex items-center gap-6">
            {menuItems.map((item, idx) => (
              <div key={idx} className="relative group px-2 py-1">
                <button className="text-[13px] font-medium text-zinc-500 hover:text-black transition-colors flex items-center gap-1">
                  {item.label}
                  <ChevronDown className="w-3 h-3 opacity-40 group-hover:rotate-180 transition-transform" />
                </button>
                <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                  <div className="bg-white border border-zinc-100 rounded-xl shadow-2xl p-2 min-w-[180px]">
                    {item.links.map((link, lIdx) => (
                      <button
                        key={lIdx}
                        onClick={(e) => handleNavClick(e, link.sectionId)}
                        className="block w-full text-left px-4 py-2.5 text-[13px] text-zinc-500 hover:text-black hover:bg-zinc-50 rounded-lg transition-all"
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <a
              href="mailto:info@cee-med.com"
              className="text-[13px] font-medium text-zinc-500 hover:text-black transition-colors"
            >
              Podrška
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden sm:block text-[13px] font-semibold text-zinc-500 hover:text-black transition-colors"
          >
            Prijava
          </Link>
          <Link
            href="/registracija"
            className="bg-black text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-zinc-800 transition-all flex items-center gap-2 group"
          >
            Započnite besplatno
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
