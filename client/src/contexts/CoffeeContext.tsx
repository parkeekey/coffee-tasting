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
  importEntries: (incoming: unknown, mode?: 'merge' | 'replace') => { imported: number; skipped: number };

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
  showPadScore100: boolean;
  setShowPadScore100: (show: boolean) => void;
}

const CoffeeContext = createContext<CoffeeContextValue | null>(null);
const UI_SETTINGS_KEY = 'coffee-tasting-ui-settings';

export function CoffeeProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<CoffeeEntry[]>(() => loadEntries());
  const [draft, setDraft] = useState<CoffeeEntry>(() => createEmptyEntry(1));
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('taste');
  const [showPadScore100, setShowPadScore100] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(UI_SETTINGS_KEY);
      if (!raw) return true;
      const parsed = JSON.parse(raw) as { showPadScore100?: unknown };
      return typeof parsed.showPadScore100 === 'boolean' ? parsed.showPadScore100 : true;
    } catch {
      return true;
    }
  });

  const normalizeImportedEntry = useCallback((entry: Partial<CoffeeEntry>, fallbackIndex: number): CoffeeEntry | null => {
    const scores = entry.scores as Partial<TastingScores> | undefined;
    if (!scores) return null;

    const scoreKeys: (keyof TastingScores)[] = ['fragrance', 'aroma', 'acidity', 'sweetness', 'flavor', 'mouthfeel', 'aftertaste', 'overall'];
    const normalizedScores = scoreKeys.reduce((acc, key) => {
      const raw = Number(scores[key]);
      const value = Number.isFinite(raw) ? Math.max(0, Math.min(9, raw)) : 0;
      acc[key] = value;
      return acc;
    }, {} as TastingScores);

    const base = createEmptyEntry(fallbackIndex);
    const now = new Date().toISOString();

    return {
      ...base,
      ...entry,
      id: typeof entry.id === 'string' && entry.id.trim() ? entry.id : `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sampleIndex: typeof entry.sampleIndex === 'string' && entry.sampleIndex.trim() ? entry.sampleIndex : base.sampleIndex,
      name: typeof entry.name === 'string' ? entry.name : '',
      origin: typeof entry.origin === 'string' ? entry.origin : '',
      process: typeof entry.process === 'string' ? entry.process : base.process,
      altitude: typeof entry.altitude === 'string' ? entry.altitude : base.altitude,
      roastLevel: typeof entry.roastLevel === 'string' ? entry.roastLevel : base.roastLevel,
      roaster: typeof entry.roaster === 'string' ? entry.roaster : '',
      notes: typeof entry.notes === 'string' ? entry.notes : '',
      entryMode: entry.entryMode ?? ((entry.notes ?? '').includes('[TastePad]') ? 'pad' : 'tasting'),
      isBlindMode: entry.isBlindMode ?? (entry.notes ?? '').includes('[Blind Mode]'),
      focusedAttributes: Array.isArray(entry.focusedAttributes) ? entry.focusedAttributes.filter(Boolean) : [],
      aromaDescriptors: Array.isArray(entry.aromaDescriptors) ? entry.aromaDescriptors.filter(Boolean) : [],
      sweetnessDescriptors: Array.isArray(entry.sweetnessDescriptors) ? entry.sweetnessDescriptors.filter(Boolean) : [],
      sweetnessDetailDescriptors: Array.isArray(entry.sweetnessDetailDescriptors) ? entry.sweetnessDetailDescriptors.filter(Boolean) : [],
      acidityDescriptors: Array.isArray(entry.acidityDescriptors) ? entry.acidityDescriptors.filter(Boolean) : [],
      acidityTypeDescriptors: Array.isArray(entry.acidityTypeDescriptors) ? entry.acidityTypeDescriptors.filter(Boolean) : [],
      intensityDescriptors: Array.isArray(entry.intensityDescriptors) ? entry.intensityDescriptors.filter(Boolean) : [],
      mouthfeelDescriptors: Array.isArray(entry.mouthfeelDescriptors) ? entry.mouthfeelDescriptors.filter(Boolean) : [],
      aftertasteDescriptors: Array.isArray(entry.aftertasteDescriptors) ? entry.aftertasteDescriptors.filter(Boolean) : [],
      overallDescriptors: Array.isArray(entry.overallDescriptors) ? entry.overallDescriptors.filter(Boolean) : [],
      scores: normalizedScores,
      totalScore: calculateTotalScore(normalizedScores),
      createdAt: typeof entry.createdAt === 'string' && entry.createdAt ? entry.createdAt : now,
      updatedAt: typeof entry.updatedAt === 'string' && entry.updatedAt ? entry.updatedAt : now,
    };
  }, []);

  // Persist entries to localStorage whenever they change
  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  useEffect(() => {
    localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify({ showPadScore100 }));
  }, [showPadScore100]);

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

  const importEntries = useCallback((incoming: unknown, mode: 'merge' | 'replace' = 'merge') => {
    if (!Array.isArray(incoming)) return { imported: 0, skipped: 0 };

    const normalized = incoming
      .map((item, idx) => normalizeImportedEntry(item as Partial<CoffeeEntry>, entries.length + idx + 1))
      .filter((item): item is CoffeeEntry => Boolean(item));

    const skipped = incoming.length - normalized.length;

    if (normalized.length === 0) {
      return { imported: 0, skipped };
    }

    if (mode === 'replace') {
      const sorted = [...normalized].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setEntries(sorted);
      return { imported: sorted.length, skipped };
    }

    const existingIds = new Set(entries.map(e => e.id));
    const incomingMerged = normalized.map((entry, idx) => {
      if (!existingIds.has(entry.id)) return entry;
      return { ...entry, id: `${entry.id}-import-${idx + 1}` };
    });
    const merged = [...incomingMerged, ...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    setEntries(merged);
    return { imported: incomingMerged.length, skipped };
  }, [entries, normalizeImportedEntry]);

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
      entries, addEntry, updateEntry, deleteEntry, toggleFavorite, importEntries,
      draft, setDraft, updateDraftScore, updateDraftSensoryNote, updateDraftSensoryReaction, updateDraftField, updateDraftAromaDescriptors, updateDraftBrewPours, updateDraftSweetnessDescriptors, updateDraftSweetnessDetailDescriptors, updateDraftAcidityDescriptors, updateDraftAcidityTypeDescriptors, updateDraftIntensityDescriptors, updateDraftMouthfeelDescriptors, updateDraftAftertasteDescriptors, updateDraftOverallDescriptors,
      toggleFocusedAttribute,
      saveDraft, resetDraft, editEntry, isEditingExisting,
      activeTab, setActiveTab,
      showPadScore100, setShowPadScore100,
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
