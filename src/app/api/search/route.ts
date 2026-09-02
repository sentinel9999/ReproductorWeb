import { NextRequest, NextResponse } from 'next/server';
import { Track } from '@/types/rokola';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query || !query.trim()) {
    return NextResponse.json([]);
  }

  try {
    // Usamos el balanceador global oficial de Audius con límite ampliado a 30 canciones
    const apiUrl = `https://api.audius.co/v1/tracks/search?query=${encodeURIComponent(
      query.trim()
    )}&app_name=ROKOLA&limit=30`;

    const res = await fetch(apiUrl, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json({ error: 'Fallo al consultar catálogo' }, { status: 502 });
    }

    const { data } = await res.json();
    if (!Array.isArray(data)) {
      return NextResponse.json([]);
    }

    // Filtramos solo canciones que realmente se pueden reproducir
    const tracks: Track[] = data
      .filter((item: any) => 
        Boolean(item && item.id && item.is_streamable !== false && !item.is_delete && item.duration > 0)
      )
      .map((item: any) => ({
        id: `audius-${item.id}`,
        title: item.title || 'Canción',
        artist: item.user?.name || item.user?.handle || 'Artista',
        album: item.genre || 'Música',
        duration: item.duration || 180,
        coverUrl:
          item.artwork?.['480x480'] ||
          item.artwork?.['150x150'] ||
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
        // Enlace de streaming que resuelve la redirección al MP3 real de forma directa
        audioUrl: `https://api.audius.co/v1/tracks/${item.id}/stream?app_name=ROKOLA`,
      }));

    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Error buscando música en línea:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}