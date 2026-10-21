import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { VideoPlayer } from './components/VideoPlayer';
import { ContextPanel } from './components/ContextPanel';
import { ChatDrawer } from './components/ChatDrawer';
import { QuizPanel } from './components/QuizPanel';
import { LearningHistory } from './components/LearningHistory';
import { ExplainerModal } from './components/ExplainerModal';
import { IntegrationsModal } from './components/IntegrationsModal';
import { ErrorAlert } from './components/ErrorAlert';
import { VideoMetadata, LearningHistoryItem, Scene } from './types';
import { apiService } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<'view' | 'quiz' | 'history'>('view');
  const [videoData, setVideoData] = useState<VideoMetadata | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<string>('Local RAG Engine');

  // Modals
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);

  // Learning History (persisted in localStorage)
  const [historyItems, setHistoryItems] = useState<LearningHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('scenesense_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'initial-note-1',
        type: 'note',
        title: 'Session Started',
        detail: 'Exploring James Webb Space Telescope infrared optics and mirror alignment.',
        timestamp: 0,
        timeFormatted: '0:00',
        date: new Date().toLocaleDateString()
      }
    ];
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('scenesense_history', JSON.stringify(historyItems));
    } catch {}
  }, [historyItems]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const video = await apiService.getVideo();
      setVideoData(video);

      // Check health endpoint for provider
      const healthRes = await fetch('/health').catch(() => null);
      if (healthRes && healthRes.ok) {
        const healthData = await healthRes.json();
        if (healthData.aiProvider) {
          setAiProvider(healthData.aiProvider.split(' ')[0] + ' ' + (healthData.aiProvider.split(' ')[1] || ''));
        }
      }
    } catch (err: any) {
      console.error('Failed to load initial data:', err);
      setError(err.message || 'Unable to connect to SceneSense backend. Please ensure the server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const handleSaveToHistory = (title: string, detail: string, timestamp: number) => {
    const m = Math.floor(timestamp / 60);
    const s = Math.floor(timestamp % 60);
    const timeFormatted = `${m}:${s.toString().padStart(2, '0')}`;

    const newItem: LearningHistoryItem = {
      id: `history-${Date.now()}`,
      type: title.toLowerCase().includes('quiz') ? 'quiz' : title.toLowerCase().includes('concept') ? 'explanation' : 'question',
      title,
      detail,
      timestamp,
      timeFormatted,
      date: new Date().toLocaleDateString()
    };

    setHistoryItems(prev => [newItem, ...prev]);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your learning notes and viewing history?')) {
      setHistoryItems([]);
    }
  };

  // Find active scene based on current time
  const activeScene: Scene | undefined = videoData?.scenes.find(
    s => currentTime >= s.startTime && currentTime <= s.endTime
  ) || videoData?.scenes[0];

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 flex flex-col antialiased">
      {/* Top TV Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        aiProvider={aiProvider}
        onOpenIntegrations={() => setIsIntegrationsOpen(true)}
        onOpenExplainer={() => setIsExplainerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {error && (
          <div className="mb-6">
            <ErrorAlert message={error} onRetry={loadInitialData} />
          </div>
        )}

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <div className="relative w-12 h-12 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">Initializing SceneSense HUD</h3>
            <p className="text-xs text-slate-400 mt-1">Connecting to backend context engine...</p>
          </div>
        ) : (
          <>
            {/* VIEW TAB: Video + Context + Chat */}
            {activeTab === 'view' && videoData && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Video Player & Context Chat (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Video Player */}
                  <VideoPlayer
                    videoUrl={videoData.videoUrl}
                    duration={videoData.duration}
                    scenes={videoData.scenes}
                    currentTime={currentTime}
                    activeScene={activeScene}
                    onTimeUpdate={setCurrentTime}
                    onSeek={handleSeek}
                    onOpenExplainer={() => setIsExplainerOpen(true)}
                  />

                  {/* Ask SceneSense Chat Drawer */}
                  <div className="h-[460px]">
                    <ChatDrawer
                      currentTime={currentTime}
                      onSeek={handleSeek}
                      onSaveToHistory={handleSaveToHistory}
                    />
                  </div>
                </div>

                {/* Right Column: Synchronized Context & Transcript (5 cols) */}
                <div className="lg:col-span-5 h-[840px] sticky top-20">
                  <ContextPanel
                    currentTime={currentTime}
                    activeScene={activeScene}
                    transcript={videoData.transcript}
                    onSeek={handleSeek}
                    onOpenExplainer={() => setIsExplainerOpen(true)}
                  />
                </div>
              </div>
            )}

            {/* QUIZ TAB */}
            {activeTab === 'quiz' && (
              <QuizPanel
                onSeek={time => {
                  handleSeek(time);
                  setActiveTab('view');
                }}
                onSaveToHistory={handleSaveToHistory}
              />
            )}

            {/* SUMMARY & LEARNING HISTORY TAB */}
            {activeTab === 'history' && (
              <LearningHistory
                historyItems={historyItems}
                onSeek={time => {
                  handleSeek(time);
                  setActiveTab('view');
                }}
                onClearHistory={handleClearHistory}
                onAddNote={(title, detail, timestamp) => handleSaveToHistory(title, detail, timestamp)}
                currentTime={currentTime}
              />
            )}
          </>
        )}
      </main>

      {/* Simple Explainer (ELI5) Modal */}
      <ExplainerModal
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
        currentTime={currentTime}
        onSaveToHistory={handleSaveToHistory}
      />

      {/* MCP & Alexa+ Architecture Viewer Modal */}
      <IntegrationsModal
        isOpen={isIntegrationsOpen}
        onClose={() => setIsIntegrationsOpen(false)}
      />

      {/* Subtle Footer */}
      <footer className="border-t border-slate-900 bg-[#080B12] py-4 px-6 text-center text-[11px] text-slate-500">
        <p>SceneSense — AI-Powered Contextual Viewing Assistant &bull; Built for Amazon Developer Hackathon</p>
      </footer>
    </div>
  );
}
