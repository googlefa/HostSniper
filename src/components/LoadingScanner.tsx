import React, { useEffect, useState } from 'react';
import { Shield, Radio, Terminal, Cpu, Globe } from 'lucide-react';

interface LoadingScannerProps {
  target: string;
  lang: 'fa' | 'en';
}

const STEPS_FA = [
  'در حال ترجمه نام دامنه و استعلام آدرس‌های IPv4 / IPv6...',
  'استعلام سوابق شبکه و رکورد معکوس معتبر (PTR)...',
  'کاوش پایگاه داده Passive DNS از AlienVault OTX...',
  'استعلام موتور معکوس HackerTarget...',
  'بررسی پورت 443 و استخراج دامنه‌های گواهی TLS/SSL...',
  'فیلترسازی، حذف موارد تکراری و مرتب‌سازی نهایی...'
];

const STEPS_EN = [
  'Resolving target hostname to IPv4 / IPv6 addresses...',
  'Querying reverse DNS PTR canonical records...',
  'Interrogating AlienVault OTX Passive DNS indicators...',
  'Executing HackerTarget reverse IP mapping...',
  'Inspecting port 443 TLS handshake & SAN certificates...',
  'Deduplicating, categorizing root domains, and compiling results...'
];

export const LoadingScanner: React.FC<LoadingScannerProps> = ({ target, lang }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const steps = lang === 'fa' ? STEPS_FA : STEPS_EN;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % steps.length);
    }, 1100);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="max-w-2xl mx-auto my-12 p-8 rounded-3xl bg-[#0d1424]/95 border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.2)] text-center relative overflow-hidden backdrop-blur-xl">
      
      {/* Scanner Radar Light Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

      {/* Cyber Radar Animation */}
      <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
        {/* Radar Rings */}
        <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping opacity-30" />
        <div className="absolute inset-2 rounded-full border-2 border-cyan-500/30 animate-pulse" />
        <div className="absolute inset-6 rounded-full border border-sky-400/40" />
        
        <div className="relative w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-400/60 flex items-center justify-center text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.5)]">
          <Radio className="w-7 h-7 animate-spin" />
        </div>
      </div>

      {/* Heading */}
      <h3 className="text-xl font-bold font-mono text-white mb-2">
        {lang === 'fa' ? 'در حال اجرای عملیات ریورس آی‌پی...' : 'Performing Deep Reverse IP Scan...'}
      </h3>

      <p className="text-sm font-mono text-cyan-400 mb-6 font-semibold">
        {target}
      </p>

      {/* Progressive Step Badge */}
      <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900 border border-cyan-900/60 text-xs text-slate-300 font-mono shadow-inner">
        <Cpu className="w-4 h-4 text-cyan-400 animate-spin" />
        <span>{steps[currentStepIndex]}</span>
      </div>

      {/* Progress Bars */}
      <div className="w-full bg-slate-900 rounded-full h-1.5 mt-8 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 h-1.5 transition-all duration-500"
          style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>

      <p className="text-[11px] text-slate-500 mt-4">
        {lang === 'fa' 
          ? 'استعلام مستقیم و همزمان از ۴ منبع اطلاعاتی بدون ایجاد بار روی سرور هدف'
          : 'Querying 4 intelligence sources concurrently with zero configuration'}
      </p>

    </div>
  );
};
