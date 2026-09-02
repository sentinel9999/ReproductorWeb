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
  Loader2, 
  Smartphone, 
  Download, 
  X,
  Radio
} from 'lucide-react';
import Link from 'next/link';

// Configuración de versión de la APK
const LATEST_RELEASE = {
  version: 'v1.0.25',
  fileName: 'Rokola_v1.0.25.apk',
  highlights: [
    'Soporte y persistencia de carátulas en archivos WAV grandes.',
    'Detección automática de portadas físicas incrustadas.',
    'Optimizaciones de estabilidad general al actualizar.',
  ],
};

const POPULAR_ARTISTS: Artist[] = [
  {
    id: 'art-1',
    name: 'Cartel de santa',
    role: 'Rap / Hip hop',
    avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShz_YkgSB_FQDNay--p4nAWqW9io-qQx12Lafrb9FxLhFWCiMgP9sNuoA2&s=10',
  },
  {
    id: 'art-2',
    name: 'Ed Sheeran',
    role: 'Cantante y compositor',
    avatarUrl: 'https://elcomercio.pe/resizer/v2/PAMVDU5FDRFKHLYIVWK7MEOTDI.jpg?auth=588957860dd64989e817b267842a905f74534325a3a06ada819bf3a16655fcbb&width=2400&height=1620&quality=75&smart=true',
  },
  {
    id: 'art-3',
    name: 'Doja Cat',
    role: 'Rapera',
    avatarUrl: 'https://media.ambito.com/p/62db5afb82c92e9791e91aab261b5e70/adjuntos/239/imagenes/039/735/0039735797/doja-cat-3.jpg',
  },
  {
    id: 'art-4',
    name: 'Childish Gambino',
    role: 'Cantautor y actor',
    avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZisUULfcTMqbnVVMkyYzC6dIamWnL_-qFbs3Mpqh7z5It4NrcACtQOik&s=10',
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

  // Estado para la búsqueda en vivo del artista
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [artistTracks, setArtistTracks] = useState<Track[]>([]);
  const [isLoadingArtistTracks, setIsLoadingArtistTracks] = useState(false);

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

  // Consulta en vivo a la API de búsqueda al hacer clic en un artista
  const handleSelectArtist = async (artist: Artist) => {
    setSelectedArtist(artist);
    setIsLoadingArtistTracks(true);
    setArtistTracks([]);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(artist.name)}`);
      if (res.ok) {
        const data = await res.json();
        setArtistTracks(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error consultando temas del artista:', error);
    } finally {
      setIsLoadingArtistTracks(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
            href="/library"
            className="bg-gradient-to-br from-indigo-900/40 to-zinc-900/80 hover:from-indigo-900/60 hover:to-zinc-900 p-5 rounded-2xl border border-indigo-500/20 hover:border-indigo-500/40 transition flex items-center justify-between group shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-md">
                <Heart size={24} fill="currentColor" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition">
                  Tus Favoritas
                </h3>
                <p className="text-xs text-zinc-400">Locales, online y radios</p>
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

          <Link
            href="/albums"
            className="bg-zinc-900/40 hover:bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800/60 hover:border-zinc-700 transition flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md">
                <Disc size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base text-white group-hover:text-purple-400 transition">
                  Álbumes y Colecciones
                </h3>
                <p className="text-xs text-zinc-400">Catálogo discográfico</p>
              </div>
            </div>
            <ChevronRight className="text-zinc-500 group-hover:text-white transition" size={20} />
          </Link>
        </div>
      </section>

      {/* 4. Banner de Descarga APK */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 p-6 md:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-3 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-green-400 text-xs font-semibold uppercase tracking-wider">
              <Smartphone size={16} />
              <span>Lleva la música contigo</span>
            </div>
            <span className="text-zinc-600 text-xs">•</span>
            <span className="px-2.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 font-mono text-xs font-bold tracking-wide">
              {LATEST_RELEASE.version} (Última versión)
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-white">
            Disfruta de Rokola en tu dispositivo Android
          </h2>

          <p className="text-zinc-400 text-sm">
            Descarga nuestra aplicación móvil oficial y reproduce tus canciones favoritas sin interrupciones, con soporte offline y lectura de carátulas mejorada.
          </p>

          <div className="pt-1">
            <p className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Novedades de la versión:
            </p>
            <ul className="space-y-1 text-xs text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                <span>Soporte y lectura de tags ID3 / carátulas en archivos WAV.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                <span>Detección automática de portadas físicas incrustadas.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2 flex-shrink-0 w-full lg:w-auto">
          <a
            href={`/downloads/${LATEST_RELEASE.fileName}`}
            download={LATEST_RELEASE.fileName}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3.5 rounded-full transition transform hover:scale-105 active:scale-95 shadow-lg cursor-pointer text-sm"
          >
            <Download size={18} />
            <span>Descargar APK ({LATEST_RELEASE.version})</span>
          </a>
          <span className="text-[11px] text-zinc-500">
            Actualización acumulativa sobre v1.0.24
          </span>
        </div>
      </section>

      {/* 5. Escuchado Recientemente */}
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

      {/* 6. Artistas Populares (Búsqueda en Tiempo Real al Hacer Clic) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Mic2 className="text-green-400" size={20} />
          <h2 className="text-xl font-bold text-white">Artistas Populares</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {POPULAR_ARTISTS.map((artist) => (
            <div
              key={artist.id}
              onClick={() => handleSelectArtist(artist)}
              className="bg-zinc-900/40 hover:bg-zinc-900/80 p-4 rounded-xl border border-zinc-800/60 hover:border-zinc-700 transition cursor-pointer group flex flex-col items-center text-center shadow-sm relative"
            >
              <div className="w-28 h-28 md:w-36 md:h-36 mb-4 overflow-hidden rounded-full relative shadow-md bg-zinc-950">
                <img
                  src={artist.avatarUrl}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-green-500 text-black flex items-center justify-center shadow-lg">
                    <Play size={18} fill="black" className="ml-0.5" />
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-sm text-white truncate w-full group-hover:text-green-400 transition">
                {artist.name}
              </h3>
              <p className="text-xs text-zinc-400 truncate w-full mt-1">{artist.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Álbumes y Compilaciones */}
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

      {/* MODAL: Resultados en Vivo del Artista vía API */}
      {selectedArtist && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Cabecera del Artista */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4 flex-shrink-0">
              <div className="flex items-center gap-4">
                <img
                  src={selectedArtist.avatarUrl}
                  alt={selectedArtist.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-green-500 shadow-md"
                />
                <div>
                  <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">
                    Artista
                  </span>
                  <h3 className="text-xl font-bold text-white leading-tight">
                    {selectedArtist.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{selectedArtist.role}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedArtist(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Estado de Búsqueda */}
            {isLoadingArtistTracks ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-zinc-400">
                <Loader2 className="animate-spin text-green-500" size={30} />
                <p className="text-xs">Buscando catálogo en vivo de {selectedArtist.name}...</p>
              </div>
            ) : artistTracks.length === 0 ? (
              <div className="py-12 border border-dashed border-zinc-800 rounded-xl text-center text-zinc-500 text-xs">
                No se encontraron temas en línea para este artista en este momento.
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pt-1">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Temas Populares ({artistTracks.length})
                  </h4>
                  <button
                    onClick={() => {
                      setQueue(artistTracks, 0);
                      setSelectedArtist(null);
                    }}
                    className="flex items-center gap-1.5 bg-green-500 hover:bg-green-400 text-black font-semibold text-xs px-4 py-1.5 rounded-full transition transform active:scale-95 cursor-pointer shadow"
                  >
                    <Play size={13} fill="black" className="ml-0.5" />
                    <span>Reproducir Todo</span>
                  </button>
                </div>

                {/* Lista interactiva de canciones obtenidas por la API */}
                <div className="space-y-1 overflow-y-auto pr-1 flex-1">
                  {artistTracks.map((track, idx) => {
                    const isThisPlaying = currentTrack?.id === track.id && isPlaying;

                    return (
                      <div
                        key={track.id}
                        onClick={() => setQueue(artistTracks, idx)}
                        className="grid grid-cols-12 items-center px-3 py-2.5 rounded-xl hover:bg-zinc-900/80 cursor-pointer group transition text-xs"
                      >
                        <span className={`col-span-1 font-medium ${isThisPlaying ? 'text-green-400' : 'text-zinc-500'}`}>
                          {idx + 1}
                        </span>

                        <div className="col-span-8 flex items-center gap-3 min-w-0">
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-zinc-900"
                          />
                          <div className="truncate">
                            <p className={`font-semibold truncate ${isThisPlaying ? 'text-green-400' : 'text-white'}`}>
                              {track.title}
                            </p>
                            <p className="text-[11px] text-zinc-400 truncate">{track.album || track.artist}</p>
                          </div>
                        </div>

                        <div className="col-span-3 flex items-center justify-end gap-2">
                          <span className="text-zinc-500 text-[11px]">{formatDuration(track.duration)}</span>
                          <div className={`w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-black shadow ${
                            isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition'
                          }`}>
                            {isThisPlaying ? <Pause size={12} fill="black" /> : <Play size={12} fill="black" className="ml-0.5" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}