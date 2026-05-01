// src/components/tbv/FounderLoginModal.jsx
import React from 'react';
import BottomSheet from '../ds/BottomSheet';

/**
 * FounderLoginModal — dark bottom-sheet PIN entry for founder mode.
 *
 * Long-press the logo for 3 seconds to open. Enter 4-digit PIN.
 * Auto-submits on the 4th digit. Used to unlock WTR BTL and WTR Hub tabs
 * for investor demos.
 *
 * The parent component (TrustButVerify.js) owns:
 *   - The actual PIN value (hardcoded in parent)
 *   - The PIN check logic (calls onSubmit, decides correct/incorrect)
 *   - localStorage persistence of founder mode state
 *
 * Props:
 *   open      (bool)        Whether sheet is open
 *   onClose   (fn)          Close handler
 *   pin       (string)      Current PIN value (controlled, 0-4 chars)
 *   onPinChange (fn)        Called when PIN changes; receives new PIN string
 *   error     (string)      Error message to display (e.g. "Invalid PIN")
 *   onSubmit  (fn)          Called with PIN when 4 digits entered
 */
export default function FounderLoginModal({
  open,
  onClose,
  pin,
  onPinChange,
  error,
  onSubmit,
}) {
  function handleKey(d) {
    if (d === '⌫') {
      onPinChange(pin.slice(0, -1));
    } else if (pin.length < 4) {
      const newPin = pin + d;
      onPinChange(newPin);
      if (newPin.length === 4) {
        // Slight delay so user sees the 4th dot fill before sheet closes
        setTimeout(() => onSubmit(newPin), 200);
      }
    }
  }

  const keypad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      ariaLabel="Founder Access"
      tone="dark"
      showClose={false}
      testId="founder-login-modal"
    >
      {/* Header */}
      <div className="text-center mb-5">
        <div className="text-micro uppercase tracking-widest font-semibold text-brand mb-1.5">
          GENEROSITY™ WATER
        </div>
        <div className="font-display text-h2 font-semibold text-text-onAccent mb-1">
          Founder Access
        </div>
        <div className="text-caption text-text-tertiary">
          Enter your PIN to unlock demo mode
        </div>
      </div>

      {/* PIN dots */}
      <div className="flex justify-center gap-2.5 mb-4">
        {[0, 1, 2, 3].map((i) => {
          const filled = pin.length > i;
          return (
            <div
              key={i}
              className="rounded-card flex items-center justify-center font-display font-bold"
              style={{
                width: 44,
                height: 52,
                border: `2px solid ${filled ? '#51B0E6' : '#3A3F46'}`,
                background: filled ? 'rgba(81, 176, 230, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                fontSize: 20,
                color: '#FFFFFF',
              }}
            >
              {pin[i] ? '•' : ''}
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div
          className="text-center text-caption font-semibold text-state-critical mb-3"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Keypad */}
      <div
        className="grid grid-cols-3 gap-2 mx-auto mb-4"
        style={{ maxWidth: 260 }}
      >
        {keypad.map((d) => (
          <button
            key={d || 'blank'}
            type="button"
            disabled={!d}
            onClick={() => d && handleKey(d)}
            className={`
              h-12 rounded-card border-none
              font-semibold text-text-onAccent
              transition-opacity duration-200 ease-standard
              ${d ? 'cursor-pointer hover:opacity-80 active:opacity-60' : 'cursor-default opacity-0'}
            `}
            style={{
              background: d ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
              fontSize: 18,
            }}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Cancel */}
      <button
        type="button"
        onClick={onClose}
        className="
          w-full
          rounded-card border
          text-caption font-semibold
          cursor-pointer
          transition-colors duration-200 ease-standard
          hover:bg-white/5
        "
        style={{
          padding: 12,
          background: 'transparent',
          borderColor: '#3A3F46',
          color: '#8A8E93',
        }}
      >
        Cancel
      </button>
    </BottomSheet>
  );
}
