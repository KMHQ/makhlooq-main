import { NextResponse } from 'next/server';
import { getOrSetCache } from '../../../../lib/redis';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Missing fleet slug parameter' }, { status: 400 });
    }

    const data = await getOrSetCache(`fleetyards:stats:${slug}`, async () => {
      const baseUrl = `https://api.fleetyards.net/v1/public/fleets/${encodeURIComponent(slug)}/stats`;
      const options = {
        headers: { Accept: 'application/json' },
        next: { revalidate: 60 },
      };

      const [membersResponse, vehiclesResponse] = await Promise.all([
        fetch(`${baseUrl}/members`, options),
        fetch(`${baseUrl}/vehicles`, options),
      ]);

      if (!membersResponse.ok || !vehiclesResponse.ok) {
        const failedResponse = !membersResponse.ok ? membersResponse : vehiclesResponse;
        const resData = await failedResponse.json().catch(() => ({}));

        throw new Error(
          resData?.message || resData?.error || `FleetYards API error (${failedResponse.status})`
        );
      }

      const [members, vehicles] = await Promise.all([
        membersResponse.json(),
        vehiclesResponse.json(),
      ]);

      return { members, vehicles };
    }, 300); // 5-minute cache

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || 'Unexpected FleetYards fetch error' },
      { status: 500 }
    );
  }
}
