import { NextRequest, NextResponse } from 'next/server';
import { KlaviyoMCPClient } from '@/lib/mcp/klaviyo';
import { z } from 'zod';

const querySchema = z.object({
  from: z.string().transform((str) => new Date(str)),
  to: z.string().transform((str) => new Date(str)),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse({
      from: searchParams.get('from'),
      to: searchParams.get('to'),
    });

    // Get API key from environment or use default
    const apiKey = process.env.KLAVIYO_API_KEY || 'pk_e144c1c656ee0812ec48376bc1391f2033';
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Klaviyo API key not configured' },
        { status: 500 }
      );
    }

    const client = new KlaviyoMCPClient(apiKey);
    const campaigns = await client.getCampaigns({
      from: query.from,
      to: query.to,
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching Klaviyo campaigns:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch Klaviyo campaigns' },
      { status: 500 }
    );
  }
}
