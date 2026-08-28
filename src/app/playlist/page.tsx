'use client';

import { useParams } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlaystore';
import { Track, Playlist } from '@/types/rokola';
import { Play, Pause, Clock, ChevronLeft, ListMusic } from 'lucide-react';
import Link from 'next/link';

const PLAYLISTS_DATA: Record<string, Playlist> = {
  p1: {
    id: 'p1',
    name: 'Favoritos de la Semana',
    description: 'Tus temas más escuchados compilados automáticamente para ti.',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=600&fit=crop',
    trackCount: 3,
    tracks: [
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
    ],
  },
  p2: {
    id: 'p2',
    name: 'Para Concentrarse',
    description: 'Música instrumental, ondas suaves y ambient para estudiar o trabajar.',
    coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&h=600&fit=crop',
    trackCount: 1,
    tracks: [
      {
        id: '4',
        title: 'Slow Motion',
        artist: 'Chillout Lab',
        album: 'Acoustic Memories',
        duration: 205,
        coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
        audioUrl: 'https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3',
      },
    ],
  },
  p3: {
    id: 'p3',
    name: 'Entrenamiento & Gym',
    description: 'Ritmos enérgicos para darlo todo en cada serie.',
    coverUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop',
    trackCount: 0,
    tracks: [],
  },
};

export default function PlaylistDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const playlistId = Array.isArray(rawId) ? rawId[0] : (rawId as string) || 'p1';
  const playlist = PLAYLISTS_DATA[playlistId] || PLAYLISTS_DATA['p1'];

  const { currentTrack, isPlaying, setQueue, togglePlay } = usePlayerStore();

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
        <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-xl overflow-hidden shadow-2xl border border-zinc-800/80 flex-shrink-0">
          <img
            src={playlist.coverUrl}
            alt={playlist.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-green-400">
            Playlist
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {playlist.name}
          </h1>
          <p className="text-zinc-400 text-sm max-w-xl">{playlist.description}</p>
          <p className="text-zinc-500 text-xs font-medium">
            {playlistTracks.length} {playlistTracks.length === 1 ? 'canción' : 'canciones'}
          </p>

          {playlistTracks.length > 0 && (
            <button
              onClick={handlePlayPlaylist}
              className="mt-3 flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold text-sm px-6 py-2.5 rounded-full transition transform active:scale-95 shadow-md cursor-pointer"
            >
              {isCurrentPlaylistPlaying ? (
                <Pause size={16} fill="black" />
              ) : (
                <Play size={16} fill="black" className="ml-0.5" />
              )}
              <span>{isCurrentPlaylistPlaying ? 'Pausar' : 'Reproducir Playlist'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Lista de Canciones de la Playlist */}
      <div className="space-y-1">
        <div className="grid grid-cols-12 text-xs uppercase font-semibold text-zinc-500 px-4 py-2 border-b border-zinc-900">
          <span className="col-span-1">#</span>
          <span className="col-span-8">Título</span>
          <span className="col-span-3 text-right flex items-center justify-end gap-1">
            <Clock size={14} />
          </span>
        </div>

        {playlistTracks.length === 0 ? (
          <p className="text-zinc-500 text-xs py-8 text-center">
            Esta playlist no tiene canciones aún.
          </p>
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

                <div className="col-span-8 flex items-center gap-3 min-w-0">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-10 h-10 rounded object-cover flex-shrink-0"
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