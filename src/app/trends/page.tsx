'use client';

import { usePlayerStore } from '@/store/usePlaystore';
import { Track } from '@/types/rokola';
import { Flame, Play, Pause, TrendingUp, Sparkles, Disc } from 'lucide-react';

interface TrendingTrack extends Track {
  rank: number;
  plays: string;
  movement: 'up' | 'stable';
}

const TOP_TRENDING: TrendingTrack[] = [
  {
    id: 'tr-1',
    rank: 1,
    title: 'Summer Vibes Deluxe',
    artist: 'Benjamin Tissot',
    plays: '1.2M',
    movement: 'up',
    duration: 180,
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
    audioUrl: 'https://www.bensound.com/bensound-music/bensound-sunny.mp3',
  },
  {
    id: 'tr-2',
    rank: 2,
    title: 'Energy Pulse',
    artist: 'Electronic Waves',
    plays: '980K',
    movement: 'up',
    duration: 179,
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    audioUrl: 'https://www.bensound.com/bensound-music/bensound-energy.mp3',
  },
  {
    id: 'tr-3',
    rank: 3,
    title: 'Acoustic Breeze',
    artist: 'Benjamin Tissot',
    plays: '840K',
    movement: 'stable',
    duration: 100,
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
    audioUrl: 'https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3',
  },
  {
    id: 'tr-4',
    rank: 4,
    title: 'Sunny Beats',
    artist: 'Bensound',
    plays: '710K',
    movement: 'up',
    duration: 140,
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    audioUrl: 'https://www.bensound.com/bensound-music/bensound-sunny.mp3',
  },
  {
    id: 'tr-5',
    rank: 5,
    title: 'Slow Motion',
    artist: 'Chillout Lab',
    plays: '590K',
    movement: 'stable',
    duration: 205,
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
    audioUrl: 'https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3',
  },
];

export default function TrendsPage() {
  const { currentTrack, isPlaying, setQueue, togglePlay } = usePlayerStore();

  const isTopPlaying =
    TOP_TRENDING.some((t) => t.id === currentTrack?.id) && isPlaying;

  const handlePlayAll = () => {
    if (isTopPlaying) {
      togglePlay();
    } else {
      setQueue(TOP_TRENDING, 0);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 pb-24">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold tracking-wide uppercase">
            <Flame size={18} />
            <span>Lo más escuchado de la semana</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-1">
            Tendencias Globales
          </h1>
        </div>

        <button
          onClick={handlePlayAll}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold text-sm px-6 py-3 rounded-full transition transform hover:scale-105 active:scale-95 shadow-md cursor-pointer self-start sm:self-auto"
        >
          {isTopPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" className="ml-0.5" />}
          <span>{isTopPlaying ? 'Pausar Top' : 'Reproducir Top'}</span>
        </button>
      </div>

      {/* 2. Puesto #1 Destacado */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600/30 via-zinc-900 to-zinc-950 border border-amber-500/30 p-6 md:p-8 flex items-center justify-between gap-6 shadow-xl">
        <div className="space-y-3 z-10 max-w-lg">
          <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold rounded-full uppercase tracking-wider">
            #1 En Tendencias
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            {TOP_TRENDING[0].title}
          </h2>
          <p className="text-zinc-300 text-sm">
            {TOP_TRENDING[0].artist} • {TOP_TRENDING[0].plays} reproducciones esta semana
          </p>
        </div>

        <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden shadow-lg border border-zinc-700 flex-shrink-0">
          <img
            src={TOP_TRENDING[0].coverUrl}
            alt={TOP_TRENDING[0].title}
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* 3. Tabla Ranking de Tendencias */}
      <section className="space-y-2">
        <div className="grid grid-cols-12 text-xs uppercase font-semibold text-zinc-500 px-4 py-2 border-b border-zinc-900">
          <span className="col-span-1">#</span>
          <span className="col-span-6 md:col-span-5">Título</span>
          <span className="col-span-3 hidden md:inline">Reproducciones</span>
          <span className="col-span-5 md:col-span-3 text-right">Duración</span>
        </div>

        {TOP_TRENDING.map((track, index) => {
          const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;

          return (
            <div
              key={track.id}
              onClick={() => setQueue(TOP_TRENDING, index)}
              className="grid grid-cols-12 items-center px-4 py-3 rounded-lg hover:bg-zinc-900/70 cursor-pointer group transition text-sm"
            >
              <div className="col-span-1 flex items-center gap-1">
                <span className={`font-bold ${track.rank <= 3 ? 'text-amber-400' : 'text-zinc-400'}`}>
                  {track.rank}
                </span>
                <TrendingUp size={12} className="text-green-400 hidden sm:inline" />
              </div>

              <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0">
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                />
                <div className="truncate">
                  <p className={`font-semibold truncate ${isThisTrackPlaying ? 'text-green-400' : 'text-white'}`}>
                    {track.title}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                </div>
              </div>

              <span className="col-span-3 text-xs text-zinc-400 hidden md:inline">
                {track.plays}
              </span>

              <span className="col-span-5 md:col-span-3 text-right text-xs text-zinc-400">
                {formatDuration(track.duration)}
              </span>
            </div>
          );
        })}
      </section>
    </div>
  );
}