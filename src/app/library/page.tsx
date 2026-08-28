'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePlayerStore } from '@/store/usePlaystore';
import { Track, Album } from '@/types/rokola';
import { 
  Heart, 
  ListMusic, 
  Play, 
  Pause, 
  Search, 
  Plus, 
  Grid, 
  List as ListIcon, 
  Clock,
  Disc3,
  Trash2,
  Loader2
} from 'lucide-react';

export default function LibraryPage() {
  const [filter, setFilter] = useState<'all' | 'songs' | 'albums'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { currentTrack, isPlaying, setQueue, togglePlay } = usePlayerStore();

  useEffect(() => {
    async function loadLibrary() {
      try {
        const [tracksRes, albumsRes] = await Promise.all([
          fetch('/api/tracks'),
          fetch('/api/albums'),
        ]);
        const tracksData = await tracksRes.json();
        const albumsData = await albumsRes.json();
        
        if (Array.isArray(tracksData)) setTracks(tracksData);
        if (Array.isArray(albumsData)) setAlbums(albumsData);
      } catch (err) {
        console.error('Error cargando biblioteca:', err);
      }
    }

    loadLibrary();
  }, []);

  // Función para eliminar canción
  const handleDeleteTrack = async (e: React.MouseEvent, trackId: string, trackTitle: string) => {
    e.stopPropagation(); // Evita que empiece a reproducirse al hacer click en borrar

    const confirmDelete = window.confirm(`¿Seguro que deseas eliminar "${trackTitle}" del servidor?`);
    if (!confirmDelete) return;

    try {
      setDeletingId(trackId);
      const res = await fetch(`/api/tracks/${trackId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Quitarla del estado visual
        setTracks((prev) => prev.filter((t) => t.id !== trackId));
      } else {
        alert('No se pudo eliminar la canción del servidor.');
      }
    } catch (err) {
      console.error('Error borrando canción:', err);
      alert('Ocurrió un error al intentar borrar.');
    } finally {
      setDeletingId(null);
    }
  };

  const isAllTracksPlaying =
    tracks.length > 0 && tracks.some((t) => t.id === currentTrack?.id) && isPlaying;

  const handlePlayAll = () => {
    if (isAllTracksPlaying) {
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

  const filteredTracks = tracks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAlbums = albums.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 pb-24">
      {/* 1. Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Tu Biblioteca
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Gestiona tus canciones almacenadas y álbumes
          </p>
        </div>

        <Link
          href="/upload"
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold text-sm px-5 py-2.5 rounded-full transition transform hover:scale-105 active:scale-95 shadow-md"
        >
          <Plus size={18} />
          <span>Subir Canción</span>
        </Link>
      </div>

      {/* 2. Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-2 border-b border-zinc-900">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {(['all', 'songs', 'albums'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filter === tab
                  ? 'bg-white text-black'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {tab === 'all' ? 'Todo' : tab === 'songs' ? 'Canciones' : 'Álbumes'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar canción o álbum..."
              className="w-full bg-zinc-900/90 text-xs text-white placeholder-zinc-500 rounded-full pl-9 pr-3 py-2 border border-zinc-800 focus:border-green-500 focus:outline-none transition"
            />
          </div>

          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded cursor-pointer ${viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded cursor-pointer ${viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Banner Álbum de Subidas */}
      {(filter === 'all' || filter === 'songs' || filter === 'albums') && (
        <section>
          <div
            onClick={handlePlayAll}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-zinc-900 to-zinc-950 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl cursor-pointer group border border-emerald-500/30 hover:border-emerald-500/60 transition"
          >
            <div className="space-y-2 z-10">
              <div className="flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-wider">
                <Disc3 size={18} className="animate-spin" />
                <span>Colección Local</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">Mis Canciones Subidas</h2>
              <p className="text-zinc-300 text-sm">
                {tracks.length} canciones almacenadas en el servidor
              </p>
              <Link
                href="/album/uploaded"
                onClick={(e) => e.stopPropagation()}
                className="inline-block text-xs font-semibold text-green-400 hover:underline pt-1"
              >
                Ver lista completa del álbum →
              </Link>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayAll();
              }}
              className="w-14 h-14 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center text-black shadow-2xl transition transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              {isAllTracksPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
            </button>
          </div>
        </section>
      )}

      {/* 4. Lista de Canciones con botón Eliminar */}
      {viewMode === 'list' || filter === 'songs' ? (
        <div className="space-y-1">
          <div className="grid grid-cols-12 text-xs uppercase font-semibold text-zinc-500 px-4 py-2 border-b border-zinc-900">
            <span className="col-span-1">#</span>
            <span className="col-span-6 md:col-span-7">Título</span>
            <span className="col-span-3 md:col-span-2 text-right">Duración</span>
            <span className="col-span-2 text-right">Acción</span>
          </div>

          {filteredTracks.map((track, index) => {
            const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;
            const isDeletingThis = deletingId === track.id;

            return (
              <div
                key={track.id}
                onClick={() => setQueue(filteredTracks, index)}
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

                {/* Botón Eliminar */}
                <div className="col-span-2 text-right">
                  <button
                    onClick={(e) => handleDeleteTrack(e, track.id, track.title)}
                    disabled={isDeletingThis}
                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer disabled:opacity-50"
                    title="Eliminar canción del servidor"
                  >
                    {isDeletingThis ? (
                      <Loader2 size={16} className="animate-spin text-red-400" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Vista Cuadrícula */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {filteredAlbums.map((album) => (
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
                <div className="absolute bottom-2 right-2 w-9 h-9 bg-green-500 rounded-full flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition transform translate-y-2 group-hover:translate-y-0 shadow-lg">
                  <Play size={16} fill="black" className="ml-0.5" />
                </div>
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
      )}
    </div>
  );
}