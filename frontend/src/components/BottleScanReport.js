/**
 * BottleScanReport.js
 * Generosity™ WTR App — Bottle Scan Result Display
 *
 * Drop into: frontend/src/components/BottleScanReport.js
 *
 * Props:
 *   data: result from getBottleReport()
 *   onGetProtection: () => void  (triggers email capture / product CTA)
 */

import React from 'react';

const GRADE_CONFIG = {
  A: { color: '#34C759', label: 'Excellent', bg: 'rgba(52,199,89,0.08)' },
  B: { color: '#51B0E6', label: 'Good',      bg: 'rgba(81,176,230,0.08)' },
  C: { color: '#FFCC00', label: 'Fair',       bg: 'rgba(255,204,0,0.08)' },
  D: { color: '#FF9500', label: 'Poor',       bg: 'rgba(255,149,0,0.08)' },
  F: { color: '#FF3B30', label: 'Failing',    bg: 'rgba(255,59,48,0.08)' },
};

const MATERIAL_RISK = {
  PET:            { risk: 'medium', note: 'Leaches antimony under heat or prolonged storage' },
  HDPE:           { risk: 'low',    note: 'Generally considered safe; no known leaching' },
  Tritan:         { risk: 'low',    note: 'BPA-free copolyester; limited long-term data' },
  Glass:          { risk: 'low',    note: 'Inert — does not leach chemicals' },
  'Stainless Steel': { risk: 'low', note: 'Inert when food-grade 18/8 or 304 stainless' },
  Aluminum:       { risk: 'low',    note: 'Usually lined; verify lining is BPA-free' },
  Polycarbonate:  { risk: 'high',   note: 'Often contains BPA — avoid for water storage' },
};

export default function BottleScanReport({ data, onGetProtection }) {
  if (!data) return null;

  if (!data.found) {
    return <BottleNotFound data={data} onGetProtection={onGetProtection} />;
  }

  const grade = GRADE_CONFIG[data.generosity_grade] || GRADE_CONFIG.C;
  const material = MATERIAL_RISK[data.material?.type] || { risk: 'unknown', note: 'No data available' };

  return (
    <div style={styles.wrapper}>

      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{ ...styles.header, background: grade.bg, borderTop: `4px solid ${grade.color}` }}>
        <div style={styles.headerLeft}>
          <div style={styles.brandName}>{data.brand}</div>
          <div style={styles.productName}>{data.product}</div>
          <div style={{ marginTop: 8 }}>
            <span style={styles.barcodeTag}>{data.barcode}</span>
          </div>
        </div>
        <div style={styles.scoreWrap}>
          <div style={{ ...styles.scoreNum, color: grade.color }}>
            {data.generosity_score || '—'}
          </div>
          <div style={styles.scoreDenom}>/100</div>
          <div style={{ ...styles.gradeLabel, color: grade.color }}>{data.generosity_grade}</div>
          <div style={{ ...styles.gradeDesc, color: grade.color }}>{grade.label}</div>
        </div>
      </div>

      {/* ── Material Safety ───────────────────────────────────── */}
      <Section title="Material Safety" icon=<><span style={{display:"inline-flex",verticalAlign:"middle"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 3h6M10 3v12l-4 6h12l-4-6V3"/></svg></span></>>
        <Row
          label="Material"
          value={data.material?.type || '—'}
          highlight={false}
        />
        <Row
          label="BPA-Free"
          value={data.material?.bpa_free === true ? '✓ Yes' : data.material?.bpa_free === false ? '✗ No' : 'Not disclosed'}
          status={data.material?.bpa_free === true ? 'good' : data.material?.bpa_free === false ? 'bad' : 'warn'}
        />
        <Row
          label="BPS-Free"
          value={data.material?.bps_free === true ? '✓ Yes' : data.material?.bps_free === false ? '✗ No — BPS is a BPA substitute with similar concerns' : 'Not disclosed'}
          status={data.material?.bps_free === true ? 'good' : data.material?.bps_free === false ? 'bad' : 'warn'}
        />
        {data.material?.antimony_risk && (
          <div style={styles.alertBox}>
            <span style={{...styles.alertIcon, display:"inline-flex", verticalAlign:"middle"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 22h20L12 2z"/><line x1="12" y1="9" x2="12" y2="15"/><circle cx="12" cy="18" r="0.5" fill="currentColor"/></svg></span>
            <span style={styles.alertText}>{data.material?.antimony_note || 'Antimony leaching risk'}</span>
          </div>
        )}
        {material.note && (
          <div style={styles.noteBox}>
            <span style={styles.noteLabel}>Material note:</span> {material.note}
          </div>
        )}
      </Section>

      {/* ── Source Water ──────────────────────────────────────── */}
      <Section title="Source Water" icon=<><span style={{display:"inline-flex",verticalAlign:"middle"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg></span></>>
        <Row label="Source Type" value={data.source_water?.type || 'Not disclosed'} />
        {data.source_water?.location && (
          <Row label="Location" value={data.source_water.location} />
        )}
        {data.source_water?.tds_ppm != null && (
          <Row
            label="Total Dissolved Solids"
            value={`${data.source_water.tds_ppm} ppm`}
            note={data.source_water.tds_ppm > 500 ? 'High TDS — may affect taste' : data.source_water.tds_ppm < 50 ? 'Very low mineral content' : 'Normal range'}
          />
        )}
        {data.source_water?.ph != null && (
          <Row
            label="pH Level"
            value={data.source_water.ph.toFixed(1)}
            note={data.source_water.ph >= 6.5 && data.source_water.ph <= 8.5 ? 'Normal range' : 'Outside typical range'}
          />
        )}
      </Section>

      {/* ── PFAS Testing ─────────────────────────────────────── */}
      <Section title="PFAS Testing" icon=<><span style={{display:"inline-flex",verticalAlign:"middle"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M12 12v4M8 22h8M12 16c-4 0-7 2-7 6"/></svg></span></>>
        <Row
          label="Tested for PFAS"
          value={data.pfas?.tested ? '✓ Yes' : '✗ Not disclosed by manufacturer'}
          status={data.pfas?.tested ? 'good' : 'warn'}
        />
        {data.pfas?.tested && (
          <Row
            label="PFAS Result"
            value={
              data.pfas.result === 'not_detected' ? '✓ Not detected' :
              data.pfas.result === 'detected_below_mcl' ? '! Detected — below EPA MCL' :
              data.pfas.result === 'detected_above_mcl' ? '✗ Detected — above EPA MCL' :
              'Not disclosed'
            }
            status={
              data.pfas.result === 'not_detected' ? 'good' :
              data.pfas.result === 'detected_below_mcl' ? 'warn' : 'bad'
            }
          />
        )}
        {!data.pfas?.tested && (
          <div style={styles.noteBox}>
            {data.pfas?.note || 'PFAS testing not disclosed. Most bottled water brands do not publicly test for PFAS.'}
          </div>
        )}
      </Section>

      {/* ── Certifications ───────────────────────────────────── */}
      <Section title="Certifications" icon=<><span style={{display:"inline-flex",verticalAlign:"middle"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="14" r="6"/><path d="M9 2l3 4 3-4"/><path d="M12 8v6"/></svg></span></>>
        <Row
          label="NSF 51 (Food Equipment)"
          value={data.certifications?.nsf_51 ? '✓ Certified' : '✗ Not certified'}
          status={data.certifications?.nsf_51 ? 'good' : 'warn'}
        />
        <Row
          label="NSF 61 (Drinking Water Components)"
          value={data.certifications?.nsf_61 ? '✓ Certified' : '✗ Not certified'}
          status={data.certifications?.nsf_61 ? 'good' : 'warn'}
        />
        <Row
          label="FDA Compliant"
          value={data.certifications?.fda ? '✓ Yes' : 'Unknown'}
          status={data.certifications?.fda ? 'good' : 'warn'}
        />
      </Section>

      {/* ── Microplastics ─────────────────────────────────────── */}
      <Section title="Microplastics" icon=<><span style={{display:"inline-flex",verticalAlign:"middle"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="8"/><path d="M12 8v4M12 16h.01"/></svg></span></>>
        <Row
          label="Risk Level"
          value={{
            low: '✓ Low risk',
            medium: '! Medium risk',
            high: '✗ High risk',
            unknown: '? Unknown — not tested',
          }[data.microplastics?.risk || 'unknown']}
          status={{
            low: 'good', medium: 'warn', high: 'bad', unknown: 'warn'
          }[data.microplastics?.risk || 'unknown']}
        />
        {data.microplastics?.tested && data.microplastics?.result && (
          <Row label="Test Result" value={data.microplastics.result} />
        )}
      </Section>

      {/* ── vs. Home WTR Hub CTA ─────────────────────────────── */}
      <div style={styles.ctaBlock}>
        <div style={{...styles.ctaIcon, display:"flex", justifyContent:"center"}}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.5"><path d="M12 2v6M8 8h8M6 12a6 6 0 0012 0"/><path d="M12 18v4"/></svg></div>
        <div style={styles.ctaText}>{data.vs_home_wtr_hub}</div>
        <button style={styles.ctaButton} onClick={onGetProtection}>
          See the Home WTR Hub →
        </button>
        <div style={styles.ctaNote}>
          Removes 99.9% of PFAS, lead, chromium-6 & microplastics.
          One-time install. Zero plastic waste. $1,299 with code WELCOME100.
        </div>
      </div>

      {/* ── Data footer ──────────────────────────────────────── */}
      {data.last_verified && (
        <div style={styles.footer}>
          Last verified: {data.last_verified} · Source: {data.data_source || 'Manufacturer + independent testing'}
        </div>
      )}
    </div>
  );
}

// ── Not Found State ────────────────────────────────────────────────────

function BottleNotFound({ data, onGetProtection }) {
  return (
    <div style={styles.notFoundWrapper}>
      <div style={{...styles.notFoundIcon, display:"flex", justifyContent:"center"}}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#51B0E6" strokeWidth="1.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg></div>
      <div style={styles.notFoundTitle}>Brand not in database yet</div>
      <div style={styles.notFoundSub}>
        {data.message || "We haven't added this brand yet."}
      </div>
      <div style={styles.notFoundNote}>
        Regardless of what's in your bottle, the Home WTR Hub filters your tap water
        and removes 99.9% of PFAS, lead, and microplastics — eliminating single-use
        plastic entirely.
      </div>
      <button style={styles.ctaButton} onClick={onGetProtection}>
        Learn About the Home WTR Hub →
      </button>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────

function Section({ title, icon, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <span style={styles.sectionIcon}>{icon}</span>
        <span style={styles.sectionTitle}>{title}</span>
      </div>
      <div style={styles.sectionBody}>{children}</div>
    </div>
  );
}

function Row({ label, value, status, note }) {
  const statusColor = { good: '#34C759', warn: '#FF9500', bad: '#FF3B30' }[status] || '#1C1C1E';
  return (
    <div style={styles.row}>
      <div style={styles.rowLabel}>{label}</div>
      <div style={{ ...styles.rowValue, color: status ? statusColor : '#1C1C1E' }}>
        {value}
        {note && <div style={styles.rowNote}>{note}</div>}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────

const styles = {
  wrapper: {
    fontFamily: "'Montserrat', -apple-system, sans-serif",
    background: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px 20px 16px',
  },
  headerLeft: { flex: 1 },
  brandName: { fontSize: 22, fontWeight: 800, letterSpacing: '-0.7px', color: '#1C1C1E' },
  productName: { fontSize: 14, fontWeight: 400, color: '#6E6E73', marginTop: 2 },
  barcodeTag: { fontSize: 11, fontWeight: 600, color: '#AEAEB2', letterSpacing: '1px' },
  scoreWrap: { textAlign: 'center', minWidth: 80 },
  scoreNum: { fontSize: 40, fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1 },
  scoreDenom: { fontSize: 14, color: '#AEAEB2', fontWeight: 600 },
  gradeLabel: { fontSize: 28, fontWeight: 900, letterSpacing: '-1px', marginTop: 4 },
  gradeDesc: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' },

  section: { borderBottom: '1px solid #F0F1F3' },
  sectionHeader: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '12px 20px 8px',
    background: '#FAFAFA',
  },
  sectionIcon: { display: 'inline-flex', alignItems: 'center' },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.2px' },
  sectionBody: { padding: '4px 20px 12px' },

  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '8px 0',
    borderBottom: '1px solid #F8F8FA',
  },
  rowLabel: { fontSize: 13, color: '#6E6E73', fontWeight: 500, flex: 1 },
  rowValue: { fontSize: 13, fontWeight: 600, textAlign: 'right', flex: 1.2 },
  rowNote: { fontSize: 11, color: '#AEAEB2', fontWeight: 400, marginTop: 2 },

  alertBox: {
    display: 'flex', alignItems: 'flex-start', gap: 8,
    background: 'rgba(255,59,48,0.06)',
    border: '1px solid rgba(255,59,48,0.15)',
    borderRadius: 8, padding: '10px 12px', marginTop: 8,
  },
  alertIcon: { fontSize: 14, flexShrink: 0 },
  alertText: { fontSize: 12, color: '#FF3B30', fontWeight: 600, lineHeight: 1.4 },
  noteBox: {
    fontSize: 12, color: '#6E6E73', lineHeight: 1.5,
    background: '#F8F8FA', borderRadius: 8, padding: '10px 12px', marginTop: 8,
  },
  noteLabel: { fontWeight: 700, color: '#1C1C1E' },

  ctaBlock: {
    padding: '20px',
    background: 'linear-gradient(135deg, #1A5F8A 0%, #2E8DC7 50%, #51B0E6 100%)',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  ctaIcon: { marginBottom: 8 },
  ctaText: {
    fontSize: 14, lineHeight: 1.5, opacity: 0.9, marginBottom: 16,
    fontWeight: 400,
  },
  ctaButton: {
    display: 'inline-block',
    padding: '12px 24px',
    background: '#FFFFFF',
    color: '#2E8DC7',
    border: 'none',
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: '-0.2px',
    marginBottom: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  ctaNote: { fontSize: 11, opacity: 0.75, lineHeight: 1.5 },

  footer: {
    padding: '10px 20px',
    fontSize: 10, color: '#AEAEB2', fontWeight: 500,
    background: '#FAFAFA', textAlign: 'center',
  },

  notFoundWrapper: {
    padding: '40px 24px',
    textAlign: 'center',
    background: '#FFFFFF',
    borderRadius: 16,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  notFoundIcon: { marginBottom: 12 },
  notFoundTitle: { fontSize: 19, fontWeight: 800, color: '#1C1C1E', marginBottom: 8 },
  notFoundSub: { fontSize: 14, color: '#6E6E73', marginBottom: 16 },
  notFoundNote: {
    fontSize: 13, color: '#6E6E73', lineHeight: 1.6,
    background: '#F8F8FA', borderRadius: 12,
    padding: '14px 16px', marginBottom: 20, textAlign: 'left',
  },
};
