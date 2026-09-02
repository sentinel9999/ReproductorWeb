'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/usePlaystore';

export default function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { currentTrack, isPlaying, volume, setCurrentTime, setDuration, nextTrack } = usePlayerStore();

  // Cambio de pista
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentTrack?.audioUrl) {
      audio.pause();
      audio.removeAttribute('src');
      return;
    }

    if (audio.src !== currentTrack.audioUrl) {
      audio.src = currentTrack.audioUrl;
      audio.load();

      if (isPlaying) {
        audio.play().catch((err) => {
          if (err.name !== 'AbortError') {
            console.warn('Buffer en espera:', err.message);
          }
        });
      }
    }
  }, [currentTrack]);

  // Play / Pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.audioUrl) return;

    if (isPlaying) {
      audio.play().catch((err) => {
        if (err.name !== 'AbortError') {
          console.warn('Esperando interacción:', err.message);
        }
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Volumen
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  if (!currentTrack?.audioUrl) return null;

  return (
    <audio
      ref={audioRef}
      preload="auto"
      onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
      onLoadedMetadata={(e) => {
        if (!isNaN(e.currentTarget.duration)) {
          setDuration(e.currentTarget.duration);
        }
      }}
      onEnded={nextTrack}
    />
  );
}