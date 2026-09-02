'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlaystore';
import { Album, Track } from '@/types/rokola';
import { 
  Disc3, 
  Play, 
  Pause, 
  Search, 
  Plus, 
  X, 
  Music, 
  Check, 
  Edit2, 
  Trash2, 
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles
} from 'lucide-react';

// Las 6 portadas genéricas predefinidas
const GENERIC_COVERS = [
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&h=500&fit=crop',
];

const INITIAL_ALBUMS: Album[] = [
  {
    id: 'a1',
    title: 'Acoustic Memories',
    artist: 'Benjamin Tissot',
    year: '2024',
    coverUrl: GENERIC_COVERS[0],
    tracks: [],
  },
  {
    id: 'a2',
    title: 'Summer Nights',
    artist: 'Various Artists',
    year: '2023',
    coverUrl: GENERIC_COVERS[2],
    tracks: [],
  },
  {
    id: 'a3',
    title: 'Neon Nights',
    artist: 'Electronic Waves',
    year: '2024',
    coverUrl: GENERIC_COVERS[3],
    tracks: [],
  },
];

export default function AlbumsPage() {
  const router = useRouter();
  const [albums, setAlbums] = useState<Album[]>(INITIAL_ALBUMS);
  const [availableTracks, setAvailableTracks] = useState<Track[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado del Modal (Crear / Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [year, setYear] = useState('2026');
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);

  // Las 3 opciones de portada
  const [coverType, setCoverType] = useState<'first-track' | 'custom-url' | 'generic'>('first-track');
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [selectedGenericCover, setSelectedGenericCover] = useState(GENERIC_COVERS[0]);

  const { currentTrack, isPlaying, setQueue, togglePlay } = usePlayerStore();

  useEffect(() => {
    const saved = localStorage.getItem('rokola_custom_albums');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAlbums(parsed);
        }
      } catch (err) {
        console.error('Error leyendo álbumes locales:', err);
      }
    }

    async function loadTracks() {
      try {
        const res = await fetch('/api/tracks');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setAvailableTracks(data);
        }
      } catch (err) {
        console.error('Error cargando canciones:', err);
      }
    }

    loadTracks();
  }, []);

  const openCreateModal = () => {
    setEditingAlbumId(null);
    setTitle('');
    setArtist('');
    setYear('2026');
    setCoverType('first-track');
    setCustomCoverUrl('');
    setSelectedGenericCover(GENERIC_COVERS[0]);
    setSelectedTrackIds([]);
    setIsModalOpen(true);
  };

  const openEditModal = (album: Album, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAlbumId(album.id);
    setTitle(album.title);
    setArtist(album.artist);
    setYear(album.year || '2026');
    setCoverType('custom-url');
    setCustomCoverUrl(album.coverUrl);
    setSelectedTrackIds(album.tracks ? album.tracks.map((t) => t.id) : []);
    setIsModalOpen(true);
  };

  const handleDeleteAlbum = (albumId: string, albumTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(`¿Seguro que deseas eliminar el álbum "${albumTitle}"?`);
    if (!confirmed) return;

    const updated = albums.filter((a) => a.id !== albumId);
    setAlbums(updated);
    localStorage.setItem('rokola_custom_albums', JSON.stringify(updated));
  };

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTrackIds((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    );
  };

  // Resolver la carátula según la opción elegida
  const resolveCoverUrl = (assignedTracks: Track[]): string => {
    if (coverType === 'first-track') {
      return assignedTracks[0]?.coverUrl || selectedGenericCover;
    }
    if (coverType === 'custom-url') {
      return customCoverUrl.trim() || selectedGenericCover;
    }
    return selectedGenericCover;
  };

  const handleSaveAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignedTracks = availableTracks.filter((t) => selectedTrackIds.includes(t.id));
    const finalCover = resolveCoverUrl(assignedTracks);

    if (editingAlbumId) {
      const updated = albums.map((alb) => {
        if (alb.id === editingAlbumId) {
          return {
            ...alb,
            title: title.trim(),
            artist: artist.trim() || 'Artista Desconocido',
            year: year.trim() || '2026',
            coverUrl: finalCover,
            tracks: assignedTracks,
          };
        }
        return alb;
      });
      setAlbums(updated);
      localStorage.setItem('rokola_custom_albums', JSON.stringify(updated));
    } else {
      const newAlbum: Album = {
        id: `alb-${Date.now()}`,
        title: title.trim(),
        artist: artist.trim() || 'Artista Desconocido',
        year: year.trim() || '2026',
        coverUrl: finalCover,
        tracks: assignedTracks,
      };
      const updated = [newAlbum, ...albums];
      setAlbums(updated);
      localStorage.setItem('rokola_custom_albums', JSON.stringify(updated));
    }

    setIsModalOpen(false);
  };

  const filteredAlbums = albums.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const firstSelectedTrack = availableTracks.find((t) => selectedTrackIds.includes(t.id));

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 pb-28">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Disc3 className="text-green-400" size={32} />
            <span>Álbumes</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Explora las canciones dentro de cada álbum o crea tus propias colecciones
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold text-sm px-5 py-2.5 rounded-full transition transform hover:scale-105 active:scale-95 shadow-md cursor-pointer"
        >
          <Plus size={18} />
          <span>Crear Álbum</span>
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-zinc-900">
        <div className="relative w-full max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por álbum o artista..."
            className="w-full bg-zinc-900/90 text-xs text-white placeholder-zinc-500 rounded-full pl-9 pr-4 py-2.5 border border-zinc-800 focus:border-green-500 focus:outline-none transition shadow-sm"
          />
        </div>
      </div>

      {/* Cuadrícula de Álbumes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {filteredAlbums.map((album) => {
          const isAlbumPlaying =
            album.tracks &&
            album.tracks.length > 0 &&
            album.tracks.some((t) => t.id === currentTrack?.id) &&
            isPlaying;

          return (
            <div
              key={album.id}
              onClick={() => router.push(`/album/${album.id}`)}
              className="bg-zinc-900/40 hover:bg-zinc-900/80 p-4 rounded-xl border border-zinc-800/60 hover:border-zinc-700 transition flex flex-col justify-between group shadow-sm relative cursor-pointer"
            >
              <div className="aspect-square mb-3.5 rounded-lg overflow-hidden border border-zinc-800/60 relative bg-zinc-950">
                <img
                  src={album.coverUrl}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  onError={(e) => {
                    e.currentTarget.src = GENERIC_COVERS[0];
                  }}
                />

                {album.tracks && album.tracks.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isAlbumPlaying) {
                        togglePlay();
                      } else {
                        setQueue(album.tracks, 0);
                      }
                    }}
                    className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-green-500 text-black flex items-center justify-center shadow-lg transition transform cursor-pointer ${
                      isAlbumPlaying
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
                    }`}
                  >
                    {isAlbumPlaying ? <Pause size={16} fill="black" /> : <Play size={16} fill="black" className="ml-0.5" />}
                  </button>
                )}

                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => openEditModal(album, e)}
                    className="p-1.5 bg-black/70 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg backdrop-blur-sm transition"
                    title="Editar Álbum"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteAlbum(album.id, album.title, e)}
                    className="p-1.5 bg-black/70 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 rounded-lg backdrop-blur-sm transition"
                    title="Eliminar Álbum"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-white truncate group-hover:text-green-400 transition">
                  {album.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5 truncate">
                  {album.artist} • <span className="text-zinc-500">{album.year}</span>
                </p>
                <span className="inline-block mt-2 text-[11px] text-zinc-500 font-medium">
                  {album.tracks?.length || 0} {album.tracks?.length === 1 ? 'canción' : 'canciones'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Crear / Editar Álbum */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 flex-shrink-0">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Disc3 className="text-green-400" size={20} />
                <span>{editingAlbumId ? 'Editar Álbum' : 'Crear Nuevo Álbum'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAlbum} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Nombre del Álbum *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Greatest Hits 2026..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Artista / Banda</label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="Ej: Tiësto, Rokola..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Año</label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2026"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 transition"
                  />
                </div>
              </div>

              {/* SECCIÓN: 3 OPCIONES PARA LA PORTADA */}
              <div className="space-y-2 pt-2 border-t border-zinc-900">
                <label className="block text-xs font-semibold text-zinc-300">
                  Elige la Portada del Álbum
                </label>

                {/* Selector de las 3 opciones */}
                <div className="grid grid-cols-3 gap-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setCoverType('first-track')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                      coverType === 'first-track' ? 'bg-zinc-800 text-green-400 shadow' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <ImageIcon size={13} />
                    <span>1ª Canción</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverType('custom-url')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                      coverType === 'custom-url' ? 'bg-zinc-800 text-green-400 shadow' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <LinkIcon size={13} />
                    <span>Poner URL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverType('generic')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                      coverType === 'generic' ? 'bg-zinc-800 text-green-400 shadow' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Sparkles size={13} />
                    <span>6 Genéricas</span>
                  </button>
                </div>

                {/* Opción 1: Primera canción */}
                {coverType === 'first-track' && (
                  <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex items-center gap-3">
                    {firstSelectedTrack ? (
                      <>
                        <img
                          src={firstSelectedTrack.coverUrl}
                          alt={firstSelectedTrack.title}
                          className="w-12 h-12 rounded-lg object-cover border border-zinc-700"
                        />
                        <div className="truncate">
                          <p className="text-xs font-semibold text-white truncate">{firstSelectedTrack.title}</p>
                          <p className="text-[11px] text-green-400">Esta carátula será la portada del álbum</p>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-zinc-500">
                        Selecciona al menos una canción abajo para usar su portada automáticamente.
                      </p>
                    )}
                  </div>
                )}

                {/* Opción 2: URL personalizada */}
                {coverType === 'custom-url' && (
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={customCoverUrl}
                      onChange={(e) => setCustomCoverUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-green-500 transition"
                    />
                    {customCoverUrl && (
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
                        <img src={customCoverUrl} alt="Vista previa" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )}

                {/* Opción 3: Las 6 portadas genéricas */}
                {coverType === 'generic' && (
                  <div className="grid grid-cols-6 gap-2 pt-1">
                    {GENERIC_COVERS.map((cov, idx) => {
                      const isSelected = selectedGenericCover === cov;
                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedGenericCover(cov)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition transform hover:scale-105 relative ${
                            isSelected ? 'border-green-500 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={cov} alt={`Opción ${idx + 1}`} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                              <Check size={14} className="text-white drop-shadow" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selector de Canciones */}
              <div className="space-y-2 pt-2 border-t border-zinc-900">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Music size={14} className="text-green-400" />
                    <span>Seleccionar Canciones ({selectedTrackIds.length})</span>
                  </label>
                  {availableTracks.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedTrackIds(
                          selectedTrackIds.length === availableTracks.length
                            ? []
                            : availableTracks.map((t) => t.id)
                        )
                      }
                      className="text-[11px] text-zinc-400 hover:text-green-400 transition cursor-pointer"
                    >
                      {selectedTrackIds.length === availableTracks.length ? 'Deseleccionar todas' : 'Marcar todas'}
                    </button>
                  )}
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-2">
                  {availableTracks.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-4">No hay canciones en el catálogo.</p>
                  ) : (
                    availableTracks.map((track) => {
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
                              src={track.coverUrl}
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
                  {editingAlbumId ? 'Guardar Cambios' : 'Crear Álbum'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}