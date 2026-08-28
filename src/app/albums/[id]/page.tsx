'use client';

import { useParams } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlaystore';
import { Track, Album } from '@/types/rokola';
import { Play, Pause, Clock, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const ALBUMS_DATA: Record<string, Album> = {
  a1: {
    id: 'a1',
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
        audioUrl: 'https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3',
      },
      {
        id: '4',
        title: 'Slow Motion',
        artist: 'Benjamin Tissot',
        album: 'Acoustic Memories',
        duration: 205,
        coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&h=300&fit=crop',
        audioUrl: 'https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3',
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
        id: '2',
        title: 'Sunny Beats',
        artist: 'Bensound',
        album: 'Summer Nights',
        duration: 140,
        coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
        audioUrl: 'https://www.bensound.com/bensound-music/bensound-sunny.mp3',
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
        id: '3',
        title: 'Energy Pulse',
        artist: 'Electronic Waves',
        album: 'Neon Nights',
        duration: 179,
        coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
        audioUrl: 'https://www.bensound.com/bensound-music/bensound-energy.mp3',
      },
    ],
  },
  a4: {
    id: 'a4',
    title: 'Midnight Jazz',
    artist: 'The Quartet Club',
    year: '2023',
    coverUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&h=600&fit=crop',
    tracks: [],
  },
};

export default function AlbumDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const albumId = Array.isArray(rawId) ? rawId[0] : (rawId as string) || 'a1';
  
  // Si no encuentra el ID, toma a1 como fallback por defecto
  const album = ALBUMS_DATA[albumId] || ALBUMS_DATA['a1'];

  const { currentTrack, isPlaying, setQueue, togglePlay } = usePlayerStore();

  const isCurrentAlbumPlaying =
    album.tracks.length > 0 &&
    album.tracks.some((t) => t.id === currentTrack?.id) &&
    isPlaying;

  const handlePlayAlbum = () => {
    if (isCurrentAlbumPlaying) {
      togglePlay();
    } else if (album.tracks.length > 0) {
      setQueue(album.tracks, 0);
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
        href="/albums"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition font-medium"
      >
        <ChevronLeft size={16} />
        <span>Volver a Álbumes</span>
      </Link>

      {/* Cabecera del Álbum */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6 border-b border-zinc-900">
        <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-xl overflow-hidden shadow-2xl border border-zinc-800/80 flex-shrink-0">
          <img
            src={album.coverUrl}
            alt={album.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Álbum
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {album.title}
          </h1>
          <p className="text-zinc-400 text-sm">
            {album.artist} • {album.year} • {album.tracks.length} canciones
          </p>

          {album.tracks.length > 0 && (
            <button
              onClick={handlePlayAlbum}
              className="mt-3 flex items-center gap-2 bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-sm px-6 py-2.5 rounded-full transition transform active:scale-95 shadow-md cursor-pointer"
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

      {/* Lista de Canciones */}
      <div className="space-y-1">
        <div className="grid grid-cols-12 text-xs uppercase font-semibold text-zinc-500 px-4 py-2 border-b border-zinc-900">
          <span className="col-span-1">#</span>
          <span className="col-span-8">Título</span>
          <span className="col-span-3 text-right flex items-center justify-end gap-1">
            <Clock size={14} />
          </span>
        </div>

        {album.tracks.length === 0 ? (
          <p className="text-zinc-500 text-xs py-6 text-center">
            No hay canciones disponibles en este álbum.
          </p>
        ) : (
          album.tracks.map((track, index) => {
            const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;

            return (
              <div
                key={track.id}
                onClick={() => setQueue(album.tracks, index)}
                className="grid grid-cols-12 items-center px-4 py-3 rounded-lg hover:bg-zinc-900/60 cursor-pointer group transition text-sm"
              >
                <span
                  className={`col-span-1 font-medium ${
                    isThisTrackPlaying ? 'text-indigo-400' : 'text-zinc-500'
                  }`}
                >
                  {index + 1}
                </span>
                <div className="col-span-8">
                  <p
                    className={`font-semibold truncate ${
                      isThisTrackPlaying ? 'text-indigo-400' : 'text-white'
                    }`}
                  >
                    {track.title}
                  </p>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">{track.artist}</p>
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