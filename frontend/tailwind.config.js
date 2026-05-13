/* eslint-disable */
// tailwind.config.js
// Generosity WTR App - Aluminum + Glass design system v2.1
//
// v2.1 dial-in changes:
//   - Aluminum substrate deepened from #6E7174 to #5A5E62 (more graphite)
//   - Card opacity 45% to 60% (more presence, less ghost)
//   - Edge highlight alpha 0.60 to 0.85 (visible bezel light catch)
//   - Brushed-metal texture added via index.css (vertical line grain)
//   - Brand-blue glow repositioned (handled in index.css)
//   - FOUNDER pill quieter (handled in TrustButVerify.js if you want it, optional)
//
// Brand color rules locked:
//   - Primary Blue: #51B0E6 (Pantone 2915 U)
//   - Brand Gray: #A6A8AB (Pantone Cool Gray 6)
//   - White: #FFFFFF
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
        /* ========== ALUMINUM BACKGROUND PALETTE (v2.1: deepened) ========== */
        aluminum: {
          50:  '#F0F1F3',
          100: '#DCDFE2',
          200: '#C4C7CB',
          300: '#A6A8AB',  /* LOCKED Pantone Cool Gray 6 */
          400: '#8A8D90',
          500: '#6E7174',
          550: '#5A5E62',  /* NEW v2.1 - primary background */
          600: '#54575A',
          700: '#3D4043',
          800: '#2A2C2E',
          900: '#1A1B1D',
        },

        /* ========== SURFACES (v2.1: higher opacity glass) ========== */
        surface: {
          base:    '#5A5E62',                          /* v2.1: deeper */
          baseAlt: '#3D4043',                          /* bottom gradient stop deeper */
          card:    'rgba(255, 255, 255, 0.60)',        /* v2.1: 0.45 -> 0.60 */
          cardSolid: 'rgba(255, 255, 255, 0.90)',
          inset:   'rgba(255, 255, 255, 0.25)',
          chrome:  'rgba(255, 255, 255, 0.65)',        /* v2.1: 0.55 -> 0.65 */
        },

        text: {
          primary:    '#0F1419',
          secondary:  '#3D4043',
          tertiary:   '#6E7174',
          quaternary: '#8A8D90',
          onAccent:   '#FFFFFF',
          onDark:     'rgba(255, 255, 255, 0.95)',
          onDarkMuted:'rgba(255, 255, 255, 0.65)',
        },

        brand: {
          DEFAULT: '#51B0E6',
          hover:   '#3DA0DA',
          pressed: '#2B8FC9',
          tint:    'rgba(81, 176, 230, 0.15)',
          glow:    'rgba(81, 176, 230, 0.35)',
          deep:    'rgba(81, 176, 230, 0.85)',
        },

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
        card:  '16px',
        sheet: '24px',
        soft:  '12px',
      },

      boxShadow: {
        /* v2.1: stronger edge highlights, more present cards */
        glass:      '0 8px 32px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.06)',
        glassDeep:  '0 16px 48px rgba(0, 0, 0, 0.18), 0 2px 4px rgba(0, 0, 0, 0.08)',
        glassHover: '0 12px 40px rgba(0, 0, 0, 0.16), 0 2px 4px rgba(0, 0, 0, 0.08)',

        edge:       'inset 0 1px 0 rgba(255, 255, 255, 0.85)',          /* v2.1: 0.60 -> 0.85 */
        edgeStrong: 'inset 0 1px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 0 rgba(0, 0, 0, 0.08)',

        card:       'inset 0 1px 0 rgba(255, 255, 255, 0.85), 0 8px 32px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.06)',
        cardHover:  'inset 0 1px 0 rgba(255, 255, 255, 0.95), 0 12px 40px rgba(0, 0, 0, 0.16), 0 2px 4px rgba(0, 0, 0, 0.08)',

        glow:       '0 0 32px rgba(81, 176, 230, 0.30), 0 0 8px rgba(81, 176, 230, 0.20)',
        glowSoft:   '0 0 24px rgba(81, 176, 230, 0.20)',

        nav:        '0 -8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.65)',
        header:     '0 4px 24px rgba(0, 0, 0, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.04)',
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
    function ({ addUtilities }) {
      addUtilities({
        /* ===== Frosted glass card material (v2.1: 60% opacity) ===== */
        '.glass-card': {
          'background': 'rgba(255, 255, 255, 0.60)',
          '-webkit-backdrop-filter': 'blur(40px) saturate(180%)',
          'backdrop-filter': 'blur(40px) saturate(180%)',
          'box-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.85), 0 8px 32px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.06)',
          'border': '1px solid rgba(255, 255, 255, 0.40)',
        },
        '.glass-card-solid': {
          'background': 'rgba(255, 255, 255, 0.90)',
          '-webkit-backdrop-filter': 'blur(20px) saturate(160%)',
          'backdrop-filter': 'blur(20px) saturate(160%)',
          'box-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.95), 0 8px 32px rgba(0, 0, 0, 0.10), 0 1px 2px rgba(0, 0, 0, 0.06)',
          'border': '1px solid rgba(255, 255, 255, 0.50)',
        },
        '.glass-chrome': {
          'background': 'rgba(255, 255, 255, 0.65)',
          '-webkit-backdrop-filter': 'blur(60px) saturate(180%)',
          'backdrop-filter': 'blur(60px) saturate(180%)',
          'border-bottom': '1px solid rgba(255, 255, 255, 0.40)',
        },
        '.glass-nav': {
          'background': 'rgba(255, 255, 255, 0.70)',
          '-webkit-backdrop-filter': 'blur(60px) saturate(180%)',
          'backdrop-filter': 'blur(60px) saturate(180%)',
          'border-top': '1px solid rgba(255, 255, 255, 0.50)',
          'box-shadow': '0 -8px 32px rgba(0, 0, 0, 0.12)',
        },
        '.glass-inset': {
          'background': 'rgba(255, 255, 255, 0.30)',
          '-webkit-backdrop-filter': 'blur(20px) saturate(160%)',
          'backdrop-filter': 'blur(20px) saturate(160%)',
          'box-shadow': 'inset 0 1px 2px rgba(0, 0, 0, 0.06)',
        },

        '.glass-brand': {
          'background': 'rgba(81, 176, 230, 0.85)',
          '-webkit-backdrop-filter': 'blur(20px) saturate(180%)',
          'backdrop-filter': 'blur(20px) saturate(180%)',
          'box-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.40), 0 8px 24px rgba(81, 176, 230, 0.30), 0 1px 2px rgba(81, 176, 230, 0.20)',
          'color': '#FFFFFF',
        },
        '.glass-brand-subtle': {
          'background': 'rgba(81, 176, 230, 0.18)',
          '-webkit-backdrop-filter': 'blur(20px) saturate(160%)',
          'backdrop-filter': 'blur(20px) saturate(160%)',
          'box-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.40)',
          'border': '1px solid rgba(81, 176, 230, 0.30)',
          'color': '#1F6FA0',
        },

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

        '.edge-light': {
          'box-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.85)',
        },
        '.edge-light-strong': {
          'box-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 0 rgba(0, 0, 0, 0.08)',
        },

        '.bleed-critical': {
          'background': 'linear-gradient(90deg, rgba(184, 74, 74, 0.22) 0%, rgba(255, 255, 255, 0) 14%), rgba(255, 255, 255, 0.60)',
          '-webkit-backdrop-filter': 'blur(40px) saturate(180%)',
          'backdrop-filter': 'blur(40px) saturate(180%)',
          'box-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.85), 0 8px 32px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.06)',
          'border': '1px solid rgba(255, 255, 255, 0.40)',
        },
        '.bleed-attention': {
          'background': 'linear-gradient(90deg, rgba(200, 155, 60, 0.22) 0%, rgba(255, 255, 255, 0) 14%), rgba(255, 255, 255, 0.60)',
          '-webkit-backdrop-filter': 'blur(40px) saturate(180%)',
          'backdrop-filter': 'blur(40px) saturate(180%)',
          'box-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.85), 0 8px 32px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.06)',
          'border': '1px solid rgba(255, 255, 255, 0.40)',
        },
        '.bleed-positive': {
          'background': 'linear-gradient(90deg, rgba(74, 138, 111, 0.22) 0%, rgba(255, 255, 255, 0) 14%), rgba(255, 255, 255, 0.60)',
          '-webkit-backdrop-filter': 'blur(40px) saturate(180%)',
          'backdrop-filter': 'blur(40px) saturate(180%)',
          'box-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.85), 0 8px 32px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.06)',
          'border': '1px solid rgba(255, 255, 255, 0.40)',
        },

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
