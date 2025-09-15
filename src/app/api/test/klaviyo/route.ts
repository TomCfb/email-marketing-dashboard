import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const testSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  endpoint: z.string().url('Invalid endpoint URL').optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, endpoint } = testSchema.parse(body);

    const baseUrl = endpoint || 'https://a.klaviyo.com/api';
    
    // Test connection with a simple API call
    const response = await fetch(`${baseUrl}/accounts`, {
      method: 'GET',
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'Content-Type': 'application/json',
        'revision': '2024-02-15',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        error: `API Error: ${response.status} ${response.statusText}`,
        details: errorText,
      }, { status: 400 });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Klaviyo connection successful',
      accountInfo: {
        id: data.data?.[0]?.id || 'Unknown',
        name: data.data?.[0]?.attributes?.company_name || 'Unknown',
      },
    });

  } catch (error) {
    console.error('Klaviyo connection test error:', error);
    
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
