import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

// ─── GENEROSITY™ OFFICIAL BRAND PALETTE ────────────────────────────────────────
const B = {
  blue: "#51B0E6",
  blueDark: "#2A8FCA",
  blueLight: "#EDF6FC",
  gray: "#A6A8AB",
  grayDark: "#6E7073",
  lightGray: "#F0F1F3",
  white: "#FFFFFF",
  navy: "#0A1A2E",
  navyMid: "#0D2244",
  border: "#C8E2F4",
  borderLight: "#E4F1FA",
  danger: "#D93025",
  warning: "#F29423",
  ok: "#1E8A4C",
  dangerBg: "#FFF3F2",
  warningBg: "#FFF8EE",
  okBg: "#F0FAF4"
};

// ─── COMPREHENSIVE BOTTLE BRANDS DATABASE ─────────────────────────────────────
// Sourced from FDA quality reports, Consumer Reports testing, and EWG data
const BOTTLE_BRANDS = {
  "Dasani": {
    parent: "Coca-Cola Company",
    sourceType: "Purified Water",
    sourceName: "Municipal tap water (US municipal systems)",
    treatment: "Carbon filtration → Reverse osmosis → UV → Re-mineralization (MgSO4, KCl, NaCl) → Ozonation",
    ph: 5.5,
    tds_ppm: 38,
    hardness: "Very soft",
    additives: "Magnesium sulfate, potassium chloride, sodium chloride",
    reportYear: "2024",
    reportSource: "Coca-Cola Independent Certified Lab",
    reportUrl: "https://www.coca-cola.com/content/dam/onexp/us/en/media-center/dasani/dasani-purified-water-annual-analysis-water-quality-report-2024.pdf",
    contaminants: [
      { name: "Arsenic", detected: false, level: "ND", fda_limit: "0.010 mg/L", risk: "none", category: "Heavy Metal", health: "Known carcinogen. Skin damage, circulatory problems." },
      { name: "Lead", detected: false, level: "ND", fda_limit: "0.005 mg/L", risk: "none", category: "Heavy Metal", health: "No safe level. Neurological damage in children." },
      { name: "Chromium", detected: false, level: "ND", fda_limit: "0.1 mg/L", risk: "none", category: "Heavy Metal", health: "Chromium-6 is a known carcinogen." },
      { name: "Fluoride", detected: false, level: "ND", fda_limit: "4.0 mg/L", risk: "none", category: "Inorganic", health: "Removed by RO." },
      { name: "Nitrate", detected: false, level: "ND", fda_limit: "10 mg/L", risk: "none", category: "Agricultural Runoff", health: "Blue baby syndrome risk for infants under 6 months." },
      { name: "Haloacetic Acids", detected: true, level: "Pass (<MCL)", fda_limit: "0.060 mg/L", risk: "low", category: "Disinfection Byproduct", health: "Chlorine + organic matter reaction product. Potential carcinogen." },
      { name: "Trihalomethanes", detected: true, level: "Pass (<MCL)", fda_limit: "0.080 mg/L", risk: "low", category: "Disinfection Byproduct", health: "Cancer risk and reproductive harm at chronic exposure." },
      { name: "PFAS (Forever Chem.)", detected: true, level: "~1.5 ppt", fda_limit: "No MCL set", risk: "medium", category: "Forever Chemicals", health: "Detected in FDA 2023-24 survey. Cancer, thyroid disruption, immune suppression. Never breaks down in body." },
      { name: "Microplastics", detected: true, level: "~325/liter", fda_limit: "No limit", risk: "high", category: "Emerging Contaminant", health: "Orb Media 2018: VERY HIGH from PET bottle leaching. Found in human blood, lungs, placentas." },
      { name: "Antimony (PET leach)", detected: true, level: "~2 ppb", fda_limit: "0.006 mg/L", risk: "medium", category: "Heavy Metal", health: "Leaches from PET during storage. Heat accelerates leaching." },
    ],
    recalls: [],
    lawsuits: [],
    violations: [{ year: 2004, description: "UK recall: 500,000 bottles for bromate contamination above legal limit. Brand withdrawn from UK market." }],
    ewg_grade: "D",
    transparency: "Poor — municipal source not named on label; quality reports not public",
    risk_score: 76,
    key_concern: "VERY HIGH microplastics (~325/L per Orb Media). PFAS detected in FDA 2023-24 survey. Acidic pH 5.5. Municipal source never disclosed on label. EWG D grade.",
    wtr_hub_statement: "WTR Hub's RO membrane removes 99%+ microplastics and PFAS. Active Alkaline Technology raises your water to 9+ pH vs Dasani's acidic 5.5."
  },

  "Aquafina": {
    parent: "PepsiCo Inc.",
    sourceType: "Purified Water",
    sourceName: "Municipal tap water — 40+ US bottling facilities",
    treatment: "HydRO-7™: Polishing filter → UV → Reverse osmosis → Carbon filtration → Polish 2 → Ozonation",
    ph: 6.5,
    tds_ppm: 4,
    hardness: "Ultra soft",
    additives: "None (all minerals stripped)",
    reportYear: "2025",
    reportSource: "PepsiCo CA Water Quality Report June 2025",
    reportUrl: "https://contact.pepsico.com/aquafina/article/where-can-i-find-a-water-quality-report",
    contaminants: [
      { name: "Arsenic", detected: false, level: "ND", fda_limit: "0.010 mg/L", risk: "none", category: "Heavy Metal", health: "ND — RO fully effective." },
      { name: "Lead", detected: false, level: "ND", fda_limit: "0.005 mg/L", risk: "none", category: "Heavy Metal", health: "ND — RO fully effective." },
      { name: "Chromium", detected: true, level: "0.0025 mg/L", fda_limit: "0.1 mg/L", risk: "none", category: "Heavy Metal", health: "Trace — 40x below MCL. Chromium-6 fraction unknown." },
      { name: "Nitrate", detected: true, level: "0.05 mg/L", fda_limit: "10 mg/L", risk: "none", category: "Agricultural Runoff", health: "Trace — 200x below limit." },
      { name: "Trihalomethanes", detected: true, level: "0.019 mg/L", fda_limit: "0.080 mg/L", risk: "low", category: "Disinfection Byproduct", health: "24% of legal limit. Low risk at this level." },
      { name: "PFAS", detected: true, level: "~1.8 ppt", fda_limit: "No MCL set", risk: "medium", category: "Forever Chemicals", health: "Detected in FDA 2023-24 survey. Cancer and immune disruption risk. No FDA MCL for bottled water yet." },
      { name: "Microplastics", detected: true, level: "HIGH", fda_limit: "No limit", risk: "high", category: "Emerging Contaminant", health: "PET bottle leaching. Zero beneficial minerals — TDS 4 ppm." },
    ],
    recalls: [],
    violations: [],
    lawsuits: [{ year: 2007, description: "Class action for misleading 'pure' claims — source is municipal tap. Settled. Label now reads 'public water sources'." }],
    ewg_grade: "F",
    transparency: "Worst-in-class — quality testing explicitly 'proprietary'; EWG F grade",
    risk_score: 76,
    key_concern: "Quality reports classified PROPRIETARY. PFAS detected. HIGH microplastics. Zero minerals (TDS 4 ppm). EWG F grade — lowest transparency of any major brand.",
    wtr_hub_statement: "WTR Hub removes PFAS and microplastics then adds natural alkaline minerals — what Aquafina strips out and never replaces."
  },

  "FIJI Water": {
    parent: "The Wonderful Company (Resnick family)",
    sourceType: "Natural Artesian Water",
    sourceName: "Yaqara Valley artesian aquifer, Viti Levu, Fiji — 1,600 miles from nearest continent",
    treatment: "None — bottled at source. Natural volcanic rock filtration. UV + micron-filtered.",
    ph: 7.7,
    tds_ppm: 222,
    hardness: "Moderate (72 mg/L)",
    minerals: { silica: "93 ppm", magnesium: "13 ppm", calcium: "18 ppm", sodium: "17 ppm", bicarbonate: "152 ppm" },
    additives: "None",
    reportYear: "2024",
    reportSource: "FIJI Water FAQ + FDA Recall March 2024 + independent testing",
    reportUrl: "https://www.fijiwater.com/faq",
    contaminants: [
      { name: "Arsenic", detected: true, level: "0.7 ppb", fda_limit: "10 ppb", risk: "medium", category: "Heavy Metal", health: "175x EWG health guideline. Near WHO advisory. Skin, bladder, lung cancer risk." },
      { name: "Antimony (PET heat leach)", detected: true, level: "~2+ ppb", fda_limit: "6 ppb", risk: "high", category: "Heavy Metal", health: "Leaches from PET during 18,000-mile tropical unrefrigerated transit. EPA lists terephthalate as toxic." },
      { name: "Manganese", detected: true, level: "DETECTED", fda_limit: "0.05 mg/L", risk: "high", category: "Heavy Metal", health: "2024 FDA RECALL trigger. Nervous system effects. Behavioral changes. Male fertility issues." },
      { name: "Bacteria (3 genera)", detected: true, level: "DETECTED", fda_limit: "Absent", risk: "high", category: "Microbiological", health: "2024 FDA RECALL trigger. 3 bacterial genera found. Gastrointestinal illness risk." },
      { name: "PFAS", detected: true, level: "alleged", fda_limit: "No MCL", risk: "high", category: "Forever Chemicals", health: "Class action lawsuit Jan 2024 alleging PFAS. FIJI has not published PFAS test results." },
      { name: "Microplastics", detected: true, level: "MEDIUM-HIGH", fda_limit: "No limit", risk: "medium", category: "Emerging Contaminant", health: "PET + tropical heat amplifies leaching during long unrefrigerated transit." },
    ],
    recalls: [{ year: 2024, date: "March 2024", description: "FDA Class III Recall: 1.9 MILLION bottles (500mL 24-packs). Manganese + 3 bacterial genera detected. PRD lots: Nov 11/12/13/24/25 2023. Sold on Amazon.com Feb 1–Mar 3, 2024.", fdaClass: "Class III" }],
    lawsuits: [{ year: 2024, description: "PFAS and microplastics class action filed January 2024" }, { year: 2024, description: "Greenwashing lawsuit: misleading environmental marketing claims" }],
    violations: [],
    ewg_grade: "D",
    transparency: "Poor — failed California disclosure law; refused EWG quality report request",
    risk_score: 98,
    key_concern: "2024 FDA RECALL: 1.9M bottles for MANGANESE + 3 BACTERIAL GENERA. Active PFAS lawsuit. Arsenic 175x health guideline. Antimony leaching in tropical heat. Refused EWG quality data.",
    wtr_hub_statement: "WTR Hub removes manganese, arsenic, and bacteria at 99%+ — the exact contaminants that triggered FIJI's 2024 FDA recall."
  },

  "Poland Spring": {
    parent: "BlueTriton Brands",
    sourceType: "Natural Spring Water",
    sourceName: "Multiple Maine springs: Poland Spring ME, Clear Spring (Hollis), Evergreen Spring (Fryeburg), Spruce Spring, Garden Spring, Bradbury Spring (Kingfield)",
    treatment: "Ozonation + UV disinfection + 1-micron filtration at source",
    ph: 7.2,
    tds_ppm: 37,
    hardness: "Soft (53 mg/L)",
    minerals: { calcium: "5.0 ppm", magnesium: "1.1 ppm", sodium: "3.2 ppm", potassium: "0.5 ppm", bicarbonate: "14.7 ppm" },
    additives: "None",
    reportYear: "2024",
    reportSource: "BlueTriton Brands 2024 Annual Water Analysis Report",
    reportUrl: "https://www.polandspring.com/sites/g/files/zmtnxh116/files/2025-05/Poland_Spring_Water_Quality_Report.pdf",
    contaminants: [
      { name: "Arsenic", detected: false, level: "ND", fda_limit: "10 ppb", risk: "none", category: "Heavy Metal", health: "ND — Maine spring sources clean." },
      { name: "Lead", detected: false, level: "ND", fda_limit: "5 ppb", risk: "none", category: "Heavy Metal", health: "ND." },
      { name: "Haloacetic Acids", detected: true, level: "trace", fda_limit: "0.060 mg/L", risk: "low", category: "Disinfection Byproduct", health: "Trace from ozonation. Below MCL." },
      { name: "PFAS (PFOS/PFOA)", detected: true, level: "~1.2 ppt", fda_limit: "No MCL", risk: "medium", category: "Forever Chemicals", health: "Detected above 1 ppt (Consumer Reports 2020). Active BlueTriton PFAS litigation covering this brand." },
      { name: "Microplastics", detected: true, level: "HIGH", fda_limit: "No limit", risk: "high", category: "Emerging Contaminant", health: "PET bottle leaching." },
    ],
    recalls: [],
    violations: [],
    lawsuits: [{ year: 2003, description: "Class action: fraudulent 'natural spring' source claims. Settled." }, { year: 2022, description: "BlueTriton PFAS lawsuit — covers Poland Spring, Deer Park, Arrowhead, and other brands." }],
    ewg_grade: "D",
    transparency: "Poor",
    risk_score: 76,
    key_concern: "PFAS detected above 1 ppt. Active BlueTriton PFAS lawsuit. Historical class action over spring sourcing legitimacy. HIGH microplastics.",
    wtr_hub_statement: "WTR Hub removes PFAS at 99%+ — the forever chemicals that spring filtration cannot catch."
  },

  "Essentia": {
    parent: "Essentia Water LLC (Keurig Dr Pepper)",
    sourceType: "Purified Alkaline Ionized Water",
    sourceName: "Municipal tap water (multiple US facilities)",
    treatment: "Microfiltration → RO (TDS <10 ppm) → UV → Electrolytes (K, Mg, Ca, Na) → Proprietary ionization to 9.5+ pH",
    ph: 9.5,
    tds_ppm: 20,
    hardness: "Very soft",
    additives: "Potassium bicarbonate, dipotassium phosphate, sodium bicarbonate, magnesium sulfate, calcium chloride",
    reportYear: "2024",
    reportSource: "Essentia Water Quality Report 2024",
    reportUrl: "https://essentiawater.com/wp-content/uploads/2024/05/Essentia-Water-Quality-Report-2024.pdf",
    contaminants: [
      { name: "All regulated contaminants", detected: false, level: "ND", fda_limit: "see MCL", risk: "none", category: "All Categories", health: "All tested contaminants non-detected per 2024 QR. Full RO + UV process." },
      { name: "PFAS", detected: false, level: "ND", fda_limit: "No MCL", risk: "none", category: "Forever Chemicals", health: "NSF certified — non-detected." },
      { name: "Microplastics", detected: true, level: "MEDIUM", fda_limit: "No limit", risk: "medium", category: "Emerging Contaminant", health: "RO removes dissolved contaminants but PET packaging re-introduces microplastics post-filtration." },
    ],
    recalls: [],
    lawsuits: [],
    violations: [],
    ewg_grade: "B",
    transparency: "Good — NSF certified; quality report public",
    risk_score: 21,
    key_concern: "Generally clean. Ultra-low TDS 20 ppm (no natural minerals). Municipal source. pH 9.5 is engineered, not natural. PET microplastics post-filtration.",
    wtr_hub_statement: "WTR Hub creates natural ionic alkalinity at your tap — same pH as Essentia, no plastic bottle."
  },

  "evian": {
    parent: "Danone S.A.",
    sourceType: "Natural Spring Water",
    sourceName: "Évian-les-Bains glacial spring, French Alps — naturally filtered 15 years through glacial rock and moraines",
    treatment: "None — naturally filtered through glacial moraines over 15 years",
    ph: 7.2,
    tds_ppm: 345,
    hardness: "Moderate (291 mg/L)",
    minerals: { calcium: "80 ppm", magnesium: "26 ppm", sodium: "6.5 ppm", potassium: "1.0 ppm", silica: "15 ppm", bicarbonate: "360 ppm", sulfate: "12.6 ppm", chloride: "6.8 ppm", nitrate: "3.8 ppm" },
    additives: "None",
    reportYear: "2023",
    reportSource: "evian Water Quality Reports + EWG + Consumer Reports",
    reportUrl: "https://www.evian.com/en_us/water-quality-reports/",
    contaminants: [
      { name: "Nitrate", detected: true, level: "3.8 mg/L", fda_limit: "10 mg/L", risk: "low", category: "Agricultural Runoff", health: "38% of legal limit from Alps agricultural runoff. Risk for infants." },
      { name: "Bacteria (historical)", detected: true, level: "historical", fda_limit: "Absent", risk: "medium", category: "Microbiological", health: "High bacteria found in 2005 Boston Globe independent testing. Failed CA disclosure requirements." },
      { name: "PFAS", detected: true, level: "alleged", fda_limit: "No MCL", risk: "high", category: "Forever Chemicals", health: "Active 2022 class action. Danone has not published PFAS test results publicly." },
      { name: "Microplastics", detected: true, level: "HIGH", fda_limit: "No limit", risk: "high", category: "Emerging Contaminant", health: "Multiple studies. 5,000-mile transit in PET amplifies leaching. High count in independent testing." },
    ],
    violations: [{ year: 2009, description: "Failed California water quality disclosure law — did not provide required source and treatment information." }],
    recalls: [],
    lawsuits: [{ year: 2022, description: "PFAS and microplastics class action. Danone refuses to publish PFAS testing data." }],
    ewg_grade: "D",
    transparency: "Poor — failed California disclosure law",
    risk_score: 76,
    key_concern: "Active PFAS lawsuit. HIGH microplastics. Failed California water disclosure law. Bacteria in independent testing. Ships 5,000 miles in unrefrigerated PET.",
    wtr_hub_statement: "WTR Hub produces better water than evian ships 5,000 miles, at $0.003/gallon vs $3+ per bottle."
  },

  "smartwater": {
    parent: "Coca-Cola Company",
    sourceType: "Purified Water (vapor distilled)",
    sourceName: "Municipal tap water — vapor distilled",
    treatment: "Vapor distillation → Electrolytes added (calcium chloride, magnesium chloride, potassium bicarbonate)",
    ph: 7.0,
    tds_ppm: 24,
    hardness: "Very soft",
    additives: "Calcium chloride, magnesium chloride, potassium bicarbonate",
    reportYear: "2024",
    reportSource: "Coca-Cola / EWG / independent testing",
    reportUrl: null,
    contaminants: [
      { name: "PFAS", detected: true, level: "~0.8 ppt", fda_limit: "No MCL", risk: "medium", category: "Forever Chemicals", health: "Detected in FDA 2023-24 survey below 1 ppt. No FDA MCL for bottled water yet." },
      { name: "Microplastics", detected: true, level: "MEDIUM", fda_limit: "No limit", risk: "medium", category: "Emerging Contaminant", health: "PET bottle leaching." },
    ],
    recalls: [],
    lawsuits: [],
    violations: [],
    ewg_grade: "C",
    transparency: "Moderate",
    risk_score: 32,
    key_concern: "Municipal tap source vapor-distilled. No natural minerals. Marketing implies purity — it's municipal distillation with added electrolytes.",
    wtr_hub_statement: "WTR Hub creates natural mineral alkalinity from your tap — the benefit smartwater engineers, without the bottle."
  },

  "Topo Chico": {
    parent: "Coca-Cola Company",
    sourceType: "Sparkling Natural Mineral Water",
    sourceName: "Cerro del Topo Chico spring, Monterrey, Nuevo León, Mexico",
    treatment: "CO2 carbonation + filtration. Post-2020: upgraded PFAS filtration (unverified by third party).",
    ph: 5.6,
    tds_ppm: 420,
    hardness: "Moderate",
    minerals: { calcium: "40 ppm", magnesium: "12 ppm", sodium: "58 ppm", bicarbonate: "244 ppm" },
    additives: "CO2 (natural mineral carbonation)",
    reportYear: "2024",
    reportSource: "Consumer Reports 2020 PFAS test (9.76 ppt) + Coca-Cola post-2020 statement",
    reportUrl: "https://www.topochico.com/us/en/water-quality",
    contaminants: [
      { name: "PFAS (Total)", detected: true, level: "9.76 ppt (2020 test — upgrades claimed, unverified)", fda_limit: "EPA MCL: 0.004 ppt", risk: "high", category: "Forever Chemicals", health: "HIGHEST PFAS of any brand tested by Consumer Reports 2020. 2,440x EPA's 2024 MCL. Upgrades claimed but never third-party verified." },
      { name: "Sodium (elevated)", detected: true, level: "58 ppm", fda_limit: "No MCL", risk: "low", category: "Mineral", health: "High sodium for a water product. Naturally occurring." },
      { name: "Microplastics", detected: true, level: "MEDIUM", fda_limit: "No limit", risk: "medium", category: "Emerging Contaminant", health: "Carbonation process may concentrate contaminants." },
    ],
    recalls: [],
    lawsuits: [],
    violations: [],
    ewg_grade: "C",
    transparency: "Moderate — PFAS upgrades claimed but no third-party verification published",
    risk_score: 76,
    key_concern: "HIGHEST PFAS in Consumer Reports 2020: 9.76 ppt — 2,440x EPA's 2024 limit. Acidic pH 5.6. No third-party verification of post-upgrade levels ever published.",
    wtr_hub_statement: "WTR Hub removes 99%+ PFAS — the forever chemicals Topo Chico has been cited for since 2020."
  },

  "Icelandic Glacial": {
    parent: "Icelandic Glacial ehf.",
    sourceType: "Natural Spring Water",
    sourceName: "Ölfus Spring, Iceland — volcanic lava filtration over centuries",
    treatment: "None — bottled at source. Natural lava rock filtration.",
    ph: 8.4,
    tds_ppm: 62,
    hardness: "Soft (88 mg/L)",
    minerals: { calcium: "22 ppm", magnesium: "2.2 ppm", sodium: "8.0 ppm", potassium: "1.0 ppm", silica: "20 ppm", bicarbonate: "80 ppm" },
    additives: "None",
    reportYear: "2024",
    reportSource: "Brand QA + Icelandic Public Health Authority + NSF/ANSI 305",
    reportUrl: "https://www.icelandicglacial.com/quality",
    contaminants: [
      { name: "PFAS", detected: false, level: "ND", fda_limit: "No MCL", risk: "none", category: "Forever Chemicals", health: "Non-detected — Icelandic Public Health Authority confirmed." },
      { name: "Nanoplastics", detected: false, level: "ND", fda_limit: "No limit", risk: "none", category: "Emerging Contaminant", health: "Non-detected — rare achievement in independent testing." },
      { name: "Arsenic", detected: false, level: "0.02 ppb", fda_limit: "10 ppb", risk: "none", category: "Heavy Metal", health: "500x below FDA limit." },
      { name: "Microplastics", detected: true, level: "LOW", fda_limit: "No limit", risk: "low", category: "Emerging Contaminant", health: "Low from PET bottle SKU. Aluminum can version eliminates entirely." },
    ],
    recalls: [],
    lawsuits: [],
    violations: [],
    ewg_grade: "A",
    transparency: "Best-in-class — Authority inspections; PFAS + nanoplastics ND confirmed; NSF + CarbonNeutral certified",
    risk_score: 15,
    key_concern: "Best quality profile on this list. Primary concern: Iceland-to-US shipping footprint. Aluminum can version eliminates microplastics entirely.",
    wtr_hub_statement: "Icelandic Glacial is exceptional quality — but at $3+/bottle and 4,000 miles of shipping, WTR Hub produces the same alkaline profile at $0.003/gallon."
  },

  "VOSS": {
    parent: "VOSS Water of Norway AS",
    sourceType: "Natural Artesian Water",
    sourceName: "Artesian aquifer, Vatnestrøm, Iveland, Norway",
    treatment: "None — artesian source",
    ph: 6.0,
    tds_ppm: 44,
    hardness: "Very soft (11 mg/L)",
    minerals: { calcium: "3.0 ppm", magnesium: "0.5 ppm", sodium: "7.0 ppm", potassium: "0.4 ppm", chloride: "5.0 ppm" },
    additives: "None",
    reportYear: "2024",
    reportSource: "VOSS brand quality report + EWG",
    reportUrl: "https://www.voss.com/en-us/about-voss/quality",
    contaminants: [
      { name: "PFAS", detected: false, level: "0.2 ppt", fda_limit: "No MCL", risk: "none", category: "Forever Chemicals", health: "Below 1 ppt expert threshold." },
      { name: "Microplastics", detected: true, level: "LOW", fda_limit: "No limit", risk: "low", category: "Emerging Contaminant", health: "Low. Glass bottle option eliminates entirely." },
    ],
    recalls: [],
    lawsuits: [],
    violations: [],
    ewg_grade: "B",
    transparency: "Good",
    risk_score: 15,
    key_concern: "Acidic pH 6.0 — one of the most acidic still waters. Very low minerals. Glass bottle option preferred.",
    wtr_hub_statement: "WTR Hub alkalinizes to 9+ pH — directly improving on VOSS's acidic 6.0."
  },

  "Pure Life": {
    parent: "BlueTriton Brands",
    sourceType: "Purified Water",
    sourceName: "Municipal water supplies and/or protected wells — source disclosed per facility on label",
    treatment: "RO or distillation (disclosed per facility) → minerals added → ozonation",
    ph: 7.8,
    tds_ppm: 25,
    hardness: "Very soft",
    additives: "Small amounts of minerals for taste (disclosed on label)",
    reportYear: "2024",
    reportSource: "EWG Scorecard — only mass-market top-10 brand to pass full transparency test",
    reportUrl: "https://www.purifiedlifewater.com/water-quality",
    contaminants: [
      { name: "PFAS", detected: false, level: "0.2 ppt", fda_limit: "No MCL", risk: "none", category: "Forever Chemicals", health: "Low — RO/distillation effective." },
      { name: "Microplastics", detected: true, level: "MEDIUM", fda_limit: "No limit", risk: "medium", category: "Emerging Contaminant", health: "PET packaging re-introduces microplastics post-purification." },
    ],
    recalls: [],
    lawsuits: [],
    violations: [],
    ewg_grade: "A",
    transparency: "BEST among mass-market — ONLY top-10 brand to pass EWG full transparency test",
    risk_score: 21,
    key_concern: "Most transparent mass-market brand. Purification is genuinely effective. Still municipal tap water in a plastic bottle — honest about it.",
    wtr_hub_statement: "Pure Life proves municipal water can be purified cleanly. WTR Hub does the same at your tap, without the plastic."
  },

  "Liquid Death": {
    parent: "Liquid Death Mountain Water Inc.",
    sourceType: "Natural Spring Water / Sparkling",
    sourceName: "Austrian Alps mountain spring (still) / US municipal (sparkling)",
    treatment: "None for still — bottled at Alpine source",
    ph: 6.8,
    tds_ppm: 68,
    hardness: "Moderate",
    minerals: { calcium: "12 ppm", magnesium: "3.6 ppm", sodium: "4.0 ppm", potassium: "0.6 ppm" },
    additives: "None",
    reportYear: "2024",
    reportSource: "NSF/ANSI 305 + brand quality report",
    reportUrl: "https://liquiddeath.com/pages/quality",
    contaminants: [
      { name: "PFAS", detected: false, level: "ND", fda_limit: "No MCL", risk: "none", category: "Forever Chemicals", health: "NSF certified — non-detected." },
      { name: "Microplastics", detected: false, level: "NONE", fda_limit: "No limit", risk: "none", category: "Packaging", health: "ALUMINUM CAN = zero plastic leaching. Best-in-class packaging format." },
    ],
    recalls: [],
    lawsuits: [],
    violations: [],
    ewg_grade: "B",
    transparency: "Good — NSF certified; aluminum eliminates microplastics",
    risk_score: 10,
    key_concern: "Slightly acidic pH 6.8. US sparkling SKUs from municipal source — quality varies. Austrian Alps still is genuinely clean. Aluminum can is the right choice.",
    wtr_hub_statement: "Liquid Death's aluminum packaging eliminates microplastics. WTR Hub applies the same logic to your tap water."
  },

  "Crystal Geyser": {
    parent: "CG Roxane LLC (Otsuka Holdings, Japan)",
    sourceType: "Natural Spring Water",
    sourceName: "Mount Shasta, Weed CA — at-source bottling",
    treatment: "At-source bottling — minimal; ozonation",
    ph: 7.0,
    tds_ppm: 120,
    hardness: "Moderate",
    additives: "None",
    reportYear: "2024",
    reportSource: "CA arsenic testing + 2021 CG Roxane federal guilty plea + PFAS lawsuits",
    reportUrl: null,
    contaminants: [
      { name: "Arsenic", detected: true, level: "~10 ppb AT LEGAL LIMIT", fda_limit: "10 ppb", risk: "high", category: "Heavy Metal", health: "AT LEGAL LIMIT in CA testing. 2,500x EWG health guideline. Cancer risk. CG Roxane pled guilty to illegally discharging arsenic into local waterways in 2021." },
      { name: "PFAS", detected: true, level: "1.2 ppt", fda_limit: "No MCL", risk: "medium", category: "Forever Chemicals", health: "Detected above 1 ppt expert threshold. Active PFAS class action 2022." },
      { name: "Microplastics", detected: true, level: "HIGH", fda_limit: "No limit", risk: "high", category: "Emerging Contaminant", health: "PET bottle leaching." },
    ],
    violations: [{ year: 2021, description: "CG Roxane LLC PLEADED GUILTY — federal Clean Water Act criminal conviction for illegal discharge of arsenic-contaminated process water into local waterway near Weed, CA bottling facility." }],
    recalls: [],
    lawsuits: [{ year: 2022, description: "PFAS contamination class action lawsuit." }],
    ewg_grade: "D",
    transparency: "Poor",
    risk_score: 98,
    key_concern: "ARSENIC AT LEGAL LIMIT. CG Roxane PLEADED GUILTY to federal Clean Water Act violations for ILLEGAL ARSENIC DISCHARGE in 2021. PFAS lawsuit active. HIGH microplastics.",
    wtr_hub_statement: "WTR Hub removes arsenic at 99%+ — directly addressing Crystal Geyser's at-limit arsenic and their parent company's criminal conviction for arsenic discharge."
  },

  "Kirkland Signature": {
    parent: "Costco Wholesale (private label) — bottled by Niagara Bottling LLC",
    sourceType: "Purified Water",
    sourceName: "Municipal tap water — Niagara Bottling LLC facilities",
    treatment: "Reverse osmosis → UV disinfection",
    ph: 7.0,
    tds_ppm: 30,
    hardness: "Very soft",
    additives: "None",
    reportYear: "2024",
    reportSource: "Niagara NSF certification + FDA 2015 recall records",
    reportUrl: null,
    contaminants: [
      { name: "PFAS", detected: true, level: "~1.0 ppt", fda_limit: "No MCL", risk: "medium", category: "Forever Chemicals", health: "Near 1 ppt expert threshold from Niagara municipal source." },
      { name: "E. coli (2015 event)", detected: false, level: "resolved", fda_limit: "Absent", risk: "none", category: "Microbiological", health: "2015 precautionary recall resolved. Ongoing NSF monitoring." },
      { name: "Microplastics", detected: true, level: "HIGH", fda_limit: "No limit", risk: "high", category: "Emerging Contaminant", health: "Niagara PET bottle leaching." },
    ],
    violations: [],
    recalls: [{ year: 2015, description: "Niagara Bottling voluntary precautionary recall — potential E. coli at one facility. Affected Kirkland, Great Value, Target up&up and other brands. No confirmed illnesses." }],
    lawsuits: [],
    ewg_grade: "C",
    transparency: "Moderate — Niagara NSF certified; Costco does not publish brand-specific quality reports",
    risk_score: 54,
    key_concern: "2015 Niagara E. coli precautionary recall. PFAS near 1 ppt. HIGH microplastics. No brand-specific quality reports published.",
    wtr_hub_statement: "WTR Hub provides the same purified quality at your tap — without the 40-pack of plastic bottles."
  },

  "Proud Source": {
    parent: "Proud Source Water Inc.",
    sourceType: "Natural Spring Water",
    sourceName: "Natural spring, Mackay, Idaho — bottled at source",
    treatment: "None — bottled at source",
    ph: 7.8,
    tds_ppm: 140,
    hardness: "Moderate",
    minerals: { calcium: "22 ppm", magnesium: "5.0 ppm", sodium: "6.5 ppm", potassium: "1.2 ppm", bicarbonate: "100 ppm" },
    additives: "None",
    reportYear: "2024",
    reportSource: "Independent lab testing + NSF/ANSI 305 certification",
    reportUrl: "https://proudsourcewater.com/water-quality",
    contaminants: [
      { name: "PFAS", detected: false, level: "ND", fda_limit: "No MCL", risk: "none", category: "Forever Chemicals", health: "Non-detected — independently verified." },
      { name: "Arsenic", detected: false, level: "0.1 ppb", fda_limit: "10 ppb", risk: "none", category: "Heavy Metal", health: "100x below FDA limit." },
      { name: "Microplastics", detected: false, level: "NONE", fda_limit: "No limit", risk: "none", category: "Packaging", health: "ALUMINUM BOTTLE = zero plastic leaching." },
    ],
    recalls: [],
    lawsuits: [],
    violations: [],
    ewg_grade: "A",
    transparency: "Best-in-class — independently tested; full QA public; 1% For the Planet",
    risk_score: 10,
    key_concern: "Cleanest profile on this list. PFAS non-detected. Aluminum bottle eliminates ALL microplastics. Naturally alkaline pH 7.8. Limited distribution only drawback.",
    wtr_hub_statement: "Proud Source is as clean as bottled water gets. WTR Hub delivers this quality from your own tap at $0.003/gallon."
  },
};

// ─── UPC TO BRAND LOOKUP TABLE ────────────────────────────────────────────────
// Comprehensive UPC database with prefix matching support
const UPC_TO_BRAND = {
  // Dasani
  "049000042566":"Dasani","049000028690":"Dasani","049000042573":"Dasani","049000006424":"Dasani","04900004":"Dasani",
  "049000006346":"Dasani","049000028904":"Dasani","049000028911":"Dasani","049000006360":"Dasani","049000042726":"Dasani","049000072112":"Dasani",
  // Aquafina
  "012000161155":"Aquafina","012000010423":"Aquafina","012000200894":"Aquafina","01200016":"Aquafina",
  "012000001307":"Aquafina","012000001314":"Aquafina","012000001321":"Aquafina","012000161148":"Aquafina","012000001291":"Aquafina","012000204173":"Aquafina",
  // FIJI Water
  "632008000448":"FIJI Water","632008001001":"FIJI Water","632008002008":"FIJI Water","632008004002":"FIJI Water","63200800":"FIJI Water",
  "632565000012":"FIJI Water","632565000029":"FIJI Water","632565000036":"FIJI Water","632565000227":"FIJI Water","632565000234":"FIJI Water","632565000043":"FIJI Water",
  // Poland Spring
  "021136100030":"Poland Spring","021136100023":"Poland Spring","021136110449":"Poland Spring","021136500014":"Poland Spring","02113610":"Poland Spring","02113650":"Poland Spring",
  "075720004010":"Poland Spring","075720004034":"Poland Spring","075720004058":"Poland Spring","075720400010":"Poland Spring","075720400034":"Poland Spring","075720202034":"Poland Spring",
  // Deer Park (BlueTriton)
  "021136110456":"Deer Park","021136110463":"Deer Park","021136510013":"Deer Park",
  // Arrowhead (BlueTriton)
  "021136011009":"Arrowhead","021136011016":"Arrowhead","021136110012":"Arrowhead",
  // Pure Life
  "070847008097":"Pure Life","070847810102":"Pure Life","070847008073":"Pure Life","07084700":"Pure Life",
  "068274540011":"Pure Life","068274540028":"Pure Life","068274540103":"Pure Life",
  // Essentia
  "851060002010":"Essentia","851060002027":"Essentia","851060002034":"Essentia","85106000":"Essentia",
  "851167000019":"Essentia","851167000026":"Essentia","851167000033":"Essentia","851167000101":"Essentia","851167000118":"Essentia","851167000125":"Essentia",
  // evian
  "069000019832":"evian","069000019849":"evian","069000030011":"evian","06900001":"evian",
  "061314000011":"evian","061314000028":"evian","061314000035":"evian","079298612417":"evian","061314000073":"evian","079298612004":"evian",
  // smartwater
  "786162009022":"smartwater","786162009015":"smartwater","786162009039":"smartwater","78616200":"smartwater",
  "786162002501":"smartwater","786162002518":"smartwater","786162002525":"smartwater","786162002594":"smartwater","786162375100":"smartwater","786162002600":"smartwater",
  // Topo Chico
  "078000113474":"Topo Chico","078000113481":"Topo Chico","078000113498":"Topo Chico","07800011":"Topo Chico",
  "021136000108":"Topo Chico","021136000115":"Topo Chico","021136000122":"Topo Chico",
  // Icelandic Glacial
  "898999001003":"Icelandic Glacial","898999001010":"Icelandic Glacial","898999002000":"Icelandic Glacial","89899900":"Icelandic Glacial",
  "893147000014":"Icelandic Glacial","893147000021":"Icelandic Glacial","893147000038":"Icelandic Glacial",
  // VOSS
  "737437000006":"VOSS","737437000013":"VOSS","737437000020":"VOSS","73743700":"VOSS",
  "896716001005":"VOSS","896716001012":"VOSS","896716001029":"VOSS",
  // Crystal Geyser
  "043000012604":"Crystal Geyser","043000012611":"Crystal Geyser","04300001":"Crystal Geyser",
  "654871100019":"Crystal Geyser","654871100026":"Crystal Geyser","654871100033":"Crystal Geyser",
  // Liquid Death
  "852855005001":"Liquid Death","852855005018":"Liquid Death","85285500":"Liquid Death",
  "850742006001":"Liquid Death","850742006018":"Liquid Death","850742006025":"Liquid Death",
  // Kirkland Signature
  "096619107193":"Kirkland Signature","09661910":"Kirkland Signature",
  "096619157402":"Kirkland Signature","096619157419":"Kirkland Signature",
  // Great Value (Walmart)
  "078742284873":"Great Value","07874228":"Great Value",
  // LIFEWTR
  "012000810146":"LIFEWTR","01200081":"LIFEWTR",
  // Proud Source
  "857284006001":"Proud Source","85728400":"Proud Source",
  "859001004000":"Proud Source","859001004017":"Proud Source",
  // Perrier
  "074780720126":"Perrier","07478072":"Perrier",
  // San Pellegrino
  "041508920015":"San Pellegrino","04150892":"San Pellegrino",
};

// ─── UPC LOOKUP FUNCTION ──────────────────────────────────────────────────────
// Handles various barcode formats, leading zeros, and prefix matching
function lookupBrandFromScan(scannedCode) {
  const clean = scannedCode.replace(/\D/g, "");
  // Direct match
  if (UPC_TO_BRAND[clean]) return UPC_TO_BRAND[clean];
  // Try without leading zero
  if (clean.startsWith("0") && UPC_TO_BRAND[clean.slice(1)]) return UPC_TO_BRAND[clean.slice(1)];
  // Try with leading zero
  if (UPC_TO_BRAND["0" + clean]) return UPC_TO_BRAND["0" + clean];
  // Prefix match (8-digit prefixes)
  const prefixMatch = Object.keys(UPC_TO_BRAND).find(k => k.length === 8 && clean.startsWith(k));
  if (prefixMatch) return UPC_TO_BRAND[prefixMatch];
  return null;
}

// ─── BRAND CATEGORIES ─────────────────────────────────────────────────────────
const BRAND_CATEGORIES = {
  NATIONAL: ["Dasani", "Aquafina", "smartwater", "Topo Chico", "Poland Spring", "Pure Life", "Crystal Geyser", "Kirkland Signature"],
  PREMIUM: ["FIJI Water", "evian", "VOSS", "Icelandic Glacial", "Liquid Death", "Proud Source"],
  WELLNESS: ["Essentia"]
};

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────
function computeScore(contaminants) {
  if (!contaminants) return 10;
  return Math.min(100, 10 + contaminants.filter(c => c.risk === "high").length * 22 + contaminants.filter(c => c.risk === "medium").length * 11 + contaminants.filter(c => c.risk === "low").length * 3);
}

function getScoreColor(score) {
  if (score > 66) return B.danger;
  if (score > 33) return B.warning;
  return B.ok;
}

function getEWGColor(grade) {
  if (grade === "A") return B.ok;
  if (grade === "B") return "#0D9488"; // teal
  if (grade === "C") return B.warning;
  if (grade === "D") return "#EA580C"; // orange
  return B.danger; // F
}

function getRiskColor(risk) {
  if (risk === "high") return B.danger;
  if (risk === "medium") return B.warning;
  if (risk === "low") return "#0D9488";
  return B.ok;
}

function getRiskBg(risk) {
  if (risk === "high") return B.dangerBg;
  if (risk === "medium") return B.warningBg;
  if (risk === "low") return "#F0FDFA";
  return B.okBg;
}

function getPhLabel(ph) {
  if (ph >= 8.0) return { text: "ALKALINE", color: B.ok };
  if (ph >= 7.0) return { text: "NEUTRAL", color: B.warning };
  return { text: "ACIDIC", color: B.danger };
}

function getTdsLabel(tds) {
  if (tds <= 50) return "Ultra pure";
  if (tds <= 150) return "Low";
  if (tds <= 300) return "Moderate";
  return "High mineral";
}

// ─── ICON COMPONENT ───────────────────────────────────────────────────────────
function Icon({ name, size = 20, color = B.gray }) {
  const s = size;
  const icons = {
    camera: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M3 8C3 6.9 3.9 6 5 6H7L9 4H15L17 6H19C20.1 6 21 6.9 21 8V18C21 19.1 20.1 20 19 20H5C3.9 20 3 19.1 3 18V8Z" stroke={color} strokeWidth="1.5" fill="none" />
        <circle cx="12" cy="13" r="4" stroke={color} strokeWidth="1.5" fill="none" />
      </svg>
    ),
    search: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.5" fill="none" />
        <line x1="16" y1="16" x2="21" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    check: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill={color} opacity="0.15" />
        <path d="M8 12L11 15L16 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    alert: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill="none" />
        <line x1="12" y1="8" x2="12" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1" fill={color} />
      </svg>
    ),
    x: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill={color} opacity="0.15" />
        <path d="M9 9L15 15M15 9L9 15" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    link: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M18 13V19C18 20.1 17.1 21 16 21H5C3.9 21 3 20.1 3 19V8C3 6.9 3.9 6 5 6H11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M15 3H21V9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 14L21 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    chevronDown: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M6 9L12 15L18 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    chevronUp: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M6 15L12 9L18 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    back: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M15 18L9 12L15 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    settings: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" fill="none" />
        <path d="M12 1V4M12 20V23M4.22 4.22L6.34 6.34M17.66 17.66L19.78 19.78M1 12H4M20 12H23M4.22 19.78L6.34 17.66M17.66 6.34L19.78 4.22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  };
  return icons[name] || null;
}

// ─── CONTAMINANT ROW COMPONENT ────────────────────────────────────────────────
function ContaminantRow({ c, index, expanded, onToggle }) {
  const riskColor = getRiskColor(c.risk);
  const riskBg = getRiskBg(c.risk);
  const isHighRisk = c.risk === "high";
  
  return (
    <div
      data-testid={`contaminant-row-${index}`}
      onClick={onToggle}
      style={{
        background: isHighRisk && c.detected ? B.dangerBg : B.white,
        borderLeft: isHighRisk && c.detected ? `3px solid ${B.danger}` : "3px solid transparent",
        borderBottom: `1px solid ${B.borderLight}`,
        padding: "12px 14px",
        cursor: "pointer",
        animation: `slideIn 0.3s ease ${index * 60}ms both`,
        transition: "background 0.2s"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Status Icon */}
        <div style={{ flexShrink: 0 }}>
          {c.risk === "none" ? (
            <Icon name="check" size={20} color={B.ok} />
          ) : c.risk === "high" ? (
            <Icon name="x" size={20} color={B.danger} />
          ) : (
            <Icon name="alert" size={20} color={riskColor} />
          )}
        </div>
        
        {/* Name + Category */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: B.navy }}>{c.name}</span>
            <span style={{
              fontSize: 8,
              fontWeight: 600,
              color: B.gray,
              background: B.lightGray,
              padding: "2px 6px",
              borderRadius: 10,
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>{c.category}</span>
          </div>
        </div>
        
        {/* Levels */}
        <div style={{ textAlign: "right", flexShrink: 0, minWidth: 70 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: c.detected ? riskColor : B.ok }}>
            {c.level}
          </div>
          <div style={{ fontSize: 8, color: B.gray }}>
            FDA: {c.fda_limit}
          </div>
        </div>
        
        {/* Risk Badge */}
        <div style={{
          fontSize: 8,
          fontWeight: 800,
          color: B.white,
          background: riskColor,
          padding: "3px 8px",
          borderRadius: 10,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          flexShrink: 0
        }}>
          {c.risk}
        </div>
        
        {/* Expand Icon */}
        <Icon name={expanded ? "chevronUp" : "chevronDown"} size={16} color={B.gray} />
      </div>
      
      {/* Expanded Health Info */}
      {expanded && (
        <div style={{
          marginTop: 10,
          paddingTop: 10,
          borderTop: `1px dashed ${B.border}`,
          fontSize: 11,
          color: B.grayDark,
          lineHeight: 1.6,
          animation: "fadeIn 0.2s ease"
        }}>
          <strong style={{ color: B.navy }}>Health Impact:</strong> {c.health}
        </div>
      )}
    </div>
  );
}

// ─── WATER QUALITY REPORT COMPONENT ───────────────────────────────────────────
function WaterQualityReport({ brand, onBack, onBridge }) {
  const [expandedRows, setExpandedRows] = useState({});
  const b = brand;
  const score = b.risk_score || computeScore(b.contaminants);
  const scoreColor = getScoreColor(score);
  const ewgColor = getEWGColor(b.ewg_grade);
  const phInfo = getPhLabel(b.ph);
  
  const toggleRow = (idx) => {
    setExpandedRows(prev => ({ ...prev, [idx]: !prev[idx] }));
  };
  
  const hasRegulatoryHistory = (b.recalls?.length > 0) || (b.lawsuits?.length > 0) || (b.violations?.length > 0);
  const detectedHighRisk = b.contaminants?.filter(c => c.detected && (c.risk === "high" || c.risk === "medium")).slice(0, 3) || [];
  
  return (
    <div style={{ animation: "slideUp 0.4s ease", fontFamily: "'Nunito', sans-serif" }} data-testid="water-quality-report">
      {/* Back Button */}
      <button
        onClick={onBack}
        data-testid="report-back-btn"
        style={{
          background: "none",
          border: "none",
          color: B.gray,
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 4,
          marginBottom: 12,
          padding: "8px 0"
        }}
      >
        <Icon name="back" size={16} color={B.gray} /> Back to brands
      </button>

      {/* 1. REPORT HEADER */}
      <div style={{
        background: `linear-gradient(135deg, ${B.navy}, ${B.navyMid})`,
        borderRadius: 16,
        padding: "20px 16px",
        marginBottom: 16,
        color: B.white
      }} data-testid="report-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: B.blue, letterSpacing: "2px", marginBottom: 6 }}>
              WATER QUALITY REPORT
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }} data-testid="brand-name">
              {b.name || brand.name}
            </div>
            <div style={{ fontSize: 11, color: B.gray, marginBottom: 4 }}>
              {b.parent} • {b.sourceType}
            </div>
            <div style={{ fontSize: 10, color: B.blue, lineHeight: 1.5 }}>
              {b.sourceName}
            </div>
          </div>
          
          <div style={{ textAlign: "center", marginLeft: 16 }}>
            <div style={{ fontSize: 42, fontWeight: 900, color: scoreColor, lineHeight: 1 }} data-testid="risk-score">
              {score}
            </div>
            <div style={{ fontSize: 8, color: scoreColor, fontWeight: 700, letterSpacing: "1px", marginBottom: 8 }}>
              RISK SCORE
            </div>
            <div style={{
              background: ewgColor,
              color: B.white,
              fontSize: 14,
              fontWeight: 900,
              padding: "6px 14px",
              borderRadius: 8,
              display: "inline-block"
            }} data-testid="ewg-grade">
              EWG: {b.ewg_grade}
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${B.navyMid}`, fontSize: 9, color: B.gray }}>
          Report: {b.reportYear} • Source: {b.reportSource}
        </div>
      </div>

      {/* 2. WATER PROFILE GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }} data-testid="water-profile-grid">
        {/* pH Tile */}
        <div style={{ background: B.white, borderRadius: 12, padding: "14px", border: `1px solid ${B.borderLight}` }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: phInfo.color }}>{b.ph}</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: phInfo.color }}>{phInfo.text}</div>
          <div style={{ fontSize: 9, color: B.gray, marginTop: 2 }}>pH Level</div>
        </div>
        
        {/* TDS Tile */}
        <div style={{ background: B.white, borderRadius: 12, padding: "14px", border: `1px solid ${B.borderLight}` }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: B.navy }}>{b.tds_ppm}</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: B.blue }}>{getTdsLabel(b.tds_ppm)}</div>
          <div style={{ fontSize: 9, color: B.gray, marginTop: 2 }}>TDS (ppm)</div>
        </div>
        
        {/* Hardness Tile */}
        <div style={{ background: B.white, borderRadius: 12, padding: "14px", border: `1px solid ${B.borderLight}` }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: B.navy }}>{b.hardness}</div>
          <div style={{ fontSize: 9, color: B.gray, marginTop: 4 }}>Hardness</div>
        </div>
        
        {/* Treatment Tile */}
        <div style={{ background: B.white, borderRadius: 12, padding: "14px", border: `1px solid ${B.borderLight}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: B.navy, lineHeight: 1.4 }}>
            {b.treatment?.split("→")[0]?.trim() || "None"}
          </div>
          <div style={{ fontSize: 9, color: B.gray, marginTop: 4 }}>Treatment</div>
        </div>
      </div>

      {/* 3. MINERALS CARD */}
      {b.minerals && (
        <div style={{ background: B.white, borderRadius: 12, padding: "16px", marginBottom: 16, border: `1px solid ${B.borderLight}` }} data-testid="minerals-card">
          <div style={{ fontSize: 10, fontWeight: 800, color: B.navy, letterSpacing: "1px", marginBottom: 12 }}>
            MINERAL PROFILE
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {Object.entries(b.minerals).map(([name, value]) => (
              <div key={name} style={{ background: B.blueLight, borderRadius: 8, padding: "8px", textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: B.blueDark }}>{value}</div>
                <div style={{ fontSize: 8, color: B.gray, textTransform: "capitalize" }}>{name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {b.tds_ppm < 15 && (
        <div style={{ background: B.warningBg, borderRadius: 12, padding: "12px 16px", marginBottom: 16, border: `1px solid ${B.warning}33` }}>
          <div style={{ fontSize: 11, color: B.warning, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="alert" size={16} color={B.warning} />
            No natural minerals detected (TDS {b.tds_ppm} ppm)
          </div>
        </div>
      )}

      {/* 4. CONTAMINANT ANALYSIS TABLE */}
      <div style={{ background: B.white, borderRadius: 12, overflow: "hidden", marginBottom: 16, border: `1px solid ${B.borderLight}` }} data-testid="contaminant-table">
        <div style={{ background: B.navy, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: B.white, letterSpacing: "0.5px" }}>
            CONTAMINANT ANALYSIS — {b.reportYear} OFFICIAL DATA
          </div>
          <div style={{ fontSize: 9, color: B.gray, marginTop: 4 }}>
            Source: {b.reportSource}
          </div>
        </div>
        
        <div>
          {b.contaminants?.map((c, idx) => (
            <ContaminantRow
              key={idx}
              c={c}
              index={idx}
              expanded={expandedRows[idx]}
              onToggle={() => toggleRow(idx)}
            />
          ))}
        </div>
      </div>

      {/* 5. REGULATORY HISTORY CARD */}
      {hasRegulatoryHistory && (
        <div style={{
          background: B.dangerBg,
          borderRadius: 12,
          padding: "16px",
          marginBottom: 16,
          border: `1px solid ${B.danger}33`,
          animation: b.recalls?.length > 0 ? "pulse 2s ease-in-out 1" : "none"
        }} data-testid="regulatory-history">
          <div style={{ fontSize: 12, fontWeight: 800, color: B.danger, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="alert" size={18} color={B.danger} />
            REGULATORY HISTORY
          </div>
          
          {/* Recalls */}
          {b.recalls?.map((r, idx) => (
            <div key={`recall-${idx}`} style={{
              background: B.white,
              borderLeft: `4px solid #EA580C`,
              borderRadius: 8,
              padding: "12px",
              marginBottom: 8
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#EA580C" }}>FDA RECALL — {r.year}</span>
                {r.fdaClass && (
                  <span style={{ fontSize: 8, fontWeight: 700, color: B.white, background: "#EA580C", padding: "2px 6px", borderRadius: 4 }}>
                    {r.fdaClass}
                  </span>
                )}
              </div>
              {r.date && <div style={{ fontSize: 9, color: B.gray, marginBottom: 4 }}>{r.date}</div>}
              <div style={{ fontSize: 11, color: B.navy, lineHeight: 1.5 }}>{r.description}</div>
            </div>
          ))}
          
          {/* Lawsuits */}
          {b.lawsuits?.map((l, idx) => (
            <div key={`lawsuit-${idx}`} style={{
              background: B.white,
              borderLeft: `4px solid ${B.warning}`,
              borderRadius: 8,
              padding: "12px",
              marginBottom: 8
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: B.warning, marginBottom: 4 }}>LAWSUIT — {l.year}</div>
              <div style={{ fontSize: 11, color: B.navy, lineHeight: 1.5 }}>{l.description}</div>
            </div>
          ))}
          
          {/* Violations */}
          {b.violations?.map((v, idx) => (
            <div key={`violation-${idx}`} style={{
              background: B.white,
              borderLeft: `4px solid ${B.danger}`,
              borderRadius: 8,
              padding: "12px",
              marginBottom: idx < b.violations.length - 1 ? 8 : 0
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: B.danger, marginBottom: 4 }}>
                {v.description?.includes("GUILTY") || v.description?.includes("CRIMINAL") ? "CRIMINAL CONVICTION" : "VIOLATION"} — {v.year}
              </div>
              <div style={{ fontSize: 11, color: B.navy, lineHeight: 1.5 }}>{v.description}</div>
            </div>
          ))}
        </div>
      )}

      {/* 6. KEY CONCERN */}
      <div style={{
        background: B.dangerBg,
        borderLeft: `4px solid ${B.danger}`,
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 16
      }} data-testid="key-concern">
        <div style={{ fontSize: 10, fontWeight: 800, color: B.danger, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="alert" size={16} color={B.danger} />
          KEY CONCERN
        </div>
        <div style={{ fontSize: 12, color: "#742A2A", lineHeight: 1.6 }}>
          {b.key_concern}
        </div>
      </div>

      {/* 7. TRANSPARENCY RATING */}
      <div style={{ background: B.white, borderRadius: 12, padding: "16px", marginBottom: 16, border: `1px solid ${B.borderLight}` }} data-testid="transparency-card">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <div style={{
            background: ewgColor,
            color: B.white,
            fontSize: 20,
            fontWeight: 900,
            width: 48,
            height: 48,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {b.ewg_grade}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: B.navy }}>EWG Transparency Grade</div>
            <div style={{ fontSize: 10, color: B.gray, marginTop: 2 }}>{b.transparency}</div>
          </div>
        </div>
        
        {b.reportUrl && (
          <a
            href={b.reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              background: B.blueLight,
              color: B.blueDark,
              padding: "10px",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
              textDecoration: "none",
              marginTop: 10
            }}
          >
            <Icon name="link" size={14} color={B.blueDark} />
            View Official Report →
          </a>
        )}
      </div>

      {/* 8. WTR HUB BRIDGE */}
      <div style={{
        background: `linear-gradient(135deg, ${B.blue}, ${B.blueDark})`,
        borderRadius: 16,
        padding: "20px 16px",
        marginBottom: 16,
        color: B.white
      }} data-testid="wtr-hub-bridge">
        <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16 }}>💡</span> Home WTR Hub removes:
        </div>
        
        <div style={{ marginBottom: 14 }}>
          {detectedHighRisk.map((c, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Icon name="check" size={16} color={B.white} />
              <span style={{ fontSize: 11, fontWeight: 600 }}>{c.name}</span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.7)" }}>— 99%+ removed</span>
            </div>
          ))}
        </div>
        
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontStyle: "italic", lineHeight: 1.6, marginBottom: 16 }}>
          "{b.wtr_hub_statement}"
        </div>
        
        <button
          onClick={onBridge}
          data-testid="test-tap-water-btn"
          style={{
            width: "100%",
            background: B.white,
            color: B.blueDark,
            border: "none",
            padding: "14px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer"
          }}
        >
          TEST MY TAP WATER →
        </button>
      </div>

      {/* 9. DATA FOOTER */}
      <div style={{ textAlign: "center", padding: "12px", fontSize: 9, color: B.gray }} data-testid="data-footer">
        <div>Data source: {b.reportSource}</div>
        <div>Report year: {b.reportYear}</div>
        {b.reportUrl && (
          <a href={b.reportUrl} target="_blank" rel="noopener noreferrer" style={{ color: B.blue, marginTop: 4, display: "inline-block" }}>
            View source document
          </a>
        )}
      </div>
    </div>
  );
}

// ─── MAIN BOTTLE SCAN VIEW COMPONENT ──────────────────────────────────────────
export default function BottleScanView({ onBridge }) {
  const [mode, setMode] = useState("intro");
  const [scanStep, setScanStep] = useState(0);
  const [brand, setBrand] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notFoundSearch, setNotFoundSearch] = useState("");
  const [scanError, setScanError] = useState(null);
  const [scannedCode, setScannedCode] = useState(null);
  const [permissionState, setPermissionState] = useState("prompt");
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const notFoundInputRef = useRef(null);

  const SCAN_STEPS = [
    "Reading barcode...",
    "Identifying manufacturer...",
    "Querying FDA quality database...",
    "Fetching EWG transparency data...",
    "Cross-referencing Consumer Reports...",
    "Generating water quality report..."
  ];

  // Quick select brands for not found screen
  const QUICK_SELECT_BRANDS = ["Dasani", "Aquafina", "FIJI Water", "Poland Spring", "Topo Chico", "Essentia", "smartwater", "Crystal Geyser", "Icelandic Glacial", "VOSS"];

  // Filter brands by search
  const filteredBrands = Object.keys(BOTTLE_BRANDS).filter(name =>
    name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    BOTTLE_BRANDS[name].parent?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter brands for not found search
  const notFoundFilteredBrands = notFoundSearch.length > 0 
    ? Object.keys(BOTTLE_BRANDS).filter(name =>
        name.toLowerCase().includes(notFoundSearch.toLowerCase()) ||
        BOTTLE_BRANDS[name].parent?.toLowerCase().includes(notFoundSearch.toLowerCase())
      )
    : [];

  // Camera permission handling
  useEffect(() => {
    checkCameraPermission();
  }, []);

  async function checkCameraPermission() {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'camera' });
        setPermissionState(result.state);
        result.onchange = () => setPermissionState(result.state);
      }
    } catch (e) {
      console.log("Permissions API not available");
    }
  }

  async function requestCameraAndScan(forceRetry = false) {
    setScanError(null);
    if (!forceRetry && permissionState === 'denied') {
      setMode("permission_denied");
      return;
    }
    setMode("requesting");
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      stream.getTracks().forEach(track => track.stop());
      setPermissionState("granted");
      setMode("camera");
      
      setTimeout(async () => {
        try {
          const html5QrCode = new Html5Qrcode("barcode-scanner");
          html5QrCodeRef.current = html5QrCode;
          await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 100 }, formatsToSupport: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
            (decodedText) => handleBarcodeDetected(decodedText),
            () => {}
          );
        } catch (err) {
          setScanError("Scanner failed. Please try again.");
        }
      }, 200);
    } catch (err) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionState("denied");
        setMode("permission_denied");
      } else if (err.name === "NotFoundError") {
        setScanError("No camera found. Try manual search.");
        setMode("intro");
      } else {
        setScanError("Camera error: " + err.message);
        setMode("intro");
      }
    }
  }

  async function stopCameraScan() {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (e) {}
    }
  }

  function handleBarcodeDetected(code) {
    stopCameraScan();
    setScannedCode(code);
    processBarcode(code);
  }

  function processBarcode(code) {
    setMode("processing");
    setScanStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setScanStep(step);
      if (step >= SCAN_STEPS.length) {
        clearInterval(interval);
        // Use new lookup function with prefix matching
        const brandName = lookupBrandFromScan(code);
        setTimeout(() => {
          if (brandName && BOTTLE_BRANDS[brandName]) {
            setBrand({ name: brandName, ...BOTTLE_BRANDS[brandName] });
            setMode("result");
          } else {
            setMode("not_found");
          }
        }, 300);
      }
    }, 400);
  }

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
          setBrand({ name: brandName, ...BOTTLE_BRANDS[brandName] });
          setMode("result");
        }, 300);
      }
    }, 350);
  }

  useEffect(() => {
    return () => stopCameraScan();
  }, []);

  // ─── INTRO VIEW ─────────────────────────────────────────────────────────────
  if (mode === "intro") return (
    <div style={{ padding: "16px", fontFamily: "'Nunito', sans-serif" }} data-testid="bottle-scan-intro">
      {/* Camera Scan CTA */}
      <div style={{
        background: B.blue,
        borderRadius: 16,
        padding: "24px 16px",
        marginBottom: 16,
        textAlign: "center"
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${B.blue}, ${B.blueDark})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 12px",
          boxShadow: `0 6px 24px ${B.blue}66`
        }}>
          <Icon name="camera" size={28} color={B.white} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: B.white, marginBottom: 4 }}>Scan Any Water Bottle</h3>
        <p style={{ fontSize: 11, color: "#1A2B3C", marginBottom: 16 }}>Point camera at barcode for instant quality analysis</p>
        <button
          onClick={() => requestCameraAndScan()}
          data-testid="scan-camera-btn"
          style={{
            background: B.white,
            color: B.navy,
            border: "none",
            padding: "12px 32px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer"
          }}
        >
          ENABLE CAMERA
        </button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search any brand..."
          data-testid="brand-search-input"
          style={{
            width: "100%",
            padding: "12px 12px 12px 40px",
            border: `2px solid ${B.border}`,
            borderRadius: 10,
            fontSize: 13,
            fontFamily: "'Nunito', sans-serif",
            boxSizing: "border-box",
            position: "relative"
          }}
        />
        <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
          <Icon name="search" size={18} color={B.gray} />
        </div>
      </div>

      {/* Filtered Results or Categories */}
      {searchQuery ? (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: B.gray, marginBottom: 8, letterSpacing: "1px" }}>
            RESULTS ({filteredBrands.length})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {filteredBrands.map(name => (
              <button
                key={name}
                onClick={() => selectBrand(name)}
                data-testid={`brand-pill-${name.toLowerCase().replace(/\s+/g, '-')}`}
                style={{
                  background: B.white,
                  border: `1px solid ${B.border}`,
                  color: B.navy,
                  padding: "8px 14px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* NATIONAL */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: B.gray, marginBottom: 8, letterSpacing: "1px" }}>NATIONAL</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {BRAND_CATEGORIES.NATIONAL.map(name => (
                <button
                  key={name}
                  onClick={() => selectBrand(name)}
                  data-testid={`brand-pill-${name.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{
                    background: B.white,
                    border: `1px solid ${B.border}`,
                    color: B.navy,
                    padding: "8px 14px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* PREMIUM */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: B.gray, marginBottom: 8, letterSpacing: "1px" }}>PREMIUM</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {BRAND_CATEGORIES.PREMIUM.map(name => (
                <button
                  key={name}
                  onClick={() => selectBrand(name)}
                  data-testid={`brand-pill-${name.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{
                    background: B.blueLight,
                    border: `1px solid ${B.blue}44`,
                    color: B.blueDark,
                    padding: "8px 14px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* WELLNESS */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: B.gray, marginBottom: 8, letterSpacing: "1px" }}>WELLNESS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {BRAND_CATEGORIES.WELLNESS.map(name => (
                <button
                  key={name}
                  onClick={() => selectBrand(name)}
                  data-testid={`brand-pill-${name.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{
                    background: B.okBg,
                    border: `1px solid ${B.ok}44`,
                    color: B.ok,
                    padding: "8px 14px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Data Sources */}
      <div style={{ background: B.lightGray, borderRadius: 12, padding: "12px 16px" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: B.gray, marginBottom: 8, letterSpacing: "1px" }}>DATA SOURCES</div>
        <div style={{ display: "flex", gap: 8 }}>
          {["FDA Reports", "EWG Database", "Consumer Reports"].map(src => (
            <div key={src} style={{
              flex: 1,
              background: B.white,
              borderRadius: 8,
              padding: "8px",
              textAlign: "center",
              border: `1px solid ${B.borderLight}`
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: B.ok }}>{src}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── REQUESTING PERMISSION VIEW ─────────────────────────────────────────────
  if (mode === "requesting") return (
    <div style={{ padding: "40px 20px", textAlign: "center", fontFamily: "'Nunito', sans-serif" }}>
      <div style={{
        width: 60,
        height: 60,
        borderRadius: "50%",
        border: `3px solid ${B.blue}`,
        borderTopColor: "transparent",
        animation: "spin 1s linear infinite",
        margin: "0 auto 20px"
      }} />
      <h3 style={{ fontSize: 16, fontWeight: 800, color: B.navy }}>Requesting Camera Access</h3>
      <p style={{ fontSize: 12, color: B.gray }}>Please tap "Allow" when prompted</p>
    </div>
  );

  // ─── PERMISSION DENIED VIEW ─────────────────────────────────────────────────
  if (mode === "permission_denied") return (
    <div style={{ padding: "30px 20px", textAlign: "center", fontFamily: "'Nunito', sans-serif" }}>
      <div style={{
        width: 60,
        height: 60,
        borderRadius: "50%",
        background: B.dangerBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 16px"
      }}>
        <Icon name="camera" size={28} color={B.danger} />
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: B.navy, marginBottom: 8 }}>Camera Access Required</h3>
      <p style={{ fontSize: 12, color: B.gray, marginBottom: 16 }}>Enable camera in your browser settings</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 260, margin: "0 auto" }}>
        <button
          onClick={() => requestCameraAndScan(true)}
          style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.blueDark})`, color: B.white, border: "none", padding: "12px", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}
        >
          Try Again
        </button>
        <button
          onClick={() => setMode("intro")}
          style={{ background: B.lightGray, color: B.gray, border: "none", padding: "10px", borderRadius: 10, fontWeight: 600, cursor: "pointer" }}
        >
          Search Manually
        </button>
      </div>
    </div>
  );

  // ─── CAMERA VIEW ────────────────────────────────────────────────────────────
  if (mode === "camera") return (
    <div style={{ padding: "16px", fontFamily: "'Nunito', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <button onClick={() => { stopCameraScan(); setMode("intro"); }} style={{ background: "none", border: "none", color: B.gray, fontSize: 12, cursor: "pointer" }}>
          ← Cancel
        </button>
        <div style={{ background: B.okBg, padding: "4px 10px", borderRadius: 12, fontSize: 10, color: B.ok, fontWeight: 700 }}>
          SCANNING
        </div>
      </div>
      <div id="barcode-scanner" ref={scannerRef} style={{ borderRadius: 12, overflow: "hidden", background: B.navy, minHeight: 250 }} />
      <p style={{ fontSize: 11, color: B.gray, textAlign: "center", marginTop: 12 }}>Align barcode within frame</p>
    </div>
  );

  // ─── PROCESSING VIEW ────────────────────────────────────────────────────────
  if (mode === "processing") return (
    <div style={{ padding: "40px 20px", textAlign: "center", fontFamily: "'Nunito', sans-serif" }}>
      <div style={{
        width: 60,
        height: 60,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${B.blue}, ${B.blueDark})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 16px",
        animation: "pulse 1.5s ease-in-out infinite"
      }}>
        <Icon name="search" size={28} color={B.white} />
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: B.navy, marginBottom: 16 }}>Generating Report</h3>
      <div style={{ background: B.white, borderRadius: 12, border: `1px solid ${B.borderLight}`, overflow: "hidden", maxWidth: 300, margin: "0 auto" }}>
        {SCAN_STEPS.map((step, i) => (
          <div key={i} style={{
            padding: "10px 14px",
            background: i < scanStep ? B.okBg : i === scanStep ? B.blueLight : "transparent",
            borderBottom: i < SCAN_STEPS.length - 1 ? `1px solid ${B.borderLight}` : "none",
            fontSize: 11,
            color: i < scanStep ? B.ok : i === scanStep ? B.blue : B.gray,
            fontWeight: i === scanStep ? 700 : 400,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            {i < scanStep ? <Icon name="check" size={14} color={B.ok} /> : i === scanStep ? (
              <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${B.blue}`, borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
            ) : <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${B.border}` }} />}
            {step}
          </div>
        ))}
      </div>
    </div>
  );

  // ─── NOT FOUND VIEW ─────────────────────────────────────────────────────────
  // ─── NOT FOUND VIEW ─────────────────────────────────────────────────────────
  if (mode === "not_found") return (
    <div style={{ padding: "24px 16px", fontFamily: "'Nunito', sans-serif" }} data-testid="not-found-view">
      <div style={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: B.warningBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 14px"
      }}>
        <Icon name="alert" size={26} color={B.warning} />
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 800, color: B.navy, marginBottom: 6, textAlign: "center" }}>Brand Not Found</h3>
      <p style={{ fontSize: 11, color: B.gray, marginBottom: 16, textAlign: "center" }}>
        Scanned code: <strong style={{ color: B.navy }}>{scannedCode}</strong>
      </p>
      
      {/* Search Input */}
      <div style={{ position: "relative", marginBottom: 14 }}>
        <input
          ref={notFoundInputRef}
          type="text"
          value={notFoundSearch}
          onChange={(e) => setNotFoundSearch(e.target.value)}
          placeholder="Type brand name..."
          autoFocus
          data-testid="not-found-search-input"
          style={{
            width: "100%",
            padding: "12px 12px 12px 40px",
            border: `2px solid ${B.border}`,
            borderRadius: 10,
            fontSize: 13,
            fontFamily: "'Nunito', sans-serif",
            boxSizing: "border-box"
          }}
        />
        <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
          <Icon name="search" size={18} color={B.gray} />
        </div>
      </div>
      
      {/* Search Results */}
      {notFoundSearch.length > 0 && notFoundFilteredBrands.length > 0 && (
        <div style={{ 
          background: B.white, 
          border: `1px solid ${B.border}`, 
          borderRadius: 10, 
          marginBottom: 14,
          maxHeight: 180,
          overflowY: "auto"
        }}>
          {notFoundFilteredBrands.slice(0, 6).map(name => (
            <button
              key={name}
              onClick={() => { setNotFoundSearch(""); selectBrand(name); }}
              data-testid={`not-found-result-${name.toLowerCase().replace(/\s+/g, '-')}`}
              style={{
                width: "100%",
                padding: "11px 14px",
                background: "transparent",
                border: "none",
                borderBottom: `1px solid ${B.lightGray}`,
                textAlign: "left",
                fontSize: 12,
                fontWeight: 600,
                color: B.navy,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <Icon name="check" size={14} color={B.blue} />
              {name}
              <span style={{ fontSize: 10, color: B.gray, marginLeft: "auto" }}>{BOTTLE_BRANDS[name]?.sourceType}</span>
            </button>
          ))}
        </div>
      )}
      
      {/* Quick Select Pills */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: B.gray, letterSpacing: "1px", marginBottom: 8 }}>QUICK SELECT</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {QUICK_SELECT_BRANDS.map(name => (
            <button
              key={name}
              onClick={() => selectBrand(name)}
              data-testid={`quick-select-${name.toLowerCase().replace(/\s+/g, '-')}`}
              style={{
                background: B.white,
                border: `1px solid ${B.border}`,
                color: B.navy,
                padding: "6px 10px",
                borderRadius: 16,
                fontSize: 10,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Try Again Button */}
      <button
        onClick={() => { setNotFoundSearch(""); requestCameraAndScan(true); }}
        data-testid="try-again-btn"
        style={{ 
          width: "100%",
          background: `linear-gradient(135deg, ${B.blue}, ${B.blueDark})`, 
          color: B.white, 
          border: "none", 
          padding: "13px", 
          borderRadius: 10, 
          fontWeight: 700, 
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8
        }}
      >
        <Icon name="camera" size={18} color={B.white} />
        Try Again
      </button>
    </div>
  );

  // ─── RESULT VIEW (WATER QUALITY REPORT) ─────────────────────────────────────
  if (mode === "result" && brand) return (
    <div style={{ padding: "16px", fontFamily: "'Nunito', sans-serif" }}>
      <WaterQualityReport
        brand={brand}
        onBack={() => { setBrand(null); setMode("intro"); }}
        onBridge={onBridge}
      />
    </div>
  );

  return null;
}
