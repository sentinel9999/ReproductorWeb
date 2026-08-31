'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/usePlaystore';

export default function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { currentTrack, isPlaying, volume, setCurrentTime, setDuration, nextTrack, currentTime } = usePlayerStore();

  useEffect(() => {
    if (!audioRef.current) return;
    if (currentTrack) {
      audioRef.current.src = currentTrack.audioUrl;
      if (isPlaying) {
        audioRef.current.play().catch((e) => console.error("Error al reproducir audio:", e));
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch((e) => console.error("Error al reanudar audio:", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  // 👈 ESTE EFECTO PERMITE QUE EL SALTO DE TIEMPO (SEEK) AFECTE AL AUDIO REAL
  useEffect(() => {
    if (!audioRef.current) return;
    // Si la diferencia entre el estado de Zustand y el audio real es mayor a 1 segundo, actualizamos el elemento audio
    if (Math.abs(audioRef.current.currentTime - currentTime) > 1) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  return (
    <audio
      ref={audioRef}
      onTimeUpdate={() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }}
      onLoadedMetadata={() => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      }}
      onEnded={() => {
        nextTrack();
      }}
    />
  );
}