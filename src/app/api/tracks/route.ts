import { NextResponse } from 'next/server';
import { getSavedTracks } from '@/lib/tracksStorage';

export async function GET() {
  try {
    const tracks = getSavedTracks();
    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Error obteniendo canciones:', error);
    return NextResponse.json([], { status: 500 });
  }
}