
import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: "Standard",
    price: "95 KM",
    period: "/ mjesečno",
    description: "Idealno za ljekare u samostalnim ordinacijama.",
    features: ["Do 120 diktata mjesečno", "Lokalni jezici (BiH, HR, SRB)", "Email podrška unutar 24h"],
    cta: "Započni besplatno",
    highlighted: false
  },
  {
    name: "Pro",
    price: "145 KM",
    period: "/ mjesečno",
    description: "Za ljekare koji žele maksimalnu efikasnost bez limita.",
    features: ["Neograničen broj diktata", "Lokalni jezici (BiH, HR, SRB)", "Prioritetna telefonska i email podrška", "Napredna medicinska terminologija"],
    cta: "Isprobaj Pro besplatno",
    highlighted: true
  }
];

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="min-h-screen flex items-center py-20 px-8 bg-white border-t border-zinc-100">
      <div className="max-w-5xl mx-auto w-full">
        <div className="mb-16 text-center space-y-6">
          <h2 className="text-4xl md:text-6xl font-bold text-black tracking-tighter leading-[1.05]">
            Započnite 14-dnevni <br /> besplatni probni period.
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <a
              href="https://cal.eu/aimed/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white px-8 py-4 rounded-xl text-[15px] font-semibold hover:bg-zinc-800 transition-all flex items-center gap-2 group shadow-xl shadow-zinc-200/50"
            >
              Probaj besplatno
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="https://cal.eu/aimed/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl text-[15px] font-semibold text-black border border-zinc-200 hover:bg-zinc-50 transition-all"
            >
              Pogledaj sve planove
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`
                relative p-10 rounded-[3rem] transition-all duration-500 flex flex-col h-full
                ${plan.highlighted
                  ? 'bg-zinc-950 text-white border border-zinc-800 shadow-2xl shadow-zinc-200/50'
                  : 'bg-zinc-50/50 text-black border-[1.5px] border-zinc-100 hover:bg-white hover:border-zinc-200'}
              `}
            >
              <div className="mb-10">
                <h3 className={`text-[11px] font-bold mb-4 uppercase tracking-[0.3em] ${plan.highlighted ? 'text-zinc-500' : 'text-zinc-400'}`}>{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-bold tracking-tighter">{plan.price}</span>
                  <span className={`text-sm font-medium ${plan.highlighted ? 'opacity-40' : 'text-zinc-400'}`}>{plan.period}</span>
                </div>
                <p className={`mt-4 text-lg font-normal ${plan.highlighted ? 'text-zinc-400' : 'text-zinc-500'}`}>{plan.description}</p>
              </div>

              <div className="space-y-4 mb-12 flex-1">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 min-h-[28px]">
                    <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.highlighted ? 'bg-white/10' : 'bg-black/5'}`}>
                      <Check className={`w-3 h-3 ${plan.highlighted ? 'text-white' : 'text-black'}`} />
                    </div>
                    <span className={`text-[15px] font-medium leading-[1.6] ${plan.highlighted ? 'text-zinc-300' : 'text-zinc-600'}`}>{f}</span>
                  </div>
                ))}
              </div>

              <a
                href="https://cal.eu/aimed/30min"
                target="_blank"
                rel="noopener noreferrer"
                className={`
                w-full py-5 rounded-2xl text-[14px] font-bold transition-all block text-center
                ${plan.highlighted
                    ? 'bg-white text-black hover:bg-zinc-200'
                    : 'bg-black text-white hover:bg-zinc-800'}
              `}>
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Enhanced Enterprise Box */}
        <div className="mt-24 p-12 border-2 border-zinc-200/80 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-br from-white to-zinc-50/30 relative overflow-hidden group shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] transition-all duration-700 hover:border-zinc-300 hover:shadow-[0_35px_70px_-15px_rgba(0,0,0,0.25)]">
          {/* Gloss/Refraction Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

          <div className="space-y-3 relative z-10">
            <h4 className="text-2xl font-bold text-black tracking-tight">AiMED za zdravstvene ustanove</h4>
            <p className="text-zinc-500 text-lg font-normal">Kontaktirajte nas za bolničke integracije i grupne licence.</p>
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
};

export default Pricing;
