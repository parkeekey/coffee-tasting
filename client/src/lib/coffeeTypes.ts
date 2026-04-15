// =============================================================
// Coffee Affective Tasting — Data Types & Storage
// SCA-style scoring: each attribute 1-9, base 36 + sum = total
// Min total: 36 + 7*1 + 8 = 51... actually: base 36 + 7 scores
// Formula: 36 + fragrance + aroma + acidity + sweetness +
//          flavor + mouthfeel + aftertaste + overall
// Min: 36 + 8*1 = 44... Let's use the user's spec:
// All 1s = 55, all 9s = 100
// So: score = 47 + sum(8 attributes) where each is 1-9
// 47 + 8 = 55 ✓, 47 + 72 = 119... that's too high
// Let's recalculate: 8 attributes, each 1-9
// All 1s = 55: base + 8 = 55 → base = 47
// All 9s = 100: base + 72 = 119... doesn't work
// User says: all 1s = 55, all 9s = 100
// So range = 100 - 55 = 45, attribute range = 8 * (9-1) = 64
// Score = 55 + (sum - 8) * (45/64)
// Or simpler: use weighted formula
// Actually re-reading: "total calculation score if all are 1 is 55 lowest and 100 is highest"
// 8 attributes (fragrance, aroma, acidity, sweetness, flavor, mouthfeel, aftertaste, overall)
// Linear mapping: score = 55 + (sum(attrs) - 8) / (72 - 8) * (100 - 55)
// = 55 + (sum - 8) / 64 * 45
// At all 1s: 55 + 0 = 55 ✓
// At all 9s: 55 + 64/64 * 45 = 55 + 45 = 100 ✓
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

export interface CoffeeEntry {
  id: string;
  sampleIndex: string;       // e.g. "S-01"
  name: string;
  origin: string;
  process: ProcessMethod | string;
  altitude: Altitude | string;
  roastLevel: RoastLevel | string;
  roaster: string;
  notes: string;             // flavor notes / descriptors
  scores: TastingScores;
  totalScore: number;
  isFavorite: boolean;
  focusedAttributes: (keyof TastingScores)[];  // e.g. ['acidity', 'mouthfeel']
  createdAt: string;         // ISO date string
  updatedAt: string;
}

export const SCORE_ATTRIBUTES: Array<{
  key: keyof TastingScores;
  emoji: string;
  label: string;
  description: string;
}> = [
  { key: 'fragrance', emoji: '🌸', label: 'Fragrance', description: 'Dry grounds aroma' },
  { key: 'aroma',     emoji: '👃', label: 'Aroma',     description: 'Wet/brewed aroma' },
  { key: 'acidity',   emoji: '🍋', label: 'Acidity',   description: 'Brightness & liveliness' },
  { key: 'sweetness', emoji: '🍬', label: 'Sweetness', description: 'Natural sweetness' },
  { key: 'flavor',    emoji: '👅', label: 'Flavor',    description: 'Taste complexity' },
  { key: 'mouthfeel', emoji: '☕', label: 'Mouthfeel', description: 'Body & texture' },
  { key: 'aftertaste',emoji: '✨', label: 'Aftertaste', description: 'Finish & lingering' },
  { key: 'overall',   emoji: '🌟', label: 'Overall',   description: 'Holistic impression' },
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

const STORAGE_KEY = 'coffee-tasting-entries';

export function loadEntries(): CoffeeEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CoffeeEntry[];
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
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sampleIndex: `S-${String(sampleIndex).padStart(2, '0')}`,
    name: '',
    origin: '',
    process: 'Washed',
    altitude: '1200-1500m',
    roastLevel: 'Medium',
    roaster: '',
    notes: '',
    scores: defaultScores,
    totalScore: calculateTotalScore(defaultScores),
    isFavorite: false,
    focusedAttributes: [],
    createdAt: now,
    updatedAt: now,
  };
}

/** Export entries to CSV string */
export function exportToCSV(entries: CoffeeEntry[]): string {
  const headers = [
    'Sample Index', 'Name', 'Origin', 'Process', 'Altitude', 'Roast Level', 'Roaster',
    '🌸 Fragrance', '👃 Aroma', '🍋 Acidity', '🍬 Sweetness',
    '👅 Flavor', '☕ Mouthfeel', '✨ Aftertaste', '🌟 Overall',
    'Total Score', 'Favorite', 'Focused Attributes', 'Notes', 'Date'
  ];
  const rows = entries.map(e => [
    e.sampleIndex, e.name, e.origin, e.process, e.altitude, e.roastLevel, e.roaster,
    e.scores.fragrance, e.scores.aroma, e.scores.acidity, e.scores.sweetness,
    e.scores.flavor, e.scores.mouthfeel, e.scores.aftertaste, e.scores.overall,
    e.totalScore, e.isFavorite ? 'Yes' : 'No',
    e.focusedAttributes.length > 0 ? e.focusedAttributes.join('; ') : '',
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
    const lines = [
      `═══════════════════════════════════`,
      `${e.sampleIndex} — ${e.name || 'Unnamed'}`,
      `Origin: ${e.origin || '—'}  |  Process: ${e.process}`,
      `Altitude: ${e.altitude}  |  Roast: ${e.roastLevel}`,
      `Roaster: ${e.roaster || '—'}`,
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
