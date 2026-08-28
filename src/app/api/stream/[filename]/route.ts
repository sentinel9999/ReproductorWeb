import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  const { filename } = await context.params;

  // Busca el archivo en la carpeta 'media/audio/' en la raíz de tu proyecto
  const filePath = path.join(process.cwd(), 'media', 'audio', filename);

  // Si el archivo local no existe en disco, devuelve 404
  if (!fs.existsSync(filePath)) {
    return new NextResponse(`Archivo de audio "${filename}" no encontrado en /media/audio/`, {
      status: 404,
    });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.get('range');

  // Soporte para Range Requests (Seek / Adelantar y retroceder sin descargar todo)
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    const nodeStream = fs.createReadStream(filePath, { start, end });

    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on('data', (chunk) => controller.enqueue(chunk));
        nodeStream.on('end', () => controller.close());
        nodeStream.on('error', (err) => controller.error(err));
      },
      cancel() {
        nodeStream.destroy();
      },
    });

    return new NextResponse(webStream, {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize.toString(),
        'Content-Type': 'audio/mpeg',
      },
    });
  }

  // Entrega inicial completa
  const fullNodeStream = fs.createReadStream(filePath);
  const webStream = new ReadableStream({
    start(controller) {
      fullNodeStream.on('data', (chunk) => controller.enqueue(chunk));
      fullNodeStream.on('end', () => controller.close());
      fullNodeStream.on('error', (err) => controller.error(err));
    },
    cancel() {
      fullNodeStream.destroy();
    },
  });

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      'Content-Length': fileSize.toString(),
      'Content-Type': 'audio/mpeg',
    },
  });
}