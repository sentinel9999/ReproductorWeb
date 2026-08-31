'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { usePlayerStore } from '@/store/usePlaystore';
import { Track } from '@/types/rokola';
import { 
  Heart, 
  Play, 
  Pause, 
  Clock, 
  Edit3, 
  Check, 
  X, 
  Sparkles, 
  Music2, 
  Trash2,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Luna',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Aero',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Nova',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
];

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, updateProfile, toggleLikeSong } = useAuthStore();
  const { currentTrack, isPlaying, setQueue, togglePlay } = usePlayerStore();

  const [hasMounted, setHasMounted] = useState(false);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // 1. Protección de ruta: Redirigir a /login si no está autenticado
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted && (!isAuthenticated || !currentUser)) {
      router.replace('/login');
    }
  }, [hasMounted, isAuthenticated, currentUser, router]);

  // 2. Cargar catálogo de canciones
  useEffect(() => {
    async function loadTracks() {
      try {
        const res = await fetch('/api/tracks');
        if (res.ok) {
          const data = await res.json();
          setAllTracks(data);
        }
      } catch (err) {
        console.error('Error cargando canciones:', err);
      }
    }
    loadTracks();
  }, []);

  // 3. Sincronizar datos del formulario cuando el usuario esté listo
  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditAvatarUrl(currentUser.avatarUrl);
    }
  }, [currentUser]);

  // Pantalla de carga mientras se comprueba la sesión en el cliente
  if (!hasMounted || !isAuthenticated || !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-zinc-400">
        <Loader2 className="animate-spin text-green-500" size={32} />
        <p className="text-sm">Verificando sesión...</p>
      </div>
    );
  }

  const likedTracks = allTracks.filter((track) => 
    currentUser?.likedSongIds?.includes(track.id)
  );

  const isLikedPlaying =
    likedTracks.length > 0 &&
    likedTracks.some((t) => t.id === currentTrack?.id) &&
    isPlaying;

  const handlePlayLiked = () => {
    if (isLikedPlaying) {
      togglePlay();
    } else if (likedTracks.length > 0) {
      setQueue(likedTracks, 0);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    updateProfile({
      name: editName.trim(),
      avatarUrl: editAvatarUrl.trim() || currentUser.avatarUrl || AVATAR_PRESETS[0],
    });

    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10 pb-28">
      {/* 1. Cabecera y Tarjeta de Perfil */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-green-500/50 bg-zinc-800 shadow-xl"
            />
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="absolute bottom-0 right-0 p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white rounded-full shadow transition cursor-pointer"
                title="Editar avatar"
              >
                <Edit3 size={14} />
              </button>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-green-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} />
              <span>Perfil de Usuario</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {currentUser.name}
            </h1>
            <p className="text-zinc-400 text-sm">{currentUser.email}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs text-zinc-300">
              <span className="bg-zinc-800/80 px-3 py-1 rounded-full border border-zinc-700">
                ❤️ {likedTracks.length} canciones favoritas
              </span>
              <span className="bg-zinc-800/80 px-3 py-1 rounded-full border border-zinc-700">
                ID: {currentUser.id.slice(0, 10)}...
              </span>
            </div>

            {!isEditing && (
              <div className="pt-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold px-4 py-2 rounded-lg border border-zinc-700 transition cursor-pointer"
                >
                  <Edit3 size={14} />
                  <span>Editar Perfil</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {savedSuccess && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs flex items-center gap-2">
            <Check size={16} />
            <span>Perfil actualizado exitosamente.</span>
          </div>
        )}
      </section>

      {/* 2. Formulario de Edición de Perfil */}
      {isEditing && (
        <section className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Edit3 size={18} className="text-green-400" />
              <span>Editar Datos de Usuario</span>
            </h2>
            <button
              onClick={() => setIsEditing(false)}
              className="p-1 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase tracking-wider">
                Nombre público
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Ingresa tu nombre..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase tracking-wider">
                URL personalizada del Avatar
              </label>
              <input
                type="url"
                value={editAvatarUrl}
                onChange={(e) => setEditAvatarUrl(e.target.value)}
                placeholder="https://ejemplo.com/mi-avatar.png"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2">
                O elige un avatar predeterminado:
              </label>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {AVATAR_PRESETS.map((preset, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() => setEditAvatarUrl(preset)}
                    className={`w-12 h-12 rounded-full overflow-hidden border-2 transition flex-shrink-0 cursor-pointer ${
                      editAvatarUrl === preset ? 'border-green-500 scale-105' : 'border-zinc-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={preset} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover bg-zinc-800" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer"
              >
                <Check size={16} />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {/* 3. Listado de Canciones Favoritas (Me Gusta) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="text-red-500 fill-red-500" size={20} />
            <h2 className="text-xl font-bold text-white">Tus Canciones Favoritas</h2>
            <span className="text-xs text-zinc-500 font-medium">({likedTracks.length})</span>
          </div>

          {likedTracks.length > 0 && (
            <button
              onClick={handlePlayLiked}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold text-xs px-5 py-2 rounded-full transition shadow-md cursor-pointer"
            >
              {isLikedPlaying ? (
                <Pause size={15} fill="black" />
              ) : (
                <Play size={15} fill="black" className="ml-0.5" />
              )}
              <span>{isLikedPlaying ? 'Pausar' : 'Reproducir todas'}</span>
            </button>
          )}
        </div>

        {likedTracks.length === 0 ? (
          <div className="p-8 border border-dashed border-zinc-800 rounded-2xl text-center space-y-2">
            <Music2 size={28} className="mx-auto text-zinc-600" />
            <p className="text-sm font-semibold text-zinc-300">Aún no tienes canciones favoritas</p>
            <p className="text-xs text-zinc-500">
              Explora el catálogo y añade canciones a tus favoritos para escucharlas aquí.
            </p>
            <div className="pt-2">
              <Link
                href="/explore"
                className="inline-block text-xs font-semibold text-green-400 hover:underline"
              >
                Explorar canciones →
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="grid grid-cols-12 text-xs uppercase font-semibold text-zinc-500 px-4 py-2 border-b border-zinc-900">
              <span className="col-span-1">#</span>
              <span className="col-span-7 sm:col-span-8">Título</span>
              <span className="col-span-4 sm:col-span-3 text-right flex items-center justify-end gap-1">
                <Clock size={14} />
              </span>
            </div>

            {likedTracks.map((track, index) => {
              const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;

              return (
                <div
                  key={track.id}
                  onClick={() => setQueue(likedTracks, index)}
                  className="grid grid-cols-12 items-center px-4 py-3 rounded-xl hover:bg-zinc-900/60 cursor-pointer group transition text-sm"
                >
                  <span
                    className={`col-span-1 font-medium ${
                      isThisTrackPlaying ? 'text-green-400' : 'text-zinc-500'
                    }`}
                  >
                    {index + 1}
                  </span>

                  <div className="col-span-7 sm:col-span-8 flex items-center gap-3 min-w-0">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="truncate">
                      <p
                        className={`font-semibold truncate ${
                          isThisTrackPlaying ? 'text-green-400' : 'text-white'
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">{track.artist}</p>
                    </div>
                  </div>

                  <div className="col-span-4 sm:col-span-3 flex items-center justify-end gap-3 text-zinc-400 text-xs font-medium">
                    <span>{formatDuration(track.duration)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLikeSong(track.id);
                      }}
                      title="Quitar de favoritos"
                      className="p-1 text-zinc-500 hover:text-red-400 transition cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}