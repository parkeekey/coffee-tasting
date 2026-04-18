// =============================================================
// LogPage — Tasting log with entry cards, favorites, edit/delete
// Design: "Specialty Lab" — warm scientific minimalism
// =============================================================

import { useMemo, useRef, useState } from 'react';
import { Camera, Heart, Edit2, Trash2, Coffee, Star, ChevronDown, ChevronUp, Search, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useCoffee } from '@/contexts/CoffeeContext';
import { calculateExtractionYieldPercent, classifyCombinedExtractionReport, classifyExtractionYield, classifyTdsByRatioReference, classifyTdsByRatioStrengthZone, classifyTdsByStrengthZone, CoffeeEntry, estimateExtractionYieldFromQuickGuide, estimateExtractionYieldFromRatioReference, estimateWaterOut, getScoreHex, SCORE_ATTRIBUTES, getAttributeLabel } from '@/lib/coffeeTypes';

function EntryCard({ entry }: { entry: CoffeeEntry }) {
  const { toggleFavorite, deleteEntry, editEntry, setActiveTab } = useCoffee();
  const [expanded, setExpanded] = useState(false);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const color = getScoreHex(entry.totalScore);
  const mode = entry.entryMode ?? ((entry.notes ?? '').includes('[TastePad]') ? 'pad' : 'tasting');
  const isTastePadEntry = mode === 'pad';
  const isBrewingEntry = mode === 'brewing';
  const isBlindModeEntry = entry.isBlindMode ?? (entry.notes ?? '').includes('[Blind Mode]');

  const handleEdit = () => {
    editEntry(entry.id);
    setActiveTab('taste');
    toast.info(`Editing ${entry.sampleIndex} — ${entry.name}`);
  };

  const handleDelete = () => {
    deleteEntry(entry.id);
    toast.success('Entry deleted.');
  };

  const handleFavorite = () => {
    toggleFavorite(entry.id);
    toast.success(entry.isFavorite ? 'Removed from favorites' : 'Added to favorites ★');
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setSharing(true);
    try {
      const { toBlob } = await import('html-to-image');
      const blob = await toBlob(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      if (!blob) throw new Error('Failed to create PNG blob');

      const link = document.createElement('a');
      const name = (entry.name || entry.sampleIndex || 'coffee').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const createdAt = new Date(entry.createdAt);
      const datePart = Number.isNaN(createdAt.getTime())
        ? new Date().toISOString().slice(0, 10)
        : createdAt.toISOString().slice(0, 10);

      link.download = `${name}_${datePart}.png`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success('Image saved!');
    } catch (error) {
      console.error('PNG export error (single card):', error);
      toast.error('Could not export image', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setSharing(false);
    }
  };

  return (
    <div ref={cardRef} className="bg-white rounded-xl border border-border shadow-sm overflow-hidden animate-fade-slide-up">

      {/* Card header */}
      <div className="flex items-start p-3 gap-3">
        {/* Score badge */}
        <div
          className="flex-none w-14 h-14 rounded-xl flex flex-col items-center justify-center"
          style={{ backgroundColor: `${color}15`, border: `1.5px solid ${color}30` }}
        >
          <span
            className="font-mono-custom font-bold text-base leading-tight"
            style={{ color }}
          >
            {entry.totalScore.toFixed(1)}
          </span>
          <span className="text-[9px] text-muted-foreground">/100</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono-custom font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {entry.sampleIndex}
                </span>
                {isTastePadEntry && (
                  <span className="text-[10px] font-medium text-cyan-700 bg-cyan-100 px-1.5 py-0.5 rounded-full">
                    Pad Mode
                  </span>
                )}
                {isBrewingEntry && (
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                    Brewing
                  </span>
                )}
                {isBlindModeEntry && (
                  <span className="text-[10px] font-medium text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-full">
                    Blind
                  </span>
                )}
                {entry.isFavorite && (
                  <Star size={10} className="text-amber-500 fill-amber-500" />
                )}
              </div>
              <h3 className="font-display font-semibold text-sm text-foreground truncate mt-0.5">
                {entry.name || 'Unnamed Sample'}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {[entry.origin, entry.process, entry.roastLevel].filter(Boolean).join(' · ')}
              </p>
            </div>

          </div>

          {/* Focused attributes badges */}
          {entry.focusedAttributes.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              {entry.focusedAttributes.map(attr => {
                const attrLabel = SCORE_ATTRIBUTES.find(a => a.key === attr)?.label;
                return (
                  <span
                    key={attr}
                    className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1"
                  >
                    <Flag size={8} className="fill-current" />
                    {attrLabel}
                  </span>
                );
              })}
            </div>
          )}

          {/* Mini score bar */}
          <div className="flex items-center gap-1 mt-2">
            {SCORE_ATTRIBUTES.map(attr => (
              <div key={attr.key} className="flex flex-col items-center flex-1">
                <span className="text-[8px] text-muted-foreground">{attr.emoji}</span>
                <div className="w-full bg-muted rounded-full h-1 mt-0.5">
                  <div
                    className="h-1 rounded-full transition-all"
                    style={{
                      width: `${((entry.scores[attr.key] - 1) / 8) * 100}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expandable detail */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-border/50 pt-2 animate-fade-slide-up">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
            {SCORE_ATTRIBUTES.map(attr => {
              const { label: lvl, color: lvlColor } = getAttributeLabel(entry.scores[attr.key]);
              const sensoryNote = (entry.sensoryNotes?.[attr.key] ?? '').trim();
              const reaction = entry.sensoryReactions?.[attr.key] ?? '';
              return (
                <div key={attr.key} className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{attr.emoji} {attr.label}</span>
                    <div className="flex items-center gap-1">
                      <span
                        className="text-[9px] font-medium px-1 py-0.5 rounded"
                        style={{ backgroundColor: `${lvlColor}18`, color: lvlColor }}
                      >
                        {lvl}
                      </span>
                      <span className="text-xs font-mono-custom font-bold text-foreground">
                        {entry.scores[attr.key]}/9
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {reaction === 'like' && (
                      <span className="h-5 px-1.5 rounded border text-[9px] font-semibold text-emerald-700 border-emerald-300 bg-emerald-50 inline-flex items-center gap-1 whitespace-nowrap shrink-0 leading-none">
                        <span>👍</span>
                        <span>Like</span>
                      </span>
                    )}
                    {reaction === 'soso' && (
                      <span className="h-5 px-1.5 rounded border text-[9px] font-semibold text-amber-700 border-amber-300 bg-amber-50 inline-flex items-center gap-1 whitespace-nowrap shrink-0 leading-none">
                        <span>😐</span>
                        <span>So-so</span>
                      </span>
                    )}
                    {reaction === 'dislike' && (
                      <span className="h-5 px-1.5 rounded border text-[9px] font-semibold text-rose-700 border-rose-300 bg-rose-50 inline-flex items-center gap-1 whitespace-nowrap shrink-0 leading-none">
                        <span>👎</span>
                        <span>Dislike</span>
                      </span>
                    )}
                  </div>
                  {sensoryNote && (
                    <p className="text-[10px] text-muted-foreground italic">↳ {sensoryNote}</p>
                  )}
                </div>
              );
            })}
          </div>
          {entry.altitude && (
            <p className="text-xs text-muted-foreground">Altitude: {entry.altitude}</p>
          )}
          {entry.roaster && (
            <p className="text-xs text-muted-foreground">Roaster: {entry.roaster}</p>
          )}
          {isBrewingEntry && (
            <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
              <p className="text-xs text-emerald-900 font-medium mb-1">☕ Brewing Recipe</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                {entry.brewMethod && <p className="text-xs text-emerald-800">Method: {entry.brewMethod}</p>}
                {entry.brewTemp && <p className="text-xs text-emerald-800">Temp: {entry.brewTemp}</p>}
                {entry.brewDose && <p className="text-xs text-emerald-800">Dose: {entry.brewDose}g</p>}
                {entry.brewRatio && <p className="text-xs text-emerald-800">Ratio: {entry.brewRatio}</p>}
                {entry.brewWaterIn && <p className="text-xs text-emerald-800">Water In: {entry.brewWaterIn}g</p>}
                {entry.brewYield && <p className="text-xs text-emerald-800">Yield: {entry.brewYield}g</p>}
                {entry.brewTime && <p className="text-xs text-emerald-800">Time: {entry.brewTime}</p>}
                {entry.brewWater && <p className="text-xs text-emerald-800">Water: {entry.brewWater}</p>}
                {entry.brewGrinder && <p className="text-xs text-emerald-800">Grinder: {entry.brewGrinder}</p>}
                {(entry.brewGrindLevel || entry.brewGrindClicks) && (
                  <p className="text-xs text-emerald-800">
                    Grind: {[entry.brewGrindLevel, entry.brewGrindClicks && `${entry.brewGrindClicks} clicks`, entry.brewGrindMicrons && `${entry.brewGrindMicrons}µm`].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
              {/* Pour table */}
              {(entry.brewPours ?? []).length > 0 && (
                <div className="mt-2 rounded-md border border-emerald-200 overflow-hidden">
                  <table className="w-full text-[10px] border-collapse">
                    <thead>
                      <tr className="bg-emerald-100 text-emerald-900">
                        <th className="px-1.5 py-1 text-center font-semibold">#</th>
                        <th className="px-1.5 py-1 text-center font-semibold">Target %</th>
                        <th className="px-1.5 py-1 text-center font-semibold">g Σ</th>
                        <th className="px-1.5 py-1 text-center font-semibold">Time</th>
                        <th className="px-1.5 py-1 text-center font-semibold">G/s</th>
                        <th className="px-1.5 py-1 text-center font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(entry.brewPours ?? []).map((pour, i) => {
                        const waterIn = parseFloat(entry.brewWaterIn ?? '');
                        const prevPercent = i > 0 ? (Number((entry.brewPours ?? [])[i - 1]?.percent) || 0) : 0;
                        const stepPercent = (Number(pour.percent) || 0) - prevPercent;
                        const g = (!isNaN(waterIn) && stepPercent > 0)
                          ? `${((stepPercent / 100) * waterIn).toFixed(1)}`
                          : '—';
                        const cumulativeG = (!isNaN(waterIn) && Number(pour.percent) > 0)
                          ? `${(((Number(pour.percent) || 0) / 100) * waterIn).toFixed(1)}`
                          : '—';
                        return (
                          <tr key={pour.id} className={i % 2 === 0 ? 'bg-white' : 'bg-emerald-50/40'}>
                            <td className="px-1.5 py-1 text-center font-semibold text-emerald-800">{i + 1}</td>
                            <td className="px-1.5 py-1 text-center">{pour.percent}%</td>
                            <td className="px-1.5 py-1 text-center font-semibold leading-tight">
                              <div>Σ {cumulativeG}</div>
                              <div className="text-[9px] text-emerald-700/80 font-normal">{stepPercent > 0 ? `Δ ${g}g · ${stepPercent.toFixed(0)}%` : 'Δ —'}</div>
                            </td>
                            <td className="px-1.5 py-1 text-center">{[pour.timeStart, pour.timeEnd].filter(Boolean).join('–') || '—'}</td>
                            <td className="px-1.5 py-1 text-center">{pour.flowRate || '—'}</td>
                            <td className="px-1.5 py-1 text-center">{pour.action || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {entry.brewRecipeNotes && (
                <p className="text-xs text-emerald-900 mt-1.5 italic">"{entry.brewRecipeNotes}"</p>
              )}
              {entry.brewTDS && (() => {
                const tds = parseFloat(entry.brewTDS);
                const dose = parseFloat(entry.brewDose ?? '');
                const estWaterOut = estimateWaterOut(dose, entry.brewRatio ?? '');
                const liquid = parseFloat(entry.brewYield || (estWaterOut !== null ? estWaterOut.toFixed(1) : ''));
                const ratioEy = estimateExtractionYieldFromRatioReference(entry.brewRatio ?? '', tds);
                const quickEy = estimateExtractionYieldFromQuickGuide(entry.brewRatio ?? '', tds);
                const ey = ratioEy ?? quickEy ?? calculateExtractionYieldPercent(tds, liquid, dose);
                const extractionState = classifyTdsByRatioReference(entry.brewRatio ?? '', tds) ?? (ey !== null ? classifyExtractionYield(ey) : null);
                const combined = extractionState ? classifyCombinedExtractionReport(entry.brewRatio ?? '', tds, extractionState.tier) : null;
                const sz = Number.isFinite(tds) ? classifyTdsByRatioStrengthZone(entry.brewRatio ?? '', tds) : null;
                const szStyle = sz === 'ideal' ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
                  : sz === 'ideal-zone' ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
                  : sz === 'weak' ? 'text-sky-700 bg-sky-50 border-sky-300'
                  : sz === 'strong' ? 'text-orange-700 bg-orange-50 border-orange-300'
                  : 'text-muted-foreground bg-muted border-border';
                const szIcon = (sz === 'ideal' || sz === 'ideal-zone') ? '✓' : sz === 'weak' ? '💧' : sz === 'strong' ? '🔥' : null;
                const szLabel = (sz === 'ideal' || sz === 'ideal-zone') ? 'Ideal Zone' : sz === 'weak' ? 'Weak' : sz === 'strong' ? 'Strong' : null;
                const combinedStyle = combined?.extractionTier === 'ideal'
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
                  : combined?.extractionTier === 'under'
                    ? 'text-amber-700 bg-amber-50 border-amber-300'
                    : combined?.extractionTier === 'over'
                      ? 'text-rose-700 bg-rose-50 border-rose-300'
                      : 'text-violet-700 bg-violet-50 border-violet-300';
                return (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-cyan-300 bg-cyan-50">
                    <span className="text-sm leading-none">🔬</span>
                    <span className="text-[11px] font-semibold text-cyan-900 uppercase tracking-wide">TDS</span>
                    <span className="text-sm font-bold text-cyan-800 font-mono-custom">{entry.brewTDS}%</span>
                    {szLabel && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 whitespace-nowrap shrink-0 min-w-max leading-none ${szStyle}`}>
                        <span className="leading-none">{szIcon}</span>
                        <span className="leading-none">{szLabel}</span>
                      </span>
                    )}
                    {ey !== null && (
                      <>
                        <span className="text-[11px] text-muted-foreground mx-1">·</span>
                        <span className="text-[11px] font-semibold text-cyan-900 uppercase tracking-wide">EY</span>
                        <span className="text-sm font-bold font-mono-custom text-cyan-900">{ey.toFixed(1)}%</span>
                      </>
                    )}
                    {combined && (
                      <span className={`ml-auto text-[9px] font-semibold px-2 py-0.5 rounded-full border inline-flex items-center whitespace-nowrap ${combinedStyle}`}>
                        {combined.label}
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
          {/* TDS & EY for non-brewing entries */}
          {!isBrewingEntry && entry.brewTDS && (() => {
            const tds = parseFloat(entry.brewTDS);
            const liquid = parseFloat(entry.tastingLiquidMl ?? '');
            const dose = parseFloat(entry.tastingDose ?? '');
            const ey = calculateExtractionYieldPercent(tds, liquid, dose);
            const extractionState = classifyTdsByRatioReference(entry.brewRatio ?? '', tds) ?? (ey !== null ? classifyExtractionYield(ey) : null);
            const combined = extractionState ? classifyCombinedExtractionReport(entry.brewRatio ?? '', tds, extractionState.tier) : null;
            const sz = Number.isFinite(tds) ? classifyTdsByRatioStrengthZone(entry.brewRatio ?? '', tds) : null;
            const szStyle = sz === 'ideal' ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
              : sz === 'ideal-zone' ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
              : sz === 'weak' ? 'text-sky-700 bg-sky-50 border-sky-300'
              : sz === 'strong' ? 'text-orange-700 bg-orange-50 border-orange-300'
              : 'text-muted-foreground bg-muted border-border';
            const szIcon = (sz === 'ideal' || sz === 'ideal-zone') ? '✓' : sz === 'weak' ? '💧' : sz === 'strong' ? '🔥' : null;
            const szLabel = (sz === 'ideal' || sz === 'ideal-zone') ? 'Ideal Zone' : sz === 'weak' ? 'Weak' : sz === 'strong' ? 'Strong' : null;
            const combinedStyle = combined?.extractionTier === 'ideal'
              ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
              : combined?.extractionTier === 'under'
                ? 'text-amber-700 bg-amber-50 border-amber-300'
                : combined?.extractionTier === 'over'
                  ? 'text-rose-700 bg-rose-50 border-rose-300'
                  : 'text-violet-700 bg-violet-50 border-violet-300';
            return (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-cyan-300 bg-cyan-50">
                <span className="text-sm leading-none">🔬</span>
                <span className="text-[11px] font-semibold text-cyan-900 uppercase tracking-wide">TDS</span>
                <span className="text-sm font-bold text-cyan-800 font-mono-custom">{entry.brewTDS}%</span>
                {szLabel && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 whitespace-nowrap shrink-0 min-w-max leading-none ${szStyle}`}>
                    <span className="leading-none">{szIcon}</span>
                    <span className="leading-none">{szLabel}</span>
                  </span>
                )}
                {ey !== null && (
                  <>
                    <span className="text-[11px] text-muted-foreground mx-1">·</span>
                    <span className="text-[11px] font-semibold text-cyan-900 uppercase tracking-wide">EY</span>
                    <span className="text-sm font-bold font-mono-custom text-cyan-900">{ey.toFixed(1)}%</span>
                  </>
                )}
                {combined && (
                  <span className={`ml-auto text-[9px] font-semibold px-2 py-0.5 rounded-full border inline-flex items-center whitespace-nowrap ${combinedStyle}`}>
                    {combined.label}
                  </span>
                )}
              </div>
            );
          })()}
          {entry.focusedAttributes.length > 0 && (
            <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-xs text-amber-900 font-medium mb-1">🚩 Focused on:</p>
              <p className="text-xs text-amber-800">
                {entry.focusedAttributes.map(a => SCORE_ATTRIBUTES.find(sa => sa.key === a)?.label).join(', ')}
              </p>
            </div>
          )}
          {(entry.aromaDescriptors ?? []).length > 0 && (
            <div className="mt-2 p-2 bg-orange-50 rounded-lg border border-orange-100">
              <p className="text-xs text-orange-900 font-medium mb-1">👃 Aroma Standard Tags:</p>
              <div className="flex flex-wrap gap-1">
                {(entry.aromaDescriptors ?? []).map((descriptor) => (
                  <span
                    key={descriptor}
                    className="text-xs px-2 py-1 rounded-full bg-orange-500 text-white font-medium"
                  >
                    {descriptor}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(entry.sweetnessDescriptors ?? []).length > 0 && (
            <div className="mt-2 p-2 bg-orange-50 rounded-lg border border-orange-100">
              <p className="text-xs text-orange-900 font-medium mb-1">🍬 Sweetness Style:</p>
              <div className="flex flex-wrap gap-1">
                {(entry.sweetnessDescriptors ?? []).map((descriptor) => (
                  <span
                    key={descriptor}
                    className="text-xs px-2 py-1 rounded-full bg-yellow-500 text-white font-medium"
                  >
                    {descriptor}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(entry.sweetnessDetailDescriptors ?? []).length > 0 && (
            <div className="mt-2 p-2 bg-orange-50 rounded-lg border border-orange-100">
              <p className="text-xs text-orange-900 font-medium mb-1">🍯 Sweetness Details:</p>
              <div className="flex flex-wrap gap-1">
                {(entry.sweetnessDetailDescriptors ?? []).map((descriptor) => (
                  <span
                    key={descriptor}
                    className="text-xs px-2 py-1 rounded-full bg-orange-500 text-white font-medium"
                  >
                    {descriptor}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(entry.acidityDescriptors ?? []).length > 0 && (
            <div className="mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-100">
              <p className="text-xs text-yellow-900 font-medium mb-1">🍋 Acidity Flavors:</p>
              <div className="flex flex-wrap gap-1">
                {(entry.acidityDescriptors ?? []).map((descriptor) => (
                  <span
                    key={descriptor}
                    className="text-xs px-2 py-1 rounded-full bg-amber-500 text-white font-medium"
                  >
                    {descriptor}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(entry.acidityTypeDescriptors ?? []).length > 0 && (
            <div className="mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-100">
              <p className="text-xs text-yellow-900 font-medium mb-1">🧪 Acidity Types (Auto):</p>
              <div className="flex flex-wrap gap-1">
                {(entry.acidityTypeDescriptors ?? []).map((descriptor) => (
                  <span
                    key={descriptor}
                    className="text-xs px-2 py-1 rounded-full bg-amber-700 text-white font-medium"
                  >
                    {descriptor}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(entry.intensityDescriptors ?? []).length > 0 && (
            <div className="mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-100">
              <p className="text-xs text-yellow-900 font-medium mb-1">⚡ Acidity Intensity:</p>
              <div className="flex flex-wrap gap-1">
                {(entry.intensityDescriptors ?? []).map((descriptor) => (
                  <span
                    key={descriptor}
                    className="text-xs px-2 py-1 rounded-full bg-amber-500 text-white font-medium"
                  >
                    {descriptor}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(entry.mouthfeelDescriptors ?? []).length > 0 && (
            <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-900 font-medium mb-1">☕ Mouthfeel Types:</p>
              <div className="flex flex-wrap gap-1">
                {(entry.mouthfeelDescriptors ?? []).map((descriptor) => (
                  <span
                    key={descriptor}
                    className="text-xs px-2 py-1 rounded-full bg-blue-500 text-white font-medium"
                  >
                    {descriptor}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(entry.aftertasteDescriptors ?? []).length > 0 && (
            <div className="mt-2 p-2 bg-purple-50 rounded-lg border border-purple-100">
              <p className="text-xs text-purple-900 font-medium mb-1">✨ Aftertaste Length:</p>
              <div className="flex flex-wrap gap-1">
                {(entry.aftertasteDescriptors ?? []).map((descriptor) => (
                  <span
                    key={descriptor}
                    className="text-xs px-2 py-1 rounded-full bg-purple-500 text-white font-medium"
                  >
                    {descriptor}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(entry.overallDescriptors ?? []).length > 0 && (
            <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-900 font-medium mb-1">🌟 Coffee Character Profile:</p>
              <div className="flex flex-wrap gap-1">
                {(entry.overallDescriptors ?? []).map((descriptor) => (
                  <span
                    key={descriptor}
                    className="text-xs px-2 py-1 rounded-full bg-slate-600 text-white font-medium"
                  >
                    {descriptor}
                  </span>
                ))}
              </div>
            </div>
          )}
          {entry.notes && (
            <div className="mt-2 p-2 bg-muted/50 rounded-lg">
              <p className="text-xs text-foreground italic">\"{ entry.notes}\"</p>
            </div>
          )}
          <p className="text-[10px] text-muted-foreground mt-2">
            {new Date(entry.createdAt).toLocaleString()}
          </p>
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center border-t border-border/50">
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex-1 flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? 'Less' : 'Details'}
        </button>
        <div className="w-px h-6 bg-border" />
        <button
          onClick={handleFavorite}
          className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs transition-colors hover:bg-muted/50 ${
            entry.isFavorite ? 'text-amber-500' : 'text-muted-foreground hover:text-amber-500'
          }`}
        >
          <Heart size={12} className={entry.isFavorite ? 'fill-amber-500' : ''} />
          {entry.isFavorite ? 'Saved' : 'Favorite'}
        </button>
        <div className="w-px h-6 bg-border" />
        <button
          onClick={handleEdit}
          className="flex-1 flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors"
        >
          <Edit2 size={12} />
          Edit
        </button>
        <div className="w-px h-6 bg-border" />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex-1 flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors">
              <Trash2 size={12} />
              Delete
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
              <AlertDialogDescription>
                "{entry.name || entry.sampleIndex}" will be permanently removed from your log.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="w-px h-6 bg-border" />
        <button
          onClick={handleShare}
          disabled={sharing}
          className="flex-1 flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors disabled:opacity-50"
        >
          <Camera size={12} />
          {sharing ? 'Saving…' : 'Save Image'}
        </button>
      </div>
    </div>
  );
}

export default function LogPage() {
  const { entries } = useCoffee();
  const [search, setSearch] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showPreferenceInsights, setShowPreferenceInsights] = useState(false);
  const [modeView, setModeView] = useState<'all' | 'tasting' | 'brewing' | 'pad'>('all');

  const preferenceInsights = useMemo(() => {
    if (entries.length === 0) return null;

    const attrAverages = SCORE_ATTRIBUTES.map(attr => {
      const avg = entries.reduce((sum, entry) => sum + entry.scores[attr.key], 0) / entries.length;
      return { ...attr, avg };
    });

    const overallAttrAvg =
      attrAverages.reduce((sum, attr) => sum + attr.avg, 0) / attrAverages.length;

    const ranked = [...attrAverages]
      .map(attr => ({
        ...attr,
        delta: attr.avg - overallAttrAvg,
      }))
      .sort((a, b) => b.avg - a.avg);

    const topLiked = ranked.slice(0, 3);
    const lowerScored = [...ranked].reverse().slice(0, 2);

    const getTopCategory = (pick: (entry: CoffeeEntry) => string) => {
      const buckets: Record<string, { count: number; total: number }> = {};
      entries.forEach(entry => {
        const key = pick(entry) || '—';
        if (!buckets[key]) buckets[key] = { count: 0, total: 0 };
        buckets[key].count += 1;
        buckets[key].total += entry.totalScore;
      });

      return Object.entries(buckets)
        .map(([key, data]) => ({
          key,
          count: data.count,
          avgScore: data.total / data.count,
        }))
        .sort((a, b) => b.avgScore - a.avgScore)[0];
    };

    const preferredProcess = getTopCategory(entry => entry.process || 'Unknown');
    const preferredRoast = getTopCategory(entry => entry.roastLevel || 'Unknown');

    return {
      overallAttrAvg,
      topLiked,
      lowerScored,
      preferredProcess,
      preferredRoast,
    };
  }, [entries]);

  const filtered = entries.filter(e => {
    const entryMode = e.entryMode ?? ((e.notes ?? '').includes('[TastePad]') ? 'pad' : 'tasting');
    if (modeView !== 'all' && entryMode !== modeView) return false;
    if (showFavoritesOnly && !e.isFavorite) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.origin.toLowerCase().includes(q) ||
      e.sampleIndex.toLowerCase().includes(q) ||
      e.notes.toLowerCase().includes(q) ||
      e.process.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col min-h-full pb-24">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Tasting Log</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              {entries.filter(e => e.isFavorite).length > 0 && (
                <span className="ml-2 text-amber-500">
                  ★ {entries.filter(e => e.isFavorite).length} favorite{entries.filter(e => e.isFavorite).length > 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowFavoritesOnly(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              showFavoritesOnly
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'border-border text-muted-foreground hover:border-amber-200 hover:text-amber-600'
            }`}
          >
            <Star size={12} className={showFavoritesOnly ? 'fill-amber-500 text-amber-500' : ''} />
            Favorites
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, origin, notes..."
            className="pl-8 h-9 text-sm"
          />
        </div>

        {/* Mode view switch */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'tasting', label: 'Tasting' },
            { id: 'brewing', label: 'Brewing' },
            { id: 'pad', label: 'Pad' },
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setModeView(view.id as 'all' | 'tasting' | 'brewing' | 'pad')}
              className={`px-2 py-1 text-[10px] rounded-full border transition-colors ${
                modeView === view.id
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      {entries.length > 0 && (
        <div className="bg-muted/40 border-b border-border px-4 py-2 flex items-center gap-4 overflow-x-auto">
          <div className="flex-none text-center">
            <p className="text-xs text-muted-foreground">Avg Score</p>
            <p className="text-sm font-mono-custom font-bold text-foreground">
              {(entries.reduce((s, e) => s + e.totalScore, 0) / entries.length).toFixed(1)}
            </p>
          </div>
          <div className="w-px h-8 bg-border flex-none" />
          <div className="flex-none text-center">
            <p className="text-xs text-muted-foreground">Best</p>
            <p className="text-sm font-mono-custom font-bold text-foreground">
              {Math.max(...entries.map(e => e.totalScore)).toFixed(1)}
            </p>
          </div>
          <div className="w-px h-8 bg-border flex-none" />
          <div className="flex-none text-center">
            <p className="text-xs text-muted-foreground">Lowest</p>
            <p className="text-sm font-mono-custom font-bold text-foreground">
              {Math.min(...entries.map(e => e.totalScore)).toFixed(1)}
            </p>
          </div>
          <div className="w-px h-8 bg-border flex-none" />
          <div className="flex-none text-center">
            <p className="text-xs text-muted-foreground">Specialty+</p>
            <p className="text-sm font-mono-custom font-bold text-foreground">
              {entries.filter(e => e.totalScore >= 75).length}
            </p>
          </div>
        </div>
      )}

      {/* Personal preference insights */}
      <div className="bg-white border-b border-border px-4 py-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
          <button
            onClick={() => setShowPreferenceInsights(v => !v)}
            className="w-full flex items-center justify-between gap-2"
          >
            <h3 className="text-xs font-semibold uppercase tracking-widest text-amber-800 text-left">
              Personal Preference (from your log)
            </h3>
            <span className="text-[10px] font-medium text-amber-700 flex items-center gap-1">
              {showPreferenceInsights ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {showPreferenceInsights ? 'Hide' : 'Show'}
            </span>
          </button>

          {showPreferenceInsights && (
            <div className="mt-2 grid grid-cols-1 gap-2">
              {entries.length < 3 && (
                <div className="rounded-lg border border-amber-200 bg-white px-2.5 py-2">
                  <p className="text-xs text-amber-900 font-medium">At least try logging 3 coffees first.</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    You currently have {entries.length} {entries.length === 1 ? 'entry' : 'entries'}. Add more logs for meaningful preference insights.
                  </p>
                </div>
              )}

              {entries.length >= 3 && preferenceInsights && (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-amber-700">Bias baseline: {preferenceInsights.overallAttrAvg.toFixed(2)}/9</span>
                  </div>

                  <div>
                    <p className="text-[11px] font-medium text-amber-900 mb-1">You tend to score higher on:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {preferenceInsights.topLiked.map(attr => (
                        <span
                          key={attr.key}
                          className="text-[10px] px-1.5 py-0.5 rounded-full border border-amber-300 bg-white text-amber-800"
                        >
                          {attr.emoji} {attr.label} {attr.avg.toFixed(2)}/9
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-medium text-amber-900 mb-1">You score relatively lower on:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {preferenceInsights.lowerScored.map(attr => (
                        <span
                          key={attr.key}
                          className="text-[10px] px-1.5 py-0.5 rounded-full border border-border bg-white text-muted-foreground"
                        >
                          {attr.emoji} {attr.label} {attr.avg.toFixed(2)}/9
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-1 border-t border-amber-200/60 flex flex-wrap gap-2">
                    {preferenceInsights.preferredProcess && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-border text-foreground">
                        Favorite process: {preferenceInsights.preferredProcess.key} ({preferenceInsights.preferredProcess.avgScore.toFixed(1)})
                      </span>
                    )}
                    {preferenceInsights.preferredRoast && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-border text-foreground">
                        Favorite roast: {preferenceInsights.preferredRoast.key} ({preferenceInsights.preferredRoast.avgScore.toFixed(1)})
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Entry list */}
      <div className="flex-1 px-4 py-3 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'oklch(0.94 0.005 80)' }}
            >
              <Coffee size={28} className="text-muted-foreground" />
            </div>
            <h3 className="font-display text-base font-semibold text-foreground mb-1">
              {entries.length === 0 ? 'No entries yet' : 'No results found'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {entries.length === 0
                ? 'Start tasting! Go to the Taste tab to score your first coffee.'
                : 'Try a different search term or clear the filter.'}
            </p>
          </div>
        ) : (
          filtered.map(entry => (
            <EntryCard key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
}
