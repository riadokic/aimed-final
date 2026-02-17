"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, Menu, X } from "lucide-react";
import { AiMedLogo } from "@/components/ui/aimed-logo";

type NavLink = {
  label: string;
  sectionId?: string;
  href?: string;
};

type MenuItem = {
  label: string;
  links: NavLink[];
};

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, sectionId: string) => {
      e.preventDefault();
      setMobileOpen(false);
      scrollToSection(sectionId);
    },
    []
  );

  const menuItems: MenuItem[] = [
    {
      label: "Proizvod",
      links: [
        { label: "Kako radi?", sectionId: "features" },
        { label: "Integracije", sectionId: "integration" },
        { label: "O nama", sectionId: "about" },
      ],
    },
    {
      label: "Resursi",
      links: [
        { label: "Česta pitanja", sectionId: "faq" },
        { label: "Cjenovnik", sectionId: "pricing" },
        { label: "GDPR sigurnost", href: "/gdpr-sigurnost" },
      ],
    },
  ];

  return (
    <>
      <nav
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 w-[95%] max-w-5xl ${isScrolled ? "top-4" : "top-8"}`}
      >
        <div
          className={`flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-2xl border transition-all duration-500 ${isScrolled ? "bg-white/90 backdrop-blur-xl border-zinc-200 shadow-xl shadow-zinc-200/20" : "bg-white border-zinc-100 shadow-sm"}`}
        >
          <div className="flex items-center gap-10">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                <AiMedLogo variant="monogram" mode="dark" className="w-5 h-5" />
              </div>
              <AiMedLogo variant="full" mode="light" className="h-5 w-auto" />
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
                        link.href ? (
                          <Link
                            key={lIdx}
                            href={link.href}
                            className="block w-full text-left px-4 py-2.5 text-[13px] text-zinc-500 hover:text-black hover:bg-zinc-50 rounded-lg transition-all"
                          >
                            {link.label}
                          </Link>
                        ) : (
                          <button
                            key={lIdx}
                            onClick={(e) => handleNavClick(e, link.sectionId!)}
                            className="block w-full text-left px-4 py-2.5 text-[13px] text-zinc-500 hover:text-black hover:bg-zinc-50 rounded-lg transition-all"
                          >
                            {link.label}
                          </button>
                        )
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

          {/* Desktop CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="bg-white border border-zinc-200 text-black px-4 py-2 rounded-xl text-[13px] font-semibold hover:bg-zinc-50 transition-colors"
            >
              Prijava
            </Link>
            <Link
              href="/registracija"
              className="bg-black text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-zinc-800 transition-all flex items-center gap-2 group"
            >
              Registracija
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex md:hidden items-center justify-center w-9 h-9 rounded-lg hover:bg-zinc-100 transition-colors"
            aria-label="Otvori meni"
          >
            <Menu className="w-5 h-5 text-black" />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile menu drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-[201] w-[80%] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 md:hidden ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
              <AiMedLogo variant="monogram" mode="dark" className="w-4 h-4" />
            </div>
            <AiMedLogo variant="full" mode="light" className="h-4 w-auto" />
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-zinc-100 transition-colors"
            aria-label="Zatvori meni"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        <div className="px-5 py-6 space-y-6 overflow-y-auto h-[calc(100%-72px)]">
          {menuItems.map((item, idx) => (
            <div key={idx}>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                {item.label}
              </p>
              <div className="space-y-1">
                {item.links.map((link, lIdx) => (
                  link.href ? (
                    <Link
                      key={lIdx}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2.5 text-[14px] text-zinc-600 hover:text-black hover:bg-zinc-50 rounded-lg transition-all"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <button
                      key={lIdx}
                      onClick={(e) => handleNavClick(e, link.sectionId!)}
                      className="block w-full text-left px-3 py-2.5 text-[14px] text-zinc-600 hover:text-black hover:bg-zinc-50 rounded-lg transition-all"
                    >
                      {link.label}
                    </button>
                  )
                ))}
              </div>
            </div>
          ))}

          <div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
              Podrška
            </p>
            <a
              href="mailto:info@cee-med.com"
              className="block px-3 py-2.5 text-[14px] text-zinc-600 hover:text-black hover:bg-zinc-50 rounded-lg transition-all"
            >
              info@cee-med.com
            </a>
          </div>

          {/* Mobile CTA buttons */}
          <div className="pt-4 border-t border-zinc-100 space-y-3">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center bg-white border border-zinc-200 text-black px-4 py-3 rounded-xl text-[14px] font-semibold hover:bg-zinc-50 transition-colors"
            >
              Prijava
            </Link>
            <Link
              href="/registracija"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center bg-black text-white px-4 py-3 rounded-xl text-[14px] font-semibold hover:bg-zinc-800 transition-all"
            >
              Registracija
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
