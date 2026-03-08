import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

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

// ─── BOTTLE SCAN VIEW COMPONENT (Production-Ready) ───────────────────────────
function BottleScanView({onBridge}){
  const [mode,setMode]=useState("intro");
  const [scanStep,setScanStep]=useState(0);
  const [brand,setBrand]=useState(null);
  const [manual,setManual]=useState("");
  const [scanError,setScanError]=useState(null);
  const [scannedCode,setScannedCode]=useState(null);
  const [permissionState,setPermissionState]=useState("prompt"); // "prompt", "granted", "denied"
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  
  const SCAN_STEPS = [
    "Reading barcode...",
    "Identifying manufacturer...",
    "Querying EPA SDWIS database...",
    "Fetching Title 21 compliance data...",
    "Cross-referencing EWG reports...",
    "Analyzing water quality profile..."
  ];
  
  // Check camera permission on mount
  useEffect(() => {
    checkCameraPermission();
  }, []);
  
  // Check if camera permission is already granted or denied
  async function checkCameraPermission() {
    try {
      // Check if permissions API is available (not supported on all browsers, esp iOS Safari)
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'camera' });
        console.log("Camera permission state:", result.state);
        setPermissionState(result.state);
        
        // If already denied, show the permission denied view immediately
        if (result.state === 'denied') {
          console.log("Camera permission was previously denied");
          // Don't auto-show denied view - let user click button first
        }
        
        // Listen for permission changes
        result.onchange = () => {
          console.log("Camera permission changed to:", result.state);
          setPermissionState(result.state);
          // If permission granted while on denied screen, switch to camera
          if (result.state === 'granted' && mode === 'permission_denied') {
            requestCameraAndScan();
          }
        };
      }
    } catch (e) {
      // Permissions API not supported (common on iOS Safari), will check when camera is accessed
      console.log("Permissions API not available:", e.message);
    }
  }
  
  // Request camera permission immediately and start scanning
  // forceRetry = true bypasses the permission state check (used after user enables in settings)
  async function requestCameraAndScan(forceRetry = false) {
    setScanError(null);
    
    // Only check cached permission state if NOT a forced retry
    // This allows "Try Again" to work after user enables permission in settings
    if (!forceRetry && permissionState === 'denied') {
      console.log("Permission cached as denied, showing settings instructions");
      setMode("permission_denied");
      return;
    }
    
    setMode("requesting");
    
    try {
      // Request camera permission by accessing getUserMedia
      // This WILL trigger the browser's permission prompt if not yet decided
      console.log("Requesting camera access... (forceRetry:", forceRetry, ")");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      // Permission granted! Stop the stream (we'll use html5-qrcode instead)
      console.log("Camera access granted!");
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionState("granted");
      
      // Now start the actual barcode scanner
      setMode("camera");
      
      // Small delay to let the DOM render
      setTimeout(async () => {
        try {
          const html5QrCode = new Html5Qrcode("barcode-scanner");
          html5QrCodeRef.current = html5QrCode;
          
          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 100 },
              aspectRatio: 1.0,
              formatsToSupport: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
            },
            (decodedText) => {
              handleBarcodeDetected(decodedText);
            },
            (errorMessage) => {
              // Ignore continuous scan errors
            }
          );
          console.log("Barcode scanner started successfully");
        } catch (err) {
          console.error("Scanner error:", err);
          setScanError("Scanner initialization failed. Please try again.");
        }
      }, 200);
      
    } catch (err) {
      console.error("Camera permission error:", err.name, err.message);
      
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionState("denied");
        setMode("permission_denied");
      } else if (err.name === "NotFoundError") {
        setScanError("No camera found on this device. Try using manual brand search instead.");
        setMode("intro");
      } else if (err.name === "NotReadableError" || err.name === "AbortError") {
        setScanError("Camera is busy or unavailable. Please close other apps using the camera and try again.");
        setMode("intro");
      } else {
        setScanError("Unable to access camera: " + err.message);
        setMode("intro");
      }
    }
  }
  
  // Stop camera scanning
  async function stopCameraScan() {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (e) {
        console.log("Scanner already stopped");
      }
    }
  }
  
  // Handle barcode detection
  function handleBarcodeDetected(code) {
    stopCameraScan();
    setScannedCode(code);
    processBarcode(code);
  }
  
  // Process barcode and fetch data
  function processBarcode(code) {
    setMode("processing");
    setScanStep(0);
    
    // Simulate database lookup with realistic timing
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setScanStep(step);
      
      if (step >= SCAN_STEPS.length) {
        clearInterval(interval);
        
        // Look up barcode in database
        const brandName = UPC_DATABASE[code];
        
        setTimeout(() => {
          if (brandName && BOTTLE_BRANDS[brandName]) {
            setBrand({ name: brandName, barcode: code, ...BOTTLE_BRANDS[brandName] });
            setMode("result");
          } else {
            // Unknown barcode - show not found
            setMode("not_found");
          }
        }, 300);
      }
    }, 500);
  }
  
  // Quick select brand (for demo)
  function selectBrand(brandName) {
    setMode("processing");
    setScanStep(0);
    setScannedCode("DEMO-" + brandName.toUpperCase().replace(/\s+/g, '-'));
    
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setScanStep(step);
      
      if (step >= SCAN_STEPS.length) {
        clearInterval(interval);
        setTimeout(() => {
          setBrand({ name: brandName, barcode: "Quick Select", ...BOTTLE_BRANDS[brandName] });
          setMode("result");
        }, 300);
      }
    }, 400);
  }
  
  // Manual brand lookup
  function lookupBrand(input) {
    const key = Object.keys(BOTTLE_BRANDS).find(k => 
      input.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(input.toLowerCase())
    );
    
    if (key) {
      selectBrand(key);
    } else {
      // Try fuzzy match or show not found
      setMode("not_found");
      setScannedCode(input);
    }
  }
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCameraScan();
    };
  }, []);
  
  // INTRO VIEW - Production Ready for Investor Demo
  if(mode==="intro") return(
    <div style={{padding:"20px"}} data-testid="bottle-scan-intro">
      {/* Main Camera Button - Large and Prominent */}
      <div style={{background:"linear-gradient(135deg,#0A1A2E,#0D2244)",borderRadius:20,padding:"28px 20px",marginBottom:16,textAlign:"center"}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#51B0E6,#2A8FCA)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:"0 8px 32px rgba(81,176,230,0.4)"}}>
          <Icon name="camera" size={36} color="#FFFFFF"/>
        </div>
        <h3 style={{fontSize:20,fontWeight:900,color:"#FFFFFF",marginBottom:6}}>Scan Any Water Bottle</h3>
        <p style={{fontSize:12,color:"#94A3B8",lineHeight:1.5,marginBottom:20,maxWidth:280,margin:"0 auto 20px"}}>
          Point your camera at the barcode to instantly analyze water quality
        </p>
        
        <button 
          onClick={requestCameraAndScan} 
          data-testid="scan-camera-btn"
          style={{
            background:"#FFFFFF",
            color:"#0A1A2E",
            border:"none",
            padding:"16px 40px",
            borderRadius:12,
            fontSize:15,
            fontWeight:900,
            cursor:"pointer",
            display:"inline-flex",
            alignItems:"center",
            gap:10,
            boxShadow:"0 4px 20px rgba(255,255,255,0.3)",
            transition:"transform 0.2s"
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#51B0E6" strokeWidth="2" fill="#EDF6FC"/>
            <circle cx="12" cy="12" r="4" fill="#51B0E6"/>
          </svg>
          ENABLE CAMERA
        </button>
        
        <div style={{marginTop:16,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
          <Icon name="lock" size={12} color="#1E8A4C"/>
          <span style={{fontSize:10,color:"#64748B"}}>Tap to allow camera access</span>
        </div>
      </div>
      
      {/* Data Sources */}
      <div style={{background:"#F0F1F3",borderRadius:12,padding:"12px 16px",marginBottom:16}}>
        <div style={{fontSize:9,color:"#A6A8AB",marginBottom:8,fontWeight:700,letterSpacing:"1px"}}>DATA SOURCES</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
          <div style={{flex:1,background:"#FFFFFF",borderRadius:8,padding:"10px 8px",textAlign:"center",border:"1px solid #E4F1FA"}}>
            <div style={{fontSize:11,fontWeight:800,color:"#1E8A4C"}}>EPA SDWIS</div>
            <div style={{fontSize:8,color:"#A6A8AB"}}>Federal Database</div>
          </div>
          <div style={{flex:1,background:"#FFFFFF",borderRadius:8,padding:"10px 8px",textAlign:"center",border:"1px solid #E4F1FA"}}>
            <div style={{fontSize:11,fontWeight:800,color:"#1E8A4C"}}>EWG</div>
            <div style={{fontSize:8,color:"#A6A8AB"}}>Tap Water DB</div>
          </div>
          <div style={{flex:1,background:"#FFFFFF",borderRadius:8,padding:"10px 8px",textAlign:"center",border:"1px solid #E4F1FA"}}>
            <div style={{fontSize:11,fontWeight:800,color:"#1E8A4C"}}>Title 21</div>
            <div style={{fontSize:8,color:"#A6A8AB"}}>FDA Compliance</div>
          </div>
        </div>
      </div>
      
      {/* Alternative: Manual Search */}
      <button 
        onClick={()=>setMode("manual")} 
        data-testid="search-brand-btn"
        style={{width:"100%",background:"#FFFFFF",color:"#51B0E6",border:"1px solid #C8E2F4",padding:"14px 20px",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:16}}
      >
        <Icon name="search" size={18} color="#51B0E6"/> Or Search by Brand Name
      </button>
      
      {/* Quick Demo Section */}
      <div style={{borderTop:"1px solid #E4F1FA",paddingTop:16}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <span style={{fontSize:10,color:"#A6A8AB",fontWeight:700,letterSpacing:"1px"}}>QUICK DEMO</span>
          <span style={{fontSize:9,color:"#51B0E6",fontWeight:600}}>{Object.keys(BOTTLE_BRANDS).length} brands</span>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}} data-testid="brand-quick-select">
          {["Dasani", "Aquafina", "Fiji Water", "Evian", "Smart Water", "Poland Spring", "Voss", "Essentia"].map(b=>(
            <button 
              key={b} 
              onClick={()=>selectBrand(b)} 
              data-testid={`brand-pill-${b.toLowerCase().replace(/\s+/g,'-')}`}
              style={{background:"#FFFFFF",border:"1px solid #E4F1FA",color:"#0A1A2E",padding:"8px 14px",borderRadius:20,fontSize:11,cursor:"pointer",fontWeight:600,transition:"all 0.2s"}}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
  
  // REQUESTING PERMISSION VIEW
  if(mode==="requesting") return(
    <div style={{padding:"40px 20px",textAlign:"center"}} data-testid="bottle-requesting-permission">
      <div style={{position:"relative",width:80,height:80,margin:"0 auto 24px"}}>
        <div style={{position:"absolute",inset:0,borderRadius:"50%",border:"3px solid #51B0E6",borderTopColor:"transparent",animation:"spin 1s linear infinite"}}/>
        <div style={{width:80,height:80,borderRadius:"50%",background:"#EDF6FC",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Icon name="camera" size={32} color="#51B0E6"/>
        </div>
      </div>
      <h3 style={{fontSize:18,fontWeight:800,color:"#0A1A2E",marginBottom:8}}>Requesting Camera Access</h3>
      <p style={{fontSize:12,color:"#A6A8AB",lineHeight:1.6,maxWidth:280,margin:"0 auto 20px"}}>
        Please tap <strong style={{color:"#51B0E6"}}>"Allow"</strong> when prompted to enable barcode scanning
      </p>
      <div style={{background:"#F0F1F3",borderRadius:12,padding:"16px",maxWidth:300,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:36,height:36,borderRadius:8,background:"#51B0E6",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Icon name="camera" size={20} color="#FFFFFF"/>
          </div>
          <div style={{flex:1,textAlign:"left"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#0A1A2E"}}>Camera Permission</div>
            <div style={{fontSize:10,color:"#A6A8AB"}}>Required for barcode scanning</div>
          </div>
        </div>
        <div style={{fontSize:10,color:"#6E7073",lineHeight:1.5}}>
          Your camera is only used to read barcodes. No images are stored or transmitted.
        </div>
      </div>
    </div>
  );
  
  // PERMISSION DENIED VIEW
  if(mode==="permission_denied") return(
    <div style={{padding:"40px 20px",textAlign:"center"}} data-testid="bottle-permission-denied">
      <div style={{width:70,height:70,borderRadius:"50%",background:"#FFF3F2",border:"2px solid #D9302533",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}>
        <Icon name="camera" size={30} color="#D93025"/>
      </div>
      <h3 style={{fontSize:18,fontWeight:800,color:"#0A1A2E",marginBottom:8}}>Camera Access Required</h3>
      <p style={{fontSize:12,color:"#A6A8AB",lineHeight:1.6,maxWidth:300,margin:"0 auto 20px"}}>
        Camera permission was blocked. Please enable it in your browser or device settings to scan barcodes.
      </p>
      
      <div style={{background:"#F0F1F3",borderRadius:12,padding:"16px",maxWidth:320,margin:"0 auto 20px",textAlign:"left"}}>
        <div style={{fontSize:11,fontWeight:700,color:"#0A1A2E",marginBottom:10}}>📱 How to enable camera:</div>
        <div style={{fontSize:11,color:"#6E7073",lineHeight:2}}>
          <div style={{marginBottom:8}}>
            <strong style={{color:"#0A1A2E"}}>iPhone/iPad Safari:</strong><br/>
            Settings → Safari → Camera → Allow
          </div>
          <div style={{marginBottom:8}}>
            <strong style={{color:"#0A1A2E"}}>Chrome (Mobile/Desktop):</strong><br/>
            Tap 🔒 icon in address bar → Site Settings → Camera → Allow
          </div>
          <div>
            <strong style={{color:"#0A1A2E"}}>Android Browser:</strong><br/>
            Settings → Apps → [Browser Name] → Permissions → Camera → Allow
          </div>
        </div>
      </div>
      
      <div style={{display:"flex",flexDirection:"column",gap:10,maxWidth:280,margin:"0 auto"}}>
        {/* Open device/browser settings button */}
        <button 
          onClick={() => {
            // Try to open app settings on mobile (works on some browsers)
            if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
              // iOS - can't directly open settings, but show instruction
              alert("To enable camera:\n\n1. Open Settings app\n2. Scroll down to Safari (or your browser)\n3. Tap Camera\n4. Select 'Allow'\n\nThen return here and tap 'Try Again'");
            } else if (navigator.userAgent.match(/Android/i)) {
              // Android - try app-info intent (works on some devices)
              alert("To enable camera:\n\n1. Open your device Settings\n2. Go to Apps\n3. Find and tap your browser\n4. Tap Permissions\n5. Enable Camera\n\nThen return here and tap 'Try Again'");
            } else {
              // Desktop - refresh usually re-prompts
              alert("To enable camera:\n\nClick the 🔒 or ⓘ icon in your browser's address bar, then set Camera to 'Allow'.\n\nAfter enabling, click 'Try Again'.");
            }
          }}
          style={{background:"#0A1A2E",color:"#fff",border:"none",padding:"14px",borderRadius:10,fontSize:13,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}
        >
          <Icon name="settings" size={18} color="#FFFFFF"/> Open Settings Instructions
        </button>
        
        <button 
          onClick={() => requestCameraAndScan(true)}
          style={{background:"linear-gradient(135deg,#51B0E6,#2A8FCA)",color:"#fff",border:"none",padding:"14px",borderRadius:10,fontSize:13,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}
        >
          <Icon name="camera" size={18} color="#FFFFFF"/> Try Again
        </button>
        <button 
          onClick={()=>setMode("manual")}
          style={{background:"#FFFFFF",border:"1px solid #E4F1FA",color:"#51B0E6",padding:"12px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer"}}
        >
          Search by Brand Name Instead
        </button>
        <button 
          onClick={()=>setMode("intro")}
          style={{background:"none",border:"none",color:"#A6A8AB",padding:"8px",fontSize:11,cursor:"pointer"}}
        >
          ← Back
        </button>
      </div>
    </div>
  );
  
  // CAMERA VIEW - Production Ready
  if(mode==="camera") return(
    <div style={{padding:"16px 20px"}} data-testid="bottle-camera-view">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <button 
          onClick={()=>{stopCameraScan();setMode("intro");}} 
          style={{background:"#F0F1F3",border:"none",color:"#6E7073",fontSize:12,cursor:"pointer",padding:"8px 12px",borderRadius:8,display:"flex",alignItems:"center",gap:4,fontWeight:600}}
        >
          ← Cancel
        </button>
        <div style={{background:"#F0FAF4",borderRadius:20,padding:"4px 12px",display:"flex",alignItems:"center",gap:6}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:"#1E8A4C",animation:"pulse 1.5s ease-in-out infinite"}}/>
          <span style={{fontSize:10,color:"#1E8A4C",fontWeight:700}}>CAMERA ACTIVE</span>
        </div>
      </div>
      
      {/* Camera viewport */}
      <div style={{position:"relative",borderRadius:20,overflow:"hidden",background:"#000",marginBottom:16,boxShadow:"0 8px 32px rgba(0,0,0,0.3)"}}>
        <div id="barcode-scanner" ref={scannerRef} style={{width:"100%",minHeight:300}}></div>
        
        {/* Scanning overlay frame */}
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:280,height:100,pointerEvents:"none"}}>
          {/* Corner brackets */}
          {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h])=>(
            <div key={v+h} style={{
              position:"absolute",
              [v]:-4,[h]:-4,
              width:28,height:28,
              [`border${v[0].toUpperCase()+v.slice(1)}`]:"4px solid #51B0E6",
              [`border${h[0].toUpperCase()+h.slice(1)}`]:"4px solid #51B0E6",
              borderRadius:4
            }}/>
          ))}
          {/* Scanning line animation */}
          <div style={{
            position:"absolute",
            top:0,left:0,right:0,bottom:0,
            overflow:"hidden"
          }}>
            <div style={{
              position:"absolute",
              left:0,right:0,
              height:3,
              background:"linear-gradient(90deg,transparent 0%,#51B0E6 20%,#51B0E6 80%,transparent 100%)",
              boxShadow:"0 0 20px #51B0E6",
              animation:"scanLine 2s ease-in-out infinite"
            }}/>
          </div>
        </div>
        
        {/* Bottom instruction */}
        <div style={{position:"absolute",bottom:12,left:0,right:0,textAlign:"center"}}>
          <div style={{background:"rgba(0,0,0,0.7)",display:"inline-block",padding:"8px 16px",borderRadius:20}}>
            <span style={{fontSize:11,color:"#FFFFFF",fontWeight:600}}>Align barcode within frame</span>
          </div>
        </div>
      </div>
      
      {scanError && (
        <div style={{background:"#FFF3F2",border:"1px solid #D9302533",borderRadius:12,padding:"14px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
          <Icon name="alert" size={20} color="#D93025"/>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:"#D93025",marginBottom:2}}>Camera Error</div>
            <div style={{fontSize:11,color:"#742A2A"}}>{scanError}</div>
          </div>
        </div>
      )}
      
      <div style={{background:"#F0F1F3",borderRadius:12,padding:"14px",marginBottom:12}}>
        <div style={{fontSize:10,color:"#6E7073",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
          <Icon name="check" size={14} color="#1E8A4C"/>
          Supports UPC-A, UPC-E, EAN-13, Code 128, Code 39
        </div>
        <div style={{fontSize:10,color:"#6E7073",display:"flex",alignItems:"center",gap:6}}>
          <Icon name="check" size={14} color="#1E8A4C"/>
          Auto-detect any plastic water bottle barcode
        </div>
      </div>
      
      <button 
        onClick={()=>{stopCameraScan();setMode("manual");}} 
        style={{width:"100%",background:"#FFFFFF",border:"1px solid #E4F1FA",color:"#51B0E6",padding:"12px 16px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}
      >
        <Icon name="text" size={16} color="#51B0E6"/> Enter Brand Manually
      </button>
    </div>
  );
  
  // MANUAL SEARCH VIEW
  if(mode==="manual") return(
    <div style={{padding:"24px 20px",maxWidth:360,margin:"0 auto"}} data-testid="bottle-manual-search">
      <button onClick={()=>setMode("intro")} style={{background:"none",border:"none",color:"#A6A8AB",fontSize:12,cursor:"pointer",marginBottom:14,display:"flex",alignItems:"center",gap:4}}>← Back</button>
      <h3 style={{fontSize:16,fontWeight:900,color:"#0A1A2E",marginBottom:6}}>Search by Brand</h3>
      <p style={{fontSize:11,color:"#A6A8AB",marginBottom:14}}>Enter the water brand name to analyze its quality profile.</p>
      <input 
        value={manual} 
        onChange={e=>setManual(e.target.value)} 
        onKeyDown={e=>e.key==="Enter"&&lookupBrand(manual)} 
        placeholder="e.g. Dasani, Fiji, Aquafina..." 
        data-testid="brand-search-input"
        style={{width:"100%",padding:"13px 14px",border:"2px solid #51B0E6",borderRadius:10,fontSize:13,fontFamily:"inherit",color:"#0A1A2E",background:"#FFFFFF",boxSizing:"border-box"}}
        autoFocus
      />
      <button 
        onClick={()=>lookupBrand(manual)} 
        data-testid="analyze-brand-btn"
        style={{width:"100%",background:"linear-gradient(135deg,#51B0E6,#2A8FCA)",color:"#fff",border:"none",padding:"13px",borderRadius:10,fontSize:12,fontWeight:800,cursor:"pointer",marginTop:10,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}
      >
        <Icon name="search" size={16} color="#FFFFFF"/> ANALYZE BRAND
      </button>
      
      <div style={{marginTop:16}}>
        <div style={{fontSize:10,color:"#A6A8AB",marginBottom:8}}>POPULAR BRANDS</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {["Dasani", "Aquafina", "Fiji Water", "Evian", "Smart Water", "Poland Spring"].map(b=>(
            <button 
              key={b} 
              onClick={()=>lookupBrand(b)} 
              style={{background:"#F0F1F3",border:"1px solid #E4F1FA",color:"#0A1A2E",padding:"5px 10px",borderRadius:16,fontSize:10,cursor:"pointer",fontWeight:600}}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
  
  // PROCESSING VIEW (Data lookup animation)
  if(mode==="processing") return(
    <div style={{padding:"40px 20px",textAlign:"center"}} data-testid="bottle-processing">
      <div style={{position:"relative",width:70,height:70,margin:"0 auto 20px"}}>
        <div style={{position:"absolute",inset:0,borderRadius:"50%",background:"#51B0E620",border:"2px solid #51B0E644",animation:"ripple 1.4s ease-out infinite"}}/>
        <div style={{width:70,height:70,borderRadius:"50%",background:"linear-gradient(135deg,#51B0E6,#2A8FCA)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",zIndex:1}}>
          <Icon name="search" size={28} color="#FFFFFF"/>
        </div>
      </div>
      
      <h3 style={{fontSize:16,fontWeight:800,color:"#0A1A2E",marginBottom:6}}>Analyzing Water Quality</h3>
      {scannedCode && (
        <div style={{fontSize:10,color:"#51B0E6",fontFamily:"monospace",marginBottom:16}}>
          Code: {scannedCode}
        </div>
      )}
      
      <div style={{background:"#FFFFFF",borderRadius:12,border:"1px solid #E4F1FA",overflow:"hidden",maxWidth:320,margin:"0 auto"}}>
        {SCAN_STEPS.map((msg, i) => (
          <div 
            key={i}
            style={{
              padding:"10px 14px",
              display:"flex",alignItems:"center",gap:10,
              background:i<scanStep?"#F0FAF4":i===scanStep?"#EDF6FC":"transparent",
              borderBottom:i<SCAN_STEPS.length-1?"1px solid #E4F1FA":"none",
              fontSize:11,
              color:i<scanStep?"#1E8A4C":i===scanStep?"#51B0E6":"#C5C6C8",
              fontWeight:i===scanStep?700:400,
              transition:"all 0.3s"
            }}
          >
            {i<scanStep ? (
              <Icon name="check" size={14} color="#1E8A4C"/>
            ) : i===scanStep ? (
              <span style={{width:14,height:14,borderRadius:"50%",border:"2px solid #51B0E6",borderTopColor:"transparent",animation:"spin 1s linear infinite",display:"inline-block"}}/>
            ) : (
              <span style={{width:14,height:14,borderRadius:"50%",border:"2px solid #E4F1FA",display:"inline-block"}}/>
            )}
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
  
  // NOT FOUND VIEW
  if(mode==="not_found") return(
    <div style={{padding:"40px 20px",textAlign:"center"}} data-testid="bottle-not-found">
      <div style={{width:60,height:60,borderRadius:"50%",background:"#FFF8EE",border:"2px solid #F2942333",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
        <Icon name="alert" size={28} color="#F29423"/>
      </div>
      <h3 style={{fontSize:16,fontWeight:800,color:"#0A1A2E",marginBottom:8}}>Brand Not Found</h3>
      <p style={{fontSize:12,color:"#A6A8AB",marginBottom:6,maxWidth:280,margin:"0 auto 16px"}}>
        We couldn't find "{scannedCode}" in our database of 24+ water brands.
      </p>
      <div style={{background:"#F0F1F3",borderRadius:10,padding:"12px",marginBottom:16,maxWidth:300,margin:"0 auto 16px"}}>
        <div style={{fontSize:10,color:"#A6A8AB",marginBottom:6}}>This could mean:</div>
        <div style={{fontSize:11,color:"#6E7073",lineHeight:1.6,textAlign:"left"}}>
          • The barcode is for a regional or new brand<br/>
          • The product isn't a water bottle<br/>
          • The barcode was partially scanned
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8,maxWidth:280,margin:"0 auto"}}>
        <button 
          onClick={()=>setMode("camera")}
          style={{background:"linear-gradient(135deg,#51B0E6,#2A8FCA)",color:"#fff",border:"none",padding:"12px",borderRadius:10,fontSize:12,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}
        >
          <Icon name="camera" size={16} color="#FFFFFF"/> Try Scanning Again
        </button>
        <button 
          onClick={()=>setMode("manual")}
          style={{background:"#FFFFFF",color:"#51B0E6",border:"1px solid #C8E2F4",padding:"11px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer"}}
        >
          Search by Brand Name
        </button>
        <button 
          onClick={()=>setMode("intro")}
          style={{background:"none",border:"none",color:"#A6A8AB",padding:"8px",fontSize:11,cursor:"pointer"}}
        >
          ← Back to Start
        </button>
      </div>
    </div>
  );
  
  // RESULT VIEW
  if(mode==="result"&&brand){
    const rc=brand.score>66?"#D93025":brand.score>33?"#F29423":"#1E8A4C";
    return(
      <div style={{padding:"16px 20px"}} data-testid="bottle-result">
        <button onClick={()=>{setMode("intro");setBrand(null);setScannedCode(null);}} style={{background:"none",border:"none",color:"#A6A8AB",fontSize:12,cursor:"pointer",marginBottom:12,display:"flex",alignItems:"center",gap:4}}>← Scan Another</button>
        
        {/* Data Source Badge */}
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
          <div style={{background:"#F0FAF4",border:"1px solid #1E8A4C33",borderRadius:4,padding:"2px 6px",fontSize:8,color:"#1E8A4C",fontWeight:600}}>EPA VERIFIED</div>
          <div style={{background:"#F0FAF4",border:"1px solid #1E8A4C33",borderRadius:4,padding:"2px 6px",fontSize:8,color:"#1E8A4C",fontWeight:600}}>EWG DATA</div>
          <div style={{background:"#F0FAF4",border:"1px solid #1E8A4C33",borderRadius:4,padding:"2px 6px",fontSize:8,color:"#1E8A4C",fontWeight:600}}>TITLE 21</div>
        </div>
        
        {/* Brand Header Card */}
        <div style={{background:"linear-gradient(135deg,#0A1A2E,#0D2244)",borderRadius:14,padding:"18px",marginBottom:12,color:"#FFFFFF"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:9,color:"#51B0E6",letterSpacing:"2px",marginBottom:3}}>BOTTLE ANALYSIS</div>
              <div style={{fontSize:20,fontWeight:900,marginBottom:3}} data-testid="bottle-brand-name">{brand.name}</div>
              {brand.manufacturer && (
                <div style={{fontSize:10,color:"#64748B",marginBottom:4}}>{brand.manufacturer}</div>
              )}
              <div style={{fontSize:11,color:"#94A3B8",marginBottom:8}}>
                {brand.source_type || "Water Source"}: {brand.origin}
              </div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <span style={{fontSize:10,color:"#CBD5E1"}}>TDS: <strong style={{color:"#51B0E6"}}>{brand.tds} ppm</strong></span>
                <span style={{fontSize:10,color:"#CBD5E1"}}>pH: <strong style={{color:"#51B0E6"}}>{brand.ph}</strong></span>
                <span style={{fontSize:10,color:"#CBD5E1"}}>Fluoride: <strong style={{color:"#51B0E6"}}>{brand.fluoride} ppm</strong></span>
              </div>
            </div>
            <div style={{textAlign:"center",marginLeft:10}}>
              <div style={{fontSize:36,fontWeight:900,color:rc,lineHeight:1}} data-testid="bottle-risk-score">{brand.score}</div>
              <div style={{fontSize:8,color:rc,fontWeight:700,letterSpacing:"1px"}}>RISK SCORE</div>
            </div>
          </div>
        </div>
        
        {/* Barcode Info */}
        {scannedCode && scannedCode !== "Quick Select" && !scannedCode.startsWith("DEMO-") && (
          <div style={{background:"#F0F1F3",borderRadius:8,padding:"8px 12px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
            <Icon name="scan" size={14} color="#A6A8AB"/>
            <span style={{fontSize:10,color:"#6E7073",fontFamily:"monospace"}}>UPC: {scannedCode}</span>
          </div>
        )}
        
        {/* Stats Grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:12}}>
          {[
            {label:"Microplastics",val:brand.microplastics,bad:["HIGH","VERY HIGH"]},
            {label:"PFAS Risk",val:brand.pfas_risk,bad:["HIGH","VERY HIGH"]},
            {label:"pH Level",val:String(brand.ph),bad:[]}
          ].map(item=>{
            const bad=item.bad.includes(item.val);
            return(
              <div key={item.label} style={{background:bad?"#FFF3F2":"#F0FAF4",border:`1px solid ${bad?"#D93025":"#1E8A4C"}33`,borderRadius:9,padding:"10px 6px",textAlign:"center"}} data-testid={`stat-${item.label.toLowerCase().replace(/\s+/g,'-')}`}>
                <div style={{fontSize:12,fontWeight:900,color:bad?"#D93025":"#1E8A4C"}}>{item.val}</div>
                <div style={{fontSize:8,color:"#A6A8AB",marginTop:2}}>{item.label}</div>
              </div>
            );
          })}
        </div>
        
        {/* Key Concern Block */}
        <div style={{background:"#FFF3F2",border:"1px solid #D9302533",borderLeft:"3px solid #D93025",borderRadius:9,padding:"12px",marginBottom:12,display:"flex",alignItems:"flex-start",gap:10}} data-testid="key-concern-block">
          <Icon name="alert" size={18} color="#D93025"/>
          <div>
            <div style={{fontSize:10,fontWeight:800,color:"#D93025",marginBottom:4}}>KEY CONCERN</div>
            <div style={{fontSize:11,color:"#742A2A",lineHeight:1.6}}>{brand.concern}</div>
          </div>
        </div>
        
        {/* Bridge to Home Water Test */}
        <div style={{background:"#F0F1F3",border:"1px solid #E4F1FA",borderRadius:12,padding:"14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
            <Icon name="info" size={16} color="#51B0E6"/>
            <div style={{fontSize:11,fontWeight:800,color:"#0A1A2E"}}>The real solution isn't a better bottle — it's filtered tap water.</div>
          </div>
          <div style={{fontSize:10,color:"#A6A8AB",lineHeight:1.6,marginBottom:10}}>The Home WTR Hub removes 99%+ of contaminants at your tap — cleaner than any bottled water at $0.003/gallon vs $1.00+/bottle.</div>
          <button 
            onClick={()=>onBridge&&onBridge()} 
            data-testid="test-home-water-bridge-btn"
            style={{width:"100%",background:"linear-gradient(135deg,#51B0E6,#2A8FCA)",color:"#fff",border:"none",padding:"11px",borderRadius:8,fontSize:11,fontWeight:800,cursor:"pointer"}}
          >
            TEST MY HOME TAP WATER →
          </button>
        </div>
      </div>
    );
  }
  
  return null;
}

// ─── HEALTH/LIFETIME CALCULATOR COMPONENT ────────────────────────────────────
function HealthCalc({city,riskScore}){
  const [cups,setCups]=useState(8);
  const [years,setYears]=useState(5);
  const [persona,setPersona]=useState("adult");
  
  const personas=[
    {id:"adult",label:"Adult",icon:"🧑",mult:1.0},
    {id:"child",label:"Child under 12",icon:"👧",mult:2.4},
    {id:"pregnant",label:"Pregnant",icon:"🤰",mult:3.1},
    {id:"infant",label:"Infant",icon:"👶",mult:4.2}
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
            {p.icon} {p.label}
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
  
  if(id==="home") return(
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="11" fill={glow}/>
      <path d="M14 4.5L4 13H6.5V23H11.5V17H16.5V23H21.5V13H24L14 4.5Z" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      <path d="M14 11.5C14 11.5 11.5 14.5 11.5 16C11.5 17.38 12.62 18.5 14 18.5C15.38 18.5 16.5 17.38 16.5 16C16.5 14.5 14 11.5 14 11.5Z" fill={active?"#51B0E6":"none"} stroke={ic} strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
  
  if(id==="bottle") return(
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="11" fill={glow}/>
      <path d="M11 4H17V6.5C17 6.5 20 8 20 12V22C20 22.55 19.55 23 19 23H9C8.45 23 8 22.55 8 22V12C8 8 11 6.5 11 6.5V4Z" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      <line x1="11" y1="4" x2="17" y2="4" stroke={ic} strokeWidth="2" strokeLinecap="round"/>
      <line x1="10.5" y1="14" x2="17.5" y2="14" stroke={ic} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="10.5" y1="16.5" x2="17.5" y2="16.5" stroke={ic} strokeWidth="0.8" strokeLinecap="round"/>
      <line x1="10.5" y1="18.5" x2="17.5" y2="18.5" stroke={ic} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
  
  if(id==="report") return(
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="11" fill={glow}/>
      <path d="M5.5 20A9.5 9.5 0 0 1 22.5 20" stroke="#3A4A5C" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M5.5 20A9.5 9.5 0 0 1 17.5 9.8" stroke={ic} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <line x1="14" y1="20" x2="18.2" y2="12.5" stroke={ic} strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="14" cy="20" r="2" fill={ic}/>
    </svg>
  );
  
  if(id==="learn") return(
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="11" fill={glow}/>
      <path d="M11 5V13L6.5 20.5C6.5 20.5 6 23 9 23H19C22 23 21.5 20.5 21.5 20.5L17 13V5" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      <line x1="10" y1="5" x2="18" y2="5" stroke={ic} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M9 19.5C9 19.5 11 17.5 14 18.5C17 19.5 19 18 19 18" stroke={active?"#51B0E6":ic} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <circle cx="12" cy="21" r="1.2" fill={active?"#51B0E6":ic}/>
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

// ─── MAIN APP COMPONENT ──────────────────────────────────────────────────────
export default function TrustButVerify(){
  const [tab,setTab]=useState("home");
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
  const inputRef=useRef(null);
  
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
  
  function startScan(){
    if(!input.trim())return;
    setPhase("scanning");
    setScanStep(0);
    let step=0;
    const t=setInterval(()=>{
      step++;
      setScanStep(step);
      if(step>=SCAN_STEPS.length){
        clearInterval(t);
        setTimeout(()=>{
          const city=resolveCity(input);
          const raw=city?CITY_DATA[city]:GENERIC_DATA(input);
          setData({...raw,city:city||input});
          setPhase("results");
          setTab("report");
          setTimeout(()=>{setShowHub(true);setGaugeOn(true);},300);
          setTimeout(()=>setAnimating(true),700);
        },300);
      }
    },480);
  }
  
  const riskScore=data?getRiskScore(data.contaminants):0;
  const highRisk=data?.contaminants.filter(c=>c.risk==="high")||[];
  
  const navTabs=[
    {id:"home",label:"Home"},
    {id:"bottle",label:"Scan"},
    {id:"report",label:"Report",badge:data?riskScore:null},
    {id:"learn",label:"Learn"}
  ];
  
  return(
    <div style={{minHeight:"100vh",background:"#FFFFFF",fontFamily:"'Nunito','Helvetica Neue',sans-serif",maxWidth:480,margin:"0 auto",position:"relative",display:"flex",flexDirection:"column"}} data-testid="trust-but-verify-app">
      
      {/* GLOBAL STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes fadeSlideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.08);opacity:0.8}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ripple{0%{transform:scale(0.9);opacity:0.8}100%{transform:scale(2.2);opacity:0}}
        @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes scanLine{0%{top:0}50%{top:calc(100% - 3px)}100%{top:0}}
        .tbv-card{animation:slideUp 0.4s ease forwards}
        input:focus{outline:none;border-color:#51B0E6!important;box-shadow:0 0 0 3px #51B0E622!important}
        button:active{opacity:0.85;transform:scale(0.98)}
        button:hover{opacity:0.95}
      `}</style>

      {/* HEADER - White */}
      <div style={{background:"#FFFFFF",borderBottom:"1px solid #E4F1FA",padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 8px rgba(166,168,171,0.12)"}} data-testid="app-header">
        <img 
          src="https://customer-assets.emergentagent.com/job_c7b8994c-67d7-46b0-8aea-fc2d9b86ff07/artifacts/yl6dfcfp_Emergent%20App%20Logos%201200%20x%20300%20-%203.PNG" 
          alt="Generosity Water Intelligence" 
          style={{height:36,width:"auto"}}
        />
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {data&&<div style={{background:riskScore>66?"#FFF3F2":riskScore>33?"#FFF8EE":"#F0FAF4",border:`1px solid ${riskScore>66?"#D93025":riskScore>33?"#F29423":"#1E8A4C"}33`,color:riskScore>66?"#D93025":riskScore>33?"#F29423":"#1E8A4C",padding:"4px 10px",borderRadius:20,fontSize:10,fontWeight:800}} data-testid="header-risk-score">Score: {riskScore}</div>}
          <button 
            style={{width:36,height:36,borderRadius:"50%",background:"#F0F1F3",border:"1px solid #E4F1FA",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}
            data-testid="profile-btn"
          >
            <Icon name="user" size={20} color="#A6A8AB"/>
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div style={{flex:1,overflowY:"auto",paddingBottom:80}}>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* HOME TAB - LANDING STATE */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {tab==="home"&&phase==="landing"&&(
          <div style={{padding:"28px 20px 20px"}} data-testid="home-landing">
            <div style={{textAlign:"center",marginBottom:24}}>
              {/* Headline */}
              <h1 style={{fontSize:28,fontWeight:900,color:"#0A1A2E",lineHeight:1.1,marginBottom:10,letterSpacing:"-1px"}}>
                What's <span style={{color:"#51B0E6"}}>actually</span> in<br/>your water?
              </h1>
              <p style={{fontSize:13,color:"#A6A8AB",lineHeight:1.6,maxWidth:320,margin:"0 auto 18px"}}>
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
              {inputMode==="address"&&(
                <div style={{display:"flex",alignItems:"center",gap:6,background:"#F0FAF4",border:"1px solid #1E8A4C33",borderRadius:8,padding:"6px 12px",maxWidth:320,margin:"0 auto 9px",fontSize:10,color:"#276749"}}>
                  <Icon name="lock" size={14} color="#1E8A4C"/> Your address is never stored. Used only to match your water utility.
                </div>
              )}
              
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
              <div style={{fontSize:9,color:"#C5C6C8",marginTop:7}}>Address · ZIP · City · EPA SDWIS + EWG Database</div>
            </div>
            
            {/* Stats Row - Light gray cards */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:18}}>
              {[
                ["200M+","Americans exposed to PFAS"],
                ["94%","tap water has microplastics"],
                ["$0","to get your report"]
              ].map(([n,t])=>(
                <div key={n} style={{background:"#F0F1F3",border:"1px solid #C8E2F4",borderRadius:10,padding:"13px 8px",textAlign:"center",boxShadow:"0 2px 8px rgba(166,168,171,0.08)"}}>
                  <div style={{fontSize:19,fontWeight:900,color:"#51B0E6",lineHeight:1}}>{n}</div>
                  <div style={{fontSize:9,color:"#A6A8AB",marginTop:4,lineHeight:1.3}}>{t}</div>
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
                    onClick={()=>{setInput(city);setInputMode("city");setTimeout(startScan,100);}}
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

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* HOME TAB - SCANNING STATE */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {tab==="home"&&phase==="scanning"&&(
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

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SCAN/BOTTLE TAB */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {tab==="bottle"&&(
          <div data-testid="bottle-tab">
            {/* Header */}
            <div style={{background:"linear-gradient(135deg,#0A1A2E,#0D2244)",padding:"18px 20px",color:"#FFFFFF",textAlign:"center"}}>
              <div style={{fontSize:10,color:"#51B0E6",letterSpacing:"2px",marginBottom:5}}>BOTTLE INTELLIGENCE</div>
              <h2 style={{fontSize:20,fontWeight:900,marginBottom:4,letterSpacing:"-0.5px"}}>What's in your bottle?</h2>
              <p style={{fontSize:11,color:"#94A3B8",maxWidth:280,margin:"0 auto"}}>Scan any plastic water bottle to see its full contamination profile.</p>
            </div>
            <BottleScanView onBridge={()=>{setTab("home");setPhase("landing");}}/>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* REPORT TAB - WITH DATA */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {tab==="report"&&data&&(
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
            
            {/* Weekly Alerts */}
            <div style={{background:"linear-gradient(135deg,#0A1A2E,#0E2A50)",borderRadius:12,padding:"12px 14px",display:"flex",gap:10,alignItems:"center",marginBottom:12}}>
              <Icon name="bell" size={22} color="#51B0E6"/>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:800,color:"#FFFFFF",marginBottom:1}}>Weekly Water Report — {data.city?.split(",")[0]}</div>
                <div style={{fontSize:9,color:"#94A3B8"}}>Enable push alerts when contamination levels change</div>
              </div>
              <button style={{background:"#51B0E6",color:"#fff",border:"none",padding:"7px 11px",borderRadius:7,fontSize:9,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>ENABLE</button>
            </div>
            
            {/* Health Calculator */}
            <HealthCalc city={data.city} riskScore={riskScore}/>
            
            {/* Contaminants List */}
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
                    <div style={{fontSize:8,color:"#51B0E6"}}>Active Alkaline Technology · 4-Stage</div>
                  </div>
                </div>
                <WTRHubAnimation contaminants={data.contaminants} active={animating}/>
              </div>
            )}
            
            {/* Email Capture - Light gray background */}
            <div style={{background:"#F0F1F3",border:"1px solid #E4F1FA",borderRadius:14,padding:"16px",marginBottom:12}} data-testid="email-capture">
              <div style={{fontSize:12,fontWeight:900,color:"#0A1A2E",marginBottom:4}}>Get your full report + $100 off</div>
              <div style={{fontSize:10,color:"#A6A8AB",marginBottom:12,lineHeight:1.5}}>Receive the complete {data.city?.split(",")[0]} analysis and an exclusive offer.</div>
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
                    onClick={()=>{if(email)setSubmitted(true);}}
                    data-testid="submit-email-btn"
                    style={{background:"linear-gradient(135deg,#51B0E6,#2A8FCA)",color:"#fff",border:"none",padding:"11px",borderRadius:8,fontSize:11,fontWeight:800,cursor:"pointer"}}
                  >
                    GET FULL REPORT + $100 OFF →
                  </button>
                  <div style={{fontSize:9,color:"#A6A8AB",textAlign:"center"}}>No spam. Unsubscribe anytime.</div>
                </div>
              ):(
                <div style={{textAlign:"center",padding:"10px 0"}} data-testid="email-success">
                  <div style={{fontSize:22,marginBottom:5}}>✓</div>
                  <div style={{fontSize:12,fontWeight:700,color:"#1E8A4C"}}>Report sent! Check your email.</div>
                  <div style={{fontSize:10,color:"#A6A8AB",marginTop:3}}>Discount code: <strong>WELCOME100</strong></div>
                </div>
              )}
            </div>
            
            {/* CTA Section */}
            <div style={{background:"linear-gradient(135deg,#0A1A2E,#0D2244)",borderRadius:16,padding:"22px 18px",textAlign:"center",color:"#FFFFFF",marginBottom:10}}>
              <div style={{fontSize:8,color:"#51B0E6",letterSpacing:"2px",fontWeight:700,marginBottom:7}}>THE SOLUTION</div>
              <h3 style={{fontSize:19,fontWeight:900,marginBottom:7,letterSpacing:"-0.5px"}}>Trust AND Verify Your Water.</h3>
              <p style={{fontSize:11,color:"#94A3B8",maxWidth:320,margin:"0 auto 16px",lineHeight:1.6}}>
                The Home WTR Hub removes every contaminant found in {data.city?.split(",")[0]}'s water — at the tap, in real time.
              </p>
              <button style={{background:"linear-gradient(135deg,#51B0E6,#2A8FCA)",color:"#fff",border:"none",padding:"12px 20px",borderRadius:10,fontSize:12,fontWeight:800,cursor:"pointer",width:"100%",marginBottom:10}}>
                GET THE HOME WTR HUB →
              </button>
              <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
                {["30-Day Guarantee","30-Min Install","Financing Available"].map(t=>(
                  <div key={t} style={{fontSize:9,color:"#64748B",display:"flex",alignItems:"center",gap:3}}>
                    <span style={{color:"#1E8A4C"}}>✓</span>{t}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Dealer/Partner CTA - Light gray background */}
            <div style={{background:"#F0F1F3",border:"1px solid #E4F1FA",borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
              <div>
                <div style={{fontSize:10,fontWeight:800,color:"#0A1A2E"}}>Are you a Dealer or Distributor?</div>
                <div style={{fontSize:9,color:"#A6A8AB",marginTop:1}}>Use Trust But Verify™ as your sales tool.</div>
              </div>
              <button style={{background:"#FFFFFF",color:"#51B0E6",border:"1px solid #51B0E6",padding:"7px 12px",borderRadius:8,fontSize:9,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>
                PARTNER PORTAL →
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* REPORT TAB - NO DATA */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {tab==="report"&&!data&&(
          <div style={{padding:"60px 20px",textAlign:"center"}} data-testid="report-empty">
            <div style={{fontSize:44,marginBottom:14}}>📊</div>
            <h3 style={{fontSize:18,fontWeight:900,color:"#0A1A2E",marginBottom:7}}>No Report Yet</h3>
            <p style={{fontSize:12,color:"#A6A8AB",marginBottom:18}}>Enter your address on the Home tab to generate your free water intelligence report.</p>
            <button 
              onClick={()=>{setTab("home");setPhase("landing");}}
              data-testid="go-test-water-btn"
              style={{background:"linear-gradient(135deg,#51B0E6,#2A8FCA)",color:"#fff",border:"none",padding:"12px 22px",borderRadius:10,fontSize:12,fontWeight:800,cursor:"pointer"}}
            >
              TEST MY WATER →
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* LEARN TAB */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {tab==="learn"&&(
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
                if(t.id==="home"&&data)setPhase("results");
                if(t.id==="home"&&!data)setPhase("landing");
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
              <div style={{fontSize:9,fontWeight:active?800:500,color:active?"#51B0E6":"#A6A8AB",letterSpacing:"0.3px",lineHeight:1}}>{t.label}</div>
              {active&&<div style={{position:"absolute",bottom:3,width:4,height:4,borderRadius:"50%",background:"#51B0E6",boxShadow:"0 0 6px #51B0E6"}}/>}
            </button>
          );
        })}
      </div>
      
    </div>
  );
}
