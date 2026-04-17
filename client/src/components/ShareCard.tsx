// =============================================================
// ShareCard — Off-screen card rendered for PNG snapshot export
// =============================================================

import { forwardRef } from 'react';
import { CoffeeEntry, getScoreHex, SCORE_ATTRIBUTES, classifyTdsByStrengthZone } from '@/lib/coffeeTypes';

interface ShareCardProps {
  entry: CoffeeEntry;
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(({ entry }, ref) => {
  const color = getScoreHex(entry.totalScore);
  const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const mode = entry.entryMode ?? 'tasting';
  const modeBadge =
    mode === 'brewing' ? { label: 'Brewing', bg: '#d1fae5', fg: '#065f46' } :
    mode === 'pad'     ? { label: 'Taste Pad', bg: '#cffafe', fg: '#155e75' } :
                         { label: 'Tasting', bg: '#f3f4f6', fg: '#374151' };

  const tds = entry.brewTDS ? parseFloat(entry.brewTDS) : null;
  const zone = tds && !isNaN(tds) ? classifyTdsByStrengthZone(tds) : null;
  const zoneLabel = zone === 'ideal' ? '✓ Ideal' : zone === 'weak' ? '💧 Weak' : zone === 'strong' ? '🔥 Strong' : null;
  const zoneBg = zone === 'ideal' ? '#d1fae5' : zone === 'weak' ? '#e0f2fe' : zone === 'strong' ? '#fee2e2' : '#f3f4f6';
  const zoneFg = zone === 'ideal' ? '#065f46' : zone === 'weak' ? '#0369a1' : zone === 'strong' ? '#991b1b' : '#6b7280';

  const overallReaction = entry.sensoryReactions?.overall;
  const reactionEmoji = overallReaction === 'like' ? '👍' : overallReaction === 'soso' ? '😐' : overallReaction === 'dislike' ? '👎' : null;

  const flavorTags = (entry.overallDescriptors ?? []).slice(0, 8);
  const notes = (entry.notes ?? '').trim();

  return (
    <div
      ref={ref}
      style={{
        width: 390,
        background: '#fffdf9',
        color: '#1f2937',
        borderRadius: 20,
        overflow: 'hidden',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        lineHeight: 1.4,
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        border: '1.5px solid #e8e0d4',
      }}
    >
      {/* Header band */}
      <div style={{ background: color, padding: '18px 20px 14px', position: 'relative' }}>
        {/* Mode badge */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' as const }}>
          <span style={{ fontSize: 10, fontWeight: 600, background: 'rgba(255,255,255,0.25)', color: '#fff', padding: '2px 8px', borderRadius: 99 }}>
            {modeBadge.label}
          </span>
          {zoneLabel && (
            <span style={{ fontSize: 10, fontWeight: 600, background: 'rgba(255,255,255,0.25)', color: '#fff', padding: '2px 8px', borderRadius: 99 }}>
              {zoneLabel}
            </span>
          )}
        </div>
        {/* Score + title row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
          <div style={{ textAlign: 'center' as const }}>
            <div style={{ fontSize: 42, fontWeight: 700, color: '#fff', lineHeight: 1, letterSpacing: -1 }}>
              {entry.totalScore.toFixed(1)}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>/100</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', marginBottom: 3, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' as const }}>
              {entry.sampleIndex}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
              {entry.name || 'Unnamed Sample'}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 3 }}>
              {[entry.origin, entry.process, entry.roastLevel].filter(Boolean).join(' · ') || '—'}
            </div>
          </div>
          {reactionEmoji && (
            <div style={{ fontSize: 28 }}>{reactionEmoji}</div>
          )}
        </div>
      </div>

      {/* Score bars */}
      <div style={{ padding: '14px 20px 10px', background: '#fff' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
          {SCORE_ATTRIBUTES.map(attr => {
            const val = entry.scores[attr.key];
            const pct = ((val - 1) / 8) * 100;
            return (
              <div key={attr.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, width: 16, textAlign: 'center' as const }}>{attr.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 9, color: '#6b7280', fontWeight: 500 }}>{attr.label}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: color }}>{val}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 99, background: '#f0ede8' }}>
                    <div style={{ height: 4, borderRadius: 99, background: color, width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TDS / EY row */}
      {(tds || entry.brewRatio || entry.brewDose) && (
        <div style={{ background: '#f0fdf4', borderTop: '1px solid #d1fae5', borderBottom: '1px solid #d1fae5', padding: '8px 20px', display: 'flex', gap: 16 }}>
          {entry.brewRatio && (
            <div>
              <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 500, marginBottom: 2 }}>RATIO</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>1:{entry.brewRatio}</div>
            </div>
          )}
          {tds && !isNaN(tds) && (
            <div>
              <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 500, marginBottom: 2 }}>TDS</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>{tds.toFixed(2)}%</div>
            </div>
          )}
          {entry.brewDose && (
            <div>
              <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 500, marginBottom: 2 }}>DOSE</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>{entry.brewDose}g</div>
            </div>
          )}
          {zoneLabel && (
            <div style={{ marginLeft: 'auto' }}>
              <span style={{ fontSize: 10, fontWeight: 600, background: zoneBg, color: zoneFg, padding: '3px 8px', borderRadius: 99 }}>
                {zoneLabel}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Flavor tags */}
      {flavorTags.length > 0 && (
        <div style={{ padding: '10px 20px 4px', background: '#fffdf9' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 5 }}>
            {flavorTags.map(tag => (
              <span key={tag} style={{ fontSize: 10, fontWeight: 500, background: '#1e293b', color: '#fff', padding: '3px 9px', borderRadius: 99 }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div style={{ padding: '8px 20px 4px' }}>
          <p style={{ fontSize: 11, color: '#6b7280', fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>
            "{notes}"
          </p>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '10px 20px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: '#9ca3af' }}>{date}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: color, letterSpacing: 0.5 }}>☕ Coffee Tasting Lab</span>
      </div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';
