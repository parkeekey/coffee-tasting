// =============================================================
// MouthfeelDescriptorSelector — Collapsible mouthfeel taxonomy selector
// Features: primary groups (Body/Texture), subtype groups, clickable tags
// =============================================================

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { MOUTHFEEL_DESCRIPTORS, MouthfeelPrimaryType, MouthfeelSubtype } from '@/lib/coffeeTypes';
import { cn } from '@/lib/utils';

interface MouthfeelDescriptorSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function MouthfeelDescriptorSelector({ selected, onChange }: MouthfeelDescriptorSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedPrimary, setExpandedPrimary] = useState<Set<MouthfeelPrimaryType>>(new Set());
  const [expandedSubtypes, setExpandedSubtypes] = useState<Set<string>>(new Set());

  const primaryTypes = Object.keys(MOUTHFEEL_DESCRIPTORS) as MouthfeelPrimaryType[];

  const togglePrimaryExpand = (primary: MouthfeelPrimaryType) => {
    const next = new Set(expandedPrimary);
    if (next.has(primary)) next.delete(primary);
    else next.add(primary);
    setExpandedPrimary(next);
  };

  const subtypeKey = (primary: MouthfeelPrimaryType, subtype: string) => `${primary}:${subtype}`;

  const toggleSubtypeExpand = (primary: MouthfeelPrimaryType, subtype: string) => {
    const key = subtypeKey(primary, subtype);
    const next = new Set(expandedSubtypes);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExpandedSubtypes(next);
  };

  const toggleDescriptor = (descriptor: string) => {
    if (selected.includes(descriptor)) {
      onChange(selected.filter((d) => d !== descriptor));
    } else {
      onChange([...selected, descriptor]);
    }
  };

  const isPrimaryPartiallySelected = (primary: MouthfeelPrimaryType): boolean => {
    const group = MOUTHFEEL_DESCRIPTORS[primary];
    return Object.values(group).flat().some((d) => selected.includes(d));
  };

  const isSubtypePartiallySelected = (primary: MouthfeelPrimaryType, subtype: string): boolean => {
    const descriptors = MOUTHFEEL_DESCRIPTORS[primary][subtype as MouthfeelSubtype] as readonly string[];
    return descriptors.some((d) => selected.includes(d));
  };

  return (
    <div className="mt-2 ml-7 border-l-2 border-muted pl-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        <ChevronDown size={14} className={cn('transition-transform', isOpen && 'rotate-180')} />
        <span>☕ Mouthfeel Types (Optional)</span>
      </button>

      {isOpen && (
        <div className="space-y-2 pb-2">
          {primaryTypes.map((primary) => {
            const isPrimaryExpanded = expandedPrimary.has(primary);
            const primarySelected = isPrimaryPartiallySelected(primary);
            const subtypes = Object.keys(MOUTHFEEL_DESCRIPTORS[primary]) as MouthfeelSubtype[];

            return (
              <div key={primary} className="space-y-1">
                <button
                  onClick={() => togglePrimaryExpand(primary)}
                  className={cn(
                    'flex items-center gap-2 w-full text-left px-2 py-1 rounded transition-colors',
                    primarySelected ? 'bg-blue-100 text-blue-900' : 'hover:bg-muted'
                  )}
                >
                  <ChevronDown
                    size={12}
                    className={cn('transition-transform flex-none', isPrimaryExpanded && 'rotate-180')}
                  />
                  <span className="text-xs font-medium">{primary}</span>
                </button>

                {isPrimaryExpanded && (
                  <div className="ml-3 space-y-1">
                    {subtypes.map((subtype) => {
                      const key = subtypeKey(primary, subtype);
                      const isSubtypeExpanded = expandedSubtypes.has(key);
                      const subtypeSelected = isSubtypePartiallySelected(primary, subtype);
                      const descriptors = MOUTHFEEL_DESCRIPTORS[primary][subtype] as readonly string[];

                      return (
                        <div key={key} className="space-y-1">
                          <button
                            onClick={() => toggleSubtypeExpand(primary, subtype)}
                            className={cn(
                              'flex items-center gap-2 w-full text-left px-2 py-1 rounded transition-colors',
                              subtypeSelected ? 'bg-blue-50 text-blue-800' : 'hover:bg-muted/70'
                            )}
                          >
                            <ChevronDown
                              size={12}
                              className={cn('transition-transform flex-none', isSubtypeExpanded && 'rotate-180')}
                            />
                            <span className="text-xs">{subtype}</span>
                          </button>

                          {isSubtypeExpanded && (
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
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'bg-blue-100 text-blue-900 hover:bg-blue-200'
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
              className="text-xs px-2 py-1 rounded-full bg-blue-500 text-white font-medium"
            >
              {descriptor}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
