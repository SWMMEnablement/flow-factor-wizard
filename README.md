# Flow Factor Wizard

> _README added by Robert Dickinson via Comet._

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn--ui-000000?logo=shadcnui&logoColor=white)

## About

**Flow Factor Wizard** is an interactive design-flow and peaking-factor calculator for sewer/wastewater modeling. It computes design (peakable) flows from population data, lets users compare multiple peaking-factor formulas, supports CSV population import, visualizes results, and can generate matching InfoWorks ICM Ruby scripts.

It is part of the SWMMEnablement collection and is built on a modern Vite + React + TypeScript frontend styled with Tailwind CSS and shadcn/ui.

## What's Inside

| Area | Description |
| --- | --- |
| `src/components/DesignFlowCalculator.tsx` | Population-based design / peakable flow calculator (CSV import) |
| `src/components/FormulaLibrary.tsx` | Library of peaking-factor formulas (incl. InfoWorks ICM) |
| `src/components/FormulaComparison.tsx` | Side-by-side formula comparison |
| `src/components/ResultsVisualization.tsx` | Charts and visualization of results |
| `src/components/RubyScriptSection.tsx` | Generates ICM Ruby scripts from inputs |
| `src/components/AboutSection.tsx`, `HeroSection.tsx` | Landing and about content |
| `src/components/ui/` | shadcn/ui reusable UI primitives |
| `src/hooks/`, `src/lib/` | Custom React hooks and utilities |
| `public/` | Static assets |

## Tech Stack

| Layer | Technology |
| --- | --- |
| Language | TypeScript |
| Framework | React |
| Build tool | Vite |
| Styling | Tailwind CSS |
| UI components | shadcn/ui |

## Getting Started

```bash
# Clone the repository
git clone https://github.com/SWMMEnablement/flow-factor-wizard.git
cd flow-factor-wizard

# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open the local URL printed by Vite (typically http://localhost:5173) in your browser.

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

## License

No license file is currently included. Contact the SWMMEnablement organization regarding reuse.
