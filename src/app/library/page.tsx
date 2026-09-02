'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePlayerStore } from '@/store/usePlaystore';
import { Track, Album, Playlist } from '@/types/rokola';
import { 
  Music, 
  Disc3, 
  ListMusic, 
  Play, 
  Pause, 
  Search, 
  Plus, 
  Grid, 
  List as ListIcon, 
  Clock, 
  Trash2, 
  Edit2, 
  Loader2, 
  X, 
  Check,
  Heart,
  Radio as RadioIcon,
  Globe,
  UploadCloud
} from 'lucide-react';

interface RadioStation {
  id: string;
  name: string;
  genre: string;
  streamUrl: string;
  logoUrl?: string;
}

const DEFAULT_COVERS = [
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop',
];

const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'p1',
    name: 'Favoritos de la Semana',
    description: 'Tus temas más escuchados compilados automáticamente.',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
    tracks: [],
  },
  {
    id: 'p2',
    name: 'Para Concentrarse',
    description: 'Música instrumental y ambient para trabajar.',
    coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=400&fit=crop',
    tracks: [],
  },
];

const INITIAL_ALBUMS: Album[] = [
  {
    id: 'a1',
    title: 'Acoustic Memories',
    artist: 'Benjamin Tissot',
    year: '2024',
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&h=400&fit=crop',
    tracks: [],
  },
  {
    id: 'a2',
    title: 'Summer Nights',
    artist: 'Various Artists',
    year: '2023',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop',
    tracks: [],
  },
];

export default function LibraryPage() {
  const [filter, setFilter] = useState<'favorites' | 'all' | 'songs' | 'albums' | 'playlists'>('favorites');
  const [favSubTab, setFavSubTab] = useState<'local' | 'explore' | 'radio'>('local');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Datos
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>(INITIAL_ALBUMS);
  const [playlists, setPlaylists] = useState<Playlist[]>(INITIAL_PLAYLISTS);

  // Favoritas (3 Fuentes)
  const [favLocalTrackIds, setFavLocalTrackIds] = useState<string[]>([]);
  const [favExploreTracks, setFavExploreTracks] = useState<Track[]>([]);
  const [favRadioStations, setFavRadioStations] = useState<RadioStation[]>([]);

  const [loading, setLoading] = useState(true);
  const [deletingTrackId, setDeletingTrackId] = useState<string | null>(null);

  // Estado del Modal de Playlist (Crear / Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDesc, setPlaylistDesc] = useState('');
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);

  const { currentTrack, isPlaying, setTrack, setQueue, togglePlay } = usePlayerStore();

  useEffect(() => {
    async function loadLibraryData() {
      try {
        // 1. Cargar Canciones desde la API
        const res = await fetch('/api/tracks');
        if (res.ok) {
          const data: Track[] = await res.json();
          if (Array.isArray(data)) setTracks(data);
        }

        // 2. Cargar Álbumes personalizados de localStorage
        const savedAlbums = localStorage.getItem('rokola_custom_albums');
        if (savedAlbums) {
          try {
            const parsedAlbums = JSON.parse(savedAlbums);
            if (Array.isArray(parsedAlbums) && parsedAlbums.length > 0) {
              setAlbums(parsedAlbums);
            }
          } catch (e) {
            console.error('Error cargando álbumes locales:', e);
          }
        }

        // 3. Cargar Playlists de localStorage
        const savedPlaylists = localStorage.getItem('rokola_custom_playlists');
        if (savedPlaylists) {
          try {
            const parsedPlaylists = JSON.parse(savedPlaylists);
            if (Array.isArray(parsedPlaylists) && parsedPlaylists.length > 0) {
              setPlaylists(parsedPlaylists);
            }
          } catch (e) {
            console.error('Error cargando playlists locales:', e);
          }
        }

        // 4. Favoritas Locales (IDs)
        const savedFavLocal = localStorage.getItem('rokola_favs_local_ids');
        if (savedFavLocal) setFavLocalTrackIds(JSON.parse(savedFavLocal));

        // 5. Favoritas de Explorar (Objetos Track)
        const savedFavExplore = localStorage.getItem('rokola_favs_explore');
        if (savedFavExplore) setFavExploreTracks(JSON.parse(savedFavExplore));

        // 6. Favoritas de Radio
        const savedFavRadio = localStorage.getItem('rokola_favs_radio');
        if (savedFavRadio) {
          setFavRadioStations(JSON.parse(savedFavRadio));
        } else {
          const defaultRadios: RadioStation[] = [
            {
              id: 'rad-1',
              name: 'Ibiza Global Radio',
              genre: 'Electrónica / Chill',
              streamUrl: 'https://live.ibizaglobalradio.com/ibizaglobalradio.mp3',
              logoUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&h=200&fit=crop',
            },
            {
              id: 'rad-2',
              name: 'Smooth Jazz 24/7',
              genre: 'Jazz & Soul',
              streamUrl: 'https://streaming.exclusive.radio/er/smoothjazz/icecast.audio',
              logoUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=200&h=200&fit=crop',
            },
          ];
          setFavRadioStations(defaultRadios);
          localStorage.setItem('rokola_favs_radio', JSON.stringify(defaultRadios));
        }
      } catch (err) {
        console.error('Error cargando biblioteca:', err);
      } finally {
        setLoading(false);
      }
    }

    loadLibraryData();
  }, []);

  // Alternar favorito de música subida local
  const toggleFavLocal = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    let updated: string[];
    if (favLocalTrackIds.includes(trackId)) {
      updated = favLocalTrackIds.filter((id) => id !== trackId);
    } else {
      updated = [...favLocalTrackIds, trackId];
    }
    setFavLocalTrackIds(updated);
    localStorage.setItem('rokola_favs_local_ids', JSON.stringify(updated));
  };

  // Quitar favorito de Explorar
  const removeFavExplore = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    const updated = favExploreTracks.filter((t) => t.id !== trackId);
    setFavExploreTracks(updated);
    localStorage.setItem('rokola_favs_explore', JSON.stringify(updated));
  };

  // Quitar estación de Radio
  const removeFavRadio = (e: React.MouseEvent, radioId: string) => {
    e.stopPropagation();
    const updated = favRadioStations.filter((r) => r.id !== radioId);
    setFavRadioStations(updated);
    localStorage.setItem('rokola_favs_radio', JSON.stringify(updated));
  };

  // Reproducir estación de radio en vivo
  const handlePlayRadio = (station: RadioStation) => {
    const radioTrack: Track = {
      id: `radio-${station.id}`,
      title: station.name,
      artist: 'Transmisión en Vivo',
      album: station.genre,
      duration: 0,
      audioUrl: station.streamUrl,
      coverUrl: station.logoUrl || DEFAULT_COVERS[0],
    };
    setTrack(radioTrack);
  };

  // Eliminar canción del servidor
  const handleDeleteTrack = async (e: React.MouseEvent, trackId: string, trackTitle: string) => {
    e.stopPropagation();
    const confirmed = window.confirm(`¿Seguro que deseas eliminar "${trackTitle}" del servidor?`);
    if (!confirmed) return;

    try {
      setDeletingTrackId(trackId);
      const res = await fetch(`/api/tracks/${trackId}`, { method: 'DELETE' });
      if (res.ok) {
        setTracks((prev) => prev.filter((t) => t.id !== trackId));
        // Si estaba en favoritos locales, se quita también
        setFavLocalTrackIds((prev) => {
          const updated = prev.filter((id) => id !== trackId);
          localStorage.setItem('rokola_favs_local_ids', JSON.stringify(updated));
          return updated;
        });
      } else {
        alert('No se pudo eliminar la canción del servidor.');
      }
    } catch (err) {
      console.error('Error borrando canción:', err);
      alert('Ocurrió un error al intentar borrar.');
    } finally {
      setDeletingTrackId(null);
    }
  };

  // Modal Crear/Editar Playlist
  const openCreatePlaylistModal = () => {
    setEditingPlaylistId(null);
    setPlaylistName('');
    setPlaylistDesc('');
    setSelectedTrackIds([]);
    setIsModalOpen(true);
  };

  const openEditPlaylistModal = (pl: Playlist, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingPlaylistId(pl.id);
    setPlaylistName(pl.name);
    setPlaylistDesc(pl.description || '');
    setSelectedTrackIds(pl.tracks ? pl.tracks.map((t) => t.id) : []);
    setIsModalOpen(true);
  };

  const handleDeletePlaylist = (playlistId: string, name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const confirmed = window.confirm(`¿Seguro que deseas eliminar la playlist "${name}"?`);
    if (!confirmed) return;

    const updated = playlists.filter((p) => p.id !== playlistId);
    setPlaylists(updated);
    localStorage.setItem('rokola_custom_playlists', JSON.stringify(updated));
  };

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTrackIds((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    );
  };

  const handleSavePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistName.trim()) return;

    const assignedTracks = tracks.filter((t) => selectedTrackIds.includes(t.id));
    const randomCover = DEFAULT_COVERS[Math.floor(Math.random() * DEFAULT_COVERS.length)];

    let updated: Playlist[];

    if (editingPlaylistId) {
      updated = playlists.map((pl) => {
        if (pl.id === editingPlaylistId) {
          return {
            ...pl,
            name: playlistName.trim(),
            description: playlistDesc.trim(),
            tracks: assignedTracks,
            coverUrl: assignedTracks[0]?.coverUrl || pl.coverUrl || randomCover,
          };
        }
        return pl;
      });
    } else {
      const newPl: Playlist = {
        id: `pl-${Date.now()}`,
        name: playlistName.trim(),
        description: playlistDesc.trim() || 'Lista creada por el usuario',
        coverUrl: assignedTracks[0]?.coverUrl || randomCover,
        tracks: assignedTracks,
      };
      updated = [newPl, ...playlists];
    }

    setPlaylists(updated);
    localStorage.setItem('rokola_custom_playlists', JSON.stringify(updated));
    setIsModalOpen(false);
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

  // Filtros de búsqueda reactivos
  const filteredTracks = tracks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const favoriteLocalTracks = filteredTracks.filter((t) => favLocalTrackIds.includes(t.id));

  const filteredExploreFavs = favExploreTracks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRadios = favRadioStations.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAlbums = albums.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPlaylists = playlists.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 pb-28">
      {/* 1. Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Tu Biblioteca
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Gestiona tus canciones favoritas, música subida, álbumes y playlists
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/upload"
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold text-xs px-4 py-2.5 rounded-full transition shadow-sm cursor-pointer"
          >
            <UploadCloud size={16} />
            <span>Subir Canción</span>
          </Link>
          <button
            onClick={openCreatePlaylistModal}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold text-xs px-4 py-2.5 rounded-full transition transform hover:scale-105 active:scale-95 shadow-md cursor-pointer"
          >
            <Plus size={16} />
            <span>Nueva Playlist</span>
          </button>
        </div>
      </div>

      {/* 2. Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-2 border-b border-zinc-900">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setFilter('favorites')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              filter === 'favorites' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Heart size={13} fill={filter === 'favorites' ? 'black' : 'none'} />
            <span>Favoritas</span>
          </button>

          {(['all', 'songs', 'albums', 'playlists'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filter === tab
                  ? 'bg-white text-black'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {tab === 'all' ? 'Todo' : tab === 'songs' ? `Canciones (${tracks.length})` : tab === 'albums' ? `Álbumes (${albums.length})` : `Playlists (${playlists.length})`}
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
              placeholder="Buscar en tu biblioteca..."
              className="w-full bg-zinc-900/90 text-xs text-white placeholder-zinc-500 rounded-full pl-9 pr-3 py-2 border border-zinc-800 focus:border-green-500 focus:outline-none transition shadow-sm"
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

      {/* 3. SECCIÓN FAVORITAS CON SUS 3 SUB-PESTAÑAS */}
      {filter === 'favorites' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 p-1 bg-zinc-900/90 border border-zinc-800 rounded-xl w-fit">
            <button
              onClick={() => setFavSubTab('local')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                favSubTab === 'local' ? 'bg-zinc-800 text-green-400 shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <UploadCloud size={14} />
              <span>Música Subida ({favoriteLocalTracks.length})</span>
            </button>
            <button
              onClick={() => setFavSubTab('explore')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                favSubTab === 'explore' ? 'bg-zinc-800 text-green-400 shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Globe size={14} />
              <span>Música de Explorar ({filteredExploreFavs.length})</span>
            </button>
            <button
              onClick={() => setFavSubTab('radio')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                favSubTab === 'radio' ? 'bg-zinc-800 text-green-400 shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <RadioIcon size={14} />
              <span>Radios Favoritas ({filteredRadios.length})</span>
            </button>
          </div>

          {/* Favoritas: Local */}
          {favSubTab === 'local' && (
            <div className="space-y-4">
              {favoriteLocalTracks.length === 0 ? (
                <div className="p-8 border border-dashed border-zinc-800 rounded-2xl text-center text-zinc-500 text-xs">
                  No has marcado canciones locales como favoritas. Pulsa el corazón en la pestaña &quot;Canciones&quot; para añadirlas aquí.
                </div>
              ) : viewMode === 'list' ? (
                <div className="space-y-1">
                  {favoriteLocalTracks.map((track, idx) => {
                    const isThisPlaying = currentTrack?.id === track.id && isPlaying;
                    return (
                      <div
                        key={track.id}
                        onClick={() => setQueue(favoriteLocalTracks, idx)}
                        className="grid grid-cols-12 items-center px-4 py-3 rounded-lg hover:bg-zinc-900/60 cursor-pointer group transition text-sm"
                      >
                        <span className="col-span-1 text-zinc-500 font-medium text-xs">{idx + 1}</span>
                        <div className="col-span-8 flex items-center gap-3 min-w-0">
                          <img src={track.coverUrl} alt={track.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                          <div className="truncate">
                            <p className={`font-semibold truncate ${isThisPlaying ? 'text-green-400' : 'text-white'}`}>
                              {track.title}
                            </p>
                            <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                          </div>
                        </div>
                        <div className="col-span-3 flex items-center justify-end gap-3">
                          <span className="text-xs text-zinc-400">{formatDuration(track.duration)}</span>
                          <button
                            onClick={(e) => toggleFavLocal(e, track.id)}
                            className="text-red-500 hover:text-zinc-500 transition p-1 cursor-pointer"
                            title="Quitar de favoritas"
                          >
                            <Heart size={16} fill="currentColor" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {favoriteLocalTracks.map((track, idx) => {
                    const isThisPlaying = currentTrack?.id === track.id && isPlaying;
                    return (
                      <div
                        key={track.id}
                        onClick={() => setQueue(favoriteLocalTracks, idx)}
                        className="bg-zinc-900/40 hover:bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800/60 hover:border-zinc-700 transition cursor-pointer group flex flex-col justify-between shadow-sm relative"
                      >
                        <div className="aspect-square mb-3 overflow-hidden rounded-lg relative bg-zinc-950">
                          <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                          <button
                            onClick={(e) => toggleFavLocal(e, track.id)}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-red-500 transition"
                            title="Quitar de favoritas"
                          >
                            <Heart size={14} fill="currentColor" />
                          </button>
                        </div>
                        <div className="truncate">
                          <h4 className={`font-semibold text-xs truncate ${isThisPlaying ? 'text-green-400' : 'text-white'}`}>{track.title}</h4>
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5">{track.artist}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Favoritas: Explorar */}
          {favSubTab === 'explore' && (
            <div className="space-y-4">
              {filteredExploreFavs.length === 0 ? (
                <div className="p-8 border border-dashed border-zinc-800 rounded-2xl text-center text-zinc-500 text-xs">
                  No has guardado canciones desde Explorar. Busca temas en el catálogo y pulsa el corazón para añadirlos aquí.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredExploreFavs.map((track, idx) => {
                    const isThisPlaying = currentTrack?.id === track.id && isPlaying;
                    return (
                      <div
                        key={track.id}
                        onClick={() => setQueue(filteredExploreFavs, idx)}
                        className="grid grid-cols-12 items-center px-4 py-3 rounded-lg hover:bg-zinc-900/60 cursor-pointer group transition text-sm"
                      >
                        <span className="col-span-1 text-zinc-500 font-medium text-xs">{idx + 1}</span>
                        <div className="col-span-8 flex items-center gap-3 min-w-0">
                          <img src={track.coverUrl} alt={track.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                          <div className="truncate">
                            <p className={`font-semibold truncate ${isThisPlaying ? 'text-green-400' : 'text-white'}`}>
                              {track.title}
                            </p>
                            <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                          </div>
                        </div>
                        <div className="col-span-3 flex items-center justify-end gap-3">
                          <span className="text-xs text-zinc-400">{formatDuration(track.duration)}</span>
                          <button
                            onClick={(e) => removeFavExplore(e, track.id)}
                            className="text-red-500 hover:text-zinc-500 transition p-1 cursor-pointer"
                            title="Quitar de favoritas"
                          >
                            <Heart size={16} fill="currentColor" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Favoritas: Radio */}
          {favSubTab === 'radio' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredRadios.length === 0 ? (
                <div className="col-span-full p-8 border border-dashed border-zinc-800 rounded-2xl text-center text-zinc-500 text-xs">
                  No tienes emisoras de radio guardadas como favoritas.
                </div>
              ) : (
                filteredRadios.map((station) => (
                  <div
                    key={station.id}
                    onClick={() => handlePlayRadio(station)}
                    className="p-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 transition flex items-center justify-between group cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 flex-shrink-0">
                        <RadioIcon size={22} />
                      </div>
                      <div className="truncate">
                        <h4 className="text-sm font-semibold text-white truncate group-hover:text-green-400 transition">
                          {station.name}
                        </h4>
                        <p className="text-xs text-zinc-400 truncate">{station.genre}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => removeFavRadio(e, station.id)}
                        className="p-2 text-red-500 hover:text-zinc-400 transition cursor-pointer"
                        title="Quitar radio favorita"
                      >
                        <Heart size={16} fill="currentColor" />
                      </button>
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black shadow-md">
                        <Play size={14} fill="black" className="ml-0.5" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Banner Reproductor de Mis Canciones Subidas */}
      {tracks.length > 0 && (filter === 'all' || filter === 'songs') && (
        <section>
          <div
            onClick={handlePlayAll}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-zinc-900 to-zinc-950 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl cursor-pointer group border border-emerald-500/30 hover:border-emerald-500/60 transition"
          >
            <div className="space-y-2 z-10">
              <div className="flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-wider">
                <Disc3 size={18} className="animate-spin" />
                <span>Colección Activa</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">Mis Canciones Almacenadas</h2>
              <p className="text-zinc-300 text-sm">
                {tracks.length} canciones listas para reproducir en secuencia
              </p>
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

      {/* 5. Contenido General */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-500">
          <Loader2 size={32} className="animate-spin text-green-500" />
          <p className="text-xs">Cargando biblioteca...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* SECCIÓN A: CANCIONES */}
          {(filter === 'all' || filter === 'songs') && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Music className="text-green-400" size={20} />
                <span>Canciones ({filteredTracks.length})</span>
              </h2>

              {filteredTracks.length === 0 ? (
                <p className="text-zinc-500 text-xs py-4">No se encontraron canciones.</p>
              ) : viewMode === 'list' ? (
                <div className="space-y-1">
                  <div className="grid grid-cols-12 text-xs uppercase font-semibold text-zinc-500 px-4 py-2 border-b border-zinc-900">
                    <span className="col-span-1">#</span>
                    <span className="col-span-6 md:col-span-7">Título</span>
                    <span className="col-span-3 md:col-span-2 text-right">Duración</span>
                    <span className="col-span-2 text-right">Acciones</span>
                  </div>

                  {filteredTracks.map((track, index) => {
                    const isThisPlaying = currentTrack?.id === track.id && isPlaying;
                    const isDeleting = deletingTrackId === track.id;
                    const isFav = favLocalTrackIds.includes(track.id);

                    return (
                      <div
                        key={track.id}
                        onClick={() => setQueue(filteredTracks, index)}
                        className="grid grid-cols-12 items-center px-4 py-3 rounded-lg hover:bg-zinc-900/60 cursor-pointer group transition text-sm"
                      >
                        <span className={`col-span-1 font-medium ${isThisPlaying ? 'text-green-400' : 'text-zinc-500'}`}>
                          {index + 1}
                        </span>

                        <div className="col-span-6 md:col-span-7 flex items-center gap-3 min-w-0">
                          <img
                            src={track.coverUrl || DEFAULT_COVERS[0]}
                            alt={track.title}
                            className="w-10 h-10 rounded object-cover flex-shrink-0 bg-zinc-900"
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_COVERS[0];
                            }}
                          />
                          <div className="truncate">
                            <p className={`font-semibold truncate ${isThisPlaying ? 'text-green-400' : 'text-white'}`}>
                              {track.title}
                            </p>
                            <p className="text-xs text-zinc-400 truncate mt-0.5">{track.artist}</p>
                          </div>
                        </div>

                        <span className="col-span-3 md:col-span-2 text-right text-zinc-400 text-xs font-medium">
                          {formatDuration(track.duration)}
                        </span>

                        <div className="col-span-2 flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => toggleFavLocal(e, track.id)}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              isFav ? 'text-red-500' : 'text-zinc-500 hover:text-white'
                            }`}
                            title={isFav ? 'Quitar de favoritas' : 'Añadir a favoritas'}
                          >
                            <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteTrack(e, track.id, track.title)}
                            disabled={isDeleting}
                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer disabled:opacity-50"
                            title="Eliminar del servidor"
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
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredTracks.map((track, index) => {
                    const isThisPlaying = currentTrack?.id === track.id && isPlaying;
                    const isDeleting = deletingTrackId === track.id;
                    const isFav = favLocalTrackIds.includes(track.id);

                    return (
                      <div
                        key={track.id}
                        onClick={() => setQueue(filteredTracks, index)}
                        className="bg-zinc-900/40 hover:bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800/60 hover:border-zinc-700 transition cursor-pointer group flex flex-col justify-between shadow-sm relative"
                      >
                        <div className="aspect-square mb-3 overflow-hidden rounded-lg relative bg-zinc-950">
                          <img
                            src={track.coverUrl || DEFAULT_COVERS[0]}
                            alt={track.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_COVERS[0];
                            }}
                          />
                          <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition transform translate-y-2 group-hover:translate-y-0 shadow-lg">
                            {isThisPlaying ? <Pause size={14} fill="black" /> : <Play size={14} fill="black" className="ml-0.5" />}
                          </div>

                          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button
                              onClick={(e) => toggleFavLocal(e, track.id)}
                              className={`p-1.5 bg-black/60 backdrop-blur-md rounded-lg transition ${
                                isFav ? 'text-red-500' : 'text-zinc-400 hover:text-white'
                              }`}
                              title={isFav ? 'Quitar de favoritas' : 'Añadir a favoritas'}
                            >
                              <Heart size={13} fill={isFav ? 'currentColor' : 'none'} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteTrack(e, track.id, track.title)}
                              disabled={isDeleting}
                              className="p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-zinc-400 hover:text-red-400 transition"
                              title="Eliminar canción"
                            >
                              {isDeleting ? <Loader2 size={13} className="animate-spin text-red-400" /> : <Trash2 size={13} />}
                            </button>
                          </div>
                        </div>

                        <div className="truncate">
                          <h4 className={`font-semibold text-xs truncate ${isThisPlaying ? 'text-green-400' : 'text-white'}`}>
                            {track.title}
                          </h4>
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5">{track.artist}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SECCIÓN B: PLAYLISTS */}
          {(filter === 'all' || filter === 'playlists') && (
            <div className="space-y-4 pt-4 border-t border-zinc-900">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ListMusic className="text-green-400" size={20} />
                  <span>Playlists ({filteredPlaylists.length})</span>
                </h2>
                <button
                  onClick={openCreatePlaylistModal}
                  className="text-xs text-green-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Crear nueva</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {filteredPlaylists.map((pl) => {
                  const isPlPlaying =
                    pl.tracks &&
                    pl.tracks.length > 0 &&
                    pl.tracks.some((t) => t.id === currentTrack?.id) &&
                    isPlaying;

                  return (
                    <Link
                      key={pl.id}
                      href={`/playlist/${pl.id}`}
                      className="bg-zinc-900/40 hover:bg-zinc-900/80 p-4 rounded-xl border border-zinc-800/60 hover:border-zinc-700 transition cursor-pointer group flex flex-col justify-between shadow-sm relative"
                    >
                      <div className="aspect-square mb-3.5 overflow-hidden rounded-lg relative bg-zinc-950">
                        <img
                          src={pl.coverUrl || DEFAULT_COVERS[0]}
                          alt={pl.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />

                        {pl.tracks && pl.tracks.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (isPlPlaying) {
                                togglePlay();
                              } else {
                                setQueue(pl.tracks, 0);
                              }
                            }}
                            className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-green-500 text-black flex items-center justify-center shadow-lg transition transform cursor-pointer ${
                              isPlPlaying
                                ? 'opacity-100 scale-100'
                                : 'opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
                            }`}
                          >
                            {isPlPlaying ? <Pause size={16} fill="black" /> : <Play size={16} fill="black" className="ml-0.5" />}
                          </button>
                        )}

                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={(e) => openEditPlaylistModal(pl, e)}
                            className="p-1.5 bg-black/70 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg backdrop-blur-sm transition cursor-pointer"
                            title="Editar Playlist"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={(e) => handleDeletePlaylist(pl.id, pl.name, e)}
                            className="p-1.5 bg-black/70 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 rounded-lg backdrop-blur-sm transition cursor-pointer"
                            title="Eliminar Playlist"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-sm text-white truncate group-hover:text-green-400 transition">
                          {pl.name}
                        </h3>
                        <p className="text-xs text-zinc-400 truncate mt-0.5">
                          {pl.tracks?.length || 0} {pl.tracks?.length === 1 ? 'canción' : 'canciones'}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECCIÓN C: ÁLBUMES */}
          {(filter === 'all' || filter === 'albums') && (
            <div className="space-y-4 pt-4 border-t border-zinc-900">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Disc3 className="text-purple-400" size={20} />
                  <span>Álbumes ({filteredAlbums.length})</span>
                </h2>
                <Link href="/albums" className="text-xs text-green-400 hover:underline">
                  Ver todos los álbumes →
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {filteredAlbums.map((album) => (
                  <Link
                    key={album.id}
                    href={`/album/${album.id}`}
                    className="bg-zinc-900/40 hover:bg-zinc-900/80 p-4 rounded-xl border border-zinc-800/60 hover:border-zinc-700 transition cursor-pointer group flex flex-col justify-between shadow-sm"
                  >
                    <div className="aspect-square mb-3 overflow-hidden rounded-lg relative bg-zinc-950">
                      <img
                        src={album.coverUrl}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_COVERS[0];
                        }}
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
            </div>
          )}
        </div>
      )}

      {/* 6. Modal Crear / Editar Playlist */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 flex-shrink-0">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ListMusic className="text-green-400" size={20} />
                <span>{editingPlaylistId ? 'Editar Playlist' : 'Nueva Playlist'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePlaylist} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Nombre de la Playlist *</label>
                <input
                  type="text"
                  required
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  placeholder="Ej: Mix favorito 2026..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={playlistDesc}
                  onChange={(e) => setPlaylistDesc(e.target.value)}
                  placeholder="Añade una descripción sobre esta colección..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 resize-none transition"
                />
              </div>

              {/* Selector de Canciones */}
              <div className="space-y-2 pt-2 border-t border-zinc-900">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Music size={14} className="text-green-400" />
                    <span>Seleccionar Canciones ({selectedTrackIds.length})</span>
                  </label>
                  {tracks.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedTrackIds(
                          selectedTrackIds.length === tracks.length ? [] : tracks.map((t) => t.id)
                        )
                      }
                      className="text-[11px] text-zinc-400 hover:text-green-400 transition cursor-pointer"
                    >
                      {selectedTrackIds.length === tracks.length ? 'Deseleccionar todas' : 'Marcar todas'}
                    </button>
                  )}
                </div>

                <div className="max-h-44 overflow-y-auto space-y-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-2">
                  {tracks.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-4">No hay canciones disponibles en tu biblioteca.</p>
                  ) : (
                    tracks.map((track) => {
                      const isSelected = selectedTrackIds.includes(track.id);
                      return (
                        <div
                          key={track.id}
                          onClick={() => toggleTrackSelection(track.id)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-xs ${
                            isSelected
                              ? 'bg-green-500/15 border border-green-500/30 text-white'
                              : 'hover:bg-zinc-800/60 border border-transparent text-zinc-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <img
                              src={track.coverUrl || DEFAULT_COVERS[0]}
                              alt={track.title}
                              className="w-7 h-7 rounded object-cover flex-shrink-0"
                            />
                            <div className="truncate">
                              <p className="font-medium truncate">{track.title}</p>
                              <p className="text-[10px] text-zinc-400 truncate">{track.artist}</p>
                            </div>
                          </div>

                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition ${
                              isSelected ? 'bg-green-500 border-green-500 text-black' : 'border-zinc-700 bg-zinc-950'
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-900 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-green-500 hover:bg-green-400 text-black transition shadow-md cursor-pointer"
                >
                  {editingPlaylistId ? 'Guardar Cambios' : 'Crear Playlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}