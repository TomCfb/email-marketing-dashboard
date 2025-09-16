#!/usr/bin/env node

/**
 * Triple Whale Shop ID Finder
 * This script helps you find your shop ID from the Triple Whale API
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.local') });

const API_KEY = process.env.TRIPLE_WHALE_API_KEY;
const BASE_URL = 'https://api.triplewhale.com/api/v2';

if (!API_KEY) {
  console.error('❌ TRIPLE_WHALE_API_KEY not found in .env.local');
  console.log('💡 Please add your API key to .env.local file');
  process.exit(1);
}

async function makeRequest(endpoint, method = 'GET', body = null) {
  const url = `${BASE_URL}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'x-api-key': API_KEY,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

async function findShopId() {
  console.log('🔍 Looking for your Triple Whale shop ID...\n');

  // Method 1: Check user info for shop details
  console.log('📋 Method 1: Checking user information...');
  const userResult = await makeRequest('/users/api-keys/me');
  
  if (userResult.ok) {
    console.log('✅ User info retrieved successfully');
    console.log(`👤 User: ${userResult.data.user?.name || 'Unknown'}`);
    console.log(`📧 Email: ${userResult.data.user?.email || 'Unknown'}`);
    
    // Look for shop-related fields in user data
    const userData = userResult.data.user || {};
    const possibleShopFields = ['shop_id', 'shopId', 'store_id', 'storeId', 'account_id', 'accountId'];
    
    for (const field of possibleShopFields) {
      if (userData[field]) {
        console.log(`🏪 Found potential shop ID in user data: ${field} = ${userData[field]}`);
      }
    }
  } else {
    console.log(`❌ Failed to get user info: ${userResult.status}`);
  }

  console.log('\n📋 Method 2: Trying common shop endpoints...');
  
  // Method 2: Try various shop-related endpoints
  const shopEndpoints = [
    '/shops',
    '/stores',
    '/accounts',
    '/shop/info',
    '/store/info',
    '/account/info',
    '/summary-page/shops',
    '/user/shops'
  ];

  for (const endpoint of shopEndpoints) {
    console.log(`🔍 Trying: ${endpoint}`);
    const result = await makeRequest(endpoint);
    
    if (result.ok) {
      console.log(`✅ Success! Data from ${endpoint}:`);
      console.log(JSON.stringify(result.data, null, 2));
      
      // Look for shop IDs in the response
      const dataStr = JSON.stringify(result.data);
      const shopIdMatches = dataStr.match(/"(?:shop_?id|store_?id|account_?id)"\s*:\s*"?([^",\s]+)"?/gi);
      
      if (shopIdMatches) {
        console.log('🎯 Found potential shop IDs:');
        shopIdMatches.forEach(match => console.log(`   ${match}`));
      }
      
      break;
    } else {
      console.log(`   ❌ ${result.status} - ${result.data?.message || 'Failed'}`);
    }
  }

  console.log('\n📋 Method 3: Manual instructions...');
  console.log('🌐 You can also find your shop ID by:');
  console.log('   1. Go to https://app.triplewhale.com/');
  console.log('   2. Log in to your account');
  console.log('   3. Look at the URL - it often contains your shop ID');
  console.log('   4. Check Settings > Account > Shop Information');
  console.log('   5. Or check Settings > Integrations > API Keys');
  
  console.log('\n📋 Method 4: URL inspection...');
  console.log('🔍 When you\'re logged into Triple Whale, check these URL patterns:');
  console.log('   • https://app.triplewhale.com/dashboard/[SHOP_ID]');
  console.log('   • https://app.triplewhale.com/shop/[SHOP_ID]/...');
  console.log('   • The shop ID is usually a string like "mystore.myshopify.com" or a numeric ID');

  console.log('\n💡 Once you find your shop ID, add it to your .env.local:');
  console.log('   TRIPLE_WHALE_SHOP_ID=your_shop_id_here');
}

// Run the script
findShopId().catch(console.error);
