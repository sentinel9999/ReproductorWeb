'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePlayerStore } from '@/store/usePlaystore';
import { Track, Playlist, Album, Artist } from '@/types/rokola';
import { 
  Heart, 
  ListMusic, 
  Disc, 
  Mic2, 
  Play, 
  Pause, 
  Search, 
  Plus, 
  Clock, 
  Grid, 
  List as ListIcon, 
  X 
} from 'lucide-react';

// Pool de carátulas para asignación aleatoria
const DEFAULT_COVERS = [
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=400&fit=crop',
];

// 1. Playlists Iniciales
const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'p1',
    name: 'Favoritos de la Semana',
    description: 'Tus temas más escuchados compilados automáticamente.',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
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
  {
    id: 'p2',
    name: 'Para Concentrarse',
    description: 'Música instrumental y ambient para trabajar.',
    coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=400&fit=crop',
    tracks: [
      {
        id: '4',
        title: 'Slow Motion',
        artist: 'Chillout Lab',
        duration: 205,
        coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
        audioUrl: 'https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3',
      },
    ],
  },
  {
    id: 'p3',
    name: 'Entrenamiento & Gym',
    description: 'Ritmos rápidos para entrenar.',
    coverUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop',
    tracks: [],
  },
];

// 2. Álbumes Guardados
const SAVED_ALBUMS: Album[] = [
  {
    id: 'a1',
    title: 'Acoustic Memories',
    artist: 'Benjamin Tissot',
    year: '2024',
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&h=400&fit=crop',
    tracks: [
      {
        id: '1',
        title: 'Acoustic Breeze',
        artist: 'Benjamin Tissot',
        duration: 100,
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
        audioUrl: 'https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3',
      },
    ],
  },
  {
    id: 'a2',
    title: 'Summer Nights',
    artist: 'Various Artists',
    year: '2023',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop',
    tracks: [
      {
        id: '2',
        title: 'Sunny Beats',
        artist: 'Bensound',
        duration: 140,
        coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
        audioUrl: 'https://www.bensound.com/bensound-music/bensound-sunny.mp3',
      },
    ],
  },
];

// 3. Artistas Seguidos
const FOLLOWED_ARTISTS: Artist[] = [
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
];

// 4. Canciones Favoritas (Me Gusta)
const LIKED_TRACKS: Track[] = [
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
];

export default function LibraryPage() {
  const [filter, setFilter] = useState<'all' | 'playlists' | 'songs' | 'albums' | 'artists'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal para crear playlist
  const [playlists, setPlaylists] = useState<Playlist[]>(INITIAL_PLAYLISTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

  const { currentTrack, isPlaying, setQueue, togglePlay } = usePlayerStore();

  const isLikedPlaying = LIKED_TRACKS.some((t) => t.id === currentTrack?.id) && isPlaying;

  const handlePlayLiked = () => {
    if (isLikedPlaying) {
      togglePlay();
    } else {
      setQueue(LIKED_TRACKS, 0);
    }
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    // Asignación de carátula aleatoria
    const randomCover = DEFAULT_COVERS[Math.floor(Math.random() * DEFAULT_COVERS.length)];

    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      name: newPlaylistName.trim(),
      description: newPlaylistDesc.trim() || 'Lista creada por el usuario',
      coverUrl: randomCover,
      tracks: [],
    };

    setPlaylists([newPl, ...playlists]);
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setIsModalOpen(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Filtros de búsqueda
  const filteredPlaylists = playlists.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredAlbums = SAVED_ALBUMS.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredArtists = FOLLOWED_ARTISTS.filter((art) =>
    art.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredTracks = LIKED_TRACKS.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 pb-24">
      {/* 1. Cabecera Principal */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Tu Biblioteca
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Gestiona tus listas, álbumes guardados, canciones y artistas favoritos
          </p>
        </div>

        {/* Botón interactivo para abrir modal */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold text-sm px-5 py-2.5 rounded-full transition transform hover:scale-105 active:scale-95 shadow-md cursor-pointer"
        >
          <Plus size={18} />
          <span>Crear playlist</span>
        </button>
      </div>

      {/* 2. Filtros por Pestañas y Buscador Interno */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-2 border-b border-zinc-900">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Todo
          </button>
          <button
            onClick={() => setFilter('playlists')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              filter === 'playlists'
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Playlists
          </button>
          <button
            onClick={() => setFilter('songs')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              filter === 'songs'
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Canciones
          </button>
          <button
            onClick={() => setFilter('albums')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              filter === 'albums'
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Álbumes
          </button>
          <button
            onClick={() => setFilter('artists')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              filter === 'artists'
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Artistas
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en tu biblioteca..."
              className="w-full bg-zinc-900/90 text-xs text-white placeholder-zinc-500 rounded-full pl-9 pr-3 py-2 border border-zinc-800 focus:border-green-500 focus:outline-none transition"
            />
          </div>

          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded cursor-pointer ${viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Vista en cuadrícula"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded cursor-pointer ${viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Vista en lista"
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Banner de Favoritos */}
      {(filter === 'all' || filter === 'songs') && (
        <section className="space-y-4">
          <div
            onClick={handlePlayLiked}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-700 via-purple-800 to-zinc-950 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl cursor-pointer group border border-indigo-500/30 hover:border-indigo-500/60 transition duration-300"
          >
            <div className="space-y-2 z-10">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white mb-2">
                <Heart size={24} fill="white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">Tus Canciones Favoritas</h2>
              <p className="text-zinc-200 text-sm">
                {LIKED_TRACKS.length} canciones guardadas con ❤️
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayLiked();
              }}
              className="w-14 h-14 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center text-black shadow-2xl transition transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              {isLikedPlaying ? (
                <Pause size={24} fill="black" />
              ) : (
                <Play size={24} fill="black" className="ml-1" />
              )}
            </button>
          </div>
        </section>
      )}

      {/* 4. Vista en Cuadrícula (Grid) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {/* Playlists */}
          {(filter === 'all' || filter === 'playlists') &&
            filteredPlaylists.map((pl) => (
              <Link
                key={pl.id}
                href={`/playlist/${pl.id}`}
                className="bg-zinc-900/40 hover:bg-zinc-900/80 p-4 rounded-xl border border-zinc-800/60 hover:border-zinc-700 transition cursor-pointer group flex flex-col justify-between shadow-sm"
              >
                <div className="aspect-square mb-3 overflow-hidden rounded-lg relative">
                  <img
                    src={pl.coverUrl}
                    alt={pl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute bottom-2 right-2 w-9 h-9 bg-green-500 rounded-full flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition transform translate-y-2 group-hover:translate-y-0 shadow-lg">
                    <Play size={16} fill="black" className="ml-0.5" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white truncate">{pl.name}</h3>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">
                    Playlist • {pl.tracks?.length || 0} temas
                  </p>
                </div>
              </Link>
            ))}

          {/* Álbumes */}
          {(filter === 'all' || filter === 'albums') &&
            filteredAlbums.map((album) => (
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
                    Álbum • {album.artist}
                  </p>
                </div>
              </Link>
            ))}

          {/* Artistas */}
          {(filter === 'all' || filter === 'artists') &&
            filteredArtists.map((artist) => (
              <div
                key={artist.id}
                className="bg-zinc-900/40 hover:bg-zinc-900/80 p-4 rounded-xl border border-zinc-800/60 hover:border-zinc-700 transition cursor-pointer group flex flex-col items-center text-center shadow-sm"
              >
                <div className="w-28 h-28 mb-3 overflow-hidden rounded-full relative shadow-md">
                  <img
                    src={artist.avatarUrl}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <h3 className="font-semibold text-sm text-white truncate w-full">{artist.name}</h3>
                <p className="text-xs text-zinc-400 truncate w-full mt-0.5">{artist.role}</p>
              </div>
            ))}
        </div>
      )}

      {/* 5. Vista en Lista (List) */}
      {viewMode === 'list' && (
        <div className="space-y-1">
          <div className="grid grid-cols-12 text-xs uppercase font-semibold text-zinc-500 px-4 py-2 border-b border-zinc-900">
            <span className="col-span-1">#</span>
            <span className="col-span-6">Título</span>
            <span className="col-span-3">Tipo</span>
            <span className="col-span-2 text-right">Duración</span>
          </div>

          {filteredTracks.map((track, index) => {
            const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;

            return (
              <div
                key={track.id}
                onClick={() => setQueue(filteredTracks, index)}
                className="grid grid-cols-12 items-center px-4 py-3 rounded-lg hover:bg-zinc-900/70 cursor-pointer group transition text-sm"
              >
                <span className={`col-span-1 font-medium ${isThisTrackPlaying ? 'text-green-400' : 'text-zinc-400'}`}>
                  {index + 1}
                </span>
                <div className="col-span-6 flex items-center gap-3 min-w-0">
                  <img src={track.coverUrl} alt={track.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                  <div className="truncate">
                    <p className={`font-semibold truncate ${isThisTrackPlaying ? 'text-green-400' : 'text-white'}`}>
                      {track.title}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                  </div>
                </div>
                <span className="col-span-3 text-xs text-zinc-400">Canción</span>
                <span className="col-span-2 text-right text-xs text-zinc-400">
                  {formatDuration(track.duration)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Modal para Crear Playlist */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ListMusic className="text-green-400" size={20} />
                <span>Nueva Playlist</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Ej: Mix para entrenar, Acústico 2026..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Descripción (Opcional)</label>
                <textarea
                  rows={3}
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="Añade una descripción sobre esta colección..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-green-500 hover:bg-green-400 text-black transition shadow-md font-medium cursor-pointer"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}