export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // en segundos
  audioUrl: string;
  coverUrl: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  trackCount?: number;
  tracks: Track[];
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  year: string;
  coverUrl: string;
  tracks: Track[];
}

export interface Artist {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
}