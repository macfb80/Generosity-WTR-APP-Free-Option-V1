/**
 * WaterInfoSheet.js — Bottom Sheet for Water Detail
 * Two modes: "incoming" (contaminants) and "filtered" (what was removed)
 */
import React, { useEffect } from 'react';
import { safeLabel } from '../../utils/textCleanup';

// Generosity Pantone palette
const BLUE = '#51B0E6';
const BLUE_DK = '#2A8FCA';
const NAVY = '#0A1A2E';
const GRAY = '#A6A8AB';
const GRAY_LT = '#F0F1F3';
const GRAY_BORDER = '#C5C6C8';
const GREEN = '#1E8A4C';
const WARN = '#F29423';
const DANGER = '#D93025';

// SVG line icons (matching nav bar style)
const icons = {
  flask: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="1.5" strokeLinecap="round"><path d="M9 3h6M10 3v7.4L4.2 18.7A1.5 1.5 0 005.4 21h13.2a1.5 1.5 0 001.2-2.3L14 10.4V3"/><path d="M8.5 14h7"/></svg>,
  bolt: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="1.5" strokeLinecap="round"><path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z"/></svg>,
  shield: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="1.5" strokeLinecap="round"><path d="M12 2l7 4v5c0 5.25-3.5 9.74-7 11-3.5-1.26-7-5.75-7-11V6l7-4z"/></svg>,
  leaf: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="1.5" strokeLinecap="round"><path d="M17 8C8 10 5.9 16.17 3.82 21.34M17 8A6 6 0 0121 2c0 4-2 8-4 10M17 8c-3 1-5 3-6 5"/></svg>,
  droplet: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>,
  check: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" fill="rgba(30,138,76,0.08)"/><path d="M8 12l3 3 5-5"/></svg>,
};

const INCOMING = [
  { name: 'PFAS Forever Chemicals', level: '4.2 ppt', context: 'EPA limit: 4 ppt', status: 'detected', icon: icons.flask },
  { name: 'Lead', level: '2.1 ppb', context: 'Trace levels detected', status: 'trace', icon: icons.bolt },
  { name: 'Chromium-6', level: '0.12 ppb', context: 'No federal limit exists', status: 'detected', icon: icons.shield },
  { name: 'Nitrates', level: '3.2 mg/L', context: 'EWG limit: 0.14 mg/L', status: 'reduced', icon: icons.leaf },
  { name: 'Chlorine', level: '0.8 mg/L', context: 'Disinfection byproduct', status: 'reduced', icon: icons.droplet },
];

const REMOVED = [
  { name: 'PFAS Forever Chemicals', status: 'removed', removedPct: 99.9, method: 'RO membrane', icon: icons.check },
  { name: 'Lead', status: 'removed', removedPct: 99.9, method: 'RO membrane', icon: icons.check },
  { name: 'Chromium-6', status: 'removed', removedPct: 98, method: 'RO + carbon', icon: icons.check },
  { name: 'Chlorine', status: 'removed', removedPct: 99, method: 'Carbon block', icon: icons.check },
  { name: 'Nitrates', status: 'reduced', removedPct: 95, method: 'RO membrane', icon: icons.check },
  { name: 'Sediment', status: 'removed', removedPct: 99.9, method: '5-micron pre-filter', icon: icons.check },
];

const badgeConf = {
  detected: { badge: 'Detected', bg: 'rgba(217,48,37,0.08)', color: DANGER },
  trace: { badge: 'Trace', bg: 'rgba(242,148,35,0.08)', color: WARN },
  reduced: { badge: 'Elevated', bg: 'rgba(242,148,35,0.08)', color: WARN },
  removed: { badge: 'Removed', bg: 'rgba(30,138,76,0.08)', color: GREEN },
  not_detected: { badge: 'Clear', bg: 'rgba(30,138,76,0.08)', color: GREEN },
};

export function WaterInfoSheet({ type, isOpen, onClose, incomingTds, filteredTds, address, zip, onNavigateToReport }) {
  const isIn = type === 'incoming';

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleCTA = () => {
    onClose();
    if (onNavigateToReport) onNavigateToReport();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(10,26,46,0.5)', zIndex: 500,
        display: 'flex', alignItems: 'flex-end',
        opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'all' : 'none',
        transition: 'opacity 0.35s',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 430,
          margin: '0 auto', maxHeight: '88vh', overflowY: 'auto', paddingBottom: 48,
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.42s cubic-bezier(0.32,0.72,0,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ width: 36, height: 4, backgroundColor: GRAY_BORDER, borderRadius: 2, margin: '14px auto 20px' }} />

        <div style={{ padding: '0 24px' }}>
          {/* Eyebrow */}
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 6, color: isIn ? WARN : GREEN }}>
            {isIn ? 'Your Source Water' : 'Your Protected Water'}
          </div>

          {/* Title */}
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.7, lineHeight: 1.2, marginBottom: 8, color: NAVY, fontFamily: 'inherit' }}>
            {isIn ? 'Incoming Water at Your Home' : 'What Your Home WTR Hub Removed'}
          </h2>

          {/* Address */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 16 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={BLUE} strokeWidth="1.5">
              <path d="M7 1C4.8 1 3 2.8 3 5c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z"/>
              <circle cx="7" cy="5" r="1.5" fill={BLUE} stroke="none"/>
            </svg>
            <span style={{ fontSize: 13, color: GRAY }}>{safeLabel(address)}</span>
          </div>

          {/* Body */}
          <p style={{ fontSize: 14, color: GRAY, lineHeight: 1.6, marginBottom: 20 }}>
            {isIn
              ? `Based on your address and local water intelligence data, your municipal supply contains the following before filtration. These reflect typical levels for ZIP code ${zip}.`
              : "Your Home WTR Hub's multi-stage filtration is actively reducing contaminants in real time. Here is what your system removed before water reaches your tap."}
          </p>

          {/* TDS comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8, backgroundColor: GRAY_LT, borderRadius: 16, padding: 16, marginBottom: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: GRAY, letterSpacing: -1, lineHeight: 1, fontFamily: 'inherit' }}>{incomingTds}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_BORDER, marginTop: 2 }}>ppm TDS</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: NAVY, marginTop: 4 }}>Before Filter</div>
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={GRAY_BORDER} strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: BLUE_DK, letterSpacing: -1, lineHeight: 1, fontFamily: 'inherit' }}>{filteredTds}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_BORDER, marginTop: 2 }}>ppm TDS</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: NAVY, marginTop: 4 }}>Your Output</div>
            </div>
          </div>

          {/* Section title */}
          <div style={{ fontSize: 12, fontWeight: 700, color: GRAY, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>
            {isIn ? "What's In Your Source Water" : 'Removed or Reduced'}
          </div>

          {/* Contaminant list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {(isIn ? INCOMING : REMOVED).map((c, i) => {
              const conf = badgeConf[c.status] || badgeConf.trace;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, backgroundColor: conf.bg }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ flexShrink: 0 }}>{c.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{safeLabel(c.name)}</div>
                      <div style={{ fontSize: 11, color: GRAY, marginTop: 1 }}>
                        {isIn ? safeLabel(c.context || '') : `${c.removedPct}% removed · ${safeLabel(c.method || '')}`}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 20, color: conf.color, backgroundColor: conf.bg }}>
                    {conf.badge}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {isIn && (
            <p style={{ fontSize: 11, color: GRAY_BORDER, lineHeight: 1.6, marginBottom: 16 }}>
              Source: EPA SDWIS + UCMR5 data for ZIP {zip}. Data Confidence Score: 94. Updated February 2025.
            </p>
          )}
          {!isIn && (
            <div style={{ background: 'rgba(81,176,230,0.08)', borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: BLUE_DK, marginBottom: 4 }}>Filter Health: 94% capacity remaining</div>
              <div style={{ fontSize: 12, color: BLUE_DK, opacity: 0.8 }}>Estimated next replacement: December 2026</div>
            </div>
          )}

          {/* CTA — routes to WTR INTEL report */}
          <button onClick={handleCTA} style={{ background: `linear-gradient(135deg, ${NAVY}, ${BLUE})`, borderRadius: 16, padding: 14, width: '100%', color: 'white', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: -0.2 }}>
            {isIn ? 'See Full Water Intelligence Report' : 'View Full System Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
