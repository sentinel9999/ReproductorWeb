import { NextResponse } from 'next/server';
import { Artist } from '@/types/rokola';

const ARTISTS_DB: Artist[] = [
  {
    id: 'art-1',
    name: 'Benjamin Tissot',
    role: 'Compositor / Acústico',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
  },
  {
    id: 'art-2',
    name: 'Bensound',
    role: 'Productor Musical',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
  },
  {
    id: 'art-3',
    name: 'Electronic Waves',
    role: 'Dúo Synthwave',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
  },
  {
    id: 'art-4',
    name: 'Chillout Lab',
    role: 'Banda Lo-Fi / Ambient',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop',
  },
];

export async function GET() {
  return NextResponse.json(ARTISTS_DB);
}