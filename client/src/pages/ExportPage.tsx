// =============================================================
// ExportPage — Export tasting log to CSV, JSON, or plain text
// Design: "Specialty Lab" — warm scientific minimalism
// =============================================================

import { useState } from 'react';
import { Download, FileText, FileJson, FileSpreadsheet, Copy, Check, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCoffee } from '@/contexts/CoffeeContext';
import { exportToCSV, exportToJSON, exportToText, getScoreHex, getScoreLabel } from '@/lib/coffeeTypes';

type ExportFormat = 'csv' | 'json' | 'text';

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
  const { entries } = useCoffee();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const getContent = (format: ExportFormat): string => {
    switch (format) {
      case 'csv': return exportToCSV(entries);
      case 'json': return exportToJSON(entries);
      case 'text': return exportToText(entries);
    }
  };

  const getFilename = (format: ExportFormat): string => {
    const date = new Date().toISOString().slice(0, 10);
    return `coffee-tasting-${date}.${format === 'csv' ? 'csv' : format === 'json' ? 'json' : 'txt'}`;
  };

  const handleExport = () => {
    if (entries.length === 0) {
      toast.error('No entries to export. Add some tasting entries first!');
      return;
    }
    const fmt = FORMAT_OPTIONS.find(f => f.id === selectedFormat)!;
    const content = getContent(selectedFormat);
    downloadFile(content, getFilename(selectedFormat), fmt.mime);
    toast.success(`Exported ${entries.length} entries as ${fmt.label}`, {
      description: getFilename(selectedFormat),
    });
  };

  const handleCopy = async () => {
    if (entries.length === 0) {
      toast.error('No entries to copy.');
      return;
    }
    const content = getContent(selectedFormat);
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const previewContent = entries.length > 0 ? getContent(selectedFormat) : '';
  const previewLines = previewContent.split('\n').slice(0, 20);

  return (
    <div className="flex flex-col min-h-full pb-24">
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
        </div>
      </div>

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
      </div>

      {/* Preview */}
      {entries.length > 0 && (
        <div className="bg-white border-b border-border px-4 py-3">
          <button
            onClick={() => setPreviewOpen(v => !v)}
            className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-widest"
          >
            <span>Preview</span>
            <span className="normal-case font-normal text-primary">
              {previewOpen ? 'Hide' : 'Show'}
            </span>
          </button>
          {previewOpen && (
            <div className="mt-2 bg-muted/50 rounded-lg p-3 overflow-x-auto animate-fade-slide-up">
              <pre className="text-[10px] text-muted-foreground font-mono-custom whitespace-pre leading-relaxed">
                {previewLines.join('\n')}
                {previewContent.split('\n').length > 20 && '\n... (truncated)'}
              </pre>
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
          <div className="space-y-1.5">
            {entries.slice(0, 8).map(entry => {
              const color = getScoreHex(entry.totalScore);
              return (
                <div key={entry.id} className="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-0">
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
                </div>
              );
            })}
            {entries.length > 8 && (
              <p className="text-xs text-muted-foreground text-center py-1">
                +{entries.length - 8} more entries
              </p>
            )}
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
          disabled={entries.length === 0}
        >
          {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
          Copy
        </Button>
        <Button
          size="sm"
          onClick={handleExport}
          className="flex-1 gap-1.5 font-semibold"
          style={{ background: 'oklch(0.38 0.08 35)', color: 'white' }}
          disabled={entries.length === 0}
        >
          <Download size={14} />
          Download {FORMAT_OPTIONS.find(f => f.id === selectedFormat)?.ext.toUpperCase()}
        </Button>
      </div>
      </div>
    </div>
  );
}
