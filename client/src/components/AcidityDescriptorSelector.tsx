// =============================================================
// AcidityDescriptorSelector — Acid-type-first collapsible selector
// Primary groups: Citric → Malic → Tartaric → Phosphoric → Quinic
// Flavor tags nested under each acid type
// Auto-detects active acid types from selected flavor tags
// =============================================================

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ACIDITY_DESCRIPTORS, AcidityTypeGroup, inferAcidityTypes } from '@/lib/coffeeTypes';
import { cn } from '@/lib/utils';

interface AcidityDescriptorSelectorProps {
  selected: string[];
  autoSelectedTypes?: string[];
  onChange: (selected: string[]) => void;
  onAutoTypesChange?: (types: string[]) => void;
}

export function AcidityDescriptorSelector({
  selected,
  autoSelectedTypes,
  onChange,
  onAutoTypesChange,
}: AcidityDescriptorSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedTypes, setExpandedTypes] = useState<Set<AcidityTypeGroup>>(new Set());

  const toggleTypeExpand = (acidType: AcidityTypeGroup) => {
    const next = new Set(expandedTypes);
    if (next.has(acidType)) {
      next.delete(acidType);
    } else {
      next.add(acidType);
    }
    setExpandedTypes(next);
  };

  const toggleDescriptor = (descriptor: string) => {
    const nextSelected = selected.includes(descriptor)
      ? selected.filter((d) => d !== descriptor)
      : [...selected, descriptor];

    onChange(nextSelected);
    onAutoTypesChange?.(inferAcidityTypes(nextSelected));
  };

  const acidTypes = Object.keys(ACIDITY_DESCRIPTORS) as AcidityTypeGroup[];

  const hasSelectionInType = (acidType: AcidityTypeGroup): boolean => {
    const descriptors = ACIDITY_DESCRIPTORS[acidType];
    return (descriptors as readonly string[]).some((d) => selected.includes(d));
  };

  const activeTypes = autoSelectedTypes ?? inferAcidityTypes(selected);

  return (
    <div className="mt-2 ml-7 border-l-2 border-muted pl-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        <ChevronDown size={14} className={cn('transition-transform', isOpen && 'rotate-180')} />
        <span>🧪 Acidity Type & Flavor Profile (Optional)</span>
      </button>

      {/* Active acid types summary badges */}
      {activeTypes.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {activeTypes.map((type) => (
            <span
              key={type}
              className="text-xs px-2 py-1 rounded-full bg-amber-700 text-white font-medium"
            >
              {type}
            </span>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="space-y-2 pb-2">
          {acidTypes.map((acidType) => {
            const isExpanded = expandedTypes.has(acidType);
            const hasSelection = hasSelectionInType(acidType);
            const descriptors = ACIDITY_DESCRIPTORS[acidType];

            return (
              <div key={acidType} className="space-y-1">
                {/* Acid type header — expand/collapse */}
                <button
                  onClick={() => toggleTypeExpand(acidType)}
                  className={cn(
                    'flex items-center gap-2 w-full text-left px-2 py-1 rounded transition-colors',
                    hasSelection ? 'bg-amber-100 text-amber-900' : 'hover:bg-muted'
                  )}
                >
                  <ChevronDown
                    size={12}
                    className={cn('transition-transform flex-none', isExpanded && 'rotate-180')}
                  />
                  <span className="text-xs font-semibold">{acidType}</span>
                  {hasSelection && (
                    <span className="ml-auto text-xs text-amber-600 font-medium">✓</span>
                  )}
                </button>

                {/* Flavor tags under the acid type */}
                {isExpanded && (
                  <div className="flex flex-wrap gap-2 ml-4">
                    {(descriptors as readonly string[]).map((descriptor) => {
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

      {/* Collapsed summary of selected flavor tags */}
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
