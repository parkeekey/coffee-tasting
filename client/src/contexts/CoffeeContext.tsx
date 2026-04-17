// =============================================================
// Coffee Affective Tasting — Global State Context
// Manages all tasting entries, current draft, and UI state
// =============================================================

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  CoffeeEntry,
  TastingScores,
  calculateTotalScore,
  createEmptyEntry,
  inferAcidityTypes,
  loadEntries,
  saveEntries,
} from '@/lib/coffeeTypes';

type Tab = 'taste' | 'pad' | 'log' | 'panel' | 'export';

interface CoffeeContextValue {
  // Entries
  entries: CoffeeEntry[];
  addEntry: (entry: CoffeeEntry) => void;
  updateEntry: (id: string, updates: Partial<CoffeeEntry>) => void;
  deleteEntry: (id: string) => void;
  toggleFavorite: (id: string) => void;

  // Current draft entry being edited
  draft: CoffeeEntry;
  setDraft: React.Dispatch<React.SetStateAction<CoffeeEntry>>;
  updateDraftScore: (key: keyof TastingScores, value: number) => void;
  updateDraftSensoryNote: (key: keyof TastingScores, value: string) => void;
  updateDraftSensoryReaction: (key: keyof TastingScores, value: 'like' | 'soso' | 'dislike' | '') => void;
  updateDraftField: (key: keyof Omit<CoffeeEntry, 'scores' | 'sensoryNotes' | 'sensoryReactions' | 'id' | 'createdAt' | 'updatedAt' | 'totalScore' | 'focusedAttributes'>, value: string | boolean) => void;
  updateDraftAromaDescriptors: (descriptors: string[]) => void;
  updateDraftBrewPours: (pours: import('@/lib/coffeeTypes').BrewPour[]) => void;
  updateDraftSweetnessDescriptors: (descriptors: string[]) => void;
  updateDraftSweetnessDetailDescriptors: (descriptors: string[]) => void;
  updateDraftAcidityDescriptors: (descriptors: string[]) => void;
  updateDraftAcidityTypeDescriptors: (descriptors: string[]) => void;
  updateDraftIntensityDescriptors: (descriptors: string[]) => void;
  updateDraftMouthfeelDescriptors: (descriptors: string[]) => void;
  updateDraftAftertasteDescriptors: (descriptors: string[]) => void;
  updateDraftOverallDescriptors: (descriptors: string[]) => void;
  toggleFocusedAttribute: (key: keyof TastingScores) => void;
  saveDraft: () => void;
  resetDraft: () => void;
  editEntry: (id: string) => void;
  isEditingExisting: boolean;

  // UI state
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const CoffeeContext = createContext<CoffeeContextValue | null>(null);

export function CoffeeProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<CoffeeEntry[]>(() => loadEntries());
  const [draft, setDraft] = useState<CoffeeEntry>(() => createEmptyEntry(1));
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('taste');

  // Persist entries to localStorage whenever they change
  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  const addEntry = useCallback((entry: CoffeeEntry) => {
    setEntries(prev => [entry, ...prev]);
  }, []);

  const updateEntry = useCallback((id: string, updates: Partial<CoffeeEntry>) => {
    setEntries(prev => prev.map(e => {
      if (e.id !== id) return e;
      const updated = { ...e, ...updates, updatedAt: new Date().toISOString() };
      if (updates.scores) {
        updated.totalScore = calculateTotalScore(updates.scores);
      }
      return updated;
    }));
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setEntries(prev => prev.map(e =>
      e.id === id ? { ...e, isFavorite: !e.isFavorite, updatedAt: new Date().toISOString() } : e
    ));
  }, []);

  const toggleFocusedAttribute = useCallback((key: keyof TastingScores) => {
    setDraft(prev => {
      const isFocused = prev.focusedAttributes.includes(key);
      return {
        ...prev,
        focusedAttributes: isFocused
          ? prev.focusedAttributes.filter(k => k !== key)
          : [...prev.focusedAttributes, key],
      };
    });
  }, []);

  const updateDraftScore = useCallback((key: keyof TastingScores, value: number) => {
    setDraft(prev => {
      const newScores = { ...prev.scores, [key]: value };
      return { ...prev, scores: newScores, totalScore: calculateTotalScore(newScores) };
    });
  }, []);

  const updateDraftSensoryNote = useCallback((key: keyof TastingScores, value: string) => {
    setDraft(prev => ({
      ...prev,
      sensoryNotes: {
        ...prev.sensoryNotes,
        [key]: value,
      },
    }));
  }, []);

  const updateDraftSensoryReaction = useCallback((key: keyof TastingScores, value: 'like' | 'soso' | 'dislike' | '') => {
    setDraft(prev => ({
      ...prev,
      sensoryReactions: {
        ...prev.sensoryReactions,
        [key]: value,
      },
    }));
  }, []);

  const updateDraftField = useCallback((
    key: keyof Omit<CoffeeEntry, 'scores' | 'sensoryNotes' | 'sensoryReactions' | 'id' | 'createdAt' | 'updatedAt' | 'totalScore'>,
    value: string | boolean
  ) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateDraftSweetnessDescriptors = useCallback((descriptors: string[]) => {
    setDraft(prev => ({ ...prev, sweetnessDescriptors: descriptors }));
  }, []);

  const updateDraftAromaDescriptors = useCallback((descriptors: string[]) => {
    setDraft(prev => ({ ...prev, aromaDescriptors: descriptors }));
  }, []);

  const updateDraftBrewPours = useCallback((pours: import('@/lib/coffeeTypes').BrewPour[]) => {
    setDraft(prev => ({ ...prev, brewPours: pours }));
  }, []);

  const updateDraftSweetnessDetailDescriptors = useCallback((descriptors: string[]) => {
    setDraft(prev => ({ ...prev, sweetnessDetailDescriptors: descriptors }));
  }, []);

  const updateDraftAcidityDescriptors = useCallback((descriptors: string[]) => {
    setDraft(prev => ({
      ...prev,
      acidityDescriptors: descriptors,
      acidityTypeDescriptors: inferAcidityTypes(descriptors),
    }));
  }, []);

  const updateDraftAcidityTypeDescriptors = useCallback((descriptors: string[]) => {
    setDraft(prev => ({ ...prev, acidityTypeDescriptors: descriptors }));
  }, []);

  const updateDraftIntensityDescriptors = useCallback((descriptors: string[]) => {
    setDraft(prev => ({ ...prev, intensityDescriptors: descriptors }));
  }, []);

  const updateDraftMouthfeelDescriptors = useCallback((descriptors: string[]) => {
    setDraft(prev => ({ ...prev, mouthfeelDescriptors: descriptors }));
  }, []);

  const updateDraftAftertasteDescriptors = useCallback((descriptors: string[]) => {
    setDraft(prev => ({ ...prev, aftertasteDescriptors: descriptors }));
  }, []);

  const updateDraftOverallDescriptors = useCallback((descriptors: string[]) => {
    setDraft(prev => ({ ...prev, overallDescriptors: descriptors }));
  }, []);

  const saveDraft = useCallback(() => {
    const now = new Date().toISOString();
    if (isEditingExisting) {
      updateEntry(draft.id, { ...draft, updatedAt: now });
      setIsEditingExisting(false);
    } else {
      const nextIndex = entries.length + 1;
      const toSave: CoffeeEntry = {
        ...draft,
        sampleIndex: draft.sampleIndex || `S-${String(nextIndex).padStart(2, '0')}`,
        createdAt: now,
        updatedAt: now,
      };
      addEntry(toSave);
    }
    // Reset draft with next index
    const nextIdx = entries.length + (isEditingExisting ? 1 : 2);
    setDraft(createEmptyEntry(nextIdx));
  }, [draft, entries.length, isEditingExisting, addEntry, updateEntry]);

  const resetDraft = useCallback(() => {
    setIsEditingExisting(false);
    setDraft(createEmptyEntry(entries.length + 1));
  }, [entries.length]);

  const editEntry = useCallback((id: string) => {
    const entry = entries.find(e => e.id === id);
    if (entry) {
      setDraft({ ...entry });
      setIsEditingExisting(true);
      setActiveTab('taste');
    }
  }, [entries]);

  return (
    <CoffeeContext.Provider value={{
      entries, addEntry, updateEntry, deleteEntry, toggleFavorite,
      draft, setDraft, updateDraftScore, updateDraftSensoryNote, updateDraftSensoryReaction, updateDraftField, updateDraftAromaDescriptors, updateDraftBrewPours, updateDraftSweetnessDescriptors, updateDraftSweetnessDetailDescriptors, updateDraftAcidityDescriptors, updateDraftAcidityTypeDescriptors, updateDraftIntensityDescriptors, updateDraftMouthfeelDescriptors, updateDraftAftertasteDescriptors, updateDraftOverallDescriptors,
      toggleFocusedAttribute,
      saveDraft, resetDraft, editEntry, isEditingExisting,
      activeTab, setActiveTab,
    }}>
      {children}
    </CoffeeContext.Provider>
  );
}

export function useCoffee() {
  const ctx = useContext(CoffeeContext);
  if (!ctx) throw new Error('useCoffee must be used within CoffeeProvider');
  return ctx;
}
