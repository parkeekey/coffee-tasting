// =============================================================
// TastingSliderWithFocus — Slider with focus toggle flag
// Features: large touch target, ±1 buttons, focus flag, subtle color highlight
// =============================================================

import { Slider } from '@/components/ui/slider';
import { Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TastingSliderWithFocusProps {
  emoji: string;
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  isFocused: boolean;
  onFocusToggle: () => void;
}

const VALUE_LABELS: Record<number, string> = {
  1: 'Absent', 2: 'Faint', 3: 'Slight', 4: 'Moderate',
  5: 'Good', 6: 'Fine', 7: 'Notable', 8: 'Excellent', 9: 'Extraordinary',
};

// Fixed unique color for each attribute
const ATTRIBUTE_COLORS: Record<string, string> = {
  fragrance: '#e74c3c',    // red
  aroma: '#e67e22',        // orange
  acidity: '#f39c12',      // golden
  sweetness: '#f1c40f',    // yellow
  flavor: '#27ae60',       // green
  mouthfeel: '#3498db',    // blue
  aftertaste: '#9b59b6',   // purple
  overall: '#34495e',      // dark gray
};

function getValueColor(v: number): string {
  if (v <= 2) return '#c0392b';
  if (v <= 4) return '#e67e22';
  if (v <= 6) return '#d4860a';
  if (v <= 7) return '#7a9e7e';
  return '#4a7c59';
}

export function TastingSliderWithFocus({
  emoji,
  label,
  description,
  value,
  onChange,
  isFocused,
  onFocusToggle,
}: TastingSliderWithFocusProps) {
  const clamp = (v: number) => Math.max(1, Math.min(9, v));
  const color = getValueColor(value);
  // Get the attribute key from label (lowercase)
  const attributeKey = label.toLowerCase().replace(/\s+/g, '');
  const attributeColor = ATTRIBUTE_COLORS[attributeKey] || '#d4860a';

  return (
    <div
      className={cn(
        'py-3 border-b border-border last:border-0 px-3 -mx-3 rounded-lg transition-colors',
        isFocused ? 'rounded-lg' : 'bg-transparent'
      )}
      style={isFocused ? { backgroundColor: `${attributeColor}20` } : {}}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-lg leading-none">{emoji}</span>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-foreground">{label}</span>
            <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">{description}</span>
          </div>
        </div>

        {/* Focus flag button */}
        <button
          onClick={onFocusToggle}
          className={cn(
            'flex-none w-7 h-7 rounded-lg flex items-center justify-center transition-all ml-2',
            isFocused
              ? 'bg-amber-300 text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
          title={isFocused ? 'Focused — Click to remove' : 'Click to focus on this attribute'}
          aria-label={`${isFocused ? 'Remove' : 'Set'} focus on ${label}`}
        >
          <Flag size={14} className={isFocused ? 'fill-current' : ''} />
        </button>

        {/* Value badge */}
        <div className="flex items-center gap-1.5 ml-2">
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
          className="text-[10px] font-medium transition-colors"
          style={{ color }}
        >
          {VALUE_LABELS[value]}
        </span>
        <span className="text-[10px] text-muted-foreground">9</span>
      </div>
    </div>
  );
}
