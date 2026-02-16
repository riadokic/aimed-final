import {
  Mic,
  FileText,
  Shield,
  Sparkles,
  Layers,
  RefreshCw,
} from "lucide-react";

export default function BentoGrid() {
  return (
    <section
      id="features"
      className="py-16 sm:py-20 lg:py-24 px-6 bg-white border-t border-zinc-100 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto w-full">
        <div className="mb-16 text-center space-y-6 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-50 border border-zinc-100 text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
            <Layers className="w-3.5 h-3.5" /> Kako radi?
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-black">
            Dva načina, jedan cilj
          </h2>
          <p className="text-zinc-500 text-base sm:text-lg max-w-3xl mx-auto font-normal leading-relaxed">
            AiMED vam nudi dva načina rada: diktiranje novog nalaza ili
            uređivanje postojećeg od pacijentovog prethodnog pregleda. U oba
            slučaja, cilj je jedan: uštediti vaše vrijeme.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Card 1 - New Report */}
          <div className="col-span-12 lg:col-span-8 group relative bg-zinc-50 rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-100 p-6 sm:p-10 overflow-hidden hover:border-zinc-300 transition-all duration-500 shadow-sm flex flex-col min-w-0">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-2xl border border-zinc-200 flex items-center justify-center shadow-sm">
                  <Mic className="w-6 h-6 text-black" />
                </div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">
                  Najčešće korišteno
                </span>
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">
                  Novi snimak
                </h4>
                <p className="text-zinc-500 text-base sm:text-lg max-w-full sm:max-w-md">
                  Diktirajte slobodno. Koristite vlastiti šablon ili naš
                  predloženi format. AI strukturira nalaz automatski, bez obzira
                  koji pristup odaberete.
                </p>
              </div>
            </div>

            <div className="mt-8 sm:mt-12 bg-white border border-zinc-100 rounded-3xl p-6 shadow-xl shadow-zinc-200/50 transform translate-y-4 group-hover:translate-y-2 transition-transform duration-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="space-y-3">
                <div className="h-4 w-3/4 bg-zinc-50 rounded-lg animate-pulse" />
                <div className="h-4 w-1/2 bg-zinc-50 rounded-lg" />
                <div className="h-20 w-full bg-zinc-50 rounded-xl border border-dashed border-zinc-200 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-400 mr-2" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Generisanje strukture...
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 - Update Mode */}
          <div className="col-span-12 lg:col-span-4 group bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-100 p-6 sm:p-10 hover:border-zinc-300 transition-all duration-500 shadow-sm relative overflow-hidden flex flex-col justify-between min-w-0">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-zinc-400 group-hover:rotate-180 transition-transform duration-700" />
              </div>
              <h4 className="text-2xl font-bold text-black tracking-tight">
                Ažuriranje nalaza
              </h4>
              <p className="text-zinc-500 text-base">
                Učitajte postojeći nalaz i diktirajte samo promjene. AI precizno
                ažurira medicinske sekcije, ostavljajući sve ostalo netaknutim.
              </p>
            </div>
            <div className="mt-10 p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
              <div className="text-[11px] text-amber-700 font-bold uppercase tracking-widest mb-1">
                Diktat:
              </div>
              <div className="text-sm text-zinc-600 font-medium italic truncate">
                &quot;Promijeni terapiju na Sumamed 500mg...&quot;
              </div>
            </div>
          </div>

          {/* Card 3 - Template Mode */}
          <div className="col-span-12 lg:col-span-4 group bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-100 p-6 sm:p-10 hover:border-zinc-300 transition-all duration-500 shadow-sm flex flex-col justify-between min-w-0">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-zinc-400" />
              </div>
              <h4 className="text-2xl font-bold text-black tracking-tight">
                Rad sa šablonima
              </h4>
              <p className="text-zinc-500 text-base">
                Koristite vlastite šablone. AI popunjava samo označena mjesta
                ostavljajući branding netaknutim.
              </p>
            </div>
            <div className="mt-8 flex gap-2">
              <div className="h-2 flex-1 bg-zinc-100 rounded-full overflow-hidden relative">
                <div className="h-full bg-black rounded-full absolute left-0 top-0 animate-loading-bar" />
              </div>
              <div className="h-2 w-8 bg-zinc-100 rounded-full" />
            </div>
          </div>

          {/* Card 4 - Security (Dark) */}
          <div className="col-span-12 lg:col-span-8 group relative bg-black rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-800 p-6 sm:p-10 overflow-hidden hover:shadow-2xl transition-all duration-700 min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center h-full">
              <div className="space-y-6 text-white relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-2xl sm:text-3xl font-bold tracking-tighter">
                  Privatnost po dizajnu.
                </h4>
                <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
                  Glasovni zapisi se brišu odmah nakon obrade. Podaci ostaju u
                  vašem browseru. GDPR usklađenost Član 9.
                </p>
              </div>
              <div className="relative h-full min-h-[160px] md:min-h-[200px] flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center shadow-2xl relative z-10 animate-reveal">
                  <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-black" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
