import { useState, useEffect, useRef } from "react";

// ─── GENEROSITY™ OFFICIAL BRAND PALETTE ─────────────────────────────────────
const B = { 
  blue:"#51B0E6", 
  blueDark:"#2A8FCA", 
  blueLight:"#EDF6FC", 
  blueMid:"#DCEEF9", 
  gray:"#A6A8AB", 
  grayDark:"#6E7073", 
  grayMid:"#C5C6C8", 
  lightGray:"#F0F1F3", 
  white:"#FFFFFF", 
  offWhite:"#F7F9FB", 
  navy:"#0A1A2E", 
  navyMid:"#0D2244", 
  border:"#C8E2F4", 
  borderLight:"#E4F1FA", 
  danger:"#D93025", 
  warning:"#F29423", 
  ok:"#1E8A4C", 
  dangerBg:"#FFF3F2", 
  warningBg:"#FFF8EE", 
  okBg:"#F0FAF4" 
};

// ─── BOTTLE BRANDS DATA ─────────────────────────────────────────────────────
const BOTTLE_BRANDS = {
  "Evian":{ origin:"French Alps", tds:345, ph:7.2, fluoride:0.1, microplastics:"HIGH", pfas_risk:"MEDIUM", score:62, concern:"High TDS. Microplastic contamination in independent testing." },
  "Dasani":{ origin:"Municipal tap (filtered)", tds:38, ph:5.6, fluoride:0.07, microplastics:"VERY HIGH", pfas_risk:"HIGH", score:78, concern:"Acidic pH 5.6, PFAS-lined packaging, highest microplastic count in 2023 Orb Media study." },
  "Aquafina":{ origin:"Municipal tap (RO)", tds:11, ph:6.0, fluoride:0.05, microplastics:"HIGH", pfas_risk:"HIGH", score:71, concern:"Ultra-low minerals, acidic, PFAS in packaging migration studies." },
  "Poland Spring":{ origin:"Maine springs", tds:37, ph:7.2, fluoride:0.1, microplastics:"HIGH", pfas_risk:"MEDIUM", score:55, concern:"High microplastic count. FTC settlement over 'natural spring' claims." },
  "Fiji Water":{ origin:"Artesian aquifer, Fiji", tds:222, ph:7.7, fluoride:0.2, microplastics:"MEDIUM", pfas_risk:"LOW", score:38, concern:"Arsenic near WHO limits. 18,000-mile carbon footprint." },
  "Smart Water":{ origin:"Municipal tap (distilled)", tds:24, ph:7.0, fluoride:0.0, microplastics:"MEDIUM", pfas_risk:"MEDIUM", score:44, concern:"No natural minerals. Electrolytes added post-distillation." },
  "Voss":{ origin:"Artesian aquifer, Norway", tds:44, ph:6.0, fluoride:0.0, microplastics:"LOW", pfas_risk:"LOW", score:29, concern:"Slightly acidic. Glass bottle option recommended." },
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
          <div style={{width:34,height:34,borderRadius:"50%",margin:"0 auto 3px",background:"linear-gradient(135deg,#4A2C0A,#7B4A1E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🚰</div>
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
          <div style={{width:34,height:34,borderRadius:"50%",margin:"0 auto 3px",background:"linear-gradient(135deg,#51B0E6,#2A8FCA)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,animation:"pulse 2s ease-in-out infinite"}}>✨</div>
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
        {[["1,000+","Contaminants"],["99%+","PFAS"],["99%+","Heavy Metals"],["9+ pH","Alkaline"]].map(([v,l])=>(
          <div key={v} style={{background:"#EDF6FC",borderRadius:6,padding:"7px 3px",textAlign:"center"}}>
            <div style={{fontSize:11,fontWeight:900,color:"#51B0E6",lineHeight:1}}>{v}</div>
            <div style={{fontSize:7,color:"#A6A8AB",marginTop:1}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BOTTLE SCAN VIEW COMPONENT ──────────────────────────────────────────────
function BottleScanView({onBridge}){
  const [mode,setMode]=useState("intro");
  const [scanProgress,setScanProgress]=useState(0);
  const [brand,setBrand]=useState(null);
  const [manual,setManual]=useState("");
  
  function simulateScan(){
    setMode("scanning");
    let p=0;
    const t=setInterval(()=>{
      p+=3;
      setScanProgress(p);
      if(p>=100){
        clearInterval(t);
        const keys=Object.keys(BOTTLE_BRANDS);
        const k=keys[Math.floor(Math.random()*keys.length)];
        setBrand({name:k,...BOTTLE_BRANDS[k]});
        setMode("result");
      }
    },50);
  }
  
  function lookupBrand(input){
    const key=Object.keys(BOTTLE_BRANDS).find(k=>input.toLowerCase().includes(k.toLowerCase()));
    const data=key?{name:key,...BOTTLE_BRANDS[key]}:{name:input||"Unknown",...BOTTLE_BRANDS["Evian"]};
    setBrand(data);
    setMode("result");
  }
  
  function selectBrand(brandName){
    setBrand({name:brandName,...BOTTLE_BRANDS[brandName]});
    setMode("result");
  }
  
  // INTRO VIEW
  if(mode==="intro") return(
    <div style={{padding:"24px 20px",textAlign:"center"}} data-testid="bottle-scan-intro">
      <div style={{fontSize:44,marginBottom:10}}>🔍</div>
      <h3 style={{fontSize:18,fontWeight:900,color:"#0A1A2E",marginBottom:8}}>Scan Your Bottle</h3>
      <p style={{fontSize:12,color:"#A6A8AB",lineHeight:1.6,marginBottom:20,maxWidth:300,margin:"0 auto 20px"}}>
        Point your camera at any plastic water bottle barcode — or search by brand.
      </p>
      <div style={{display:"flex",flexDirection:"column",gap:9,maxWidth:300,margin:"0 auto 20px"}}>
        <button 
          onClick={simulateScan} 
          data-testid="scan-camera-btn"
          style={{background:"linear-gradient(135deg,#51B0E6,#2A8FCA)",color:"#fff",border:"none",padding:"13px 20px",borderRadius:10,fontSize:12,fontWeight:800,cursor:"pointer"}}
        >
          📸 Scan Barcode with Camera
        </button>
        <button 
          onClick={()=>setMode("manual")} 
          data-testid="search-brand-btn"
          style={{background:"#FFFFFF",color:"#51B0E6",border:"1px solid #C8E2F4",padding:"11px 20px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer"}}
        >
          🔤 Search by Brand Name
        </button>
      </div>
      <div style={{fontSize:10,color:"#A6A8AB",marginBottom:10}}>QUICK SELECT</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:7,justifyContent:"center"}} data-testid="brand-quick-select">
        {Object.keys(BOTTLE_BRANDS).map(b=>(
          <button 
            key={b} 
            onClick={()=>selectBrand(b)} 
            data-testid={`brand-pill-${b.toLowerCase().replace(/\s+/g,'-')}`}
            style={{background:"#F0F1F3",border:"1px solid #C8E2F4",color:"#0A1A2E",padding:"6px 12px",borderRadius:20,fontSize:11,cursor:"pointer",fontWeight:600}}
          >
            {b}
          </button>
        ))}
      </div>
    </div>
  );
  
  // MANUAL SEARCH VIEW
  if(mode==="manual") return(
    <div style={{padding:"24px 20px",maxWidth:360,margin:"0 auto"}} data-testid="bottle-manual-search">
      <button onClick={()=>setMode("intro")} style={{background:"none",border:"none",color:"#A6A8AB",fontSize:12,cursor:"pointer",marginBottom:14}}>← Back</button>
      <h3 style={{fontSize:16,fontWeight:900,color:"#0A1A2E",marginBottom:14}}>Search by Brand</h3>
      <input 
        value={manual} 
        onChange={e=>setManual(e.target.value)} 
        onKeyDown={e=>e.key==="Enter"&&lookupBrand(manual)} 
        placeholder="e.g. Dasani, Fiji, Evian..." 
        data-testid="brand-search-input"
        style={{width:"100%",padding:"12px 14px",border:"2px solid #51B0E6",borderRadius:10,fontSize:13,fontFamily:"inherit",color:"#0A1A2E",background:"#FFFFFF",boxSizing:"border-box"}}
      />
      <button 
        onClick={()=>lookupBrand(manual)} 
        data-testid="analyze-brand-btn"
        style={{width:"100%",background:"linear-gradient(135deg,#51B0E6,#2A8FCA)",color:"#fff",border:"none",padding:"12px",borderRadius:10,fontSize:12,fontWeight:800,cursor:"pointer",marginTop:9}}
      >
        ANALYZE →
      </button>
    </div>
  );
  
  // SCANNING VIEW
  if(mode==="scanning") return(
    <div style={{padding:"36px 20px",textAlign:"center"}} data-testid="bottle-scanning">
      <div style={{position:"relative",width:190,height:190,margin:"0 auto 18px",background:"#0A0A0A",borderRadius:14,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{width:150,height:110,border:"2px solid #51B0E6",borderRadius:6,position:"relative"}}>
          {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h])=>(
            <div key={v+h} style={{position:"absolute",[v]:-2,[h]:-2,width:18,height:18,[`border${v[0].toUpperCase()+v.slice(1)}`]:"3px solid #51B0E6",[`border${h[0].toUpperCase()+h.slice(1)}`]:"3px solid #51B0E6"}}/>
          ))}
          <div style={{position:"absolute",top:`${scanProgress}%`,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,#51B0E6,transparent)",boxShadow:"0 0 8px #51B0E6",transition:"top 0.05s linear"}}/>
        </div>
        <div style={{position:"absolute",bottom:7,left:0,right:0,fontSize:9,color:"#51B0E6",fontWeight:700,letterSpacing:"1px"}}>SCANNING BARCODE...</div>
      </div>
      <div style={{background:"#EDF6FC",borderRadius:6,height:5,maxWidth:190,margin:"0 auto 10px",overflow:"hidden"}}>
        <div style={{background:"linear-gradient(90deg,#51B0E6,#2A8FCA)",height:"100%",width:`${scanProgress}%`,transition:"width 0.05s linear",borderRadius:6}}/>
      </div>
      <div style={{fontSize:12,color:"#A6A8AB"}}>Identifying barcode... {scanProgress}%</div>
    </div>
  );
  
  // RESULT VIEW
  if(mode==="result"&&brand){
    const rc=brand.score>66?"#D93025":brand.score>33?"#F29423":"#1E8A4C";
    return(
      <div style={{padding:"16px 20px"}} data-testid="bottle-result">
        <button onClick={()=>{setMode("intro");setBrand(null);}} style={{background:"none",border:"none",color:"#A6A8AB",fontSize:12,cursor:"pointer",marginBottom:12}}>← Scan Another</button>
        
        {/* Brand Header Card */}
        <div style={{background:"linear-gradient(135deg,#0A1A2E,#0D2244)",borderRadius:14,padding:"18px",marginBottom:12,color:"#FFFFFF"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:9,color:"#51B0E6",letterSpacing:"2px",marginBottom:3}}>BOTTLE ANALYSIS</div>
              <div style={{fontSize:20,fontWeight:900,marginBottom:3}} data-testid="bottle-brand-name">{brand.name}</div>
              <div style={{fontSize:11,color:"#94A3B8",marginBottom:8}}>Source: {brand.origin}</div>
              <div style={{display:"flex",gap:10}}>
                <span style={{fontSize:10,color:"#CBD5E1"}}>TDS: <strong style={{color:"#51B0E6"}}>{brand.tds}</strong></span>
                <span style={{fontSize:10,color:"#CBD5E1"}}>pH: <strong style={{color:"#51B0E6"}}>{brand.ph}</strong></span>
              </div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:34,fontWeight:900,color:rc,lineHeight:1}} data-testid="bottle-risk-score">{brand.score}</div>
              <div style={{fontSize:8,color:rc,fontWeight:700,letterSpacing:"1px"}}>RISK SCORE</div>
            </div>
          </div>
        </div>
        
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
        <div style={{background:"#FFF3F2",border:"1px solid #D9302533",borderLeft:"3px solid #D93025",borderRadius:9,padding:"12px",marginBottom:12}} data-testid="key-concern-block">
          <div style={{fontSize:10,fontWeight:800,color:"#D93025",marginBottom:4}}>⚠ KEY CONCERN</div>
          <div style={{fontSize:11,color:"#742A2A",lineHeight:1.6}}>{brand.concern}</div>
        </div>
        
        {/* Bridge to Home Water Test */}
        <div style={{background:"#EDF6FC",border:"1px solid #C8E2F4",borderRadius:12,padding:"14px"}}>
          <div style={{fontSize:11,fontWeight:800,color:"#0A1A2E",marginBottom:6}}>💡 The real solution isn't a better bottle — it's filtered tap water.</div>
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
      
      {/* Persona Selection */}
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}} data-testid="persona-selector">
        {personas.map(p=>(
          <button 
            key={p.id} 
            onClick={()=>setPersona(p.id)} 
            data-testid={`persona-${p.id}`}
            style={{
              background:persona===p.id?"#EDF6FC":"#F7F9FB",
              border:`1px solid ${persona===p.id?"#51B0E6":"#C8E2F4"}`,
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
  const ic=active?"#51B0E6":"#9CA3AF";
  const glow=active?"#51B0E615":"transparent";
  
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
    <div style={{minHeight:"100vh",background:"#F7F9FB",fontFamily:"'Nunito','Helvetica Neue',sans-serif",maxWidth:480,margin:"0 auto",position:"relative",display:"flex",flexDirection:"column"}} data-testid="trust-but-verify-app">
      
      {/* GLOBAL STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes fadeSlideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ripple{0%{transform:scale(0.9);opacity:0.8}100%{transform:scale(2.2);opacity:0}}
        .tbv-card{animation:slideUp 0.4s ease forwards}
        input:focus{outline:none;border-color:#51B0E6!important;box-shadow:0 0 0 3px #51B0E622!important}
        button:active{opacity:0.85;transform:scale(0.98)}
      `}</style>

      {/* HEADER */}
      <div style={{background:"#FFFFFF",borderBottom:"1px solid #C8E2F4",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 8px rgba(81,176,230,0.07)"}} data-testid="app-header">
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:"50%",border:"2px solid #51B0E6",display:"flex",alignItems:"center",justifyContent:"center",color:"#51B0E6",fontSize:14}}>◉</div>
          <div>
            <div style={{fontSize:14,fontWeight:900,color:"#0A1A2E",letterSpacing:"-0.3px"}}>Generosity™</div>
            <div style={{fontSize:8,color:"#51B0E6",letterSpacing:"2px",fontWeight:700}}>TRUST BUT VERIFY™</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {data&&<div style={{background:riskScore>66?"#FFF3F2":riskScore>33?"#FFF8EE":"#F0FAF4",border:`1px solid ${riskScore>66?"#D93025":riskScore>33?"#F29423":"#1E8A4C"}33`,color:riskScore>66?"#D93025":riskScore>33?"#F29423":"#1E8A4C",padding:"4px 10px",borderRadius:20,fontSize:10,fontWeight:800}} data-testid="header-risk-score">Score: {riskScore}</div>}
          <div style={{background:"linear-gradient(135deg,#51B0E6,#2A8FCA)",color:"#fff",padding:"5px 12px",borderRadius:20,fontSize:10,fontWeight:800}}>FREE</div>
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
              {/* Badge */}
              <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"#EDF6FC",border:"1px solid #C8E2F4",borderRadius:20,padding:"5px 12px",marginBottom:14,fontSize:10,fontWeight:700,color:"#2A8FCA",letterSpacing:"0.8px"}}>
                <span style={{width:5,height:5,borderRadius:"50%",background:"#1E8A4C",display:"inline-block"}}/>
                FREE · NO SIGNUP · EPA + EWG DATA
              </div>
              
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
                  {id:"address",icon:"🏠",label:"My Address"},
                  {id:"zip",icon:"📍",label:"ZIP Code"},
                  {id:"city",icon:"🏙️",label:"City"}
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
                      display:"flex",alignItems:"center",justifyContent:"center",gap:3
                    }}
                  >
                    <span>{m.icon}</span>{m.label}
                  </button>
                ))}
              </div>
              
              {/* Privacy Notice */}
              {inputMode==="address"&&(
                <div style={{display:"flex",alignItems:"center",gap:6,background:"#F0FAF4",border:"1px solid #1E8A4C33",borderRadius:8,padding:"6px 12px",maxWidth:320,margin:"0 auto 9px",fontSize:10,color:"#276749"}}>
                  🔒 Your address is never stored. Used only to match your water utility.
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
                  style={{background:"linear-gradient(135deg,#51B0E6,#2A8FCA)",color:"#fff",border:"none",padding:"13px 16px",fontSize:11,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}
                >
                  {inputMode==="address"?"SCAN 🏠":inputMode==="zip"?"SCAN 📍":"TEST →"}
                </button>
              </div>
              <div style={{fontSize:9,color:"#C5C6C8",marginTop:7}}>Address · ZIP · City · EPA SDWIS + EWG Database</div>
            </div>
            
            {/* Stats Row */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:18}}>
              {[
                ["200M+","Americans exposed to PFAS"],
                ["94%","tap water has microplastics"],
                ["$0","to get your report"]
              ].map(([n,t])=>(
                <div key={n} style={{background:"#FFFFFF",border:"1px solid #C8E2F4",borderRadius:10,padding:"13px 8px",textAlign:"center",boxShadow:"0 2px 8px rgba(81,176,230,0.06)"}}>
                  <div style={{fontSize:19,fontWeight:900,color:"#51B0E6",lineHeight:1}}>{n}</div>
                  <div style={{fontSize:9,color:"#A6A8AB",marginTop:4,lineHeight:1.3}}>{t}</div>
                </div>
              ))}
            </div>
            
            {/* Who Is This For */}
            <div style={{background:"#FFFFFF",borderRadius:14,padding:"14px",border:"1px solid #C8E2F4",marginBottom:18}}>
              <div style={{fontSize:9,fontWeight:800,color:"#51B0E6",letterSpacing:"1.5px",marginBottom:10}}>WHO IS THIS FOR?</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[
                  {icon:"👩‍👧",label:"Moms & Families",desc:"Know what your kids drink every day"},
                  {icon:"🏡",label:"Homeowners",desc:"Understand your home water quality"},
                  {icon:"🧬",label:"Biohackers",desc:"Optimize every input — including water"},
                  {icon:"💪",label:"Wellness",desc:"Contaminants undermine every health goal"}
                ].map(item=>(
                  <div key={item.label} style={{textAlign:"center",padding:"11px 7px",borderRadius:10,background:"#F7F9FB",border:"1px solid #C8E2F4"}}>
                    <div style={{fontSize:20,marginBottom:3}}>{item.icon}</div>
                    <div style={{fontSize:10,fontWeight:800,color:"#0A1A2E"}}>{item.label}</div>
                    <div style={{fontSize:9,color:"#A6A8AB",marginTop:2}}>{item.desc}</div>
                  </div>
                ))}
              </div>
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
              <div style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#51B0E6,#2A8FCA)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,position:"relative",zIndex:1}}>💧</div>
            </div>
            
            <h2 style={{fontSize:18,fontWeight:900,color:"#0A1A2E",marginBottom:18}}>
              {inputMode==="address"?"🏠 Scanning your address...":
               inputMode==="zip"?"📍 Scanning ZIP code...":
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
                  <span>{i<scanStep?"✓":i===scanStep?"◌":"○"}</span>
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
              <div style={{background:"#FFF3F2",border:"1px solid #D9302533",borderLeft:"4px solid #D93025",borderRadius:10,padding:"11px 14px",marginBottom:10,animation:"slideUp 0.4s 0.1s ease forwards",opacity:0}} data-testid="high-risk-alert">
                <div style={{fontSize:10,fontWeight:800,color:"#D93025",marginBottom:3}}>⚠ {highRisk.length} HIGH-CONCERN CONTAMINANT{highRisk.length>1?"S":""} FOUND</div>
                <div style={{fontSize:10,color:"#742A2A"}}>{highRisk.map(c=>c.name).join(" · ")} — levels exceed health guidelines</div>
              </div>
            )}
            
            {/* Weekly Alerts */}
            <div style={{background:"linear-gradient(135deg,#0A1A2E,#0E2A50)",borderRadius:12,padding:"12px 14px",display:"flex",gap:10,alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:20}}>🔔</div>
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
                <div key={c.name} style={{display:"grid",gridTemplateColumns:"1fr auto auto",padding:"9px 14px",gap:8,alignItems:"center",borderBottom:"1px solid #C8E2F4",background:i%2===0?"#FFFFFF":"#F7F9FB"}}>
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
            
            {/* Email Capture */}
            <div style={{background:"linear-gradient(135deg,#51B0E611,#DCEEF9)",border:"1px solid #C8E2F4",borderRadius:14,padding:"16px",marginBottom:12}} data-testid="email-capture">
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
            
            {/* Dealer/Partner CTA */}
            <div style={{background:"#EDF6FC",border:"1px solid #C8E2F4",borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
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
              {icon:"☣️",title:"PFAS: Forever Chemicals",desc:"Found in 45% of US tap water. Linked to cancer, immune disruption, and reproductive harm. EPA set new limits at 4 ppt in 2024 — 1,000x stricter than before.",tag:"HIGH RISK",tc:"#D93025"},
              {icon:"🔴",title:"Lead: No Safe Level",desc:"Irreversible neurological damage in children under 6. From aging pipes in pre-1986 homes. Chicago has 400,000+ lead service lines.",tag:"HIGH RISK",tc:"#D93025"},
              {icon:"🟠",title:"Chromium-6 (Erin Brockovich)",desc:"Found in 75% of US tap water. CA health goal is 0.02 ppb — most cities test 10–25x this level.",tag:"HIGH RISK",tc:"#D93025"},
              {icon:"🟡",title:"Microplastics",desc:"Found in 94% of US tap water, human blood, lungs, placentas and breast milk. Average American ingests 5 grams per week.",tag:"EMERGING",tc:"#F29423"},
              {icon:"💧",title:"Why Bottled Water Isn't the Answer",desc:"70% comes from municipal tap. Plastic leaches BPA and microplastics. Costs 1,000x more than filtered tap water.",tag:"MYTH",tc:"#51B0E6"},
              {icon:"✅",title:"How Reverse Osmosis Works",desc:"Filters to 0.0001 microns — smaller than any virus, bacteria, PFAS molecule, or heavy metal. Gold standard for home filtration.",tag:"SOLUTION",tc:"#1E8A4C"}
            ].map((item,i)=>(
              <div key={i} style={{background:"#FFFFFF",border:"1px solid #C8E2F4",borderRadius:12,padding:"14px",marginBottom:8}} data-testid={`learn-card-${i}`}>
                <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <div style={{fontSize:22,flexShrink:0}}>{item.icon}</div>
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
              <div style={{fontSize:18,marginBottom:6}}>💧</div>
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
      {/* BOTTOM NAVIGATION BAR */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#0A1A2E",borderTop:"1px solid rgba(81,176,230,0.12)",display:"flex",zIndex:200,boxShadow:"0 -4px 24px rgba(10,26,46,0.45)"}} data-testid="bottom-nav">
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
                  border:"1.5px solid #0A1A2E"
                }}>
                  {t.badge}
                </div>
              )}
              <NavIcon id={t.id} active={active}/>
              <div style={{fontSize:9,fontWeight:active?800:500,color:active?"#51B0E6":"#6B7280",letterSpacing:"0.3px",lineHeight:1}}>{t.label}</div>
              {active&&<div style={{position:"absolute",bottom:3,width:4,height:4,borderRadius:"50%",background:"#51B0E6",boxShadow:"0 0 6px #51B0E6"}}/>}
            </button>
          );
        })}
      </div>
      
    </div>
  );
}
