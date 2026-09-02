'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlaystore';
import { Track, Playlist } from '@/types/rokola';
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
  Loader2,
  ListPlus,
  Heart,
  History,
  X,
  Check,
  Plus
} from 'lucide-react';

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

  // Historial de búsquedas
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Favoritos de Explorar
  const [favoriteTrackIds, setFavoriteTrackIds] = useState<string[]>([]);

  // Modal para añadir a playlist
  const [targetTrack, setTargetTrack] = useState<Track | null>(null);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const { currentTrack, isPlaying, setQueue } = usePlayerStore();

  // Cargar datos locales al montar
  useEffect(() => {
    const savedHistory = localStorage.getItem('rokola_recent_searches');
    if (savedHistory) {
      try {
        setRecentSearches(JSON.parse(savedHistory));
      } catch (e) {}
    }

    const savedFavs = localStorage.getItem('rokola_favs_explore');
    if (savedFavs) {
      try {
        const parsed: Track[] = JSON.parse(savedFavs);
        setFavoriteTrackIds(parsed.map((t) => t.id));
      } catch (e) {}
    }

    loadPlaylists();
  }, []);

  const loadPlaylists = () => {
    const savedPlaylists = localStorage.getItem('rokola_custom_playlists');
    if (savedPlaylists) {
      try {
        setUserPlaylists(JSON.parse(savedPlaylists));
      } catch (e) {}
    }
  };

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  // Guardar en el historial de búsquedas
  const saveToHistory = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 8);
      localStorage.setItem('rokola_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const removeHistoryItem = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter((t) => t !== item);
    setRecentSearches(updated);
    localStorage.setItem('rokola_recent_searches', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem('rokola_recent_searches');
  };

  // Consulta al backend
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
          saveToHistory(term);
        }
      } catch (error) {
        console.error('Error buscando canciones:', error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Manejar Favoritas de Explorar
  const toggleFavorite = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    const saved = localStorage.getItem('rokola_favs_explore');
    let currentFavs: Track[] = saved ? JSON.parse(saved) : [];

    const exists = currentFavs.some((t) => t.id === track.id);
    if (exists) {
      currentFavs = currentFavs.filter((t) => t.id !== track.id);
      setFavoriteTrackIds((prev) => prev.filter((id) => id !== track.id));
    } else {
      currentFavs = [track, ...currentFavs];
      setFavoriteTrackIds((prev) => [...prev, track.id]);
    }

    localStorage.setItem('rokola_favs_explore', JSON.stringify(currentFavs));
  };

  // Añadir canción a una playlist existente
  const addTrackToPlaylist = (playlistId: string) => {
    if (!targetTrack) return;

    const savedPlaylists = localStorage.getItem('rokola_custom_playlists');
    let playlists: Playlist[] = savedPlaylists ? JSON.parse(savedPlaylists) : [];

    playlists = playlists.map((pl) => {
      if (pl.id === playlistId) {
        const exists = pl.tracks?.some((t) => t.id === targetTrack.id);
        const updatedTracks = exists ? pl.tracks : [...(pl.tracks || []), targetTrack];
        return {
          ...pl,
          tracks: updatedTracks,
          coverUrl: pl.coverUrl || targetTrack.coverUrl,
        };
      }
      return pl;
    });

    localStorage.setItem('rokola_custom_playlists', JSON.stringify(playlists));
    setUserPlaylists(playlists);
    setFeedbackMessage('¡Canción añadida a la playlist!');
    setTimeout(() => {
      setFeedbackMessage(null);
      setTargetTrack(null);
    }, 1200);
  };

  // Crear playlist rápida y asignar la canción
  const handleCreateAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim() || !targetTrack) return;

    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      name: newPlaylistName.trim(),
      description: 'Creada desde el buscador',
      coverUrl: targetTrack.coverUrl,
      tracks: [targetTrack],
    };

    const savedPlaylists = localStorage.getItem('rokola_custom_playlists');
    const playlists: Playlist[] = savedPlaylists ? JSON.parse(savedPlaylists) : [];
    const updated = [newPl, ...playlists];

    localStorage.setItem('rokola_custom_playlists', JSON.stringify(updated));
    setUserPlaylists(updated);
    setNewPlaylistName('');
    setFeedbackMessage('¡Playlist creada y canción añadida!');
    setTimeout(() => {
      setFeedbackMessage(null);
      setTargetTrack(null);
    }, 1200);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 pb-24">
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
      <div className="space-y-3 max-w-2xl">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedGenre(null);
            }}
            placeholder="¿Qué quieres escuchar? Canciones, artistas, géneros..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-11 pr-10 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition shadow-inner"
          />
          {isSearching && (
            <Loader2 size={18} className="animate-spin text-green-400 absolute right-4 top-1/2 -translate-y-1/2" />
          )}
        </div>

        {/* Sección: Últimas Búsquedas */}
        {recentSearches.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 font-medium">
                <History size={13} className="text-green-400" />
                <span>Búsquedas recientes</span>
              </span>
              <button
                onClick={clearHistory}
                className="text-[11px] text-zinc-500 hover:text-red-400 transition"
              >
                Borrar historial
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {recentSearches.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSearchQuery(item)}
                  className="flex items-center gap-2 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 hover:text-white px-3 py-1.5 rounded-full text-xs cursor-pointer transition group"
                >
                  <span>{item}</span>
                  <button
                    onClick={(e) => removeHistoryItem(e, item)}
                    className="text-zinc-500 hover:text-white p-0.5 rounded-full"
                    title="Eliminar"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
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
                {searchResults.length} canciones encontradas
              </span>
            )}
          </div>

          {isSearching ? (
            <div className="p-12 border border-zinc-800/60 rounded-2xl flex flex-col items-center justify-center gap-3 text-zinc-400 bg-zinc-900/20">
              <Loader2 className="animate-spin text-green-500" size={28} />
              <p className="text-sm">Consultando catálogo...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 border border-dashed border-zinc-800 rounded-2xl text-center text-zinc-500 text-sm">
              No se encontraron canciones para &quot;{searchQuery}&quot;.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {searchResults.map((track, index) => {
                const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;
                const isFavorite = favoriteTrackIds.includes(track.id);

                return (
                  <div
                    key={track.id}
                    onClick={() => setQueue(searchResults, index)}
                    className="bg-zinc-900/60 hover:bg-zinc-800/80 active:bg-zinc-800 p-3 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition flex items-center justify-between group shadow-sm cursor-pointer"
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

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Botón Favoritas (Explorar) */}
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(e, track)}
                        className={`p-2 rounded-full transition cursor-pointer ${
                          isFavorite 
                            ? 'text-red-500 hover:text-red-400' 
                            : 'text-zinc-500 hover:text-zinc-200'
                        }`}
                        title={isFavorite ? 'Quitar de Favoritas' : 'Añadir a Favoritas'}
                      >
                        <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                      </button>

                      {/* Botón Añadir a Playlist */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          loadPlaylists();
                          setTargetTrack(track);
                        }}
                        className="p-2 text-zinc-500 hover:text-green-400 hover:bg-zinc-800/80 rounded-full transition cursor-pointer"
                        title="Añadir a playlist"
                      >
                        <ListPlus size={16} />
                      </button>

                      {/* Botón Play (Siempre visible en móviles, hover en PC) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQueue(searchResults, index);
                        }}
                        className={`w-9 h-9 bg-green-500 rounded-full flex items-center justify-center text-black shadow-md transition transform cursor-pointer ${
                          isThisTrackPlaying
                            ? 'opacity-100 scale-100'
                            : 'opacity-100 scale-100 md:opacity-0 md:scale-90 md:group-hover:opacity-100 md:group-hover:scale-100'
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

      {/* MODAL: Añadir a Playlist */}
      {targetTrack && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ListPlus className="text-green-400" size={18} />
                <span>Añadir a Playlist</span>
              </h3>
              <button
                onClick={() => setTargetTrack(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Pista destino */}
            <div className="flex items-center gap-3 p-2 bg-zinc-900 rounded-xl">
              <img
                src={targetTrack.coverUrl}
                alt={targetTrack.title}
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{targetTrack.title}</p>
                <p className="text-[11px] text-zinc-400 truncate">{targetTrack.artist}</p>
              </div>
            </div>

            {feedbackMessage ? (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs font-semibold flex items-center justify-center gap-2">
                <Check size={16} />
                <span>{feedbackMessage}</span>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Listas existentes */}
                <p className="text-xs font-semibold text-zinc-400">Selecciona una lista existente:</p>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {userPlaylists.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-2">No tienes playlists creadas aún.</p>
                  ) : (
                    userPlaylists.map((pl) => (
                      <button
                        key={pl.id}
                        type="button"
                        onClick={() => addTrackToPlaylist(pl.id)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 transition text-left text-xs text-zinc-200 hover:text-white"
                      >
                        <span className="font-medium truncate">{pl.name}</span>
                        <span className="text-[11px] text-zinc-500">
                          {pl.tracks?.length || 0} temas
                        </span>
                      </button>
                    ))
                  )}
                </div>

                {/* Crear nueva playlist rápida */}
                <form onSubmit={handleCreateAndAdd} className="pt-2 border-t border-zinc-900 space-y-2">
                  <p className="text-xs font-semibold text-zinc-400">O crea una nueva playlist:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      placeholder="Nombre de la nueva lista..."
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-green-500"
                    />
                    <button
                      type="submit"
                      disabled={!newPlaylistName.trim()}
                      className="bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition"
                    >
                      <Plus size={14} />
                      <span>Crear</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
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