# Trust But Verify™ - Water Quality Intelligence App

## Original Problem Statement
Build an investor demo web application called "Trust But Verify™" (formerly WTR APP) - a mobile-first water quality testing app designed as an "Oura Ring for water quality." The app provides water intelligence reports for both home tap water and bottled water.

## User Personas
1. **Moms & Families** - Know what their kids drink every day
2. **Homeowners** - Understand home water quality
3. **Biohackers** - Optimize every input including water
4. **Wellness Enthusiasts** - Contaminants undermine health goals

## Core Requirements (Investor Demo)
✅ **Implemented:**
- 4-tab navigation: Home, Scan, Report, Learn
- My Address / ZIP Code / City input toggle
- 6-step scan animation with sequential checkmarks
- Risk gauge animation (0 → final score)
- HIGH CONCERN contaminant alerts
- Lifetime Exposure Calculator with persona selection
- Bottle scan with brand analysis
- Email capture with WELCOME100 discount code
- Learn tab with 6 educational cards
- Bottom navigation with custom SVG icons and active glow state

## Technical Architecture
```
/app/frontend/
├── src/
│   ├── App.js          # Entry point (imports TrustButVerify)
│   ├── TrustButVerify.js   # Main component (1150+ lines)
│   └── components/ui/  # Shadcn UI components (unused for this build)
```

## Data Model (Hardcoded)
### CITY_DATA (7 cities)
- Austin, TX
- Chicago, IL
- Los Angeles, CA
- New York, NY
- Denver, CO
- Houston, TX
- Phoenix, AZ

Each contains: utility, source, TDS, pH, hardness, contaminants[]

### BOTTLE_BRANDS (7 brands)
- Evian, Dasani, Aquafina, Poland Spring, Fiji Water, Smart Water, Voss

Each contains: origin, TDS, pH, fluoride, microplastics, pfas_risk, score, concern

### ZIP_MAP
Maps ZIP codes to cities for address resolution

## Brand Palette (Generosity™)
```javascript
{
  blue: "#51B0E6",
  blueDark: "#2A8FCA",
  navy: "#0A1A2E",
  danger: "#D93025",
  warning: "#F29423",
  ok: "#1E8A4C"
}
```

## 10-Step Investor Demo Flow
1. ✅ Home tab loads with "My Address" selected by default
2. ✅ Enter "1234 W Wacker Dr, Chicago IL" → SCAN
3. ✅ 6-step animation plays with checkmarks
4. ✅ Report loads → gauge animates to 98 → HIGH RISK alert (Lead, Chromium-6, PFAS)
5. ✅ Lifetime Calculator → Child under 12 → 10 years → cumulative risk 100 (red)
6. ✅ Scan tab → Dasani → score 78, PFAS HIGH, KEY CONCERN block
7. ✅ "TEST MY HOME TAP WATER" → returns to Home
8. ✅ Report → email → success state with WELCOME100
9. ✅ Learn tab → 6 cards render correctly
10. ✅ Bottom nav dark bar with SVG icons + active glow state

## Testing Status
- **Test Date:** 2025-03-07
- **Success Rate:** 100% (11/11 features)
- **Test Report:** /app/test_reports/iteration_2.json

## Known Limitations
- All data is hardcoded (works offline)
- No backend API integration
- No user authentication
- No persistent data storage

---

## Backlog / Future Tasks

### P1 - Backend Integration
- [ ] Create API endpoint `GET /api/water-system/{query}` for city/ZIP lookup
- [ ] Create API endpoint `GET /api/bottle-brand/{name}` for bottle data
- [ ] Move CITY_DATA and BOTTLE_BRANDS to MongoDB
- [ ] Add real EPA SDWIS API integration

### P2 - Frontend Refactoring
- [ ] Split TrustButVerify.js into smaller components
  - RiskGauge.js
  - WTRHubAnimation.js
  - BottleScanView.js
  - HealthCalc.js
  - NavIcon.js
- [ ] Extract styles to CSS modules or Tailwind

### P3 - Features
- [ ] User authentication
- [ ] Scan history persistence
- [ ] Push notification integration
- [ ] Real wearable data sync (Apple Health, Oura Ring)
- [ ] Actual email sending via API

---

## Changelog

### 2025-03-07 - Investor Demo Complete
- Built complete Trust But Verify™ app from user-provided source code
- Implemented all 4 tabs with full functionality
- Fixed city resolution logic for address matching
- Fixed React key warning in WTRHubAnimation
- Passed all 11 frontend tests

### Previous Sessions (Deprecated)
- Original WTR APP features replaced by Trust But Verify™ rebuild
