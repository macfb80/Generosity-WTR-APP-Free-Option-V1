/* eslint-disable */
// tailwind.config.js
// Generosity WTR App v3.2 - Smoky mirror cards, white substrate restored
//
// v3.2 changes from v3.1:
//   - Substrate restored to v3.0 white + brand-blue glow (radial bottom-right + top-left)
//   - Cards become "smoky mirror" - more translucent white-glass with heavier blur
//   - Colored left-edge bars REMOVED from default cards
//   - Risk-tier cards lose left edges EXCEPT card-critical (medical-grade red bar stays)
//   - Cards have subtle inner-highlight + soft outer shadow to feel floating
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
          /* v3.2: cards are smoky-mirror translucent white */
          card:     'rgba(255, 255, 255, 0.55)',
          cardSolid:'#FFFFFF',
          /* v3.2: chrome stays opaque white (from v3.1) */
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
          tint:    'rgba(81, 176, 230, 0.06)',
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
        card:       '0 1px 3px rgba(15, 20, 25, 0.04), 0 8px 24px rgba(15, 20, 25, 0.06), 0 16px 48px rgba(15, 20, 25, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.85)',
        cardHover:  '0 2px 4px rgba(15, 20, 25, 0.06), 0 12px 32px rgba(15, 20, 25, 0.08), 0 20px 56px rgba(15, 20, 25, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
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
        /* ===== DEFAULT CARD: smoky mirror, NO left edge, floating feel ===== */
        '.card-default': {
          'background': 'rgba(255, 255, 255, 0.55)',
          '-webkit-backdrop-filter': 'blur(50px) saturate(180%)',
          'backdrop-filter': 'blur(50px) saturate(180%)',
          'border': '1px solid rgba(255, 255, 255, 0.65)',
          'border-radius': '16px',
          'box-shadow': '0 1px 3px rgba(15, 20, 25, 0.04), 0 8px 24px rgba(15, 20, 25, 0.06), 0 16px 48px rgba(15, 20, 25, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.85)',
        },

        /* ===== Pure white solid card (rare use - for content that needs hard surface) ===== */
        '.card-white': {
          'background': '#FFFFFF',
          'border': '1px solid rgba(15, 20, 25, 0.06)',
          'border-radius': '16px',
          'box-shadow': '0 1px 3px rgba(15, 20, 25, 0.04), 0 8px 24px rgba(15, 20, 25, 0.06)',
        },

        /* ===== HERO CARD: stronger floating mirror, slight blue bottom glow ===== */
        '.card-hero': {
          'background': 'linear-gradient(180deg, rgba(255, 255, 255, 0.70) 0%, rgba(255, 255, 255, 0.50) 70%, rgba(81, 176, 230, 0.06) 100%)',
          '-webkit-backdrop-filter': 'blur(60px) saturate(180%)',
          'backdrop-filter': 'blur(60px) saturate(180%)',
          'border': '1px solid rgba(255, 255, 255, 0.75)',
          'border-radius': '16px',
          'box-shadow': '0 2px 4px rgba(15, 20, 25, 0.04), 0 12px 32px rgba(15, 20, 25, 0.06), 0 24px 64px rgba(15, 20, 25, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
        },

        /* ===== RISK-TIER CARDS:                                             */
        /* CRITICAL keeps the 4px red left edge (medical-grade signal).       */
        /* ATTENTION and POSITIVE lose their edges per v3.2 spec.             */
        '.card-critical': {
          'background': 'rgba(184, 74, 74, 0.06)',
          '-webkit-backdrop-filter': 'blur(40px) saturate(160%)',
          'backdrop-filter': 'blur(40px) saturate(160%)',
          'border': '1px solid rgba(184, 74, 74, 0.18)',
          'border-left': '4px solid #B84A4A',
          'border-radius': '16px',
          'box-shadow': '0 1px 3px rgba(184, 74, 74, 0.04), 0 8px 24px rgba(15, 20, 25, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.80)',
        },
        '.card-attention': {
          'background': 'rgba(200, 155, 60, 0.05)',
          '-webkit-backdrop-filter': 'blur(50px) saturate(180%)',
          'backdrop-filter': 'blur(50px) saturate(180%)',
          'border': '1px solid rgba(200, 155, 60, 0.20)',
          'border-radius': '16px',
          'box-shadow': '0 1px 3px rgba(15, 20, 25, 0.04), 0 8px 24px rgba(15, 20, 25, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.85)',
        },
        '.card-positive': {
          'background': 'rgba(74, 138, 111, 0.05)',
          '-webkit-backdrop-filter': 'blur(50px) saturate(180%)',
          'backdrop-filter': 'blur(50px) saturate(180%)',
          'border': '1px solid rgba(74, 138, 111, 0.20)',
          'border-radius': '16px',
          'box-shadow': '0 1px 3px rgba(15, 20, 25, 0.04), 0 8px 24px rgba(15, 20, 25, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.85)',
        },

        /* ===== Chrome surfaces (header, nav) - opaque white from v3.1 ===== */
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
