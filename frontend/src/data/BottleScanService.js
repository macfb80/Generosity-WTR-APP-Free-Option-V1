/**
 * BottleScanService.js
 * Generosity™ WTR App V6 — Bottle Scan API Layer
 * Drop into: frontend/src/data/BottleScanService.js
 *
 * All API calls go directly to the Render API (Dashboard Vercel proxy not used).
 */

const API_BASE = 'https://generosity-sales-engine-mvp-api.onrender.com';
const SERVICE_TOKEN = '3b56aff84e17fc6b369adb1906549f10af6d4776b392b2ec843aaba958ccd102';

// ══════════════════════════════════════════════════
// CORE API CALLS
// ══════════════════════════════════════════════════

export async function getBottleByBarcode(barcode) {
  const clean = barcode.replace(/\D/g, '');
  if (clean.length < 8 || clean.length > 14) {
    return { found: false, error: 'invalid_barcode' };
  }
  const res = await fetch(`${API_BASE}/api/wtr/bottle/${clean}`, {
    headers: { 'Authorization': 'Bearer ' + SERVICE_TOKEN },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Bottle API ${res.status}`);
  return res.json();
}

export async function searchBottles(query, options = {}) {
  const { category, minScore, limit = 10 } = options;
  const params = new URLSearchParams({ q: query.trim(), limit });
  if (category) params.set('category', category);
  if (minScore != null) params.set('min_score', minScore);
  const res = await fetch(`${API_BASE}/api/wtr/bottle/search?${params}`, {
    headers: { 'Authorization': 'Bearer ' + SERVICE_TOKEN },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Search API ${res.status}`);
  return res.json();
}

export async function getLeaderboard(category = null, limit = 10) {
  const params = new URLSearchParams({ limit });
  if (category) params.set('category', category);
  const res = await fetch(`${API_BASE}/api/wtr/bottle/leaderboard?${params}`, {
    headers: { 'Authorization': 'Bearer ' + SERVICE_TOKEN },
  });
  if (!res.ok) throw new Error(`Leaderboard API ${res.status}`);
  return res.json();
}

// ══════════════════════════════════════════════════
// DISPLAY UTILITIES
// ══════════════════════════════════════════════════

export const GRADE_CONFIG = {
  'A+': { color: '#00B347', bg: 'rgba(0,179,71,0.08)',   label: 'Exceptional', emoji: '🏆' },
  'A':  { color: '#34C759', bg: 'rgba(52,199,89,0.08)',  label: 'Excellent',   emoji: '⭐' },
  'A-': { color: '#34C759', bg: 'rgba(52,199,89,0.08)',  label: 'Very Good',   emoji: '⭐' },
  'B+': { color: '#51B0E6', bg: 'rgba(81,176,230,0.08)', label: 'Good',        emoji: '👍' },
  'B':  { color: '#51B0E6', bg: 'rgba(81,176,230,0.08)', label: 'Good',        emoji: '👍' },
  'B-': { color: '#51B0E6', bg: 'rgba(81,176,230,0.08)', label: 'Acceptable',  emoji: '👍' },
  'C+': { color: '#FFCC00', bg: 'rgba(255,204,0,0.08)',  label: 'Fair',        emoji: '⚠️' },
  'C':  { color: '#FFCC00', bg: 'rgba(255,204,0,0.08)',  label: 'Fair',        emoji: '⚠️' },
  'C-': { color: '#FFCC00', bg: 'rgba(255,204,0,0.08)',  label: 'Marginal',    emoji: '⚠️' },
  'D+': { color: '#FF9500', bg: 'rgba(255,149,0,0.08)',  label: 'Poor',        emoji: '⛔' },
  'D':  { color: '#FF9500', bg: 'rgba(255,149,0,0.08)',  label: 'Poor',        emoji: '⛔' },
  'D-': { color: '#FF9500', bg: 'rgba(255,149,0,0.08)',  label: 'Very Poor',   emoji: '⛔' },
  'F':  { color: '#FF3B30', bg: 'rgba(255,59,48,0.08)',  label: 'Failing',     emoji: '🚫' },
};

export const PFAS_CONFIG = {
  'not_detected':        { label: '✓ Not Detected',           color: '#34C759', urgent: false },
  'below_0.1ppt':        { label: '✓ Below 0.1 ppt',         color: '#34C759', urgent: false },
  'below_1ppt':          { label: '⚠️ Below 1 ppt (EWG limit)', color: '#FFCC00', urgent: false },
  'below_mcl':           { label: '⚠️ Below EPA Limit',        color: '#FF9500', urgent: true },
  'detected_below_mcl':  { label: '⚠️ Detected — Below EPA MCL', color: '#FF9500', urgent: true },
  'above_mcl':           { label: '✗ Exceeds EPA Limit',       color: '#FF3B30', urgent: true },
  'detected_undisclosed':{ label: '⚠️ Detected — Level Hidden', color: '#FF9500', urgent: true },
  'not_disclosed':       { label: '? Not Tested or Disclosed', color: '#AEAEB2', urgent: false },
  'not_tested':          { label: '? Not Tested',              color: '#AEAEB2', urgent: false },
  'not_applicable':      { label: 'N/A',                       color: '#AEAEB2', urgent: false },
};

export const MATERIAL_CONFIG = {
  'Glass':             { safety: 'Safest',   risk: 0, icon: '🥂', note: 'Inert — zero leaching of any chemical' },
  'Aluminum':          { safety: 'Safe',     risk: 1, icon: '🥫', note: 'Infinitely recyclable · No antimony risk' },
  'Stainless Steel':   { safety: 'Safe',     risk: 0, icon: '⚙️',  note: 'Inert when food-grade (18/8 or 304 stainless)' },
  'Carton/Paperboard': { safety: 'Good',     risk: 1, icon: '📦', note: 'Renewable — verify carton is PFAS-free' },
  'Compostable':       { safety: 'Good',     risk: 1, icon: '🌿', note: 'Compostable bioplastics — verify PFAS-free' },
  'HDPE':              { safety: 'Decent',   risk: 2, icon: '🧴', note: 'Generally safe · Semi-rigid · Opaque' },
  'Tritan':            { safety: 'Decent',   risk: 2, icon: '🫙', note: 'BPA-free copolyester · Limited long-term data' },
  'PP':                { safety: 'Decent',   risk: 2, icon: '🪣', note: 'Generally safe for single use' },
  'LDPE':              { safety: 'Caution',  risk: 3, icon: '⚗️', note: 'Flexible plastic · Some leaching concerns' },
  'PET':               { safety: 'Caution',  risk: 3, icon: '♻️', note: 'Leaches antimony at high temps · Microplastic risk' },
  'Polycarbonate':     { safety: 'Avoid',    risk: 4, icon: '⚠️', note: 'May contain BPA — avoid for water storage' },
};

export function getGradeConfig(grade) {
  return GRADE_CONFIG[grade] || GRADE_CONFIG['C'];
}

export function getPfasConfig(result) {
  return PFAS_CONFIG[result] || PFAS_CONFIG['not_disclosed'];
}

export function getMaterialConfig(material) {
  return MATERIAL_CONFIG[material] || { safety: 'Unknown', risk: 2, icon: '❓', note: '' };
}

/**
 * Compute 5-year cost comparison
 * @param {number} pricePerLiter
 * @param {number} litersPerDay - default 2L/day household
 */
export function computeCostComparison(pricePerLiter, litersPerDay = 2) {
  if (!pricePerLiter) return null;
  const daily    = pricePerLiter * litersPerDay;
  const annual   = daily * 365;
  const fiveYear = annual * 5;
  // Hub: $1,299.99 install + $149.99/yr filter replacement × 4 years
  const hubTotal = 1299.99 + (149.99 * 4);
  const savings  = Math.max(0, fiveYear - hubTotal);
  const bottlesPrevented = Math.round(litersPerDay * 365 * 5 * 2); // ~500ml bottles

  return {
    daily:            daily.toFixed(2),
    annual:           annual.toFixed(0),
    fiveYear:         fiveYear.toFixed(0),
    hubTotal:         hubTotal.toFixed(0),
    savings:          savings.toFixed(0),
    hubWins:          fiveYear > hubTotal,
    bottlesPrevented,
    barPctBottle:     100,
    barPctHub:        Math.min(100, Math.round((hubTotal / fiveYear) * 100)),
  };
}

/**
 * Format TDS for human display
 */
export function formatTDS(tds) {
  if (tds == null) return '\u2014';
  if (tds < 50)   return `${tds} ppm (Ultra-pure)`;
  if (tds < 150)  return `${tds} ppm (Low mineral)`;
  if (tds < 500)  return `${tds} ppm (Moderate mineral)`;
  if (tds < 1000) return `${tds} ppm (High mineral)`;
  return              `${tds} ppm (Very high mineral — strong taste)`;
}

/**
 * Format pH
 */
export function formatPH(ph) {
  if (ph == null) return '\u2014';
  if (ph < 6.5)   return `${ph} (Acidic)`;
  if (ph <= 7.0)  return `${ph} (Neutral)`;
  if (ph <= 8.0)  return `${ph} (Slightly alkaline)`;
  if (ph <= 9.0)  return `${ph} (Alkaline)`;
  return               `${ph} (Strongly alkaline)`;
}

/**
 * Build Shopify URL with full UTM attribution for bottle scan CTA
 */
export function buildShopifyUrl(brandName, generosityScore) {
  const base = 'https://generositywtr.myshopify.com/products/home-hydration-hub';
  const params = new URLSearchParams({
    utm_source:   'wtr-app',
    utm_medium:   'bottle-scan',
    utm_campaign: 'bottle-comparison',
    utm_content:  (brandName || 'unknown').replace(/\s/g, '-').toLowerCase(),
    utm_term:     String(generosityScore || 0),
    discount:     'WELCOME100',
  });
  return `${base}?${params}`;
}
