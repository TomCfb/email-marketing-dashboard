import { NextResponse } from 'next/server';
import { KlaviyoMCPClient } from '@/lib/mcp/klaviyo';

export async function GET() {
  try {
    // Get API key from environment or use default
    const apiKey = process.env.KLAVIYO_API_KEY || 'pk_e144c1c656ee0812ec48376bc1391f2033';
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Klaviyo API key not configured' },
        { status: 500 }
      );
    }

    const client = new KlaviyoMCPClient(apiKey);
    const campaigns = await client.getCampaigns();

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching Klaviyo campaigns:', error);

    return NextResponse.json(
      { error: 'Failed to fetch Klaviyo campaigns' },
      { status: 500 }
    );
  }
}
