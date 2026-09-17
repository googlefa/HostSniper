import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { SearchHero } from './components/SearchHero';
import { ServerCard } from './components/ServerCard';
import { DomainList } from './components/DomainList';
import { DomainModal } from './components/DomainModal';
import { LoadingScanner } from './components/LoadingScanner';
import { EmptyState } from './components/EmptyState';
import { ReverseIpResponse, DiscoveredDomain, DomainProbeResult } from './types';
import { AlertTriangle, RefreshCw, Terminal, CheckCircle } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const [currentQuery, setCurrentQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReverseIpResponse | null>(null);

  // Inspector modal state
  const [selectedDomain, setSelectedDomain] = useState<DiscoveredDomain | null>(null);
  const [probeResults, setProbeResults] = useState<Record<string, DomainProbeResult>>({});
  const [probingDomain, setProbingDomain] = useState<string | null>(null);
  const [isBatchProbing, setIsBatchProbing] = useState(false);

  // Synchronize document direction with language
  useEffect(() => {
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Handle Search
  const handleSearch = async (target: string) => {
    if (!target.trim()) return;
    setIsLoading(true);
    setError(null);
    setCurrentQuery(target.trim());

    try {
      const res = await fetch(`/api/reverse-ip?target=${encodeURIComponent(target.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || (lang === 'fa' ? 'خطا در واکشی اطلاعات ریورس آی‌پی' : 'Failed to perform Reverse IP lookup'));
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || (lang === 'fa' ? 'خطایی در ارتباط با سرور رخ داد' : 'Network error occurred'));
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Probe single domain
  const handleProbeDomain = async (domain: string) => {
    setProbingDomain(domain);
    try {
      const res = await fetch(`/api/probe-domain?domain=${encodeURIComponent(domain)}`);
      const data = await res.json();
      setProbeResults((prev) => ({
        ...prev,
        [domain]: data
      }));
    } catch {
      setProbeResults((prev) => ({
        ...prev,
        [domain]: { status: 0, ok: false, latencyMs: 0 }
      }));
    } finally {
      setProbingDomain(null);
    }
  };

  // Batch probe domains
  const handleBatchProbe = async (domains: string[]) => {
    if (domains.length === 0 || isBatchProbing) return;
    setIsBatchProbing(true);
    try {
      const res = await fetch('/api/batch-probe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domains })
      });
      const data = await res.json();
      if (data.results) {
        setProbeResults((prev) => ({
          ...prev,
          ...data.results
        }));
      }
    } catch {
      // Ignore
    } finally {
      setIsBatchProbing(false);
    }
  };

  // Reset to initial state
  const handleReset = () => {
    setResult(null);
    setError(null);
    setCurrentQuery('');
    setProbeResults({});
    setSelectedDomain(null);
  };

  return (
    <div className={`min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-['Vazirmatn',sans-serif] selection:bg-cyan-500/30 selection:text-cyan-200 ${lang === 'fa' ? 'rtl' : 'ltr'}`}>
      
      {/* Top Navigation */}
      <Navbar
        isScanning={isLoading}
        onReset={handleReset}
        lang={lang}
        onToggleLang={() => setLang(l => (l === 'fa' ? 'en' : 'fa'))}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col">
        
        {/* Search Hero Section */}
        <SearchHero
          onSearch={handleSearch}
          isLoading={isLoading}
          lang={lang}
        />

        {/* Error Notification */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto w-full mb-8 p-4 rounded-2xl bg-rose-950/40 border border-rose-800/80 text-rose-300 flex items-start gap-3.5 shadow-lg backdrop-blur-md"
          >
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <span className="font-bold block mb-1">
                {lang === 'fa' ? 'عدم امکان واکشی اطلاعات' : 'Lookup Failed'}
              </span>
              <p className="text-xs text-rose-300/90 leading-relaxed">{error}</p>
            </div>
            <button
              onClick={() => handleSearch(currentQuery)}
              className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-rose-200 text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{lang === 'fa' ? 'تلاش مجدد' : 'Retry'}</span>
            </button>
          </motion.div>
        )}

        {/* Active Scanning Indicator */}
        {isLoading && (
          <LoadingScanner
            target={currentQuery}
            lang={lang}
          />
        )}

        {/* Search Results Display */}
        {!isLoading && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Server Profile & Overview Card */}
            <ServerCard
              data={result}
              lang={lang}
            />

            {/* Co-Hosted Domains List & Filter Engine */}
            <DomainList
              domains={result.domains}
              totalDomains={result.totalDomains}
              uniqueRootDomains={result.uniqueRootDomains}
              ip={result.ip}
              lang={lang}
              onSelectDomain={setSelectedDomain}
              probeResults={probeResults}
              onProbeDomain={handleProbeDomain}
              onBatchProbe={handleBatchProbe}
              isBatchProbing={isBatchProbing}
            />
          </motion.div>
        )}

        {/* Empty State / Explanatory Guidance */}
        {!isLoading && !result && !error && (
          <EmptyState lang={lang} />
        )}

      </main>

      {/* Domain Detail Inspector Modal */}
      <AnimatePresence>
        {selectedDomain && (
          <DomainModal
            domain={selectedDomain}
            onClose={() => setSelectedDomain(null)}
            probeResult={probeResults[selectedDomain.domain]}
            onProbe={handleProbeDomain}
            isProbing={probingDomain === selectedDomain.domain}
            lang={lang}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900/90 py-6 mt-12 bg-[#05080f] text-slate-500 text-xs text-center font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Reverse IP OSINT Suite — Real-time Multi-Engine Recon</span>
          </div>
          <p>
            {lang === 'fa' 
              ? 'بدون نیاز به ثبت‌نام • استعلام مستقیم از AlienVault OTX و منابع باز شبکه' 
              : 'Zero API Key Required • Powered by Passive DNS & Open Network Intelligence'}
          </p>
        </div>
      </footer>

    </div>
  );
}
