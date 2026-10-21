import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize, Sparkles, Layers } from 'lucide-react';
import { Scene } from '../types';

interface VideoPlayerProps {
  videoUrl: string;
  duration: number;
  scenes: Scene[];
  currentTime: number;
  activeScene?: Scene;
  onTimeUpdate: (time: number) => void;
  onSeek: (time: number) => void;
  onOpenExplainer: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  duration,
  scenes,
  currentTime,
  activeScene,
  onTimeUpdate,
  onSeek,
  onOpenExplainer
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const hideControlsTimeout = useRef<any>(null);

  // Sync external seek actions
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 1.2) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Playback error:', err);
      });
    }
  };

  const handleSkip = (seconds: number) => {
    if (!videoRef.current) return;
    const target = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = target;
    onSeek(target);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = percentage * (duration || 180);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
    onSeek(targetTime);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleSpeedCycle = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextSpeed = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const effectiveDuration = duration || 180;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100));

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative group w-full bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl aspect-video select-none"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover cursor-pointer"
        onClick={handlePlayPause}
        onTimeUpdate={() => {
          if (videoRef.current) {
            onTimeUpdate(videoRef.current.currentTime);
          }
        }}
        onEnded={() => setIsPlaying(false)}
        onError={() => setVideoError(true)}
        playsInline
      />

      {/* Fallback Display if video URL can't load */}
      {videoError && (
        <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="p-4 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-3">
            <Layers className="w-8 h-8" />
          </div>
          <p className="text-sm font-semibold text-slate-200">Simulated Educational Playback Active</p>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Educational transcript, timestamp cues, and SceneSense AI remain 100% active and synchronized.
          </p>
        </div>
      )}

      {/* X-Ray Contextual Badge (Top-Left HUD) */}
      <div className={`absolute top-4 left-4 transition-opacity duration-300 pointer-events-none z-20 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 text-xs shadow-lg">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-cyan-400 font-bold tracking-wider uppercase text-[10px]">X-RAY CONTEXT</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-200 font-medium truncate max-w-[200px] sm:max-w-xs">
            {activeScene ? activeScene.title : 'Exploring Deep Space'}
          </span>
        </div>
      </div>

      {/* Quick "Explain Scene" Floating HUD Button (Top-Right) */}
      <div className={`absolute top-4 right-4 transition-opacity duration-300 z-20 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={onOpenExplainer}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/90 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg hover:shadow-amber-500/25 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>Explain This Scene</span>
        </button>
      </div>

      {/* Center Play Overlay Icon when Paused */}
      {!isPlaying && (
        <div
          onClick={handlePlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[2px] cursor-pointer z-10"
        >
          <button className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-xl shadow-cyan-500/30 transform transition hover:scale-105 active:scale-95 pl-1">
            <Play className="w-8 h-8 fill-current" />
          </button>
        </div>
      )}

      {/* Bottom TV Control Bar HUD */}
      <div className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-4 transition-opacity duration-300 z-20 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Progress Bar with Scene Markers */}
        <div
          onClick={handleProgressBarClick}
          className="group/progress relative h-2.5 w-full bg-slate-800/80 rounded-full cursor-pointer mb-3 hover:h-3 transition-all"
        >
          {/* Filled Progress Bar */}
          <div
            className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-sky-300 rounded-full relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-md border-2 border-cyan-500 transform scale-0 group-hover/progress:scale-100 transition-transform"></div>
          </div>

          {/* Scene Segment Markers */}
          {scenes.map(s => {
            const markerLeft = (s.startTime / effectiveDuration) * 100;
            return (
              <div
                key={s.id}
                title={s.title}
                style={{ left: `${markerLeft}%` }}
                className="absolute top-0 bottom-0 w-0.5 bg-white/40 hover:bg-amber-400 z-10"
              />
            );
          })}
        </div>

        {/* Media Control Buttons */}
        <div className="flex items-center justify-between text-slate-200 text-xs">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className="p-1.5 hover:text-cyan-400 transition"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <button
              onClick={() => handleSkip(-10)}
              className="p-1.5 hover:text-cyan-400 transition"
              title="Rewind 10s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleSkip(10)}
              className="p-1.5 hover:text-cyan-400 transition"
              title="Forward 10s"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 group/vol">
              <button onClick={toggleMute} className="p-1 hover:text-cyan-400 transition">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-slate-700 accent-cyan-400 rounded cursor-pointer"
              />
            </div>

            {/* Time Stamp Display */}
            <div className="font-mono text-[11px] text-slate-400 ml-1">
              <span className="text-slate-200">{formatTime(currentTime)}</span> / <span>{formatTime(effectiveDuration)}</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Speed Selector */}
            <button
              onClick={handleSpeedCycle}
              className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-[11px] font-mono text-cyan-300 border border-slate-700 transition"
            >
              {playbackSpeed}x
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 hover:text-cyan-400 transition"
              title="Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
