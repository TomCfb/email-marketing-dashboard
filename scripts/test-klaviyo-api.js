#!/usr/bin/env node

/**
 * Test script for Klaviyo API integration
 * Tests API key validation, campaigns, and metrics endpoints
 */

const https = require('https');
const { URL } = require('url');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
const BASE_URL = 'https://a.klaviyo.com/api';

if (!KLAVIYO_API_KEY) {
  console.error('❌ KLAVIYO_API_KEY not found in environment variables');
  process.exit(1);
}

console.log('🎹 Testing Klaviyo API Connection...\n');

/**
 * Make HTTP request to Klaviyo API
 */
function makeRequest(endpoint, method = 'GET') {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${endpoint}`);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'revision': '2024-10-15'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * Test endpoints
 */
const tests = [
  {
    name: 'Account Info',
    endpoint: '/accounts/',
    description: 'Validates API key and returns account information'
  },
  {
    name: 'Campaigns List',
    endpoint: '/campaigns/?filter=equals(messages.channel,\'email\')',
    description: 'Gets list of email campaigns'
  },
  {
    name: 'Campaign Metrics',
    endpoint: '/metrics/',
    description: 'Gets available metrics'
  },
  {
    name: 'Campaign Statistics',
    endpoint: '/campaign-recipient-estimations/',
    description: 'Gets campaign performance statistics'
  },
  {
    name: 'Profiles',
    endpoint: '/profiles/',
    description: 'Gets customer profiles'
  }
];

/**
 * Run all tests
 */
async function runTests() {
  console.log(`Testing ${tests.length} endpoints...\n`);
  
  for (const test of tests) {
    console.log(`🔍 Testing: ${test.name}`);
    console.log(`   Path: ${test.endpoint}`);
    console.log(`   Description: ${test.description}`);
    
    try {
      const result = await makeRequest(test.endpoint);
      
      if (result.status === 200) {
        console.log(`   ✅ Success (${result.status})`);
        
        // Show relevant data based on endpoint
        if (test.endpoint.includes('accounts')) {
          const account = result.data?.data?.[0];
          if (account) {
            console.log(`   📊 Account: ${account.attributes?.contact_information?.organization_name || 'N/A'}`);
            console.log(`   📧 Email: ${account.attributes?.contact_information?.default_sender_email || 'N/A'}`);
          }
        } else if (test.endpoint.includes('campaigns')) {
          const campaigns = result.data?.data || [];
          console.log(`   📊 Found ${campaigns.length} campaigns`);
          if (campaigns.length > 0) {
            const campaign = campaigns[0];
            console.log(`   📧 Latest: "${campaign.attributes?.name || 'Unnamed'}" (${campaign.attributes?.status || 'unknown'})`);
          }
        } else if (test.endpoint.includes('profiles')) {
          const profiles = result.data?.data || [];
          console.log(`   📊 Found ${profiles.length} profiles`);
          if (profiles.length > 0) {
            const profile = profiles[0];
            console.log(`   👤 Profile: ${profile.attributes?.email || 'No email'}`);
          }
        } else {
          console.log(`   📊 Response: ${JSON.stringify(result.data).substring(0, 100)}...`);
        }
      } else if (result.status === 401) {
        console.log(`   ❌ Authentication Failed (${result.status})`);
        console.log(`   💡 Check your API key in .env.local`);
      } else if (result.status === 403) {
        console.log(`   ⚠️  Access Denied (${result.status})`);
        console.log(`   💡 API key may lack required scopes for this endpoint`);
      } else if (result.status === 404) {
        console.log(`   ⚠️  Endpoint Not Found (${result.status})`);
        console.log(`   💡 Endpoint may not exist or path may be incorrect`);
      } else {
        console.log(`   ❌ Error (${result.status})`);
        console.log(`   💡 ${result.data?.errors?.[0]?.detail || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Request Failed`);
      console.log(`   💡 ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('🎯 Test Summary:');
  console.log('   - If Account Info succeeds, your API key is valid');
  console.log('   - If Campaigns List succeeds, you can fetch campaign data');
  console.log('   - If other endpoints fail with 403, check API key scopes in Klaviyo dashboard');
  console.log('   - Visit https://www.klaviyo.com/account#api-keys-tab to manage your API keys');
}

// Run the tests
runTests().catch(console.error);
