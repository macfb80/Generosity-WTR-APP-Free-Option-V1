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
