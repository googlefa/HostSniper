import express from 'express';
import path from 'path';
import tls from 'tls';
import dns from 'dns';
import { createServer as createViteServer } from 'vite';

const dnsPromises = dns.promises;
const PORT = 3000;

interface GeoInfo {
  status?: string;
  country?: string;
  countryCode?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
}

interface DiscoveredDomain {
  domain: string;
  rootDomain: string;
  sources: string[];
  firstSeen?: string;
  lastSeen?: string;
  recordType?: string;
}

// Helper to clean and sanitize input domain or IP
function sanitizeInput(raw: string): string {
  let cleaned = raw.trim();
  // Strip protocol
  cleaned = cleaned.replace(/^[a-zA-Z]+:\/\//, '');
  // Strip path and query parameters
  cleaned = cleaned.split('/')[0];
  cleaned = cleaned.split('?')[0];
  cleaned = cleaned.split('#')[0];
  // Strip port if not an IPv6 address
  if (!cleaned.includes(']')) {
    cleaned = cleaned.split(':')[0];
  }
  // Strip @ user prefix if any
  if (cleaned.includes('@')) {
    cleaned = cleaned.split('@').pop() || cleaned;
  }
  return cleaned.toLowerCase().trim();
}

function isIpAddress(str: string): boolean {
  // IPv4 regex
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(str)) {
    const parts = str.split('.').map(Number);
    return parts.every(p => p >= 0 && p <= 255);
  }
  // IPv6 check
  return str.includes(':');
}

function extractRootDomain(hostname: string): string {
  const parts = hostname.toLowerCase().split('.');
  if (parts.length <= 2) return hostname;
  // Handle two-part TLDs like co.uk, com.au, ir.tc etc
  const secondLevelTlds = ['co.uk', 'gov.uk', 'ac.uk', 'org.uk', 'com.au', 'net.au', 'co.ir', 'ac.ir', 'sch.ir', 'org.ir', 'gov.ir', 'id.ir'];
  const lastTwo = parts.slice(-2).join('.');
  if (secondLevelTlds.includes(lastTwo) && parts.length > 2) {
    return parts.slice(-3).join('.');
  }
  return parts.slice(-2).join('.');
}

// Safe fetch wrapper with timeout
async function safeFetch(url: string, options: RequestInit = {}, timeoutMs = 4500): Promise<Response | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...(options.headers || {})
      }
    });
    clearTimeout(timeoutId);
    return res;
  } catch {
    return null;
  }
}

// DNS resolver with fallback to Google DoH
async function resolveDomainToIp(domain: string): Promise<{ ipv4List: string[]; ipv6List: string[]; mxList: string[]; nsList: string[] }> {
  const ipv4List: string[] = [];
  const ipv6List: string[] = [];
  const mxList: string[] = [];
  const nsList: string[] = [];

  // Try Google DoH first
  try {
    const dohA = await safeFetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`, {}, 3000);
    if (dohA && dohA.ok) {
      const data = await dohA.json();
      if (data.Answer && Array.isArray(data.Answer)) {
        for (const ans of data.Answer) {
          if (ans.type === 1 && ans.data && isIpAddress(ans.data)) {
            ipv4List.push(ans.data);
          }
        }
      }
    }
  } catch {
    // Ignore DoH error
  }

  // Fallback to node DNS if DoH failed or empty
  if (ipv4List.length === 0) {
    try {
      const resolved = await dnsPromises.resolve4(domain);
      ipv4List.push(...resolved);
    } catch {
      // Ignore
    }
  }

  // Try resolving IPv6
  try {
    const dohAaaa = await safeFetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=AAAA`, {}, 2500);
    if (dohAaaa && dohAaaa.ok) {
      const data = await dohAaaa.json();
      if (data.Answer && Array.isArray(data.Answer)) {
        for (const ans of data.Answer) {
          if (ans.type === 28 && ans.data) {
            ipv6List.push(ans.data);
          }
        }
      }
    }
  } catch {
    // Ignore
  }

  // MX and NS records
  try {
    const dohMx = await safeFetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`, {}, 2500);
    if (dohMx && dohMx.ok) {
      const data = await dohMx.json();
      if (data.Answer && Array.isArray(data.Answer)) {
        for (const ans of data.Answer) {
          if (ans.data) mxList.push(ans.data);
        }
      }
    }
  } catch {
    // Ignore
  }

  try {
    const dohNs = await safeFetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=NS`, {}, 2500);
    if (dohNs && dohNs.ok) {
      const data = await dohNs.json();
      if (data.Answer && Array.isArray(data.Answer)) {
        for (const ans of data.Answer) {
          if (ans.data) nsList.push(ans.data.replace(/\.$/, ''));
        }
      }
    }
  } catch {
    // Ignore
  }

  return {
    ipv4List: Array.from(new Set(ipv4List)),
    ipv6List: Array.from(new Set(ipv6List)),
    mxList: Array.from(new Set(mxList)),
    nsList: Array.from(new Set(nsList))
  };
}

// Reverse PTR Lookup via Google DoH and Node DNS
async function resolvePtr(ip: string): Promise<string | null> {
  if (!ip || !isIpAddress(ip) || ip.includes(':')) return null;

  try {
    const reverseParts = ip.split('.').reverse().join('.') + '.in-addr.arpa';
    const res = await safeFetch(`https://dns.google/resolve?name=${reverseParts}&type=PTR`, {}, 2500);
    if (res && res.ok) {
      const data = await res.json();
      if (data.Answer && Array.isArray(data.Answer) && data.Answer.length > 0) {
        const ptrData = data.Answer[0].data;
        if (typeof ptrData === 'string') {
          return ptrData.replace(/\.$/, '');
        }
      }
    }
  } catch {
    // Ignore DoH PTR error
  }

  try {
    const hostnames = await dnsPromises.reverse(ip);
    if (hostnames && hostnames.length > 0) {
      return hostnames[0];
    }
  } catch {
    // Ignore
  }

  return null;
}

// IP Geolocation via free ip-api.com
async function fetchGeo(ip: string): Promise<GeoInfo | null> {
  try {
    const res = await safeFetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,query`, {}, 3000);
    if (res && res.ok) {
      return await res.json();
    }
  } catch {
    // Ignore
  }
  return null;
}

// HackerTarget Reverse IP Lookup
async function fetchHackerTarget(ip: string): Promise<string[]> {
  try {
    const res = await safeFetch(`https://api.hackertarget.com/reverseiplookup/?q=${ip}`, {}, 4500);
    if (res && res.ok) {
      const text = await res.text();
      if (text.includes('No DNS A records found') || text.includes('error') || text.includes('API count exceeded')) {
        return [];
      }
      return text
        .split('\n')
        .map(line => line.trim().toLowerCase())
        .filter(line => line.length > 2 && line.includes('.') && !line.includes(' ') && !line.includes('html'));
    }
  } catch {
    // Ignore
  }
  return [];
}

// AlienVault OTX Passive DNS
async function fetchAlienVault(ip: string): Promise<Array<{ hostname: string; first?: string; last?: string; record_type?: string }>> {
  try {
    const res = await safeFetch(`https://otx.alienvault.com/api/v1/indicators/IPv4/${ip}/passive_dns`, {}, 5000);
    if (res && res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.passive_dns)) {
        return data.passive_dns.map((r: any) => ({
          hostname: String(r.hostname || '').toLowerCase().trim(),
          first: r.first,
          last: r.last,
          record_type: r.record_type
        })).filter((r: any) => r.hostname && r.hostname.includes('.'));
      }
    }
  } catch {
    // Ignore
  }
  return [];
}

// Extract TLS Certificate SANs
function fetchTlsCertSans(ip: string): Promise<{ cn?: string; issuer?: string; validTo?: string; sans: string[] } | null> {
  return new Promise((resolve) => {
    let resolved = false;
    const socket = tls.connect({
      host: ip,
      port: 443,
      rejectUnauthorized: false,
      timeout: 3000
    }, () => {
      if (resolved) return;
      resolved = true;
      try {
        const cert = socket.getPeerCertificate();
        socket.destroy();
        if (!cert || (!cert.subjectaltname && !cert.subject?.CN)) {
          return resolve(null);
        }
        const rawCn = cert.subject?.CN;
        const cn = Array.isArray(rawCn) ? rawCn[0] : rawCn;
        const rawIssuer = cert.issuer?.O || cert.issuer?.CN;
        const issuer = Array.isArray(rawIssuer) ? rawIssuer[0] : rawIssuer;

        const sans: string[] = [];
        if (cert.subjectaltname) {
          const list = cert.subjectaltname.split(',').map(s => s.trim().replace(/^DNS:/, '').toLowerCase()).filter(Boolean);
          sans.push(...list);
        }
        if (cn && typeof cn === 'string' && !sans.includes(cn.toLowerCase())) {
          sans.push(cn.toLowerCase());
        }
        resolve({
          cn: cn || undefined,
          issuer: issuer || undefined,
          validTo: cert.valid_to,
          sans: Array.from(new Set(sans)).filter(d => !d.startsWith('*.'))
        });
      } catch {
        resolve(null);
      }
    });

    socket.on('error', () => {
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
    });

    socket.on('timeout', () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(null);
      }
    });
  });
}

// Probe HTTP status of a single domain
async function probeDomain(domain: string): Promise<{ status: number; ok: boolean; title?: string; server?: string; latencyMs: number }> {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`http://${domain}`, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    let title = '';
    try {
      const html = await res.text();
      const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (match && match[1]) {
        title = match[1].trim().slice(0, 100);
      }
    } catch {
      // Ignore
    }

    return {
      status: res.status,
      ok: res.ok,
      server: res.headers.get('server') || undefined,
      title: title || undefined,
      latencyMs
    };
  } catch {
    return {
      status: 0,
      ok: false,
      latencyMs: Date.now() - startTime
    };
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Reverse IP endpoint
  app.get('/api/reverse-ip', async (req, res) => {
    const rawTarget = String(req.query.target || '').trim();
    if (!rawTarget) {
      return res.status(400).json({ success: false, message: 'لطفاً نام دامنه یا آدرس آی‌پی مورد نظر را وارد کنید' });
    }

    const cleaned = sanitizeInput(rawTarget);
    if (!cleaned) {
      return res.status(400).json({ success: false, message: 'فرمت ورودی معتبر نیست' });
    }

    const inputIsIp = isIpAddress(cleaned);
    let targetIp = '';
    let allIps: string[] = [];
    let dnsRecords = {
      A: [] as string[],
      AAAA: [] as string[],
      MX: [] as string[],
      NS: [] as string[]
    };

    if (inputIsIp) {
      targetIp = cleaned;
      allIps = [cleaned];
    } else {
      // Resolve hostname
      const dnsResult = await resolveDomainToIp(cleaned);
      if (dnsResult.ipv4List.length === 0 && dnsResult.ipv6List.length === 0) {
        return res.status(404).json({
          success: false,
          message: `دامنه "${cleaned}" به هیچ آدرس آی‌پی (A یا AAAA) اشاره نمی‌کند یا یافت نشد.`
        });
      }
      targetIp = dnsResult.ipv4List[0] || dnsResult.ipv6List[0];
      allIps = [...dnsResult.ipv4List, ...dnsResult.ipv6List];
      dnsRecords = {
        A: dnsResult.ipv4List,
        AAAA: dnsResult.ipv6List,
        MX: dnsResult.mxList,
        NS: dnsResult.nsList
      };
    }

    // Now run concurrent reverse IP discovery
    const [ptrResult, geoResult, htDomains, avRecords, tlsCertResult] = await Promise.all([
      resolvePtr(targetIp),
      fetchGeo(targetIp),
      fetchHackerTarget(targetIp),
      fetchAlienVault(targetIp),
      fetchTlsCertSans(targetIp)
    ]);

    // Aggregate domains
    const domainMap = new Map<string, DiscoveredDomain>();

    // Helper to register domain
    const addDomain = (
      domainName: string,
      source: string,
      firstSeen?: string,
      lastSeen?: string,
      recordType?: string
    ) => {
      let d = domainName.toLowerCase().trim();
      d = d.replace(/^\*\./, ''); // remove wildcard prefix
      if (!d || d.length < 3 || !d.includes('.') || d.includes(' ') || isIpAddress(d)) return;

      const existing = domainMap.get(d);
      if (existing) {
        if (!existing.sources.includes(source)) {
          existing.sources.push(source);
        }
        if (!existing.firstSeen && firstSeen) existing.firstSeen = firstSeen;
        if (!existing.lastSeen && lastSeen) existing.lastSeen = lastSeen;
        if (!existing.recordType && recordType) existing.recordType = recordType;
      } else {
        domainMap.set(d, {
          domain: d,
          rootDomain: extractRootDomain(d),
          sources: [source],
          firstSeen,
          lastSeen,
          recordType: recordType || 'A'
        });
      }
    };

    // 1. PTR record domain
    if (ptrResult) {
      addDomain(ptrResult, 'PTR Reverse DNS');
    }

    // 2. HackerTarget domains
    for (const d of htDomains) {
      addDomain(d, 'HackerTarget Engine');
    }

    // 3. AlienVault OTX Passive DNS
    for (const rec of avRecords) {
      addDomain(rec.hostname, 'AlienVault Passive DNS', rec.first, rec.last, rec.record_type);
    }

    // 4. TLS SANs
    if (tlsCertResult && tlsCertResult.sans) {
      for (const d of tlsCertResult.sans) {
        addDomain(d, 'TLS SSL Certificate');
      }
    }

    // If querying a domain and it wasn't discovered, ensure queried domain itself is present in the list
    if (!inputIsIp && cleaned) {
      addDomain(cleaned, 'Queried Target');
    }

    const domains = Array.from(domainMap.values()).sort((a, b) => a.domain.localeCompare(b.domain));

    // Unique root domains count
    const uniqueRootDomains = new Set(domains.map(d => d.rootDomain)).size;

    return res.json({
      success: true,
      query: cleaned,
      isTargetIp: inputIsIp,
      ip: targetIp,
      allIps,
      ptr: ptrResult,
      geo: geoResult,
      dnsRecords,
      tlsCert: tlsCertResult,
      totalDomains: domains.length,
      uniqueRootDomains,
      sourcesUsed: [
        'AlienVault Passive DNS',
        'HackerTarget Intelligence',
        'PTR Reverse DNS',
        'TLS SSL Certificate Extraction'
      ],
      domains
    });
  });

  // Single domain probe endpoint
  app.get('/api/probe-domain', async (req, res) => {
    const domain = String(req.query.domain || '').trim();
    if (!domain) {
      return res.status(400).json({ error: 'Domain required' });
    }
    const result = await probeDomain(domain);
    return res.json(result);
  });

  // Batch probe endpoint (up to 15 domains)
  app.post('/api/batch-probe', async (req, res) => {
    const domains: string[] = Array.isArray(req.body.domains) ? req.body.domains.slice(0, 15) : [];
    if (domains.length === 0) {
      return res.json({ results: {} });
    }
    const results: Record<string, any> = {};
    await Promise.all(
      domains.map(async (d) => {
        results[d] = await probeDomain(d);
      })
    );
    return res.json({ results });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Reverse IP server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
