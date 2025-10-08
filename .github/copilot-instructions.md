# GitHub Copilot Instructions - Space Trucker Tools

## Project Overview

Converting a plain HTML/JS/CSS Star Citizen cargo tracking application to Angular. Currently in Phase 1: Foundation complete, moving to Phase 2: Page conversions.

## Workspace Structure

```
/SpaceTruckerTools/
├── package.json                    # Root package with dev scripts
├── server.js                       # Express backend
├── *.html                          # Original HTML files (reference only)
├── backend/                        # Backend API
├── client/space-trucker-tools/     # Angular 18+ application
│   ├── package.json               # Angular package
│   ├── angular.json               # Angular config
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/             # Page components (one per original HTML)
│   │   │   ├── components/        # Shared components
│   │   │   └── app.routes.ts      # Routing configuration
│   │   └── assets/                # Images, CSS, JS from original
└── TODO.md                        # Project tracking
```

## Development Commands (from project root)

- `npm run client` - Start Angular dev server (http://localhost:4200)
- `npm run client:build` - Build Angular app
- `npm start` - Start Express backend only
- `npm run dev` - Start both backend and frontend
- `npm run client:install` - Install Angular dependencies

## Current Status

✅ **COMPLETED**: Angular foundation, navigation, home page conversion, asset loading
🚧 **NEXT**: Convert individual page components (Profile or Aaron's Jump Data recommended)

## Technical Patterns

- **Components**: Angular 18+ standalone components (no modules)
- **Routing**: RouterLink instead of href
- **Assets**: `assets/file.ext` in HTML, `/assets/file.ext` in CSS
- **Styling**: Convert CSS to SCSS, component-scoped when possible
- **JavaScript**: Convert to TypeScript in component methods
- **Data**: Will need services for localStorage, item pricing data

## Conversion Strategy

1. Copy HTML structure to component template
2. Convert CSS to component SCSS
3. Convert JavaScript to TypeScript component methods
4. Implement data binding and Angular patterns
5. Extract reusable components as needed

## Key Files to Reference

- Original HTML files in root (for conversion reference)
- `assets/js/` - Original JavaScript data and functions
- `TODO.md` - Detailed project status and next steps
