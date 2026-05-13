// src/components/ds/HeroCard.jsx
// Glass material hero card. Replaces solid white card with frosted glass on
// aluminum substrate. Supports optional eyebrow, title, subtitle, metadata
// row, right rail (for risk gauge etc), and arbitrary children for CTAs.

import React from 'react';

export default function HeroCard({
  testId,
  className = '',
  eyebrow,
  title,
  subtitle,
  metadata,
  rightRail,
  children,
}) {
  return (
    <div
      data-testid={testId}
      className={`glass-card rounded-card ${className}`}
      style={{ padding: 20 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {eyebrow && (
            <div
              className="text-micro uppercase font-bold mb-2"
              style={{
                color: '#1F6FA0',
                letterSpacing: '0.10em',
                fontSize: 10,
              }}
            >
              {eyebrow}
            </div>
          )}
          {title && (
            <div
              className="font-display font-semibold leading-tight"
              style={{
                color: '#0F1419',
                fontSize: 28,
                letterSpacing: '-0.02em',
                marginBottom: subtitle ? 6 : 0,
              }}
            >
              {title}
            </div>
          )}
          {subtitle && (
            <div
              className="text-body leading-relaxed"
              style={{ color: '#3D4043', marginBottom: metadata ? 14 : 0 }}
            >
              {subtitle}
            </div>
          )}
          {metadata && Array.isArray(metadata) && metadata.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-3">
              {metadata.map((m, i) => (
                <div key={i} className="flex flex-col">
                  <span
                    className="text-micro uppercase font-semibold"
                    style={{
                      color: '#6E7174',
                      fontSize: 9,
                      letterSpacing: '0.10em',
                    }}
                  >
                    {m.label}
                  </span>
                  <span
                    className="font-display font-semibold"
                    style={{
                      color: '#0F1419',
                      fontSize: 16,
                      fontVariantNumeric: 'tabular-nums',
                      marginTop: 2,
                    }}
                  >
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        {rightRail && (
          <div className="shrink-0">{rightRail}</div>
        )}
      </div>
      {children && (
        <div style={{ marginTop: 16 }}>
          {children}
        </div>
      )}
    </div>
  );
}
