// src/components/ds/MetricCard.jsx
import React from 'react';

/**
 * MetricCard — standard data card for non-hero metrics.
 *
 * Multiple per screen is fine. Composed below the ScoreHero.
 *
 * Props:
 *   label          (string)        Eyebrow label, all caps via styling
 *   value          (string|number) The metric value
 *   suffix         (string|null)   Optional unit like "ppm", "%"
 *   delta          (number|null)   Optional percent change vs prior period
 *   deltaLabel     (string|null)   Optional context, e.g. "vs last week"
 *   confidence     (string|null)   Same tiers as ScoreHero
 *   sparkline      (array|null)    Optional small trend
 *   tone           (string)        "default" | "inset" — controls surface
 *   onClick        (fn|null)       If provided, card becomes interactive
 */
export default function MetricCard({
  label,
  value,
  suffix = null,
  delta = null,
  deltaLabel = null,
  confidence = null,
  sparkline = null,
  tone = 'default',
  onClick = null,
}) {
  const isInteractive = !!onClick;

  const surfaceClasses =
    tone === 'inset'
      ? 'bg-surface-inset'
      : 'bg-surface-card shadow-card';

  const interactiveClasses = isInteractive
    ? 'cursor-pointer transition-shadow duration-200 ease-standard hover:shadow-card-hover'
    : '';

  const Wrapper = isInteractive ? 'button' : 'div';

  return (
    <Wrapper
      className={`${surfaceClasses} ${interactiveClasses} rounded-card p-6 text-left w-full`}
      onClick={onClick || undefined}
      type={isInteractive ? 'button' : undefined}
    >
      {/* Eyebrow */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-micro uppercase font-semibold text-text-tertiary tracking-wider">
          {label}
        </span>
        {confidence && <ConfidenceDot tier={confidence} />}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <span
          className="font-display text-display font-semibold text-text-primary leading-none"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {value}
        </span>
        {suffix && (
          <span className="font-display text-h3 text-text-tertiary leading-none">
            {suffix}
          </span>
        )}
      </div>

      {/* Delta + sparkline row */}
      {(delta !== null || sparkline) && (
        <div className="flex items-center justify-between mt-4">
          {delta !== null && (
            <DeltaIndicator value={delta} label={deltaLabel} />
          )}
          {sparkline && (
            <MiniSparkline data={sparkline} color="#8A8E93" width={64} height={20} />
          )}
        </div>
      )}
    </Wrapper>
  );
}

function DeltaIndicator({ value, label }) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isFlat = value === 0;

  const color = isPositive ? '#4A8A6F' : isNegative ? '#B84A4A' : '#8A8E93';
  const arrow = isPositive ? '↑' : isNegative ? '↓' : '→';
  const sign = value > 0 ? '+' : '';

  return (
    <div className="flex items-baseline gap-1.5">
      <span
        className="text-caption font-semibold"
        style={{ color, fontVariantNumeric: 'tabular-nums' }}
      >
        {arrow} {sign}{value}%
      </span>
      {label && (
        <span className="text-caption text-text-tertiary">
          {label}
        </span>
      )}
    </div>
  );
}

function ConfidenceDot({ tier }) {
  const tiers = {
    verified:     { color: '#4A8A6F', filled: true },
    corroborated: { color: '#51B0E6', filled: true },
    developing:   { color: '#C89B3C', filled: true },
    hypothesis:   { color: '#8A8E93', filled: false },
  };
  const t = tiers[tier];
  if (!t) return null;
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full"
      style={{
        backgroundColor: t.filled ? t.color : 'transparent',
        border: t.filled ? 'none' : `1px solid ${t.color}`,
      }}
      aria-hidden="true"
    />
  );
}

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
    </svg>
  );
}
