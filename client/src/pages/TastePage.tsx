// =============================================================
// TastePage — Main tasting form
// Design: "Specialty Lab" — warm scientific minimalism
// Score arc at top, sliders below, collapsible coffee info drawer
// =============================================================

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, Save, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ScoreArc } from '@/components/ScoreArc';
import { TastingSliderWithFocus } from '@/components/TastingSliderWithFocus';
import { BrewingRecipeSection } from '@/components/BrewingRecipeSection';
import { useCoffee } from '@/contexts/CoffeeContext';
import { ALTITUDE_OPTIONS, calculateExtractionYieldPercent, classifyExtractionYield, classifyTdsByRatioReference, estimateWaterOut, getQuickGuideTdsTarget, getRatioReferenceIdealWindow, PROCESS_OPTIONS, ROAST_OPTIONS, SCORE_ATTRIBUTES } from '@/lib/coffeeTypes';

export default function TastePage() {
  const { draft, updateDraftScore, updateDraftField, toggleFocusedAttribute, updateDraftAromaDescriptors, updateDraftBrewPours, updateDraftSweetnessDescriptors, updateDraftSweetnessDetailDescriptors, updateDraftAcidityDescriptors, updateDraftAcidityTypeDescriptors, updateDraftIntensityDescriptors, updateDraftMouthfeelDescriptors, updateDraftAftertasteDescriptors, updateDraftOverallDescriptors, saveDraft, resetDraft, isEditingExisting } = useCoffee();
  const [infoOpen, setInfoOpen] = useState(true);
  const [guideRatioInput, setGuideRatioInput] = useState('');
  const [guideEyMin, setGuideEyMin] = useState('18');
  const [guideEyMax, setGuideEyMax] = useState('22');
  const [tdsConfirmed, setTdsConfirmed] = useState(false);
  const [showQuickHelper, setShowQuickHelper] = useState(false);

  useEffect(() => {
    setTdsConfirmed(false);
  }, [draft.brewTDS, draft.entryMode]);

  const handleSave = () => {
    if (!draft.name.trim()) {
      toast.error('Please enter a coffee name before saving.');
      return;
    }
    if (draft.entryMode !== 'pad' && draft.brewTDS.trim() && !tdsConfirmed) {
      toast.error('Please confirm TDS before saving.');
      return;
    }
    saveDraft();
    toast.success(isEditingExisting ? 'Entry updated!' : 'Tasting saved to log!', {
      description: `${draft.name} — ${draft.totalScore.toFixed(1)} / 100`,
    });
  };

  const handleReset = () => {
    resetDraft();
    toast.info('Form cleared. Ready for next sample.');
  };

  return (
    <div className="flex flex-col min-h-full pb-24">
      {/* Hero header */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, oklch(0.38 0.08 35) 0%, oklch(0.28 0.06 35) 100%)',
          minHeight: '180px',
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663470510486/A4fJzBC3XDkfrSwirXSYmh/coffee-hero-fW8HAGq7AKGEfrEjEK3u9C.webp)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative z-10 px-4 pt-5 pb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Coffee size={14} className="text-amber-300" />
              <span className="text-xs font-medium text-amber-300 uppercase tracking-widest font-body">
                Affective Tasting
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-white leading-tight">
              {isEditingExisting ? 'Edit Entry' : 'New Sample'}
            </h1>
            <p className="text-sm text-white/60 mt-0.5 font-body">
              {isEditingExisting ? `Editing ${draft.sampleIndex}` : `Next: ${draft.sampleIndex}`}
            </p>
          </div>
          {/* Score arc */}
          <div className="mt-1">
            <ScoreArc score={draft.totalScore} size={100} strokeWidth={8} />
          </div>
        </div>
      </div>

      {/* Quick Cal bar */}
      <div className="bg-white border-b border-border px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-body">Quick Cal</span>
        <div className="flex items-center gap-3">
          {SCORE_ATTRIBUTES.map(attr => (
            <div key={attr.key} className="flex flex-col items-center">
              <span className="text-[10px] text-muted-foreground">{attr.emoji}</span>
              <span className="text-xs font-mono-custom font-bold text-foreground">
                {draft.scores[attr.key]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Coffee Info Section */}
      <div className="bg-white border-b border-border">
        <button
          onClick={() => setInfoOpen(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Coffee size={14} className="text-primary" />
            <span>Coffee Info</span>
            {(draft.name || draft.origin) && (
              <span className="text-xs text-muted-foreground font-normal">
                {[draft.name, draft.origin].filter(Boolean).join(' · ')}
              </span>
            )}
          </div>
          {infoOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {infoOpen && (
          <div className="px-4 pb-4 space-y-3 animate-fade-slide-up">
            {/* Sample Index + Name */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Sample #</Label>
                <Input
                  value={draft.sampleIndex}
                  onChange={e => updateDraftField('sampleIndex', e.target.value)}
                  placeholder="S-01"
                  className="h-9 text-sm font-mono-custom"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground mb-1 block">Coffee Name *</Label>
                <Input
                  value={draft.name}
                  onChange={e => updateDraftField('name', e.target.value)}
                  placeholder="e.g. Yirgacheffe G1"
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* Evaluation mode — iconic card buttons */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Session Mode</Label>
              <div className="grid grid-cols-2 gap-2">
                {/* Tasting mode */}
                <button
                  type="button"
                  onClick={() => updateDraftField('entryMode', 'tasting')}
                  className={`relative flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition-all ${
                    draft.entryMode === 'tasting'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-border bg-white hover:border-amber-300 hover:bg-amber-50/40'
                  }`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-2xl leading-none">☕</span>
                    <span className={`text-sm font-bold leading-tight ${draft.entryMode === 'tasting' ? 'text-amber-900' : 'text-foreground'}`}>
                      Tasting
                    </span>
                    {draft.entryMode === 'tasting' && (
                      <span className="ml-auto text-[10px] font-semibold text-amber-600 bg-amber-200 px-1.5 py-0.5 rounded-full">Active</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Cupping or drinking — score aroma, acidity, sweetness & all sensory attributes.
                  </p>
                </button>

                {/* Brewing mode */}
                <button
                  type="button"
                  onClick={() => updateDraftField('entryMode', 'brewing')}
                  className={`relative flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition-all ${
                    draft.entryMode === 'brewing'
                      ? 'border-cyan-500 bg-cyan-50'
                      : 'border-border bg-white hover:border-cyan-300 hover:bg-cyan-50/40'
                  }`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-2xl leading-none">⚗️</span>
                    <span className={`text-sm font-bold leading-tight ${draft.entryMode === 'brewing' ? 'text-cyan-900' : 'text-foreground'}`}>
                      Brewing
                    </span>
                    {draft.entryMode === 'brewing' && (
                      <span className="ml-auto text-[10px] font-semibold text-cyan-600 bg-cyan-200 px-1.5 py-0.5 rounded-full">Active</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Log your recipe — dose, ratio, pours, grinder & TDS, then taste the result.
                  </p>
                </button>
              </div>
            </div>

            {/* Origin + Roaster */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Origin</Label>
                <Input
                  value={draft.origin}
                  onChange={e => updateDraftField('origin', e.target.value)}
                  placeholder="e.g. Ethiopia"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Roaster</Label>
                <Input
                  value={draft.roaster}
                  onChange={e => updateDraftField('roaster', e.target.value)}
                  placeholder="Roaster name"
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* Process + Roast + Altitude */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Process</Label>
                <Select
                  value={draft.process}
                  onValueChange={v => updateDraftField('process', v)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROCESS_OPTIONS.map(p => (
                      <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Roast</Label>
                <Select
                  value={draft.roastLevel}
                  onValueChange={v => updateDraftField('roastLevel', v)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROAST_OPTIONS.map(r => (
                      <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Altitude</Label>
                <Select
                  value={draft.altitude}
                  onValueChange={v => updateDraftField('altitude', v)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALTITUDE_OPTIONS.map(a => (
                      <SelectItem key={a} value={a} className="text-xs">{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Flavor Notes / Descriptors</Label>
              <Textarea
                value={draft.notes}
                onChange={e => updateDraftField('notes', e.target.value)}
                placeholder="e.g. Jasmine, bergamot, ripe peach, brown sugar..."
                className="text-sm resize-none"
                rows={2}
              />
            </div>

            {/* Brewing recipe fields */}
            {draft.entryMode === 'brewing' && (
              <BrewingRecipeSection
                draft={draft}
                onFieldChange={updateDraftField}
                onPoursChange={updateDraftBrewPours}
              />
            )}
          </div>
        )}
      </div>

      {/* TDS & Extraction Yield — shown for tasting and brewing modes */}
      {draft.entryMode !== 'pad' && (() => {
        const tds = parseFloat(draft.brewTDS);
        const doseNum = parseFloat(draft.entryMode === 'brewing' ? draft.brewDose : draft.tastingDose);
        const estWaterOut = draft.entryMode === 'brewing' ? estimateWaterOut(doseNum, draft.brewRatio) : null;
        const liquid = parseFloat(
          draft.entryMode === 'brewing'
            ? (draft.brewYield || (estWaterOut !== null ? estWaterOut.toFixed(1) : ''))
            : draft.tastingLiquidMl
        );
        const dose = parseFloat(draft.entryMode === 'brewing' ? draft.brewDose : draft.tastingDose);
        const ey = calculateExtractionYieldPercent(tds, liquid, dose);
        const ratioReference = Number.isFinite(tds) ? classifyTdsByRatioReference(draft.brewRatio, tds) : null;
        const extractionState = ratioReference ?? (ey !== null ? classifyExtractionYield(ey) : null);
        const idealWindow = getRatioReferenceIdealWindow(draft.brewRatio);
        const activeGuideRatio = (guideRatioInput.trim() || draft.brewRatio || '13').trim();
        const minEy = Math.min(30, Math.max(10, parseInt(guideEyMin || '18', 10) || 18));
        const maxEy = Math.min(30, Math.max(minEy, parseInt(guideEyMax || '22', 10) || 22));
        const quickRows = Array.from({ length: (maxEy - minEy) + 1 }, (_, idx) => {
          const eyTarget = minEy + idx;
          const tdsTarget = getQuickGuideTdsTarget(activeGuideRatio, eyTarget);
          return { eyTarget, tdsTarget };
        });
        const tone = extractionState?.tier === 'ideal'
          ? { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' }
          : extractionState?.tier === 'under'
            ? { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' }
            : extractionState?.tier === 'fail'
              ? { color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-300' }
              : { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' };
        return (
          <div className="bg-white border-b border-border px-4 py-3">
            <div className="p-3 rounded-xl border-2 border-cyan-300 bg-cyan-50 space-y-3">
              {/* Header */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center flex-none">
                  <span className="text-white text-sm leading-none">🔬</span>
                </div>
                <p className="text-xs font-semibold text-cyan-900">TDS &amp; Extraction Yield</p>
              </div>
              {/* Inputs */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[11px] text-cyan-800 mb-1 block">TDS (%)</Label>
                  <Input
                    value={draft.brewTDS}
                    onChange={e => {
                      setTdsConfirmed(false);
                      updateDraftField('brewTDS', e.target.value);
                    }}
                    placeholder="1.35"
                    className="h-8 text-sm font-mono-custom"
                  />
                </div>
                {draft.entryMode === 'tasting' ? (
                  <>
                    <div>
                      <Label className="text-[11px] text-cyan-800 mb-1 block">Liquid (ml)</Label>
                      <Input
                        value={draft.tastingLiquidMl}
                        onChange={e => updateDraftField('tastingLiquidMl', e.target.value)}
                        placeholder="e.g. 250"
                        className="h-8 text-sm font-mono-custom"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-cyan-800 mb-1 block">Dose (g)</Label>
                      <Input
                        value={draft.tastingDose}
                        onChange={e => updateDraftField('tastingDose', e.target.value)}
                        placeholder="e.g. 15"
                        className="h-8 text-sm font-mono-custom"
                      />
                    </div>
                  </>
                ) : (
                  <div className="col-span-2 grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[11px] text-cyan-800 mb-1 block">Water Out (g)</Label>
                      <Input
                        value={draft.brewYield}
                        onChange={e => updateDraftField('brewYield', e.target.value)}
                        placeholder={estWaterOut !== null ? `${estWaterOut.toFixed(1)} (auto est)` : 'e.g. 230'}
                        className="h-8 text-sm font-mono-custom"
                      />
                    </div>
                    <div className="flex items-end pb-1">
                      <p className="text-[11px] text-cyan-600">
                        {estWaterOut !== null
                          ? `Auto est: ${estWaterOut.toFixed(1)}g from (Dose×Ratio)−(Dose×2)`
                          : 'Add dose + ratio to auto-estimate Water Out'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {/* EY result */}
              {ey !== null && extractionState ? (
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${tone.bg} ${tone.border}`}>
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold">Extraction Yield</span>
                    <span className={`text-lg font-bold font-mono-custom ${tone.color}`}>{ey.toFixed(1)}%</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${tone.bg} ${tone.color} ${tone.border}`}>
                      {extractionState.tier === 'under' ? 'Under' : extractionState.tier === 'ideal' ? 'Ideal' : extractionState.tier === 'fail' ? 'Fail' : 'Over'}
                    </span>
                    <span className={`ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full border ${tone.bg} ${tone.color} ${tone.border}`}>{extractionState.label}</span>
                  </div>

                  <div className="px-3 py-2 rounded-lg border border-cyan-200 bg-cyan-50/70">
                    <p className="text-[11px] font-semibold text-cyan-900">Suggestion only</p>
                    <p className="text-[11px] text-cyan-800">
                      {extractionState.tier === 'under' && 'Try finer grind, longer contact time, or slightly higher target EY. If the cup tastes great, keep it.'}
                      {extractionState.tier === 'ideal' && 'In a good window. Keep this as baseline, then adjust by taste preference.'}
                      {extractionState.tier === 'over' && 'Try coarser grind, shorter contact time, or lower target EY. If flavor is excellent, trust your cup.'}
                      {extractionState.tier === 'fail' && 'Reading exceeds reference range. Re-check TDS reading and brew inputs, then judge by cup quality.'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-cyan-600">
                  {draft.entryMode === 'brewing'
                    ? 'Fill in TDS + Dose + Yield in the recipe to calculate EY'
                    : 'Fill in TDS, Liquid volume and Dose to calculate Extraction Yield'}
                </p>
              )}
              {ratioReference && idealWindow && (
                <p className="text-[11px] text-cyan-700">
                  Ratio reference active for 1:{idealWindow.ratio} → 20–22% zone is TDS {idealWindow.min.toFixed(2)} to {idealWindow.max.toFixed(2)}
                </p>
              )}

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setTdsConfirmed(v => !v)}
                  className={`h-8 px-3 rounded-lg border text-xs font-semibold transition-colors ${tdsConfirmed ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-cyan-300 text-cyan-800 hover:bg-cyan-100'}`}
                >
                  {tdsConfirmed ? '✓ TDS Confirmed for Save' : 'Confirm TDS for Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuickHelper(v => !v)}
                  className={`h-8 px-3 rounded-lg border text-xs font-semibold transition-colors ${showQuickHelper ? 'bg-cyan-600 border-cyan-700 text-white' : 'bg-white border-cyan-300 text-cyan-800 hover:bg-cyan-100'}`}
                >
                  {showQuickHelper ? 'Hide Quick EXT Helper' : 'Show Quick EXT Helper'}
                </button>
              </div>

              {/* Quick Helper (not saved to log) */}
              {showQuickHelper && (
              <div className="border border-cyan-200 rounded-lg p-2 bg-white/70 space-y-2">
                <p className="text-[11px] font-semibold text-cyan-900 uppercase tracking-wide">Quick Ext / TDS Table (helper only)</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-[11px] text-cyan-800 mb-1 block">Search Ratio</Label>
                    <Input
                      value={guideRatioInput}
                      onChange={e => setGuideRatioInput(e.target.value)}
                      placeholder={draft.brewRatio || '13'}
                      className="h-8 text-sm font-mono-custom"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-cyan-800 mb-1 block">EY Min %</Label>
                    <Input
                      value={guideEyMin}
                      onChange={e => setGuideEyMin(e.target.value)}
                      placeholder="18"
                      className="h-8 text-sm font-mono-custom"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-cyan-800 mb-1 block">EY Max %</Label>
                    <Input
                      value={guideEyMax}
                      onChange={e => setGuideEyMax(e.target.value)}
                      placeholder="22"
                      className="h-8 text-sm font-mono-custom"
                    />
                  </div>
                </div>

                <div className="rounded-md border border-cyan-200 overflow-hidden">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="bg-cyan-100 text-cyan-900">
                        <th className="px-2 py-1.5 text-left font-semibold">EY Goal</th>
                        <th className="px-2 py-1.5 text-left font-semibold">TDS Target</th>
                        <th className="px-2 py-1.5 text-left font-semibold">Strength Guide</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quickRows.map((row, idx) => {
                        const target = row.tdsTarget;
                        const strength = target === null
                          ? '—'
                          : target < 1.1
                            ? 'Below 1.10'
                            : target > 1.45
                              ? 'Above 1.45'
                              : '1.10–1.45';
                        return (
                          <tr key={`${row.eyTarget}-${idx}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-cyan-50/40'}>
                            <td className="px-2 py-1.5">{row.eyTarget}%</td>
                            <td className="px-2 py-1.5 font-mono-custom font-semibold">{target === null ? '—' : target.toFixed(2)}</td>
                            <td className="px-2 py-1.5 text-cyan-800">{strength}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-cyan-700">
                  Helper only (not logged). For 1:13–1:24 and EY 18–22, values follow your static table; outside that window the app estimates from EY math with Water Out ≈ Dose×(Ratio−2).
                </p>
              </div>
              )}
            </div>
          </div>
        );
      })()}
      <div className="bg-white flex-1">
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Sensory Scores (1–9)
          </h2>
          <span className="text-xs text-muted-foreground">
            Sum: <span className="font-mono-custom font-bold text-foreground">
              {Object.values(draft.scores).reduce((a, b) => a + b, 0)}
            </span>/72
          </span>
        </div>
        <div className="px-4">
          {SCORE_ATTRIBUTES.map(attr => (
            <TastingSliderWithFocus
              key={attr.key}
              emoji={attr.emoji}
              label={attr.label}
              description={attr.description}
              value={draft.scores[attr.key]}
              onChange={v => updateDraftScore(attr.key, v)}
              isFocused={draft.focusedAttributes.includes(attr.key)}
              onFocusToggle={() => toggleFocusedAttribute(attr.key)}
              aromaDescriptors={attr.key === 'aroma' ? draft.aromaDescriptors : undefined}
              onAromaDescriptorsChange={attr.key === 'aroma' ? updateDraftAromaDescriptors : undefined}
              sweetnessDescriptors={attr.key === 'sweetness' ? draft.sweetnessDescriptors : undefined}
              sweetnessDetailDescriptors={attr.key === 'sweetness' ? draft.sweetnessDetailDescriptors : undefined}
              onSweetnessDescriptorsChange={attr.key === 'sweetness' ? updateDraftSweetnessDescriptors : undefined}
              onSweetnessDetailDescriptorsChange={attr.key === 'sweetness' ? updateDraftSweetnessDetailDescriptors : undefined}
              acidityDescriptors={attr.key === 'acidity' ? draft.acidityDescriptors : undefined}
              acidityTypeDescriptors={attr.key === 'acidity' ? draft.acidityTypeDescriptors : undefined}
              onAcidityDescriptorsChange={attr.key === 'acidity' ? updateDraftAcidityDescriptors : undefined}
              onAcidityTypeDescriptorsChange={attr.key === 'acidity' ? updateDraftAcidityTypeDescriptors : undefined}
              intensityDescriptors={attr.key === 'acidity' ? draft.intensityDescriptors : undefined}
              onIntensityDescriptorsChange={attr.key === 'acidity' ? updateDraftIntensityDescriptors : undefined}
              mouthfeelDescriptors={attr.key === 'mouthfeel' ? draft.mouthfeelDescriptors : undefined}
              onMouthfeelDescriptorsChange={attr.key === 'mouthfeel' ? updateDraftMouthfeelDescriptors : undefined}
              aftertasteDescriptors={attr.key === 'aftertaste' ? draft.aftertasteDescriptors : undefined}
              onAftertasteDescriptorsChange={attr.key === 'aftertaste' ? updateDraftAftertasteDescriptors : undefined}
              overallDescriptors={attr.key === 'overall' ? draft.overallDescriptors : undefined}
              onOverallDescriptorsChange={attr.key === 'overall' ? updateDraftOverallDescriptors : undefined}
            />
          ))}
        </div>
        {/* Score summary card */}
        <div className="mx-4 my-3 p-3 rounded-xl border border-border bg-muted/30 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total Score</p>
            <p className="font-mono-custom text-2xl font-bold" style={{ color: draft.totalScore >= 85 ? '#4a7c59' : draft.totalScore >= 75 ? '#d4860a' : draft.totalScore >= 70 ? '#e67e22' : '#c0392b' }}>
              {draft.totalScore.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground">/100</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Range</p>
            <p className="text-xs text-foreground">55 (min) → 100 (max)</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: draft.totalScore >= 85 ? '#4a7c59' : draft.totalScore >= 75 ? '#d4860a' : '#e67e22' }}>
              {draft.totalScore < 70 ? 'Below Specialty' : draft.totalScore < 75 ? 'Specialty' : draft.totalScore < 80 ? 'Very Good' : draft.totalScore < 85 ? 'Excellent' : draft.totalScore < 90 ? 'Outstanding' : 'Extraordinary'}
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons — fixed above bottom nav */}
      <div className="fixed bottom-16 left-0 right-0 z-40" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <div className="bg-white/95 backdrop-blur-sm border-t border-border px-4 py-3 flex gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="flex-none gap-1.5"
        >
          <RotateCcw size={14} />
          Clear
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          className="flex-1 gap-1.5 font-semibold"
          style={{ background: 'oklch(0.38 0.08 35)', color: 'white' }}
        >
          <Save size={14} />
          {isEditingExisting ? 'Update Entry' : 'Save to Log'}
        </Button>
      </div>
      </div>
    </div>
  );
}
