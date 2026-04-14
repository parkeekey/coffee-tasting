// =============================================================
// Panel Cupping Session — Admin Creator & Taster Interface
// =============================================================

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Plus, Users, Trash2 } from 'lucide-react';
import {
  PanelSession,
  PROCESS_OPTIONS,
  ROAST_OPTIONS,
  ALTITUDE_OPTIONS,
  loadPanelSessions,
  savePanelSessions,
  createEmptyPanelSession,
  getConsensusScores,
  getTop3Attributes,
  SCORE_ATTRIBUTES,
  calculateTotalScore,
  TastingScores,
} from '@/lib/coffeeTypes';
import { toast } from 'sonner';

type PanelView = 'list' | 'creator' | 'taster' | 'results';

export default function PanelPage() {
  const [view, setView] = useState<PanelView>('list');
  const [sessions, setSessions] = useState<PanelSession[]>(loadPanelSessions);
  const [currentSession, setCurrentSession] = useState<PanelSession | null>(null);
  const [tasterName, setTasterName] = useState('');
  const [tasterScores, setTasterScores] = useState<TastingScores>({
    fragrance: 5, aroma: 5, acidity: 5, sweetness: 5,
    flavor: 5, mouthfeel: 5, aftertaste: 5, overall: 5,
  });

  const handleSaveSessions = (updated: PanelSession[]) => {
    setSessions(updated);
    savePanelSessions(updated);
  };

  // ===== CREATOR VIEW =====
  const handleCreateSession = () => {
    const newSession = createEmptyPanelSession('S-01');
    setCurrentSession(newSession);
    setView('creator');
  };

  const isEditingSession = currentSession && sessions.some(s => s.id === currentSession.id);

  const handleSaveSession = (session: PanelSession) => {
    if (isEditingSession) {
      // Update existing
      const updated = sessions.map(s => s.id === session.id ? { ...session, updatedAt: new Date().toISOString() } : s);
      handleSaveSessions(updated);
      toast.success('Panel session updated!');
    } else {
      // Create new
      const updated = [...sessions, session];
      handleSaveSessions(updated);
      toast.success('Panel session created!');
    }
    setView('list');
    setCurrentSession(null);
  };

  const handleEditSession = (session: PanelSession) => {
    setCurrentSession(session);
    setView('creator');
  };

  const handleDeleteSession = (sessionId: string) => {
    const updated = sessions.filter(s => s.id !== sessionId);
    handleSaveSessions(updated);
    toast.success('Panel session deleted');
  };

  const handleUpdateSessionDetail = (key: string, value: any) => {
    if (!currentSession) return;
    setCurrentSession({
      ...currentSession,
      coffeeDetails: {
        ...currentSession.coffeeDetails,
        [key]: value,
      },
    });
  };

  const handleUpdateSessionMeta = (key: string, value: any) => {
    if (!currentSession) return;
    setCurrentSession({
      ...currentSession,
      [key]: value,
    });
  };

  // ===== TASTER VIEW =====
  const handleJoinSession = (session: PanelSession) => {
    setCurrentSession(session);
    setTasterName('');
    setTasterScores({
      fragrance: 5, aroma: 5, acidity: 5, sweetness: 5,
      flavor: 5, mouthfeel: 5, aftertaste: 5, overall: 5,
    });
    setView('taster');
  };

  const handleSubmitTasterScores = () => {
    if (!currentSession || !tasterName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    const updated = sessions.map(s =>
      s.id === currentSession.id
        ? {
            ...s,
            submissions: [
              ...s.submissions,
              {
                tasterId: `${Date.now()}-${Math.random()}`,
                tasterName,
                scores: tasterScores,
                submittedAt: new Date().toISOString(),
              },
            ],
            updatedAt: new Date().toISOString(),
          }
        : s
    );
    handleSaveSessions(updated);
    toast.success(`Thank you, ${tasterName}! Scores submitted.`);
    setView('list');
    setCurrentSession(null);
  };

  const handleViewResults = (session: PanelSession) => {
    setCurrentSession(session);
    setView('results');
  };

  // ===== CONSENSUS BAR CHART HELPER =====
  const getScoreDistribution = (submissions: any[], attrKey: keyof TastingScores) => {
    const scores = submissions.map(s => s.scores[attrKey]);
    const distribution: { [key: number]: number } = {};
    scores.forEach(score => {
      distribution[score] = (distribution[score] || 0) + 1;
    });
    return distribution;
  };

  // ===== RESULTS VIEW =====
  const renderResults = () => {
    if (!currentSession) return null;

    const consensus = getConsensusScores(currentSession.submissions);
    const top3 = getTop3Attributes(consensus);
    const consensusTotal = calculateTotalScore(consensus);
    const totalTasters = currentSession.submissions.length;

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/95 border-b border-border px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => {
              setView('list');
              setCurrentSession(null);
            }}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h2 className="text-sm font-semibold">{currentSession.sampleIndex}</h2>
            <p className="text-xs text-muted-foreground">{currentSession.sessionName}</p>
          </div>
        </div>

        <div className="pb-20 px-4 py-4 max-w-md mx-auto">
          {/* Coffee Details */}
          <div className="bg-card rounded-lg p-4 mb-4 border border-border">
            <h3 className="font-semibold text-sm mb-2">{currentSession.coffeeDetails.name}</h3>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Origin: {currentSession.coffeeDetails.origin}</p>
              <p>Process: {currentSession.coffeeDetails.process}</p>
              <p>Altitude: {currentSession.coffeeDetails.altitude}</p>
            </div>
          </div>

          {/* Total Score */}
          <div className="bg-primary/10 rounded-lg p-4 mb-4 border border-primary/20">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Panel Consensus Score</p>
              <p className="text-2xl font-bold text-primary">{consensusTotal}</p>
              <p className="text-xs text-muted-foreground mt-1">/ 100 ({totalTasters} tasters)</p>
            </div>
          </div>

          {/* Consensus Scores with Bar Charts */}
          <div className="bg-card rounded-lg p-4 mb-4 border border-border">
            <h3 className="font-semibold text-sm mb-4">Panel Consensus</h3>
            <div className="space-y-4">
              {SCORE_ATTRIBUTES.map(attr => {
                const score = consensus[attr.key];
                const isTop3 = top3.some(t => t.key === attr.key);
                const distribution = getScoreDistribution(currentSession.submissions, attr.key);
                const maxCount = Math.max(...Object.values(distribution), 1);

                return (
                  <div key={attr.key} className="border-b border-border pb-3 last:border-0 last:pb-0">
                    {/* Attribute Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span>{attr.emoji}</span>
                        <span className="font-medium text-sm">{attr.label}</span>
                        {isTop3 && <span className="text-amber-600 text-sm">⭐</span>}
                      </div>
                      <span className="font-mono font-bold text-sm">{score.toFixed(1)}</span>
                    </div>

                    {/* Score Distribution Bar */}
                    <div className="flex items-end gap-0.5 h-8">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(scoreVal => {
                        const count = distribution[scoreVal] || 0;
                        const percentage = (count / totalTasters) * 100;
                        const barHeight = (count / maxCount) * 100;

                        return (
                          <div
                            key={scoreVal}
                            className="flex-1 flex flex-col items-center gap-1 group"
                            title={`${scoreVal}: ${count} taster${count !== 1 ? 's' : ''} (${percentage.toFixed(0)}%)`}
                          >
                            {count > 0 && (
                              <div
                                className="w-full bg-primary/60 rounded-t transition-all group-hover:bg-primary"
                                style={{ height: `${barHeight}%`, minHeight: '4px' }}
                              />
                            )}
                            <span className="text-[9px] text-muted-foreground font-mono">{scoreVal}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Percentage text */}
                    {Object.keys(distribution).length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {Object.entries(distribution)
                          .map(([val, count]) => `${((count / totalTasters) * 100).toFixed(0)}% gave ${val}`)
                          .join(' • ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top 3 Attributes */}
          <div className="bg-card rounded-lg p-4 mb-4 border border-border">
            <h3 className="font-semibold text-sm mb-3">Top 3 Attributes</h3>
            <div className="space-y-2">
              {top3.map((attr, idx) => {
                const attrInfo = SCORE_ATTRIBUTES.find(a => a.key === attr.key);
                return (
                  <div key={attr.key} className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-amber-600">#{idx + 1}</span>
                    <span>{attrInfo?.emoji}</span>
                    <span className="flex-1">{attrInfo?.label}</span>
                    <span className="font-mono font-bold">{attr.score.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Individual Taster Scores */}
          <div className="bg-card rounded-lg p-4 border border-border">
            <h3 className="font-semibold text-sm mb-3">Individual Tasters ({totalTasters})</h3>
            <div className="space-y-3">
              {currentSession.submissions.map((submission, idx) => (
                <div key={submission.tasterId} className="text-xs border-t border-border pt-2 first:border-0 first:pt-0">
                  <p className="font-medium mb-1">{idx + 1}. {submission.tasterName}</p>
                  <div className="grid grid-cols-4 gap-1">
                    {SCORE_ATTRIBUTES.map(attr => (
                      <div key={attr.key} className="text-center">
                        <p className="text-[10px] text-muted-foreground">{attr.emoji}</p>
                        <p className="font-mono font-bold">{submission.scores[attr.key]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ===== TASTER SCORING VIEW =====
  const renderTasterView = () => {
    if (!currentSession) return null;

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/95 border-b border-border px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => {
              setView('list');
              setCurrentSession(null);
            }}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h2 className="text-sm font-semibold">{currentSession.sampleIndex}</h2>
            <p className="text-xs text-muted-foreground">Join Panel</p>
          </div>
        </div>

        <div className="pb-20 px-4 py-4 max-w-md mx-auto">
          {/* Coffee Details (Read-only) */}
          <div className="bg-card rounded-lg p-4 mb-4 border border-border">
            <h3 className="font-semibold text-sm mb-2">{currentSession.coffeeDetails.name}</h3>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Origin: {currentSession.coffeeDetails.origin}</p>
              <p>Process: {currentSession.coffeeDetails.process}</p>
              <p>Altitude: {currentSession.coffeeDetails.altitude}</p>
              <p>Roast: {currentSession.coffeeDetails.roastLevel}</p>
            </div>
          </div>

          {/* Taster Name */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1">Your Name</label>
            <input
              type="text"
              value={tasterName}
              onChange={e => setTasterName(e.target.value)}
              placeholder="e.g. Alice"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Scoring Sliders */}
          <div className="bg-card rounded-lg p-4 border border-border mb-4">
            <h3 className="font-semibold text-sm mb-3">Score Each Attribute (1-9)</h3>
            <div className="space-y-3">
              {SCORE_ATTRIBUTES.map(attr => (
                <div key={attr.key} className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{attr.emoji} {attr.label}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="range"
                      min="1"
                      max="9"
                      value={tasterScores[attr.key]}
                      onChange={e =>
                        setTasterScores({
                          ...tasterScores,
                          [attr.key]: parseInt(e.target.value),
                        })
                      }
                      className="w-16 h-1"
                    />
                    <span className="w-6 text-center font-mono font-bold text-sm">
                      {tasterScores[attr.key]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitTasterScores}
            className="w-full bg-primary text-primary-foreground"
          >
            Submit My Scores
          </Button>
        </div>
      </div>
    );
  };

  // ===== CREATOR VIEW =====
  const renderCreatorView = () => {
    if (!currentSession) return null;

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/95 border-b border-border px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => {
              setView('list');
              setCurrentSession(null);
            }}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-sm font-semibold flex-1">{isEditingSession ? 'Edit' : 'Create'} Panel Session</h2>
        </div>

        <div className="pb-20 px-4 py-4 max-w-md mx-auto">
          {/* Session Meta */}
          <div className="bg-card rounded-lg p-4 border border-border mb-4">
            <h3 className="font-semibold text-sm mb-3">Session Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Sample #</label>
                <input
                  type="text"
                  value={currentSession.sampleIndex}
                  onChange={e => handleUpdateSessionMeta('sampleIndex', e.target.value)}
                  placeholder="e.g. S-01"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Session Name</label>
                <input
                  type="text"
                  value={currentSession.sessionName}
                  onChange={e => handleUpdateSessionMeta('sessionName', e.target.value)}
                  placeholder="e.g. Monday Cupping"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Coffee Details */}
          <div className="bg-card rounded-lg p-4 border border-border mb-4">
            <h3 className="font-semibold text-sm mb-3">Coffee Details</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={currentSession.coffeeDetails.name}
                onChange={e => handleUpdateSessionDetail('name', e.target.value)}
                placeholder="Coffee Name"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              />
              <input
                type="text"
                value={currentSession.coffeeDetails.origin}
                onChange={e => handleUpdateSessionDetail('origin', e.target.value)}
                placeholder="Origin"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              />
              <select
                value={currentSession.coffeeDetails.process}
                onChange={e => handleUpdateSessionDetail('process', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              >
                {PROCESS_OPTIONS.map(p => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select
                value={currentSession.coffeeDetails.altitude}
                onChange={e => handleUpdateSessionDetail('altitude', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              >
                {ALTITUDE_OPTIONS.map(a => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <select
                value={currentSession.coffeeDetails.roastLevel}
                onChange={e => handleUpdateSessionDetail('roastLevel', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              >
                {ROAST_OPTIONS.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <textarea
                value={currentSession.coffeeDetails.notes}
                onChange={e => handleUpdateSessionDetail('notes', e.target.value)}
                placeholder="Notes"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isEditingSession && (
              <Button
                onClick={() => {
                  if (confirm('Delete this session? This cannot be undone.')) {
                    handleDeleteSession(currentSession.id);
                    setView('list');
                    setCurrentSession(null);
                  }
                }}
                className="flex-1 bg-destructive text-destructive-foreground"
              >
                Delete
              </Button>
            )}
            <Button
              onClick={() => handleSaveSession(currentSession)}
              className="flex-1 bg-primary text-primary-foreground"
            >
              {isEditingSession ? 'Update' : 'Create'} Session
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // ===== LIST VIEW =====
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-background pb-20 px-4 py-4 max-w-md mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Panel Sessions</h2>
          <button
            onClick={handleCreateSession}
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={18} />
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users size={32} className="mx-auto mb-2 opacity-50" />
            <p>No panel sessions yet</p>
            <p className="text-xs">Create one to start a cupping session</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map(session => (
              <div
                key={session.id}
                className="bg-card rounded-lg p-3 border border-border flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{session.sampleIndex}</p>
                  <p className="text-xs text-muted-foreground">{session.coffeeDetails.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.submissions.length} taster{session.submissions.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex gap-1 flex-wrap justify-end">
                  <button
                    onClick={() => handleJoinSession(session)}
                    className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:opacity-90 transition-opacity"
                  >
                    Join
                  </button>
                  <button
                    onClick={() => handleViewResults(session)}
                    className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
                  >
                    Results
                  </button>
                  <button
                    onClick={() => handleEditSession(session)}
                    className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded hover:opacity-90 transition-opacity"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this session?')) {
                        handleDeleteSession(session.id);
                      }
                    }}
                    className="p-1 text-xs bg-destructive/20 text-destructive rounded hover:opacity-90 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === 'creator') return renderCreatorView();
  if (view === 'taster') return renderTasterView();
  if (view === 'results') return renderResults();

  return null;
}
