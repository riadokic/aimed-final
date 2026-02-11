
import React, { useState } from 'react';
import { Save, User, Building, Shield, Check } from 'lucide-react';
import { UserSettings } from '../types';

interface SettingsViewProps {
  settings: UserSettings;
  onSave: (s: UserSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [showSaved, setShowSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Postavke profila</h1>
      <p className="text-slate-500 font-medium mb-12">Ovi podaci će se automatski pojaviti na vašim PDF nalazima.</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-blue-600" />
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ime i prezime ljekara</label>
            </div>
            <input 
              type="text"
              value={formData.doctorName}
              onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
              placeholder="npr. Dr. Marko Marković"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-4 h-4 text-blue-600" />
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Naziv klinike / ustanove</label>
            </div>
            <input 
              type="text"
              value={formData.clinicName}
              onChange={(e) => setFormData({...formData, clinicName: e.target.value})}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
              placeholder="npr. Poliklinika Medico"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Elektronski pečat (Placeholder)</label>
            </div>
            <div className="w-full h-32 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 hover:border-blue-300 transition-colors cursor-pointer bg-slate-50/50">
              <img src={formData.stampUrl} className="h-16 opacity-50 grayscale" alt="Stamp" />
              <span className="text-xs font-bold text-slate-400">Kliknite za promjenu slike</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            type="submit"
            className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
          >
            <Save className="w-5 h-5" />
            Spremi promjene
          </button>
          
          {showSaved && (
            <div className="flex items-center gap-2 text-green-600 font-bold text-sm animate-in fade-in slide-in-from-left-4">
              <Check className="w-5 h-5" /> Podaci su uspješno spremljeni
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default SettingsView;
