import { useState, useEffect, useRef, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";

// ─── CONFIG ────────────────────────────────────────────────────────────────
const BACKEND = process.env.REACT_APP_BACKEND_URL || "";
const TOKEN   = "generosity-demo-token";
const DEVICE  = "gen2-hub-001";
const HDR     = { Authorization: `Bearer ${TOKEN}` };

// ─── STROKE-BASED SVG ICONS (matching nav bar style) ────────────────────────
function HubIcon({ name, size = 16, color = "#A6A8AB" }) {
  const s = size;
  const ic = color;
  const icons = {
    droplet: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 3C12 3 6 10 6 14C6 17.31 8.69 20 12 20C15.31 20 18 17.31 18 14C18 10 12 3 12 3Z" stroke={ic} strokeWidth="1.5" fill={`${ic}20`}/>
        <path d="M9 14C9 14 10 12 12 12" stroke={ic} strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    flask: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M9 3V10L4 18C3.5 19 4 20 5 20H19C20 20 20.5 19 20 18L15 10V3" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
        <line x1="8" y1="3" x2="16" y2="3" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7 15H17" stroke={ic} strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    target: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={ic} strokeWidth="1.5" fill="none"/>
        <circle cx="12" cy="12" r="5" stroke={ic} strokeWidth="1.3" fill="none"/>
        <circle cx="12" cy="12" r="1.5" fill={ic}/>
      </svg>
    ),
    check: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={ic} strokeWidth="1.5" fill="none"/>
        <path d="M8 12L11 15L16 9" stroke={ic} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    alertCircle: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={ic} strokeWidth="1.5" fill="none"/>
        <line x1="12" y1="8" x2="12" y2="13" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="16" r="1" fill={ic}/>
      </svg>
    ),
    refresh: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M4 12C4 7.58 7.58 4 12 4C14.8 4 17.2 5.5 18.6 7.8" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M20 12C20 16.42 16.42 20 12 20C9.2 20 6.8 18.5 5.4 16.2" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M16 8H19.5V4.5" stroke={ic} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 16H4.5V19.5" stroke={ic} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    bolt: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M13 2L4 14H12L11 22L20 10H12L13 2Z" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
    biohazard: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={ic} strokeWidth="1.5" fill="none"/>
        <circle cx="12" cy="12" r="2" fill={ic}/>
        <path d="M12 6V10M7.5 15L11 12.5M16.5 15L13 12.5" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    hazard: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L22 20H2L12 2Z" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
        <line x1="12" y1="9" x2="12" y2="14" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="17" r="1" fill={ic}/>
      </svg>
    ),
    skull: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2C7.58 2 4 5.58 4 10C4 13.1 5.8 15.7 8 17V20H16V17C18.2 15.7 20 13.1 20 10C20 5.58 16.42 2 12 2Z" stroke={ic} strokeWidth="1.5" fill="none"/>
        <circle cx="9" cy="10" r="1.5" fill={ic}/>
        <circle cx="15" cy="10" r="1.5" fill={ic}/>
        <path d="M10 20V22M14 20V22" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    testTube: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M7 2L7 16C7 18.76 9.24 21 12 21C14.76 21 17 18.76 17 16V2" stroke={ic} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <line x1="7" y1="2" x2="17" y2="2" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="7" y1="13" x2="17" y2="13" stroke={ic} strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 2"/>
      </svg>
    ),
    thermometer: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2C10.34 2 9 3.34 9 5V14.26C7.8 15.08 7 16.44 7 18C7 20.76 9.24 23 12 23C14.76 23 17 20.76 17 18C17 16.44 16.2 15.08 15 14.26V5C15 3.34 13.66 2 12 2Z" stroke={ic} strokeWidth="1.5" fill="none"/>
        <circle cx="12" cy="18" r="2" fill={ic}/>
        <line x1="12" y1="8" x2="12" y2="16" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    dna: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M7 4C7 4 7 8 12 10C17 12 17 16 17 16" stroke={ic} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M17 4C17 4 17 8 12 10C7 12 7 16 7 16" stroke={ic} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M7 20C7 20 7 18 9 17" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M17 20C17 20 17 18 15 17" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="8" y1="6" x2="16" y2="6" stroke={ic} strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="8" y1="14" x2="16" y2="14" stroke={ic} strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    bacteria: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="6" stroke={ic} strokeWidth="1.5" fill="none"/>
        <circle cx="10" cy="11" r="1" fill={ic}/>
        <circle cx="14" cy="13" r="1" fill={ic}/>
        <path d="M12 6V3M12 21V18M6 12H3M21 12H18M7.76 7.76L5.64 5.64M18.36 18.36L16.24 16.24M7.76 16.24L5.64 18.36M18.36 5.64L16.24 7.76" stroke={ic} strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    wave: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M2 12C4 9 6 9 8 12C10 15 12 15 14 12C16 9 18 9 20 12C22 15 22 15 22 12" stroke={ic} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M2 17C4 14 6 14 8 17C10 20 12 20 14 17C16 14 18 14 20 17" stroke={ic} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      </svg>
    ),
    signal: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <line x1="12" y1="14" x2="12" y2="22" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 10C9.1 8.9 10.5 8 12 8C13.5 8 14.9 8.9 16 10" stroke={ic} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M5 7C7 4.5 9.3 3 12 3C14.7 3 17 4.5 19 7" stroke={ic} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <circle cx="12" cy="13" r="1.5" fill={ic}/>
      </svg>
    ),
    shield: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 6V11C4 16.5 7.5 21.25 12 22.5C16.5 21.25 20 16.5 20 11V6L12 2Z" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
        <path d="M9 12L11 14L15 10" stroke={ic} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    filter: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M3 4H21L14 13V20L10 22V13L3 4Z" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
    gauge: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" stroke={ic} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M12 6V12L16 16" stroke={ic} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  };
  return <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", verticalAlign: "middle" }}>{icons[name] || null}</span>;
}

// ─── MOCK DATA (rich simulator — used when backend unavailable) ─────────────
function buildMockHistory(winMin = 60) {
  const now = Date.now();
  const pts = winMin * 2;
  return Array.from({ length: pts }, (_, i) => {
    const ts = new Date(now - (pts - i) * 30_000).toISOString();
    const tds = Math.max(1, Math.round(4 + 3 * Math.sin(i * 0.3)));
    return {
      ts,
      tds,
      water_bucket: i % 150 === 0 ? 250 : i % 5 === 0 ? 12 : 0,
      water_total: 248_000 + i * 12,
      pp: Math.max(60, 95 - Math.floor(i * 0.002)),
      cto: Math.max(55, 92 - Math.floor(i * 0.003)),
      ro: Math.max(70, 89 - Math.floor(i * 0.001)),
      cbpa: Math.max(80, 100 - Math.floor(i * 0.001)),
    };
  });
}

const MOCK_TELE = {
  device_id: "gen2-hub-001", online: true,
  updated_at: new Date().toISOString(),
  tds_out: 3, pp_filtertime: 95, cto_filtertime: 92,
  ro_filtertime: 89, cbpa_filtertime: 100,
  water_total_1: 250_036,
  active_time_iso: new Date().toISOString(),
  force_wash: false, filter_status: "s0", raw_codes: {},
};

const MOCK_USAGE = {
  total_ml_lifetime: 250_036, total_bottles_lifetime: 1000.1,
  total_liters_lifetime: 250.0, session_ml: 1_500, session_bottles: 6.0,
  tds_current: 3, tds_avg_1h: 3.2, tds_min_1h: 2, tds_max_1h: 7,
  lowest_filter_life: 89, filter_status: "s0",
  water_quality_label: "Pure", water_quality_color: "#1E8A4C",
};

// ─── BRAND COLORS (light mode) ──────────────────────────────────────────────
const C = {
  navy: "#0A1A2E",
  bg: "#F8F9FB",
  card: "#FFFFFF",
  border: "#F0F1F3",
  borderMed: "#E8ECF0",
  blue: "#51B0E6",
  blueDark: "#2A8FCA",
  gray: "#A6A8AB",
  textPrimary: "#0A1A2E",
  textSecondary: "#6B7280",
  muted: "#A6A8AB",
  green: "#34C759",
  yellow: "#FF9500",
  orange: "#E07020",
  red: "#FF3B30",
  deepRed: "#D93025",
};

// ─── TDS UTILITIES ──────────────────────────────────────────────────────────
function tdsColor(p) {
  if (p == null) return C.blue;
  if (p <= 35)  return C.green;
  if (p <= 150) return C.blue;
  if (p <= 300) return C.orange;
  if (p <= 500) return C.red;
  return C.deepRed;
}
function tdsLabel(p) {
  if (p == null) return "Reading\u2026";
  if (p <= 35)  return "Pure";
  if (p <= 150) return "Good";
  if (p <= 300) return "Moderate";
  if (p <= 500) return "Poor";
  return "Unsafe";
}
function tdsScore(p) {
  if (p == null) return 0;
  if (p <= 10)  return 98;
  if (p <= 35)  return 95;
  if (p <= 50)  return 88;
  if (p <= 100) return 80;
  if (p <= 150) return 70;
  if (p <= 300) return 50;
  if (p <= 500) return 25;
  return 10;
}
function filterColor(p) { return p >= 76 ? C.green : p >= 40 ? C.yellow : C.red; }
function filterStatus(p) { return p >= 76 ? "Healthy" : p >= 40 ? "Monitor" : "Replace Soon"; }

// ─── FILTER METADATA (from MCU SDK — Product Key: btu00aae5ktjhacq) ─────────
const FILTERS = [
  { key: "pp_filtertime",   slot: "pp",   model: "HWH100",       name: "CP Filter",       stage: "Stage 1", tag: "CP Composite",   desc: "Blocks sand, silt, rust & chlorine. Conditions water and extends RO membrane life.", life: "12\u201315 mo \u00B7 900\u20131,000 gal",   chartKey: "pp",   chartColor: C.blue  },
  { key: "ro_filtertime",   slot: "ro",   model: "HWH101-1200G", name: "RO Membrane",     stage: "Stage 2", tag: "0.0001 Micron",  desc: "Removes 99.99% of 1,000+ contaminants: PFAS, Lead, Fluoride, Arsenic, Chromium-6.",  life: "24\u201348 mo \u00B7 1,800\u20132,000 gal", chartKey: "ro",   chartColor: C.green },
  { key: "cto_filtertime",  slot: "cto",  model: "HWH102",       name: "TC Filter",       stage: "Stage 3", tag: "TC Post-Carbon", desc: "NSF-certified, Japan & Switzerland sourced. Removes residual taste, odor and VOCs.",  life: "6 mo \u00B7 450\u2013900 gal",         chartKey: "cto",  chartColor: C.yellow},
  { key: "cbpa_filtertime", slot: "cbpa", model: "GAF-100",      name: "Alkaline Filter", stage: "Stage 4", tag: "Ionic Alkaline", desc: "Ocean bioceramic beads add Ca, Mg, K, Na. Adds Ca, Mg, K, Na for optimal mineral absorption.", life: "12\u201318 mo \u00B7 900\u20131,000 gal",   chartKey: "cbpa", chartColor: C.gray  },
];

// ─── CHART TOOLTIP (light mode) ─────────────────────────────────────────────
function ChartTip({ active, payload, label, unit = "", extraFn }) {
  if (!active || !payload?.length) return null;
  const fmtLabel = (ts) => { try { return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); } catch { return ts; } };
  return (
    <div style={{ background: "#FFFFFF", border: `1px solid ${C.border}`, borderRadius: 12, padding: "8px 14px", fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
      <div style={{ color: C.muted, marginBottom: 4, fontFamily: "DM Mono,monospace" }}>{fmtLabel(label)}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || C.blue, fontWeight: 700 }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}{unit && ` ${unit}`}
          {extraFn ? ` \u2014 ${extraFn(p.value)}` : ""}
        </div>
      ))}
    </div>
  );
}

// ─── DATA HOOK ──────────────────────────────────────────────────────────────
function useWtrHub() {
  const [tele,     setTele]     = useState(null);
  const [usage,    setUsage]    = useState(null);
  const [hist,     setHist]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [isMock,   setIsMock]   = useState(false);
  const [wsStatus, setWsStatus] = useState("connecting");
  const [flushing, setFlushing] = useState(false);
  const [chartWin, setChartWin] = useState(60);

  const wsRef   = useRef(null);
  const retryMs = useRef(1000);

  const apiFetch = useCallback(async (path) => {
    const r = await fetch(`${BACKEND}${path}`, { headers: HDR });
    if (!r.ok) throw new Error(r.statusText);
    return r.json();
  }, []);

  const buildMockHist = useCallback((win) => {
    const mh = buildMockHistory(win);
    return {
      device_id: DEVICE, from_ts: mh[0]?.ts, to_ts: mh[mh.length - 1]?.ts, bucket_secs: 30,
      tds:              mh.map(p => ({ ts: p.ts, value: p.tds })),
      water_per_bucket: mh.map(p => ({ ts: p.ts, value: p.water_bucket })),
      water_total:      mh.map(p => ({ ts: p.ts, value: p.water_total })),
      pp_life:          mh.map(p => ({ ts: p.ts, value: p.pp })),
      cto_life:         mh.map(p => ({ ts: p.ts, value: p.cto })),
      ro_life:          mh.map(p => ({ ts: p.ts, value: p.ro })),
      cbpa_life:        mh.map(p => ({ ts: p.ts, value: p.cbpa })),
    };
  }, []);

  const loadAll = useCallback(async (win = 60) => {
    try {
      const [t, u, h] = await Promise.all([
        apiFetch(`/api/device/${DEVICE}/telemetry`),
        apiFetch(`/api/device/${DEVICE}/usage`),
        apiFetch(`/api/device/${DEVICE}/history?minutes=${win}&bucket_secs=30`),
      ]);
      setTele(t); setUsage(u); setHist(h); setIsMock(false);
    } catch {
      setTele({ ...MOCK_TELE, updated_at: new Date().toISOString() });
      setUsage(MOCK_USAGE);
      setHist(buildMockHist(win));
      setIsMock(true);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, buildMockHist]);

  const connectWs = useCallback(() => {
    if (isMock) return;
    try {
      const proto = window.location.protocol === "https:" ? "wss" : "ws";
      const host  = window.location.host;
      const ws    = new WebSocket(`${proto}://${host}/api/ws/devices/${DEVICE}`);
      wsRef.current = ws;
      setWsStatus("connecting");
      ws.onopen    = () => { setWsStatus("live"); retryMs.current = 1000; };
      ws.onmessage = (e) => { try { setTele(JSON.parse(e.data)); } catch {} };
      ws.onclose   = () => {
        setWsStatus("reconnecting");
        const d = retryMs.current;
        retryMs.current = Math.min(d * 2, 15_000);
        setTimeout(connectWs, d);
      };
      ws.onerror = () => ws.close();
    } catch {}
  }, [isMock]);

  useEffect(() => {
    loadAll(chartWin).then(connectWs);
    return () => wsRef.current?.close();
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!loading) {
      if (isMock) setHist(buildMockHist(chartWin));
      else apiFetch(`/api/device/${DEVICE}/history?minutes=${chartWin}&bucket_secs=30`)
        .then(setHist).catch(() => setHist(buildMockHist(chartWin)));
    }
  }, [chartWin]); // eslint-disable-line

  const forceWash = useCallback(async () => {
    setFlushing(true);
    try {
      if (!isMock) await fetch(`${BACKEND}/api/device/${DEVICE}/commands/force-wash`, { method: "POST", headers: HDR });
    } finally {
      setTimeout(() => setFlushing(false), 4_000);
    }
  }, [isMock]);

  const resetFilter = useCallback(async (slot) => {
    try {
      if (!isMock) {
        await fetch(`${BACKEND}/api/device/${DEVICE}/commands/filter-reset/${slot}`, { method: "POST", headers: HDR });
      } else {
        const km = { pp: "pp_filtertime", cto: "cto_filtertime", ro: "ro_filtertime", cbpa: "cbpa_filtertime" };
        setTele(t => t ? { ...t, [km[slot]]: 100 } : t);
      }
    } catch {}
  }, [isMock]);

  return { tele, usage, hist, loading, isMock, wsStatus, flushing, chartWin, setChartWin, forceWash, resetFilter };
}

// ─── OURA-STYLE SCORE RING ─────────────────────────────────────────────────
function ScoreRing({ score = 0, label = "WATER QUALITY", size = 200, color = "#51B0E6", subtitle = "" }) {
  const R = (size - 24) / 2;
  const CX = size / 2;
  const CY = size / 2;
  const circ = 2 * Math.PI * R;
  const fill = (Math.min(100, Math.max(0, score)) / 100) * circ;

  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#E8ECF0" strokeWidth="12" />
        <circle
          cx={CX} cy={CY} r={R}
          fill="none" stroke={color} strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ transition: "stroke-dasharray 1.5s cubic-bezier(0.34,1.56,0.64,1), stroke 0.8s ease" }}
        />
        <circle
          cx={CX} cy={CY} r={R}
          fill="none" stroke={`${color}30`} strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ transition: "stroke-dasharray 1.5s cubic-bezier(0.34,1.56,0.64,1)", filter: "blur(8px)" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        <div style={{ fontSize: size > 160 ? 52 : 36, fontWeight: 800, color: C.navy, fontVariantNumeric: "tabular-nums", letterSpacing: -2, lineHeight: 1 }}>
          {score != null ? score : "\u2014"}
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 2, textTransform: "uppercase", marginTop: 6 }}>
          {label}
        </div>
        {subtitle && (
          <div style={{ fontSize: 12, fontWeight: 500, color: C.textSecondary, marginTop: 4 }}>{subtitle}</div>
        )}
      </div>
    </div>
  );
}

// ─── METRIC CARD (light mode, Oura style) ──────────────────────────────────
function MetricCard({ icon, label, value, sub, color = C.blue, sparkData }) {
  return (
    <div style={{
      background: C.card, borderRadius: 20, padding: "16px 14px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      border: `1px solid ${C.border}`,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: -12, right: -12, width: 50, height: 50, borderRadius: "50%", background: `${color}10`, pointerEvents: "none" }} />
      <div style={{ marginBottom: 6 }}><HubIcon name={icon} size={16} color={color} /></div>
      <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.navy, fontVariantNumeric: "tabular-nums", letterSpacing: -0.5, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: C.textSecondary, marginTop: 4, fontWeight: 600 }}>{sub}</div>}
      {sparkData && sparkData.length > 1 && (
        <div style={{ marginTop: 8 }}>
          <Sparkline data={sparkData} color={color} w={70} h={22} />
        </div>
      )}
    </div>
  );
}

// ─── SPARKLINE ──────────────────────────────────────────────────────────────
function Sparkline({ data = [], color = "#51B0E6", w = 80, h = 28 }) {
  if (data.length < 2) return <div style={{ width: w, height: h }} />;
  const min = Math.min(...data), max = Math.max(...data), rng = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / rng) * (h - 4) - 2}`)
    .join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block", overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}

// ─── CHART SECTION (light mode) ─────────────────────────────────────────────
function ChartSection({ hist, chartWin, setChartWin }) {
  const [tab, setTab] = useState("tds");
  const fmtTime = ts => { try { return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); } catch { return ""; } };
  const axStyle = { fill: C.muted, fontSize: 10, fontFamily: "DM Mono,monospace" };
  const lastTds = hist?.tds?.slice(-1)?.[0]?.value;
  const tdsCol = tdsColor(lastTds);

  return (
    <div style={{ background: C.card, borderRadius: 24, padding: "20px 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2 }}>Recent Readings</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navy }}>Water Intelligence</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[{ v: 30, l: "30m" }, { v: 60, l: "1h" }, { v: 360, l: "6h" }].map(({ v, l }) => (
            <button key={v} onClick={() => setChartWin(v)} data-testid={`chart-win-${v}`} style={{
              padding: "5px 12px", borderRadius: 20,
              border: `1px solid ${chartWin === v ? C.blue : C.borderMed}`,
              background: chartWin === v ? `${C.blue}12` : "transparent",
              color: chartWin === v ? C.blue : C.muted,
              fontSize: 10, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
            }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", background: "#F4F5F7", borderRadius: 12, padding: 3, marginBottom: 16 }}>
        {[{ id: "tds", l: "TDS Quality" }, { id: "water", l: "Water Output" }, { id: "filter", l: "Filter Life" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} data-testid={`chart-tab-${t.id}`} style={{
            flex: 1, padding: "8px 0", borderRadius: 10, border: "none",
            background: tab === t.id ? C.card : "transparent",
            color: tab === t.id ? C.blue : C.muted,
            fontSize: 11, fontWeight: tab === t.id ? 700 : 500, cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: tab === t.id ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
          }}>{t.l}</button>
        ))}
      </div>

      {tab === "tds" && (
        <div style={{ background: "#FAFBFC", borderRadius: 14, padding: "12px 4px 8px" }}>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={hist?.tds || []} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gwTdsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={tdsCol} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={tdsCol} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="ts" tickFormatter={fmtTime} tick={axStyle} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={axStyle} axisLine={false} tickLine={false} domain={[0, 50]} />
              <Tooltip content={<ChartTip unit="ppm" extraFn={v => tdsLabel(v)} />} />
              <ReferenceLine y={35} stroke={C.green} strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: "35", fill: C.green, fontSize: 9, position: "right" }} />
              <Area type="monotone" dataKey="value" stroke={tdsCol} strokeWidth={2.5} fill="url(#gwTdsGrad)" dot={false} name="TDS" />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 6, fontSize: 10, color: C.muted }}>
            <span style={{ color: C.green }}>{"\u2500\u2500"} 35 ppm: Pure</span>
            <span style={{ color: C.yellow }}>{"\u2500\u2500"} 150 ppm: Good</span>
          </div>
        </div>
      )}

      {tab === "water" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>Dispensed per Period (mL)</div>
            <div style={{ background: "#FAFBFC", borderRadius: 14, padding: "12px 4px 8px" }}>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={hist?.water_per_bucket || []} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <XAxis dataKey="ts" tickFormatter={fmtTime} tick={axStyle} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={axStyle} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip unit="mL" />} />
                  <Bar dataKey="value" fill={C.blue} radius={[4, 4, 0, 0]} name="Dispensed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>Cumulative Total (mL)</div>
            <div style={{ background: "#FAFBFC", borderRadius: 14, padding: "12px 4px 8px" }}>
              <ResponsiveContainer width="100%" height={130}>
                <AreaChart data={hist?.water_total || []} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gwWaterGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.blue} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={C.blue} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="ts" tickFormatter={fmtTime} tick={axStyle} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={axStyle} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip unit="mL" extraFn={v => `${Math.round(v / 250)} bottles`} />} />
                  <Area type="monotone" dataKey="value" stroke={C.blue} strokeWidth={2} fill="url(#gwWaterGrad)" dot={false} name="Total mL" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === "filter" && (
        <div style={{ background: "#FAFBFC", borderRadius: 14, padding: "12px 4px 8px" }}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="ts" tickFormatter={fmtTime} tick={axStyle} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={axStyle} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<ChartTip unit="%" />} />
              <ReferenceLine y={40} stroke={C.yellow} strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: "40% Monitor", fill: C.yellow, fontSize: 9, position: "insideTopLeft" }} />
              <ReferenceLine y={20} stroke={C.red} strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: "20% Critical", fill: C.red, fontSize: 9, position: "insideTopLeft" }} />
              <Legend wrapperStyle={{ fontSize: 10, color: C.muted, paddingTop: 8 }} />
              {FILTERS.map(f => (
                <Line key={f.key} data={hist?.[`${f.chartKey}_life`] || []} dataKey="value" type="monotone" stroke={f.chartColor} strokeWidth={1.5} dot={false} name={f.model} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─── FILTER CARD (light mode, horizontal) ──────────────────────────────────
function FilterCard({ filter, life, expanded, onToggle, onReset }) {
  const col  = filterColor(life);
  const stat = filterStatus(life);
  const pct  = Math.min(100, life);

  return (
    <div data-testid={`filter-card-${filter.model}`} style={{
      background: C.card,
      border: `1px solid ${expanded ? col + "40" : C.border}`,
      borderRadius: 20, padding: 16, cursor: "pointer",
      transition: "border-color 0.3s, box-shadow 0.3s",
      boxShadow: expanded ? `0 4px 20px ${col}15` : "0 2px 12px rgba(0,0,0,0.04)",
      WebkitTapHighlightColor: "transparent",
    }}>
      <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Progress ring */}
        <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
          <svg width={56} height={56} viewBox="0 0 56 56">
            <circle cx={28} cy={28} r={22} fill="none" stroke="#E8ECF0" strokeWidth={6} />
            <circle cx={28} cy={28} r={22} fill="none" stroke={col} strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * (2 * Math.PI * 22)} ${2 * Math.PI * 22}`}
              transform="rotate(-90 28 28)"
              style={{ transition: "stroke-dasharray 1s ease, stroke 0.5s" }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: col, fontVariantNumeric: "tabular-nums" }}>{life}%</div>
          </div>
        </div>
        {/* Labels */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: C.navy }}>{filter.name}</span>
            <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: `${col}12`, color: col, border: `1px solid ${col}25`, letterSpacing: 0.8, textTransform: "uppercase" }}>{stat}</span>
          </div>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{filter.model} {"\u00B7"} {filter.tag}</div>
          {/* Progress bar */}
          <div style={{ marginTop: 6, height: 4, borderRadius: 2, background: "#E8ECF0", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: col, transition: "width 1s ease, background 0.5s" }} />
          </div>
        </div>
        <div style={{ fontSize: 18, color: C.muted, transition: "transform 0.25s", transform: expanded ? "rotate(90deg)" : "rotate(0deg)", flexShrink: 0 }}>{"\u203A"}</div>
      </div>

      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 14, paddingTop: 14, animation: "fadeInUp 0.2s ease" }}>
          <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.7, marginBottom: 8 }}>
            <span style={{ fontWeight: 600, color: C.navy }}>{filter.stage}</span> {"\u00B7"} {filter.desc}
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>Expected life: {filter.life}</div>
          {life < 40 && (
            <div style={{ padding: "10px 14px", background: "#FFF0F0", border: "1px solid #FECACA", borderRadius: 12, color: C.red, fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
              {"\u26A0"} Replacement recommended
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onReset(filter.slot); }}
            data-testid={`filter-reset-${filter.slot}`}
            style={{ padding: "10px 18px", background: `${C.blue}10`, border: `1px solid ${C.blue}30`, borderRadius: 12, color: C.blue, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            Reset After Replacement
          </button>
        </div>
      )}
    </div>
  );
}

// ─── OFFLINE MODAL (light mode) ─────────────────────────────────────────────
function OfflineModal({ onDismiss }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 0 20px", zIndex: 200, backdropFilter: "blur(10px)" }}>
      <div style={{ width: "100%", maxWidth: 480, background: C.card, borderRadius: "24px 24px 20px 20px", padding: "28px 24px 32px", border: `1px solid ${C.border}`, boxShadow: "0 -10px 40px rgba(0,0,0,0.1)" }}>
        <div style={{ marginBottom: 8 }}><HubIcon name="signal" size={32} color={C.blue} /></div>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.navy, marginBottom: 8 }}>Device Offline</div>
        <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.7, marginBottom: 20 }}>Your Home WTR Hub Gen-2 is not reachable. Please check:</div>
        {["Hub is powered on and plugged in", "Wi-Fi router is working", "Hub Wi-Fi credentials are unchanged", "Hub is within range of your router"].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: `${C.blue}10`, border: `1px solid ${C.blue}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: C.blue, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
            <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6 }}>{item}</div>
          </div>
        ))}
        <button onClick={onDismiss} data-testid="hub-offline-dismiss" style={{ width: "100%", marginTop: 16, padding: "16px 0", background: C.blue, color: "#FFFFFF", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: `0 4px 16px ${C.blue}40` }}>
          Got It
        </button>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ────────────────────────────────────────────────────────────
// ─── CARBON IMPACT MODULE (production-ready, NaN-safe) ───────────────────

// Safe number: never returns NaN/null/undefined — always a finite number
function safeNum(val, fallback = 0) {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

// Core carbon calculation utilities
const CARBON = {
  ML_PER_BOTTLE: 500,
  KG_CO2_PER_BOTTLE: 0.082,  // IFEU 2022: production 0.042 + transport 0.028 + disposal 0.012
  KG_CO2_PER_CREDIT: 1000,   // 1 Verified Carbon Credit = 1 metric ton CO2
  KG_CO2_PER_TREE_YEAR: 21.77, // US Forest Service: avg urban tree sequesters 21.77 kg/yr
  ANNUAL_GOAL_KG: 500,
  
  fromUsage(usage) {
    // Extract total mL from multiple possible fields, NaN-safe
    const totalMl = safeNum(usage?.total_ml_lifetime) 
      || safeNum(usage?.total_liters_lifetime, 0) * 1000
      || safeNum(usage?.totalGal, 0) * 3785.41;
    
    const bottles = Math.floor(totalMl / this.ML_PER_BOTTLE);
    const co2Kg = parseFloat((bottles * this.KG_CO2_PER_BOTTLE).toFixed(1));
    const credits = parseFloat((co2Kg / this.KG_CO2_PER_CREDIT).toFixed(4));
    const trees = parseFloat((co2Kg / this.KG_CO2_PER_TREE_YEAR).toFixed(1));
    const goalPct = Math.min(100, Math.round((co2Kg / this.ANNUAL_GOAL_KG) * 100));
    
    return { totalMl, bottles, co2Kg, credits, trees, goalPct, hasData: totalMl > 0 };
  }
};

// Animated count-up hook
function useCountUp(target, duration = 1200, enabled = true) {
  const [value, setValue] = useState(0);
  const prevRef = useRef(0);
  
  useEffect(() => {
    if (!enabled || target === prevRef.current) return;
    const start = prevRef.current;
    const diff = safeNum(target) - start;
    if (diff === 0) return;
    
    const startTime = performance.now();
    let raf;
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + diff * eased;
      setValue(Math.round(current * 10) / 10);
      if (progress < 1) raf = requestAnimationFrame(animate);
      else prevRef.current = safeNum(target);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, enabled]);
  
  return value;
}

// Animated SVG ring for carbon progress
function CarbonRing({ pct = 0, size = 100, strokeWidth = 6 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (safeNum(pct) / 100) * circ;
  const green = pct >= 50 ? "#2E7D32" : pct >= 20 ? "#66BB6A" : "#A5D6A7";
  
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F0F1F3" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={green} strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }} />
    </svg>
  );
}

// Bottle elimination animation (shows bottles fading as count increases)
function BottleViz({ eliminated = 0 }) {
  const maxShow = 8;
  const filled = Math.min(maxShow, eliminated);
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 3, marginBottom: 12 }}>
      {Array.from({ length: maxShow }).map((_, i) => (
        <div key={i} style={{
          width: 12, height: 28, borderRadius: "3px 3px 6px 6px",
          background: i < filled ? "#2E7D32" : "#E8ECF0",
          opacity: i < filled ? 1 : 0.3,
          transition: `all 0.4s ease ${i * 0.08}s`,
          transform: i < filled ? "scale(1)" : "scale(0.85)",
          position: "relative",
        }}>
          {/* Cap */}
          <div style={{
            position: "absolute", top: -3, left: 2, right: 2, height: 4,
            borderRadius: "2px 2px 0 0",
            background: i < filled ? "#1B5E20" : "#D0D4DA",
            transition: `all 0.4s ease ${i * 0.08}s`,
          }} />
        </div>
      ))}
    </div>
  );
}

function CarbonImpactCard({ usage, C: colors }) {
  const data = CARBON.fromUsage(usage);
  const animBottles = useCountUp(data.bottles, 1500, data.hasData);
  const animCo2 = useCountUp(data.co2Kg, 1500, data.hasData);
  const animCredits = useCountUp(data.credits * 10000, 1500, data.hasData); // animate in 10000ths
  const animTrees = useCountUp(data.trees * 10, 1500, data.hasData); // animate in 10ths
  
  // Format helpers — never return NaN
  const fmtInt = (v) => String(Math.round(safeNum(v)));
  const fmtDec1 = (v) => safeNum(v).toFixed(1);
  const fmtDec4 = (v) => (safeNum(v) / 10000).toFixed(4);
  const fmtTree = (v) => (safeNum(v) / 10).toFixed(1);
  
  return (
    <div style={{ background: colors.card, borderRadius: 24, padding: 20, marginBottom: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: `1px solid ${colors.border}` }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2">
            <path d="M12 22V8" strokeLinecap="round"/>
            <path d="M5 12C5 8 8 4 12 4C16 4 19 8 19 12" fill="#2E7D3220"/>
            <path d="M8 22H16" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 10, fontWeight: 700, color: colors.muted, letterSpacing: 1.5, textTransform: "uppercase" }}>Carbon Impact</span>
        </div>
        <div style={{ background: "#E8F5E9", color: "#2E7D32", padding: "3px 10px", borderRadius: 12, fontSize: 9, fontWeight: 700 }}>
          {fmtDec4(animCredits)} Credits
        </div>
      </div>

      {!data.hasData ? (
        /* ── Zero State ── */
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <BottleViz eliminated={0} />
          <div style={{ fontSize: 15, fontWeight: 800, color: colors.navy, marginBottom: 6 }}>Your impact starts with your first refill</div>
          <div style={{ fontSize: 11, color: colors.muted, lineHeight: 1.6, marginBottom: 16 }}>
            Every 500mL of filtered water you dispense eliminates one single-use plastic bottle and offsets 82g of CO\u2082.
          </div>
          <div style={{ background: "#F0FFF4", borderRadius: 14, padding: "14px 16px", textAlign: "left" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#2E7D32", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Projected Impact</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#475569", marginBottom: 4 }}>
              <span>3 refills/day for 1 year</span><span style={{ fontWeight: 800, color: "#2E7D32" }}>1,095 bottles saved</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#475569", marginBottom: 4 }}>
              <span>CO\u2082 offset</span><span style={{ fontWeight: 800, color: "#2E7D32" }}>89.8 kg</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#475569" }}>
              <span>Tree equivalent</span><span style={{ fontWeight: 800, color: "#2E7D32" }}>4.1 trees/year</span>
            </div>
          </div>
        </div>
      ) : (
        /* ── Active State ── */
        <>
          {/* Bottle viz */}
          <BottleViz eliminated={data.bottles} />
          
          {/* Ring + CO2 display */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 16 }}>
            <div style={{ position: "relative" }}>
              <CarbonRing pct={data.goalPct} size={100} />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#2E7D32", lineHeight: 1 }}>{safeNum(data.goalPct)}%</div>
                <div style={{ fontSize: 7, color: colors.muted, marginTop: 2 }}>of goal</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#2E7D32", lineHeight: 1 }}>{fmtDec1(animCo2)}</div>
              <div style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>kg CO\u2082 saved</div>
              <div style={{ fontSize: 9, color: "#66BB6A", marginTop: 4 }}>Annual goal: {CARBON.ANNUAL_GOAL_KG} kg</div>
            </div>
          </div>

          {/* 3-up impact cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="8" y="2" width="8" height="20" rx="3" fill="#2E7D3220" stroke="#2E7D32" strokeWidth="1.5"/><rect x="10" y="0" width="4" height="3" rx="1" fill="#1B5E20"/></svg>,
                value: fmtInt(animBottles), label: "Bottles Eliminated" },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3L20 7V17L12 21L4 17V7L12 3Z" fill="#2E7D3220" stroke="#2E7D32" strokeWidth="1.5"/><path d="M12 12L20 7M12 12V21M12 12L4 7" stroke="#2E7D32" strokeWidth="1" strokeLinecap="round"/></svg>,
                value: fmtDec1(animCo2), label: "kg CO\u2082 Offset" },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="#2E7D3220" stroke="#2E7D32" strokeWidth="1.5"/><path d="M8 12L11 15L16 9" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                value: fmtDec4(animCredits), label: "Carbon Credits" },
            ].map(card => (
              <div key={card.label} style={{ background: "#F0FFF4", borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
                <div style={{ marginBottom: 4, display: "flex", justifyContent: "center" }}>{card.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#2E7D32" }}>{card.value}</div>
                <div style={{ fontSize: 7, color: "#66BB6A", marginTop: 2 }}>{card.label}</div>
              </div>
            ))}
          </div>

          {/* Tree equivalence */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 0", borderTop: `1px solid ${colors.border}` }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 22V14" stroke="#8B6914" strokeWidth="2" strokeLinecap="round"/>
              <path d="M7 14C7 10 9 6 12 4C15 6 17 10 17 14H7Z" fill="#2E7D3240" stroke="#2E7D32" strokeWidth="1.5"/>
            </svg>
            <span style={{ fontSize: 10, color: colors.muted }}>
              Equivalent to <span style={{ fontWeight: 800, color: "#2E7D32" }}>{fmtTree(animTrees)} trees</span> planted for one year
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default function WTRHubScreen() {
  const { tele, usage, hist, loading, isMock, wsStatus, flushing, chartWin, setChartWin, forceWash, resetFilter } = useWtrHub();
  const [expandedFilter, setExpandedFilter] = useState(null);
  const [showOffline,    setShowOffline]    = useState(false);

  useEffect(() => {
    if (tele && !tele.online) setShowOffline(true);
    else setShowOffline(false);
  }, [tele?.online]);

  const tds       = tele?.tds_out ?? null;
  const connected = tele?.online  ?? false;
  const score     = tdsScore(tds);
  const scoreCol  = tdsColor(tds);

  // Alerts: filters below 40%
  const filterAlerts = FILTERS.filter(f => (tele?.[f.key] ?? 100) < 40);

  // Sparkline data from history
  const tdsSparkData = (hist?.tds || []).slice(-20).map(p => p.value);

  // Loading skeleton
  if (loading) {
    return (
      <div data-testid="wtr-hub-screen" style={{ fontFamily: "DM Sans,-apple-system,sans-serif", background: C.bg, minHeight: "100vh", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700;800&display=swap" rel="stylesheet" />
        {[260, 80, 200, 100, 100, 100, 100].map((h, i) => (
          <div key={i} style={{ height: h, background: "#E8ECF0", borderRadius: 20, animation: "hubShimmer 1.5s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
        ))}
        <style>{`@keyframes hubShimmer { 0%,100%{opacity:.4} 50%{opacity:.7} }`}</style>
      </div>
    );
  }

  return (
    <div data-testid="wtr-hub-screen" style={{
      fontFamily: "DM Sans,-apple-system,BlinkMacSystemFont,sans-serif",
      background: C.bg,
      color: C.navy,
      display: "flex",
      flexDirection: "column",
      WebkitFontSmoothing: "antialiased",
      minHeight: "100vh",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeInUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes hubShimmer { 0%,100%{opacity:.4} 50%{opacity:.7} }
        @keyframes blinkDot  { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes pulseGlow { 0%,100%{opacity:0.3;transform:scale(1)} 50%{opacity:0.1;transform:scale(1.06)} }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 2px; }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1: HERO
          ═══════════════════════════════════════════════════════════ */}
      <div style={{
        position: "relative",
        width: "100%",
        height: 300,
        overflow: "hidden",
      }}>
        <img
          src="/hwh-system-full.jpg"
          alt="Generosity Home WTR Hub System"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {/* Gradient overlay to white */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(248,249,251,0) 20%, rgba(248,249,251,0.6) 65%, #F8F9FB 100%)",
        }} />
        {/* Dark overlay for title readability */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(10,26,46,0.45) 0%, rgba(10,26,46,0.1) 50%, transparent 100%)",
        }} />

        {/* Title overlay */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          padding: "20px 20px 0", zIndex: 2,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
                Generosity{"\u2122"} Water Intelligence
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#FFFFFF", letterSpacing: -0.5, lineHeight: 1.2 }}>
                Home WTR Hub
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 4, fontFamily: "DM Mono,monospace" }}>
                Gen-2 {"\u00B7"} 1,200 GPD {"\u00B7"} 11-Stage RO
              </div>
            </div>

            {/* Status pill */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: isMock ? "rgba(81,176,230,0.2)" : connected ? "rgba(52,199,89,0.2)" : "rgba(255,255,255,0.15)",
              backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              borderRadius: 20, padding: "6px 12px",
              border: "1px solid rgba(255,255,255,0.15)",
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: isMock ? C.blue : connected ? C.green : C.muted,
                animation: isMock ? "blinkDot 1s ease-in-out infinite" : "none",
              }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "#FFFFFF", letterSpacing: 0.5, textTransform: "uppercase" }}>
                {isMock ? "DEMO MODE" : connected ? "CONNECTED" : "OFFLINE"}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom buttons */}
        <div style={{
          position: "absolute", bottom: 16, left: 20, right: 20,
          display: "flex", gap: 8, zIndex: 2,
        }}>
          {connected && !isMock ? (
            <button onClick={forceWash} disabled={flushing} data-testid="hub-force-wash-btn" style={{
              flex: 1, padding: "12px 0",
              background: flushing ? "#E8ECF0" : C.blue,
              color: flushing ? C.muted : "#FFFFFF",
              border: "none", borderRadius: 14, fontSize: 13, fontWeight: 700,
              cursor: flushing ? "not-allowed" : "pointer",
              boxShadow: flushing ? "none" : `0 4px 16px ${C.blue}40`,
            }}>
              {flushing ? "Flushing\u2026" : "Force Wash"}
            </button>
          ) : (
            <div style={{
              flex: 1, padding: "12px 0", textAlign: "center",
              background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)",
              borderRadius: 14, fontSize: 12, fontWeight: 700, color: C.textSecondary,
              border: "1px solid rgba(255,255,255,0.5)",
            }}>
              {isMock ? "Running in Demo Mode" : "Connect your Hub via Wi-Fi"}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SCROLLABLE CONTENT
          ═══════════════════════════════════════════════════════════ */}
      <div style={{ padding: "0 16px 48px", display: "flex", flexDirection: "column", gap: 14, animation: "fadeInUp 0.3s ease" }}>

        {/* ── SECTION 2: Water Quality Score Ring ── */}
        <div style={{
          background: C.card, borderRadius: 24, padding: "28px 20px 24px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: `1px solid ${C.border}`,
          textAlign: "center",
        }}>
          <ScoreRing
            score={score}
            label="OUTPUT QUALITY"
            size={200}
            color={scoreCol}
            subtitle={tdsLabel(tds)}
          />

          {/* Quick stats row */}
          <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
            {[
              { label: "TDS", value: tds != null ? `${tds}` : "\u2014", unit: "ppm", color: tdsColor(tds) },
              { label: "LITERS", value: usage ? (usage.todayGal * 3.785).toFixed(1) : "0.0", unit: "L", color: C.blue },
              { label: "TEMP", value: "72", unit: "\u00B0F", color: C.yellow },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>{stat.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: stat.color, fontVariantNumeric: "tabular-nums", letterSpacing: -0.5 }}>
                  {stat.value}<span style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginLeft: 2 }}>{stat.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 3: Telemetry Cards (3-up) ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <MetricCard
            icon="droplet"
            label="TDS Out"
            value={tds != null ? `${tds}` : "\u2014"}
            sub={usage?.tds_avg_1h != null ? `Avg ${usage.tds_avg_1h} \u00B7 1h` : ""}
            color={tdsColor(tds)}
            sparkData={tdsSparkData}
          />
          <MetricCard
            icon="flask"
            label="Liters Dispensed"
            value={usage ? (usage.todayGal * 3.785).toFixed(1) : "0.0"}
            sub="Today"
            color={C.blue}
          />
          <MetricCard
            icon="gauge"
            label="Daily Output"
            value={usage?.session_ml != null ? `${(usage.session_ml / 1000).toFixed(1)}L` : "\u2014"}
            sub={usage?.session_bottles != null ? `${usage.session_bottles} bottles` : ""}
            color={C.green}
          />
        </div>

        {/* ── SECTION 4: Filter Lifecycle Cards ── */}
        <div data-testid="hub-filter-section">
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, paddingLeft: 4 }}>
            Filter Lifecycle
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FILTERS.map(f => (
              <FilterCard key={f.key} filter={f} life={tele?.[f.key] ?? 0}
                expanded={expandedFilter === f.key}
                onToggle={() => setExpandedFilter(expandedFilter === f.key ? null : f.key)}
                onReset={resetFilter} />
            ))}
          </div>
        </div>

        {/* ── SECTION 5: Recent Readings Timeline ── */}
        <ChartSection hist={hist} chartWin={chartWin} setChartWin={setChartWin} />

        {/* ── SECTION 6: System Info Card ── */}
        <div data-testid="hub-device-info" style={{ background: C.card, borderRadius: 24, padding: "20px 18px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>Your System</div>

          {/* Faucet image */}
          <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 16, border: `1px solid ${C.border}` }}>
            <img src="/hwh-faucet-display.jpg" alt="Intelligent Faucet with TDS display" style={{ width: "100%", display: "block" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              ["Model",        "Gen-2 Home WTR Hub"],
              ["Flow Rate",    "1,200 GPD \u00B7 0.83 GPM"],
              ["Filtration",   "11-Stage Deep Filtration"],
              ["Daily Output", usage?.session_ml != null ? `${(usage.session_ml / 1000).toFixed(2)}L` : "\u2014"],
              ["Total Filtered", usage?.total_liters_lifetime != null ? `${usage.total_liters_lifetime.toFixed(1)}L (${usage.total_bottles_lifetime.toLocaleString()} bottles)` : "\u2014"],
              ["Device ID",    tele?.device_id ?? "\u2014"],
              ["Backend",      isMock ? "Simulator (Demo)" : wsStatus],
              ["Certified",    "NSF \u00B7 ANSI \u00B7 RoHS \u00B7 CE"],
            ].map(([label, value], i, arr) => (
              <div key={label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 0",
                borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
              }}>
                <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.navy, maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 7: Maintenance Alerts ── */}
        {filterAlerts.length > 0 && (
          <div style={{
            background: "#FFF8F0",
            borderRadius: 20,
            padding: "18px 16px",
            border: "1px solid #FFE5CC",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <HubIcon name="alertCircle" size={18} color={C.yellow} />
              <span style={{ fontSize: 14, fontWeight: 800, color: C.navy }}>Maintenance Required</span>
            </div>
            {filterAlerts.map(f => {
              const life = tele?.[f.key] ?? 0;
              const isUrgent = life < 20;
              return (
                <div key={f.key} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", marginBottom: 8,
                  background: isUrgent ? "#FFF0F0" : "#FFFFFF",
                  borderRadius: 14,
                  border: `1px solid ${isUrgent ? "#FECACA" : C.border}`,
                }}>
                  <HubIcon name={isUrgent ? "hazard" : "alertCircle"} size={16} color={isUrgent ? C.red : C.yellow} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{f.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{f.model} {"\u00B7"} {life}% remaining</div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 10,
                    background: isUrgent ? `${C.red}12` : `${C.yellow}12`,
                    color: isUrgent ? C.red : C.yellow,
                    textTransform: "uppercase", letterSpacing: 0.8,
                  }}>
                    {isUrgent ? "Replace Now" : "Replace Soon"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Carbon Impact Module (production-ready) ── */}
        <CarbonImpactCard usage={usage} C={C} />

        {/* ── Contaminant Removal Grid ── */}
        <div data-testid="hub-contaminant-grid" style={{ background: C.card, borderRadius: 24, padding: 18, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>Contaminant Removal</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[["biohazard","PFOS / PFOA",">99%"],["hazard","Lead",">99%"],["skull","Arsenic",">99%"],["testTube","Chromium-6",">99%"],["thermometer","Mercury",">99%"],["dna","Microplastics",">99%"],["bacteria","Bacteria/Cysts",">99%"],["flask","TDS",">97%"]].map(([iconName,label,rate]) => (
              <div key={label} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 12px", background: "#FAFBFC", borderRadius: 14,
                border: `1px solid ${C.border}`,
              }}>
                <HubIcon name={iconName} size={16} color={C.blue} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.navy, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>{rate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Force Wash Button (secondary) */}
        <button onClick={forceWash} disabled={flushing} data-testid="hub-force-wash-btn-bottom" style={{
          width: "100%", padding: "16px 0",
          background: flushing ? "#E8ECF0" : C.blue,
          color: flushing ? C.muted : "#FFFFFF",
          border: "none", borderRadius: 16, fontSize: 15, fontWeight: 800,
          cursor: flushing ? "not-allowed" : "pointer",
          letterSpacing: 0.3,
          boxShadow: flushing ? "none" : `0 4px 20px ${C.blue}35`,
          transition: "all 0.3s",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <HubIcon name={flushing ? "refresh" : "bolt"} size={16} color={flushing ? C.muted : "#FFFFFF"} />
          {flushing ? "Flushing in progress\u2026" : "Force Wash / Purge Cycle"}
        </button>

        {/* Mission Footer */}
        <div style={{
          background: C.card, borderRadius: 20, padding: 20,
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          border: `1px solid ${C.border}`, textAlign: "center",
        }}>
          <div style={{ marginBottom: 8 }}><HubIcon name="wave" size={24} color={C.blue} /></div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.blue, marginBottom: 6 }}>Every Hub Sold = Lives Changed</div>
          <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.7 }}>
            For every Home WTR Hub purchased, Generosity{"\u2122"} keeps safe water flowing to those affected by the global clean water crisis. 850+ projects worldwide.
          </div>
        </div>

      </div>

      {/* Offline Modal */}
      {showOffline && <OfflineModal onDismiss={() => setShowOffline(false)} />}
    </div>
  );
}
