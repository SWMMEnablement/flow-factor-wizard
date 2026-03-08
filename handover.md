# Handover Document — InfoWorks ICM Peakable Flow Calculator

## Overview

This is a single-page web application that calculates **peakable (design) flows** for sanitary sewer systems using peaking factor formulas. It bridges the methodology gap between **InfoWorks ICM** and **InfoSewer** by approximating InfoSewer's steady-state peaking factor approach within an InfoWorks ICM context.

**Live URL:** https://flow-factor-wizard.lovable.app

---

## Purpose

Engineers using InfoWorks ICM often need to replicate InfoSewer's steady-state peaking factor methodology. This tool:

- Calculates Extreme Flow Factors (EFF) for given populations using standard formulas
- Computes design flows: `Q_design = EFF × Population × Q_per_capita`
- Provides a downloadable Ruby script that runs directly inside InfoWorks ICM to perform network-wide peakable flow analysis

---

## Tech Stack

| Layer        | Technology                          |
|-------------|--------------------------------------|
| Framework   | React 18 + TypeScript                |
| Build       | Vite                                 |
| Styling     | Tailwind CSS + shadcn/ui components  |
| Charts      | Recharts                             |
| Routing     | React Router DOM                     |
| State       | React useState (local, no backend)   |

No backend or database — the app is entirely client-side.

---

## Project Structure

```
src/
├── pages/
│   ├── Index.tsx           # Main page with tabbed layout
│   └── NotFound.tsx        # 404 page
├── components/
│   ├── HeroSection.tsx     # Hero banner with title and formula badges
│   ├── AboutSection.tsx    # Explanation of concepts (peaking factors, design flows, etc.)
│   ├── FormulaLibrary.tsx  # Detailed reference for all supported formulas
│   ├── DesignFlowCalculator.tsx  # Interactive calculator with inputs
│   ├── ResultsVisualization.tsx  # Charts, summary stats, results table, CSV export
│   ├── RubyScriptSection.tsx     # Ruby script viewer with copy/download
│   └── ui/                 # shadcn/ui component library
├── index.css               # Global styles and CSS custom properties
├── App.tsx                 # Router setup
└── main.tsx                # Entry point
```

---

## Application Tabs

### 1. About
Explains InfoWorks ICM, peaking factors, design flows, upstream network analysis, and the motivation for this tool.

### 2. Formulas
Reference library of supported peaking factor formulas (with LaTeX-style equations and use-case descriptions).

| Formula          | Equation                              | Use Case                  |
|-----------------|---------------------------------------|---------------------------|
| Harmon          | `EFF = 1 + 14 / √P`                  | Traditional US standard   |
| Modified Harmon | `EFF = 1 + 18 / (4 + √P)`            | Ten States Standards      |
| Babbitt         | `EFF = 5 / P^0.2`                     | Small communities         |
| Custom          | `EFF = c1 + (c2 + m1·P^e1) / (c3 + m2·P^e2)` | User-defined     |

Where **P** = population in thousands.

### 3. Calculator
Interactive form to compute peakable flows:
- **Inputs:** Formula selection, flow per capita (L/person/day), EFF cutoff, unit conversion toggle, comma-separated population values
- **Custom mode:** Exposes all 7 coefficients (c1, c2, c3, e1, e2, m1, m2)
- **Output:** Results passed to the Results tab via React state

### 4. Results
Visualizations and data from the last calculation:
- Summary cards: total flow, average EFF, EFF range, total population
- Line chart: EFF vs population (calculated and capped)
- Bar chart: design flow distribution
- Data table with CSV export

### 5. Ruby Script
A complete Ruby script (~760 lines) designed to run inside InfoWorks ICM's scripting environment. Features:
- Upstream network tracing and population aggregation
- Flow splitting at junctions
- EFF calculation using configurable formulas
- Dry-run mode for safe testing
- CSV file output and summary message box
- Copy-to-clipboard and `.rb` file download buttons

---

## Key Formulas

### General EFF Formula
```
EFF = c1 + (c2 + m1·P^e1) / (c3 + m2·P^e2)
```

### Design Flow
```
Q_design = EFF_capped × Population × Q_per_capita_per_second
```

Where:
- `Q_per_capita_per_second = Q_per_capita / 86400` (when converting from L/day to L/s)
- `EFF_capped = min(EFF, cutoff)`

---

## State Management

All state is local to the `Index` page component:
- `results: any[]` — Array of calculation results
- `calculationParams: any` — Parameters used in the last calculation

The `DesignFlowCalculator` component calls `onCalculate(results, params)` which updates state, making results available to `ResultsVisualization`.

---

## Styling & Theming

- Uses CSS custom properties defined in `src/index.css` for semantic color tokens (`--primary`, `--secondary`, `--accent`, etc.)
- Dark mode supported via `next-themes` and `.dark` class
- All colors use HSL format through Tailwind's CSS variable system
- shadcn/ui provides the base component library

---

## Deployment

- Hosted on Lovable's platform
- No environment variables or secrets required
- No backend dependencies — fully static SPA
- Build: `npm run build` (Vite)

---

## Future Enhancement Ideas

- Persist calculation history (localStorage or database)
- Compare multiple formulas side-by-side on the same chart
- Import population data from CSV
- Add more peaking factor formulas (e.g., Federov, Gifft)
- Generate PDF reports from results
- Add unit system toggle (metric/imperial)
