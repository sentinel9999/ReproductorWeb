'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlaystore';
import { Album, Track } from '@/types/rokola';
import { Play, Pause, Clock, ChevronLeft, Trash2, Disc3 } from 'lucide-react';
import Link from 'next/link';

const STATIC_ALBUMS: Record<string, Album> = {
  a1: {
    id: 'a1',
    title: 'Acoustic Memories',
    artist: 'Benjamin Tissot',
    year: '2024',
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&h=600&fit=crop',
    tracks: [
      {
        id: 'a1-1',
        title: 'Acoustic Breeze',
        artist: 'Benjamin Tissot',
        album: 'Acoustic Memories',
        duration: 100,
        coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&h=300&fit=crop',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
      },
      {
        id: 'a1-2',
        title: 'Slow Motion & Gentle Winds',
        artist: 'Benjamin Tissot',
        album: 'Acoustic Memories',
        duration: 205,
        coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3',
      },
    ],
  },
  a2: {
    id: 'a2',
    title: 'Summer Nights',
    artist: 'Various Artists',
    year: '2023',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=600&fit=crop',
    tracks: [
      {
        id: 'a2-1',
        title: 'Sunny Beats',
        artist: 'Bensound',
        album: 'Summer Nights',
        duration: 140,
        coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3',
      },
      {
        id: 'a2-2',
        title: 'Summer Vibes Deluxe',
        artist: 'Benjamin Tissot',
        album: 'Summer Nights',
        duration: 180,
        coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
      },
    ],
  },
  a3: {
    id: 'a3',
    title: 'Neon Nights',
    artist: 'Electronic Waves',
    year: '2024',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=600&fit=crop',
    tracks: [
      {
        id: 'a3-1',
        title: 'Energy Pulse',
        artist: 'Electronic Waves',
        album: 'Neon Nights',
        duration: 179,
        coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3',
      },
    ],
  },
  a4: {
    id: 'a4',
    title: 'Midnight Jazz',
    artist: 'The Quartet Club',
    year: '2023',
    coverUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&h=600&fit=crop',
    tracks: [
      {
        id: 'a4-1',
        title: 'Midnight Serenade',
        artist: 'The Quartet Club',
        album: 'Midnight Jazz',
        duration: 210,
        coverUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300&h=300&fit=crop',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3',
      },
    ],
  },
};

export default function AlbumDetailPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params?.id;
  const albumId = Array.isArray(rawId) ? rawId[0] : (rawId as string) || 'a1';

  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);

  const { currentTrack, isPlaying, setQueue, togglePlay } = usePlayerStore();

  useEffect(() => {
    async function resolveAlbum() {
      setLoading(true);

      // 1. Álbum automático de canciones subidas
      if (albumId === 'uploaded') {
        try {
          const res = await fetch('/api/tracks');
          if (res.ok) {
            const tracks: Track[] = await res.json();
            setAlbum({
              id: 'uploaded',
              title: 'Mis Canciones Subidas',
              artist: 'Colección Local',
              year: '2026',
              coverUrl: tracks[0]?.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=600&fit=crop',
              tracks: tracks,
            });
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error('Error cargando álbum de subidas:', e);
        }
      }

      // 2. Álbumes personalizados guardados en localStorage
      const saved = localStorage.getItem('rokola_custom_albums');
      if (saved) {
        try {
          const parsed: Album[] = JSON.parse(saved);
          const customAlbum = parsed.find((a) => a.id === albumId);
          if (customAlbum) {
            setAlbum(customAlbum);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Error leyendo álbumes personalizados:', err);
        }
      }

      // 3. Catálogo de álbumes predefinidos
      if (STATIC_ALBUMS[albumId]) {
        setAlbum(STATIC_ALBUMS[albumId]);
      } else {
        setAlbum(STATIC_ALBUMS['a1']);
      }
      setLoading(false);
    }

    resolveAlbum();
  }, [albumId]);

  if (loading || !album) {
    return <div className="p-10 text-center text-zinc-500 text-sm">Cargando álbum...</div>;
  }

  const albumTracks = album.tracks || [];
  const isCurrentAlbumPlaying =
    albumTracks.length > 0 &&
    albumTracks.some((t) => t.id === currentTrack?.id) &&
    isPlaying;

  const handlePlayAlbum = () => {
    if (isCurrentAlbumPlaying) {
      togglePlay();
    } else if (albumTracks.length > 0) {
      setQueue(albumTracks, 0);
    }
  };

  const handleDeleteAlbum = () => {
    const confirmed = window.confirm(`¿Seguro que deseas eliminar el álbum "${album.title}"?`);
    if (!confirmed) return;

    const saved = localStorage.getItem('rokola_custom_albums');
    if (saved) {
      const parsed: Album[] = JSON.parse(saved);
      const updated = parsed.filter((a) => a.id !== album.id);
      localStorage.setItem('rokola_custom_albums', JSON.stringify(updated));
    }
    router.push('/albums');
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
        href="/albums"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition font-medium"
      >
        <ChevronLeft size={16} />
        <span>Volver a Álbumes</span>
      </Link>

      {/* Cabecera del Álbum */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6 border-b border-zinc-900">
        <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-xl overflow-hidden shadow-2xl border border-zinc-800/80 flex-shrink-0 bg-zinc-900">
          <img
            src={album.coverUrl}
            alt={album.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=600&fit=crop';
            }}
          />
        </div>

        <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2 flex-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-green-400 flex items-center gap-1.5">
            <Disc3 size={15} />
            <span>Álbum</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{album.title}</h1>
          <p className="text-zinc-400 text-sm">
            {album.artist} • {album.year} • {albumTracks.length} {albumTracks.length === 1 ? 'canción' : 'canciones'}
          </p>

          <div className="mt-3 flex items-center gap-3">
            {albumTracks.length > 0 && (
              <button
                onClick={handlePlayAlbum}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold text-sm px-6 py-2.5 rounded-full transition transform active:scale-95 shadow-md cursor-pointer"
              >
                {isCurrentAlbumPlaying ? <Pause size={16} fill="black" /> : <Play size={16} fill="black" className="ml-0.5" />}
                <span>{isCurrentAlbumPlaying ? 'Pausar' : 'Reproducir Álbum'}</span>
              </button>
            )}

            {album.id !== 'uploaded' && !['a1', 'a2', 'a3', 'a4'].includes(album.id) && (
              <button
                onClick={handleDeleteAlbum}
                className="p-2.5 bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-full border border-zinc-800 transition cursor-pointer"
                title="Eliminar este álbum"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de Canciones */}
      <div className="space-y-1">
        <div className="grid grid-cols-12 text-xs uppercase font-semibold text-zinc-500 px-4 py-2 border-b border-zinc-900">
          <span className="col-span-1">#</span>
          <span className="col-span-8">Título</span>
          <span className="col-span-3 text-right flex items-center justify-end gap-1">
            <Clock size={14} />
          </span>
        </div>

        {albumTracks.length === 0 ? (
          <p className="text-zinc-500 text-xs py-8 text-center">No hay canciones asignadas a este álbum.</p>
        ) : (
          albumTracks.map((track, index) => {
            const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;

            return (
              <div
                key={track.id}
                onClick={() => setQueue(albumTracks, index)}
                className="grid grid-cols-12 items-center px-4 py-3 rounded-lg hover:bg-zinc-900/60 cursor-pointer group transition text-sm"
              >
                <span className={`col-span-1 font-medium ${isThisTrackPlaying ? 'text-green-400' : 'text-zinc-500'}`}>
                  {index + 1}
                </span>
                <div className="col-span-8 flex items-center gap-3 min-w-0">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop';
                    }}
                  />
                  <div className="truncate">
                    <p className={`font-semibold truncate ${isThisTrackPlaying ? 'text-green-400' : 'text-white'}`}>
                      {track.title}
                    </p>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">{track.artist}</p>
                  </div>
                </div>
                <span className="col-span-3 text-right text-zinc-400 text-xs font-medium">
                  {formatDuration(track.duration)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}