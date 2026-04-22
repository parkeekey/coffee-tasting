// =============================================================
// ExportPage — Export tasting log to CSV, JSON, or plain text
// Design: "Specialty Lab" — warm scientific minimalism
// =============================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Camera, FileText, FileJson, FileSpreadsheet, Copy, Check, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCoffee } from '@/contexts/CoffeeContext';
import { exportToCSV, exportToJSON, exportToText, getScoreHex, getScoreLabel } from '@/lib/coffeeTypes';
import { ShareCard } from '@/components/ShareCard';

type ExportFormat = 'csv' | 'json' | 'text' | 'png';

interface FormatOption {
  id: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
  mime: string;
  ext: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: 'csv',
    label: 'CSV Spreadsheet',
    description: 'Open in Excel, Google Sheets, or Numbers',
    icon: <FileSpreadsheet size={20} />,
    mime: 'text/csv',
    ext: 'csv',
  },
  {
    id: 'json',
    label: 'JSON Data',
    description: 'Full structured data for developers',
    icon: <FileJson size={20} />,
    mime: 'application/json',
    ext: 'json',
  },
  {
    id: 'text',
    label: 'Plain Text',
    description: 'Human-readable tasting notes report',
    icon: <FileText size={20} />,
    mime: 'text/plain',
    ext: 'txt',
  },
  {
    id: 'png',
    label: 'PNG Snapshot',
    description: 'Visual log image for easy sharing',
    icon: <Camera size={20} />,
    mime: 'image/png',
    ext: 'png',
  },
];

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ExportPage() {
  const { entries, showPadScore100, setShowPadScore100 } = useCoffee();
  const [pageMode, setPageMode] = useState<'export' | 'settings'>('export');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [pngTagDetailMode, setPngTagDetailMode] = useState<'compact' | 'full'>('full');
  const [copied, setCopied] = useState(false);
  const [savingSnapshot, setSavingSnapshot] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedEntryIds, setSelectedEntryIds] = useState<string[]>([]);
  const snapshotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedEntryIds(prev => {
      const allIds = entries.map(e => e.id);
      if (allIds.length === 0) return [];

      // First load: select all
      if (prev.length === 0) return allIds;

      // Keep existing selections that still exist + auto-select new entries
      const existing = prev.filter(id => allIds.includes(id));
      const missing = allIds.filter(id => !existing.includes(id));
      return [...existing, ...missing];
    });
  }, [entries]);

  const selectedEntries = useMemo(
    () => entries.filter(entry => selectedEntryIds.includes(entry.id)),
    [entries, selectedEntryIds]
  );

  const selectedCount = selectedEntries.length;

  const toggleEntry = (entryId: string) => {
    setSelectedEntryIds(prev =>
      prev.includes(entryId)
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  const selectAllEntries = () => {
    setSelectedEntryIds(entries.map(e => e.id));
  };

  const clearAllEntries = () => {
    setSelectedEntryIds([]);
  };

  const getContent = (format: ExportFormat): string => {
    switch (format) {
      case 'csv': return exportToCSV(selectedEntries);
      case 'json': return exportToJSON(selectedEntries);
      case 'text': return exportToText(selectedEntries);
      case 'png': return '';
    }
  };

  const getFilename = (format: ExportFormat): string => {
    const date = new Date().toISOString().slice(0, 10);
    return `coffee-tasting-${date}.${format === 'csv' ? 'csv' : format === 'json' ? 'json' : format === 'text' ? 'txt' : 'png'}`;
  };

  const handleExport = async () => {
    if (entries.length === 0) {
      toast.error('No entries to export. Add some tasting entries first!');
      return;
    }
    if (selectedEntries.length === 0) {
      toast.error('No logs selected. Select at least one log to export.');
      return;
    }

    if (selectedFormat === 'png') {
      await handleExportSnapshot();
      return;
    }

    const fmt = FORMAT_OPTIONS.find(f => f.id === selectedFormat)!;
    const content = getContent(selectedFormat);
    downloadFile(content, getFilename(selectedFormat), fmt.mime);
    toast.success(`Exported ${selectedEntries.length} ${selectedEntries.length === 1 ? 'entry' : 'entries'} as ${fmt.label}`, {
      description: getFilename(selectedFormat),
    });
  };

  const handleCopy = async () => {
    if (selectedFormat === 'png') {
      toast.error('PNG snapshot cannot be copied as text. Use Download instead.');
      return;
    }
    if (entries.length === 0) {
      toast.error('No entries to copy.');
      return;
    }
    if (selectedEntries.length === 0) {
      toast.error('No logs selected. Select at least one log to copy.');
      return;
    }
    const content = getContent(selectedFormat);
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportSnapshot = async () => {
    if (entries.length === 0) {
      toast.error('No entries to export. Add some tasting entries first!');
      return;
    }
    if (selectedEntries.length === 0) {
      toast.error('No logs selected. Select at least one log to export.');
      return;
    }
    if (!snapshotRef.current) return;

    setSavingSnapshot(true);
    try {
      const { toBlob } = await import('html-to-image');
      const dynamicScale = selectedEntries.length > 10 ? 1 : selectedEntries.length > 4 ? 1.5 : 2;
      const blob = await toBlob(snapshotRef.current, {
        cacheBust: true,
        pixelRatio: dynamicScale,
        backgroundColor: '#f6f2ea',
      });

      if (!blob) throw new Error('Failed to create PNG blob');

      // Browser safety guard for huge snapshots
      if (blob.size > 45 * 1024 * 1024) {
        throw new Error('Snapshot too large. Select fewer logs and try again.');
      }

      const date = new Date().toISOString().slice(0, 10);

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `coffee-tasting-snapshot-${date}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      toast.success(`Saved PNG snapshot (${selectedEntries.length})`);
    } catch (error) {
      console.error('PNG export error (batch snapshot):', error);
      toast.error('Could not export PNG snapshot', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setSavingSnapshot(false);
    }
  };

  const previewContent = selectedEntries.length > 0 ? getContent(selectedFormat) : '';
  const previewLines = previewContent.split('\n').slice(0, 20);

  return (
    <div className="flex flex-col min-h-full pb-24">
      {/* Off-screen snapshot canvas target */}
      <div style={{ position: 'fixed', left: -9999, top: 0, pointerEvents: 'none', zIndex: -1 }}>
        <div
          ref={snapshotRef}
          style={{
            width: 430,
            background: '#f6f2ea',
            color: '#1f2937',
            padding: 16,
          }}
        >
          <div style={{ marginBottom: 10, color: '#5b4636', fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            Coffee Tasting Log Snapshot · {new Date().toLocaleDateString()}
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {selectedEntries.map(entry => (
              <ShareCard key={entry.id} entry={entry} tagDetailMode={pngTagDetailMode} />
            ))}
          </div>
        </div>
      </div>

      {/* Header */}
      <div
        className="relative overflow-hidden px-4 pt-5 pb-5"
        style={{
          background: 'linear-gradient(135deg, oklch(0.38 0.08 35) 0%, oklch(0.28 0.06 35) 100%)',
        }}
      >
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663470510486/A4fJzBC3XDkfrSwirXSYmh/coffee-beans-texture-2QVszFXHBrHttZhbkKSxSC.webp)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Download size={14} className="text-amber-300" />
            <span className="text-xs font-medium text-amber-300 uppercase tracking-widest">
              Export
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Export Log</h1>
          <p className="text-sm text-white/60 mt-0.5">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} ready to export
          </p>
          <div className="mt-3 inline-flex items-center rounded-lg border border-white/20 bg-white/10 p-0.5">
            <button
              type="button"
              onClick={() => setPageMode('export')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                pageMode === 'export' ? 'bg-white text-foreground' : 'text-white/80 hover:text-white'
              }`}
            >
              Export
            </button>
            <button
              type="button"
              onClick={() => setPageMode('settings')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                pageMode === 'settings' ? 'bg-white text-foreground' : 'text-white/80 hover:text-white'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {pageMode === 'settings' && (
        <div className="bg-white border-b border-border px-4 py-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Display Settings
          </h2>
          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Show Pad score /100</p>
                <p className="text-xs text-muted-foreground">Controls whether pad tasting shows the total score out of 100.</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant={showPadScore100 ? 'default' : 'outline'}
                onClick={() => setShowPadScore100(!showPadScore100)}
                className="h-8 min-w-20"
              >
                {showPadScore100 ? 'ON' : 'OFF'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {pageMode === 'export' && (
      <>

      {/* Summary stats */}
      {entries.length > 0 && (
        <div className="bg-white border-b border-border px-4 py-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-muted/40 rounded-lg">
              <p className="text-lg font-mono-custom font-bold text-foreground">{entries.length}</p>
              <p className="text-[10px] text-muted-foreground">Total Entries</p>
            </div>
            <div className="text-center p-2 bg-muted/40 rounded-lg">
              <p className="text-lg font-mono-custom font-bold text-foreground">
                {(entries.reduce((s, e) => s + e.totalScore, 0) / entries.length).toFixed(1)}
              </p>
              <p className="text-[10px] text-muted-foreground">Avg Score</p>
            </div>
            <div className="text-center p-2 bg-muted/40 rounded-lg">
              <p className="text-lg font-mono-custom font-bold text-amber-500">
                {entries.filter(e => e.isFavorite).length}
              </p>
              <p className="text-[10px] text-muted-foreground">Favorites</p>
            </div>
          </div>
        </div>
      )}

      {/* Format selection */}
      <div className="bg-white border-b border-border px-4 py-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Export Format
        </h2>
        <div className="space-y-2">
          {FORMAT_OPTIONS.map(fmt => (
            <button
              key={fmt.id}
              onClick={() => setSelectedFormat(fmt.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                selectedFormat === fmt.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-white hover:border-border/80 hover:bg-muted/30'
              }`}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-none"
                style={{
                  background: selectedFormat === fmt.id ? 'oklch(0.38 0.08 35)' : 'oklch(0.94 0.005 80)',
                  color: selectedFormat === fmt.id ? 'white' : 'oklch(0.52 0.02 60)',
                }}
              >
                {fmt.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${selectedFormat === fmt.id ? 'text-primary' : 'text-foreground'}`}>
                  {fmt.label}
                </p>
                <p className="text-xs text-muted-foreground">{fmt.description}</p>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 flex-none transition-all ${
                  selectedFormat === fmt.id
                    ? 'border-primary bg-primary'
                    : 'border-border'
                }`}
              >
                {selectedFormat === fmt.id && (
                  <div className="w-full h-full rounded-full bg-white scale-50 block" />
                )}
              </div>
            </button>
          ))}
        </div>

        {selectedFormat === 'png' && (
          <div className="mt-3 p-3 rounded-lg border border-border bg-muted/20">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              PNG Tag Detail
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={pngTagDetailMode === 'compact' ? 'default' : 'outline'}
                onClick={() => setPngTagDetailMode('compact')}
                className="h-8 text-xs"
              >
                compact version
              </Button>
              <Button
                type="button"
                size="sm"
                variant={pngTagDetailMode === 'full' ? 'default' : 'outline'}
                onClick={() => setPngTagDetailMode('full')}
                className="h-8 text-xs"
              >
                full context
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Log selection */}
      {entries.length > 0 && (
        <div className="bg-white border-b border-border px-4 py-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Select Logs
            </h2>
            <span className="text-[11px] text-muted-foreground">
              {selectedCount} / {entries.length} selected
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllEntries}
              className="h-8 text-xs"
              disabled={selectedCount === entries.length}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllEntries}
              className="h-8 text-xs"
              disabled={selectedCount === 0}
            >
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Preview */}
      {entries.length > 0 && (
        <div className="bg-white border-b border-border px-4 py-3">
          <button
            onClick={() => setPreviewOpen(v => !v)}
            className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-widest"
          >
            <span>Preview ({selectedCount} selected)</span>
            <span className="normal-case font-normal text-primary">
              {previewOpen ? 'Hide' : 'Show'}
            </span>
          </button>
          {previewOpen && (
            <div className="mt-2 bg-muted/50 rounded-lg p-3 overflow-x-auto animate-fade-slide-up">
              {selectedCount === 0 ? (
                <p className="text-xs text-muted-foreground">Select at least one log to preview export content.</p>
              ) : selectedFormat === 'png' ? (
                <p className="text-xs text-muted-foreground">
                  PNG exports a visual snapshot of selected log cards ({pngTagDetailMode === 'compact' ? 'compact chips' : 'full tag detail'}).
                </p>
              ) : (
                <pre className="text-[10px] text-muted-foreground font-mono-custom whitespace-pre leading-relaxed">
                  {previewLines.join('\n')}
                  {previewContent.split('\n').length > 20 && '\n... (truncated)'}
                </pre>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recent entries list */}
      {entries.length > 0 && (
        <div className="bg-white px-4 py-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Entries to Export
          </h2>
          <div className="space-y-1.5 max-h-72 overflow-auto pr-1">
            {entries.map(entry => {
              const color = getScoreHex(entry.totalScore);
              const isSelected = selectedEntryIds.includes(entry.id);
              return (
                <button
                  key={entry.id}
                  onClick={() => toggleEntry(entry.id)}
                  className={`w-full text-left flex items-center gap-2 py-1.5 px-1 rounded-lg border transition-colors ${
                    isSelected
                      ? 'bg-primary/5 border-primary/20'
                      : 'border-transparent hover:bg-muted/40'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-none ${
                      isSelected
                        ? 'border-primary bg-primary text-white'
                        : 'border-border bg-white'
                    }`}
                  >
                    {isSelected && <Check size={10} />}
                  </span>
                  <span className="text-[10px] font-mono-custom text-muted-foreground w-10 flex-none">
                    {entry.sampleIndex}
                  </span>
                  <span className="text-xs text-foreground flex-1 truncate">
                    {entry.name || 'Unnamed'}
                  </span>
                  {entry.isFavorite && <span className="text-amber-500 text-[10px]">★</span>}
                  <span
                    className="text-xs font-mono-custom font-bold flex-none"
                    style={{ color }}
                  >
                    {entry.totalScore.toFixed(1)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'oklch(0.94 0.005 80)' }}
          >
            <Coffee size={28} className="text-muted-foreground" />
          </div>
          <h3 className="font-display text-base font-semibold text-foreground mb-1">Nothing to export yet</h3>
          <p className="text-sm text-muted-foreground">
            Start tasting and saving entries, then come back to export your log.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="fixed bottom-16 left-0 right-0 z-40" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <div className="bg-white/95 backdrop-blur-sm border-t border-border px-4 py-3 flex gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="flex-none gap-1.5"
          disabled={entries.length === 0 || selectedCount === 0 || selectedFormat === 'png'}
        >
          {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
          Copy
        </Button>
        <Button
          size="sm"
          onClick={handleExport}
          className="flex-1 gap-1.5 font-semibold"
          style={{ background: 'oklch(0.38 0.08 35)', color: 'white' }}
          disabled={entries.length === 0 || selectedCount === 0 || savingSnapshot}
        >
          <Download size={14} />
          {selectedFormat === 'png' && savingSnapshot
            ? `Saving PNG… (${selectedCount})`
            : `Download ${FORMAT_OPTIONS.find(f => f.id === selectedFormat)?.ext.toUpperCase()} (${selectedCount})`}
        </Button>
      </div>
      </div>
      </>
      )}
    </div>
  );
}
