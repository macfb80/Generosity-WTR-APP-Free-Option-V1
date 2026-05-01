// src/components/tbv/RiskGauge.jsx
import React, { useState, useEffect } from 'react';

/**
 * RiskGauge — animated semicircle gauge with needle pointing to risk score.
 *
 * Used at the top of the WTR Intel report card. The needle animates from 0 to
 * the score over ~800ms when `animated` is true (controlled by parent so we can
 * trigger the animation when the report comes into view).
 *
 * Color bands (muted per design system):
 *   0-33  → state-positive  (#4A8A6F)  "LOW RISK"
 *   34-66 → state-attention (#C89B3C)  "MODERATE"
 *   67-100→ state-critical  (#B84A4A)  "HIGH RISK"
 *
 * Props:
 *   score    (number)  Risk score 0-100
 *   animated (bool)    If true, animate from 0 to score; else snap to score
 */
export default function RiskGauge({ score, animated }) {
  const [d, setD] = useState(0);

  useEffect(() => {
    if (!animated) {
      setD(score);
      return;
    }
    let s = 0;
    const t = setInterval(() => {
      s += 2;
      if (s >= score) {
        setD(score);
        clearInterval(t);
      } else {
        setD(s);
      }
    }, 16);
    return () => clearInterval(t);
  }, [score, animated]);

  const angle = (d / 100) * 180 - 90;
  const color = d > 66 ? '#B84A4A' : d > 33 ? '#C89B3C' : '#4A8A6F';
  const label = d > 66 ? 'HIGH RISK' : d > 33 ? 'MODERATE' : 'LOW RISK';

  return (
    <div className="relative" style={{ width: 150, height: 85, margin: '0 auto' }}>
      <svg width="150" height="85" viewBox="0 0 150 85">
        {/* Track */}
        <path
          d="M 12 78 A 63 63 0 0 1 138 78"
          fill="none"
          stroke="#E8EAED"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Color bands (low / moderate / high) at low opacity */}
        <path
          d="M 12 78 A 63 63 0 0 1 50 20"
          fill="none"
          stroke="#4A8A6F"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M 50 20 A 63 63 0 0 1 100 20"
          fill="none"
          stroke="#C89B3C"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M 100 20 A 63 63 0 0 1 138 78"
          fill="none"
          stroke="#B84A4A"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.55"
        />
        {/* Needle */}
        <line
          x1="75"
          y1="78"
          x2={75 + 48 * Math.cos(((angle - 90) * Math.PI) / 180)}
          y2={78 + 48 * Math.sin(((angle - 90) * Math.PI) / 180)}
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ transition: 'all 16ms linear' }}
        />
        {/* Hub */}
        <circle cx="75" cy="78" r="5" fill={color} />
        <circle cx="75" cy="78" r="9" fill={color} opacity="0.2" />
      </svg>

      {/* Score + label centered below */}
      <div
        className="absolute bottom-0 left-0 right-0 text-center"
      >
        <div
          className="font-display font-semibold leading-none"
          style={{
            fontSize: 22,
            color,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {d}
        </div>
        <div
          className="font-semibold tracking-widest"
          style={{ fontSize: 8, color }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
