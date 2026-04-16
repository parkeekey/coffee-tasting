# Coffee Tasting Lab

A personal coffee evaluation app that combines **sensory scoring** and **brewing analytics** in one workflow.

This project is built for practical daily use: log brews, score cups, track extraction metrics, and connect brewing decisions to taste outcomes.

## Why this project exists

Most coffee apps separate brewing logs from tasting notes. This project links both:

- Brew settings (dose, ratio, water in/out, pours, grinder, TDS)
- Sensory scoring (8 affective attributes)
- Descriptor systems (aroma, sweetness, acidity, intensity, mouthfeel, aftertaste, overall)

The goal is simple: make repeatable coffee that tastes better over time.

## Core workflows

### 1) Tasting mode
- Record coffee identity and context
- Score 8 sensory attributes (1–9)
- Add optional descriptor tags
- Capture TDS and extraction yield context

### 2) Brewing mode
- Full recipe block (method, temp, time, dose, ratio)
- Auto Water In from dose × ratio
- Measured Water Out + estimated fallback
- Pour planner with cumulative target percentages (0→100)
- Per-pour delta/cumulative grams, timing, flow rate, and action notes
- TDS entry, extraction yield estimate, and suggestion panel

### 3) Taste Pad mode
- Fast blind/field evaluation flow
- Quick tap-based score input
- Save as structured entry in the same log

## Extraction helpers

- EY formula: `EY% = (TDS% × liquid out) / dose`
- Ratio-aware TDS reference table for fast guidance
- Quick helper table for target EY/TDS exploration
- Suggestion guidance is intentionally non-binding (user can trust cup quality)

## Logging and analysis

- Unified log for tasting, brewing, and pad sessions
- Mode filtering and favorites
- Expandable brew card with pour table and TDS/EY
- Preference insights from saved entries

## Export support

- CSV export (including brew + descriptor fields)
- JSON export
- Plain text export

## Tech stack

- React + TypeScript + Vite
- Context-based app state with local storage persistence
- Tailwind/shadcn-style component system

## Local development

```bash
pnpm install
pnpm dev
```

Build:

```bash
pnpm build
```

## Project status

Active and evolving. Designed as a practical tasting + brewing operating system for continuous improvement.
