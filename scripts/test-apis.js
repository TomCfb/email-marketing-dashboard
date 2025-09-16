#!/usr/bin/env node

/**
 * API Testing and Debugging Script
 * Tests both Klaviyo and Triple Whale API connections with detailed error reporting
 */

const https = require('https');
const http = require('http');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY || 'pk_e144c1c656ee0812ec48376bc1391f2033';
const TRIPLE_WHALE_API_KEY = process.env.TRIPLE_WHALE_API_KEY || 'b8b87c3d-f7d9-4f9f-a79a-99a52fd5fa84';

console.log('🔍 API Connection Testing Script');
console.log('================================');

// Test Klaviyo API
async function testKlaviyoAPI() {
  console.log('\n📧 Testing Klaviyo API...');
  console.log(`Using API Key: ${KLAVIYO_API_KEY.substring(0, 10)}...`);
  
  const options = {
    hostname: 'a.klaviyo.com',
    port: 443,
    path: '/api/profiles?page[size]=1',
    method: 'GET',
    headers: {
      'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'revision': '2023-12-15'
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log('✅ Klaviyo API: SUCCESS');
            console.log(`Profiles found: ${jsonData.data?.length || 0}`);
          } else {
            console.log('❌ Klaviyo API: ERROR');
            console.log('Response:', jsonData);
          }
        } catch (e) {
          console.log('❌ Klaviyo API: Invalid JSON response');
          console.log('Raw response:', data);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log('❌ Klaviyo API: Connection Error');
      console.error(error.message);
      resolve();
    });

    req.setTimeout(10000, () => {
      console.log('❌ Klaviyo API: Timeout');
      req.destroy();
      resolve();
    });

    req.end();
  });
}

// Test Triple Whale API
async function testTripleWhaleAPI() {
  console.log('\n🐋 Testing Triple Whale API...');
  console.log(`Using API Key: ${TRIPLE_WHALE_API_KEY.substring(0, 10)}...`);
  
  const postData = JSON.stringify({
    start_date: '2024-01-01',
    end_date: '2024-01-31'
  });

  const options = {
    hostname: 'developers.triplewhale.com',
    port: 443,
    path: '/api/summary-page',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TRIPLE_WHALE_API_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log('✅ Triple Whale API: SUCCESS');
            console.log('Summary data received');
          } else {
            console.log('❌ Triple Whale API: ERROR');
            console.log('Response:', jsonData);
          }
        } catch (e) {
          console.log('❌ Triple Whale API: Invalid JSON response');
          console.log('Raw response:', data);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log('❌ Triple Whale API: Connection Error');
      console.error(error.message);
      resolve();
    });

    req.setTimeout(10000, () => {
      console.log('❌ Triple Whale API: Timeout');
      req.destroy();
      resolve();
    });

    req.end();
  });
}

// Test local API endpoints
async function testLocalEndpoints() {
  console.log('\n🏠 Testing Local API Endpoints...');
  
  const endpoints = [
    'http://localhost:3001/api/klaviyo/metrics?from=2024-01-01&to=2024-01-31',
    'http://localhost:3001/api/triple-whale/metrics?from=2024-01-01&to=2024-01-31'
  ];

  for (const endpoint of endpoints) {
    console.log(`\nTesting: ${endpoint}`);
    
    const url = new URL(endpoint);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: 'GET'
    };

    await new Promise((resolve) => {
      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            if (res.statusCode === 200) {
              console.log(`✅ ${url.pathname}: SUCCESS`);
              console.log(`Data keys: ${Object.keys(jsonData.data || {}).join(', ')}`);
            } else {
              console.log(`❌ ${url.pathname}: ERROR (${res.statusCode})`);
            }
          } catch (e) {
            console.log(`❌ ${url.pathname}: Invalid JSON`);
          }
          resolve();
        });
      });

      req.on('error', (error) => {
        console.log(`❌ ${url.pathname}: ${error.message}`);
        resolve();
      });

      req.setTimeout(5000, () => {
        console.log(`❌ ${url.pathname}: Timeout`);
        req.destroy();
        resolve();
      });

      req.end();
    });
  }
}

// Main execution
async function main() {
  await testKlaviyoAPI();
  await testTripleWhaleAPI();
  await testLocalEndpoints();
  
  console.log('\n📋 Next Steps:');
  console.log('1. If APIs show authentication errors, update .env.local with real API keys');
  console.log('2. For Klaviyo: Get API key from https://www.klaviyo.com/account#api-keys-tab');
  console.log('3. For Triple Whale: Get API key from your Triple Whale dashboard');
  console.log('4. Restart the development server after updating credentials');
}

main().catch(console.error);
