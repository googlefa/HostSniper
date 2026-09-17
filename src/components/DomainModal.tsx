import React, { useState } from 'react';
import { X, Globe, ExternalLink, Activity, Copy, Check, Shield, Clock, Terminal, Search } from 'lucide-react';
import { DiscoveredDomain, DomainProbeResult } from '../types';

interface DomainModalProps {
  domain: DiscoveredDomain | null;
  onClose: () => void;
  probeResult?: DomainProbeResult;
  onProbe: (domain: string) => void;
  isProbing: boolean;
  lang: 'fa' | 'en';
}

export const DomainModal: React.FC<DomainModalProps> = ({
  domain,
  onClose,
  probeResult,
  onProbe,
  isProbing,
  lang
}) => {
  const [copied, setCopied] = useState(false);

  if (!domain) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(domain.domain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl rounded-2xl bg-[#0d1424] border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-mono text-white flex items-center gap-2">
                {domain.domain}
                <button
                  onClick={handleCopy}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                  title="Copy domain"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Root: <span className="text-cyan-300">{domain.rootDomain}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Live HTTP Prober Section */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>{lang === 'fa' ? 'تست زنده سلامت و پاسخ سرور' : 'Live HTTP Health Check'}</span>
              </div>
              <button
                onClick={() => onProbe(domain.domain)}
                disabled={isProbing}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Activity className={`w-3.5 h-3.5 ${isProbing ? 'animate-spin' : ''}`} />
                <span>
                  {isProbing 
                    ? (lang === 'fa' ? 'در حال ارسال درخواست...' : 'Probing...') 
                    : (lang === 'fa' ? 'بررسی زنده وضعیت (Ping)' : 'Probe HTTP Status')}
                </span>
              </button>
            </div>

            {probeResult ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">HTTP Status</span>
                  <span className={`font-bold mt-1 block ${probeResult.status === 200 ? 'text-emerald-400' : probeResult.status > 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {probeResult.status > 0 ? `${probeResult.status} ${probeResult.ok ? 'OK' : ''}` : 'Timeout / Offline'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">Response Time</span>
                  <span className="text-cyan-400 font-bold mt-1 block">
                    {probeResult.latencyMs} ms
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">Web Server</span>
                  <span className="text-slate-300 mt-1 block truncate" title={probeResult.server}>
                    {probeResult.server || 'Hidden'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">State</span>
                  <span className={`font-bold mt-1 block ${probeResult.ok ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {probeResult.ok ? 'Responding' : 'No Response'}
                  </span>
                </div>

                {probeResult.title && (
                  <div className="col-span-2 sm:col-span-4 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">HTML Page Title:</span>
                    <span className="text-white text-xs font-sans mt-0.5 block truncate">
                      {probeResult.title}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                {lang === 'fa' 
                  ? 'هنوز بررسی نشده است. دکمه "بررسی زنده وضعیت" را بزنید تا وضعیت فعلی سایت چک شود.' 
                  : 'Not probed yet. Click "Probe HTTP Status" to check if the site is currently online.'}
              </p>
            )}
          </div>

          {/* Discovery Sources & Timestamps */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {lang === 'fa' ? 'منبع و تاریخچه کشف دامنه' : 'Discovery Intelligence'}
            </h4>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{lang === 'fa' ? 'منابع کاشف:' : 'Discovered by:'}</span>
                <div className="flex flex-wrap gap-1">
                  {domain.sources.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {domain.recordType && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">DNS Record Type</span>
                  <span className="text-white font-mono">{domain.recordType}</span>
                </div>
              )}

              {domain.firstSeen && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">{lang === 'fa' ? 'اولین بار ثبت‌شده:' : 'First Recorded:'}</span>
                  <span className="text-slate-300 font-mono">{domain.firstSeen}</span>
                </div>
              )}

              {domain.lastSeen && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">{lang === 'fa' ? 'آخرین فعالیت فعال:' : 'Last Seen:'}</span>
                  <span className="text-emerald-400 font-mono">{domain.lastSeen}</span>
                </div>
              )}
            </div>
          </div>

          {/* External OSINT Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {lang === 'fa' ? 'ابزارهای تحلیل خارجی (OSINT)' : 'External OSINT Investigation'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              
              <a
                href={`https://who.is/whois/${domain.rootDomain}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all group"
              >
                <span>Whois Record Lookup</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
              </a>

              <a
                href={`https://dnschecker.org/#A/${domain.domain}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all group"
              >
                <span>Global DNS Propagation</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
              </a>

              <a
                href={`https://web.archive.org/web/*/${domain.domain}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all group"
              >
                <span>Wayback Machine History</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
              </a>

              <a
                href={`https://www.virustotal.com/gui/domain/${domain.domain}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all group"
              >
                <span>VirusTotal Security Scan</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
              </a>

            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <a
            href={`http://${domain.domain}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-colors"
          >
            <span>{lang === 'fa' ? 'باز کردن وبسایت' : 'Visit Website'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            {lang === 'fa' ? 'بستن' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
