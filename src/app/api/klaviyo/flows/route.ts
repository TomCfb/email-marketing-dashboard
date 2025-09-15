import { NextResponse } from 'next/server';
import { KlaviyoMCPClient } from '@/lib/mcp/klaviyo';

export async function GET() {
  try {
    const apiKey = process.env.KLAVIYO_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Klaviyo API key not configured' },
        { status: 500 }
      );
    }

    const client = new KlaviyoMCPClient(apiKey);
    const flows = await client.getFlows();

    return NextResponse.json(flows);
  } catch (error) {
    console.error('Error fetching Klaviyo flows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Klaviyo flows' },
      { status: 500 }
    );
  }
}
