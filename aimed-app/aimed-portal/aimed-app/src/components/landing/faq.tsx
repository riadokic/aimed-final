"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Kako početi sa AiMED-om?",
    answer:
      "Jednostavno kreirajte demo nalog, povežite svoj mikrofon i započnite diktiranje. Naš sistem će vas voditi kroz prvi proces strukturiranja nalaza.",
  },
  {
    question: "Da li su podaci pacijenata sigurni?",
    answer:
      "Apsolutno. Sigurnost i medicinska tajna su naš prioritet. AiMED koristi naprednu end-to-end enkripciju podataka. Svi diktati se procesiraju u skladu sa GDPR regulativama, a podaci se ne koriste za treniranje javnih modela. Vaši nalazi pripadaju isključivo vama i vašoj ustanovi.",
  },
  {
    question: "Trebam li kupovati posebnu opremu ili mikrofone?",
    answer:
      "Ne. AiMED je dizajniran da radi sa opremom koju već posjedujete. Možete koristiti mikrofon vašeg laptopa, obične slušalice od telefona ili čak diktirati direktno preko pametnog telefona. Nema potrebe za skupim instalacijama ili specijalizovanim hardverom. Vaš trenutni uređaj je sve što vam treba za početak.",
  },
  {
    question: "Koliko traje obuka za korištenje sistema?",
    answer:
      'Manje od 5 minuta. Interfejs je kreiran tako da bude intuitivan i jednostavan, čak i za ljekare koji nisu tehnički potkovani. Ako znate pritisnuti dugme "Snimi" i "Kopiraj", znate koristiti AiMED. Za Pro paket i veće klinike, nudimo demonstraciju za cijeli tim. Cilj nam je da vam uštedimo vrijeme, a ne da vam trošimo sate na učenje novog softvera.',
  },
  {
    question: "Koliko vremena treba da se sistem postavi u moju ordinaciju?",
    answer:
      "Sistem je spreman trenutno. Nema instalacije koja traje danima. Nakon što napravite profil, možete početi sa prvim diktatom za manje od 60 sekundi. AiMED radi u vašem web pregledniku (Chrome, Edge, Safari).",
  },
  {
    question:
      "Mogu li koristiti svoje stare obrasce nalaza ili samo one od klinike?",
    answer:
      "Potpuno ste fleksibilni. Možete učitati svoje lične šablone na koje ste navikli godinama, ili koristiti standardizovane obrasce vaše bolnice/klinike. AiMED automatski prilagođava diktirani tekst strukturi koju vi odaberete, uključujući mjesto za pečat, zaglavlje i sekcije nalaza. Mi se prilagođavamo vašem načinu rada, a ne obrnuto.",
  },
  {
    question: "Mogu li segmentirati podatke po pacijentima?",
    answer:
      "Da, AiMED vam omogućava da organizujete nalaze po imenu pacijenta ili datumu nalaza za lakšu pretragu kasnije.",
  },
  {
    question: "Koliko često se AI modeli ažuriraju?",
    answer:
      "Naši modeli se ažuriraju sedmično na osnovu povratnih informacija ljekara iz cijele regije kako bi preciznost ostala iznad 98%.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="min-h-screen flex items-center py-20 px-6 bg-white border-t border-zinc-50"
    >
      <div className="max-w-2xl mx-auto w-full">
        <div className="mb-12 text-center space-y-4">
          <h2 className="text-[12px] font-bold text-zinc-400 uppercase tracking-[0.3em]">
            Česta pitanja
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-black tracking-tight">
            Česta pitanja o AI pretrazi i diktiranju.
          </h3>
        </div>

        <div className="space-y-0">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-zinc-100 last:border-0">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between py-6 text-left group"
              >
                <span
                  className={`text-lg font-medium transition-colors ${openIndex === i ? "text-black" : "text-zinc-500 group-hover:text-black"}`}
                >
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-zinc-300 transition-transform duration-300 ${openIndex === i ? "rotate-180 text-black" : ""}`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === i ? "max-h-96 opacity-100 pb-8" : "max-h-0 opacity-0"}`}
              >
                <p className="text-[16px] text-zinc-500 font-normal leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
