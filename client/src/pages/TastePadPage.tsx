import { useMemo, useState } from 'react';
import { Plus, Minus, RotateCcw, Save, EyeOff, Eye, Crosshair } from 'lucide-react';
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
  const { entries, addEntry, setActiveTab } = useCoffee();

  const [blindMode, setBlindMode] = useState(true);
  const [sampleName, setSampleName] = useState('');
  const [sampleCode, setSampleCode] = useState('');

  const [origin, setOrigin] = useState('');
  const [process, setProcess] = useState(PROCESS_OPTIONS[0]);
  const [altitude, setAltitude] = useState(ALTITUDE_OPTIONS[2]);
  const [roastLevel, setRoastLevel] = useState(ROAST_OPTIONS[2]);
  const [roaster, setRoaster] = useState('');
  const [notes, setNotes] = useState('');

  const [taps, setTaps] = useState<Record<PadScoreKey, TapLevel>>(INITIAL_TAPS);
  const [focusedAttributes, setFocusedAttributes] = useState<Set<PadScoreKey>>(new Set());

  const toggleFocusAttribute = (attr: PadScoreKey) => {
    const updated = new Set(focusedAttributes);
    if (updated.has(attr)) {
      updated.delete(attr);
    } else {
      updated.add(attr);
    }
    setFocusedAttributes(updated);
  };

  const isFocused = (attr: PadScoreKey) => focusedAttributes.has(attr);

  const setTap = (key: PadScoreKey, next: TapLevel) => {
    setTaps(prev => ({ ...prev, [key]: next }));
  };

  const cycleTap = (key: PadScoreKey) => {
    setTaps(prev => ({
      ...prev,
      [key]: (prev[key] === 3 ? 0 : (prev[key] + 1)) as TapLevel,
    }));
  };

  const increase = (key: PadScoreKey) => {
    setTaps(prev => ({ ...prev, [key]: Math.min(3, prev[key] + 1) as TapLevel }));
  };

  const decrease = (key: PadScoreKey) => {
    setTaps(prev => ({ ...prev, [key]: Math.max(1, prev[key] - 1) as TapLevel }));
  };

  const resetOne = (key: PadScoreKey) => setTap(key, MEDIUM_TAP);

  const mappedScores: TastingScores = useMemo(() => ({
    fragrance: TAP_TO_SCORE[taps.fragrance],
    aroma: TAP_TO_SCORE[taps.aroma],
    acidity: TAP_TO_SCORE[taps.acidity],
    sweetness: TAP_TO_SCORE[taps.sweetness],
    mouthfeel: TAP_TO_SCORE[taps.mouthfeel],
    aftertaste: TAP_TO_SCORE[taps.aftertaste],
    flavor: TAP_TO_SCORE[taps.flavor], // intensity
    overall: TAP_TO_SCORE[taps.overall], // clarity
  }), [taps]);

  const hasUnassigned = Object.values(taps).some(value => value === 0);

  const effectiveScores: TastingScores = useMemo(() => ({
    fragrance: mappedScores.fragrance || 6,
    aroma: mappedScores.aroma || 6,
    acidity: mappedScores.acidity || 6,
    sweetness: mappedScores.sweetness || 6,
    mouthfeel: mappedScores.mouthfeel || 6,
    aftertaste: mappedScores.aftertaste || 6,
    flavor: mappedScores.flavor || 6,
    overall: mappedScores.overall || 6,
  }), [mappedScores]);

  const totalScore = hasUnassigned ? null : calculateTotalScore(mappedScores);

  // Cross-map marker: x = sweetness vs acidity, y = mouthfeel vs aftertaste
  const x = ((effectiveScores.sweetness - effectiveScores.acidity) / 6) * 44; // -44 to +44
  const y = ((effectiveScores.mouthfeel - effectiveScores.aftertaste) / 6) * 44; // -44 to +44

  const resetAll = () => {
    setTaps(INITIAL_TAPS);
    setSampleName('');
    setSampleCode('');
    setNotes('');
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
    if (!sampleName.trim()) {
      toast.error('Please enter a sample name before saving.');
      return;
    }

    if (hasUnassigned) {
      toast.error('Please tap all attributes first. None values cannot be saved yet.');
      return;
    }

    const now = new Date().toISOString();
    const nextIndex = entries.length + 1;

    const entry: CoffeeEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sampleIndex: sampleCode.trim() || `S-${String(nextIndex).padStart(2, '0')}`,
      entryMode: 'pad',
      isBlindMode: blindMode,
      name: sampleName.trim(),
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
      tastingLiquidMl: '',
      tastingDose: '',
      notes: [
        blindMode ? '[TastePad][Blind Mode]' : '[TastePad]',
        `Acidity↔Sweetness: ${mappedScores.acidity}/${mappedScores.sweetness}`,
        `Mouthfeel↕Aftertaste: ${mappedScores.mouthfeel}/${mappedScores.aftertaste}`,
        `Fragrance/Aroma: ${mappedScores.fragrance}/${mappedScores.aroma}`,
        `Intensity/Clarity: ${mappedScores.flavor}/${mappedScores.overall}`,
        notes.trim(),
      ].filter(Boolean).join('\n'),
      scores: mappedScores,
      totalScore: totalScore ?? calculateTotalScore(mappedScores),
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

    addEntry(entry);
    toast.success('Taste Pad saved to log!', {
      description: `${entry.sampleIndex} — ${entry.name} (${entry.totalScore.toFixed(1)}/100)`,
    });

    setTaps(INITIAL_TAPS);
    setSampleName('');
    setSampleCode('');
    setNotes('');
    setActiveTab('log');
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
            <p className="text-[10px] text-muted-foreground">Mapped total</p>
            <p className="font-mono-custom font-bold text-base text-primary">{totalScore === null ? '— / 100' : `${totalScore.toFixed(1)}/100`}</p>
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
            value={sampleName}
            onChange={e => setSampleName(e.target.value)}
            placeholder="Sample name (required)"
            className="h-9 text-sm"
          />
          <Input
            value={sampleCode}
            onChange={e => setSampleCode(e.target.value)}
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
              value={notes}
              onChange={e => setNotes(e.target.value)}
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
          <GestureButton label="Fragrance" hint="Top row" emoji="🌸" tap={taps.fragrance} onTap={() => cycleTap('fragrance')} onDecrease={() => decrease('fragrance')} onReset={() => resetOne('fragrance')} isFocused={isFocused('fragrance')} />
          <GestureButton label="Aroma" hint="Top row" emoji="👃" tap={taps.aroma} onTap={() => cycleTap('aroma')} onDecrease={() => decrease('aroma')} onReset={() => resetOne('aroma')} isFocused={isFocused('aroma')} />
        </div>

        {/* Cross map */}
        <div className="rounded-xl border border-border bg-white p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Crosshair size={13} className="text-primary" />
            <p className="text-xs font-semibold text-foreground">Taste Cross Map (one-hand)</p>
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
              <span className="text-[10px] font-mono-custom font-bold px-1 py-0.5 bg-muted/40 rounded border border-border text-foreground">{TAP_TO_SCORE[taps.mouthfeel]}/9 {levelLabel(taps.mouthfeel)}</span>
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
              <span className="text-[10px] font-mono-custom font-bold px-1 py-0.5 bg-muted/40 rounded border border-border text-foreground">{TAP_TO_SCORE[taps.aftertaste]}/9 {levelLabel(taps.aftertaste)}</span>
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
              <span className="text-[10px] font-mono-custom font-bold px-1 py-0.5 bg-muted/40 rounded border border-border text-foreground">{TAP_TO_SCORE[taps.acidity]}/9 {levelLabel(taps.acidity)}</span>
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
              <span className="text-[10px] font-mono-custom font-bold px-1 py-0.5 bg-muted/40 rounded border border-border text-foreground">{TAP_TO_SCORE[taps.sweetness]}/9 {levelLabel(taps.sweetness)}</span>
            </button>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] rounded-xl bg-muted/40 border border-border overflow-hidden z-0">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-border" />

              <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground">Acid</span>
              <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground">Sweet</span>
              <span className="absolute left-1/2 top-1 -translate-x-1/2 text-[9px] text-muted-foreground">Mouthfeel</span>
              <span className="absolute left-1/2 bottom-1 -translate-x-1/2 text-[9px] text-muted-foreground">Aftertaste</span>

              <div
                className="absolute w-4 h-4 rounded-full bg-primary border-2 border-white shadow"
                style={{ left: `calc(50% + ${x}px - 8px)`, top: `calc(50% - ${y}px - 8px)` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="rounded-lg border border-border bg-muted/20 p-2">
              <p className="text-[10px] text-muted-foreground mb-1">Axis helpers</p>
              <div className="flex flex-wrap gap-1 text-[10px]">
                <button onClick={() => resetOne('acidity')} className="px-2 py-1 rounded bg-white border border-border">Reset Acid</button>
                <button onClick={() => resetOne('sweetness')} className="px-2 py-1 rounded bg-white border border-border">Reset Sweet</button>
                <button onClick={() => resetOne('mouthfeel')} className="px-2 py-1 rounded bg-white border border-border">Reset Mouth</button>
                <button onClick={() => resetOne('aftertaste')} className="px-2 py-1 rounded bg-white border border-border">Reset After</button>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-2">
              <p className="text-[10px] text-muted-foreground mb-1">Fine control</p>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <button onClick={() => decrease('acidity')} className="px-2 py-1 rounded bg-white border border-border">- Acid</button>
                <button onClick={() => decrease('sweetness')} className="px-2 py-1 rounded bg-white border border-border">- Sweet</button>
                <button onClick={() => decrease('mouthfeel')} className="px-2 py-1 rounded bg-white border border-border">- Mouth</button>
                <button onClick={() => decrease('aftertaste')} className="px-2 py-1 rounded bg-white border border-border">- After</button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-2 gap-2">
          <GestureButton label="Intensity" hint="Bottom row · maps to Flavor" emoji="⚡" tap={taps.flavor} onTap={() => cycleTap('flavor')} onDecrease={() => decrease('flavor')} onReset={() => resetOne('flavor')} isFocused={isFocused('flavor')} />
          <GestureButton label="Clarity" hint="Bottom row · maps to Overall" emoji="🫧" tap={taps.overall} onTap={() => cycleTap('overall')} onDecrease={() => decrease('overall')} onReset={() => resetOne('overall')} isFocused={isFocused('overall')} />
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
            disabled={hasUnassigned}
          >
            <Save size={14} />
            {hasUnassigned ? 'Assign All First' : 'Save to Log'}
          </Button>
        </div>
      </div>
    </div>
  );
}
