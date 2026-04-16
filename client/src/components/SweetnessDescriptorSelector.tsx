// =============================================================
// SweetnessDescriptorSelector — quick sweetness family selector
// Features: one-button family tags + optional detail tags per selected family
// =============================================================

import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SWEETNESS_DESCRIPTORS, SweetnessFamily } from '@/lib/coffeeTypes';
import { cn } from '@/lib/utils';

interface SweetnessDescriptorSelectorProps {
  selectedFamilies: string[];
  selectedDetails: string[];
  onFamiliesChange: (selected: string[]) => void;
  onDetailsChange: (selected: string[]) => void;
}

export function SweetnessDescriptorSelector({
  selectedFamilies,
  selectedDetails,
  onFamiliesChange,
  onDetailsChange,
}: SweetnessDescriptorSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const families = Object.keys(SWEETNESS_DESCRIPTORS) as SweetnessFamily[];

  const allowedDetails = useMemo(
    () => selectedFamilies.flatMap((family) => SWEETNESS_DESCRIPTORS[family as SweetnessFamily] as readonly string[]),
    [selectedFamilies]
  );

  const toggleFamily = (family: SweetnessFamily) => {
    const isSelected = selectedFamilies.includes(family);
    const nextFamilies = isSelected
      ? selectedFamilies.filter((f) => f !== family)
      : [...selectedFamilies, family];

    onFamiliesChange(nextFamilies);

    // Keep details only for currently selected families
    const nextAllowedDetails = nextFamilies.flatMap(
      (f) => SWEETNESS_DESCRIPTORS[f as SweetnessFamily] as readonly string[]
    );
    onDetailsChange(selectedDetails.filter((d) => nextAllowedDetails.includes(d)));
  };

  const toggleDetail = (detail: string) => {
    if (selectedDetails.includes(detail)) {
      onDetailsChange(selectedDetails.filter((d) => d !== detail));
    } else {
      onDetailsChange([...selectedDetails, detail]);
    }
  };

  return (
    <div className="mt-2 ml-7 border-l-2 border-muted pl-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        <ChevronDown size={14} className={cn('transition-transform', isOpen && 'rotate-180')} />
        <span>🍬 Sweetness Style (Optional)</span>
      </button>

      {isOpen && (
        <div className="space-y-2 pb-2">
          <div className="flex flex-wrap gap-2">
            {families.map((family) => {
              const isSelected = selectedFamilies.includes(family);
              return (
                <button
                  key={family}
                  onClick={() => toggleFamily(family)}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer',
                    isSelected
                      ? 'bg-yellow-500 text-white shadow-md'
                      : 'bg-yellow-100 text-yellow-900 hover:bg-yellow-200'
                  )}
                >
                  {family}
                </button>
              );
            })}
          </div>

          {selectedFamilies.length > 0 && (
            <div className="pt-1">
              <p className="text-[11px] text-muted-foreground mb-1">Optional details</p>
              <div className="flex flex-wrap gap-2">
                {allowedDetails.map((detail) => {
                  const isSelected = selectedDetails.includes(detail);
                  return (
                    <button
                      key={detail}
                      onClick={() => toggleDetail(detail)}
                      className={cn(
                        'text-xs px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer border',
                        isSelected
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-orange-900 border-orange-200 hover:bg-orange-50'
                      )}
                    >
                      {detail}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {!isOpen && (selectedFamilies.length > 0 || selectedDetails.length > 0) && (
        <div className="flex flex-wrap gap-1">
          {selectedFamilies.map((family) => (
            <span
              key={family}
              className="text-xs px-2 py-1 rounded-full bg-yellow-500 text-white font-medium"
            >
              {family}
            </span>
          ))}
          {selectedDetails.map((detail) => (
            <span
              key={detail}
              className="text-xs px-2 py-1 rounded-full bg-orange-500 text-white font-medium"
            >
              {detail}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
