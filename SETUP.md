# Setup Guide

## 🚀 Quick Start

### 1. GitHub Repository Setup

Since the GitHub repository needs to be created manually, follow these steps:

1. **Create GitHub Repository**
   - Go to https://github.com/new
   - Repository name: `email-marketing-dashboard`
   - Description: `Professional email marketing analytics dashboard integrating Klaviyo and Triple Whale data`
   - Set to Public
   - Don't initialize with README (we already have one)
   - Click "Create repository"

2. **Push Code to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/email-marketing-dashboard.git
   git branch -M main
   git push -u origin main
   ```

### 2. Environment Configuration

1. **Copy Environment File**
   ```bash
   cp env.example .env.local
   ```

2. **Add Your API Keys**
   Edit `.env.local` and add:
   ```env
   # Klaviyo Configuration
   KLAVIYO_API_KEY=your_klaviyo_private_key_here
   KLAVIYO_MCP_ENDPOINT=https://api.klaviyo.com

   # Triple Whale Configuration  
   TRIPLE_WHALE_API_KEY=your_triple_whale_api_key_here
   TRIPLE_WHALE_MCP_ENDPOINT=https://api.triplewhale.com

   # Application Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_APP_NAME="Email Marketing Dashboard"

   # GitHub Token (for automated commits)
   GITHUB_TOKEN=your_github_personal_access_token
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

The dashboard will be available at http://localhost:3000

## 🔑 API Key Setup

### Klaviyo API Key
1. Log in to your Klaviyo account
2. Go to Account → Settings → API Keys
3. Create a new Private API Key
4. Copy the key to your `.env.local` file

### Triple Whale API Key
1. Log in to your Triple Whale account
2. Go to Settings → API Keys
3. Generate a new API key
4. Copy the key to your `.env.local` file

### GitHub Token (Optional - for automated Git)
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `workflow`
4. Copy token to `.env.local` file

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check

# Run tests
npm test

# Git automation scripts
npm run git:commit    # Auto commit with conventional message
npm run git:push      # Push to remote
npm run git:sync      # Pull latest changes
npm run git:feature   # Create new feature branch
npm run git:save      # Auto-save current work
```

## 📊 Dashboard Features

### Overview Page
- KPI comparison between Klaviyo and Triple Whale
- Revenue attribution charts
- Campaign performance metrics
- Real-time sync status

### Email Performance
- Campaign metrics and analytics
- Flow performance analysis
- Engagement tracking
- A/B test results

### Revenue Analytics
- Revenue attribution analysis
- Waterfall charts
- ROI calculations
- Channel performance

### Customer Insights
- Unified customer profiles
- Cohort analysis
- Engagement scoring
- Customer segmentation

## 🔧 Configuration

### MCP Endpoints
The dashboard uses MCP (Model Context Protocol) for data integration:

- **Klaviyo MCP**: Handles email marketing data
- **Triple Whale MCP**: Manages e-commerce analytics
- **Sync Engine**: Unifies and matches customer data

### Data Synchronization
- Automatic sync every 15 minutes
- Manual refresh available
- Customer matching via email and order data
- Fuzzy matching for data deduplication

## 🚨 Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify API keys are correct
   - Check network connectivity
   - Ensure endpoints are accessible

2. **Build Errors**
   - Clear `.next` folder: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run type-check`

3. **Data Not Loading**
   - Check browser console for errors
   - Verify API keys in `.env.local`
   - Test MCP connections in dashboard

### Performance Issues
- Enable React Query devtools in development
- Monitor bundle size with `npm run analyze`
- Check Core Web Vitals in browser devtools

## 📱 Mobile Testing

Test responsive design on various screen sizes:
- Mobile: 375px - 768px
- Tablet: 768px - 1024px  
- Desktop: 1024px+

## 🔒 Security Notes

- Never commit API keys to version control
- Use environment variables for sensitive data
- Regularly rotate API keys
- Monitor for unauthorized access

## 📈 Performance Optimization

- Images are optimized with Next.js Image component
- Code splitting with dynamic imports
- React Query caching for API responses
- Memoization for expensive calculations

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed contribution guidelines.

## 📄 Documentation

- [README.md](./README.md) - Project overview and features
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development guidelines

## 🆘 Support

If you encounter issues:
1. Check this setup guide
2. Review the troubleshooting section
3. Check existing GitHub issues
4. Create a new issue with detailed information

---

**Next Steps:**
1. Create your GitHub repository
2. Add your API keys to `.env.local`
3. Start the development server
4. Begin customizing for your needs!
