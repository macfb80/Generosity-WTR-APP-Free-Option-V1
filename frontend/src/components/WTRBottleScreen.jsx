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
  if (ppm <=  35)  return "#1E8A4C";
  if (ppm <= 150)  return "#F29423";
  if (ppm <= 300)  return "#E07020";
  if (ppm <= 500)  return "#D93025";
  return "#A01420";
}

function tdsLabel(ppm) {
  if (ppm == null) return "Waiting\u2026";
  if (ppm <=  35)  return "Excellent";
  if (ppm <= 150)  return "Good";
  if (ppm <= 300)  return "Moderate";
  if (ppm <= 500)  return "Poor";
  return "Unsafe";
}

function tdsGlow(ppm) {
  const c = tdsColor(ppm);
  return `0 0 60px ${c}40, 0 0 120px ${c}18`;
}

function waterScore(sensors) {
  let s = 100;
  const tds  = sensors.tds?.raw  ?? null;
  const ph   = sensors.ph  ? parseFloat(sensors.ph.val)        : null;
  const temp = sensors.waterTemp ? parseFloat(sensors.waterTemp.val) : null;
  if (tds  != null) { if (tds>500) s-=40; else if(tds>300) s-=25; else if(tds>150) s-=12; else if(tds>35) s-=5; }
  if (ph   != null) { if (ph<6.5||ph>9.5) s-=30; else if(ph<7.0||ph>9.0) s-=10; }
  if (temp != null && temp > 30) s -= 8;
  return Math.max(0, Math.min(100, Math.round(s)));
}

// ═══════════════════════════════════════════════════════════════
// SPARKLINE
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
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// DUAL RING HERO COMPONENT
// Outer ring  →  Daily water consumption   (brand blue #51B0E6)
// Inner ring  →  TDS quality               (TDS color scale)
// ═══════════════════════════════════════════════════════════════

function DualRing({ consumePct = 0, tdsRaw = null, goalML = 2000, dailyML = 0 }) {
  const SIZE   = 290;
  const CX     = SIZE / 2;
  const CY     = SIZE / 2;
  const OR     = 124;   // outer ring radius
  const IR     = 93;    // inner ring radius
  const OSW    = 20;    // outer stroke width
  const ISW    = 18;    // inner stroke width
  const OCirc  = 2 * Math.PI * OR;
  const ICirc  = 2 * Math.PI * IR;
  const ROT    = "rotate(-90 145 145)";

  const oFill  = (Math.min(100, consumePct) / 100) * OCirc;
  const tdsPct = tdsRaw != null ? Math.min(100, (tdsRaw / 500) * 100) : 0;
  const iFill  = (tdsPct / 100) * ICirc;

  const col    = tdsColor(tdsRaw);
  const lbl    = tdsLabel(tdsRaw);
  const score  = tdsRaw != null ? Math.round(100 - tdsPct) : null;

  return (
    <div style={{ position: "relative", width: SIZE, height: SIZE, margin: "0 auto" }}>

      {/* Ambient background glow — shifts with TDS color */}
      <div style={{
        position:     "absolute",
        inset:        30,
        borderRadius: "50%",
        background:   `radial-gradient(circle, ${col}14 0%, transparent 70%)`,
        filter:       "blur(24px)",
        transition:   "background 1.2s ease",
        pointerEvents: "none",
      }} />

      {/* Fine dot grid texture behind rings */}
      <div style={{
        position:     "absolute",
        inset:        0,
        borderRadius: "50%",
        backgroundImage: `radial-gradient(circle, #51B0E608 1px, transparent 1px)`,
        backgroundSize: "12px 12px",
        opacity:      0.6,
        pointerEvents: "none",
      }} />

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* ── Outer track ── */}
        <circle cx={CX} cy={CY} r={OR} fill="none" stroke="#1A2535" strokeWidth={OSW} />

        {/* ── Outer fill (consumption, blue) ── */}
        <circle
          cx={CX} cy={CY} r={OR}
          fill="none"
          stroke="#51B0E6"
          strokeWidth={OSW}
          strokeLinecap="round"
          strokeDasharray={`${oFill} ${OCirc}`}
          transform={ROT}
          style={{ transition: "stroke-dasharray 1.1s cubic-bezier(0.34,1.56,0.64,1)" }}
        />
        {/* Outer glow layer */}
        <circle
          cx={CX} cy={CY} r={OR}
          fill="none"
          stroke="#51B0E635"
          strokeWidth={OSW + 10}
          strokeLinecap="round"
          strokeDasharray={`${oFill} ${OCirc}`}
          transform={ROT}
          style={{ transition: "stroke-dasharray 1.1s cubic-bezier(0.34,1.56,0.64,1)", filter: "blur(8px)" }}
        />

        {/* ── Inner track ── */}
        <circle cx={CX} cy={CY} r={IR} fill="none" stroke="#1A2535" strokeWidth={ISW} />

        {/* ── Inner fill (TDS quality, color-coded) ── */}
        <circle
          cx={CX} cy={CY} r={IR}
          fill="none"
          stroke={col}
          strokeWidth={ISW}
          strokeLinecap="round"
          strokeDasharray={`${iFill} ${ICirc}`}
          transform={ROT}
          style={{ transition: "stroke-dasharray 1.1s cubic-bezier(0.34,1.56,0.64,1), stroke 1s ease" }}
        />
        {/* Inner glow layer */}
        <circle
          cx={CX} cy={CY} r={IR}
          fill="none"
          stroke={`${col}40`}
          strokeWidth={ISW + 12}
          strokeLinecap="round"
          strokeDasharray={`${iFill} ${ICirc}`}
          transform={ROT}
          style={{ transition: "stroke-dasharray 1.1s cubic-bezier(0.34,1.56,0.64,1), stroke 1s ease", filter: "blur(10px)" }}
        />

        {/* ── Ring endpoint dot — outer ── */}
        {consumePct > 2 && (
          <circle
            cx={CX + OR * Math.cos(((consumePct / 100) * 360 - 90) * Math.PI / 180)}
            cy={CY + OR * Math.sin(((consumePct / 100) * 360 - 90) * Math.PI / 180)}
            r={OSW / 2 - 1}
            fill="#51B0E6"
          />
        )}
        {/* ── Ring endpoint dot — inner ── */}
        {tdsRaw != null && tdsPct > 2 && (
          <circle
            cx={CX + IR * Math.cos(((tdsPct / 100) * 360 - 90) * Math.PI / 180)}
            cy={CY + IR * Math.sin(((tdsPct / 100) * 360 - 90) * Math.PI / 180)}
            r={ISW / 2 - 1}
            fill={col}
            style={{ transition: "fill 1s ease" }}
          />
        )}
      </svg>

      {/* ── Center Content ── */}
      <div style={{
        position:       "absolute",
        inset:          0,
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        gap:            0,
        pointerEvents:  "none",
      }}>
        {/* Large TDS number */}
        <div style={{
          fontSize:           tdsRaw != null ? 58 : 40,
          fontWeight:         800,
          color:              tdsRaw != null ? col : "#2A3A4E",
          fontVariantNumeric: "tabular-nums",
          letterSpacing:      -3,
          lineHeight:         1,
          transition:         "color 1s ease, font-size 0.3s ease",
          textShadow:         tdsRaw != null ? tdsGlow(tdsRaw) : "none",
          fontFamily:         "system-ui, -apple-system",
        }}>
          {tdsRaw != null ? tdsRaw : "\u2014"}
        </div>
        {/* ppm unit */}
        <div style={{
          fontSize:      13,
          fontWeight:    600,
          color:         "#3A4A5E",
          letterSpacing: 2.5,
          textTransform: "uppercase",
          marginTop:     4,
        }}>ppm</div>
        {/* Quality label */}
        <div style={{
          marginTop:     8,
          fontSize:      12,
          fontWeight:    700,
          color:         col,
          letterSpacing: 1,
          textTransform: "uppercase",
          transition:    "color 1s ease",
        }}>
          {lbl}
        </div>
      </div>

      {/* ── Consumption badge (top) ── */}
      <div style={{
        position:       "absolute",
        top:            8,
        left:           "50%",
        transform:      "translateX(-50%)",
        background:     "#0D1825CC",
        border:         "1px solid #1A253570",
        borderRadius:   30,
        padding:        "4px 14px",
        fontSize:       11,
        fontWeight:     700,
        color:          "#51B0E6",
        letterSpacing:  0.5,
        whiteSpace:     "nowrap",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}>
        <BtlIcon name="droplet" size={12} color="#51B0E6" /> {Math.round(consumePct)}% {"\u2014"} {dailyML} mL
      </div>

      {/* ── TDS badge (bottom) ── */}
      {tdsRaw != null && (
        <div style={{
          position:       "absolute",
          bottom:         8,
          left:           "50%",
          transform:      "translateX(-50%)",
          background:     `${col}18`,
          border:         `1px solid ${col}40`,
          borderRadius:   30,
          padding:        "4px 14px",
          fontSize:       11,
          fontWeight:     700,
          color:          col,
          letterSpacing:  0.5,
          whiteSpace:     "nowrap",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          transition:     "all 1s ease",
        }}>
          TDS {"\u00B7"} {lbl}
        </div>
      )}

      {/* ── Ring labels (sides) ── */}
      <div style={{ position: "absolute", left: -2, top: "50%", transform: "translateY(-50%) rotate(-90deg)", fontSize: 9, fontWeight: 700, color: "#51B0E660", letterSpacing: 2, textTransform: "uppercase" }}>
        INTAKE
      </div>
      <div style={{ position: "absolute", right: -2, top: "50%", transform: "translateY(-50%) rotate(90deg)", fontSize: 9, fontWeight: 700, color: `${col}60`, letterSpacing: 2, textTransform: "uppercase", transition: "color 1s" }}>
        TDS
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TDS SCALE BAR
// ═══════════════════════════════════════════════════════════════

function TDSScaleBar({ tdsRaw }) {
  const bands = [
    { min: 0,   max: 35,  label: "Excellent", short: "0\u201335",   color: "#1E8A4C" },
    { min: 35,  max: 150, label: "Good",      short: "35\u2013150", color: "#F29423" },
    { min: 150, max: 300, label: "Moderate",  short: "150\u2013300",color: "#E07020" },
    { min: 300, max: 500, label: "Poor",      short: "300\u2013500",color: "#D93025" },
    { min: 500, max: 9999,label: "Unsafe",    short: "500+",   color: "#A01420" },
  ];
  const active = tdsRaw != null
    ? bands.findIndex(b => tdsRaw >= b.min && tdsRaw < b.max)
    : -1;
  const lastBandActive = tdsRaw != null && tdsRaw >= 500 ? 4 : active;

  return (
    <div style={{ padding: "0 4px" }}>
      <div style={{
        display:        "flex",
        justifyContent: "space-between",
        marginBottom:   8,
        alignItems:     "center",
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#3A4A5E", letterSpacing: 1.5, textTransform: "uppercase" }}>
          TDS Quality Scale
        </span>
        {tdsRaw != null && (
          <span style={{ fontSize: 11, fontWeight: 700, color: tdsColor(tdsRaw) }}>
            {tdsRaw} ppm {"\u2014"} {tdsLabel(tdsRaw)}
          </span>
        )}
      </div>

      {/* Bar segments */}
      <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
        {bands.map((b, i) => {
          const isActive = i === lastBandActive;
          return (
            <div
              key={b.label}
              style={{
                flex:         i === 1 ? 2 : i === 2 ? 2 : 1,
                height:       isActive ? 10 : 6,
                borderRadius: 5,
                background:   isActive ? b.color : `${b.color}35`,
                boxShadow:    isActive ? `0 0 12px ${b.color}80` : "none",
                transition:   "all 0.6s ease",
                marginTop:    isActive ? -2 : 0,
              }}
            />
          );
        })}
      </div>

      {/* Labels */}
      <div style={{ display: "flex", gap: 3 }}>
        {bands.map((b, i) => {
          const isActive = i === lastBandActive;
          return (
            <div
              key={b.label}
              style={{
                flex:          i === 1 ? 2 : i === 2 ? 2 : 1,
                textAlign:     "center",
                fontSize:      isActive ? 10 : 9,
                fontWeight:    isActive ? 800 : 500,
                color:         isActive ? b.color : "#3A4A5E",
                transition:    "all 0.6s ease",
                letterSpacing: 0.2,
                lineHeight:    1.3,
              }}
            >
              <div>{b.short}</div>
              <div style={{ opacity: isActive ? 1 : 0.6 }}>{b.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════

function StatCard({ icon, label, value, unit, color, hist = [], sublabel, onClick }) {
  const trend = hist.length >= 2 ? hist[hist.length - 1] - hist[hist.length - 2] : 0;
  const trendIcon = trend > 0.05 ? "\u2191" : trend < -0.05 ? "\u2193" : null;

  return (
    <div
      onClick={onClick}
      style={{
        background:    "linear-gradient(150deg, #0D1825 0%, #0A1520 100%)",
        border:        `1px solid ${value != null ? color + "25" : "#1A2535"}`,
        borderRadius:  22,
        padding:       "18px 16px 14px",
        display:       "flex",
        flexDirection: "column",
        gap:           0,
        position:      "relative",
        overflow:      "hidden",
        cursor:        onClick ? "pointer" : "default",
        transition:    "border-color 0.5s ease, transform 0.15s ease",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Background corner glow */}
      <div style={{
        position:      "absolute",
        top:           -20, right: -20,
        width:         80, height: 80,
        borderRadius:  "50%",
        background:    `radial-gradient(circle, ${color}12 0%, transparent 70%)`,
        pointerEvents: "none",
        transition:    "background 0.5s",
      }} />

      {/* Label + trend */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 15, lineHeight: 1 }}>{icon}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#556070", letterSpacing: 1.2, textTransform: "uppercase" }}>
            {label}
          </span>
        </div>
        {trendIcon && (
          <span style={{ fontSize: 13, color: trend > 0 ? "#F29423" : "#51B0E6", fontWeight: 700 }}>
            {trendIcon}
          </span>
        )}
      </div>

      {/* Value */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 2 }}>
        <span style={{
          fontSize:           30,
          fontWeight:         800,
          color:              value != null ? color : "#2A3A4E",
          fontVariantNumeric: "tabular-nums",
          letterSpacing:      -1,
          lineHeight:         1,
          fontFamily:         "system-ui, -apple-system",
          transition:         "color 0.5s ease",
        }}>
          {value ?? "\u2014"}
        </span>
        {unit && value != null && (
          <span style={{ fontSize: 12, fontWeight: 600, color: "#3A4A5E", letterSpacing: 0.3 }}>{unit}</span>
        )}
      </div>

      {/* Sublabel */}
      {sublabel && (
        <div style={{ fontSize: 10, color: sublabel.startsWith("\u26A0") ? "#F29423" : sublabel.startsWith("\u2713") ? "#1E8A4C" : "#3A4A5E", fontWeight: 600, marginBottom: 6 }}>
          {sublabel}
        </div>
      )}

      {/* Sparkline */}
      <div style={{ marginTop: "auto", paddingTop: 8 }}>
        <Sparkline data={hist} color={color} w={100} h={26} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BOTTLE ILLUSTRATION (connect screen)
// ═══════════════════════════════════════════════════════════════

function BottleIllustration({ glowing = false }) {
  return (
    <div style={{ position: "relative", width: 180, height: 180 }}>
      {/* Pulse rings */}
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position:     "absolute",
          inset:        i * -14,
          borderRadius: "50%",
          border:       `1px solid #51B0E6${glowing ? "30" : "15"}`,
          animation:    `ringPulse 3s ease-in-out ${i * 0.6}s infinite`,
          pointerEvents: "none",
        }} />
      ))}
      {/* Circle bg */}
      <div style={{
        width:        "100%",
        height:       "100%",
        borderRadius: "50%",
        background:   "radial-gradient(circle at 38% 32%, #1A3A5C 0%, #0A1825 55%, #060E18 100%)",
        border:       "1.5px solid #1A2A3E",
        display:      "flex",
        alignItems:   "center",
        justifyContent: "center",
        boxShadow:    glowing
          ? "0 0 80px #51B0E630, 0 0 160px #51B0E612, inset 0 0 50px #51B0E610"
          : "0 0 40px #51B0E610, inset 0 0 30px #51B0E606",
        transition:   "box-shadow 1s ease",
        position:     "relative",
        overflow:     "hidden",
      }}>
        {/* Shimmer highlight */}
        <div style={{
          position:     "absolute",
          top:          "10%", left: "20%",
          width:        "30%", height: "45%",
          background:   "linear-gradient(135deg, #51B0E615 0%, transparent 100%)",
          borderRadius: "50%",
          transform:    "rotate(-20deg)",
          pointerEvents: "none",
        }} />

        {/* Bottle SVG */}
        <svg width={70} height={96} viewBox="0 0 70 96" fill="none">
          {/* Cap */}
          <rect x="27" y="2" width="16" height="10" rx="3" fill="#51B0E6" opacity="0.7"/>
          <rect x="29" y="3" width="12" height="8" rx="2" fill="#51B0E6" opacity="0.4"/>

          {/* Neck */}
          <rect x="29" y="11" width="12" height="6" rx="1" fill="#0D2A45" stroke="#51B0E6" strokeWidth="0.8"/>

          {/* Body */}
          <path
            d="M22 17h26v4c6 3 9 9 9 17v30c0 8-5 14-13 14H26c-8 0-13-6-13-14V38c0-8 3-14 9-17v-4z"
            fill="#0A1E35"
            stroke="#51B0E6"
            strokeWidth="1"
            opacity="0.95"
          />

          {/* Water fill gradient */}
          <clipPath id="bottleClip">
            <path d="M22 17h26v4c6 3 9 9 9 17v30c0 8-5 14-13 14H26c-8 0-13-6-13-14V38c0-8 3-14 9-17v-4z"/>
          </clipPath>
          <rect x="13" y="52" width="44" height="36" clipPath="url(#bottleClip)" fill="url(#waterGrad)" opacity="0.65"/>
          <defs>
            <linearGradient id="waterGrad" x1="35" y1="88" x2="35" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#51B0E6" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#51B0E6" stopOpacity="0.1"/>
            </linearGradient>
          </defs>

          {/* Label area */}
          <rect x="20" y="42" width="30" height="20" rx="4" fill="#0D1E30" stroke="#1A3050" strokeWidth="0.8" opacity="0.8"/>
          {/* Generosity G mark */}
          <text x="35" y="56" textAnchor="middle" fontFamily="system-ui" fontWeight="800" fontSize="11" fill="#51B0E6" opacity="0.9">{"\u0047\u2122"}</text>

          {/* Sensor dots */}
          <circle cx="25" cy="68" r="2" fill="#51B0E6" opacity="0.6"/>
          <circle cx="35" cy="71" r="2" fill="#1E8A4C" opacity="0.6"/>
          <circle cx="45" cy="68" r="2" fill="#F29423" opacity="0.6"/>

          {/* Shine */}
          <path d="M26 20 Q28 35 26 55" stroke="#51B0E640" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Generosity brand mark below */}
      <div style={{
        position:  "absolute",
        bottom:    -28,
        left:      "50%",
        transform: "translateX(-50%)",
        fontSize:  10,
        fontWeight: 800,
        color:     "#51B0E660",
        letterSpacing: 3,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}>
        Generosity{"\u2122"}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CONNECT SCREEN
// ═══════════════════════════════════════════════════════════════

function ConnectScreen({ onConnect }) {
  return (
    <div style={{
      flex:           1,
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "center",
      padding:        "24px 28px 48px",
      gap:            0,
      textAlign:      "center",
    }}>
      {/* Hero Product Image */}
      <div style={{
        width:        260,
        height:       260,
        borderRadius: 28,
        overflow:     "hidden",
        marginBottom: 32,
        boxShadow:    "0 20px 60px rgba(81,176,230,0.15), 0 8px 24px rgba(0,0,0,0.4)",
        border:       "1px solid #1A253540",
      }}>
        <img
          src="/wtr-bottle-hero.jpg"
          alt="Generosity™ Intelligent WTR BTL"
          style={{
            width:     "100%",
            height:    "100%",
            objectFit: "cover",
            display:   "block",
          }}
        />
      </div>

      {/* Headline */}
      <div style={{ fontSize: 26, fontWeight: 800, color: "#F0F4F8", letterSpacing: -0.8, lineHeight: 1.2, marginBottom: 12 }}>
        Intelligent WTR BTL
      </div>
      <div style={{ fontSize: 14, color: "#A6A8AB", lineHeight: 1.7, maxWidth: 280, marginBottom: 36 }}>
        Connect your Generosity{"\u2122"} Smart Lid to monitor live water quality, track daily hydration, and receive real-time TDS readings.
      </div>

      {/* CTA Button */}
      <button
        onClick={onConnect}
        data-testid="connect-wtr-btl-btn"
        style={{
          width:         "100%",
          maxWidth:      320,
          padding:       "20px 0",
          background:    "linear-gradient(135deg, #51B0E6 0%, #2A8FCA 50%, #1A7AB8 100%)",
          color:         "#060E18",
          border:        "none",
          borderRadius:  18,
          fontSize:      17,
          fontWeight:    800,
          letterSpacing: 0.3,
          cursor:        "pointer",
          boxShadow:     "0 12px 48px #51B0E650, 0 4px 12px #51B0E630",
          position:      "relative",
          overflow:      "hidden",
          marginBottom:  16,
          transition:    "transform 0.15s, box-shadow 0.15s",
        }}
        onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
        onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
        onTouchStart={e => e.currentTarget.style.transform = "scale(0.98)"}
        onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}
      >
        {/* Shine overlay */}
        <div style={{
          position:     "absolute",
          inset:        0,
          background:   "linear-gradient(135deg, #ffffff20 0%, transparent 50%)",
          borderRadius: 18,
          pointerEvents: "none",
        }} />
        <span style={{ position: "relative", zIndex: 1 }}>Connect WTR BTL</span>
      </button>

      <div style={{ fontSize: 11, color: "#556070", maxWidth: 260, lineHeight: 1.7 }}>
        Open in Chrome on Android or Chrome desktop. Enable Bluetooth and power on your PP02 Smart Lid before connecting.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCANNING SCREEN
// ═══════════════════════════════════════════════════════════════

function ScanningScreen({ onCancel }) {
  return (
    <div style={{
      flex:           1,
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "center",
      gap:            28,
    }}>
      {/* Triple spinner */}
      <div style={{ position: "relative", width: 90, height: 90 }}>
        {[
          { size: 90, dur: "1s",   dir: "normal",  sw: 2.5, color: "#51B0E6" },
          { size: 66, dur: "1.6s", dir: "reverse", sw: 1.5, color: "#51B0E680" },
          { size: 44, dur: "2.2s", dir: "normal",  sw: 1,   color: "#51B0E640" },
        ].map(({ size, dur, dir, sw, color }, i) => (
          <div key={i} style={{
            position:  "absolute",
            inset:     (90 - size) / 2,
            borderRadius: "50%",
            border:    `${sw}px solid transparent`,
            borderTop: `${sw}px solid ${color}`,
            animation: `spin ${dur} linear ${dir} infinite`,
          }} />
        ))}
        <div style={{
          position:       "absolute",
          inset:          0,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          fontSize:       22,
        }}>
          <BtlIcon name="droplet" size={22} color="#51B0E6" />
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#F0F4F8", marginBottom: 8 }}>
          Searching for PP02 Smart Lid
        </div>
        <div style={{ fontSize: 13, color: "#556070", lineHeight: 1.6 }}>
          Make sure Bluetooth is on<br />and the lid is powered up
        </div>
      </div>

      <button
        onClick={onCancel}
        data-testid="cancel-scan-btn"
        style={{
          background:   "transparent",
          border:       "1px solid #1A2535",
          borderRadius: 14,
          color:        "#556070",
          padding:      "12px 32px",
          fontSize:     13,
          fontWeight:   600,
          cursor:       "pointer",
          transition:   "border-color 0.2s, color 0.2s",
        }}
      >
        Cancel
      </button>
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

  const devRef   = useRef(null);
  const wRef     = useRef(null);
  const nRef     = useRef(null);
  const timerRef = useRef(null);
  const rxBuf    = useRef([]);

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
          `${label} timed out after 15 s. Power-cycle the Smart Lid and try again.`
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

      // 1. Request device — try service filter first, fall back to broad scan
      let dev;
      try {
        dev = await navigator.bluetooth.requestDevice({
          filters: [{ services: [SVC] }],
          optionalServices: [SVC],
        });
      } catch (filterErr) {
        if (filterErr.name === "NotFoundError") { setBle("idle"); return; }
        addLog("Filtered scan failed — retrying with broad scan\u2026");
        dev = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [SVC],
        });
      }

      dev.addEventListener("gattserverdisconnected", () => {
        setBle("idle"); stopPoll(); setTele(null);
      });
      devRef.current = dev;
      addLog(`Connecting to "${dev.name || "PP02 Smart Lid"}"\u2026`);

      // 2. GATT connect with 15-second timeout
      const srv = await withTimeout(dev.gatt.connect(), "GATT connection");

      // 3. Service + characteristic discovery (each with timeout)
      const svc = await withTimeout(srv.getPrimaryService(SVC), "Service discovery");
      wRef.current = await withTimeout(svc.getCharacteristic(WCHR), "Write characteristic");
      nRef.current = await withTimeout(svc.getCharacteristic(NCHR), "Notify characteristic");
      await withTimeout(nRef.current.startNotifications(), "Start notifications");
      nRef.current.addEventListener("characteristicvaluechanged", onNotify);

      setBle("connected");
      addLog("\u2713 Connected");
      startPoll();
    } catch(e) {
      // Clean up partial connection
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

  // ── Derived values ────────────────────────────────────────────
  const s          = tele?.sensors ?? {};
  const tdsRaw     = s.tds?.raw    ?? null;
  const consumePct = Math.min(100, Math.round((intake / goalML) * 100));
  const score      = tele ? waterScore(s) : null;
  const col        = tdsColor(tdsRaw);
  const histOf     = key =>
    hist.map(h => { const v = h.sensors?.[key]?.val; return v != null ? parseFloat(v) : null; })
        .filter(v => v != null);

  const phVal    = s.ph?.val        ?? null;
  const tempVal  = s.waterTemp?.val ?? null;
  const levelVal = s.waterLevel?.val?? null;
  const battVal  = tele?.batt       ?? null;

  const phColor = () => {
    if (!phVal) return "#51B0E6";
    const v = parseFloat(phVal);
    if (v < 6.5 || v > 9.5) return "#D93025";
    if (v >= 7.2 && v <= 9.0) return "#1E8A4C";
    return "#F29423";
  };

  const isLive = ble === "connected" || tele !== null;

  // ── LIVE TAB ──────────────────────────────────────────────────
  const LiveTab = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: 12 }}>

      {/* HERO: DUAL RINGS */}
      <div style={{
        background: "linear-gradient(165deg, #0A1A2E 0%, #060E18 100%)",
        borderRadius: 28,
        padding: "24px 16px 18px",
        border: "1px solid #1A253560",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle animated grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(#51B0E606 1px, transparent 1px), linear-gradient(90deg, #51B0E606 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }}/>

        <DualRing
          consumePct={consumePct}
          tdsRaw={tdsRaw}
          goalML={goalML}
          dailyML={intake}
        />

        <TDSScaleBar tdsRaw={tdsRaw} />

        {/* Intake row */}
        <div style={{
          width: "100%",
          background: "#0A152080",
          borderRadius: 16,
          padding: "12px 16px",
          border: "1px solid #1A253550",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#3A4A5E", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>
              Today's Intake
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: "#51B0E6", fontVariantNumeric: "tabular-nums", fontFamily: "system-ui" }}>
                {intake}
              </span>
              <span style={{ fontSize: 12, color: "#3A4A5E", fontWeight: 600 }}>/ {goalML} mL</span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ flex: 1 }}>
            <div style={{ height: 5, background: "#1A2535", borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
              <div style={{
                height: "100%",
                width: `${consumePct}%`,
                background: consumePct >= 100
                  ? "linear-gradient(90deg, #1E8A4C, #27A05A)"
                  : "linear-gradient(90deg, #51B0E6, #2A8FCA)",
                borderRadius: 3,
                transition: "width 1s cubic-bezier(0.34,1.56,0.64,1)",
                boxShadow: consumePct > 5 ? "0 0 8px #51B0E650" : "none",
              }} />
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: consumePct >= 100 ? "#1E8A4C" : "#3A4A5E" }}>
              {consumePct >= 100 ? <><BtlIcon name="target" size={10} color="#1E8A4C" /> Daily goal reached!</> : `${goalML - intake} mL remaining`}
            </div>
          </div>

          <button
            onClick={() => setShowGoal(v => !v)}
            data-testid="set-goal-btn"
            style={{
              background: "#1A2535",
              border: "1px solid #2A3545",
              borderRadius: 12,
              color: "#51B0E6",
              padding: "8px 12px",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
              letterSpacing: 0.3,
            }}
          >
            Set Goal
          </button>
        </div>

        {/* Goal editor */}
        {showGoal && (
          <div style={{ width: "100%", display: "flex", gap: 8 }}>
            <input
              value={goalInput}
              onChange={e => setGoalInput(e.target.value)}
              placeholder="Daily goal in mL (250\u20135000)"
              data-testid="goal-input"
              style={{
                flex: 1,
                background: "#0A1320",
                border: "1px solid #1A2535",
                borderRadius: 12,
                color: "#F0F4F8",
                padding: "11px 14px",
                fontSize: 14,
                fontVariantNumeric: "tabular-nums",
                outline: "none",
                fontFamily: "DM Sans, sans-serif",
              }}
            />
            <button onClick={applyGoal} data-testid="apply-goal-btn" style={{
              background: "#51B0E6", color: "#060E18", border: "none",
              borderRadius: 12, padding: "11px 20px",
              fontWeight: 800, fontSize: 14, cursor: "pointer",
            }}>Set</button>
            <button onClick={resetIntake} data-testid="reset-intake-btn" style={{
              background: "#1A2535", color: "#A6A8AB",
              border: "1px solid #2A3545", borderRadius: 12,
              padding: "11px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer",
            }}>Reset</button>
          </div>
        )}
      </div>

      {/* 4 STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <StatCard
          icon={<BtlIcon name="thermometer" size={15} color="#51B0E6" />}
          label="Water Temp"
          value={tempVal}
          unit="\u00B0C"
          color="#51B0E6"
          hist={histOf("waterTemp")}
          sublabel={tempVal != null ? (parseFloat(tempVal) > 30 ? "\u26A0 Too warm" : "\u2713 Optimal") : null}
        />
        <StatCard
          icon={<BtlIcon name="testTube" size={15} color={phColor()} />}
          label="pH Level"
          value={phVal}
          unit="pH"
          color={phColor()}
          hist={histOf("ph")}
          sublabel={phVal != null ? (parseFloat(phVal) >= 7.2 && parseFloat(phVal) <= 9.0 ? "\u2713 Optimal range" : "\u26A0 Check pH") : null}
        />
        <StatCard
          icon={<BtlIcon name="battery" size={15} color={battVal != null ? (battVal > 50 ? "#1E8A4C" : battVal > 20 ? "#F29423" : "#D93025") : "#51B0E6"} />}
          label="Battery"
          value={battVal}
          unit="%"
          color={battVal != null ? (battVal > 50 ? "#1E8A4C" : battVal > 20 ? "#F29423" : "#D93025") : "#51B0E6"}
          hist={histOf("battTemp")}
          sublabel={tele?.charging ? "\u26A1 Charging" : battVal != null && battVal < 20 ? "\u26A0 Low battery" : null}
        />
        <StatCard
          icon={<BtlIcon name="ruler" size={15} color="#2A8FCA" />}
          label="Water Level"
          value={levelVal}
          unit="mm"
          color="#2A8FCA"
          hist={histOf("waterLevel")}
          sublabel={levelVal != null ? (levelVal > 200 ? "\u2713 Full" : levelVal > 50 ? "\u26A0 Getting low" : "\u26A0 Almost empty") : null}
        />
      </div>

      {/* DEVICE STATUS */}
      {tele && (
        <div style={{
          display: "flex",
          background: "#0D1825",
          borderRadius: 18,
          border: "1px solid #1A2535",
          overflow: "hidden",
        }}>
          {[
            { label: "Status",   value: ["Standby","Running","Charging"][tele.state] ?? "\u2014", color: "#1E8A4C" },
            { label: "Firmware", value: `v${(tele.fw / 100).toFixed(1)}`,                    color: "#51B0E6" },
            { label: "Last Sync",value: new Date(tele.ts).toLocaleTimeString(),               color: "#A6A8AB" },
          ].map(({ label, value, color }, i) => (
            <div key={label} style={{
              flex: 1,
              padding: "12px 8px",
              textAlign: "center",
              borderRight: i < 2 ? "1px solid #1A2535" : "none",
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#3A4A5E", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color }}>{value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── SENSORS TAB ───────────────────────────────────────────────
  const SensorsTab = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {Object.values(s).length === 0 ? (
        <div style={{ textAlign: "center", padding: "56px 0", color: "#3A4A5E" }}>
          <div style={{ marginBottom: 14 }}><BtlIcon name="signal" size={36} color="#556070" /></div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#556070", marginBottom: 6 }}>No sensor data yet</div>
          <div style={{ fontSize: 12 }}>Waiting for first poll\u2026</div>
        </div>
      ) : Object.values(s).map((sensor, i) => (
        <div key={i} style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          background:     "linear-gradient(145deg, #0D1825, #0A1520)",
          borderRadius:   18,
          padding:        "14px 18px",
          border:         `1px solid ${sensor.type === 0x02 ? col + "35" : "#1A253540"}`,
          transition:     "border-color 0.5s",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#A6A8AB", letterSpacing: 0.3 }}>
                {sensor.label}
              </span>
              {sensor.type === 0x02 && tdsRaw != null && (
                <span style={{
                  fontSize: 9, fontWeight: 800,
                  padding: "2px 7px", borderRadius: 10,
                  background: `${col}20`, color: col,
                  letterSpacing: 0.8, textTransform: "uppercase",
                }}>
                  {tdsLabel(tdsRaw)}
                </span>
              )}
            </div>
            <div style={{ fontSize: 10, color: "#3A4A5E", fontFamily: "DM Mono, monospace" }}>
              Type 0x{sensor.type?.toString(16).toUpperCase().padStart(2,"0")} {"\u00B7"} Raw {sensor.raw}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontSize:           26,
              fontWeight:         800,
              color:              sensor.type === 0x02 ? col : "#51B0E6",
              fontVariantNumeric: "tabular-nums",
              fontFamily:         "system-ui",
              letterSpacing:      -0.5,
              transition:         "color 0.5s",
            }}>
              {sensor.val}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#3A4A5E" }}>{sensor.unit}</div>
          </div>
        </div>
      ))}
    </div>
  );

  // ── HISTORY TAB ───────────────────────────────────────────────
  const HistoryTab = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { key: "tds",        label: "TDS",         unit: "ppm", color: col           },
          { key: "ph",         label: "pH",           unit: "pH",  color: "#51B0E6"     },
          { key: "waterTemp",  label: "Water Temp",   unit: "\u00B0C",  color: "#2A8FCA"     },
          { key: "waterLevel", label: "Water Level",  unit: "mm",  color: "#1E8A4C"     },
        ].map(({ key, label, unit, color }) => {
          const data   = histOf(key);
          const latest = data[data.length - 1];
          const min    = data.length ? Math.min(...data) : null;
          const max    = data.length ? Math.max(...data) : null;
          return (
            <div key={key} style={{
              background:    "#0D1825",
              borderRadius:  20,
              padding:       "14px 14px 12px",
              border:        `1px solid ${color}20`,
            }}>
              <div style={{ fontSize: 10, color: "#556070", fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8 }}>
                {label}
              </div>
              <Sparkline data={data} color={color} w={120} h={36} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color, fontVariantNumeric: "tabular-nums", fontFamily: "system-ui" }}>
                  {latest != null ? latest : "\u2014"}
                </span>
                <span style={{ fontSize: 10, color: "#3A4A5E", fontWeight: 600 }}>{unit}</span>
              </div>
              {min != null && (
                <div style={{ fontSize: 9, color: "#3A4A5E", marginTop: 2 }}>
                  {"\u2193"} {min}  {"\u00B7"}  {"\u2191"} {max}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Log table */}
      <div style={{
        background:    "#0D1825",
        borderRadius:  20,
        padding:       "14px 16px",
        border:        "1px solid #1A2535",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 10, color: "#3A4A5E", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>
            Reading Log ({hist.length} / {MAX_HIST})
          </span>
        </div>
        <div style={{ maxHeight: 220, overflowY: "auto" }}>
          {hist.length === 0 ? (
            <div style={{ textAlign: "center", padding: 24, color: "#3A4A5E", fontSize: 12 }}>No readings yet</div>
          ) : [...hist].reverse().map((h, i) => (
            <div key={i} style={{
              display:         "grid",
              gridTemplateColumns: "56px 1fr 1fr 1fr",
              padding:         "6px 0",
              borderBottom:    "1px solid #1A2535",
              fontSize:        11,
              color:           "#A6A8AB",
              alignItems:      "center",
            }}>
              <span style={{ fontSize: 10, color: "#3A4A5E", fontFamily: "DM Mono, monospace" }}>
                {new Date(h.ts).toLocaleTimeString()}
              </span>
              <span>
                TDS: <b style={{ color: tdsColor(h.sensors?.tds?.raw) }}>
                  {h.sensors?.tds?.val ?? "\u2014"}
                </b>
              </span>
              <span>pH: <b style={{ color: "#51B0E6" }}>{h.sensors?.ph?.val ?? "\u2014"}</b></span>
              <span>T: <b style={{ color: "#2A8FCA" }}>{h.sensors?.waterTemp?.val ?? "\u2014"}{"\u00B0"}</b></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── DEBUG TAB ─────────────────────────────────────────────────
  const DebugTab = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {[
          { label: "Poll 0x10", fn: () => send(CMD_INFO),     color: "#51B0E6" },
          { label: "Activate",  fn: () => send(CMD_ACTIVATE), color: "#2A8FCA" },
          { label: "Reset",     fn: resetIntake,               color: "#F29423" },
        ].map(({ label, fn, color }) => (
          <button
            key={label}
            onClick={fn}
            disabled={ble !== "connected"}
            style={{
              padding:       "11px 4px",
              background:    ble === "connected" ? `${color}15` : "#0D1825",
              color:         ble === "connected" ? color : "#3A4A5E",
              border:        `1px solid ${ble === "connected" ? color + "40" : "#1A2535"}`,
              borderRadius:  12,
              fontSize:      11,
              fontWeight:    700,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              cursor:        ble === "connected" ? "pointer" : "not-allowed",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{
        background:  "#020810",
        borderRadius: 18,
        padding:     "12px 14px",
        fontFamily:  "DM Mono, 'SF Mono', 'Fira Code', monospace",
        fontSize:    10.5,
        maxHeight:   360,
        overflowY:   "auto",
        border:      "1px solid #1A2535",
        lineHeight:  1.7,
      }}>
        {log.length === 0 ? (
          <div style={{ color: "#3A4A5E", textAlign: "center", padding: "24px 0" }}>
            BLE packet log appears here after connection
          </div>
        ) : log.map((entry, i) => (
          <div key={i} style={{ marginBottom: 4, paddingBottom: 4, borderBottom: "1px solid #0D1825" }}>
            <span style={{ color: "#3A4A5E" }}>{entry.t} </span>
            <span style={{ color: entry.msg.includes("RX") || entry.msg.includes("\u2190") ? "#1E8A4C" : "#51B0E6", fontWeight: 600 }}>
              {entry.msg}
            </span>
            {entry.hex && (
              <div style={{ color: "#A6A8AB", marginTop: 2, wordBreak: "break-all" }}>
                {entry.hex}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => setLog([])}
        data-testid="clear-log-btn"
        style={{
          background:   "transparent",
          border:       "1px solid #1A2535",
          borderRadius: 12,
          color:        "#3A4A5E",
          padding:      "10px 0",
          fontSize:     12,
          fontWeight:   600,
          cursor:       "pointer",
        }}
      >
        Clear Log
      </button>
    </div>
  );

  // ── ROOT ──────────────────────────────────────────────────────
  return (
    <div data-testid="wtr-btl-screen" style={{
      fontFamily:              "DM Sans, -apple-system, BlinkMacSystemFont, sans-serif",
      background:              "#0A1520",
      minHeight:               "100%",
      color:                   "#F0F4F8",
      display:                 "flex",
      flexDirection:           "column",
      maxWidth:                480,
      margin:                  "0 auto",
      WebkitFontSmoothing:     "antialiased",
      MozOsxFontSmoothing:     "grayscale",
    }}>

      {/* ── Fonts ── */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      {/* ── Animations ── */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes ringPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.1; transform: scale(1.1); }
        }
        @keyframes blinkDot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1A2535; border-radius: 2px; }
      `}</style>

      {/* HEADER */}
      <div style={{
        background:           "linear-gradient(180deg, #0E2035 0%, #0A1520 100%)",
        padding:              "16px 20px 14px",
        borderBottom:         "1px solid #1A253550",
        position:             "sticky",
        top:                  0,
        zIndex:               100,
        backdropFilter:       "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Brand */}
          <div>
            <img src="/generosity-logo.png" alt="Generosity™ Water Intelligence" style={{ height: 28, marginBottom: 6, display: "block" }} />
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1 }}>
              Intelligent WTR BTL
            </div>
          </div>

          {/* Status + button */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* Status pill */}
            <div data-testid="ble-status-pill" style={{
              display:    "flex",
              alignItems: "center",
              gap:        5,
              background: ble === "connected" ? "#1E8A4C18"
                        : ble === "scanning"  ? "#F2942318"
                        : ble === "error"     ? "#D9302518"
                        : "#1A2535",
              border:     `1px solid ${
                ble === "connected" ? "#1E8A4C40"
                : ble === "scanning" ? "#F2942340"
                : ble === "error"    ? "#D9302540"
                : "#2A3545"}`,
              borderRadius: 20,
              padding:    "5px 11px",
            }}>
              <div style={{
                width:     7,
                height:    7,
                borderRadius: "50%",
                background: ble === "connected" ? "#1E8A4C"
                          : ble === "scanning"  ? "#F29423"
                          : ble === "error"     ? "#D93025"
                          : "#3A4A5E",
                boxShadow:  ble === "connected" ? "0 0 8px #1E8A4C"
                          : ble === "scanning"  ? "0 0 8px #F29423"
                          : "none",
                animation:  ble === "scanning" ? "blinkDot 1s ease-in-out infinite" : "none",
              }} />
              <span style={{
                fontSize:      10,
                fontWeight:    700,
                letterSpacing: 0.8,
                textTransform: "uppercase",
                color: ble === "connected" ? "#1E8A4C"
                     : ble === "scanning"  ? "#F29423"
                     : ble === "error"     ? "#D93025"
                     : "#3A4A5E",
              }}>
                {ble === "connected" ? (devRef.current?.name?.slice(0,12) || "Connected")
                 : ble === "scanning" ? "Scanning"
                 : ble === "error"    ? "Error"
                 : "BLE"}
              </span>
            </div>

            {/* Connect / Disconnect */}
            {ble === "connected" ? (
              <button
                onClick={disconnect}
                data-testid="disconnect-btn"
                style={{
                  background:    "#1A2535",
                  color:         "#D93025",
                  border:        "1px solid #D9302540",
                  borderRadius:  20,
                  padding:       "5px 14px",
                  fontSize:      11,
                  fontWeight:    700,
                  cursor:        "pointer",
                  letterSpacing: 0.3,
                  transition:    "background 0.2s",
                }}
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={connect}
                disabled={ble === "scanning"}
                data-testid="header-connect-btn"
                style={{
                  background:    ble === "scanning" ? "#1A2535" : "linear-gradient(135deg, #51B0E6, #2A8FCA)",
                  color:         ble === "scanning" ? "#3A4A5E" : "#060E18",
                  border:        "none",
                  borderRadius:  20,
                  padding:       "5px 16px",
                  fontSize:      11,
                  fontWeight:    800,
                  cursor:        ble === "scanning" ? "not-allowed" : "pointer",
                  letterSpacing: 0.3,
                  boxShadow:     ble === "scanning" ? "none" : "0 4px 16px #51B0E640",
                }}
              >
                {ble === "scanning" ? "Scanning\u2026" : "Connect"}
              </button>
            )}
          </div>
        </div>

        {/* Error message */}
        {errMsg && (
          <div data-testid="ble-error-msg" style={{
            marginTop:  10,
            background: "#D9302510",
            border:     "1px solid #D9302535",
            borderRadius: 10,
            padding:    "8px 12px",
            fontSize:   12,
            color:      "#D93025",
            lineHeight: 1.5,
          }}>
            <BtlIcon name="hazard" size={12} color="#D93025" /> {errMsg}
          </div>
        )}
      </div>

      {/* BODY */}
      {(ble === "idle" || ble === "error") && !tele && <ConnectScreen  onConnect={connect} />}
      {ble === "scanning"            && <ScanningScreen onCancel={() => setBle("idle")} />}

      {isLive && (
        <>
          {/* ── Tab bar ── */}
          <div style={{
            display:      "flex",
            background:   "#0A1320",
            borderBottom: "1px solid #1A2535",
            padding:      "0 8px",
            position:     "sticky",
            top:          64,
            zIndex:       99,
          }}>
            {[
              { id: "live",    label: "Live"    },
              { id: "sensors", label: "Sensors" },
              { id: "history", label: "History" },
              { id: "debug",   label: "Debug"   },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                data-testid={`wtr-tab-${t.id}`}
                style={{
                  flex:          1,
                  padding:       "12px 4px",
                  background:    "transparent",
                  color:         tab === t.id ? "#51B0E6" : "#3A4A5E",
                  border:        "none",
                  borderBottom:  tab === t.id ? "2px solid #51B0E6" : "2px solid transparent",
                  fontSize:      12,
                  fontWeight:    tab === t.id ? 700 : 500,
                  cursor:        "pointer",
                  letterSpacing: 0.3,
                  textTransform: "uppercase",
                  transition:    "color 0.2s, border-color 0.2s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Tab content ── */}
          <div style={{
            padding:    "16px 16px 40px",
            flex:       1,
            overflowY:  "auto",
            animation:  "fadeInUp 0.25s ease",
          }}>
            {tab === "live"    && <LiveTab    />}
            {tab === "sensors" && <SensorsTab />}
            {tab === "history" && <HistoryTab />}
            {tab === "debug"   && <DebugTab   />}
          </div>
        </>
      )}
    </div>
  );
}
