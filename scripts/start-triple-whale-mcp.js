#!/usr/bin/env node

/**
 * Triple Whale MCP Server Starter
 * Starts the Triple Whale MCP server on a specific port for dashboard integration
 */

const { spawn } = require('child_process');
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
const PORT = process.env.TRIPLE_WHALE_MCP_PORT || 3002;

if (!TRIPLE_WHALE_API_KEY) {
  console.error('❌ TRIPLE_WHALE_API_KEY not found in environment variables');
  console.log('Please add your Triple Whale API key to .env.local');
  process.exit(1);
}

console.log('🐋 Starting Triple Whale MCP Server...');
console.log(`📡 Port: ${PORT}`);
console.log(`🔑 API Key: ${TRIPLE_WHALE_API_KEY.substring(0, 8)}...`);

// Start the MCP server
const mcpProcess = spawn('npx', [
  '-y',
  '@triplewhale/mcp-server-triplewhale',
  'start',
  TRIPLE_WHALE_API_KEY
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: PORT
  }
});

mcpProcess.on('error', (error) => {
  console.error('❌ Failed to start MCP server:', error.message);
  process.exit(1);
});

mcpProcess.on('close', (code) => {
  console.log(`🛑 MCP server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down MCP server...');
  mcpProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down MCP server...');
  mcpProcess.kill('SIGTERM');
});

console.log('✅ MCP server started successfully');
console.log('🔗 Endpoint: http://localhost:' + PORT);
console.log('Press Ctrl+C to stop the server');
