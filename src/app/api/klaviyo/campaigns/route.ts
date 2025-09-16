import { NextResponse } from 'next/server';
import { KlaviyoMCPClient } from '@/lib/mcp/klaviyo';

export async function GET() {
  try {
    // Get API key from environment
    const apiKey = process.env.KLAVIYO_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Klaviyo API key not configured' },
        { status: 500 }
      );
    }

    console.log('Klaviyo API: Attempting to fetch campaigns...');
    const client = new KlaviyoMCPClient(apiKey);
    const campaigns = await client.getCampaigns();

    console.log('Klaviyo API: Successfully fetched campaigns:', campaigns.data?.length);
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Klaviyo API: Error fetching campaigns:', error);

    return NextResponse.json(
      { 
        error: 'Failed to fetch real Klaviyo campaigns',
        message: 'Check API key permissions and scopes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}
