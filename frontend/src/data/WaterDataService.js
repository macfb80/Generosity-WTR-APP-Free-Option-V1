/**
 * WaterDataService.js
 * Generosity™ WTR App — Data Layer
 *
 * This file REPLACES all static CITY_DATA and GENERIC_DATA references.
 * Drop into: frontend/src/data/WaterDataService.js
 *
 * Every call goes through the Next.js proxy (never direct to FastAPI).
 * Never import from this file and call FastAPI directly.
 */

const API_BASE = process.env.REACT_APP_API_BASE || 'https://generosity-dashboard.vercel.app';

// ══════════════════════════════════════════════════════════════════════
// PRIMARY EXPORT: getWaterReport
// Replaces: CITY_DATA[city] and GENERIC_DATA(input)
// ══════════════════════════════════════════════════════════════════════

/**
 * Fetch a full water quality report for a ZIP code or address.
 *
 * @param {string} zipOrAddress — 5-digit ZIP or street address
 * @param {'zip'|'address'|'city'} mode — input mode from the UI
 * @returns {Promise<WaterReport|NotFoundResult>}
 */
export async function getWaterReport(zipOrAddress, mode = 'zip') {
  const cleaned = sanitizeInput(zipOrAddress);
  if (!cleaned) throw new Error('Input is empty after sanitization');

  const params = new URLSearchParams();

  if (mode === 'zip' || /^\d{5}$/.test(cleaned)) {
    // Validate ZIP
    if (!/^\d{5}$/.test(cleaned)) {
      return { status: 'invalid_zip', message: 'Enter a valid 5-digit ZIP code.' };
    }
    params.set('zip_code', cleaned);
  } else {
    // Address or city — resolve server-side
    params.set('address', cleaned);
  }

  try {
    const res = await fetch(`${API_BASE}/api/wtr/report?${params.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      throw new Error(`API error ${res.status}`);
    }

    const data = await res.json();

    // Not found — show proper UI state (no fake reports)
    if (data.status === 'not_found') {
      return {
        status: 'not_found',
        location: cleaned,
        message: data.message || "We don't have data for this location yet.",
        popularCities: data.popular_cities || [],
      };
    }

    // Transform API response into the shape the React components expect
    return transformReportForUI(data);

  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new Error('Request timed out. Check your connection and try again.');
    }
    throw err;
  }
}


/**
 * Fetch bottle scan data by barcode or brand name search.
 */
export async function getBottleReport(query, mode = 'barcode') {
  const cleaned = sanitizeInput(query, mode === 'barcode' ? /[^\d]/g : /[^\w\s&.'-]/g);

  try {
    const endpoint = mode === 'barcode'
      ? `${API_BASE}/api/wtr/bottle/${encodeURIComponent(cleaned)}`
      : `${API_BASE}/api/wtr/bottle/search?q=${encodeURIComponent(cleaned)}`;

    const res = await fetch(endpoint, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`Bottle API error ${res.status}`);

    const data = await res.json();
    return data;
  } catch (err) {
    throw new Error(`Bottle lookup failed: ${err.message}`);
  }
}


/**
 * Submit email capture to Next.js proxy → Sales Engine
 */
export async function captureEmail({
  email, address, zip, city, riskScore,
  highConcernContaminants, source, sessionId, householdProfile,
}) {
  const res = await fetch(`${API_BASE}/api/wtr/capture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email:                      email?.trim().toLowerCase(),
      address:                    address || null,
      zip:                        zip || null,
      city:                       city || null,
      risk_score:                 riskScore || null,
      high_concern_contaminants:  highConcernContaminants || [],
      source:                     source || 'wtr-app',
      session_id:                 sessionId || getSessionId(),
      household_profile:          householdProfile || null,
    }),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok && res.status !== 200) {
    // Optimistic: still show success to user — backend handles DLQ
    console.warn('[WTR Capture] Non-200 response, but treating as success');
  }

  return res.json().catch(() => ({ ok: true }));
}


/**
 * Fetch remote config (discount copy, shopify URL, app settings)
 */
let _remoteConfig = null;
export async function getRemoteConfig() {
  if (_remoteConfig) return _remoteConfig;
  try {
    const res = await fetch(`${API_BASE}/api/wtr/config`, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      _remoteConfig = await res.json();
      return _remoteConfig;
    }
  } catch (e) {
    console.warn('[Remote Config] Using defaults');
  }
  return DEFAULT_CONFIG;
}


// ══════════════════════════════════════════════════════════════════════
// NUMBER FORMATTING
// ══════════════════════════════════════════════════════════════════════

/**
 * Format a raw contaminant measurement for display.
 * Eliminates scientific notation and excessive decimal places.
 *
 * Examples:
 *   7.2e-11   → "< 0.0001"
 *   0.0032    → "0.0032"
 *   1.234567  → "1.23"
 *   1200000   → "1,200,000"
 *   null/NaN  → null  (preserved so components can show "—")
 */
export function formatMeasurement(value) {
  if (value == null || value === '') return null;
  const num = parseFloat(value);
  if (isNaN(num)) return null;

  if (num === 0) return '0';

  const abs = Math.abs(num);

  if (abs < 0.0001) return '< 0.0001';
  if (abs < 0.001)  return parseFloat(num.toFixed(4)).toString();
  if (abs < 0.01)   return parseFloat(num.toFixed(4)).toString();
  if (abs < 1)      return parseFloat(num.toFixed(4)).toString();
  if (abs < 1000)   return parseFloat(num.toFixed(2)).toString();

  return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
}


// ══════════════════════════════════════════════════════════════════════
// TRANSFORM: API response → UI shape
// ══════════════════════════════════════════════════════════════════════

export function transformReportForUI(apiReport) {
  const {
    pwsid, utility_name, zip, primary_source, population_served,
    scores, contaminants, contaminant_summary, violations, violation_summary,
    lead_copper, pfas, utility_context, wios_intelligence,
    product_recommendation, data_meta
  } = apiReport;

  return {
    // Identity
    pwsid,
    city:            utility_name,
    utilityName:     utility_name,
    zip,
    primarySource:   primary_source,
    populationServed: population_served,

    // Scores
    riskScore:       scores?.water_threat_score ?? 0,
    waterThreatScore: scores?.water_threat_score ?? 0,
    dataConfidence:  scores?.data_confidence_score ?? 0,
    variabilityRisk: scores?.variability_risk_score,
    scoreComponents: scores?.score_components ?? {},

    // Contaminants — formatted for ContaminantTable component
    contaminants: (contaminants || []).map(c => ({
      code:           c.code,
      name:           c.name,
      group:          c.group,
      icon:           c.icon || 'warn',
      riskColor:      c.risk_color || 'orange',
      riskLevel:      c.risk_color || 'orange',
      detected:       formatMeasurement(c.concentration),  // ← FORMATTED
      unit:           c.unit,
      sampleDate:     c.sample_date,
      epaMcl:         c.epa_mcl,
      ewgGuideline:   formatMeasurement(c.ewg_guideline),  // ← FORMATTED
      mclExceedance:  c.mcl_exceedance,
      ewgExceedance:  c.ewg_exceedance,
      exceedsMcl:     c.exceeds_mcl,
      exceedsEwg:     c.exceeds_ewg,
      isViolation:    c.is_violation,
      healthShort:    c.health_short,
      healthLong:     c.health_long,
      vulnerable:     c.vulnerable || [],
      carcinogenClass: c.carcinogen_class,
      isRegulated:    c.is_regulated,
      hasNoSafeLevel: c.has_no_safe_level,
      hubRemoves:     c.hub_removes,
      hubRemovalPct:  c.hub_removal_pct,
      sourceOrg:      c.source_org,
      sourceUrl:      c.source_url,
    })),

    // Summary counts
    contaminantCount:    contaminant_summary?.total_detected ?? 0,
    aboveEwgCount:       contaminant_summary?.above_ewg_guideline ?? 0,
    aboveMclCount:       contaminant_summary?.above_epa_mcl ?? 0,
    carcinogenCount:     contaminant_summary?.carcinogens_detected ?? 0,
    pfasCount:           contaminant_summary?.pfas_compounds ?? 0,

    // Violations
    violations: (violations || []).map(v => ({
      contaminant:    v.contaminant,
      category:       v.category,
      isHealthBased:  v.is_health_based,
      status:         v.status,
      beginDate:      v.begin_date,
      publicNotif:    v.public_notif,
      enforcement:    v.enforcement,
      penaltyUsd:     v.penalty_usd,
    })),
    activeHealthViolations: violation_summary?.total_active_health_based ?? 0,
    hasUnaddressedViolations: violation_summary?.has_unaddressed ?? false,

    // Lead
    lead: lead_copper ? {
      ppb90th:          lead_copper.lead_ppb_90th,
      exceedsAction:    lead_copper.lead_exceeds_action,
      safeForChildren:  false,
      note:             lead_copper.lead_note,
      sampleYear:       lead_copper.lead_sample_year,
    } : null,

    // PFAS
    pfas: pfas ? {
      anyDetected:      pfas.any_detected,
      aboveMrl:         pfas.compounds_above_mrl,
      aboveEwg:         pfas.compounds_above_ewg,
      aboveMcl:         pfas.compounds_above_mcl,
      maxPpt:           pfas.max_concentration_ppt,
      maxEwgMultiple:   pfas.max_ewg_multiple,
      compounds:        pfas.compounds_list || [],
      namesAboveEwg:    pfas.names_above_ewg,
      latestSample:     pfas.latest_sample_date,
      dataSource:       pfas.data_source,
      totalTested:      pfas.total_compounds_tested,
      ucmrCycle:        pfas.ucmr_cycle,
    } : null,

    // WIOS intelligence
    wios: wios_intelligence ? {
      mwri:             wios_intelligence.municipal_water_risk_index,
      ddi:              wios_intelligence.distribution_degradation_index,
      powered:          wios_intelligence.wios_powered,
      ddiAlert:         wios_intelligence.ddi_alert,
    } : null,

    // Utility context
    utilityContext: utility_context ? {
      lastInspection:    utility_context.last_inspection_date,
      significantNonComplier: utility_context.significant_noncomplier,
      inspections5yr:    utility_context.inspection_count_5yr,
    } : null,

    // Product CTA
    product: product_recommendation ? {
      name:     product_recommendation.product,
      sku:      product_recommendation.sku,
      price:    product_recommendation.price,
      code:     product_recommendation.discount_code,
      headline: product_recommendation.cta_headline,
      subtext:  product_recommendation.cta_subtext,
      button:   product_recommendation.cta_button,
      url:      product_recommendation.shopify_url,
      removes:  product_recommendation.contaminants_addressed,
      removalPct: product_recommendation.removal_pct,
    } : null,

    // Metadata
    dataMeta: {
      sources:     data_meta?.sources || [],
      oldestData:  data_meta?.oldest_data,
      generated:   data_meta?.report_generated,
      methodology: data_meta?.methodology_version,
      disclaimer:  data_meta?.data_disclaimer,
    },
  };
}


// ══════════════════════════════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════════════════════════════

/**
 * Sanitize user input — strip HTML, limit length.
 */
export function sanitizeInput(raw, stripPattern = /[<>"'`;]/g) {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .replace(stripPattern, '')
    .trim()
    .slice(0, 200);
}

/**
 * Generate or retrieve a session ID (stored in sessionStorage, not localStorage).
 */
export function getSessionId() {
  let id = sessionStorage.getItem('wtr_session_id');
  if (!id) {
    id = `wtr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('wtr_session_id', id);
  }
  return id;
}

/**
 * Compute risk level label from Water Threat Score
 */
export function getRiskLevel(score) {
  if (score >= 70) return { label: 'HIGH RISK',    color: '#FF3B30', bg: 'rgba(255,59,48,0.1)' };
  if (score >= 45) return { label: 'MODERATE RISK', color: '#FF9500', bg: 'rgba(255,149,0,0.1)' };
  if (score >= 20) return { label: 'LOW RISK',      color: '#FFCC00', bg: 'rgba(255,204,0,0.1)' };
  return              { label: 'MINIMAL RISK',      color: '#34C759', bg: 'rgba(52,199,89,0.1)' };
}

/**
 * Format exceedance ratio for display: 12.3 → "12× over safe limit"
 */
export function formatExceedance(ratio) {
  if (!ratio || ratio <= 1) return null;
  if (ratio >= 100) return `${Math.round(ratio)}× OVER`;
  if (ratio >= 10)  return `${Math.round(ratio)}× OVER`;
  return `${ratio.toFixed(1)}× OVER`;
}

// Default config (used if remote config fetch fails)
const DEFAULT_CONFIG = {
  shopify_url:    'https://generositywtr.myshopify.com/products/home-hydration-hub',
  app_price:      1299.99,
  code:           'WELCOME100',
  headline:       'Get an extra $100 off the Home WTR Hub',
  subtext:        'Sale price $1,399.99 → Your price $1,299.99 with code WELCOME100',
  button_copy:    'GET MY $100 OFF →',
};
