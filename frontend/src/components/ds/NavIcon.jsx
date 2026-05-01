// src/components/ds/NavIcon.jsx
import React from 'react';

/**
 * NavIcon — bottom navigation icon with active glow.
 *
 * Four icons: tbv (Trust But Verify), wtr-intel (intelligence/report),
 * wtr-btl (bottle), wtr-hub (hub/home filtration).
 *
 * Active state lights icon in brand blue plus a soft brand-tinted circle behind.
 * Inactive state uses tertiary text color.
 *
 * Props:
 *   id      (string)  "tbv" | "wtr-intel" | "wtr-btl" | "wtr-hub"
 *   active  (bool)    Whether this nav item is currently selected
 */
export default function NavIcon({ id, active }) {
  const ic = active ? '#51B0E6' : '#A6A8AB';
  const glow = active ? '#51B0E620' : 'transparent';

  if (id === 'tbv') {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="11" fill={glow} />
        <path d="M7 9V6.5C7 6.22 7.22 6 7.5 6H10" stroke={ic} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 6H20.5C20.78 6 21 6.22 21 6.5V9" stroke={ic} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 19V21.5C21 21.78 20.78 22 20.5 22H18" stroke={ic} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 22H7.5C7.22 22 7 21.78 7 21.5V19" stroke={ic} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="9" y1="14" x2="19" y2="14" stroke={active ? '#51B0E6' : ic} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="14" y1="10" x2="14" y2="18" stroke={active ? '#51B0E6' : ic} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
      </svg>
    );
  }

  if (id === 'wtr-intel') {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="11" fill={glow} />
        <circle cx="13" cy="12" r="5.5" stroke={ic} strokeWidth="1.5" fill="none" />
        <line x1="17" y1="16" x2="21" y2="20" stroke={ic} strokeWidth="2" strokeLinecap="round" />
        <line x1="11" y1="14.5" x2="11" y2="12" stroke={active ? '#51B0E6' : ic} strokeWidth="1.3" strokeLinecap="round" />
        <line x1="13" y1="14.5" x2="13" y2="10" stroke={active ? '#51B0E6' : ic} strokeWidth="1.3" strokeLinecap="round" />
        <line x1="15" y1="14.5" x2="15" y2="11.5" stroke={active ? '#51B0E6' : ic} strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  }

  if (id === 'wtr-btl') {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="11" fill={glow} />
        <path d="M11 5V13L6.5 20.5C6.5 20.5 6 23 9 23H19C22 23 21.5 20.5 21.5 20.5L17 13V5" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        <line x1="10" y1="5" x2="18" y2="5" stroke={ic} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M9 19.5C9 19.5 11 17.5 14 18.5C17 19.5 19 18 19 18" stroke={active ? '#51B0E6' : ic} strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <circle cx="12" cy="21" r="1.2" fill={active ? '#51B0E6' : ic} />
      </svg>
    );
  }

  if (id === 'wtr-hub') {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="11" fill={glow} />
        <path d="M5 14L14 6L23 14" stroke={ic} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M8 12V22C8 22.55 8.45 23 9 23H19C19.55 23 20 22.55 20 22V12" stroke={ic} strokeWidth="1.4" strokeLinejoin="round" fill="none" />
        <path d="M14 13L11.5 17C11.5 18.38 12.62 19.5 14 19.5C15.38 19.5 16.5 18.38 16.5 17L14 13Z" fill={active ? '#51B0E6' : ic} opacity="0.7" />
        <line x1="14" y1="19.5" x2="14" y2="21.5" stroke={active ? '#51B0E6' : ic} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  return null;
}
