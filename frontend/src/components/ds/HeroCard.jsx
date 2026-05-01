// src/components/ds/HeroCard.jsx
import React from 'react';

/**
 * HeroCard — prominent card for major moments (report header, CTAs, closers).
 *
 * Replaces dark navy gradient cards in the legacy design.
 * Visual weight comes from typography hierarchy and generous space,
 * not from colored backgrounds.
 *
 * Layout:
 *   Optional eyebrow micro label
 *   Big display title (Barlow Condensed)
 *   Optional subtitle in body
 *   Optional supporting metadata row
 *   Optional right-rail content (e.g. RiskGauge)
 *   Optional CTA stack below
 *
 * Props:
 *   eyebrow      (string|null)    Micro all-caps label
 *   title        (string)         Main headline
 *   subtitle     (string|null)    Body copy below title
 *   metadata     (array|null)     [{ label, value }] for stats row
 *   rightRail    (node|null)      Element rendered to the right of title (e.g. <RiskGauge />)
 *   children     (node|null)      Custom content below header (CTAs, etc.)
 *   tone         (string)         "default" | "subtle" — controls surface
 *   className    (string)         Additional classes
 *   testId       (string|null)    data-testid passthrough
 */
export default function HeroCard({
  eyebrow = null,
  title,
  subtitle = null,
  metadata = null,
  rightRail = null,
  children = null,
  tone = 'default',
  className = '',
  testId = null,
}) {
  const surfaceClass =
    tone === 'subtle'
      ? 'bg-surface-inset'
      : 'bg-surface-card shadow-card-hero';

  return (
    <div
      data-testid={testId || undefined}
      className={`${surfaceClass} rounded-card-hero p-6 ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {eyebrow && (
            <div className="text-micro uppercase font-semibold text-text-tertiary tracking-widest mb-2">
              {eyebrow}
            </div>
          )}

          <h2 className="font-display text-h1 font-semibold text-text-primary leading-tight mb-1">
            {title}
          </h2>

          {subtitle && (
            <p className="text-body text-text-secondary leading-relaxed mt-2 max-w-prose">
              {subtitle}
            </p>
          )}

          {metadata && metadata.length > 0 && (
            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1.5 mt-3">
              {metadata.map((m, i) => (
                <div key={i} className="flex items-baseline gap-1.5">
                  <span className="text-micro uppercase font-semibold text-text-tertiary tracking-wider">
                    {m.label}
                  </span>
                  <span
                    className="text-body font-semibold text-text-primary"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {rightRail && (
          <div className="shrink-0">
            {rightRail}
          </div>
        )}
      </div>

      {children && (
        <div className="mt-5">
          {children}
        </div>
      )}
    </div>
  );
}
