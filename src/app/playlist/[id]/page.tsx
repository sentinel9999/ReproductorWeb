'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlaystore';
import { Track, Playlist } from '@/types/rokola';
import { Play, Pause, Clock, ChevronLeft, Trash2, ListMusic, Music } from 'lucide-react';
import Link from 'next/link';

// Playlists de respaldo por defecto
const STATIC_PLAYLISTS: Record<string, Playlist> = {
  p1: {
    id: 'p1',
    name: 'Favoritos de la Semana',
    description: 'Tus temas más escuchados compilados automáticamente para ti.',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=600&fit=crop',
    tracks: [
      {
        id: '1',
        title: 'Acoustic Breeze',
        artist: 'Benjamin Tissot',
        album: 'Acoustic Memories',
        duration: 100,
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
      },
      {
        id: '2',
        title: 'Sunny Beats',
        artist: 'Bensound',
        album: 'Summer Nights',
        duration: 140,
        coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3',
      },
      {
        id: '3',
        title: 'Energy Pulse',
        artist: 'Electronic Waves',
        album: 'Neon Nights',
        duration: 179,
        coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3',
      },
    ],
  },
  p2: {
    id: 'p2',
    name: 'Para Concentrarse',
    description: 'Música instrumental, ondas suaves y ambient para estudiar o trabajar.',
    coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&h=600&fit=crop',
    tracks: [
      {
        id: '4',
        title: 'Slow Motion',
        artist: 'Chillout Lab',
        album: 'Acoustic Memories',
        duration: 205,
        coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3',
      },
    ],
  },
  p3: {
    id: 'p3',
    name: 'Entrenamiento & Gym',
    description: 'Ritmos rápidos y enérgicos para darlo todo en cada sesión.',
    coverUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop',
    tracks: [],
  },
};

export default function PlaylistDetailPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params?.id;
  const playlistId = Array.isArray(rawId) ? rawId[0] : (rawId as string) || 'p1';

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);

  const { currentTrack, isPlaying, setQueue, togglePlay } = usePlayerStore();

  useEffect(() => {
    // 1. Buscar en playlists creadas por el usuario en localStorage
    const saved = localStorage.getItem('rokola_custom_playlists');
    if (saved) {
      try {
        const parsed: Playlist[] = JSON.parse(saved);
        const found = parsed.find((p) => p.id === playlistId);
        if (found) {
          setPlaylist(found);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Error leyendo playlists de localStorage:', err);
      }
    }

    // 2. Si no es una lista personalizada, cargar desde el catálogo estático
    setPlaylist(STATIC_PLAYLISTS[playlistId] || STATIC_PLAYLISTS['p1']);
    setLoading(false);
  }, [playlistId]);

  if (loading || !playlist) {
    return (
      <div className="p-12 text-center text-zinc-500 text-sm">
        Cargando playlist...
      </div>
    );
  }

  const playlistTracks = playlist.tracks || [];
  const isCurrentPlaylistPlaying =
    playlistTracks.length > 0 &&
    playlistTracks.some((t) => t.id === currentTrack?.id) &&
    isPlaying;

  const handlePlayPlaylist = () => {
    if (isCurrentPlaylistPlaying) {
      togglePlay();
    } else if (playlistTracks.length > 0) {
      setQueue(playlistTracks, 0);
    }
  };

  // Quitar una canción de la playlist
  const handleRemoveTrack = (trackId: string, trackTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(`¿Quitar "${trackTitle}" de esta playlist?`);
    if (!confirmed) return;

    const updatedTracks = playlistTracks.filter((t) => t.id !== trackId);
    const updatedPlaylist = { ...playlist, tracks: updatedTracks };
    setPlaylist(updatedPlaylist);

    // Guardar cambios en localStorage
    const saved = localStorage.getItem('rokola_custom_playlists');
    if (saved) {
      try {
        const parsed: Playlist[] = JSON.parse(saved);
        const updatedAll = parsed.map((p) => (p.id === playlist.id ? updatedPlaylist : p));
        localStorage.setItem('rokola_custom_playlists', JSON.stringify(updatedAll));
      } catch (err) {
        console.error('Error actualizando playlist en almacenamiento:', err);
      }
    }
  };

  // Eliminar la playlist por completo
  const handleDeletePlaylist = () => {
    const confirmed = window.confirm(`¿Seguro que deseas eliminar la playlist "${playlist.name}"?`);
    if (!confirmed) return;

    const saved = localStorage.getItem('rokola_custom_playlists');
    if (saved) {
      const parsed: Playlist[] = JSON.parse(saved);
      const updated = parsed.filter((p) => p.id !== playlist.id);
      localStorage.setItem('rokola_custom_playlists', JSON.stringify(updated));
    }
    router.push('/library');
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
        <span>Volver a Biblioteca</span>
      </Link>

      {/* Cabecera de la Playlist */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6 border-b border-zinc-900">
        <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-xl overflow-hidden shadow-2xl border border-zinc-800/80 flex-shrink-0 bg-zinc-900">
          <img
            src={playlist.coverUrl}
            alt={playlist.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=600&fit=crop';
            }}
          />
        </div>

        <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2 flex-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-green-400 flex items-center gap-1.5">
            <ListMusic size={15} />
            <span>Playlist</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {playlist.name}
          </h1>
          <p className="text-zinc-400 text-sm max-w-xl">{playlist.description}</p>
          <p className="text-zinc-500 text-xs font-medium">
            {playlistTracks.length} {playlistTracks.length === 1 ? 'canción' : 'canciones'}
          </p>

          <div className="mt-3 flex items-center gap-3">
            {playlistTracks.length > 0 && (
              <button
                onClick={handlePlayPlaylist}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold text-sm px-6 py-2.5 rounded-full transition transform active:scale-95 shadow-md cursor-pointer"
              >
                {isCurrentPlaylistPlaying ? (
                  <Pause size={16} fill="black" />
                ) : (
                  <Play size={16} fill="black" className="ml-0.5" />
                )}
                <span>{isCurrentPlaylistPlaying ? 'Pausar' : 'Reproducir Playlist'}</span>
              </button>
            )}

            {playlist.id.startsWith('pl-') && (
              <button
                onClick={handleDeletePlaylist}
                className="p-2.5 bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-full border border-zinc-800 transition cursor-pointer"
                title="Eliminar esta playlist"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de Canciones de la Playlist */}
      <div className="space-y-1">
        <div className="grid grid-cols-12 text-xs uppercase font-semibold text-zinc-500 px-4 py-2 border-b border-zinc-900">
          <span className="col-span-1">#</span>
          <span className="col-span-6 md:col-span-7">Título</span>
          <span className="col-span-3 md:col-span-2 text-right">Duración</span>
          <span className="col-span-2 text-right">Quitar</span>
        </div>

        {playlistTracks.length === 0 ? (
          <div className="py-14 text-center text-zinc-500 space-y-2">
            <Music size={32} className="mx-auto text-zinc-600" />
            <p className="text-sm">Esta playlist no tiene canciones añadidas aún.</p>
            <p className="text-xs text-zinc-600">
              Puedes agregar temas editándola desde tu biblioteca.
            </p>
          </div>
        ) : (
          playlistTracks.map((track, index) => {
            const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;

            return (
              <div
                key={track.id}
                onClick={() => setQueue(playlistTracks, index)}
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
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-10 h-10 rounded object-cover flex-shrink-0 bg-zinc-900"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop';
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

                {/* Botón para remover de la lista */}
                <div className="col-span-2 text-right">
                  <button
                    onClick={(e) => handleRemoveTrack(track.id, track.title, e)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                    title="Quitar canción de la lista"
                  >
                    <Trash2 size={15} />
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