/**
 * textCleanup.js
 * Generosity™ WTR App — Text Sanitization Utilities
 * Use cleanDisplayText() on ALL user-facing strings before rendering.
 */

export function cleanDisplayText(input) {
  if (!input) return "";
  return input
    .replace(/[—–]/g, " ")
    .replace(/[~≈]/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s,\s/g, ", ")
    .trim();
}

export function sanitizeDashboardLabel(input) {
  if (!input) return "";
  return input
    .replace(/[—–]/g, " ")
    .replace(/[~≈]/g, "")
    .replace(/\bGen-?\d+\b/gi, "")
    .replace(/\b\d{1,3}(,\d{3})*\s*GPD\b/gi, "")
    .replace(/\b\d{1,2}-Stage\b/gi, "")
    .replace(/\bRO\b/gi, "")
    .replace(/·/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export const safeLabel = cleanDisplayText;
