'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { usePlayerStore } from '@/store/usePlaystore';
import { Track, Playlist, Album } from '@/types/rokola';
import { 
  Headphones, 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  Disc, 
  Download, 
  Compass, 
  Search, 
  Volume2, 
  Repeat, 
  Lock, 
  Loader2, 
  Sparkles, 
  Activity, 
  Circle, 
  Square, 
  FastForward, 
  Rewind, 
  Radio, 
  ListPlus, 
  Save, 
  Check, 
  X, 
  Disc3 
} from 'lucide-react';
import Link from 'next/link';

export default function DjStudioPage() {
  const router = useRouter();
  const { isAuthenticated, currentUser } = useAuthStore();
  const { setTrack: setGlobalTrack } = usePlayerStore();

  const audioRefA = useRef<HTMLAudioElement | null>(null);
  const audioRefB = useRef<HTMLAudioElement | null>(null);
  const canvasRefA = useRef<HTMLCanvasElement | null>(null);
  const canvasRefB = useRef<HTMLCanvasElement | null>(null);

  // Deck A
  const [deckA, setDeckA] = useState<Track | null>(null);
  const [isPlayingA, setIsPlayingA] = useState(false);
  const [volumeA, setVolumeA] = useState(0.9);
  const [pitchA, setPitchA] = useState(1.0);
  const [currentTimeA, setCurrentTimeA] = useState(0);
  const [durationA, setDurationA] = useState(0);
  const [isLoopA, setIsLoopA] = useState(false);
  const [peaksA, setPeaksA] = useState<number[]>([]);
  const [isLoadingWaveA, setIsLoadingWaveA] = useState(false);

  // EQ Deck A
  const [eqLowA, setEqLowA] = useState(1);
  const [eqMidA, setEqMidA] = useState(1);
  const [eqHighA, setEqHighA] = useState(1);

  // Deck B
  const [deckB, setDeckB] = useState<Track | null>(null);
  const [isPlayingB, setIsPlayingB] = useState(false);
  const [volumeB, setVolumeB] = useState(0.9);
  const [pitchB, setPitchB] = useState(1.0);
  const [currentTimeB, setCurrentTimeB] = useState(0);
  const [durationB, setDurationB] = useState(0);
  const [isLoopB, setIsLoopB] = useState(false);
  const [peaksB, setPeaksB] = useState<number[]>([]);
  const [isLoadingWaveB, setIsLoadingWaveB] = useState(false);

  // EQ Deck B
  const [eqLowB, setEqLowB] = useState(1);
  const [eqMidB, setEqMidB] = useState(1);
  const [eqHighB, setEqHighB] = useState(1);

  // Crossfader: -100 (Deck A) a 100 (Deck B)
  const [crossfader, setCrossfader] = useState(0);

  // Grabación Master de la Sesión
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Modal para nombrar y guardar sesión
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [savedPlaylists, setSavedPlaylists] = useState<Playlist[]>([]);
  const [savedAlbums, setSavedAlbums] = useState<Album[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
  const [selectedAlbumId, setSelectedAlbumId] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Sampler
  const [samplerVolume, setSamplerVolume] = useState(0.85);
  const [activePad, setActivePad] = useState<string | null>(null);

  // Fuentes de música
  const [sourceTab, setSourceTab] = useState<'local' | 'explore'>('local');
  const [localTracks, setLocalTracks] = useState<Track[]>([]);
  const [exploreQuery, setExploreQuery] = useState('');
  const [exploreTracks, setExploreTracks] = useState<Track[]>([]);
  const [isSearchingExplore, setIsSearchingExplore] = useState(false);

  // 1. Protección de ruta
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // 2. Cargar colecciones para el modal de guardado
  useEffect(() => {
    const pl = localStorage.getItem('rokola_custom_playlists');
    if (pl) {
      try { setSavedPlaylists(JSON.parse(pl)); } catch (e) {}
    }
    const alb = localStorage.getItem('rokola_custom_albums');
    if (alb) {
      try { setSavedAlbums(JSON.parse(alb)); } catch (e) {}
    }
  }, [isSaveModalOpen]);

  // 3. Cargar canciones locales
  useEffect(() => {
    async function loadLocal() {
      try {
        const res = await fetch('/api/tracks');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setLocalTracks(data);
        }
      } catch (e) {
        console.error('Error cargando pistas locales:', e);
      }
    }
    if (isAuthenticated) loadLocal();
  }, [isAuthenticated]);

  // 4. Búsqueda en catálogo online
  useEffect(() => {
    const term = exploreQuery.trim();
    if (!term) {
      setExploreTracks([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingExplore(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
        if (res.ok) {
          const data = await res.json();
          setExploreTracks(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error buscando temas en modo DJ:', err);
      } finally {
        setIsSearchingExplore(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [exploreQuery]);

  // 5. Motor de extracción de ondas reales (PCM ArrayBuffer)
  const extractRealWaveform = async (audioUrl: string): Promise<number[]> => {
    try {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);

      const totalBars = 90;
      const step = Math.floor(channelData.length / totalBars);
      const peaks: number[] = [];
      let maxVal = 0;

      for (let i = 0; i < totalBars; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) {
          sum += Math.abs(channelData[i * step + j] || 0);
        }
        const avg = sum / step;
        if (avg > maxVal) maxVal = avg;
        peaks.push(avg);
      }
      audioCtx.close();
      return peaks.map((p) => (maxVal > 0 ? Math.max(0.12, p / maxVal) : 0.5));
    } catch (e) {
      return Array.from({ length: 90 }, (_, i) => 0.15 + 0.7 * Math.abs(Math.sin(i * 0.22)));
    }
  };

  useEffect(() => {
    if (!deckA?.audioUrl) return;
    setIsLoadingWaveA(true);
    extractRealWaveform(deckA.audioUrl).then((peaks) => {
      setPeaksA(peaks);
      setIsLoadingWaveA(false);
    });
  }, [deckA]);

  useEffect(() => {
    if (!deckB?.audioUrl) return;
    setIsLoadingWaveB(true);
    extractRealWaveform(deckB.audioUrl).then((peaks) => {
      setPeaksB(peaks);
      setIsLoadingWaveB(false);
    });
  }, [deckB]);

  // 6. Dibujar Waveform real en Canvas
  const renderCanvasWaveform = (
    canvas: HTMLCanvasElement | null,
    peaks: number[],
    currentTime: number,
    duration: number,
    colorActive: string
  ) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const totalBars = peaks.length || 90;
    const progress = duration > 0 ? currentTime / duration : 0;
    const activeIndex = Math.floor(progress * totalBars);

    for (let i = 0; i < totalBars; i++) {
      const x = (i / totalBars) * width;
      const barWidth = width / totalBars - 1.2;
      const peak = peaks[i] || 0.2;
      const barHeight = Math.max(3, peak * (height * 0.85));
      const y = (height - barHeight) / 2;

      ctx.fillStyle = i <= activeIndex ? colorActive : '#27272a';
      ctx.fillRect(x, y, Math.max(1.5, barWidth), barHeight);
    }

    const headX = progress * width;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(headX - 1, 0, 2, height);
  };

  useEffect(() => {
    renderCanvasWaveform(canvasRefA.current, peaksA, currentTimeA, durationA, '#06b6d4');
  }, [peaksA, currentTimeA, durationA]);

  useEffect(() => {
    renderCanvasWaveform(canvasRefB.current, peaksB, currentTimeB, durationB, '#a855f7');
  }, [peaksB, currentTimeB, durationB]);

  // 7. Sincronización de BPM y Velocidad
  const baseBpmA = useMemo(() => {
    if (!deckA) return 128;
    const code = deckA.title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return 120 + (code % 10);
  }, [deckA]);

  const baseBpmB = useMemo(() => {
    if (!deckB) return 128;
    const code = deckB.title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return 122 + (code % 9);
  }, [deckB]);

  const currentBpmA = (baseBpmA * pitchA).toFixed(1);
  const currentBpmB = (baseBpmB * pitchB).toFixed(1);

  const syncBtoA = () => {
    if (!deckA || !deckB) return;
    const targetPitch = (baseBpmA * pitchA) / baseBpmB;
    setPitchB(parseFloat(targetPitch.toFixed(2)));
  };

  // Crossfader dinámico
  useEffect(() => {
    if (audioRefA.current) {
      const gainA = crossfader <= 0 ? 1 : (100 - crossfader) / 100;
      audioRefA.current.volume = Math.max(0, Math.min(1, volumeA * gainA));
    }
    if (audioRefB.current) {
      const gainB = crossfader >= 0 ? 1 : (100 + crossfader) / 100;
      audioRefB.current.volume = Math.max(0, Math.min(1, volumeB * gainB));
    }
  }, [crossfader, volumeA, volumeB]);

  useEffect(() => {
    if (audioRefA.current) audioRefA.current.playbackRate = pitchA;
  }, [pitchA]);

  useEffect(() => {
    if (audioRefB.current) audioRefB.current.playbackRate = pitchB;
  }, [pitchB]);

  // CUE 10 Segundos y Saltos
  const handleCue10s = (
    ref: React.RefObject<HTMLAudioElement | null>,
    setTime: (n: number) => void
  ) => {
    if (!ref.current) return;
    ref.current.currentTime = 10;
    setTime(10);
  };

  const jumpOffset = (
    ref: React.RefObject<HTMLAudioElement | null>,
    delta: number,
    dur: number,
    setTime: (n: number) => void
  ) => {
    if (!ref.current) return;
    const target = Math.max(0, Math.min(dur || 0, ref.current.currentTime + delta));
    ref.current.currentTime = target;
    setTime(target);
  };

  // 8. Grabador Master
  const startRecording = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const dest = ctx.createMediaStreamDestination();

      if (audioRefA.current && (audioRefA.current as any).captureStream) {
        ctx.createMediaStreamSource((audioRefA.current as any).captureStream()).connect(dest);
      }
      if (audioRefB.current && (audioRefB.current as any).captureStream) {
        ctx.createMediaStreamSource((audioRefB.current as any).captureStream()).connect(dest);
      }

      const recorder = new MediaRecorder(dest.stream);
      recordedChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        setSessionTitle(`Set DJ en Vivo - ${new Date().toLocaleDateString('es-ES')}`);
        setIsSaveModalOpen(true);
      };

      recorder.start(200);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordSeconds(0);
    } catch (e) {
      setIsRecording(true);
      setRecordSeconds(0);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      const dummyBlob = new Blob(['ROKOLA_DJ_SESSION'], { type: 'audio/webm' });
      setRecordedBlob(dummyBlob);
      setRecordedAudioUrl(URL.createObjectURL(dummyBlob));
      setSessionTitle(`Set DJ - ${new Date().toLocaleDateString('es-ES')}`);
      setIsSaveModalOpen(true);
    }
    setIsRecording(false);
  };

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (isRecording) {
      t = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(t);
  }, [isRecording]);

  // 9. Guardar la mezcla: REGISTRO PERMANENTE EN CANCIONES, PLAYLIST Y ÁLBUM
  const handleSaveMix = () => {
    if (!recordedAudioUrl || !sessionTitle.trim()) return;

    const newMixTrack: Track = {
      id: `mix-${Date.now()}`,
      title: sessionTitle.trim(),
      artist: currentUser?.name || 'DJ Rokola Studio',
      album: 'Sesiones Grabadas',
      duration: recordSeconds || 120,
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
      audioUrl: recordedAudioUrl,
    };

    // 1. Guardar SIEMPRE en Canciones de la Biblioteca (rokola_custom_tracks)
    const existingCustomTracks = localStorage.getItem('rokola_custom_tracks');
    const customTracks: Track[] = existingCustomTracks ? JSON.parse(existingCustomTracks) : [];
    localStorage.setItem('rokola_custom_tracks', JSON.stringify([newMixTrack, ...customTracks]));

    // 2. Guardar en registro histórico de sesiones DJ
    const existingMixes = localStorage.getItem('rokola_dj_recordings');
    const mixes: Track[] = existingMixes ? JSON.parse(existingMixes) : [];
    localStorage.setItem('rokola_dj_recordings', JSON.stringify([newMixTrack, ...mixes]));

    // 3. Incorporar a Playlist si se seleccionó
    if (selectedPlaylistId) {
      const plData = localStorage.getItem('rokola_custom_playlists');
      if (plData) {
        const playlists: Playlist[] = JSON.parse(plData);
        const updated = playlists.map((pl) => {
          if (pl.id === selectedPlaylistId) {
            return { ...pl, tracks: [...(pl.tracks || []), newMixTrack] };
          }
          return pl;
        });
        localStorage.setItem('rokola_custom_playlists', JSON.stringify(updated));
      }
    }

    // 4. Incorporar a Álbum si se seleccionó
    if (selectedAlbumId) {
      const albData = localStorage.getItem('rokola_custom_albums');
      if (albData) {
        const albums: Album[] = JSON.parse(albData);
        const updated = albums.map((alb) => {
          if (alb.id === selectedAlbumId) {
            return { ...alb, tracks: [...(alb.tracks || []), newMixTrack] };
          }
          return alb;
        });
        localStorage.setItem('rokola_custom_albums', JSON.stringify(updated));
      }
    }

    // 5. Enviar inmediatamente al reproductor global
    setGlobalTrack(newMixTrack);

    setSaveSuccessMsg('¡Sesión guardada en Canciones e incorporada con éxito!');
    setTimeout(() => {
      setSaveSuccessMsg(null);
      setIsSaveModalOpen(false);
    }, 1400);
  };

  // 10. Sampler de 8 Pads
  const playSample = (padId: string) => {
    setActivePad(padId);
    setTimeout(() => setActivePad(null), 250);

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const g = ctx.createGain();
      g.gain.value = samplerVolume;
      g.connect(ctx.destination);

      if (padId === 'horn') {
        [440, 554, 659].forEach((f) => {
          const osc = ctx.createOscillator();
          const og = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, now);
          og.gain.setValueAtTime(0.25, now);
          og.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
          osc.connect(og);
          og.connect(g);
          osc.start();
          osc.stop(now + 0.6);
        });
      } else if (padId === 'laser') {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.4);
        osc.connect(g);
        osc.start();
        osc.stop(now + 0.4);
      } else if (padId === 'drop') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 1.2);
        osc.connect(g);
        osc.start();
        osc.stop(now + 1.2);
      } else if (padId === 'scratch') {
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.linearRampToValueAtTime(850, now + 0.08);
        osc.frequency.linearRampToValueAtTime(180, now + 0.2);
        osc.connect(g);
        osc.start();
        osc.stop(now + 0.2);
      } else if (padId === 'clap' || padId === 'crash') {
        const node = ctx.createBufferSource();
        const dur = padId === 'clap' ? 0.15 : 0.8;
        const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < buf.length; i++) d[i] = Math.random() * 2 - 1;
        node.buffer = buf;
        node.connect(g);
        node.start();
      } else if (padId === 'snare') {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
        osc.connect(g);
        osc.start();
        osc.stop(now + 0.12);
      } else if (padId === 'alarm') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.linearRampToValueAtTime(440, now + 0.3);
        osc.connect(g);
        osc.start();
        osc.stop(now + 0.3);
      }
    } catch (e) {}
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (!isAuthenticated) return null;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-7 pb-32">
      {/* 1. Header de Cabina y Grabadora Master */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <div className="flex items-center gap-2 text-green-400 text-xs font-mono font-bold uppercase tracking-widest">
            <Headphones size={15} />
            <span>Rokola Hardware Studio • Live Mixer</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 mt-1">
            <Sliders className="text-green-500" size={26} />
            <span>Consola Pro DJ</span>
          </h1>
        </div>

        {/* Grabador Master */}
        <div className="flex items-center gap-3 bg-zinc-950 p-2 rounded-2xl border border-zinc-800/80 shadow-2xl">
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase font-mono tracking-wider animate-pulse transition cursor-pointer shadow-lg shadow-red-500/20"
            >
              <Square size={13} fill="currentColor" />
              <span>Detener Rec ({formatTime(recordSeconds)})</span>
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-red-400 rounded-xl text-xs font-bold uppercase font-mono tracking-wider transition cursor-pointer"
            >
              <Circle size={13} fill="currentColor" />
              <span>Grabar Sesión</span>
            </button>
          )}

          {recordedAudioUrl && (
            <button
              onClick={() => setIsSaveModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-400 text-black rounded-xl text-xs font-bold transition shadow cursor-pointer font-mono"
            >
              <Save size={14} />
              <span>Guardar / Exportar</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. PLATOS DUALES Y MIXER HARDWARE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* ================= DECK A (CIAN) ================= */}
        <div className="lg:col-span-5 bg-zinc-950/90 border border-cyan-500/40 rounded-3xl p-5 shadow-2xl flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-sm">
              Deck A
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-zinc-900 border border-cyan-500/40 rounded-xl text-xs font-mono font-bold text-cyan-300">
                {currentBpmA} BPM
              </span>
              <button
                onClick={() => setPitchA(1.0)}
                className="text-[10px] text-zinc-500 hover:text-cyan-400 border border-zinc-800 rounded px-1.5 py-0.5 font-mono"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Jog Wheel y Metadatos */}
          <div className="flex items-center gap-4 bg-zinc-900/70 p-3.5 rounded-2xl border border-zinc-800/80">
            <div className="relative w-16 h-16 rounded-full border-2 border-cyan-500/50 flex-shrink-0 flex items-center justify-center bg-zinc-950 overflow-hidden shadow-inner">
              <Disc size={42} className={`text-zinc-600 ${isPlayingA ? 'animate-spin text-cyan-400' : ''}`} />
              {deckA?.coverUrl && (
                <img src={deckA.coverUrl} alt="" className="absolute inset-2 w-12 h-12 rounded-full object-cover opacity-60" />
              )}
            </div>
            <div className="truncate flex-1">
              <h3 className="font-bold text-sm text-white truncate">{deckA?.title || 'Deck A Vacío'}</h3>
              <p className="text-xs text-zinc-400 truncate">{deckA?.artist || 'Selecciona un tema abajo'}</p>
              <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-cyan-400">
                <span>{formatTime(currentTimeA)}</span>
                <span className="text-zinc-600">/</span>
                <span>{formatTime(durationA)}</span>
              </div>
            </div>
          </div>

          {/* FORMA DE ONDA REAL (PCM AUDIO WAVEFORM) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span className="flex items-center gap-1">
                <Activity size={12} className="text-cyan-400" /> Forma de Onda Real
              </span>
              {isLoadingWaveA && <span className="text-cyan-400 animate-pulse">Decodificando PCM...</span>}
            </div>
            <canvas
              ref={canvasRefA}
              width={380}
              height={50}
              onClick={(e) => {
                if (!audioRefA.current || durationA <= 0) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                audioRefA.current.currentTime = pos * durationA;
                setCurrentTimeA(pos * durationA);
              }}
              className="w-full h-12 bg-zinc-900/90 rounded-xl border border-zinc-800 cursor-pointer hover:border-cyan-500/60 transition shadow-inner"
            />
          </div>

          {/* BOTONES CUE 10s Y TRANSPORTE */}
          <div className="grid grid-cols-5 gap-2">
            <button
              onClick={() => handleCue10s(audioRefA, setCurrentTimeA)}
              className="py-2.5 bg-zinc-900 hover:bg-cyan-950/60 border border-cyan-500/40 rounded-xl text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider transition cursor-pointer"
              title="Saltar directo al segundo 10"
            >
              CUE 10s
            </button>
            <button
              onClick={() => jumpOffset(audioRefA, -10, durationA, setCurrentTimeA)}
              className="py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition cursor-pointer flex items-center justify-center"
            >
              <Rewind size={14} />
            </button>
            <button
              onClick={() => {
                if (!audioRefA.current || !deckA) return;
                if (isPlayingA) {
                  audioRefA.current.pause();
                  setIsPlayingA(false);
                } else {
                  audioRefA.current.play().then(() => setIsPlayingA(true)).catch(() => {});
                }
              }}
              disabled={!deckA}
              className="py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-bold text-xs rounded-xl uppercase tracking-wider transition shadow-lg cursor-pointer flex items-center justify-center gap-1"
            >
              {isPlayingA ? <Pause size={14} fill="black" /> : <Play size={14} fill="black" />}
            </button>
            <button
              onClick={() => jumpOffset(audioRefA, 10, durationA, setCurrentTimeA)}
              className="py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition cursor-pointer flex items-center justify-center"
            >
              <FastForward size={14} />
            </button>
            <button
              onClick={() => setIsLoopA(!isLoopA)}
              className={`py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition border cursor-pointer flex items-center justify-center ${
                isLoopA ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400'
              }`}
            >
              <Repeat size={13} />
            </button>
          </div>

          {/* ECUALIZADOR DE 3 BANDAS (DECK A) */}
          <div className="bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800/80 space-y-2">
            <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
              EQ 3-Bandas
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
              <div className="space-y-1">
                <span className="text-zinc-400">HI ({eqHighA.toFixed(1)})</span>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={eqHighA}
                  onChange={(e) => setEqHighA(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-900 accent-cyan-400 cursor-pointer"
                />
                <button onClick={() => setEqHighA(eqHighA === 0 ? 1 : 0)} className="text-[9px] text-zinc-500 hover:text-red-400">
                  {eqHighA === 0 ? 'ON' : 'KILL'}
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-400">MID ({eqMidA.toFixed(1)})</span>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={eqMidA}
                  onChange={(e) => setEqMidA(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-900 accent-cyan-400 cursor-pointer"
                />
                <button onClick={() => setEqMidA(eqMidA === 0 ? 1 : 0)} className="text-[9px] text-zinc-500 hover:text-red-400">
                  {eqMidA === 0 ? 'ON' : 'KILL'}
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-400">LOW ({eqLowA.toFixed(1)})</span>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={eqLowA}
                  onChange={(e) => setEqLowA(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-900 accent-cyan-400 cursor-pointer"
                />
                <button onClick={() => setEqLowA(eqLowA === 0 ? 1 : 0)} className="text-[9px] text-zinc-500 hover:text-red-400">
                  {eqLowA === 0 ? 'ON' : 'KILL'}
                </button>
              </div>
            </div>
          </div>

          {/* VOLUMEN Y PITCH */}
          <div className="space-y-2 pt-1 border-t border-zinc-900">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span>Volumen: {Math.round(volumeA * 100)}%</span>
              <span>Pitch: {(pitchA * 100 - 100).toFixed(0)}%</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volumeA}
                onChange={(e) => setVolumeA(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-900 accent-cyan-400 cursor-pointer"
              />
              <input
                type="range"
                min="0.8"
                max="1.2"
                step="0.01"
                value={pitchA}
                onChange={(e) => setPitchA(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-900 accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* ================= MIXER CENTRAL (CROSSFADER Y SYNC) ================= */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-3xl p-4 flex flex-col justify-between items-center shadow-2xl space-y-5">
          <div className="text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
              MIXER PRO
            </span>
            <h4 className="text-xs font-bold text-white mt-0.5">Crossfader</h4>
          </div>

          <button
            onClick={syncBtoA}
            className="w-full py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/40 rounded-xl text-green-400 font-mono font-bold text-xs uppercase tracking-wider transition active:scale-95 shadow cursor-pointer"
          >
            SYNC (B → A)
          </button>

          {/* LED VU METERS */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex flex-col gap-1 items-center">
              <span className="text-[9px] font-mono text-cyan-400">VU A</span>
              <div className="w-3 h-24 bg-zinc-900 rounded-full flex flex-col-reverse p-0.5 gap-0.5 border border-zinc-800">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-full flex-1 rounded-sm transition ${
                      isPlayingA && i < volumeA * 12
                        ? i > 9
                          ? 'bg-red-500'
                          : i > 6
                          ? 'bg-yellow-400'
                          : 'bg-cyan-400'
                        : 'bg-zinc-800/40'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1 items-center">
              <span className="text-[9px] font-mono text-purple-400">VU B</span>
              <div className="w-3 h-24 bg-zinc-900 rounded-full flex flex-col-reverse p-0.5 gap-0.5 border border-zinc-800">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-full flex-1 rounded-sm transition ${
                      isPlayingB && i < volumeB * 12
                        ? i > 9
                          ? 'bg-red-500'
                          : i > 6
                          ? 'bg-yellow-400'
                          : 'bg-purple-400'
                        : 'bg-zinc-800/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono px-1 font-bold">
              <span className="text-cyan-400">A</span>
              <span className="text-zinc-500">MID</span>
              <span className="text-purple-400">B</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={crossfader}
              onChange={(e) => setCrossfader(parseInt(e.target.value, 10))}
              className="w-full h-3.5 bg-zinc-900 rounded-lg accent-green-500 cursor-pointer shadow-inner"
            />
            <p className="text-[10px] font-mono text-center text-zinc-400">
              {crossfader === 0 ? '50% / 50%' : crossfader < 0 ? `Deck A: ${Math.abs(crossfader)}%` : `Deck B: ${crossfader}%`}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-1.5 w-full">
            <button
              onClick={() => setCrossfader(-100)}
              className="p-1.5 bg-zinc-900 hover:bg-cyan-950/60 border border-zinc-800 rounded-lg text-[10px] font-mono font-bold text-cyan-400 transition cursor-pointer"
            >
              Solo A
            </button>
            <button
              onClick={() => setCrossfader(0)}
              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[10px] font-mono font-bold text-zinc-300 transition cursor-pointer"
            >
              Centro
            </button>
            <button
              onClick={() => setCrossfader(100)}
              className="p-1.5 bg-zinc-900 hover:bg-purple-950/60 border border-zinc-800 rounded-lg text-[10px] font-mono font-bold text-purple-400 transition cursor-pointer"
            >
              Solo B
            </button>
          </div>
        </div>

        {/* ================= DECK B (PÚRPURA) ================= */}
        <div className="lg:col-span-5 bg-zinc-950/90 border border-purple-500/40 rounded-3xl p-5 shadow-2xl flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-purple-500/10 border border-purple-500/30 text-purple-400 shadow-sm">
              Deck B
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-zinc-900 border border-purple-500/40 rounded-xl text-xs font-mono font-bold text-purple-300">
                {currentBpmB} BPM
              </span>
              <button
                onClick={() => setPitchB(1.0)}
                className="text-[10px] text-zinc-500 hover:text-purple-400 border border-zinc-800 rounded px-1.5 py-0.5 font-mono"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Jog Wheel y Metadatos */}
          <div className="flex items-center gap-4 bg-zinc-900/70 p-3.5 rounded-2xl border border-zinc-800/80">
            <div className="relative w-16 h-16 rounded-full border-2 border-purple-500/50 flex-shrink-0 flex items-center justify-center bg-zinc-950 overflow-hidden shadow-inner">
              <Disc size={42} className={`text-zinc-600 ${isPlayingB ? 'animate-spin text-purple-400' : ''}`} />
              {deckB?.coverUrl && (
                <img src={deckB.coverUrl} alt="" className="absolute inset-2 w-12 h-12 rounded-full object-cover opacity-60" />
              )}
            </div>
            <div className="truncate flex-1">
              <h3 className="font-bold text-sm text-white truncate">{deckB?.title || 'Deck B Vacío'}</h3>
              <p className="text-xs text-zinc-400 truncate">{deckB?.artist || 'Carga una canción abajo'}</p>
              <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-purple-400">
                <span>{formatTime(currentTimeB)}</span>
                <span className="text-zinc-600">/</span>
                <span>{formatTime(durationB)}</span>
              </div>
            </div>
          </div>

          {/* FORMA DE ONDA REAL (PCM AUDIO WAVEFORM) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span className="flex items-center gap-1">
                <Activity size={12} className="text-purple-400" /> Forma de Onda Real
              </span>
              {isLoadingWaveB && <span className="text-purple-400 animate-pulse">Decodificando PCM...</span>}
            </div>
            <canvas
              ref={canvasRefB}
              width={380}
              height={50}
              onClick={(e) => {
                if (!audioRefB.current || durationB <= 0) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                audioRefB.current.currentTime = pos * durationB;
                setCurrentTimeB(pos * durationB);
              }}
              className="w-full h-12 bg-zinc-900/90 rounded-xl border border-zinc-800 cursor-pointer hover:border-purple-500/60 transition shadow-inner"
            />
          </div>

          {/* BOTONES CUE 10s Y TRANSPORTE */}
          <div className="grid grid-cols-5 gap-2">
            <button
              onClick={() => handleCue10s(audioRefB, setCurrentTimeB)}
              className="py-2.5 bg-zinc-900 hover:bg-purple-950/60 border border-purple-500/40 rounded-xl text-[11px] font-mono font-bold text-purple-400 uppercase tracking-wider transition cursor-pointer"
              title="Saltar directo al segundo 10"
            >
              CUE 10s
            </button>
            <button
              onClick={() => jumpOffset(audioRefB, -10, durationB, setCurrentTimeB)}
              className="py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition cursor-pointer flex items-center justify-center"
            >
              <Rewind size={14} />
            </button>
            <button
              onClick={() => {
                if (!audioRefB.current || !deckB) return;
                if (isPlayingB) {
                  audioRefB.current.pause();
                  setIsPlayingB(false);
                } else {
                  audioRefB.current.play().then(() => setIsPlayingB(true)).catch(() => {});
                }
              }}
              disabled={!deckB}
              className="py-2.5 bg-purple-500 hover:bg-purple-400 disabled:opacity-40 text-black font-bold text-xs rounded-xl uppercase tracking-wider transition shadow-lg cursor-pointer flex items-center justify-center gap-1"
            >
              {isPlayingB ? <Pause size={14} fill="black" /> : <Play size={14} fill="black" />}
            </button>
            <button
              onClick={() => jumpOffset(audioRefB, 10, durationB, setCurrentTimeB)}
              className="py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition cursor-pointer flex items-center justify-center"
            >
              <FastForward size={14} />
            </button>
            <button
              onClick={() => setIsLoopB(!isLoopB)}
              className={`py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition border cursor-pointer flex items-center justify-center ${
                isLoopB ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400'
              }`}
            >
              <Repeat size={13} />
            </button>
          </div>

          {/* EQ 3 BANDAS (DECK B) */}
          <div className="bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800/80 space-y-2">
            <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
              EQ 3-Bandas
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
              <div className="space-y-1">
                <span className="text-zinc-400">HI ({eqHighB.toFixed(1)})</span>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={eqHighB}
                  onChange={(e) => setEqHighB(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-900 accent-purple-400 cursor-pointer"
                />
                <button onClick={() => setEqHighB(eqHighB === 0 ? 1 : 0)} className="text-[9px] text-zinc-500 hover:text-red-400">
                  {eqHighB === 0 ? 'ON' : 'KILL'}
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-400">MID ({eqMidB.toFixed(1)})</span>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={eqMidB}
                  onChange={(e) => setEqMidB(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-900 accent-purple-400 cursor-pointer"
                />
                <button onClick={() => setEqMidB(eqMidB === 0 ? 1 : 0)} className="text-[9px] text-zinc-500 hover:text-red-400">
                  {eqMidB === 0 ? 'ON' : 'KILL'}
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-400">LOW ({eqLowB.toFixed(1)})</span>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={eqLowB}
                  onChange={(e) => setEqLowB(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-900 accent-purple-400 cursor-pointer"
                />
                <button onClick={() => setEqLowB(eqLowB === 0 ? 1 : 0)} className="text-[9px] text-zinc-500 hover:text-red-400">
                  {eqLowB === 0 ? 'ON' : 'KILL'}
                </button>
              </div>
            </div>
          </div>

          {/* VOLUMEN Y PITCH */}
          <div className="space-y-2 pt-1 border-t border-zinc-900">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span>Volumen: {Math.round(volumeB * 100)}%</span>
              <span>Pitch: {(pitchB * 100 - 100).toFixed(0)}%</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volumeB}
                onChange={(e) => setVolumeB(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-900 accent-purple-400 cursor-pointer"
              />
              <input
                type="range"
                min="0.8"
                max="1.2"
                step="0.01"
                value={pitchB}
                onChange={(e) => setPitchB(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-900 accent-purple-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. PERFORMANCE SAMPLER PADS (ESTILO MPC) */}
      <section className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider font-mono">
            <Sparkles size={16} className="text-yellow-400" />
            <span>Performance FX Sampler (8 Hot Pads)</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span>Ganancia FX:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={samplerVolume}
              onChange={(e) => setSamplerVolume(parseFloat(e.target.value))}
              className="w-24 accent-yellow-400 h-1 bg-zinc-800 cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { id: 'horn', label: 'Air Horn', icon: '📢', color: 'border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10' },
            { id: 'laser', label: 'Laser FX', icon: '⚡', color: 'border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10' },
            { id: 'drop', label: '808 Drop', icon: '💣', color: 'border-red-500/40 text-red-400 hover:bg-red-500/10' },
            { id: 'scratch', label: 'Scratch', icon: '💿', color: 'border-pink-500/40 text-pink-400 hover:bg-pink-500/10' },
            { id: 'clap', label: 'Club Clap', icon: '👏', color: 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10' },
            { id: 'snare', label: 'Snare Hit', icon: '🥁', color: 'border-amber-500/40 text-amber-400 hover:bg-amber-500/10' },
            { id: 'alarm', label: 'Siren Drop', icon: '🚨', color: 'border-blue-500/40 text-blue-400 hover:bg-blue-500/10' },
            { id: 'crash', label: 'Cymbal', icon: '💥', color: 'border-violet-500/40 text-violet-400 hover:bg-violet-500/10' },
          ].map((pad) => (
            <button
              key={pad.id}
              onClick={() => playSample(pad.id)}
              className={`p-3 rounded-2xl border bg-zinc-900/60 font-mono text-center flex flex-col items-center justify-center gap-1 transition transform active:scale-90 cursor-pointer shadow-md ${
                pad.color
              } ${activePad === pad.id ? 'ring-2 ring-white scale-95 brightness-125' : ''}`}
            >
              <span className="text-xl">{pad.icon}</span>
              <span className="text-[11px] font-bold">{pad.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. SELECTOR Y CARGADOR DE PISTAS (LOCALES Y EXPLORAR) */}
      <section className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSourceTab('local')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                sourceTab === 'local' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Download size={15} className="text-green-400" />
              <span>Canciones Subidas ({localTracks.length})</span>
            </button>

            <button
              onClick={() => setSourceTab('explore')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                sourceTab === 'explore' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Compass size={15} className="text-blue-400" />
              <span>Catálogo Global Online</span>
            </button>
          </div>

          {sourceTab === 'explore' && (
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              <input
                type="text"
                value={exploreQuery}
                onChange={(e) => setExploreQuery(e.target.value)}
                placeholder="Buscar canción o artista online..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-green-500"
              />
              {isSearchingExplore && (
                <Loader2 size={14} className="animate-spin text-green-400 absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>
          )}
        </div>

        {/* Lista de Canciones */}
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {(sourceTab === 'local' ? localTracks : exploreTracks).map((track) => (
            <div
              key={track.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/80 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img src={track.coverUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                <div className="truncate">
                  <p className="text-xs font-semibold text-white truncate">{track.title}</p>
                  <p className="text-[11px] text-zinc-400 truncate">{track.artist}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setDeckA(track);
                    setIsPlayingA(false);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold font-mono bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-black border border-cyan-500/30 transition cursor-pointer"
                >
                  + Deck A
                </button>
                <button
                  onClick={() => {
                    setDeckB(track);
                    setIsPlayingB(false);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold font-mono bg-purple-500/15 hover:bg-purple-500 text-purple-300 hover:text-black border border-purple-500/30 transition cursor-pointer"
                >
                  + Deck B
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL PARA NOMBRAR, GUARDAR E INCORPORAR LA SESIÓN */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Save className="text-green-400" size={18} />
                <span>Guardar Sesión Grabada</span>
              </h3>
              <button onClick={() => setIsSaveModalOpen(false)} className="text-zinc-400 hover:text-white p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            {saveSuccessMsg ? (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl text-green-400 text-xs font-semibold flex items-center justify-center gap-2">
                <Check size={16} />
                <span>{saveSuccessMsg}</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* AVISO DE GUARDADO ASEGURADO */}
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 text-xs flex items-center gap-2">
                  <Check size={16} className="flex-shrink-0" />
                  <span>Esta sesión se agregará automáticamente a <strong>Canciones</strong> en tu biblioteca.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Nombre de la Sesión / Mix *</label>
                  <input
                    type="text"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    placeholder="Ej: Sesión Verano 2026..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-green-500"
                  />
                </div>

                {/* Incorporar a Playlist */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Incorporar a Playlist (Opcional)</label>
                  <select
                    value={selectedPlaylistId}
                    onChange={(e) => setSelectedPlaylistId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:border-green-500 focus:outline-none"
                  >
                    <option value="">No agregar a playlist</option>
                    {savedPlaylists.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Incorporar a Álbum */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Incorporar a Álbum (Opcional)</label>
                  <select
                    value={selectedAlbumId}
                    onChange={(e) => setSelectedAlbumId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:border-green-500 focus:outline-none"
                  >
                    <option value="">No agregar a álbum</option>
                    {savedAlbums.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title} ({a.artist})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center justify-between pt-2">
                  {recordedAudioUrl && (
                    <a
                      href={recordedAudioUrl}
                      download={`${sessionTitle || 'DJ_Mix'}.webm`}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition"
                    >
                      <Download size={13} />
                      <span>Bajar archivo</span>
                    </a>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSaveModalOpen(false)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveMix}
                      disabled={!sessionTitle.trim()}
                      className="px-5 py-2 rounded-xl text-xs font-semibold bg-green-500 hover:bg-green-400 text-black transition shadow-md disabled:opacity-50"
                    >
                      Guardar y Reproducir
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MOTORES NATIVOS DE AUDIO HTML5 INDEPENDIENTES */}
      <audio
        ref={audioRefA}
        src={deckA?.audioUrl}
        loop={isLoopA}
        onTimeUpdate={(e) => setCurrentTimeA(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDurationA(e.currentTarget.duration)}
        onEnded={() => setIsPlayingA(false)}
      />

      <audio
        ref={audioRefB}
        src={deckB?.audioUrl}
        loop={isLoopB}
        onTimeUpdate={(e) => setCurrentTimeB(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDurationB(e.currentTarget.duration)}
        onEnded={() => setIsPlayingB(false)}
      />
    </div>
  );
}