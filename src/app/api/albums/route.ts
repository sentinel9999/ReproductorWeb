import { NextResponse } from 'next/server';
import { Album } from '@/types/rokola';
import { getSavedTracks } from '@/lib/tracksStorage';

export async function GET() {
  const userTracks = getSavedTracks();

  // Álbum dinámico generado a partir de tus subidas
  const uploadedAlbum: Album = {
    id: 'uploaded',
    title: 'Mis Canciones Subidas',
    artist: 'Tu Colección Local',
    year: '2026',
    coverUrl: userTracks[0]?.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop',
    tracks: userTracks,
  };

  const defaultAlbums: Album[] = [
    uploadedAlbum, // 👈 Aparece como primer álbum
    {
      id: 'a1',
      title: 'Acoustic Memories',
      artist: 'Benjamin Tissot',
      year: '2024',
      coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&h=500&fit=crop',
      tracks: [],
    },
    {
      id: 'a2',
      title: 'Summer Nights',
      artist: 'Various Artists',
      year: '2023',
      coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=500&fit=crop',
      tracks: [],
    },
  ];

  return NextResponse.json(defaultAlbums);
}