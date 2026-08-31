import { NextRequest, NextResponse } from 'next/server';
import { removeTrackFromPlaylist } from '@/lib/playlistsStorage';

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const trackId = searchParams.get('trackId');

    if (!id || !trackId) {
      return NextResponse.json(
        { error: 'Parámetros "id" y "trackId" son requeridos en la URL.' },
        { status: 400 }
      );
    }

    const success = removeTrackFromPlaylist(id, trackId);

    if (!success) {
      return NextResponse.json(
        { error: 'No se pudo remover la canción de la playlist.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Canción removida de la playlist con éxito.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en DELETE playlist track:', error);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}