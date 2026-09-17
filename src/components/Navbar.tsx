import React from 'react';
import { ShieldCheck, Globe, Activity, Terminal, Sparkles, RefreshCw } from 'lucide-react';

interface NavbarProps {
  isScanning: boolean;
  onReset: () => void;
  lang: 'fa' | 'en';
  onToggleLang: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isScanning, onReset, lang, onToggleLang }) => {
  return (
    <header className="w-full border-b border-cyan-900/40 bg-[#090d16]/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={onReset}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 via-sky-500/10 to-indigo-950/40 border border-cyan-500/40 group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all duration-300">
            <Globe className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-['JetBrains_Mono'] font-bold text-lg tracking-wider text-white group-hover:text-cyan-300 transition-colors">
                REVERSE<span className="text-cyan-400 font-extrabold">.IP</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                OSINT v2.5
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {lang === 'fa' 
                ? 'ردیاب پیشرفته سایت‌ها و دامنه‌های مشترک روی یک سرور' 
                : 'Advanced Co-Hosted Websites & Reverse IP Finder'}
            </p>
          </div>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex items-center gap-3">
          {/* Engine Status Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-mono">
            <Activity className={`w-3.5 h-3.5 ${isScanning ? 'text-amber-400 animate-spin' : 'text-emerald-400'}`} />
            <span>
              {isScanning 
                ? (lang === 'fa' ? 'در حال کاوش شبکه...' : 'Scanning Network...') 
                : (lang === 'fa' ? 'موتور آنلاین (بدون نیاز به API)' : 'Engine Online (Zero API Key)')}
            </span>
          </div>

          {/* Reset button */}
          <button
            onClick={onReset}
            title={lang === 'fa' ? 'شروع جستجوی جدید' : 'New Search'}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/60 hover:border-cyan-500/40 text-xs font-mono font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <span className={lang === 'fa' ? 'text-cyan-400 font-bold' : 'text-slate-400'}>FA</span>
            <span className="text-slate-600">/</span>
            <span className={lang === 'en' ? 'text-cyan-400 font-bold' : 'text-slate-400'}>EN</span>
          </button>
        </div>

      </div>
    </header>
  );
};
