import fs from 'fs';
import path from 'path';
import { Playlist } from '@/types/rokola';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'playlists.json');

const INITIAL_PLAYLISTS: Record<string, Playlist> = {
  p1: {
    id: 'p1',
    name: 'Favoritos de la Semana',
    description: 'Tus temas más escuchados compilados automáticamente.',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=600&fit=crop',
    tracks: [
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
    ],
  },
  p2: {
    id: 'p2',
    name: 'Para Concentrarse',
    description: 'Música instrumental y ambient para trabajar.',
    coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&h=600&fit=crop',
    tracks: [],
  },
};

export function getPlaylists(): Record<string, Playlist> {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(INITIAL_PLAYLISTS, null, 2), 'utf-8');
      return INITIAL_PLAYLISTS;
    }
    const content = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return INITIAL_PLAYLISTS;
  }
}

export function removeTrackFromPlaylist(playlistId: string, trackId: string): boolean {
  try {
    const playlists = getPlaylists();
    if (!playlists[playlistId]) return false;

    playlists[playlistId].tracks = playlists[playlistId].tracks.filter((t) => t.id !== trackId);
    fs.writeFileSync(FILE_PATH, JSON.stringify(playlists, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error al remover canción de playlist:', error);
    return false;
  }
}