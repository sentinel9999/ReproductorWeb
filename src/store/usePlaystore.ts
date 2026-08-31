import { create } from 'zustand';
import { Track } from '@/types/rokola';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Track[];
  currentIndex: number;
  
  setTrack: (track: Track) => void;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  togglePlay: () => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  
  // 👈 NUEVAS FUNCIONES DE SALTO Y POSICIONAMIENTO
  seek: (time: number) => void;
  skipTime: (seconds: number) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  queue: [],
  currentIndex: 0,

  setTrack: (track) => set({ currentTrack: track, isPlaying: true, currentTime: 0 }),
  
  setQueue: (tracks, startIndex = 0) => {
    const track = tracks[startIndex];
    if (track) {
      set({
        queue: tracks,
        currentIndex: startIndex,
        currentTrack: track,
        isPlaying: true,
        currentTime: 0,
      });
    }
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),

  nextTrack: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0) return;
    const nextIndex = (currentIndex + 1) % queue.length;
    set({
      currentIndex: nextIndex,
      currentTrack: queue[nextIndex],
      isPlaying: true,
      currentTime: 0,
    });
  },

  prevTrack: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0) return;
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    set({
      currentIndex: prevIndex,
      currentTrack: queue[prevIndex],
      isPlaying: true,
      currentTime: 0,
    });
  },

  // 👈 IMPLEMENTACIÓN DE SEEK Y SKIP
  seek: (time) => {
    set({ currentTime: time });
  },

  skipTime: (seconds) => {
    const { currentTime, duration } = get();
    const newTime = Math.max(0, Math.min(duration || 0, currentTime + seconds));
    set({ currentTime: newTime });
  },
}));