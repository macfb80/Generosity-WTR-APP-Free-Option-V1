/* eslint-disable */
// tailwind.config.js
// Generosity WTR App v3.1 - Chrome solid, content translucent, edges fade
//
// v3.1 changes from v3.0:
//   #1: Header and bottom nav now opaque white (#FFFFFF) with subtle shadow
//   #2: Cards 15-20% more translucent (substrate shows through more)
//   #3: Card edges fade with soft gradient instead of hard 1px border
//
// Brand color rules locked:
//   - Primary Blue: #51B0E6 (Pantone 2915 U)
//   - Brand Gray: #A6A8AB (Pantone Cool Gray 6)
//   - Light Gray: #F0F1F3
//   - White: #FFFFFF

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        aluminum: {
          50:  '#FFFFFF',
          100: '#FAFBFC',
          200: '#F2F4F7',
          300: '#F0F1F3',
          400: '#DCDFE2',
          500: '#A6A8AB',
          600: '#6E7174',
          700: '#3D4043',
          800: '#1A1B1D',
          900: '#0F1419',
        },

        surface: {
          base:     '#FFFFFF',
          baseAlt:  '#FAFBFC',
          /* v3.1: cards more translucent - was 0.06, now 0.045 (~25% more see-through) */
          card:     'rgba(81, 176, 230, 0.045)',
          cardSolid:'#FFFFFF',
          /* v3.1: chrome now OPAQUE white (was 0.85) */
          chrome:   '#FFFFFF',
          inset:    '#F0F1F3',
        },

        text: {
          primary:    '#0F1419',
          secondary:  '#3D4043',
          tertiary:   '#6E7174',
          quaternary: '#A6A8AB',
          onAccent:   '#FFFFFF',
          onDark:     'rgba(255, 255, 255, 0.95)',
          onDarkMuted:'rgba(255, 255, 255, 0.65)',
        },

        brand: {
          DEFAULT: '#51B0E6',
          hover:   '#3DA0DA',
          pressed: '#2B8FC9',
          tint:    'rgba(81, 176, 230, 0.045)',
          tintMid: 'rgba(81, 176, 230, 0.10)',
          tintHi:  'rgba(81, 176, 230, 0.15)',
          edge:    '#51B0E6',
          glow:    'rgba(81, 176, 230, 0.25)',
          deep:    'rgba(81, 176, 230, 0.85)',
          ink:     '#1F6FA0',
        },

        state: {
          positive: '#4A8A6F',
          attention:'#C89B3C',
          critical: '#B84A4A',
          neutral:  '#A6A8AB',
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
        /* v3.1: softer, more diffuse shadow for the fade-to-edge effect */
        card:       '0 1px 3px rgba(15, 20, 25, 0.03), 0 8px 24px rgba(15, 20, 25, 0.06), 0 16px 48px rgba(15, 20, 25, 0.04)',
        cardHover:  '0 2px 4px rgba(15, 20, 25, 0.05), 0 12px 32px rgba(15, 20, 25, 0.08), 0 20px 56px rgba(15, 20, 25, 0.06)',
        /* v3.1: chrome shadow - subtle glass shadow underneath solid white */
        chrome:     '0 1px 0 rgba(15, 20, 25, 0.04), 0 2px 8px rgba(15, 20, 25, 0.04), 0 8px 24px rgba(15, 20, 25, 0.02)',
        nav:        '0 -1px 0 rgba(15, 20, 25, 0.04), 0 -2px 8px rgba(15, 20, 25, 0.04), 0 -8px 24px rgba(15, 20, 25, 0.02)',

        glow:       '0 0 32px rgba(81, 176, 230, 0.25), 0 0 8px rgba(81, 176, 230, 0.15)',
        glowSoft:   '0 0 24px rgba(81, 176, 230, 0.15)',
      },

      backdropBlur: {
        xs: '8px',
        sm: '16px',
        md: '24px',
        lg: '40px',
        xl: '60px',
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
        /* ===== DEFAULT CARD: brand-blue left edge, more translucent, gradient edges ===== */
        /* v3.1: border is now transparent with gradient. Card edge fades via mask.       */
        '.card-default': {
          'background': 'rgba(81, 176, 230, 0.045)',
          'border': '1px solid transparent',
          'border-left': '4px solid #51B0E6',
          'border-radius': '16px',
          'box-shadow': '0 1px 3px rgba(15, 20, 25, 0.03), 0 8px 24px rgba(15, 20, 25, 0.06), 0 16px 48px rgba(15, 20, 25, 0.04)',
          /* Soft gradient edge effect via inner-glow inset shadow */
          'background-image': 'radial-gradient(ellipse at center, rgba(81, 176, 230, 0.05) 0%, rgba(81, 176, 230, 0.03) 60%, rgba(81, 176, 230, 0.01) 100%)',
        },

        /* ===== Pure white card variant - more translucent (white-glass) ===== */
        '.card-white': {
          'background': 'rgba(255, 255, 255, 0.70)',
          '-webkit-backdrop-filter': 'blur(20px) saturate(160%)',
          'backdrop-filter': 'blur(20px) saturate(160%)',
          'border': '1px solid transparent',
          'border-radius': '16px',
          'box-shadow': '0 1px 3px rgba(15, 20, 25, 0.03), 0 8px 24px rgba(15, 20, 25, 0.06), 0 16px 48px rgba(15, 20, 25, 0.04)',
        },

        /* ===== HERO CARD: stronger blue presence, gradient edges ===== */
        '.card-hero': {
          'background': 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(81, 176, 230, 0.05) 100%)',
          'border': '1px solid transparent',
          'border-left': '4px solid #51B0E6',
          'border-radius': '16px',
          'box-shadow': '0 2px 4px rgba(15, 20, 25, 0.03), 0 12px 32px rgba(15, 20, 25, 0.06), 0 24px 64px rgba(15, 20, 25, 0.04)',
        },

        /* ===== RISK-TIER CARDS: gradient edges, slightly more translucent tint ===== */
        '.card-critical': {
          'background': 'rgba(184, 74, 74, 0.045)',
          'border': '1px solid transparent',
          'border-left': '4px solid #B84A4A',
          'border-radius': '16px',
          'box-shadow': '0 1px 3px rgba(15, 20, 25, 0.03), 0 8px 24px rgba(15, 20, 25, 0.06), 0 16px 48px rgba(15, 20, 25, 0.04)',
          'background-image': 'radial-gradient(ellipse at left center, rgba(184, 74, 74, 0.10) 0%, rgba(184, 74, 74, 0.04) 30%, rgba(184, 74, 74, 0.01) 70%, rgba(184, 74, 74, 0) 100%)',
        },
        '.card-attention': {
          'background': 'rgba(200, 155, 60, 0.045)',
          'border': '1px solid transparent',
          'border-left': '4px solid #C89B3C',
          'border-radius': '16px',
          'box-shadow': '0 1px 3px rgba(15, 20, 25, 0.03), 0 8px 24px rgba(15, 20, 25, 0.06), 0 16px 48px rgba(15, 20, 25, 0.04)',
          'background-image': 'radial-gradient(ellipse at left center, rgba(200, 155, 60, 0.10) 0%, rgba(200, 155, 60, 0.04) 30%, rgba(200, 155, 60, 0.01) 70%, rgba(200, 155, 60, 0) 100%)',
        },
        '.card-positive': {
          'background': 'rgba(74, 138, 111, 0.045)',
          'border': '1px solid transparent',
          'border-left': '4px solid #4A8A6F',
          'border-radius': '16px',
          'box-shadow': '0 1px 3px rgba(15, 20, 25, 0.03), 0 8px 24px rgba(15, 20, 25, 0.06), 0 16px 48px rgba(15, 20, 25, 0.04)',
          'background-image': 'radial-gradient(ellipse at left center, rgba(74, 138, 111, 0.10) 0%, rgba(74, 138, 111, 0.04) 30%, rgba(74, 138, 111, 0.01) 70%, rgba(74, 138, 111, 0) 100%)',
        },

        /* ===== CHROME: opaque white, no backdrop filter, subtle shadow underneath ===== */
        '.glass-chrome': {
          'background': '#FFFFFF',
          'border-bottom': '1px solid rgba(15, 20, 25, 0.04)',
          'box-shadow': '0 1px 0 rgba(15, 20, 25, 0.04), 0 2px 8px rgba(15, 20, 25, 0.04), 0 8px 24px rgba(15, 20, 25, 0.02)',
        },
        '.glass-nav': {
          'background': '#FFFFFF',
          'border-top': '1px solid rgba(15, 20, 25, 0.04)',
          'box-shadow': '0 -1px 0 rgba(15, 20, 25, 0.04), 0 -2px 8px rgba(15, 20, 25, 0.04), 0 -8px 24px rgba(15, 20, 25, 0.02)',
        },
        '.glass-sheet': {
          'background': 'rgba(255, 255, 255, 0.95)',
          '-webkit-backdrop-filter': 'blur(40px) saturate(180%)',
          'backdrop-filter': 'blur(40px) saturate(180%)',
        },

        /* ===== Brand button: saturated blue (the brand light source) ===== */
        '.btn-brand': {
          'background': '#51B0E6',
          'color': '#FFFFFF',
          'box-shadow': '0 1px 2px rgba(81, 176, 230, 0.30), 0 4px 16px rgba(81, 176, 230, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.20) inset',
          'border': 'none',
        },
        '.btn-brand-subtle': {
          'background': 'rgba(81, 176, 230, 0.10)',
          'color': '#1F6FA0',
          'border': '1px solid rgba(81, 176, 230, 0.25)',
        },

        /* ===== Status pills ===== */
        '.pill-critical': {
          'background': 'rgba(184, 74, 74, 0.08)',
          'color': '#B84A4A',
          'border': '1px solid rgba(184, 74, 74, 0.20)',
        },
        '.pill-attention': {
          'background': 'rgba(200, 155, 60, 0.08)',
          'color': '#C89B3C',
          'border': '1px solid rgba(200, 155, 60, 0.20)',
        },
        '.pill-positive': {
          'background': 'rgba(74, 138, 111, 0.08)',
          'color': '#4A8A6F',
          'border': '1px solid rgba(74, 138, 111, 0.20)',
        },
        '.pill-brand': {
          'background': 'rgba(81, 176, 230, 0.08)',
          'color': '#1F6FA0',
          'border': '1px solid rgba(81, 176, 230, 0.20)',
        },
        '.pill-founder': {
          'background': 'rgba(15, 20, 25, 0.04)',
          'color': '#1F6FA0',
          'border': '1px solid rgba(81, 176, 230, 0.18)',
        },

        '.brand-glow': {
          'box-shadow': '0 0 24px rgba(81, 176, 230, 0.25)',
        },
        '.brand-glow-strong': {
          'box-shadow': '0 0 40px rgba(81, 176, 230, 0.35), 0 0 12px rgba(81, 176, 230, 0.20)',
        },
      });
    },
  ],
};
