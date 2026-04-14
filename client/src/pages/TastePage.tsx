// =============================================================
// TastePage — Main tasting form
// Design: "Specialty Lab" — warm scientific minimalism
// Score arc at top, sliders below, collapsible coffee info drawer
// =============================================================

import { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, Save, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ScoreArc } from '@/components/ScoreArc';
import { TastingSliderWithFocus } from '@/components/TastingSliderWithFocus';
import { useCoffee } from '@/contexts/CoffeeContext';
import { SCORE_ATTRIBUTES, PROCESS_OPTIONS, ROAST_OPTIONS, ALTITUDE_OPTIONS } from '@/lib/coffeeTypes';

export default function TastePage() {
  const { draft, updateDraftScore, updateDraftField, toggleFocusedAttribute, saveDraft, resetDraft, isEditingExisting } = useCoffee();
  const [infoOpen, setInfoOpen] = useState(true);

  const handleSave = () => {
    if (!draft.name.trim()) {
      toast.error('Please enter a coffee name before saving.');
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
          </div>
        )}
      </div>

      {/* Scores Section */}
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
