import { NextRequest, NextResponse } from 'next/server';
import { TripleWhaleMCPClient } from '@/lib/mcp/triple-whale';
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

    const apiKey = process.env.TRIPLE_WHALE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Triple Whale API key not configured' },
        { status: 500 }
      );
    }

    const client = new TripleWhaleMCPClient(apiKey);
    const metrics = await client.getMetrics({
      from: query.from,
      to: query.to,
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching Triple Whale metrics:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch Triple Whale metrics' },
      { status: 500 }
    );
  }
}
