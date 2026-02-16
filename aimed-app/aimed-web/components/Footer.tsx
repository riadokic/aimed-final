
import React from 'react';
import { Stethoscope, Linkedin, Instagram } from 'lucide-react';

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || 'https://app.aimed.ba';

const AppFooter: React.FC = () => {
  return (
    <footer className="bg-black text-white py-24 px-8 overflow-hidden relative">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          <div className="md:col-span-4 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <Stethoscope className="text-black w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tighter text-white uppercase">AiMED</span>
            </div>
            <p className="text-zinc-400 text-lg leading-relaxed max-w-sm">
              Digitalizacija medicine na pametan način. Štedimo vrijeme onima koji spašavaju živote uz pomoć AI tehnologije.
            </p>
          </div>

          <div className="md:col-span-2 space-y-6">
            <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Kompanija</h4>
            <ul className="space-y-4 text-sm text-zinc-400 font-medium">
              <li><a href="#about" className="hover:text-white transition-colors">O nama</a></li>
              <li><a href="mailto:info@cee-med.com" className="hover:text-white transition-colors">Kontakt</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Česta pitanja</a></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-6">
            <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Proizvod</h4>
            <ul className="space-y-4 text-sm text-zinc-400 font-medium">
              <li><a href="#features" className="hover:text-white transition-colors">Kako radi?</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Cjenovnik</a></li>
              <li><a href={`${PORTAL_URL}/gdpr-sigurnost`} className="hover:text-white transition-colors">GDPR Sigurnost</a></li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-8">
            <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Pratite nas</h4>
            <div className="flex gap-4">
              <a href="https://linkedin.com/company/aimed" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://instagram.com/aimed" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[12px] font-medium text-zinc-500">
            © 2026 AIMED | AI Medical Dictation. Razvijeno za ljekare na Balkanu.
          </p>
          <div className="flex gap-8 text-[12px] font-medium text-zinc-500">
            <a href={`${PORTAL_URL}/politika-privatnosti`} className="hover:text-white transition-colors">Politika privatnosti</a>
            <a href={`${PORTAL_URL}/uslovi-koristenja`} className="hover:text-white transition-colors">Uslovi korištenja</a>
            <a href={`${PORTAL_URL}/gdpr-sigurnost`} className="hover:text-white transition-colors">GDPR Sigurnost</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
