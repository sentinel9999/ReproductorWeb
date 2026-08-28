'use client';

import { usePlayerStore } from '@/store/usePlaystore';
import { Track } from '@/types/rokola';
import { 
  Play, 
  Pause, 
  Disc, 
  Radio, 
  Cpu, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Terminal, 
  Layers,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

const HERO_NODE: Track = {
  id: 'hero-1',
  title: 'Cyberpulse Horizon [2099]',
  artist: 'Kavinsky Protocol',
  duration: 180,
  coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&h=400&fit=crop',
  audioUrl: 'https://www.bensound.com/bensound-music/bensound-energy.mp3',
};

const LIVE_NODES: Track[] = [
  {
    id: '1',
    title: 'Acoustic Subroutine',
    artist: 'Benjamin Tissot',
    duration: 100,
    coverUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=300&fit=crop',
    audioUrl: 'https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3',
  },
  {
    id: '2',
    title: 'Solar Beats Matrix',
    artist: 'Bensound Audio Core',
    duration: 140,
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&h=300&fit=crop',
    audioUrl: 'https://www.bensound.com/bensound-music/bensound-sunny.mp3',
  },
  {
    id: '3',
    title: 'Voltage Surge Overdrive',
    artist: 'Electronic Waves AI',
    duration: 179,
    coverUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&h=300&fit=crop',
    audioUrl: 'https://www.bensound.com/bensound-music/bensound-energy.mp3',
  },
  {
    id: '4',
    title: 'Cryo Sleep Ambient',
    artist: 'Chillout Lab Unit 04',
    duration: 205,
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=300&fit=crop',
    audioUrl: 'https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3',
  },
];

const ARCHIVES = [
  {
    id: 'a1',
    title: 'Neural Synthetics Vol. 1',
    artist: 'AI Core v4.2',
    sector: 'SEC-01',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
  },
  {
    id: 'a2',
    title: 'Deep Quantum Oscillations',
    artist: 'Void Array',
    sector: 'SEC-09',
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&h=300&fit=crop',
  },
  {
    id: 'a3',
    title: 'Neon Drift Cyberpunk',
    artist: 'Synth Grid 2088',
    sector: 'SEC-14',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&h=300&fit=crop',
  },
];

export default function TechHome() {
  const { currentTrack, isPlaying, setTrack, setQueue, togglePlay } = usePlayerStore();

  const handleHeroPlay = () => {
    if (currentTrack?.id === HERO_NODE.id) {
      togglePlay();
    } else {
      setTrack(HERO_NODE);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12 pb-28 font-sans">
      
      {/* 1. HUD Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2.5 px-4 bg-cyan-950/20 border border-cyan-500/20 rounded-lg backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
            ROKOLA_CORE // ESTADO: EN LÍNEA
          </span>
        </div>
        <div className="flex items-center gap-6 text-xs font-mono text-zinc-400">
          <span className="hidden sm:flex items-center gap-1.5">
            <Cpu size={14} className="text-cyan-400" /> DSP 96kHz / 24-bit
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" /> FLAC_LOSSLESS
          </span>
        </div>
      </div>

      {/* 2. Hero Console Card */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-zinc-950 via-slate-900 to-cyan-950 border-2 border-cyan-500/30 p-6 md:p-8 shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col md:flex-row items-center justify-between gap-8 group">
        
        {/* Línea de acento neón lateral */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500"></div>

        <div className="space-y-4 z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 font-mono text-xs tracking-wider rounded uppercase">
              SEÑAL PRIMARIA
            </span>
            <span className="text-xs font-mono text-zinc-400">// BUFFER_READY</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase italic">
            {HERO_NODE.title}
          </h2>

          <p className="text-zinc-300 text-sm font-mono leading-relaxed">
            Transmisión de espectro dinámico. Transductor sintonizado por {HERO_NODE.artist}.
          </p>

          {/* Botón de reproducción High-Tech */}
          <div className="pt-2 flex items-center gap-4">
            <button
              onClick={handleHeroPlay}
              className="flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black font-mono text-sm px-7 py-3.5 rounded-lg transition transform active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer"
            >
              {currentTrack?.id === HERO_NODE.id && isPlaying ? (
                <>
                  <Pause size={18} fill="black" />
                  <span>SUSPENDER_TRANSMISIÓN</span>
                </>
              ) : (
                <>
                  <Play size={18} fill="black" className="ml-0.5" />
                  <span>INICIAR_TRANSMISIÓN</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Visualizador de Carátula con Efecto Scanner */}
        <div className="relative w-full md:w-80 h-52 rounded-lg overflow-hidden border border-cyan-500/40 flex-shrink-0 shadow-2xl">
          <img
            src={HERO_NODE.coverUrl}
            alt={HERO_NODE.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-700 brightness-90 contrast-125"
          />
          {/* Overlay de gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-cyan-500/10 pointer-events-none"></div>
          
          {/* Espectrómetro decorativo abajo a la derecha */}
          <div className="absolute bottom-3 right-3 flex items-end gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded border border-cyan-500/30">
            <div className="w-1 bg-cyan-400 rounded-sm animate-spectrum-1"></div>
            <div className="w-1 bg-cyan-400 rounded-sm animate-spectrum-2"></div>
            <div className="w-1 bg-purple-400 rounded-sm animate-spectrum-3"></div>
            <div className="w-1 bg-pink-400 rounded-sm animate-spectrum-4"></div>
          </div>
        </div>
      </section>

      {/* 3. Módulos de Pistas Activas (Grid Futurista) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="text-cyan-400" size={18} />
            <h3 className="text-base font-mono uppercase tracking-widest text-white font-bold">
              FRECUENCIAS_EN_MEMORIA
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-500">4_NODOS_CARGADOS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LIVE_NODES.map((track, index) => {
            const isThisPlaying = currentTrack?.id === track.id && isPlaying;

            return (
              <div
                key={track.id}
                className={`relative p-4 rounded-lg bg-zinc-950/70 border transition-all duration-200 flex items-center justify-between group overflow-hidden ${
                  isThisPlaying 
                    ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)] bg-cyan-950/20' 
                    : 'border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-14 h-14 rounded overflow-hidden flex-shrink-0 border border-zinc-800">
                    <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                    {isThisPlaying && (
                      <div className="absolute inset-0 bg-cyan-950/60 flex items-center justify-center">
                        <Activity size={18} className="text-cyan-300 animate-pulse" />
                      </div>
                    )}
                  </div>
                  <div className="truncate">
                    <p className={`font-mono text-xs tracking-wider uppercase truncate ${isThisPlaying ? 'text-cyan-400 font-bold' : 'text-white'}`}>
                      {track.title}
                    </p>
                    <p className="text-xs font-mono text-zinc-400 truncate mt-0.5">{track.artist}</p>
                  </div>
                </div>

                <button
                  onClick={() => setQueue(LIVE_NODES, index)}
                  className={`w-10 h-10 rounded flex items-center justify-center border transition transform cursor-pointer ${
                    isThisPlaying 
                      ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]' 
                      : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-cyan-400 hover:text-cyan-400'
                  }`}
                >
                  {isThisPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Archivos de Audio / Bloques de Datos */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="text-purple-400" size={18} />
          <h3 className="text-base font-mono uppercase tracking-widest text-white font-bold">
            BANCOS_DE_MEMORIA_ÁLBUMES
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {ARCHIVES.map((arch) => (
            <Link
              key={arch.id}
              href={`/album/${arch.id}`}
              className="bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-purple-500/50 rounded-lg p-4 transition duration-300 group flex flex-col justify-between"
            >
              <div className="relative aspect-video mb-3 rounded overflow-hidden border border-zinc-800">
                <img src={arch.coverUrl} alt={arch.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm border border-purple-500/30 text-purple-300 font-mono text-[10px] px-2 py-0.5 rounded">
                  {arch.sector}
                </span>
              </div>
              <div>
                <h4 className="font-mono text-sm text-white font-bold truncate group-hover:text-purple-300 transition">
                  {arch.title}
                </h4>
                <p className="text-xs font-mono text-zinc-400 mt-1">{arch.artist}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}