import React, { useRef, useEffect, useState } from 'react';
import { Scene, VideoCue } from '../types';
import { AlignLeft, Clock, Sparkles, BookOpen, Volume2, ArrowDownCircle } from 'lucide-react';

interface ContextPanelProps {
  currentTime: number;
  activeScene?: Scene;
  transcript: VideoCue[];
  onSeek: (time: number) => void;
  onOpenExplainer: () => void;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({
  currentTime,
  activeScene,
  transcript,
  onSeek,
  onOpenExplainer
}) => {
  const [autoScroll, setAutoScroll] = useState(true);
  const activeCueRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find active cue
  const activeCueIndex = transcript.findIndex(
    c => currentTime >= c.start && currentTime <= c.end
  );

  // Auto-scroll when active cue changes
  useEffect(() => {
    if (autoScroll && activeCueRef.current && containerRef.current) {
      activeCueRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeCueIndex, autoScroll]);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-[#121927] rounded-2xl border border-slate-800/90 overflow-hidden shadow-xl">
      {/* Active Scene Header Card */}
      <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-900/60 border-b border-slate-800">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-cyan-400">
              CURRENT SCENE
            </span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded-lg border border-slate-800">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>{formatSeconds(currentTime)}</span>
          </div>
        </div>

        <h2 className="text-base font-bold text-white tracking-tight leading-snug">
          {activeScene ? activeScene.title : 'Loading scene context...'}
        </h2>

        {activeScene && (
          <>
            <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
              {activeScene.summary}
            </p>

            {/* Key Concepts Tags */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {activeScene.keyConcepts.map((concept, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700 text-[10px] font-medium text-slate-300 hover:border-cyan-500/50 transition cursor-default"
                >
                  {concept}
                </span>
              ))}
            </div>

            {/* Glossary Section */}
            {activeScene.glossary && activeScene.glossary.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-1.5">
                  <BookOpen className="w-3 h-3 text-amber-400" />
                  <span>Scene Glossary</span>
                </div>
                <div className="space-y-1">
                  {activeScene.glossary.map((g, i) => (
                    <div key={i} className="text-[11px] text-slate-300 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                      <span className="font-semibold text-amber-300">{g.term}: </span>
                      <span className="text-slate-400">{g.definition}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Transcript Toolbar */}
      <div className="px-4 py-2.5 bg-slate-900/40 border-b border-slate-800/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <AlignLeft className="w-3.5 h-3.5 text-cyan-400" />
          <span>Synchronized Transcript</span>
          <span className="text-[10px] text-slate-500 font-mono">({transcript.length} cues)</span>
        </div>
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition ${
            autoScroll
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
              : 'bg-slate-800 text-slate-400 hover:text-slate-300'
          }`}
          title="Toggle transcript auto-scrolling with playback"
        >
          <ArrowDownCircle className="w-3 h-3" />
          Auto-scroll: {autoScroll ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Synchronized Transcript Cue List */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 select-text"
      >
        {transcript.map((cue, index) => {
          const isActive = index === activeCueIndex;
          return (
            <div
              key={cue.id}
              ref={isActive ? activeCueRef : null}
              onClick={() => onSeek(cue.start)}
              className={`group flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                isActive
                  ? 'bg-cyan-950/60 border border-cyan-500/50 shadow-md shadow-cyan-950/40'
                  : 'hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              {/* Timestamp Pill */}
              <button
                className={`shrink-0 font-mono text-[10px] px-2 py-1 rounded-lg transition ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 group-hover:text-cyan-300 group-hover:bg-slate-700'
                }`}
                title="Jump video to this timestamp"
              >
                {formatSeconds(cue.start)}
              </button>

              {/* Cue Text */}
              <div className="flex-1 text-xs">
                {cue.speaker && (
                  <span className={`block font-semibold text-[10px] uppercase tracking-wide mb-0.5 ${
                    isActive ? 'text-cyan-300' : 'text-slate-400'
                  }`}>
                    {cue.speaker}
                  </span>
                )}
                <p className={`leading-relaxed ${
                  isActive ? 'text-white font-medium' : 'text-slate-300 group-hover:text-slate-100'
                }`}>
                  {cue.text}
                </p>
              </div>

              {isActive && (
                <div className="shrink-0 text-cyan-400 animate-pulse mt-1" title="Currently speaking">
                  <Volume2 className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
