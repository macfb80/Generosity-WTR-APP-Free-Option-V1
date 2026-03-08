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
│   ├── App.js                    # Entry point (imports TrustButVerify)
│   ├── TrustButVerify.js         # Main component (~1280 lines)
│   └── components/
│       ├── BottleScanView.js     # NEW: Complete water quality report system (~850 lines)
│       └── ui/                   # Shadcn UI components
```

## Data Model (Hardcoded)
### CITY_DATA (7 cities)
- Austin, TX | Chicago, IL | Los Angeles, CA | New York, NY | Denver, CO | Houston, TX | Phoenix, AZ

Each contains: utility, source, TDS, pH, hardness, contaminants[]

### BOTTLE_BRANDS (16 brands - Clinical Water Quality Reports)
**NATIONAL:** Dasani, Aquafina, smartwater, Topo Chico, Poland Spring, Pure Life, Crystal Geyser, Kirkland Signature
**PREMIUM:** FIJI Water, evian, VOSS, Icelandic Glacial, Liquid Death, Proud Source  
**WELLNESS:** Essentia

Each brand contains comprehensive data:
- Parent company, sourceType, sourceName, treatment process
- pH, TDS (ppm), hardness, minerals (if applicable), additives
- reportYear, reportSource, reportUrl
- Detailed contaminants[] with: name, detected, level, fda_limit, risk, category, health impact
- recalls[], lawsuits[], violations[]
- ewg_grade, transparency rating, risk_score, key_concern
- wtr_hub_statement (comparison marketing)

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
- **Test Date:** 2025-03-08
- **Success Rate:** 100% (10/10 features for Bottle Scan)
- **Test Report:** /app/test_reports/iteration_3.json

## Investor Demo Flow - Bottle Scan Feature
1. ✅ Topo Chico → Score 76, PFAS 9.76 ppt HIGH (2,440x EPA limit)
2. ✅ FIJI Water → Score 98, FDA RECALL card (1.9M bottles, manganese + bacteria)
3. ✅ Crystal Geyser → Score 98, CRIMINAL CONVICTION violation (arsenic discharge 2021)
4. ✅ Dasani → Score 76, VERY HIGH microplastics (~325/L per Orb Media)
5. ✅ Icelandic Glacial → Score 15, EWG grade A, all green (contrast demo)
6. ✅ Proud Source → Score 10, aluminum bottle = NONE microplastics (cleanest)

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

### 2025-03-08 - Complete Bottle Scan Rebuild (Clinical Water Quality Reports)
- **NEW:** Rebuilt BottleScanView.js component with 16 comprehensive brand profiles
- **NEW:** Full water quality report UI with 9 sections:
  1. Report Header (dark navy gradient, risk score, EWG grade)
  2. Water Profile Grid (pH, TDS, Hardness, Treatment)
  3. Minerals Card (when available)
  4. Contaminant Analysis Table (expandable rows with health info)
  5. Regulatory History Card (recalls, lawsuits, violations)
  6. Key Concern (red danger card)
  7. Transparency Rating (EWG grade + link to report)
  8. WTR Hub Bridge (comparison + CTA to Home tab)
  9. Data Footer (source citations)
- **NEW:** Brand categories: NATIONAL (8), PREMIUM (6), WELLNESS (1)
- **NEW:** Search functionality with real-time filtering
- **DATA:** Sourced from FDA quality reports, Consumer Reports, EWG database
- Passed all 10 frontend tests (iteration_3.json)

### 2025-03-07 - Investor Demo Complete
- Built complete Trust But Verify™ app from user-provided source code
- Implemented all 4 tabs with full functionality
- Fixed city resolution logic for address matching
- Fixed React key warning in WTRHubAnimation
- Passed all 11 frontend tests

### Previous Sessions (Deprecated)
- Original WTR APP features replaced by Trust But Verify™ rebuild
