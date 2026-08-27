'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/usePlaystore';

export default function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { currentTrack, isPlaying, volume, setCurrentTime, setDuration, nextTrack } = usePlayerStore();

  // Controlar Play / Pause
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  // Controlar Volumen
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  if (!currentTrack) return null;

  return (
    <audio
      ref={audioRef}
      src={currentTrack.audioUrl}
      onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
      onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      onEnded={nextTrack}
    />
  );
}