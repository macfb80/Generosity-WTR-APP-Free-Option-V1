// src/components/tbv/WTRHubAnimation.jsx
import React, { useState, useEffect } from 'react';
import Icon from '../ds/Icon';

/**
 * WTRHubAnimation — multi-stage filtration animation showing the Home WTR Hub
 * flow with rotating contaminant callout.
 *
 * Cycles through the four filtration stages every 1.4s, simultaneously rotating
 * through the contaminants this household's water contains and the Hub removes.
 *
 * Stages: CP (Coarse + Carbon) → RO (Reverse Osmosis 0.0001μ) → TC (Total Carbon)
 *         → ALK (Alkaline Mineral)
 *
 * Props:
 *   contaminants (array)  Array of contaminant objects with { name, risk, detail, removed }
 *   active       (bool)   If true, cycles. If false, holds at first state.
 */
const RISK_COLOR = {
  high: '#B84A4A',
  medium: '#C89B3C',
  low: '#4A8A6F',
};

const RISK_BG = {
  high: 'rgba(184, 74, 74, 0.08)',
  medium: 'rgba(200, 155, 60, 0.08)',
  low: 'rgba(74, 138, 111, 0.08)',
};

export default function WTRHubAnimation({ contaminants, active }) {
  const [step, setStep] = useState(0);
  const [pidx, setPidx] = useState(0);

  const stages = [
    { id: 'CP',  color: '#51B0E6', desc: 'Sediment & Carbon' },
    { id: 'RO',  color: '#3DA0DA', desc: '0.0001μ Filtration' },
    { id: 'TC',  color: '#2A8FCA', desc: 'Final Polish' },
    { id: 'ALK', color: '#4A8A6F', desc: 'Mineral Infusion' },
  ];

  const removed = contaminants?.filter((c) => c.removed) || [];

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      setStep((s) => (s + 1) % stages.length);
      setPidx((p) => (p + 1) % Math.max(removed.length, 1));
    }, 1400);
    return () => clearInterval(t);
  }, [active, removed.length, stages.length]);

  const cur = removed[pidx];

  return (
    <div className="py-2">
      {/* Stage flow row */}
      <div className="flex items-center justify-center gap-0 mb-3">
        {/* Tap */}
        <div className="text-center" style={{ minWidth: 40 }}>
          <div
            className="mx-auto mb-1 flex items-center justify-center"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: '#F0F1F3',
              border: '2px solid #A6A8AB',
            }}
          >
            <Icon name="tap" size={18} color="#A6A8AB" />
          </div>
          <div className="text-text-tertiary" style={{ fontSize: 7 }}>TAP</div>
        </div>

        <div className="text-text-quaternary" style={{ fontSize: 12, margin: '0 2px', paddingBottom: 14 }}>→</div>

        {/* Stages */}
        {stages.map((s, i) => {
          const isActive = step === i;
          return (
            <div key={s.id} className="flex items-center">
              <div className="text-center">
                <div
                  className="mx-auto mb-1 flex items-center justify-center font-bold"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: isActive
                      ? `linear-gradient(135deg, ${s.color}, ${s.color}cc)`
                      : '#F0F1F3',
                    border: `2px solid ${isActive ? s.color : '#E8EAED'}`,
                    fontSize: 8,
                    color: isActive ? '#FFFFFF' : s.color,
                    transition: 'all 0.4s',
                    boxShadow: isActive ? `0 0 12px ${s.color}55` : 'none',
                  }}
                >
                  {s.id}
                </div>
                <div
                  style={{
                    fontSize: 7,
                    color: isActive ? s.color : '#A6A8AB',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.desc}
                </div>
              </div>
              {i < stages.length - 1 && (
                <div
                  className="text-text-quaternary"
                  style={{ fontSize: 11, margin: '0 2px', paddingBottom: 14 }}
                >
                  →
                </div>
              )}
            </div>
          );
        })}

        <div className="text-text-quaternary" style={{ fontSize: 12, margin: '0 2px', paddingBottom: 14 }}>→</div>

        {/* Pure */}
        <div className="text-center" style={{ minWidth: 40 }}>
          <div
            className="mx-auto mb-1 flex items-center justify-center"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #51B0E6, #3DA0DA)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            <Icon name="sparkle" size={18} color="#FFFFFF" active />
          </div>
          <div className="text-brand font-semibold" style={{ fontSize: 7 }}>PURE</div>
        </div>
      </div>

      {/* Rotating contaminant callout */}
      {cur && active && (
        <div
          className="rounded-card flex items-center gap-2.5 animate-fade-in"
          style={{
            background: RISK_BG[cur.risk],
            border: `1px solid ${RISK_COLOR[cur.risk]}33`,
            padding: '8px 12px',
          }}
        >
          <div
            className="shrink-0 rounded-full"
            style={{
              width: 7,
              height: 7,
              background: RISK_COLOR[cur.risk],
              boxShadow: `0 0 6px ${RISK_COLOR[cur.risk]}`,
            }}
          />
          <div className="flex-1">
            <div className="font-semibold text-text-primary" style={{ fontSize: 10 }}>
              Removing: <span style={{ color: RISK_COLOR[cur.risk] }}>{cur.name}</span>
            </div>
            <div className="text-text-tertiary mt-0.5" style={{ fontSize: 9 }}>
              {cur.detail?.split('.')[0]}
            </div>
          </div>
          <div
            className="text-text-onAccent font-bold rounded-pill"
            style={{
              background: '#4A8A6F',
              fontSize: 8,
              padding: '2px 7px',
            }}
          >
            99%+ OUT
          </div>
        </div>
      )}

      {/* 4-up stats grid */}
      <div className="grid mt-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
        {[
          ['1,000+', 'Contaminants'],
          ['99%+', 'PFAS'],
          ['99%+', 'Heavy Metals'],
          ['9+ pH', 'Alkaline'],
        ].map(([v, l], i) => (
          <div
            key={`stat-${i}`}
            className="rounded-card text-center"
            style={{
              background: '#E8F4FB',
              padding: '7px 3px',
            }}
          >
            <div
              className="font-bold leading-none text-brand"
              style={{ fontSize: 11, fontVariantNumeric: 'tabular-nums' }}
            >
              {v}
            </div>
            <div className="text-text-tertiary mt-0.5" style={{ fontSize: 7 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
