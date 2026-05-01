// src/components/ds/SegmentedToggle.jsx
import React from 'react';

/**
 * SegmentedToggle — iOS-style segmented control.
 *
 * 2-4 options, one selected. Active option has white surface and brand text.
 * Inactive options are subtle. Use for sub-tab navigation, mode switches.
 *
 * Props:
 *   options      (array)   [{ id, label, icon, badge }]
 *                          - id (string, required) — unique identifier
 *                          - label (string, required) — display text
 *                          - icon (node, optional) — element rendered before label
 *                          - badge (number|null, optional) — number to show as pill
 *   value        (string)  Current selected id
 *   onChange     (fn)      Called with new id when user taps an option
 *   size         (string)  "default" | "small" — controls height and text
 *   testId       (string)  data-testid passthrough
 *   className    (string)  Additional classes
 */
export default function SegmentedToggle({
  options,
  value,
  onChange,
  size = 'default',
  testId = null,
  className = '',
}) {
  const heightClass = size === 'small' ? 'h-9' : 'h-11';
  const textClass = size === 'small' ? 'text-caption' : 'text-body';
  const padding = size === 'small' ? 'px-3' : 'px-4';

  return (
    <div
      className={`flex items-stretch bg-surface-inset rounded-card p-1 gap-1 ${className}`}
      data-testid={testId || undefined}
      role="tablist"
    >
      {options.map((option) => {
        const isActive = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            data-testid={`${testId}-${option.id}`}
            className={`
              flex-1 flex items-center justify-center gap-1.5
              ${heightClass} ${padding} ${textClass}
              rounded-card border-none cursor-pointer
              transition-all duration-200 ease-standard
              ${isActive
                ? 'bg-surface-card text-text-primary font-semibold shadow-card'
                : 'bg-transparent text-text-tertiary font-medium hover:text-text-secondary'}
            `}
          >
            {option.icon && (
              <span className="inline-flex items-center justify-center shrink-0">
                {option.icon}
              </span>
            )}
            <span className="truncate">{option.label}</span>
            {option.badge != null && option.badge > 0 && (
              <span
                className={`
                  inline-flex items-center justify-center
                  min-w-[18px] h-[18px] px-1.5 rounded-pill
                  text-[10px] font-bold
                  ${isActive
                    ? 'bg-brand text-text-onAccent'
                    : 'bg-brand-subtle text-brand'}
                `}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
