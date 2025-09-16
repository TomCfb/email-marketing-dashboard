import { NextRequest, NextResponse } from 'next/server';
import { KlaviyoMCPClient } from '@/lib/mcp/klaviyo';
import { logger } from '@/lib/logger';
import { DateRange } from '@/lib/types';

export async function GET(request: NextRequest) {
  const requestId = `api_klaviyo_metrics_${Date.now()}`;
  const startTime = Date.now();
  
  logger.info('API_KLAVIYO_METRICS', 'Incoming request', {
    requestId,
    url: request.url,
    method: request.method,
  });

  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    logger.debug('API_KLAVIYO_METRICS', 'Parsed query parameters', {
      requestId,
      from,
      to,
    });

    if (!from || !to) {
      logger.error('API_KLAVIYO_METRICS', 'Missing required parameters', {
        requestId,
        providedParams: { from, to },
      });
      return NextResponse.json(
        { error: 'Missing required parameters: from, to' },
        { status: 400 }
      );
    }

    const dateRange: DateRange = {
      from: new Date(from),
      to: new Date(to),
    };

    logger.debug('API_KLAVIYO_METRICS', 'Created date range', {
      requestId,
      dateRange: {
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      },
    });

    const apiKey = process.env.KLAVIYO_API_KEY;
    if (!apiKey) {
      logger.critical('API_KLAVIYO_METRICS', 'Klaviyo API key not configured in environment', {
        requestId,
        envVarName: 'KLAVIYO_API_KEY',
      });
      return NextResponse.json(
        { error: 'Klaviyo API key not configured' },
        { status: 500 }
      );
    }

    logger.debug('API_KLAVIYO_METRICS', 'Creating Klaviyo client', {
      requestId,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey.length,
    });

    const client = new KlaviyoMCPClient(apiKey);
    
    logger.info('API_KLAVIYO_METRICS', 'Calling client.getMetrics', {
      requestId,
      dateRange,
    });
    
    const metrics = await client.getMetrics(dateRange);
    
    const duration = Date.now() - startTime;
    logger.info('API_KLAVIYO_METRICS', 'Successfully retrieved metrics', {
      requestId,
      duration,
      success: metrics.success,
      metricsKeys: Object.keys(metrics.data || {}),
    });

    return NextResponse.json(metrics);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.critical('API_KLAVIYO_METRICS', 'Critical error in API route', {
      requestId,
      duration,
      errorMessage: (error as Error).message,
      errorStack: (error as Error).stack,
    }, error as Error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        requestId,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
