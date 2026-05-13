// =============================================================
// HierarchicalFlavorNoteSelector — SCA Memory-Based Flavor Notes
// =============================================================
// 3-Level Structure:
// L1: Memory/Association (single - e.g. "Childhood", "Favorite Moment")
// L2: Item Types (multiple - e.g. "Food", "Drink", "Plant/Herb")
// L3: SCA Flavor Categories (multiple - e.g. "🌸 Floral", "🍏 Fruity")
// Plus optional specific note for free-text memory detail
// =============================================================

import { useState } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  HierarchicalFlavorNote,
  FLAVOR_CATEGORIES,
  ITEM_TYPES,
  DEFAULT_MEMORY_TAGS,
} from '@/lib/coffeeTypes';

interface HierarchicalFlavorNoteSelectorProps {
  notes: HierarchicalFlavorNote[];
  onChange: (notes: HierarchicalFlavorNote[]) => void;
  customMemoryTags?: string[];
}

export function HierarchicalFlavorNoteSelector({
  notes,
  onChange,
  customMemoryTags = [],
}: HierarchicalFlavorNoteSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  // Form state for adding new note
  const [selectedMemory, setSelectedMemory] = useState<string>(DEFAULT_MEMORY_TAGS[0]);
  const [selectedItemTypes, setSelectedItemTypes] = useState<Set<string>>(new Set([ITEM_TYPES[0]]));
  const [selectedFlavors, setSelectedFlavors] = useState<Set<string>>(new Set([FLAVOR_CATEGORIES[0]]));
  const [specificNote, setSpecificNote] = useState('');

  const allMemoryTags = [...DEFAULT_MEMORY_TAGS, ...customMemoryTags];

  const toggleItemType = (itemType: string) => {
    const newSet = new Set(selectedItemTypes);
    if (newSet.has(itemType)) {
      newSet.delete(itemType);
    } else {
      newSet.add(itemType);
    }
    setSelectedItemTypes(newSet);
  };

  const toggleFlavorCategory = (flavor: string) => {
    const newSet = new Set(selectedFlavors);
    if (newSet.has(flavor)) {
      newSet.delete(flavor);
    } else {
      newSet.add(flavor);
    }
    setSelectedFlavors(newSet);
  };

  const handleAddNote = () => {
    if (!selectedMemory || selectedItemTypes.size === 0 || selectedFlavors.size === 0) {
      return;
    }

    const newNote: HierarchicalFlavorNote = {
      id: Date.now().toString(),
      memory: selectedMemory,
      detailTypes: Array.from(selectedItemTypes),
      flavorCategories: Array.from(selectedFlavors),
      specificNote: specificNote.trim() || undefined,
    };

    onChange([...notes, newNote]);

    // Reset form
    setSelectedMemory(DEFAULT_MEMORY_TAGS[0]);
    setSelectedItemTypes(new Set([ITEM_TYPES[0]]));
    setSelectedFlavors(new Set([FLAVOR_CATEGORIES[0]]));
    setSpecificNote('');
    setFormOpen(false);
  };

  const handleRemoveNote = (id: string) => {
    onChange(notes.filter((n) => n.id !== id));
  };

  return (
    <div className="mt-2 ml-7 border-l-2 border-muted pl-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        <ChevronDown size={14} className={cn('transition-transform', isOpen && 'rotate-180')} />
        <span>🧠 Sensory Memory Notes (Hierarchical)</span>
      </button>

      {isOpen && (
        <div className="pb-2 space-y-3">
          {/* Display existing notes */}
          {notes.length > 0 && (
            <div className="space-y-2 pb-2 border-b border-muted">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-start gap-2 p-2 rounded bg-muted/50 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground">{note.memory}</div>
                    <div className="text-muted-foreground">
                      {note.detailTypes.join(', ')} → {note.flavorCategories.join(', ')}
                    </div>
                    {note.specificNote && (
                      <div className="text-muted-foreground italic mt-1">"{note.specificNote}"</div>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveNote(note.id)}
                    className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors flex-shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add note button */}
          {!formOpen && (
            <Button
              onClick={() => setFormOpen(true)}
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              <Plus size={14} className="mr-1" />
              Add Memory Note
            </Button>
          )}

          {/* Form for adding new note */}
          {formOpen && (
            <div className="space-y-3 p-3 bg-muted/30 rounded border border-muted">
              {/* Level 1: Memory (single selection) */}
              <div>
                <Label className="text-xs font-medium mb-1.5 block">
                  Level 1: What comes to mind first?
                </Label>
                <Select value={selectedMemory} onValueChange={setSelectedMemory}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allMemoryTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Optional specific note for memory */}
              <div>
                <Label htmlFor="specific-note" className="text-xs font-medium mb-1.5 block">
                  What's the specific detail? (e.g., "grandma's kitchen")
                </Label>
                <Input
                  id="specific-note"
                  placeholder="Optional: describe the memory..."
                  value={specificNote}
                  onChange={(e) => setSpecificNote(e.target.value)}
                  className="h-7 text-xs"
                />
              </div>

              {/* Level 2: Item Types (multiple selection) */}
              <div>
                <Label className="text-xs font-medium mb-1.5 block">
                  Level 2: What items from that memory? (Select multiple)
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {ITEM_TYPES.map((itemType) => (
                    <button
                      key={itemType}
                      onClick={() => toggleItemType(itemType)}
                      className={cn(
                        'text-xs px-2 py-1 rounded border transition-all',
                        selectedItemTypes.has(itemType)
                          ? 'bg-blue-500 text-white border-blue-600'
                          : 'bg-white text-foreground border-muted hover:border-muted-foreground'
                      )}
                    >
                      {itemType}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level 3: Flavor Categories (multiple selection) */}
              <div>
                <Label className="text-xs font-medium mb-1.5 block">
                  Level 3: Map to flavor categories (Select multiple)
                </Label>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                  {FLAVOR_CATEGORIES.map((flavor) => (
                    <button
                      key={flavor}
                      onClick={() => toggleFlavorCategory(flavor)}
                      className={cn(
                        'text-xs px-2 py-1.5 rounded border transition-all text-left',
                        selectedFlavors.has(flavor)
                          ? 'bg-green-500 text-white border-green-600'
                          : 'bg-white text-foreground border-muted hover:border-muted-foreground'
                      )}
                    >
                      {flavor}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleAddNote}
                  size="sm"
                  className="h-7 text-xs flex-1"
                  disabled={selectedItemTypes.size === 0 || selectedFlavors.size === 0}
                >
                  Add Note
                </Button>
                <Button
                  onClick={() => setFormOpen(false)}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

