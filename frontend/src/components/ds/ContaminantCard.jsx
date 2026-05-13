// src/components/ds/ContaminantCard.jsx
// Glass material card with risk-tier color bleeding in from the left edge
// as a soft gradient (replaces previous hard 3px stripe).

import React from 'react';

const RISK_TONE = {
  high:   { color: '#B84A4A', bleedClass: 'bleed-critical',  glow: 'rgba(184, 74, 74, 0.18)' },
  medium: { color: '#C89B3C', bleedClass: 'bleed-attention', glow: 'rgba(200, 155, 60, 0.18)' },
  low:    { color: '#4A8A6F', bleedClass: 'bleed-positive',  glow: 'rgba(74, 138, 111, 0.18)' },
};

const RISK_LABEL = {
  high:   'HIGH CONCERN',
  medium: 'DETECTED',
  low:    'LOW',
};

export default function ContaminantCard({
  testId,
  name,
  risk = 'medium',
  category,
  detail,
  level,
  unit,
  limit,
  isViolation,
}) {
  const tone = RISK_TONE[risk] || RISK_TONE.medium;
  const tag = RISK_LABEL[risk] || 'DETECTED';

  return (
    <div
      data-testid={testId}
      className={`${tone.bleedClass} rounded-card`}
      style={{ padding: 14 }}
    >
      <div className="grid items-start gap-3" style={{ gridTemplateColumns: '1fr auto' }}>
        {/* Left column: name, tag, category, detail */}
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <div
              className="font-semibold"
              style={{ color: '#0F1419', fontSize: 14, letterSpacing: '-0.005em' }}
            >
              {name}
            </div>
            <div
              className="rounded-pill font-bold uppercase tracking-wider"
              style={{
                fontSize: 9,
                color: tone.color,
                background: tone.glow,
                padding: '2px 8px',
                border: `1px solid ${tone.color}33`,
              }}
            >
              {tag}
            </div>
            {isViolation && (
              <div
                className="rounded-pill font-bold uppercase tracking-wider"
                style={{
                  fontSize: 9,
                  color: '#FFFFFF',
                  background: '#B84A4A',
                  padding: '2px 8px',
                }}
              >
                VIOLATION
              </div>
            )}
          </div>
          {category && (
            <div
              className="font-medium uppercase"
              style={{
                color: '#6E7174',
                fontSize: 10,
                letterSpacing: '0.06em',
                marginBottom: 4,
              }}
            >
              {category}
            </div>
          )}
          {detail && (
            <div
              className="leading-relaxed"
              style={{ color: '#3D4043', fontSize: 12 }}
            >
              {detail}
            </div>
          )}
        </div>

        {/* Right column: level value + limit comparison */}
        {level != null && (
          <div className="text-right">
            <div
              className="font-display font-semibold leading-none"
              style={{
                color: tone.color,
                fontSize: 22,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.01em',
              }}
            >
              {level}
              {unit && (
                <span
                  className="font-sans font-medium"
                  style={{ fontSize: 11, color: '#6E7174', marginLeft: 2 }}
                >
                  {unit}
                </span>
              )}
            </div>
            {limit != null && limit !== 'None set' && (
              <div
                className="uppercase tracking-wider"
                style={{
                  fontSize: 9,
                  color: '#8A8D90',
                  marginTop: 4,
                  letterSpacing: '0.06em',
                }}
              >
                LIMIT: {limit}{typeof limit === 'number' && unit ? unit : ''}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
