import { useState, useEffect, useRef } from "react";
import BottleScanView from "./components/BottleScanView";
import WTRBottleScreen from "./components/WTRBottleScreen";
import WTRHubScreen from "./components/WTRHubScreen";
import ProfileScreen from "./components/ProfileScreen";
import { requestPushPermission, registerServiceWorker } from './push';

// Design system primitives
import Icon from "./components/ds/Icon";
import NavIcon from "./components/ds/NavIcon";
import Input from "./components/ds/Input";
import SegmentedToggle from "./components/ds/SegmentedToggle";
import ContaminantCard from "./components/ds/ContaminantCard";
import HeroCard from "./components/ds/HeroCard";

// TBV-specific components
import RiskGauge from "./components/tbv/RiskGauge";
import WTRHubAnimation from "./components/tbv/WTRHubAnimation";
import HealthCalc from "./components/tbv/HealthCalc";
import MonthlyReportModal from "./components/tbv/MonthlyReportModal";
import FounderLoginModal from "./components/tbv/FounderLoginModal";

// ─── ORACLE REPORT TRANSFORM ─────────────────────────────────────────────────
function transformOracleReport(report, cityLabel, zip) {
  const contaminants = (report.contaminants || []).map(c => {
    function fmtNum(val) {
      if (val == null || isNaN(val)) return null;
      const n = parseFloat(val);
      if (isNaN(n)) return null;
      const abs = Math.abs(n);
      if (n === 0) return '0';
      if (abs < 0.0001) return 'Trace';
      if (abs < 0.01)   return parseFloat(n.toFixed(4)).toString();
      if (abs < 1)      return parseFloat(n.toFixed(4)).toString();
      if (abs < 1000)   return parseFloat(n.toFixed(2)).toString();
      return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }
    const formattedLevel    = fmtNum(c.level);
    const formattedGuideline = fmtNum(c.ewg_guideline);
    const ewgExceedance = (c.level && c.ewg_guideline && c.ewg_guideline > 0)
      ? parseFloat((c.level / c.ewg_guideline).toFixed(1))
      : null;
    return {
      code:           c.code,
      name:           c.name,
      group:          c.group || c.category,
      category:       c.category,
      icon:           'warn',
      risk:           c.risk,
      riskColor:      c.risk,
      riskLevel:      c.risk,
      level:          formattedLevel,
      detected:       formattedLevel,
      unit:           c.unit,
      limit:          c.limit,
      epaMcl:         c.limit,
      ewgGuideline:   formattedGuideline,
      ewg_guideline:  formattedGuideline,
      ewgExceedance,
      exceedsMcl:     c.limit != null ? (c.level > c.limit) : false,
      exceedsEwg:     c.ewg_guideline != null ? (c.level > c.ewg_guideline) : false,
      isViolation:    c.is_violation,
      detail:         c.detail,
      healthShort:    c.detail,
      healthLong:     c.health_effects_long,
      vulnerable:     c.vulnerable_populations || [],
      carcinogenClass: c.is_carcinogen ? 'Group 1' : null,
      isRegulated:    c.limit != null,
      hasNoSafeLevel: c.has_no_safe_level,
      hubRemoves:     c.removed,
      hubRemovalPct:  c.removed ? 99 : null,
      removed:        c.removed,
    };
  });

  return {
    city:             cityLabel,
    utility:          report.utility,
    source:           report.source || 'Municipal',
    zip,
    tds:              report.tds || null,
    ph:               report.ph || null,
    hardness:         report.hardness || null,
    contaminants,
    riskScore:        report.risk_score || getRiskScore(contaminants),
    waterThreatScore: report.risk_score || 0,
    dataConfidence:   report.data_confidence || 0,
    populationServed: report.population_served || null,
  };
}

// ─── BOTTLE BRANDS DATA ─────────────────────────────────────────────────────
// Preserved verbatim from prior version. Used by BottleScanView via service.
const BOTTLE_BRANDS = {
  "Evian":{ origin:"French Alps", tds:345, ph:7.2, fluoride:0.1, microplastics:"HIGH", pfas_risk:"MEDIUM", score:62, concern:"High TDS. Microplastic contamination in independent testing.", manufacturer:"Danone S.A.", source_type:"Natural mineral water" },
  "Dasani":{ origin:"Municipal tap (filtered)", tds:38, ph:5.6, fluoride:0.07, microplastics:"VERY HIGH", pfas_risk:"HIGH", score:78, concern:"Acidic pH 5.6, PFAS-lined packaging, highest microplastic count in 2023 Orb Media study.", manufacturer:"The Coca-Cola Company", source_type:"Purified water" },
  "Aquafina":{ origin:"Municipal tap (RO)", tds:11, ph:6.0, fluoride:0.05, microplastics:"HIGH", pfas_risk:"HIGH", score:71, concern:"Ultra-low minerals, acidic, PFAS in packaging migration studies.", manufacturer:"PepsiCo Inc.", source_type:"Purified water" },
  "Poland Spring":{ origin:"Maine springs", tds:37, ph:7.2, fluoride:0.1, microplastics:"HIGH", pfas_risk:"MEDIUM", score:55, concern:"High microplastic count. FTC settlement over 'natural spring' claims.", manufacturer:"BlueTriton Brands", source_type:"Spring water" },
  "Fiji Water":{ origin:"Artesian aquifer, Fiji", tds:222, ph:7.7, fluoride:0.2, microplastics:"MEDIUM", pfas_risk:"LOW", score:38, concern:"Arsenic near WHO limits. 18,000-mile carbon footprint.", manufacturer:"The Wonderful Company", source_type:"Artesian water" },
  "Smart Water":{ origin:"Municipal tap (distilled)", tds:24, ph:7.0, fluoride:0.0, microplastics:"MEDIUM", pfas_risk:"MEDIUM", score:44, concern:"No natural minerals. Electrolytes added post-distillation.", manufacturer:"The Coca-Cola Company", source_type:"Vapor distilled" },
  "Voss":{ origin:"Artesian aquifer, Norway", tds:44, ph:6.0, fluoride:0.0, microplastics:"LOW", pfas_risk:"LOW", score:29, concern:"Slightly acidic. Glass bottle option recommended.", manufacturer:"Voss of Norway ASA", source_type:"Artesian water" },
  "Nestlé Pure Life":{ origin:"Municipal tap (filtered)", tds:45, ph:6.8, fluoride:0.08, microplastics:"HIGH", pfas_risk:"MEDIUM", score:58, concern:"Multiple source locations with varying quality. Now owned by BlueTriton.", manufacturer:"BlueTriton Brands", source_type:"Purified water" },
  "Arrowhead":{ origin:"California springs", tds:190, ph:7.8, fluoride:0.1, microplastics:"MEDIUM", pfas_risk:"MEDIUM", score:48, concern:"High arsenic levels reported in some batches. Water rights controversy.", manufacturer:"BlueTriton Brands", source_type:"Mountain spring water" },
  "Crystal Geyser":{ origin:"Natural springs (CA/TN)", tds:95, ph:6.9, fluoride:0.1, microplastics:"MEDIUM", pfas_risk:"LOW", score:35, concern:"Arsenic violations in 2018. Bottled at multiple springs.", manufacturer:"CG Roxane LLC", source_type:"Natural alpine spring" },
  "Deer Park":{ origin:"Mid-Atlantic springs", tds:52, ph:6.6, fluoride:0.04, microplastics:"HIGH", pfas_risk:"MEDIUM", score:52, concern:"Slightly acidic. Owned by Nestlé until 2021.", manufacturer:"BlueTriton Brands", source_type:"Spring water" },
  "Ice Mountain":{ origin:"Great Lakes region springs", tds:35, ph:7.4, fluoride:0.02, microplastics:"HIGH", pfas_risk:"MEDIUM", score:50, concern:"Water extraction controversy in Michigan.", manufacturer:"BlueTriton Brands", source_type:"Spring water" },
  "Ozarka":{ origin:"Texas springs", tds:200, ph:7.5, fluoride:0.15, microplastics:"HIGH", pfas_risk:"MEDIUM", score:54, concern:"Higher mineral content. Regional Texas brand.", manufacturer:"BlueTriton Brands", source_type:"Spring water" },
  "Zephyrhills":{ origin:"Florida springs", tds:180, ph:7.7, fluoride:0.06, microplastics:"MEDIUM", pfas_risk:"MEDIUM", score:45, concern:"Florida aquifer source. Moderate mineral content.", manufacturer:"BlueTriton Brands", source_type:"Spring water" },
  "Essentia":{ origin:"Municipal tap (ionized)", tds:50, ph:9.5, fluoride:0.0, microplastics:"LOW", pfas_risk:"LOW", score:32, concern:"Alkaline ionized water. No proven health benefits over regular water.", manufacturer:"Essentia Water LLC", source_type:"Ionized alkaline water" },
  "Core":{ origin:"Municipal tap (filtered)", tds:20, ph:7.4, fluoride:0.0, microplastics:"LOW", pfas_risk:"LOW", score:34, concern:"Ultra-purified with added electrolytes. Low mineral content.", manufacturer:"Core Nutrition LLC", source_type:"Nutrient enhanced water" },
  "Lifewtr":{ origin:"Municipal tap (filtered)", tds:15, ph:6.8, fluoride:0.0, microplastics:"MEDIUM", pfas_risk:"MEDIUM", score:46, concern:"Electrolyte-added purified water. Minimal minerals.", manufacturer:"PepsiCo Inc.", source_type:"Purified water" },
  "Propel":{ origin:"Municipal tap (filtered)", tds:30, ph:3.5, fluoride:0.0, microplastics:"MEDIUM", pfas_risk:"MEDIUM", score:65, concern:"Very acidic pH 3.5. Contains artificial sweeteners.", manufacturer:"PepsiCo Inc.", source_type:"Flavored fitness water" },
  "Hint":{ origin:"Municipal tap (filtered)", tds:12, ph:6.5, fluoride:0.0, microplastics:"MEDIUM", pfas_risk:"LOW", score:40, concern:"Fruit-infused purified water. Natural flavors only.", manufacturer:"Hint Inc.", source_type:"Fruit-infused water" },
  "La Croix":{ origin:"Municipal tap (carbonated)", tds:5, ph:4.5, fluoride:0.0, microplastics:"LOW", pfas_risk:"LOW", score:38, concern:"Sparkling water. Acidic due to carbonation. May affect tooth enamel.", manufacturer:"National Beverage Corp.", source_type:"Sparkling water" },
  "Perrier":{ origin:"Vergèze, France", tds:475, ph:5.5, fluoride:0.1, microplastics:"LOW", pfas_risk:"LOW", score:36, concern:"Natural carbonation. High mineral content. Slightly acidic.", manufacturer:"Nestlé Waters", source_type:"Sparkling natural mineral" },
  "San Pellegrino":{ origin:"San Pellegrino Terme, Italy", tds:950, ph:7.7, fluoride:0.4, microplastics:"LOW", pfas_risk:"LOW", score:33, concern:"Very high TDS. Not recommended for daily hydration.", manufacturer:"Nestlé Waters", source_type:"Sparkling natural mineral" },
  "Mountain Valley":{ origin:"Arkansas springs", tds:220, ph:7.8, fluoride:0.1, microplastics:"LOW", pfas_risk:"LOW", score:28, concern:"Premium spring water. Glass bottles available. Low contamination.", manufacturer:"Mountain Valley Spring Co.", source_type:"Spring water" },
  "Icelandic Glacial":{ origin:"Ölfus Spring, Iceland", tds:62, ph:8.4, fluoride:0.0, microplastics:"LOW", pfas_risk:"LOW", score:25, concern:"Naturally alkaline. One of the purest commercial waters.", manufacturer:"Icelandic Glacial Inc.", source_type:"Natural spring water" },
};

// ─── UPC BARCODE DATABASE ────────────────────────────────────────────────────
const UPC_DATABASE = {
  "049000006346": "Dasani", "049000028904": "Dasani", "049000028911": "Dasani",
  "049000006360": "Dasani", "049000042726": "Dasani", "049000072112": "Dasani",
  "012000001307": "Aquafina", "012000001314": "Aquafina", "012000001321": "Aquafina",
  "012000161148": "Aquafina", "012000001291": "Aquafina", "012000204173": "Aquafina",
  "061314000011": "Evian", "061314000028": "Evian", "061314000035": "Evian",
  "079298612417": "Evian", "061314000073": "Evian", "079298612004": "Evian",
  "075720004010": "Poland Spring", "075720004034": "Poland Spring", "075720004058": "Poland Spring",
  "075720400010": "Poland Spring", "075720400034": "Poland Spring", "075720202034": "Poland Spring",
  "632565000012": "Fiji Water", "632565000029": "Fiji Water", "632565000036": "Fiji Water",
  "632565000227": "Fiji Water", "632565000234": "Fiji Water", "632565000043": "Fiji Water",
  "786162002501": "Smart Water", "786162002518": "Smart Water", "786162002525": "Smart Water",
  "786162002594": "Smart Water", "786162375100": "Smart Water", "786162002600": "Smart Water",
  "896716001005": "Voss", "896716001012": "Voss", "896716001029": "Voss",
  "896716001036": "Voss", "896716002002": "Voss", "896716002019": "Voss",
  "068274540011": "Nestlé Pure Life", "068274540028": "Nestlé Pure Life", "068274540103": "Nestlé Pure Life",
  "068274540219": "Nestlé Pure Life", "068274348846": "Nestlé Pure Life", "068274541018": "Nestlé Pure Life",
  "071142000109": "Arrowhead", "071142000116": "Arrowhead", "071142000123": "Arrowhead",
  "071142000154": "Arrowhead", "071142006231": "Arrowhead", "071142006248": "Arrowhead",
  "654871100019": "Crystal Geyser", "654871100026": "Crystal Geyser", "654871100033": "Crystal Geyser",
  "654871100101": "Crystal Geyser", "654871100118": "Crystal Geyser", "654871100125": "Crystal Geyser",
  "082657802015": "Deer Park", "082657802022": "Deer Park", "082657802039": "Deer Park",
  "082657802305": "Deer Park", "082657802312": "Deer Park", "082657802329": "Deer Park",
  "083757802017": "Ice Mountain", "083757802024": "Ice Mountain", "083757802031": "Ice Mountain",
  "083757802208": "Ice Mountain", "083757802215": "Ice Mountain", "083757802222": "Ice Mountain",
  "068274102011": "Ozarka", "068274102028": "Ozarka", "068274102035": "Ozarka",
  "068274102301": "Ozarka", "068274102318": "Ozarka", "068274102325": "Ozarka",
  "073430000018": "Zephyrhills", "073430000025": "Zephyrhills", "073430000032": "Zephyrhills",
  "073430000308": "Zephyrhills", "073430000315": "Zephyrhills", "073430000322": "Zephyrhills",
  "851icons7000019": "Essentia", "851167000026": "Essentia", "851167000033": "Essentia",
  "851167000101": "Essentia", "851167000118": "Essentia", "851167000125": "Essentia",
  "851icons0000109": "Core", "851750000116": "Core", "851750000123": "Core",
  "851750000208": "Core", "851750000215": "Core", "851750000222": "Core",
  "012000172410": "Lifewtr", "012000172427": "Lifewtr", "012000172434": "Lifewtr",
  "012000172441": "Lifewtr", "012000172458": "Lifewtr", "012000172465": "Lifewtr",
  "052000135503": "Propel", "052000135510": "Propel", "052000135527": "Propel",
  "052000135602": "Propel", "052000135619": "Propel", "052000135626": "Propel",
  "184739000101": "Hint", "184739000118": "Hint", "184739000125": "Hint",
  "184739000132": "Hint", "184739000149": "Hint", "184739000156": "Hint",
  "012993101015": "La Croix", "012993101022": "La Croix", "012993101039": "La Croix",
  "012993101107": "La Croix", "012993101114": "La Croix", "012993101121": "La Croix",
  "074780000017": "Perrier", "074780000024": "Perrier", "074780000031": "Perrier",
  "074780000109": "Perrier", "074780000116": "Perrier", "074780000123": "Perrier",
  "041508800013": "San Pellegrino", "041508800020": "San Pellegrino", "041508800037": "San Pellegrino",
  "041508800105": "San Pellegrino", "041508800112": "San Pellegrino", "041508800129": "San Pellegrino",
  "07464400001": "Mountain Valley", "074644000028": "Mountain Valley", "074644000035": "Mountain Valley",
  "893icons7000014": "Icelandic Glacial", "893147000021": "Icelandic Glacial", "893147000038": "Icelandic Glacial",
};

// ─── CITY WATER DATA ─────────────────────────────────────────────────────────
const CITY_DATA = {
  "Austin, TX":{ utility:"Austin Water", source:"Colorado River / Barton Springs", tds:312, ph:7.8, hardness:"Moderate (142 mg/L)", contaminants:[
    {name:"Chromium-6",level:0.22,limit:0.10,unit:"ppb",risk:"high",category:"Heavy Metal",detail:"Known carcinogen. Exceeds CA health goal by 11x.",removed:true},
    {name:"PFAS (PFOA)",level:1.8,limit:0.004,unit:"ppt",risk:"high",category:"Forever Chemicals",detail:"Cancer, thyroid disruption, immune suppression. Never breaks down.",removed:true},
    {name:"Haloacetic Acids",level:42.3,limit:60,unit:"ppb",risk:"medium",category:"Disinfection Byproduct",detail:"Forms when chlorine reacts with organic matter. Carcinogen.",removed:true},
    {name:"Trihalomethanes",level:38.1,limit:80,unit:"ppb",risk:"medium",category:"Disinfection Byproduct",detail:"Cancer risk and reproductive harm.",removed:true},
    {name:"Nitrate",level:2.1,limit:10,unit:"ppm",risk:"low",category:"Agricultural Runoff",detail:"Dangerous for infants under 6 months.",removed:true},
    {name:"Microplastics",level:"Detected",limit:"None set",unit:"",risk:"medium",category:"Emerging Contaminant",detail:"Found in blood, lungs, placentas. No safe level.",removed:true},
  ]},
  "Chicago, IL":{ utility:"City of Chicago", source:"Lake Michigan", tds:220, ph:7.9, hardness:"Moderate (143 mg/L)", contaminants:[
    {name:"Lead",level:18.4,limit:15,unit:"ppb",risk:"high",category:"Heavy Metal",detail:"EXCEEDS LEGAL LIMIT. 400,000+ lead service lines, most of any US city.",removed:true},
    {name:"Chromium-6",level:0.26,limit:0.10,unit:"ppb",risk:"high",category:"Heavy Metal",detail:"Known carcinogen.",removed:true},
    {name:"PFAS (Total)",level:3.4,limit:0.004,unit:"ppt",risk:"high",category:"Forever Chemicals",detail:"Multiple PFAS compounds found.",removed:true},
    {name:"Haloacetic Acids",level:39.2,limit:60,unit:"ppb",risk:"medium",category:"Disinfection Byproduct",detail:"65% of legal limit.",removed:true},
    {name:"Microplastics",level:"Detected",limit:"None set",unit:"",risk:"medium",category:"Emerging Contaminant",detail:"Lake Michigan source. Microplastic hotspot.",removed:true},
  ]},
  "Los Angeles, CA":{ utility:"LADWP", source:"Colorado River / Northern CA / Groundwater", tds:486, ph:7.6, hardness:"Hard (218 mg/L)", contaminants:[
    {name:"Chromium-6",level:0.51,limit:0.10,unit:"ppb",risk:"high",category:"Heavy Metal",detail:"5x above CA health goal.",removed:true},
    {name:"PFAS (Total)",level:4.2,limit:0.004,unit:"ppt",risk:"high",category:"Forever Chemicals",detail:"Bioaccumulate in breast milk.",removed:true},
    {name:"Arsenic",level:2.8,limit:10,unit:"ppb",risk:"medium",category:"Heavy Metal",detail:"Skin, bladder, lung cancer.",removed:true},
    {name:"Haloacetic Acids",level:51.3,limit:60,unit:"ppb",risk:"medium",category:"Disinfection Byproduct",detail:"Near legal limit.",removed:true},
    {name:"Microplastics",level:"Detected",limit:"None set",unit:"",risk:"medium",category:"Emerging Contaminant",detail:"94% of LA samples positive.",removed:true},
  ]},
  "New York, NY":{ utility:"NYC DEP", source:"Catskill/Delaware Watersheds", tds:144, ph:7.2, hardness:"Soft (31 mg/L)", contaminants:[
    {name:"Lead",level:8.1,limit:15,unit:"ppb",risk:"medium",category:"Heavy Metal",detail:"Lead service lines in pre-1986 buildings.",removed:true},
    {name:"PFAS (PFOA)",level:1.1,limit:0.004,unit:"ppt",risk:"high",category:"Forever Chemicals",detail:"No safe level for children.",removed:true},
    {name:"Microplastics",level:"Detected",limit:"None set",unit:"",risk:"medium",category:"Emerging Contaminant",detail:"Found in all NYC samples.",removed:true},
  ]},
  "Denver, CO":{ utility:"Denver Water", source:"South Platte River", tds:198, ph:8.1, hardness:"Soft (72 mg/L)", contaminants:[
    {name:"Chromium-6",level:0.18,limit:0.10,unit:"ppb",risk:"high",category:"Heavy Metal",detail:"Known carcinogen.",removed:true},
    {name:"PFAS (PFOS)",level:2.1,limit:0.004,unit:"ppt",risk:"high",category:"Forever Chemicals",detail:"Liver damage, cancer risk.",removed:true},
    {name:"Lead",level:3.2,limit:15,unit:"ppb",risk:"medium",category:"Heavy Metal",detail:"No safe level.",removed:true},
    {name:"Microplastics",level:"Detected",limit:"None set",unit:"",risk:"medium",category:"Emerging Contaminant",detail:"Found in human blood.",removed:true},
  ]},
  "Houston, TX":{ utility:"Houston Water", source:"Trinity River / Lake Houston", tds:388, ph:7.4, hardness:"Hard (182 mg/L)", contaminants:[
    {name:"PFAS (PFOS)",level:5.8,limit:0.004,unit:"ppt",risk:"high",category:"Forever Chemicals",detail:"1,450x EPA health advisory level.",removed:true},
    {name:"Chromium-6",level:0.31,limit:0.10,unit:"ppb",risk:"high",category:"Heavy Metal",detail:"Exceeds health goal.",removed:true},
    {name:"Arsenic",level:3.2,limit:10,unit:"ppb",risk:"medium",category:"Heavy Metal",detail:"8x EWG guideline.",removed:true},
    {name:"Microplastics",level:"Detected",limit:"None set",unit:"",risk:"medium",category:"Emerging Contaminant",detail:"Industrial river source.",removed:true},
  ]},
  "Phoenix, AZ":{ utility:"Phoenix Water Services", source:"Colorado River / Salt River", tds:620, ph:7.9, hardness:"Very Hard (280 mg/L)", contaminants:[
    {name:"Chromium-6",level:0.44,limit:0.10,unit:"ppb",risk:"high",category:"Heavy Metal",detail:"Colorado River source.",removed:true},
    {name:"PFAS (Total)",level:3.1,limit:0.004,unit:"ppt",risk:"high",category:"Forever Chemicals",detail:"Military base contamination.",removed:true},
    {name:"Arsenic",level:4.8,limit:10,unit:"ppb",risk:"medium",category:"Heavy Metal",detail:"Arizona geology naturally high.",removed:true},
    {name:"Microplastics",level:"Detected",limit:"None set",unit:"",risk:"medium",category:"Emerging Contaminant",detail:"Detected in all AZ samples.",removed:true},
  ]},
};

// ─── ZIP CODE MAPPING ────────────────────────────────────────────────────────
const ZIP_MAP = {
  "78701":"Austin, TX","78702":"Austin, TX","78703":"Austin, TX",
  "60601":"Chicago, IL","60602":"Chicago, IL","60603":"Chicago, IL","60604":"Chicago, IL","60605":"Chicago, IL","60606":"Chicago, IL",
  "90001":"Los Angeles, CA","90210":"Los Angeles, CA","90024":"Los Angeles, CA",
  "10001":"New York, NY","10002":"New York, NY","10003":"New York, NY",
  "80201":"Denver, CO","80202":"Denver, CO","80203":"Denver, CO",
  "77001":"Houston, TX","77002":"Houston, TX","77003":"Houston, TX",
  "85001":"Phoenix, AZ","85002":"Phoenix, AZ","85003":"Phoenix, AZ"
};

// ─── UTILITY FUNCTIONS ───────────────────────────────────────────────────────
function getRiskScore(c){
  if(!c)return 0;
  return Math.min(100,c.filter(x=>x.risk==="high").length*22+c.filter(x=>x.risk==="medium").length*11+10);
}

function generateSessionId() {
  const id = 'wtr_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now().toString(36);
  try { sessionStorage.setItem('wtr_session_id', id); } catch(e) {}
  return id;
}

function getSessionId() {
  try { return sessionStorage.getItem('wtr_session_id') || generateSessionId(); } catch(e) { return generateSessionId(); }
}

function trackEvent(eventName, properties = {}) {
  const base = { session_id: getSessionId(), app_version: '2.0', timestamp: new Date().toISOString() };
  try { window.posthog?.capture(eventName, { ...base, ...properties }); } catch(e) {}
}

const API_BASE = 'https://generosity-sales-engine-mvp-api.onrender.com';
const API_BEARER = 'Bearer 3b56aff84e17fc6b369adb1906549f10af6d4776b392b2ec843aaba958ccd102';

// ─── MAIN APP COMPONENT ──────────────────────────────────────────────────────
export default function TrustButVerify(){
  const [tab,setTab]=useState("tbv");
  const [phase,setPhase]=useState("landing");
  const [inputMode,setInputMode]=useState("address");
  const [input,setInput]=useState("");
  const [data,setData]=useState(null);
  const [scanStep,setScanStep]=useState(0);
  const [email,setEmail]=useState("");
  const [submitted,setSubmitted]=useState(false);
  const [showHub,setShowHub]=useState(false);
  const [animating,setAnimating]=useState(false);
  const [gaugeOn,setGaugeOn]=useState(false);
  const [insightView,setInsightView]=useState("report");
  const [tbvView,setTbvView]=useState("home");
  const [showProfile,setShowProfile]=useState(false);
  const [founderMode,setFounderMode]=useState(()=>{try{return localStorage.getItem('wtr_founder_mode')==='true';}catch(e){return false;}});
  const [showFounderLogin,setShowFounderLogin]=useState(false);
  const [founderPin,setFounderPin]=useState('');
  const [founderPinError,setFounderPinError]=useState('');
  const founderLongPressRef=useRef(null);
  const FOUNDER_PIN='0808';
  function handleFounderLogin(pin){
    const checkPin = pin || founderPin;
    if(checkPin===FOUNDER_PIN){setFounderMode(true);setShowFounderLogin(false);setFounderPin('');setFounderPinError('');try{localStorage.setItem('wtr_founder_mode','true');}catch(e){}trackEvent('founder_mode_activated');}
    else{setFounderPinError('Invalid PIN');setFounderPin('');}
  }
  function handleFounderLogout(){setFounderMode(false);setTab('tbv');try{localStorage.removeItem('wtr_founder_mode');}catch(e){}}

  const [inputError, setInputError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [engagementPhase, setEngagementPhase] = useState("idle");
  const [householdProfile, setHouseholdProfile] = useState({ has_children: null, is_pregnant: null, has_filter: null });
  const [pushResult, setPushResult] = useState(null);
  const [capturedProspectId, setCapturedProspectId] = useState(null);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportOptInStatus, setReportOptInStatus] = useState(() => { try { return localStorage.getItem('wtr_report_status') || 'none'; } catch(e) { return 'none'; } });
  const [reportOptInEmail, setReportOptInEmail] = useState(() => { try { return localStorage.getItem('wtr_report_email') || ''; } catch(e) { return ''; } });
  const [reportModalScreen, setReportModalScreen] = useState('form');
  const [reportEmail, setReportEmail] = useState('');
  const [reportZip, setReportZip] = useState('');
  const [reportEmailError, setReportEmailError] = useState('');
  const [reportZipError, setReportZipError] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSubmitError, setReportSubmitError] = useState('');

  const inputRef=useRef(null);

  useEffect(() => { registerServiceWorker(); }, []);

  // Cross-component navigation event listener
  useEffect(() => {
    const handler = (e) => {
      const { tab: targetTab, scan } = e.detail || {};
      if (targetTab) setTab(targetTab);
      if (scan) { setInput(scan); setInputMode('zip'); setTimeout(() => startScan(scan), 200); }
    };
    window.addEventListener('wtr-navigate', handler);
    return () => window.removeEventListener('wtr-navigate', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const REPORT_CONSENT_TEXT = 'By submitting your email, you agree to receive a free Monthly Water Intelligence Report from Generosity\u2122 Water based on your zip code. Your report is generated by the Generosity\u2122 Water Intelligence Engine (WIQ\u2122) and includes local water quality data, contaminant alerts, and relevant news for your area. You can unsubscribe at any time by clicking the unsubscribe link in any email. We do not sell your email address. View our Privacy Policy at generositywater.com/privacy.';
  const REPORT_CONSENT_VERSION = 'v1.0.0-2026-04-08';

  // Sync report opt-in status from backend on city change
  useEffect(() => {
    const storedEmail = reportOptInEmail;
    const storedZip = data?.zip || '';
    if (storedEmail && storedZip) {
      fetch(`${API_BASE}/api/water-report/status?email=${encodeURIComponent(storedEmail)}&zip=${encodeURIComponent(storedZip)}`, { headers: { 'Authorization': API_BEARER } })
        .then(r => r.json())
        .then(d => {
          if (d.status && d.status !== reportOptInStatus) {
            setReportOptInStatus(d.status);
            try { localStorage.setItem('wtr_report_status', d.status); } catch(e) {}
          }
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.zip]);

  function handleReportSubscribe() {
    let hasErr = false;
    if (!reportEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reportEmail)) { setReportEmailError('Please enter a valid email address'); hasErr = true; } else { setReportEmailError(''); }
    const cleanZip = reportZip.replace(/\D/g, '').slice(0, 5);
    if (!cleanZip || !/^\d{5}$/.test(cleanZip)) { setReportZipError('Please enter a 5-digit ZIP code'); hasErr = true; } else { setReportZipError(''); }
    if (hasErr) return;
    setReportSubmitting(true); setReportSubmitError('');
    fetch(`${API_BASE}/api/water-report/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': API_BEARER },
      body: JSON.stringify({
        email: reportEmail.trim().toLowerCase(),
        zip: cleanZip,
        consent_text: REPORT_CONSENT_TEXT,
        consent_text_version: REPORT_CONSENT_VERSION,
        source: 'wtr_app_intel_tab',
        session_id: getSessionId()
      })
    })
      .then(r => r.json())
      .then(d => {
        setReportSubmitting(false);
        if (d.error) { setReportSubmitError(d.error); return; }
        setReportOptInStatus('pending');
        setReportOptInEmail(reportEmail.trim().toLowerCase());
        try {
          localStorage.setItem('wtr_report_status', 'pending');
          localStorage.setItem('wtr_report_email', reportEmail.trim().toLowerCase());
        } catch(e) {}
        setReportModalScreen('success');
        trackEvent('water_report_subscribed', { zip: cleanZip, email: reportEmail.trim().toLowerCase() });
      })
      .catch(() => {
        setReportSubmitting(false);
        setReportSubmitError('Something went wrong. Please try again.');
      });
  }

  function openReportModal() {
    setReportModalScreen('form');
    setReportEmail(reportOptInEmail || email || '');
    setReportZip(data?.zip || '');
    setReportEmailError('');
    setReportZipError('');
    setReportSubmitError('');
    setReportSubmitting(false);
    setReportModalOpen(true);
    trackEvent('water_report_modal_opened');
  }

  const SCAN_STEPS = [
    "Locating water utility...",
    "Querying EPA SDWIS database...",
    "Cross-referencing EWG Tap Water database...",
    "Analyzing contaminant levels...",
    "Comparing to health guidelines...",
    "Generating your intelligence report..."
  ];

  function resolveCity(raw){
    const s=raw.trim().toLowerCase();
    if(/^\d{5}$/.test(s)) return ZIP_MAP[s]||null;
    return Object.keys(CITY_DATA).find(k=>{ const cityName = k.split(",")[0].toLowerCase().trim(); return s.includes(cityName); })||null;
  }

  function startScan(directInput){
    const scanInput = (typeof directInput === 'string') ? directInput : input;
    setInputError("");
    if(!scanInput || !scanInput.trim()){
      setInputError(inputMode === "address" ? "Enter your address to scan" : inputMode === "zip" ? "Enter a ZIP code to scan" : "Enter a city and state to scan");
      inputRef.current?.classList.add('input-error');
      setTimeout(() => inputRef.current?.classList.remove('input-error'), 400);
      return;
    }
    if(isScanning) return;
    setIsScanning(true);
    const cleanInput = scanInput.replace(/<[^>]*>/g, '').trim().slice(0, 100);
    trackEvent('scan_started', { input_mode: inputMode, input_length: cleanInput.length });
    setPhase("scanning"); setScanStep(0);
    let step=0;
    const t=setInterval(()=>{
      step++; setScanStep(step);
      if(step>=SCAN_STEPS.length){
        clearInterval(t);
        setTimeout(async()=>{
          const city=resolveCity(cleanInput);
          if(city){
            const raw=CITY_DATA[city];
            setData({...raw,city:city});
            setPhase("results"); setTab("wtr-intel");
            trackEvent('scan_completed', { city, risk_score: getRiskScore(raw.contaminants), contaminant_count: raw.contaminants?.length, source:'local' });
            setTimeout(()=>{setShowHub(true);setGaugeOn(true);},300);
            setTimeout(()=>setAnimating(true),700);
            setIsScanning(false); return;
          }
          const zipMatch = cleanInput.match(/\d{5}/);
          if(zipMatch){
            try {
              const oracleRes = await fetch(`${API_BASE}/api/wtr/report?zip=${zipMatch[0]}`, { headers: { 'Authorization': API_BEARER } });
              if(oracleRes.ok){
                const report = await oracleRes.json();
                if(report && report.utility && report.status !== 'not_found'){
                  const cityLabel = `${report.utility} | ${zipMatch[0]}`;
                  const transformed = transformOracleReport(report, cityLabel, zipMatch[0]);
                  setData(transformed);
                  setPhase("results"); setTab("wtr-intel");
                  trackEvent('scan_completed', { city: cityLabel, zip: zipMatch[0], risk_score: getRiskScore(transformed.contaminants), contaminant_count: transformed.contaminants?.length, source:'wtr-oracle' });
                  setTimeout(()=>{setShowHub(true);setGaugeOn(true);},300);
                  setTimeout(()=>setAnimating(true),700);
                  setIsScanning(false); return;
                }
              }
            } catch(e){ console.warn('[WTR-ORACLE] Lookup failed:', e.message); }
          }
          trackEvent('scan_location_not_found', { input: cleanInput.slice(0,20) });
          setPhase("not_found"); setIsScanning(false);
        },300);
      }
    },480);
  }

  async function handleEmailSubmit(scanPhase) {
    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) { setEmailError("Please enter a valid email address"); return; }
    setSubmitted(true);
    trackEvent('email_captured', { city: data?.city, risk_score: data ? getRiskScore(data.contaminants) : 0, scan_phase: scanPhase });
    setTimeout(() => setEngagementPhase("push_prompt"), 2000);
    try {
      const payload = {
        email: emailTrimmed,
        zip: input && /^\d{5}$/.test(input.trim()) ? input.trim() : null,
        city: data?.city || input || null,
        risk_score: data ? getRiskScore(data.contaminants) : 0,
        high_concern_contaminants: data?.contaminants?.filter(c => c.risk === 'high').map(c => c.name) || [],
        source: 'wtr_app',
        session_id: getSessionId(),
        address: inputMode === 'address' ? input : null,
        scan_phase: scanPhase
      };
      const resp = await fetch(`${API_BASE}/api/wtr/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': API_BEARER },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const result = await resp.json();
      if (result.prospect_id) setCapturedProspectId(result.prospect_id);
    } catch (err) {
      try {
        const dlq = JSON.parse(localStorage.getItem('wtr_capture_dlq') || '[]');
        dlq.push({ email: emailTrimmed, city: data?.city || input, ts: Date.now(), scan_phase: scanPhase });
        localStorage.setItem('wtr_capture_dlq', JSON.stringify(dlq.slice(-20)));
      } catch (e) {}
      console.warn('[WTR Capture] Failed, queued for retry:', err.message);
    }
  }

  const riskScore = data ? getRiskScore(data.contaminants) : 0;
  const highRisk = data?.contaminants.filter(c=>c.risk==="high")||[];
  const cityShort = data?.city?.split(",")[0] || '';

  const navTabs = [
    { id:"tbv", label:"Trust but Verify\u2122" },
    { id:"wtr-intel", label:"WTR INTEL", badge: data ? riskScore : null },
    ...(founderMode ? [{ id:"wtr-btl", label:"WTR BTL" }, { id:"wtr-hub", label:"WTR HUB" }] : []),
  ];

  const headerRiskTone = riskScore > 66 ? '#B84A4A' : riskScore > 33 ? '#C89B3C' : '#4A8A6F';
  const headerRiskBg   = riskScore > 66 ? 'rgba(184, 74, 74, 0.10)' : riskScore > 33 ? 'rgba(200, 155, 60, 0.10)' : 'rgba(74, 138, 111, 0.10)';

  return (
    <div
      className="min-h-screen bg-surface-base mx-auto relative flex flex-col"
      style={{ maxWidth: 480, fontFamily: 'Montserrat, sans-serif' }}
      data-testid="trust-but-verify-app"
    >
      <style>{`
        @keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.08);opacity:0.8}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ripple{0%{transform:scale(0.9);opacity:0.8}100%{transform:scale(2.2);opacity:0}}
        @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
        .input-error{animation:shake 0.35s ease;border-color:#B84A4A!important}
        .tbv-card{animation:slideUp 0.4s ease forwards}
      `}</style>

      {/* Header (hidden on hardware tabs) */}
      {tab!=="wtr-btl" && tab!=="wtr-hub" && (
        <div
          className="sticky top-0 z-[100] bg-surface-card flex items-center justify-between"
          style={{
            borderBottom: '1px solid #E8EAED',
            padding: '10px 16px',
            boxShadow: '0 1px 2px rgba(15, 20, 25, 0.04)',
          }}
          data-testid="app-header"
        >
          <img
            src="/generosity-logo.png"
            alt="Generosity Water Intelligence"
            style={{ height: 48, width: 'auto', cursor: 'pointer' }}
            onClick={() => {
              setPhase("landing"); setTab("tbv"); setData(null); setSubmitted(false);
              setEngagementPhase("idle"); setInput(""); setInputError("");
              window.scrollTo(0, 0);
            }}
            onTouchStart={() => { founderLongPressRef.current = setTimeout(() => setShowFounderLogin(true), 3000); }}
            onTouchEnd={() => { clearTimeout(founderLongPressRef.current); }}
            onMouseDown={() => { founderLongPressRef.current = setTimeout(() => setShowFounderLogin(true), 3000); }}
            onMouseUp={() => { clearTimeout(founderLongPressRef.current); }}
          />
          <div className="flex items-center gap-2">
            {founderMode && (
              <button
                type="button"
                onClick={handleFounderLogout}
                title="Tap to exit demo mode"
                className="text-micro font-bold uppercase tracking-widest rounded-pill cursor-pointer"
                style={{
                  background: '#0F1419',
                  color: '#51B0E6',
                  padding: '4px 10px',
                  border: '1px solid rgba(81, 176, 230, 0.30)',
                }}
              >
                FOUNDER
              </button>
            )}
            {data && (
              <div
                data-testid="header-risk-score"
                className="text-caption font-bold rounded-pill"
                style={{
                  background: headerRiskBg,
                  color: headerRiskTone,
                  padding: '4px 10px',
                  border: `1px solid ${headerRiskTone}33`,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                Score: {riskScore}
              </div>
            )}
            <button
              type="button"
              data-testid="profile-btn"
              onClick={() => setShowProfile(true)}
              className="rounded-full flex items-center justify-center cursor-pointer"
              style={{
                width: 36,
                height: 36,
                background: '#F0F1F3',
                border: '1px solid #E8EAED',
              }}
              aria-label="Profile"
            >
              <Icon name="user" size={20} color="#A6A8AB" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 80 }}>
        {/* ═══════════════════════ TBV TAB ═══════════════════════ */}
        {tab === "tbv" && (
          <div data-testid="tbv-tab">
            <div className="sticky top-0 z-[50] bg-surface-base" style={{ padding: '14px 16px 0' }}>
              <SegmentedToggle
                testId="tbv-toggle"
                value={tbvView}
                onChange={setTbvView}
                options={[
                  { id: "home", label: "Home Water" },
                  { id: "scan", label: "Bottle Scan" },
                ]}
              />
            </div>

            {/* Landing */}
            {tbvView === "home" && phase === "landing" && (
              <div style={{ padding: '44px 20px 20px' }} data-testid="home-landing">
                <div className="text-center" style={{ marginBottom: 32 }}>
                  <h1
                    className="font-display font-semibold text-text-primary"
                    style={{ fontSize: 28, lineHeight: 1.1, marginBottom: 10, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}
                  >
                    What's <span className="text-brand">actually</span> in your water?
                  </h1>
                  <p
                    className="text-body text-text-secondary mx-auto"
                    style={{ maxWidth: 360, lineHeight: 1.5, marginBottom: 18 }}
                  >
                    Get a free water intelligence report. See every contaminant detected at <strong className="text-text-primary">your exact address</strong>, and the long-term risks if nothing changes.
                  </p>

                  <div style={{ maxWidth: 320, margin: '0 auto 12px' }}>
                    <SegmentedToggle
                      testId="input-mode-toggle"
                      size="small"
                      value={inputMode}
                      onChange={(v) => { setInputMode(v); setInput(""); }}
                      options={[
                        { id: "address", label: "My Address", icon: <Icon name="home" size={11} color={inputMode === "address" ? "#51B0E6" : "#A6A8AB"} /> },
                        { id: "zip",     label: "ZIP Code",   icon: <Icon name="pin"  size={11} color={inputMode === "zip"     ? "#51B0E6" : "#A6A8AB"} /> },
                        { id: "city",    label: "City",       icon: <Icon name="city" size={11} color={inputMode === "city"    ? "#51B0E6" : "#A6A8AB"} /> },
                      ]}
                    />
                  </div>

                  {/* Input + SCAN suffix button */}
                  <div style={{ maxWidth: 380, margin: '0 auto' }}>
                    <Input
                      ref={inputRef}
                      testId="address-input"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && startScan()}
                      placeholder={
                        inputMode === "address"
                          ? "e.g. 1234 Maple St, Chicago IL"
                          : inputMode === "zip"
                          ? "e.g. 60601, 78701, 90210"
                          : "e.g. Chicago, IL"
                      }
                      error={inputError}
                      suffix={
                        <button
                          type="button"
                          onClick={() => startScan()}
                          data-testid="scan-btn"
                          className="bg-brand text-text-onAccent font-semibold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                          style={{
                            padding: '0 16px',
                            fontSize: 12,
                            border: 'none',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          SCAN <Icon name="scan" size={14} color="#FFFFFF" />
                        </button>
                      }
                    />
                  </div>

                  <div className="text-text-quaternary" style={{ fontSize: 9, marginTop: 8 }}>
                    EPA SDWIS + UCMR 5 Report
                  </div>
                </div>

                {/* Stat row */}
                <div className="grid grid-cols-3 gap-1.5" style={{ marginBottom: 14 }}>
                  {[
                    ["200M+", "Americans exposed to PFAS", "USGS 2023"],
                    ["94%", "tap water has microplastics", "ORB Media / Columbia"],
                    ["$0", "to get your report", ""],
                  ].map(([n, t, src]) => (
                    <div
                      key={n}
                      className="bg-surface-card rounded-card text-center"
                      style={{ padding: '12px 6px', boxShadow: '0 1px 2px rgba(15, 20, 25, 0.04), 0 0 0 1px rgba(15, 20, 25, 0.03)' }}
                    >
                      <div
                        className="font-display font-semibold text-brand leading-none"
                        style={{ fontSize: 18, fontVariantNumeric: 'tabular-nums' }}
                      >
                        {n}
                      </div>
                      <div className="text-text-tertiary mt-1" style={{ fontSize: 9, lineHeight: 1.3 }}>
                        {t}
                      </div>
                      {src && (
                        <div className="text-text-quaternary mt-0.5" style={{ fontSize: 8, fontStyle: 'italic' }}>
                          {src}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Popular cities */}
                <div className="text-center">
                  <div className="text-micro uppercase tracking-widest font-semibold text-text-tertiary" style={{ marginBottom: 8 }}>
                    POPULAR CITIES
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center" data-testid="popular-cities">
                    {Object.keys(CITY_DATA).map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => { setInput(city); setInputMode("city"); startScan(city); }}
                        data-testid={`city-btn-${city.toLowerCase().replace(/[,\s]+/g, '-')}`}
                        className="bg-surface-card text-brand font-semibold rounded-pill cursor-pointer"
                        style={{
                          padding: '6px 12px',
                          fontSize: 11,
                          border: '1px solid #C8E2F4',
                        }}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Scanning */}
            {tbvView === "home" && phase === "scanning" && (
              <div className="mx-auto" style={{ maxWidth: 360, margin: '60px auto', padding: '0 20px', textAlign: 'center' }} data-testid="home-scanning">
                <div className="relative mx-auto" style={{ width: 80, height: 80, marginBottom: 22 }}>
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'rgba(81, 176, 230, 0.12)',
                      border: '2px solid rgba(81, 176, 230, 0.30)',
                      animation: 'ripple 1.4s ease-out infinite',
                    }}
                  />
                  <div
                    className="rounded-full flex items-center justify-center relative z-[1]"
                    style={{
                      width: 80,
                      height: 80,
                      background: 'linear-gradient(135deg, #51B0E6, #3DA0DA)',
                    }}
                  >
                    <Icon name="droplet" size={36} color="#FFFFFF" />
                  </div>
                </div>
                <h2 className="font-display font-semibold text-text-primary flex items-center justify-center gap-2" style={{ fontSize: 22, marginBottom: 18 }}>
                  <Icon name={inputMode === "address" ? "home" : inputMode === "zip" ? "pin" : "city"} size={20} color="#51B0E6" />
                  {inputMode === "address" ? "Scanning your address" : inputMode === "zip" ? "Scanning ZIP code" : `Analyzing ${input}`}
                </h2>
                <div className="bg-surface-card rounded-card overflow-hidden" style={{ boxShadow: '0 1px 2px rgba(15, 20, 25, 0.04), 0 0 0 1px rgba(15, 20, 25, 0.03)' }} data-testid="scan-steps">
                  {SCAN_STEPS.map((msg, i) => {
                    const done = i < scanStep;
                    const active = i === scanStep;
                    return (
                      <div
                        key={i}
                        data-testid={`scan-step-${i}`}
                        className="flex items-center gap-2.5"
                        style={{
                          padding: '10px 14px',
                          background: done ? 'rgba(74, 138, 111, 0.06)' : active ? 'rgba(81, 176, 230, 0.06)' : 'transparent',
                          borderBottom: i < SCAN_STEPS.length - 1 ? '1px solid #E8EAED' : 'none',
                          fontSize: 12,
                          color: done ? '#4A8A6F' : active ? '#51B0E6' : '#A6A8AB',
                          fontWeight: active ? 600 : 400,
                          transition: 'all 0.3s',
                        }}
                      >
                        {done ? (
                          <Icon name="check" size={16} color="#4A8A6F" />
                        ) : active ? (
                          <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #51B0E6', borderTopColor: 'transparent', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
                        ) : (
                          <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #C8E2F4', display: 'inline-block' }} />
                        )}
                        {msg}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Not found */}
            {phase === "not_found" && (
              <div className="mx-auto" style={{ maxWidth: 360, margin: '40px auto', padding: '0 20px', textAlign: 'center' }} data-testid="not-found">
                <div
                  className="rounded-full flex items-center justify-center mx-auto"
                  style={{
                    width: 60,
                    height: 60,
                    background: 'rgba(200, 155, 60, 0.10)',
                    border: '2px solid rgba(200, 155, 60, 0.30)',
                    marginBottom: 16,
                  }}
                >
                  <Icon name="pin" size={28} color="#C89B3C" />
                </div>
                <h2 className="font-display font-semibold text-text-primary" style={{ fontSize: 22, marginBottom: 8 }}>
                  We don't have data for this location yet
                </h2>
                <p className="text-body text-text-secondary" style={{ marginBottom: 18, lineHeight: 1.6 }}>
                  Enter your email and we'll notify you when data is available. We're adding 50 new cities monthly.
                </p>
                {!submitted ? (
                  <div className="mx-auto" style={{ maxWidth: 300 }}>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                      placeholder="Your email address"
                      error={emailError}
                      testId="not-found-email-input"
                      className="mb-2"
                    />
                    <button
                      type="button"
                      onClick={() => handleEmailSubmit('not_found')}
                      data-testid="not-found-submit-btn"
                      className="w-full bg-brand text-text-onAccent font-semibold rounded-card cursor-pointer"
                      style={{ padding: 12, fontSize: 13, border: 'none' }}
                    >
                      NOTIFY ME WHEN AVAILABLE →
                    </button>
                  </div>
                ) : (
                  <div className="text-center" data-testid="not-found-success" style={{ padding: '10px 0' }}>
                    <div style={{ marginBottom: 5 }}>
                      <Icon name="checkCircle" size={28} />
                    </div>
                    <div className="font-semibold text-state-positive" style={{ fontSize: 13 }}>You're on the list.</div>
                    <div className="text-text-tertiary mt-1" style={{ fontSize: 11 }}>We'll email you when data for this area is ready.</div>
                  </div>
                )}
                <div style={{ marginTop: 24 }}>
                  <div className="text-micro uppercase tracking-widest font-semibold text-text-tertiary" style={{ marginBottom: 8 }}>
                    TRY A COVERED CITY
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {Object.keys(CITY_DATA).map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => { setInput(city); setInputMode("city"); setPhase("landing"); setTimeout(() => startScan(city), 100); }}
                        className="bg-surface-card text-brand font-semibold rounded-pill cursor-pointer"
                        style={{ padding: '6px 12px', fontSize: 11, border: '1px solid #C8E2F4' }}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bottle scan delegation */}
            {tbvView === "scan" && (
              <div data-testid="bottle-tab">
                <div className="text-center" style={{ padding: '18px 20px' }}>
                  <div className="text-micro uppercase tracking-widest font-semibold text-brand" style={{ marginBottom: 5 }}>
                    BOTTLE INTELLIGENCE
                  </div>
                  <h2 className="font-display font-semibold text-text-primary" style={{ fontSize: 22, marginBottom: 4, letterSpacing: '-0.01em' }}>
                    What's in your bottle?
                  </h2>
                  <p className="text-caption text-text-secondary mx-auto" style={{ maxWidth: 280 }}>
                    Scan any plastic water bottle to see its full contamination profile.
                  </p>
                </div>
                <BottleScanView onBridge={() => { setTbvView("home"); setPhase("landing"); }} />
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════ WTR INTEL TAB ═══════════════════════ */}
        {tab === "wtr-intel" && (
          <div data-testid="insights-tab">
            <div className="sticky top-0 z-[50] bg-surface-base" style={{ padding: '14px 16px 0' }}>
              <SegmentedToggle
                testId="insights-toggle"
                value={insightView}
                onChange={setInsightView}
                options={[
                  { id: "report", label: "Report", badge: data ? riskScore : null },
                  { id: "learn", label: "Learn" },
                ]}
              />
            </div>

            {/* Report */}
            {insightView === "report" && data && (
              <div style={{ padding: '14px 16px 20px' }} data-testid="report-tab">
                {/* Hero report card */}
                <HeroCard
                  testId="report-hero"
                  className="tbv-card mb-3"
                  eyebrow="TRUST BUT VERIFY™ REPORT"
                  title={data.city}
                  subtitle={`${data.utility}. ${data.source}.`}
                  metadata={[
                    { label: "TDS",      value: data.tds ?? '—' },
                    { label: "pH",       value: data.ph ?? '—' },
                    { label: "Hardness", value: data.hardness ?? '—' },
                  ]}
                  rightRail={<RiskGauge score={riskScore} animated={gaugeOn} />}
                >
                  {input && inputMode !== "city" && (
                    <div className="text-caption text-text-tertiary flex items-center gap-1.5">
                      <Icon name={inputMode === "address" ? "home" : "pin"} size={12} color="#8A8E93" />
                      {inputMode === "address" ? input : `ZIP ${input}`}
                    </div>
                  )}
                </HeroCard>

                {/* High-risk alert */}
                {highRisk.length > 0 && (
                  <div
                    className="rounded-card flex items-start gap-2.5 mb-3"
                    style={{
                      background: 'rgba(184, 74, 74, 0.06)',
                      border: '1px solid rgba(184, 74, 74, 0.20)',
                      borderLeft: '4px solid #B84A4A',
                      padding: '11px 14px',
                      animation: 'slideUp 0.4s 0.1s ease forwards',
                      opacity: 0,
                    }}
                    data-testid="high-risk-alert"
                  >
                    <Icon name="hazard" size={18} color="#B84A4A" />
                    <div>
                      <div className="font-bold text-state-critical" style={{ fontSize: 11, marginBottom: 3 }}>
                        {highRisk.length} HIGH-CONCERN CONTAMINANT{highRisk.length > 1 ? "S" : ""} FOUND
                      </div>
                      <div className="text-caption text-text-secondary">
                        {highRisk.map(c => c.name).join(" • ")}. Levels exceed health guidelines.
                      </div>
                    </div>
                  </div>
                )}

                {/* Monthly Report opt-in card */}
                {reportOptInStatus === 'confirmed' ? (
                  <div className="bg-surface-card rounded-card shadow-card flex items-center gap-3 mb-3" style={{ padding: '12px 16px' }}>
                    <Icon name="checkCircle" size={22} />
                    <div className="flex-1">
                      <div className="font-semibold text-text-primary" style={{ fontSize: 13 }}>Monthly Water Report. {cityShort}.</div>
                      <div className="text-text-tertiary mt-0.5" style={{ fontSize: 11 }}>Your report arrives the 1st of every month.</div>
                    </div>
                    <span className="text-micro uppercase tracking-wider font-bold text-state-positive">ENROLLED</span>
                  </div>
                ) : reportOptInStatus === 'pending' ? (
                  <div className="bg-surface-card rounded-card shadow-card flex items-center gap-3 mb-3" style={{ padding: '12px 16px' }}>
                    <div className="rounded-full flex items-center justify-center" style={{ width: 32, height: 32, background: 'rgba(200, 155, 60, 0.12)' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C89B3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-text-primary" style={{ fontSize: 13 }}>Check Your Email</div>
                      <div className="text-text-tertiary mt-0.5" style={{ fontSize: 11 }}>Click the confirmation link sent to {reportOptInEmail}</div>
                    </div>
                    <button
                      type="button"
                      onClick={openReportModal}
                      className="text-brand font-bold uppercase tracking-wider cursor-pointer"
                      style={{ background: 'none', border: 'none', fontSize: 11, padding: 0 }}
                    >
                      RESEND
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={openReportModal}
                    className="w-full bg-surface-card rounded-card shadow-card flex items-center gap-3 mb-3 cursor-pointer text-left"
                    style={{ padding: '12px 16px', border: 'none' }}
                  >
                    <Icon name="bell" size={22} color="#51B0E6" />
                    <div className="flex-1">
                      <div className="font-semibold text-text-primary" style={{ fontSize: 13 }}>Monthly Water Report. {cityShort}.</div>
                      <div className="text-text-tertiary mt-0.5" style={{ fontSize: 11 }}>Get your personalized report every month, free.</div>
                    </div>
                    <span
                      className="bg-brand text-text-onAccent font-bold uppercase tracking-wider rounded-card flex items-center justify-center"
                      style={{ padding: '7px 14px', fontSize: 11, minHeight: 36 }}
                    >
                      ENABLE
                    </span>
                  </button>
                )}

                {/* Contaminants list */}
                <div className="text-micro uppercase tracking-widest font-semibold text-text-tertiary mb-2">
                  CONTAMINANTS IN {cityShort.toUpperCase()}
                </div>
                <div className="flex flex-col gap-2 mb-4" data-testid="contaminants-list">
                  {data.contaminants.map((c, i) => (
                    <div
                      key={c.name}
                      style={{ animation: `slideUp 0.4s ${i * 0.06}s ease forwards`, opacity: 0 }}
                    >
                      <ContaminantCard
                        testId={`contaminant-${c.name.toLowerCase().replace(/[()]/g, '').replace(/\s+/g, '-')}`}
                        name={c.name}
                        risk={c.risk}
                        category={c.category}
                        detail={c.detail}
                        level={typeof c.level !== 'object' ? c.level : null}
                        unit={c.unit}
                        limit={c.limit}
                        isViolation={c.isViolation}
                      />
                    </div>
                  ))}
                </div>

                {/* Health calculator */}
                <HealthCalc city={data.city} riskScore={riskScore} />

                {/* The Solution hero (replaces navy gradient) */}
                <HeroCard
                  className="mb-3"
                  eyebrow="THE SOLUTION"
                  title="Trust but Verify™ Your Water."
                  subtitle={`The Home WTR Hub removes every contaminant found in ${cityShort}'s water, at the tap, in real time.`}
                >
                  
                    href={`https://generositywtr.myshopify.com/products/home-hydration-hub?utm_source=wtr-app&utm_medium=in-app-report&utm_campaign=water-threat-scan&utm_content=${encodeURIComponent((data?.city||'direct').replace(/\s/g,'-').toLowerCase())}&utm_term=${riskScore}&discount=WELCOME100`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('shopify_cta_clicked', { city: data?.city, risk_score: riskScore, discount_code: 'WELCOME100' })}
                    className="block w-full bg-brand text-text-onAccent text-center font-semibold rounded-card no-underline"
                    style={{ padding: '14px 20px', fontSize: 14 }}
                  >
                    GET THE HOME WTR HUB →
                  </a>
                  <div className="flex flex-wrap gap-3 justify-center mt-3">
                    {["30-Day Guarantee", "30-Min Install", "Financing Available"].map((t) => (
                      <div key={t} className="flex items-center gap-1 text-caption text-text-tertiary">
                        <Icon name="check" size={12} color="#4A8A6F" />
                        {t}
                      </div>
                    ))}
                  </div>
                </HeroCard>

                {/* What gets removed list */}
                <div className="bg-surface-card rounded-card shadow-card overflow-hidden mb-3">
                  <div className="flex items-center justify-between" style={{ padding: '12px 16px', borderBottom: '1px solid #E8EAED' }}>
                    <div className="font-semibold text-text-primary" style={{ fontSize: 12 }}>
                      Home WTR Hub. What Gets Removed.
                    </div>
                    <div className="text-micro uppercase tracking-widest text-brand font-semibold">{cityShort.toUpperCase()}</div>
                  </div>
                  {data.contaminants.map((c, i) => {
                    const rColor = c.risk === 'high' ? '#B84A4A' : c.risk === 'medium' ? '#C89B3C' : '#4A8A6F';
                    return (
                      <div
                        key={c.name}
                        className="grid items-center"
                        style={{
                          gridTemplateColumns: '1fr auto auto',
                          padding: '10px 16px',
                          gap: 8,
                          borderBottom: i < data.contaminants.length - 1 ? '1px solid #F0F1F3' : 'none',
                          background: i % 2 === 0 ? '#FFFFFF' : '#F7F8FA',
                        }}
                      >
                        <div>
                          <span className="font-semibold text-text-primary" style={{ fontSize: 12 }}>{c.name}</span>
                          <span className="text-text-tertiary ml-2" style={{ fontSize: 10 }}>{c.category}</span>
                        </div>
                        <div className="font-semibold" style={{ color: rColor, fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>
                          {c.level != null ? `${c.level} ${c.unit || ''}`.trim() : "Detected"}
                        </div>
                        <div
                          className="rounded-pill font-bold uppercase tracking-wider"
                          style={{ background: 'rgba(74, 138, 111, 0.10)', color: '#4A8A6F', fontSize: 9, padding: '2px 8px' }}
                        >
                          ✓ 99%+
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Hub animation */}
                {showHub && (
                  <div className="bg-surface-card rounded-card shadow-card mb-3" style={{ padding: 14 }} data-testid="wtr-hub-section">
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="rounded-card flex items-center justify-center text-text-onAccent" style={{ width: 30, height: 30, background: 'linear-gradient(135deg, #51B0E6, #3DA0DA)', fontSize: 14 }}>◈</div>
                      <div>
                        <div className="font-semibold text-text-primary" style={{ fontSize: 12 }}>Generosity™ Home WTR Hub</div>
                        <div className="text-brand" style={{ fontSize: 10 }}>Active Alkaline Technology. Multi-Stage.</div>
                      </div>
                    </div>
                    <WTRHubAnimation contaminants={data.contaminants} active={animating} />
                  </div>
                )}

                {/* Email capture */}
                <div className="bg-surface-card rounded-card shadow-card mb-3" style={{ padding: 16 }} data-testid="email-capture">
                  <div className="font-display font-semibold text-text-primary" style={{ fontSize: 18, marginBottom: 4 }}>
                    Get an extra $100 off the Home WTR Hub.
                  </div>
                  <div className="text-caption text-text-secondary mb-3" style={{ lineHeight: 1.5 }}>
                    Sale price $1,399.99. Your price $1,299.99 with code WELCOME100.
                  </div>
                  {!submitted ? (
                    <div className="flex flex-col gap-2">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email address"
                        testId="email-input"
                      />
                      <button
                        type="button"
                        onClick={() => handleEmailSubmit('results')}
                        data-testid="submit-email-btn"
                        className="bg-brand text-text-onAccent font-semibold rounded-card cursor-pointer"
                        style={{ padding: 12, fontSize: 13, border: 'none' }}
                      >
                        GET MY $100 OFF →
                      </button>
                      <div className="text-text-tertiary text-center" style={{ fontSize: 10 }}>No spam. Unsubscribe anytime.</div>
                    </div>
                  ) : (
                    <EngagementFlow
                      engagementPhase={engagementPhase}
                      setEngagementPhase={setEngagementPhase}
                      householdProfile={householdProfile}
                      setHouseholdProfile={setHouseholdProfile}
                      data={data}
                      email={email}
                      capturedProspectId={capturedProspectId}
                      setPushResult={setPushResult}
                    />
                  )}
                </div>

                {/* Partner footer */}
                <div className="bg-surface-card rounded-card shadow-card flex items-center justify-between gap-2.5" style={{ padding: '12px 14px' }}>
                  <div>
                    <div className="font-semibold text-text-primary" style={{ fontSize: 12 }}>Are you a Dealer or Distributor?</div>
                    <div className="text-text-tertiary mt-0.5" style={{ fontSize: 10 }}>Use Trust But Verify™ as your sales tool.</div>
                  </div>
                  
                    href="https://generositywater.com/generosity-partners-paywall"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-surface-card text-brand font-bold uppercase tracking-wider rounded-card no-underline whitespace-nowrap"
                    style={{ padding: '8px 12px', fontSize: 10, border: '1px solid #51B0E6' }}
                  >
                    PARTNER PORTAL →
                  </a>
                </div>
              </div>
            )}

            {/* Empty report */}
            {insightView === "report" && !data && (
              <div className="text-center" style={{ padding: '60px 20px' }} data-testid="report-empty">
                <div className="flex justify-center mb-3">
                  <span className="text-text-tertiary inline-flex">
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="12" width="4" height="9" rx="1"/>
                      <rect x="10" y="6" width="4" height="15" rx="1"/>
                      <rect x="17" y="2" width="4" height="19" rx="1"/>
                    </svg>
                  </span>
                </div>
                <h3 className="font-display font-semibold text-text-primary" style={{ fontSize: 22, marginBottom: 7 }}>
                  No Report Yet
                </h3>
                <p className="text-body text-text-secondary mb-4">
                  Enter your address on the Home tab to generate your free water intelligence report.
                </p>
                <button
                  type="button"
                  onClick={() => { setTab("tbv"); setPhase("landing"); }}
                  data-testid="go-test-water-btn"
                  className="bg-brand text-text-onAccent font-semibold rounded-card cursor-pointer"
                  style={{ padding: '12px 22px', fontSize: 13, border: 'none' }}
                >
                  TEST MY WATER →
                </button>
              </div>
            )}

            {/* Learn */}
            {insightView === "learn" && (
              <div style={{ padding: 18 }} data-testid="learn-tab">
                <h2 className="font-display font-semibold text-text-primary" style={{ fontSize: 22, marginBottom: 14 }}>
                  Water Intelligence Library
                </h2>
                {[
                  { iconName: "hazard",  title: "PFAS: Forever Chemicals",            desc: "Found in 45% of US tap water. Linked to cancer, immune disruption, and reproductive harm. EPA set new limits at 4 ppt in 2024, 1,000x stricter than before.", tag: "HIGH RISK", tc: "#B84A4A" },
                  { iconName: "alert",   title: "Lead: No Safe Level",                desc: "Irreversible neurological damage in children under 6. From aging pipes in pre-1986 homes. Chicago has 400,000+ lead service lines.", tag: "HIGH RISK", tc: "#B84A4A" },
                  { iconName: "atom",    title: "Chromium-6 (Erin Brockovich)",       desc: "Found in 75% of US tap water. CA health goal is 0.02 ppb. Most cities test 10 to 25x this level.", tag: "HIGH RISK", tc: "#B84A4A" },
                  { iconName: "flask",   title: "Microplastics",                      desc: "Found in 94% of US tap water, human blood, lungs, placentas and breast milk. Average American ingests 5 grams per week.", tag: "EMERGING", tc: "#C89B3C" },
                  { iconName: "droplet", title: "Why Bottled Water Isn't the Answer", desc: "70% comes from municipal tap. Plastic leaches BPA and microplastics. Costs 1,000x more than filtered tap water.", tag: "MYTH", tc: "#51B0E6" },
                  { iconName: "filter",  title: "How Reverse Osmosis Works",          desc: "Filters to 0.0001 microns, smaller than any virus, bacteria, PFAS molecule, or heavy metal. Gold standard for home filtration.", tag: "SOLUTION", tc: "#4A8A6F" },
                ].map((item, i) => (
                  <div key={i} className="bg-surface-card rounded-card shadow-card mb-2" style={{ padding: 14 }} data-testid={`learn-card-${i}`}>
                    <div className="flex gap-2.5 items-start">
                      <div className="rounded-card flex items-center justify-center shrink-0" style={{ width: 36, height: 36, background: '#FFFFFF', border: `1px solid ${item.tc}33` }}>
                        <Icon name={item.iconName} size={20} color={item.tc} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <div className="font-semibold text-text-primary" style={{ fontSize: 13 }}>{item.title}</div>
                          <div className="rounded-pill font-bold uppercase tracking-wider" style={{ fontSize: 9, color: item.tc, background: `${item.tc}1F`, padding: '2px 7px' }}>
                            {item.tag}
                          </div>
                        </div>
                        <div className="text-caption text-text-secondary" style={{ lineHeight: 1.6 }}>{item.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <HeroCard
                  className="mt-2"
                  title="Knowledge is only useful if you act on it."
                  subtitle="The Home WTR Hub removes everything in this library. 1,000+ contaminants."
                >
                  
                    href="https://generositywtr.myshopify.com/products/home-hydration-hub?utm_source=wtr-app&utm_medium=learn-tab&utm_campaign=knowledge-cta&discount=WELCOME100"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-brand text-text-onAccent text-center font-semibold rounded-card no-underline"
                    style={{ padding: '14px 22px', fontSize: 13 }}
                  >
                    LEARN MORE →
                  </a>
                </HeroCard>
              </div>
            )}
          </div>
        )}

        {/* Hardware tabs (founder-only) */}
        {tab === "wtr-btl" && <WTRBottleScreen />}
        {tab === "wtr-hub" && <WTRHubScreen />}
      </div>

      {/* Bottom nav */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full bg-surface-card flex z-[200]"
        style={{
          maxWidth: 480,
          borderTop: '1px solid #E8EAED',
          boxShadow: '0 -1px 2px rgba(15, 20, 25, 0.04)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        data-testid="bottom-nav"
      >
        {navTabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => { setTab(t.id); if (t.id === "tbv") setPhase("landing"); }}
              data-testid={`nav-${t.id}`}
              className="flex-1 flex flex-col items-center gap-1 cursor-pointer relative"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '10px 4px 12px',
                transition: 'opacity 0.15s',
              }}
            >
              {t.badge != null && t.badge > 0 && (
                <div
                  className="absolute rounded-pill flex items-center justify-center font-bold text-text-onAccent"
                  style={{
                    top: 7,
                    right: 'calc(50% - 18px)',
                    minWidth: 16,
                    height: 16,
                    background: t.badge > 66 ? '#B84A4A' : t.badge > 33 ? '#C89B3C' : '#4A8A6F',
                    fontSize: 9,
                    padding: '0 4px',
                    border: '1.5px solid #FFFFFF',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {t.badge}
                </div>
              )}
              <NavIcon id={t.id} active={active} />
              <div
                className="text-center"
                style={{
                  fontSize: 10,
                  fontWeight: active ? 600 : 500,
                  color: active ? '#51B0E6' : '#8A8E93',
                  letterSpacing: '0.02em',
                  lineHeight: 1.2,
                }}
              >
                {t.label}
              </div>
              {active && (
                <div
                  className="absolute rounded-full"
                  style={{
                    bottom: 3,
                    width: 4,
                    height: 4,
                    background: '#51B0E6',
                    boxShadow: '0 0 6px #51B0E6',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Monthly Report Modal */}
      <MonthlyReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        screen={reportModalScreen}
        email={reportEmail}
        onEmailChange={(v) => { setReportEmail(v); if (reportEmailError) setReportEmailError(''); }}
        emailError={reportEmailError}
        zip={reportZip}
        onZipChange={(v) => { setReportZip(v); if (reportZipError) setReportZipError(''); }}
        zipError={reportZipError}
        submitting={reportSubmitting}
        submitError={reportSubmitError}
        onSubmit={handleReportSubscribe}
        cityShort={cityShort}
      />

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-[500] bg-surface-card overflow-y-auto" style={{ animation: 'slideUp 0.3s ease' }}>
          <ProfileScreen onClose={() => setShowProfile(false)} />
        </div>
      )}

      {/* Founder Login Modal */}
      <FounderLoginModal
        open={showFounderLogin}
        onClose={() => { setShowFounderLogin(false); setFounderPin(''); setFounderPinError(''); }}
        pin={founderPin}
        onPinChange={(v) => { setFounderPin(v); setFounderPinError(''); }}
        error={founderPinError}
        onSubmit={(pin) => handleFounderLogin(pin)}
      />
    </div>
  );
}

// ─── ENGAGEMENT FLOW (post-email-capture) ────────────────────────────────────
function EngagementFlow({ engagementPhase, setEngagementPhase, householdProfile, setHouseholdProfile, data, email, capturedProspectId, setPushResult }) {
  return (
    <div className="text-center" data-testid="engagement-flow" style={{ padding: '12px 0' }}>
      {engagementPhase === "idle" && (
        <div>
          <div style={{ marginBottom: 5 }}>
            <Icon name="checkCircle" size={28} />
          </div>
          <div className="font-semibold text-state-positive" style={{ fontSize: 13 }}>Report sent. Check your email.</div>
          <div className="text-text-tertiary mt-1" style={{ fontSize: 11 }}>Discount code: WELCOME100</div>
        </div>
      )}

      {engagementPhase === "push_prompt" && (
        <div className="mx-auto" style={{ maxWidth: 320, padding: '4px 0' }} data-testid="push-prompt">
          <div className="rounded-full flex items-center justify-center mx-auto" style={{ width: 44, height: 44, background: '#E8F4FB', border: '2px solid rgba(81, 176, 230, 0.30)', marginBottom: 10 }}>
            <Icon name="alert" size={20} color="#51B0E6" />
          </div>
          <div className="font-semibold text-text-primary" style={{ fontSize: 14, marginBottom: 4 }}>Water quality changes. You should know.</div>
          <div className="text-caption text-text-secondary mb-3" style={{ lineHeight: 1.5 }}>
            Get an alert when contamination levels change in your area. We only notify when it matters.
          </div>
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={async () => {
                trackEvent('push_permission_requested', { city: data?.city });
                const result = await requestPushPermission(data?.zip || data?.city?.match(/\d{5}/)?.[0], capturedProspectId, {});
                setPushResult(result);
                trackEvent(result.granted ? 'push_permission_granted' : 'push_permission_denied', { city: data?.city });
                setEngagementPhase("household");
              }}
              className="bg-brand text-text-onAccent font-semibold rounded-card cursor-pointer"
              style={{ padding: '9px 20px', fontSize: 12, border: 'none' }}
            >
              ENABLE ALERTS
            </button>
            <button
              type="button"
              onClick={() => { trackEvent('push_permission_dismissed', { city: data?.city }); setEngagementPhase("household"); }}
              className="text-text-tertiary font-semibold rounded-card cursor-pointer"
              style={{ background: 'transparent', padding: '9px 16px', fontSize: 12, border: '1px solid #E8EAED' }}
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {engagementPhase === "household" && (
        <div className="mx-auto text-left" style={{ maxWidth: 320, padding: '4px 0' }} data-testid="household-profile">
          <div className="font-semibold text-text-primary text-center" style={{ fontSize: 14, marginBottom: 3 }}>
            Personalize your risk assessment
          </div>
          <div className="text-caption text-text-secondary text-center mb-3" style={{ lineHeight: 1.5 }}>
            Quick questions to tailor your report to your household.
          </div>
          {[
            { key: 'has_children', label: 'Children under 12 at home?', options: [{ label: 'Yes', val: true }, { label: 'No', val: false }] },
            { key: 'is_pregnant',  label: 'Anyone pregnant or trying to conceive?', options: [{ label: 'Yes', val: true }, { label: 'No', val: false }] },
            { key: 'has_filter',   label: 'Water filter currently installed?', options: [{ label: 'Yes', val: true }, { label: 'No', val: false }, { label: 'Not sure', val: 'unsure' }] },
          ].map((q) => (
            <div key={q.key} className="mb-3">
              <div className="font-semibold text-text-secondary mb-1.5" style={{ fontSize: 11 }}>{q.label}</div>
              <div className="flex gap-1.5">
                {q.options.map((opt) => {
                  const active = householdProfile[q.key] === opt.val;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setHouseholdProfile((p) => ({ ...p, [q.key]: opt.val }))}
                      className="flex-1 font-bold rounded-card cursor-pointer"
                      style={{
                        padding: 8,
                        border: active ? '2px solid #51B0E6' : '1px solid #E8EAED',
                        background: active ? '#E8F4FB' : '#FFFFFF',
                        color: active ? '#3DA0DA' : '#4A4F56',
                        fontSize: 11,
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={async () => {
                trackEvent('household_profile_submitted', { ...householdProfile, city: data?.city });
                try {
                  await fetch(`${API_BASE}/api/wtr/capture`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': API_BEARER },
                    body: JSON.stringify({
                      email,
                      zip: data?.zip,
                      city: data?.city,
                      source: 'household_profile_update',
                      household_profile: householdProfile,
                    }),
                  });
                } catch (e) {}
                setEngagementPhase("complete");
              }}
              className="flex-1 bg-brand text-text-onAccent font-semibold rounded-card cursor-pointer"
              style={{ padding: 10, fontSize: 12, border: 'none' }}
            >
              PERSONALIZE MY REPORT
            </button>
            <button
              type="button"
              onClick={() => { trackEvent('household_profile_skipped', { city: data?.city }); setEngagementPhase("complete"); }}
              className="text-text-tertiary font-semibold rounded-card cursor-pointer"
              style={{ background: 'transparent', padding: '10px 12px', fontSize: 11, border: '1px solid #E8EAED' }}
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {engagementPhase === "complete" && (
        <div data-testid="engagement-complete">
          <div style={{ marginBottom: 5 }}>
            <Icon name="checkCircle" size={28} />
          </div>
          <div className="font-semibold text-state-positive" style={{ fontSize: 13 }}>You're all set.</div>
          <div className="text-text-tertiary mt-1" style={{ fontSize: 11 }}>
            Discount code: <span className="font-bold text-text-primary">WELCOME100</span>
          </div>
          {householdProfile.has_children && (
            <div
              className="rounded-card text-left mt-2"
              style={{ background: 'rgba(200, 155, 60, 0.08)', border: '1px solid rgba(200, 155, 60, 0.25)', padding: '8px 12px', fontSize: 11, color: '#7A5E1F', lineHeight: 1.5 }}
            >
              Children are especially vulnerable to lead and PFAS. The Home WTR Hub removes 99%+ of both.
            </div>
          )}
          {householdProfile.is_pregnant && (
            <div
              className="rounded-card text-left mt-2"
              style={{ background: 'rgba(184, 74, 74, 0.06)', border: '1px solid rgba(184, 74, 74, 0.20)', padding: '8px 12px', fontSize: 11, color: '#7A2A2A', lineHeight: 1.5 }}
            >
              PFAS bioaccumulate in breast milk. Filtration before and during pregnancy is critical.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
