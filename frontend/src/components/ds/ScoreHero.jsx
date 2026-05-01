// src/components/ds/ScoreHero.jsx
import React from 'react';

/**
 * ScoreHero — the single hero numeral per screen.
 *
 * Use ONE per screen. If you need two, you have a layout problem.
 *
 * Props:
 *   value          (string|number) The hero number, e.g. 88 or "12"
 *   label          (string)        Lowercase eyebrow, e.g. "WIQ Score"
 *   sublabel       (string|null)   Optional context line, e.g. "Today"
 *   confidence     (string|null)   "verified" | "corroborated" | "developing" | "hypothesis"
 *   trend          (array|null)    Optional sparkline data points [n, n, n, ...]
 *   tone           (string)        "primary" (brand blue) | "neutral" (text-primary)
 *   suffix         (string|null)   Optional unit, e.g. "ppm", "%", "°"
 *
 * Accessibility:
 *   - Hero numeral marked with aria-label combining value + label
 *   - Confidence indicator has its own readable text via title attribute
 */
export default function ScoreHero({
  value,
  label,
  sublabel = null,
  confidence = null,
  trend = null,
  tone = 'primary',
  suffix = null,
}) {
  const numeralColor = tone === 'primary' ? 'text-brand' : 'text-text-primary';

  const ariaLabel = `${label}: ${value}${suffix ? ' ' + suffix : ''}`;

  return (
    <div
      className="flex flex-col items-center justify-center py-6"
      role="group"
      aria-label={ariaLabel}
    >
      {/* Eyebrow label */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-micro uppercase font-semibold text-text-tertiary">
          {label}
        </span>
        {confidence && <ConfidenceDot tier={confidence} />}
      </div>

      {/* Hero numeral */}
      <div className="flex items-baseline gap-2">
        <span
          className={`font-display text-hero font-semibold leading-none ${numeralColor}`}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {value}
        </span>
        {suffix && (
          <span className="font-display text-h1 text-text-tertiary leading-none">
            {suffix}
          </span>
        )}
      </div>

      {/* Optional sublabel */}
      {sublabel && (
        <span className="text-caption text-text-tertiary mt-2">
          {sublabel}
        </span>
      )}

      {/* Optional sparkline */}
      {trend && trend.length > 1 && (
        <div className="mt-4">
          <MiniSparkline data={trend} color="#51B0E6" width={80} height={24} />
        </div>
      )}
    </div>
  );
}

/**
 * ConfidenceDot — small visual indicator for data confidence tier.
 * Per Generosity OS protocol. Always paired with text label, never standalone.
 */
function ConfidenceDot({ tier }) {
  const tiers = {
    verified:     { color: '#4A8A6F', label: 'Verified',     filled: true  },
    corroborated: { color: '#51B0E6', label: 'Corroborated', filled: true  },
    developing:   { color: '#C89B3C', label: 'Developing',   filled: true  },
    hypothesis:   { color: '#8A8E93', label: 'Hypothesis',   filled: false },
  };
  const t = tiers[tier];
  if (!t) return null;

  return (
    <span
      title={`Data confidence: ${t.label}`}
      className="inline-block w-1.5 h-1.5 rounded-full"
      style={{
        backgroundColor: t.filled ? t.color : 'transparent',
        border: t.filled ? 'none' : `1px solid ${t.color}`,
      }}
    />
  );
}

/**
 * MiniSparkline — inline sparkline for hero trend.
 * Hand-rolled SVG, no dependencies. Used only inside ScoreHero.
 */
function MiniSparkline({ data, color, width, height }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const lastX = width;
  const lastY = height - ((data[data.length - 1] - min) / range) * height;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r="2" fill={color} />
    </svg>
  );
}
