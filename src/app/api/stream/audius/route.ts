import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id) {
    return new NextResponse('ID requerido', { status: 400 });
  }

  try {
    // Consulta al resolvedor oficial de Audius siguiendo la redirección nativamente
    const res = await fetch(`https://api.audius.co/v1/tracks/${id}/stream?app_name=ROKOLA`, {
      redirect: 'manual', // Capturamos la URL exacta de redirección
    });

    const redirectLocation = res.headers.get('location');

    if (redirectLocation) {
      // Redirige al MP3 directo en el servidor de contenidos (CDN)
      return NextResponse.redirect(redirectLocation, 302);
    }

    // Si respondió directamente el stream en vez de redirección
    if (res.ok && res.body) {
      return new NextResponse(res.body, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Accept-Ranges': 'bytes',
        },
      });
    }

    return new NextResponse('Audio no disponible', { status: 404 });
  } catch (error) {
    console.error('Error en proxy de audio:', error);
    return new NextResponse('Error interno', { status: 500 });
  }
}