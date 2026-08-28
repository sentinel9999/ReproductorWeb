'use client';

import { useState } from 'react';
import { usePlayerStore } from '@/store/usePlaystore';
import { Track } from '@/types/rokola';
import { UploadCloud, Music, Image as ImageIcon, Play, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UploadTrackPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedTrack, setUploadedTrack] = useState<Track | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const { setTrack } = usePlayerStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Autocompletar título a partir del nombre del archivo si está vacío
      if (!title) {
        const defaultTitle = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(defaultTitle);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!file) {
      setErrorMsg('Por favor selecciona un archivo MP3.');
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('artist', artist || 'Artista Desconocido');
      if (coverUrl) formData.append('coverUrl', coverUrl);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error subiendo la canción');
      }

      const newTrack: Track = await response.json();
      setUploadedTrack(newTrack);

      // Limpiar formulario
      setFile(null);
      setTitle('');
      setArtist('');
      setCoverUrl('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error al subir el audio.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 pb-28">
      {/* Botón Volver */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition font-medium"
      >
        <ArrowLeft size={16} />
        <span>Volver al Inicio</span>
      </Link>

      {/* Encabezado */}
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <UploadCloud className="text-green-400" size={36} />
          <span>Subir Música</span>
        </h1>
        <p className="text-zinc-400 text-sm">
          Añade tus propios archivos de audio MP3 para reproducirlos en streaming directo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Formulario Principal */}
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6 bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 shadow-xl">
          {errorMsg && (
            <div className="p-3 bg-red-500/20 border border-red-500/40 text-red-400 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Área Drag & Drop / Selección de Archivo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Archivo de Audio (.mp3)
            </label>
            <div className="relative border-2 border-dashed border-zinc-800 hover:border-green-500/60 transition rounded-xl p-6 text-center cursor-pointer bg-zinc-950/40">
              <input
                type="file"
                accept="audio/mp3,audio/mpeg"
                required
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <Music className="text-zinc-500" size={32} />
                <p className="text-sm font-medium text-white">
                  {file ? file.name : 'Haz clic o arrastra tu archivo MP3 aquí'}
                </p>
                <p className="text-xs text-zinc-500">
                  {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Formatos soportados: MP3'}
                </p>
              </div>
            </div>
          </div>

          {/* Título de la pista */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Título de la Canción</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Mi Nueva Canción"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500 transition"
            />
          </div>

          {/* Artista */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Artista o Compositor</label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Ej: Artista Independiente"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500 transition"
            />
          </div>

          {/* URL de Portada */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">URL de Portada (Opcional)</label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 disabled:bg-zinc-800 text-black font-semibold text-sm py-3 rounded-full transition transform active:scale-95 shadow-md cursor-pointer disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Subiendo y procesando audio...</span>
              </>
            ) : (
              <>
                <UploadCloud size={18} />
                <span>Subir Canción al Catálogo</span>
              </>
            )}
          </button>
        </form>

        {/* Panel Lateral: Vista Previa y Éxito */}
        <div className="space-y-6">
          {uploadedTrack ? (
            <div className="bg-emerald-950/30 border border-emerald-500/40 p-5 rounded-2xl space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-green-400 text-xs font-semibold">
                <CheckCircle2 size={16} />
                <span>¡Subida exitosa!</span>
              </div>

              <div className="aspect-square rounded-xl overflow-hidden border border-zinc-700 shadow-md">
                <img
                  src={uploadedTrack.coverUrl}
                  alt={uploadedTrack.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="font-bold text-white text-base truncate">{uploadedTrack.title}</h3>
                <p className="text-xs text-zinc-400 truncate">{uploadedTrack.artist}</p>
              </div>

              <button
                onClick={() => setTrack(uploadedTrack)}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-semibold text-xs py-2.5 rounded-full transition cursor-pointer"
              >
                <Play size={14} fill="black" />
                <span>Reproducir Ahora</span>
              </button>
            </div>
          ) : (
            <div className="p-6 border border-dashed border-zinc-800 rounded-2xl text-center space-y-2 text-zinc-500">
              <Music className="mx-auto text-zinc-600" size={32} />
              <p className="text-xs font-medium">Vista previa de la subida</p>
              <p className="text-[11px] text-zinc-600">
                Cuando subas una canción, podrás escucharla inmediatamente en esta tarjeta.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}