/* eslint-disable */
// tailwind.config.js
// Generosity WTR App - Aluminum + Glass design system v2.0
//
// Background anchor: aluminum unibody Cool Gray family.
// Cards: real frosted glass material (backdrop-filter + saturate).
// Accent: brand blue used as emitted light, not paint.
//
// Brand color rules locked:
//   - Primary Blue: #51B0E6 (Pantone 2915 U)
//   - Brand Gray: #A6A8AB (Pantone Cool Gray 6) - background reference anchor
//   - White: #FFFFFF (on-glass content surfaces)
//
// Typography: Barlow Condensed for display, Montserrat for body.

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        /* ========== ALUMINUM BACKGROUND PALETTE ========== */
        /* Evolution of locked Cool Gray (#A6A8AB) toward deeper aluminum tones */
        /* so frosted glass cards have substrate to refract against.            */
        aluminum: {
          50:  '#F0F1F3',  /* lightest - matches locked light gray */
          100: '#DCDFE2',  /* very light aluminum */
          200: '#C4C7CB',  /* light aluminum */
          300: '#A6A8AB',  /* LOCKED brand gray - Pantone Cool Gray 6 */
          400: '#8A8D90',  /* mid aluminum */
          500: '#6E7174',  /* deep aluminum (primary app background) */
          600: '#54575A',  /* darker aluminum */
          700: '#3D4043',  /* anodized graphite */
          800: '#2A2C2E',  /* deep anodized */
          900: '#1A1B1D',  /* near-black anodized */
        },

        /* ========== SURFACES (renamed for glass aesthetic) ========== */
        surface: {
          base:    '#6E7174',  /* aluminum 500 - primary app background */
          baseAlt: '#54575A',  /* aluminum 600 - bottom gradient stop */
          card:    'rgba(255, 255, 255, 0.45)',  /* frosted glass card */
          cardSolid: 'rgba(255, 255, 255, 0.85)', /* solid fallback for content */
          inset:   'rgba(255, 255, 255, 0.20)',  /* deeper glass for inset zones */
          chrome:  'rgba(255, 255, 255, 0.55)',  /* nav/header chrome glass */
        },

        /* ========== TEXT COLORS ========== */
        /* Dark text on glass cards (cards are translucent white-tinted,        */
        /* so text stays dark for legibility, same as Apple Pro apps).          */
        text: {
          primary:    '#0F1419',  /* on glass cards */
          secondary:  '#3D4043',
          tertiary:   '#6E7174',
          quaternary: '#8A8D90',
          onAccent:   '#FFFFFF',
          onDark:     'rgba(255, 255, 255, 0.95)',  /* for chrome over aluminum */
          onDarkMuted:'rgba(255, 255, 255, 0.65)',
        },

        /* ========== BRAND ========== */
        brand: {
          DEFAULT: '#51B0E6',  /* Pantone 2915 U */
          hover:   '#3DA0DA',
          pressed: '#2B8FC9',
          tint:    'rgba(81, 176, 230, 0.15)',  /* glass tinted background */
          glow:    'rgba(81, 176, 230, 0.35)',  /* light-source glow */
          deep:    'rgba(81, 176, 230, 0.85)',  /* saturated tinted glass */
        },

        /* ========== STATE COLORS (muted for refinement) ========== */
        state: {
          positive: '#4A8A6F',
          attention:'#C89B3C',
          critical: '#B84A4A',
          neutral:  '#6E7174',
        },
      },

      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        sans:    ['Montserrat', 'sans-serif'],
        body:    ['Montserrat', 'sans-serif'],
      },

      fontSize: {
        micro:   ['10px', { lineHeight: '1.4', letterSpacing: '0.08em' }],
        caption: ['12px', { lineHeight: '1.45' }],
        body:    ['14px', { lineHeight: '1.5' }],
        h3:      ['18px', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        h2:      ['22px', { lineHeight: '1.25', letterSpacing: '-0.015em' }],
        h1:      ['28px', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        hero:    ['36px', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        display: ['44px', { lineHeight: '1.0', letterSpacing: '-0.03em' }],
      },

      borderRadius: {
        pill:  '999px',
        card:  '16px',    /* tighter than v1 (was 20px) for hardware feel */
        sheet: '24px',
        soft:  '12px',
      },

      boxShadow: {
        /* ===== Glass material shadows ===== */
        /* Drop shadow gives cards weight on aluminum substrate.                */
        glass:      '0 8px 32px rgba(0, 0, 0, 0.10), 0 1px 2px rgba(0, 0, 0, 0.04)',
        glassDeep:  '0 16px 48px rgba(0, 0, 0, 0.14), 0 2px 4px rgba(0, 0, 0, 0.06)',
        glassHover: '0 12px 40px rgba(0, 0, 0, 0.14), 0 2px 4px rgba(0, 0, 0, 0.06)',

        /* ===== Inset highlights (edge light catch) ===== */
        /* These simulate the light line on aluminum bezel edges.               */
        edge:       'inset 0 1px 0 rgba(255, 255, 255, 0.60)',
        edgeStrong: 'inset 0 1px 0 rgba(255, 255, 255, 0.85), inset 0 -1px 0 rgba(0, 0, 0, 0.06)',

        /* ===== Combined: glass card with edge highlight ===== */
        card:       'inset 0 1px 0 rgba(255, 255, 255, 0.60), 0 8px 32px rgba(0, 0, 0, 0.10), 0 1px 2px rgba(0, 0, 0, 0.04)',
        cardHover:  'inset 0 1px 0 rgba(255, 255, 255, 0.75), 0 12px 40px rgba(0, 0, 0, 0.14), 0 2px 4px rgba(0, 0, 0, 0.06)',

        /* ===== Brand light glow (active states) ===== */
        glow:       '0 0 32px rgba(81, 176, 230, 0.30), 0 0 8px rgba(81, 176, 230, 0.20)',
        glowSoft:   '0 0 24px rgba(81, 176, 230, 0.20)',

        /* ===== Bottom nav specific (chrome over aluminum) ===== */
        nav:        '0 -8px 32px rgba(0, 0, 0, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.50)',
        header:     '0 4px 24px rgba(0, 0, 0, 0.06), inset 0 -1px 0 rgba(0, 0, 0, 0.04)',
      },

      backdropBlur: {
        xs: '8px',
        sm: '16px',
        md: '24px',
        lg: '40px',
        xl: '60px',
        '2xl': '80px',
      },

      backdropSaturate: {
        glass: '180%',
        deep:  '200%',
      },

      transitionTimingFunction: {
        standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        decel:    'cubic-bezier(0.0, 0.0, 0.2, 1)',
        accel:    'cubic-bezier(0.4, 0.0, 1, 1)',
        spring:   'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 24px rgba(81, 176, 230, 0.20)' },
          '50%':      { boxShadow: '0 0 36px rgba(81, 176, 230, 0.35)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'glow-pulse': 'glow-pulse 2.4s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [
    /* Custom utilities for glass material treatment.                          */
    /* These are first-class so the design system can be applied with one      */
    /* class name on any element.                                              */
    function ({ addUtilities }) {
      addUtilities({
        /* ===== Frosted glass card material ===== */
        '.glass-card': {
          'background': 'rgba(255, 255, 255, 0.45)',
          '-webkit-backdrop-filter': 'blur(40px) saturate(180%)',
          'backdrop-filter': 'blur(40px) saturate(180%)',
          'box-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.60), 0 8px 32px rgba(0, 0, 0, 0.10), 0 1px 2px rgba(0, 0, 0, 0.04)',
          'border': '1px solid rgba(255, 255, 255, 0.30)',
        },
        '.glass-card-solid': {
          'background': 'rgba(255, 255, 255, 0.85)',
          '-webkit-backdrop-filter': 'blur(20px) saturate(160%)',
          'backdrop-filter': 'blur(20px) saturate(160%)',
          'box-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.75), 0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
          'border': '1px solid rgba(255, 255, 255, 0.40)',
        },
        '.glass-chrome': {
          'background': 'rgba(255, 255, 255, 0.55)',
          '-webkit-backdrop-filter': 'blur(60px) saturate(180%)',
          'backdrop-filter': 'blur(60px) saturate(180%)',
          'border-bottom': '1px solid rgba(255, 255, 255, 0.30)',
        },
        '.glass-nav': {
          'background': 'rgba(255, 255, 255, 0.60)',
          '-webkit-backdrop-filter': 'blur(60px) saturate(180%)',
          'backdrop-filter': 'blur(60px) saturate(180%)',
          'border-top': '1px solid rgba(255, 255, 255, 0.40)',
          'box-shadow': '0 -8px 32px rgba(0, 0, 0, 0.08)',
        },
        '.glass-inset': {
          'background': 'rgba(255, 255, 255, 0.25)',
          '-webkit-backdrop-filter': 'blur(20px) saturate(160%)',
          'backdrop-filter': 'blur(20px) saturate(160%)',
          'box-shadow': 'inset 0 1px 2px rgba(0, 0, 0, 0.04)',
        },

        /* ===== Brand blue glass (CTAs) ===== */
        '.glass-brand': {
          'background': 'rgba(81, 176, 230, 0.85)',
          '-webkit-backdrop-filter': 'blur(20px) saturate(180%)',
          'backdrop-filter': 'blur(20px) saturate(180%)',
          'box-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.30), 0 8px 24px rgba(81, 176, 230, 0.30), 0 1px 2px rgba(81, 176, 230, 0.20)',
          'color': '#FFFFFF',
        },
        '.glass-brand-subtle': {
          'background': 'rgba(81, 176, 230, 0.18)',
          '-webkit-backdrop-filter': 'blur(20px) saturate(160%)',
          'backdrop-filter': 'blur(20px) saturate(160%)',
          'box-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.30)',
          'border': '1px solid rgba(81, 176, 230, 0.30)',
          'color': '#1F6FA0',
        },

        /* ===== State-tinted glass (risk pills, alerts) ===== */
        '.glass-critical': {
          'background': 'rgba(184, 74, 74, 0.18)',
          '-webkit-backdrop-filter': 'blur(16px) saturate(160%)',
          'backdrop-filter': 'blur(16px) saturate(160%)',
          'border': '1px solid rgba(184, 74, 74, 0.30)',
          'color': '#7A2A2A',
        },
        '.glass-attention': {
          'background': 'rgba(200, 155, 60, 0.18)',
          '-webkit-backdrop-filter': 'blur(16px) saturate(160%)',
          'backdrop-filter': 'blur(16px) saturate(160%)',
          'border': '1px solid rgba(200, 155, 60, 0.30)',
          'color': '#7A5E1F',
        },
        '.glass-positive': {
          'background': 'rgba(74, 138, 111, 0.18)',
          '-webkit-backdrop-filter': 'blur(16px) saturate(160%)',
          'backdrop-filter': 'blur(16px) saturate(160%)',
          'border': '1px solid rgba(74, 138, 111, 0.30)',
          'color': '#2C5A45',
        },

        /* ===== Edge highlight (aluminum bezel light catch) ===== */
        '.edge-light': {
          'box-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.60)',
        },
        '.edge-light-strong': {
          'box-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.85), inset 0 -1px 0 rgba(0, 0, 0, 0.06)',
        },

        /* ===== Risk-tier left-edge light bleed (for contaminant cards) ===== */
        '.bleed-critical': {
          'background': 'linear-gradient(90deg, rgba(184, 74, 74, 0.20) 0%, rgba(255, 255, 255, 0) 12%), rgba(255, 255, 255, 0.45)',
          '-webkit-backdrop-filter': 'blur(40px) saturate(180%)',
          'backdrop-filter': 'blur(40px) saturate(180%)',
          'box-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.60), 0 8px 32px rgba(0, 0, 0, 0.10), 0 1px 2px rgba(0, 0, 0, 0.04)',
          'border': '1px solid rgba(255, 255, 255, 0.30)',
        },
        '.bleed-attention': {
          'background': 'linear-gradient(90deg, rgba(200, 155, 60, 0.20) 0%, rgba(255, 255, 255, 0) 12%), rgba(255, 255, 255, 0.45)',
          '-webkit-backdrop-filter': 'blur(40px) saturate(180%)',
          'backdrop-filter': 'blur(40px) saturate(180%)',
          'box-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.60), 0 8px 32px rgba(0, 0, 0, 0.10), 0 1px 2px rgba(0, 0, 0, 0.04)',
          'border': '1px solid rgba(255, 255, 255, 0.30)',
        },
        '.bleed-positive': {
          'background': 'linear-gradient(90deg, rgba(74, 138, 111, 0.20) 0%, rgba(255, 255, 255, 0) 12%), rgba(255, 255, 255, 0.45)',
          '-webkit-backdrop-filter': 'blur(40px) saturate(180%)',
          'backdrop-filter': 'blur(40px) saturate(180%)',
          'box-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.60), 0 8px 32px rgba(0, 0, 0, 0.10), 0 1px 2px rgba(0, 0, 0, 0.04)',
          'border': '1px solid rgba(255, 255, 255, 0.30)',
        },

        /* ===== Brand glow (active nav, focused buttons) ===== */
        '.brand-glow': {
          'box-shadow': '0 0 24px rgba(81, 176, 230, 0.30)',
        },
        '.brand-glow-strong': {
          'box-shadow': '0 0 40px rgba(81, 176, 230, 0.45), 0 0 12px rgba(81, 176, 230, 0.30)',
        },
      });
    },
  ],
};
