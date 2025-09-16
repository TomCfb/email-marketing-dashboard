#!/usr/bin/env node

/**
 * Triple Whale API Test Script
 * Tests the Triple Whale API connection and validates API key functionality
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const TRIPLE_WHALE_API_KEY = process.env.TRIPLE_WHALE_API_KEY;
const BASE_URL = 'https://api.triplewhale.com/api/v2';

if (!TRIPLE_WHALE_API_KEY) {
  console.error('❌ TRIPLE_WHALE_API_KEY not found in environment variables');
  console.log('Please add your Triple Whale API key to .env.local');
  process.exit(1);
}

console.log('🐋 Testing Triple Whale API Connection...\n');

/**
 * Make HTTP request to Triple Whale API
 */
function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'x-api-key': TRIPLE_WHALE_API_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Test API endpoints
 */
async function testEndpoints() {
  const endpoints = [
    {
      name: 'API Key Validation',
      path: '/users/api-keys/me',
      method: 'GET',
      description: 'Validates API key and returns user info'
    },
    {
      name: 'Summary Page Data',
      path: '/summary-page',
      method: 'POST',
      description: 'Gets summary metrics data',
      body: {
        start_date: '2024-01-01',
        end_date: '2024-01-31'
      }
    },
    {
      name: 'Attribution Data',
      path: '/attribution/get-orders-with-journeys-v2',
      method: 'POST',
      description: 'Gets customer journey attribution data',
      body: {
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        limit: 10
      }
    }
  ];

  console.log(`Testing ${endpoints.length} endpoints...\n`);

  for (const endpoint of endpoints) {
    console.log(`🔍 Testing: ${endpoint.name}`);
    console.log(`   Path: ${endpoint.path}`);
    console.log(`   Method: ${endpoint.method}`);
    console.log(`   Description: ${endpoint.description}`);
    
    try {
      const response = await makeRequest(endpoint.path, {
        method: endpoint.method,
        body: endpoint.body
      });
      
      if (response.statusCode === 200) {
        console.log(`   ✅ Success (${response.statusCode})`);
        if (endpoint.name === 'API Key Validation') {
          console.log(`   📊 User Data:`, JSON.stringify(response.data, null, 2));
        } else {
          console.log(`   📊 Response Keys:`, Object.keys(response.data || {}));
        }
      } else if (response.statusCode === 401) {
        console.log(`   ❌ Authentication Failed (${response.statusCode})`);
        console.log(`   💡 Check your API key in .env.local`);
      } else if (response.statusCode === 403) {
        console.log(`   ⚠️  Access Denied (${response.statusCode})`);
        console.log(`   💡 API key may lack required scopes for this endpoint`);
      } else if (response.statusCode === 404) {
        console.log(`   ⚠️  Endpoint Not Found (${response.statusCode})`);
        console.log(`   💡 Endpoint may not exist or path may be incorrect`);
      } else {
        console.log(`   ❌ Failed (${response.statusCode})`);
        console.log(`   📝 Response:`, response.data);
      }
    } catch (error) {
      console.log(`   ❌ Network Error: ${error.message}`);
    }
    
    console.log('');
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    await testEndpoints();
    
    console.log('🎯 Test Summary:');
    console.log('   - If API Key Validation succeeds, your key is valid');
    console.log('   - If other endpoints fail with 403, check API key scopes in Triple Whale dashboard');
    console.log('   - Visit https://app.triplewhale.com/api-keys to manage your API keys');
    console.log('   - Ensure your API key has "Summary Page: Read" and "Pixel Attribution: Read" scopes');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

main();
