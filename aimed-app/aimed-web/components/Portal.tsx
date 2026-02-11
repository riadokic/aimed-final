
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Mic, 
  Settings as SettingsIcon, 
  Users, 
  LogOut, 
  Stethoscope,
  ChevronRight
} from 'lucide-react';
import DictationView from './DictationView';
import SettingsView from './SettingsView';
import { PortalTab, UserSettings } from '../types';

interface PortalProps {
  settings: UserSettings;
  onUpdateSettings: (s: UserSettings) => void;
  onLogout: () => void;
}

const Portal: React.FC<PortalProps> = ({ settings, onUpdateSettings, onLogout }) => {
  const [activeTab, setActiveTab] = useState<PortalTab>('dictation');

  const sidebarItems = [
    { id: 'dashboard', label: 'Kontrolna ploča', icon: <LayoutDashboard />, disabled: true },
    { id: 'dictation', label: 'Novo snimanje', icon: <Mic />, disabled: false },
    { id: 'patients', label: 'Pacijenti', icon: <Users />, disabled: true, tag: 'Uskoro' },
    { id: 'settings', label: 'Postavke', icon: <SettingsIcon />, disabled: false },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col z-20">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
              <Stethoscope className="text-white w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-slate-900 uppercase tracking-tight">Aimed</span>
              <p className="text-[10px] font-bold text-blue-500 tracking-widest uppercase">Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              disabled={item.disabled}
              onClick={() => setActiveTab(item.id as PortalTab)}
              className={`
                w-full flex items-center justify-between p-4 rounded-2xl text-sm font-bold transition-all
                ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                ${activeTab === item.id 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
              `}
            >
              <div className="flex items-center gap-3">
                {/* Fixed TS error by casting the element to allow prop injection via cloneElement */}
                {React.cloneElement(item.icon as React.ReactElement<any>, { className: "w-5 h-5" })}
                {item.label}
              </div>
              {item.tag && (
                <span className="text-[9px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full uppercase">
                  {item.tag}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm">
              {settings.doctorName.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{settings.doctorName}</p>
              <p className="text-[10px] text-slate-400 truncate">{settings.clinicName}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-4 rounded-2xl text-sm font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Odjavi se
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-grid opacity-100">
        <div className="max-w-6xl mx-auto p-12">
          {activeTab === 'dictation' && <DictationView settings={settings} />}
          {activeTab === 'settings' && (
            <SettingsView settings={settings} onSave={onUpdateSettings} />
          )}
          {activeTab === 'dashboard' && (
            <div className="flex items-center justify-center h-[70vh] text-slate-400 font-medium">
              Odaberite opciju iz menija
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Portal;
