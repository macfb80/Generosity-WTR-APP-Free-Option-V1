import { useState, useEffect, useRef, useCallback } from "react";

// ─── STROKE-BASED SVG ICONS (matching nav bar style) ────────────────────────
function BtlIcon({ name, size = 16, color = "#A6A8AB" }) {
  const s = size;
  const ic = color;
  const icons = {
    droplet: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 3C12 3 6 10 6 14C6 17.31 8.69 20 12 20C15.31 20 18 17.31 18 14C18 10 12 3 12 3Z" stroke={ic} strokeWidth="1.5" fill={`${ic}20`}/><path d="M9 14C9 14 10 12 12 12" stroke={ic} strokeWidth="1.2" strokeLinecap="round"/></svg>,
    thermometer: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 2C10.34 2 9 3.34 9 5V14.26C7.8 15.08 7 16.44 7 18C7 20.76 9.24 23 12 23C14.76 23 17 20.76 17 18C17 16.44 16.2 15.08 15 14.26V5C15 3.34 13.66 2 12 2Z" stroke={ic} strokeWidth="1.5" fill="none"/><circle cx="12" cy="18" r="2" fill={ic}/><line x1="12" y1="8" x2="12" y2="16" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/></svg>,
    testTube: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M7 2L7 16C7 18.76 9.24 21 12 21C14.76 21 17 18.76 17 16V2" stroke={ic} strokeWidth="1.5" strokeLinecap="round" fill="none"/><line x1="7" y1="2" x2="17" y2="2" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/><line x1="7" y1="13" x2="17" y2="13" stroke={ic} strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 2"/></svg>,
    battery: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="18" height="10" rx="2" stroke={ic} strokeWidth="1.5" fill="none"/><path d="M22 11V13" stroke={ic} strokeWidth="2" strokeLinecap="round"/><rect x="5" y="10" width="6" height="4" rx="1" fill={`${ic}40`}/></svg>,
    ruler: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke={ic} strokeWidth="1.5" fill="none"/><line x1="7" y1="5" x2="7" y2="10" stroke={ic} strokeWidth="1.2" strokeLinecap="round"/><line x1="11" y1="5" x2="11" y2="8" stroke={ic} strokeWidth="1.2" strokeLinecap="round"/><line x1="15" y1="5" x2="15" y2="10" stroke={ic} strokeWidth="1.2" strokeLinecap="round"/><line x1="19" y1="5" x2="19" y2="8" stroke={ic} strokeWidth="1.2" strokeLinecap="round"/></svg>,
    signal: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><line x1="12" y1="14" x2="12" y2="22" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/><path d="M8 10C9.1 8.9 10.5 8 12 8C13.5 8 14.9 8.9 16 10" stroke={ic} strokeWidth="1.5" strokeLinecap="round" fill="none"/><path d="M5 7C7 4.5 9.3 3 12 3C14.7 3 17 4.5 19 7" stroke={ic} strokeWidth="1.5" strokeLinecap="round" fill="none"/><circle cx="12" cy="13" r="1.5" fill={ic}/></svg>,
    target: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={ic} strokeWidth="1.5" fill="none"/><circle cx="12" cy="12" r="5" stroke={ic} strokeWidth="1.3" fill="none"/><circle cx="12" cy="12" r="1.5" fill={ic}/></svg>,
    hazard: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 2L22 20H2L12 2Z" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none"/><line x1="12" y1="9" x2="12" y2="14" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="17" r="1" fill={ic}/></svg>,
    flask: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M9 3V10L4 18C3.5 19 4 20 5 20H19C20 20 20.5 19 20 18L15 10V3" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none"/><line x1="8" y1="3" x2="16" y2="3" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/><path d="M7 15H17" stroke={ic} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  };
  return <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", verticalAlign: "middle" }}>{icons[name] || null}</span>;
}

// ═══════════════════════════════════════════════════════════════
// BLE PROTOCOL — PP02 V05 (Production Partners, 2026-01-16)
// Service UUID:    0xFFE0
// Write char:      0xFFE2  APP → Device
// Notify char:     0xFFE1  Device → APP
// Packet (TX):     [0x55][CHECKSUM][CMD][0x00][LEN_L][D0..Dn]
// Packet (RX):     [0xAA][CHECKSUM][CMD][LEN_H][LEN_L][D0..Dn]
// Checksum:        (CMD + LEN_H + LEN_L + ΣData) & 0xFF
// ═══════════════════════════════════════════════════════════════

const SVC  = "0000ffe0-0000-1000-8000-00805f9b34fb";
const WCHR = "0000ffe2-0000-1000-8000-00805f9b34fb";
const NCHR = "0000ffe1-0000-1000-8000-00805f9b34fb";

const CMD_INFO     = 0x10;
const CMD_ACTIVATE = 0x05;
const CMD_RESET    = 0x03;
const CMD_GOAL     = 0x02;

const POLL_MS    = 2000;
const MAX_HIST   = 60;

// ═══════════════════════════════════════════════════════════════
// PACKET HELPERS
// ═══════════════════════════════════════════════════════════════

function buildPkt(cmd, data = []) {
  const lH = 0x00, lL = data.length & 0xFF;
  const cs  = (cmd + lH + lL + data.reduce((a, b) => a + b, 0)) & 0xFF;
  return new Uint8Array([0x55, cs, cmd, lH, lL, ...data]);
}

function parseInfo(buf) {
  if (!buf || buf.length < 6)           return null;
  if (buf[0] !== 0xAA)                  return null;
  if (buf[2] !== CMD_INFO)              return null;
  const dLen = (buf[3] << 8) | buf[4];
  if (buf.length < 5 + dLen)           return null;
  const d = i => buf[5 + i];

  const sensors    = {};
  const numSensors = Math.floor((dLen - 4) / 3);

  for (let n = 0; n < numSensors; n++) {
    const b      = 4 + n * 3;
    const tRaw   = d(b), vH = d(b + 1), vL = d(b + 2);
    const status = (tRaw >> 5) & 0x07;
    const type   = tRaw & 0x1F;
    const raw    = (vH << 8) | vL;
    if (status === 0x07) continue;

    let val = raw, unit = "", label = "", key = "";
    switch (type) {
      case 0x01: key="battTemp";   label="Battery Temp";  val=raw-20;               unit="°C";  break;
      case 0x02: key="tds";        label="TDS";           val=raw;                  unit="ppm"; break;
      case 0x03: key="ph";         label="pH";            val=(raw/100).toFixed(2); unit="pH";  break;
      case 0x04: key="waterLevel"; label="Water Level";   val=raw;                  unit="mm";  break;
      case 0x05: key="waterTemp";  label="Water Temp";    val=(raw/10).toFixed(1);  unit="°C";  break;
      case 0x06: key="volume";     label="Volume";        val=raw;                  unit="mL";  break;
      case 0x07: key="intakePct";  label="Intake %";      val=raw;                  unit="%";   break;
      case 0x10: key="accX";  label="ACC-X";  unit="raw"; break;
      case 0x11: key="accY";  label="ACC-Y";  unit="raw"; break;
      case 0x12: key="accZ";  label="ACC-Z";  unit="raw"; break;
      case 0x16: key="pitch"; label="Pitch";  unit="°";   break;
      case 0x17: key="yaw";   label="Yaw";    unit="°";   break;
      case 0x18: key="roll";  label="Roll";   unit="°";   break;
      default:
        key = `s${type}`;
        label = `Sensor 0x${type.toString(16).toUpperCase().padStart(2,"0")}`;
        break;
    }
    sensors[key] = { label, val, unit, raw, type, status };
  }

  return {
    state:    d(0),
    charging: !!((d(1) >> 7) & 1),
    batt:     d(1) & 0x7F,
    fw:       ((d(2) << 8) | d(3)),
    sensors,
    ts:       Date.now(),
  };
}

// ═══════════════════════════════════════════════════════════════
// TDS UTILITIES
// ═══════════════════════════════════════════════════════════════

function tdsColor(ppm) {
  if (ppm == null) return "#51B0E6";
  if (ppm <=  35)  return "#34C759";
  if (ppm <= 150)  return "#51B0E6";
  if (ppm <= 300)  return "#FF9500";
  if (ppm <= 500)  return "#FF3B30";
  return "#D93025";
}

function tdsLabel(ppm) {
  if (ppm == null) return "Waiting\u2026";
  if (ppm <=  35)  return "Excellent";
  if (ppm <= 150)  return "Good";
  if (ppm <= 300)  return "Moderate";
  if (ppm <= 500)  return "Poor";
  return "Unsafe";
}

function waterScore(sensors) {
  let s = 100;
  const tds  = sensors.tds?.raw  ?? null;
  const ph   = sensors.ph  ? parseFloat(sensors.ph.val)        : null;
  const temp = sensors.waterTemp ? parseFloat(sensors.waterTemp.val) : null;
  if (tds  != null) { if (tds>500) s-=40; else if(tds>300) s-=25; else if(tds>150) s-=12; else if(tds>35) s-=5; }
  const vol = sensors.volume ? parseFloat(sensors.volume.val) : null;
  if (vol != null) { if (vol < 50) s-=20; else if(vol < 200) s-=5; }
  if (temp != null && temp > 30) s -= 8;
  return Math.max(0, Math.min(100, Math.round(s)));
}

// ═══════════════════════════════════════════════════════════════
// SPARKLINE (light mode)
// ═══════════════════════════════════════════════════════════════

function Sparkline({ data = [], color = "#51B0E6", w = 80, h = 28 }) {
  if (data.length < 2) return <div style={{ width: w, height: h }} />;
  const min = Math.min(...data), max = Math.max(...data), rng = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / rng) * (h - 4) - 2}`)
    .join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block", overflow: "visible" }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// OURA-STYLE SCORE RING
// ═══════════════════════════════════════════════════════════════

function ScoreRing({ score = 0, label = "WATER QUALITY", size = 200, color = "#51B0E6", subtitle = "" }) {
  const R = (size - 24) / 2;
  const CX = size / 2;
  const CY = size / 2;
  const circ = 2 * Math.PI * R;
  const fill = (Math.min(100, Math.max(0, score)) / 100) * circ;

  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#E8ECF0" strokeWidth="12" />
        {/* Fill */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ transition: "stroke-dasharray 1.5s cubic-bezier(0.34,1.56,0.64,1), stroke 0.8s ease" }}
        />
        {/* Soft glow layer */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke={`${color}30`}
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ transition: "stroke-dasharray 1.5s cubic-bezier(0.34,1.56,0.64,1)", filter: "blur(8px)" }}
        />
      </svg>
      {/* Center */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        <div style={{
          fontSize: size > 160 ? 52 : 36,
          fontWeight: 800,
          color: "#0A1A2E",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: -2,
          lineHeight: 1,
        }}>
          {score != null ? score : "\u2014"}
        </div>
        <div style={{
          fontSize: 10, fontWeight: 700, color: "#A6A8AB",
          letterSpacing: 2, textTransform: "uppercase", marginTop: 6,
        }}>
          {label}
        </div>
        {subtitle && (
          <div style={{ fontSize: 12, fontWeight: 500, color: "#6B7280", marginTop: 4 }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HYDRATION RING (smaller, Oura Activity style)
// ═══════════════════════════════════════════════════════════════

function HydrationRing({ consumePct = 0, dailyML = 0, goalML = 2000 }) {
  const SIZE = 130;
  const R = 50;
  const circ = 2 * Math.PI * R;
  const fill = (Math.min(100, consumePct) / 100) * circ;
  const isDone = consumePct >= 100;

  return (
    <div style={{ position: "relative", width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke="#E8ECF0" strokeWidth="9" />
        <circle
          cx={SIZE/2} cy={SIZE/2} r={R}
          fill="none"
          stroke={isDone ? "#34C759" : "#51B0E6"}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`}
          transform={`rotate(-90 ${SIZE/2} ${SIZE/2})`}
          style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: isDone ? "#34C759" : "#51B0E6" }}>
          {consumePct}%
        </div>
        <div style={{ fontSize: 9, color: "#A6A8AB", fontWeight: 500 }}>
          {(dailyML/1000).toFixed(1)}L
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TIMELINE CHART (Oura sleep stages style)
// ═══════════════════════════════════════════════════════════════

function TimelineChart({ data = [], w = 320, h = 100 }) {
  if (data.length < 2) {
    return (
      <div style={{ width: w, height: h, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 12, color: "#A6A8AB" }}>Collecting readings...</span>
      </div>
    );
  }
  const vals = data.map(d => d.sensors?.tds?.raw ?? 0);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const rng = max - min || 1;
  const pad = 4;
  const pts = vals
    .map((v, i) => `${pad + (i / (vals.length - 1)) * (w - pad * 2)},${pad + (h - pad * 2) - ((v - min) / rng) * (h - pad * 2)}`)
    .join(" ");

  // Color bands
  const yFor = (ppm) => pad + (h - pad * 2) - ((ppm - min) / rng) * (h - pad * 2);

  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      {/* Optimal zone shading */}
      {min < 35 && max > 0 && (
        <rect
          x={pad} y={Math.min(yFor(35), yFor(0))}
          width={w - pad * 2}
          height={Math.abs(yFor(35) - yFor(Math.max(0, min)))}
          fill="#34C75910" rx="4"
        />
      )}
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map(pct => (
        <line key={pct} x1={pad} y1={pad + pct * (h - pad * 2)} x2={w - pad} y2={pad + pct * (h - pad * 2)}
              stroke="#E8ECF0" strokeWidth="1" strokeDasharray="4 4" />
      ))}
      {/* Area fill */}
      <polygon
        points={`${pad},${h - pad} ${pts} ${pad + ((vals.length - 1) / (vals.length - 1)) * (w - pad * 2)},${h - pad}`}
        fill="url(#areaGradLight)"
        opacity="0.3"
      />
      {/* Line */}
      <polyline
        points={pts}
        fill="none"
        stroke="#51B0E6"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Latest dot */}
      {vals.length > 0 && (
        <circle
          cx={pad + ((vals.length - 1) / (vals.length - 1)) * (w - pad * 2)}
          cy={pad + (h - pad * 2) - ((vals[vals.length - 1] - min) / rng) * (h - pad * 2)}
          r="5" fill="#51B0E6" stroke="#FFFFFF" strokeWidth="2"
        />
      )}
      <defs>
        <linearGradient id="areaGradLight" x1="0" y1="0" x2="0" y2={h} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#51B0E6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#51B0E6" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// METRIC CARD (light Oura style)
// ═══════════════════════════════════════════════════════════════

function MetricCard({ icon, label, value, unit, color = "#51B0E6", sublabel, hist = [] }) {
  const trend = hist.length >= 2 ? hist[hist.length - 1] - hist[hist.length - 2] : 0;
  const trendIcon = trend > 0.05 ? "\u2191" : trend < -0.05 ? "\u2193" : null;

  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: 20,
      padding: "18px 16px 14px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)",
      border: "1px solid #F0F1F3",
      display: "flex",
      flexDirection: "column",
      gap: 0,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Subtle corner accent */}
      <div style={{
        position: "absolute", top: -20, right: -20,
        width: 60, height: 60, borderRadius: "50%",
        background: `${color}08`, pointerEvents: "none",
      }} />

      {/* Label */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 15, lineHeight: 1 }}>{icon}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#A6A8AB", letterSpacing: 1.2, textTransform: "uppercase" }}>
            {label}
          </span>
        </div>
        {trendIcon && (
          <span style={{ fontSize: 13, color: trend > 0 ? "#FF9500" : "#51B0E6", fontWeight: 700 }}>
            {trendIcon}
          </span>
        )}
      </div>

      {/* Value */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
        <span style={{
          fontSize: 28, fontWeight: 800, color: value != null ? "#0A1A2E" : "#D1D5DB",
          fontVariantNumeric: "tabular-nums", letterSpacing: -1, lineHeight: 1,
          transition: "color 0.3s",
        }}>
          {value ?? "\u2014"}
        </span>
        {unit && value != null && (
          <span style={{ fontSize: 12, fontWeight: 600, color: "#A6A8AB" }}>{unit}</span>
        )}
      </div>

      {/* Sublabel */}
      {sublabel && (
        <div style={{
          fontSize: 10, fontWeight: 600, marginBottom: 4,
          color: sublabel.startsWith("\u26A0") ? "#FF9500" : sublabel.startsWith("\u2713") ? "#34C759" : "#A6A8AB",
        }}>
          {sublabel}
        </div>
      )}

      {/* Sparkline */}
      <div style={{ marginTop: "auto", paddingTop: 6 }}>
        <Sparkline data={hist} color={color} w={100} h={24} />
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function WTRBottleScreen() {
  const [ble,          setBle]          = useState("idle");  // idle|scanning|connected|error
  const [errMsg,       setErrMsg]       = useState("");
  const [tele,         setTele]         = useState(null);
  const [hist,         setHist]         = useState([]);
  const [intake,       setIntake]       = useState(0);        // mL today
  const [goalML,       setGoalML]       = useState(2000);
  const [goalInput,    setGoalInput]    = useState("2000");
  const [showGoal,     setShowGoal]     = useState(false);
  const [log,          setLog]          = useState([]);
  const [tab,          setTab]          = useState("live");
  const [testPhase,    setTestPhase]    = useState(null); // null | "tds" | "vol" | "temp" | "done"
  const [testHasRun,   setTestHasRun]   = useState(false); // true after first test completes
  const [demoActive,   setDemoActive]   = useState(false);

  const devRef   = useRef(null);
  const wRef     = useRef(null);
  const nRef     = useRef(null);
  const timerRef = useRef(null);
  const rxBuf    = useRef([]);
  const demoRef  = useRef(null);

  // ── Logging ──────────────────────────────────────────────────
  const addLog = useCallback((msg, bytes) => {
    const hex = bytes
      ? Array.from(bytes).map(b => b.toString(16).padStart(2,"0").toUpperCase()).join(" ")
      : "";
    setLog(p => [{ t: new Date().toLocaleTimeString(), msg, hex }, ...p].slice(0, 200));
  }, []);

  // ── Write command ────────────────────────────────────────────
  const send = useCallback(async (cmd, data = []) => {
    if (!wRef.current) return;
    const pkt = buildPkt(cmd, data);
    addLog(`\u2192 0x${cmd.toString(16).toUpperCase().padStart(2,"0")}`, pkt);
    try { await wRef.current.writeValueWithResponse(pkt); } catch(e) {}
  }, [addLog]);

  // ── Notification handler ─────────────────────────────────────
  const onNotify = useCallback((evt) => {
    const val = new Uint8Array(evt.target.value.buffer);
    addLog("\u2190 RX", val);
    rxBuf.current.push(...val);
    const b = rxBuf.current;
    const s = b.indexOf(0xAA);
    if (s < 0) { rxBuf.current = []; return; }
    if (s > 0) rxBuf.current = b.slice(s);
    if (b.length < 5) return;
    const tLen = 5 + (b[3] << 8) + b[4];
    if (b.length < tLen) return;
    const frame = new Uint8Array(rxBuf.current.splice(0, tLen));
    if (frame[2] !== CMD_INFO) return;
    const parsed = parseInfo(frame);
    if (!parsed) return;
    setTele(parsed);
    setHist(p => [...p.slice(-(MAX_HIST - 1)), { ...parsed, ts: Date.now() }]);
    if (parsed.sensors.volume?.raw) {
      setIntake(p => Math.max(p, parsed.sensors.volume.raw));
    }
  }, [addLog]);

  // ── Poll loop ─────────────────────────────────────────────────
  const startPoll = useCallback(() => {
    const poll = async () => {
      try {
        await send(CMD_ACTIVATE);
        await new Promise(r => setTimeout(r, 120));
        await send(CMD_INFO);
      } catch(e) {}
    };
    poll();
    timerRef.current = setInterval(poll, POLL_MS);
  }, [send]);

  const stopPoll = useCallback(() => clearInterval(timerRef.current), []);

  // ── Connect ───────────────────────────────────────────────────
  const GATT_TIMEOUT_MS = 15000;

  const withTimeout = useCallback((promise, label) => {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(
          `${label} timed out after 15 s. Power-cycle the Smart Cap and try again.`
        )), GATT_TIMEOUT_MS)
      ),
    ]);
  }, []);

  const connect = useCallback(async () => {
    if (!navigator.bluetooth) {
      setErrMsg("Web Bluetooth unavailable. Use Chrome on Android or Chrome desktop.");
      setBle("error"); return;
    }
    try {
      setBle("scanning"); setErrMsg("");

      let dev;
      try {
        dev = await navigator.bluetooth.requestDevice({
          filters: [{ services: [SVC] }],
          optionalServices: [SVC],
        });
      } catch (filterErr) {
        if (filterErr.name === "NotFoundError") { setBle("idle"); return; }
        addLog("Filtered scan failed \u2014 retrying with broad scan\u2026");
        dev = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [SVC],
        });
      }

      dev.addEventListener("gattserverdisconnected", () => {
        setBle("idle"); stopPoll(); setTele(null);
      });
      devRef.current = dev;
      addLog(`Connecting to "${dev.name || "PP02 Smart Cap"}"\u2026`);

      const srv = await withTimeout(dev.gatt.connect(), "GATT connection");
      const svc = await withTimeout(srv.getPrimaryService(SVC), "Service discovery");
      wRef.current = await withTimeout(svc.getCharacteristic(WCHR), "Write characteristic");
      nRef.current = await withTimeout(svc.getCharacteristic(NCHR), "Notify characteristic");
      await withTimeout(nRef.current.startNotifications(), "Start notifications");
      nRef.current.addEventListener("characteristicvaluechanged", onNotify);

      setBle("connected");
      addLog("\u2713 Connected");
      startPoll();
    } catch(e) {
      try { if (devRef.current?.gatt?.connected) devRef.current.gatt.disconnect(); } catch (_) {}
      if (e.name === "NotFoundError") {
        setBle("idle");
      } else {
        setErrMsg(e.message || "Connection failed");
        setBle("error");
        addLog(`\u2717 ${e.message || "Connection failed"}`);
      }
    }
  }, [onNotify, startPoll, stopPoll, addLog, withTimeout]);

  const disconnect = useCallback(() => {
    stopPoll();
    if (devRef.current?.gatt?.connected) devRef.current.gatt.disconnect();
    setBle("idle"); setTele(null);
  }, [stopPoll]);

  const resetIntake = useCallback(async () => {
    await send(CMD_RESET); setIntake(0);
  }, [send]);

  const applyGoal = useCallback(async () => {
    const ml = parseInt(goalInput, 10);
    if (isNaN(ml) || ml < 250 || ml > 5000) return;
    setGoalML(ml);
    await send(CMD_GOAL, [(ml>>24)&0xFF,(ml>>16)&0xFF,(ml>>8)&0xFF,ml&0xFF]);
    setShowGoal(false);
  }, [goalInput, send]);

  useEffect(() => () => stopPoll(), [stopPoll]);

  // ── Demo mode ─────────────────────────────────────────────────
  const startDemo = useCallback(() => {
    setDemoActive(true);
    const demoTick = () => {
      const baseTds = 24 + Math.floor(Math.random() * 12);
      const basePh  = 720 + Math.floor(Math.random() * 40);
      const baseTemp = 195 + Math.floor(Math.random() * 30);
      const fakeInfo = {
        state: 1,
        charging: false,
        batt: 82 + Math.floor(Math.random() * 10),
        fw: 501,
        sensors: {
          tds: { label: "TDS", val: baseTds, unit: "ppm", raw: baseTds, type: 2, status: 0 },
          ph: { label: "pH", val: (basePh / 100).toFixed(2), unit: "pH", raw: basePh, type: 3, status: 0 },
          waterTemp: { label: "Water Temp", val: (baseTemp / 10).toFixed(1), unit: "°C", raw: baseTemp, type: 5, status: 0 },
          waterLevel: { label: "Water Level", val: 180 + Math.floor(Math.random() * 40), unit: "mm", raw: 180, type: 4, status: 0 },
          volume: { label: "Volume", val: 400 + Math.floor(Math.random() * 200), unit: "mL", raw: 400 + Math.floor(Math.random() * 200), type: 6, status: 0 },
        },
        ts: Date.now(),
      };
      setTele(fakeInfo);
      setHist(p => [...p.slice(-(MAX_HIST - 1)), fakeInfo]);
      setIntake(p => Math.min(p + Math.floor(Math.random() * 40) + 10, 2500));
    };
    demoTick();
    demoRef.current = setInterval(demoTick, POLL_MS);
  }, []);

  const stopDemo = useCallback(() => {
    setDemoActive(false);
    clearInterval(demoRef.current);
    setTele(null); setHist([]); setIntake(0);
  }, []);

  useEffect(() => () => clearInterval(demoRef.current), []);

  // ── Water test simulation ──────────────────────────────────────
  const runTest = useCallback(() => {
    setTestPhase("tds");
    setTimeout(() => setTestPhase("vol"), 1500);
    setTimeout(() => setTestPhase("temp"), 3000);
    setTimeout(() => { setTestPhase("done"); setTestHasRun(true); }, 4500);
    setTimeout(() => setTestPhase(null), 8000);
  }, []);

  // ── Derived values ────────────────────────────────────────────
  const s          = tele?.sensors ?? {};
  const tdsRaw     = s.tds?.raw    ?? null;
  const consumePct = Math.min(100, Math.round((intake / goalML) * 100));
  const score      = tele ? waterScore(s) : null;
  const col        = tdsColor(tdsRaw);
  const histOf     = key =>
    hist.map(h => { const v = h.sensors?.[key]?.val; return v != null ? parseFloat(v) : null; })
        .filter(v => v != null);

  const volVal    = s.volume?.val    ?? null;
  const tempVal  = s.waterTemp?.val ?? null;
  const levelVal = s.waterLevel?.val?? null;
  const battVal  = tele?.batt       ?? null;

  const volColor = () => {
    if (!volVal) return "#51B0E6";
    const v = parseFloat(volVal);
    if (v < 100) return "#FF9500";
    return "#34C759";
  };

  const isLive = ble === "connected" || tele !== null;
  const isDemo = demoActive && ble !== "connected";
  const tempF  = tempVal != null ? (parseFloat(tempVal) * 9/5 + 32).toFixed(0) : null;

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div data-testid="wtr-btl-screen" style={{
      fontFamily:              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Nunito', 'Figtree', 'Manrope', sans-serif",
      background:              "#F8F9FB",
      minHeight:               "100%",
      color:                   "#0A1A2E",
      display:                 "flex",
      flexDirection:           "column",
      maxWidth:                480,
      margin:                  "0 auto",
      WebkitFontSmoothing:     "antialiased",
      MozOsxFontSmoothing:     "grayscale",
    }}>

      {/* ── Animations ── */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(81,176,230,0.3); }
          50%      { box-shadow: 0 4px 30px rgba(81,176,230,0.6); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes ringPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50%       { opacity: 0.1; transform: scale(1.08); }
        }
        @keyframes blinkDot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 2px; }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1: HERO VISUAL
          ═══════════════════════════════════════════════════════════ */}
      <div style={{
        position: "relative",
        width: "100%",
        height: isLive ? 220 : 340,
        overflow: "hidden",
        transition: "height 0.5s ease",
      }}>
        {/* Background image */}
        <img
          src="/bottle-cap-sensor-glow.jpg"
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        {/* Gradient overlay to white */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(248,249,251,0) 30%, rgba(248,249,251,0.7) 70%, #F8F9FB 100%)",
        }} />
        {/* Dark overlay for text readability */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(10,26,46,0.5) 0%, rgba(10,26,46,0.1) 50%, transparent 100%)",
        }} />

        {/* Title overlay */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          padding: "20px 20px 0",
          zIndex: 2,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
                Generosity{"\u2122"} Water Intelligence
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#FFFFFF", letterSpacing: -0.5, lineHeight: 1.2 }}>
                Intelligent WTR BTL
              </div>
            </div>

            {/* Status pill */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: isDemo ? "rgba(81,176,230,0.2)" : ble === "connected" ? "rgba(52,199,89,0.2)" : "rgba(255,255,255,0.15)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderRadius: 20, padding: "6px 12px",
              border: "1px solid rgba(255,255,255,0.15)",
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: isDemo ? "#51B0E6" : ble === "connected" ? "#34C759" : "#A6A8AB",
                animation: (isDemo || ble === "scanning") ? "blinkDot 1s ease-in-out infinite" : "none",
              }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "#FFFFFF", letterSpacing: 0.5, textTransform: "uppercase" }}>
                {isDemo ? "DEMO MODE" : ble === "connected" ? (devRef.current?.name?.slice(0,10) || "CONNECTED") : ble === "scanning" ? "SCANNING" : "OFFLINE"}
              </span>
            </div>
          </div>
        </div>

        {/* Connect / Disconnect button overlay (bottom of hero) */}
        <div style={{
          position: "absolute", bottom: 16, left: 20, right: 20,
          display: "flex", gap: 8, zIndex: 2,
        }}>
          {ble === "connected" ? (
            <button onClick={disconnect} data-testid="disconnect-btn" style={{
              flex: 1, padding: "12px 0", background: "#FFFFFF", color: "#FF3B30",
              border: "1px solid #FFE5E5", borderRadius: 14, fontSize: 13, fontWeight: 700,
              cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}>
              Disconnect
            </button>
          ) : (
            <>
              <button onClick={connect} disabled={ble === "scanning"} data-testid="connect-wtr-btl-btn" style={{
                flex: 1, padding: "12px 0",
                background: ble === "scanning" ? "#E8ECF0" : "#51B0E6",
                color: ble === "scanning" ? "#A6A8AB" : "#FFFFFF",
                border: "none", borderRadius: 14, fontSize: 13, fontWeight: 700,
                cursor: ble === "scanning" ? "not-allowed" : "pointer",
                boxShadow: ble === "scanning" ? "none" : "0 4px 16px rgba(81,176,230,0.3)",
              }}>
                {ble === "scanning" ? "Scanning\u2026" : "Connect Device"}
              </button>
              {!isLive && (
                <button onClick={demoActive ? stopDemo : startDemo} style={{
                  padding: "12px 20px",
                  background: demoActive ? "#FFF3E0" : "#FFFFFF",
                  color: demoActive ? "#FF9500" : "#0A1A2E",
                  border: demoActive ? "1px solid #FFD699" : "1px solid #E8ECF0",
                  borderRadius: 14, fontSize: 13, fontWeight: 700,
                  cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}>
                  {demoActive ? "Stop Demo" : "Demo"}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Error message */}
      {errMsg && (
        <div data-testid="ble-error-msg" style={{
          margin: "0 16px 8px", background: "#FFF0F0", border: "1px solid #FECACA",
          borderRadius: 14, padding: "12px 16px", fontSize: 13, color: "#DC2626", lineHeight: 1.5,
        }}>
          <BtlIcon name="hazard" size={13} color="#DC2626" /> {errMsg}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          CONNECT SCREEN (when idle and no data)
          ═══════════════════════════════════════════════════════════ */}
      {!isLive && ble !== "scanning" && (
        <div style={{
          padding: "0 20px 40px",
          display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center", gap: 24,
          animation: "fadeInUp 0.4s ease",
        }}>
          {/* Product lineup */}
          <div style={{
            width: "100%", borderRadius: 20, overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            border: "1px solid #F0F1F3",
          }}>
            <img src="/bottle-lineup-5colors.jpg" alt="Generosity WTR BTL lineup"
              style={{ width: "100%", height: "auto", objectFit: "contain", display: "block", maxHeight: 300 }} />
          </div>

          <div style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7, maxWidth: 300 }}>
            Connect your Generosity{"\u2122"} Smart Cap to monitor live water quality, track daily intake, and receive real-time TDS readings.
          </div>

          {/* Features grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, width: "100%" }}>
            {[
              { icon: <BtlIcon name="droplet" size={20} color="#51B0E6" />, label: "TDS\nMonitoring" },
              { icon: <BtlIcon name="ruler" size={20} color="#34C759" />, label: "Intake\nTracking" },
              { icon: <BtlIcon name="thermometer" size={20} color="#FF9500" />, label: "Temp\nSensor" },
            ].map((f, i) => (
              <div key={i} style={{
                background: "#FFFFFF", borderRadius: 16, padding: "18px 8px",
                textAlign: "center", border: "1px solid #F0F1F3",
                boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
              }}>
                <div style={{ marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", lineHeight: 1.4, whiteSpace: "pre-line" }}>
                  {f.label}
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11, color: "#A6A8AB", maxWidth: 280, lineHeight: 1.7 }}>
            Requires Chrome on Android or Chrome desktop with Bluetooth enabled.
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SCANNING OVERLAY
          ═══════════════════════════════════════════════════════════ */}
      {ble === "scanning" && (
        <div style={{
          padding: "40px 20px", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 28, textAlign: "center",
        }}>
          <div style={{ position: "relative", width: 80, height: 80 }}>
            {[
              { sz: 80, dur: "1.2s", sw: 2.5, color: "#51B0E6" },
              { sz: 56, dur: "1.8s", sw: 1.5, color: "#51B0E680" },
            ].map(({ sz, dur, sw, color }, i) => (
              <div key={i} style={{
                position: "absolute", inset: (80 - sz) / 2,
                borderRadius: "50%", border: `${sw}px solid transparent`,
                borderTop: `${sw}px solid ${color}`,
                animation: `spin ${dur} linear ${i % 2 === 0 ? "normal" : "reverse"} infinite`,
              }} />
            ))}
            <div style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              <BtlIcon name="signal" size={22} color="#51B0E6" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0A1A2E", marginBottom: 8 }}>
              Searching for Smart Cap
            </div>
            <div style={{ fontSize: 13, color: "#A6A8AB", lineHeight: 1.6 }}>
              Make sure Bluetooth is on and the lid is powered up
            </div>
          </div>
          <button onClick={() => setBle("idle")} data-testid="cancel-scan-btn" style={{
            background: "#FFFFFF", border: "1px solid #E8ECF0", borderRadius: 14,
            color: "#6B7280", padding: "12px 32px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>
            Cancel
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          LIVE DASHBOARD
          ═══════════════════════════════════════════════════════════ */}
      {isLive && (
        <div style={{ padding: "0 16px 100px", animation: "fadeInUp 0.3s ease" }}>

          {/* ── SECTION 2: Score Ring ── */}
          <div style={{
            background: "#FFFFFF",
            borderRadius: 24,
            padding: "28px 20px 24px",
            marginBottom: 14,
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            border: "1px solid #F0F1F3",
            textAlign: "center",
          }}>
            {/* Score ring only shows after first test */}
            {testHasRun ? (
              <ScoreRing
                score={score}
                label="WATER QUALITY"
                size={200}
                color={col}
                subtitle={tdsRaw != null ? `${tdsLabel(tdsRaw)} \u00B7 ${tdsRaw} ppm` : "Analyzing..."}
              />
            ) : (
              <div style={{textAlign:"center",padding:"20px 0"}}>
                <div style={{fontSize:13,color:"#A6A8AB",marginBottom:4}}>Run a water test to see your score</div>
              </div>
            )}

            {/* Run Test button — compact, always visible when not testing */}
            {testPhase === null && (
              <button onClick={runTest} style={{
                margin: "12px auto 0", display: "flex", alignItems: "center", gap: 8,
                background: "linear-gradient(135deg, #51B0E6, #2A8FCA)", color: "#fff",
                border: "none", padding: "10px 24px", borderRadius: 30,
                fontSize: 12, fontWeight: 800, cursor: "pointer",
                boxShadow: "0 4px 16px rgba(81,176,230,0.35)",
                letterSpacing: "0.3px",
              }}>
                <BtlIcon name="flask" size={14} color="#FFFFFF" /> {testHasRun ? "TEST AGAIN" : "RUN WATER TEST"}
              </button>
            )}

            {/* Quick stats row below ring */}
            <div style={{
              display: "flex", justifyContent: "center", gap: 24,
              marginTop: 20, paddingTop: 16,
              borderTop: "1px solid #F0F1F3",
            }}>
              {[
                { label: "TDS", val: tdsRaw != null ? `${tdsRaw}` : "\u2014", unit: "ppm", c: col },
                { label: "INTAKE", val: volVal ?? "\u2014", unit: "mL", c: volColor() },
                { label: "Temp", val: tempF ?? "\u2014", unit: "\u00B0F", c: "#FF9500" },
              ].map((m, i) => (
                <div key={i} style={{ textAlign: "center", minWidth: 60 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#A6A8AB", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>
                    {m.label}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 2 }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: "#0A1A2E", fontVariantNumeric: "tabular-nums" }}>
                      {m.val}
                    </span>
                    {m.unit && <span style={{ fontSize: 10, color: "#A6A8AB", fontWeight: 600 }}>{m.unit}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── SECTION 3: Telemetry Cards (3-up) ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
            <MetricCard
              icon={<BtlIcon name="droplet" size={15} color={col} />}
              label="TDS"
              value={tdsRaw}
              unit="ppm"
              color={col}
              hist={histOf("tds")}
              sublabel={tdsRaw != null ? (tdsRaw <= 35 ? "\u2713 Excellent" : tdsRaw <= 150 ? "\u2713 Good" : "\u26A0 Elevated") : null}
            />
            <MetricCard
              icon={<BtlIcon name="ruler" size={15} color={volColor()} />}
              label="INTAKE"
              value={volVal}
              unit="mL"
              color={volColor()}
              hist={histOf("volume")}
              sublabel={volVal != null ? (parseFloat(volVal) >= 100 ? "\u2713 Good" : "\u26A0 Low") : null}
            />
            <MetricCard
              icon={<BtlIcon name="thermometer" size={15} color="#FF9500" />}
              label="Temp"
              value={tempF}
              unit={"\u00B0F"}
              color="#FF9500"
              hist={histOf("waterTemp")}
              sublabel={tempVal != null ? (parseFloat(tempVal) > 30 ? "\u26A0 Warm" : "\u2713 Cool") : null}
            />
          </div>

          {/* ── SECTION 4: TDS Timeline ── */}
          <div style={{
            background: "#FFFFFF", borderRadius: 20, padding: "18px 16px",
            marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", border: "1px solid #F0F1F3",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#A6A8AB", letterSpacing: 1.5, textTransform: "uppercase" }}>
                  RECENT READINGS
                </div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                  TDS over last {hist.length} samples
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: col }}>
                {hist.length} / {MAX_HIST}
              </div>
            </div>
            <TimelineChart data={hist} w={window.innerWidth > 480 ? 440 : window.innerWidth - 68} h={100} />
          </div>

          {/* ── SECTION 5: Test Progress (only shows during/after test) ── */}
          {testPhase != null && (
            <div style={{
              background: "#FFFFFF", borderRadius: 20, padding: "24px 20px",
              marginBottom: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              border: "1px solid #F0F1F3",
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#A6A8AB", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>
                {testPhase === "done" ? "TEST COMPLETE" : "TESTING IN PROGRESS"}
              </div>
              {["tds", "vol", "temp"].map((phase, i) => {
                const labels = { tds: "Analyzing TDS...", vol: "Measuring Intake...", temp: "Measuring temperature..." };
                const doneLabels = { tds: `TDS: ${tdsRaw ?? 24} ppm`, vol: `Intake: ${volVal ?? "450"} mL`, temp: `Temp: ${tempF ?? "68"}\u00B0F` };
                const icons = { tds: <BtlIcon name="droplet" size={16} color="#51B0E6" />, vol: <BtlIcon name="ruler" size={16} color="#34C759" />, temp: <BtlIcon name="thermometer" size={16} color="#FF9500" /> };
                const isActive = testPhase === phase;
                const isDone = testPhase === "done" || (phase === "tds" && (testPhase === "vol" || testPhase === "temp")) || (phase === "vol" && testPhase === "temp");
                return (
                  <div key={phase} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 0",
                    borderBottom: i < 2 ? "1px solid #F0F1F3" : "none",
                    opacity: isDone || isActive ? 1 : 0.4,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 10,
                      background: isDone ? "#F0FFF4" : isActive ? "#EBF6FD" : "#F8F9FB",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {isDone ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : isActive ? (
                        <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid transparent", borderTop: "2px solid #51B0E6", animation: "spin 0.8s linear infinite" }} />
                      ) : icons[phase]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: isDone ? "#0A1A2E" : "#A6A8AB" }}>
                        {isDone ? doneLabels[phase] : isActive ? labels[phase] : labels[phase]}
                      </div>
                    </div>
                  </div>
                );
              })}
              {testPhase === "done" && (
                <div style={{
                  marginTop: 16, background: "#EBF6FD", borderRadius: 14, padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#51B0E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0A1A2E" }}>
                    Water quality score: <span style={{ color: col, fontWeight: 800 }}>{score ?? 92}/100</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SECTION 6: Contaminant Alerts ── */}
          {tdsRaw != null && tdsRaw > 150 && (
            <div style={{
              background: "#FFF8F0", borderRadius: 20, padding: "18px 16px",
              marginBottom: 14, border: "1px solid #FFE8CC",
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#FF9500", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>
                DETECTED CONCERNS
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "#FFFFFF", borderRadius: 14, padding: "14px 16px",
                border: "1px solid #FFF0E0",
              }}>
                <BtlIcon name="hazard" size={20} color="#FF9500" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0A1A2E" }}>
                    Elevated TDS ({tdsRaw} ppm)
                  </div>
                  <div style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.4, marginTop: 2 }}>
                    Consider using a reverse osmosis or activated carbon filter.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SECTION 7: Device Info ── */}
          {tele && (
            <div style={{
              background: "#FFFFFF", borderRadius: 20, padding: "18px 16px",
              marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", border: "1px solid #F0F1F3",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#A6A8AB", letterSpacing: 1.5, textTransform: "uppercase" }}>
                  YOUR DEVICE
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 4,
                  background: ble === "connected" ? "#F0FFF4" : isDemo ? "#EBF6FD" : "#F8F9FB",
                  borderRadius: 10, padding: "3px 10px",
                }}>
                  <div style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: ble === "connected" ? "#34C759" : "#51B0E6",
                  }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: ble === "connected" ? "#34C759" : "#51B0E6" }}>
                    {ble === "connected" ? "Connected" : "Demo"}
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { label: "Battery", value: `${battVal ?? "\u2014"}%`, icon: <BtlIcon name="battery" size={14} color={battVal > 50 ? "#34C759" : "#FF9500"} /> },
                  { label: "Firmware", value: `v${(tele.fw / 100).toFixed(1)}`, icon: <BtlIcon name="signal" size={14} color="#51B0E6" /> },
                  { label: "Last Sync", value: new Date(tele.ts).toLocaleTimeString().slice(0, 5), icon: <BtlIcon name="target" size={14} color="#A6A8AB" /> },
                ].map((d, i) => (
                  <div key={i} style={{
                    background: "#F8F9FB", borderRadius: 14, padding: "12px 10px", textAlign: "center",
                  }}>
                    <div style={{ marginBottom: 6 }}>{d.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0A1A2E" }}>{d.value}</div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: "#A6A8AB", letterSpacing: 0.5, textTransform: "uppercase", marginTop: 2 }}>
                      {d.label}
                    </div>
                  </div>
                ))}
              </div>

              {tele.charging && (
                <div style={{
                  marginTop: 10, background: "#F0FFF4", borderRadius: 10, padding: "8px 14px",
                  fontSize: 12, color: "#34C759", fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  {"\u26A1"} Charging
                </div>
              )}
            </div>
          )}

          {/* ── SECTION 8: Hydration Tracker ── */}
          <div style={{
            background: "#FFFFFF", borderRadius: 20, padding: "18px 20px",
            marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", border: "1px solid #F0F1F3",
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#A6A8AB", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>
              DAILY HYDRATION
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <HydrationRing consumePct={consumePct} dailyML={intake} goalML={goalML} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: "#0A1A2E", fontVariantNumeric: "tabular-nums" }}>
                    {(intake / 1000).toFixed(1)}L
                  </span>
                  <span style={{ fontSize: 13, color: "#A6A8AB", fontWeight: 500 }}>/ {(goalML / 1000).toFixed(1)}L</span>
                </div>
                <div style={{ fontSize: 12, color: consumePct >= 100 ? "#34C759" : "#6B7280", fontWeight: 500, marginBottom: 12 }}>
                  {consumePct >= 100 ? "\u2713 Daily goal reached!" : `${consumePct}% of daily goal`}
                </div>
                {/* Progress bar */}
                <div style={{ height: 6, background: "#E8ECF0", borderRadius: 3, overflow: "hidden", marginBottom: 10 }}>
                  <div style={{
                    height: "100%", width: `${consumePct}%`,
                    background: consumePct >= 100 ? "linear-gradient(90deg, #34C759, #30D158)" : "linear-gradient(90deg, #51B0E6, #2A8FCA)",
                    borderRadius: 3, transition: "width 1s cubic-bezier(0.34,1.56,0.64,1)",
                  }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setShowGoal(v => !v)} data-testid="set-goal-btn" style={{
                    background: "#F8F9FB", border: "1px solid #E8ECF0", borderRadius: 10,
                    color: "#6B7280", padding: "6px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer",
                  }}>
                    {showGoal ? "Close" : "Set Goal"}
                  </button>
                  <button onClick={resetIntake} data-testid="reset-intake-btn" style={{
                    background: "#F8F9FB", border: "1px solid #E8ECF0", borderRadius: 10,
                    color: "#A6A8AB", padding: "6px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer",
                  }}>
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Goal editor */}
            {showGoal && (
              <div style={{ display: "flex", gap: 8, marginTop: 14, paddingTop: 14, borderTop: "1px solid #F0F1F3" }}>
                <input
                  value={goalInput}
                  onChange={e => setGoalInput(e.target.value)}
                  placeholder="Daily goal mL (250\u20135000)"
                  data-testid="goal-input"
                  style={{
                    flex: 1, background: "#F8F9FB", border: "1px solid #E8ECF0",
                    borderRadius: 12, color: "#0A1A2E", padding: "11px 14px",
                    fontSize: 14, fontVariantNumeric: "tabular-nums", outline: "none",
                  }}
                />
                <button onClick={applyGoal} data-testid="apply-goal-btn" style={{
                  background: "#51B0E6", color: "#FFFFFF", border: "none",
                  borderRadius: 12, padding: "11px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer",
                }}>
                  Set
                </button>
              </div>
            )}
          </div>

          {/* ── SECTION: Cap Close-up ── */}
          <div style={{
            borderRadius: 20, overflow: "hidden", marginBottom: 14,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}>
            <div style={{ position: "relative" }}>
              <img src="/bottle-cap-exploded.jpg" alt="Smart Cap Sensor"
                style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(180deg, transparent 40%, rgba(10,26,46,0.8) 100%)",
              }} />
              <div style={{
                position: "absolute", bottom: 14, left: 16,
                color: "#FFFFFF",
              }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Intelligent Smart Cap</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
                  Real-time TDS, Intake, and temperature sensors
                </div>
              </div>
            </div>
          </div>

          {/* ── Debug / Raw Sensors toggle ── */}
          <div style={{
            background: "#FFFFFF", borderRadius: 20, overflow: "hidden",
            border: "1px solid #F0F1F3", marginBottom: 14,
          }}>
            <div style={{ display: "flex", borderBottom: "1px solid #F0F1F3" }}>
              {["live", "sensors", "debug"].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  data-testid={`wtr-tab-${t}`}
                  style={{
                    flex: 1, padding: "12px 4px", background: "transparent",
                    color: tab === t ? "#51B0E6" : "#A6A8AB", border: "none",
                    borderBottom: tab === t ? "2px solid #51B0E6" : "2px solid transparent",
                    fontSize: 11, fontWeight: tab === t ? 700 : 500, cursor: "pointer",
                    letterSpacing: 0.5, textTransform: "uppercase",
                  }}
                >
                  {t === "live" ? "History" : t === "sensors" ? "Sensors" : "Debug"}
                </button>
              ))}
            </div>

            <div style={{ padding: 16 }}>
              {/* History Tab */}
              {tab === "live" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {hist.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 24, color: "#A6A8AB", fontSize: 12 }}>No readings yet</div>
                  ) : [...hist].reverse().slice(0, 20).map((h, i) => (
                    <div key={i} style={{
                      display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr",
                      padding: "8px 0", borderBottom: "1px solid #F0F1F3",
                      fontSize: 12, color: "#6B7280", alignItems: "center",
                    }}>
                      <span style={{ fontSize: 10, color: "#A6A8AB", fontFamily: "monospace" }}>
                        {new Date(h.ts).toLocaleTimeString()}
                      </span>
                      <span>TDS: <b style={{ color: tdsColor(h.sensors?.tds?.raw) }}>{h.sensors?.tds?.val ?? "\u2014"}</b></span>
                      <span>pH: <b style={{ color: "#51B0E6" }}>{h.sensors?.ph?.val ?? "\u2014"}</b></span>
                      <span>T: <b style={{ color: "#FF9500" }}>{h.sensors?.waterTemp?.val ?? "\u2014"}{"\u00B0"}</b></span>
                    </div>
                  ))}
                </div>
              )}

              {/* Sensors Tab */}
              {tab === "sensors" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {Object.values(s).length === 0 ? (
                    <div style={{ textAlign: "center", padding: 24, color: "#A6A8AB", fontSize: 12 }}>
                      No sensor data yet
                    </div>
                  ) : Object.values(s).map((sensor, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: "#F8F9FB", borderRadius: 14, padding: "12px 16px",
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0A1A2E", marginBottom: 2 }}>
                          {sensor.label}
                        </div>
                        <div style={{ fontSize: 10, color: "#A6A8AB", fontFamily: "monospace" }}>
                          Type 0x{sensor.type?.toString(16).toUpperCase().padStart(2,"0")} {"\u00B7"} Raw {sensor.raw}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 22, fontWeight: 800, color: "#0A1A2E", fontVariantNumeric: "tabular-nums" }}>
                          {sensor.val}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 500, color: "#A6A8AB", marginLeft: 3 }}>{sensor.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Debug Tab */}
              {tab === "debug" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {[
                      { label: "Poll", fn: () => send(CMD_INFO), color: "#51B0E6" },
                      { label: "Activate", fn: () => send(CMD_ACTIVATE), color: "#2A8FCA" },
                      { label: "Reset", fn: resetIntake, color: "#FF9500" },
                    ].map(({ label, fn, color }) => (
                      <button key={label} onClick={fn} disabled={ble !== "connected"} style={{
                        padding: "10px 4px",
                        background: ble === "connected" ? `${color}10` : "#F8F9FB",
                        color: ble === "connected" ? color : "#D1D5DB",
                        border: `1px solid ${ble === "connected" ? color + "30" : "#E8ECF0"}`,
                        borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: ble === "connected" ? "pointer" : "not-allowed",
                        letterSpacing: 0.5, textTransform: "uppercase",
                      }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <div style={{
                    background: "#F8F9FB", borderRadius: 14, padding: "12px 14px",
                    fontFamily: "monospace", fontSize: 10.5, maxHeight: 260, overflowY: "auto",
                    border: "1px solid #E8ECF0", lineHeight: 1.7,
                  }}>
                    {log.length === 0 ? (
                      <div style={{ color: "#A6A8AB", textAlign: "center", padding: "16px 0" }}>
                        BLE packet log appears here
                      </div>
                    ) : log.slice(0, 50).map((entry, i) => (
                      <div key={i} style={{ marginBottom: 4, paddingBottom: 4, borderBottom: "1px solid #F0F1F3" }}>
                        <span style={{ color: "#A6A8AB" }}>{entry.t} </span>
                        <span style={{ color: entry.msg.includes("RX") || entry.msg.includes("\u2190") ? "#34C759" : "#51B0E6", fontWeight: 600 }}>
                          {entry.msg}
                        </span>
                        {entry.hex && (
                          <div style={{ color: "#6B7280", marginTop: 2, wordBreak: "break-all" }}>
                            {entry.hex}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setLog([])} data-testid="clear-log-btn" style={{
                    background: "#F8F9FB", border: "1px solid #E8ECF0", borderRadius: 10,
                    color: "#A6A8AB", padding: "10px 0", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}>
                    Clear Log
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
