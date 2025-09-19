import { NextRequest, NextResponse } from 'next/server';
import { KlaviyoMCPClient } from '@/lib/mcp/klaviyo';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const apiKey = process.env.KLAVIYO_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Klaviyo API key not configured' }, { status: 500 });
    }

    const campaignId = params.id;
    if (!campaignId) {
      return NextResponse.json({ error: 'Missing campaign id' }, { status: 400 });
    }

    const timeframe = req.nextUrl.searchParams.get('timeframe') as 'last_12_months' | 'last_24_months' | 'all_time' | null;
    const client = new KlaviyoMCPClient(apiKey);
    const stats = await client.getCampaignStats(campaignId, timeframe ?? undefined);

    return NextResponse.json(
      {
        ...stats,
        meta: {
          liveSource: 'klaviyo',
          fetchedAt: new Date().toISOString(),
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
          'Surrogate-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch campaign stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
