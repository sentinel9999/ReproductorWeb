'use client';

import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/usePlaystore';
import { useAuthStore } from '@/store/useAuthStore';
import { Track, Artist } from '@/types/rokola';
import { 
  Play, 
  Pause, 
  Disc, 
  Music, 
  Sparkles, 
  Mic2, 
  Heart, 
  ListMusic, 
  Library, 
  ChevronRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

const POPULAR_ARTISTS: Artist[] = [
  {
    id: 'art-1',
    name: 'Benjamin Tissot',
    role: 'Compositor / Acústico',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
  },
  {
    id: 'art-2',
    name: 'Bensound',
    role: 'Productor Musical',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
  },
  {
    id: 'art-3',
    name: 'Electronic Waves',
    role: 'Dúo Synthwave',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
  },
  {
    id: 'art-4',
    name: 'Chillout Lab',
    role: 'Banda Lo-Fi / Ambient',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop',
  },
];

const RECENT_ALBUMS = [
  {
    id: 'a1',
    title: 'Acoustic Memories',
    artist: 'Benjamin Tissot',
    year: '2024',
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&h=300&fit=crop',
  },
  {
    id: 'a2',
    title: 'Summer Nights',
    artist: 'Various Artists',
    year: '2023',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
  },
  {
    id: 'a3',
    title: 'Neon Nights',
    artist: 'Electronic Waves',
    year: '2024',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
  },
  {
    id: 'a4',
    title: 'Midnight Jazz',
    artist: 'The Quartet Club',
    year: '2023',
    coverUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300&h=300&fit=crop',
  },
];

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { currentTrack, isPlaying, setTrack, setQueue, togglePlay } = usePlayerStore();
  const currentUser = useAuthStore((state) => state.currentUser);

  useEffect(() => {
    async function loadTracks() {
      try {
        const res = await fetch('/api/tracks');
        if (res.ok) {
          const data = await res.json();
          setTracks(data);
        }
      } catch (error) {
        console.error('Error cargando canciones:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadTracks();
  }, []);

  const featuredTrack = tracks[0];
  const recentTracks = tracks.slice(1);

  const handlePlayFeatured = () => {
    if (!featuredTrack) return;
    if (currentTrack?.id === featuredTrack.id) {
      togglePlay();
    } else {
      setTrack(featuredTrack);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-zinc-400">
        <Loader2 className="animate-spin text-green-500" size={32} />
        <p className="text-sm">Cargando catálogo musical...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12 pb-24">
      {/* 1. Saludo personalizado */}
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-green-400 text-sm font-semibold tracking-wide uppercase">
          <Sparkles size={16} />
          <span>
            {currentUser ? `¡Qué bueno verte de vuelta, ${currentUser.name}!` : '¡Bienvenido a Rokola!'}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
          Inicio
        </h1>
      </header>

      {/* 2. Banner Destacado / Hero */}
      {featuredTrack && (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900/60 via-zinc-900 to-zinc-950 border border-emerald-500/20 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-4 z-10 max-w-xl">
            <span className="inline-block px-3 py-1 bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-semibold rounded-full uppercase tracking-wider">
              Recomendado para ti
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight">
              {featuredTrack.title}
            </h2>
            <p className="text-zinc-300 text-sm md:text-base">
              Disfruta de este gran tema compuesto por {featuredTrack.artist}.
            </p>
            <div className="pt-2">
              <button
                onClick={handlePlayFeatured}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-3 rounded-full transition transform hover:scale-105 active:scale-95 shadow-lg cursor-pointer"
              >
                {currentTrack?.id === featuredTrack.id && isPlaying ? (
                  <>
                    <Pause size={18} fill="black" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play size={18} fill="black" className="ml-0.5" />
                    <span>Reproducir ahora</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="w-full md:w-64 h-48 rounded-xl overflow-hidden shadow-lg border border-zinc-800 flex-shrink-0">
            <img
              src={featuredTrack.coverUrl}
              alt={featuredTrack.title}
              className="w-full h-full object-cover"
            />
          </div>
        </section>
      )}

      {/* 3. Tu Biblioteca y Colecciones */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Library className="text-green-400" size={20} />
            <h2 className="text-xl font-bold text-white">Tu Biblioteca y Colecciones</h2>
          </div>
          <Link
            href="/library"
            className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-green-400 transition"
          >
            <span>Ver todo</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/profile"
            className="bg-gradient-to-br from-indigo-900/40 to-zinc-900/80 hover:from-indigo-900/60 hover:to-zinc-900 p-5 rounded-2xl border border-indigo-500/20 hover:border-indigo-500/40 transition flex items-center justify-between group shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-md">
                <Heart size={24} fill="currentColor" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition">
                  Tus Me Gusta
                </h3>
                <p className="text-xs text-zinc-400">
                  {currentUser ? `${currentUser.likedSongIds.length} canciones guardadas` : 'Colección de favoritos'}
                </p>
              </div>
            </div>
            <ChevronRight className="text-zinc-500 group-hover:text-white transition" size={20} />
          </Link>

          <Link
            href="/library"
            className="bg-zinc-900/40 hover:bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800/60 hover:border-zinc-700 transition flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-green-400 shadow-md">
                <ListMusic size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base text-white group-hover:text-green-400 transition">
                  Tus Playlists
                </h3>
                <p className="text-xs text-zinc-400">Listas personalizadas</p>
              </div>
            </div>
            <ChevronRight className="text-zinc-500 group-hover:text-white transition" size={20} />
          </Link>

          <div className="bg-zinc-900/40 hover:bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800/60 hover:border-zinc-700 transition flex items-center justify-between group shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md">
                <Library size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Artistas y Álbumes</h3>
                <p className="text-xs text-zinc-400">Biblioteca activa</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Escuchado Recientemente */}
      {recentTracks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Music className="text-green-400" size={20} />
            <h2 className="text-xl font-bold text-white">Escuchado Recientemente</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentTracks.map((track, index) => {
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

                  <button
                    onClick={() => setQueue(recentTracks, index)}
                    className={`w-9 h-9 bg-green-500 rounded-full flex items-center justify-center text-black shadow-md transition transform group-hover:scale-100 flex-shrink-0 cursor-pointer ${
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
              );
            })}
          </div>
        </section>
      )}

      {/* 5. Artistas Populares */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Mic2 className="text-green-400" size={20} />
          <h2 className="text-xl font-bold text-white">Artistas Populares</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {POPULAR_ARTISTS.map((artist) => (
            <div
              key={artist.id}
              className="bg-zinc-900/40 hover:bg-zinc-900/80 p-4 rounded-xl border border-zinc-800/60 hover:border-zinc-700 transition cursor-pointer group flex flex-col items-center text-center shadow-sm"
            >
              <div className="w-28 h-28 md:w-36 md:h-36 mb-4 overflow-hidden rounded-full relative shadow-md">
                <img
                  src={artist.avatarUrl}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <h3 className="font-semibold text-sm text-white truncate w-full">{artist.name}</h3>
              <p className="text-xs text-zinc-400 truncate w-full mt-1">{artist.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Álbumes y Compilaciones */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Disc className="text-green-400" size={20} />
          <h2 className="text-xl font-bold text-white">Álbumes y Compilaciones</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {RECENT_ALBUMS.map((album) => (
            <Link
              key={album.id}
              href={`/album/${album.id}`}
              className="bg-zinc-900/40 hover:bg-zinc-900/80 p-4 rounded-xl border border-zinc-800/60 hover:border-zinc-700 transition cursor-pointer group flex flex-col justify-between shadow-sm"
            >
              <div className="aspect-square mb-3 overflow-hidden rounded-lg relative">
                <img
                  src={album.coverUrl}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white truncate">{album.title}</h3>
                <p className="text-xs text-zinc-400 truncate mt-0.5">
                  {album.artist} • <span className="text-zinc-500">{album.year}</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}