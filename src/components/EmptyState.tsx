import React from 'react';
import { Layers, ShieldAlert, Cpu, Network, Compass, HelpCircle } from 'lucide-react';

interface EmptyStateProps {
  lang: 'fa' | 'en';
}

export const EmptyState: React.FC<EmptyStateProps> = ({ lang }) => {
  return (
    <div className="max-w-5xl mx-auto my-8 space-y-6">
      
      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="p-6 rounded-2xl bg-[#0d1424]/80 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 group">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
            <Network className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white mb-2">
            {lang === 'fa' ? 'ریورس آی‌پی چیست؟' : 'What is Reverse IP?'}
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            {lang === 'fa'
              ? 'ریورس آی‌پی (Reverse IP) تکنیکی است که تمام وب‌سایت‌ها و دامنه‌هایی را که روی یک آدرس IP مشترک یا یک وب‌سرور میزبانی می‌شوند شناسایی می‌کند.'
              : 'Reverse IP lookup discovers all domain names and websites that are physically hosted on the same web server IP address or virtual host infrastructure.'}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0d1424]/80 border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 group">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
            <Cpu className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white mb-2">
            {lang === 'fa' ? 'چگونه بدون API کار می‌کند؟' : 'How does it work without API keys?'}
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            {lang === 'fa'
              ? 'این اسکریپت با ترکیب پایگاه داده عمومی AlienVault OTX، موتور هوشمند HackerTarget، استعلام PTR و گواهی امنیتی TLS، بدون نیاز به هیچ کلید یا ثبت‌نامی دامنه‌ها را استخراج می‌کند.'
              : 'This tool combines open passive DNS indicators from AlienVault OTX, HackerTarget OSINT, canonical PTR reverse DNS, and TLS SAN certificate inspection directly from the server.'}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0d1424]/80 border border-slate-800 hover:border-amber-500/40 transition-all duration-300 group">
          <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white mb-2">
            {lang === 'fa' ? 'کاربردهای امنیتی و فنی' : 'Security & OSINT Uses'}
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            {lang === 'fa'
              ? 'کشف همسایه‌های هاست اشتراکی، بررسی امنیت زیرساخت، تست نفوذ اخلاقی (Recon)، کشف دامنه‌های جعلی و فیشینگ و بررسی وضعیت شبکه‌های تحویل محتوا (CDN).'
              : 'Discover shared hosting neighbors, map infrastructure footprint, identify rogue subdomains or phishing campaigns, and audit CDN edge configurations.'}
          </p>
        </div>

      </div>

      {/* Instructions callout */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0d1424] to-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-200 block mb-0.5">
              {lang === 'fa' ? 'نحوه استفاده بسیار ساده:' : 'Easy to use:'}
            </span>
            <span>
              {lang === 'fa'
                ? 'فقط آدرس سایت (مثلاً example.com) یا یک آدرس آی‌پی را در کادر بالا وارد کرده و کلید جستجو را فشار دهید.'
                : 'Just type any domain name (e.g. example.com) or an IP address into the search box above and hit Enter.'}
            </span>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-mono text-[11px] shrink-0">
          No limits • 100% Free
        </span>
      </div>

    </div>
  );
};
