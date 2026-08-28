'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlaystore';
import { Track, Playlist } from '@/types/rokola';
import { Play, Pause, Clock, ChevronLeft, Trash2, Loader2, Music } from 'lucide-react';
import Link from 'next/link';

export default function PlaylistDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const playlistId = Array.isArray(rawId) ? rawId[0] : (rawId as string) || 'p1';

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingTrackId, setDeletingTrackId] = useState<string | null>(null);

  const { currentTrack, isPlaying, setQueue, togglePlay } = usePlayerStore();

  useEffect(() => {
    async function loadPlaylist() {
      try {
        const res = await fetch(`/api/tracks`);
        const allTracks: Track[] = await res.json();
        
        // Carga la playlist con sus temas
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

  const handleRemoveTrack = async (e: React.MouseEvent, trackId: string, trackTitle: string) => {
    e.stopPropagation(); // Evita reproducir la pista al hacer clic en borrar

    const confirm = window.confirm(`¿Quieres quitar "${trackTitle}" de esta playlist?`);
    if (!confirm) return;

    try {
      setDeletingTrackId(trackId);
      const res = await fetch(`/api/playlists/${playlistId}/tracks/${trackId}`, {
        method: 'DELETE',
      });

      // Si se borra del backend o localmente, la quitamos del estado
      setTracks((prev) => prev.filter((t) => t.id !== trackId));
    } catch (error) {
      console.error('Error quitando canción:', error);
      // Fallback: Quitarla visualmente
      setTracks((prev) => prev.filter((t) => t.id !== trackId));
    } finally {
      setDeletingTrackId(null);
    }
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
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition font-medium"
      >
        <ChevronLeft size={16} />
        <span>Volver a Biblioteca</span>
      </Link>

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6 border-b border-zinc-900">
        <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-xl overflow-hidden shadow-2xl border border-zinc-800/80 flex-shrink-0">
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

      {/* Lista de Canciones con botón Eliminar */}
      <div className="space-y-1">
        <div className="grid grid-cols-12 text-xs uppercase font-semibold text-zinc-500 px-4 py-2 border-b border-zinc-900">
          <span className="col-span-1">#</span>
          <span className="col-span-6 md:col-span-7">Título</span>
          <span className="col-span-3 md:col-span-2 text-right">Duración</span>
          <span className="col-span-2 text-right">Quitar</span>
        </div>

        {tracks.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 space-y-2">
            <Music size={32} className="mx-auto text-zinc-600" />
            <p className="text-sm">Esta playlist no tiene canciones.</p>
          </div>
        ) : (
          tracks.map((track, index) => {
            const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;
            const isDeleting = deletingTrackId === track.id;

            return (
              <div
                key={track.id}
                onClick={() => setQueue(tracks, index)}
                className="grid grid-cols-12 items-center px-4 py-3 rounded-lg hover:bg-zinc-900/60 cursor-pointer group transition text-sm"
              >
                <span className={`col-span-1 font-medium ${isThisTrackPlaying ? 'text-green-400' : 'text-zinc-500'}`}>
                  {index + 1}
                </span>

                <div className="col-span-6 md:col-span-7 flex items-center gap-3 min-w-0">
                  <img src={track.coverUrl} alt={track.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                  <div className="truncate">
                    <p className={`font-semibold truncate ${isThisTrackPlaying ? 'text-green-400' : 'text-white'}`}>
                      {track.title}
                    </p>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">{track.artist}</p>
                  </div>
                </div>

                <span className="col-span-3 md:col-span-2 text-right text-zinc-400 text-xs font-medium">
                  {formatDuration(track.duration)}
                </span>

                {/* Botón para quitar de la playlist */}
                <div className="col-span-2 text-right">
                  <button
                    onClick={(e) => handleRemoveTrack(e, track.id, track.title)}
                    disabled={isDeleting}
                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer disabled:opacity-50"
                    title="Quitar canción de la lista"
                  >
                    {isDeleting ? <Loader2 size={16} className="animate-spin text-red-400" /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}