# Space Trucker Tools - Angular Conversion Project

## Project Overview
Converting a plain HTML/JS/CSS application to Angular with page components and routing.

## ✅ Completed Tasks

### Initial Setup
- [x] Moved `.vscode` configuration to project root
- [x] Updated VS Code launch and task configurations for Angular development
- [x] Copied assets (imgs, js, css) to Angular assets folder
- [x] Set up Angular routing structure

### Component Generation
- [x] Generated all page components:
  - [x] Home component (`pages/home`)
  - [x] Cargo Manifest Writer component (`pages/cargo-manifest-writer`)
  - [x] Workorders Overview component (`pages/workorders-overview`)
  - [x] Profit Splitter component (`pages/profit-splitter`)
  - [x] Yield 2 Sell component (`pages/yield-2-sell`)
  - [x] Scavenger component (`pages/scavenger`)
  - [x] Aaron's Jump Data component (`pages/aarons-jump-data`)
  - [x] Profile component (`pages/profile`)
- [x] Generated navigation component (`components/navigation`)

### Navigation & Routing
- [x] Created app routing configuration in `app.routes.ts`
- [x] Implemented navigation component with RouterLink
- [x] Updated main app component to use navigation and router-outlet
- [x] Styled navigation component with original nav-tabs styles

### Home Page Conversion
- [x] Converted `index.html` to Angular Home component
- [x] Implemented announcement carousel functionality
- [x] Added routing links to all tool buttons
- [x] Styled home page with original CSS (converted to SCSS)
- [x] Added RouterLink imports and functionality
- [x] Fixed asset paths for Angular project structure
- [x] Created placeholder pages for all other routes

### Build & Development Setup
- [x] Fixed build errors (asset path issues)
- [x] Verified successful Angular build
- [x] Started development server successfully on http://localhost:4200/
- [x] Confirmed navigation and routing works

## 🚧 Current Tasks

### ✅ COMPLETED - Phase 1: Foundation & Home Page
- [x] Home page implementation and testing
- [x] Build and development environment verification
- [x] Navigation and routing confirmation
- [x] Set up root-level development scripts
- [x] Fixed asset path configurations

### 🔧 Minor Issues to Resolve
- [ ] Test that images are now loading properly in browser
- [ ] Verify background image displays correctly

### Next Phase Ready
- [ ] Choose next page to convert (recommend Profile or Aaron's Jump Data as simplest)

## 📋 TODO Tasks

### High Priority - Page Component Conversions
- [ ] **Cargo Manifest Writer** - Convert `CargoManifestWriter.html`
  - [ ] Port HTML structure to Angular template
  - [ ] Convert JavaScript functionality to TypeScript
  - [ ] Implement data binding for form inputs
  - [ ] Convert table generation to Angular components
  - [ ] Handle modal functionality
  - [ ] Import and integrate JavaScript dependencies
- [ ] **Workorders Overview** - Convert `WorkordersOverview.html`
- [ ] **Profit Splitter** - Convert `ProfitSplitter.html`
- [ ] **Yield 2 Sell** - Convert `Yield2Sell.html`
- [ ] **Scavenger** - Convert `Scavenger.html`
- [ ] **Aaron's Jump Data** - Convert `AaronsJumpData.html`
- [ ] **Profile** - Convert `Profile.html`

### Medium Priority - Component Architecture
- [ ] Break down large page components into smaller, reusable components
- [ ] Create shared components for common UI elements:
  - [ ] Modal component
  - [ ] Table component
  - [ ] Form input components
  - [ ] Button components
- [ ] Implement services for:
  - [ ] Local storage management
  - [ ] Data sharing between components
  - [ ] Item pricing data
  - [ ] Export functionality

### Low Priority - Enhancements
- [ ] Add TypeScript interfaces for data models
- [ ] Implement proper error handling
- [ ] Add loading states
- [ ] Optimize asset loading
- [ ] Add unit tests
- [ ] Implement Progressive Web App features
- [ ] Add dark/light theme support

### Technical Debt
- [ ] Clean up TODO comments in components
- [ ] Standardize naming conventions
- [ ] Optimize CSS/SCSS organization
- [ ] Remove unused dependencies
- [ ] Add proper TypeScript typing

## 📝 Notes for Future Reference

### File Structure Decisions
- Pages are in `src/app/pages/` - each page represents a top-level route
- Shared components in `src/app/components/` 
- Assets copied to `src/assets/` maintaining original structure
- Original HTML files preserved at project root for reference

### Conversion Strategy
1. **Phase 1**: Create component shell and basic routing (✅ DONE)
2. **Phase 2**: Convert one page at a time, starting with simplest
3. **Phase 3**: Extract common functionality into services
4. **Phase 4**: Break down into smaller components
5. **Phase 5**: Add enhancements and polish

### Technical Notes
- Using Angular 18+ standalone components (no modules)
- RouterLink used instead of href for navigation
- Original JavaScript functionality needs conversion to TypeScript
- LocalStorage usage should be wrapped in services
- Asset paths: use `assets/filename.ext` in HTML, `/assets/filename.ext` in CSS
- **Development Commands** (from project root):
  - `npm run client` - Start Angular dev server only
  - `npm run client:build` - Build Angular app
  - `npm start` - Start backend server only
  - `npm run dev` - Start both backend and frontend concurrently
  - Angular project is in `client/space-trucker-tools/`

### Dependencies to Review
- `CargoManifestWriterItemPrices.js` - Item pricing data
- `itemColors.js` - Color theming for items
- `JumpData.js` - Jump data functionality
- `NavBar.js` - Navigation logic (replaced by Angular router)
- `scavengingColors.js` & `scavengingPrices.js` - Scavenger data
- `Yield2SellItemPrices.js` - Yield calculation data

### Potential Challenges
- Complex JavaScript interactions in Cargo Manifest Writer
- Local storage management across components
- Modal and iframe usage in some components
- Dynamic table generation and manipulation
- Export functionality (CSV, TXT, clipboard)

## 🎯 Next Steps
1. Test current home page implementation
2. Begin conversion of simplest page component (likely Profile or Aaron's Jump Data)
3. Establish patterns for JavaScript to TypeScript conversion
4. Create shared services for common functionality

---
*Last Updated: October 7, 2025*