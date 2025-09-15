import { NextResponse } from 'next/server';
import { DataSyncEngine } from '@/lib/mcp/sync-engine';

export async function GET() {
  try {
    const klaviyoApiKey = process.env.KLAVIYO_API_KEY;
    const tripleWhaleApiKey = process.env.TRIPLE_WHALE_API_KEY;

    if (!klaviyoApiKey || !tripleWhaleApiKey) {
      return NextResponse.json(
        { error: 'API keys not configured' },
        { status: 500 }
      );
    }

    const syncEngine = new DataSyncEngine(klaviyoApiKey, tripleWhaleApiKey);
    const customers = await syncEngine.matchCustomers();

    return NextResponse.json({
      data: customers,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching unified customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unified customer data' },
      { status: 500 }
    );
  }
}
