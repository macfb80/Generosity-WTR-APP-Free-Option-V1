// src/components/tbv/MonthlyReportModal.jsx
import React from 'react';
import BottomSheet from '../ds/BottomSheet';
import Input from '../ds/Input';
import Icon from '../ds/Icon';

/**
 * MonthlyReportModal — bottom-sheet modal for monthly water report opt-in.
 *
 * Two screens controlled by `screen` prop:
 *   - "form"    : email + ZIP entry, submit triggers double opt-in
 *   - "success" : confirmation that email was sent
 *
 * The parent component (TrustButVerify.js) owns:
 *   - All form state (email, zip, errors, submitting)
 *   - The submit handler (which makes the API call)
 *   - The status sync via /api/water-report/status
 *   - localStorage persistence
 *
 * This component is a controlled UI surface only.
 *
 * Props:
 *   open                 (bool)        Whether sheet is open
 *   onClose              (fn)          Close handler
 *   screen               (string)      "form" | "success"
 *   email                (string)      Controlled email value
 *   onEmailChange        (fn)          Email change handler
 *   emailError           (string)      Email error message
 *   zip                  (string)      Controlled ZIP value
 *   onZipChange          (fn)          ZIP change handler
 *   zipError             (string)      ZIP error message
 *   submitting           (bool)        Is submission in flight
 *   submitError          (string)      Top-level submission error
 *   onSubmit             (fn)          Submit handler
 *   cityShort            (string)      City name (without state) for copy interpolation
 */
export default function MonthlyReportModal({
  open,
  onClose,
  screen,
  email,
  onEmailChange,
  emailError,
  zip,
  onZipChange,
  zipError,
  submitting,
  submitError,
  onSubmit,
  cityShort,
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      ariaLabel={screen === 'form' ? 'Subscribe to Monthly Water Report' : 'Confirmation sent'}
      testId="monthly-report-modal"
    >
      {screen === 'form' ? (
        <FormScreen
          email={email}
          onEmailChange={onEmailChange}
          emailError={emailError}
          zip={zip}
          onZipChange={onZipChange}
          zipError={zipError}
          submitting={submitting}
          submitError={submitError}
          onSubmit={onSubmit}
          cityShort={cityShort}
        />
      ) : (
        <SuccessScreen email={email} cityShort={cityShort} onClose={onClose} />
      )}
    </BottomSheet>
  );
}

function FormScreen({
  email,
  onEmailChange,
  emailError,
  zip,
  onZipChange,
  zipError,
  submitting,
  submitError,
  onSubmit,
  cityShort,
}) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <div
          className="shrink-0 rounded-card flex items-center justify-center"
          style={{
            background: '#E8F4FB',
            padding: 10,
            width: 44,
            height: 44,
          }}
        >
          <Icon name="shield" size={22} color="#51B0E6" />
        </div>
        <div>
          <div className="font-display text-h2 font-semibold text-text-primary leading-tight">
            Your Monthly Water Report
          </div>
          <div className="text-caption text-text-tertiary mt-0.5">
            Free. Delivered the 1st of every month.
          </div>
        </div>
      </div>

      {/* Value props */}
      <div className="bg-surface-inset rounded-card p-4 mb-5">
        {[
          {
            iconNode: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2C12 2 6 10 6 14a6 6 0 0012 0c0-4-6-12-6-12z" />
              </svg>
            ),
            text: `Local water quality data for ${cityShort || 'your area'}`,
          },
          {
            iconNode: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 22h20L12 2z" />
                <line x1="12" y1="9" x2="12" y2="15" />
                <circle cx="12" cy="18" r="0.5" fill="currentColor" />
              </svg>
            ),
            text: 'Contaminant alerts and health guideline updates',
          },
          {
            iconNode: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="18" rx="2" />
                <line x1="6" y1="8" x2="18" y2="8" />
                <line x1="6" y1="12" x2="14" y2="12" />
                <line x1="6" y1="16" x2="10" y2="16" />
              </svg>
            ),
            text: 'Recent news and advisories for your water utility',
          },
        ].map((vp, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5"
            style={{ marginBottom: i < 2 ? 10 : 0 }}
          >
            <span
              className="shrink-0 text-text-secondary"
              style={{ marginTop: 2, lineHeight: 1 }}
            >
              {vp.iconNode}
            </span>
            <span className="text-body text-text-primary leading-relaxed">
              {vp.text}
            </span>
          </div>
        ))}
      </div>

      {/* Email field */}
      <div className="mb-4">
        <Input
          id="wtr-report-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          label="Email Address"
          error={emailError}
          testId="report-email-input"
        />
      </div>

      {/* ZIP field */}
      <div className="mb-5">
        <Input
          id="wtr-report-zip"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={5}
          placeholder="90210"
          value={zip}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(0, 5);
            onZipChange(v);
          }}
          label="ZIP Code"
          labelHint="(for your local water data)"
          error={zipError}
          testId="report-zip-input"
        />
      </div>

      {/* Top-level submit error */}
      {submitError && (
        <div
          className="rounded-card mb-4"
          style={{
            background: 'rgba(184, 74, 74, 0.08)',
            border: '1px solid rgba(184, 74, 74, 0.25)',
            padding: '12px 16px',
          }}
          role="alert"
        >
          <div className="text-body text-state-critical">{submitError}</div>
        </div>
      )}

      {/* Submit button */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        data-testid="report-submit-btn"
        className={`
          w-full h-14
          bg-brand text-text-onAccent
          font-semibold text-body
          rounded-card border-none
          flex items-center justify-center gap-2
          transition-all duration-200 ease-standard
          ${submitting ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-brand-hover'}
        `}
      >
        {submitting ? (
          'Sending...'
        ) : (
          <>
            Get My Monthly Report
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </>
        )}
      </button>

      {/* Consent text */}
      <div className="mt-4 flex items-start gap-2">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#A6A8AB"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0, marginTop: 2 }}
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <div className="text-caption text-text-tertiary leading-relaxed">
          By tapping "Get My Monthly Report" you enroll in the Generosity™ Monthly Water Intelligence Report, delivered the 1st of each month. Unsubscribe anytime. We never sell your email.{' '}
          
            href="https://generositywater.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand underline"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}

function SuccessScreen({ email, cityShort, onClose }) {
  return (
    <div className="text-center">
      {/* Success check icon */}
      <div className="flex justify-center mb-5">
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: 80,
            height: 80,
            background: '#E8F4FB',
          }}
        >
          <svg width="40" height="40" viewBox="0 0 52 52" fill="none">
            <circle cx="26" cy="26" r="25" stroke="#51B0E6" strokeWidth="2" />
            <path
              stroke="#51B0E6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              d="M14 27l8 8 16-16"
              style={{
                strokeDasharray: 50,
                animation: 'check-draw 500ms 200ms ease forwards',
                strokeDashoffset: 50,
              }}
            />
          </svg>
          <style>{`@keyframes check-draw { from { stroke-dashoffset: 50; } to { stroke-dashoffset: 0; } }`}</style>
        </div>
      </div>

      <div className="font-display text-h2 font-semibold text-text-primary mb-2">
        One step left
      </div>
      <div className="text-body text-text-tertiary leading-relaxed mb-1">
        We sent a confirmation link to
      </div>
      <div
        className="text-body font-semibold text-text-primary mb-4"
        style={{ wordBreak: 'break-all' }}
      >
        {email}
      </div>
      <div className="text-body text-text-tertiary leading-relaxed mb-6">
        Click the link to confirm your enrollment. Your first{' '}
        <span className="text-text-primary font-medium">
          {cityShort || 'your area'} Monthly Water Report
        </span>{' '}
        arrives on the 1st of next month.
      </div>

      {/* Helper card */}
      <div className="bg-surface-inset rounded-card p-4 mb-6 text-left">
        <div className="text-caption text-text-tertiary leading-relaxed">
          <span className="text-text-primary font-semibold">Can't find the email?</span>{' '}
          Check your spam or promotions folder. The email comes from{' '}
          <span className="text-brand">noreply@generositywater.com</span>
        </div>
      </div>

      {/* Got it button */}
      <button
        type="button"
        onClick={onClose}
        className="
          w-full h-14
          bg-text-primary text-text-onAccent
          font-semibold text-body
          rounded-card border-none
          cursor-pointer
          transition-opacity duration-200 ease-standard
          hover:opacity-90
        "
      >
        Got It
      </button>
    </div>
  );
}
