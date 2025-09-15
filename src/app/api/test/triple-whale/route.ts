import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const testSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  endpoint: z.string().url('Invalid endpoint URL').optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey } = testSchema.parse(body);

    // Since Triple Whale API endpoints are not accessible in development,
    // we'll validate the API key format and return a mock success response
    if (!apiKey || apiKey.length < 10) {
      return NextResponse.json({
        success: false,
        error: 'Invalid API key format',
        details: 'API key must be at least 10 characters long',
      }, { status: 400 });
    }

    // Mock successful connection for development
    return NextResponse.json({
      success: true,
      message: 'Triple Whale connection successful (mock)',
      accountInfo: {
        status: 'Connected',
        endpoint: 'https://api.triplewhale.com',
        mode: 'development',
      },
    });

  } catch (error) {
    console.error('Triple Whale connection test error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request parameters',
        details: error.issues,
      }, { status: 400 });
    }

    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        error: 'Connection test failed',
        details: error.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: false,
      error: 'Unknown error occurred',
    }, { status: 500 });
  }
}
