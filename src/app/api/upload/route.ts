import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/ogg',
            'audio/webm',
            'image/jpeg',
            'image/png',
            'image/webp'
          ],
          maximumSizeInBytes: 50 * 1024 * 1024, // Límite de 50MB por archivo
        };
      },
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Error al autorizar subida a Blob:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}