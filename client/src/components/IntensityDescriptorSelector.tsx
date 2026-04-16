// =============================================================
// IntensityDescriptorSelector — Collapsible intensity selector
// Features: toggleable intensity levels with flavor descriptors
// =============================================================

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { INTENSITY_DESCRIPTORS, IntensityLevel } from '@/lib/coffeeTypes';
import { cn } from '@/lib/utils';

interface IntensityDescriptorSelectorProps {
  selected: string[];  // e.g. ['💫 Bright', '✨ Crisp', '🌫️ Flat']
  onChange: (selected: string[]) => void;
}

export function IntensityDescriptorSelector({ selected, onChange }: IntensityDescriptorSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedLevels, setExpandedLevels] = useState<Set<IntensityLevel>>(new Set());

  const toggleLevelExpand = (level: IntensityLevel) => {
    const newSet = new Set(expandedLevels);
    if (newSet.has(level)) {
      newSet.delete(level);
    } else {
      newSet.add(level);
    }
    setExpandedLevels(newSet);
  };

  const toggleDescriptor = (descriptor: string) => {
    if (selected.includes(descriptor)) {
      onChange(selected.filter(d => d !== descriptor));
    } else {
      onChange([...selected, descriptor]);
    }
  };

  const levels = Object.keys(INTENSITY_DESCRIPTORS) as IntensityLevel[];

  // Check if any descriptors from this level are selected
  const isLevelPartiallySelected = (level: IntensityLevel): boolean => {
    const descriptors = INTENSITY_DESCRIPTORS[level];
    return descriptors.some(d => selected.includes(d));
  };

  // Get label for intensity level
  const getLevelLabel = (level: IntensityLevel): string => {
    const labels: Record<IntensityLevel, string> = {
      'low': 'Low Intensity',
      'medium': 'Medium Intensity',
      'high': 'High Intensity',
    };
    return labels[level];
  };

  return (
    <div className="mt-2 ml-7 border-l-2 border-muted pl-3">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        <ChevronDown size={14} className={cn('transition-transform', isOpen && 'rotate-180')} />
        <span>⚡ Intensity (Optional)</span>
      </button>

      {/* Expandable content */}
      {isOpen && (
        <div className="space-y-2 pb-2">
          {levels.map((level) => {
            const isExpanded = expandedLevels.has(level);
            const isPartiallySelected = isLevelPartiallySelected(level);
            const descriptors = INTENSITY_DESCRIPTORS[level];

            return (
              <div key={level} className="space-y-1">
                {/* Level header */}
                <button
                  onClick={() => toggleLevelExpand(level)}
                  className={cn(
                    'flex items-center gap-2 w-full text-left px-2 py-1 rounded transition-colors',
                    isPartiallySelected ? 'bg-amber-100 text-amber-900' : 'hover:bg-muted'
                  )}
                >
                  <ChevronDown
                    size={12}
                    className={cn('transition-transform flex-none', isExpanded && 'rotate-180')}
                  />
                  <span className="text-xs font-medium">{getLevelLabel(level)}</span>
                </button>

                {/* Descriptors (clickable tags) */}
                {isExpanded && (
                  <div className="flex flex-wrap gap-2 ml-4">
                    {descriptors.map((descriptor) => {
                      const isSelected = selected.includes(descriptor);
                      return (
                        <button
                          key={descriptor}
                          onClick={() => toggleDescriptor(descriptor)}
                          className={cn(
                            'text-xs px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer',
                            isSelected
                              ? 'bg-amber-500 text-white shadow-md'
                              : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                          )}
                        >
                          {descriptor}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Show selected descriptors if collapsed */}
      {!isOpen && selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((descriptor) => (
            <span
              key={descriptor}
              className="text-xs px-2 py-1 rounded-full bg-amber-500 text-white font-medium"
            >
              {descriptor}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
