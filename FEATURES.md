# Feature Documentation (Short)

## Sensory system
- 8-attribute affective scoring (`Fragrance`, `Aroma`, `Acidity`, `Sweetness`, `Flavor`, `Mouthfeel`, `Aftertaste`, `Overall`)
- 1–9 per attribute, mapped to total score range
- Focus-flag support for key attributes during a session

## Descriptor modules
- Aroma tag selector
- Sweetness family + detail selector
- Acidity flavor selector with inferred acidity type grouping
- Intensity tags
- Mouthfeel taxonomy selector
- Aftertaste selector
- Overall profile selector

## Brewing recipe system
- Method, temp, total time
- Dose and ratio with Water In auto-calculation
- Measured Water Out entry with estimated helper
- Water recipe and grinder metadata

## Pour planner
- Cumulative target percentages (0→100)
- Per row:
  - target %
  - cumulative grams (Σ)
  - delta grams/pour (Δ)
  - time start/end
  - flow rate (G/s)
  - action note
- Progress status for used/remaining percentages

## TDS + extraction support
- TDS capture in tasting and brewing contexts
- Extraction Yield calculation helper
- Ratio-reference quick target helper table
- Suggestion-only advisory panel (`Under` / `Ideal` / `Over`)

## Logging
- Unified log cards with mode badges
- Brewing expansion includes recipe + pour table + TDS/EY
- Search, favorites, and mode filters

## Export
- CSV, JSON, and text output for entry history

## Persistence
- Local storage state persistence with migration defaults for new fields
