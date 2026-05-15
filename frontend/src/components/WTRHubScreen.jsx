import { useState, useEffect, useRef, useCallback } from "react";
import { WaterInfoSheet } from './WTRHub/WaterInfoSheet';
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
  water_quality_label: "Pure", water_quality_color: "#4A8A6F",
};

// ─── v3.3 BRAND COLORS (muted Generosity palette) ───────────────────────────
const C = {
  navy: "#0F1419",
  bg: "#FFFFFF",
  card: "rgba(255, 255, 255, 0.35)",
  cardSolid: "#FFFFFF",
  border: "rgba(15, 20, 25, 0.06)",
  borderMed: "rgba(15, 20, 25, 0.08)",
  blue: "#51B0E6",
  blueDark: "#1F6FA0",
  gray: "#A6A8AB",
  textPrimary: "#0F1419",
  textSecondary: "#3D4043",
  muted: "#A6A8AB",
  green: "#4A8A6F",
  yellow: "#C89B3C",
  orange: "#C89B3C",
  red: "#B84A4A",
  deepRed: "#B84A4A",
};

// ─── NUMBER FORMATTING UTILITIES ────────────────────────────────────────────
function fmt(val, decimals = 0) {
  const n = Number(val);
  if (!Number.isFinite(n)) return "0";
  const fixed = n.toFixed(decimals);
  if (decimals > 0) return parseFloat(fixed).toString();
  return Math.round(n).toLocaleString();
}

function safeDivide(a, b, fallback = 0) {
  const na = Number(a), nb = Number(b);
  if (!Number.isFinite(na) || !Number.isFinite(nb) || nb === 0) return fallback;
  return na / nb;
}

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
function filterColor(p) { return p >= 76 ? "#51B0E6" : p >= 40 ? "#C89B3C" : "#B84A4A"; }
function filterStatus(p) { return p >= 76 ? "Healthy" : p >= 40 ? "Monitor" : "Replace Soon"; }

// ─── FILTER METADATA (from MCU SDK — Product Key: btu00aae5ktjhacq) ─────────
const FILTERS = [
  { key: "pp_filtertime",   slot: "pp",   model: "HWH100",       name: "CP Filter",       stage: "Stage 1", tag: "CP Composite",   desc: "Blocks sand, silt, rust & chlorine. Conditions water and extends RO membrane life.", life: "12\u201315 mo \u00B7 900\u20131,000 gal",   chartKey: "pp",   chartColor: C.blue  },
  { key: "ro_filtertime",   slot: "ro",   model: "HWH101-1200G", name: "RO Membrane",     stage: "Stage 2", tag: "0.0001 Micron",  desc: "Removes 99.99% of 1,000+ contaminants: PFAS, Lead, Fluoride, Arsenic, Chromium-6.",  life: "24\u201348 mo \u00B7 1,800\u20132,000 gal", chartKey: "ro",   chartColor: C.green },
  { key: "cto_filtertime",  slot: "cto",  model: "HWH102",       name: "TC Filter",       stage: "Stage 3", tag: "TC Post-Carbon", desc: "NSF-certified, Japan & Switzerland sourced. Removes residual taste, odor and VOCs.",  life: "6 mo \u00B7 450\u2013900 gal",         chartKey: "cto",  chartColor: C.yellow},
  { key: "cbpa_filtertime", slot: "cbpa", model: "GAF-100",      name: "Alkaline Filter", stage: "Stage 4", tag: "Ionic Alkaline", desc: "Ocean bioceramic beads add Ca, Mg, K, Na. Adds Ca, Mg, K, Na for optimal mineral absorption.", life: "12\u201318 mo \u00B7 900\u20131,000 gal",   chartKey: "cbpa", chartColor: C.gray  },
];

// ─── CHART TOOLTIP (v3.3) ───────────────────────────────────────────────────
function ChartTip({ active, payload, label, unit = "", extraFn }) {
  if (!active || !payload?.length) return null;
  const fmtLabel = (ts) => { try { return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); } catch { return ts; } };
  return (
    <div style={{ background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(30px) saturate(180%)", WebkitBackdropFilter: "blur(30px) saturate(180%)", border: `1px solid ${C.border}`, borderRadius: 12, padding: "8px 14px", fontSize: 12, boxShadow: "0 4px 16px rgba(15, 20, 25, 0.10)" }}>
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
  }, []); // run once on mount

  useEffect(() => {
    if (!loading) {
      if (isMock) setHist(buildMockHist(chartWin));
      else apiFetch(`/api/device/${DEVICE}/history?minutes=${chartWin}&bucket_secs=30`)
        .then(setHist).catch(() => setHist(buildMockHist(chartWin)));
    }
  }, [chartWin]); // re-fetch when window changes

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
function ScoreRing({ score = 0, label = "WATER RETENTION", size = 200, color = "#51B0E6", subtitle = "" }) {
  const R = (size - 24) / 2;
  const CX = size / 2;
  const CY = size / 2;
  const circ = 2 * Math.PI * R;
  const fill = (Math.min(100, Math.max(0, score)) / 100) * circ;

  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(15, 20, 25, 0.06)" strokeWidth="12" />
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

// ─── METRIC CARD (v3.3 smoky mirror) ────────────────────────────────────────
function MetricCard({ icon, label, value, sub, color = C.blue, sparkData }) {
  return (
    <div className="card-default" style={{
      padding: "16px 14px",
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

// ─── CHART SECTION (v3.3) ───────────────────────────────────────────────────
function ChartSection({ hist, chartWin, setChartWin }) {
  const [tab, setTab] = useState("tds");
  const fmtTime = ts => { try { return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); } catch { return ""; } };
  const axStyle = { fill: C.muted, fontSize: 10, fontFamily: "DM Mono,monospace" };
  const lastTds = hist?.tds?.slice(-1)?.[0]?.value;
  const tdsCol = tdsColor(lastTds);

  return (
    <div className="card-default" style={{ padding: "20px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2 }}>Recent Readings</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navy }}>Water Intelligence</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[{ v: 30, l: "30m" }, { v: 60, l: "1h" }, { v: 360, l: "6h" }].map(({ v, l }) => (
            <button key={v} onClick={() => setChartWin(v)} data-testid={`chart-win-${v}`} style={{
              padding: "5px 12px", borderRadius: 20,
              border: `1px solid ${chartWin === v ? C.blue : C.border}`,
              background: chartWin === v ? `${C.blue}12` : "transparent",
              color: chartWin === v ? C.blue : C.muted,
              fontSize: 10, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
            }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", background: "rgba(15, 20, 25, 0.04)", borderRadius: 12, padding: 3, marginBottom: 16 }}>
        {[{ id: "tds", l: "TDS Quality" }, { id: "water", l: "Water Output" }, { id: "filter", l: "Filter Life" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} data-testid={`chart-tab-${t.id}`} style={{
            flex: 1, padding: "8px 0", borderRadius: 10, border: "none",
            background: tab === t.id ? C.cardSolid : "transparent",
            color: tab === t.id ? C.blue : C.muted,
            fontSize: 11, fontWeight: tab === t.id ? 700 : 500, cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: tab === t.id ? "0 1px 4px rgba(15, 20, 25, 0.08)" : "none",
          }}>{t.l}</button>
        ))}
      </div>

      {tab === "tds" && (
        <div style={{ background: "rgba(255, 255, 255, 0.45)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", borderRadius: 14, padding: "12px 4px 8px" }}>
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
            <div style={{ background: "rgba(255, 255, 255, 0.45)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", borderRadius: 14, padding: "12px 4px 8px" }}>
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
            <div style={{ background: "rgba(255, 255, 255, 0.45)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", borderRadius: 14, padding: "12px 4px 8px" }}>
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
        <div style={{ background: "rgba(255, 255, 255, 0.45)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", borderRadius: 14, padding: "12px 4px 8px" }}>
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

// ─── FILTER CARD ─────────────────────────────────────────────────────────────
function FilterCard({ filter, life, expanded, onToggle, onReset }) {
  const col  = filterColor(life);
  const stat = filterStatus(life);
  const pct  = Math.min(100, life);

  return (
    <div data-testid={`filter-card-${filter.model}`} className="card-default" style={{
      padding: 16, cursor: "pointer",
      transition: "border-color 0.3s, box-shadow 0.3s",
      WebkitTapHighlightColor: "transparent",
    }}>
      <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
          <svg width={56} height={56} viewBox="0 0 56 56">
            <circle cx={28} cy={28} r={22} fill="none" stroke="rgba(15, 20, 25, 0.06)" strokeWidth={6} />
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
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: C.navy }}>{filter.name}</span>
            <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: `${col}12`, color: col, border: `1px solid ${col}25`, letterSpacing: 0.8, textTransform: "uppercase" }}>{stat}</span>
          </div>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{filter.model} {"\u00B7"} {filter.tag}</div>
          <div style={{ marginTop: 6, height: 4, borderRadius: 2, background: "rgba(15, 20, 25, 0.06)", overflow: "hidden" }}>
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
            <div className="card-critical" style={{ padding: "10px 14px", color: C.red, fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
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

// ─── OFFLINE MODAL (v3.3) ───────────────────────────────────────────────────
function OfflineModal({ onDismiss }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15, 20, 25, 0.30)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 0 20px", zIndex: 200, backdropFilter: "blur(10px)" }}>
      <div className="card-default" style={{ width: "100%", maxWidth: 480, borderRadius: "24px 24px 20px 20px", padding: "28px 24px 32px", boxShadow: "0 -10px 40px rgba(15, 20, 25, 0.15)" }}>
        <div style={{ marginBottom: 8 }}><HubIcon name="signal" size={32} color={C.blue} /></div>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.navy, marginBottom: 8 }}>Device Offline</div>
        <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.7, marginBottom: 20 }}>Your Home WTR Hub Gen-2 is not reachable. Please check:</div>
        {["Hub is powered on and plugged in", "Wi-Fi router is working", "Hub Wi-Fi credentials are unchanged", "Hub is within range of your router"].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: `${C.blue}10`, border: `1px solid ${C.blue}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: C.blue, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
            <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6 }}>{item}</div>
          </div>
        ))}
        <button onClick={onDismiss} data-testid="hub-offline-dismiss" className="btn-brand" style={{ width: "100%", marginTop: 16, padding: "16px 0", borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
          Got It
        </button>
      </div>
    </div>
  );
}

// ─── CARBON IMPACT MODULE (v3.3 muted greens) ───────────────────────────────

function safeNum(val, fallback = 0) {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

const CARBON = {
  ML_PER_BOTTLE: 500,
  KG_CO2_PER_BOTTLE: 0.082,
  KG_CO2_PER_CREDIT: 1000,
  KG_CO2_PER_TREE_YEAR: 21.77,
  ANNUAL_GOAL_KG: 500,

  fromUsage(usage) {
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

function CarbonRing({ pct = 0, size = 100, strokeWidth = 6 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (safeNum(pct) / 100) * circ;
  const green = pct >= 50 ? "#3D7058" : pct >= 20 ? "#4A8A6F" : "#7DA994";

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(15, 20, 25, 0.06)" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={green} strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }} />
    </svg>
  );
}

function BottleViz({ eliminated = 0 }) {
  const maxShow = 8;
  const filled = Math.min(maxShow, eliminated);
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 3, marginBottom: 12 }}>
      {Array.from({ length: maxShow }).map((_, i) => (
        <div key={i} style={{
          width: 12, height: 28, borderRadius: "3px 3px 6px 6px",
          background: i < filled ? "#4A8A6F" : "rgba(15, 20, 25, 0.08)",
          opacity: i < filled ? 1 : 0.3,
          transition: `all 0.4s ease ${i * 0.08}s`,
          transform: i < filled ? "scale(1)" : "scale(0.85)",
          position: "relative",
        }}>
          <div style={{
            position: "absolute", top: -3, left: 2, right: 2, height: 4,
            borderRadius: "2px 2px 0 0",
            background: i < filled ? "#3D7058" : "rgba(15, 20, 25, 0.10)",
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
  const animCredits = useCountUp(data.credits * 10000, 1500, data.hasData);
  const animTrees = useCountUp(data.trees * 10, 1500, data.hasData);

  const fmtInt = (v) => String(Math.round(safeNum(v)));
  const fmtDec1 = (v) => safeNum(v).toFixed(1);
  const fmtDec4 = (v) => (safeNum(v) / 10000).toFixed(4);
  const fmtTree = (v) => (safeNum(v) / 10).toFixed(1);

  return (
    <div className="card-default" style={{ padding: 20, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A8A6F" strokeWidth="2">
            <path d="M12 22V8" strokeLinecap="round"/>
            <path d="M5 12C5 8 8 4 12 4C16 4 19 8 19 12" fill="#4A8A6F20"/>
            <path d="M8 22H16" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 10, fontWeight: 700, color: colors.muted, letterSpacing: 1.5, textTransform: "uppercase" }}>Carbon Impact</span>
        </div>
        <div style={{ background: "rgba(74, 138, 111, 0.10)", color: "#4A8A6F", padding: "3px 10px", borderRadius: 12, fontSize: 9, fontWeight: 700, border: "1px solid rgba(74, 138, 111, 0.20)" }}>
          {fmtDec4(animCredits)} Credits
        </div>
      </div>

      {!data.hasData ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <BottleViz eliminated={0} />
          <div style={{ fontSize: 15, fontWeight: 800, color: colors.navy, marginBottom: 6 }}>Your impact starts with your first refill</div>
          <div style={{ fontSize: 11, color: colors.muted, lineHeight: 1.6, marginBottom: 16 }}>
            Every 500mL of filtered water you dispense eliminates one single-use plastic bottle and offsets 82g of CO\u2082.
          </div>
          <div style={{ background: "rgba(74, 138, 111, 0.08)", borderRadius: 14, padding: "14px 16px", textAlign: "left", border: "1px solid rgba(74, 138, 111, 0.18)" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#4A8A6F", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Projected Impact</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#3D4043", marginBottom: 4 }}>
              <span>3 refills/day for 1 year</span><span style={{ fontWeight: 800, color: "#4A8A6F" }}>1,095 bottles saved</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#3D4043", marginBottom: 4 }}>
              <span>CO\u2082 offset</span><span style={{ fontWeight: 800, color: "#4A8A6F" }}>89.8 kg</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#3D4043" }}>
              <span>Tree equivalent</span><span style={{ fontWeight: 800, color: "#4A8A6F" }}>4.1 trees/year</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          <BottleViz eliminated={data.bottles} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 16 }}>
            <div style={{ position: "relative" }}>
              <CarbonRing pct={data.goalPct} size={100} />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#4A8A6F", lineHeight: 1 }}>{safeNum(data.goalPct)}%</div>
                <div style={{ fontSize: 7, color: colors.muted, marginTop: 2 }}>of goal</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#4A8A6F", lineHeight: 1 }}>{fmtDec1(animCo2)}</div>
              <div style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>kg CO\u2082 saved</div>
              <div style={{ fontSize: 9, color: "#7DA994", marginTop: 4 }}>Annual goal: {CARBON.ANNUAL_GOAL_KG} kg</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="8" y="2" width="8" height="20" rx="3" fill="#4A8A6F20" stroke="#4A8A6F" strokeWidth="1.5"/><rect x="10" y="0" width="4" height="3" rx="1" fill="#3D7058"/></svg>,
                value: fmtInt(animBottles), label: "Bottles Eliminated" },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3L20 7V17L12 21L4 17V7L12 3Z" fill="#4A8A6F20" stroke="#4A8A6F" strokeWidth="1.5"/><path d="M12 12L20 7M12 12V21M12 12L4 7" stroke="#4A8A6F" strokeWidth="1" strokeLinecap="round"/></svg>,
                value: fmtDec1(animCo2), label: "kg CO\u2082 Offset" },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="#4A8A6F20" stroke="#4A8A6F" strokeWidth="1.5"/><path d="M8 12L11 15L16 9" stroke="#4A8A6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                value: fmtDec4(animCredits), label: "Carbon Credits" },
            ].map(card => (
              <div key={card.label} style={{ background: "rgba(74, 138, 111, 0.08)", borderRadius: 12, padding: "12px 8px", textAlign: "center", border: "1px solid rgba(74, 138, 111, 0.15)" }}>
                <div style={{ marginBottom: 4, display: "flex", justifyContent: "center" }}>{card.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#4A8A6F" }}>{card.value}</div>
                <div style={{ fontSize: 7, color: "#7DA994", marginTop: 2 }}>{card.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 0", borderTop: `1px solid ${colors.border}` }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 22V14" stroke="#8B6914" strokeWidth="2" strokeLinecap="round"/>
              <path d="M7 14C7 10 9 6 12 4C15 6 17 10 17 14H7Z" fill="#4A8A6F40" stroke="#4A8A6F" strokeWidth="1.5"/>
            </svg>
            <span style={{ fontSize: 10, color: colors.muted }}>
              Equivalent to <span style={{ fontWeight: 800, color: "#4A8A6F" }}>{fmtTree(animTrees)} trees</span> planted for one year
            </span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── WATER RETENTION STATE ENGINE (v3.3 muted) ──────────────────────────────
function retentionState(score, filteredTds) {
  if (score >= 85 && filteredTds < 20) {
    return {
      label: "Optimal",
      color: "#4A8A6F",
      colorDark: "#3D7058",
      nudge: "Your filtered water is at peak purity for cellular absorption.",
    };
  }
  if (score >= 60 && filteredTds < 80) {
    return {
      label: "Efficient",
      color: "#51B0E6",
      colorDark: "#1F6FA0",
      nudge: "Your filtered water supports efficient cellular absorption.",
    };
  }
  return {
    label: "Inefficient",
    color: "#C89B3C",
    colorDark: "#8F6E26",
    nudge: "Improve filter output for better cellular absorption support.",
  };
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export default function WTRHubScreen() {
  const { tele, usage, hist, loading, isMock, wsStatus, flushing, chartWin, setChartWin, forceWash, resetFilter } = useWtrHub();
  const [expandedFilter, setExpandedFilter] = useState(null);
  const [showOffline,    setShowOffline]    = useState(false);
  const [openSheet,      setOpenSheet]      = useState(null);

  useEffect(() => {
    if (tele && !tele.online) setShowOffline(true);
    else setShowOffline(false);
  }, [tele?.online]);

  const tds       = tele?.tds_out ?? null;
  const connected = tele?.online  ?? false;
  const score     = tdsScore(tds);
  const scoreCol  = tdsColor(tds);

  const filterAlerts = FILTERS.filter(f => (tele?.[f.key] ?? 100) < 40);
  const tdsSparkData = (hist?.tds || []).slice(-20).map(p => p.value);

  const carbon = CARBON.fromUsage(usage);
  const animBottles = useCountUp(carbon.bottles, 1500, carbon.hasData);
  const animCo2 = useCountUp(carbon.co2Kg, 1500, carbon.hasData);
  const animTrees = useCountUp(carbon.trees * 10, 1500, carbon.hasData);

  // v3.3 substrate — applied to outer container so cards have something to float over
  const v33Substrate = {
    background: "#FFFFFF",
    backgroundImage: "radial-gradient(ellipse 80% 60% at 80% 100%, rgba(81, 176, 230, 0.10), transparent 60%), radial-gradient(ellipse 60% 50% at 10% 0%, rgba(81, 176, 230, 0.05), transparent 60%)",
    backgroundAttachment: "fixed",
  };

  if (loading) {
    return (
      <div data-testid="wtr-hub-screen" style={{ fontFamily: "Montserrat, -apple-system, sans-serif", ...v33Substrate, minHeight: "100vh", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
        {[260, 80, 200, 100, 100, 100, 100].map((h, i) => (
          <div key={i} style={{ height: h, background: "rgba(15, 20, 25, 0.06)", borderRadius: 20, animation: "hubShimmer 1.5s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
        ))}
        <style>{`@keyframes hubShimmer { 0%,100%{opacity:.4} 50%{opacity:.7} }`}</style>
      </div>
    );
  }

  const todayMl = safeNum(usage?.session_ml);
  const todayL = safeDivide(todayMl, 1000);
  const todayBottles = safeDivide(todayMl, 500);

  const inTds = 342;
  const outTds = tds ?? 3;
  const outScore = score;
  const outLabel = tdsLabel(outTds);
  const inQuality = Math.max(10, Math.min(100, 100 - (inTds / 5)));
  const outPct = outScore / 100;
  const inPct = inQuality / 100;
  const OR = 105, IR = 75;
  const OC = 2 * Math.PI * OR, IC = 2 * Math.PI * IR;
  const outerOff = OC * (1 - outPct);
  const innerOff = IC * (1 - inPct);
  const reductionPct = inTds > 0 ? Math.round(((inTds - outTds) / inTds) * 1000) / 10 : 0;

  const retState = retentionState(outScore, outTds);

  const goalL = 20;
  const currentL = todayL > 0 ? Math.min(todayL, goalL) : 15.2;
  const remainingL = Math.max(0, goalL - currentL);
  const goalPct = Math.round((currentL / goalL) * 100);

  const hourlyBars = [
    { hour: "6AM", tds: 4 }, { hour: "7AM", tds: 3 }, { hour: "8AM", tds: 5 },
    { hour: "9AM", tds: 4 }, { hour: "10AM", tds: 3 }, { hour: "11AM", tds: 4 },
    { hour: "12PM", tds: 3 }, { hour: "1PM", tds: 5 }, { hour: "2PM", tds: 4 },
    { hour: "3PM", tds: 3 }, { hour: "4PM", tds: 4 },
    { hour: "Now", tds: outTds > 0 ? outTds : 3 },
  ];
  const maxBarTds = Math.max(...hourlyBars.map(b => b.tds), 1);

  return (
    <div data-testid="wtr-hub-screen" style={{
      fontFamily: "Montserrat, -apple-system, SF Pro Display, Inter, sans-serif",
      ...v33Substrate,
      color: C.navy,
      display: "flex",
      flexDirection: "column",
      WebkitFontSmoothing: "antialiased",
      minHeight: "100vh",
    }}>
      <style>{`
        @keyframes fadeInUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hubShimmer { 0%,100%{opacity:.4} 50%{opacity:.7} }
        @keyframes blinkDot  { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      `}</style>

      {/* HERO — UNCHANGED per spec */}
      <div style={{ position: "relative", width: "100%", height: 280, overflow: "hidden" }}>
        <img src="/hwh-system-full.jpg" alt="Generosity Home WTR Hub" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.5) 60%, #FFFFFF 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,20,25,0.4) 0%, rgba(15,20,25,0.05) 60%, transparent 100%)" }} />

        <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "32px 20px 0", zIndex: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#FFFFFF", letterSpacing: -0.5, lineHeight: 1.2 }}>Home WTR Hub</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="rgba(200,220,240,0.75)" strokeWidth="1.5">
                  <path d="M7 1C4.8 1 3 2.8 3 5c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z"/>
                  <circle cx="7" cy="5" r="1.5" fill="rgba(200,220,240,0.75)" stroke="none"/>
                </svg>
                <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(200,220,240,0.85)" }}>1234 Crestview Dr, Palm Desert, CA</span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                {[
                  { val: `${fmt(tds ?? 3)} ppm`, lbl: "Output TDS" },
                  { val: `${fmt(score)}`, lbl: "Retention" },
                  { val: `${currentL.toFixed(1)} L`, lbl: "Today" },
                ].map(s => (
                  <div key={s.lbl} style={{ background: "rgba(15, 20, 25, 0.35)", backdropFilter: "blur(14px) saturate(180%)", WebkitBackdropFilter: "blur(14px) saturate(180%)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 14, padding: "10px 14px" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#FFFFFF", lineHeight: 1, letterSpacing: -0.5 }}>{s.val}</div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.70)", letterSpacing: 0.8, textTransform: "uppercase", marginTop: 2 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: connected || isMock ? "#4A8A6F" : "#C89B3C", boxShadow: connected || isMock ? "0 0 8px rgba(74,138,111,0.6)" : "0 0 8px rgba(200,155,60,0.6)" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)", textShadow: "0 1px 2px rgba(15,20,25,0.4)" }}>
                  {connected || isMock ? 'System active' : 'System offline'}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 20, padding: "5px 11px", border: "1px solid rgba(255,255,255,0.12)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: isMock ? C.blue : connected ? C.green : C.muted, animation: isMock ? "blinkDot 1s ease-in-out infinite" : "none" }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: "#FFFFFF", letterSpacing: 0.5, textTransform: "uppercase" }}>
                {isMock ? "DEMO MODE" : connected ? "CONNECTED" : "OFFLINE"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CARDS */}
      <div style={{ padding: "0 16px 48px", display: "flex", flexDirection: "column", gap: 12, animation: "fadeInUp 0.3s ease" }}>

        {/* CARD 1: WATER RETENTION DUAL-RING */}
        <div className="card-default" style={{ overflow: "hidden", padding: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 0" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase" }}>Water Retention</span>
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(74, 138, 111, 0.10)", borderRadius: 20, padding: "4px 10px", border: "1px solid rgba(74, 138, 111, 0.20)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4A8A6F", animation: "blinkDot 1.4s ease-in-out infinite" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#3D7058" }}>Live</span>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", padding: "24px 20px 8px" }}>
            <div style={{ position: "relative", width: 240, height: 240 }}>
              <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at center, ${retState.color}18 0%, transparent 70%)`, borderRadius: "50%", pointerEvents: "none" }} />
              <svg width="240" height="240" viewBox="0 0 240 240" style={{ transform: "rotate(-90deg)" }}>
                <defs>
                  <linearGradient id="outerRetG" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#51B0E6"/>
                    <stop offset="50%" stopColor="#4A8A6F"/>
                    <stop offset="100%" stopColor="#3D7058"/>
                  </linearGradient>
                  <linearGradient id="innerRetG" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C89B3C"/>
                    <stop offset="100%" stopColor="#D4B560"/>
                  </linearGradient>
                  <filter id="ringGlow">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>
                <circle cx="120" cy="120" r={OR} fill="none" stroke="rgba(15, 20, 25, 0.06)" strokeWidth="18"/>
                <circle cx="120" cy="120" r={OR} fill="none" stroke="url(#outerRetG)" strokeWidth="18" strokeLinecap="round" strokeDasharray={OC} strokeDashoffset={outerOff} style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.34,1.56,0.64,1)" }} filter="url(#ringGlow)"/>
                <circle cx="120" cy="120" r={IR} fill="none" stroke="rgba(15, 20, 25, 0.06)" strokeWidth="16"/>
                <circle cx="120" cy="120" r={IR} fill="none" stroke="url(#innerRetG)" strokeWidth="16" strokeLinecap="round" strokeDasharray={IC} strokeDashoffset={innerOff} style={{ transition: "stroke-dashoffset 1.8s cubic-bezier(0.34,1.56,0.64,1) 0.2s" }}/>
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 52, fontWeight: 800, color: "#0F1419", letterSpacing: -2, lineHeight: 1, fontFamily: "inherit" }}>{fmt(outScore)}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: retState.color, marginTop: 4, letterSpacing: 0.5 }}>{retState.label}</div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", padding: "0 24px 4px" }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: C.textSecondary, lineHeight: 1.5 }}>
              {retState.label === "Efficient"
                ? <span>Your filtered water supports <strong style={{ color: retState.colorDark, fontWeight: 700 }}>efficient cellular absorption</strong>.</span>
                : retState.label === "Optimal"
                  ? <span>Your filtered water is at peak purity for <strong style={{ color: retState.colorDark, fontWeight: 700 }}>cellular absorption</strong>.</span>
                  : <span>Improve filter output for better <strong style={{ color: retState.colorDark, fontWeight: 700 }}>cellular absorption</strong> support.</span>
              }
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "12px 20px 20px" }}>
            <button onClick={() => setOpenSheet('incoming')} style={{ backgroundColor: "rgba(15, 20, 25, 0.04)", borderRadius: 16, padding: "14px 16px", border: "1px solid rgba(15, 20, 25, 0.06)", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>Incoming Water</span>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(166,168,171,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: C.muted }}>i</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#0F1419", letterSpacing: -1, lineHeight: 1 }}>{inTds}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: C.muted, marginTop: 3 }}>TDS ppm</div>
              <div style={{ marginTop: 6 }}><span style={{ fontSize: 10, fontWeight: 700, color: "#C89B3C", background: "rgba(200, 155, 60, 0.10)", padding: "3px 8px", borderRadius: 20, border: "1px solid rgba(200, 155, 60, 0.20)" }}>Moderate</span></div>
            </button>
            <button onClick={() => setOpenSheet('filtered')} style={{ backgroundColor: "rgba(74, 138, 111, 0.08)", borderRadius: 16, padding: "14px 16px", border: "1px solid rgba(74, 138, 111, 0.18)", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>Filtered Output</span>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(74,138,111,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#3D7058" }}>i</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#3D7058", letterSpacing: -1, lineHeight: 1 }}>{fmt(outTds)}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: C.muted, marginTop: 3 }}>TDS ppm</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#3D7058", display: "flex", alignItems: "center", gap: 3, marginTop: 6 }}><span>&#x2193;</span> {reductionPct}% reduction</div>
            </button>
          </div>
        </div>

        <WaterInfoSheet type="incoming" isOpen={openSheet==='incoming'} onClose={() => setOpenSheet(null)} incomingTds={342} filteredTds={tds ?? 3} address="1234 Crestview Dr, Palm Desert, CA" zip="92203" onNavigateToReport={() => window.dispatchEvent(new CustomEvent('wtr-navigate',{detail:{tab:'wtr-intel',scan:'92203'}}))} />
        <WaterInfoSheet type="filtered" isOpen={openSheet==='filtered'} onClose={() => setOpenSheet(null)} incomingTds={342} filteredTds={tds ?? 3} address="1234 Crestview Dr, Palm Desert, CA" zip="92203" onNavigateToReport={() => window.dispatchEvent(new CustomEvent('wtr-navigate',{detail:{tab:'wtr-intel',scan:'92203'}}))} />

        {/* CARD 2: DAILY PROTECTION */}
        <button data-testid="hub-protection-card" onClick={() => setOpenSheet('protection')} className="card-default" style={{ padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", width: "100%", fontFamily: "inherit", textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #51B0E6 0%, #1F6FA0 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <HubIcon name="shield" size={22} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, lineHeight: 1.2 }}>Home Protected</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>14 contaminants removed today</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative", width: 44, height: 44 }}>
              <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(15, 20, 25, 0.06)" strokeWidth="5"/>
                <circle cx="22" cy="22" r="18" fill="none" stroke="#4A8A6F" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(94 / 100) * (2 * Math.PI * 18)} ${2 * Math.PI * 18}`} style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#3D7058" }}>94%</div>
            </div>
            <div style={{ fontSize: 18, color: C.muted }}>{"\u203A"}</div>
          </div>
        </button>

        {openSheet === 'protection' && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={(e) => { if (e.target === e.currentTarget) setOpenSheet(null); }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(15, 20, 25, 0.35)", backdropFilter: "blur(8px)" }} onClick={() => setOpenSheet(null)} />
            <div className="card-default" style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 480, borderRadius: "28px 28px 0 0", padding: "0 0 40px", boxShadow: "0 -16px 60px rgba(15, 20, 25, 0.20)", animation: "fadeInUp 0.28s cubic-bezier(0.34,1.56,0.64,1)" }}>
              <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 0" }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(15, 20, 25, 0.10)" }} />
              </div>
              <div style={{ padding: "20px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Daily Protection Score</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: C.navy }}>Home Protected</div>
                </div>
                <button onClick={() => setOpenSheet(null)} style={{ background: "rgba(15, 20, 25, 0.06)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: C.muted, fontWeight: 700 }}>
                  &#x2715;
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 24px 12px" }}>
                <div style={{ position: "relative", width: 120, height: 120 }}>
                  <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(15, 20, 25, 0.06)" strokeWidth="12"/>
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#4A8A6F" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(94 / 100) * (2 * Math.PI * 50)} ${2 * Math.PI * 50}`} style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)" }} />
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#4A8A6F30" strokeWidth="20" strokeLinecap="round" strokeDasharray={`${(94 / 100) * (2 * Math.PI * 50)} ${2 * Math.PI * 50}`} style={{ filter: "blur(6px)" }} />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontSize: 34, fontWeight: 800, color: "#3D7058", lineHeight: 1 }}>94%</div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginTop: 3 }}>Protected</div>
                  </div>
                </div>
              </div>

              <div style={{ padding: "0 24px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>Score Breakdown</div>
                {[
                  { label: "System Uptime", value: "100%", color: "#4A8A6F" },
                  { label: "Filter Capacity", value: "94%", color: "#51B0E6" },
                  { label: "Output Consistency", value: "Stable", color: "#4A8A6F" },
                  { label: "Contaminants Blocked", value: "14", color: "#4A8A6F" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: C.navy }}>{item.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ padding: "20px 24px 0" }}>
                <button className="btn-brand" style={{ width: "100%", padding: "15px 0", borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
                  View Protection History
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CARD 3: OUTPUT QUALITY CHART */}
        <div className="card-default" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 3 }}>Output Quality Today</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.navy }}>Hourly TDS consistently retained</div>
            </div>
            <div style={{ background: `${C.blue}12`, border: `1px solid ${C.blue}30`, borderRadius: 20, padding: "5px 12px", fontSize: 10, fontWeight: 700, color: C.blue }}>24h</div>
          </div>
          <div style={{ marginTop: 18, display: "flex", alignItems: "flex-end", gap: 5, height: 72 }}>
            {hourlyBars.map((bar, i) => {
              const isNow = bar.hour === "Now";
              const barHeight = Math.max(20, Math.round((bar.tds / (maxBarTds + 2)) * 64));
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: "100%", height: barHeight, borderRadius: 4, background: isNow ? "linear-gradient(180deg, #4A8A6F 0%, #3D7058 100%)" : `${C.blue}60`, transition: "height 0.8s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: isNow ? "0 2px 8px rgba(74,138,111,0.4)" : "none" }} />
                  <div style={{ fontSize: 7, fontWeight: isNow ? 800 : 500, color: isNow ? "#3D7058" : C.muted, letterSpacing: 0, whiteSpace: "nowrap" }}>{bar.hour}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: "#4A8A6F" }} />
              <span style={{ fontSize: 10, color: C.muted }}>Now ({outTds > 0 ? outTds : 3} ppm)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: `${C.blue}60` }} />
              <span style={{ fontSize: 10, color: C.muted }}>Previous hours</span>
            </div>
          </div>
        </div>

        {/* CARD 4: TODAY'S FILTERED WATER GOAL */}
        <div className="card-default" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>Today's Filtered Water</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 44, fontWeight: 800, color: C.navy, fontVariantNumeric: "tabular-nums", letterSpacing: -1.5, lineHeight: 1 }}>{currentL.toFixed(1)}</span>
            <span style={{ fontSize: 20, fontWeight: 600, color: C.muted }}>/ {goalL} L</span>
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
            {remainingL > 0 ? `${remainingL.toFixed(1)} L to reach your daily goal` : "Daily goal reached!"}
          </div>
          <div style={{ height: 10, borderRadius: 5, background: "rgba(15, 20, 25, 0.06)", overflow: "hidden", marginBottom: 10 }}>
            <div style={{ height: "100%", borderRadius: 5, width: `${Math.min(100, goalPct)}%`, background: "linear-gradient(90deg, #51B0E6 0%, #4A8A6F 100%)", transition: "width 1.2s cubic-bezier(0.34,1.56,0.64,1)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, color: C.muted, fontWeight: 600 }}>
            <span>0 L</span>
            <span style={{ color: "#4A8A6F", fontWeight: 700 }}>{currentL.toFixed(1)} L now</span>
            <span>{goalL} L goal</span>
          </div>
        </div>

        {/* CARD 5: TODAY */}
        <div className="card-default" style={{ padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.gray, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>Today</div>
          {todayMl > 0 ? (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 40, fontWeight: 700, color: C.navy, fontVariantNumeric: "tabular-nums", letterSpacing: -1, lineHeight: 1 }}>{fmt(todayL, 1)}</span>
                <span style={{ fontSize: 18, fontWeight: 500, color: C.gray }}>L</span>
              </div>
              <div style={{ fontSize: 13, color: C.gray, marginTop: 6 }}>{fmt(todayBottles)} bottles</div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 40, fontWeight: 700, color: "rgba(15, 20, 25, 0.20)", fontVariantNumeric: "tabular-nums", letterSpacing: -1, lineHeight: 1 }}>0</span>
                <span style={{ fontSize: 18, fontWeight: 500, color: "rgba(15, 20, 25, 0.20)" }}>L</span>
              </div>
              <div style={{ fontSize: 13, color: C.gray, marginTop: 6 }}>Start dispensing to track</div>
            </>
          )}
        </div>

        {/* CARD 6: YOUR IMPACT */}
        <div className="card-default" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.gray, letterSpacing: 1.5, textTransform: "uppercase" }}>Your Impact</div>
            <div style={{ position: "relative", width: 40, height: 40 }}>
              <CarbonRing pct={carbon.goalPct} size={40} strokeWidth={4} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#4A8A6F" }}>
                {fmt(carbon.goalPct)}%
              </div>
            </div>
          </div>
          {carbon.hasData ? (
            <>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 48, fontWeight: 700, color: C.navy, fontVariantNumeric: "tabular-nums", letterSpacing: -1, lineHeight: 1 }}>{fmt(animBottles)}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.gray, marginTop: 6 }}>Bottles Saved</div>
              </div>
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontSize: 13, color: C.textSecondary }}>{fmt(safeNum(animCo2), 1)} kg CO{"\u2082"} avoided</div>
                <div style={{ fontSize: 13, color: C.textSecondary }}>{fmt(safeNum(animTrees) / 10, 1)} trees this year</div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontSize: 48, fontWeight: 700, color: "rgba(15, 20, 25, 0.20)", letterSpacing: -1, lineHeight: 1 }}>0</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.gray, marginTop: 6 }}>Bottles Saved</div>
              <div style={{ fontSize: 12, color: C.gray, marginTop: 12, lineHeight: 1.6 }}>Every 500 mL of filtered water you dispense eliminates one single-use plastic bottle.</div>
            </div>
          )}
        </div>

        {/* CARD 7: FILTER HEALTH */}
        <div data-testid="hub-filter-section" className="card-default" style={{ padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.gray, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>Filter Health</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {FILTERS.map(f => {
              const life = safeNum(tele?.[f.key], 0);
              const pct = Math.min(100, life);
              const col = filterColor(life);
              return (
                <div key={f.key}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{f.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.navy, fontVariantNumeric: "tabular-nums" }}>{fmt(life)}%</span>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: col, transition: "background 0.5s" }} />
                    </div>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "rgba(15, 20, 25, 0.06)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: col, transition: "width 1s ease, background 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CARD 8: WHAT GETS REMOVED — NAVY HEADER PRESERVED PER SPEC */}
        <div className="card-default" style={{ overflow: "hidden", padding: 0 }}>
          <div style={{ background: "#0A1A2E", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>What Gets Removed</div>
            <div style={{ fontSize: 9, fontWeight: 600, color: "#51B0E6", letterSpacing: 0.5 }}>YOUR HOME WATER</div>
          </div>
          <div style={{ padding: "0 18px" }}>
            {[
              { name: "PFAS (Total)", category: "Forever Chemicals", level: "2.1 ppt", removal: "99%+" },
              { name: "Chromium-6", category: "Heavy Metal", level: "0.15 ppb", removal: "99%+" },
              { name: "Haloacetic Acids", category: "Disinfection Byproduct", level: "38 ppb", removal: "99%+" },
              { name: "Lead", category: "Heavy Metal", level: "3.8 ppb", removal: "99%+" },
              { name: "Arsenic", category: "Heavy Metal", level: "2.8 ppb", removal: "99%+" },
              { name: "Microplastics", category: "Emerging Contaminant", level: "Detected", removal: "99%+" },
            ].map((c, i, arr) => (
              <div key={c.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0F1419" }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{c.category}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#B84A4A" }}>{c.level}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#3D7058", background: "rgba(74, 138, 111, 0.10)", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(74, 138, 111, 0.20)" }}>&#x2713; {c.removal}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: "16px 18px", borderTop: `1px solid ${C.border}`, background: "rgba(255, 255, 255, 0.35)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 10 }}>
              {[
                { label: "TAP", color: "rgba(15, 20, 25, 0.10)", text: "#A6A8AB" },
                { label: "CP", color: "#51B0E6", text: "#FFF" },
                { label: "RO", color: "#1F6FA0", text: "#FFF" },
                { label: "TC", color: "#C89B3C", text: "#FFF" },
                { label: "ALK", color: "#8B6FC0", text: "#FFF" },
                { label: "PURE", color: "#4A8A6F", text: "#FFF" },
              ].map((s, i, arr) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, color: s.text, letterSpacing: 0.3 }}>{s.label}</div>
                  {i < arr.length - 1 && <span style={{ color: "rgba(15, 20, 25, 0.20)", fontSize: 10 }}>&#x2192;</span>}
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
              {[["1,000+", "Contaminants"], ["99%+", "PFAS"], ["99%+", "Heavy Metals"], ["Ca+Mg", "Remineralized"]].map(([val, label]) => (
                <div key={label} style={{ textAlign: "center", background: "rgba(81, 176, 230, 0.10)", borderRadius: 8, padding: "8px 4px", border: "1px solid rgba(81, 176, 230, 0.20)" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#51B0E6" }}>{val}</div>
                  <div style={{ fontSize: 7, color: C.muted, marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {showOffline && <OfflineModal onDismiss={() => setShowOffline(false)} />}
    </div>
  );
}
