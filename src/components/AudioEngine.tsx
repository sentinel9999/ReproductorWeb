'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/usePlaystore';

export default function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { currentTrack, isPlaying, volume, setCurrentTime, setDuration, nextTrack } = usePlayerStore();

  // 1. Sincronizar fuente y estado de reproducción
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.audioUrl) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Esperando interacción del usuario o buffer:', err);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  // 2. Sincronizar volumen
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  if (!currentTrack) return null;

  return (
    <audio
      ref={audioRef}
      key={currentTrack.id} // Forza la recarga limpia al cambiar de canción
      src={currentTrack.audioUrl}
      preload="auto"
      onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
      onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      onEnded={nextTrack}
      onError={(e) => {
        const error = e.currentTarget.error;
        console.error('Detalle del error de audio:', {
          code: error?.code,
          message: error?.message,
          src: e.currentTarget.src,
        });
      }}
    />
  );
}