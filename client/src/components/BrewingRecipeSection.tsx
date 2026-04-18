// =============================================================
// BrewingRecipeSection — Comprehensive brewing recipe form
// Sections: Method/Temp/Time · Dose/Ratio/WaterIn/Yield · TDS · Water Recipe
//           Grinder (name, level, clicks, µm) · Pour Planner table · Notes
// =============================================================

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Minus, NotebookPen } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BrewPour, CoffeeEntry, parseRatioDenominator } from '@/lib/coffeeTypes';
import { cn } from '@/lib/utils';

type DraftBrewKey = keyof Omit<
  CoffeeEntry,
  'scores' | 'id' | 'createdAt' | 'updatedAt' | 'totalScore' | 'focusedAttributes' | 'brewPours'
>;

interface BrewingRecipeSectionProps {
  draft: CoffeeEntry;
  onFieldChange: (key: DraftBrewKey, value: string | boolean) => void;
  onPoursChange: (pours: BrewPour[]) => void;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  note,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  note?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-xs text-muted-foreground mb-1 block">
        {label}
        {note && <span className="ml-1 text-[10px] text-cyan-600">{note}</span>}
      </Label>
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 text-sm"
      />
    </div>
  );
}

export function BrewingRecipeSection({
  draft,
  onFieldChange,
  onPoursChange,
}: BrewingRecipeSectionProps) {
  const [pourCount, setPourCount] = useState(() => draft.brewPours?.length ?? 0);
  const [openNoteRows, setOpenNoteRows] = useState<Set<number>>(() => {
    const s = new Set<number>();
    (draft.brewPours ?? []).forEach(p => { if (p.action) s.add(p.id); });
    return s;
  });
  const [showAdjustments, setShowAdjustments] = useState(false);
  const toggleNoteRow = (id: number) =>
    setOpenNoteRows(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  // Calculate Water In from Dose × Ratio
  const waterInNum = useMemo(() => {
    const dose = parseFloat(draft.brewDose ?? '');
    const mult = parseRatioDenominator(draft.brewRatio ?? '');
    if (!isNaN(dose) && !isNaN(mult) && dose > 0 && mult > 0) return dose * mult;
    return null;
  }, [draft.brewDose, draft.brewRatio]);

  const estimatedWaterOut = useMemo(() => {
    const dose = parseFloat(draft.brewDose ?? '');
    if (!Number.isFinite(dose) || dose <= 0 || waterInNum === null) return null;
    const est = waterInNum - (dose * 2);
    return est > 0 ? est : null;
  }, [draft.brewDose, waterInNum]);

  // Auto-sync brewWaterIn field whenever dose or ratio changes
  useEffect(() => {
    const newVal = waterInNum !== null ? String(waterInNum.toFixed(1)) : '';
    if (draft.brewWaterIn !== newVal) {
      onFieldChange('brewWaterIn', newVal);
    }
  }, [waterInNum]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle pour count change — resize the pours array
  const handlePourCountChange = (newCount: number) => {
    const clamped = Math.max(0, Math.min(12, newCount));
    setPourCount(clamped);
    const current = draft.brewPours ?? [];
    if (clamped > current.length) {
      const next = [...current];
      for (let i = current.length; i < clamped; i++) {
        next.push({ id: i + 1, percent: 0, timeStart: '', timeEnd: '', flowRate: '', action: '' });
      }
      onPoursChange(next);
    } else {
      onPoursChange(current.slice(0, clamped));
    }
  };

  const pours = draft.brewPours ?? [];
  const usedPercent = Number(pours[pours.length - 1]?.percent) || 0;
  const remaining = 100 - usedPercent;

  const updatePour = (index: number, key: keyof BrewPour, value: string | number) => {
    const next = pours.map((p, i) => (i === index ? { ...p, [key]: value } : p));
    onPoursChange(next);
  };

  const mlForPour = (index: number, percent: number): string => {
    if (waterInNum === null || percent <= 0) return '—';
    const prev = index > 0 ? (Number(pours[index - 1]?.percent) || 0) : 0;
    const step = percent - prev;
    if (step <= 0) return '—';
    return `${((step / 100) * waterInNum).toFixed(1)}`;
  };

  const f = (key: DraftBrewKey) => (draft[key] as string) ?? '';
  const ch = (key: DraftBrewKey) => (v: string) => onFieldChange(key, v);

  return (
    <div className="space-y-4 p-3 rounded-lg border border-cyan-200 bg-cyan-50/50">
      <p className="text-xs font-semibold text-cyan-900 uppercase tracking-wide">☕ Brewing Recipe</p>

      {/* ── Section 1: Method / Temp / Total Time ── */}
      <div className="grid grid-cols-3 gap-2">
        <Field label="Method" value={f('brewMethod')} onChange={ch('brewMethod')} placeholder="V60" />
        <Field label="Temp" value={f('brewTemp')} onChange={ch('brewTemp')} placeholder="93°C" />
        <Field label="Total Time" value={f('brewTime')} onChange={ch('brewTime')} placeholder="2:45" />
      </div>

      {/* ── Section 2: Dose · Ratio → Water In (auto) · Yield ── */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold text-cyan-900">📏 Dose & Ratio</p>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Dose (g)" value={f('brewDose')} onChange={ch('brewDose')} placeholder="15" />
          <Field label="Ratio" value={f('brewRatio')} onChange={ch('brewRatio')} placeholder="15" note="x in 1:x (e.g. 8–20)" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {/* Water In — auto-calculated, read-only display */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">
              Water In (g) <span className="text-[10px] text-cyan-600">auto</span>
            </Label>
            <div
              className={cn(
                'h-9 flex items-center px-3 rounded-md border text-sm font-semibold',
                waterInNum !== null
                  ? 'bg-cyan-100 text-cyan-900 border-cyan-300'
                  : 'bg-muted text-muted-foreground border-border'
              )}
            >
              {waterInNum !== null ? `${waterInNum.toFixed(1)} g` : 'Enter dose & ratio'}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs text-muted-foreground">
                Measured Water Out (g)
              </Label>
              {estimatedWaterOut !== null && (
                <button
                  type="button"
                  onClick={() => onFieldChange('brewYield', estimatedWaterOut.toFixed(1))}
                  className="text-[10px] text-cyan-700 hover:text-cyan-900 underline underline-offset-2"
                >
                  Use est. {estimatedWaterOut.toFixed(1)}
                </button>
              )}
            </div>
            <Input
              value={f('brewYield')}
              onChange={e => ch('brewYield')(e.target.value)}
              placeholder={estimatedWaterOut !== null ? `e.g. ${estimatedWaterOut.toFixed(1)}` : '230'}
              className="h-9 text-sm"
            />
            {estimatedWaterOut !== null && (
              <p className="text-[10px] text-cyan-700 mt-1">
                Auto est: Water Out = (Dose × Ratio) − (Dose × 2)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 3: Water Recipe ── */}
      <div>
        <Field label="Water Recipe" value={f('brewWater')} onChange={ch('brewWater')} placeholder="e.g. TWW 150ppm" />
      </div>

      {/* ── Section 4: Grinder ── */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold text-cyan-900">⚙️ Grinder</p>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Grinder" value={f('brewGrinder')} onChange={ch('brewGrinder')} placeholder="e.g. Comandante" />
          <Field label="Grind Level" value={f('brewGrindLevel')} onChange={ch('brewGrindLevel')} placeholder="e.g. Medium-fine" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Field label="Clicks" value={f('brewGrindClicks')} onChange={ch('brewGrindClicks')} placeholder="24" />
          <Field label="µm" value={f('brewGrindMicrons')} onChange={ch('brewGrindMicrons')} placeholder="400" />
          <Field label="Note" value={f('brewGrindSize')} onChange={ch('brewGrindSize')} placeholder="Extra note" />
        </div>
      </div>

      {/* ── Section 5: Pour Planner ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold text-cyan-900">💧 Pour Planner</p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePourCountChange(pourCount - 1)}
              className="w-7 h-7 rounded-full border border-cyan-300 flex items-center justify-center text-cyan-700 hover:bg-cyan-100 transition-colors"
            >
              <Minus size={12} />
            </button>
            <span className="text-sm font-semibold text-cyan-900 w-8 text-center">{pourCount}</span>
            <button
              onClick={() => handlePourCountChange(pourCount + 1)}
              className="w-7 h-7 rounded-full border border-cyan-300 flex items-center justify-center text-cyan-700 hover:bg-cyan-100 transition-colors"
            >
              <Plus size={12} />
            </button>
            <span className="text-[11px] text-muted-foreground">pours</span>
          </div>
        </div>

        {/* % progress status bar (cumulative 0→100) */}
        {pours.length > 0 && (
          <div
            className={cn(
              'text-xs px-3 py-1.5 rounded-lg font-semibold text-center transition-colors',
              remaining === 0 && 'bg-green-100 text-green-800 border border-green-200',
              remaining > 0 && 'bg-amber-100 text-amber-800 border border-amber-200',
              remaining < 0 && 'bg-red-100 text-red-800 border border-red-200'
            )}
          >
            {remaining === 0 && '✓ 100% — fully completed'}
            {remaining > 0 && `${usedPercent.toFixed(0)}% used — ${remaining.toFixed(0)}% remaining`}
            {remaining < 0 && `⚠ ${Math.abs(remaining).toFixed(0)}% over 100%`}
            {waterInNum !== null && pours.length > 0 && (
              <span className="ml-2 font-normal text-[10px] opacity-70">
                (Total {waterInNum.toFixed(1)} g)
              </span>
            )}
          </div>
        )}

        {/* Pour table */}
        {pours.length > 0 && (
          <div className="rounded-lg border border-cyan-200 overflow-hidden">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-cyan-100 text-cyan-900">
                  <th className="px-2 py-2 text-center font-semibold w-6">#</th>
                  <th className="px-1 py-2 text-center font-semibold w-16">Target %</th>
                  <th className="px-1 py-2 text-center font-semibold w-16">g Σ</th>
                  <th className="px-1 py-2 text-center font-semibold w-14">Start</th>
                  <th className="px-1 py-2 text-center font-semibold w-14">End</th>
                  <th className="px-1 py-2 text-left font-semibold w-20">G/s</th>
                  <th className="px-1 py-2 text-center font-semibold w-7"></th>
                </tr>
              </thead>
              <tbody>
                {pours.map((pour, i) => {
                  const ml = mlForPour(i, Number(pour.percent));
                  const cumulativeMl = (waterInNum !== null && Number(pour.percent) > 0)
                    ? `${((Number(pour.percent) / 100) * waterInNum).toFixed(1)}`
                    : '—';
                  const prevPercent = i > 0 ? (Number(pours[i - 1]?.percent) || 0) : 0;
                  const stepPercent = (Number(pour.percent) || 0) - prevPercent;
                  const nonIncreasing = Number(pour.percent) < prevPercent;
                  const isOver = usedPercent > 100;
                  return (
                    <React.Fragment key={pour.id}>
                    <tr
                      key={pour.id}
                      className={cn(
                        i % 2 === 0 ? 'bg-white' : 'bg-cyan-50/40',
                        'border-t border-cyan-100'
                      )}
                    >
                      <td className="px-2 py-1.5 text-center font-semibold text-cyan-800">{i + 1}</td>
                      {/* % input */}
                      <td className="px-1 py-1.5">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={pour.percent === 0 ? '' : pour.percent}
                          onChange={e =>
                            updatePour(i, 'percent', parseFloat(e.target.value) || 0)
                          }
                          className={cn(
                            'w-full text-center bg-transparent border-b pb-0.5 focus:outline-none text-xs font-medium',
                            (isOver || nonIncreasing) ? 'border-red-400 text-red-700' : 'border-cyan-300 focus:border-cyan-700 text-cyan-900'
                          )}
                          placeholder="0"
                        />
                      </td>
                      {/* Auto ml */}
                      <td className="px-1 py-1.5 text-center font-semibold text-cyan-800">
                        <div className="leading-tight">
                          <div>Σ {cumulativeMl}</div>
                          <div className="text-[10px] font-normal text-cyan-700/80">
                            {stepPercent > 0 ? `Δ ${ml}g · ${stepPercent.toFixed(0)}%` : 'Δ —'}
                          </div>
                        </div>
                      </td>
                      {/* Time Start */}
                      <td className="px-1 py-1.5">
                        <input
                          type="text"
                          value={pour.timeStart}
                          onChange={e => updatePour(i, 'timeStart', e.target.value)}
                          className="w-full text-center bg-transparent border-b border-cyan-300 pb-0.5 focus:outline-none focus:border-cyan-700 text-xs"
                          placeholder="0:00"
                        />
                      </td>
                      {/* Time End */}
                      <td className="px-1 py-1.5">
                        <input
                          type="text"
                          value={pour.timeEnd}
                          onChange={e => updatePour(i, 'timeEnd', e.target.value)}
                          className="w-full text-center bg-transparent border-b border-cyan-300 pb-0.5 focus:outline-none focus:border-cyan-700 text-xs"
                          placeholder="0:30"
                        />
                      </td>
                      {/* Flow rate */}
                      <td className="px-1 py-1.5">
                        <input
                          type="text"
                          value={pour.flowRate}
                          onChange={e => updatePour(i, 'flowRate', e.target.value)}
                          className="w-full bg-transparent border-b border-cyan-300 pb-0.5 focus:outline-none focus:border-cyan-700 text-xs"
                          placeholder="e.g. 3.5"
                        />
                      </td>
                      {/* Action toggle */}
                      <td className="px-1 py-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => toggleNoteRow(pour.id)}
                          className={cn(
                            'w-6 h-6 rounded flex items-center justify-center transition-colors',
                            openNoteRows.has(pour.id) || pour.action
                              ? 'text-cyan-700 bg-cyan-100'
                              : 'text-cyan-400 hover:text-cyan-700 hover:bg-cyan-50'
                          )}
                        >
                          <NotebookPen size={11} />
                        </button>
                      </td>
                    </tr>
                    {(openNoteRows.has(pour.id) || !!pour.action) && (
                      <tr
                        key={`note-${pour.id}`}
                        className={cn(
                          i % 2 === 0 ? 'bg-white' : 'bg-cyan-50/40',
                          'border-t-0'
                        )}
                      >
                        <td colSpan={7} className="px-3 pb-2 pt-0">
                          <input
                            type="text"
                            value={pour.action ?? ''}
                            onChange={e => updatePour(i, 'action', e.target.value)}
                            autoFocus={openNoteRows.has(pour.id) && !pour.action}
                            className="w-full bg-transparent border-b border-dashed border-cyan-300 pb-0.5 focus:outline-none focus:border-cyan-600 text-[11px] text-cyan-800 placeholder:text-cyan-400/60"
                            placeholder="note…"
                          />
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[10px] text-cyan-700">
          % is cumulative target (0→100). Example: 20 → 50 → 70 → 80 → 100. g shows Σ cumulative first; small text shows Δ pour %.
        </p>
      </div>

      {/* ── Section 6: Water Recipe ── */}
      <div className="grid grid-cols-2 gap-2">
        <Field label="Water Recipe" value={f('brewWater')} onChange={ch('brewWater')} placeholder="e.g. TWW 150ppm" />
        <Field label="Recipe Notes" value={f('brewRecipeNotes')} onChange={ch('brewRecipeNotes')} placeholder="e.g. gentle swirl" />
      </div>

      {/* ── Section 8: After-Brewing Adjustment (Toggle) ── */}
      <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
        <button
          type="button"
          onClick={() => setShowAdjustments(v => !v)}
          className="w-full flex items-center justify-between mb-2"
        >
          <span className="text-xs font-semibold text-blue-900">⚗️ After-Brewing Adjustment</span>
          <span className="text-blue-700 text-sm">{showAdjustments ? '▼' : '▶'}</span>
        </button>
        
        {showAdjustments && (
          <div className="space-y-2 pt-2 border-t border-blue-200">
            {/* Ratio Adjustment */}
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <Label className="text-xs text-blue-900 flex-1">Ratio (1:x)</Label>
                {draft.brewRatio && <span className="text-xs text-blue-600">Current: 1:{draft.brewRatio}</span>}
              </div>
              <Input
                value={f('brewAdjRatio')}
                onChange={e => onFieldChange('brewAdjRatio', e.target.value)}
                placeholder={draft.brewRatio ? `${draft.brewRatio}` : "adjust here"}
                className="h-7 text-xs flex-1"
              />
            </div>

            {/* Grind Size Adjustment (clicks with +/- buttons) */}
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <Label className="text-xs text-blue-900 flex-1">Grind Size (clicks)</Label>
                {(draft.brewGrinder || draft.brewGrindClicks || draft.brewGrindMicrons) && (
                  <span className="text-xs text-blue-600">
                    {[draft.brewGrinder, draft.brewGrindClicks && `${draft.brewGrindClicks}c`, draft.brewGrindMicrons && `${draft.brewGrindMicrons}µm`].filter(Boolean).join(' · ')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const current = parseFloat(f('brewAdjGrindsize')) || 0;
                    onFieldChange('brewAdjGrindsize', Math.max(0, current - 1).toFixed(0));
                  }}
                  className="w-6 h-6 rounded border border-blue-300 flex items-center justify-center text-blue-700 hover:bg-blue-100 transition-colors text-xs font-bold"
                >
                  −
                </button>
                <Input
                  type="number"
                  value={f('brewAdjGrindsize')}
                  onChange={e => onFieldChange('brewAdjGrindsize', e.target.value)}
                  placeholder={draft.brewGrindClicks ? `${draft.brewGrindClicks}` : "adjust"}
                  className="h-7 text-xs flex-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    const current = parseFloat(f('brewAdjGrindsize')) || 0;
                    onFieldChange('brewAdjGrindsize', (current + 1).toFixed(0));
                  }}
                  className="w-6 h-6 rounded border border-blue-300 flex items-center justify-center text-blue-700 hover:bg-blue-100 transition-colors text-xs font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Temperature Adjustment (with +/- buttons) */}
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <Label className="text-xs text-blue-900 flex-1">Temperature (°C)</Label>
                {draft.brewTemp && <span className="text-xs text-blue-600">Current: {draft.brewTemp}°C</span>}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const current = parseFloat(f('brewAdjTemp')) || 0;
                    onFieldChange('brewAdjTemp', Math.max(0, current - 1).toFixed(0));
                  }}
                  className="w-6 h-6 rounded border border-blue-300 flex items-center justify-center text-blue-700 hover:bg-blue-100 transition-colors text-xs font-bold"
                >
                  −
                </button>
                <Input
                  type="number"
                  value={f('brewAdjTemp')}
                  onChange={e => onFieldChange('brewAdjTemp', e.target.value)}
                  placeholder={draft.brewTemp ? `${draft.brewTemp}` : "adjust"}
                  className="h-7 text-xs flex-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    const current = parseFloat(f('brewAdjTemp')) || 0;
                    onFieldChange('brewAdjTemp', (current + 1).toFixed(0));
                  }}
                  className="w-6 h-6 rounded border border-blue-300 flex items-center justify-center text-blue-700 hover:bg-blue-100 transition-colors text-xs font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Turbulance Adjustment */}
            <div>
              <Label className="text-xs text-blue-900 mb-0.5 block">Turbulance</Label>
              <Input
                value={f('brewAdjTurbulance')}
                onChange={e => onFieldChange('brewAdjTurbulance', e.target.value)}
                placeholder="e.g. Gentle, Medium, Vigorous"
                className="h-7 text-xs"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
