// =============================================================
// Coffee Affective Tasting — Data Types & Storage
// Affective (personal preference) scoring system
// Each attribute rated 1-9 based on personal likeability
// All 1s = 55 (dislike), all 9s = 100 (extraordinary/love it)
// Formula: score = 55 + (sum - 8) / 64 * 45
// =============================================================

export type ProcessMethod = 
  | 'Washed' | 'Natural' | 'Honey' | 'Anaerobic' | 'Wet-Hulled' 
  | 'Semi-Washed' | 'Carbonic Maceration' | 'Other';

export type RoastLevel = 
  | 'Light' | 'Light-Medium' | 'Medium' | 'Medium-Dark' | 'Dark';

export type Altitude = 
  | '<1000m' | '1000-1200m' | '1200-1500m' | '1500-1800m' | '>1800m';

export interface TastingScores {
  fragrance: number;   // 🌸
  aroma: number;       // 👃
  acidity: number;     // 🍋
  sweetness: number;   // 🍬
  flavor: number;      // 👅
  mouthfeel: number;   // ☕
  aftertaste: number;  // ✨
  overall: number;     // 🌟
}

export type SensoryNotes = Record<keyof TastingScores, string>;
export type SensoryReaction = 'like' | 'soso' | 'dislike' | '';
export type SensoryReactions = Record<keyof TastingScores, SensoryReaction>;

export type EntryMode = 'tasting' | 'brewing' | 'pad';

export interface BrewPour {
  id: number;
  percent: number;     // cumulative target % of total water (0→100)
  timeStart: string;   // e.g. "0:00"
  timeEnd: string;     // e.g. "0:30"
  flowRate: string;    // G/s observation note
  action?: string;     // action note (e.g. swirl, stir, wait)
}

export interface CoffeeEntry {
  id: string;
  sampleIndex: string;       // e.g. "S-01"
  entryMode: EntryMode;
  isBlindMode: boolean;
  name: string;
  origin: string;
  process: ProcessMethod | string;
  altitude: Altitude | string;
  roastLevel: RoastLevel | string;
  roaster: string;
  // Brew recipe
  brewMethod: string;
  brewDose: string;          // coffee dose in grams
  brewRatio: string;         // e.g. "1:15"
  brewWaterIn: string;       // auto-calc: dose × ratio multiplier
  brewYield: string;         // water out / actual yield
  brewTemp: string;
  brewTime: string;          // total brew time
  brewTDS: string;           // TDS measurement result
  brewWater: string;         // water recipe / TDS water used
  brewGrinder: string;       // grinder name
  brewGrindLevel: string;    // grind level description
  brewGrindClicks: string;   // clicks
  brewGrindMicrons: string;  // µm
  brewGrindSize: string;     // additional grind note
  brewPours: BrewPour[];     // pour planner rows
  brewRecipeNotes: string;
  // After-brewing adjustments
  brewAdjRatio: string;      // e.g. "14.2" — adjusted ratio after brewing (number)
  brewAdjGrindsize: string;  // e.g. "420" — adjusted grind size in µm (number only)
  brewAdjTemp: string;       // e.g. "94" — adjusted temperature in °C (number only)
  brewAdjTurbulance: string; // e.g. "Gentle" — adjusted turbulance level (text)
  // Tasting mode EY inputs
  tastingLiquidMl: string;   // brewed coffee volume (ml) for EY calc in tasting mode
  tastingDose: string;       // dose (g) for EY calc in tasting mode
  notes: string;             // flavor notes / descriptors
  scores: TastingScores;
  sensoryNotes: SensoryNotes; // optional note per sensory attribute
  sensoryReactions: SensoryReactions; // optional like/soso/dislike per sensory attribute
  totalScore: number;
  isFavorite: boolean;
  focusedAttributes: (keyof TastingScores)[];  // e.g. ['acidity', 'mouthfeel']
  aromaDescriptors: string[];  // selected optional aroma standard tags
  sweetnessDescriptors: string[];  // selected sweetness family tags
  sweetnessDetailDescriptors: string[];  // selected optional sweetness detail tags
  acidityDescriptors: string[];  // selected acid types (e.g. ['Citric', 'Malic'])
  acidityTypeDescriptors: string[];  // auto inferred acid types from selected acidity flavors
  intensityDescriptors: string[];  // selected intensity descriptors (e.g. ['💫 Bright', '🌫️ Flat'])
  mouthfeelDescriptors: string[];  // selected mouthfeel descriptors
  aftertasteDescriptors: string[];  // selected aftertaste length descriptors
  overallDescriptors: string[];  // selected overall profile descriptors
  createdAt: string;         // ISO date string
  updatedAt: string;
}

export const SCORE_ATTRIBUTES: Array<{
  key: keyof TastingScores;
  emoji: string;
  label: string;
  description: string;
}> = [
  { key: 'fragrance', emoji: '🌸', label: 'Fragrance', description: 'How much I like the aroma' },
  { key: 'aroma',     emoji: '👃', label: 'Aroma',     description: 'My preference for the brewed aroma' },
  { key: 'acidity',   emoji: '🍋', label: 'Acidity',   description: 'How much I enjoy the brightness' },
  { key: 'sweetness', emoji: '🍬', label: 'Sweetness', description: 'My liking of sweetness' },
  { key: 'flavor',    emoji: '👅', label: 'Flavor',    description: 'How much I like the taste' },
  { key: 'mouthfeel', emoji: '☕', label: 'Mouthfeel', description: 'My preference for body & texture' },
  { key: 'aftertaste',emoji: '✨', label: 'Aftertaste', description: 'How much I enjoy the finish' },
  { key: 'overall',   emoji: '🌟', label: 'Overall',   description: 'My overall liking' },
];

export const PROCESS_OPTIONS: ProcessMethod[] = [
  'Washed', 'Natural', 'Honey', 'Anaerobic', 
  'Wet-Hulled', 'Semi-Washed', 'Carbonic Maceration', 'Other'
];

export const ROAST_OPTIONS: RoastLevel[] = [
  'Light', 'Light-Medium', 'Medium', 'Medium-Dark', 'Dark'
];

export const ALTITUDE_OPTIONS: Altitude[] = [
  '<1000m', '1000-1200m', '1200-1500m', '1500-1800m', '>1800m'
];

// Aroma Descriptors — isolated optional standard tags (11)
export const AROMA_DESCRIPTORS = [
  '🌸 Floral',
  '🍏 Fruity',
  '🍓 Berry',
  '🍑 Dried Fruit',
  '🍋 Citrus Fruit',
  '🍋 Sour',
  '🍷 Fermented',
  '🥜 Nutty',
  '🍫 Cocoa',
  '🍯 Sweet',
  '🍦 Vanilla',
] as const;

// Acidity Descriptors — acid-type-first taxonomy with flavor tags under each type
export const ACIDITY_DESCRIPTORS = {
  '🍋 Citric Acid': ['Lemon', 'Lime', 'Orange', 'Grapefruit', 'Tropical', 'Tangy', 'Tart'],
  '🍏 Malic Acid': ['Apple', 'Pear', 'Green', 'Blueberry', 'Strawberry', 'Raspberry'],
  '🍇 Tartaric Acid': ['Grape', 'Raisin', 'Fig', 'Prune', 'Wine-like'],
  '💧 Phosphoric Acid': ['Bright', 'Clean', 'Mineral', 'Crisp', 'Cola'],
  '☕ Quinic Acid': ['Bitter', 'Dry', 'Astringent', 'Roasty', 'Woody'],
} as const;

export type AcidityTypeGroup = keyof typeof ACIDITY_DESCRIPTORS;
/** @deprecated use AcidityTypeGroup */
export type AcidityFlavorFamily = AcidityTypeGroup;

/** Infer which acid types are active based on selected flavor descriptors */
export function inferAcidityTypes(descriptors: string[]): string[] {
  if (descriptors.length === 0) return [];
  const activeTypes = new Set<string>();
  for (const [acidType, flavors] of Object.entries(ACIDITY_DESCRIPTORS)) {
    if ((flavors as readonly string[]).some((f) => descriptors.includes(f))) {
      activeTypes.add(acidType);
    }
  }
  return Array.from(activeTypes);
}

// Intensity Descriptors — optional tags for intensity attribute
export const INTENSITY_DESCRIPTORS = {
  'low': ['🌫️ Flat', '🎀 Soft'],
  'medium': ['🍯 Mellow', '🌶️ Tangy'],
  'high': ['💫 Bright', '✨ Crisp', '🔪 Sharp'],
} as const;

export type IntensityLevel = keyof typeof INTENSITY_DESCRIPTORS;

// Mouthfeel Descriptors — optional tags for mouthfeel attribute
export const MOUTHFEEL_DESCRIPTORS = {
  Body: {
    Weight: ['💧Light Body', '⚖️Medium Body', '🪨Heavy Body', '🧱Full Body'],
    Viscosity: ['💦 Watery', '🎀 Thin', '🧃 Juicy', '🌊 Thick', '🧴 Sticky', '🛡️ Coating'],
  },
  Texture: {
    Smooth: ['🧵 Velvetty', '🥛 Creamy', '⭕ Round', '🍯 Syrupy', '🛢️ Oily', '✨ Silky'],
    Rought: ['🪵 Coarsed', '⚠️ Harsh', '🧱 Hard'],
    Particle: ['🌫️ Powdery', '🌾 Grainy', '🪨 Gritty'],
  },
} as const;

export type MouthfeelPrimaryType = keyof typeof MOUTHFEEL_DESCRIPTORS;
export type MouthfeelSubtype<T extends MouthfeelPrimaryType = MouthfeelPrimaryType> = keyof typeof MOUTHFEEL_DESCRIPTORS[T];

// Aftertaste Descriptors — optional tags for aftertaste attribute
export const AFTERTASTE_DESCRIPTORS = {
  Length: {
    Short: ['Quick Aftertaste'],
    Med: ['Medium Aftertaste'],
    Long: ['♾️ Persistent', '🌀 Lingering'],
  },
} as const;

export type AftertasteType = keyof typeof AFTERTASTE_DESCRIPTORS;
export type AftertasteSubtype<T extends AftertasteType = AftertasteType> = keyof typeof AFTERTASTE_DESCRIPTORS[T];

// Overall Descriptors — optional tags for overall attribute
export const OVERALL_DESCRIPTORS = {
  Balance: {
    Profile: ['⚖️ Balanced', '🧩 Disjointed (Unbalance)', '🔗 Intergrated (Balance)'],
  },
  Clarity: {
    Cup: ['🌫️ Dirty (Murky)', '✨ Clean (Clear)'],
  },
  Complexity: {
    Profile: ['🌈 Rich (High Complex)', '▫️ Poor (Low Complex)'],
  },
  'Bad Taste': {
    Astrigent: ['🌵 Tingy', '😮‍💨 Puckering'],
    Drying: ['🍂 Parching', '🌾 Grassy'],
  },
} as const;

export type OverallType = keyof typeof OVERALL_DESCRIPTORS;
export type OverallSubtype<T extends OverallType = OverallType> = keyof typeof OVERALL_DESCRIPTORS[T];

// Sweetness Descriptors — quick family tags + optional detail tags
export const SWEETNESS_DESCRIPTORS = {
  '🥜 Nutty': ['Almond', 'Hazelnut', 'Walnut'],
  '🍫 Cocoa': ['Chocolate', 'Dark Chocolate', 'Cocoa Powder'],
  '🍯 Sweet': ['Honey', 'Syrup', 'Sugar-like'],
  '🍦 Vanilla': ['Creamy', 'Soft Vanilla Notes'],
  '🍬 Brown Sugar': ['Caramel', 'Molasses', 'Toffee'],
  '🌿 Spice': ['Cinnamon', 'Clove', 'Nutmeg', 'Pepper'],
} as const;

export type SweetnessFamily = keyof typeof SWEETNESS_DESCRIPTORS;

/** Calculate total score from 8 attributes (all 1s = 55, all 9s = 100) */
export function calculateTotalScore(scores: TastingScores): number {
  const sum = Object.values(scores).reduce((a, b) => a + b, 0);
  const minSum = 8;   // all 1s
  const maxSum = 72;  // all 9s
  const minScore = 55;
  const maxScore = 100;
  const total = minScore + ((sum - minSum) / (maxSum - minSum)) * (maxScore - minScore);
  return Math.round(total * 10) / 10;
}

/** Get color class based on score */
export function getScoreColor(score: number): string {
  if (score < 70) return 'score-low';
  if (score < 80) return 'score-mid';
  if (score < 90) return 'score-good';
  return 'score-great';
}

/** Get score label */
export function getAttributeLabel(score: number): { label: string; color: string } {
  if (score <= 3) return { label: 'Low',  color: '#c0392b' };
  if (score <= 6) return { label: 'Med',  color: '#d4860a' };
  return              { label: 'High', color: '#4a7c59' };
}

/** Get score label */
export function getScoreLabel(score: number): string {
  if (score < 70) return 'Below Specialty';
  if (score < 75) return 'Specialty';
  if (score < 80) return 'Very Good';
  if (score < 85) return 'Excellent';
  if (score < 90) return 'Outstanding';
  return 'Extraordinary';
}

/** Get hex color for score arc */
export function getScoreHex(score: number): string {
  if (score < 70) return '#c0392b';
  if (score < 75) return '#e67e22';
  if (score < 80) return '#d4860a';
  if (score < 85) return '#7a9e7e';
  if (score < 90) return '#4a7c59';
  return '#2d6a4f';
}

type RatioReferenceRow = {
  under: number;
  ey18: number;
  ey19: number;
  ey20: number;
  ey21: number;
  over22: number;
  over23: number;
  over24: number;
  exceed: number;
};

const RATIO_TDS_REFERENCE: Record<number, RatioReferenceRow> = {
  13: { under: 1.56, ey18: 1.57, ey19: 1.65, ey20: 1.73, ey21: 1.80, over22: 1.87, over23: 1.94, over24: 2.01, exceed: 2.08 },
  14: { under: 1.45, ey18: 1.46, ey19: 1.53, ey20: 1.60, ey21: 1.68, over22: 1.75, over23: 1.83, over24: 1.90, exceed: 1.98 },
  15: { under: 1.35, ey18: 1.36, ey19: 1.40, ey20: 1.48, ey21: 1.55, over22: 1.65, over23: 1.70, over24: 1.77, exceed: 1.85 },
  16: { under: 1.24, ey18: 1.25, ey19: 1.31, ey20: 1.36, ey21: 1.45, over22: 1.46, over23: 1.60, over24: 1.68, exceed: 1.76 },
  17: { under: 1.15, ey18: 1.16, ey19: 1.22, ey20: 1.28, ey21: 1.35, over22: 1.40, over23: 1.50, over24: 1.58, exceed: 1.65 },
  18: { under: 1.05, ey18: 1.15, ey19: 1.20, ey20: 1.25, ey21: 1.30, over22: 1.37, over23: 1.44, over24: 1.50, exceed: 1.56 },
  19: { under: 1.02, ey18: 1.03, ey19: 1.07, ey20: 1.14, ey21: 1.18, over22: 1.23, over23: 1.33, over24: 1.40, exceed: 1.48 },
  20: { under: 0.96, ey18: 0.97, ey19: 1.02, ey20: 1.07, ey21: 1.13, over22: 1.17, over23: 1.28, over24: 1.35, exceed: 1.43 },
  21: { under: 0.91, ey18: 0.92, ey19: 0.97, ey20: 1.02, ey21: 1.08, over22: 1.12, over23: 1.23, over24: 1.31, exceed: 1.38 },
  22: { under: 0.87, ey18: 0.88, ey19: 0.93, ey20: 0.98, ey21: 1.03, over22: 1.07, over23: 1.17, over24: 1.25, exceed: 1.32 },
  23: { under: 0.84, ey18: 0.85, ey19: 0.89, ey20: 0.94, ey21: 0.99, over22: 1.03, over23: 1.12, over24: 1.19, exceed: 1.26 },
  24: { under: 0.81, ey18: 0.82, ey19: 0.86, ey20: 0.91, ey21: 0.96, over22: 1.00, over23: 1.09, over24: 1.16, exceed: 1.23 },
};

export type ExtractionTier = 'under' | 'ideal' | 'over' | 'fail';

export type ExtractionClassification = {
  source: 'ey' | 'ratio-reference';
  label: string;
  tier: ExtractionTier;
};

export function parseReferenceRatio(ratioText: string): number | null {
  const raw = (ratioText ?? '').trim();
  if (!raw) return null;

  let parsed = Number.NaN;
  if (raw.includes(':')) {
    parsed = parseFloat(raw.split(':').pop() ?? '');
  } else if (raw.includes('/')) {
    parsed = parseFloat(raw.split('/').pop() ?? '');
  } else {
    parsed = parseFloat(raw);
  }

  if (!Number.isFinite(parsed)) return null;

  const rounded = Math.round(parsed);
  return rounded in RATIO_TDS_REFERENCE ? rounded : null;
}

export function parseRatioDenominator(ratioText: string): number | null {
  const raw = (ratioText ?? '').trim();
  if (!raw) return null;

  let parsed = Number.NaN;
  if (raw.includes(':')) {
    parsed = parseFloat(raw.split(':').pop() ?? '');
  } else if (raw.includes('/')) {
    parsed = parseFloat(raw.split('/').pop() ?? '');
  } else {
    parsed = parseFloat(raw);
  }

  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export function estimateWaterOut(dose: number, ratioText: string): number | null {
  const ratio = parseRatioDenominator(ratioText);
  if (!Number.isFinite(dose) || dose <= 0 || ratio === null) return null;
  // Estimation rule from workflow: waterOut = dose * ratio - dose * 2
  const estimated = (dose * ratio) - (dose * 2);
  return estimated > 0 ? estimated : null;
}

export function calculateExtractionYieldPercent(tdsPercent: number, liquidOut: number, dose: number): number | null {
  if (!Number.isFinite(tdsPercent) || !Number.isFinite(liquidOut) || !Number.isFinite(dose)) return null;
  if (liquidOut <= 0 || dose <= 0) return null;
  return (tdsPercent * liquidOut) / dose;
}

export function estimateExtractionYieldFromRatioReference(ratioText: string, tdsPercent: number): number | null {
  const ratio = parseReferenceRatio(ratioText);
  if (ratio === null || !Number.isFinite(tdsPercent)) return null;

  const row = RATIO_TDS_REFERENCE[ratio];
  const points: Array<{ tds: number; ey: number }> = [
    { tds: row.under, ey: 18 },
    { tds: row.ey18, ey: 19 },
    { tds: row.ey19, ey: 20 },
    { tds: row.ey20, ey: 21 },
    { tds: row.ey21, ey: 22 },
    { tds: row.over22, ey: 23 },
    { tds: row.over23, ey: 24 },
    { tds: row.over24, ey: 25 },
    { tds: row.exceed, ey: 26 },
  ];

  const interpolate = (
    currentTds: number,
    lowTds: number,
    lowEy: number,
    highTds: number,
    highEy: number,
  ) => {
    if (highTds <= lowTds) return highEy;
    const ratioValue = (currentTds - lowTds) / (highTds - lowTds);
    return lowEy + (ratioValue * (highEy - lowEy));
  };

  if (tdsPercent < points[0].tds) return null;

  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    if (tdsPercent <= curr.tds) {
      return interpolate(tdsPercent, prev.tds, prev.ey, curr.tds, curr.ey);
    }
  }

  return null;
}

export function estimateExtractionYieldFromQuickGuide(ratioText: string, tdsPercent: number): number | null {
  if (!Number.isFinite(tdsPercent) || tdsPercent <= 0) return null;
  const ratio = parseRatioDenominator(ratioText);
  if (ratio === null || ratio <= 2) return null;
  // Quick guide inverse: TDS ≈ EY / (ratio - 2)  =>  EY ≈ TDS * (ratio - 2)
  return tdsPercent * (ratio - 2);
}

export function getQuickGuideTdsTarget(ratioText: string, eyPercent: number): number | null {
  if (!Number.isFinite(eyPercent) || eyPercent <= 0) return null;

  const refRatio = parseReferenceRatio(ratioText);
  if (refRatio !== null && Number.isInteger(eyPercent)) {
    const row = RATIO_TDS_REFERENCE[refRatio];
    if (eyPercent === 18) return row.under;
    if (eyPercent === 19) return row.ey18;
    if (eyPercent === 20) return row.ey19;
    if (eyPercent === 21) return row.ey20;
    if (eyPercent === 22) return row.ey21;
  }

  const ratio = parseRatioDenominator(ratioText);
  if (ratio === null || ratio <= 2) return null;
  // From EY = TDS * (waterOut/dose), and waterOut≈dose*(ratio-2): TDS≈EY/(ratio-2)
  return eyPercent / (ratio - 2);
}

export function classifyExtractionYield(eyPercent: number): ExtractionClassification {
  if (eyPercent < 18) {
    return { source: 'ey', label: 'Under-extracted', tier: 'under' };
  }
  if (eyPercent > 22) {
    return { source: 'ey', label: 'Over-extracted', tier: 'over' };
  }
  return { source: 'ey', label: 'Ideal', tier: 'ideal' };
}

export function classifyTdsByRatioReference(ratioText: string, tdsPercent: number): ExtractionClassification | null {
  const ratio = parseReferenceRatio(ratioText);
  if (ratio === null || !Number.isFinite(tdsPercent)) return null;

  const row = RATIO_TDS_REFERENCE[ratio];
  if (tdsPercent < row.ey18) return { source: 'ratio-reference', label: 'Under (<18%)', tier: 'under' };
  if (tdsPercent < row.ey19) return { source: 'ratio-reference', label: '18–19%', tier: 'ideal' };
  if (tdsPercent < row.ey20) return { source: 'ratio-reference', label: '19–20%', tier: 'ideal' };
  if (tdsPercent < row.ey21) return { source: 'ratio-reference', label: '20–21%', tier: 'ideal' };
  if (tdsPercent < row.over22) return { source: 'ratio-reference', label: '21–22%', tier: 'ideal' };
  if (tdsPercent < row.over23) return { source: 'ratio-reference', label: 'Over 22–23% EX', tier: 'over' };
  if (tdsPercent < row.over24) return { source: 'ratio-reference', label: 'Over 23–24% EX', tier: 'over' };
  if (tdsPercent < row.exceed) return { source: 'ratio-reference', label: 'Over 24–25% EX', tier: 'over' };
  return { source: 'ratio-reference', label: 'EXCEED - auto failed', tier: 'fail' };
}

export type TdsStrengthZone = 'weak' | 'ideal' | 'strong' | 'out-of-range';

export type RatioAwareStrengthZone = 'weak' | 'ideal-zone' | 'strong' | 'out-of-range';

export type CombinedExtractionReport = {
  strengthZone: RatioAwareStrengthZone;
  extractionTier: ExtractionTier;
  label: string;
};

export function classifyTdsByStrengthZone(tdsPercent: number): TdsStrengthZone {
  if (tdsPercent >= 0.90 && tdsPercent < 1.15) return 'weak';
  if (tdsPercent >= 1.15 && tdsPercent <= 1.45) return 'ideal';
  if (tdsPercent > 1.45 && tdsPercent <= 1.80) return 'strong';
  return 'out-of-range';
}

export function classifyTdsByRatioStrengthZone(ratioText: string, tdsPercent: number): RatioAwareStrengthZone {
  const ratio = parseReferenceRatio(ratioText);
  if (ratio === null || !Number.isFinite(tdsPercent)) {
    const fallback = classifyTdsByStrengthZone(tdsPercent);
    if (fallback === 'ideal') return 'ideal-zone';
    return fallback;
  }

  const row = RATIO_TDS_REFERENCE[ratio];
  if (!row) return 'out-of-range';

  // Ratio-aware strength: center around SCA ideal window for this ratio.
  // weak   : below ideal window start
  // ideal  : in 20-22% reference window
  // strong : above ideal window end
  if (tdsPercent < row.ey20) return 'weak';
  if (tdsPercent > row.over22) return 'strong';
  return 'ideal-zone';
}

export function classifyCombinedExtractionReport(
  ratioText: string,
  tdsPercent: number,
  extractionTier: ExtractionTier,
): CombinedExtractionReport {
  const strengthZone = classifyTdsByRatioStrengthZone(ratioText, tdsPercent);

  if (extractionTier === 'fail') {
    return { strengthZone, extractionTier, label: 'Out of range' };
  }

  if (extractionTier === 'under') {
    if (strengthZone === 'weak') return { strengthZone, extractionTier, label: 'Weak & Under' };
    if (strengthZone === 'strong') return { strengthZone, extractionTier, label: 'Strong & Under' };
    return { strengthZone, extractionTier, label: 'Under' };
  }

  if (extractionTier === 'over') {
    if (strengthZone === 'weak') return { strengthZone, extractionTier, label: 'Weak & Over' };
    if (strengthZone === 'strong') return { strengthZone, extractionTier, label: 'Strong & Over' };
    return { strengthZone, extractionTier, label: 'Over' };
  }

  // ideal
  if (strengthZone === 'weak') return { strengthZone, extractionTier, label: 'Weak' };
  if (strengthZone === 'strong') return { strengthZone, extractionTier, label: 'Strong' };
  return { strengthZone, extractionTier, label: 'SCA Ideal' };
}

export function getRatioReferenceIdealWindow(ratioText: string): { ratio: number; min: number; max: number } | null {
  const ratio = parseReferenceRatio(ratioText);
  if (ratio === null) return null;
  const row = RATIO_TDS_REFERENCE[ratio];
  return { ratio, min: row.ey20, max: row.over22 };
}

const STORAGE_KEY = 'coffee-tasting-entries';

export function loadEntries(): CoffeeEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<CoffeeEntry>[];
    return parsed.map((entry) => {
      const normalizeMouthfeelDescriptor = (value: string): string => {
        const v = value.trim().toLowerCase();
        if (v === '💧 light' || v === 'light') return 'Light Body';
        if (v === '⚖️ medium' || v === 'medium' || v === 'body-weight-medium' || v === 'body weight medium') {
          return 'Medium Body';
        }
        if (v === '🪨 heavy' || v === 'heavy') return 'Heavy Body';
        if (v === '🧱 full' || v === 'full') return 'Full Body';
        return value;
      };

      const normalizeAftertasteDescriptor = (value: string): string => {
        const v = value.trim().toLowerCase();
        if (v === '⚖️ med' || v === 'med' || v === 'medium') return 'Medium Aftertaste';
        if (v === '⚡ quick' || v === 'quick') return 'Quick Aftertaste';
        return value;
      };

      return {
      ...entry,
      entryMode: entry.entryMode ?? ((entry.notes ?? '').includes('[TastePad]') ? 'pad' : 'tasting'),
      isBlindMode: entry.isBlindMode ?? (entry.notes ?? '').includes('[Blind Mode]'),
      focusedAttributes: entry.focusedAttributes ?? [],
      brewMethod: entry.brewMethod ?? '',
      brewDose: entry.brewDose ?? '',
      brewRatio: entry.brewRatio ?? '',
      brewWaterIn: entry.brewWaterIn ?? '',
      brewYield: entry.brewYield ?? '',
      brewTemp: entry.brewTemp ?? '',
      brewTime: entry.brewTime ?? '',
      brewTDS: entry.brewTDS ?? '',
      brewWater: entry.brewWater ?? '',
      brewGrinder: entry.brewGrinder ?? '',
      brewGrindLevel: entry.brewGrindLevel ?? '',
      brewGrindClicks: entry.brewGrindClicks ?? '',
      brewGrindMicrons: entry.brewGrindMicrons ?? '',
      brewGrindSize: entry.brewGrindSize ?? '',
      brewPours: entry.brewPours ?? [],
      brewRecipeNotes: entry.brewRecipeNotes ?? '',
      brewAdjRatio: entry.brewAdjRatio ?? '',
      brewAdjGrindsize: entry.brewAdjGrindsize ?? '',
      brewAdjTemp: entry.brewAdjTemp ?? '',
      brewAdjTurbulance: entry.brewAdjTurbulance ?? '',
      tastingLiquidMl: entry.tastingLiquidMl ?? '',
      tastingDose: entry.tastingDose ?? '',
      sensoryNotes: {
        fragrance: entry.sensoryNotes?.fragrance ?? '',
        aroma: entry.sensoryNotes?.aroma ?? '',
        acidity: entry.sensoryNotes?.acidity ?? '',
        sweetness: entry.sensoryNotes?.sweetness ?? '',
        flavor: entry.sensoryNotes?.flavor ?? '',
        mouthfeel: entry.sensoryNotes?.mouthfeel ?? '',
        aftertaste: entry.sensoryNotes?.aftertaste ?? '',
        overall: entry.sensoryNotes?.overall ?? '',
      },
      sensoryReactions: {
        fragrance: entry.sensoryReactions?.fragrance ?? '',
        aroma: entry.sensoryReactions?.aroma ?? '',
        acidity: entry.sensoryReactions?.acidity ?? '',
        sweetness: entry.sensoryReactions?.sweetness ?? '',
        flavor: entry.sensoryReactions?.flavor ?? '',
        mouthfeel: entry.sensoryReactions?.mouthfeel ?? '',
        aftertaste: entry.sensoryReactions?.aftertaste ?? '',
        overall: entry.sensoryReactions?.overall ?? '',
      },
      aromaDescriptors: entry.aromaDescriptors ?? [],
      sweetnessDescriptors: entry.sweetnessDescriptors ?? [],
      sweetnessDetailDescriptors: entry.sweetnessDetailDescriptors ?? [],
      acidityDescriptors: entry.acidityDescriptors ?? [],
      acidityTypeDescriptors: entry.acidityTypeDescriptors ?? inferAcidityTypes(entry.acidityDescriptors ?? []),
      intensityDescriptors: entry.intensityDescriptors ?? [],
      mouthfeelDescriptors: (entry.mouthfeelDescriptors ?? []).map(normalizeMouthfeelDescriptor),
      aftertasteDescriptors: (entry.aftertasteDescriptors ?? []).map(normalizeAftertasteDescriptor),
      overallDescriptors: entry.overallDescriptors ?? [],
    };
    }) as CoffeeEntry[];
  } catch {
    return [];
  }
}

export function saveEntries(entries: CoffeeEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function createEmptyEntry(sampleIndex: number): CoffeeEntry {
  const now = new Date().toISOString();
  const defaultScores: TastingScores = {
    fragrance: 5, aroma: 5, acidity: 5, sweetness: 5,
    flavor: 5, mouthfeel: 5, aftertaste: 5, overall: 5,
  };
  const defaultSensoryNotes: SensoryNotes = {
    fragrance: '',
    aroma: '',
    acidity: '',
    sweetness: '',
    flavor: '',
    mouthfeel: '',
    aftertaste: '',
    overall: '',
  };
  const defaultSensoryReactions: SensoryReactions = {
    fragrance: '',
    aroma: '',
    acidity: '',
    sweetness: '',
    flavor: '',
    mouthfeel: '',
    aftertaste: '',
    overall: '',
  };
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sampleIndex: `S-${String(sampleIndex).padStart(2, '0')}`,
    entryMode: 'tasting',
    isBlindMode: false,
    name: '',
    origin: '',
    process: 'Washed',
    altitude: '1200-1500m',
    roastLevel: 'Medium',
    roaster: '',
    brewMethod: '',
    brewDose: '',
    brewRatio: '',
    brewWaterIn: '',
    brewYield: '',
    brewTemp: '',
    brewTime: '',
    brewTDS: '',
    brewWater: '',
    brewGrinder: '',
    brewGrindLevel: '',
    brewGrindClicks: '',
    brewGrindMicrons: '',
    brewGrindSize: '',
    brewPours: [],
    brewRecipeNotes: '',
    brewAdjRatio: '',
    brewAdjGrindsize: '',
    brewAdjTemp: '',
    brewAdjTurbulance: '',
    tastingLiquidMl: '',
    tastingDose: '',
    notes: '',
    scores: defaultScores,
    sensoryNotes: defaultSensoryNotes,
    sensoryReactions: defaultSensoryReactions,
    totalScore: calculateTotalScore(defaultScores),
    isFavorite: false,
    focusedAttributes: [],
    aromaDescriptors: [],
    sweetnessDescriptors: [],
    sweetnessDetailDescriptors: [],
    acidityDescriptors: [],
    acidityTypeDescriptors: [],
    intensityDescriptors: [],
    mouthfeelDescriptors: [],
    aftertasteDescriptors: [],
    overallDescriptors: [],
    createdAt: now,
    updatedAt: now,
  };
}

/** Export entries to CSV string */
export function exportToCSV(entries: CoffeeEntry[]): string {
  const headers = [
    'Sample Index', 'Mode', 'Blind', 'Name', 'Origin', 'Process', 'Altitude', 'Roast Level', 'Roaster',
    'Brew Method', 'Brew Dose', 'Brew Ratio', 'Brew Water In', 'Brew Yield', 'Brew Temp', 'Brew Time', 'Brew TDS', 'Brew Water Recipe', 'Grinder', 'Grind Level', 'Grind Clicks', 'Grind µm', 'Grind Note', 'Pour Count', 'Brew Recipe Notes', 'Tasting Liquid (ml)', 'Tasting Dose (g)',
    '🌸 Fragrance', '👃 Aroma', '🍋 Acidity', '🍬 Sweetness',
    '👅 Flavor', '☕ Mouthfeel', '✨ Aftertaste', '🌟 Overall',
    'Fragrance Note', 'Aroma Note', 'Acidity Note', 'Sweetness Note', 'Flavor Note', 'Mouthfeel Note', 'Aftertaste Note', 'Overall Note',
    'Fragrance Reaction', 'Aroma Reaction', 'Acidity Reaction', 'Sweetness Reaction', 'Flavor Reaction', 'Mouthfeel Reaction', 'Aftertaste Reaction', 'Overall Reaction',
    'Total Score', 'Favorite', 'Focused Attributes', 'Aroma Tags', 'Sweetness Profile', 'Sweetness Details', 'Acidity Descriptors', 'Acidity Types (Auto)', 'Acidity Intensity', 'Mouthfeel Descriptors', 'Aftertaste Descriptors', 'Overall Descriptors', 'Notes', 'Date'
  ];
  const rows = entries.map(e => [
    e.sampleIndex, e.entryMode, e.isBlindMode ? 'Yes' : 'No', e.name, e.origin, e.process, e.altitude, e.roastLevel, e.roaster,
    e.brewMethod, e.brewDose, e.brewRatio, e.brewWaterIn, e.brewYield, e.brewTemp, e.brewTime, e.brewTDS, e.brewWater, e.brewGrinder, e.brewGrindLevel, e.brewGrindClicks, e.brewGrindMicrons, e.brewGrindSize, (e.brewPours ?? []).length, `"${(e.brewRecipeNotes ?? '').replace(/"/g, '""')}"`, e.tastingLiquidMl ?? '', e.tastingDose ?? '',
    e.scores.fragrance, e.scores.aroma, e.scores.acidity, e.scores.sweetness,
    e.scores.flavor, e.scores.mouthfeel, e.scores.aftertaste, e.scores.overall,
    `"${(e.sensoryNotes?.fragrance ?? '').replace(/"/g, '""')}"`,
    `"${(e.sensoryNotes?.aroma ?? '').replace(/"/g, '""')}"`,
    `"${(e.sensoryNotes?.acidity ?? '').replace(/"/g, '""')}"`,
    `"${(e.sensoryNotes?.sweetness ?? '').replace(/"/g, '""')}"`,
    `"${(e.sensoryNotes?.flavor ?? '').replace(/"/g, '""')}"`,
    `"${(e.sensoryNotes?.mouthfeel ?? '').replace(/"/g, '""')}"`,
    `"${(e.sensoryNotes?.aftertaste ?? '').replace(/"/g, '""')}"`,
    `"${(e.sensoryNotes?.overall ?? '').replace(/"/g, '""')}"`,
    e.sensoryReactions?.fragrance ?? '',
    e.sensoryReactions?.aroma ?? '',
    e.sensoryReactions?.acidity ?? '',
    e.sensoryReactions?.sweetness ?? '',
    e.sensoryReactions?.flavor ?? '',
    e.sensoryReactions?.mouthfeel ?? '',
    e.sensoryReactions?.aftertaste ?? '',
    e.sensoryReactions?.overall ?? '',
    e.totalScore, e.isFavorite ? 'Yes' : 'No',
    e.focusedAttributes.length > 0 ? e.focusedAttributes.join('; ') : '',
    (e.aromaDescriptors ?? []).length > 0 ? (e.aromaDescriptors ?? []).join('; ') : '',
    (e.sweetnessDescriptors ?? []).length > 0 ? (e.sweetnessDescriptors ?? []).join('; ') : '',
    (e.sweetnessDetailDescriptors ?? []).length > 0 ? (e.sweetnessDetailDescriptors ?? []).join('; ') : '',
    (e.acidityDescriptors ?? []).length > 0 ? (e.acidityDescriptors ?? []).join('; ') : '',
    (e.acidityTypeDescriptors ?? []).length > 0 ? (e.acidityTypeDescriptors ?? []).join('; ') : '',
    (e.intensityDescriptors ?? []).length > 0 ? (e.intensityDescriptors ?? []).join('; ') : '',
    (e.mouthfeelDescriptors ?? []).length > 0 ? (e.mouthfeelDescriptors ?? []).join('; ') : '',
    (e.aftertasteDescriptors ?? []).length > 0 ? (e.aftertasteDescriptors ?? []).join('; ') : '',
    (e.overallDescriptors ?? []).length > 0 ? (e.overallDescriptors ?? []).join('; ') : '',
    `"${e.notes.replace(/"/g, '""')}"`,
    new Date(e.createdAt).toLocaleDateString()
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/** Export entries to JSON string */
export function exportToJSON(entries: CoffeeEntry[]): string {
  return JSON.stringify(entries, null, 2);
}

/** Export entries to plain text */
export function exportToText(entries: CoffeeEntry[]): string {
  return entries.map(e => {
    const modeLine = `Mode: ${e.entryMode}${e.isBlindMode ? ' (Blind)' : ''}`;
    const brewLines = e.entryMode === 'brewing'
      ? [
          e.brewMethod ? `  Method: ${e.brewMethod}` : '',
          e.brewDose ? `  Dose: ${e.brewDose}g  Ratio: ${e.brewRatio || '—'}  Water In: ${e.brewWaterIn || '—'}g` : '',
          e.brewYield ? `  Yield: ${e.brewYield}g` : '',
          e.brewTemp ? `  Temp: ${e.brewTemp}` : '',
          e.brewTime ? `  Total Time: ${e.brewTime}` : '',
          e.brewTDS ? `  TDS: ${e.brewTDS}%` : '',
          e.brewWater ? `  Water Recipe: ${e.brewWater}` : '',
          e.brewGrinder ? `  Grinder: ${e.brewGrinder}  Level: ${e.brewGrindLevel || '—'}  Clicks: ${e.brewGrindClicks || '—'}  µm: ${e.brewGrindMicrons || '—'}` : '',
          (e.brewPours ?? []).length > 0
            ? `  Pours (${e.brewPours.length}): ` + e.brewPours.map((p, i) => `#${i+1} ${p.percent}% ${p.timeStart}-${p.timeEnd} ${p.flowRate ? p.flowRate+'G/s' : ''}${p.action ? ` · ${p.action}` : ''}`).join(' | ')
            : '',
          e.brewRecipeNotes ? `  Notes: ${e.brewRecipeNotes}` : '',
        ].filter(Boolean)
      : [];
    const lines = [
      `═══════════════════════════════════`,
      `${e.sampleIndex} — ${e.name || 'Unnamed'}`,
      modeLine,
      `Origin: ${e.origin || '—'}  |  Process: ${e.process}`,
      `Altitude: ${e.altitude}  |  Roast: ${e.roastLevel}`,
      `Roaster: ${e.roaster || '—'}`,
      ...(brewLines.length > 0 ? ['', 'BREW RECIPE', ...brewLines] : []),
      ``,
      `SCORES`,
      `  🌸 Fragrance:  ${e.scores.fragrance}/9`,
      `  👃 Aroma:      ${e.scores.aroma}/9`,
      `  🍋 Acidity:    ${e.scores.acidity}/9`,
      `  🍬 Sweetness:  ${e.scores.sweetness}/9`,
      `  👅 Flavor:     ${e.scores.flavor}/9`,
      `  ☕ Mouthfeel:  ${e.scores.mouthfeel}/9`,
      `  ✨ Aftertaste: ${e.scores.aftertaste}/9`,
      `  🌟 Overall:    ${e.scores.overall}/9`,
      ...SCORE_ATTRIBUTES
        .map((attr) => {
          const note = e.sensoryNotes?.[attr.key]?.trim();
          return note ? `    ↳ ${attr.label} note: ${note}` : '';
        })
        .filter(Boolean),
      ...SCORE_ATTRIBUTES
        .map((attr) => {
          const reaction = e.sensoryReactions?.[attr.key] ?? '';
          if (!reaction) return '';
          const reactionLabel = reaction === 'like' ? 'Like' : reaction === 'soso' ? 'So-so' : 'Dislike';
          return `    ↳ ${attr.label} reaction: ${reactionLabel}`;
        })
        .filter(Boolean),
      ``,
      `  TOTAL: ${e.totalScore} / 100  ${e.isFavorite ? '★ FAVORITE' : ''}`,
      `  Label: ${getScoreLabel(e.totalScore)}`,
      e.focusedAttributes.length > 0 ? `  🚩 FOCUSED ON: ${e.focusedAttributes.map(a => SCORE_ATTRIBUTES.find(sa => sa.key === a)?.label || a).join(', ')}` : '',
      ``,
      e.notes ? `Notes: ${e.notes}` : '',
      `Date: ${new Date(e.createdAt).toLocaleString()}`,
    ].filter(l => l !== undefined && l !== '');
    return lines.join('\n');
  }).join('\n\n');
}


// ============================================================= 
// Panel Cupping Session Types
// =============================================================

export interface PanelTasterSubmission {
  tasterId: string;         // unique identifier for this taster
  tasterName: string;       // name of the taster
  scores: TastingScores;
  submittedAt: string;      // ISO date string
}

export interface PanelSession {
  id: string;               // unique session ID
  sampleIndex: string;      // e.g. "S-01" (the test ID)
  sessionName: string;      // e.g. "Monday Cupping Session"
  coffeeDetails: {
    name: string;
    origin: string;
    process: ProcessMethod | string;
    altitude: Altitude | string;
    roastLevel: RoastLevel | string;
    roaster: string;
    notes: string;
  };
  submissions: PanelTasterSubmission[];  // all taster scores
  createdAt: string;
  updatedAt: string;
}

/** Calculate median of array */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/** Get consensus scores (median) from all submissions */
export function getConsensusScores(submissions: PanelTasterSubmission[]): TastingScores {
  if (submissions.length === 0) {
    return { fragrance: 5, aroma: 5, acidity: 5, sweetness: 5, flavor: 5, mouthfeel: 5, aftertaste: 5, overall: 5 };
  }
  
  const attrs: (keyof TastingScores)[] = ['fragrance', 'aroma', 'acidity', 'sweetness', 'flavor', 'mouthfeel', 'aftertaste', 'overall'];
  const consensus: TastingScores = {} as TastingScores;
  
  attrs.forEach(attr => {
    const values = submissions.map(s => s.scores[attr]);
    consensus[attr] = calculateMedian(values);
  });
  
  return consensus;
}

/** Get top 3 attributes by median score */
export function getTop3Attributes(consensus: TastingScores): Array<{ key: keyof TastingScores; score: number }> {
  const attrs: (keyof TastingScores)[] = ['fragrance', 'aroma', 'acidity', 'sweetness', 'flavor', 'mouthfeel', 'aftertaste', 'overall'];
  return attrs
    .map(key => ({ key, score: consensus[key] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

const PANEL_STORAGE_KEY = 'coffee-panel-sessions';

export function loadPanelSessions(): PanelSession[] {
  try {
    const raw = localStorage.getItem(PANEL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PanelSession[];
  } catch {
    return [];
  }
}

export function savePanelSessions(sessions: PanelSession[]): void {
  localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(sessions));
}

export function createEmptyPanelSession(sampleIndex: string): PanelSession {
  const now = new Date().toISOString();
  return {
    id: `panel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sampleIndex,
    sessionName: '',
    coffeeDetails: {
      name: '',
      origin: '',
      process: 'Washed',
      altitude: '1200-1500m',
      roastLevel: 'Medium',
      roaster: '',
      notes: '',
    },
    submissions: [],
    createdAt: now,
    updatedAt: now,
  };
}
