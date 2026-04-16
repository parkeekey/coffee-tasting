// =============================================================
// AromaDescriptorSelector — Optional isolated aroma tags (11)
// =============================================================

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AROMA_DESCRIPTORS } from '@/lib/coffeeTypes';
import { cn } from '@/lib/utils';

interface AromaDescriptorSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function AromaDescriptorSelector({ selected, onChange }: AromaDescriptorSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDescriptor = (descriptor: string) => {
    const next = selected.includes(descriptor)
      ? selected.filter((d) => d !== descriptor)
      : [...selected, descriptor];
    onChange(next);
  };

  return (
    <div className="mt-2 ml-7 border-l-2 border-muted pl-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        <ChevronDown size={14} className={cn('transition-transform', isOpen && 'rotate-180')} />
        <span>👃 Aroma Standard Tags (Optional)</span>
      </button>

      {isOpen && (
        <div className="flex flex-wrap gap-2 pb-2">
          {AROMA_DESCRIPTORS.map((descriptor) => {
            const isSelected = selected.includes(descriptor);
            return (
              <button
                key={descriptor}
                onClick={() => toggleDescriptor(descriptor)}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer',
                  isSelected
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-orange-100 text-orange-900 hover:bg-orange-200'
                )}
              >
                {descriptor}
              </button>
            );
          })}
        </div>
      )}

      {!isOpen && selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((descriptor) => (
            <span
              key={descriptor}
              className="text-xs px-2 py-1 rounded-full bg-orange-500 text-white font-medium"
            >
              {descriptor}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
