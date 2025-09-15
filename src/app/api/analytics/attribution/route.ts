import { NextRequest, NextResponse } from 'next/server';
import { DataSyncEngine } from '@/lib/mcp/sync-engine';
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

    const klaviyoApiKey = process.env.KLAVIYO_API_KEY;
    const tripleWhaleApiKey = process.env.TRIPLE_WHALE_API_KEY;

    if (!klaviyoApiKey || !tripleWhaleApiKey) {
      return NextResponse.json(
        { error: 'API keys not configured' },
        { status: 500 }
      );
    }

    const syncEngine = new DataSyncEngine(klaviyoApiKey, tripleWhaleApiKey);
    const attribution = await syncEngine.calculateRevenueAttribution({
      from: query.from,
      to: query.to,
    });

    return NextResponse.json({
      data: attribution,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error calculating revenue attribution:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to calculate revenue attribution' },
      { status: 500 }
    );
  }
}
