import { NextRequest, NextResponse } from 'next/server';
import { Track } from '@/types/rokola';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query || !query.trim()) {
    return NextResponse.json([]);
  }

  try {
    // API pública y gratuita de Audius (música completa, sin límite de 30s)
    const apiUrl = `https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(
      query.trim()
    )}&app_name=ROKOLA`;

    const res = await fetch(apiUrl, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json({ error: 'Error al consultar catálogo' }, { status: 502 });
    }

    const { data } = await res.json();

    if (!Array.isArray(data)) {
      return NextResponse.json([]);
    }

    // Mapeamos los resultados al formato Track de Rokola
    const tracks: Track[] = data
      .filter((item: any) => item && item.id)
      .slice(0, 20)
      .map((item: any) => ({
        id: `audius-${item.id}`,
        title: item.title || 'Canción',
        artist: item.user?.name || item.user?.handle || 'Artista',
        album: item.genre || 'Música',
        duration: item.duration || 180, // Duración total en segundos
        coverUrl:
          item.artwork?.['480x480'] ||
          item.artwork?.['150x150'] ||
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
        // Stream directo de la canción completa en MP3
        audioUrl: `https://discoveryprovider.audius.co/v1/tracks/${item.id}/stream?app_name=ROKOLA`,
      }));

    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Error buscando música completa:', error);
    return NextResponse.json({ error: 'Error interno en la búsqueda' }, { status: 500 });
  }
}