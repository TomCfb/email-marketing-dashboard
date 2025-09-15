import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const configSchema = z.object({
  klaviyoApiKey: z.string(),
  klaviyoEndpoint: z.string().url(),
  tripleWhaleApiKey: z.string(),
  tripleWhaleEndpoint: z.string().url(),
  useMockData: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config = configSchema.parse(body);

    // In a real application, you might save this to a database
    // For now, we'll just validate and return success
    
    return NextResponse.json({
      success: true,
      message: 'Configuration saved successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Config save error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid configuration data',
        details: error.issues,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to save configuration',
    }, { status: 500 });
  }
}
