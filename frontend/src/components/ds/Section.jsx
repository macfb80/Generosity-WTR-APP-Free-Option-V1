// src/components/ds/Section.jsx
import React from 'react';

/**
 * Section — composition primitive for screen-level content groupings.
 *
 * Provides consistent rhythm: eyebrow → title → content → next section gap.
 * Use this instead of ad-hoc div wrappers with margin classes.
 *
 * Props:
 *   eyebrow        (string|null)    Optional micro label above title
 *   title          (string|null)    Section title (h2 styling)
 *   description    (string|null)    Optional sub-description
 *   action         (node|null)      Optional element on the right of title (button, link)
 *   children       (node)           Section content
 *   spacing        (string)         "default" | "compact" | "loose" — vertical rhythm
 *   className      (string|null)    Additional classes to merge
 */
export default function Section({
  eyebrow = null,
  title = null,
  description = null,
  action = null,
  children,
  spacing = 'default',
  className = '',
}) {
  const spacingMap = {
    compact: 'mt-6 first:mt-0',
    default: 'mt-10 first:mt-0',
    loose:   'mt-16 first:mt-0',
  };

  return (
    <section className={`${spacingMap[spacing]} ${className}`}>
      {/* Header: eyebrow + title + action */}
      {(eyebrow || title || action) && (
        <header className="mb-4">
          {eyebrow && (
            <div className="text-micro uppercase font-semibold text-text-tertiary tracking-wider mb-2">
              {eyebrow}
            </div>
          )}
          {(title || action) && (
            <div className="flex items-center justify-between gap-4">
              {title && (
                <h2 className="text-h2 font-semibold text-text-primary">
                  {title}
                </h2>
              )}
              {action && <div className="shrink-0">{action}</div>}
            </div>
          )}
          {description && (
            <p className="text-body text-text-secondary mt-2 max-w-prose">
              {description}
            </p>
          )}
        </header>
      )}

      {/* Content stack */}
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}
