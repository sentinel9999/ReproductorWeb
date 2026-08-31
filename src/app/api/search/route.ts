import { NextRequest, NextResponse } from 'next/server';
import ytSearch from 'yt-search';
import { Track } from '@/types/rokola';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query || !query.trim()) {
    return NextResponse.json([]);
  }

  try {
    const searchResults = await ytSearch(query.trim());
    const videos = searchResults.videos.slice(0, 20);

    const tracks: Track[] = videos.map((video: any) => ({
      id: `yt-${video.videoId}`,
      title: video.title,
      artist: video.author?.name || 'Artista',
      album: 'YouTube Music',
      duration: video.seconds || 180,
      coverUrl: video.thumbnail || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
      audioUrl: `/api/stream/youtube/${video.videoId}`,
    }));

    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Error buscando en YouTube:', error);
    return NextResponse.json([], { status: 500 });
  }
}