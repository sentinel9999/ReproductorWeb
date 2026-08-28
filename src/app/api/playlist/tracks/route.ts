import { NextRequest, NextResponse } from 'next/server';
import { removeTrackFromPlaylist } from '@/lib/playlistsStorage';

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; trackId: string }> }
) {
  try {
    const { id, trackId } = await context.params;
    const success = removeTrackFromPlaylist(id, trackId);

    if (!success) {
      return NextResponse.json({ error: 'No se pudo remover la canción de la playlist.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Canción removida de la playlist con éxito.' }, { status: 200 });
  } catch (error) {
    console.error('Error en DELETE playlist track:', error);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}