'use client';

import { useState } from 'react';
import { usePlayerStore } from '@/store/usePlaystore';
import { Track } from '@/types/rokola';
import { Radio as RadioIcon, Play, Pause, Signal, Volume2, Globe, Sparkles } from 'lucide-react';

interface RadioStation {
  id: string;
  name: string;
  genre: string;
  frequency: string;
  listeners: string;
  coverUrl: string;
  streamTrack: Track;
}

const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'rad-1',
    name: 'Rokola FM - Éxitos Globales',
    genre: 'Top 40 & Pop',
    frequency: '98.5 FM',
    listeners: '14.2k en vivo',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
    streamTrack: {
      id: 'stream-1',
      title: 'Rokola Hits en Vivo',
      artist: 'Transmisión Oficial',
      duration: 0,
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
      audioUrl: 'https://www.bensound.com/bensound-music/bensound-sunny.mp3',
    },
  },
  {
    id: 'rad-2',
    name: 'Chill & Lo-Fi Lounge',
    genre: 'Lo-Fi / Beats',
    frequency: '102.1 FM',
    listeners: '8.7k en vivo',
    coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=400&fit=crop',
    streamTrack: {
      id: 'stream-2',
      title: 'Beats para Trabajar / Estudiar',
      artist: 'Lo-Fi Station',
      duration: 0,
      coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&h=300&fit=crop',
      audioUrl: 'https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3',
    },
  },
  {
    id: 'rad-3',
    name: 'Synth & Electro Club',
    genre: 'Electrónica / Dance',
    frequency: '105.7 FM',
    listeners: '6.1k en vivo',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    streamTrack: {
      id: 'stream-3',
      title: 'Club Sessions Non-Stop',
      artist: 'Electronic Waves',
      duration: 0,
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      audioUrl: 'https://www.bensound.com/bensound-music/bensound-energy.mp3',
    },
  },
  {
    id: 'rad-4',
    name: 'Acoustic & Coffee Shop',
    genre: 'Acústico / Indie',
    frequency: '92.3 FM',
    listeners: '4.5k en vivo',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    streamTrack: {
      id: 'stream-4',
      title: 'Café Sessions Acústicas',
      artist: 'Benjamin Tissot Radio',
      duration: 0,
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
      audioUrl: 'https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3',
    },
  },
];

export default function RadioPage() {
  const { currentTrack, isPlaying, setTrack, togglePlay } = usePlayerStore();
  const [selectedStation, setSelectedStation] = useState<RadioStation>(RADIO_STATIONS[0]);

  const handleTuneStation = (station: RadioStation) => {
    setSelectedStation(station);
    if (currentTrack?.id === station.streamTrack.id) {
      togglePlay();
    } else {
      setTrack(station.streamTrack);
    }
  };

  const isCurrentStationPlaying =
    currentTrack?.id === selectedStation.streamTrack.id && isPlaying;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 pb-24">
      {/* 1. Encabezado */}
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-green-400 text-sm font-semibold tracking-wide uppercase">
          <Signal size={16} className="animate-pulse" />
          <span>Emisoras en directo</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Radio en Vivo
        </h1>
      </header>

      {/* 2. Dial Destacado / Sintonizador Principal */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-950 border border-emerald-500/30 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-4 max-w-xl z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-semibold rounded-full flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              Al Aire
            </span>
            <span className="text-xs text-zinc-400 font-mono">{selectedStation.frequency}</span>
          </div>

          <div>
            <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight">
              {selectedStation.name}
            </h2>
            <p className="text-zinc-300 text-sm mt-1">
              Género: {selectedStation.genre} • {selectedStation.listeners}
            </p>
          </div>

          <button
            onClick={() => handleTuneStation(selectedStation)}
            className="flex items-center gap-3 bg-green-500 hover:bg-green-400 text-black font-bold px-7 py-3.5 rounded-full transition transform hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
          >
            {isCurrentStationPlaying ? (
              <>
                <Pause size={20} fill="black" />
                <span>Pausar Sintonía</span>
              </>
            ) : (
              <>
                <Play size={20} fill="black" className="ml-0.5" />
                <span>Sintonizar Emisora</span>
              </>
            )}
          </button>
        </div>

        <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden border border-zinc-700 shadow-2xl flex-shrink-0 relative">
          <img
            src={selectedStation.coverUrl}
            alt={selectedStation.name}
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* 3. Parrilla de Estaciones Disponibles */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Globe size={20} className="text-green-400" />
          <span>Diales y Frecuencias Recomendadas</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RADIO_STATIONS.map((station) => {
            const isActive = currentTrack?.id === station.streamTrack.id && isPlaying;
            return (
              <div
                key={station.id}
                onClick={() => handleTuneStation(station)}
                className={`bg-zinc-900/40 hover:bg-zinc-900/80 p-4 rounded-xl border transition cursor-pointer group flex flex-col justify-between shadow-sm ${
                  selectedStation.id === station.id
                    ? 'border-green-500/50 bg-zinc-900/90'
                    : 'border-zinc-800/60 hover:border-zinc-700'
                }`}
              >
                <div className="aspect-square mb-3 overflow-hidden rounded-lg relative">
                  <img
                    src={station.coverUrl}
                    alt={station.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-zinc-300">
                    {station.frequency}
                  </div>
                  <div className="absolute bottom-2 right-2 w-9 h-9 bg-green-500 rounded-full flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition transform translate-y-2 group-hover:translate-y-0 shadow-lg">
                    {isActive ? <Pause size={16} fill="black" /> : <Play size={16} fill="black" className="ml-0.5" />}
                  </div>
                </div>

                <div>
                  <h3 className={`font-semibold text-sm truncate ${isActive ? 'text-green-400' : 'text-white'}`}>
                    {station.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{station.genre}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}