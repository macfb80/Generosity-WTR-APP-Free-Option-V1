// src/components/ds/ContaminantCard.jsx
import React from 'react';

/**
 * ContaminantCard — single-row card showing a detected contaminant.
 *
 * Visual structure:
 *   [risk left border]  [name + tags + detail]  [level + unit + limit]
 *
 * Risk tiers (muted per design system):
 *   high    → #B84A4A (state-critical), label "HIGH CONCERN"
 *   medium  → #C89B3C (state-attention), label "DETECTED"
 *   low     → #4A8A6F (state-positive), label "WITHIN LIMITS"
 *
 * Props:
 *   name          (string)         Contaminant name, e.g. "Lead"
 *   risk          (string)         "high" | "medium" | "low"
 *   category      (string|null)    Category tag, e.g. "Heavy Metal"
 *   detail        (string|null)    Description, 1-2 sentences
 *   level         (string|num|null) Detected level value
 *   unit          (string|null)    Unit, e.g. "ppb"
 *   limit         (string|num|null) Legal limit value
 *   isViolation   (bool)           Show VIOLATION badge if level is null
 *   testId        (string|null)    data-testid passthrough
 *   className     (string)         Additional classes
 */
export default function ContaminantCard({
  name,
  risk,
  category = null,
  detail = null,
  level = null,
  unit = null,
  limit = null,
  isViolation = false,
  testId = null,
  className = '',
}) {
  const riskConfig = {
    high:   { color: '#B84A4A', label: 'HIGH CONCERN' },
    medium: { color: '#C89B3C', label: 'DETECTED' },
    low:    { color: '#4A8A6F', label: 'WITHIN LIMITS' },
  };
  const r = riskConfig[risk] || riskConfig.medium;

  const hasNumericLevel = level != null && typeof level !== 'object';
  const showViolationBadge = !hasNumericLevel && isViolation;

  return (
    <div
      data-testid={testId || undefined}
      className={`
        bg-surface-card rounded-card shadow-card
        flex items-stretch overflow-hidden
        ${className}
      `}
    >
      {/* Risk left bar */}
      <div
        className="w-1 shrink-0"
        style={{ backgroundColor: r.color }}
        aria-hidden="true"
      />

      {/* Body */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          {/* Name + risk tag + category */}
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-h3 font-semibold text-text-primary leading-tight">
              {name}
            </span>
            <RiskTag color={r.color} label={r.label} />
            {category && (
              <span className="text-micro uppercase font-medium text-text-tertiary bg-surface-inset px-2 py-0.5 rounded-pill tracking-wider">
                {category}
              </span>
            )}
          </div>

          {/* Detail */}
          {detail && (
            <p className="text-caption text-text-secondary leading-relaxed">
              {detail}
            </p>
          )}
        </div>

        {/* Level + limit OR violation badge */}
        <div className="shrink-0 text-right">
          {hasNumericLevel && (
            <>
              <div className="flex items-baseline justify-end gap-0.5">
                <span
                  className="font-display text-h1 font-semibold leading-none"
                  style={{ color: r.color, fontVariantNumeric: 'tabular-nums' }}
                >
                  {level}
                </span>
                {unit && (
                  <span
                    className="text-caption font-medium"
                    style={{ color: r.color }}
                  >
                    {unit}
                  </span>
                )}
              </div>
              {limit != null && (
                <div className="text-micro text-text-tertiary mt-1 uppercase tracking-wider">
                  limit: {limit}{unit}
                </div>
              )}
            </>
          )}
          {showViolationBadge && (
            <div
              className="text-micro font-bold uppercase px-2 py-1 rounded-pill tracking-wider"
              style={{
                backgroundColor: 'rgba(184, 74, 74, 0.12)',
                color: '#B84A4A',
              }}
            >
              VIOLATION
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RiskTag({ color, label }) {
  return (
    <span
      className="text-micro font-bold uppercase px-2 py-0.5 rounded-pill tracking-wider"
      style={{
        backgroundColor: `${color}1F`, // 12% opacity
        color: color,
      }}
    >
      {label}
    </span>
  );
}
