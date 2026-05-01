// src/components/ds/Sparkline.jsx
import React from 'react';

/**
 * Sparkline — single-line trend visualization.
 *
 * No fills, no axes, no gridlines, no tooltips. Sparklines are glanceable.
 * If you need an interactive chart, use a different component (Recharts, etc.).
 *
 * Props:
 *   data       (array)   Array of numbers
 *   width      (number)  SVG width in px, default 200
 *   height     (number)  SVG height in px, default 48
 *   color      (string)  Stroke color, default brand primary
 *   strokeWidth (number) Default 1.5
 *   showEnd    (bool)    Whether to show "now" dot at end, default true
 *   ariaLabel  (string)  Accessibility label
 */
export default function Sparkline({
  data,
  width = 200,
  height = 48,
  color = '#51B0E6',
  strokeWidth = 1.5,
  showEnd = true,
  ariaLabel = 'Trend chart',
}) {
  if (!data || data.length < 2) {
    return null;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Add small padding so the line doesn't touch top/bottom edges
  const padY = 2;
  const usableHeight = height - padY * 2;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = padY + (usableHeight - ((val - min) / range) * usableHeight);
    return { x, y };
  });

  const pathD = monotoneSmoothPath(points);

  const lastPoint = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
    >
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showEnd && (
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={strokeWidth * 1.6}
          fill={color}
        />
      )}
    </svg>
  );
}

/**
 * Monotone cubic smoothing — produces clean curves through data points
 * without overshoot. Better than linear (jagged) and bezier (overshoots).
 * Implementation adapted from common monotone-cubic algorithm.
 */
function monotoneSmoothPath(points) {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
  }

  const tangents = computeTangents(points);
  let d = `M ${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const m0 = tangents[i];
    const m1 = tangents[i + 1];
    const dx = p1.x - p0.x;
    const cp1x = p0.x + dx / 3;
    const cp1y = p0.y + (m0 * dx) / 3;
    const cp2x = p1.x - dx / 3;
    const cp2y = p1.y - (m1 * dx) / 3;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
  }

  return d;
}

function computeTangents(points) {
  const n = points.length;
  const slopes = [];
  for (let i = 0; i < n - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    slopes.push(dx === 0 ? 0 : dy / dx);
  }

  const tangents = new Array(n);
  tangents[0] = slopes[0];
  tangents[n - 1] = slopes[n - 2];

  for (let i = 1; i < n - 1; i++) {
    if (slopes[i - 1] * slopes[i] <= 0) {
      tangents[i] = 0;
    } else {
      tangents[i] = (slopes[i - 1] + slopes[i]) / 2;
    }
  }

  return tangents;
}
