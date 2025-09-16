import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyValidator } from '@/lib/mcp/api-key-validator';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    logger.info('API_KEY_VALIDATION_ROUTE', 'Starting API key validation request', {
      requestId,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    });

    const body = await request.json();
    const { service, apiKey, baseUrl } = body;

    if (!service || !apiKey) {
      logger.warn('API_KEY_VALIDATION_ROUTE', 'Missing required parameters', {
        requestId,
        hasService: !!service,
        hasApiKey: !!apiKey
      });

      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: service and apiKey'
      }, { status: 400 });
    }

    let validator: ApiKeyValidator;
    let validationResult;

    switch (service.toLowerCase()) {
      case 'triple-whale':
        validator = new ApiKeyValidator(
          baseUrl || 'https://api.triplewhale.com/api/v2',
          apiKey,
          'x-api-key'
        );
        validationResult = await validator.validateTripleWhaleApiKey();
        break;

      case 'klaviyo':
        validator = new ApiKeyValidator(
          baseUrl || 'https://a.klaviyo.com/api',
          apiKey,
          'Authorization'
        );
        validationResult = await validator.validateKlaviyoApiKey();
        break;

      default:
        logger.warn('API_KEY_VALIDATION_ROUTE', 'Unsupported service', {
          requestId,
          service
        });

        return NextResponse.json({
          success: false,
          error: `Unsupported service: ${service}. Supported services: triple-whale, klaviyo`
        }, { status: 400 });
    }

    logger.info('API_KEY_VALIDATION_ROUTE', 'API key validation completed', {
      requestId,
      service,
      isValid: validationResult.isValid,
      hasRequiredScopes: validationResult.hasRequiredScopes,
      availableEndpoints: validationResult.availableEndpoints.length,
      missingScopes: validationResult.missingScopes.length
    });

    return NextResponse.json({
      success: true,
      service,
      validation: validationResult,
      requestId
    });

  } catch (error) {
    logger.error('API_KEY_VALIDATION_ROUTE', 'API key validation failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, error as Error);

    return NextResponse.json({
      success: false,
      error: 'Internal server error during API key validation',
      requestId
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed. Use POST to validate API keys.',
    supportedServices: ['triple-whale', 'klaviyo'],
    requiredFields: ['service', 'apiKey'],
    optionalFields: ['baseUrl']
  }, { status: 405 });
}
