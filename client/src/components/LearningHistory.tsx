import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Clock, Trash2, Plus, Sparkles, Download, Layers } from 'lucide-react';
import { VideoSummaryResponse, LearningHistoryItem } from '../types';
import { apiService } from '../services/api';
import { ErrorAlert } from './ErrorAlert';
import { EmptyState } from './EmptyState';

interface LearningHistoryProps {
  historyItems: LearningHistoryItem[];
  onSeek: (time: number) => void;
  onClearHistory: () => void;
  onAddNote: (title: string, detail: string, timestamp: number) => void;
  currentTime: number;
}

export const LearningHistory: React.FC<LearningHistoryProps> = ({
  historyItems,
  onSeek,
  onClearHistory,
  onAddNote,
  currentTime
}) => {
  const [summary, setSummary] = useState<VideoSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Note State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDetail, setNoteDetail] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getSummary();
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load video summary.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteDetail.trim()) return;

    onAddNote(noteTitle.trim(), noteDetail.trim(), currentTime);
    setNoteTitle('');
    setNoteDetail('');
    setShowAddNote(false);
  };

  const exportNotesAsMarkdown = () => {
    let md = `# SceneSense Learning Summary: ${summary?.videoTitle || 'Educational Video'}\n\n`;
    md += `*Generated on: ${new Date().toLocaleString()}*\n\n`;

    if (summary) {
      md += `## Key Takeaways\n`;
      summary.keyTakeaways.forEach(k => {
        md += `- ${k}\n`;
      });
      md += `\n## Scene Breakdown\n`;
      summary.scenesSummary.forEach(s => {
        md += `### ${s.title} (${s.timeRange})\n${s.summary}\n\n`;
      });
    }

    if (historyItems.length > 0) {
      md += `## Viewer Session Notes & Q&A History\n`;
      historyItems.forEach(item => {
        md += `### [${item.timeFormatted}] ${item.title}\n${item.detail}\n\n`;
      });
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SceneSense-Notes-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Overview & Takeaways Header */}
      <div className="p-6 rounded-2xl bg-[#121927] border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {summary?.videoTitle || 'Executive Summary & Key Takeaways'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Synthesized concept recap and personal viewing notebook
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportNotesAsMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
              title="Download notes as Markdown file"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Notes (.md)</span>
            </button>
          </div>
        </div>

        {error && <ErrorAlert message={error} onRetry={loadSummary} />}

        {loading && (
          <div className="py-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* 5 Key Takeaways Grid */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {summary.keyTakeaways.map((takeaway, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-start gap-2.5"
              >
                <div className="p-1 rounded-md bg-cyan-500/15 text-cyan-400 shrink-0 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <p className="text-slate-200 leading-relaxed">{takeaway}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scene Timeline Recap */}
      {summary && summary.scenesSummary && (
        <div className="p-6 rounded-2xl bg-[#121927] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Scene-by-Scene Timeline Overview</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {summary.scenesSummary.map((sc, i) => (
              <div
                key={sc.sceneId}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 mb-1.5">
                    <span>SCENE {i + 1}</span>
                    <span className="text-slate-500">{sc.timeRange}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{sc.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-3">
                    {sc.summary}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const [startMin, startSec] = sc.timeRange.split(' - ')[0].split(':').map(Number);
                    onSeek(startMin * 60 + startSec);
                  }}
                  className="mt-3 text-left text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
                >
                  <span>Jump to Scene ▶</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learner's Interactive Notebook & History */}
      <div className="p-6 rounded-2xl bg-[#121927] border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Viewing Notebook & Learning History</h3>
            <span className="text-xs font-mono text-slate-500">({historyItems.length} items)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddNote(!showAddNote)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Timestamped Note</span>
            </button>

            {historyItems.length > 0 && (
              <button
                onClick={onClearHistory}
                className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                title="Clear notebook history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Add Note Modal/Form */}
        {showAddNote && (
          <form
            onSubmit={handleCreateNote}
            className="p-4 rounded-xl bg-slate-900 border border-cyan-500/40 space-y-3"
          >
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold text-cyan-400">New Note at Timestamp: {formatSeconds(currentTime)}</span>
              <button
                type="button"
                onClick={() => setShowAddNote(false)}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
            <input
              type="text"
              value={noteTitle}
              onChange={e => setNoteTitle(e.target.value)}
              placeholder="Note title (e.g. Question for later, Key takeaway...)"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
            <textarea
              value={noteDetail}
              onChange={e => setNoteDetail(e.target.value)}
              placeholder="Write your note details here..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-xs font-bold text-white transition"
            >
              Save Note
            </button>
          </form>
        )}

        {/* History Item List */}
        {historyItems.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No Saved Notes Yet"
            description="As you watch, save answers from SceneSense chat, bookmark ELI5 explanations, or save quiz scores to review them here."
            actionText="Add a note now"
            onAction={() => setShowAddNote(true)}
          />
        ) : (
          <div className="space-y-3">
            {historyItems.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      {item.type}
                    </span>
                    <h4 className="text-xs font-bold text-slate-100">{item.title}</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {item.detail}
                  </p>
                  <div className="text-[10px] text-slate-500 font-mono pt-1">
                    Added: {item.date}
                  </div>
                </div>

                {item.timestamp > 0 && (
                  <button
                    onClick={() => onSeek(item.timestamp)}
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-cyan-400 font-mono transition"
                    title="Jump video to note timestamp"
                  >
                    <Clock className="w-3 h-3" />
                    <span>{item.timeFormatted}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
