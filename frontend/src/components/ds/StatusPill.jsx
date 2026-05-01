// src/components/ds/StatusPill.jsx
import React from 'react';

/**
 * StatusPill — small horizontal pill for state communication.
 *
 * Used for: connection status, filter health, sync state, live indicators.
 *
 * Props:
 *   tone     (string)  "positive" | "attention" | "critical" | "neutral" | "brand"
 *   label    (string)  Short text, ideally 1-3 words
 *   showDot  (bool)    Show colored dot before label, default true
 *   pulse    (bool)    Pulse the dot for "live" indication, default false
 *   onClick  (fn|null) If provided, pill is interactive
 */
export default function StatusPill({
  tone = 'neutral',
  label,
  showDot = true,
  pulse = false,
  onClick = null,
}) {
  const tones = {
    positive:  { bg: 'rgba(74, 138, 111, 0.12)',  fg: '#4A8A6F' },
    attention: { bg: 'rgba(200, 155, 60, 0.12)',  fg: '#C89B3C' },
    critical:  { bg: 'rgba(184, 74, 74, 0.12)',   fg: '#B84A4A' },
    neutral:   { bg: 'rgba(138, 142, 147, 0.12)', fg: '#4A4F56' },
    brand:     { bg: 'rgba(81, 176, 230, 0.12)',  fg: '#3DA0DA' },
  };

  const t = tones[tone] || tones.neutral;
  const isInteractive = !!onClick;
  const Wrapper = isInteractive ? 'button' : 'span';

  return (
    <Wrapper
      onClick={onClick || undefined}
      type={isInteractive ? 'button' : undefined}
      className={`
        inline-flex items-center gap-1.5
        h-6 px-2.5 rounded-pill
        text-caption font-medium
        ${isInteractive ? 'cursor-pointer transition-opacity duration-200 ease-standard hover:opacity-80' : ''}
      `}
      style={{ backgroundColor: t.bg, color: t.fg }}
    >
      {showDot && (
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${pulse ? 'animate-led-pulse' : ''}`}
          style={{ backgroundColor: t.fg }}
          aria-hidden="true"
        />
      )}
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{label}</span>
    </Wrapper>
  );
}
