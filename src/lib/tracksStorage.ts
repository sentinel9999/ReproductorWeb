import fs from 'fs';
import path from 'path';
import { Track } from '@/types/rokola';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'tracks.json');

const INITIAL_TRACKS: Track[] = [
  {
    id: 'hero-1',
    title: 'Summer Vibes Deluxe',
    artist: 'Benjamin Tissot',
    duration: 180,
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  },
  {
    id: '1',
    title: 'Acoustic Breeze',
    artist: 'Benjamin Tissot',
    duration: 100,
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
  },
  {
    id: '2',
    title: 'Sunny Beats',
    artist: 'Bensound',
    duration: 140,
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3',
  },
];

// Lee las canciones del archivo JSON (o inicializa el archivo si no existe)
export function getSavedTracks(): Track[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(INITIAL_TRACKS, null, 2), 'utf-8');
      return INITIAL_TRACKS;
    }

    const fileContent = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error leyendo tracks.json:', error);
    return INITIAL_TRACKS;
  }
}

// Guarda una nueva canción al inicio del listado
export function addSavedTrack(newTrack: Track): Track[] {
  const currentTracks = getSavedTracks();
  const updatedTracks = [newTrack, ...currentTracks];

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(updatedTracks, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error guardando en tracks.json:', error);
  }

  return updatedTracks;
}

export function deleteSavedTrack(trackId: string): { success: boolean; deletedTrack?: Track } {
  try {
    const currentTracks = getSavedTracks();
    const trackToDelete = currentTracks.find((t) => t.id === trackId);

    if (!trackToDelete) {
      return { success: false };
    }

    // 1. Filtrar y guardar el nuevo array sin la canción
    const updatedTracks = currentTracks.filter((t) => t.id !== trackId);
    fs.writeFileSync(FILE_PATH, JSON.stringify(updatedTracks, null, 2), 'utf-8');

    // 2. Si es un archivo local (/api/stream/nombre.mp3), eliminar el archivo físico de media/audio/
    if (trackToDelete.audioUrl.startsWith('/api/stream/')) {
      const fileName = trackToDelete.audioUrl.replace('/api/stream/', '');
      const audioPath = path.join(process.cwd(), 'media', 'audio', fileName);
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    }

    return { success: true, deletedTrack: trackToDelete };
  } catch (error) {
    console.error('Error eliminando la canción:', error);
    return { success: false };
  }
}