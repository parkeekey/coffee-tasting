// =============================================================
// LogPage — Tasting log with entry cards, favorites, edit/delete
// Design: "Specialty Lab" — warm scientific minimalism
// =============================================================

import { useState } from 'react';
import { Heart, Edit2, Trash2, Coffee, Star, ChevronDown, ChevronUp, Search, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useCoffee } from '@/contexts/CoffeeContext';
import { CoffeeEntry, getScoreHex, getScoreLabel, SCORE_ATTRIBUTES } from '@/lib/coffeeTypes';

function EntryCard({ entry }: { entry: CoffeeEntry }) {
  const { toggleFavorite, deleteEntry, editEntry, setActiveTab } = useCoffee();
  const [expanded, setExpanded] = useState(false);
  const color = getScoreHex(entry.totalScore);
  const label = getScoreLabel(entry.totalScore);

  const handleEdit = () => {
    editEntry(entry.id);
    setActiveTab('taste');
    toast.info(`Editing ${entry.sampleIndex} — ${entry.name}`);
  };

  const handleDelete = () => {
    deleteEntry(entry.id);
    toast.success('Entry deleted.');
  };

  const handleFavorite = () => {
    toggleFavorite(entry.id);
    toast.success(entry.isFavorite ? 'Removed from favorites' : 'Added to favorites ★');
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden animate-fade-slide-up">
      {/* Card header */}
      <div className="flex items-start p-3 gap-3">
        {/* Score badge */}
        <div
          className="flex-none w-14 h-14 rounded-xl flex flex-col items-center justify-center"
          style={{ backgroundColor: `${color}15`, border: `1.5px solid ${color}30` }}
        >
          <span
            className="font-mono-custom font-bold text-base leading-tight"
            style={{ color }}
          >
            {entry.totalScore.toFixed(1)}
          </span>
          <span className="text-[9px] text-muted-foreground">/100</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono-custom font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {entry.sampleIndex}
                </span>
                {entry.isFavorite && (
                  <Star size={10} className="text-amber-500 fill-amber-500" />
                )}
              </div>
              <h3 className="font-display font-semibold text-sm text-foreground truncate mt-0.5">
                {entry.name || 'Unnamed Sample'}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {[entry.origin, entry.process, entry.roastLevel].filter(Boolean).join(' · ')}
              </p>
            </div>
            <span
              className="text-[10px] font-medium flex-none mt-0.5 px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${color}15`, color }}
            >
              {label}
            </span>
          </div>

          {/* Focused attributes badges */}
          {entry.focusedAttributes.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              {entry.focusedAttributes.map(attr => {
                const attrLabel = SCORE_ATTRIBUTES.find(a => a.key === attr)?.label;
                return (
                  <span
                    key={attr}
                    className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1"
                  >
                    <Flag size={8} className="fill-current" />
                    {attrLabel}
                  </span>
                );
              })}
            </div>
          )}

          {/* Mini score bar */}
          <div className="flex items-center gap-1 mt-2">
            {SCORE_ATTRIBUTES.map(attr => (
              <div key={attr.key} className="flex flex-col items-center flex-1">
                <span className="text-[8px] text-muted-foreground">{attr.emoji}</span>
                <div className="w-full bg-muted rounded-full h-1 mt-0.5">
                  <div
                    className="h-1 rounded-full transition-all"
                    style={{
                      width: `${((entry.scores[attr.key] - 1) / 8) * 100}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expandable detail */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-border/50 pt-2 animate-fade-slide-up">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
            {SCORE_ATTRIBUTES.map(attr => (
              <div key={attr.key} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{attr.emoji} {attr.label}</span>
                <span className="text-xs font-mono-custom font-bold text-foreground">
                  {entry.scores[attr.key]}/9
                </span>
              </div>
            ))}
          </div>
          {entry.altitude && (
            <p className="text-xs text-muted-foreground">Altitude: {entry.altitude}</p>
          )}
          {entry.roaster && (
            <p className="text-xs text-muted-foreground">Roaster: {entry.roaster}</p>
          )}
          {entry.focusedAttributes.length > 0 && (
            <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-xs text-amber-900 font-medium mb-1">🚩 Focused on:</p>
              <p className="text-xs text-amber-800">
                {entry.focusedAttributes.map(a => SCORE_ATTRIBUTES.find(sa => sa.key === a)?.label).join(', ')}
              </p>
            </div>
          )}
          {entry.notes && (
            <div className="mt-2 p-2 bg-muted/50 rounded-lg">
              <p className="text-xs text-foreground italic">\"{ entry.notes}\"</p>
            </div>
          )}
          <p className="text-[10px] text-muted-foreground mt-2">
            {new Date(entry.createdAt).toLocaleString()}
          </p>
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center border-t border-border/50">
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex-1 flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? 'Less' : 'Details'}
        </button>
        <div className="w-px h-6 bg-border" />
        <button
          onClick={handleFavorite}
          className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs transition-colors hover:bg-muted/50 ${
            entry.isFavorite ? 'text-amber-500' : 'text-muted-foreground hover:text-amber-500'
          }`}
        >
          <Heart size={12} className={entry.isFavorite ? 'fill-amber-500' : ''} />
          {entry.isFavorite ? 'Saved' : 'Favorite'}
        </button>
        <div className="w-px h-6 bg-border" />
        <button
          onClick={handleEdit}
          className="flex-1 flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors"
        >
          <Edit2 size={12} />
          Edit
        </button>
        <div className="w-px h-6 bg-border" />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex-1 flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors">
              <Trash2 size={12} />
              Delete
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
              <AlertDialogDescription>
                "{entry.name || entry.sampleIndex}" will be permanently removed from your log.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default function LogPage() {
  const { entries } = useCoffee();
  const [search, setSearch] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filtered = entries.filter(e => {
    if (showFavoritesOnly && !e.isFavorite) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.origin.toLowerCase().includes(q) ||
      e.sampleIndex.toLowerCase().includes(q) ||
      e.notes.toLowerCase().includes(q) ||
      e.process.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col min-h-full pb-24">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Tasting Log</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              {entries.filter(e => e.isFavorite).length > 0 && (
                <span className="ml-2 text-amber-500">
                  ★ {entries.filter(e => e.isFavorite).length} favorite{entries.filter(e => e.isFavorite).length > 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowFavoritesOnly(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              showFavoritesOnly
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'border-border text-muted-foreground hover:border-amber-200 hover:text-amber-600'
            }`}
          >
            <Star size={12} className={showFavoritesOnly ? 'fill-amber-500 text-amber-500' : ''} />
            Favorites
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, origin, notes..."
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>

      {/* Stats bar */}
      {entries.length > 0 && (
        <div className="bg-muted/40 border-b border-border px-4 py-2 flex items-center gap-4 overflow-x-auto">
          <div className="flex-none text-center">
            <p className="text-xs text-muted-foreground">Avg Score</p>
            <p className="text-sm font-mono-custom font-bold text-foreground">
              {(entries.reduce((s, e) => s + e.totalScore, 0) / entries.length).toFixed(1)}
            </p>
          </div>
          <div className="w-px h-8 bg-border flex-none" />
          <div className="flex-none text-center">
            <p className="text-xs text-muted-foreground">Best</p>
            <p className="text-sm font-mono-custom font-bold text-foreground">
              {Math.max(...entries.map(e => e.totalScore)).toFixed(1)}
            </p>
          </div>
          <div className="w-px h-8 bg-border flex-none" />
          <div className="flex-none text-center">
            <p className="text-xs text-muted-foreground">Lowest</p>
            <p className="text-sm font-mono-custom font-bold text-foreground">
              {Math.min(...entries.map(e => e.totalScore)).toFixed(1)}
            </p>
          </div>
          <div className="w-px h-8 bg-border flex-none" />
          <div className="flex-none text-center">
            <p className="text-xs text-muted-foreground">Specialty+</p>
            <p className="text-sm font-mono-custom font-bold text-foreground">
              {entries.filter(e => e.totalScore >= 75).length}
            </p>
          </div>
        </div>
      )}

      {/* Entry list */}
      <div className="flex-1 px-4 py-3 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'oklch(0.94 0.005 80)' }}
            >
              <Coffee size={28} className="text-muted-foreground" />
            </div>
            <h3 className="font-display text-base font-semibold text-foreground mb-1">
              {entries.length === 0 ? 'No entries yet' : 'No results found'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {entries.length === 0
                ? 'Start tasting! Go to the Taste tab to score your first coffee.'
                : 'Try a different search term or clear the filter.'}
            </p>
          </div>
        ) : (
          filtered.map(entry => (
            <EntryCard key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
}
