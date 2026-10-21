import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Clock, Bookmark, HelpCircle, AlertCircle } from 'lucide-react';
import { ChatMessage, Citation } from '../types';
import { apiService } from '../services/api';

interface ChatDrawerProps {
  currentTime: number;
  onSeek: (time: number) => void;
  onSaveToHistory: (title: string, detail: string, timestamp: number) => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  currentTime,
  onSeek,
  onSaveToHistory
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am SceneSense. I am actively tracking your educational video. Ask me anything about the James Webb telescope, mirror engineering, the Kapton sunshield, or exoplanets.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedQuestions: [
        'Why does Webb use infrared light?',
        'Why are the mirror segments coated in gold?',
        'How does the Kapton sunshield keep instruments cold?',
        'What is cosmological redshift?'
      ],
      provider: 'Local Contextual RAG'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedMessageIds, setSavedMessageIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isLoading) return;

    setErrorMsg(null);
    setInputQuery('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await apiService.askQuestion(textToSend, currentTime);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: response.citations,
        suggestedQuestions: response.suggestedQuestions,
        provider: response.provider
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMsg(err.message || 'Unable to retrieve answer from SceneSense backend.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNote = (msg: ChatMessage) => {
    if (savedMessageIds.has(msg.id)) return;
    onSaveToHistory(
      'Q&A Insight',
      msg.content.slice(0, 160) + '...',
      currentTime
    );
    setSavedMessageIds(prev => new Set(prev).add(msg.id));
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-[#121927] rounded-2xl border border-slate-800/90 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-3.5 bg-gradient-to-r from-slate-900 to-slate-900/70 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide">Ask SceneSense</h3>
            <p className="text-[10px] text-slate-400">Context-Grounded Video Assistant</p>
          </div>
        </div>

        <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
          Sync: <span className="text-cyan-400 font-semibold">{formatSeconds(currentTime)}</span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 text-xs ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5 shadow">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[85%] rounded-2xl p-3.5 space-y-2.5 ${
              msg.role === 'user'
                ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white rounded-tr-sm shadow-md'
                : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-sm shadow-lg'
            }`}>
              {/* Message Header */}
              <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 border-b border-white/10 pb-1">
                <span className={msg.role === 'user' ? 'text-cyan-100 font-semibold' : 'text-cyan-400 font-medium'}>
                  {msg.role === 'user' ? 'You' : 'SceneSense'}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message Content */}
              <div className="leading-relaxed whitespace-pre-wrap font-normal">
                {msg.content}
              </div>

              {/* Citations if available */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-cyan-400">
                    <Clock className="w-3 h-3" />
                    <span>Referenced Video Moments:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.citations.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => onSeek(c.time)}
                        className="px-2 py-0.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-[10px] text-cyan-300 transition flex items-center gap-1 font-mono"
                        title="Click to jump video to this moment"
                      >
                        <span>▶</span>
                        <span>{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Questions */}
              {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-cyan-400" />
                    <span>Suggested Next Questions:</span>
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {msg.suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(q)}
                        className="text-left text-[10px] px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 transition"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Toolbar on Assistant Messages */}
              {msg.role === 'assistant' && (
                <div className="flex items-center justify-between pt-1.5 text-[10px] text-slate-400">
                  <span className="font-mono text-[9px] text-slate-500">
                    Engine: {msg.provider || 'Local'}
                  </span>
                  <button
                    onClick={() => handleSaveNote(msg)}
                    disabled={savedMessageIds.has(msg.id)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded transition ${
                      savedMessageIds.has(msg.id)
                        ? 'text-cyan-400 bg-cyan-950/60'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Bookmark className="w-3 h-3" />
                    <span>{savedMessageIds.has(msg.id) ? 'Saved to Notes' : 'Save Note'}</span>
                  </button>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 text-xs justify-start items-center">
            <div className="w-7 h-7 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-[11px] text-slate-400">Consulting video transcript...</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={e => setInputQuery(e.target.value)}
          placeholder={`Ask about this scene (${formatSeconds(currentTime)})...`}
          disabled={isLoading}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
        />
        <button
          type="submit"
          disabled={isLoading || !inputQuery.trim()}
          className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white shadow-md transition"
          title="Send Question"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
