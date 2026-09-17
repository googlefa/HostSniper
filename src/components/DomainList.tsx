import React, { useState, useMemo } from 'react';
import { 
  Globe, Search, Download, Copy, Check, ExternalLink, Activity, 
  Filter, Eye, ArrowUpDown, ChevronLeft, ChevronRight, FileText, 
  Layers, Code, Shield, CheckCircle2, AlertCircle
} from 'lucide-react';
import { DiscoveredDomain, DomainProbeResult } from '../types';

interface DomainListProps {
  domains: DiscoveredDomain[];
  totalDomains: number;
  uniqueRootDomains: number;
  ip: string;
  lang: 'fa' | 'en';
  onSelectDomain: (domain: DiscoveredDomain) => void;
  probeResults: Record<string, DomainProbeResult>;
  onProbeDomain: (domain: string) => void;
  onBatchProbe: (domains: string[]) => void;
  isBatchProbing: boolean;
}

export const DomainList: React.FC<DomainListProps> = ({
  domains,
  totalDomains,
  uniqueRootDomains,
  ip,
  lang,
  onSelectDomain,
  probeResults,
  onProbeDomain,
  onBatchProbe,
  isBatchProbing
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTld, setSelectedTld] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'sources'>('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSingle, setCopiedSingle] = useState<string | null>(null);

  // Compute top TLDs
  const topTlds = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of domains) {
      const parts = d.domain.split('.');
      const tld = '.' + parts[parts.length - 1];
      counts[tld] = (counts[tld] || 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tld, count]) => ({ tld, count }));
  }, [domains]);

  // Unique sources
  const allSources = useMemo(() => {
    const set = new Set<string>();
    for (const d of domains) {
      d.sources.forEach(s => set.add(s));
    }
    return Array.from(set);
  }, [domains]);

  // Filter & sort
  const filteredDomains = useMemo(() => {
    return domains
      .filter((item) => {
        // Query match
        const matchesQuery = 
          !searchQuery.trim() || 
          item.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.rootDomain.toLowerCase().includes(searchQuery.toLowerCase());

        // TLD match
        const matchesTld = 
          selectedTld === 'all' || 
          item.domain.toLowerCase().endsWith(selectedTld.toLowerCase());

        // Source match
        const matchesSource = 
          selectedSource === 'all' || 
          item.sources.some(s => s.toLowerCase().includes(selectedSource.toLowerCase()));

        return matchesQuery && matchesTld && matchesSource;
      })
      .sort((a, b) => {
        if (sortBy === 'name-asc') return a.domain.localeCompare(b.domain);
        if (sortBy === 'name-desc') return b.domain.localeCompare(a.domain);
        if (sortBy === 'sources') return b.sources.length - a.sources.length;
        return 0;
      });
  }, [domains, searchQuery, selectedTld, selectedSource, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredDomains.length / pageSize) || 1;
  const paginatedDomains = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDomains.slice(start, start + pageSize);
  }, [filteredDomains, currentPage, pageSize]);

  // Copy All to clipboard
  const handleCopyAll = () => {
    const text = filteredDomains.map(d => d.domain).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopyOne = (domain: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(domain);
    setCopiedSingle(domain);
    setTimeout(() => setCopiedSingle(null), 1500);
  };

  // Export as TXT
  const handleDownloadTxt = () => {
    const content = filteredDomains.map(d => d.domain).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reverse-ip-${ip}-domains.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export as CSV
  const handleDownloadCsv = () => {
    const headers = ['Domain', 'Root Domain', 'Sources', 'First Seen', 'Last Seen', 'Record Type'];
    const rows = filteredDomains.map(d => [
      `"${d.domain}"`,
      `"${d.rootDomain}"`,
      `"${d.sources.join('; ')}"`,
      `"${d.firstSeen || ''}"`,
      `"${d.lastSeen || ''}"`,
      `"${d.recordType || ''}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reverse-ip-${ip}-domains.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export as JSON
  const handleDownloadJson = () => {
    const content = JSON.stringify({
      ip,
      totalCount: filteredDomains.length,
      exportedAt: new Date().toISOString(),
      domains: filteredDomains
    }, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reverse-ip-${ip}-domains.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl bg-[#0d1424]/90 border border-slate-800/90 shadow-xl backdrop-blur-xl overflow-hidden transition-all">
      
      {/* Top Controls Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-slate-900/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Counter Summary */}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span>{lang === 'fa' ? 'فهرست سایت‌های هم‌میزبان روی سرور' : 'Co-Hosted Websites'}</span>
              <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                {totalDomains.toLocaleString()} {lang === 'fa' ? 'سایت' : 'domains'}
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'fa' 
              ? `شامل ${uniqueRootDomains.toLocaleString()} دامنه ریشه مستقل شناسایی‌شده از پایگاه‌های داده امنیتی` 
              : `Encompassing ${uniqueRootDomains.toLocaleString()} unique root domains discovered`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Probe Current Page */}
          <button
            onClick={() => onBatchProbe(paginatedDomains.map(d => d.domain))}
            disabled={isBatchProbing || paginatedDomains.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/60 text-xs font-medium transition-all disabled:opacity-50 cursor-pointer"
            title={lang === 'fa' ? 'ارسال درخواست پینگ به سایت‌های صفحه جاری' : 'Check status of current page domains'}
          >
            <Activity className={`w-3.5 h-3.5 ${isBatchProbing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>
              {isBatchProbing 
                ? (lang === 'fa' ? 'در حال پینگ...' : 'Probing...') 
                : (lang === 'fa' ? 'تست پینگ صفحه جاری' : 'Ping Current Page')}
            </span>
          </button>

          {/* Copy All */}
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all"
            title="Copy all domains"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAll ? (lang === 'fa' ? 'کپی شد!' : 'Copied!') : (lang === 'fa' ? 'کپی همه' : 'Copy All')}</span>
          </button>

          {/* Export TXT */}
          <button
            onClick={handleDownloadTxt}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-all"
            title="Download TXT list"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>TXT</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-all"
            title="Download CSV table"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-all"
            title="Download JSON structure"
          >
            <Code className="w-3.5 h-3.5 text-amber-400" />
            <span>JSON</span>
          </button>

        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800/60 bg-slate-900/30 space-y-3">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              dir="ltr"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={lang === 'fa' ? 'فیلتر سریع نام دامنه (مثلاً .com یا google یا نام سایت)...' : 'Filter domains or extensions...'}
              className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-cyan-500/80 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none transition-all"
            />
          </div>

          {/* Source Filter Selector */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedSource}
              onChange={(e) => {
                setSelectedSource(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
            >
              <option value="all">{lang === 'fa' ? 'همه موتورهای استعلام' : 'All Sources'}</option>
              {allSources.map(src => (
                <option key={src} value={src}>{src}</option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
            >
              <option value="name-asc">{lang === 'fa' ? 'حروف الفبا (A به Z)' : 'Alphabetical (A-Z)'}</option>
              <option value="name-desc">{lang === 'fa' ? 'حروف الفبا (Z به A)' : 'Alphabetical (Z-A)'}</option>
              <option value="sources">{lang === 'fa' ? 'بیشترین منبع تاییدشده' : 'Most Confirmed'}</option>
            </select>
          </div>

        </div>

        {/* TLD Quick Filter Badges */}
        {topTlds.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-500 font-medium mr-1">
              {lang === 'fa' ? 'پسوندهای پرتکرار:' : 'Top TLDs:'}
            </span>
            <button
              onClick={() => { setSelectedTld('all'); setCurrentPage(1); }}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                selectedTld === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {lang === 'fa' ? 'همه پسوندها' : 'All'}
            </button>
            {topTlds.map(({ tld, count }) => (
              <button
                key={tld}
                onClick={() => { setSelectedTld(tld); setCurrentPage(1); }}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all flex items-center gap-1 ${
                  selectedTld === tld
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{tld}</span>
                <span className="text-[9px] text-slate-500">({count})</span>
              </button>
            ))}
          </div>
        )}

      </div>

      {/* Domains Table / List */}
      <div className="overflow-x-auto">
        {paginatedDomains.length > 0 ? (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-mono uppercase text-[11px]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">{lang === 'fa' ? 'نام دامنه و وبسایت' : 'Domain / Hostname'}</th>
                <th className="py-3 px-4 hidden md:table-cell">{lang === 'fa' ? 'دامنه ریشه' : 'Root Domain'}</th>
                <th className="py-3 px-4 hidden sm:table-cell">{lang === 'fa' ? 'منبع کشف' : 'Sources'}</th>
                <th className="py-3 px-4 text-center">{lang === 'fa' ? 'وضعیت زنده (HTTP)' : 'Live Health'}</th>
                <th className="py-3 px-4 text-center w-24">{lang === 'fa' ? 'عملیات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-mono">
              {paginatedDomains.map((item, index) => {
                const probe = probeResults[item.domain];
                const globalIndex = (currentPage - 1) * pageSize + index + 1;

                return (
                  <tr
                    key={item.domain}
                    onClick={() => onSelectDomain(item)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    {/* Index */}
                    <td className="py-3 px-4 text-center text-slate-500 text-[11px]">
                      {globalIndex}
                    </td>

                    {/* Domain Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors text-sm">
                          {item.domain}
                        </span>
                        {item.domain.startsWith('www.') && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">WWW</span>
                        )}
                      </div>
                    </td>

                    {/* Root Domain */}
                    <td className="py-3 px-4 text-slate-400 hidden md:table-cell">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                        {item.rootDomain}
                      </span>
                    </td>

                    {/* Sources */}
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {item.sources.map((src, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-cyan-400 border border-slate-800"
                          >
                            {src.replace(' Engine', '').replace(' Reverse DNS', '')}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Live Health Badge */}
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      {probe ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-950 border border-slate-800">
                          {probe.ok ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span className="text-emerald-400 font-bold">{probe.status} OK</span>
                              <span className="text-slate-500 text-[9px]">{probe.latencyMs}ms</span>
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                              <span className="text-rose-400">{probe.status > 0 ? probe.status : 'Offline'}</span>
                            </>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => onProbeDomain(item.domain)}
                          className="px-2 py-0.5 rounded text-[10px] bg-slate-900 hover:bg-cyan-950 text-slate-400 hover:text-cyan-300 border border-slate-800 hover:border-cyan-800 transition-colors"
                          title="Check HTTP status"
                        >
                          {lang === 'fa' ? 'تست پینگ' : 'Ping'}
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* Copy button */}
                        <button
                          onClick={(e) => handleCopyOne(item.domain, e)}
                          title="Copy domain"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                        >
                          {copiedSingle === item.domain ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Open in new tab */}
                        <a
                          href={`http://${item.domain}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Open website"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {/* Details Modal Trigger */}
                        <button
                          onClick={() => onSelectDomain(item)}
                          title="Inspect details"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Search className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-sm font-medium">
              {lang === 'fa' ? 'هیچ دامنه‌ای با فیلترهای انتخابی مطابقت ندارد.' : 'No domains match your search query.'}
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedTld('all'); setSelectedSource('all'); }}
              className="text-xs text-cyan-400 hover:underline mt-1"
            >
              {lang === 'fa' ? 'پاکسازی فیلترها' : 'Clear filters'}
            </button>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          
          <div className="text-slate-400 font-mono">
            {lang === 'fa' ? 'نمایش' : 'Showing'}{' '}
            <span className="text-white font-bold">{(currentPage - 1) * pageSize + 1}</span>{' '}
            {lang === 'fa' ? 'تا' : 'to'}{' '}
            <span className="text-white font-bold">{Math.min(currentPage * pageSize, filteredDomains.length)}</span>{' '}
            {lang === 'fa' ? 'از' : 'of'}{' '}
            <span className="text-cyan-400 font-bold">{filteredDomains.length.toLocaleString()}</span>{' '}
            {lang === 'fa' ? 'سایت فیلترشده' : 'domains'}
          </div>

          <div className="flex items-center gap-2">
            {/* Page size selector */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 font-mono text-xs focus:outline-none"
            >
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180 sm:rotate-0" />
              </button>

              <span className="px-3 py-1 font-mono text-slate-300 bg-slate-900 border border-slate-800 rounded-lg">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 rotate-180 sm:rotate-0" />
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
