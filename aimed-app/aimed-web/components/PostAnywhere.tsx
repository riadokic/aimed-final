
import React from 'react';
import { Copy, FileDown, FileText, User, Calendar, Mic, Sparkles } from 'lucide-react';

const PostAnywhere: React.FC = () => {
  return (
    <section id="integration" className="min-h-screen flex items-center py-20 px-6 bg-white border-y border-zinc-50 overflow-hidden relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 w-full">

        <div className="space-y-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-50 border border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">
            <Sparkles className="w-3.5 h-3.5" /> Univerzalni Unos
          </div>

          <div className="space-y-8">
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold text-black leading-[0.9] tracking-tighter">
              Diktirajte ovdje,<br />
              <span className="text-zinc-200">prenesite bilo gdje.</span>
            </h2>
            <p className="text-xl text-zinc-500 font-normal leading-relaxed max-w-lg">
              AIMED radi sa svim bolničkim sistemima. Kopirajte strukturirani tekst u Word, Outlook ili vaš EMR/HIS softver jednim klikom.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              {
                icon: <Copy className="w-5 h-5" />,
                title: "Instant Kopiranje",
                desc: "Kliknite i prenesite cijeli nalaz ili specifičnu sekciju u sekundi."
              },
              {
                icon: <FileDown className="w-5 h-5" />,
                title: "Direktni PDF",
                desc: "Preuzmite profesionalno formatiran nalaz spreman za pečat i potpis."
              }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-8 p-8 rounded-3xl bg-zinc-50/50 border border-zinc-100 hover:bg-white hover:border-zinc-200 transition-all duration-500 group cursor-default">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-zinc-300 border border-zinc-100 group-hover:text-black group-hover:border-zinc-300 transition-all shadow-sm">
                  {item.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-black text-xl tracking-tight">{item.title}</h4>
                  <p className="text-base text-zinc-500 font-normal leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative group">
          <div className="relative z-10 bg-white rounded-[3.5rem] border border-zinc-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.05)] p-12 max-w-lg mx-auto transition-transform duration-700 group-hover:-translate-y-2">
            <div className="flex items-center justify-between border-b border-zinc-50 pb-8 mb-8">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100">
                  <User className="text-zinc-300 w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-black text-lg">Zdravko Čorić</h4>
                  <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest">Pacijent ID: 29402</p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-300 border border-zinc-100">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-8">
              <div className="h-48 w-full border border-dashed border-zinc-200 rounded-3xl bg-zinc-50/30 flex flex-col items-center justify-center p-10 gap-6 relative overflow-hidden">
                <div className="text-[11px] text-zinc-300 font-bold uppercase tracking-widest relative z-10">Anamneza</div>
                <div className="w-full space-y-3.5 relative z-10">
                  <div className="h-2 w-full bg-zinc-100 rounded-full" />
                  <div className="h-2 w-5/6 bg-zinc-100 rounded-full" />
                  <div className="h-2 w-4/6 bg-zinc-100 rounded-full" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-zinc-100/50" />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="h-14 bg-zinc-50 rounded-2xl border border-zinc-100" />
                <div className="h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-white text-xs font-bold uppercase tracking-widest">Spremi</div>
              </div>
            </div>

            <div className="absolute -bottom-10 -left-10 w-72 bg-zinc-900 border border-zinc-800 text-white p-8 rounded-3xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] transform -rotate-2 transition-transform duration-500 group-hover:rotate-0">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Diktiranje</span>
                    <span className="text-xs font-mono font-bold text-zinc-300">00:12</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-white w-1/3 animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="text-[13px] font-medium leading-relaxed text-zinc-400">
                "...pacijent navodi bol u lijevoj strani grudnog koša..."
              </div>
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-zinc-50 rounded-full blur-[120px] -z-10 opacity-70" />
        </div>
      </div>
    </section>
  );
};

export default PostAnywhere;
