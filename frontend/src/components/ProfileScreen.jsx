import { useState, useEffect, useRef, useCallback } from "react";

// ── Colors ────────────────────────────────────────────────────────────
const C = {
  white:"#FFFFFF", bg:"#F8FAFB", border:"#E8EEF2",
  blue:"#51B0E6", blueDark:"#2A8FCA", blueLight:"#EDF6FC",
  body:"#1A2535", muted:"#6B7A8D",
  green:"#1E8A4C", warning:"#F29423", danger:"#D93025", orange:"#E07020",
};

const API_BASE = 'https://generosity-sales-engine-mvp-api.onrender.com';
const SERVICE_TOKEN = '3b56aff84e17fc6b369adb1906549f10af6d4776b392b2ec843aaba958ccd102';
const DASHBOARD_BASE = 'https://generosity-dashboard.vercel.app';

// ── Stroke-based SVG icons (matching nav bar / app style) ─────────────
function PIcon({ name, size = 16, color = "#6B7A8D" }) {
  const s = size, ic = color;
  const icons = {
    user: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={ic} strokeWidth="1.5"/><path d="M4 20C4 17 7.58 14 12 14C16.42 14 20 17 20 20" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/></svg>,
    ruler: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke={ic} strokeWidth="1.5"/><line x1="7" y1="5" x2="7" y2="10" stroke={ic} strokeWidth="1.2" strokeLinecap="round"/><line x1="11" y1="5" x2="11" y2="8" stroke={ic} strokeWidth="1.2" strokeLinecap="round"/><line x1="15" y1="5" x2="15" y2="10" stroke={ic} strokeWidth="1.2" strokeLinecap="round"/></svg>,
    activity: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="4" r="2" stroke={ic} strokeWidth="1.4"/><path d="M14 10L17 22M10 10L7 22M9 10H15L16 14H8L9 10Z" stroke={ic} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    droplet: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 3C12 3 6 10 6 14C6 17.31 8.69 20 12 20C15.31 20 18 17.31 18 14C18 10 12 3 12 3Z" stroke={ic} strokeWidth="1.5" fill={`${ic}15`}/></svg>,
    watch: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="6" y="6" width="12" height="12" rx="3" stroke={ic} strokeWidth="1.5"/><path d="M9 6V3H15V6M9 18V21H15V18" stroke={ic} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke={ic} strokeWidth="1.2"/></svg>,
    ring: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="13" r="7" stroke={ic} strokeWidth="1.5"/><path d="M9 6L12 2L15 6" stroke={ic} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    bolt: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M13 2L4 14H12L11 22L20 10H12L13 2Z" stroke={ic} strokeWidth="1.5" strokeLinejoin="round"/></svg>,
    target: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={ic} strokeWidth="1.5"/><circle cx="12" cy="12" r="5" stroke={ic} strokeWidth="1.3"/><circle cx="12" cy="12" r="1.5" fill={ic}/></svg>,
    heart: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 21C12 21 4 15 4 9.5C4 6.46 6.46 4 9.5 4C10.96 4 12.26 4.66 12 5.5C11.74 4.66 13.04 4 14.5 4C17.54 4 20 6.46 20 9.5C20 15 12 21 12 21Z" stroke={ic} strokeWidth="1.5" strokeLinejoin="round"/></svg>,
    brain: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 2C9 2 6 4 6 7C4 7 3 9 3 11C3 13 4 15 6 15C6 18 9 20 12 20C15 20 18 18 18 15C20 15 21 13 21 11C21 9 20 7 18 7C18 4 15 2 12 2Z" stroke={ic} strokeWidth="1.5"/><path d="M12 2V20" stroke={ic} strokeWidth="1.2" strokeDasharray="2 2"/></svg>,
    dumbbell: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M6 7V17M18 7V17M3 9V15M21 9V15M6 12H18" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/><rect x="4" y="7" width="4" height="10" rx="1" stroke={ic} strokeWidth="1.2"/><rect x="16" y="7" width="4" height="10" rx="1" stroke={ic} strokeWidth="1.2"/></svg>,
    snowflake: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><line x1="12" y1="2" x2="12" y2="22" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/><line x1="2" y1="12" x2="22" y2="12" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/><line x1="5" y1="5" x2="19" y2="19" stroke={ic} strokeWidth="1.3" strokeLinecap="round"/><line x1="19" y1="5" x2="5" y2="19" stroke={ic} strokeWidth="1.3" strokeLinecap="round"/></svg>,
    sun: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke={ic} strokeWidth="1.5"/><path d="M12 2V5M12 19V22M2 12H5M19 12H22M4.93 4.93L7.05 7.05M16.95 16.95L19.07 19.07M4.93 19.07L7.05 16.95M16.95 7.05L19.07 4.93" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/></svg>,
    flame: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 2C12 2 8 8 8 13C8 15.21 9.79 17 12 17C14.21 17 16 15.21 16 13C16 8 12 2 12 2Z" stroke={ic} strokeWidth="1.5"/><path d="M12 22C8 22 5 19 5 15C5 11 9 7 9 7C9 7 10 11 12 13C14 11 15 7 15 7C15 7 19 11 19 15C19 19 16 22 12 22Z" stroke={ic} strokeWidth="1.5"/></svg>,
    thermometer: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 2C10.34 2 9 3.34 9 5V14.26C7.8 15.08 7 16.44 7 18C7 20.76 9.24 23 12 23C14.76 23 17 20.76 17 18C17 16.44 16.2 15.08 15 14.26V5C15 3.34 13.66 2 12 2Z" stroke={ic} strokeWidth="1.5"/><circle cx="12" cy="18" r="2" fill={ic}/></svg>,
    shield: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6V11C4 16.5 7.5 21.25 12 22.5C16.5 21.25 20 16.5 20 11V6L12 2Z" stroke={ic} strokeWidth="1.5" strokeLinejoin="round"/><path d="M9 12L11 14L15 10" stroke={ic} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    sunCloud: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="10" cy="8" r="3" stroke={ic} strokeWidth="1.5"/><path d="M10 3V4M4 8H5M15 8H16M6 4L7 5M14 4L13 5" stroke={ic} strokeWidth="1.3" strokeLinecap="round"/><path d="M6 18H17C19.21 18 21 16.21 21 14C21 12.14 19.72 10.57 18 10.13C17.94 7.83 16.07 6 13.75 6C12.46 6 11.32 6.6 10.58 7.54" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/></svg>,
    loader: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/></svg>,
    check: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={ic} strokeWidth="1.5"/><path d="M8 12L11 15L16 9" stroke={ic} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    chevronDown: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke={ic} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    chevronUp: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M6 15L12 9L18 15" stroke={ic} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  };
  return <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",verticalAlign:"middle"}}>{icons[name]||null}</span>;
}

// ── Mock Oura data (fallback when CORS blocks real API) ──────────────
function mockOuraData() {
  return {
    readiness_score: 84, sleep_score: 78, sleep_total_hours: 7.2,
    sleep_efficiency: 88, sleep_deep_pct: 22, sleep_rem_pct: 18,
    hrv_avg: 45, hrv_balance: 72, body_temp_deviation: 0.1,
    resting_heart_rate: 58, activity_score: 71, active_calories: 420,
    steps: 8400, recovery_index: 82,
  };
}

// ── Real Oura Ring API v2 connection ─────────────────────────────────
async function connectOura() {
  let token = null;
  try { token = localStorage.getItem('oura_pat'); } catch(e) {}

  if (!token) {
    token = prompt('Enter your Oura Ring Personal Access Token\n\nGet one at: https://cloud.ouraring.com/personal-access-tokens');
    if (!token) return null;
    try { localStorage.setItem('oura_pat', token.trim()); } catch(e) {}
  }

  try {
    // Use backend proxy to avoid CORS
    const proxyRes = await fetch(`${DASHBOARD_BASE}/api/wtr/oura-proxy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oura_token: token }),
    });

    if (!proxyRes.ok) {
      const err = await proxyRes.json().catch(() => ({}));
      if (proxyRes.status === 401 || err.error?.includes('Invalid')) {
        localStorage.removeItem('oura_pat');
        return { error: 'Invalid token. Please reconnect.' };
      }
      throw new Error(err.error || 'Proxy failed');
    }

    const data = await proxyRes.json();
    if (!data.ok || !data.metrics) throw new Error('No data returned');

    return { connected: true, metrics: data.metrics, ts: new Date().toISOString(), source: data.source || 'oura_api_v2' };
  } catch (err) {
    console.error('[Oura] Proxy fetch failed:', err.message);
    // Fallback to mock data for demo
    return { connected: true, metrics: mockOuraData(), ts: new Date().toISOString(), source: 'demo_fallback' };
  }
}

// ── Enhanced NHS Score calculation (with biometric inputs) ───────────
function calcNHS(p, intake, biometrics) {
  const bio = biometrics || {};
  const wkg     = p.weightUnit === "lbs" ? (parseFloat(p.weight)||0)*0.453592 : (parseFloat(p.weight)||0);
  const actAdd  = {sedentary:0, light:0.35, moderate:0.7, active:1.1, athlete:1.5}[p.activity] || 0;
  const cliAdd  = {cool:0, mild:0.2, warm:0.4, hot:0.6, extreme:1.0}[p.climate] || 0;
  let target  = wkg * 0.033 + actAdd + cliAdd;

  // Biometric adjustments
  if (bio.hrv_avg) {
    if (bio.hrv_avg < 30) target += 0.4;
    else if (bio.hrv_avg < 40) target += 0.2;
  }
  if (bio.sleep_score) {
    if (bio.sleep_score < 60) target += 0.3;
    else if (bio.sleep_score < 70) target += 0.15;
  }
  if (bio.body_temp_deviation && bio.body_temp_deviation > 0.5) {
    target += 0.2;
  }
  if (bio.recovery_index && bio.recovery_index < 60) {
    target += 0.15;
  }
  if (bio.active_calories && bio.active_calories > 500) {
    target += (bio.active_calories - 500) / 1000;
  }

  if (target <= 0) return { score:0, target:2.0, effective:0, adjustments:[], bioBonus:0 };

  const absMap  = { hub:1.0, filtered:0.92, tap:0.75, coffee:0.6, sports:0.85, other:0.7 };
  const totalIn = Object.entries(intake).reduce((s,[k,v]) => s + (parseFloat(v)||0)*(absMap[k]||0.8), 0);
  const eai     = (parseFloat(intake.hub)||0) > 0 ? 0.10 : 0;

  const sweat   = {none:0, light:0.3, moderate:0.6, intense:1.0}[p.exercise] || 0;
  const loss    = sweat * (parseFloat(p.exerciseMins)||0)/60 * wkg * 0.012 + 0.5;
  const effective = Math.max(0, Math.round((totalIn - loss*0.3 + eai)*100)/100);

  // Biometric data quality bonus
  let bioBonus = 0;
  if (bio.hrv_avg) bioBonus += 2;
  if (bio.sleep_score) bioBonus += 2;
  if (bio.readiness_score) bioBonus += 1;

  const rawScore = Math.round((effective / target) * 100) + bioBonus;
  const score   = Math.min(100, Math.max(0, rawScore));

  const adjustments = [];
  if (bio.hrv_avg) adjustments.push({ label: 'HRV', value: bio.hrv_avg, impact: bio.hrv_avg < 40 ? '+0.2L needed' : 'Normal' });
  if (bio.sleep_score) adjustments.push({ label: 'Sleep', value: bio.sleep_score, impact: bio.sleep_score < 70 ? '+0.15L needed' : 'Normal' });
  if (bio.recovery_index) adjustments.push({ label: 'Recovery', value: bio.recovery_index, impact: bio.recovery_index < 60 ? '+0.15L needed' : 'Normal' });

  return { score, target: Math.round(target*100)/100, effective, adjustments, bioBonus };
}

function nhsColor(s) {
  if (s>=90) return C.green;
  if (s>=70) return C.blue;
  if (s>=50) return C.warning;
  if (s>=30) return C.orange;
  return C.danger;
}
function nhsLabel(s) {
  if (s>=90) return "Optimal";
  if (s>=70) return "Good";
  if (s>=50) return "Moderate";
  if (s>=30) return "Low";
  return "Dehydrated";
}

// ── NHS Ring ──────────────────────────────────────────────────────────
function NHSRing({ score, target, effective, bioBonus }) {
  const R=80, SW=14, SIZE=200, CX=100, CY=100;
  const circ = 2*Math.PI*R;
  const fill = (score/100)*circ;
  const col  = nhsColor(score);

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
      <div style={{position:"relative",width:SIZE,height:SIZE}}>
        <div style={{position:"absolute",inset:24,borderRadius:"50%",background:`radial-gradient(circle,${col}18 0%,transparent 70%)`,filter:"blur(14px)",transition:"background 0.8s",pointerEvents:"none"}}/>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <circle cx={CX} cy={CY} r={R} fill="none" stroke={C.border} strokeWidth={SW}/>
          <circle cx={CX} cy={CY} r={R} fill="none" stroke={`${col}35`} strokeWidth={SW+10}
            strokeLinecap="round" strokeDasharray={`${fill} ${circ}`}
            transform={`rotate(-90 ${CX} ${CY})`}
            style={{transition:"stroke-dasharray 1s cubic-bezier(0.34,1.56,0.64,1),stroke 0.8s",filter:"blur(6px)"}}/>
          <circle cx={CX} cy={CY} r={R} fill="none" stroke={col} strokeWidth={SW}
            strokeLinecap="round" strokeDasharray={`${fill} ${circ}`}
            transform={`rotate(-90 ${CX} ${CY})`}
            style={{transition:"stroke-dasharray 1s cubic-bezier(0.34,1.56,0.64,1),stroke 0.8s"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
          <div style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:2}}>NHS Score</div>
          <div style={{fontSize:50,fontWeight:900,color:col,fontFamily:"Nunito,sans-serif",letterSpacing:-2,lineHeight:1,transition:"color 0.8s"}}>{score}</div>
          <div style={{fontSize:12,fontWeight:700,color:col,marginTop:2,transition:"color 0.8s"}}>{nhsLabel(score)}</div>
          {bioBonus > 0 && (
            <div style={{fontSize:9,fontWeight:600,color:C.green,marginTop:4,background:`${C.green}12`,padding:"2px 8px",borderRadius:8}}>
              +{bioBonus} bio bonus
            </div>
          )}
        </div>
      </div>

      {/* Target / Effective row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,width:"100%"}}>
        {[
          {label:"Daily Target", value:`${target}L`, color:C.body},
          {label:"Effective Intake", value:`${effective}L`, color:col},
        ].map(({label,value,color})=>(
          <div key={label} style={{textAlign:"center",padding:"10px 0",background:C.bg,borderRadius:14,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>{label}</div>
            <div style={{fontSize:18,fontWeight:800,color,fontFamily:"Nunito,sans-serif"}}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Biometric insight row helper ─────────────────────────────────────
function bioColor(label, value) {
  if (value == null) return C.muted;
  switch (label) {
    case 'HRV':        return value >= 50 ? C.green : value >= 35 ? C.warning : C.danger;
    case 'Sleep':      return value >= 80 ? C.green : value >= 65 ? C.warning : C.danger;
    case 'Readiness':  return value >= 80 ? C.green : value >= 65 ? C.warning : C.danger;
    case 'Recovery':   return value >= 75 ? C.green : value >= 55 ? C.warning : C.danger;
    case 'Calories':   return C.blue;
    case 'Resting HR': return value <= 60 ? C.green : value <= 75 ? C.warning : C.danger;
    default:           return C.muted;
  }
}
function bioLabel(label, value) {
  if (value == null) return "\u2014";
  const col = bioColor(label, value);
  if (col === C.green) return "Optimal";
  if (col === C.warning) return "Fair";
  return "Low";
}

// ── Simple field components ───────────────────────────────────────────
function Label({children}) {
  return <div style={{fontSize:13,fontWeight:700,color:C.body,marginBottom:7,letterSpacing:0.1}}>{children}</div>;
}

function TextInput({value,onChange,placeholder,type="text",unit,disabled}) {
  const [focused,setFocused]=useState(false);
  return (
    <div style={{position:"relative"}}>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{
          width:"100%", padding: unit?"12px 44px 12px 14px":"12px 14px",
          fontSize:15, fontWeight:600, color:C.body,
          background: disabled ? C.bg : C.white, border:`1.5px solid ${focused?C.blue:C.border}`,
          borderRadius:12, outline:"none", fontFamily:"Nunito Sans,sans-serif",
          boxShadow: focused?`0 0 0 3px ${C.blue}18`:"none",
          transition:"border-color 0.2s, box-shadow 0.2s", WebkitAppearance:"none",
          opacity: disabled ? 0.7 : 1,
        }}/>
      {unit && <span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:12,fontWeight:700,color:C.muted,pointerEvents:"none"}}>{unit}</span>}
    </div>
  );
}

function Chips({value,onChange,options,disabled}) {
  return (
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      {options.map(([v,l])=>(
        <button key={v} onClick={()=>!disabled&&onChange(v)} style={{
          padding:"8px 16px", borderRadius:20,
          border:`1.5px solid ${value===v?C.blue:C.border}`,
          background: value===v?C.blueLight:C.white,
          color: value===v?C.blue:C.muted,
          fontSize:13, fontWeight: value===v?700:500,
          cursor: disabled?"default":"pointer", transition:"all 0.18s",
          boxShadow: value===v?`0 2px 8px ${C.blue}25`:"none",
          opacity: disabled ? 0.7 : 1,
        }}>{l}</button>
      ))}
    </div>
  );
}

function SectionTitle({icon,text,children}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
      <div style={{width:36,height:36,borderRadius:10,background:C.blueLight,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <PIcon name={icon} size={18} color={C.blue}/>
      </div>
      <div style={{flex:1,fontSize:16,fontWeight:800,color:C.body,letterSpacing:-0.2}}>{text}</div>
      {children}
    </div>
  );
}

// ── Collapsible Section ───────────────────────────────────────────────
function CollapsibleSection({ icon, text, defaultOpen, children, badge }) {
  const [open, setOpen] = useState(defaultOpen !== false);
  return (
    <div style={{background:C.white,borderRadius:20,border:`1px solid ${C.border}`,overflow:"hidden",transition:"all 0.3s"}}>
      <button onClick={()=>setOpen(v=>!v)} style={{
        width:"100%",display:"flex",alignItems:"center",gap:10,padding:"16px 20px",
        background:"transparent",border:"none",cursor:"pointer",textAlign:"left",
      }}>
        <div style={{width:36,height:36,borderRadius:10,background:C.blueLight,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <PIcon name={icon} size={18} color={C.blue}/>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:800,color:C.body,letterSpacing:-0.2}}>{text}</div>
          {badge && <div style={{fontSize:11,color:C.muted,marginTop:1}}>{badge}</div>}
        </div>
        <PIcon name={open?"chevronUp":"chevronDown"} size={18} color={C.muted}/>
      </button>
      {open && (
        <div style={{padding:"0 20px 20px",animation:"fadeIn 0.2s ease"}}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Wearable device data ──────────────────────────────────────────────
const WEARABLES = [
  {id:"apple",   name:"Apple Watch",    iconName:"watch",    color:"#1D1D1F", desc:"HealthKit \u00B7 Activity \u00B7 HRV"},
  {id:"oura",    name:"Oura Ring",      iconName:"ring",     color:"#2D2D2D", desc:"Sleep \u00B7 Readiness \u00B7 HRV"},
  {id:"whoop",   name:"WHOOP",          iconName:"bolt",     color:"#00C07F", colorText:"#000", desc:"Recovery \u00B7 Strain \u00B7 Sleep"},
  {id:"google",  name:"Google Fit",     iconName:"target",   color:"#4285F4", desc:"Steps \u00B7 Heart Rate \u00B7 Activity"},
  {id:"samsung", name:"Samsung Health", iconName:"loader",   color:"#1428A0", desc:"Steps \u00B7 Sleep \u00B7 Stress"},
  {id:"hume",    name:"Hume AI",        iconName:"brain",    color:"#7C3AED", desc:"Stress \u00B7 Emotional Wellbeing"},
  {id:"bodyfit", name:"Body Fit AI",    iconName:"dumbbell", color:"#059669", desc:"Body Composition \u00B7 VO2 Max"},
];

async function simulateConnect(id) {
  await new Promise(r=>setTimeout(r, 1400));
  const mockMetrics = {
    apple:   {heart_rate:68, active_cal:420, exercise_min:35, hrv:52},
    whoop:   {recovery:76, strain:8.4, sleep_pct:82, hrv:58},
    google:  {steps:8420, heart_rate:72, active_min:48, calories:380},
    samsung: {steps:7200, heart_rate:70, sleep:"7.5h", stress:38},
    hume:    {stress_index:28, wellbeing:81, valence:0.72},
    bodyfit: {body_fat:"18.2%", muscle_mass:"61.4kg", vo2_max:44},
  };
  return { connected:true, metrics: mockMetrics[id]||{}, ts: new Date().toISOString() };
}

// ── Wearable Card ─────────────────────────────────────────────────────
function WearableCard({w, status, onToggle}) {
  const [loading,setLoading]=useState(false);
  const [open,setOpen]=useState(false);
  const on = status?.connected;

  const handle = async () => {
    if (on) {
      // Disconnect: clear stored Oura token when disconnecting Oura
      if (w.id === 'oura') {
        try { localStorage.removeItem('oura_pat'); } catch(e) {}
      }
      onToggle(w.id, null);
      return;
    }
    setLoading(true);
    let res;
    if (w.id === 'oura') {
      res = await connectOura();
    } else {
      res = await simulateConnect(w.id);
    }
    setLoading(false);
    if (res?.error) {
      alert(res.error);
      return;
    }
    if (res) onToggle(w.id, res);
  };

  return (
    <div data-testid={`wearable-${w.id}`} style={{
      background:C.white, borderRadius:18,
      border:`1.5px solid ${on?w.color+"50":C.border}`,
      boxShadow: on?`0 2px 16px ${w.color}18`:"none",
      overflow:"hidden", transition:"all 0.3s",
    }}>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px"}}>
        <div style={{
          width:44, height:44, borderRadius:12, flexShrink:0,
          background: on?w.color:C.bg,
          border: on?"none":`1.5px solid ${C.border}`,
          display:"flex",alignItems:"center",justifyContent:"center",
          transition:"background 0.3s",
        }}>
          {loading?<PIcon name="loader" size={20} color={C.muted}/>:<PIcon name={w.iconName} size={20} color={on?"#fff":w.color}/>}
        </div>

        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontSize:14,fontWeight:800,color:C.body}}>{w.name}</span>
            {on&&<span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:10,background:`${w.color}18`,color:w.color,border:`1px solid ${w.color}30`,letterSpacing:0.8,textTransform:"uppercase"}}>{status?.source === 'oura_api_v2' ? 'Live' : status?.source === 'demo_fallback' ? 'Demo' : 'Live'}</span>}
          </div>
          <div style={{fontSize:12,color:C.muted,marginTop:1}}>{w.desc}</div>

        </div>

        <div style={{display:"flex",flexDirection:"column",gap:5,alignItems:"flex-end"}}>
          <button onClick={handle} disabled={loading} data-testid={`wearable-${w.id}-btn`} style={{
            padding:"9px 16px", borderRadius:12, border:"none",
            background: loading?C.bg : on?`${C.danger}15`:`linear-gradient(135deg,${w.color},${w.color}CC)`,
            color: loading?C.muted : on?C.danger:(w.colorText||"#fff"),
            fontSize:12, fontWeight:800, cursor:loading?"not-allowed":"pointer",
            boxShadow: (!loading&&!on)?`0 3px 10px ${w.color}40`:"none",
            transition:"all 0.2s", whiteSpace:"nowrap",
          }}>
            {loading?"Connecting\u2026": on?"Disconnect":"Connect"}
          </button>
          {on&&(
            <button onClick={()=>setOpen(v=>!v)} data-testid={`wearable-${w.id}-toggle`} style={{fontSize:11,fontWeight:600,color:w.color,background:"transparent",border:"none",cursor:"pointer",padding:"2px 0"}}>
              {open?"Hide data \u2191":"View data \u2193"}
            </button>
          )}
        </div>
      </div>

      {on&&open&&status?.metrics&&(
        <div style={{borderTop:`1px solid ${C.border}`,padding:"12px 16px",background:C.bg}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {Object.entries(status.metrics).filter(([,v]) => v != null).map(([k,v])=>(
              <div key={k} style={{background:C.white,borderRadius:10,padding:"9px 12px",border:`1px solid ${w.color}20`}}>
                <div style={{fontSize:9,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:3}}>{k.replace(/_/g," ")}</div>
                <div style={{fontSize:17,fontWeight:800,color:w.color,fontFamily:"Nunito,sans-serif"}}>{typeof v==="number"?v.toFixed(v%1?1:0):v}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:10,padding:"9px 12px",background:`${C.blue}10`,borderRadius:10,border:`1px solid ${C.blue}20`,fontSize:11,color:C.blueDark,fontWeight:600,lineHeight:1.5}}>
            These metrics feed your Net Hydration Score in real time.
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────
export default function ProfileScreen({ onClose }) {
  // Profile saved state — tracks whether user has a stored tenant
  const [profileSaved, setProfileSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [justCreated, setJustCreated] = useState(false);
  const nhsDebounceRef = useRef(null);

  // Persist profile to localStorage
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('wtr_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          firstName:"", lastName:"", email:"",
          age:"", gender:"",
          height:"", heightUnit:"ft",
          weight:"", weightUnit:"lbs",
          activity:"moderate",
          exercise:"moderate",
          exerciseMins:"45",
          climate:"mild",
          ...parsed,
        };
      }
    } catch(e) {}
    return {
      firstName:"", lastName:"", email:"",
      age:"", gender:"",
      height:"", heightUnit:"ft",
      weight:"", weightUnit:"lbs",
      activity:"moderate",
      exercise:"moderate",
      exerciseMins:"45",
      climate:"mild",
    };
  });

  // Persist intake to localStorage
  const [intake, setIntake] = useState(() => {
    try {
      const saved = localStorage.getItem('wtr_intake');
      if (saved) return { hub:"1.5", filtered:"0", tap:"0", coffee:"0.4", sports:"0", other:"0", ...JSON.parse(saved) };
    } catch(e) {}
    return { hub:"1.5", filtered:"0", tap:"0", coffee:"0.4", sports:"0", other:"0" };
  });

  const [wearables, setWearables] = useState({});
  const [biometrics, setBiometrics] = useState({});
  const [nhs, setNhs] = useState({score:0, target:2.0, effective:0, adjustments:[], bioBonus:0});

  const setP = (k,v) => setProfile(p=>({...p,[k]:v}));
  const setI = (k,v) => setIntake(i=>({...i,[k]:v}));

  // Persist profile changes
  useEffect(() => {
    try { localStorage.setItem('wtr_profile', JSON.stringify(profile)); } catch(e) {}
  }, [profile]);

  // Persist intake changes
  useEffect(() => {
    try { localStorage.setItem('wtr_intake', JSON.stringify(intake)); } catch(e) {}
  }, [intake]);

  // ── Auto-fetch existing profile on mount ─────────────────────────
  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      const email = profile.email?.trim();
      if (!email) { setLoadingProfile(false); return; }
      try {
        const res = await fetch(`${API_BASE}/api/wtr/profile?email=${encodeURIComponent(email)}`, {
          headers: { 'Authorization': `Bearer ${SERVICE_TOKEN}` },
        });
        if (!res.ok) { setLoadingProfile(false); return; }
        const data = await res.json();
        if (!cancelled && data.ok && data.profile) {
          const p = data.profile;
          setProfile(prev => ({
            ...prev,
            firstName: p.first_name || prev.firstName,
            lastName: p.last_name || prev.lastName,
            email: p.email || prev.email,
            age: p.age ? String(p.age) : prev.age,
            gender: p.gender || prev.gender,
            height: p.height || prev.height,
            heightUnit: p.height_unit || prev.heightUnit,
            weight: p.weight || prev.weight,
            weightUnit: p.weight_unit || prev.weightUnit,
            activity: p.activity || prev.activity,
            exercise: p.exercise || prev.exercise,
            exerciseMins: p.exercise_mins || prev.exerciseMins,
            climate: p.climate || prev.climate,
          }));
          if (p.intake && typeof p.intake === 'object') {
            setIntake(prev => ({ ...prev, ...p.intake }));
          }
          setProfileSaved(true);
        }
      } catch(err) {
        console.error('[Profile] Fetch error:', err.message);
      }
      if (!cancelled) setLoadingProfile(false);
    };
    fetchProfile();
    return () => { cancelled = true; };
  }, []); // profile.email read once on mount

  // Auto-connect Oura on mount if token exists (fetches fresh data every time)
  useEffect(() => {
    let cancelled = false;
    const autoFetch = async () => {
      let token = null;
      try { token = localStorage.getItem('oura_pat'); } catch(e) {}
      if (!token) return;
      const res = await connectOura();
      if (!cancelled && res && !res.error) {
        setWearables(s => ({ ...s, oura: res }));
      }
    };
    autoFetch();
    // Refresh every 5 minutes
    const interval = setInterval(autoFetch, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  // Merge wearable metrics into biometrics
  useEffect(() => {
    const merged = {};
    Object.values(wearables).forEach(w => {
      if (w?.connected && w?.metrics) {
        Object.entries(w.metrics).forEach(([k,v]) => {
          if (v != null) merged[k] = v;
        });
      }
    });
    setBiometrics(merged);
  }, [wearables]);

  // BMI
  const bmi = (() => {
    if (!profile.height||!profile.weight) return null;
    let hm;
    if (profile.heightUnit==="ft") {
      const ft = parseInt(profile.height)||0;
      const inch = parseInt((profile.height.split(".")||[])[1])||0;
      hm=(ft*12+inch)*0.0254;
    } else { hm=parseFloat(profile.height)/100; }
    const wkg=profile.weightUnit==="lbs"?parseFloat(profile.weight)*0.453592:parseFloat(profile.weight);
    if (!hm||!wkg) return null;
    return Math.round((wkg/(hm*hm))*10)/10;
  })();
  const bmiLabel = bmi?(bmi<18.5?"Underweight":bmi<25?"Healthy":bmi<30?"Overweight":"Obese"):null;
  const bmiColor = bmi?(bmi<18.5?C.warning:bmi<25?C.green:bmi<30?C.warning:C.danger):C.muted;

  // Live NHS with biometrics
  useEffect(()=>{ setNhs(calcNHS(profile,intake,biometrics)); },[profile,intake,biometrics]);

  // ── Debounced NHS auto-save (only when profile already saved) ────
  const debouncedNhsSave = useCallback((nhsData, intakeData, email) => {
    if (!email || !profileSaved) return;
    if (nhsDebounceRef.current) clearTimeout(nhsDebounceRef.current);
    nhsDebounceRef.current = setTimeout(async () => {
      try {
        await fetch(`${API_BASE}/api/wtr/profile/nhs`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SERVICE_TOKEN}` },
          body: JSON.stringify({
            email,
            nhs_score: nhsData.score,
            nhs_target: nhsData.target,
            nhs_effective: nhsData.effective,
            nhs_bio_bonus: nhsData.bioBonus,
            intake: intakeData,
          }),
        });
      } catch(err) {
        console.error('[Profile] NHS auto-save failed:', err.message);
      }
    }, 2000);
  }, [profileSaved]);

  useEffect(() => {
    if (profileSaved && profile.email) {
      debouncedNhsSave(nhs, intake, profile.email);
    }
  }, [nhs, intake, profileSaved, profile.email, debouncedNhsSave]);

  const connectedCount = Object.values(wearables).filter(w=>w?.connected).length;
  const hasBiometrics = Object.keys(biometrics).length > 0;

  // ── Save Profile handler (creates tenant) ────────────────────────
  const handleSaveProfile = async () => {
    // Validate required fields
    if (!profile.firstName?.trim()) { setSaveError('First name is required'); return; }
    if (!profile.lastName?.trim()) { setSaveError('Last name is required'); return; }
    if (!profile.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      setSaveError('Valid email is required'); return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const res = await fetch(`${API_BASE}/api/wtr/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SERVICE_TOKEN}` },
        body: JSON.stringify({
          email: profile.email.trim().toLowerCase(),
          first_name: profile.firstName.trim(),
          last_name: profile.lastName.trim(),
          age: profile.age || null,
          gender: profile.gender || null,
          height: profile.height || null,
          height_unit: profile.heightUnit,
          weight: profile.weight || null,
          weight_unit: profile.weightUnit,
          activity: profile.activity,
          exercise: profile.exercise,
          exercise_mins: profile.exerciseMins,
          climate: profile.climate,
          intake,
          nhs_score: nhs.score,
          nhs_target: nhs.target,
          nhs_effective: nhs.effective,
          nhs_bio_bonus: nhs.bioBonus,
          wearables: Object.fromEntries(
            Object.entries(wearables)
              .filter(([,v]) => v?.connected)
              .map(([k,v]) => [k, { connected: true, source: v.source, ts: v.ts }])
          ),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setSaveError(data.error || 'Save failed');
        setSaving(false);
        return;
      }

      setProfileSaved(true);
      if (data.isNew) setJustCreated(true);
      setSaving(false);

      // Clear justCreated after 5 seconds
      if (data.isNew) {
        setTimeout(() => setJustCreated(false), 5000);
      }

    } catch (err) {
      console.error('[Profile] Save error:', err.message);
      setSaveError('Network error. Please try again.');
      setSaving(false);
    }
  };

  // ── Profile summary badge for collapsed sections ─────────────────
  const personalInfoBadge = profileSaved
    ? `${profile.firstName} ${profile.lastName} \u00B7 ${profile.email}`
    : null;
  const bodyMetricsBadge = profileSaved && profile.height && profile.weight
    ? `${profile.height}${profile.heightUnit} \u00B7 ${profile.weight}${profile.weightUnit}${bmi ? ` \u00B7 BMI ${bmi}` : ''}`
    : null;
  const activityBadge = profileSaved
    ? `${profile.activity} \u00B7 ${profile.climate}`
    : null;

  // Show loading state
  if (loadingProfile) {
    return (
      <div style={{fontFamily:"Nunito Sans,-apple-system,sans-serif",background:C.white,minHeight:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{textAlign:"center"}}>
          <div style={{width:40,height:40,border:`3px solid ${C.border}`,borderTopColor:C.blue,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 12px"}}/>
          <div style={{fontSize:14,color:C.muted,fontWeight:600}}>Loading profile...</div>
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="profile-screen" style={{fontFamily:"Nunito Sans,-apple-system,sans-serif",background:C.white,minHeight:"100%",color:C.body,display:"flex",flexDirection:"column",maxWidth:480,margin:"0 auto",WebkitFontSmoothing:"antialiased"}}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Nunito+Sans:wght@400;600;700&display=swap" rel="stylesheet"/>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} *{box-sizing:border-box;-webkit-tap-highlight-color:transparent} input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none} ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#E8EEF2;border-radius:2px}`}</style>

      {/* Header */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"16px 20px",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(16px)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <img src="/generosity-logo.png" alt="Generosity" style={{height:32,width:"auto"}}/>
            <div>
              <div style={{fontSize:20,fontWeight:900,color:C.body,letterSpacing:-0.5}}>
                {profileSaved ? `Hi, ${profile.firstName}` : 'My Profile'}
              </div>
              {profileSaved && (
                <div style={{fontSize:11,color:C.green,fontWeight:700,display:"flex",alignItems:"center",gap:4,marginTop:1}}>
                  <PIcon name="check" size={12} color={C.green}/> Profile Active
                </div>
              )}
            </div>
          </div>
          <button onClick={onClose} data-testid="profile-close-btn" style={{width:36,height:36,borderRadius:"50%",background:C.bg,border:`1px solid ${C.border}`,fontSize:20,cursor:"pointer",color:C.muted,display:"flex",alignItems:"center",justifyContent:"center"}}>{"\u00D7"}</button>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"20px",display:"flex",flexDirection:"column",gap:24,paddingBottom:40,animation:"fadeIn 0.3s ease"}}>

        {/* Welcome banner for newly created profiles */}
        {justCreated && (
          <div style={{
            background:`linear-gradient(135deg,${C.green}15,${C.green}08)`,
            border:`1.5px solid ${C.green}30`,
            borderRadius:16,padding:"16px 20px",
            display:"flex",alignItems:"center",gap:12,
            animation:"fadeIn 0.3s ease",
          }}>
            <div style={{width:40,height:40,borderRadius:12,background:`${C.green}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <PIcon name="shield" size={20} color={C.green}/>
            </div>
            <div>
              <div style={{fontSize:14,fontWeight:800,color:C.green}}>Profile Created</div>
              <div style={{fontSize:12,color:C.body,marginTop:2}}>Confirmation email sent to {profile.email}</div>
            </div>
          </div>
        )}

        {/* NHS SCORE RING */}
        <div data-testid="nhs-score-section" style={{background:`linear-gradient(160deg,${C.blueLight} 0%,${C.white} 100%)`,borderRadius:24,padding:"28px 20px 22px",border:`1px solid ${C.border}`,textAlign:"center"}}>
          <div style={{fontSize:12,fontWeight:700,color:C.blue,letterSpacing:0.5,marginBottom:2}}>Net Hydration Score{"\u2122"}</div>
          <div style={{fontSize:12,color:C.muted,marginBottom:20}}>
            {profileSaved ? 'Auto-saves as you update intake and biometrics' : 'Updates live as you fill in your profile'}
          </div>
          <NHSRing score={nhs.score} target={nhs.target} effective={nhs.effective} bioBonus={nhs.bioBonus}/>

          {/* Biometric adjustments */}
          {nhs.adjustments && nhs.adjustments.length > 0 && (
            <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${C.border}`}}>
              <div style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:1.2,textTransform:"uppercase",marginBottom:8}}>Biometric Adjustments</div>
              <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
                {nhs.adjustments.map(a=>(
                  <div key={a.label} style={{padding:"5px 12px",borderRadius:10,background:a.impact==="Normal"?`${C.green}10`:`${C.warning}10`,border:`1px solid ${a.impact==="Normal"?C.green:C.warning}25`,fontSize:11,fontWeight:600,color:a.impact==="Normal"?C.green:C.warning}}>
                    {a.label}: {a.value} {"\u00B7"} {a.impact}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* BIOMETRIC INSIGHTS (only when wearable connected) */}
        {hasBiometrics && (
          <div data-testid="biometric-insights-section" style={{background:C.white,borderRadius:20,border:`1px solid ${C.border}`,padding:"20px"}}>
            <SectionTitle icon="heart" text="Biometric Insights"/>
            <div style={{display:"flex",flexDirection:"column",gap:0}}>
              {[
                { label: 'HRV', value: biometrics.hrv_avg, unit: 'ms' },
                { label: 'Sleep', value: biometrics.sleep_score, unit: '/100' },
                { label: 'Readiness', value: biometrics.readiness_score, unit: '/100' },
                { label: 'Recovery', value: biometrics.recovery_index, unit: '/100' },
                { label: 'Calories', value: biometrics.active_calories, unit: 'cal' },
                { label: 'Resting HR', value: biometrics.resting_heart_rate, unit: 'bpm' },
              ].filter(row => row.value != null).map((row, i, arr) => (
                <div key={row.label} style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"11px 0",
                  borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
                }}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:bioColor(row.label, row.value),flexShrink:0}}/>
                    <span style={{fontSize:13,fontWeight:600,color:C.body}}>{row.label}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:15,fontWeight:800,color:C.body,fontFamily:"Nunito,sans-serif"}}>
                      {typeof row.value === 'number' ? (row.value % 1 ? row.value.toFixed(1) : row.value) : row.value}
                    </span>
                    <span style={{fontSize:11,color:C.muted,fontWeight:600}}>{row.unit}</span>
                    <span style={{fontSize:10,fontWeight:700,color:bioColor(row.label, row.value),padding:"2px 7px",borderRadius:8,background:`${bioColor(row.label, row.value)}12`}}>
                      {bioLabel(row.label, row.value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DAILY FLUID INTAKE — always visible */}
        <div data-testid="fluid-intake-section" style={{background:C.white,borderRadius:20,border:`1px solid ${C.border}`,padding:"20px"}}>
          <SectionTitle icon="droplet" text="Today's Fluid Intake"/>
          <div style={{fontSize:12,color:C.muted,marginBottom:16,marginTop:-10}}>Absorption factor adjusts your effective hydration</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{padding:"14px",background:C.blueLight,borderRadius:16,border:`1.5px solid ${C.blue}30`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div>
                  <div style={{fontSize:13,fontWeight:800,color:C.blue}}>Generosity{"\u2122"} Hub Water</div>
                  <div style={{fontSize:11,color:C.muted}}>Pure RO {"\u00B7"} Alkaline {"\u00B7"} Absorption: 1.0{"\u00D7"} + EAI bonus</div>
                </div>
                <span style={{fontSize:9,fontWeight:800,padding:"3px 8px",borderRadius:10,background:C.green,color:"#fff"}}>BEST</span>
              </div>
              <TextInput value={intake.hub} onChange={v=>setI("hub",v)} type="number" placeholder="1.5" unit="L"/>
            </div>
            {[
              ["filtered","Filtered Water","0.92\u00D7 absorption"],
              ["tap",     "Tap Water",     "0.75\u00D7 absorption"],
              ["coffee",  "Coffee / Tea",  "0.60\u00D7 (diuretic offset)"],
              ["sports",  "Sports Drink",  "0.85\u00D7 absorption"],
              ["other",   "Other",         "0.70\u00D7 absorption"],
            ].map(([key,label,hint])=>(
              <div key={key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,padding:"12px 14px",background:C.bg,borderRadius:14,border:`1px solid ${C.border}`}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.body}}>{label}</div>
                  <div style={{fontSize:10,color:C.muted}}>{hint}</div>
                </div>
                <div style={{width:90}}>
                  <TextInput value={intake[key]} onChange={v=>setI(key,v)} type="number" placeholder="0" unit="L"/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PERSONAL INFO — collapsible when profile saved */}
        {profileSaved ? (
          <CollapsibleSection icon="user" text="Personal Info" defaultOpen={false} badge={personalInfoBadge}>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><Label>First Name</Label><TextInput value={profile.firstName} onChange={v=>setP("firstName",v)} placeholder="First"/></div>
                <div><Label>Last Name</Label><TextInput value={profile.lastName} onChange={v=>setP("lastName",v)} placeholder="Last"/></div>
              </div>
              <div><Label>Email</Label><TextInput value={profile.email} onChange={v=>setP("email",v)} placeholder="you@email.com" type="email"/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><Label>Age</Label><TextInput value={profile.age} onChange={v=>setP("age",v)} placeholder="30" type="number" unit="yrs"/></div>
                <div>
                  <Label>Biological Sex</Label>
                  <Chips value={profile.gender} onChange={v=>setP("gender",v)} options={[["male","Male"],["female","Female"],["other","Other"]]}/>
                </div>
              </div>
            </div>
          </CollapsibleSection>
        ) : (
          <div data-testid="personal-info-section" style={{background:C.white,borderRadius:20,border:`1px solid ${C.border}`,padding:"20px"}}>
            <SectionTitle icon="user" text="Personal Info"/>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><Label>First Name</Label><TextInput value={profile.firstName} onChange={v=>setP("firstName",v)} placeholder="First"/></div>
                <div><Label>Last Name</Label><TextInput value={profile.lastName} onChange={v=>setP("lastName",v)} placeholder="Last"/></div>
              </div>
              <div><Label>Email</Label><TextInput value={profile.email} onChange={v=>setP("email",v)} placeholder="you@email.com" type="email"/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><Label>Age</Label><TextInput value={profile.age} onChange={v=>setP("age",v)} placeholder="30" type="number" unit="yrs"/></div>
                <div>
                  <Label>Biological Sex</Label>
                  <Chips value={profile.gender} onChange={v=>setP("gender",v)} options={[["male","Male"],["female","Female"],["other","Other"]]}/>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BODY METRICS — collapsible when profile saved */}
        {profileSaved ? (
          <CollapsibleSection icon="ruler" text="Body Metrics" defaultOpen={false} badge={bodyMetricsBadge}>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                  <span style={{fontSize:13,fontWeight:700,color:C.body}}>Height</span>
                  <div style={{display:"flex",gap:4}}>
                    {[["ft","ft \u00B7 in"],["cm","cm"]].map(([v,l])=>(
                      <button key={v} onClick={()=>setP("heightUnit",v)} style={{padding:"4px 10px",borderRadius:10,border:`1px solid ${profile.heightUnit===v?C.blue:C.border}`,background:profile.heightUnit===v?C.blueLight:C.white,color:profile.heightUnit===v?C.blue:C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>{l}</button>
                    ))}
                  </div>
                </div>
                <TextInput value={profile.height} onChange={v=>setP("height",v)} placeholder={profile.heightUnit==="ft"?"5.11 (5ft 11in)":"180"} type="number" unit={profile.heightUnit==="ft"?"ft.in":"cm"}/>
              </div>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                  <span style={{fontSize:13,fontWeight:700,color:C.body}}>Weight</span>
                  <div style={{display:"flex",gap:4}}>
                    {[["lbs","lbs"],["kg","kg"]].map(([v,l])=>(
                      <button key={v} onClick={()=>setP("weightUnit",v)} style={{padding:"4px 10px",borderRadius:10,border:`1px solid ${profile.weightUnit===v?C.blue:C.border}`,background:profile.weightUnit===v?C.blueLight:C.white,color:profile.weightUnit===v?C.blue:C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>{l}</button>
                    ))}
                  </div>
                </div>
                <TextInput value={profile.weight} onChange={v=>setP("weight",v)} placeholder={profile.weightUnit==="lbs"?"170":"77"} type="number" unit={profile.weightUnit}/>
              </div>
              {bmi&&(
                <div data-testid="bmi-card" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",background:`${bmiColor}10`,borderRadius:14,border:`1px solid ${bmiColor}25`}}>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:0.8,textTransform:"uppercase"}}>BMI</div>
                    <div style={{fontSize:11,color:C.muted}}>Auto-calculated</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:26,fontWeight:900,color:bmiColor,fontFamily:"Nunito,sans-serif",lineHeight:1}}>{bmi}</div>
                    <div style={{fontSize:11,fontWeight:700,color:bmiColor}}>{bmiLabel}</div>
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>
        ) : (
          <div data-testid="body-metrics-section" style={{background:C.white,borderRadius:20,border:`1px solid ${C.border}`,padding:"20px"}}>
            <SectionTitle icon="ruler" text="Body Metrics"/>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                  <span style={{fontSize:13,fontWeight:700,color:C.body}}>Height</span>
                  <div style={{display:"flex",gap:4}}>
                    {[["ft","ft \u00B7 in"],["cm","cm"]].map(([v,l])=>(
                      <button key={v} onClick={()=>setP("heightUnit",v)} data-testid={`height-unit-${v}`} style={{padding:"4px 10px",borderRadius:10,border:`1px solid ${profile.heightUnit===v?C.blue:C.border}`,background:profile.heightUnit===v?C.blueLight:C.white,color:profile.heightUnit===v?C.blue:C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>{l}</button>
                    ))}
                  </div>
                </div>
                <TextInput value={profile.height} onChange={v=>setP("height",v)} placeholder={profile.heightUnit==="ft"?"5.11 (5ft 11in)":"180"} type="number" unit={profile.heightUnit==="ft"?"ft.in":"cm"}/>
              </div>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                  <span style={{fontSize:13,fontWeight:700,color:C.body}}>Weight</span>
                  <div style={{display:"flex",gap:4}}>
                    {[["lbs","lbs"],["kg","kg"]].map(([v,l])=>(
                      <button key={v} onClick={()=>setP("weightUnit",v)} data-testid={`weight-unit-${v}`} style={{padding:"4px 10px",borderRadius:10,border:`1px solid ${profile.weightUnit===v?C.blue:C.border}`,background:profile.weightUnit===v?C.blueLight:C.white,color:profile.weightUnit===v?C.blue:C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>{l}</button>
                    ))}
                  </div>
                </div>
                <TextInput value={profile.weight} onChange={v=>setP("weight",v)} placeholder={profile.weightUnit==="lbs"?"170":"77"} type="number" unit={profile.weightUnit}/>
              </div>
              {bmi&&(
                <div data-testid="bmi-card" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",background:`${bmiColor}10`,borderRadius:14,border:`1px solid ${bmiColor}25`}}>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:0.8,textTransform:"uppercase"}}>BMI</div>
                    <div style={{fontSize:11,color:C.muted}}>Auto-calculated</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:26,fontWeight:900,color:bmiColor,fontFamily:"Nunito,sans-serif",lineHeight:1}}>{bmi}</div>
                    <div style={{fontSize:11,fontWeight:700,color:bmiColor}}>{bmiLabel}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ACTIVITY & CLIMATE — collapsible when profile saved */}
        {profileSaved ? (
          <CollapsibleSection icon="activity" text="Activity & Climate" defaultOpen={false} badge={activityBadge}>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div>
                <Label>Daily Activity Level</Label>
                <Chips value={profile.activity} onChange={v=>setP("activity",v)} options={[
                  ["sedentary","Sedentary"],["light","Light"],
                  ["moderate","Moderate"],["active","Active"],["athlete","Athlete"],
                ]}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <Label>Today's Exercise</Label>
                  <Chips value={profile.exercise} onChange={v=>setP("exercise",v)} options={[["none","None"],["light","Light"],["moderate","Moderate"],["intense","Intense"]]}/>
                </div>
                <div><Label>Duration</Label><TextInput value={profile.exerciseMins} onChange={v=>setP("exerciseMins",v)} type="number" placeholder="45" unit="min"/></div>
              </div>
              <div>
                <Label>Climate / Region Temp</Label>
                <Chips value={profile.climate} onChange={v=>setP("climate",v)} options={[
                  ["cool","Cool"],["mild","Mild"],
                  ["warm","Warm"],["hot","Hot"],["extreme","Extreme"],
                ]}/>
              </div>
            </div>
          </CollapsibleSection>
        ) : (
          <div data-testid="activity-section" style={{background:C.white,borderRadius:20,border:`1px solid ${C.border}`,padding:"20px"}}>
            <SectionTitle icon="activity" text="Activity & Climate"/>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div>
                <Label>Daily Activity Level</Label>
                <Chips value={profile.activity} onChange={v=>setP("activity",v)} options={[
                  ["sedentary","Sedentary"],["light","Light"],
                  ["moderate","Moderate"],["active","Active"],["athlete","Athlete"],
                ]}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <Label>Today's Exercise</Label>
                  <Chips value={profile.exercise} onChange={v=>setP("exercise",v)} options={[["none","None"],["light","Light"],["moderate","Moderate"],["intense","Intense"]]}/>
                </div>
                <div><Label>Duration</Label><TextInput value={profile.exerciseMins} onChange={v=>setP("exerciseMins",v)} type="number" placeholder="45" unit="min"/></div>
              </div>
              <div>
                <Label>Climate / Region Temp</Label>
                <Chips value={profile.climate} onChange={v=>setP("climate",v)} options={[
                  ["cool","Cool"],["mild","Mild"],
                  ["warm","Warm"],["hot","Hot"],["extreme","Extreme"],
                ]}/>
              </div>
            </div>
          </div>
        )}

        {/* WEARABLES */}
        <div data-testid="wearables-section">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:"#7C3AED18",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <PIcon name="watch" size={18} color="#7C3AED"/>
              </div>
              <div>
                <div style={{fontSize:16,fontWeight:800,color:C.body}}>Connect Wearables</div>
                <div style={{fontSize:12,color:C.muted}}>Live biometrics feed your NHS score</div>
              </div>
            </div>
            {connectedCount>0&&(
              <div style={{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,background:`${C.green}15`,color:C.green,border:`1px solid ${C.green}30`}}>
                {connectedCount} connected
              </div>
            )}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {WEARABLES.map(w=>(
              <WearableCard key={w.id} w={w}
                status={wearables[w.id]}
                onToggle={(id,res)=>setWearables(s=>({...s,[id]:res}))}/>
            ))}
          </div>
        </div>

        {/* Error message */}
        {saveError && (
          <div style={{padding:"12px 16px",background:`${C.danger}10`,border:`1.5px solid ${C.danger}25`,borderRadius:12,fontSize:13,fontWeight:600,color:C.danger,textAlign:"center"}}>
            {saveError}
          </div>
        )}

        {/* Save / Update button */}
        <button onClick={handleSaveProfile} disabled={saving} data-testid="profile-save-btn" style={{
          width:"100%", padding:"17px 0",
          background: saving ? C.bg : `linear-gradient(135deg,${C.blue},${C.blueDark})`,
          color: saving ? C.muted : "#fff", border:"none", borderRadius:16,
          fontSize:16, fontWeight:800, cursor: saving ? "not-allowed" : "pointer",
          boxShadow: saving ? "none" : `0 6px 24px ${C.blue}45`,
          letterSpacing:0.2, transition:"all 0.2s",
          display:"flex", alignItems:"center", justifyContent:"center", gap:8,
        }}>
          {saving ? (
            <>
              <div style={{width:18,height:18,border:`2px solid ${C.muted}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
              Saving...
            </>
          ) : profileSaved ? (
            'Update Profile'
          ) : (
            'Save Profile'
          )}
        </button>

        <div style={{textAlign:"center",fontSize:11,color:C.muted}}>
          {profileSaved
            ? 'Your NHS score auto-saves as you check in. Expand sections above to edit profile details.'
            : 'Your data is securely stored and used to calculate your personalized NHS Score'}
        </div>

      </div>
    </div>
  );
}
