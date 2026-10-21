import React, { useEffect, useState } from 'react';
import { X, Sparkles, Lightbulb, HelpCircle, Bookmark, CheckCircle2, RefreshCw } from 'lucide-react';
import { ExplanationResponse } from '../types';
import { apiService } from '../services/api';

interface ExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTime: number;
  onSaveToHistory: (title: string, detail: string, timestamp: number) => void;
}

export const ExplainerModal: React.FC<ExplainerModalProps> = ({
  isOpen,
  onClose,
  currentTime,
  onSaveToHistory
}) => {
  const [data, setData] = useState<ExplanationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchExplanation();
      setIsSaved(false);
    }
  }, [isOpen, currentTime]);

  const fetchExplanation = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.explainScene(currentTime);
      setData(result);
    } catch (err: any) {
      console.error('Failed to load simple explanation:', err);
      setError(err.message || 'Could not generate explanation for this scene.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!data) return;
    onSaveToHistory(
      `Concept Breakdown: ${data.sceneTitle}`,
      data.simpleExplanation,
      currentTime
    );
    setIsSaved(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#121927] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Explain Simply (ELI5 Mode)</h2>
              <p className="text-[11px] text-amber-300/80">Making complex space astrophysics accessible</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs text-slate-300">Simplifying active concepts for you...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={fetchExplanation}
                className="px-2 py-1 bg-red-900/60 rounded text-red-100 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            </div>
          )}

          {!loading && !error && data && (
            <>
              {/* Scene Title Tag */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}
                </span>
                <h3 className="text-sm font-bold text-slate-100">{data.sceneTitle}</h3>
              </div>

              {/* Main Simple Breakdown */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 block">
                  Plain-English Breakdown
                </span>
                <p className="text-sm text-slate-100 font-medium">
                  {data.simpleExplanation}
                </p>
              </div>

              {/* Real World Analogy Card */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-100/90 leading-relaxed">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold mb-1.5">
                  <Lightbulb className="w-4 h-4" />
                  <span>Real-World Analogy</span>
                </div>
                <p>{data.realWorldAnalogy}</p>
              </div>

              {/* Key Concepts Pills */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Core Scientific Ideas:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {data.keyConcepts.map((concept, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Check Question */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-1.5 font-semibold text-slate-300 mb-1">
                  <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Think About It:</span>
                </div>
                <p className="italic text-slate-400">{data.quickCheck}</p>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleSave}
            disabled={!data || isSaved}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              isSaved
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {isSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'Saved to Notes' : 'Save to Learning Notes'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
