import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return new NextResponse('ID requerido', { status: 400 });
  }

  try {
    const res = await fetch(`https://api.audius.co/v1/tracks/${encodeURIComponent(id)}/stream?app_name=ROKOLA`, {
      redirect: 'manual',
    });

    const redirectLocation = res.headers.get('location');

    if (redirectLocation) {
      return NextResponse.redirect(redirectLocation, 302);
    }

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