
import React, { useState, useEffect } from 'react';
import { ChevronDown, Stethoscope, ArrowRight } from 'lucide-react';

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || 'https://app.aimed.ba';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    {
      label: "Proizvod",
      links: [
        { label: "Kako radi?", href: "#features" },
        { label: "Integracije", href: "#integration" },
        { label: "Iskustva kolega", href: "#testimonials" }
      ]
    },
    {
      label: "Resursi",
      links: [
        { label: "Česta pitanja", href: "#faq" },
        { label: "Cjenovnik", href: "#pricing" },
        { label: "GDPR Sigurnost", href: `${PORTAL_URL}/gdpr-sigurnost` },
        { label: "Politika privatnosti", href: `${PORTAL_URL}/politika-privatnosti` },
        { label: "Uslovi korištenja", href: `${PORTAL_URL}/uslovi-koristenja` }
      ]
    }
  ];

  return (
    <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 w-[95%] max-w-5xl ${isScrolled ? 'top-4' : 'top-8'}`}>
      <div className={`flex items-center justify-between px-6 py-2.5 rounded-2xl border transition-all duration-500 ${isScrolled ? 'bg-white/90 backdrop-blur-xl border-zinc-200 shadow-xl shadow-zinc-200/20' : 'bg-white border-zinc-100 shadow-sm'}`}>
        <div className="flex items-center gap-10">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <Stethoscope className="text-white w-4 h-4" />
            </div>
            <span className="text-base font-semibold tracking-tight text-black uppercase">AiMED</span>
          </a>

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
                      <a
                        key={lIdx}
                        href={link.href}
                        className="block px-4 py-2.5 text-[13px] text-zinc-500 hover:text-black hover:bg-zinc-50 rounded-lg transition-all"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <a href="mailto:info@cee-med.com" className="text-[13px] font-medium text-zinc-500 hover:text-black transition-colors">Podrška</a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`${PORTAL_URL}/login`}
            className="hidden sm:block bg-white border border-zinc-200 text-black px-4 py-2 rounded-xl text-[13px] font-semibold hover:bg-zinc-50 transition-colors"
          >
            Prijava
          </a>
          <a
            href="https://cal.eu/aimed/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-zinc-800 transition-all flex items-center gap-2 group"
          >
            Zakaži Demo
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
