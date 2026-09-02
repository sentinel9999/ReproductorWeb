'use client';

import { Suspense, useState, useEffect } from 'react';
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
  Headphones,
  Loader2
} from 'lucide-react';

// Categorías y Géneros para búsqueda rápida
const GENRES = [
  { id: 'g1', name: 'Pop & Éxitos', query: 'Pop', color: 'from-pink-600 to-rose-900', icon: Sparkles },
  { id: 'g2', name: 'Rock & Alternativo', query: 'Rock', color: 'from-red-600 to-orange-950', icon: Disc },
  { id: 'g3', name: 'Electrónica & Dance', query: 'Dance', color: 'from-cyan-500 to-blue-900', icon: Headphones },
  { id: 'g4', name: 'Hip Hop & Trap', query: 'Hip Hop', color: 'from-amber-500 to-yellow-900', icon: Flame },
  { id: 'g5', name: 'Lo-Fi & Chill', query: 'Lo-Fi', color: 'from-purple-600 to-indigo-950', icon: Music },
  { id: 'g6', name: 'Acústico & Folk', query: 'Acoustic', color: 'from-emerald-500 to-teal-950', icon: Radio },
  { id: 'g7', name: 'Jazz & Blues', query: 'Jazz', color: 'from-amber-700 to-stone-900', icon: Mic2 },
  { id: 'g8', name: 'Latino & Reggaeton', query: 'Latino', color: 'from-orange-500 to-red-900', icon: Flame },
];

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { currentTrack, isPlaying, setQueue } = usePlayerStore();

  // Sincroniza el valor si viene desde el input del Sidebar (?q=...)
  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  // Consulta al backend con debounce para evitar llamadas excesivas
  useEffect(() => {
    const term = searchQuery.trim();
    if (!term) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error buscando canciones en la API:', error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

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

      {/* 2. Barra de búsqueda */}
      <div className="relative max-w-xl">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedGenre(null);
          }}
          placeholder="¿Qué quieres escuchar? Canciones, artistas, álbumes..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-11 pr-10 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition shadow-inner"
        />
        {isSearching && (
          <Loader2 size={18} className="animate-spin text-green-400 absolute right-4 top-1/2 -translate-y-1/2" />
        )}
      </div>

      {/* 3. Resultados de Búsqueda */}
      {searchQuery.trim() !== '' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              Resultados para &quot;{searchQuery}&quot;
            </h2>
            {!isSearching && (
              <span className="text-xs text-zinc-400">
                {searchResults.length} {searchResults.length === 1 ? 'canción encontrada' : 'canciones encontradas'}
              </span>
            )}
          </div>

          {isSearching ? (
            <div className="p-12 border border-zinc-800/60 rounded-2xl flex flex-col items-center justify-center gap-3 text-zinc-400 bg-zinc-900/20">
              <Loader2 className="animate-spin text-green-500" size={28} />
              <p className="text-sm">Consultando catálogo musical...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 border border-dashed border-zinc-800 rounded-2xl text-center text-zinc-500 text-sm">
              No se encontraron coincidencias para &quot;{searchQuery}&quot;. Intenta con otro término o artista.
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
                        src={track.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop'}
                        alt={track.title}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-zinc-800"
                      />
                      <div className="truncate">
                        <h3 className={`font-semibold text-sm truncate ${isThisTrackPlaying ? 'text-green-400' : 'text-white'}`}>
                          {track.title}
                        </h3>
                        <p className="text-xs text-zinc-400 truncate">
                          {track.artist} {track.album ? `• ${track.album}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {track.duration > 0 && (
                        <span className="text-xs text-zinc-500 hidden sm:inline">
                          {formatDuration(track.duration)}
                        </span>
                      )}
                      <button
                        onClick={() => setQueue(searchResults, index)}
                        className={`w-9 h-9 bg-green-500 rounded-full flex items-center justify-center text-black shadow-md transition transform group-hover:scale-100 cursor-pointer ${
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

      {/* 4. Géneros */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">Explorar por Género</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {GENRES.map((genre) => {
            const Icon = genre.icon;
            const isSelected = selectedGenre === genre.id;

            return (
              <div
                key={genre.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedGenre(null);
                    setSearchQuery('');
                  } else {
                    setSelectedGenre(genre.id);
                    setSearchQuery(genre.query);
                  }
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

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-zinc-400">
          <Loader2 className="animate-spin text-green-500" size={32} />
          <p className="text-sm">Cargando explorador...</p>
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}