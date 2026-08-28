'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlaystore';
import { Track } from '@/types/rokola';
import { 
  Compass, 
  Search, 
  Play, 
  Pause, 
  Flame, 
  Sparkles, 
  Music, 
  Radio, 
  Disc, 
  Mic2,
  Headphones
} from 'lucide-react';

// 1. Categorías y Géneros con paletas de colores
const GENRES = [
  { id: 'g1', name: 'Pop & Éxitos', color: 'from-pink-600 to-rose-900', icon: Sparkles },
  { id: 'g2', name: 'Rock & Alternativo', color: 'from-red-600 to-orange-950', icon: Disc },
  { id: 'g3', name: 'Electrónica & Dance', color: 'from-cyan-500 to-blue-900', icon: Headphones },
  { id: 'g4', name: 'Hip Hop & Trap', color: 'from-amber-500 to-yellow-900', icon: Flame },
  { id: 'g5', name: 'Lo-Fi & Chill', color: 'from-purple-600 to-indigo-950', icon: Music },
  { id: 'g6', name: 'Acústico & Folk', color: 'from-emerald-500 to-teal-950', icon: Radio },
  { id: 'g7', name: 'Jazz & Blues', color: 'from-amber-700 to-stone-900', icon: Mic2 },
  { id: 'g8', name: 'Latino & Reggaeton', color: 'from-orange-500 to-red-900', icon: Flame },
];

// 2. Catálogo global para búsqueda
const ALL_CATALOG_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Acoustic Breeze',
    artist: 'Benjamin Tissot',
    album: 'Acoustic Memories',
    duration: 100,
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
    audioUrl: 'https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3',
  },
  {
    id: '2',
    title: 'Sunny Beats',
    artist: 'Bensound',
    album: 'Summer Nights',
    duration: 140,
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    audioUrl: 'https://www.bensound.com/bensound-music/bensound-sunny.mp3',
  },
  {
    id: '3',
    title: 'Energy Pulse',
    artist: 'Electronic Waves',
    album: 'Neon Nights',
    duration: 179,
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    audioUrl: 'https://www.bensound.com/bensound-music/bensound-energy.mp3',
  },
  {
    id: '4',
    title: 'Slow Motion',
    artist: 'Chillout Lab',
    album: 'Acoustic Memories',
    duration: 205,
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
    audioUrl: 'https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3',
  },
];

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const { currentTrack, isPlaying, setQueue } = usePlayerStore();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Filtrado reactivo por término de búsqueda o género
  const searchResults = ALL_CATALOG_TRACKS.filter((track) => {
    const matchesSearch = 
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (track.album && track.album.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 pb-24">
      {/* 1. Encabezado */}
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-green-400 text-sm font-semibold tracking-wide uppercase">
          <Compass size={16} />
          <span>Descubre nueva música</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Explorar
        </h1>
      </header>

      {/* 2. Barra de búsqueda principal en página */}
      <div className="relative max-w-xl">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="¿Qué quieres escuchar? Canciones, artistas, géneros..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition shadow-inner"
        />
      </div>

      {/* 3. Resultados de Búsqueda (Se muestran si el usuario escribió algo) */}
      {searchQuery.trim() !== '' && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            Resultados para &quot;{searchQuery}&quot; ({searchResults.length})
          </h2>

          {searchResults.length === 0 ? (
            <div className="p-8 border border-dashed border-zinc-800 rounded-xl text-center text-zinc-500 text-sm">
              No se encontraron coincidencias para &quot;{searchQuery}&quot;. Prueba con otro término.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {searchResults.map((track, index) => {
                const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;

                return (
                  <div
                    key={track.id}
                    className="bg-zinc-900/50 hover:bg-zinc-800/80 p-3 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition flex items-center justify-between group shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="truncate">
                        <h3 className={`font-semibold text-sm truncate ${isThisTrackPlaying ? 'text-green-400' : 'text-white'}`}>
                          {track.title}
                        </h3>
                        <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-zinc-500 hidden sm:inline">
                        {formatDuration(track.duration)}
                      </span>
                      <button
                        onClick={() => setQueue(searchResults, index)}
                        className={`w-9 h-9 bg-green-500 rounded-full flex items-center justify-center text-black shadow-md transition transform group-hover:scale-100 ${
                          isThisTrackPlaying ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-90'
                        }`}
                        aria-label="Reproducir"
                      >
                        {isThisTrackPlaying ? (
                          <Pause size={15} fill="black" />
                        ) : (
                          <Play size={15} fill="black" className="ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 4. Cuadrícula de Géneros y Estados de Ánimo */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">Explorar Todo por Género</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {GENRES.map((genre) => {
            const Icon = genre.icon;
            const isSelected = selectedGenre === genre.id;

            return (
              <div
                key={genre.id}
                onClick={() => {
                  setSelectedGenre(isSelected ? null : genre.id);
                  setSearchQuery(isSelected ? '' : genre.name.split('&')[0].trim());
                }}
                className={`relative overflow-hidden h-32 rounded-2xl bg-gradient-to-br ${genre.color} p-4 flex flex-col justify-between cursor-pointer border transition transform hover:scale-[1.02] shadow-lg group ${
                  isSelected ? 'border-white ring-2 ring-white/50' : 'border-white/10 hover:border-white/30'
                }`}
              >
                <span className="font-extrabold text-lg text-white leading-snug">
                  {genre.name}
                </span>

                <Icon 
                  size={44} 
                  className="absolute -bottom-2 -right-2 text-white/20 group-hover:text-white/30 group-hover:scale-110 transition duration-300 transform -rotate-12" 
                />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}