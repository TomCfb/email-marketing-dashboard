# Triple Whale MCP Server Setup Guide

## Discovery

Triple Whale uses the **Model Context Protocol (MCP)** for AI integrations, not direct REST API calls. This explains why our direct API calls were failing with 404/403 errors.

## Official Triple Whale MCP Server

Triple Whale provides an official MCP server package: `@triplewhale/mcp-server-triplewhale`

### Key Information:
- **Package**: `@triplewhale/mcp-server-triplewhale` (npm)
- **Latest Version**: 0.0.6 (published 2 days ago)
- **GitHub**: https://github.com/Triple-Whale/mcp-server-triplewhale
- **Purpose**: Allows natural language queries to Triple Whale data through Claude Desktop

## Setup Instructions

### Requirements:
- Node.js >= v18.0.0
- Claude Desktop
- Triple Whale API key with proper scopes

### Installation:
```bash
npx -y @triplewhale/mcp-server-triplewhale init $TRIPLEWHALE_API_KEY
```

### Usage:
After installation, you can use natural language queries like:
- "What's my meta spend in the last 7 days?"
- "Show me revenue attribution data"
- "Get summary metrics for this month"

## Supported Tools:
- **moby**: Natural language query tool for Triple Whale data

## Integration Options for Our Dashboard

### Option 1: Use Official MCP Server (Recommended)
- Install the official MCP server locally
- Configure it to run on a specific port (e.g., localhost:3002)
- Update our `TRIPLE_WHALE_MCP_ENDPOINT` to point to the MCP server
- Modify our client to communicate with the MCP server instead of direct API

### Option 2: Direct API Integration (Current - Limited)
- Continue using direct API calls (limited functionality)
- Some endpoints may not be available or require different authentication
- May not provide full access to Triple Whale's analytics capabilities

## Next Steps:

1. **Install Official MCP Server**:
   ```bash
   npx -y @triplewhale/mcp-server-triplewhale init $TRIPLEWHALE_API_KEY
   ```

2. **Configure MCP Server Endpoint**:
   - Update `.env.local` with correct MCP server endpoint
   - Modify our Triple Whale client to use MCP protocol

3. **Test Integration**:
   - Verify MCP server is running
   - Test natural language queries
   - Update our dashboard to use MCP-based data fetching

## Benefits of MCP Integration:
- ✅ Official support from Triple Whale
- ✅ Natural language query capabilities
- ✅ Full access to Triple Whale's analytics platform
- ✅ Standardized protocol for AI integrations
- ✅ Better error handling and data validation

## Current Status:
- ❌ Direct API calls failing (404/403 errors)
- ✅ API key is valid and working
- ⏳ Need to implement MCP server integration
