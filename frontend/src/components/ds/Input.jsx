// src/components/ds/Input.jsx
import React, { forwardRef } from 'react';

/**
 * Input — design system text input.
 *
 * Default state is clean: 1px border, 12px radius, 48px height (touch target).
 * Focus state: brand ring with offset.
 * Error state: muted critical color border, error text below.
 *
 * Props:
 *   value         (string)         Controlled value
 *   onChange      (fn)             Receives event
 *   onKeyDown     (fn|null)        Optional, e.g. for Enter key
 *   placeholder   (string)         Placeholder text
 *   type          (string)         "text" | "email" | "tel" | "password" — default "text"
 *   inputMode     (string|null)    Mobile keyboard hint, e.g. "numeric" "email"
 *   autoComplete  (string|null)    HTML autocomplete attribute
 *   maxLength     (number|null)    Character limit
 *   pattern       (string|null)    Validation pattern
 *   label         (string|null)    Optional label rendered above
 *   labelHint     (string|null)    Optional secondary text next to label
 *   error         (string|null)    Error message; if set, input shows error styling
 *   suffix        (node|null)      Optional element rendered inside the right edge (e.g. a SCAN button)
 *   id            (string|null)    HTML id for label association
 *   testId        (string|null)    data-testid passthrough
 *   disabled      (bool)           Disabled state
 *   className     (string)         Additional classes
 */
const Input = forwardRef(function Input({
  value,
  onChange,
  onKeyDown = null,
  placeholder = '',
  type = 'text',
  inputMode = null,
  autoComplete = null,
  maxLength = null,
  pattern = null,
  label = null,
  labelHint = null,
  error = null,
  suffix = null,
  id = null,
  testId = null,
  disabled = false,
  className = '',
}, ref) {
  const hasError = !!error;
  const hasSuffix = !!suffix;

  const baseInputClass = `
    w-full h-12 px-4
    bg-surface-card text-text-primary
    text-body
    rounded-card border outline-none
    transition-shadow duration-200 ease-standard
    placeholder:text-text-quaternary
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const stateClass = hasError
    ? 'border-state-critical focus:shadow-focus'
    : 'border-surface-divider focus:border-brand focus:shadow-focus';

  const radiusClass = hasSuffix ? 'rounded-l-card rounded-r-none' : 'rounded-card';

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-caption font-semibold text-text-primary mb-1.5"
        >
          {label}
          {labelHint && (
            <span className="text-text-tertiary font-normal ml-1.5">
              {labelHint}
            </span>
          )}
        </label>
      )}

      <div className={`flex items-stretch ${hasSuffix ? 'rounded-card overflow-hidden border ' + (hasError ? 'border-state-critical' : 'border-surface-divider focus-within:border-brand') : ''}`}>
        <input
          ref={ref}
          id={id}
          type={type}
          inputMode={inputMode || undefined}
          autoComplete={autoComplete || undefined}
          maxLength={maxLength || undefined}
          pattern={pattern || undefined}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown || undefined}
          placeholder={placeholder}
          disabled={disabled}
          data-testid={testId || undefined}
          className={`${baseInputClass} ${hasSuffix ? 'border-0 focus:shadow-none' : `${stateClass} ${radiusClass}`}`}
          style={{ fontFamily: 'inherit' }}
        />
        {suffix && (
          <div className="flex items-stretch shrink-0">
            {suffix}
          </div>
        )}
      </div>

      {hasError && (
        <div
          className="text-caption text-state-critical mt-1.5 font-medium"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
});

export default Input;
