'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePlayerStore } from '@/store/usePlaystore';
import { Album } from '@/types/rokola';
import { Disc3, Play, Pause, Search } from 'lucide-react';

// Catálogo de Álbumes
const ALBUMS_CATALOG: Album[] = [
  {
    id: 'a1',
    title: 'Acoustic Memories',
    artist: 'Benjamin Tissot',
    year: '2024',
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&h=500&fit=crop',
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
  {
    id: 'a2',
    title: 'Summer Nights',
    artist: 'Various Artists',
    year: '2023',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=500&fit=crop',
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
  {
    id: 'a3',
    title: 'Neon Nights',
    artist: 'Electronic Waves',
    year: '2024',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop',
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
  {
    id: 'a4',
    title: 'Midnight Jazz',
    artist: 'The Quartet Club',
    year: '2023',
    coverUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500&h=500&fit=crop',
    tracks: [],
  },
];

export default function AlbumsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { currentTrack, isPlaying, setQueue, togglePlay } = usePlayerStore();

  const filteredAlbums = ALBUMS_CATALOG.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 pb-28">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Disc3 className="text-indigo-400" size={28} />
            <span>Álbumes</span>
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">
            Explora las colecciones y lanzamientos discográficos completos
          </p>
        </div>

        {/* Buscador de álbumes */}
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por álbum o artista..."
            className="w-full bg-zinc-900/70 text-xs text-white placeholder-zinc-500 rounded-xl pl-9 pr-3 py-2.5 border border-zinc-800/80 focus:border-zinc-700 focus:outline-none transition shadow-sm"
          />
        </div>
      </div>

      {/* Grid de Álbumes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {filteredAlbums.map((album) => {
          const isAlbumPlaying = album.tracks.some((t) => t.id === currentTrack?.id) && isPlaying;

          return (
            <div
              key={album.id}
              className="bg-zinc-900/30 hover:bg-zinc-900/70 p-4 rounded-xl border border-zinc-800/40 hover:border-zinc-700 transition flex flex-col justify-between group shadow-sm"
            >
              <div className="aspect-square mb-3.5 rounded-lg overflow-hidden border border-zinc-800/60 relative">
                <img
                  src={album.coverUrl}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />

                {/* Botón flotante para reproducir el álbum de inmediato */}
                {album.tracks.length > 0 && (
                  <button
                    onClick={() => {
                      if (isAlbumPlaying) {
                        togglePlay();
                      } else {
                        setQueue(album.tracks, 0);
                      }
                    }}
                    className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-lg transition transform cursor-pointer ${
                      isAlbumPlaying ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
                    }`}
                  >
                    {isAlbumPlaying ? <Pause size={16} fill="black" /> : <Play size={16} fill="black" className="ml-0.5" />}
                  </button>
                )}
              </div>

              <div>
                <Link href={`/album/${album.id}`} className="hover:underline">
                  <h3 className="font-semibold text-sm text-white truncate">{album.title}</h3>
                </Link>
                <p className="text-xs text-zinc-400 mt-0.5 truncate">
                  {album.artist} • <span className="text-zinc-500">{album.year}</span>
                </p>
                <span className="inline-block mt-2 text-[11px] text-zinc-500 font-medium">
                  {album.tracks.length} {album.tracks.length === 1 ? 'canción' : 'canciones'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}