import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ videoId: string }> }
) {
  try {
    const params = await context.params;
    const videoId = params?.videoId;

    if (!videoId || videoId === 'undefined') {
      return new NextResponse('ID de video inválido', { status: 400 });
    }

    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // 1. Petición a Cobalt API
    const cobaltRes = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      body: JSON.stringify({
        url: youtubeUrl,
        isAudioOnly: true, 
        aFormat: 'mp3'     
      })
    });

    if (cobaltRes.ok) {
      const data = await cobaltRes.json();
      if (data && data.url) {
        // EN LUGAR DE REDIRIGIR (307), EL BACKEND DESCARGA EL AUDIO Y LO TRANSMITE
        const audioStream = await fetch(data.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
          }
        });

        if (audioStream.ok && audioStream.body) {
          return new NextResponse(audioStream.body, {
            status: 200, // Código de éxito real, no redirección
            headers: {
              'Content-Type': 'audio/mpeg',
              'Accept-Ranges': 'bytes',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      }
    }

    // 2. Fallback de rescate con Proxy interno (Invidious)
    const fallbackUrl = `https://yt.artemislena.eu/latest_version?id=${videoId}&itag=140`;
    const fallbackStream = await fetch(fallbackUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (fallbackStream.ok && fallbackStream.body) {
      return new NextResponse(fallbackStream.body, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mp4',
          'Accept-Ranges': 'bytes',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    return new NextResponse('Audio no disponible', { status: 404 });

  } catch (error: any) {
    console.error('Error crítico extrayendo audio:', error.message);
    return new NextResponse('Error del servidor', { status: 500 });
  }
}