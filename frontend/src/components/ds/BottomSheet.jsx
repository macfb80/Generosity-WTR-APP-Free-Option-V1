// src/components/ds/BottomSheet.jsx
// v3.0 - White frosted glass sheet over scrim. Same API as v2.1.

import React, { useEffect } from 'react';

export default function BottomSheet({
  open,
  onClose,
  ariaLabel,
  tone = 'light',
  testId,
  children,
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const isDark = tone === 'dark';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      data-testid={testId}
      className="fixed inset-0 z-[600] flex items-end justify-center"
      style={{ animation: 'sheetFadeIn 0.25s ease forwards' }}
    >
      <style>{`
        @keyframes sheetFadeIn {
          from { background: rgba(0, 0, 0, 0); }
          to   { background: rgba(0, 0, 0, 0.35); }
        }
        @keyframes sheetSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>

      {/* Scrim */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{
          background: 'rgba(15, 20, 25, 0.35)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          border: 'none',
        }}
      />

      {/* Sheet */}
      <div
        className="relative w-full"
        style={{
          maxWidth: 480,
          maxHeight: '92vh',
          overflowY: 'auto',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          animation: 'sheetSlideUp 0.32s cubic-bezier(0.0, 0.0, 0.2, 1) forwards',
          background: isDark
            ? 'rgba(15, 20, 25, 0.92)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          boxShadow: isDark
            ? '0 -16px 48px rgba(0, 0, 0, 0.30)'
            : '0 -16px 48px rgba(15, 20, 25, 0.10), 0 -1px 0 rgba(15, 20, 25, 0.06)',
          borderTop: isDark
            ? '1px solid rgba(255, 255, 255, 0.12)'
            : '1px solid rgba(15, 20, 25, 0.06)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Grabber handle */}
        <div className="flex justify-center" style={{ paddingTop: 10, paddingBottom: 6 }}>
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: isDark
                ? 'rgba(255, 255, 255, 0.20)'
                : 'rgba(15, 20, 25, 0.16)',
            }}
          />
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute cursor-pointer rounded-full flex items-center justify-center"
          style={{
            top: 12,
            right: 16,
            width: 32,
            height: 32,
            background: isDark
              ? 'rgba(255, 255, 255, 0.10)'
              : 'rgba(15, 20, 25, 0.04)',
            border: 'none',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isDark ? 'rgba(255, 255, 255, 0.65)' : '#3D4043'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Content */}
        <div style={{ padding: '12px 22px 24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
