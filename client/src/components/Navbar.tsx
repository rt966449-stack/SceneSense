import React from 'react';
import { Eye, Cpu, Radio, Sparkles, BookOpen, HelpCircle } from 'lucide-react';

interface NavbarProps {
  activeTab: 'view' | 'quiz' | 'history';
  setActiveTab: (tab: 'view' | 'quiz' | 'history') => void;
  aiProvider: string;
  onOpenIntegrations: () => void;
  onOpenExplainer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  aiProvider,
  onOpenIntegrations,
  onOpenExplainer
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0A0E17]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-amber-500 text-white shadow-lg shadow-cyan-500/20">
            <Eye className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">Scene<span className="text-cyan-400">Sense</span></span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                PROTOTYPE MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Amazon Hackathon Contextual Viewing Assistant</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-800 text-sm">
          <button
            onClick={() => setActiveTab('view')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'view'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Watch & Context
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'quiz'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Interactive Quiz
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Summary & Notes
          </button>
        </nav>

        {/* Action Controls & Badges */}
        <div className="flex items-center gap-2.5">
          {/* Quick Explainer Trigger */}
          <button
            onClick={onOpenExplainer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-medium transition-all"
            title="Explain current scene in simple terms"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Explain Simply</span>
          </button>

          {/* MCP & Alexa Architecture Modal Trigger */}
          <button
            onClick={onOpenIntegrations}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-xs font-medium transition-all"
            title="View MCP & Alexa+ integration readiness"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">MCP & Alexa+</span>
          </button>

          {/* Active AI Engine Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-[120px] sm:max-w-none text-slate-300 font-mono">
              {aiProvider || 'Local Engine'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
