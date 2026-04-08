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

// ─── BRAND COLORS ───────────────────────────────────────────────────────────
const C = {
  navy: "#060E18", card: "#0D1825", cardDeep: "#0A1520",
  border: "#1A2535", borderLight: "#2A3545",
  blue: "#51B0E6", blueDark: "#2A8FCA",
  gray: "#A6A8AB", muted: "#556070", ghost: "#3A4A5E", white: "#F0F4F8",
  green: "#1E8A4C", yellow: "#F29423", orange: "#E07020",
  red: "#D93025", deepRed: "#A01420",
};

// ─── TDS UTILITIES ──────────────────────────────────────────────────────────
function tdsColor(p) {
  if (p == null) return C.blue;
  if (p <= 35)  return C.green;
  if (p <= 150) return C.yellow;
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
function filterColor(p) { return p >= 76 ? C.green : p >= 40 ? C.yellow : C.red; }
function filterStatus(p) { return p >= 76 ? "Healthy" : p >= 40 ? "Monitor" : "Replace Soon"; }

// ─── FILTER METADATA (from MCU SDK — Product Key: btu00aae5ktjhacq) ─────────
const FILTERS = [
  { key: "pp_filtertime",   slot: "pp",   model: "HWH100",       name: "Pre-Filter",      stage: "Stage 1", tag: "CP Composite",   desc: "Blocks sand, silt, rust & chlorine. Conditions water and extends RO membrane life.", life: "12\u201315 mo \u00B7 900\u20131,000 gal",   chartKey: "pp",   chartColor: C.blue  },
  { key: "ro_filtertime",   slot: "ro",   model: "HWH101-1200G", name: "RO Membrane",     stage: "Stage 2", tag: "0.0001 Micron",  desc: "Removes 99.99% of 1,000+ contaminants: PFAS, Lead, Fluoride, Arsenic, Chromium-6.",  life: "24\u201348 mo \u00B7 1,800\u20132,000 gal", chartKey: "ro",   chartColor: C.green },
  { key: "cto_filtertime",  slot: "cto",  model: "HWH102",       name: "Carbon Polish",   stage: "Stage 3", tag: "TC Post-Carbon", desc: "NSF-certified, Japan & Switzerland sourced. Removes residual taste, odor and VOCs.",  life: "6 mo \u00B7 450\u2013900 gal",         chartKey: "cto",  chartColor: C.yellow},
  { key: "cbpa_filtertime", slot: "cbpa", model: "GAF-100",      name: "Alkaline Filter", stage: "Stage 4", tag: "Ionic Alkaline", desc: "Ocean bioceramic beads add Ca, Mg, K, Na. Elevates pH to 10 for bioavailable water.", life: "12\u201318 mo \u00B7 900\u20131,000 gal",   chartKey: "cbpa", chartColor: C.gray  },
];

// ─── CHART TOOLTIP ──────────────────────────────────────────────────────────
function ChartTip({ active, payload, label, unit = "", extraFn }) {
  if (!active || !payload?.length) return null;
  const fmtLabel = (ts) => { try { return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); } catch { return ts; } };
  return (
    <div style={{ background: C.cardDeep, border: `1px solid ${C.borderLight}`, borderRadius: 10, padding: "8px 12px", fontSize: 12 }}>
      <div style={{ color: C.ghost, marginBottom: 4, fontFamily: "DM Mono,monospace" }}>{fmtLabel(label)}</div>
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

// ─── TDS HERO CIRCLE ────────────────────────────────────────────────────────
function TDSCircle({ tds, flushing }) {
  const SIZE = 260, CX = 130, CY = 130, R = 108, SW = 18;
  const circ = 2 * Math.PI * R;
  const col  = tdsColor(tds);
  const fill = tds != null ? (Math.min(100, (tds / 500) * 100) / 100) * circ : 0;

  return (
    <div style={{ position: "relative", width: SIZE, height: SIZE, margin: "0 auto" }}>
      {/* Ambient glow */}
      <div style={{ position: "absolute", inset: 24, borderRadius: "50%", background: `radial-gradient(circle, ${col}20 0%, transparent 70%)`, filter: "blur(22px)", transition: "background 1.2s ease", pointerEvents: "none" }} />

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Track */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={C.border} strokeWidth={SW} />
        {/* Glow */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={`${col}40`} strokeWidth={SW + 14}
          strokeLinecap="round" strokeDasharray={`${fill} ${circ}`}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1), stroke 1s", filter: "blur(10px)" }} />
        {/* Fill */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={col} strokeWidth={SW}
          strokeLinecap="round" strokeDasharray={`${fill} ${circ}`}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1), stroke 1s" }} />
        {/* Flush spinner */}
        {flushing && (
          <circle cx={CX} cy={CY} r={R + SW + 8} fill="none" stroke={`${C.blue}50`} strokeWidth={4}
            strokeLinecap="round" strokeDasharray="40 220"
            style={{ animation: "hubSpin 1.2s linear infinite" }} />
        )}
      </svg>

      {/* Center text */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ fontSize: 62, fontWeight: 800, color: col, fontVariantNumeric: "tabular-nums", fontFamily: "system-ui,-apple-system", letterSpacing: -3, lineHeight: 1, textShadow: `0 0 80px ${col}40, 0 0 160px ${col}18`, transition: "color 1s" }}>
          {flushing ? <HubIcon name="refresh" size={48} color={C.blue} /> : (tds ?? "\u2014")}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, letterSpacing: 2.5, textTransform: "uppercase", marginTop: 6 }}>
          {flushing ? "Flushing\u2026" : "ppm TDS"}
        </div>
        {!flushing && (
          <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: col, letterSpacing: 1, textTransform: "uppercase", transition: "color 1s" }}>
            {tdsLabel(tds)}
          </div>
        )}
      </div>

      {/* Top badge */}
      <div style={{ position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", background: `${C.card}CC`, border: `1px solid ${C.border}60`, borderRadius: 30, padding: "4px 14px", fontSize: 11, fontWeight: 700, color: C.blue, letterSpacing: 0.5, whiteSpace: "nowrap", backdropFilter: "blur(12px)" }}>
        1,200 GPD {"\u00B7"} Output Quality
      </div>
    </div>
  );
}

// ─── TDS SCALE BAR ──────────────────────────────────────────────────────────
function TDSBar({ tds }) {
  const bands = [
    { l: "Pure",     r: "0\u201335",    c: C.green,   min: 0,   max: 35   },
    { l: "Good",     r: "35\u2013150",  c: C.yellow,  min: 35,  max: 150  },
    { l: "Moderate", r: "150\u2013300", c: C.orange,  min: 150, max: 300  },
    { l: "Poor",     r: "300\u2013500", c: C.red,     min: 300, max: 500  },
    { l: "Unsafe",   r: "500+",         c: C.deepRed, min: 500, max: 9999 },
  ];
  const ai = tds != null ? (bands.findIndex(b => tds >= b.min && tds < b.max)) : -1;
  const activeIdx = ai === -1 && tds >= 500 ? 4 : ai;

  return (
    <div style={{ width: "100%", padding: "0 2px" }}>
      <div style={{ display: "flex", gap: 3, marginBottom: 5 }}>
        {bands.map((b, i) => (
          <div key={b.l} style={{ flex: i === 1 || i === 2 ? 2 : 1, height: activeIdx === i ? 9 : 5, borderRadius: 5, background: activeIdx === i ? b.c : `${b.c}35`, boxShadow: activeIdx === i ? `0 0 10px ${b.c}80` : "none", transition: "all 0.5s", marginTop: activeIdx === i ? -2 : 0 }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 3 }}>
        {bands.map((b, i) => (
          <div key={b.l} style={{ flex: i === 1 || i === 2 ? 2 : 1, textAlign: "center", fontSize: activeIdx === i ? 10 : 9, fontWeight: activeIdx === i ? 800 : 500, color: activeIdx === i ? b.c : C.ghost, transition: "all 0.5s", lineHeight: 1.4 }}>
            <div>{b.l}</div>
            <div style={{ opacity: 0.7 }}>{b.r}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── INTELLIGENCE SUMMARY CARDS ─────────────────────────────────────────────
function SummaryCards({ usage, tele }) {
  const tdsCol = tdsColor(usage?.tds_current);
  const cards = [
    {
      icon: "droplet", label: "Total Output", color: C.blue,
      main: usage?.total_liters_lifetime != null ? `${usage.total_liters_lifetime.toFixed(1)}L` : "\u2014",
      sub:  usage?.total_bottles_lifetime != null ? `${usage.total_bottles_lifetime.toLocaleString()} bottles` : "",
    },
    {
      icon: "flask", label: "Water Quality", color: tdsCol,
      main: usage?.tds_current != null ? `${usage.tds_current} ppm` : "\u2014",
      sub:  usage?.tds_avg_1h != null ? `${usage.tds_avg_1h} avg \u00B7 1h` : "",
    },
    {
      icon: "target", label: "This Session", color: C.green,
      main: usage?.session_ml != null ? `${(usage.session_ml / 1000).toFixed(2)}L` : "\u2014",
      sub:  usage?.session_bottles != null ? `${usage.session_bottles} bottles` : "",
    },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
      {cards.map(cd => (
        <div key={cd.label} style={{ background: `linear-gradient(145deg, ${C.card}, ${C.cardDeep})`, border: `1px solid ${cd.color}25`, borderRadius: 18, padding: "14px 10px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -16, right: -16, width: 60, height: 60, borderRadius: "50%", background: `radial-gradient(circle, ${cd.color}15 0%, transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ marginBottom: 5 }}><HubIcon name={cd.icon} size={16} color={cd.color} /></div>
          <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 5, lineHeight: 1.3 }}>{cd.label}</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: cd.color, fontVariantNumeric: "tabular-nums", fontFamily: "system-ui", letterSpacing: -0.5, lineHeight: 1 }}>{cd.main}</div>
          {cd.sub && <div style={{ fontSize: 10, color: C.ghost, marginTop: 4, fontWeight: 600 }}>{cd.sub}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── CHART SECTION ──────────────────────────────────────────────────────────
function ChartSection({ hist, chartWin, setChartWin }) {
  const [tab, setTab] = useState("tds");
  const fmtTime = ts => { try { return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); } catch { return ""; } };
  const axStyle = { fill: C.ghost, fontSize: 10, fontFamily: "DM Mono,monospace" };
  const cBg = { background: C.card, borderRadius: 14, padding: "12px 4px 8px" };
  const lastTds = hist?.tds?.slice(-1)?.[0]?.value;
  const tdsCol = tdsColor(lastTds);

  return (
    <div style={{ background: C.card, borderRadius: 24, padding: "18px 16px", border: `1px solid ${C.border}` }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.ghost, letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>Generosity{"\u2122"}</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.white }}>Water Intelligence</div>
        </div>
        {/* Time window pills */}
        <div style={{ display: "flex", gap: 4 }}>
          {[{ v: 30, l: "30m" }, { v: 60, l: "1h" }, { v: 360, l: "6h" }].map(({ v, l }) => (
            <button key={v} onClick={() => setChartWin(v)} data-testid={`chart-win-${v}`} style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${chartWin === v ? C.blue : C.border}`, background: chartWin === v ? `${C.blue}18` : "transparent", color: chartWin === v ? C.blue : C.ghost, fontSize: 10, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Chart tab switcher */}
      <div style={{ display: "flex", background: C.cardDeep, borderRadius: 12, padding: 3, marginBottom: 16 }}>
        {[{ id: "tds", l: "TDS Quality" }, { id: "water", l: "Water Output" }, { id: "filter", l: "Filter Life" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} data-testid={`chart-tab-${t.id}`} style={{ flex: 1, padding: "8px 0", borderRadius: 10, border: "none", background: tab === t.id ? "#1A2A3E" : "transparent", color: tab === t.id ? C.blue : C.ghost, fontSize: 11, fontWeight: tab === t.id ? 700 : 500, cursor: "pointer", transition: "all 0.2s" }}>{t.l}</button>
        ))}
      </div>

      {/* TDS Quality Chart */}
      {tab === "tds" && (
        <div style={cBg}>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={hist?.tds || []} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gwTdsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={tdsCol} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={tdsCol} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="ts" tickFormatter={fmtTime} tick={axStyle} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={axStyle} axisLine={false} tickLine={false} domain={[0, 50]} />
              <Tooltip content={<ChartTip unit="ppm" extraFn={v => tdsLabel(v)} />} />
              <ReferenceLine y={35}  stroke={C.green}  strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: "35", fill: C.green,  fontSize: 9, position: "right" }} />
              <ReferenceLine y={150} stroke={C.yellow} strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: "150", fill: C.yellow, fontSize: 9, position: "right" }} />
              <Area type="monotone" dataKey="value" stroke={tdsCol} strokeWidth={2} fill="url(#gwTdsGrad)" dot={false} name="TDS" />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 6, fontSize: 10, color: C.ghost }}>
            <span style={{ color: C.green }}>{"\u2500\u2500"} 35 ppm: Pure</span>
            <span style={{ color: C.yellow }}>{"\u2500\u2500"} 150 ppm: Good</span>
          </div>
        </div>
      )}

      {/* Water Output Charts */}
      {tab === "water" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>Dispensed per Period (mL)</div>
            <div style={cBg}>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={hist?.water_per_bucket || []} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <XAxis dataKey="ts" tickFormatter={fmtTime} tick={axStyle} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={axStyle} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip unit="mL" />} />
                  <Bar dataKey="value" fill={C.blue} radius={[3, 3, 0, 0]} name="Dispensed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>Cumulative Total (mL)</div>
            <div style={cBg}>
              <ResponsiveContainer width="100%" height={130}>
                <AreaChart data={hist?.water_total || []} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gwWaterGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.blue} stopOpacity={0.3} />
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

      {/* Filter Life Chart */}
      {tab === "filter" && (
        <div style={cBg}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="ts" tickFormatter={fmtTime} tick={axStyle} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={axStyle} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<ChartTip unit="%" />} />
              <ReferenceLine y={40} stroke={C.yellow} strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: "40% Monitor", fill: C.yellow, fontSize: 9, position: "insideTopLeft" }} />
              <ReferenceLine y={20} stroke={C.red}    strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: "20% Critical", fill: C.red, fontSize: 9, position: "insideTopLeft" }} />
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

// ─── FILTER ARC CARD ────────────────────────────────────────────────────────
function FilterCard({ filter, life, expanded, onToggle, onReset }) {
  const col  = filterColor(life);
  const stat = filterStatus(life);
  const SIZE = 72, R = 28, SW = 7, CX = 36, CY = 36;
  const circ = 2 * Math.PI * R;
  const fill = (Math.min(100, life) / 100) * circ;

  return (
    <div data-testid={`filter-card-${filter.model}`} style={{ background: `linear-gradient(145deg, ${C.card}, ${C.cardDeep})`, border: `1px solid ${expanded ? col + "50" : C.border + "40"}`, borderRadius: 20, padding: 16, cursor: "pointer", transition: "border-color 0.3s", WebkitTapHighlightColor: "transparent" }}>
      <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Arc gauge */}
        <div style={{ position: "relative", width: SIZE, height: SIZE, flexShrink: 0 }}>
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            <circle cx={CX} cy={CY} r={R} fill="none" stroke={C.border} strokeWidth={SW} />
            <circle cx={CX} cy={CY} r={R} fill="none" stroke={`${col}30`} strokeWidth={SW + 6}
              strokeLinecap="round" strokeDasharray={`${fill} ${circ}`}
              transform={`rotate(-90 ${CX} ${CY})`} style={{ filter: "blur(4px)" }} />
            <circle cx={CX} cy={CY} r={R} fill="none" stroke={col} strokeWidth={SW}
              strokeLinecap="round" strokeDasharray={`${fill} ${circ}`}
              transform={`rotate(-90 ${CX} ${CY})`}
              style={{ transition: "stroke-dasharray 1s, stroke 0.5s" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: col, fontVariantNumeric: "tabular-nums", fontFamily: "system-ui", transition: "color 0.5s" }}>{life}%</div>
          </div>
        </div>
        {/* Labels */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: C.white }}>{filter.name}</span>
            <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: `${col}18`, color: col, border: `1px solid ${col}35`, letterSpacing: 0.8, textTransform: "uppercase" }}>{stat}</span>
          </div>
          <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>{filter.model} {"\u00B7"} {filter.tag}</div>
          <div style={{ fontSize: 10, color: C.ghost, marginTop: 2 }}>{filter.life}</div>
        </div>
        <div style={{ fontSize: 16, color: C.ghost, transition: "transform 0.25s", transform: expanded ? "rotate(90deg)" : "rotate(0deg)", flexShrink: 0 }}>{"\u203A"}</div>
      </div>

      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 14, paddingTop: 14 }}>
          <div style={{ fontSize: 13, color: C.gray, lineHeight: 1.7, marginBottom: 14 }}>{filter.desc}</div>
          {life < 40 && (
            <div style={{ padding: "8px 12px", background: "#D9302518", border: "1px solid #D9302540", borderRadius: 10, color: C.red, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
              {"\u26A0"} Replacement recommended
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onReset(filter.slot); }}
            data-testid={`filter-reset-${filter.slot}`}
            style={{ padding: "8px 14px", background: C.border, border: `1px solid ${C.borderLight}`, borderRadius: 10, color: C.blue, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            Reset After Replacement
          </button>
        </div>
      )}
    </div>
  );
}

// ─── OFFLINE MODAL ──────────────────────────────────────────────────────────
function OfflineModal({ onDismiss }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 0 20px", zIndex: 200, backdropFilter: "blur(10px)" }}>
      <div style={{ width: "100%", maxWidth: 480, background: C.card, borderRadius: "24px 24px 20px 20px", padding: "28px 24px 32px", border: `1px solid ${C.border}`, boxShadow: "0 -20px 60px rgba(0,0,0,0.6)" }}>
        <div style={{ marginBottom: 8 }}><HubIcon name="signal" size={32} color={C.blue} /></div>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.white, marginBottom: 8 }}>Device Offline</div>
        <div style={{ fontSize: 13, color: C.gray, lineHeight: 1.7, marginBottom: 20 }}>Your Home WTR Hub Gen-2 is not reachable. Please check:</div>
        {["Hub is powered on and plugged in", "Wi-Fi router is working", "Hub Wi-Fi credentials are unchanged", "Hub is within range of your router"].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.border, border: `1px solid ${C.borderLight}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: C.muted, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
            <div style={{ fontSize: 13, color: C.gray, lineHeight: 1.6 }}>{item}</div>
          </div>
        ))}
        <button onClick={onDismiss} data-testid="hub-offline-dismiss" style={{ width: "100%", marginTop: 16, padding: "16px 0", background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`, color: C.navy, border: "none", borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 24px ${C.blue}40` }}>
          Got It
        </button>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ────────────────────────────────────────────────────────────
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

  // Loading skeletons
  if (loading) {
    return (
      <div data-testid="wtr-hub-screen" style={{ fontFamily: "DM Sans,-apple-system,sans-serif", background: C.navy, color: C.white, padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700;800&display=swap" rel="stylesheet" />
        {[260, 80, 280, 80, 80, 80, 80].map((h, i) => (
          <div key={i} style={{ height: h, background: C.card, borderRadius: 20, animation: "hubPulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
        ))}
        <style>{`@keyframes hubPulse { 0%,100%{opacity:.35} 50%{opacity:.65} }`}</style>
      </div>
    );
  }

  return (
    <div data-testid="wtr-hub-screen" style={{ fontFamily: "DM Sans,-apple-system,BlinkMacSystemFont,sans-serif", background: C.navy, color: C.white, display: "flex", flexDirection: "column", WebkitFontSmoothing: "antialiased" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`@keyframes fadeInUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} } @keyframes gentlePulse { 0%,100%{opacity:1} 50%{opacity:0.5} } @keyframes hubSpin   { to { transform: rotate(360deg); } } @keyframes hubPulse  { 0%,100%{opacity:.35} 50%{opacity:.65} } * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; } ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #1A2535; border-radius: 2px; }`}</style>

      {/* STICKY HEADER */}
      <div style={{ background: `linear-gradient(180deg, #0B1C30 0%, ${C.navy} 100%)`, padding: "18px 20px 14px", borderBottom: `1px solid ${C.border}50`, position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <img src="/generosity-logo.png" alt="Generosity™ Water Intelligence" style={{ height: 28, marginBottom: 6, display: "block" }} />
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>Home WTR Hub</div>
            <div style={{ fontSize: 11, color: C.ghost, marginTop: 2, fontFamily: "DM Mono,monospace" }}>Gen-2 {"\u00B7"} 1,200 GPD {"\u00B7"} 11-Stage RO</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            {/* Connection status */}
            <div data-testid="hub-connection-status" style={{ display: "flex", alignItems: "center", gap: 6, background: connected ? `${C.green}18` : `${C.red}18`, border: `1px solid ${connected ? C.green : C.red}40`, borderRadius: 20, padding: "5px 12px" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: connected ? C.green : C.red, boxShadow: connected ? `0 0 8px ${C.green}` : "none", animation: connected ? "gentlePulse 2s ease-in-out infinite" : "none" }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: connected ? C.green : C.red }}>{connected ? "Connected" : "Offline"}</span>
            </div>
            {/* Mode badge */}
            <div data-testid="hub-mode-badge" style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: isMock ? `${C.yellow}18` : wsStatus === "live" ? `${C.green}18` : `${C.yellow}18`, color: isMock ? C.yellow : wsStatus === "live" ? C.green : C.yellow, border: `1px solid ${isMock ? C.yellow : wsStatus === "live" ? C.green : C.yellow}40`, letterSpacing: 0.8, textTransform: "uppercase" }}>
              {isMock ? "Demo Mode" : wsStatus === "live" ? "\u25CF Live" : wsStatus}
            </div>
          </div>
        </div>
      </div>

      {/* SCROLLABLE BODY */}
      <div style={{ padding: "20px 16px 48px", display: "flex", flexDirection: "column", gap: 16, animation: "fadeInUp 0.3s ease" }}>

        {/* Health Banner */}
        <div data-testid="hub-health-banner" style={{ display: "flex", alignItems: "center", gap: 12, background: flushing ? `${C.blue}14` : connected ? `${C.green}14` : `${C.red}14`, border: `1px solid ${flushing ? C.blue : connected ? C.green : C.red}35`, borderRadius: 16, padding: "14px 16px" }}>
          <div style={{ flexShrink: 0 }}>{flushing ? <HubIcon name="refresh" size={22} color={C.blue} /> : connected ? <HubIcon name="check" size={22} color={C.green} /> : <HubIcon name="alertCircle" size={22} color={C.red} />}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: flushing ? C.blue : connected ? C.green : C.red, marginBottom: 2 }}>
              {flushing ? "Force wash in progress\u2026" : connected ? "Everything is ok" : "Device offline"}
            </div>
            <div style={{ fontSize: 11, color: C.ghost }}>
              {tele?.active_time_iso ? `Active: ${new Date(tele.active_time_iso).toLocaleString()}` : "\u2014"}
              {tele?.filter_status === "s1" && <span style={{ color: C.yellow }}> {"\u00B7"} Filter expiring soon</span>}
              {tele?.filter_status === "s2" && <span style={{ color: C.red }}> {"\u00B7"} Filter expired {"\u2014"} replace now</span>}
            </div>
          </div>
          {!connected && (
            <button onClick={() => setShowOffline(true)} data-testid="hub-help-btn" style={{ background: C.red, color: "#fff", border: "none", borderRadius: 10, padding: "8px 12px", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>Help</button>
          )}
        </div>

        {/* Product Showcase */}
        <div style={{ borderRadius: 24, overflow: "hidden", border: `1px solid ${C.border}60` }}>
          <img src="/wtr-hub-product-dark.png" alt="Generosity™ Home WTR Hub Gen-2 System" style={{ width: "100%", display: "block" }} />
        </div>

        {/* TDS Hero */}
        <div data-testid="hub-tds-hero" style={{ background: `linear-gradient(160deg, #0A1A2E 0%, ${C.navy} 100%)`, borderRadius: 28, padding: "28px 16px 22px", border: `1px solid ${C.border}60`, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${C.blue}05 1px, transparent 1px), linear-gradient(90deg, ${C.blue}05 1px, transparent 1px)`, backgroundSize: "28px 28px", pointerEvents: "none" }} />
          <TDSCircle tds={tds} flushing={flushing} />
          <TDSBar tds={tds} />
        </div>

        {/* Intelligence Summary */}
        <SummaryCards usage={usage} tele={tele} />

        {/* Charts */}
        <ChartSection hist={hist} chartWin={chartWin} setChartWin={setChartWin} />

        {/* Force Wash */}
        <button onClick={forceWash} disabled={flushing} data-testid="hub-force-wash-btn" style={{ width: "100%", padding: "16px 0", background: flushing ? C.border : `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`, color: flushing ? C.ghost : C.navy, border: flushing ? `1px solid ${C.borderLight}` : "none", borderRadius: 16, fontSize: 15, fontWeight: 800, cursor: flushing ? "not-allowed" : "pointer", letterSpacing: 0.3, boxShadow: flushing ? "none" : `0 6px 28px ${C.blue}40`, transition: "all 0.3s" }}>
          {flushing ? <><HubIcon name="refresh" size={16} color={C.ghost} /> <span style={{ marginLeft: 6 }}>Flushing in progress{"\u2026"}</span></> : <><HubIcon name="bolt" size={16} color={C.navy} /> <span style={{ marginLeft: 6 }}>Force Wash / Purge Cycle</span></>}
        </button>

        {/* Filter Life */}
        <div data-testid="hub-filter-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.ghost, letterSpacing: 2, textTransform: "uppercase" }}>Filter Life</div>
            <div style={{ fontSize: 10, color: C.ghost }}>Tap to expand {"\u00B7"} reset after swap</div>
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

        {/* Contaminant Removal */}
        <div data-testid="hub-contaminant-grid" style={{ background: C.card, borderRadius: 24, padding: 18, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.ghost, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Contaminant Removal</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[["biohazard","PFOS / PFOA",">99%"],["hazard","Lead",">99%"],["skull","Arsenic",">99%"],["testTube","Chromium-6",">99%"],["thermometer","Mercury",">99%"],["dna","Microplastics",">99%"],["bacteria","Bacteria/Cysts",">99%"],["flask","TDS",">97%"]].map(([iconName,label,rate]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: C.cardDeep, borderRadius: 12, border: `1px solid ${C.border}` }}>
                <HubIcon name={iconName} size={16} color={C.blue} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>{rate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Info */}
        <div data-testid="hub-device-info" style={{ background: C.card, borderRadius: 20, padding: "16px 18px", border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.ghost, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Device Info</div>
          {[
            ["Device ID",   tele?.device_id,              true ],
            ["Product Key", "btu00aae5ktjhacq",           true ],
            ["Flow Rate",   "1,200 GPD \u00B7 0.83 GPM",  false],
            ["pH Output",   "10.0 Alkaline",              false],
            ["Backend",     isMock ? "Simulator" : wsStatus, false],
            ["Certified",   "NSF \u00B7 ANSI \u00B7 RoHS \u00B7 CE", false],
          ].map(([label, value, mono]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.gray, fontFamily: mono ? "DM Mono,monospace" : "inherit", maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>{value ?? "\u2014"}</span>
            </div>
          ))}
        </div>

        {/* Product Showcase — Clean Shot */}
        <div style={{ borderRadius: 24, overflow: "hidden", border: `1px solid ${C.border}60` }}>
          <img src="/wtr-hub-product-white.png" alt="Generosity™ Home WTR Hub Gen-2 Product" style={{ width: "100%", display: "block" }} />
        </div>

        {/* Mission Footer */}
        <div style={{ background: `linear-gradient(135deg, #0A1A2E, ${C.navy})`, borderRadius: 20, padding: 18, border: `1px solid ${C.border}60`, textAlign: "center" }}>
          <div style={{ marginBottom: 8 }}><HubIcon name="wave" size={24} color={C.blue} /></div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.blue, marginBottom: 6 }}>Every Hub Sold = Lives Changed</div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>For every Home WTR Hub purchased, Generosity{"\u2122"} keeps safe water flowing to those affected by the global clean water crisis. 850+ projects worldwide.</div>
        </div>

      </div>

      {/* Offline Modal */}
      {showOffline && <OfflineModal onDismiss={() => setShowOffline(false)} />}
    </div>
  );
}
