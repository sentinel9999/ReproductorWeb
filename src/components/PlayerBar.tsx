'use client';

import { usePlayerStore } from '@/store/usePlaystore';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

export default function PlayerBar() {
  const { currentTrack, isPlaying, togglePlay, nextTrack, prevTrack, currentTime, duration, volume, setVolume } = usePlayerStore();

  if (!currentTrack) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-zinc-900 border-t border-zinc-800 px-6 flex items-center justify-between z-50 text-white">
      {/* Info Track */}
      <div className="flex items-center gap-4 w-1/4 min-w-[180px]">
        <img
          src={currentTrack.coverUrl || '/placeholder.png'}
          alt={currentTrack.title}
          className="w-12 h-12 rounded object-cover"
        />
        <div className="truncate">
          <p className="text-sm font-semibold truncate">{currentTrack.title}</p>
          <p className="text-xs text-zinc-400 truncate">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Controles y Barra de Progreso */}
      <div className="flex flex-col items-center gap-1.5 w-2/4 max-w-xl">
        <div className="flex items-center gap-4">
          <button onClick={prevTrack} className="text-zinc-400 hover:text-white transition">
            <SkipBack size={20} />
          </button>
          <button
            onClick={togglePlay}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition"
          >
            {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" className="ml-0.5" />}
          </button>
          <button onClick={nextTrack} className="text-zinc-400 hover:text-white transition">
            <SkipForward size={20} />
          </button>
        </div>
        <div className="flex items-center gap-2 w-full text-xs text-zinc-400">
          <span>{formatTime(currentTime)}</span>
          <div className="relative w-full h-1 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volumen */}
      <div className="flex items-center gap-2 w-1/4 justify-end">
        <Volume2 size={18} className="text-zinc-400" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-24 accent-white cursor-pointer"
        />
      </div>
    </div>
  );
}