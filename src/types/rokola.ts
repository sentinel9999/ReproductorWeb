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
  tracks: Track[];
}