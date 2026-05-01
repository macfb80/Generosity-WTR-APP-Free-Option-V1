// src/components/ds/BottomSheet.jsx
import React, { useEffect } from 'react';

/**
 * BottomSheet — modal that slides up from the bottom of the viewport.
 *
 * Mobile-first pattern. Backdrop dims, sheet animates up.
 * Includes a drag handle bar at the top (visual cue, not draggable yet).
 * Tapping backdrop closes. Escape key closes. Tap close button closes.
 *
 * Props:
 *   open         (bool)        Whether sheet is visible
 *   onClose      (fn)          Called when user dismisses
 *   children     (node)        Sheet content
 *   ariaLabel    (string)      Accessibility label for the dialog
 *   showHandle   (bool)        Show drag handle bar at top, default true
 *   showClose    (bool)        Show close X in top-right, default true
 *   tone         (string)      "default" (light) | "dark" — for founder mode dark sheet
 *   testId       (string|null) data-testid passthrough
 */
export default function BottomSheet({
  open,
  onClose,
  children,
  ariaLabel = 'Dialog',
  showHandle = true,
  showClose = true,
  tone = 'default',
  testId = null,
}) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  const sheetSurface =
    tone === 'dark'
      ? 'bg-text-primary text-text-onAccent'
      : 'bg-surface-card text-text-primary';

  const handleColor =
    tone === 'dark' ? 'bg-text-tertiary' : 'bg-surface-divider';

  const closeColor =
    tone === 'dark' ? 'text-text-onAccent opacity-70' : 'text-text-tertiary';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      data-testid={testId || undefined}
      className="fixed inset-0 z-[600]"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={`
          absolute bottom-0 left-1/2 -translate-x-1/2
          w-full max-w-[480px]
          ${sheetSurface}
          rounded-t-[20px]
          shadow-[0_-8px_30px_rgba(15,20,25,0.18)]
          max-h-[90vh] overflow-y-auto
        `}
        style={{
          animation: 'sheet-up 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Sheet animation keyframes via inline style tag (only included when open) */}
        <style>{`
          @keyframes sheet-up {
            from { transform: translate(-50%, 100%); }
            to   { transform: translate(-50%, 0); }
          }
        `}</style>

        {/* Drag handle */}
        {showHandle && (
          <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
            <div className={`w-10 h-1 rounded-pill ${handleColor}`} />
          </div>
        )}

        {/* Close button */}
        {showClose && (
          <div className="flex justify-end px-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={`
                w-11 h-11 flex items-center justify-center
                rounded-pill
                ${closeColor}
                hover:bg-surface-inset
                transition-colors duration-200 ease-standard
              `}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="px-6 pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}
