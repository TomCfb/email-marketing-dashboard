import { NextRequest, NextResponse } from 'next/server';
import { TripleWhaleMCPStdioClient } from '@/lib/mcp/triple-whale-mcp-client';
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
    const apiKey = process.env.TRIPLE_WHALE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Triple Whale API key not configured' },
        { status: 500 }
      );
    }

    // Use MCP stdio client for real Triple Whale integration
    const useMCPStdio = process.env.TRIPLE_WHALE_USE_MCP_STDIO === 'true';
    
    console.log('Triple Whale MCP Debug:', {
      useMCPStdio,
      envValue: process.env.TRIPLE_WHALE_USE_MCP_STDIO,
      apiKeyExists: !!apiKey
    });
    
    // Use MCP stdio client since Triple Whale uses MCP protocol, not REST API
    if (useMCPStdio) {
      console.log('Using Triple Whale MCP stdio client...');
      try {
        const mcpClient = new TripleWhaleMCPStdioClient(apiKey);
        const result = await mcpClient.getMetrics({ from: query.from, to: query.to });
        await mcpClient.close();
        console.log('MCP stdio result:', result);
        return NextResponse.json(
          {
            ...result,
            meta: {
              liveSource: 'triple_whale',
              fetchedAt: new Date().toISOString(),
            },
          },
          {
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
              Pragma: 'no-cache',
              Expires: '0',
              'Surrogate-Control': 'no-store',
            },
          }
        );
      } catch (error) {
        console.error('MCP stdio client error:', error);
        return NextResponse.json(
          { error: 'Triple Whale MCP stdio failed', details: (error as Error).message },
          { status: 503 }
        );
      }
    }

    // Live-only policy: if MCP stdio is not enabled, return explicit error (no fallback)
    return NextResponse.json(
      { error: 'Triple Whale MCP stdio not enabled (TRIPLE_WHALE_USE_MCP_STDIO=true required)' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error fetching Triple Whale metrics:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch Triple Whale metrics' },
      { status: 500 }
    );
  }
}
