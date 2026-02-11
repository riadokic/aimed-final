
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Save, FileDown, Copy, Check, Sparkles, Loader2, Edit3, AlertCircle, RefreshCcw, Layers } from 'lucide-react';
import { MedicalReport, UserSettings } from '../types';
import ExportModal from './ExportModal';
import { GoogleGenAI, Type } from "@google/genai";

interface DictationViewProps {
  settings: UserSettings;
}

// Browser-compatible speech recognition type definition
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

const DictationView: React.FC<DictationViewProps> = ({ settings }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'done'>('idle');
  const [mode, setMode] = useState<'new' | 'update' | 'template'>('new');
  const [processingStep, setProcessingStep] = useState('');
  const [report, setReport] = useState<MedicalReport | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const timerRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
    const Recognition = SpeechRecognition || webkitSpeechRecognition;
    
    if (Recognition) {
      const recognition = new Recognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'bs-BA';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(prev => (prev + ' ' + finalTranscript).trim());
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          setError('Pristup mikrofonu nije dozvoljen.');
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => setTimer(t => t + 1), 1000);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error("Recognition already started", e);
        }
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    }
    return () => { 
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startRecording = () => {
    setIsRecording(true);
    setTimer(0);
    setTranscript('');
    setError(null);
    setStatus('recording');
    setReport(null);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    
    if (transcript.trim().length < 5) {
      setStatus('idle');
      setError('Diktat je prekratak. Molimo pokušajte ponovo.');
      return;
    }

    setStatus('processing');
    setProcessingStep('AI Strukturiranje nalaza (Haiku Engine)...');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Kao stručni medicinski asistent, strukturiraj sljedeći diktat na bosanskom jeziku u profesionalni medicinski izvještaj. 
        Diktat: "${transcript}"`,
        config: {
          systemInstruction: "Ti si vrhunski medicinski asistent za doktore na Balkanu. Tvoj zadatak je da slobodni diktat ljekara pretvoriš u strukturirani medicinski nalaz. Piši na bosanskom jeziku, koristeći profesionalnu medicinsku terminologiju. Odgovori isključivo u JSON formatu.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              anamneza: { type: Type.STRING },
              status: { type: Type.STRING },
              dijagnoza: { type: Type.STRING },
              terapija: { type: Type.STRING }
            },
            required: ["anamneza", "status", "dijagnoza", "terapija"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setReport(data);
      setStatus('done');
    } catch (err) {
      console.error('Gemini error:', err);
      setError('Došlo je do greške prilikom obrade AI modelom. Molimo pokušajte ponovo.');
      setStatus('idle');
    }
  };

  const updateReportField = (field: keyof MedicalReport, val: string) => {
    if (!report) return;
    setReport({ ...report, [field]: val });
  };

  const handleCopy = () => {
    if (!report) return;
    const text = `ANAMNEZA: ${report.anamneza}\nSTATUS: ${report.status}\nDIJAGNOZA: ${report.dijagnoza}\nTERAPIJA: ${report.terapija}`;
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Novi nalaz</h1>
          <div className="flex items-center gap-3">
             <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
               Doktor: {settings.doctorName}
             </p>
             <div className="w-1 h-1 rounded-full bg-slate-300" />
             <div className="flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-blue-500" />
                <select 
                  className="text-[10px] font-bold text-blue-600 bg-transparent outline-none uppercase tracking-widest cursor-pointer"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                >
                  <option value="new">Standardni Nalaz</option>
                  <option value="update">Update Mode (Surgikalno)</option>
                  <option value="template">Template Mode (Šablon)</option>
                </select>
             </div>
          </div>
        </div>
        
        {status === 'done' && (
          <div className="flex gap-4">
            <button 
              onClick={() => { setStatus('idle'); setReport(null); setTranscript(''); }}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:border-zinc-300 transition-all shadow-sm"
            >
              <RefreshCcw className="w-4 h-4" />
              Resetuj
            </button>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:border-blue-400 transition-all shadow-sm"
            >
              {copySuccess ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copySuccess ? 'Kopirano' : 'Kopiraj'}
            </button>
            <button 
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all"
            >
              <FileDown className="w-4 h-4" />
              Finaliziraj i PDF
            </button>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        <div className={`
          p-10 rounded-[2.5rem] border transition-all duration-700 relative overflow-hidden
          ${status === 'recording' ? 'bg-zinc-900 border-zinc-800 shadow-2xl shadow-zinc-200/50' : 'bg-white border-slate-100'}
        `}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <button 
                onClick={status === 'recording' ? stopRecording : startRecording}
                disabled={status === 'processing'}
                className={`
                  w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500
                  ${status === 'recording' 
                    ? 'bg-red-500 text-white animate-pulse scale-110 shadow-xl shadow-red-200' 
                    : 'bg-zinc-900 text-white hover:scale-105 active:scale-95'}
                `}
              >
                {status === 'recording' ? <Square className="w-8 h-8 fill-white" /> : <Mic className="w-10 h-10" />}
              </button>
              
              <div>
                <p className={`text-sm font-bold uppercase tracking-widest ${status === 'recording' ? 'text-zinc-500' : 'text-slate-400'}`}>
                  {status === 'recording' ? 'Slušam diktat (Opus HQ)...' : 'Kliknite za početak snimanja'}
                </p>
                <h3 className={`text-4xl font-mono font-bold tracking-tighter ${status === 'recording' ? 'text-white' : 'text-slate-900'}`}>
                  {formatTime(timer)}
                </h3>
              </div>
            </div>

            {status === 'recording' && (
              <div className="flex-1 max-w-md">
                <p className="text-zinc-400 text-sm italic line-clamp-2 leading-relaxed">
                  "{transcript || 'Započnite diktiranje na bosanskom...'}"
                </p>
              </div>
            )}

            {status === 'processing' && (
              <div className="flex items-center gap-4 text-zinc-900 bg-zinc-50 px-8 py-5 rounded-3xl font-bold border border-zinc-100">
                <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                <span className="text-sm tracking-tight">{processingStep}</span>
              </div>
            )}
            
            {status === 'done' && (
              <div className="flex items-center gap-2">
                {mode === 'update' && <span className="px-2 py-1 rounded bg-amber-100 border border-amber-200 text-[9px] font-black text-amber-700 uppercase tracking-tighter">Updated</span>}
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-5 py-3 rounded-full text-xs font-bold border border-green-100">
                  <Check className="w-4 h-4" /> AI Struktura Spreman
                </div>
              </div>
            )}
          </div>
        </div>

        {report && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-500">
            {[
              { id: 'anamneza', title: 'Anamneza', icon: <Sparkles className="w-4 h-4" /> },
              { id: 'status', title: 'Klinički Status', icon: <ActivityIcon /> },
              { id: 'dijagnoza', title: 'Dijagnoza (MKB-10)', icon: <Edit3 className="w-4 h-4" /> },
              { id: 'terapija', title: 'Terapija i Preporuka', icon: <Save className="w-4 h-4" /> }
            ].map((section) => (
              <div 
                key={section.id}
                className={`
                  p-8 rounded-[2rem] border transition-all hover:border-zinc-300 group
                  ${section.id === 'dijagnoza' || section.id === 'terapija' ? 'bg-zinc-50/50' : 'bg-white'}
                  border-slate-100 shadow-sm hover:shadow-md
                `}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center group-hover:text-black transition-colors">
                      {section.icon}
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{section.title}</span>
                  </div>
                </div>
                <textarea 
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-800 font-medium leading-relaxed min-h-[160px] resize-none scrollbar-hide text-lg"
                  value={report[section.id as keyof MedicalReport]}
                  onChange={(e) => updateReportField(section.id as keyof MedicalReport, e.target.value)}
                  placeholder={`Unesite ${section.title.toLowerCase()}...`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {isExportOpen && report && (
        <ExportModal 
          report={report} 
          settings={settings} 
          onClose={() => setIsExportOpen(false)} 
        />
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

const ActivityIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

export default DictationView;
