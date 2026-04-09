import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import BottleScanView from "./components/BottleScanView";
import WTRBottleScreen from "./components/WTRBottleScreen";
import WTRHubScreen from "./components/WTRHubScreen";
import ProfileScreen from "./components/ProfileScreen";
import { requestPushPermission, isPushSupported, registerServiceWorker } from './push';

// ─── GENEROSITY™ OFFICIAL BRAND PALETTE (Updated) ────────────────────────────
// White background (#FFFFFF) - clean, professional look
// Primary Blue (#51B0E6, Pantone 2915 U) - key highlights
// Secondary Gray (#A6A8AB, Pantone Cool Gray 6) - secondary text
// Light gray (#F0F1F3) - card backgrounds
const B = { 
  // Primary Colors
  blue:"#51B0E6",        // Pantone 2915 U - Primary highlight
  blueDark:"#2A8FCA",    // Darker blue for gradients
  blueLight:"#EDF6FC",   // Light blue tint
  blueMid:"#DCEEF9",     // Mid blue for backgrounds
  
  // Grays (Generosity Colorway)
  gray:"#A6A8AB",        // Pantone Cool Gray 6 - Secondary text
  grayDark:"#6E7073",    // Dark gray for emphasis
  grayMid:"#C5C6C8",     // Mid gray
  lightGray:"#F0F1F3",   // Card backgrounds
  
  // Whites
  white:"#FFFFFF",       // Primary background
  offWhite:"#F7F9FB",    // Subtle off-white
  
  // Legacy Navy (used sparingly for contrast)
  navy:"#0A1A2E", 
  navyMid:"#0D2244", 
  
  // Borders
  border:"#C8E2F4", 
  borderLight:"#E4F1FA", 
  
  // Status Colors
  danger:"#D93025", 
  warning:"#F29423", 
  ok:"#1E8A4C", 
  dangerBg:"#FFF3F2", 
  warningBg:"#FFF8EE", 
  okBg:"#F0FAF4" 
};

// ─── BOTTLE BRANDS DATA ─────────────────────────────────────────────────────
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
// Real UPC codes mapped to brand names for barcode scanning
const UPC_DATABASE = {
  // Dasani (Coca-Cola)
  "049000006346": "Dasani", "049000028904": "Dasani", "049000028911": "Dasani",
  "049000006360": "Dasani", "049000042726": "Dasani", "049000072112": "Dasani",
  // Aquafina (PepsiCo)
  "012000001307": "Aquafina", "012000001314": "Aquafina", "012000001321": "Aquafina",
  "012000161148": "Aquafina", "012000001291": "Aquafina", "012000204173": "Aquafina",
  // Evian (Danone)
  "061314000011": "Evian", "061314000028": "Evian", "061314000035": "Evian",
  "079298612417": "Evian", "061314000073": "Evian", "079298612004": "Evian",
  // Poland Spring (BlueTriton)
  "075720004010": "Poland Spring", "075720004034": "Poland Spring", "075720004058": "Poland Spring",
  "075720400010": "Poland Spring", "075720400034": "Poland Spring", "075720202034": "Poland Spring",
  // Fiji Water
  "632565000012": "Fiji Water", "632565000029": "Fiji Water", "632565000036": "Fiji Water",
  "632565000227": "Fiji Water", "632565000234": "Fiji Water", "632565000043": "Fiji Water",
  // Smart Water (Coca-Cola)
  "786162002501": "Smart Water", "786162002518": "Smart Water", "786162002525": "Smart Water",
  "786162002594": "Smart Water", "786162375100": "Smart Water", "786162002600": "Smart Water",
  // Voss
  "896716001005": "Voss", "896716001012": "Voss", "896716001029": "Voss",
  "896716001036": "Voss", "896716002002": "Voss", "896716002019": "Voss",
  // Nestlé Pure Life / Pure Life (BlueTriton)
  "068274540011": "Nestlé Pure Life", "068274540028": "Nestlé Pure Life", "068274540103": "Nestlé Pure Life",
  "068274540219": "Nestlé Pure Life", "068274348846": "Nestlé Pure Life", "068274541018": "Nestlé Pure Life",
  // Arrowhead (BlueTriton)
  "071142000109": "Arrowhead", "071142000116": "Arrowhead", "071142000123": "Arrowhead",
  "071142000154": "Arrowhead", "071142006231": "Arrowhead", "071142006248": "Arrowhead",
  // Crystal Geyser
  "654871100019": "Crystal Geyser", "654871100026": "Crystal Geyser", "654871100033": "Crystal Geyser",
  "654871100101": "Crystal Geyser", "654871100118": "Crystal Geyser", "654871100125": "Crystal Geyser",
  // Deer Park (BlueTriton)
  "082657802015": "Deer Park", "082657802022": "Deer Park", "082657802039": "Deer Park",
  "082657802305": "Deer Park", "082657802312": "Deer Park", "082657802329": "Deer Park",
  // Ice Mountain (BlueTriton)
  "083757802017": "Ice Mountain", "083757802024": "Ice Mountain", "083757802031": "Ice Mountain",
  "083757802208": "Ice Mountain", "083757802215": "Ice Mountain", "083757802222": "Ice Mountain",
  // Ozarka (BlueTriton)
  "068274102011": "Ozarka", "068274102028": "Ozarka", "068274102035": "Ozarka",
  "068274102301": "Ozarka", "068274102318": "Ozarka", "068274102325": "Ozarka",
  // Zephyrhills (BlueTriton)
  "073430000018": "Zephyrhills", "073430000025": "Zephyrhills", "073430000032": "Zephyrhills",
  "073430000308": "Zephyrhills", "073430000315": "Zephyrhills", "073430000322": "Zephyrhills",
  // Essentia
  "851icons7000019": "Essentia", "851167000026": "Essentia", "851167000033": "Essentia",
  "851167000101": "Essentia", "851167000118": "Essentia", "851167000125": "Essentia",
  // Core
  "851icons0000109": "Core", "851750000116": "Core", "851750000123": "Core",
  "851750000208": "Core", "851750000215": "Core", "851750000222": "Core",
  // Lifewtr (PepsiCo)
  "012000172410": "Lifewtr", "012000172427": "Lifewtr", "012000172434": "Lifewtr",
  "012000172441": "Lifewtr", "012000172458": "Lifewtr", "012000172465": "Lifewtr",
  // Propel (PepsiCo)
  "052000135503": "Propel", "052000135510": "Propel", "052000135527": "Propel",
  "052000135602": "Propel", "052000135619": "Propel", "052000135626": "Propel",
  // Hint
  "184739000101": "Hint", "184739000118": "Hint", "184739000125": "Hint",
  "184739000132": "Hint", "184739000149": "Hint", "184739000156": "Hint",
  // La Croix
  "012993101015": "La Croix", "012993101022": "La Croix", "012993101039": "La Croix",
  "012993101107": "La Croix", "012993101114": "La Croix", "012993101121": "La Croix",
  // Perrier
  "074780000017": "Perrier", "074780000024": "Perrier", "074780000031": "Perrier",
  "074780000109": "Perrier", "074780000116": "Perrier", "074780000123": "Perrier",
  // San Pellegrino
  "041508800013": "San Pellegrino", "041508800020": "San Pellegrino", "041508800037": "San Pellegrino",
  "041508800105": "San Pellegrino", "041508800112": "San Pellegrino", "041508800129": "San Pellegrino",
  // Mountain Valley
  "07464400001": "Mountain Valley", "074644000028": "Mountain Valley", "074644000035": "Mountain Valley",
  // Icelandic Glacial
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
    {name:"Lead",level:18.4,limit:15,unit:"ppb",risk:"high",category:"Heavy Metal",detail:"EXCEEDS LEGAL LIMIT. 400,000+ lead service lines — most of any US city.",removed:true},
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

// ─── GENERIC DATA FOR UNKNOWN CITIES ─────────────────────────────────────────
const GENERIC_DATA = (city) => ({ 
  utility:`${city} Municipal Water`, 
  source:"Municipal Supply", 
  tds:280, 
  ph:7.6, 
  hardness:"Moderate", 
  contaminants:[
    {name:"PFAS (Forever Chemicals)",level:2.4,limit:0.004,unit:"ppt",risk:"high",category:"Forever Chemicals",detail:"Found in 45% of US tap water.",removed:true},
    {name:"Chromium-6",level:0.19,limit:0.10,unit:"ppb",risk:"high",category:"Heavy Metal",detail:"Found in 75% of US drinking water.",removed:true},
    {name:"Lead",level:4.2,limit:15,unit:"ppb",risk:"medium",category:"Heavy Metal",detail:"No safe level. Aging infrastructure.",removed:true},
    {name:"Microplastics",level:"Detected",limit:"None set",unit:"",risk:"medium",category:"Emerging Contaminant",detail:"94% of US tap water.",removed:true},
  ]
});

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

// ─── RISK CONSTANTS ──────────────────────────────────────────────────────────
const RISK_COLOR = {high:"#D93025",medium:"#F29423",low:"#1E8A4C"};
const RISK_BG = {high:"#FFF3F2",medium:"#FFF8EE",low:"#F0FAF4"};
const RISK_LABEL = {high:"HIGH CONCERN",medium:"DETECTED",low:"WITHIN LIMITS"};

// ─── UTILITY FUNCTIONS ───────────────────────────────────────────────────────
function getRiskScore(c){
  if(!c)return 0;
  return Math.min(100,c.filter(x=>x.risk==="high").length*22+c.filter(x=>x.risk==="medium").length*11+10);
}

// ─── RISK GAUGE COMPONENT (Animated Semicircle) ──────────────────────────────
function RiskGauge({score,animated}){
  const [d,setD]=useState(0);
  
  useEffect(()=>{
    if(!animated){setD(score);return;}
    let s=0;
    const t=setInterval(()=>{
      s+=2;
      if(s>=score){setD(score);clearInterval(t);}
      else setD(s);
    },16);
    return()=>clearInterval(t);
  },[score,animated]);
  
  const angle=(d/100)*180-90;
  const color=d>66?"#D93025":d>33?"#F29423":"#1E8A4C";
  const label=d>66?"HIGH RISK":d>33?"MODERATE":"LOW RISK";
  
  return(
    <div style={{position:"relative",width:150,height:85,margin:"0 auto"}}>
      <svg width="150" height="85" viewBox="0 0 150 85">
        <path d="M 12 78 A 63 63 0 0 1 138 78" fill="none" stroke="#1E3A5F" strokeWidth="10" strokeLinecap="round"/>
        <path d="M 12 78 A 63 63 0 0 1 50 20" fill="none" stroke="#1E8A4C" strokeWidth="10" strokeLinecap="round" opacity="0.7"/>
        <path d="M 50 20 A 63 63 0 0 1 100 20" fill="none" stroke="#F29423" strokeWidth="10" strokeLinecap="round" opacity="0.7"/>
        <path d="M 100 20 A 63 63 0 0 1 138 78" fill="none" stroke="#D93025" strokeWidth="10" strokeLinecap="round" opacity="0.7"/>
        <line 
          x1="75" y1="78" 
          x2={75+48*Math.cos((angle-90)*Math.PI/180)} 
          y2={78+48*Math.sin((angle-90)*Math.PI/180)} 
          stroke={color} strokeWidth="2.5" strokeLinecap="round" 
          style={{transition:"all 0.016s linear"}}
        />
        <circle cx="75" cy="78" r="5" fill={color}/>
        <circle cx="75" cy="78" r="9" fill={color} opacity="0.2"/>
      </svg>
      <div style={{position:"absolute",bottom:0,left:0,right:0,textAlign:"center"}}>
        <div style={{fontSize:22,fontWeight:900,color,lineHeight:1}}>{d}</div>
        <div style={{fontSize:8,fontWeight:800,color,letterSpacing:"1.5px"}}>{label}</div>
      </div>
    </div>
  );
}

// ─── WTR HUB FILTRATION ANIMATION ────────────────────────────────────────────
function WTRHubAnimation({contaminants,active}){
  const [step,setStep]=useState(0);
  const [pidx,setPidx]=useState(0);
  const stages=[
    {id:"CP",color:"#51B0E6",desc:"Sediment & Carbon"},
    {id:"RO",color:"#2A8FCA",desc:"0.0001μ Filtration"},
    {id:"TC",color:"#1A6B99",desc:"Final Polish"},
    {id:"ALK",color:"#1E8A4C",desc:"Mineral Infusion"}
  ];
  const removed=contaminants?.filter(c=>c.removed)||[];
  
  useEffect(()=>{
    if(!active)return;
    const t=setInterval(()=>{
      setStep(s=>(s+1)%stages.length);
      setPidx(p=>(p+1)%Math.max(removed.length,1));
    },1400);
    return()=>clearInterval(t);
  },[active,removed.length,stages.length]);
  
  const cur=removed[pidx];
  
  return(
    <div style={{padding:"8px 0"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:0,marginBottom:10}}>
        <div style={{textAlign:"center",minWidth:40}}>
          <div style={{width:34,height:34,borderRadius:"50%",margin:"0 auto 3px",background:"#F0F1F3",border:"2px solid #A6A8AB",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Icon name="tap" size={18} color="#A6A8AB"/>
          </div>
          <div style={{fontSize:7,color:"#A6A8AB"}}>TAP</div>
        </div>
        <div style={{color:"#C8E2F4",fontSize:12,margin:"0 2px",paddingBottom:14}}>→</div>
        {stages.map((s,i)=>(
          <div key={s.id} style={{display:"flex",alignItems:"center"}}>
            <div style={{textAlign:"center"}}>
              <div style={{
                width:40,height:40,borderRadius:8,margin:"0 auto 3px",
                background:step===i?`linear-gradient(135deg,${s.color},${s.color}cc)`:"#F0F1F3",
                border:`2px solid ${step===i?s.color:"#C8E2F4"}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:8,fontWeight:900,color:step===i?"#fff":s.color,
                transition:"all 0.4s",
                boxShadow:step===i?`0 0 12px ${s.color}55`:"none"
              }}>{s.id}</div>
              <div style={{fontSize:7,color:step===i?s.color:"#A6A8AB",whiteSpace:"nowrap"}}>{s.desc}</div>
            </div>
            {i<stages.length-1&&<div style={{color:"#C8E2F4",fontSize:11,margin:"0 2px",paddingBottom:14}}>→</div>}
          </div>
        ))}
        <div style={{color:"#C8E2F4",fontSize:12,margin:"0 2px",paddingBottom:14}}>→</div>
        <div style={{textAlign:"center",minWidth:40}}>
          <div style={{width:34,height:34,borderRadius:"50%",margin:"0 auto 3px",background:"linear-gradient(135deg,#51B0E6,#2A8FCA)",display:"flex",alignItems:"center",justifyContent:"center",animation:"pulse 2s ease-in-out infinite"}}>
            <Icon name="sparkle" size={18} color="#FFFFFF" active/>
          </div>
          <div style={{fontSize:7,color:"#51B0E6",fontWeight:800}}>PURE</div>
        </div>
      </div>
      {cur&&active&&(
        <div style={{background:RISK_BG[cur.risk],border:`1px solid ${RISK_COLOR[cur.risk]}33`,borderRadius:8,padding:"8px 12px",display:"flex",alignItems:"center",gap:8,animation:"fadeSlideIn 0.4s ease"}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:RISK_COLOR[cur.risk],flexShrink:0,boxShadow:`0 0 6px ${RISK_COLOR[cur.risk]}`}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:10,fontWeight:700,color:"#1A202C"}}>Removing: <span style={{color:RISK_COLOR[cur.risk]}}>{cur.name}</span></div>
            <div style={{fontSize:9,color:"#A6A8AB",marginTop:1}}>{cur.detail?.split(".")[0]}</div>
          </div>
          <div style={{background:"#1E8A4C",color:"#fff",fontSize:8,fontWeight:900,padding:"2px 7px",borderRadius:20}}>99%+ OUT</div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,marginTop:8}}>
        {[["1,000+","Contaminants"],["99%+","PFAS"],["99%+","Heavy Metals"],["9+ pH","Alkaline"]].map(([v,l],i)=>(
          <div key={`stat-${i}`} style={{background:"#EDF6FC",borderRadius:6,padding:"7px 3px",textAlign:"center"}}>
            <div style={{fontSize:11,fontWeight:900,color:"#51B0E6",lineHeight:1}}>{v}</div>
            <div style={{fontSize:7,color:"#A6A8AB",marginTop:1}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BOTTLE SCAN VIEW IMPORTED FROM ./components/BottleScanView.js ────────────
// The new comprehensive water quality report component is imported at top of file

// ─── HEALTH/LIFETIME CALCULATOR COMPONENT ────────────────────────────────────
function HealthCalc({city,riskScore}){
  const [cups,setCups]=useState(8);
  const [years,setYears]=useState(5);
  const [persona,setPersona]=useState("adult");
  
  const personas=[
    {id:"adult",label:"Adult",iconName:"user",mult:1.0},
    {id:"child",label:"Child under 12",iconName:"user",mult:2.4},
    {id:"pregnant",label:"Pregnant",iconName:"user",mult:3.1},
    {id:"infant",label:"Infant",iconName:"user",mult:4.2}
  ];
  
  const sel=personas.find(p=>p.id===persona);
  const gallons=(cups*0.0625)*365*years;
  const bottles=Math.round(gallons*128/16.9);
  const cumScore=Math.min(100,Math.round((riskScore/100)*sel.mult*Math.log(years+1)*22));
  const cColor=cumScore>66?"#D93025":cumScore>33?"#F29423":"#1E8A4C";
  const cBg=cumScore>66?"#FFF3F2":cumScore>33?"#FFF8EE":"#F0FAF4";
  
  return(
    <div style={{background:"#FFFFFF",border:"1px solid #C8E2F4",borderRadius:14,padding:"16px",marginBottom:14}} data-testid="health-calculator">
      <div style={{fontSize:10,fontWeight:800,color:"#A6A8AB",letterSpacing:"1.5px",marginBottom:12}}>LIFETIME EXPOSURE CALCULATOR</div>
      
      {/* Persona Selection - Light gray unselected buttons */}
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}} data-testid="persona-selector">
        {personas.map(p=>(
          <button 
            key={p.id} 
            onClick={()=>setPersona(p.id)} 
            data-testid={`persona-${p.id}`}
            style={{
              background:persona===p.id?"#EDF6FC":"#F0F1F3",
              border:`1px solid ${persona===p.id?"#51B0E6":"#E4F1FA"}`,
              borderRadius:20,padding:"5px 10px",fontSize:10,cursor:"pointer",
              color:persona===p.id?"#51B0E6":"#A6A8AB",
              fontWeight:persona===p.id?800:400,
              display:"flex",alignItems:"center",gap:4
            }}
          >
            <Icon name={p.iconName} size={12} color={persona===p.id?"#51B0E6":"#A6A8AB"}/> {p.label}
          </button>
        ))}
      </div>
      
      {/* Sliders */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        <div>
          <div style={{fontSize:9,color:"#A6A8AB",marginBottom:5}}>Cups/day: <strong style={{color:"#0A1A2E"}}>{cups}</strong></div>
          <input 
            type="range" min="2" max="20" value={cups} 
            onChange={e=>setCups(Number(e.target.value))} 
            data-testid="cups-slider"
            style={{width:"100%",accentColor:"#51B0E6"}}
          />
        </div>
        <div>
          <div style={{fontSize:9,color:"#A6A8AB",marginBottom:5}}>Years: <strong style={{color:"#0A1A2E"}}>{years}</strong></div>
          <input 
            type="range" min="1" max="30" value={years} 
            onChange={e=>setYears(Number(e.target.value))} 
            data-testid="years-slider"
            style={{width:"100%",accentColor:"#51B0E6"}}
          />
        </div>
      </div>
      
      {/* Results */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        <div style={{background:"#FFF3F2",borderRadius:9,padding:"10px",textAlign:"center"}}>
          <div style={{fontSize:18,fontWeight:900,color:"#D93025"}}>{gallons.toFixed(0)}</div>
          <div style={{fontSize:8,color:"#A6A8AB"}}>gallons consumed</div>
        </div>
        <div style={{background:"#FFF8EE",borderRadius:9,padding:"10px",textAlign:"center"}}>
          <div style={{fontSize:18,fontWeight:900,color:"#F29423"}}>{bottles.toLocaleString()}</div>
          <div style={{fontSize:8,color:"#A6A8AB"}}>bottle equiv.</div>
        </div>
        <div style={{background:cBg,borderRadius:9,padding:"10px",textAlign:"center"}} data-testid="cumulative-risk">
          <div style={{fontSize:18,fontWeight:900,color:cColor}}>{cumScore}</div>
          <div style={{fontSize:8,color:"#A6A8AB"}}>cumulative risk</div>
        </div>
      </div>
      
      {/* Warning */}
      {cumScore>50&&(
        <div style={{background:"#FFF3F2",borderRadius:7,padding:"9px 11px",marginTop:10,fontSize:10,color:"#742A2A",lineHeight:1.6}} data-testid="risk-warning">
          ⚠ {sel.icon} {sel.label} faces <strong>elevated long-term risk</strong> from {city?.split(",")[0]||"your city"}'s contaminants.
        </div>
      )}
    </div>
  );
}

// ─── NAVIGATION ICON COMPONENT ───────────────────────────────────────────────
function NavIcon({id,active}){
  const ic=active?"#51B0E6":"#A6A8AB";
  const glow=active?"#51B0E620":"transparent";
  
  if(id==="tbv") return(
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="11" fill={glow}/>
      <path d="M7 9V6.5C7 6.22 7.22 6 7.5 6H10" stroke={ic} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 6H20.5C20.78 6 21 6.22 21 6.5V9" stroke={ic} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 19V21.5C21 21.78 20.78 22 20.5 22H18" stroke={ic} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 22H7.5C7.22 22 7 21.78 7 21.5V19" stroke={ic} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="9" y1="14" x2="19" y2="14" stroke={active?"#51B0E6":ic} strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="14" y1="10" x2="14" y2="18" stroke={active?"#51B0E6":ic} strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );

  if(id==="wtr-intel") return(
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="11" fill={glow}/>
      <circle cx="13" cy="12" r="5.5" stroke={ic} strokeWidth="1.5" fill="none"/>
      <line x1="17" y1="16" x2="21" y2="20" stroke={ic} strokeWidth="2" strokeLinecap="round"/>
      <line x1="11" y1="14.5" x2="11" y2="12" stroke={active?"#51B0E6":ic} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="13" y1="14.5" x2="13" y2="10" stroke={active?"#51B0E6":ic} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="15" y1="14.5" x2="15" y2="11.5" stroke={active?"#51B0E6":ic} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );

  if(id==="wtr-btl") return(
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="11" fill={glow}/>
      <path d="M11 5V13L6.5 20.5C6.5 20.5 6 23 9 23H19C22 23 21.5 20.5 21.5 20.5L17 13V5" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      <line x1="10" y1="5" x2="18" y2="5" stroke={ic} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M9 19.5C9 19.5 11 17.5 14 18.5C17 19.5 19 18 19 18" stroke={active?"#51B0E6":ic} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <circle cx="12" cy="21" r="1.2" fill={active?"#51B0E6":ic}/>
    </svg>
  );

  if(id==="wtr-hub") return(
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="11" fill={glow}/>
      <path d="M5 14L14 6L23 14" stroke={ic} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M8 12V22C8 22.55 8.45 23 9 23H19C19.55 23 20 22.55 20 22V12" stroke={ic} strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
      <path d="M14 13L11.5 17C11.5 18.38 12.62 19.5 14 19.5C15.38 19.5 16.5 18.38 16.5 17L14 13Z" fill={active?"#51B0E6":ic} opacity="0.7"/>
      <line x1="14" y1="19.5" x2="14" y2="21.5" stroke={active?"#51B0E6":ic} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
  
  return null;
}

// ─── UNIFIED ICON COMPONENT LIBRARY ──────────────────────────────────────────
// All icons use consistent stroke-based style matching the navigation
function Icon({name, size=20, color="#A6A8AB", active=false}) {
  const ic = active ? "#51B0E6" : color;
  const s = size;
  
  const icons = {
    // Location & Address
    home: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 3L2 11H4.5V20H9.5V14H14.5V20H19.5V11H22L12 3Z" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
        <path d="M12 9C12 9 10 11.5 10 12.5C10 13.6 10.9 14.5 12 14.5C13.1 14.5 14 13.6 14 12.5C14 11.5 12 9 12 9Z" fill={active?ic:"none"} stroke={ic} strokeWidth="1.2"/>
      </svg>
    ),
    pin: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" stroke={ic} strokeWidth="1.5" fill="none"/>
        <circle cx="12" cy="9" r="2.5" stroke={ic} strokeWidth="1.5" fill={active?ic:"none"}/>
      </svg>
    ),
    city: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M3 21H21" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M5 21V7L10 4V21" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
        <path d="M10 21V10H15V21" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
        <path d="M15 21V6H19V21" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
        <line x1="7" y1="9" x2="8" y2="9" stroke={ic} strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="7" y1="12" x2="8" y2="12" stroke={ic} strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="7" y1="15" x2="8" y2="15" stroke={ic} strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="12" y1="13" x2="13" y2="13" stroke={ic} strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="12" y1="16" x2="13" y2="16" stroke={ic} strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="17" y1="9" x2="17" y2="9" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="17" y1="12" x2="17" y2="12" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    lock: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="5" y="10" width="14" height="11" rx="2" stroke={ic} strokeWidth="1.5" fill="none"/>
        <path d="M8 10V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V10" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="15" r="1.5" fill={ic}/>
        <line x1="12" y1="16.5" x2="12" y2="18" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    // Scanning & Search
    scan: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M3 7V5C3 3.9 3.9 3 5 3H7" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M17 3H19C20.1 3 21 3.9 21 5V7" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M21 17V19C21 20.1 20.1 21 19 21H17" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7 21H5C3.9 21 3 20.1 3 19V17" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="4" stroke={ic} strokeWidth="1.5" fill="none"/>
        <circle cx="12" cy="12" r="1.5" fill={ic}/>
      </svg>
    ),
    search: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke={ic} strokeWidth="1.5" fill="none"/>
        <line x1="16" y1="16" x2="21" y2="21" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    camera: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M3 8C3 6.9 3.9 6 5 6H7L9 4H15L17 6H19C20.1 6 21 6.9 21 8V18C21 19.1 20.1 20 19 20H5C3.9 20 3 19.1 3 18V8Z" stroke={ic} strokeWidth="1.5" fill="none"/>
        <circle cx="12" cy="13" r="4" stroke={ic} strokeWidth="1.5" fill="none"/>
        <circle cx="12" cy="13" r="1.5" fill={ic}/>
      </svg>
    ),
    text: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M4 7V5H20V7" stroke={ic} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="5" x2="12" y2="19" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 19H16" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    // Water & Drops
    drop: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 3C12 3 6 10 6 14C6 17.31 8.69 20 12 20C15.31 20 18 17.31 18 14C18 10 12 3 12 3Z" stroke={ic} strokeWidth="1.5" fill={active?`${ic}20`:"none"}/>
        <path d="M9 14C9 14 10 12 12 12" stroke={ic} strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    droplet: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2C12 2 5 10 5 14.5C5 18.64 8.13 22 12 22C15.87 22 19 18.64 19 14.5C19 10 12 2 12 2Z" stroke={ic} strokeWidth="1.5" fill="none"/>
        <path d="M12 19C14.21 19 16 17.21 16 15" stroke={ic} strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    tap: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2V6" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="8" y="6" width="8" height="4" rx="1" stroke={ic} strokeWidth="1.5" fill="none"/>
        <path d="M10 10V12C10 12 10 14 12 14C14 14 14 12 14 12V10" stroke={ic} strokeWidth="1.5"/>
        <path d="M12 14V16" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 18C12 18 9 19 9 21H15C15 19 12 18 12 18Z" stroke={ic} strokeWidth="1.5" fill="none"/>
      </svg>
    ),
    sparkle: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill={active?`${ic}30`:"none"}/>
        <circle cx="19" cy="5" r="1.5" stroke={ic} strokeWidth="1" fill="none"/>
        <circle cx="5" cy="18" r="1" stroke={ic} strokeWidth="1" fill="none"/>
      </svg>
    ),
    // Hazard & Warning  
    hazard: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L22 20H2L12 2Z" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
        <line x1="12" y1="9" x2="12" y2="14" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="17" r="1" fill={ic}/>
      </svg>
    ),
    alert: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={ic} strokeWidth="1.5" fill="none"/>
        <line x1="12" y1="8" x2="12" y2="13" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="16" r="1" fill={ic}/>
      </svg>
    ),
    shield: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 6V11C4 16.5 7.5 21.25 12 22.5C16.5 21.25 20 16.5 20 11V6L12 2Z" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
        <path d="M9 12L11 14L15 10" stroke={ic} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    // Science & Lab
    flask: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M9 3V10L4 18C3.5 19 4 20 5 20H19C20 20 20.5 19 20 18L15 10V3" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
        <line x1="8" y1="3" x2="16" y2="3" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7 15H17" stroke={ic} strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    atom: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="2" fill={ic}/>
        <ellipse cx="12" cy="12" rx="9" ry="4" stroke={ic} strokeWidth="1.3" fill="none"/>
        <ellipse cx="12" cy="12" rx="9" ry="4" stroke={ic} strokeWidth="1.3" fill="none" transform="rotate(60 12 12)"/>
        <ellipse cx="12" cy="12" rx="9" ry="4" stroke={ic} strokeWidth="1.3" fill="none" transform="rotate(120 12 12)"/>
      </svg>
    ),
    // Status & Check
    check: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={ic} strokeWidth="1.5" fill="none"/>
        <path d="M8 12L11 15L16 9" stroke={ic} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    checkCircle: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#1E8A4C" strokeWidth="1.5" fill="#F0FAF4"/>
        <path d="M8 12L11 15L16 9" stroke="#1E8A4C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    // Misc
    bell: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M18 8C18 6.4 17.4 4.9 16.2 3.8C15.1 2.6 13.6 2 12 2C10.4 2 8.9 2.6 7.8 3.8C6.6 4.9 6 6.4 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
        <path d="M13.7 21C13.5 21.4 13 21.6 12.5 21.7C12 21.8 11.4 21.7 11 21.5C10.5 21.2 10.2 20.8 10 20.3" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    email: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke={ic} strokeWidth="1.5" fill="none"/>
        <path d="M3 7L12 13L21 7" stroke={ic} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    filter: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M4 4H20L14 12V18L10 20V12L4 4Z" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
    info: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={ic} strokeWidth="1.5" fill="none"/>
        <line x1="12" y1="11" x2="12" y2="16" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="8" r="1" fill={ic}/>
      </svg>
    ),
    book: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M4 4C4 4 5 3 8 3C11 3 12 4.5 12 4.5C12 4.5 13 3 16 3C19 3 20 4 20 4V19C20 19 19 18 16 18C13 18 12 19.5 12 19.5C12 19.5 11 18 8 18C5 18 4 19 4 19V4Z" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
        <line x1="12" y1="5" x2="12" y2="19" stroke={ic} strokeWidth="1.5"/>
      </svg>
    ),
    user: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke={ic} strokeWidth="1.5" fill="none"/>
        <path d="M4 20C4 16.69 7.58 14 12 14C16.42 14 20 16.69 20 20" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    settings: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke={ic} strokeWidth="1.5" fill="none"/>
        <path d="M12 1V4M12 20V23M4.22 4.22L6.34 6.34M17.66 17.66L19.78 19.78M1 12H4M20 12H23M4.22 19.78L6.34 17.66M17.66 6.34L19.78 4.22" stroke={ic} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  };
  
  return icons[name] || null;
}

// ─── ANALYTICS HELPER ────────────────────────────────────────────────────────
function generateSessionId() {
  const id = 'wtr_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now().toString(36);
  try { sessionStorage.setItem('wtr_session_id', id); } catch(e) {}
  return id;
}

function getSessionId() {
  try { return sessionStorage.getItem('wtr_session_id') || generateSessionId(); } catch(e) { return generateSessionId(); }
}

function trackEvent(eventName, properties = {}) {
  const base = {
    session_id: getSessionId(),
    app_version: '2.0',
    timestamp: new Date().toISOString()
  };
  try { window.posthog?.capture(eventName, { ...base, ...properties }); } catch(e) {}
}

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
  // ── Founder Demo Mode ──────────────────────────────────────────────────────
  const [founderMode,setFounderMode]=useState(()=>{
    try{return localStorage.getItem('wtr_founder_mode')==='true';}catch(e){return false;}
  });
  const [showFounderLogin,setShowFounderLogin]=useState(false);
  const [founderPin,setFounderPin]=useState('');
  const [founderPinError,setFounderPinError]=useState('');
  const founderLongPressRef=useRef(null);
  const FOUNDER_PIN='0808'; // Micah's access PIN
  
  function handleFounderLogin(pin){
    const checkPin = pin || founderPin;
    if(checkPin===FOUNDER_PIN){
      setFounderMode(true);
      setShowFounderLogin(false);
      setFounderPin('');
      setFounderPinError('');
      try{localStorage.setItem('wtr_founder_mode','true');}catch(e){}
      trackEvent('founder_mode_activated');
    } else {
      setFounderPinError('Invalid PIN');
      setFounderPin('');
    }
  }
  function handleFounderLogout(){
    setFounderMode(false);
    setTab('tbv');
    try{localStorage.removeItem('wtr_founder_mode');}catch(e){}
  }
  const [inputError, setInputError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [engagementPhase, setEngagementPhase] = useState("idle"); // "idle" | "push_prompt" | "household" | "complete"
  const [householdProfile, setHouseholdProfile] = useState({ has_children: null, is_pregnant: null, has_filter: null });
  const [pushResult, setPushResult] = useState(null);
  const [capturedProspectId, setCapturedProspectId] = useState(null);
  // Monthly Water Report opt-in state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportOptInStatus, setReportOptInStatus] = useState(() => { try { return localStorage.getItem('wtr_report_status') || 'none'; } catch(e) { return 'none'; } });
  const [reportOptInEmail, setReportOptInEmail] = useState(() => { try { return localStorage.getItem('wtr_report_email') || ''; } catch(e) { return ''; } });
  const [reportModalScreen, setReportModalScreen] = useState('form'); // 'form' | 'success'
  const [reportEmail, setReportEmail] = useState('');
  const [reportZip, setReportZip] = useState('');
  const [reportEmailError, setReportEmailError] = useState('');
  const [reportZipError, setReportZipError] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSubmitError, setReportSubmitError] = useState('');
  const inputRef=useRef(null);

  useEffect(() => { registerServiceWorker(); }, []);

  // Monthly Water Report — consent text & status check
  const REPORT_CONSENT_TEXT = 'By submitting your email, you agree to receive a free Monthly Water Intelligence Report from Generosity\u2122 Water based on your zip code. Your report is generated by the Generosity\u2122 Water Intelligence Engine (WIQ\u2122) and includes local water quality data, contaminant alerts, and relevant news for your area. You can unsubscribe at any time by clicking the unsubscribe link in any email. We do not sell your email address. View our Privacy Policy at generositywater.com/privacy.';
  const REPORT_CONSENT_VERSION = 'v1.0.0-2026-04-08';

  useEffect(() => {
    // Check report opt-in status on mount if we have a stored email
    const storedEmail = reportOptInEmail;
    const storedZip = data?.zip || '';
    if (storedEmail && storedZip) {
      fetch(`https://generosity-dashboard.vercel.app/api/water-report/status?email=${encodeURIComponent(storedEmail)}&zip=${encodeURIComponent(storedZip)}`)
        .then(r => r.json())
        .then(d => {
          if (d.status && d.status !== reportOptInStatus) {
            setReportOptInStatus(d.status);
            try { localStorage.setItem('wtr_report_status', d.status); } catch(e) {}
          }
        })
        .catch(() => {});
    }
  }, [data?.zip]);

  function handleReportSubscribe() {
    // Validate email
    let hasErr = false;
    if (!reportEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reportEmail)) {
      setReportEmailError('Please enter a valid email address');
      hasErr = true;
    } else { setReportEmailError(''); }
    // Validate zip
    const cleanZip = reportZip.replace(/\D/g, '').slice(0, 5);
    if (!cleanZip || !/^\d{5}$/.test(cleanZip)) {
      setReportZipError('Please enter a 5-digit ZIP code');
      hasErr = true;
    } else { setReportZipError(''); }
    if (hasErr) return;

    setReportSubmitting(true);
    setReportSubmitError('');

    fetch('https://generosity-dashboard.vercel.app/api/water-report/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
        if (d.error) {
          setReportSubmitError(d.error);
          return;
        }
        // Success — update state
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

  const SCAN_STEPS=[
    "Locating water utility...",
    "Querying EPA SDWIS database...",
    "Cross-referencing EWG Tap Water database...",
    "Analyzing contaminant levels...",
    "Comparing to health guidelines...",
    "Generating your intelligence report..."
  ];
  
  function resolveCity(raw){
    const s=raw.trim().toLowerCase();
    // Check ZIP code first
    if(/^\d{5}$/.test(s)) return ZIP_MAP[s]||null;
    // Check if input contains a known city name
    return Object.keys(CITY_DATA).find(k=>{
      const cityName = k.split(",")[0].toLowerCase().trim();
      return s.includes(cityName);
    })||null;
  }
  
  function startScan(directInput){
    const scanInput = (typeof directInput === 'string') ? directInput : input;
    setInputError("");

    if(!scanInput || !scanInput.trim()){
      setInputError(
        inputMode === "address" ? "Enter your address to scan" :
        inputMode === "zip"     ? "Enter a ZIP code to scan"  :
                                  "Enter a city and state to scan"
      );
      inputRef.current?.classList.add('input-error');
      setTimeout(() => inputRef.current?.classList.remove('input-error'), 400);
      return;
    }

    // Prevent double-fire
    if(isScanning) return;
    setIsScanning(true);

    // Sanitize input (basic — strip HTML tags)
    const cleanInput = scanInput.replace(/<[^>]*>/g, '').trim().slice(0, 100);

    // Track scan started
    trackEvent('scan_started', { input_mode: inputMode, input_length: cleanInput.length });

    setPhase("scanning");
    setScanStep(0);
    let step=0;
    const t=setInterval(()=>{
      step++;
      setScanStep(step);
      if(step>=SCAN_STEPS.length){
        clearInterval(t);
        setTimeout(async()=>{
          const city=resolveCity(cleanInput);
          if(city){
            // Local city data hit
            const raw=CITY_DATA[city];
            setData({...raw,city:city});
            setPhase("results");
            setTab("wtr-intel");
            trackEvent('scan_completed', { city, risk_score: getRiskScore(raw.contaminants), contaminant_count: raw.contaminants?.length, source:'local' });
            setTimeout(()=>{setShowHub(true);setGaugeOn(true);},300);
            setTimeout(()=>setAnimating(true),700);
            setIsScanning(false);
            return;
          }
          
          // No local data — try WTR-ORACLE live EPA lookup
          const zipMatch = cleanInput.match(/\d{5}/);
          if(zipMatch){
            try {
              const oracleRes = await fetch(`https://generosity-dashboard.vercel.app/api/wtr/report?zip=${zipMatch[0]}`);
              if(oracleRes.ok){
                const report = await oracleRes.json();
                if(report && report.utility && report.status !== 'not_found'){
                  // Build city label from report data
                  const cityLabel = `${report.utility} · ${zipMatch[0]}`;
                  setData({...report, city: cityLabel, zip: zipMatch[0]});
                  setPhase("results");
                  setTab("wtr-intel");
                  trackEvent('scan_completed', { city: cityLabel, zip: zipMatch[0], risk_score: getRiskScore(report.contaminants), contaminant_count: report.contaminants?.length, source:'wtr-oracle' });
                  setTimeout(()=>{setShowHub(true);setGaugeOn(true);},300);
                  setTimeout(()=>setAnimating(true),700);
                  setIsScanning(false);
                  return;
                }
              }
            } catch(e){
              console.warn('[WTR-ORACLE] Lookup failed:', e.message);
            }
          }
          
          // Neither local nor WTR-ORACLE had data
          trackEvent('scan_location_not_found', { input: cleanInput.slice(0,20) });
          setPhase("not_found");
          setIsScanning(false);
        },300);
      }
    },480);
  }
  
  // ── Email capture handler — sends to backend proxy ──
  async function handleEmailSubmit(scanPhase) {
    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    // Optimistic UI
    setSubmitted(true);
    trackEvent('email_captured', { city: data?.city, risk_score: data ? getRiskScore(data.contaminants) : 0, scan_phase: scanPhase });

    // Start engagement flow after short delay
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

      const resp = await fetch('https://generosity-dashboard.vercel.app/api/wtr/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const result = await resp.json();
      if (result.prospect_id) setCapturedProspectId(result.prospect_id);
    } catch (err) {
      // DLQ: save to localStorage for retry
      try {
        const dlq = JSON.parse(localStorage.getItem('wtr_capture_dlq') || '[]');
        dlq.push({ email: emailTrimmed, city: data?.city || input, ts: Date.now(), scan_phase: scanPhase });
        localStorage.setItem('wtr_capture_dlq', JSON.stringify(dlq.slice(-20)));
      } catch (e) {}
      console.warn('[WTR Capture] Failed, queued for retry:', err.message);
    }
  }

  const riskScore=data?getRiskScore(data.contaminants):0;
  const highRisk=data?.contaminants.filter(c=>c.risk==="high")||[];
  
  const navTabs=[
    {id:"tbv",label:"Trust but Verify\u2122"},
    {id:"wtr-intel",label:"WTR INTEL",badge:data?riskScore:null},
    // WTR BTL + WTR HUB only visible in founder demo mode
    ...(founderMode ? [
      {id:"wtr-btl",label:"WTR BTL"},
      {id:"wtr-hub",label:"WTR HUB"}
    ] : [])
  ];
  
  return(
    <div style={{minHeight:"100vh",background:"#FFFFFF",fontFamily:"'Nunito','Helvetica Neue',sans-serif",maxWidth:480,margin:"0 auto",position:"relative",display:"flex",flexDirection:"column"}} data-testid="trust-but-verify-app">
      
      {/* GLOBAL STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes fadeSlideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.08);opacity:0.8}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
        @keyframes ripple{0%{transform:scale(0.9);opacity:0.8}100%{transform:scale(2.2);opacity:0}}
        @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes scanLine{0%{top:0}50%{top:calc(100% - 3px)}100%{top:0}}
        .tbv-card{animation:slideUp 0.4s ease forwards}
        input:focus{outline:none;border-color:#51B0E6!important;box-shadow:0 0 0 3px #51B0E622!important}
        button:active{opacity:0.85;transform:scale(0.98)}
        button:hover{opacity:0.95}
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }
        .input-error { animation: shake 0.35s ease; border-color: #FF3B30 !important; }
      `}</style>

      {/* HEADER - White */}
      {tab!=="wtr-btl"&&tab!=="wtr-hub"&&(
      <div style={{background:"#FFFFFF",borderBottom:"1px solid #E4F1FA",padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 8px rgba(166,168,171,0.12)"}} data-testid="app-header">
        <img 
          src="/generosity-logo.png" 
          alt="Generosity Water Intelligence" 
          style={{height:36,width:"auto",cursor:"pointer"}}
          onClick={()=>{setPhase("landing");setTab("tbv");setData(null);setSubmitted(false);setEngagementPhase("idle");setInput("");setInputError("");window.scrollTo(0,0);}}
          onTouchStart={()=>{founderLongPressRef.current=setTimeout(()=>setShowFounderLogin(true),3000);}}
          onTouchEnd={()=>{clearTimeout(founderLongPressRef.current);}}
          onMouseDown={()=>{founderLongPressRef.current=setTimeout(()=>setShowFounderLogin(true),3000);}}
          onMouseUp={()=>{clearTimeout(founderLongPressRef.current);}}
        />
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {founderMode&&<div style={{background:"linear-gradient(135deg,#0A1A2E,#1a3a5c)",color:"#51B0E6",padding:"4px 8px",borderRadius:20,fontSize:8,fontWeight:800,letterSpacing:"0.5px",border:"1px solid #51B0E633",cursor:"pointer"}} onClick={handleFounderLogout} title="Tap to exit demo mode">FOUNDER</div>}
          {data&&<div style={{background:riskScore>66?"#FFF3F2":riskScore>33?"#FFF8EE":"#F0FAF4",border:`1px solid ${riskScore>66?"#D93025":riskScore>33?"#F29423":"#1E8A4C"}33`,color:riskScore>66?"#D93025":riskScore>33?"#F29423":"#1E8A4C",padding:"4px 10px",borderRadius:20,fontSize:10,fontWeight:800}} data-testid="header-risk-score">Score: {riskScore}</div>}
          <button 
            style={{width:36,height:36,borderRadius:"50%",background:"#F0F1F3",border:"1px solid #E4F1FA",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}
            data-testid="profile-btn"
            onClick={()=>setShowProfile(true)}
          >
            <Icon name="user" size={20} color="#A6A8AB"/>
          </button>
        </div>
      </div>
      )}

      {/* CONTENT AREA */}
      <div style={{flex:1,overflowY:"auto",paddingBottom:80}}>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TBV TAB — Home + Scan combined */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {tab==="tbv"&&(
          <div data-testid="tbv-tab">
            {/* Segmented toggle */}
            <div style={{padding:"14px 16px 0",position:"sticky",top:0,zIndex:50,background:"#FFFFFF"}}>
              <div data-testid="tbv-toggle" style={{display:"flex",background:"#F0F1F3",borderRadius:12,padding:3,gap:3}}>
                {[{id:"home",label:"Home Water"},{id:"scan",label:"Bottle Scan"}].map(v=>{
                  const on=tbvView===v.id;
                  return(
                    <button key={v.id} onClick={()=>setTbvView(v.id)} data-testid={`tbv-toggle-${v.id}`} style={{flex:1,padding:"9px 0",borderRadius:10,border:"none",background:on?"#FFFFFF":"transparent",color:on?"#0A1A2E":"#A6A8AB",fontSize:12,fontWeight:on?800:600,cursor:"pointer",boxShadow:on?"0 1px 4px rgba(0,0,0,0.1)":"none",transition:"all 0.2s ease"}}>
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Home Water sub-view ── */}
            {tbvView==="home"&&phase==="landing"&&(
              <div style={{padding:"28px 20px 20px"}} data-testid="home-landing">
                <div style={{textAlign:"center",marginBottom:24}}>
                  <h1 style={{fontSize:24,fontWeight:900,color:"#0A1A2E",lineHeight:1.1,marginBottom:10,letterSpacing:"-1px",whiteSpace:"nowrap"}}>
                    What's <span style={{color:"#51B0E6"}}>actually</span> in your water?
                  </h1>
              <p style={{fontSize:13,color:"#A6A8AB",lineHeight:1.5,maxWidth:360,margin:"0 auto 18px"}}>
                Get a free water intelligence report — see every contaminant detected at <strong style={{color:"#0A1A2E"}}>your exact address</strong>, and the long-term risks if nothing changes.
              </p>
              
              {/* Input Mode Toggle */}
              <div style={{display:"flex",background:"#F0F1F3",borderRadius:10,padding:3,maxWidth:320,margin:"0 auto 10px",gap:2}} data-testid="input-mode-toggle">
                {[
                  {id:"address",iconName:"home",label:"My Address"},
                  {id:"zip",iconName:"pin",label:"ZIP Code"},
                  {id:"city",iconName:"city",label:"City"}
                ].map(m=>(
                  <button 
                    key={m.id} 
                    onClick={()=>{setInputMode(m.id);setInput("");}}
                    data-testid={`input-mode-${m.id}`}
                    style={{
                      flex:1,
                      background:inputMode===m.id?"#FFFFFF":"transparent",
                      border:inputMode===m.id?"1px solid #C8E2F4":"1px solid transparent",
                      borderRadius:8,padding:"7px 4px",fontSize:10,
                      fontWeight:inputMode===m.id?800:500,
                      color:inputMode===m.id?"#51B0E6":"#A6A8AB",
                      cursor:"pointer",
                      boxShadow:inputMode===m.id?"0 1px 4px rgba(81,176,230,0.12)":"none",
                      transition:"all 0.2s",
                      display:"flex",alignItems:"center",justifyContent:"center",gap:4
                    }}
                  >
                    <Icon name={m.iconName} size={14} color={inputMode===m.id?"#51B0E6":"#A6A8AB"}/>{m.label}
                  </button>
                ))}
              </div>
              
              {/* Privacy Notice */}
              <div style={{display:"flex",alignItems:"center",gap:6,background:"#F0FAF4",border:"1px solid #1E8A4C33",borderRadius:8,padding:"6px 12px",maxWidth:320,margin:"0 auto 9px",fontSize:10,color:"#276749"}}>
                <Icon name="lock" size={14} color="#1E8A4C"/>
                {inputMode==="address"?"Your address is never stored. Used only to match your water utility.":"Your data is never stored. Used only to match your water utility."}
              </div>
              
              {/* Search Input */}
              <div style={{display:"flex",gap:0,borderRadius:12,overflow:"hidden",border:"2px solid #51B0E6",boxShadow:"0 4px 18px rgba(81,176,230,0.14)",maxWidth:380,margin:"0 auto"}}>
                <input 
                  ref={inputRef} 
                  value={input} 
                  onChange={e=>setInput(e.target.value)} 
                  onKeyDown={e=>e.key==="Enter"&&startScan()}
                  placeholder={
                    inputMode==="address"?"e.g. 1234 Maple St, Chicago IL":
                    inputMode==="zip"?"e.g. 60601, 78701, 90210...":
                    "e.g. Chicago, IL"
                  }
                  data-testid="address-input"
                  style={{flex:1,padding:"13px 15px",border:"none",fontSize:13,color:"#0A1A2E",background:"#FFFFFF",fontFamily:"inherit"}}
                />
                <button 
                  onClick={startScan}
                  data-testid="scan-btn"
                  style={{background:"linear-gradient(135deg,#51B0E6,#2A8FCA)",color:"#fff",border:"none",padding:"13px 16px",fontSize:11,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:5}}
                >
                  SCAN <Icon name="scan" size={14} color="#FFFFFF"/>
                </button>
              </div>
              {inputError&&<div style={{fontSize:10,color:"#D93025",marginTop:6,fontWeight:600}} data-testid="input-error">{inputError}</div>}
              <div style={{fontSize:9,color:"#C5C6C8",marginTop:7}}>Address · ZIP · City · EPA SDWIS + UCMR 5 Report</div>
            </div>
            
            {/* Stats Row - Light gray cards */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:18}}>
              {[
                ["200M+","Americans exposed to PFAS","USGS 2023"],
                ["94%","tap water has microplastics","ORB Media / Columbia"],
                ["$0","to get your report",""]
              ].map(([n,t,src])=>(
                <div key={n} style={{background:"#F0F1F3",border:"1px solid #C8E2F4",borderRadius:10,padding:"13px 8px",textAlign:"center",boxShadow:"0 2px 8px rgba(166,168,171,0.08)"}}>
                  <div style={{fontSize:19,fontWeight:900,color:"#51B0E6",lineHeight:1}}>{n}</div>
                  <div style={{fontSize:9,color:"#A6A8AB",marginTop:4,lineHeight:1.3}}>{t}</div>
                  {src&&<div style={{fontSize:7,color:"#C5C6C8",marginTop:3,fontStyle:"italic"}}>{src}</div>}
                </div>
              ))}
            </div>
            
            {/* Popular Cities */}
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:9,color:"#A6A8AB",marginBottom:8}}>POPULAR CITIES</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center"}} data-testid="popular-cities">
                {Object.keys(CITY_DATA).map(city=>(
                  <button 
                    key={city} 
                    onClick={()=>{setInput(city);setInputMode("city");startScan(city);}}
                    data-testid={`city-btn-${city.toLowerCase().replace(/[,\s]+/g,'-')}`}
                    style={{background:"#FFFFFF",border:"1px solid #C8E2F4",color:"#2A8FCA",padding:"6px 12px",borderRadius:20,fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>
            )}

            {/* ── Home Water scanning animation ── */}
            {tbvView==="home"&&phase==="scanning"&&(
          <div style={{maxWidth:360,margin:"60px auto",padding:"0 20px",textAlign:"center"}} data-testid="home-scanning">
            {/* Animated Water Drop */}
            <div style={{position:"relative",width:80,height:80,margin:"0 auto 22px"}}>
              <div style={{position:"absolute",inset:0,borderRadius:"50%",background:"#51B0E620",border:"2px solid #51B0E644",animation:"ripple 1.4s ease-out infinite"}}/>
              <div style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#51B0E6,#2A8FCA)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",zIndex:1}}>
                <Icon name="droplet" size={36} color="#FFFFFF"/>
              </div>
            </div>
            
            <h2 style={{fontSize:18,fontWeight:900,color:"#0A1A2E",marginBottom:18,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <Icon name={inputMode==="address"?"home":inputMode==="zip"?"pin":"city"} size={20} color="#51B0E6"/>
              {inputMode==="address"?"Scanning your address...":
               inputMode==="zip"?"Scanning ZIP code...":
               `Analyzing ${input}`}
            </h2>
            
            {/* Scan Steps */}
            <div style={{background:"#FFFFFF",borderRadius:12,border:"1px solid #C8E2F4",overflow:"hidden"}} data-testid="scan-steps">
              {SCAN_STEPS.map((msg,i)=>(
                <div 
                  key={i} 
                  data-testid={`scan-step-${i}`}
                  style={{
                    padding:"10px 14px",
                    display:"flex",alignItems:"center",gap:10,
                    background:i<scanStep?"#F0FFF4":i===scanStep?"#EDF6FC":"transparent",
                    borderBottom:"1px solid #C8E2F4",
                    fontSize:12,
                    color:i<scanStep?"#1E8A4C":i===scanStep?"#51B0E6":"#C5C6C8",
                    fontWeight:i===scanStep?700:400,
                    transition:"all 0.3s"
                  }}
                >
                  {i<scanStep?<Icon name="check" size={16} color="#1E8A4C"/>:
                   i===scanStep?<span style={{width:16,height:16,borderRadius:"50%",border:"2px solid #51B0E6",borderTopColor:"transparent",animation:"spin 1s linear infinite",display:"inline-block"}}/>:
                   <span style={{width:16,height:16,borderRadius:"50%",border:"2px solid #C5C6C8",display:"inline-block"}}/>}
                  {msg}
                </div>
              ))}
            </div>
          </div>
            )}

{/* ── Location Not Found — Lead Capture ── */}
{phase==="not_found"&&(
  <div style={{maxWidth:360,margin:"40px auto",padding:"0 20px",textAlign:"center"}} data-testid="not-found">
    <div style={{width:60,height:60,borderRadius:"50%",background:"#FFF8EE",border:"2px solid #F2942344",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
      <Icon name="pin" size={28} color="#F29423"/>
    </div>
    <h2 style={{fontSize:18,fontWeight:900,color:"#0A1A2E",marginBottom:8}}>We don't have data for this location yet</h2>
    <p style={{fontSize:12,color:"#A6A8AB",lineHeight:1.6,marginBottom:18}}>Enter your email and we'll notify you when data is available. We're adding 50 new cities monthly.</p>

    {!submitted?(
      <div style={{maxWidth:300,margin:"0 auto"}}>
        <input
          type="email"
          value={email}
          onChange={e=>{setEmail(e.target.value);setEmailError("");}}
          placeholder="Your email address"
          data-testid="not-found-email-input"
          style={{width:"100%",padding:"11px 13px",borderRadius:8,border:"1px solid #C8E2F4",fontSize:12,fontFamily:"inherit",background:"#FFFFFF",color:"#0A1A2E",marginBottom:8,boxSizing:"border-box"}}
        />
        {emailError&&<div style={{fontSize:10,color:"#D93025",marginBottom:6,textAlign:"left"}}>{emailError}</div>}
        <button
          onClick={()=>handleEmailSubmit('not_found')}
          data-testid="not-found-submit-btn"
          style={{width:"100%",background:"linear-gradient(135deg,#51B0E6,#2A8FCA)",color:"#fff",border:"none",padding:"11px",borderRadius:8,fontSize:11,fontWeight:800,cursor:"pointer",boxSizing:"border-box"}}
        >
          NOTIFY ME WHEN AVAILABLE →
        </button>
      </div>
    ):(
      <div style={{textAlign:"center",padding:"10px 0"}} data-testid="not-found-success">
        <div style={{fontSize:22,marginBottom:5}}>✓</div>
        <div style={{fontSize:12,fontWeight:700,color:"#1E8A4C"}}>You're on the list!</div>
        <div style={{fontSize:10,color:"#A6A8AB",marginTop:3}}>We'll email you when data for this area is ready.</div>
      </div>
    )}

    <div style={{marginTop:24}}>
      <div style={{fontSize:9,color:"#A6A8AB",marginBottom:8}}>TRY A COVERED CITY</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center"}}>
        {Object.keys(CITY_DATA).map(city=>(
          <button
            key={city}
            onClick={()=>{setInput(city);setInputMode("city");setPhase("landing");setTimeout(()=>startScan(city),100);}}
            style={{background:"#FFFFFF",border:"1px solid #C8E2F4",color:"#2A8FCA",padding:"6px 12px",borderRadius:20,fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  </div>
)}

            {/* ── Bottle Scan sub-view ── */}
            {tbvView==="scan"&&(
              <div data-testid="bottle-tab">
                <div style={{padding:"18px 20px",textAlign:"center"}}>
                  <div style={{fontSize:10,color:"#51B0E6",letterSpacing:"2px",marginBottom:5}}>BOTTLE INTELLIGENCE</div>
                  <h2 style={{fontSize:20,fontWeight:900,marginBottom:4,letterSpacing:"-0.5px",color:"#1A2B3C"}}>What's in your bottle?</h2>
                  <p style={{fontSize:11,color:"#64748B",maxWidth:280,margin:"0 auto"}}>Scan any plastic water bottle to see its full contamination profile.</p>
                </div>
                <BottleScanView onBridge={()=>{setTbvView("home");setPhase("landing");}}/>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* WTR INTEL TAB — Report + Learn combined */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {tab==="wtr-intel"&&(
          <div data-testid="insights-tab">
            {/* Segmented toggle */}
            <div style={{padding:"14px 16px 0",position:"sticky",top:0,zIndex:50,background:"#FFFFFF"}}>
              <div data-testid="insights-toggle" style={{display:"flex",background:"#F0F1F3",borderRadius:12,padding:3,gap:3}}>
                {[{id:"report",label:"Report",badge:data?riskScore:null},{id:"learn",label:"Learn"}].map(v=>{
                  const on=insightView===v.id;
                  return(
                    <button key={v.id} onClick={()=>setInsightView(v.id)} data-testid={`insights-toggle-${v.id}`} style={{flex:1,padding:"9px 0",borderRadius:10,border:"none",background:on?"#FFFFFF":"transparent",color:on?"#0A1A2E":"#A6A8AB",fontSize:12,fontWeight:on?800:600,cursor:"pointer",boxShadow:on?"0 1px 4px rgba(0,0,0,0.1)":"none",transition:"all 0.2s ease",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                      {v.label}
                      {v.badge!=null&&<span style={{background:on?"linear-gradient(135deg,#51B0E6,#2A8FCA)":"#E4F1FA",color:on?"#FFFFFF":"#51B0E6",fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:20,minWidth:18,textAlign:"center"}}>{v.badge}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Report view ── */}
            {insightView==="report"&&data&&(
              <div style={{padding:"14px 16px 20px"}} data-testid="report-tab">
                {/* Report Header Card */}
                <div className="tbv-card" style={{background:"linear-gradient(135deg,#0A1A2E,#0D2244)",borderRadius:18,padding:"18px",marginBottom:12,color:"#FFFFFF",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:-30,right:-30,width:110,height:110,borderRadius:"50%",background:"#51B0E60D"}}/>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:8,color:"#51B0E6",letterSpacing:"2px",fontWeight:700,marginBottom:3}}>TRUST BUT VERIFY™ REPORT</div>
                      <h2 style={{fontSize:20,fontWeight:900,margin:"0 0 2px",letterSpacing:"-0.5px"}} data-testid="report-city">{data.city}</h2>
                      {input&&inputMode!=="city"&&(
                        <div style={{fontSize:9,color:"#51B0E6",marginBottom:3,fontWeight:700}}>
                          {inputMode==="address"?`🏠 ${input}`:`📍 ZIP ${input}`}
                        </div>
                      )}
                      <div style={{fontSize:10,color:"#94A3B8",marginBottom:8}}>{data.utility} · {data.source}</div>
                      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                        <span style={{fontSize:9,color:"#CBD5E1"}}>TDS: <strong style={{color:"#51B0E6"}}>{data.tds}</strong></span>
                        <span style={{fontSize:9,color:"#CBD5E1"}}>pH: <strong style={{color:"#51B0E6"}}>{data.ph}</strong></span>
                        <span style={{fontSize:9,color:"#CBD5E1"}}>Hardness: <strong style={{color:"#51B0E6"}}>{data.hardness}</strong></span>
                      </div>
                    </div>
                    <RiskGauge score={riskScore} animated={gaugeOn}/>
                  </div>
                </div>
                
                {/* High Risk Alert */}
                {highRisk.length>0&&(
                  <div style={{background:"#FFF3F2",border:"1px solid #D9302533",borderLeft:"4px solid #D93025",borderRadius:10,padding:"11px 14px",marginBottom:10,animation:"slideUp 0.4s 0.1s ease forwards",opacity:0,display:"flex",alignItems:"flex-start",gap:10}} data-testid="high-risk-alert">
                    <Icon name="hazard" size={18} color="#D93025"/>
                    <div>
                      <div style={{fontSize:10,fontWeight:800,color:"#D93025",marginBottom:3}}>{highRisk.length} HIGH-CONCERN CONTAMINANT{highRisk.length>1?"S":""} FOUND</div>
                      <div style={{fontSize:10,color:"#742A2A"}}>{highRisk.map(c=>c.name).join(" · ")} — levels exceed health guidelines</div>
                    </div>
                  </div>
                )}
                
                {/* Monthly Water Report — 3-state banner */}
                {reportOptInStatus === 'confirmed' ? (
                  <div style={{background:"linear-gradient(135deg,#0A1A2E,#0E2A50)",borderRadius:12,padding:"12px 16px",display:"flex",gap:12,alignItems:"center",marginBottom:12}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#51B0E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#FFFFFF",lineHeight:1.3}}>Monthly Water Report — {data.city?.split(",")[0]}</div>
                      <div style={{fontSize:9,color:"#A6A8AB",marginTop:2}}>Your report arrives the 1st of every month</div>
                    </div>
                    <span style={{color:"#51B0E6",fontSize:9,fontWeight:700,letterSpacing:"0.5px",textTransform:"uppercase"}}>ENROLLED</span>
                  </div>
                ) : reportOptInStatus === 'pending' ? (
                  <div style={{background:"linear-gradient(135deg,#0A1A2E,#0E2A50)",borderRadius:12,padding:"12px 16px",display:"flex",gap:12,alignItems:"center",marginBottom:12}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#FFFFFF",lineHeight:1.3}}>Check Your Email</div>
                      <div style={{fontSize:9,color:"#A6A8AB",marginTop:2}}>Click the confirmation link we sent to {reportOptInEmail}</div>
                    </div>
                    <button onClick={openReportModal} style={{background:"none",border:"none",color:"#51B0E6",fontSize:9,fontWeight:700,letterSpacing:"0.5px",textTransform:"uppercase",cursor:"pointer",padding:0}}>RESEND</button>
                  </div>
                ) : (
                  <div
                    onClick={openReportModal}
                    style={{background:"linear-gradient(135deg,#0A1A2E,#0E2A50)",borderRadius:12,padding:"12px 16px",display:"flex",gap:12,alignItems:"center",marginBottom:12,cursor:"pointer"}}>
                    <Icon name="bell" size={20} color="#51B0E6"/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#FFFFFF",lineHeight:1.3}}>Monthly Water Report — {data.city?.split(",")[0]}</div>
                      <div style={{fontSize:9,color:"#A6A8AB",marginTop:2}}>Get your personalized report every month, free</div>
                    </div>
                    <button
                      onClick={(e)=>{e.stopPropagation();openReportModal();}}
                      style={{background:"#51B0E6",color:"#fff",border:"none",padding:"7px 12px",borderRadius:7,fontSize:9,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap",minHeight:44,minWidth:44,display:"flex",alignItems:"center",justifyContent:"center"}}
                      aria-label="Enable monthly water report">ENABLE</button>
                  </div>
                )}
                
                {/* Contaminants List — MOVED ABOVE Health Calculator */}
                <div style={{fontSize:9,fontWeight:800,color:"#A6A8AB",letterSpacing:"1.5px",marginBottom:8}}>CONTAMINANTS IN {data.city?.toUpperCase().split(",")[0]}</div>
                <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14}} data-testid="contaminants-list">
                  {data.contaminants.map((c,i)=>(
                    <div 
                      key={c.name} 
                      data-testid={`contaminant-${c.name.toLowerCase().replace(/[()]/g,'').replace(/\s+/g,'-')}`}
                      style={{
                        background:"#FFFFFF",
                        border:"1px solid #C8E2F4",
                        borderLeft:`3px solid ${RISK_COLOR[c.risk]}`,
                        borderRadius:10,padding:"11px 13px",
                        animation:`slideUp 0.4s ${i*0.06}s ease forwards`,
                        opacity:0
                      }}
                    >
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3,flexWrap:"wrap"}}>
                            <span style={{fontSize:11,fontWeight:800,color:"#0A1A2E"}}>{c.name}</span>
                            <span style={{fontSize:8,fontWeight:700,color:RISK_COLOR[c.risk],background:RISK_BG[c.risk],padding:"1px 6px",borderRadius:10}}>{RISK_LABEL[c.risk]}</span>
                            <span style={{fontSize:8,color:"#A6A8AB",background:"#F0F1F3",padding:"1px 6px",borderRadius:10}}>{c.category}</span>
                          </div>
                          <div style={{fontSize:10,color:"#A6A8AB",lineHeight:1.5}}>{c.detail}</div>
                        </div>
                        {typeof c.level==="number"&&(
                          <div style={{textAlign:"right",flexShrink:0,marginLeft:8}}>
                            <div style={{fontSize:14,fontWeight:900,color:RISK_COLOR[c.risk]}}>{c.level}<span style={{fontSize:8}}>{c.unit}</span></div>
                            <div style={{fontSize:8,color:"#A6A8AB"}}>limit: {c.limit}{c.unit}</div>
                          </div>
                        )}
                        {typeof c.level==="string"&&(
                          <div style={{background:"#FFF8EE",color:"#F29423",fontSize:8,fontWeight:700,padding:"2px 7px",borderRadius:7,flexShrink:0,marginLeft:8}}>DETECTED</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Health Calculator — MOVED BELOW Contaminants */}
                <HealthCalc city={data.city} riskScore={riskScore}/>
                
                {/* CTA Section — MOVED ABOVE What Gets Removed */}
                <div style={{background:"linear-gradient(135deg,#0A1A2E,#0D2244)",borderRadius:16,padding:"22px 18px",textAlign:"center",color:"#FFFFFF",marginBottom:10}}>
                  <div style={{fontSize:8,color:"#51B0E6",letterSpacing:"2px",fontWeight:700,marginBottom:7}}>THE SOLUTION</div>
                  <h3 style={{fontSize:19,fontWeight:900,marginBottom:7,letterSpacing:"-0.5px"}}>Trust but Verify™ your Water.</h3>
                  <p style={{fontSize:11,color:"#94A3B8",maxWidth:320,margin:"0 auto 16px",lineHeight:1.6}}>
                    The Home WTR Hub removes every contaminant found in {data.city?.split(",")[0]}'s water — at the tap, in real time.
                  </p>
                  <a href={`https://generositywtr.myshopify.com/products/home-hydration-hub?utm_source=wtr-app&utm_medium=in-app-report&utm_campaign=water-threat-scan&utm_content=${encodeURIComponent((data?.city||'direct').replace(/\s/g,'-').toLowerCase())}&utm_term=${riskScore}`} target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent('shopify_cta_clicked',{city:data?.city,risk_score:riskScore,discount_code:'WELCOME100'})} style={{display:"block",background:"linear-gradient(135deg,#51B0E6,#2A8FCA)",color:"#fff",border:"none",padding:"12px 20px",borderRadius:10,fontSize:12,fontWeight:800,cursor:"pointer",width:"100%",marginBottom:10,textDecoration:"none",boxSizing:"border-box"}}>
                    GET THE HOME WTR HUB →
                  </a>
                  <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
                    {["30-Day Guarantee","30-Min Install","Financing Available"].map(t=>(
                      <div key={t} style={{fontSize:9,color:"#64748B",display:"flex",alignItems:"center",gap:3}}>
                        <span style={{color:"#1E8A4C"}}>✓</span>{t}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* What Gets Removed Table */}
                <div style={{background:"#FFFFFF",border:"1px solid #C8E2F4",borderRadius:14,overflow:"hidden",marginBottom:12}}>
                  <div style={{background:"#0A1A2E",padding:"11px 16px",display:"flex",justifyContent:"space-between"}}>
                    <div style={{fontSize:11,fontWeight:800,color:"#FFFFFF"}}>Home WTR Hub — What Gets Removed</div>
                    <div style={{fontSize:8,color:"#51B0E6",letterSpacing:"1px"}}>{data.city?.split(",")[0].toUpperCase()}</div>
                  </div>
                  {data.contaminants.map((c,i)=>(
                    <div key={c.name} style={{display:"grid",gridTemplateColumns:"1fr auto auto",padding:"9px 14px",gap:8,alignItems:"center",borderBottom:"1px solid #E4F1FA",background:i%2===0?"#FFFFFF":"#F0F1F3"}}>
                      <div>
                        <span style={{fontSize:10,fontWeight:700,color:"#0A1A2E"}}>{c.name}</span>
                        <span style={{fontSize:8,color:"#A6A8AB",marginLeft:5}}>{c.category}</span>
                      </div>
                      <div style={{fontSize:9,color:RISK_COLOR[c.risk],fontWeight:700}}>{typeof c.level==="number"?`${c.level} ${c.unit}`:"Detected"}</div>
                      <div style={{background:"#F0FAF4",color:"#1E8A4C",fontSize:8,fontWeight:800,padding:"2px 8px",borderRadius:20}}>✓ 99%+</div>
                    </div>
                  ))}
                </div>
                
                {/* WTR Hub Animation */}
                {showHub&&(
                  <div style={{background:"#FFFFFF",border:"1px solid #C8E2F4",borderRadius:14,padding:"14px",marginBottom:12}} data-testid="wtr-hub-section">
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                      <div style={{width:30,height:30,borderRadius:7,background:"linear-gradient(135deg,#51B0E6,#2A8FCA)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13}}>◈</div>
                      <div>
                        <div style={{fontSize:11,fontWeight:800,color:"#0A1A2E"}}>Generosity™ Home WTR Hub</div>
                        <div style={{fontSize:8,color:"#51B0E6"}}>Active Alkaline Technology · Multi-Stage</div>
                      </div>
                    </div>
                    <WTRHubAnimation contaminants={data.contaminants} active={animating}/>
                  </div>
                )}
                
                {/* Email Capture */}
                <div style={{background:"#F0F1F3",border:"1px solid #E4F1FA",borderRadius:14,padding:"16px",marginBottom:12}} data-testid="email-capture">
                  <div style={{fontSize:12,fontWeight:900,color:"#0A1A2E",marginBottom:4}}>Get an extra $100 off the Home WTR Hub</div>
                  <div style={{fontSize:10,color:"#A6A8AB",marginBottom:12,lineHeight:1.5}}>Sale price $1,399.99 → Your price $1,299.99 with code WELCOME100</div>
                  {!submitted?(
                    <div style={{display:"flex",flexDirection:"column",gap:7}}>
                      <input 
                        type="email" 
                        value={email} 
                        onChange={e=>setEmail(e.target.value)}
                        placeholder="Your email address"
                        data-testid="email-input"
                        style={{padding:"11px 13px",borderRadius:8,border:"1px solid #C8E2F4",fontSize:12,fontFamily:"inherit",background:"#FFFFFF",color:"#0A1A2E"}}
                      />
                      <button 
                        onClick={()=>handleEmailSubmit('results')}
                        data-testid="submit-email-btn"
                        style={{background:"linear-gradient(135deg,#51B0E6,#2A8FCA)",color:"#fff",border:"none",padding:"11px",borderRadius:8,fontSize:11,fontWeight:800,cursor:"pointer"}}
                      >
                        GET MY $100 OFF →
                      </button>
                      <div style={{fontSize:9,color:"#A6A8AB",textAlign:"center"}}>No spam. Unsubscribe anytime.</div>
                    </div>
                  ):(
                    <div style={{textAlign:"center",padding:"12px 0"}} data-testid="engagement-flow">

                      {/* Phase 0: Brief success flash */}
                      {engagementPhase === "idle" && (
                        <div>
                          <div style={{fontSize:22,marginBottom:5}}>✓</div>
                          <div style={{fontSize:12,fontWeight:700,color:"#1E8A4C"}}>Report sent! Check your email.</div>
                          <div style={{fontSize:10,color:"#A6A8AB",marginTop:3}}>Discount code: WELCOME100</div>
                        </div>
                      )}

                      {/* Phase 1: Push notification prompt */}
                      {engagementPhase === "push_prompt" && (
                        <div style={{maxWidth:320,margin:"0 auto",padding:"4px 0"}} data-testid="push-prompt">
                          <div style={{width:44,height:44,borderRadius:"50%",background:"#EFF6FF",border:"2px solid #51B0E644",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px"}}>
                            <Icon name="alert" size={20} color="#51B0E6"/>
                          </div>
                          <div style={{fontSize:13,fontWeight:800,color:"#0A1A2E",marginBottom:4}}>Water quality changes. You should know.</div>
                          <div style={{fontSize:10,color:"#A6A8AB",lineHeight:1.5,marginBottom:12}}>Get an alert when contamination levels change in your area. We only notify when it matters.</div>
                          <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                            <button
                              onClick={async()=>{
                                trackEvent('push_permission_requested',{city:data?.city});
                                const result = await requestPushPermission(data?.zip || data?.city?.match(/\d{5}/)?.[0], capturedProspectId, {});
                                setPushResult(result);
                                trackEvent(result.granted ? 'push_permission_granted' : 'push_permission_denied', {city:data?.city});
                                setEngagementPhase("household");
                              }}
                              style={{background:"linear-gradient(135deg,#51B0E6,#2A8FCA)",color:"#fff",border:"none",padding:"9px 20px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer"}}
                            >
                              ENABLE ALERTS
                            </button>
                            <button
                              onClick={()=>{trackEvent('push_permission_dismissed',{city:data?.city});setEngagementPhase("household");}}
                              style={{background:"transparent",color:"#A6A8AB",border:"1px solid #E2E8F0",padding:"9px 16px",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer"}}
                            >
                              Not now
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Phase 2: Household profile (3 questions) */}
                      {engagementPhase === "household" && (
                        <div style={{maxWidth:320,margin:"0 auto",padding:"4px 0",textAlign:"left"}} data-testid="household-profile">
                          <div style={{fontSize:13,fontWeight:800,color:"#0A1A2E",marginBottom:3,textAlign:"center"}}>Personalize your risk assessment</div>
                          <div style={{fontSize:10,color:"#A6A8AB",lineHeight:1.5,marginBottom:14,textAlign:"center"}}>Quick questions to tailor your report to your household.</div>

                          {/* Q1: Children */}
                          <div style={{marginBottom:12}}>
                            <div style={{fontSize:10,fontWeight:700,color:"#475569",marginBottom:6}}>Children under 12 at home?</div>
                            <div style={{display:"flex",gap:6}}>
                              {[{label:"Yes",val:true},{label:"No",val:false}].map(opt=>(
                                <button key={opt.label} onClick={()=>setHouseholdProfile(p=>({...p,has_children:opt.val}))}
                                  style={{flex:1,padding:"8px",borderRadius:8,border: householdProfile.has_children===opt.val ? "2px solid #51B0E6" : "1px solid #E2E8F0",
                                    background: householdProfile.has_children===opt.val ? "#EFF6FF" : "#fff",
                                    color: householdProfile.has_children===opt.val ? "#2A8FCA" : "#64748B",
                                    fontSize:11,fontWeight:700,cursor:"pointer"}}
                                >{opt.label}</button>
                              ))}
                            </div>
                          </div>

                          {/* Q2: Pregnant */}
                          <div style={{marginBottom:12}}>
                            <div style={{fontSize:10,fontWeight:700,color:"#475569",marginBottom:6}}>Anyone pregnant or trying to conceive?</div>
                            <div style={{display:"flex",gap:6}}>
                              {[{label:"Yes",val:true},{label:"No",val:false}].map(opt=>(
                                <button key={opt.label} onClick={()=>setHouseholdProfile(p=>({...p,is_pregnant:opt.val}))}
                                  style={{flex:1,padding:"8px",borderRadius:8,border: householdProfile.is_pregnant===opt.val ? "2px solid #51B0E6" : "1px solid #E2E8F0",
                                    background: householdProfile.is_pregnant===opt.val ? "#EFF6FF" : "#fff",
                                    color: householdProfile.is_pregnant===opt.val ? "#2A8FCA" : "#64748B",
                                    fontSize:11,fontWeight:700,cursor:"pointer"}}
                                >{opt.label}</button>
                              ))}
                            </div>
                          </div>

                          {/* Q3: Filter */}
                          <div style={{marginBottom:14}}>
                            <div style={{fontSize:10,fontWeight:700,color:"#475569",marginBottom:6}}>Water filter currently installed?</div>
                            <div style={{display:"flex",gap:6}}>
                              {[{label:"Yes",val:true},{label:"No",val:false},{label:"Not sure",val:"unsure"}].map(opt=>(
                                <button key={opt.label} onClick={()=>setHouseholdProfile(p=>({...p,has_filter:opt.val}))}
                                  style={{flex:1,padding:"8px",borderRadius:8,border: householdProfile.has_filter===opt.val ? "2px solid #51B0E6" : "1px solid #E2E8F0",
                                    background: householdProfile.has_filter===opt.val ? "#EFF6FF" : "#fff",
                                    color: householdProfile.has_filter===opt.val ? "#2A8FCA" : "#64748B",
                                    fontSize:10,fontWeight:700,cursor:"pointer"}}
                                >{opt.label}</button>
                              ))}
                            </div>
                          </div>

                          <div style={{display:"flex",gap:8}}>
                            <button
                              onClick={async()=>{
                                trackEvent('household_profile_submitted',{...householdProfile, city:data?.city});
                                try {
                                  await fetch('https://generosity-dashboard.vercel.app/api/wtr/capture', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      email: email,
                                      zip: data?.zip,
                                      city: data?.city,
                                      source: 'household_profile_update',
                                      household_profile: householdProfile
                                    })
                                  });
                                } catch(e) {}
                                setEngagementPhase("complete");
                              }}
                              style={{flex:1,background:"linear-gradient(135deg,#51B0E6,#2A8FCA)",color:"#fff",border:"none",padding:"10px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer"}}
                            >
                              PERSONALIZE MY REPORT
                            </button>
                            <button
                              onClick={()=>{trackEvent('household_profile_skipped',{city:data?.city});setEngagementPhase("complete");}}
                              style={{background:"transparent",color:"#A6A8AB",border:"1px solid #E2E8F0",padding:"10px 12px",borderRadius:8,fontSize:10,fontWeight:600,cursor:"pointer"}}
                            >
                              Skip
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Phase 3: Complete — show personalized message + discount */}
                      {engagementPhase === "complete" && (
                        <div data-testid="engagement-complete">
                          <div style={{fontSize:22,marginBottom:5}}>✓</div>
                          <div style={{fontSize:12,fontWeight:700,color:"#1E8A4C"}}>You're all set!</div>
                          <div style={{fontSize:10,color:"#A6A8AB",marginTop:3}}>Discount code: <span style={{fontWeight:700,color:"#0A1A2E"}}>WELCOME100</span></div>
                          {householdProfile.has_children && (
                            <div style={{marginTop:8,padding:"8px 12px",background:"#FFF8EE",border:"1px solid #F2942333",borderRadius:8,fontSize:10,color:"#92400E",lineHeight:1.5,textAlign:"left"}}>
                              Children are especially vulnerable to lead and PFAS. The Home WTR Hub removes 99%+ of both.
                            </div>
                          )}
                          {householdProfile.is_pregnant && (
                            <div style={{marginTop:8,padding:"8px 12px",background:"#FFF1F2",border:"1px solid #E1194233",borderRadius:8,fontSize:10,color:"#9F1239",lineHeight:1.5,textAlign:"left"}}>
                              PFAS bioaccumulate in breast milk. Filtration before and during pregnancy is critical.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Dealer/Partner CTA */}
                <div style={{background:"#F0F1F3",border:"1px solid #E4F1FA",borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                  <div>
                    <div style={{fontSize:10,fontWeight:800,color:"#0A1A2E"}}>Are you a Dealer or Distributor?</div>
                    <div style={{fontSize:9,color:"#A6A8AB",marginTop:1}}>Use Trust But Verify™ as your sales tool.</div>
                  </div>
                  <a href="https://generositywater.com/generosity-partners-paywall" target="_blank" rel="noopener noreferrer" style={{background:"#FFFFFF",color:"#51B0E6",border:"1px solid #51B0E6",padding:"7px 12px",borderRadius:8,fontSize:9,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap",textDecoration:"none"}}>
                    PARTNER PORTAL →
                  </a>
                </div>
              </div>
            )}

            {/* ── Report: no data ── */}
            {insightView==="report"&&!data&&(
              <div style={{padding:"60px 20px",textAlign:"center"}} data-testid="report-empty">
                <div style={{fontSize:44,marginBottom:14}}>📊</div>
                <h3 style={{fontSize:18,fontWeight:900,color:"#0A1A2E",marginBottom:7}}>No Report Yet</h3>
                <p style={{fontSize:12,color:"#A6A8AB",marginBottom:18}}>Enter your address on the Home tab to generate your free water intelligence report.</p>
                <button 
                  onClick={()=>{setTab("tbv");setPhase("landing");}}
                  data-testid="go-test-water-btn"
                  style={{background:"linear-gradient(135deg,#51B0E6,#2A8FCA)",color:"#fff",border:"none",padding:"12px 22px",borderRadius:10,fontSize:12,fontWeight:800,cursor:"pointer"}}
                >
                  TEST MY WATER →
                </button>
              </div>
            )}

            {/* ── Learn view ── */}
            {insightView==="learn"&&(
              <div style={{padding:"18px"}} data-testid="learn-tab">
                <h2 style={{fontSize:18,fontWeight:900,color:"#0A1A2E",marginBottom:14}}>Water Intelligence Library</h2>
                
                {/* Learn Cards */}
                {[
                  {iconName:"hazard",title:"PFAS: Forever Chemicals",desc:"Found in 45% of US tap water. Linked to cancer, immune disruption, and reproductive harm. EPA set new limits at 4 ppt in 2024 — 1,000x stricter than before.",tag:"HIGH RISK",tc:"#D93025"},
                  {iconName:"alert",title:"Lead: No Safe Level",desc:"Irreversible neurological damage in children under 6. From aging pipes in pre-1986 homes. Chicago has 400,000+ lead service lines.",tag:"HIGH RISK",tc:"#D93025"},
                  {iconName:"atom",title:"Chromium-6 (Erin Brockovich)",desc:"Found in 75% of US tap water. CA health goal is 0.02 ppb — most cities test 10–25x this level.",tag:"HIGH RISK",tc:"#D93025"},
                  {iconName:"flask",title:"Microplastics",desc:"Found in 94% of US tap water, human blood, lungs, placentas and breast milk. Average American ingests 5 grams per week.",tag:"EMERGING",tc:"#F29423"},
                  {iconName:"droplet",title:"Why Bottled Water Isn't the Answer",desc:"70% comes from municipal tap. Plastic leaches BPA and microplastics. Costs 1,000x more than filtered tap water.",tag:"MYTH",tc:"#51B0E6"},
                  {iconName:"filter",title:"How Reverse Osmosis Works",desc:"Filters to 0.0001 microns — smaller than any virus, bacteria, PFAS molecule, or heavy metal. Gold standard for home filtration.",tag:"SOLUTION",tc:"#1E8A4C"}
                ].map((item,i)=>(
                  <div key={i} style={{background:"#F0F1F3",border:"1px solid #E4F1FA",borderRadius:12,padding:"14px",marginBottom:8}} data-testid={`learn-card-${i}`}>
                    <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                      <div style={{width:36,height:36,borderRadius:8,background:"#FFFFFF",border:`1px solid ${item.tc}33`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <Icon name={item.iconName} size={20} color={item.tc}/>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5,flexWrap:"wrap"}}>
                          <div style={{fontSize:12,fontWeight:800,color:"#0A1A2E"}}>{item.title}</div>
                          <div style={{fontSize:8,fontWeight:700,color:item.tc,background:`${item.tc}14`,padding:"2px 7px",borderRadius:10,letterSpacing:"0.4px"}}>{item.tag}</div>
                        </div>
                        <div style={{fontSize:11,color:"#A6A8AB",lineHeight:1.6}}>{item.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Bottom CTA */}
                <div style={{background:"linear-gradient(135deg,#0A1A2E,#0D2244)",borderRadius:14,padding:"18px",textAlign:"center",color:"#FFFFFF",marginTop:6}}>
                  <div style={{marginBottom:6}}><Icon name="droplet" size={28} color="#51B0E6"/></div>
                  <div style={{fontSize:14,fontWeight:800,marginBottom:5}}>Knowledge is only useful if you act on it.</div>
                  <div style={{fontSize:11,color:"#94A3B8",marginBottom:12}}>The Home WTR Hub removes everything in this library — 1,000+ contaminants.</div>
                  <button style={{background:"linear-gradient(135deg,#51B0E6,#2A8FCA)",color:"#fff",border:"none",padding:"11px 22px",borderRadius:10,fontSize:11,fontWeight:800,cursor:"pointer"}}>
                    LEARN MORE →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* WTR BTL TAB */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {tab==="wtr-btl"&&(<WTRBottleScreen />)}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* WTR HUB TAB */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {tab==="wtr-hub"&&(<WTRHubScreen />)}

      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* BOTTOM NAVIGATION BAR - White */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#FFFFFF",borderTop:"1px solid #E4F1FA",display:"flex",zIndex:200,boxShadow:"0 -4px 12px rgba(166,168,171,0.15)"}} data-testid="bottom-nav">
        {navTabs.map(t=>{
          const active=tab===t.id;
          return(
            <button 
              key={t.id} 
              onClick={()=>{
                setTab(t.id);
                if(t.id==="tbv")setPhase("landing");
              }}
              data-testid={`nav-${t.id}`}
              style={{
                flex:1,background:"transparent",border:"none",
                padding:"11px 4px 13px",cursor:"pointer",
                display:"flex",flexDirection:"column",alignItems:"center",gap:3,
                position:"relative",transition:"opacity 0.15s"
              }}
            >
              {/* Badge */}
              {t.badge&&t.badge>0&&(
                <div style={{
                  position:"absolute",top:7,right:"calc(50% - 18px)",
                  minWidth:15,height:15,borderRadius:8,
                  background:t.badge>66?"#D93025":"#F29423",
                  color:"#fff",fontSize:7,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontWeight:900,padding:"0 3px",
                  border:"1.5px solid #FFFFFF"
                }}>
                  {t.badge}
                </div>
              )}
              <NavIcon id={t.id} active={active}/>
              <div style={{fontSize:8,fontWeight:active?800:500,color:active?"#51B0E6":"#A6A8AB",letterSpacing:"0.3px",lineHeight:1.2,textAlign:"center"}}>{t.label}</div>
              {active&&<div style={{position:"absolute",bottom:3,width:4,height:4,borderRadius:"50%",background:"#51B0E6",boxShadow:"0 0 6px #51B0E6"}}/>}
            </button>
          );
        })}
      </div>
      
      {/* Monthly Water Report — Bottom Sheet Modal */}
      {reportModalOpen && (
        <>
          {/* Backdrop */}
          <div onClick={()=>setReportModalOpen(false)} style={{position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,0.6)"}}/>
          {/* Sheet */}
          <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:601,background:"#fff",borderTopLeftRadius:20,borderTopRightRadius:20,boxShadow:"0 -8px 30px rgba(0,0,0,0.18)",maxWidth:480,margin:"0 auto",animation:"sheetUp 0.3s ease"}} role="dialog" aria-modal="true">
            <style>{`@keyframes sheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes checkDraw{from{stroke-dashoffset:50}to{stroke-dashoffset:0}}`}</style>

            {/* Drag handle */}
            <div style={{display:"flex",justifyContent:"center",paddingTop:12,paddingBottom:4}}>
              <div style={{width:40,height:4,borderRadius:2,background:"#E2E8F0"}}/>
            </div>

            {reportModalScreen === 'form' ? (
              <div style={{padding:"8px 24px 32px"}}>
                {/* Header row with close */}
                <div style={{display:"flex",justifyContent:"flex-end",marginBottom:4}}>
                  <button onClick={()=>setReportModalOpen(false)} style={{background:"none",border:"none",padding:8,cursor:"pointer",minHeight:44,minWidth:44,display:"flex",alignItems:"center",justifyContent:"center"}} aria-label="Close">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>

                {/* Icon + Title */}
                <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:20}}>
                  <div style={{background:"#EBF6FD",borderRadius:12,padding:10,flexShrink:0}}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#51B0E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                  </div>
                  <div>
                    <div style={{fontSize:18,fontWeight:700,color:"#1a2744",lineHeight:1.3}}>Your Monthly Water Report</div>
                    <div style={{fontSize:14,color:"#A6A8AB",marginTop:2}}>Free · Delivered the 1st of every month</div>
                  </div>
                </div>

                {/* Value props */}
                <div style={{background:"#F0F1F3",borderRadius:12,padding:16,marginBottom:20}}>
                  {[
                    {icon:"\uD83D\uDCA7",text:`Local water quality data for ${data?.city?.split(",")[0] || 'your area'}`},
                    {icon:"\u26A0\uFE0F",text:"Contaminant alerts and health guideline updates"},
                    {icon:"\uD83D\uDCF0",text:"Recent news and advisories for your water utility"}
                  ].map((vp,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:i<2?10:0}}>
                      <span style={{fontSize:16,lineHeight:1,flexShrink:0,marginTop:2}}>{vp.icon}</span>
                      <span style={{fontSize:14,color:"#1a2744",lineHeight:1.4}}>{vp.text}</span>
                    </div>
                  ))}
                </div>

                {/* Email input */}
                <div style={{marginBottom:16}}>
                  <label htmlFor="wtr-report-email" style={{display:"block",fontSize:14,fontWeight:600,color:"#1a2744",marginBottom:6}}>Email Address</label>
                  <input
                    id="wtr-report-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={reportEmail}
                    onChange={(e)=>{setReportEmail(e.target.value);if(reportEmailError)setReportEmailError('');}}
                    style={{width:"100%",height:48,padding:"0 16px",borderRadius:12,border:`1px solid ${reportEmailError?'#F87171':'#E2E8F0'}`,fontSize:16,color:"#1a2744",background:"#fff",outline:"none",boxSizing:"border-box"}}
                  />
                  {reportEmailError && <div style={{color:"#EF4444",fontSize:12,marginTop:6}}>{reportEmailError}</div>}
                </div>

                {/* ZIP input */}
                <div style={{marginBottom:20}}>
                  <label htmlFor="wtr-report-zip" style={{display:"block",fontSize:14,fontWeight:600,color:"#1a2744",marginBottom:6}}>
                    ZIP Code <span style={{color:"#A6A8AB",fontWeight:400}}>(for your local water data)</span>
                  </label>
                  <input
                    id="wtr-report-zip"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={5}
                    placeholder="90210"
                    value={reportZip}
                    onChange={(e)=>{const v=e.target.value.replace(/\D/g,'').slice(0,5);setReportZip(v);if(reportZipError)setReportZipError('');}}
                    style={{width:"100%",height:48,padding:"0 16px",borderRadius:12,border:`1px solid ${reportZipError?'#F87171':'#E2E8F0'}`,fontSize:16,color:"#1a2744",background:"#fff",outline:"none",boxSizing:"border-box"}}
                  />
                  {reportZipError && <div style={{color:"#EF4444",fontSize:12,marginTop:6}}>{reportZipError}</div>}
                </div>

                {/* Submit error */}
                {reportSubmitError && (
                  <div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:12,padding:"12px 16px",marginBottom:16}}>
                    <div style={{color:"#DC2626",fontSize:14}}>{reportSubmitError}</div>
                  </div>
                )}

                {/* CTA button */}
                <button
                  onClick={handleReportSubscribe}
                  disabled={reportSubmitting}
                  style={{width:"100%",height:56,background:"#51B0E6",color:"#fff",fontWeight:700,fontSize:16,borderRadius:12,border:"none",cursor:reportSubmitting?"not-allowed":"pointer",opacity:reportSubmitting?0.6:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  {reportSubmitting ? "Sending..." : (
                    <>Get My Monthly Report <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></>
                  )}
                </button>

                {/* Disclosure */}
                <div style={{marginTop:16,display:"flex",alignItems:"flex-start",gap:8}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A6A8AB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:2}}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <div style={{fontSize:12,color:"#A6A8AB",lineHeight:1.5}}>
                    By tapping "Get My Monthly Report" you enroll in the Generosity™ Monthly Water Intelligence Report, delivered the 1st of each month. Unsubscribe anytime. We never sell your email.{" "}
                    <a href="https://generositywater.com/privacy" target="_blank" rel="noopener noreferrer" style={{color:"#51B0E6",textDecoration:"underline"}}>Privacy Policy</a>
                  </div>
                </div>
              </div>
            ) : (
              /* Success screen */
              <div style={{padding:"8px 24px 40px",textAlign:"center"}}>
                {/* Close */}
                <div style={{display:"flex",justifyContent:"flex-end",marginBottom:4}}>
                  <button onClick={()=>setReportModalOpen(false)} style={{background:"none",border:"none",padding:8,cursor:"pointer",minHeight:44,minWidth:44,display:"flex",alignItems:"center",justifyContent:"center"}} aria-label="Close">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>

                {/* Checkmark circle */}
                <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
                  <div style={{width:80,height:80,background:"#EBF6FD",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg width="40" height="40" viewBox="0 0 52 52" fill="none">
                      <circle cx="26" cy="26" r="25" stroke="#51B0E6" strokeWidth="2"/>
                      <path stroke="#51B0E6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" d="M14 27l8 8 16-16" style={{strokeDasharray:50,animation:"checkDraw 0.5s 0.2s ease forwards",strokeDashoffset:50}}/>
                    </svg>
                  </div>
                </div>

                <div style={{fontSize:20,fontWeight:700,color:"#1a2744",marginBottom:8}}>One step left</div>
                <div style={{fontSize:14,color:"#A6A8AB",lineHeight:1.5,marginBottom:4}}>We sent a confirmation link to</div>
                <div style={{fontSize:14,fontWeight:600,color:"#1a2744",marginBottom:16,wordBreak:"break-all"}}>{reportEmail}</div>
                <div style={{fontSize:14,color:"#A6A8AB",lineHeight:1.5,marginBottom:24}}>
                  Click the link to confirm your enrollment. Your first{" "}
                  <span style={{color:"#1a2744",fontWeight:500}}>{data?.city?.split(",")[0] || 'your area'} Monthly Water Report</span>
                  {" "}arrives on the 1st of next month.
                </div>

                {/* Spam notice */}
                <div style={{background:"#F0F1F3",borderRadius:12,padding:"12px 16px",marginBottom:24,textAlign:"left"}}>
                  <div style={{fontSize:12,color:"#A6A8AB",lineHeight:1.5}}>
                    <span style={{color:"#1a2744",fontWeight:600}}>Can't find the email?</span>{" "}
                    Check your spam or promotions folder. The email comes from{" "}
                    <span style={{color:"#51B0E6"}}>noreply@generositywater.com</span>
                  </div>
                </div>

                {/* Done button */}
                <button
                  onClick={()=>setReportModalOpen(false)}
                  style={{width:"100%",height:56,background:"#1a2744",color:"#fff",fontWeight:700,fontSize:16,borderRadius:12,border:"none",cursor:"pointer"}}>
                  Got It
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Profile Overlay */}
      {showProfile && (
        <div style={{position:"fixed",inset:0,zIndex:500,background:"#fff",overflowY:"auto",animation:"slideUp 0.3s ease"}}>
          <style>{`@keyframes slideUp{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
          <ProfileScreen onClose={()=>setShowProfile(false)} />
        </div>
      )}

      {/* Founder Demo Login Modal */}
      {showFounderLogin&&(
        <>
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:600,backdropFilter:"blur(4px)"}} onClick={()=>{setShowFounderLogin(false);setFounderPin('');setFounderPinError('');}} />
          <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:601,background:"#0A1A2E",borderRadius:"20px 20px 0 0",padding:"24px",maxWidth:480,margin:"0 auto",animation:"slideUp 0.3s ease"}}>
            <div style={{width:40,height:4,borderRadius:2,background:"#334155",margin:"0 auto 20px"}} />
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:9,color:"#51B0E6",letterSpacing:"2px",fontWeight:700,marginBottom:6}}>GENEROSITY™ WATER</div>
              <div style={{fontSize:18,fontWeight:900,color:"#FFFFFF",marginBottom:4}}>Founder Access</div>
              <div style={{fontSize:11,color:"#64748B"}}>Enter your PIN to unlock demo mode</div>
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:16}}>
              {[0,1,2,3].map(i=>(
                <div key={i} style={{width:44,height:52,borderRadius:10,border:`2px solid ${founderPin.length>i?'#51B0E6':'#334155'}`,background:founderPin.length>i?'#51B0E611':'#0D1B2A',display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:"#FFFFFF",fontWeight:900}}>
                  {founderPin[i]?'•':''}
                </div>
              ))}
            </div>
            {founderPinError&&<div style={{textAlign:"center",fontSize:11,color:"#D93025",marginBottom:12,fontWeight:600}}>{founderPinError}</div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,maxWidth:260,margin:"0 auto 16px"}}>
              {['1','2','3','4','5','6','7','8','9','','0','⌫'].map(d=>(
                <button key={d||'blank'} disabled={!d} onClick={()=>{
                  if(d==='⌫'){setFounderPin(p=>p.slice(0,-1));setFounderPinError('');}
                  else if(founderPin.length<4){const newPin=founderPin+d;setFounderPin(newPin);setFounderPinError('');if(newPin.length===4)setTimeout(()=>{handleFounderLogin(newPin);},200);}
                }} style={{height:48,borderRadius:10,border:"none",background:d?"#1a2744":"transparent",color:"#FFFFFF",fontSize:18,fontWeight:700,cursor:d?"pointer":"default",opacity:d?1:0}}>{d}</button>
              ))}
            </div>
            <button onClick={()=>{setShowFounderLogin(false);setFounderPin('');setFounderPinError('');}} style={{width:"100%",padding:"12px",background:"transparent",border:"1px solid #334155",borderRadius:10,color:"#64748B",fontSize:12,fontWeight:600,cursor:"pointer"}}>Cancel</button>
          </div>
        </>
      )}
    </div>
  );
}
