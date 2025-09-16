# Real Data Setup Guide

This guide will help you configure real API credentials to fetch actual data from Klaviyo and Triple Whale APIs.

## Current Status

✅ **Klaviyo API**: Working with real data! The API is successfully connecting and fetching:
- Real profile/subscriber counts
- Campaign data (when available)
- Flow information
- Basic metrics

❌ **Triple Whale API**: Needs proper configuration
- Current endpoint updated to correct `/summary-page` POST method
- Requires valid API key from your Triple Whale dashboard
- Currently using fallback data

## Step 1: Klaviyo API Setup (Already Working!)

Your Klaviyo API is already configured and working with real data. The current setup:

```bash
# In your .env.local file
KLAVIYO_API_KEY=pk_e144c1c656ee0812ec48376bc1391f2033
```

**To get more comprehensive data:**
1. Visit [Klaviyo API Keys](https://www.klaviyo.com/account#api-keys-tab)
2. Generate a new Private API Key with these scopes:
   - `Campaigns:Read`
   - `Flows:Read` 
   - `Profiles:Read`
   - `Metrics:Read`
   - `Lists:Read`
   - `Segments:Read`
3. Replace the API key in your `.env.local` file

## Step 2: Triple Whale API Setup

**Get Your API Key:**
1. Log into your [Triple Whale Dashboard](https://app.triplewhale.com/)
2. Navigate to [API Keys page](https://app.triplewhale.com/api-keys)
3. Click "Create Key"
4. Select these scopes:
   - `Summary Page: Read` - For pulling summary metrics
   - `Pixel Attribution: Read` - For customer journey data
5. Save your API key securely

**Update Your Environment:**
```bash
# In your .env.local file
TRIPLE_WHALE_API_KEY=your_real_api_key_here
```

## Step 3: Test Your Configuration

Run the API testing script to verify everything is working:

```bash
npm run test-apis
# or
node scripts/test-apis.js
```

Expected results:
- ✅ Klaviyo API: SUCCESS (already working)
- ✅ Triple Whale API: SUCCESS (after adding real API key)
- ✅ Local endpoints: Both returning real data

## Step 4: Restart Development Server

After updating your API keys:

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## What Data You'll Get

### Klaviyo Real Data:
- **Subscribers**: Actual profile count from your account
- **Campaigns**: Real campaign performance metrics
- **Flows**: Active automation flows
- **Engagement**: Open rates, click rates from actual campaigns
- **Revenue**: Attribution data from email campaigns

### Triple Whale Real Data:
- **Revenue**: Total and attributed revenue
- **Orders**: Order count and average order value
- **Customers**: New vs returning customer metrics
- **Attribution**: Marketing channel performance
- **ROAS**: Return on ad spend calculations
- **Customer LTV**: Lifetime value metrics

## Troubleshooting

### Klaviyo Issues:
- **Rate Limits**: API has rate limits (75 requests/minute)
- **Permissions**: Ensure API key has required scopes
- **Data Availability**: Some metrics require campaign activity

### Triple Whale Issues:
- **Authentication**: Verify API key is correct and active
- **Scopes**: Ensure proper permissions are selected
- **Endpoint**: Using POST to `/summary-page` (already fixed)

### Common Solutions:
1. **Check API Keys**: Ensure they're correctly set in `.env.local`
2. **Restart Server**: Always restart after changing environment variables
3. **Check Logs**: Monitor console for specific error messages
4. **Test Endpoints**: Use the testing script to isolate issues

## API Rate Limits

- **Klaviyo**: 75 requests/minute, 700 requests/hour
- **Triple Whale**: Varies by plan, typically 1000 requests/hour

## Security Notes

- Never commit real API keys to version control
- Use `.env.local` for local development
- Use environment variables in production
- Rotate API keys regularly

## Next Steps

1. **Get Triple Whale API Key** from your dashboard
2. **Update .env.local** with the real key
3. **Restart development server**
4. **Run test script** to verify everything works
5. **Check dashboard** for real data display

Your dashboard will then display actual business metrics instead of fallback data!
