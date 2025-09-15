# 📊 Email Marketing Analytics Dashboard

## 🎯 Overview

A comprehensive, production-ready email marketing analytics dashboard that integrates Klaviyo and Triple Whale data for cross-platform analytics and comparison. This dashboard provides deep insights into email marketing performance, revenue attribution, customer behavior, and ROI optimization across multiple platforms.

**Business Value:**
- Unified view of email marketing performance across platforms
- Advanced customer matching and attribution analysis
- Real-time revenue tracking and ROI optimization
- Actionable insights for campaign optimization
- Professional-grade analytics for enterprise use

## 🚀 Features

### Core Analytics Features
- **Cross-Platform Integration**: Seamlessly connects Klaviyo and Triple Whale APIs
- **Real-Time Dashboards**: Live data synchronization with automatic refresh
- **Advanced Matching Logic**: Intelligent customer matching across platforms
- **Revenue Attribution**: Detailed email revenue vs total revenue analysis
- **Performance Comparison**: Side-by-side metrics comparison
- **Custom Date Ranges**: Flexible time period analysis
- **Export Capabilities**: CSV/Excel export for all reports

### Dashboard Pages
- **Overview Dashboard**: KPI cards, trend analysis, campaign performance
- **Email Performance**: Campaign metrics, flow analysis, A/B testing results
- **Revenue Analytics**: Attribution waterfall, CLV analysis, product performance
- **Customer Insights**: Cohort analysis, engagement scoring, churn prediction

### Feature Comparison Matrix

| Feature | Klaviyo | Triple Whale | Dashboard Integration |
|---------|---------|--------------|----------------------|
| Email Campaigns | ✅ | ❌ | ✅ Combined view |
| Revenue Tracking | ✅ | ✅ | ✅ Cross-referenced |
| Customer Data | ✅ | ✅ | ✅ Unified profiles |
| Attribution | ✅ | ✅ | ✅ Advanced matching |
| Cohort Analysis | ✅ | ✅ | ✅ Enhanced insights |

### Upcoming Features Roadmap
- **Phase 2 (Q2 2024)**: AI-powered insights, predictive analytics
- **Phase 3 (Q3 2024)**: Multi-brand support, advanced segmentation
- **Phase 4 (Q4 2024)**: Machine learning recommendations, automated optimization

## 📸 Screenshots

*Screenshots will be added as features are implemented*

- Dashboard Overview (Coming Soon)
- Email Performance Page (Coming Soon)
- Revenue Analytics (Coming Soon)
- Customer Insights (Coming Soon)
- Mobile Responsive Views (Coming Soon)
- Dark/Light Mode Examples (Coming Soon)
- Loading States (Coming Soon)
- Error Handling (Coming Soon)

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 14+** - React framework with App Router for optimal performance
- **TypeScript** - Type safety and enhanced developer experience
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Shadcn/ui** - High-quality, accessible component library

### Data & State Management
- **TanStack Query** - Powerful data fetching and caching
- **Zustand** - Lightweight state management
- **Zod** - Runtime type validation and parsing

### Visualization & UI
- **Recharts** - Composable charting library for React
- **Lucide React** - Beautiful, customizable icons
- **Radix UI** - Low-level UI primitives for accessibility

### Development Tools
- **ESLint** - Code linting and quality assurance
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality control

## 📋 Prerequisites

### System Requirements
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **Git**: Latest version
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Required API Keys
- **Klaviyo API Key**: Private API key with read permissions
- **Triple Whale API Key**: API access token with analytics permissions

### Optional Requirements
- **PostgreSQL**: For advanced caching (optional)
- **Redis**: For session management (optional)

## 🔧 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/email-marketing-dashboard.git
cd email-marketing-dashboard
```

### Step 2: Environment Setup

1. Copy the environment template:
```bash
cp env.example .env.local
```

2. Configure your environment variables:
```env
# Klaviyo Configuration
KLAVIYO_API_KEY=your_klaviyo_api_key_here
KLAVIYO_MCP_ENDPOINT=http://localhost:3001/klaviyo

# Triple Whale Configuration  
TRIPLE_WHALE_API_KEY=your_triple_whale_api_key_here
TRIPLE_WHALE_MCP_ENDPOINT=http://localhost:3002/triple-whale

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Email Marketing Analytics Dashboard"
```

### Step 3: Install Dependencies

```bash
npm install
```

**Troubleshooting Installation:**
- If you encounter permission errors, try: `sudo npm install`
- For M1 Macs with node-gyp issues: `npm install --target_arch=arm64`
- Clear npm cache if needed: `npm cache clean --force`

### Step 4: MCP Configuration

#### Klaviyo MCP Setup
1. Install the Klaviyo MCP server
2. Configure authentication with your API key
3. Test connection: `curl http://localhost:3001/klaviyo/health`

#### Triple Whale MCP Setup
1. Install the Triple Whale MCP server
2. Configure API credentials
3. Test connection: `curl http://localhost:3002/triple-whale/health`

### Step 5: Database Setup (Optional)

For advanced caching and performance:

```bash
# PostgreSQL setup
createdb email_dashboard
npm run db:migrate
npm run db:seed
```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run dev
```

**Expected Output:**
```
▲ Next.js 14.0.0
- Local:        http://localhost:3000
- Network:      http://192.168.1.100:3000

✓ Ready in 2.3s
```

### Production Build

```bash
npm run build
npm run start
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run type checking
npm run type-check
```

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── klaviyo/             # Klaviyo API endpoints
│   │   ├── triple-whale/        # Triple Whale API endpoints
│   │   ├── sync/                # Data synchronization
│   │   └── analytics/           # Analytics endpoints
│   ├── dashboard/               # Dashboard pages
│   │   ├── overview/            # Main dashboard
│   │   ├── email-performance/   # Email metrics
│   │   ├── revenue/             # Revenue analytics
│   │   └── customers/           # Customer insights
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── components/                   # React components
│   ├── ui/                      # Shadcn/ui components
│   ├── dashboard/               # Dashboard-specific components
│   ├── charts/                  # Chart components
│   └── shared/                  # Reusable components
├── lib/                         # Utility libraries
│   ├── mcp/                     # MCP integration
│   │   ├── klaviyo.ts          # Klaviyo client
│   │   └── triple-whale.ts     # Triple Whale client
│   ├── utils/                   # Utility functions
│   └── types/                   # TypeScript definitions
├── hooks/                       # Custom React hooks
├── styles/                      # Additional styles
└── tests/                       # Test files
    ├── unit/                    # Unit tests
    ├── integration/             # Integration tests
    └── e2e/                     # End-to-end tests
```

## 🔌 API Documentation

### Core Endpoints

#### Klaviyo Integration
- `GET /api/klaviyo/metrics` - Fetch email metrics
- `GET /api/klaviyo/campaigns` - Get campaign data
- `GET /api/klaviyo/flows` - Get flow performance
- `GET /api/klaviyo/segments` - Retrieve segments

#### Triple Whale Integration
- `GET /api/triple-whale/revenue` - Fetch revenue data
- `GET /api/triple-whale/customers` - Get customer data
- `GET /api/triple-whale/orders` - Retrieve order information

#### Analytics & Sync
- `POST /api/sync/match` - Match customers between platforms
- `GET /api/analytics/compare` - Generate comparison reports
- `GET /api/analytics/attribution` - Revenue attribution analysis

### Authentication

All API endpoints use API key authentication:

```javascript
headers: {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json'
}
```

### Rate Limiting

- **Klaviyo**: 150 requests per minute
- **Triple Whale**: 100 requests per minute
- **Dashboard APIs**: 1000 requests per minute

## 🎨 Design System

### Color Palette

```css
/* Primary Colors */
--primary: #3B82F6        /* Modern Blue */
--primary-foreground: #FFFFFF

/* Secondary Colors */
--secondary: #8B5CF6      /* Purple Accent */
--secondary-foreground: #FFFFFF

/* Status Colors */
--success: #10B981        /* Green */
--warning: #F59E0B        /* Amber */
--destructive: #EF4444    /* Red */

/* Background Colors */
--background: #F9FAFB     /* Light Gray */
--card: #FFFFFF
--border: #E5E7EB
```

### Typography

- **Font Family**: Inter, system-ui, sans-serif
- **Headings**: 32px, 24px, 20px, 18px, 16px
- **Body**: 16px regular, 14px small
- **Line Height**: 1.5 for body, 1.2 for headings

### Component Library

#### Core Components
- `<MetricCard />` - KPI display with trend indicators
- `<ComparisonChart />` - Side-by-side visualizations
- `<DataTable />` - Sortable, filterable tables
- `<DateRangePicker />` - Custom date selection
- `<RefreshIndicator />` - Sync status display

## 📊 Data Flow

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐
│   Klaviyo API  │    │ Triple Whale API│
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          ▼                      ▼
┌─────────────────────────────────────────┐
│           MCP Integration Layer         │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│        Data Matching & Sync Engine     │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Dashboard Frontend             │
└─────────────────────────────────────────┘
```

### Data Matching Logic

Customer matching across platforms using:
1. **Email Address** (Primary key)
2. **Order ID** cross-reference
3. **Timestamp alignment** for events
4. **Fuzzy matching** for incomplete data

### Caching Strategy

- **API Responses**: 5-minute TTL
- **Computed Analytics**: 15-minute TTL
- **Static Data**: 1-hour TTL
- **User Preferences**: Persistent storage

## ⚙️ Configuration

### Customization Options

```javascript
// config/dashboard.js
export const dashboardConfig = {
  refreshInterval: 300000,    // 5 minutes
  maxDataPoints: 1000,
  defaultDateRange: 30,       // days
  enableRealTime: true,
  cacheStrategy: 'aggressive'
}
```

### Performance Tuning

- Enable compression: `gzip: true`
- Optimize images: `next/image` with WebP
- Code splitting: Automatic with Next.js
- Bundle analysis: `npm run analyze`

## 🧪 Testing

### Unit Tests

```bash
# Run specific test file
npm test -- MetricCard.test.tsx

# Run with coverage
npm test -- --coverage
```

### Integration Tests

```bash
# Test API endpoints
npm run test:integration

# Test MCP connections
npm run test:mcp
```

### E2E Tests

```bash
# Run Playwright tests
npm run test:e2e

# Run specific test suite
npm run test:e2e -- dashboard.spec.ts
```

## 📈 Performance Metrics

### Benchmarks

- **Initial Load**: < 2 seconds
- **Data Refresh**: < 5 seconds
- **Chart Rendering**: < 1 second
- **API Response**: < 500ms average

### Optimization Tips

1. **Lazy Loading**: Implement for dashboard sections
2. **Virtual Scrolling**: For large data tables
3. **Memoization**: Use React.memo for expensive components
4. **Debouncing**: For search and filter inputs

## 🔒 Security

### Best Practices Implemented

- **API Key Encryption**: All keys stored securely
- **CORS Configuration**: Restricted origins
- **Rate Limiting**: Prevents abuse
- **Input Validation**: Zod schema validation
- **Error Handling**: No sensitive data exposure

### API Key Management

```bash
# Use environment variables
export KLAVIYO_API_KEY="your_key_here"

# Never commit keys to version control
echo "*.env*" >> .gitignore
```

## 🐛 Troubleshooting

### Common Issues

#### Connection Errors
**Problem**: MCP connection failed
**Solution**: Check API keys and endpoint URLs

#### Data Sync Issues
**Problem**: Data not updating
**Solution**: Verify API rate limits and refresh tokens

#### Performance Issues
**Problem**: Slow dashboard loading
**Solution**: Check network tab, optimize queries

### Debug Mode

Enable debug mode in `.env.local`:
```env
DEBUG=true
NODE_ENV=development
```

### Logs

- **Application Logs**: `logs/app.log`
- **Error Logs**: `logs/error.log`
- **API Logs**: `logs/api.log`

## 📝 Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Make changes and test
4. Submit pull request

### Code Style Guide

- **ESLint**: Enforced linting rules
- **Prettier**: Automatic code formatting
- **TypeScript**: Strict type checking
- **Conventional Commits**: Standardized commit messages

### Pull Request Process

1. Update documentation
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md

## 🗺️ Roadmap

### Phase 1 (Current - Q1 2024)
- ✅ Basic dashboard structure
- ✅ Klaviyo integration
- ✅ Triple Whale integration
- 🔄 Data matching logic
- ⏳ Revenue attribution

### Phase 2 (Q2 2024)
- AI-powered insights
- Predictive analytics
- Advanced segmentation
- Custom report builder

### Phase 3 (Q3 2024)
- Multi-brand support
- White-label options
- Advanced automation
- Mobile app

## 📄 License

MIT License - see [LICENSE.md](LICENSE.md) for details

## 👥 Team

- **Lead Developer**: [Your Name]
- **UI/UX Designer**: [Designer Name]
- **Data Analyst**: [Analyst Name]

## 🙏 Acknowledgments

- Klaviyo team for excellent API documentation
- Triple Whale for platform integration support
- Next.js community for framework excellence
- Shadcn for beautiful component library

## 📞 Support

- **Email**: support@email-dashboard.com
- **Documentation**: [docs.email-dashboard.com](https://docs.email-dashboard.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/email-marketing-dashboard/issues)
- **Discord**: [Join our community](https://discord.gg/email-dashboard)

## 🔗 Related Links

- [Live Demo](https://email-dashboard-demo.vercel.app) *(Coming Soon)*
- [Video Tutorial](https://youtube.com/watch?v=demo) *(Coming Soon)*
- [Blog Post](https://blog.email-dashboard.com/introduction) *(Coming Soon)*
- [Klaviyo API Docs](https://developers.klaviyo.com/en)
- [Triple Whale API Docs](https://developers.triplewhale.com/)

## 📊 Metrics & Analytics

The dashboard tracks its own usage with privacy-first analytics:
- Page views and user interactions
- Performance metrics
- Error tracking
- Feature usage statistics

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

## ❓ FAQ

**Q: How often does data sync?**
A: Every 5 minutes automatically, or manually via refresh button.

**Q: Can I export data?**
A: Yes, all reports support CSV and Excel export.

**Q: Is there mobile support?**
A: Yes, fully responsive design works on all devices.

**Q: What's the data retention policy?**
A: We cache data for 30 days, original data stays with source platforms.

---

*Last updated: January 15, 2024*
