import { NextRequest, NextResponse } from 'next/server';

export interface RadioStationDTO {
  id: string;
  name: string;
  genre: string;
  country: string;
  countryCode: string;
  coverUrl: string;
  streamUrl: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name') || '';
  const country = searchParams.get('country') || '';
  const tag = searchParams.get('tag') || '';
  const limit = searchParams.get('limit') || '30';

  try {
    const params = new URLSearchParams({
      limit,
      hidebroken: 'true',
      order: 'clickcount',
      reverse: 'true',
    });

    if (name) params.append('name', name);
    if (country) params.append('countrycode', country);
    if (tag) params.append('tag', tag);

    const res = await fetch(`https://de1.api.radio-browser.info/json/stations/search?${params.toString()}`);
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Error al consultar Radio Browser' }, { status: 502 });
    }

    const rawData = await res.json();

    const stations: RadioStationDTO[] = rawData.map((item: any) => ({
      id: `radio-${item.stationuuid}`,
      name: item.name.trim(),
      genre: item.tags ? item.tags.split(',')[0].trim() : 'Varios',
      country: item.country || 'Global',
      countryCode: item.countrycode || '',
      coverUrl: item.favicon && item.favicon.startsWith('http')
        ? item.favicon
        : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
      streamUrl: item.url_resolved,
    }));

    return NextResponse.json(stations);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}