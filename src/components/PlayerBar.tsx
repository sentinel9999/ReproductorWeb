'use client';

import { useRef } from 'react';
import { usePlayerStore } from '@/store/usePlaystore';
import { Play, Pause, SkipBack, SkipForward, Volume2, RotateCcw, RotateCw } from 'lucide-react';

export default function PlayerBar() {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    nextTrack, 
    prevTrack, 
    currentTime, 
    duration, 
    volume, 
    setVolume,
    seek,
    skipTime
  } = usePlayerStore();

  const progressBarRef = useRef<HTMLDivElement>(null);

  if (!currentTrack) return null;

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isLiveStream = !currentTrack.duration || currentTrack.duration === 0;

  // Manejar clic en la barra de progreso para cambiar la posición
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || isLiveStream || !duration) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = clickPosition * duration;
    
    seek(newTime);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/80 px-6 flex items-center justify-between z-50 text-white shadow-2xl">
      {/* 1. Información de la Pista */}
      <div className="flex items-center gap-3.5 w-1/4 min-w-[180px]">
        <img
          src={currentTrack.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop'}
          alt={currentTrack.title}
          className="w-12 h-12 rounded-lg object-cover border border-zinc-800/80 flex-shrink-0 bg-zinc-900"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop';
          }}
        />
        <div className="truncate">
          <p className="text-sm font-semibold truncate text-white">
            {currentTrack.title}
          </p>
          <p className="text-xs text-zinc-400 truncate mt-0.5">
            {currentTrack.artist}
          </p>
        </div>
      </div>

      {/* 2. Controles, Botones -10s/+10s y Barra de Progreso */}
      <div className="flex flex-col items-center gap-1.5 w-2/4 max-w-xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={prevTrack} 
            className="text-zinc-400 hover:text-white transition cursor-pointer p-1"
            title="Pista anterior"
          >
            <SkipBack size={18} />
          </button>

          {/* Botón retroceder 10 segundos */}
          <button 
            onClick={() => skipTime(-10)} 
            className="text-zinc-400 hover:text-white transition cursor-pointer p-1"
            title="Retroceder 10 segundos"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={togglePlay}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition cursor-pointer shadow-md"
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? (
              <Pause size={17} fill="black" />
            ) : (
              <Play size={17} fill="black" className="ml-0.5" />
            )}
          </button>

          {/* Botón adelantar 10 segundos */}
          <button 
            onClick={() => skipTime(10)} 
            className="text-zinc-400 hover:text-white transition cursor-pointer p-1"
            title="Adelantar 10 segundos"
          >
            <RotateCw size={16} />
          </button>

          <button 
            onClick={nextTrack} 
            className="text-zinc-400 hover:text-white transition cursor-pointer p-1"
            title="Siguiente pista"
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* Indicador EN VIVO o Barra de Progreso Interactiva */}
        {isLiveStream ? (
          <div className="flex items-center justify-center gap-2 text-xs text-green-400 font-semibold py-0.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="tracking-wider">TRANSMISIÓN EN VIVO</span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 w-full text-xs text-zinc-400 font-mono">
            <span className="w-9 text-right">{formatTime(currentTime)}</span>
            
            {/* Barra de progreso clickeable */}
            <div 
              ref={progressBarRef}
              onClick={handleProgressBarClick}
              className="relative w-full h-2 bg-zinc-800 rounded-full overflow-hidden cursor-pointer group py-1"
            >
              <div className="absolute inset-y-0 left-0 w-full bg-transparent flex items-center">
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 group-hover:bg-green-400 transition-all duration-75"
                    style={{ width: `${Math.min(100, (currentTime / (duration || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <span className="w-9">{formatTime(duration)}</span>
          </div>
        )}
      </div>

      {/* 3. Control de Volumen */}
      <div className="flex items-center gap-2.5 w-1/4 justify-end">
        <Volume2 size={18} className="text-zinc-400" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-24 accent-green-500 bg-zinc-700 h-1 rounded-lg cursor-pointer"
          aria-label="Control de volumen"
        />
      </div>
    </div>
  );
}