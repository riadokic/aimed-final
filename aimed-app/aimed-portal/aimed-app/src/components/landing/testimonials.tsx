"use client";

import { Quote } from "lucide-react";
import LogoLoop from "./logo-loop";

const testimonials = [
  {
    author: "Dr. Marko K.",
    role: "Kardiolog",
    org: "UKC Sarajevo",
    content:
      "AiMED je potpuno promijenio moj radni dan. Preciznost terminologije je nevjerovatna.",
    image: "https://i.pravatar.cc/150?u=marko",
  },
  {
    author: "Dr. Amra B.",
    role: "Radiolog",
    org: "Opća bolnica Tuzla",
    content:
      "Integracija je bez problema. Vrijeme koje uštedim je neprocjenjivo.",
    image: "https://i.pravatar.cc/150?u=amra",
  },
  {
    author: "Dr. Edin H.",
    role: "Hirurg",
    org: "Poliklinika Medico",
    content:
      "Najviše me oduševila jednostavnost. Samo klikneš i pričaš. Gledam pacijenta u oči, ne u monitor.",
    image: "https://i.pravatar.cc/150?u=edin",
  },
  {
    author: "Dr. Nejra S.",
    role: "Pedijatar",
    org: "Dom Zdravlja",
    content:
      "Konačno rješenje koje razumije naše specifične medicinske termine bez potrebe za ispravkama.",
    image: "https://i.pravatar.cc/150?u=nejra",
  },
  {
    author: "Dr. Igor V.",
    role: "Ortoped",
    org: "KCU Sarajevo",
    content:
      "Smanjen stres i bolja njega pacijenata. Dokumentacija se završava u realnom vremenu.",
    image: "https://i.pravatar.cc/150?u=igor",
  },
  {
    author: "Dr. Lejla M.",
    role: "Ginekolog",
    org: "Eurofarm",
    content:
      "Najbolja investicija u efikasnost moje ordinacije ove godine.",
    image: "https://i.pravatar.cc/150?u=lejla",
  },
];

export default function Testimonials() {
  const testimonialCards = testimonials.map((t) => ({
    title: "",
    node: (
      <div className="w-[400px] h-[280px] bg-white border border-zinc-100 rounded-[2.5rem] p-8 flex flex-col justify-between hover:border-zinc-300 transition-all duration-500 shadow-sm whitespace-normal">
        <div className="space-y-4">
          <Quote className="w-8 h-8 text-zinc-100" />
          <p className="text-[17px] font-medium text-zinc-600 leading-relaxed">
            {t.content}
          </p>
        </div>
        <div className="flex items-center gap-4 pt-6 border-t border-zinc-50">
          <img
            src={t.image}
            alt={t.author}
            className="w-12 h-12 rounded-full border border-zinc-100 object-cover"
          />
          <div>
            <h4 className="text-[15px] font-bold text-black tracking-tight">
              {t.author}
            </h4>
            <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest">
              {t.org}
            </p>
          </div>
        </div>
      </div>
    ),
  }));

  return (
    <section
      id="testimonials"
      className="min-h-screen flex items-center py-20 bg-white overflow-hidden border-t border-zinc-100"
    >
      <div className="max-w-[100vw] w-full">
        <div className="mb-12 text-center space-y-4 px-6">
          <h2 className="text-[12px] font-bold text-zinc-400 uppercase tracking-[0.3em]">
            Iskustva kolega
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold text-black tracking-tighter">
            Ljekari koji biraju budućnost.
          </h3>
        </div>

        <div className="py-8">
          <LogoLoop
            logos={testimonialCards}
            speed={80}
            direction="right"
            gap={40}
            scaleOnHover={false}
            fadeOut
            fadeOutColor="#ffffff"
            ariaLabel="Izjave ljekara"
          />
        </div>
      </div>
    </section>
  );
}
