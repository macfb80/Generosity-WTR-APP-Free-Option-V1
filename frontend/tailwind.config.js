/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces
        surface: {
          base: '#F7F8FA',           // app background, every screen
          card: '#FFFFFF',           // standard cards on top of base
          inset: '#F0F1F3',          // inset wells, secondary containers
          divider: '#E8EAED',        // hairline dividers when needed
        },

        // Brand accent (used sparingly, one per screen ideally)
        brand: {
          DEFAULT: '#51B0E6',        // primary CTAs, hero numerals, active states
          hover: '#3DA0DA',          // hover/press on primary
          subtle: '#E8F4FB',         // tinted backgrounds for active rows
          // LED glow opacity controlled via boxShadow tokens, not color
        },

        // Text
        text: {
          primary: '#0F1419',        // headlines, hero numerals, body emphasis
          secondary: '#4A4F56',      // body copy, secondary information
          tertiary: '#8A8E93',       // metadata, timestamps, supporting labels
          quaternary: '#A6A8AB',     // disabled, scale labels
          onAccent: '#FFFFFF',       // text on filled blue surfaces
        },

        // Semantic states (muted by design, never decorative)
        state: {
          positive: '#4A8A6F',       // optimal, verified, system healthy
          attention: '#C89B3C',      // developing, low confidence
          critical: '#B84A4A',       // critical alerts only
        },

        // Confidence tiers (paired with dot indicators, not color casts on data)
        confidence: {
          verified: '#4A8A6F',
          corroborated: '#51B0E6',
          developing: '#C89B3C',
          hypothesis: '#8A8E93',
        },

        // shadcn/ui semantic aliases — these map shadcn's expected tokens
        // to our brand system so any shadcn component continues to work.
        // Direct hex values, not HSL variables, since the existing config
        // pattern used direct hex.
        background: '#F7F8FA',
        foreground: '#0F1419',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#0F1419',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#0F1419',
        },
        primary: {
          DEFAULT: '#51B0E6',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F0F1F3',
          foreground: '#0F1419',
        },
        muted: {
          DEFAULT: '#F0F1F3',
          foreground: '#8A8E93',
        },
        accent: {
          DEFAULT: '#E8F4FB',
          foreground: '#0F1419',
        },
        destructive: {
          DEFAULT: '#B84A4A',
          foreground: '#FFFFFF',
        },
        border: '#E8EAED',
        input: '#E8EAED',
        ring: '#51B0E6',
      },

      fontFamily: {
        // Barlow Condensed for display, hero numerals, screen titles
        display: ['"Barlow Condensed"', 'sans-serif'],
        // Montserrat for body, UI, captions, micro labels
        sans: ['Montserrat', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        body: ['Montserrat', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },

      fontSize: {
        // Type scale matches design system spec exactly.
        // Format: [size, { lineHeight, letterSpacing }]
        'hero':         ['96px', { lineHeight: '100%', letterSpacing: '-0.02em' }],
        'display':      ['56px', { lineHeight: '110%', letterSpacing: '-0.01em' }],
        'h1':           ['32px', { lineHeight: '120%', letterSpacing: '0' }],
        'h2':           ['20px', { lineHeight: '130%', letterSpacing: '-0.01em' }],
        'h3':           ['16px', { lineHeight: '140%', letterSpacing: '-0.01em' }],
        'body':         ['15px', { lineHeight: '150%', letterSpacing: '0' }],
        'caption':      ['13px', { lineHeight: '140%', letterSpacing: '0.01em' }],
        'micro':        ['11px', { lineHeight: '130%', letterSpacing: '0.08em' }],
      },

      spacing: {
        // 4px base unit. Standard Tailwind multiples are kept (1=4px, 2=8px, etc.)
        // but extending with explicit semantic spacing for the design system.
        '0.5': '2px',
        '18': '72px',
      },

      borderRadius: {
        // shadcn convention preserved
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        // Design system specific radii
        'card': '16px',
        'card-hero': '20px',
        'pill': '9999px',
      },

      boxShadow: {
        // Card shadows. Double-layer for tactile depth.
        'card': '0 1px 2px rgba(15, 20, 25, 0.04), 0 0 0 1px rgba(15, 20, 25, 0.03)',
        'card-hero': '0 4px 16px rgba(15, 20, 25, 0.06), 0 1px 2px rgba(15, 20, 25, 0.04)',
        'card-hover': '0 2px 4px rgba(15, 20, 25, 0.06), 0 0 0 1px rgba(15, 20, 25, 0.04)',

        // LED glow — echoes PP02 CAP LED ring. Subtle, not Whoop-style.
        // For live-data states only. 4px spread, low opacity.
        'led-rest': '0 0 0 4px rgba(81, 176, 230, 0.20)',
        'led-active': '0 0 0 4px rgba(81, 176, 230, 0.40)',

        // Focus ring for accessibility
        'focus': '0 0 0 2px #FFFFFF, 0 0 0 4px #51B0E6',
      },

      transitionTimingFunction: {
        // Design system motion: Material standard easing for default transitions
        'standard': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      },

      transitionDuration: {
        '200': '200ms',
        '240': '240ms',
        '600': '600ms',
        '2400': '2400ms',
      },

      keyframes: {
        // LED glow pulse — for live-data cards
        'led-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 4px rgba(81, 176, 230, 0.20)' },
          '50%':      { boxShadow: '0 0 0 4px rgba(81, 176, 230, 0.40)' },
        },
        // Subtle fade-in for card mounts
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Skeleton shimmer for loading states
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        // Scan line for bottle scan UX
        'scan': {
          '0%, 100%': { transform: 'translateY(-100%)', opacity: '0' },
          '50%':      { opacity: '1' },
        },
      },

      animation: {
        'led-pulse': 'led-pulse 2400ms cubic-bezier(0.4, 0.0, 0.2, 1) infinite',
        'fade-in': 'fade-in 200ms cubic-bezier(0.4, 0.0, 0.2, 1) both',
        'shimmer': 'shimmer 2s linear infinite',
        'scan': 'scan 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
