import { logger } from '../logger';

export interface ApiKeyValidationResult {
  isValid: boolean;
  hasRequiredScopes: boolean;
  availableEndpoints: string[];
  missingScopes: string[];
  recommendations: string[];
  errorDetails?: string;
}

export interface ApiEndpointTest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  requiredScope?: string;
  testPayload?: Record<string, unknown>;
}

export class ApiKeyValidator {
  private baseUrl: string;
  private apiKey: string;
  private headers: Record<string, string>;

  constructor(baseUrl: string, apiKey: string, authHeader: string = 'Authorization') {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.headers = {
      [authHeader]: authHeader === 'x-api-key' ? apiKey : `Bearer ${apiKey}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
  }

  async validateTripleWhaleApiKey(): Promise<ApiKeyValidationResult> {
    const testEndpoints: ApiEndpointTest[] = [
      {
        endpoint: '/summary-page',
        method: 'POST',
        requiredScope: 'analytics:read',
        testPayload: {
          start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0]
        }
      },
      {
        endpoint: '/tw-metrics/metrics-data',
        method: 'POST',
        requiredScope: 'metrics:read',
        testPayload: {
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0],
          metrics: ['revenue', 'orders', 'customers']
        }
      },
      {
        endpoint: '/attribution/get-orders-with-journeys-v2',
        method: 'POST',
        requiredScope: 'attribution:read',
        testPayload: {
          start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0],
          limit: 10
        }
      },
      {
        endpoint: '/customers',
        method: 'GET',
        requiredScope: 'customers:read'
      },
      {
        endpoint: '/orders',
        method: 'GET',
        requiredScope: 'orders:read'
      }
    ];

    const results: ApiKeyValidationResult = {
      isValid: false,
      hasRequiredScopes: false,
      availableEndpoints: [],
      missingScopes: [],
      recommendations: []
    };

    logger.info('API_KEY_VALIDATION', 'Starting Triple Whale API key validation', {
      baseUrl: this.baseUrl,
      endpointsToTest: testEndpoints.length
    });

    let validEndpoints = 0;
    let authenticationValid = false;

    for (const test of testEndpoints) {
      try {
        const url = `${this.baseUrl}${test.endpoint}`;
        const requestOptions: RequestInit = {
          method: test.method,
          headers: this.headers,
        };

        if (test.testPayload && (test.method === 'POST' || test.method === 'PUT')) {
          requestOptions.body = JSON.stringify(test.testPayload);
        }

        logger.debug('API_KEY_VALIDATION', `Testing endpoint: ${test.endpoint}`, {
          method: test.method,
          requiredScope: test.requiredScope,
          hasPayload: !!test.testPayload
        });

        const response = await fetch(url, requestOptions);
        
        if (response.status === 200 || response.status === 201) {
          // Endpoint accessible - API key has required scope
          results.availableEndpoints.push(test.endpoint);
          validEndpoints++;
          authenticationValid = true;
          
          logger.info('API_KEY_VALIDATION', `✓ Endpoint accessible: ${test.endpoint}`, {
            status: response.status,
            scope: test.requiredScope
          });
        } else if (response.status === 401) {
          // Authentication failed - invalid API key
          results.errorDetails = 'Invalid API key or authentication failed';
          logger.error('API_KEY_VALIDATION', `✗ Authentication failed: ${test.endpoint}`, {
            status: response.status,
            scope: test.requiredScope
          });
          break;
        } else if (response.status === 403) {
          // Forbidden - API key valid but lacks required scope
          authenticationValid = true;
          if (test.requiredScope) {
            results.missingScopes.push(test.requiredScope);
          }
          
          logger.warn('API_KEY_VALIDATION', `✗ Insufficient permissions: ${test.endpoint}`, {
            status: response.status,
            scope: test.requiredScope,
            message: 'API key lacks required scope'
          });
        } else if (response.status === 404) {
          // Endpoint not found - might be deprecated or incorrect URL
          logger.warn('API_KEY_VALIDATION', `? Endpoint not found: ${test.endpoint}`, {
            status: response.status,
            message: 'Endpoint may be deprecated or URL incorrect'
          });
        } else {
          // Other error
          const errorText = await response.text().catch(() => 'Unknown error');
          logger.warn('API_KEY_VALIDATION', `✗ Endpoint error: ${test.endpoint}`, {
            status: response.status,
            error: errorText
          });
        }
      } catch (error) {
        logger.error('API_KEY_VALIDATION', `Network error testing ${test.endpoint}`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          endpoint: test.endpoint
        });
      }
    }

    // Determine validation results
    results.isValid = authenticationValid;
    results.hasRequiredScopes = validEndpoints > 0;

    // Generate recommendations
    if (!results.isValid) {
      results.recommendations.push('Verify API key is correct and active');
      results.recommendations.push('Check Triple Whale dashboard for API key status');
    } else if (!results.hasRequiredScopes) {
      results.recommendations.push('Contact Triple Whale support to upgrade API key permissions');
      results.recommendations.push('Request access to analytics, metrics, and attribution scopes');
    } else if (results.missingScopes.length > 0) {
      results.recommendations.push(`Request additional scopes: ${results.missingScopes.join(', ')}`);
      results.recommendations.push('Some dashboard features may be limited until all scopes are available');
    }

    if (results.availableEndpoints.length > 0) {
      results.recommendations.push(`Currently accessible endpoints: ${results.availableEndpoints.join(', ')}`);
    }

    logger.info('API_KEY_VALIDATION', 'Triple Whale API key validation completed', {
      isValid: results.isValid,
      hasRequiredScopes: results.hasRequiredScopes,
      availableEndpoints: results.availableEndpoints.length,
      missingScopes: results.missingScopes.length,
      recommendations: results.recommendations.length
    });

    return results;
  }

  async validateKlaviyoApiKey(): Promise<ApiKeyValidationResult> {
    const testEndpoints: ApiEndpointTest[] = [
      {
        endpoint: '/profiles',
        method: 'GET',
        requiredScope: 'profiles:read'
      },
      {
        endpoint: '/campaigns',
        method: 'GET',
        requiredScope: 'campaigns:read'
      },
      {
        endpoint: '/flows',
        method: 'GET',
        requiredScope: 'flows:read'
      }
    ];

    const results: ApiKeyValidationResult = {
      isValid: false,
      hasRequiredScopes: false,
      availableEndpoints: [],
      missingScopes: [],
      recommendations: []
    };

    logger.info('API_KEY_VALIDATION', 'Starting Klaviyo API key validation', {
      baseUrl: this.baseUrl,
      endpointsToTest: testEndpoints.length
    });

    let validEndpoints = 0;
    let authenticationValid = false;

    for (const test of testEndpoints) {
      try {
        const url = `${this.baseUrl}${test.endpoint}?page[size]=1`;
        const response = await fetch(url, {
          method: test.method,
          headers: this.headers,
        });

        if (response.status === 200) {
          results.availableEndpoints.push(test.endpoint);
          validEndpoints++;
          authenticationValid = true;
          
          logger.info('API_KEY_VALIDATION', `✓ Endpoint accessible: ${test.endpoint}`, {
            status: response.status,
            scope: test.requiredScope
          });
        } else if (response.status === 401 || response.status === 403) {
          if (response.status === 401) {
            results.errorDetails = 'Invalid Klaviyo API key';
          } else {
            authenticationValid = true;
            if (test.requiredScope) {
              results.missingScopes.push(test.requiredScope);
            }
          }
          
          logger.warn('API_KEY_VALIDATION', `✗ Access denied: ${test.endpoint}`, {
            status: response.status,
            scope: test.requiredScope
          });
        }
      } catch (error) {
        logger.error('API_KEY_VALIDATION', `Network error testing ${test.endpoint}`, {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    results.isValid = authenticationValid;
    results.hasRequiredScopes = validEndpoints > 0;

    // Generate Klaviyo-specific recommendations
    if (!results.isValid) {
      results.recommendations.push('Verify Klaviyo API key is correct and active');
      results.recommendations.push('Ensure API key has proper revision date (2023-12-15 or later)');
    } else if (results.missingScopes.length > 0) {
      results.recommendations.push(`Request Klaviyo scopes: ${results.missingScopes.join(', ')}`);
    }

    logger.info('API_KEY_VALIDATION', 'Klaviyo API key validation completed', {
      isValid: results.isValid,
      hasRequiredScopes: results.hasRequiredScopes,
      availableEndpoints: results.availableEndpoints.length
    });

    return results;
  }
}
