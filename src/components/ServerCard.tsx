import React, { useState } from 'react';
import { Server, MapPin, Network, Lock, Copy, Check, ExternalLink, ShieldCheck, Dna, Info } from 'lucide-react';
import { ReverseIpResponse } from '../types';

interface ServerCardProps {
  data: ReverseIpResponse;
  lang: 'fa' | 'en';
}

export const ServerCard: React.FC<ServerCardProps> = ({ data, lang }) => {
  const [copiedIp, setCopiedIp] = useState(false);
  const [copiedPtr, setCopiedPtr] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'dns' | 'ssl'>('overview');

  const handleCopyIp = () => {
    navigator.clipboard.writeText(data.ip);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  const handleCopyPtr = () => {
    if (data.ptr) {
      navigator.clipboard.writeText(data.ptr);
      setCopiedPtr(true);
      setTimeout(() => setCopiedPtr(false), 2000);
    }
  };

  const geo = data.geo;

  return (
    <div className="rounded-2xl bg-[#0d1424]/90 border border-slate-800/90 shadow-xl backdrop-blur-xl overflow-hidden mb-8 transition-all">
      {/* Top Banner Header */}
      <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-[#0d1527] to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* IP & Target Info */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide">
                {data.ip}
              </h2>
              <button
                onClick={handleCopyIp}
                title={lang === 'fa' ? 'کپی آدرس آی‌پی' : 'Copy IP'}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
              >
                {copiedIp ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>{lang === 'fa' ? 'آی‌پی فعال و پاسخ‌دهنده' : 'Active Resolved IP'}</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-1 font-mono">
              <span className="text-slate-500">{lang === 'fa' ? 'ورودی جستجو:' : 'Target:'}</span>{' '}
              <span className="text-cyan-300 font-semibold">{data.query}</span>
              {data.allIps.length > 1 && (
                <span className="text-slate-500 mr-2 ml-2">
                  ({data.allIps.length} {lang === 'fa' ? 'آی‌پی شناسایی‌شده' : 'IPs resolved'})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'fa' ? 'مشخصات سرور' : 'Host Overview'}
          </button>
          <button
            onClick={() => setActiveTab('dns')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'dns'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'fa' ? 'رکوردهای DNS' : 'DNS Records'}
          </button>
          <button
            onClick={() => setActiveTab('ssl')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'ssl'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'fa' ? 'گواهی SSL/TLS' : 'SSL/TLS Cert'}
          </button>
        </div>

      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Location Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>{lang === 'fa' ? 'موقعیت جغرافیایی سرور' : 'Geo Location'}</span>
            </div>
            
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">{lang === 'fa' ? 'کشور' : 'Country'}</span>
                <span className="text-white font-medium flex items-center gap-1.5">
                  {geo?.country || (lang === 'fa' ? 'نامشخص' : 'Unknown')}
                  {geo?.countryCode && (
                    <span className="font-mono text-xs text-slate-400">({geo.countryCode})</span>
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">{lang === 'fa' ? 'شهر / استان' : 'City / Region'}</span>
                <span className="text-slate-200 font-medium">
                  {geo?.city || geo?.regionName || '—'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">{lang === 'fa' ? 'منطقه زمانی' : 'Timezone'}</span>
                <span className="text-slate-300 font-mono text-xs">{geo?.timezone || '—'}</span>
              </div>

              {geo?.lat !== undefined && geo?.lon !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs">{lang === 'fa' ? 'مختصات' : 'Coordinates'}</span>
                  <span className="text-cyan-400 font-mono text-xs">
                    {geo.lat.toFixed(3)}, {geo.lon.toFixed(3)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Network & ISP Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Network className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'fa' ? 'ارائه‌دهنده و شبکه (ISP)' : 'Network & Provider'}</span>
            </div>
            
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">{lang === 'fa' ? 'سرویس‌دهنده (ISP)' : 'ISP'}</span>
                <span className="text-white font-medium truncate max-w-[170px]" title={geo?.isp}>
                  {geo?.isp || '—'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">{lang === 'fa' ? 'سازمان (Org)' : 'Organization'}</span>
                <span className="text-slate-200 font-medium truncate max-w-[170px]" title={geo?.org}>
                  {geo?.org || '—'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">AS Number</span>
                <span className="text-amber-400 font-mono text-xs truncate max-w-[170px]" title={geo?.as}>
                  {geo?.as || '—'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">{lang === 'fa' ? 'نوع سرور' : 'Host Type'}</span>
                <span className="text-emerald-400 text-xs font-mono">
                  {data.isTargetIp ? 'Direct IP' : 'Domain-Resolved'}
                </span>
              </div>
            </div>
          </div>

          {/* Reverse DNS PTR & Sources */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'fa' ? 'هویت معکوس (PTR) و منابع' : 'PTR Record & Sources'}</span>
            </div>
            
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-sm">
              <div>
                <span className="text-slate-400 text-xs block mb-1">
                  {lang === 'fa' ? 'رکورد معکوس معتبر (PTR Hostname):' : 'PTR Hostname:'}
                </span>
                {data.ptr ? (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300">
                    <span className="truncate" title={data.ptr}>{data.ptr}</span>
                    <button onClick={handleCopyPtr} className="p-1 hover:text-white transition-colors shrink-0">
                      {copiedPtr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ) : (
                  <span className="text-slate-500 text-xs italic">
                    {lang === 'fa' ? 'فاقد رکورد معکوس PTR عمومی' : 'No public PTR record configured'}
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-slate-400 text-xs block mb-1.5">
                  {lang === 'fa' ? 'موتورهای استعلام فعال:' : 'Active Discovery Engines:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {data.sourcesUsed.map((src, i) => (
                    <span key={i} className="px-2 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300 font-mono">
                      {src}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: DNS Records */}
      {activeTab === 'dns' && (
        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* A & AAAA */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 font-mono">
                A / AAAA Records (IP Addresses)
              </h4>
              {data.allIps.length > 0 ? (
                <div className="space-y-1.5 font-mono text-xs">
                  {data.allIps.map((ip, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-200 flex justify-between">
                      <span>{ip}</span>
                      <span className="text-slate-500">{ip.includes(':') ? 'IPv6' : 'IPv4'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No A records found</p>
              )}
            </div>

            {/* MX Records */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 font-mono">
                MX Records (Mail Servers)
              </h4>
              {data.dnsRecords.MX && data.dnsRecords.MX.length > 0 ? (
                <div className="space-y-1.5 font-mono text-xs">
                  {data.dnsRecords.MX.map((mx, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-200 truncate">
                      {mx}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  {lang === 'fa' ? 'رکورد MX برای این دامنه ثبت نشده است' : 'No MX records for this target'}
                </p>
              )}
            </div>

            {/* NS Records */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 md:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 font-mono">
                Name Servers (NS)
              </h4>
              {data.dnsRecords.NS && data.dnsRecords.NS.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                  {data.dnsRecords.NS.map((ns, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-200 truncate">
                      {ns}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  {lang === 'fa' ? 'رکوردهای نیم‌سرور در این استعلام دریافت نشد' : 'No NS records returned'}
                </p>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Tab 3: SSL/TLS Certificate */}
      {activeTab === 'ssl' && (
        <div className="p-5 sm:p-6">
          {data.tlsCert ? (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-xs block">Common Name (CN)</span>
                  <span className="text-white font-mono font-medium text-xs mt-1 block truncate">
                    {data.tlsCert.cn || '—'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-xs block">Issuer (صادرکننده)</span>
                  <span className="text-slate-200 font-mono text-xs mt-1 block truncate">
                    {data.tlsCert.issuer || '—'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-xs block">تاریخ انقضا</span>
                  <span className="text-emerald-400 font-mono text-xs mt-1 block">
                    {data.tlsCert.validTo || '—'}
                  </span>
                </div>
              </div>

              {data.tlsCert.sans && data.tlsCert.sans.length > 0 && (
                <div>
                  <span className="text-xs text-slate-400 font-medium block mb-2">
                    {lang === 'fa' 
                      ? `دامنه‌های موجود در گواهی امنیتی (${data.tlsCert.sans.length} دامنه SAN):` 
                      : `Subject Alternative Names (${data.tlsCert.sans.length} SAN domains):`}
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-950 rounded-lg border border-slate-800">
                    {data.tlsCert.sans.map((san, idx) => (
                      <span key={idx} className="px-2 py-0.5 text-xs font-mono rounded bg-slate-900 text-cyan-300 border border-slate-800">
                        {san}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 text-sm">
              <Lock className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p>{lang === 'fa' ? 'گواهی امنیتی عمومی روی پورت 443 این آی‌پی یافت نشد یا دسترسی مستقیم مسدود است.' : 'No public TLS certificate on port 443 found or SNI is strictly enforced.'}</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
