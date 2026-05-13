/* eslint-disable */
// tailwind.config.js
// Generosity WTR App - White + Brand Blue Card System v3.0
//
// Aesthetic anchor: high-concern alert card pattern as the design language.
//   - White substrate
//   - Cards: subtle brand-tinted translucent surface + 4px left-edge color bar
//   - Default left-edge: brand blue #51B0E6
//   - Risk-tier cards keep red/amber/green left-edge bars
//   - Clean typography, sharp 16px corners
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
        /* ========== SUBSTRATE / NEUTRALS ========== */
        aluminum: {
          50:  '#FFFFFF',
          100: '#FAFBFC',
          200: '#F2F4F7',
          300: '#F0F1F3',  /* LOCKED Light Gray */
          400: '#DCDFE2',
          500: '#A6A8AB',  /* LOCKED Pantone Cool Gray 6 */
          600: '#6E7174',
          700: '#3D4043',
          800: '#1A1B1D',
          900: '#0F1419',
        },

        /* ========== SURFACES ========== */
        surface: {
          base:     '#FFFFFF',                          /* v3.0 white substrate */
          baseAlt:  '#FAFBFC',                          /* very subtle off-white */
          card:     'rgba(81, 176, 230, 0.06)',         /* default blue-tinted glass card */
          cardSolid:'#FFFFFF',                          /* pure white card variant */
          chrome:   'rgba(255, 255, 255, 0.85)',        /* nav/header glass */
          inset:    '#F0F1F3',                          /* inset zones use locked light gray */
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
          tint:    'rgba(81, 176, 230, 0.06)',
          tintMid: 'rgba(81, 176, 230, 0.12)',
          tintHi:  'rgba(81, 176, 230, 0.18)',
          edge:    '#51B0E6',
          glow:    'rgba(81, 176, 230, 0.25)',
          deep:    'rgba(81, 176, 230, 0.85)',
          ink:     '#1F6FA0',  /* dark blue for text on tinted surfaces */
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
        /* Soft drop shadow appropriate for cards on white substrate */
        card:       '0 1px 2px rgba(15, 20, 25, 0.04), 0 4px 16px rgba(15, 20, 25, 0.06)',
        cardHover:  '0 2px 4px rgba(15, 20, 25, 0.06), 0 8px 24px rgba(15, 20, 25, 0.08)',
        chrome:     '0 1px 0 rgba(15, 20, 25, 0.06), 0 1px 4px rgba(15, 20, 25, 0.03)',
        nav:        '0 -1px 0 rgba(15, 20, 25, 0.06), 0 -4px 16px rgba(15, 20, 25, 0.04)',

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
        /* ===== Default card: brand-blue left-edge bar + subtle blue tint ===== */
        '.card-default': {
          'background': 'rgba(81, 176, 230, 0.06)',
          'border': '1px solid rgba(81, 176, 230, 0.20)',
          'border-left': '4px solid #51B0E6',
          'border-radius': '16px',
          'box-shadow': '0 1px 2px rgba(15, 20, 25, 0.04), 0 4px 16px rgba(15, 20, 25, 0.06)',
        },

        /* ===== Pure white card variant (for content that shouldn't have brand bleed) ===== */
        '.card-white': {
          'background': '#FFFFFF',
          'border': '1px solid rgba(15, 20, 25, 0.06)',
          'border-radius': '16px',
          'box-shadow': '0 1px 2px rgba(15, 20, 25, 0.04), 0 4px 16px rgba(15, 20, 25, 0.06)',
        },

        /* ===== Hero card: brand blue, stronger presence ===== */
        '.card-hero': {
          'background': 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(81, 176, 230, 0.04) 100%)',
          'border': '1px solid rgba(81, 176, 230, 0.20)',
          'border-left': '4px solid #51B0E6',
          'border-radius': '16px',
          'box-shadow': '0 2px 4px rgba(15, 20, 25, 0.04), 0 8px 24px rgba(15, 20, 25, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.8) inset',
        },

        /* ===== Risk-tier card variants (left-edge color reflects risk) ===== */
        '.card-critical': {
          'background': 'rgba(184, 74, 74, 0.06)',
          'border': '1px solid rgba(184, 74, 74, 0.20)',
          'border-left': '4px solid #B84A4A',
          'border-radius': '16px',
          'box-shadow': '0 1px 2px rgba(15, 20, 25, 0.04), 0 4px 16px rgba(15, 20, 25, 0.06)',
        },
        '.card-attention': {
          'background': 'rgba(200, 155, 60, 0.06)',
          'border': '1px solid rgba(200, 155, 60, 0.20)',
          'border-left': '4px solid #C89B3C',
          'border-radius': '16px',
          'box-shadow': '0 1px 2px rgba(15, 20, 25, 0.04), 0 4px 16px rgba(15, 20, 25, 0.06)',
        },
        '.card-positive': {
          'background': 'rgba(74, 138, 111, 0.06)',
          'border': '1px solid rgba(74, 138, 111, 0.20)',
          'border-left': '4px solid #4A8A6F',
          'border-radius': '16px',
          'box-shadow': '0 1px 2px rgba(15, 20, 25, 0.04), 0 4px 16px rgba(15, 20, 25, 0.06)',
        },

        /* ===== Chrome surfaces (header, nav) - lighter glass on white ===== */
        '.glass-chrome': {
          'background': 'rgba(255, 255, 255, 0.85)',
          '-webkit-backdrop-filter': 'blur(24px) saturate(180%)',
          'backdrop-filter': 'blur(24px) saturate(180%)',
          'border-bottom': '1px solid rgba(15, 20, 25, 0.06)',
        },
        '.glass-nav': {
          'background': 'rgba(255, 255, 255, 0.90)',
          '-webkit-backdrop-filter': 'blur(24px) saturate(180%)',
          'backdrop-filter': 'blur(24px) saturate(180%)',
          'border-top': '1px solid rgba(15, 20, 25, 0.06)',
          'box-shadow': '0 -1px 0 rgba(15, 20, 25, 0.04)',
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
          'background': 'rgba(81, 176, 230, 0.12)',
          'color': '#1F6FA0',
          'border': '1px solid rgba(81, 176, 230, 0.30)',
        },

        /* ===== Status pills (tinted, for header risk score etc) ===== */
        '.pill-critical': {
          'background': 'rgba(184, 74, 74, 0.10)',
          'color': '#B84A4A',
          'border': '1px solid rgba(184, 74, 74, 0.25)',
        },
        '.pill-attention': {
          'background': 'rgba(200, 155, 60, 0.10)',
          'color': '#C89B3C',
          'border': '1px solid rgba(200, 155, 60, 0.25)',
        },
        '.pill-positive': {
          'background': 'rgba(74, 138, 111, 0.10)',
          'color': '#4A8A6F',
          'border': '1px solid rgba(74, 138, 111, 0.25)',
        },
        '.pill-brand': {
          'background': 'rgba(81, 176, 230, 0.10)',
          'color': '#1F6FA0',
          'border': '1px solid rgba(81, 176, 230, 0.25)',
        },
        '.pill-founder': {
          'background': 'rgba(15, 20, 25, 0.04)',
          'color': '#1F6FA0',
          'border': '1px solid rgba(81, 176, 230, 0.20)',
        },

        /* ===== Brand glow (active states) ===== */
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
