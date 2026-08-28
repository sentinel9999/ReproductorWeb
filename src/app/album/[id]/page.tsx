'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlaystore';
import { Track, Album } from '@/types/rokola';
import { Play, Pause, Clock, ChevronLeft, Disc3, Trash2, Loader2, Music } from 'lucide-react';
import Link from 'next/link';

export default function AlbumDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const albumId = Array.isArray(rawId) ? rawId[0] : (rawId as string) || 'uploaded';
  
  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { currentTrack, isPlaying, setQueue, togglePlay } = usePlayerStore();

  useEffect(() => {
    async function fetchAlbumData() {
      try {
        if (albumId === 'uploaded') {
          const res = await fetch('/api/tracks');
          const data: Track[] = await res.json();
          setTracks(data);
          setAlbum({
            id: 'uploaded',
            title: 'Mis Canciones Subidas',
            artist: 'Tu Colección Local',
            year: '2026',
            coverUrl: data[0]?.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=600&fit=crop',
            tracks: data,
          });
        } else {
          // Álbum estándar
          const mockAlbum: Album = {
            id: albumId,
            title: 'Acoustic Memories',
            artist: 'Benjamin Tissot',
            year: '2024',
            coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&h=600&fit=crop',
            tracks: [
              {
                id: '1',
                title: 'Acoustic Breeze',
                artist: 'Benjamin Tissot',
                album: 'Acoustic Memories',
                duration: 100,
                coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&h=300&fit=crop',
                audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
              },
            ],
          };
          setAlbum(mockAlbum);
          setTracks(mockAlbum.tracks);
        }
      } catch (e) {
        console.error('Error cargando álbum:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchAlbumData();
  }, [albumId]);

  // Manejador para eliminar la canción del servidor
  const handleDeleteTrack = async (e: React.MouseEvent, trackId: string, trackTitle: string) => {
    e.stopPropagation(); // Evita que empiece a reproducirse la canción

    const confirmDelete = window.confirm(`¿Seguro que deseas eliminar "${trackTitle}" del servidor?`);
    if (!confirmDelete) return;

    try {
      setDeletingId(trackId);
      const res = await fetch(`/api/tracks/${trackId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Quitar la canción del estado visual del álbum
        setTracks((prev) => prev.filter((t) => t.id !== trackId));
      } else {
        alert('No se pudo eliminar la canción del servidor.');
      }
    } catch (err) {
      console.error('Error eliminando canción del álbum:', err);
      alert('Ocurrió un error al intentar eliminar la canción.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading || !album) {
    return <div className="p-10 text-center text-zinc-500 text-sm">Cargando álbum...</div>;
  }

  const isCurrentAlbumPlaying =
    tracks.length > 0 &&
    tracks.some((t) => t.id === currentTrack?.id) &&
    isPlaying;

  const handlePlayAlbum = () => {
    if (isCurrentAlbumPlaying) {
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

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 pb-28">
      {/* Botón Volver */}
      <Link
        href="/library"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition font-medium"
      >
        <ChevronLeft size={16} />
        <span>Volver a Tu Biblioteca</span>
      </Link>

      {/* Cabecera del Álbum */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6 border-b border-zinc-900">
        <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-xl overflow-hidden shadow-2xl border border-zinc-800/80 flex-shrink-0 bg-zinc-900">
          <img
            src={album.coverUrl}
            alt={album.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop';
            }}
          />
        </div>

        <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-green-400 flex items-center gap-1.5">
            <Disc3 size={15} />
            <span>Álbum</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {album.title}
          </h1>
          <p className="text-zinc-400 text-sm">
            {album.artist} • {album.year} • {tracks.length} {tracks.length === 1 ? 'canción' : 'canciones'}
          </p>

          {tracks.length > 0 && (
            <button
              onClick={handlePlayAlbum}
              className="mt-3 flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold text-sm px-6 py-2.5 rounded-full transition transform active:scale-95 shadow-md cursor-pointer"
            >
              {isCurrentAlbumPlaying ? (
                <Pause size={16} fill="black" />
              ) : (
                <Play size={16} fill="black" className="ml-0.5" />
              )}
              <span>{isCurrentAlbumPlaying ? 'Pausar' : 'Reproducir Álbum'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Lista de Canciones del Álbum */}
      <div className="space-y-1">
        <div className="grid grid-cols-12 text-xs uppercase font-semibold text-zinc-500 px-4 py-2 border-b border-zinc-900">
          <span className="col-span-1">#</span>
          <span className="col-span-6 md:col-span-7">Título</span>
          <span className="col-span-3 md:col-span-2 text-right">Duración</span>
          <span className="col-span-2 text-right">Acción</span>
        </div>

        {tracks.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 space-y-2">
            <Music size={32} className="mx-auto text-zinc-600" />
            <p className="text-sm">No hay canciones en este álbum.</p>
          </div>
        ) : (
          tracks.map((track, index) => {
            const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;
            const isDeleting = deletingId === track.id;

            return (
              <div
                key={track.id}
                onClick={() => setQueue(tracks, index)}
                className="grid grid-cols-12 items-center px-4 py-3 rounded-lg hover:bg-zinc-900/60 cursor-pointer group transition text-sm"
              >
                <span
                  className={`col-span-1 font-medium ${
                    isThisTrackPlaying ? 'text-green-400' : 'text-zinc-500'
                  }`}
                >
                  {index + 1}
                </span>

                <div className="col-span-6 md:col-span-7 flex items-center gap-3 min-w-0">
                  <img
                    src={track.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop'}
                    alt={track.title}
                    className="w-10 h-10 rounded object-cover flex-shrink-0 bg-zinc-800"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop';
                    }}
                  />
                  <div className="truncate">
                    <p
                      className={`font-semibold truncate ${
                        isThisTrackPlaying ? 'text-green-400' : 'text-white'
                      }`}
                    >
                      {track.title}
                    </p>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">{track.artist}</p>
                  </div>
                </div>

                <span className="col-span-3 md:col-span-2 text-right text-zinc-400 text-xs font-medium">
                  {formatDuration(track.duration)}
                </span>

                {/* Botón Borrar dentro del Álbum */}
                <div className="col-span-2 text-right">
                  <button
                    onClick={(e) => handleDeleteTrack(e, track.id, track.title)}
                    disabled={isDeleting}
                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer disabled:opacity-50"
                    title="Eliminar canción del servidor"
                  >
                    {isDeleting ? (
                      <Loader2 size={16} className="animate-spin text-red-400" />
                    ) : (
                      <Trash2 size={16} />
                    )}
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