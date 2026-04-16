// =============================================================
// AftertasteDescriptorSelector — Collapsible aftertaste length selector
// Features: Length subtype groups and clickable tags
// =============================================================

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AFTERTASTE_DESCRIPTORS, AftertasteType, AftertasteSubtype } from '@/lib/coffeeTypes';
import { cn } from '@/lib/utils';

interface AftertasteDescriptorSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function AftertasteDescriptorSelector({ selected, onChange }: AftertasteDescriptorSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedTypes, setExpandedTypes] = useState<Set<AftertasteType>>(new Set());

  const types = Object.keys(AFTERTASTE_DESCRIPTORS) as AftertasteType[];

  const toggleTypeExpand = (type: AftertasteType) => {
    const next = new Set(expandedTypes);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    setExpandedTypes(next);
  };

  const toggleDescriptor = (descriptor: string) => {
    if (selected.includes(descriptor)) {
      onChange(selected.filter((d) => d !== descriptor));
    } else {
      onChange([...selected, descriptor]);
    }
  };

  const isTypePartiallySelected = (type: AftertasteType): boolean => {
    const group = AFTERTASTE_DESCRIPTORS[type];
    return Object.values(group).flat().some((d) => selected.includes(d));
  };

  return (
    <div className="mt-2 ml-7 border-l-2 border-muted pl-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        <ChevronDown size={14} className={cn('transition-transform', isOpen && 'rotate-180')} />
        <span>✨ Length (Optional)</span>
      </button>

      {isOpen && (
        <div className="space-y-2 pb-2">
          {types.map((type) => {
            const isExpanded = expandedTypes.has(type);
            const isPartiallySelected = isTypePartiallySelected(type);
            const subtypes = Object.keys(AFTERTASTE_DESCRIPTORS[type]) as AftertasteSubtype[];

            return (
              <div key={type} className="space-y-1">
                <button
                  onClick={() => toggleTypeExpand(type)}
                  className={cn(
                    'flex items-center gap-2 w-full text-left px-2 py-1 rounded transition-colors',
                    isPartiallySelected ? 'bg-purple-100 text-purple-900' : 'hover:bg-muted'
                  )}
                >
                  <ChevronDown
                    size={12}
                    className={cn('transition-transform flex-none', isExpanded && 'rotate-180')}
                  />
                  <span className="text-xs font-medium">{type}</span>
                </button>

                {isExpanded && (
                  <div className="ml-3 space-y-1">
                    {subtypes.map((subtype) => {
                      const descriptors = AFTERTASTE_DESCRIPTORS[type][subtype] as readonly string[];
                      const isSubtypeSelected = descriptors.some((d) => selected.includes(d));
                      return (
                        <div key={`${type}:${subtype}`} className="space-y-1">
                          <div
                            className={cn(
                              'text-xs px-2 py-1 rounded',
                              isSubtypeSelected ? 'bg-purple-50 text-purple-800' : 'text-muted-foreground'
                            )}
                          >
                            {subtype}
                          </div>
                          <div className="flex flex-wrap gap-2 ml-2">
                            {descriptors.map((descriptor) => {
                              const isSelected = selected.includes(descriptor);
                              return (
                                <button
                                  key={descriptor}
                                  onClick={() => toggleDescriptor(descriptor)}
                                  className={cn(
                                    'text-xs px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer',
                                    isSelected
                                      ? 'bg-purple-500 text-white shadow-md'
                                      : 'bg-purple-100 text-purple-900 hover:bg-purple-200'
                                  )}
                                >
                                  {descriptor}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!isOpen && selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((descriptor) => (
            <span
              key={descriptor}
              className="text-xs px-2 py-1 rounded-full bg-purple-500 text-white font-medium"
            >
              {descriptor}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
