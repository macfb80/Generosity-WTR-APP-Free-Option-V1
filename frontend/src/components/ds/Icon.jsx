// src/components/ds/Icon.jsx
import React from 'react';

/**
 * Icon — universal stroke-based icon library for the WTR APP.
 *
 * 25 icons. All hand-rolled SVG, all stroke-based for visual consistency.
 * Active state lights the icon in brand blue.
 *
 * Props:
 *   name    (string)  Icon identifier — see list below
 *   size    (number)  Pixel size, default 20
 *   color   (string)  Stroke color when not active, default text-tertiary
 *   active  (bool)    If true, override color with brand blue and add fill where applicable
 *
 * Available icons:
 *   home, pin, city, lock, scan, search, camera, text,
 *   drop, droplet, tap, sparkle, hazard, alert, shield,
 *   flask, atom, check, checkCircle, bell, email,
 *   filter, info, book, user, settings
 *
 * Usage:
 *   <Icon name="droplet" size={20} color="#A6A8AB" />
 *   <Icon name="hazard" size={16} color="#B84A4A" />
 *   <Icon name="shield" active />
 */
export default function Icon({ name, size = 20, color = '#A6A8AB', active = false }) {
  const ic = active ? '#51B0E6' : color;
  const s = size;

  const icons = {
    home: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 3L2 11H4.5V20H9.5V14H14.5V20H19.5V11H22L12 3Z" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        <path d="M12 9C12 9 10 11.5 10 12.5C10 13.6 10.9 14.5 12 14.5C13.1 14.5 14 13.6 14 12.5C14 11.5 12 9 12 9Z" fill={active ? ic : 'none'} stroke={ic} strokeWidth="1.2" />
      </svg>
    ),
    pin: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" stroke={ic} strokeWidth="1.5" fill="none" />
        <circle cx="12" cy="9" r="2.5" stroke={ic} strokeWidth="1.5" fill={active ? ic : 'none'} />
      </svg>
    ),
    city: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M3 21H21" stroke={ic} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 21V7L10 4V21" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        <path d="M10 21V10H15V21" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        <path d="M15 21V6H19V21" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        <line x1="7" y1="9" x2="8" y2="9" stroke={ic} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="7" y1="12" x2="8" y2="12" stroke={ic} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="7" y1="15" x2="8" y2="15" stroke={ic} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="12" y1="13" x2="13" y2="13" stroke={ic} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="12" y1="16" x2="13" y2="16" stroke={ic} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="17" y1="9" x2="17" y2="9" stroke={ic} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="17" y1="12" x2="17" y2="12" stroke={ic} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    lock: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="5" y="10" width="14" height="11" rx="2" stroke={ic} strokeWidth="1.5" fill="none" />
        <path d="M8 10V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V10" stroke={ic} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="15" r="1.5" fill={ic} />
        <line x1="12" y1="16.5" x2="12" y2="18" stroke={ic} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    scan: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M3 7V5C3 3.9 3.9 3 5 3H7" stroke={ic} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M17 3H19C20.1 3 21 3.9 21 5V7" stroke={ic} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M21 17V19C21 20.1 20.1 21 19 21H17" stroke={ic} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 21H5C3.9 21 3 20.1 3 19V17" stroke={ic} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="12" r="4" stroke={ic} strokeWidth="1.5" fill="none" />
        <circle cx="12" cy="12" r="1.5" fill={ic} />
      </svg>
    ),
    search: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke={ic} strokeWidth="1.5" fill="none" />
        <line x1="16" y1="16" x2="21" y2="21" stroke={ic} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    camera: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M3 8C3 6.9 3.9 6 5 6H7L9 4H15L17 6H19C20.1 6 21 6.9 21 8V18C21 19.1 20.1 20 19 20H5C3.9 20 3 19.1 3 18V8Z" stroke={ic} strokeWidth="1.5" fill="none" />
        <circle cx="12" cy="13" r="4" stroke={ic} strokeWidth="1.5" fill="none" />
        <circle cx="12" cy="13" r="1.5" fill={ic} />
      </svg>
    ),
    text: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M4 7V5H20V7" stroke={ic} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="12" y1="5" x2="12" y2="19" stroke={ic} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 19H16" stroke={ic} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    drop: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 3C12 3 6 10 6 14C6 17.31 8.69 20 12 20C15.31 20 18 17.31 18 14C18 10 12 3 12 3Z" stroke={ic} strokeWidth="1.5" fill={active ? `${ic}20` : 'none'} />
        <path d="M9 14C9 14 10 12 12 12" stroke={ic} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    droplet: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2C12 2 5 10 5 14.5C5 18.64 8.13 22 12 22C15.87 22 19 18.64 19 14.5C19 10 12 2 12 2Z" stroke={ic} strokeWidth="1.5" fill="none" />
        <path d="M12 19C14.21 19 16 17.21 16 15" stroke={ic} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    tap: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2V6" stroke={ic} strokeWidth="1.5" strokeLinecap="round" />
        <rect x="8" y="6" width="8" height="4" rx="1" stroke={ic} strokeWidth="1.5" fill="none" />
        <path d="M10 10V12C10 12 10 14 12 14C14 14 14 12 14 12V10" stroke={ic} strokeWidth="1.5" />
        <path d="M12 14V16" stroke={ic} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 18C12 18 9 19 9 21H15C15 19 12 18 12 18Z" stroke={ic} strokeWidth="1.5" fill="none" />
      </svg>
    ),
    sparkle: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill={active ? `${ic}30` : 'none'} />
        <circle cx="19" cy="5" r="1.5" stroke={ic} strokeWidth="1" fill="none" />
        <circle cx="5" cy="18" r="1" stroke={ic} strokeWidth="1" fill="none" />
      </svg>
    ),
    hazard: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L22 20H2L12 2Z" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        <line x1="12" y1="9" x2="12" y2="14" stroke={ic} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="17" r="1" fill={ic} />
      </svg>
    ),
    alert: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={ic} strokeWidth="1.5" fill="none" />
        <line x1="12" y1="8" x2="12" y2="13" stroke={ic} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1" fill={ic} />
      </svg>
    ),
    shield: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 6V11C4 16.5 7.5 21.25 12 22.5C16.5 21.25 20 16.5 20 11V6L12 2Z" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        <path d="M9 12L11 14L15 10" stroke={ic} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    flask: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M9 3V10L4 18C3.5 19 4 20 5 20H19C20 20 20.5 19 20 18L15 10V3" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        <line x1="8" y1="3" x2="16" y2="3" stroke={ic} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 15H17" stroke={ic} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    atom: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="2" fill={ic} />
        <ellipse cx="12" cy="12" rx="9" ry="4" stroke={ic} strokeWidth="1.3" fill="none" />
        <ellipse cx="12" cy="12" rx="9" ry="4" stroke={ic} strokeWidth="1.3" fill="none" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="9" ry="4" stroke={ic} strokeWidth="1.3" fill="none" transform="rotate(120 12 12)" />
      </svg>
    ),
    check: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={ic} strokeWidth="1.5" fill="none" />
        <path d="M8 12L11 15L16 9" stroke={ic} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    checkCircle: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#4A8A6F" strokeWidth="1.5" fill="rgba(74, 138, 111, 0.08)" />
        <path d="M8 12L11 15L16 9" stroke="#4A8A6F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    bell: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M18 8C18 6.4 17.4 4.9 16.2 3.8C15.1 2.6 13.6 2 12 2C10.4 2 8.9 2.6 7.8 3.8C6.6 4.9 6 6.4 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        <path d="M13.7 21C13.5 21.4 13 21.6 12.5 21.7C12 21.8 11.4 21.7 11 21.5C10.5 21.2 10.2 20.8 10 20.3" stroke={ic} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    email: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke={ic} strokeWidth="1.5" fill="none" />
        <path d="M3 7L12 13L21 7" stroke={ic} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    filter: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M4 4H20L14 12V18L10 20V12L4 4Z" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      </svg>
    ),
    info: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={ic} strokeWidth="1.5" fill="none" />
        <line x1="12" y1="11" x2="12" y2="16" stroke={ic} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="8" r="1" fill={ic} />
      </svg>
    ),
    book: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M4 4C4 4 5 3 8 3C11 3 12 4.5 12 4.5C12 4.5 13 3 16 3C19 3 20 4 20 4V19C20 19 19 18 16 18C13 18 12 19.5 12 19.5C12 19.5 11 18 8 18C5 18 4 19 4 19V4Z" stroke={ic} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        <line x1="12" y1="5" x2="12" y2="19" stroke={ic} strokeWidth="1.5" />
      </svg>
    ),
    user: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke={ic} strokeWidth="1.5" fill="none" />
        <path d="M4 20C4 16.69 7.58 14 12 14C16.42 14 20 16.69 20 20" stroke={ic} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    settings: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke={ic} strokeWidth="1.5" fill="none" />
        <path d="M12 1V4M12 20V23M4.22 4.22L6.34 6.34M17.66 17.66L19.78 19.78M1 12H4M20 12H23M4.22 19.78L6.34 17.66M17.66 6.34L19.78 4.22" stroke={ic} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  };

  return icons[name] || null;
}
