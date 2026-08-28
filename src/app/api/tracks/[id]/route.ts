import { NextRequest, NextResponse } from 'next/server';
import { deleteSavedTrack } from '@/lib/tracksStorage';

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const result = deleteSavedTrack(id);

    if (!result.success) {
      return NextResponse.json(
        { error: 'No se encontró la canción o no se pudo eliminar' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Canción eliminada con éxito', track: result.deletedTrack });
  } catch (error) {
    console.error('Error en DELETE /api/tracks/[id]:', error);
    return NextResponse.json({ error: 'Fallo interno al eliminar' }, { status: 500 });
  }
}