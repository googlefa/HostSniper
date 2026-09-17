export interface GeoInfo {
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
  query?: string;
}

export interface DiscoveredDomain {
  domain: string;
  rootDomain: string;
  sources: string[];
  firstSeen?: string;
  lastSeen?: string;
  recordType?: string;
}

export interface TlsCertInfo {
  cn?: string;
  issuer?: string;
  validTo?: string;
  sans: string[];
}

export interface DnsRecords {
  A: string[];
  AAAA: string[];
  MX: string[];
  NS: string[];
}

export interface ReverseIpResponse {
  success: boolean;
  message?: string;
  query: string;
  isTargetIp: boolean;
  ip: string;
  allIps: string[];
  ptr: string | null;
  geo: GeoInfo | null;
  dnsRecords: DnsRecords;
  tlsCert: TlsCertInfo | null;
  totalDomains: number;
  uniqueRootDomains: number;
  sourcesUsed: string[];
  domains: DiscoveredDomain[];
}

export interface DomainProbeResult {
  status: number;
  ok: boolean;
  title?: string;
  server?: string;
  latencyMs: number;
}
