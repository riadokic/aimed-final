
import React from 'react';
import { X, FileText, Download, Copy, Printer } from 'lucide-react';
import { MedicalReport, UserSettings } from '../types';

interface ExportModalProps {
  report: MedicalReport;
  settings: UserSettings;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ report, settings, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-slate-100 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 flex items-center justify-between bg-white border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Finalni izvještaj</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Pregled prije izvoza</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Preview (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-12 bg-slate-100 scrollbar-hide">
          {/* Paper Mockup */}
          <div className="bg-white p-16 shadow-2xl rounded-sm max-w-2xl mx-auto min-h-[800px] flex flex-col font-serif print:shadow-none print:m-0 print:p-8">
            {/* Report Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-12">
              <div className="space-y-1">
                <h4 className="text-2xl font-bold uppercase tracking-tighter text-slate-900 font-inter">{settings.clinicName}</h4>
                <p className="text-sm text-slate-500 font-inter">{settings.doctorName}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-inter">Medicinski izvještaj v2.4</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs font-bold font-inter">DATUM: {new Date().toLocaleDateString('bs-BA')}</p>
                <p className="text-xs font-bold font-inter">VRIJEME: {new Date().toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>

            {/* Report Body */}
            <div className="flex-1 space-y-10">
              <h2 className="text-center text-xl font-bold uppercase underline underline-offset-8 mb-12 font-inter tracking-widest">LJEKARSKI NALAZ I MIŠLJENJE</h2>
              
              <div className="space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-widest text-slate-900 font-inter">ANAMNEZA:</h5>
                <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{report.anamneza}</p>
              </div>

              <div className="space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-widest text-slate-900 font-inter">STATUS:</h5>
                <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{report.status}</p>
              </div>

              <div className="space-y-4 bg-slate-50/50 p-6 rounded-lg border border-slate-100">
                <h5 className="text-xs font-bold uppercase tracking-widest text-slate-900 font-inter">DIJAGNOZA (MKB-10):</h5>
                <p className="text-base font-bold text-slate-900">{report.dijagnoza}</p>
              </div>

              <div className="space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-widest text-slate-900 font-inter">TERAPIJA I PREPORUKA:</h5>
                <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{report.terapija}</p>
              </div>
            </div>

            {/* Report Footer */}
            <div className="mt-20 pt-12 border-t border-slate-100 flex justify-between items-end">
              <div className="text-[9px] text-slate-400 uppercase tracking-[0.3em] font-inter">
                Sistemski generisano via aimed.ba
              </div>
              <div className="text-center min-w-[150px] space-y-4">
                <div className="relative flex flex-col items-center">
                   <img src={settings.stampUrl} className="w-24 h-24 absolute -top-16 opacity-40 grayscale pointer-events-none" />
                   <div className="h-1 w-full bg-slate-200 mt-2" />
                   <p className="text-[10px] font-bold text-slate-900 mt-2 font-inter">Potpis i pečat ljekara</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-white border-t border-slate-100 flex justify-center gap-4">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold hover:border-blue-400 transition-all"
          >
            <Printer className="w-5 h-5" />
            Štampaj nalaz
          </button>
          <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">
            <Download className="w-5 h-5" />
            Preuzmi kao PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
