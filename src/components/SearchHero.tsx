import React, { useState } from 'react';
import { Search, Globe, Shield, Zap, CornerDownLeft, Sparkles, X, ClipboardCheck } from 'lucide-react';

interface SearchHeroProps {
  onSearch: (target: string) => void;
  isLoading: boolean;
  lang: 'fa' | 'en';
}

const PRESET_TARGETS = [
  { label: 'GitHub Pages', value: '185.199.108.153', desc: 'Fastly CDN Host' },
  { label: 'Aparat', value: 'aparat.com', desc: 'Iranian Media Host' },
  { label: 'Cloudflare Edge', value: '104.21.58.12', desc: 'Shared Anycast IP' },
  { label: 'Digikala', value: 'digikala.com', desc: 'E-commerce Server' },
  { label: 'Wikipedia', value: 'wikipedia.org', desc: 'Wikimedia Cluster' }
];

export const SearchHero: React.FC<SearchHeroProps> = ({ onSearch, isLoading, lang }) => {
  const [inputValue, setInputValue] = useState('');
  const [copiedPreset, setCopiedPreset] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSearch(inputValue.trim());
    }
  };

  const handlePreset = (val: string) => {
    setInputValue(val);
    onSearch(val);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputValue(text.trim());
      }
    } catch {
      // Ignore paste error
    }
  };

  // Determine input type
  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(inputValue.trim()) || inputValue.includes(':');
  const hasInput = inputValue.trim().length > 0;

  return (
    <div className="relative py-8 sm:py-12">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-gradient-to-r from-cyan-500/10 via-sky-500/5 to-emerald-500/10 blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="max-w-4xl mx-auto px-4 text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-medium mb-5 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>
            {lang === 'fa' 
              ? 'موتور قدرتمند ریورس آی‌پی کاملاً رایگان و بدون نیاز به API Key' 
              : 'Free Multi-Source Reverse IP & Co-Hosted Domain Discovery'}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
          {lang === 'fa' ? (
            <>
              کشف تمامی <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400">سایت‌های روی یک آی‌پی</span>
            </>
          ) : (
            <>
              Uncover All <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400">Sites on an IP</span>
            </>
          )}
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
          {lang === 'fa'
            ? 'کافیست آدرس یک وبسایت یا آی‌پی سرور را وارد کنید تا با تلفیق دیتابیس‌های معتبر جهانی، تمام دامنه‌های هم‌میزبان، اطلاعات مالکیت شبکه، موقعیت جغرافیایی و گواهی امنیتی را استخراج کنیم.'
            : 'Enter any website URL, domain name, or IP address. Our aggregator queries passive DNS, PTR, and TLS certificates to list every co-hosted website on that host.'}
        </p>

        {/* Search Input Box */}
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto mb-6">
          <div className="relative flex items-center rounded-2xl bg-[#0d1424]/90 border-2 border-cyan-500/30 hover:border-cyan-500/60 focus-within:border-cyan-400 focus-within:shadow-[0_0_30px_rgba(6,182,212,0.25)] transition-all duration-300 p-1.5 shadow-2xl backdrop-blur-xl">
            
            {/* Search Icon */}
            <div className="flex items-center justify-center pl-3 pr-2 text-cyan-400">
              <Search className={`w-5 h-5 ${isLoading ? 'animate-spin text-cyan-300' : ''}`} />
            </div>

            {/* Main Input */}
            <input
              type="text"
              dir="ltr"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={lang === 'fa' ? 'مثال: example.com یا 185.199.108.153' : 'e.g. example.com or 185.199.108.153'}
              className="flex-1 bg-transparent px-3 py-3.5 text-base sm:text-lg text-white font-mono placeholder:text-slate-500 focus:outline-none"
              disabled={isLoading}
              autoFocus
            />

            {/* Input Type Badge */}
            {hasInput && (
              <span className="hidden sm:inline-flex px-2 py-1 text-[11px] font-mono font-medium rounded-md bg-slate-800/90 text-cyan-300 border border-slate-700 mr-2 select-none">
                {isIp ? 'IPv4 / IPv6' : 'DOMAIN / HOST'}
              </span>
            )}

            {/* Clear Button */}
            {hasInput && (
              <button
                type="button"
                onClick={() => setInputValue('')}
                className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors mr-1"
                title={lang === 'fa' ? 'پاک کردن' : 'Clear'}
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Paste Button */}
            {!hasInput && (
              <button
                type="button"
                onClick={handlePaste}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-cyan-300 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors mr-2 font-mono"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>{lang === 'fa' ? 'جاگذاری' : 'Paste'}</span>
              </button>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !hasInput}
              className="flex items-center gap-2 px-5 sm:px-7 py-3 rounded-xl font-medium text-sm sm:text-base text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-200 cursor-pointer"
            >
              <span className="font-bold">
                {isLoading 
                  ? (lang === 'fa' ? 'در حال اسکن...' : 'Scanning...') 
                  : (lang === 'fa' ? 'شروع ریورس آی‌پی' : 'Reverse Lookup')}
              </span>
              <CornerDownLeft className="w-4 h-4 hidden sm:inline-block" />
            </button>
          </div>
        </form>

        {/* Preset chips for immediate 1-click test */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
          <span className="text-xs text-slate-500 font-medium">
            {lang === 'fa' ? 'نمونه‌های آماده تست:' : 'Quick Test Presets:'}
          </span>
          {PRESET_TARGETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => handlePreset(preset.value)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs font-mono text-slate-300 hover:text-cyan-300 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Globe className="w-3 h-3 text-cyan-400/80" />
              <span>{preset.label}</span>
              <span className="text-[10px] text-slate-500">({preset.value})</span>
            </button>
          ))}
        </div>

        {/* Features banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mt-8 text-xs text-slate-400">
          <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{lang === 'fa' ? 'بدون محدودیت کلید API' : 'Zero API Key Required'}</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{lang === 'fa' ? 'ترکیب پایگاه‌های Passive DNS' : 'Multi-Engine DNS & TLS'}</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{lang === 'fa' ? 'تست پینگ و وضعیت زنده سایت‌ها' : 'Live HTTP Health Prober'}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
