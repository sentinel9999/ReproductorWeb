import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Track } from '@/types/rokola';
import { addSavedTrack } from '@/lib/tracksStorage';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const audioFile = formData.get('file') as File | null;
    const imageFile = formData.get('coverFile') as File | null;
    const coverUrlInput = formData.get('coverUrl') as string | null;
    const title = (formData.get('title') as string) || 'Sin Título';
    const artist = (formData.get('artist') as string) || 'Artista Desconocido';

    if (!audioFile) {
      return NextResponse.json({ error: 'Debes proporcionar un archivo MP3.' }, { status: 400 });
    }

    // 1. Asegurar directorios
    const audioDir = path.join(process.cwd(), 'media', 'audio');
    const coversDir = path.join(process.cwd(), 'public', 'uploads', 'covers');

    if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
    if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir, { recursive: true });

    // 2. Guardar archivo MP3 en disco
    const cleanAudioName = `${Date.now()}-${audioFile.name.replace(/\s+/g, '_')}`;
    const audioPath = path.join(audioDir, cleanAudioName);
    const audioBytes = await audioFile.arrayBuffer();
    fs.writeFileSync(audioPath, Buffer.from(audioBytes));

    // 3. Determinar la portada
    let finalCoverUrl = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop';

    if (imageFile && imageFile.size > 0) {
      const cleanImageName = `${Date.now()}-${imageFile.name.replace(/\s+/g, '_')}`;
      const imagePath = path.join(coversDir, cleanImageName);
      const imageBytes = await imageFile.arrayBuffer();
      fs.writeFileSync(imagePath, Buffer.from(imageBytes));
      finalCoverUrl = `/uploads/covers/${cleanImageName}`;
    } else if (coverUrlInput && coverUrlInput.trim().startsWith('http')) {
      finalCoverUrl = coverUrlInput.trim();
    }

    // 4. Crear el objeto Track
    const newTrack: Track = {
      id: `track-${Date.now()}`,
      title: title.trim(),
      artist: artist.trim(),
      duration: 180,
      coverUrl: finalCoverUrl,
      audioUrl: `/api/stream/${cleanAudioName}`,
    };

    // 5. Guardar automáticamente en el listado global
    addSavedTrack(newTrack);

    return NextResponse.json(newTrack, { status: 201 });
  } catch (error) {
    console.error('Error al subir:', error);
    return NextResponse.json({ error: 'Fallo al procesar la subida.' }, { status: 500 });
  }
}