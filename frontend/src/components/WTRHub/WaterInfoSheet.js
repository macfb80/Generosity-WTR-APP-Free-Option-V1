/**
 * WaterInfoSheet.js — Bottom Sheet for Water Detail
 * Two modes: "incoming" (contaminants) and "filtered" (what was removed)
 */
import React, { useEffect } from 'react';
import { safeLabel } from '../../utils/textCleanup';

const GREEN = '#1E8A4C';
const GREEN_DK = '#166938';
const AMBER = '#FF9500';
const GRAY_1 = '#0A1A2E';
const GRAY_2 = '#A6A8AB';
const GRAY_3 = '#A6A8AB';
const GRAY_4 = '#C5C6C8';
const GRAY_5 = '#F0F1F3';
const GREEN_SOFT = 'rgba(52,199,89,0.08)';

const INCOMING = [
  { name: 'PFAS Forever Chemicals', level: '4.2 ppt', context: 'EPA limit: 4 ppt', status: 'detected', icon: '\uD83E\uDDEA' },
  { name: 'Lead', level: '2.1 ppb', context: 'Trace levels detected', status: 'trace', icon: '\uD83D\uDD29' },
  { name: 'Chromium-6', level: '0.12 ppb', context: 'No federal limit exists', status: 'detected', icon: '\u2622\uFE0F' },
  { name: 'Nitrates', level: '3.2 mg/L', context: 'EWG limit: 0.14 mg/L', status: 'reduced', icon: '\uD83C\uDF31' },
  { name: 'Chlorine', level: '0.8 mg/L', context: 'Disinfection byproduct', status: 'reduced', icon: '\uD83D\uDCA7' },
];

const REMOVED = [
  { name: 'PFAS Forever Chemicals', status: 'removed', removedPct: 99.9, method: 'RO membrane', icon: '\u2705' },
  { name: 'Lead', status: 'removed', removedPct: 99.9, method: 'RO membrane', icon: '\u2705' },
  { name: 'Chromium-6', status: 'removed', removedPct: 98, method: 'RO + carbon', icon: '\u2705' },
  { name: 'Chlorine', status: 'removed', removedPct: 99, method: 'Carbon block', icon: '\u2705' },
  { name: 'Nitrates', status: 'reduced', removedPct: 95, method: 'RO membrane', icon: '\u2705' },
  { name: 'Sediment', status: 'removed', removedPct: 99.9, method: '5-micron pre-filter', icon: '\u2705' },
];

const badgeConf = {
  detected: { badge: 'Detected', bg: 'rgba(255,59,48,0.08)', color: '#FF3B30' },
  trace: { badge: 'Trace', bg: 'rgba(255,149,0,0.08)', color: AMBER },
  reduced: { badge: 'Elevated', bg: 'rgba(255,149,0,0.08)', color: AMBER },
  removed: { badge: 'Removed', bg: GREEN_SOFT, color: GREEN_DK },
  not_detected: { badge: 'Clear', bg: GREEN_SOFT, color: GREEN_DK },
};

export function WaterInfoSheet({ type, isOpen, onClose, incomingTds, filteredTds, address, zip }) {
  const isIn = type === 'incoming';

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 500,
        display: 'flex', alignItems: 'flex-end',
        opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'all' : 'none',
        transition: 'opacity 0.35s',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF', borderRadius: '28px 28px 0 0', width: '100%', maxWidth: 430,
          margin: '0 auto', maxHeight: '88vh', overflowY: 'auto', paddingBottom: 48,
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.42s cubic-bezier(0.32,0.72,0,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ width: 36, height: 4, backgroundColor: GRAY_4, borderRadius: 2, margin: '14px auto 20px' }} />

        <div style={{ padding: '0 24px' }}>
          {/* Eyebrow */}
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 6, color: isIn ? AMBER : GREEN_DK }}>
            {isIn ? 'Your Source Water' : 'Your Protected Water'}
          </div>

          {/* Title */}
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.7, lineHeight: 1.2, marginBottom: 8, color: GRAY_1, fontFamily: 'inherit' }}>
            {isIn ? 'Incoming Water at Your Home' : 'What Your Home WTR Hub Removed'}
          </h2>

          {/* Address */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 16 }}>
            <span>\uD83D\uDCCD</span>
            <span style={{ fontSize: 13, color: GRAY_2 }}>{safeLabel(address)}</span>
          </div>

          {/* Body */}
          <p style={{ fontSize: 14, color: GRAY_2, lineHeight: 1.6, marginBottom: 20 }}>
            {isIn
              ? `Based on your address and local water intelligence data, your municipal supply contains the following before filtration. These reflect typical levels for ZIP code ${zip}.`
              : "Your Home WTR Hub's multi-stage filtration is actively reducing contaminants in real time. Here's what your system removed before water reaches your tap."}
          </p>

          {/* TDS comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8, backgroundColor: GRAY_5, borderRadius: 16, padding: 16, marginBottom: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: AMBER, letterSpacing: -1, lineHeight: 1, fontFamily: 'inherit' }}>{incomingTds}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_3, marginTop: 2 }}>ppm TDS</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: GRAY_2, marginTop: 4 }}>Before Filter</div>
            </div>
            <div style={{ fontSize: 24, color: GRAY_3, textAlign: 'center' }}>→</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: GREEN_DK, letterSpacing: -1, lineHeight: 1, fontFamily: 'inherit' }}>{filteredTds}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: GRAY_3, marginTop: 2 }}>ppm TDS</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: GRAY_2, marginTop: 4 }}>Your Output</div>
            </div>
          </div>

          {/* Section title */}
          <div style={{ fontSize: 12, fontWeight: 700, color: GRAY_3, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>
            {isIn ? "What's In Your Source Water" : 'Removed or Reduced'}
          </div>

          {/* Contaminant list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {(isIn ? INCOMING : REMOVED).map((c, i) => {
              const conf = badgeConf[c.status] || badgeConf.trace;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, backgroundColor: conf.bg }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{c.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: GRAY_1 }}>{safeLabel(c.name)}</div>
                      <div style={{ fontSize: 11, color: GRAY_2, marginTop: 1 }}>
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
            <p style={{ fontSize: 11, color: GRAY_3, lineHeight: 1.6, marginBottom: 16 }}>
              Source: EPA SDWIS + UCMR5 data for ZIP {zip}. Data Confidence Score: 94. Updated February 2025.
            </p>
          )}
          {!isIn && (
            <div style={{ background: GREEN_SOFT, borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: GREEN_DK, marginBottom: 4 }}>Filter Health: 94% capacity remaining</div>
              <div style={{ fontSize: 12, color: GREEN_DK, opacity: 0.8 }}>Estimated next replacement: December 2026</div>
            </div>
          )}

          {/* CTA */}
          <button onClick={onClose} style={{ background: 'linear-gradient(135deg, #1A5F8A, #51B0E6)', borderRadius: 16, padding: 14, width: '100%', color: 'white', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: -0.2 }}>
            {isIn ? 'See Full Water Intelligence Report →' : 'View Full System Report →'}
          </button>
        </div>
      </div>
    </div>
  );
}
