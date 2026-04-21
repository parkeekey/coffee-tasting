import { useMemo, useState, useEffect } from 'react';
import { Plus, Minus, RotateCcw, Save, EyeOff, Eye, Crosshair, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useCoffee } from '@/contexts/CoffeeContext';
import {
  ALTITUDE_OPTIONS,
  calculateTotalScore,
  CoffeeEntry,
  createTasteEntryFromPadCup,
  PROCESS_OPTIONS,
  ROAST_OPTIONS,
  TastingScores,
} from '@/lib/coffeeTypes';

type TapLevel = 0 | 1 | 2 | 3;

type PadScoreKey = keyof TastingScores;

const TAP_TO_SCORE: Record<TapLevel, number> = {
  0: 0,
  1: 3,
  2: 6,
  3: 9,
};

const EMPTY_TAP: TapLevel = 0;
const MEDIUM_TAP: TapLevel = 2;

const INITIAL_TAPS: Record<PadScoreKey, TapLevel> = {
  fragrance: EMPTY_TAP,
  aroma: EMPTY_TAP,
  acidity: EMPTY_TAP,
  sweetness: EMPTY_TAP,
  mouthfeel: EMPTY_TAP,
  aftertaste: EMPTY_TAP,
  flavor: EMPTY_TAP,
  overall: EMPTY_TAP,
};

type PadCupState = {
  sampleName: string;
  sampleCode: string;
  notes: string;
  taps: Record<PadScoreKey, TapLevel>;
  focusedAttributes: Set<PadScoreKey>;
};

function createInitialCupState(): PadCupState {
  return {
    sampleName: '',
    sampleCode: '',
    notes: '',
    taps: { ...INITIAL_TAPS },
    focusedAttributes: new Set<PadScoreKey>(),
  };
}

function levelLabel(level: TapLevel) {
  if (level === 0) return 'None';
  if (level === 1) return 'Low';
  if (level === 2) return 'Med';
  return 'High';
}

function GestureButton({
  label,
  hint,
  emoji,
  tap,
  onTap,
  onDecrease,
  onReset,
  isFocused,
}: {
  label: string;
  hint?: string;
  emoji: string;
  tap: TapLevel;
  onTap: () => void;
  onDecrease: () => void;
  onReset: () => void;
  isFocused?: boolean;
}) {
  return (
    <div className={`rounded-xl border ${isFocused ? 'border-primary shadow-md bg-primary/5' : 'border-border bg-white'} p-2.5 shadow-sm transition-colors`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <p className="text-xs font-semibold text-foreground">{emoji} {label}</p>
          {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
        </div>
      </div>

      <button
        onClick={onTap}
        className={`w-full rounded-lg py-2 text-sm font-semibold active:scale-[0.99] transition-all ${
          tap === 0
            ? 'border border-dashed border-border bg-muted/30 text-muted-foreground hover:bg-muted/50'
            : 'border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10'
        }`}
      >
        {tap === 0 ? 'None' : levelLabel(tap)} · {TAP_TO_SCORE[tap]}/9
      </button>

      <div className="grid grid-cols-3 gap-1 mt-1.5">
        <button
          onClick={onDecrease}
          className="h-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center justify-center"
          aria-label={`Decrease ${label}`}
        >
          <Minus size={13} />
        </button>
        <button
          onClick={onReset}
          className="h-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center justify-center"
          aria-label={`Reset ${label}`}
        >
          <RotateCcw size={12} />
        </button>
        <button
          onClick={onTap}
          className="h-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center justify-center"
          aria-label={`Cycle ${label}`}
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}

export default function TastePadPage() {
  const { entries, addEntry, setActiveTab, draft, isEditingExisting, resetDraft, setDraft, updateEntry } = useCoffee();

  const [blindMode, setBlindMode] = useState(true);
  const [cupCount, setCupCount] = useState(1);
  const [activeCupIndex, setActiveCupIndex] = useState(0);
  const [focusedCupIndexes, setFocusedCupIndexes] = useState<Set<number>>(new Set([0]));
  const [cups, setCups] = useState<PadCupState[]>([createInitialCupState()]);
  const [showFocusedCupPanel, setShowFocusedCupPanel] = useState(true);

  const [origin, setOrigin] = useState('');
  const [process, setProcess] = useState(PROCESS_OPTIONS[0]);
  const [altitude, setAltitude] = useState(ALTITUDE_OPTIONS[2]);
  const [roastLevel, setRoastLevel] = useState(ROAST_OPTIONS[2]);
  const [roaster, setRoaster] = useState('');

  // Load from draft if editing a multi-cup pad entry
  useEffect(() => {
    if (isEditingExisting && draft.padCups && draft.padCups.length > 0) {
      const padCups = draft.padCups;
      setBlindMode(draft.isBlindMode ?? false);
      setCupCount(padCups.length);
      setOrigin(draft.origin);
      setProcess(draft.process as any);
      setAltitude(draft.altitude as any);
      setRoastLevel(draft.roastLevel as any);
      setRoaster(draft.roaster);

      // Reconstruct cup states from padCups
      const reconstructedCups = padCups.map((padCup) => {
        const tapscores = Object.entries(padCup.scores).reduce((acc, [key, val]) => {
          const tapLevel = Math.max(0, Math.min(3, Math.round((val - 3) / 3) + 1)) as TapLevel;
          acc[key as PadScoreKey] = tapLevel;
          return acc;
        }, {} as Record<PadScoreKey, TapLevel>);

        return {
          sampleName: padCup.sampleName,
          sampleCode: padCup.sampleCode,
          notes: '',
          taps: tapscores,
          focusedAttributes: new Set<PadScoreKey>(),
        };
      });

      setCups(reconstructedCups);
      setActiveCupIndex(0);
      setFocusedCupIndexes(new Set([0]));
    }
  }, [isEditingExisting, draft]);

  const activeCup = cups[activeCupIndex] ?? createInitialCupState();

  const updateCup = (index: number, updater: (prev: PadCupState) => PadCupState) => {
    setCups(prev => prev.map((cup, i) => (i === index ? updater(cup) : cup)));
  };

  const setCupCountSafe = (count: number) => {
    const clamped = Math.max(1, Math.min(12, count));
    setCupCount(clamped);
    setCups(prev => {
      if (prev.length === clamped) return prev;
      if (prev.length > clamped) return prev.slice(0, clamped);
      return [...prev, ...Array.from({ length: clamped - prev.length }, () => createInitialCupState())];
    });
    setFocusedCupIndexes(prev => new Set(Array.from(prev).filter(idx => idx >= 0 && idx < clamped)));
    setActiveCupIndex(prev => Math.min(prev, clamped - 1));
  };

  const toggleFocusedCup = (index: number) => {
    setFocusedCupIndexes(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
    setActiveCupIndex(index);
  };

  const cycleActiveCup = () => {
    if (cupCount <= 1) return;
    setActiveCupIndex(prev => (prev + 1) % cupCount);
  };

  const toggleFocusAttribute = (attr: PadScoreKey) => {
    updateCup(activeCupIndex, (cup) => {
      const updated = new Set(cup.focusedAttributes);
      if (updated.has(attr)) updated.delete(attr);
      else updated.add(attr);
      return { ...cup, focusedAttributes: updated };
    });
  };

  const isFocused = (attr: PadScoreKey) => activeCup.focusedAttributes.has(attr);

  const setTap = (key: PadScoreKey, next: TapLevel) => {
    updateCup(activeCupIndex, (cup) => ({ ...cup, taps: { ...cup.taps, [key]: next } }));
  };

  const cycleTap = (key: PadScoreKey) => {
    updateCup(activeCupIndex, (cup) => ({
      ...cup,
      taps: {
        ...cup.taps,
        [key]: (cup.taps[key] === 3 ? 0 : (cup.taps[key] + 1)) as TapLevel,
      },
    }));
  };

  const increase = (key: PadScoreKey) => {
    updateCup(activeCupIndex, (cup) => ({
      ...cup,
      taps: { ...cup.taps, [key]: Math.min(3, cup.taps[key] + 1) as TapLevel },
    }));
  };

  const decrease = (key: PadScoreKey) => {
    updateCup(activeCupIndex, (cup) => ({
      ...cup,
      taps: { ...cup.taps, [key]: Math.max(1, cup.taps[key] - 1) as TapLevel },
    }));
  };

  const resetOne = (key: PadScoreKey) => setTap(key, MEDIUM_TAP);
  const resetAxisOne = (key: PadScoreKey) => setTap(key, EMPTY_TAP);

  const mappedScores: TastingScores = useMemo(() => ({
    fragrance: TAP_TO_SCORE[activeCup.taps.fragrance],
    aroma: TAP_TO_SCORE[activeCup.taps.aroma],
    acidity: TAP_TO_SCORE[activeCup.taps.acidity],
    sweetness: TAP_TO_SCORE[activeCup.taps.sweetness],
    mouthfeel: TAP_TO_SCORE[activeCup.taps.mouthfeel],
    aftertaste: TAP_TO_SCORE[activeCup.taps.aftertaste],
    flavor: TAP_TO_SCORE[activeCup.taps.flavor], // intensity
    overall: TAP_TO_SCORE[activeCup.taps.overall], // clarity
  }), [activeCup.taps]);

  // All attributes unassigned (empty) in active cup
  const hasUnassigned = Object.values(activeCup.taps).every(value => value === 0);
  // At least one cup is completely empty (can't save if all cups are empty)
  const allCupsEmpty = cups.slice(0, cupCount).every(cup => Object.values(cup.taps).every(value => value === 0));

  const totalScore = hasUnassigned ? null : calculateTotalScore(mappedScores);

  const radar = useMemo(() => {
    const center = 70;
    const radius = 56;

    const values = {
      mouthfeel: mappedScores.mouthfeel,
      sweetness: mappedScores.sweetness,
      aftertaste: mappedScores.aftertaste,
      acidity: mappedScores.acidity,
    } as const;

    const pointAt = (dx: number, dy: number, score: number) => {
      const ratio = Math.max(0, Math.min(1, score / 9));
      return {
        x: center + dx * radius * ratio,
        y: center + dy * radius * ratio,
      };
    };

    const pMouth = pointAt(0, -1, values.mouthfeel);
    const pSweet = pointAt(1, 0, values.sweetness);
    const pAfter = pointAt(0, 1, values.aftertaste);
    const pAcid = pointAt(-1, 0, values.acidity);

    const valuePolygon = `${pMouth.x},${pMouth.y} ${pSweet.x},${pSweet.y} ${pAfter.x},${pAfter.y} ${pAcid.x},${pAcid.y}`;
    const gridLevels = [0.25, 0.5, 0.75, 1].map(level => {
      const r = radius * level;
      return `${center},${center - r} ${center + r},${center} ${center},${center + r} ${center - r},${center}`;
    });

    return {
      center,
      radius,
      points: { mouthfeel: pMouth, sweetness: pSweet, aftertaste: pAfter, acidity: pAcid },
      valuePolygon,
      gridLevels,
      values,
    };
  }, [mappedScores.acidity, mappedScores.aftertaste, mappedScores.mouthfeel, mappedScores.sweetness]);

  const resetAll = () => {
    setCups(Array.from({ length: cupCount }, () => createInitialCupState()));
    setActiveCupIndex(0);
    setFocusedCupIndexes(new Set([0]));
    if (!blindMode) {
      setOrigin('');
      setProcess(PROCESS_OPTIONS[0]);
      setAltitude(ALTITUDE_OPTIONS[2]);
      setRoastLevel(ROAST_OPTIONS[2]);
      setRoaster('');
    }
    toast.info('Taste Pad reset.');
  };

  const handleSave = () => {
    const workingCups = cups.slice(0, cupCount);
    // Require at least ONE attribute assigned per cup (not all zeros)
    const firstEmptyCup = workingCups.findIndex(cup => Object.values(cup.taps).every(v => v === 0));
    if (firstEmptyCup !== -1) {
      toast.error(`Cup ${firstEmptyCup + 1}: assign at least one attribute.`);
      setActiveCupIndex(firstEmptyCup);
      return;
    }

    const now = new Date().toISOString();
    const nextIndex = entries.length + 1;

    // Build all cup data for the padCups field
    const padCupsData = workingCups.map((cup, idx) => {
      const cupScores: TastingScores = {
        fragrance: TAP_TO_SCORE[cup.taps.fragrance],
        aroma: TAP_TO_SCORE[cup.taps.aroma],
        acidity: TAP_TO_SCORE[cup.taps.acidity],
        sweetness: TAP_TO_SCORE[cup.taps.sweetness],
        mouthfeel: TAP_TO_SCORE[cup.taps.mouthfeel],
        aftertaste: TAP_TO_SCORE[cup.taps.aftertaste],
        flavor: TAP_TO_SCORE[cup.taps.flavor],
        overall: TAP_TO_SCORE[cup.taps.overall],
      };
      const cupTotal = calculateTotalScore(cupScores);

      return {
        index: idx + 1,
        sampleName: cup.sampleName.trim() || `Cup ${idx + 1}`,
        sampleCode: cup.sampleCode.trim() || `S-${String(nextIndex + idx).padStart(2, '0')}`,
        notes: cup.notes.trim(),
        scores: cupScores,
        totalScore: cupTotal,
      };
    });

    // First cup's scores for the main entry
    const firstCupScores = {
      fragrance: TAP_TO_SCORE[workingCups[0].taps.fragrance],
      aroma: TAP_TO_SCORE[workingCups[0].taps.aroma],
      acidity: TAP_TO_SCORE[workingCups[0].taps.acidity],
      sweetness: TAP_TO_SCORE[workingCups[0].taps.sweetness],
      mouthfeel: TAP_TO_SCORE[workingCups[0].taps.mouthfeel],
      aftertaste: TAP_TO_SCORE[workingCups[0].taps.aftertaste],
      flavor: TAP_TO_SCORE[workingCups[0].taps.flavor],
      overall: TAP_TO_SCORE[workingCups[0].taps.overall],
    };
    const firstCupTotal = calculateTotalScore(firstCupScores);
    const firstName = workingCups[0].sampleName.trim() || 'Cup 1';

    // Single entry containing all cups
    const entry: CoffeeEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sampleIndex: workingCups[0].sampleCode.trim() || `S-${String(nextIndex).padStart(2, '0')}`,
      entryMode: 'pad',
      isBlindMode: blindMode,
      name: cupCount > 1 ? `${firstName} + ${cupCount - 1} more` : firstName,
      origin: blindMode ? '' : origin.trim(),
      process: blindMode ? PROCESS_OPTIONS[0] : process,
      altitude: blindMode ? ALTITUDE_OPTIONS[2] : altitude,
      roastLevel: blindMode ? ROAST_OPTIONS[2] : roastLevel,
      roaster: blindMode ? '' : roaster.trim(),
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
      notes: [
        blindMode ? '[TastePad][Blind Mode]' : '[TastePad]',
        `[${cupCount} Cup${cupCount > 1 ? 's' : ''} Blind Test]`,
        workingCups[0].notes.trim(),
      ].filter(Boolean).join('\n'),
      scores: firstCupScores,
      sensoryNotes: {
        fragrance: '',
        aroma: '',
        acidity: '',
        sweetness: '',
        flavor: '',
        mouthfeel: '',
        aftertaste: '',
        overall: '',
      },
      sensoryReactions: {
        fragrance: '',
        aroma: '',
        acidity: '',
        sweetness: '',
        flavor: '',
        mouthfeel: '',
        aftertaste: '',
        overall: '',
      },
      totalScore: firstCupTotal,
      isFavorite: false,
      focusedAttributes: Array.from(workingCups[0].focusedAttributes),
      aromaDescriptors: [],
      sweetnessDescriptors: [],
      sweetnessDetailDescriptors: [],
      acidityDescriptors: [],
      acidityTypeDescriptors: [],
      intensityDescriptors: [],
      mouthfeelDescriptors: [],
      aftertasteDescriptors: [],
      overallDescriptors: [],
      padCups: padCupsData,
      createdAt: now,
      updatedAt: now,
    };

    if (isEditingExisting && draft.id) {
      // Update existing entry
      updateEntry(draft.id, {
        ...entry,
        id: draft.id,
        createdAt: draft.createdAt,
        isFavorite: draft.isFavorite,
      });
      resetDraft();
      toast.success(`Taste Pad updated with ${cupCount} cup${cupCount > 1 ? 's' : ''}!`);
    } else {
      // Create new entry
      addEntry(entry);
      toast.success(`Taste Pad saved ${cupCount} cup${cupCount > 1 ? 's' : ''} to log!`);
    }

    setCups(Array.from({ length: cupCount }, () => createInitialCupState()));
    setActiveCupIndex(0);
    setFocusedCupIndexes(new Set([0]));
    setActiveTab('log');
  };

  const handleImportActiveCupToTaste = () => {
    if (hasUnassigned) {
      toast.error('Assign at least one score before importing this cup.');
      return;
    }

    const importedDraft = createTasteEntryFromPadCup({
      cup: {
        index: activeCupIndex + 1,
        sampleName: activeCup.sampleName,
        sampleCode: activeCup.sampleCode,
        notes: activeCup.notes,
        scores: mappedScores,
      },
      sampleIndex: entries.length + 1,
      source: {
        origin,
        process,
        altitude,
        roastLevel,
        roaster,
        isBlindMode: blindMode,
      },
      focusedAttributes: Array.from(activeCup.focusedAttributes),
    });

    resetDraft();
    setDraft(importedDraft);
    setActiveTab('taste');
    toast.success(`Imported Cup ${activeCupIndex + 1} to Taste mode.`);
  };

  return (
    <div className="flex flex-col min-h-full pb-24">
      <div className="bg-white border-b border-border px-4 pt-5 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Taste Pad</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Tap-based quick sensory mapping</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Cup {activeCupIndex + 1} total</p>
            <p className="font-mono-custom font-bold text-base text-primary">{totalScore === null ? '— / 100' : `${totalScore.toFixed(1)}/100`}</p>
          </div>
        </div>

        <div className="mt-2 rounded-lg border border-border p-2.5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-xs font-semibold text-foreground">Cup Session</p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">Cups</span>
              <Select value={String(cupCount)} onValueChange={(v) => setCupCountSafe(parseInt(v, 10))}>
                <SelectTrigger className="h-8 w-20 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                    <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-stretch gap-1.5 overflow-x-auto pb-1">
            {Array.from({ length: cupCount }, (_, i) => {
              const cup = cups[i] ?? createInitialCupState();
              const done = !Object.values(cup.taps).some(v => v === 0);
              return (
                <button
                  key={i}
                  onClick={() => toggleFocusedCup(i)}
                  className={`min-w-[92px] rounded-lg border px-2 py-1.5 text-left whitespace-nowrap transition-colors ${
                    focusedCupIndexes.has(i)
                      ? 'bg-primary/10 text-primary border-primary shadow-sm'
                      : done
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-white text-muted-foreground border-border hover:bg-muted/40'
                  }`}
                >
                  <div className="text-[11px] font-semibold">Cup {i + 1}</div>
                  <div className="text-[10px] truncate opacity-80">{cup.sampleName.trim() || cup.sampleCode.trim() || 'Tap to focus'}</div>
                </button>
              );
            })}
          </div>
          <div className="mt-2 rounded-lg bg-muted/30 px-2.5 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Focused Cups</p>
                <p className="text-xs font-semibold text-foreground truncate">
                  {focusedCupIndexes.size > 0
                    ? `Cup ${Array.from(focusedCupIndexes).sort((a, b) => a - b).map(idx => idx + 1).join(', ')}`
                    : 'No cups focused'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFocusedCupPanel(prev => !prev)}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:bg-muted/50"
              >
                {showFocusedCupPanel ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {showFocusedCupPanel ? 'Hide' : 'Show'}
              </button>
            </div>
            {showFocusedCupPanel && (
              <div className="mt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleImportActiveCupToTaste}
                  disabled={hasUnassigned}
                  className="h-8 gap-1.5 whitespace-nowrap"
                >
                  <Upload size={13} />
                  Import To Taste
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-lg border border-border p-2.5">
          <div>
            <p className="text-xs font-semibold text-foreground">Blind Taste Mode</p>
            <p className="text-[10px] text-muted-foreground">Hide coffee info; log by sample only</p>
          </div>
          <button
            onClick={() => setBlindMode(v => !v)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              blindMode
                ? 'bg-primary/10 border-primary/20 text-primary'
                : 'bg-muted/40 border-border text-muted-foreground'
            }`}
          >
            <span className="inline-flex items-center gap-1">
              {blindMode ? <EyeOff size={12} /> : <Eye size={12} />}
              {blindMode ? 'Blind ON' : 'Blind OFF'}
            </span>
          </button>
        </div>

        <div className="mt-2 rounded-lg border border-border p-2.5">
          <p className="text-xs font-semibold text-foreground mb-2">Focus Highlight</p>
          <div className="grid grid-cols-4 gap-2">
            {(['fragrance', 'aroma', 'acidity', 'sweetness', 'mouthfeel', 'aftertaste', 'flavor', 'overall'] as PadScoreKey[]).map((attr) => (
              <label key={attr} className="flex items-center gap-2 cursor-pointer text-xs">
                <Checkbox
                  checked={isFocused(attr)}
                  onCheckedChange={() => toggleFocusAttribute(attr)}
                />
                <span className="capitalize">{attr}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <Input
            value={activeCup.sampleName}
            onChange={e => updateCup(activeCupIndex, cup => ({ ...cup, sampleName: e.target.value }))}
            placeholder="Sample name (required)"
            className="h-9 text-sm"
          />
          <Input
            value={activeCup.sampleCode}
            onChange={e => updateCup(activeCupIndex, cup => ({ ...cup, sampleCode: e.target.value }))}
            placeholder="Sample code (optional)"
            className="h-9 text-sm font-mono-custom"
          />
        </div>

        {!blindMode && (
          <div className="grid grid-cols-2 gap-2 mt-2 animate-fade-slide-up">
            <Input
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              placeholder="Origin"
              className="h-9 text-sm"
            />
            <Input
              value={roaster}
              onChange={e => setRoaster(e.target.value)}
              placeholder="Roaster"
              className="h-9 text-sm"
            />
            <Select value={process} onValueChange={value => setProcess(value as typeof process)}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROCESS_OPTIONS.map(p => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={roastLevel} onValueChange={value => setRoastLevel(value as typeof roastLevel)}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROAST_OPTIONS.map(r => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={altitude} onValueChange={value => setAltitude(value as typeof altitude)}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ALTITUDE_OPTIONS.map(a => <SelectItem key={a} value={a} className="text-xs">{a}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea
              value={activeCup.notes}
              onChange={e => updateCup(activeCupIndex, cup => ({ ...cup, notes: e.target.value }))}
              placeholder="Quick notes"
              className="text-sm resize-none h-9 min-h-9 py-2 col-span-1"
              rows={1}
            />
          </div>
        )}
      </div>

      <div className="px-4 py-3 space-y-3">
        <div className="rounded-lg bg-muted/40 border border-border px-3 py-2">
          <p className="text-[11px] text-muted-foreground">
            Quick taps: <span className="font-medium text-foreground">0 = None</span>, <span className="font-medium text-foreground">1 = Low</span>, <span className="font-medium text-foreground">2 = Med</span>, <span className="font-medium text-foreground">3 = High</span>
          </p>
        </div>

        {/* Top row */}
        <div className="grid grid-cols-2 gap-2">
          <GestureButton label="Fragrance" hint="Top row" emoji="🌸" tap={activeCup.taps.fragrance} onTap={() => cycleTap('fragrance')} onDecrease={() => decrease('fragrance')} onReset={() => resetOne('fragrance')} isFocused={isFocused('fragrance')} />
          <GestureButton label="Aroma" hint="Top row" emoji="👃" tap={activeCup.taps.aroma} onTap={() => cycleTap('aroma')} onDecrease={() => decrease('aroma')} onReset={() => resetOne('aroma')} isFocused={isFocused('aroma')} />
        </div>

        {/* Cross map */}
        <div className="rounded-xl border border-border bg-white p-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
            <Crosshair size={13} className="text-primary" />
            <p className="text-xs font-semibold text-foreground">Taste Radar Map (0-9)</p>
            </div>
            <button
              onClick={cycleActiveCup}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2 py-1 text-[10px] font-semibold text-primary whitespace-nowrap hover:bg-primary/10 transition-colors"
              title={cupCount > 1 ? 'Tap to cycle cup' : 'Only 1 cup'}
              type="button"
            >
              <span>Cup {activeCupIndex + 1}</span>
              <span className="text-primary/60">•</span>
              <span className="max-w-[110px] truncate">{activeCup.sampleName.trim() || activeCup.sampleCode.trim() || `Untitled`}</span>
            </button>
          </div>

          <div className="relative w-full max-w-[390px] h-[280px] mx-auto">
            <button
              onClick={() => cycleTap('mouthfeel')}
              className={`absolute left-1/2 top-0 -translate-x-1/2 w-32 h-12 rounded-xl border text-xs font-semibold shadow-sm active:scale-[0.99] z-10 transition-colors flex flex-col items-center justify-center gap-0.5 ${
                isFocused('mouthfeel')
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-white border-border'
              }`}
            >
              <span>☕ Mouthfeel</span>
              <span className="text-[10px] font-mono-custom font-bold px-1 py-0.5 bg-muted/40 rounded border border-border text-foreground">{TAP_TO_SCORE[activeCup.taps.mouthfeel]}/9 {levelLabel(activeCup.taps.mouthfeel)}</span>
            </button>

            <button
              onClick={() => cycleTap('aftertaste')}
              className={`absolute left-1/2 bottom-0 -translate-x-1/2 w-32 h-12 rounded-xl border text-xs font-semibold shadow-sm active:scale-[0.99] z-10 transition-colors flex flex-col items-center justify-center gap-0.5 ${
                isFocused('aftertaste')
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-white border-border'
              }`}
            >
              <span>✨ Aftertaste</span>
              <span className="text-[10px] font-mono-custom font-bold px-1 py-0.5 bg-muted/40 rounded border border-border text-foreground">{TAP_TO_SCORE[activeCup.taps.aftertaste]}/9 {levelLabel(activeCup.taps.aftertaste)}</span>
            </button>

            <button
              onClick={() => cycleTap('acidity')}
              className={`absolute left-1 top-1/2 -translate-y-1/2 w-28 h-12 rounded-xl border text-xs font-semibold shadow-sm active:scale-[0.99] z-10 transition-colors flex flex-col items-center justify-center gap-0.5 ${
                isFocused('acidity')
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-white border-border'
              }`}
            >
              <span>🍋 Acidity</span>
              <span className="text-[10px] font-mono-custom font-bold px-1 py-0.5 bg-muted/40 rounded border border-border text-foreground">{TAP_TO_SCORE[activeCup.taps.acidity]}/9 {levelLabel(activeCup.taps.acidity)}</span>
            </button>

            <button
              onClick={() => cycleTap('sweetness')}
              className={`absolute right-1 top-1/2 -translate-y-1/2 w-28 h-12 rounded-xl border text-xs font-semibold shadow-sm active:scale-[0.99] z-10 transition-colors flex flex-col items-center justify-center gap-0.5 ${
                isFocused('sweetness')
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-white border-border'
              }`}
            >
              <span>🍬 Sweetness</span>
              <span className="text-[10px] font-mono-custom font-bold px-1 py-0.5 bg-muted/40 rounded border border-border text-foreground">{TAP_TO_SCORE[activeCup.taps.sweetness]}/9 {levelLabel(activeCup.taps.sweetness)}</span>
            </button>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] rounded-xl bg-muted/30 border border-border overflow-hidden z-0 p-1">
              <svg viewBox="0 0 140 140" className="w-full h-full">
                {radar.gridLevels.map((level, idx) => (
                  <polygon
                    key={idx}
                    points={level}
                    fill="none"
                    stroke="currentColor"
                    className="text-border"
                    strokeWidth={idx === radar.gridLevels.length - 1 ? 1.2 : 1}
                  />
                ))}
                <line x1={radar.center} y1={radar.center - radar.radius} x2={radar.center} y2={radar.center + radar.radius} stroke="currentColor" className="text-border" strokeWidth="1" />
                <line x1={radar.center - radar.radius} y1={radar.center} x2={radar.center + radar.radius} y2={radar.center} stroke="currentColor" className="text-border" strokeWidth="1" />

                <polygon
                  points={radar.valuePolygon}
                  fill="oklch(0.64 0.13 45 / 0.28)"
                  stroke="oklch(0.58 0.14 45)"
                  strokeWidth="2"
                  className="transition-all duration-300 ease-out"
                />

                {Object.values(radar.points).map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="3.2" fill="oklch(0.58 0.14 45)" className="animate-pulse" />
                ))}
              </svg>

              <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground">Acid {radar.values.acidity}</span>
              <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground">Sweet {radar.values.sweetness}</span>
              <span className="absolute left-1/2 top-1 -translate-x-1/2 text-[9px] text-muted-foreground">Mouth {radar.values.mouthfeel}</span>
              <span className="absolute left-1/2 bottom-1 -translate-x-1/2 text-[9px] text-muted-foreground">After {radar.values.aftertaste}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="rounded-lg border border-border bg-muted/20 p-2">
              <p className="text-[10px] text-muted-foreground mb-1">Axis helpers</p>
              <div className="flex flex-wrap gap-1 text-[10px]">
                <button onClick={() => resetAxisOne('acidity')} className="px-2 py-1 rounded bg-white border border-border">Reset Acid</button>
                <button onClick={() => resetAxisOne('sweetness')} className="px-2 py-1 rounded bg-white border border-border">Reset Sweet</button>
                <button onClick={() => resetAxisOne('mouthfeel')} className="px-2 py-1 rounded bg-white border border-border">Reset Mouth</button>
                <button onClick={() => resetAxisOne('aftertaste')} className="px-2 py-1 rounded bg-white border border-border">Reset After</button>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-2">
              <p className="text-[10px] text-muted-foreground mb-1">Focus control</p>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <button
                  onClick={() => toggleFocusAttribute('acidity')}
                  className={`px-2 py-1 rounded border transition-colors ${isFocused('acidity') ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-border'}`}
                >
                  Acid
                </button>
                <button
                  onClick={() => toggleFocusAttribute('sweetness')}
                  className={`px-2 py-1 rounded border transition-colors ${isFocused('sweetness') ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-border'}`}
                >
                  Sweet
                </button>
                <button
                  onClick={() => toggleFocusAttribute('mouthfeel')}
                  className={`px-2 py-1 rounded border transition-colors ${isFocused('mouthfeel') ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-border'}`}
                >
                  Mouth
                </button>
                <button
                  onClick={() => toggleFocusAttribute('aftertaste')}
                  className={`px-2 py-1 rounded border transition-colors ${isFocused('aftertaste') ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-border'}`}
                >
                  After
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-2 gap-2">
          <GestureButton label="Intensity" hint="Bottom row · maps to Flavor" emoji="⚡" tap={activeCup.taps.flavor} onTap={() => cycleTap('flavor')} onDecrease={() => decrease('flavor')} onReset={() => resetOne('flavor')} isFocused={isFocused('flavor')} />
          <GestureButton label="Clarity" hint="Bottom row · maps to Overall" emoji="🫧" tap={activeCup.taps.overall} onTap={() => cycleTap('overall')} onDecrease={() => decrease('overall')} onReset={() => resetOne('overall')} isFocused={isFocused('overall')} />
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-40" style={{ maxWidth: '480px', margin: '0 auto' }}>
        <div className="bg-white/95 backdrop-blur-sm border-t border-border px-4 py-3 flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={resetAll}
            className="flex-none gap-1.5"
          >
            <RotateCcw size={14} />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="flex-1 gap-1.5 font-semibold"
            style={{ background: 'oklch(0.38 0.08 35)', color: 'white' }}
            disabled={allCupsEmpty}
          >
            <Save size={14} />
            {allCupsEmpty ? 'Assign At Least One Cup' : `Save ${cupCount} Cup${cupCount > 1 ? 's' : ''} to Log`}
          </Button>
        </div>
      </div>
    </div>
  );
}
