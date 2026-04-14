// =============================================================
// TastingSlider — Interactive slider row for a single attribute
// Features: large touch target, ±1 buttons, animated value badge
// =============================================================

import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface TastingSliderProps {
  emoji: string;
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
}

const VALUE_LABELS: Record<number, string> = {
  1: 'Absent', 2: 'Faint', 3: 'Slight', 4: 'Moderate',
  5: 'Good', 6: 'Fine', 7: 'Notable', 8: 'Excellent', 9: 'Extraordinary',
};

function getValueColor(v: number): string {
  if (v <= 2) return '#c0392b';
  if (v <= 4) return '#e67e22';
  if (v <= 6) return '#d4860a';
  if (v <= 7) return '#7a9e7e';
  return '#4a7c59';
}

export function TastingSlider({ emoji, label, description, value, onChange }: TastingSliderProps) {
  const clamp = (v: number) => Math.max(1, Math.min(9, v));
  const color = getValueColor(value);

  return (
    <div className="py-3 border-b border-border last:border-0">
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{emoji}</span>
          <div>
            <span className="text-sm font-medium text-foreground">{label}</span>
            <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">{description}</span>
          </div>
        </div>
        {/* Value badge */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onChange(clamp(value - 1))}
            className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors active:scale-95"
            aria-label={`Decrease ${label}`}
          >
            −
          </button>
          <div
            className="w-10 h-8 rounded-lg flex items-center justify-center font-mono-custom font-bold text-sm transition-colors"
            style={{ backgroundColor: `${color}18`, color }}
          >
            {value}
          </div>
          <button
            onClick={() => onChange(clamp(value + 1))}
            className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors active:scale-95"
            aria-label={`Increase ${label}`}
          >
            +
          </button>
        </div>
      </div>

      {/* Slider */}
      <div className="coffee-slider px-1">
        <Slider
          min={1}
          max={9}
          step={1}
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          className="w-full"
        />
      </div>

      {/* Scale labels */}
      <div className="flex justify-between mt-1 px-1">
        <span className="text-[10px] text-muted-foreground">1</span>
        <span
          className={cn(
            "text-[10px] font-medium transition-colors",
          )}
          style={{ color }}
        >
          {VALUE_LABELS[value]}
        </span>
        <span className="text-[10px] text-muted-foreground">9</span>
      </div>
    </div>
  );
}
