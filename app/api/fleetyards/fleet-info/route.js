import { NextResponse } from 'next/server';
import { getOrSetCache } from '../../../../lib/redis';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Missing fleet slug parameter' }, { status: 400 });
    }

    const data = await getOrSetCache(`fleetyards:fleet-info:${slug}`, async () => {
      const targetUrl = `https://api.fleetyards.net/v1/public/fleets/${encodeURIComponent(slug)}`;
      const response = await fetch(targetUrl, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 60 },
      });
      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData?.message || resData?.error || `FleetYards API error (${response.status})`);
      }

      return resData;
    }, 300); // 5-minute cache

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error?.message || 'Unexpected fetch error' }, { status: 500 });
  }
}
