'use client';

import { useState, useEffect } from 'react';
import { usePlayerStore } from '@/store/usePlaystore';
import { Track } from '@/types/rokola';
import { 
  Radio, 
  Play, 
  Pause, 
  Search, 
  Globe, 
  Volume2, 
  Loader2, 
  Sparkles,
  Signal,
  Heart
} from 'lucide-react';

interface RadioStationAPI {
  stationuuid: string;
  name: string;
  url_resolved: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  votes: number;
  clickcount: number;
}

// Estructura sincronizada con la Biblioteca
interface SavedRadioStation {
  id: string;
  name: string;
  genre: string;
  streamUrl: string;
  logoUrl: string;
}

const COUNTRIES = [
  { code: '', label: 'Cualquier País' },
  { code: 'MX', label: 'México' },
  { code: 'ES', label: 'España' },
  { code: 'AR', label: 'Argentina' },
  { code: 'CO', label: 'Colombia' },
  { code: 'US', label: 'Estados Unidos' },
  { code: 'GB', label: 'Reino Unido' },
];

const GENRES = [
  { tag: '', label: 'Todos los estilos' },
  { tag: 'pop', label: 'Pop' },
  { tag: 'rock', label: 'Rock' },
  { tag: 'electronic', label: 'Electrónica' },
  { tag: 'jazz', label: 'Jazz' },
  { tag: 'classical', label: 'Clásica' },
  { tag: 'news', label: 'Noticias / Talk' },
];

export default function RadioPage() {
  const [stations, setStations] = useState<RadioStationAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // Estado de Radios Favoritas sincronizado con localStorage
  const [favStations, setFavStations] = useState<SavedRadioStation[]>([]);

  const { currentTrack, isPlaying, setTrack, togglePlay } = usePlayerStore();

  // Cargar favoritas al montar
  useEffect(() => {
    const saved = localStorage.getItem('rokola_favs_radio');
    if (saved) {
      try {
        setFavStations(JSON.parse(saved));
      } catch (e) {
        console.error('Error cargando radios favoritas:', e);
      }
    }
  }, []);

  const fetchStations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', '30');
      params.append('hidebroken', 'true');
      params.append('order', 'clickcount');
      params.append('reverse', 'true');

      if (searchQuery.trim()) {
        params.append('name', searchQuery.trim());
      }
      if (selectedCountry) {
        params.append('countrycode', selectedCountry);
      }
      if (selectedTag) {
        params.append('tag', selectedTag);
      }

      const res = await fetch(`https://de1.api.radio-browser.info/json/stations/search?${params.toString()}`);
      if (res.ok) {
        const data: RadioStationAPI[] = await res.json();
        setStations(data);
      }
    } catch (error) {
      console.error('Error obteniendo estaciones de Radio Browser:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStations();
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedCountry, selectedTag, searchQuery]);

  // Alternar favorito y persistir para la Biblioteca
  const toggleFavStation = (e: React.MouseEvent, station: RadioStationAPI) => {
    e.stopPropagation();
    const exists = favStations.some((s) => s.id === station.stationuuid);
    let updated: SavedRadioStation[];

    if (exists) {
      updated = favStations.filter((s) => s.id !== station.stationuuid);
    } else {
      const newFav: SavedRadioStation = {
        id: station.stationuuid,
        name: station.name.trim(),
        genre: station.tags ? station.tags.split(',')[0].trim() : station.country || 'Radio en Vivo',
        streamUrl: station.url_resolved,
        logoUrl: station.favicon && station.favicon.startsWith('http')
          ? station.favicon
          : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
      };
      updated = [newFav, ...favStations];
    }

    setFavStations(updated);
    localStorage.setItem('rokola_favs_radio', JSON.stringify(updated));
  };

  const handlePlayStation = (station: RadioStationAPI) => {
    const radioTrack: Track = {
      id: `radio-${station.stationuuid}`,
      title: station.name.trim(),
      artist: station.country ? `${station.country} • Radio en Vivo` : 'Radio en Vivo',
      duration: 0,
      coverUrl: station.favicon && station.favicon.startsWith('http')
        ? station.favicon
        : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
      audioUrl: station.url_resolved,
    };

    if (currentTrack?.id === radioTrack.id) {
      togglePlay();
    } else {
      setTrack(radioTrack);
    }
  };

  const featuredStation = stations[0];
  const isFeaturedPlaying = currentTrack?.id === `radio-${featuredStation?.stationuuid}` && isPlaying;
  const isFeaturedFav = featuredStation && favStations.some((s) => s.id === featuredStation.stationuuid);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 pb-28">
      {/* 1. Encabezado */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-widest">
          <Radio size={16} className="animate-pulse" />
          <span>Radio Browser API Global</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Sintonizador Mundial de Radio
        </h1>
        <p className="text-zinc-400 text-sm">
          Explora y escucha en directo miles de transmisiones online gratuitas de todo el mundo.
        </p>
      </div>

      {/* 2. Banner Estación Destacada */}
      {featuredStation && (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-zinc-950 border border-green-500/30 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-3 z-10 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="px-2.5 py-0.5 bg-green-500/10 border border-green-500/40 text-green-400 text-xs font-semibold rounded-full uppercase tracking-wider">
                Más escuchada hoy
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight truncate">
              {featuredStation.name}
            </h2>

            <p className="text-zinc-300 text-sm">
              {featuredStation.country || 'Internacional'} • Géneros: {featuredStation.tags || 'Varios'}
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => handlePlayStation(featuredStation)}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold text-sm px-6 py-2.5 rounded-full transition transform hover:scale-105 active:scale-95 shadow-lg cursor-pointer"
              >
                {isFeaturedPlaying ? (
                  <>
                    <Pause size={17} fill="black" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play size={17} fill="black" className="ml-0.5" />
                    <span>Sintonizar</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={(e) => toggleFavStation(e, featuredStation)}
                className={`p-2.5 rounded-full transition border cursor-pointer ${
                  isFeaturedFav
                    ? 'bg-red-500/15 border-red-500/40 text-red-500'
                    : 'bg-zinc-800/80 border-zinc-700/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title={isFeaturedFav ? 'Quitar de favoritas' : 'Guardar en favoritas'}
              >
                <Heart size={18} fill={isFeaturedFav ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden shadow-lg border border-zinc-800 bg-zinc-900 flex-shrink-0 flex items-center justify-center p-3">
            <img
              src={featuredStation.favicon && featuredStation.favicon.startsWith('http') ? featuredStation.favicon : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop'}
              alt={featuredStation.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop';
              }}
            />
          </div>
        </section>
      )}

      {/* 3. Filtros: Buscador, Selector de País y Género */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre de emisora..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <Globe size={16} className="text-zinc-400" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:border-green-500 focus:outline-none cursor-pointer"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pestañas de Género */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-900">
          {GENRES.map((g) => (
            <button
              key={g.tag}
              onClick={() => setSelectedTag(g.tag)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedTag === g.tag
                  ? 'bg-white text-black'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Lista de Resultados */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-500">
          <Loader2 size={32} className="animate-spin text-green-500" />
          <p className="text-xs">Conectando con Radio Browser API...</p>
        </div>
      ) : stations.length === 0 ? (
        <div className="p-12 border border-dashed border-zinc-800 rounded-2xl text-center text-zinc-500 text-xs">
          No se encontraron estaciones con los filtros seleccionados. Intenta con otro término o país.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stations.map((station) => {
            const isThisPlaying = currentTrack?.id === `radio-${station.stationuuid}` && isPlaying;
            const isFav = favStations.some((s) => s.id === station.stationuuid);

            return (
              <div
                key={station.stationuuid}
                onClick={() => handlePlayStation(station)}
                className={`p-4 rounded-xl border transition cursor-pointer group flex items-center justify-between gap-3 shadow-sm ${
                  isThisPlaying
                    ? 'border-green-500/60 bg-emerald-950/30'
                    : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800/60 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-zinc-950 border border-zinc-800 flex-shrink-0 flex items-center justify-center p-1.5 overflow-hidden">
                    <img
                      src={station.favicon && station.favicon.startsWith('http') ? station.favicon : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop'}
                      alt={station.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop';
                      }}
                    />
                  </div>

                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <Signal size={12} className={isThisPlaying ? 'text-green-400 animate-pulse' : 'text-zinc-500'} />
                      <h3 className={`font-semibold text-xs truncate ${isThisPlaying ? 'text-green-400' : 'text-white'}`}>
                        {station.name}
                      </h3>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {station.country || 'Global'} {station.tags ? `• ${station.tags.split(',')[0]}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Botón Favoritas */}
                  <button
                    type="button"
                    onClick={(e) => toggleFavStation(e, station)}
                    className={`p-2 rounded-full transition cursor-pointer ${
                      isFav 
                        ? 'text-red-500 hover:text-red-400' 
                        : 'text-zinc-500 hover:text-zinc-200'
                    }`}
                    title={isFav ? 'Quitar de favoritas' : 'Guardar en favoritas'}
                  >
                    <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                  </button>

                  {/* Botón Reproducir */}
                  <button
                    type="button"
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-black flex-shrink-0 shadow transition transform ${
                      isThisPlaying ? 'bg-green-500 scale-100' : 'bg-white group-hover:bg-green-500 group-hover:scale-105'
                    }`}
                    aria-label="Reproducir estación"
                  >
                    {isThisPlaying ? <Pause size={13} fill="black" /> : <Play size={13} fill="black" className="ml-0.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}