import { useState, useEffect, useRef } from "react";

// ─── GENEROSITY™ OFFICIAL BRAND PALETTE ─────────────────────────────────────
const B = {
  blue:        "#51B0E6",
  blueDark:    "#2A8FCA",
  blueLight:   "#EDF6FC",
  blueMid:     "#DCEEF9",
  blue40:      "#B9DEF3",
  gray:        "#A6A8AB",
  grayDark:    "#6E7073",
  grayMid:     "#C5C6C8",
  lightGray:   "#F0F1F3",
  white:       "#FFFFFF",
  offWhite:    "#F7F9FB",
  navy:        "#0A1A2E",
  navyMid:     "#0D2244",
  border:      "#C8E2F4",
  borderLight: "#E4F1FA",
  danger:      "#D93025",
  warning:     "#F29423",
  ok:          "#1E8A4C",
  dangerBg:    "#FFF3F2",
  warningBg:   "#FFF8EE",
  okBg:        "#F0FAF4",
};

const BOTTLE_BRANDS = {
  "Evian":         { origin: "French Alps", tds: 345, ph: 7.2, fluoride: 0.1, microplastics: "HIGH", pfas_risk: "MEDIUM", score: 62, concern: "High TDS. Microplastic contamination detected in independent testing." },
  "Dasani":        { origin: "Municipal tap (filtered)", tds: 38, ph: 5.6, fluoride: 0.07, microplastics: "VERY HIGH", pfas_risk: "HIGH", score: 78, concern: "Acidic pH 5.6, PFAS-lined packaging, highest microplastic count in 2023 Orb Media study." },
  "Aquafina":      { origin: "Municipal tap (reverse osmosis)", tds: 11, ph: 6.0, fluoride: 0.05, microplastics: "HIGH", pfas_risk: "HIGH", score: 71, concern: "Ultra-low minerals, acidic pH, PFAS detected in packaging migration studies." },
  "Poland Spring": { origin: "Maine springs", tds: 37, ph: 7.2, fluoride: 0.1, microplastics: "HIGH", pfas_risk: "MEDIUM", score: 55, concern: "High microplastic count. FTC settlement over 'natural spring' sourcing claims." },
  "Fiji Water":    { origin: "Artesian aquifer, Fiji", tds: 222, ph: 7.7, fluoride: 0.2, microplastics: "MEDIUM", pfas_risk: "LOW", score: 38, concern: "Arsenic levels near WHO limits. 18,000-mile shipping carbon footprint." },
  "Smart Water":   { origin: "Municipal tap (vapor distilled)", tds: 24, ph: 7.0, fluoride: 0.0, microplastics: "MEDIUM", pfas_risk: "MEDIUM", score: 44, concern: "No natural minerals. Electrolytes added post-distillation." },
  "Voss":          { origin: "Artesian aquifer, Norway", tds: 44, ph: 6.0, fluoride: 0.0, microplastics: "LOW", pfas_risk: "LOW", score: 29, concern: "Slightly acidic. Glass bottle option recommended." },
};

const CITY_DATA = {
  "Austin, TX": {
    utility: "Austin Water", source: "Colorado River / Barton Springs",
    population: 978908, tds: 312, ph: 7.8, hardness: "Moderate (142 mg/L)",
    contaminants: [
      { name: "Chromium-6", level: 0.22, limit: 0.10, unit: "ppb", risk: "high", category: "Heavy Metal", detail: "Known carcinogen. No safe level. Exceeds CA health goal by 11x.", removed: true },
      { name: "PFAS (PFOA)", level: 1.8, limit: 0.004, unit: "ppt", risk: "high", category: "Forever Chemicals", detail: "Linked to cancer, thyroid disruption, immune suppression. Never breaks down.", removed: true },
      { name: "Haloacetic Acids", level: 42.3, limit: 60, unit: "ppb", risk: "medium", category: "Disinfection Byproduct", detail: "Forms when chlorine reacts with organic matter. Potential carcinogen.", removed: true },
      { name: "Trihalomethanes", level: 38.1, limit: 80, unit: "ppb", risk: "medium", category: "Disinfection Byproduct", detail: "Associated with cancer risk and reproductive harm.", removed: true },
      { name: "Nitrate", level: 2.1, limit: 10, unit: "ppm", risk: "low", category: "Agricultural Runoff", detail: "Dangerous for infants under 6 months. 'Blue baby syndrome' risk.", removed: true },
      { name: "Radium", level: 0.8, limit: 5, unit: "pCi/L", risk: "low", category: "Radioactive", detail: "Naturally occurring. Bone cancer risk with long-term exposure.", removed: true },
      { name: "Microplastics", level: "Detected", limit: "None set", unit: "", risk: "medium", category: "Emerging Contaminant", detail: "Found in blood, lungs, and placentas. No safe level established.", removed: true },
    ]
  },
  "Chicago, IL": {
    utility: "City of Chicago", source: "Lake Michigan",
    population: 2696555, tds: 220, ph: 7.9, hardness: "Moderate (143 mg/L)",
    contaminants: [
      { name: "Lead", level: 18.4, limit: 15, unit: "ppb", risk: "high", category: "Heavy Metal", detail: "EXCEEDS LEGAL LIMIT. 400,000+ lead service lines — most of any US city.", removed: true },
      { name: "Chromium-6", level: 0.26, limit: 0.10, unit: "ppb", risk: "high", category: "Heavy Metal", detail: "Known carcinogen.", removed: true },
      { name: "PFAS (Total)", level: 3.4, limit: 0.004, unit: "ppt", risk: "high", category: "Forever Chemicals", detail: "Multiple PFAS compounds found.", removed: true },
      { name: "Haloacetic Acids", level: 39.2, limit: 60, unit: "ppb", risk: "medium", category: "Disinfection Byproduct", detail: "65% of legal limit.", removed: true },
      { name: "Microplastics", level: "Detected", limit: "None set", unit: "", risk: "medium", category: "Emerging Contaminant", detail: "Lake Michigan source. Microplastic hotspot.", removed: true },
    ]
  },
  "Los Angeles, CA": {
    utility: "LADWP", source: "Colorado River / Northern CA / Groundwater",
    population: 3898747, tds: 486, ph: 7.6, hardness: "Hard (218 mg/L)",
    contaminants: [
      { name: "Chromium-6", level: 0.51, limit: 0.10, unit: "ppb", risk: "high", category: "Heavy Metal", detail: "Highest Chromium-6 in the nation. 5x above CA health goal.", removed: true },
      { name: "PFAS (Total)", level: 4.2, limit: 0.004, unit: "ppt", risk: "high", category: "Forever Chemicals", detail: "Multiple PFAS compounds. Bioaccumulate in breast milk.", removed: true },
      { name: "Arsenic", level: 2.8, limit: 10, unit: "ppb", risk: "medium", category: "Heavy Metal", detail: "Skin, bladder, lung cancer association.", removed: true },
      { name: "Haloacetic Acids", level: 51.3, limit: 60, unit: "ppb", risk: "medium", category: "Disinfection Byproduct", detail: "Near legal limit.", removed: true },
      { name: "Microplastics", level: "Detected", limit: "None set", unit: "", risk: "medium", category: "Emerging Contaminant", detail: "94% of LA tap samples positive.", removed: true },
    ]
  },
  "New York, NY": {
    utility: "NYC DEP", source: "Catskill/Delaware Watersheds",
    population: 8336817, tds: 144, ph: 7.2, hardness: "Soft (31 mg/L)",
    contaminants: [
      { name: "Lead", level: 8.1, limit: 15, unit: "ppb", risk: "medium", category: "Heavy Metal", detail: "Old infrastructure. Lead service lines in pre-1986 buildings.", removed: true },
      { name: "PFAS (PFOA)", level: 1.1, limit: 0.004, unit: "ppt", risk: "high", category: "Forever Chemicals", detail: "No safe exposure level for children.", removed: true },
      { name: "Haloacetic Acids", level: 21.8, limit: 60, unit: "ppb", risk: "low", category: "Disinfection Byproduct", detail: "Chlorine treatment byproduct.", removed: true },
      { name: "Microplastics", level: "Detected", limit: "None set", unit: "", risk: "medium", category: "Emerging Contaminant", detail: "Found in all NYC tap samples tested.", removed: true },
    ]
  },
  "Denver, CO": {
    utility: "Denver Water", source: "South Platte River",
    population: 749000, tds: 198, ph: 8.1, hardness: "Soft (72 mg/L)",
    contaminants: [
      { name: "Chromium-6", level: 0.18, limit: 0.10, unit: "ppb", risk: "high", category: "Heavy Metal", detail: "Known carcinogen. Exceeds CA health goal.", removed: true },
      { name: "PFAS (PFOS)", level: 2.1, limit: 0.004, unit: "ppt", risk: "high", category: "Forever Chemicals", detail: "Liver damage, thyroid disruption, cancer risk.", removed: true },
      { name: "Lead", level: 3.2, limit: 15, unit: "ppb", risk: "medium", category: "Heavy Metal", detail: "No safe level. Neurological damage in children under 6.", removed: true },
      { name: "Arsenic", level: 1.4, limit: 10, unit: "ppb", risk: "medium", category: "Heavy Metal", detail: "Cancer risk. Harmful to developing fetuses.", removed: true },
      { name: "Microplastics", level: "Detected", limit: "None set", unit: "", risk: "medium", category: "Emerging Contaminant", detail: "Found in human blood and organs.", removed: true },
    ]
  },
  "Houston, TX": {
    utility: "Houston Water", source: "Trinity River / Lake Houston",
    population: 2304580, tds: 388, ph: 7.4, hardness: "Hard (182 mg/L)",
    contaminants: [
      { name: "PFAS (PFOS)", level: 5.8, limit: 0.004, unit: "ppt", risk: "high", category: "Forever Chemicals", detail: "1,450x the EPA health advisory level.", removed: true },
      { name: "Chromium-6", level: 0.31, limit: 0.10, unit: "ppb", risk: "high", category: "Heavy Metal", detail: "Exceeds health goal.", removed: true },
      { name: "Arsenic", level: 3.2, limit: 10, unit: "ppb", risk: "medium", category: "Heavy Metal", detail: "8x EWG health guideline. Cancer risk.", removed: true },
      { name: "Radium", level: 2.1, limit: 5, unit: "pCi/L", risk: "medium", category: "Radioactive", detail: "Elevated from Texas geology.", removed: true },
      { name: "Haloacetic Acids", level: 44.8, limit: 60, unit: "ppb", risk: "medium", category: "Disinfection Byproduct", detail: "High organic matter in source water.", removed: true },
      { name: "Microplastics", level: "Detected", limit: "None set", unit: "", risk: "medium", category: "Emerging Contaminant", detail: "Industrial river source.", removed: true },
    ]
  },
  "Phoenix, AZ": {
    utility: "Phoenix Water Services", source: "Colorado River / Salt River",
    population: 1608139, tds: 620, ph: 7.9, hardness: "Very Hard (280 mg/L)",
    contaminants: [
      { name: "Chromium-6", level: 0.44, limit: 0.10, unit: "ppb", risk: "high", category: "Heavy Metal", detail: "Colorado River source. Elevated Chromium-6.", removed: true },
      { name: "PFAS (Total)", level: 3.1, limit: 0.004, unit: "ppt", risk: "high", category: "Forever Chemicals", detail: "Military base contamination in groundwater.", removed: true },
      { name: "Arsenic", level: 4.8, limit: 10, unit: "ppb", risk: "medium", category: "Heavy Metal", detail: "Arizona geology naturally high in arsenic.", removed: true },
      { name: "Nitrate", level: 4.2, limit: 10, unit: "ppm", risk: "low", category: "Agricultural Runoff", detail: "Central Arizona Project runoff.", removed: true },
      { name: "Microplastics", level: "Detected", limit: "None set", unit: "", risk: "medium", category: "Emerging Contaminant", detail: "Detected in all Arizona tap samples.", removed: true },
    ]
  },
};

const GENERIC_DATA = (city) => ({
  utility: `${city} Municipal Water`, source: "Municipal Supply",
  tds: 280, ph: 7.6, hardness: "Moderate", population: 0,
  contaminants: [
    { name: "PFAS (Forever Chemicals)", level: 2.4, limit: 0.004, unit: "ppt", risk: "high", category: "Forever Chemicals", detail: "Found in 45% of US tap water. No safe level for children.", removed: true },
    { name: "Chromium-6", level: 0.19, limit: 0.10, unit: "ppb", risk: "high", category: "Heavy Metal", detail: "Found in 75% of US drinking water. Known carcinogen.", removed: true },
    { name: "Lead", level: 4.2, limit: 15, unit: "ppb", risk: "medium", category: "Heavy Metal", detail: "No safe level. Found in aging infrastructure nationwide.", removed: true },
    { name: "Chlorine Byproducts", level: 38, limit: 80, unit: "ppb", risk: "medium", category: "Disinfection Byproduct", detail: "Cancer association at chronic exposure.", removed: true },
    { name: "Microplastics", level: "Detected", limit: "None set", unit: "", risk: "medium", category: "Emerging Contaminant", detail: "Found in 94% of US tap water samples.", removed: true },
    { name: "Nitrates", level: 2.1, limit: 10, unit: "ppm", risk: "low", category: "Agricultural Runoff", detail: "Risk for infants and pregnant women.", removed: true },
  ]
});

const ZIP_MAP = {
  "78701": "Austin, TX", "78702": "Austin, TX", "78703": "Austin, TX",
  "60601": "Chicago, IL", "60602": "Chicago, IL", "60603": "Chicago, IL",
  "90001": "Los Angeles, CA", "90210": "Los Angeles, CA", "90024": "Los Angeles, CA",
  "10001": "New York, NY", "10002": "New York, NY", "10003": "New York, NY",
  "80201": "Denver, CO", "80202": "Denver, CO", "80203": "Denver, CO",
  "77001": "Houston, TX", "77002": "Houston, TX", "77003": "Houston, TX",
  "85001": "Phoenix, AZ", "85002": "Phoenix, AZ", "85003": "Phoenix, AZ",
};

const RISK_COLOR = { high: B.danger, medium: B.warning, low: B.ok };
const RISK_BG    = { high: B.dangerBg, medium: B.warningBg, low: B.okBg };
const RISK_LABEL = { high: "⚠ HIGH CONCERN", medium: "● DETECTED", low: "✓ WITHIN LIMITS" };

function getRiskScore(contaminants) {
  if (!contaminants) return 0;
  return Math.min(100,
    contaminants.filter(c => c.risk === "high").length * 22 +
    contaminants.filter(c => c.risk === "medium").length * 11 + 10
  );
}

// ─── RISK GAUGE (Animated with count-up) ─────────────────────────────────────
function RiskGauge({ score, animated }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!animated) { setDisplay(score); return; }
    let s = 0;
    const inc = Math.ceil(score / 75);
    const t = setInterval(() => {
      s += inc;
      if (s >= score) { setDisplay(score); clearInterval(t); }
      else setDisplay(s);
    }, 20);
    return () => clearInterval(t);
  }, [score, animated]);
  
  const angle = (display / 100) * 180 - 90;
  const color = display > 66 ? B.danger : display > 33 ? B.warning : B.ok;
  const label = display > 66 ? "HIGH RISK" : display > 33 ? "MODERATE" : "LOW RISK";
  
  return (
    <div style={{ position: "relative", width: 150, height: 85, margin: "0 auto" }}>
      <svg width="150" height="85" viewBox="0 0 150 85">
        <path d="M 12 78 A 63 63 0 0 1 138 78" fill="none" stroke="#1A3A5F" strokeWidth="10" strokeLinecap="round"/>
        <path d="M 12 78 A 63 63 0 0 1 50 20" fill="none" stroke={B.ok} strokeWidth="10" strokeLinecap="round" opacity="0.7"/>
        <path d="M 50 20 A 63 63 0 0 1 100 20" fill="none" stroke={B.warning} strokeWidth="10" strokeLinecap="round" opacity="0.7"/>
        <path d="M 100 20 A 63 63 0 0 1 138 78" fill="none" stroke={B.danger} strokeWidth="10" strokeLinecap="round" opacity="0.7"/>
        <line
          x1="75" y1="78"
          x2={75 + 48 * Math.cos((angle - 90) * Math.PI / 180)}
          y2={78 + 48 * Math.sin((angle - 90) * Math.PI / 180)}
          stroke={color} strokeWidth="2.5" strokeLinecap="round"
          style={{ transition: animated ? "all 0.02s linear" : "none" }}
        />
        <circle cx="75" cy="78" r="5" fill={color}/>
        <circle cx="75" cy="78" r="9" fill={color} opacity="0.2"/>
      </svg>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>{display}</div>
        <div style={{ fontSize: 8, fontWeight: 800, color, letterSpacing: "1.5px" }}>{label}</div>
      </div>
    </div>
  );
}

// ─── WTR HUB FILTER ANIMATION ─────────────────────────────────────────────────
function WTRHubAnimation({ contaminants, active }) {
  const [step, setStep] = useState(0);
  const [pidx, setPidx] = useState(0);
  const stages = [
    { id: "CP",  label: "CP Filter",   color: B.blue,    desc: "Sediment & Carbon" },
    { id: "RO",  label: "RO Membrane", color: B.blueDark,desc: "0.0001μ Filtration" },
    { id: "TC",  label: "TC Carbon",   color: "#1A6B99", desc: "Final Polish" },
    { id: "ALK", label: "Alkaline",    color: B.ok,      desc: "Mineral Infusion" },
  ];
  const removed = contaminants?.filter(c => c.removed) || [];
  
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      setStep(s => (s + 1) % stages.length);
      setPidx(p => (p + 1) % Math.max(removed.length, 1));
    }, 1400);
    return () => clearInterval(t);
  }, [active, removed.length, stages.length]);
  
  const current = removed[pidx];
  
  return (
    <div style={{ padding: "8px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 10 }}>
        <div style={{ textAlign: "center", minWidth: 40 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", margin: "0 auto 3px", background: "linear-gradient(135deg,#4A2C0A,#7B4A1E)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🚰</div>
          <div style={{ fontSize: 7, color: B.gray }}>TAP</div>
        </div>
        <div style={{ color: B.border, fontSize: 12, margin: "0 2px", paddingBottom: 14 }}>→</div>
        {stages.map((s, i) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, margin: "0 auto 3px", background: step === i ? `linear-gradient(135deg,${s.color},${s.color}cc)` : B.lightGray, border: `2px solid ${step === i ? s.color : B.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 900, color: step === i ? "#fff" : s.color, transition: "all 0.4s", boxShadow: step === i ? `0 0 12px ${s.color}55` : "none" }}>{s.id}</div>
              <div style={{ fontSize: 7, color: step === i ? s.color : B.gray, whiteSpace: "nowrap" }}>{s.desc}</div>
            </div>
            {i < stages.length - 1 && <div style={{ color: B.border, fontSize: 11, margin: "0 2px", paddingBottom: 14 }}>→</div>}
          </div>
        ))}
        <div style={{ color: B.border, fontSize: 12, margin: "0 2px", paddingBottom: 14 }}>→</div>
        <div style={{ textAlign: "center", minWidth: 40 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", margin: "0 auto 3px", background: `linear-gradient(135deg,${B.blue},${B.blueDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, animation: "pulse 2s ease-in-out infinite" }}>✨</div>
          <div style={{ fontSize: 7, color: B.blue, fontWeight: 800 }}>PURE</div>
        </div>
      </div>
      {current && active && (
        <div style={{ background: RISK_BG[current.risk], border: `1px solid ${RISK_COLOR[current.risk]}33`, borderRadius: 8, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, animation: "fadeSlideIn 0.4s ease" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: RISK_COLOR[current.risk], flexShrink: 0, boxShadow: `0 0 6px ${RISK_COLOR[current.risk]}` }}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#1A202C" }}>Now Removing: <span style={{ color: RISK_COLOR[current.risk] }}>{current.name}</span></div>
            <div style={{ fontSize: 9, color: B.gray, marginTop: 1 }}>{current.detail?.split(".")[0]}</div>
          </div>
          <div style={{ background: B.ok, color: "#fff", fontSize: 8, fontWeight: 900, padding: "2px 7px", borderRadius: 20 }}>99%+ OUT</div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 5, marginTop: 8 }}>
        {[["1,000+","Contaminants"],["99%+","PFAS"],["99%+","Heavy Metals"],["9+ pH","Alkaline"]].map(([v,l]) => (
          <div key={v} style={{ background: B.blueLight, borderRadius: 6, padding: "7px 3px", textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: B.blue, lineHeight: 1 }}>{v}</div>
            <div style={{ fontSize: 7, color: B.gray, marginTop: 1 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BOTTLE SCAN ──────────────────────────────────────────────────────────────
function BottleScanView({ onBridge }) {
  const [mode, setMode] = useState("intro");
  const [scanProgress, setScanProgress] = useState(0);
  const [brand, setBrand] = useState(null);
  const [manual, setManual] = useState("");

  function simulateScan() {
    setMode("scanning");
    setScanProgress(0);
    let p = 0;
    const t = setInterval(() => {
      p += 3;
      setScanProgress(p);
      if (p >= 100) {
        clearInterval(t);
        const keys = Object.keys(BOTTLE_BRANDS);
        setBrand({ name: keys[Math.floor(Math.random() * keys.length)], ...BOTTLE_BRANDS[keys[Math.floor(Math.random() * keys.length)]] });
        setMode("result");
      }
    }, 50);
  }

  function lookupBrand(input) {
    const key = Object.keys(BOTTLE_BRANDS).find(k => input.toLowerCase().includes(k.toLowerCase()));
    const data = key ? { name: key, ...BOTTLE_BRANDS[key] } : { name: input || "Unknown", ...BOTTLE_BRANDS["Evian"] };
    setBrand(data);
    setMode("result");
  }

  if (mode === "intro") return (
    <div style={{ padding: "24px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 44, marginBottom: 10 }}>🔍</div>
      <h3 style={{ fontSize: 18, fontWeight: 900, color: B.navy, marginBottom: 8 }}>Scan Your Bottle</h3>
      <p style={{ fontSize: 12, color: B.gray, lineHeight: 1.6, marginBottom: 20, maxWidth: 300, margin: "0 auto 20px" }}>
        Point your camera at any plastic water bottle barcode — or search by brand — to see exactly what you're drinking.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, maxWidth: 300, margin: "0 auto 20px" }}>
        <button onClick={simulateScan} style={{ background: `linear-gradient(135deg,${B.blue},${B.blueDark})`, color: "#fff", border: "none", padding: "13px 20px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: "0 2px 12px rgba(81,176,230,0.08)" }}>
          📸 Scan Barcode with Camera
        </button>
        <button onClick={() => setMode("manual")} style={{ background: B.white, color: B.blue, border: `1px solid ${B.border}`, padding: "11px 20px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 12px rgba(81,176,230,0.08)" }}>
          🔤 Search by Brand Name
        </button>
      </div>
      <div style={{ fontSize: 10, color: B.gray, marginBottom: 10 }}>QUICK SELECT</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center" }}>
        {Object.keys(BOTTLE_BRANDS).map(b => (
          <button key={b} onClick={() => { setBrand({ name: b, ...BOTTLE_BRANDS[b] }); setMode("result"); }}
            style={{ background: B.lightGray, border: `1px solid ${B.border}`, color: B.navy, padding: "6px 12px", borderRadius: 20, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
            {b}
          </button>
        ))}
      </div>
    </div>
  );

  if (mode === "manual") return (
    <div style={{ padding: "24px 20px", maxWidth: 360, margin: "0 auto" }}>
      <button onClick={() => setMode("intro")} style={{ background: "none", border: "none", color: B.gray, fontSize: 12, cursor: "pointer", marginBottom: 14 }}>← Back</button>
      <h3 style={{ fontSize: 16, fontWeight: 900, color: B.navy, marginBottom: 14 }}>Search by Brand</h3>
      <input value={manual} onChange={e => setManual(e.target.value)} onKeyDown={e => e.key === "Enter" && lookupBrand(manual)}
        placeholder="e.g. Dasani, Fiji, Evian..."
        style={{ width: "100%", padding: "12px 14px", border: `2px solid ${B.blue}`, borderRadius: 10, fontSize: 13, fontFamily: "inherit", color: B.navy, background: B.white, boxSizing: "border-box" }}/>
      <button onClick={() => lookupBrand(manual)} style={{ width: "100%", background: `linear-gradient(135deg,${B.blue},${B.blueDark})`, color: "#fff", border: "none", padding: "12px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", marginTop: 9, boxShadow: "0 2px 12px rgba(81,176,230,0.08)" }}>ANALYZE →</button>
    </div>
  );

  if (mode === "scanning") return (
    <div style={{ padding: "36px 20px", textAlign: "center" }}>
      <div style={{ position: "relative", width: 190, height: 190, margin: "0 auto 18px", background: "#0A0A0A", borderRadius: 14, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 150, height: 110, border: `2px solid ${B.blue}`, borderRadius: 6, position: "relative" }}>
          {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h]) => (
            <div key={`${v}${h}`} style={{ position: "absolute", [v]: -2, [h]: -2, width: 18, height: 18, [`border${v.charAt(0).toUpperCase()+v.slice(1)}`]: `3px solid ${B.blue}`, [`border${h.charAt(0).toUpperCase()+h.slice(1)}`]: `3px solid ${B.blue}` }}/>
          ))}
          <div style={{ position: "absolute", top: `${scanProgress}%`, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${B.blue},transparent)`, boxShadow: `0 0 8px ${B.blue}`, transition: "top 0.05s linear" }}/>
        </div>
        <div style={{ position: "absolute", bottom: 7, left: 0, right: 0, fontSize: 9, color: B.blue, fontWeight: 700, letterSpacing: "1px" }}>SCANNING BARCODE...</div>
      </div>
      <div style={{ background: B.blueLight, borderRadius: 6, height: 5, maxWidth: 190, margin: "0 auto 10px", overflow: "hidden" }}>
        <div style={{ background: `linear-gradient(90deg,${B.blue},${B.blueDark})`, height: "100%", width: `${scanProgress}%`, transition: "width 0.05s linear", borderRadius: 6 }}/>
      </div>
      <div style={{ fontSize: 12, color: B.gray }}>Identifying barcode... {scanProgress}%</div>
    </div>
  );

  if (mode === "result" && brand) {
    const rc = brand.score > 66 ? B.danger : brand.score > 33 ? B.warning : B.ok;
    return (
      <div style={{ padding: "16px 20px" }}>
        <button onClick={() => { setMode("intro"); setBrand(null); }} style={{ background: "none", border: "none", color: B.gray, fontSize: 12, cursor: "pointer", marginBottom: 12 }}>← Scan Another</button>
        <div style={{ background: `linear-gradient(135deg,${B.navy},${B.navyMid})`, borderRadius: 16, padding: "18px", marginBottom: 12, color: B.white, boxShadow: "0 2px 12px rgba(81,176,230,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 9, color: B.blue, letterSpacing: "2px", marginBottom: 3 }}>BOTTLE ANALYSIS</div>
              <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 3 }}>{brand.name}</div>
              <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 8 }}>Source: {brand.origin}</div>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ fontSize: 10, color: "#CBD5E1" }}>TDS: <strong style={{ color: B.blue }}>{brand.tds}</strong></span>
                <span style={{ fontSize: 10, color: "#CBD5E1" }}>pH: <strong style={{ color: B.blue }}>{brand.ph}</strong></span>
                <span style={{ fontSize: 10, color: "#CBD5E1" }}>F⁻: <strong style={{ color: B.blue }}>{brand.fluoride}</strong></span>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 34, fontWeight: 900, color: rc, lineHeight: 1 }}>{brand.score}</div>
              <div style={{ fontSize: 8, color: rc, fontWeight: 700, letterSpacing: "1px" }}>RISK SCORE</div>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7, marginBottom: 12 }}>
          {[
            { label: "Microplastics", val: brand.microplastics, bad: ["HIGH","VERY HIGH"] },
            { label: "PFAS Risk", val: brand.pfas_risk, bad: ["HIGH","VERY HIGH"] },
            { label: "pH Level", val: String(brand.ph), bad: [] },
          ].map(item => {
            const bad = item.bad.includes(item.val);
            return (
              <div key={item.label} style={{ background: bad ? B.dangerBg : B.okBg, border: `1px solid ${bad ? B.danger : B.ok}33`, borderRadius: 10, padding: "10px 6px", textAlign: "center", boxShadow: "0 2px 12px rgba(81,176,230,0.06)" }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: bad ? B.danger : B.ok }}>{item.val}</div>
                <div style={{ fontSize: 8, color: B.gray, marginTop: 2 }}>{item.label}</div>
              </div>
            );
          })}
        </div>
        <div style={{ background: B.dangerBg, border: `1px solid ${B.danger}33`, borderLeft: `3px solid ${B.danger}`, borderRadius: 10, padding: "12px", margin