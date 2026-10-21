import React, { useEffect, useState } from 'react';
import { X, Radio, Server, Mic, CheckCircle2, AlertTriangle, Code2 } from 'lucide-react';
import { apiService } from '../services/api';

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntegrationsModal: React.FC<IntegrationsModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'mcp' | 'alexa'>('mcp');

  useEffect(() => {
    if (isOpen) {
      apiService.getIntegrationsStatus()
        .then(res => setData(res))
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#121927] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Integrations Architecture: MCP & Alexa+
              </h2>
              <p className="text-[11px] text-slate-400">
                Extensible Tool Schemas & Multimodal Voice Readiness
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Disclaimer Notice */}
        <div className="px-5 py-3 bg-amber-950/30 border-b border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Architectural Status:</strong> Schemas and handler contracts are implemented in backend code (<code className="bg-amber-900/40 px-1 py-0.5 rounded text-[11px]">server/src/integrations</code>). Live deployment to AWS Lambda or MCP host is prepared for the next release phase.
          </span>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('mcp')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 transition ${
              activeTab === 'mcp'
                ? 'border-b-2 border-cyan-400 text-cyan-300 bg-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Model Context Protocol (MCP)</span>
          </button>
          <button
            onClick={() => setActiveTab('alexa')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 transition ${
              activeTab === 'alexa'
                ? 'border-b-2 border-cyan-400 text-cyan-300 bg-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Amazon Alexa+ Multimodal</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
          {activeTab === 'mcp' && (
            <div className="space-y-3 font-sans">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Ready for Stdio / SSE MCP Server Wrapper</span>
              </div>
              <p className="text-slate-300 text-xs">
                SceneSense implements 4 standardized MCP Tools that can be exposed to Claude Desktop, Cursor, or any MCP-compatible client:
              </p>

              <div className="space-y-2">
                {[
                  { name: 'scenesense_get_current_scene', desc: 'Returns active video timestamp, scene summary, and synchronized cues' },
                  { name: 'scenesense_ask_question', desc: 'Answers questions using strictly grounded video transcript context' },
                  { name: 'scenesense_explain_scene', desc: 'ELI5 concept simplifier with everyday analogies' },
                  { name: 'scenesense_get_quiz', desc: 'Generates active-scene comprehension questions' }
                ].map(tool => (
                  <div key={tool.name} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-cyan-400 font-mono font-bold text-xs">{tool.name}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{tool.desc}</div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-2 font-mono">
                  <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sample MCP Tool JSON Schema:</span>
                </div>
                <pre className="text-[11px] text-cyan-200 overflow-x-auto p-2 bg-slate-900 rounded">
{`{
  "name": "scenesense_ask_question",
  "description": "Answers viewer questions using strictly grounded video transcript context.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "question": { "type": "string" },
      "currentTime": { "type": "number" }
    },
    "required": ["question"]
  }
}`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'alexa' && (
            <div className="space-y-3 font-sans">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Alexa Skills Kit (ASK) Contract Ready</span>
              </div>
              <p className="text-slate-300 text-xs">
                Allows smart display viewers to invoke hands-free questions from the couch:
              </p>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-amber-400 font-mono font-bold text-xs">AskSceneSenseIntent</div>
                  <div className="text-slate-400 text-xs mt-0.5">
                    "Alexa, ask SceneSense why the primary mirror is coated in gold."
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-amber-400 font-mono font-bold text-xs">ExplainSceneIntent</div>
                  <div className="text-slate-400 text-xs mt-0.5">
                    "Alexa, ask SceneSense to explain this scene simply."
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-amber-400 font-mono font-bold text-xs">QuizMeIntent</div>
                  <div className="text-slate-400 text-xs mt-0.5">
                    "Alexa, quiz me on what I just watched."
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-2 font-mono">
                  <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Alexa Skill Output Speech Structure:</span>
                </div>
                <pre className="text-[11px] text-cyan-200 overflow-x-auto p-2 bg-slate-900 rounded">
{`{
  "version": "1.0",
  "response": {
    "outputSpeech": {
      "type": "PlainText",
      "text": "Gold provides 98% infrared reflectivity..."
    },
    "card": { "type": "Simple", "title": "SceneSense Answer" }
  }
}`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
