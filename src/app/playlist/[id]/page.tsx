'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlaystore';
import { Track, Playlist } from '@/types/rokola';
import { Play, Pause, Clock, ChevronLeft, Trash2, Loader2, Music, AlertTriangle, X } from 'lucide-react';
import Link from 'next/link';

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const playlistId = Array.isArray(rawId) ? rawId[0] : (rawId as string) || 'p1';

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado para el modal personalizado de eliminación (reemplaza window.confirm)
  const [trackToDelete, setTrackToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { currentTrack, isPlaying, setQueue, togglePlay } = usePlayerStore();

  useEffect(() => {
    async function loadPlaylist() {
      try {
        // 1. Intentar cargar desde las playlists personalizadas de localStorage
        const savedPlaylists = localStorage.getItem('rokola_custom_playlists');
        if (savedPlaylists) {
          const parsed: Playlist[] = JSON.parse(savedPlaylists);
          const found = parsed.find((p) => p.id === playlistId);
          if (found) {
            setPlaylist(found);
            setTracks(found.tracks || []);
            setLoading(false);
            return;
          }
        }

        // 2. Si no es personalizada, cargar canciones de la API
        const res = await fetch(`/api/tracks`);
        const allTracks: Track[] = await res.json();
        
        setPlaylist({
          id: playlistId,
          name: playlistId === 'p1' ? 'Favoritos de la Semana' : 'Tu Playlist Personal',
          description: 'Lista interactiva de reproducción.',
          coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=600&fit=crop',
          tracks: allTracks,
        });
        setTracks(allTracks);
      } catch (err) {
        console.error('Error cargando playlist:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPlaylist();
  }, [playlistId]);

  // Ejecución de borrado sin alertas del navegador
  const confirmRemoveTrack = async () => {
    if (!trackToDelete) return;

    setIsDeleting(true);
    const trackId = trackToDelete.id;

    try {
      // Intentar borrado en backend
      await fetch(`/api/playlists/${playlistId}/tracks/${trackId}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('Operación en modo local');
    }

    // Actualizar lista en pantalla
    const updatedTracks = tracks.filter((t) => t.id !== trackId);
    setTracks(updatedTracks);

    // Actualizar en localStorage si es una playlist guardada
    const saved = localStorage.getItem('rokola_custom_playlists');
    if (saved) {
      try {
        const playlists: Playlist[] = JSON.parse(saved);
        const updatedPlaylists = playlists.map((p) => {
          if (p.id === playlistId) {
            return { ...p, tracks: updatedTracks };
          }
          return p;
        });
        localStorage.setItem('rokola_custom_playlists', JSON.stringify(updatedPlaylists));
      } catch (e) {}
    }

    setIsDeleting(false);
    setTrackToDelete(null);
  };

  const isCurrentPlaylistPlaying =
    tracks.length > 0 && tracks.some((t) => t.id === currentTrack?.id) && isPlaying;

  const handlePlayPlaylist = () => {
    if (isCurrentPlaylistPlaying) {
      togglePlay();
    } else if (tracks.length > 0) {
      setQueue(tracks, 0);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading || !playlist) {
    return <div className="p-10 text-center text-zinc-500 text-sm">Cargando playlist...</div>;
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 pb-28">
      <Link
        href="/library"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition font-medium cursor-pointer"
      >
        <ChevronLeft size={16} />
        <span>Volver a Biblioteca</span>
      </Link>

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6 border-b border-zinc-900">
        <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-xl overflow-hidden shadow-2xl border border-zinc-800/80 flex-shrink-0 bg-zinc-950">
          <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
        </div>

        <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-green-400">Playlist</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{playlist.name}</h1>
          <p className="text-zinc-400 text-sm max-w-xl">{playlist.description}</p>
          <p className="text-zinc-500 text-xs font-medium">
            {tracks.length} {tracks.length === 1 ? 'canción' : 'canciones'}
          </p>

          {tracks.length > 0 && (
            <button
              onClick={handlePlayPlaylist}
              className="mt-3 flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold text-sm px-6 py-2.5 rounded-full transition transform active:scale-95 shadow-md cursor-pointer"
            >
              {isCurrentPlaylistPlaying ? <Pause size={16} fill="black" /> : <Play size={16} fill="black" className="ml-0.5" />}
              <span>{isCurrentPlaylistPlaying ? 'Pausar' : 'Reproducir Playlist'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Lista de Canciones */}
      <div className="space-y-1">
        <div className="grid grid-cols-12 text-xs uppercase font-semibold text-zinc-500 px-4 py-2 border-b border-zinc-900">
          <span className="col-span-1">#</span>
          <span className="col-span-8">Título</span>
          <span className="col-span-2 text-right">Duración</span>
          <span className="col-span-1 text-right">Quitar</span>
        </div>

        {tracks.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 space-y-2">
            <Music size={32} className="mx-auto text-zinc-600" />
            <p className="text-sm">Esta playlist no tiene canciones.</p>
          </div>
        ) : (
          tracks.map((track, index) => {
            const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;

            return (
              <div
                key={track.id}
                onClick={() => setQueue(tracks, index)}
                className="grid grid-cols-12 items-center px-4 py-3 rounded-lg hover:bg-zinc-900/60 cursor-pointer group transition text-sm"
              >
                <span className={`col-span-1 font-medium ${isThisTrackPlaying ? 'text-green-400' : 'text-zinc-500'}`}>
                  {index + 1}
                </span>

                <div className="col-span-8 flex items-center gap-3 min-w-0">
                  <img src={track.coverUrl} alt={track.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                  <div className="truncate">
                    <p className={`font-semibold truncate ${isThisTrackPlaying ? 'text-green-400' : 'text-white'}`}>
                      {track.title}
                    </p>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">{track.artist}</p>
                  </div>
                </div>

                <span className="col-span-2 text-right text-zinc-400 text-xs font-medium">
                  {formatDuration(track.duration)}
                </span>

                {/* Botón que abre el modal interno en lugar del alert */}
                <div className="col-span-1 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTrackToDelete({ id: track.id, title: track.title });
                    }}
                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                    title="Quitar de la lista"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL PERSONALIZADO DE CONFIRMACIÓN */}
      {trackToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Quitar de la playlist</h3>
                <p className="text-xs text-zinc-400">Esta acción no elimina el archivo original.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
              ¿Seguro que deseas quitar <strong className="text-white">&quot;{trackToDelete.title}&quot;</strong> de esta lista?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setTrackToDelete(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmRemoveTrack}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                {isDeleting && <Loader2 size={13} className="animate-spin" />}
                <span>Quitar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}