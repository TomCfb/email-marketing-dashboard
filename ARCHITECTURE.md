# Architecture Documentation

## 🏗️ System Architecture

The Email Marketing Analytics Dashboard follows a modern, scalable architecture designed for performance, maintainability, and extensibility.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  Dashboard Pages  │  Components  │  State Management       │
│  - Overview       │  - UI        │  - Zustand Store       │
│  - Email Perf     │  - Charts    │  - React Query         │
│  - Revenue        │  - Tables    │  - Local Storage       │
│  - Customers      │  - Shared    │                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js)                     │
├─────────────────────────────────────────────────────────────┤
│  Route Handlers   │  Validation  │  Error Handling         │
│  - /api/klaviyo   │  - Zod       │  - Try/Catch            │
│  - /api/triple-w  │  - Types     │  - Status Codes         │
│  - /api/sync      │  - Schemas   │  - Logging              │
│  - /api/analytics │              │                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                MCP Integration Layer                        │
├─────────────────────────────────────────────────────────────┤
│  MCP Clients      │  Data Sync   │  Customer Matching      │
│  - Klaviyo        │  - Engine    │  - Email Matching       │
│  - Triple Whale   │  - Logic     │  - Fuzzy Logic          │
│  - Base Client    │  - Cache     │  - Deduplication        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  External APIs                              │
├─────────────────────────────────────────────────────────────┤
│   Klaviyo API    │              │   Triple Whale API       │
│   - Campaigns     │              │   - Orders               │
│   - Flows         │              │   - Customers            │
│   - Metrics       │              │   - Revenue              │
│   - Segments      │              │   - Attribution          │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API route handlers
│   │   ├── klaviyo/             # Klaviyo endpoints
│   │   │   ├── metrics/         # Email metrics
│   │   │   ├── campaigns/       # Campaign data
│   │   │   └── flows/           # Flow analytics
│   │   ├── triple-whale/        # Triple Whale endpoints
│   │   │   ├── metrics/         # E-commerce metrics
│   │   │   └── customers/       # Customer data
│   │   ├── sync/                # Data synchronization
│   │   │   └── customers/       # Customer matching
│   │   └── analytics/           # Analytics endpoints
│   │       └── attribution/     # Revenue attribution
│   ├── dashboard/               # Dashboard pages
│   │   ├── overview/            # Main dashboard
│   │   ├── email-performance/   # Email metrics
│   │   ├── revenue/             # Revenue analytics
│   │   └── customers/           # Customer insights
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   └── providers.tsx            # App providers
├── components/                   # React components
│   ├── ui/                      # Shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── dashboard/               # Dashboard components
│   │   ├── sidebar.tsx          # Navigation sidebar
│   │   ├── header.tsx           # Page header
│   │   ├── metric-card.tsx      # KPI cards
│   │   ├── date-range-picker.tsx
│   │   └── refresh-indicator.tsx
│   ├── charts/                  # Chart components
│   │   └── comparison-chart.tsx
│   └── shared/                  # Reusable components
│       └── data-table.tsx       # Generic data table
├── lib/                         # Utility libraries
│   ├── mcp/                     # MCP integration
│   │   ├── klaviyo.ts          # Klaviyo client
│   │   ├── triple-whale.ts     # Triple Whale client
│   │   └── sync-engine.ts      # Data sync logic
│   ├── store/                   # State management
│   │   └── dashboard-store.ts   # Zustand store
│   ├── types/                   # TypeScript definitions
│   │   └── index.ts            # Type definitions
│   └── utils.ts                 # Utility functions
├── hooks/                       # Custom React hooks
│   └── use-mobile.ts           # Mobile detection
└── styles/                      # Additional styles
```

## 🔄 Data Flow

### 1. User Interaction Flow
```
User Action → Component → React Query → API Route → MCP Client → External API
    ↓
UI Update ← State Update ← Cache Update ← Response ← Normalized Data ← Raw Data
```

### 2. Data Synchronization Flow
```
Scheduler/Manual Trigger
    ↓
Data Sync Engine
    ↓
Parallel API Calls (Klaviyo + Triple Whale)
    ↓
Data Normalization
    ↓
Customer Matching Algorithm
    ↓
Unified Data Store
    ↓
Cache Update
    ↓
UI Refresh
```

### 3. Customer Matching Algorithm
```
1. Fetch customers from both platforms
2. Create email-based lookup map
3. Primary matching: Exact email match
4. Secondary matching: Fuzzy logic for variations
5. Merge customer profiles
6. Calculate engagement and risk scores
7. Return unified customer objects
```

## 🎯 Design Patterns

### 1. Repository Pattern
MCP clients act as repositories, abstracting external API calls:
```typescript
interface MCPClient {
  getMetrics(dateRange: DateRange): Promise<ApiResponse<Metrics>>;
  testConnection(): Promise<boolean>;
}
```

### 2. Factory Pattern
Data sync engine creates appropriate client instances:
```typescript
class DataSyncEngine {
  constructor(klaviyoKey: string, tripleWhaleKey: string) {
    this.klaviyoClient = new KlaviyoMCPClient(klaviyoKey);
    this.tripleWhaleClient = new TripleWhaleMCPClient(tripleWhaleKey);
  }
}
```

### 3. Observer Pattern
React Query acts as observer for data changes:
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['metrics', dateRange],
  queryFn: () => fetchMetrics(dateRange),
});
```

### 4. Strategy Pattern
Different chart types implement common interface:
```typescript
interface ChartComponent {
  data: ChartData;
  title: string;
  render(): JSX.Element;
}
```

## 🔧 Technology Stack

### Frontend Framework
- **Next.js 14+**: React framework with App Router
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Component library built on Radix UI

### State Management
- **Zustand**: Lightweight state management
- **React Query**: Server state management and caching
- **Local Storage**: Persistent user preferences

### Data Visualization
- **Recharts**: React charting library
- **Custom Components**: Specialized dashboard widgets

### Development Tools
- **ESLint**: Code linting and quality
- **Prettier**: Code formatting
- **TypeScript**: Static type checking

## 🚀 Performance Optimizations

### 1. Code Splitting
```typescript
// Lazy load dashboard sections
const EmailPerformance = lazy(() => import('./email-performance/page'));
const RevenueAnalytics = lazy(() => import('./revenue/page'));
```

### 2. Memoization
```typescript
// Expensive calculations
const expensiveValue = useMemo(() => {
  return calculateComplexMetrics(data);
}, [data]);

// Component memoization
export default memo(MetricCard);
```

### 3. Virtual Scrolling
```typescript
// Large data tables
<VirtualizedTable
  data={customers}
  rowHeight={50}
  visibleRows={20}
/>
```

### 4. Caching Strategy
```typescript
// React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes
    },
  },
});
```

## 🔒 Security Architecture

### 1. API Key Management
- Environment variables for sensitive data
- No client-side exposure of API keys
- Secure server-side API calls only

### 2. Input Validation
```typescript
// Zod schema validation
const querySchema = z.object({
  from: z.string().transform(str => new Date(str)),
  to: z.string().transform(str => new Date(str)),
});
```

### 3. Error Handling
```typescript
// Comprehensive error boundaries
class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error securely
    // Show user-friendly message
  }
}
```

## 📊 Scalability Considerations

### 1. Horizontal Scaling
- Stateless API routes
- External state management
- CDN-ready static assets

### 2. Database Integration (Future)
```typescript
// Optional database layer
interface DatabaseAdapter {
  cacheMetrics(data: Metrics): Promise<void>;
  getCachedMetrics(key: string): Promise<Metrics | null>;
}
```

### 3. Microservices Architecture (Future)
```
API Gateway → Auth Service → Data Service → External APIs
    ↓              ↓             ↓
Dashboard ← Cache Service ← Analytics Service
```

## 🧪 Testing Architecture

### 1. Unit Tests
- Component testing with React Testing Library
- Utility function testing with Jest
- MCP client testing with mocked APIs

### 2. Integration Tests
- API route testing
- Database integration testing
- End-to-end user flows

### 3. Performance Tests
- Lighthouse CI integration
- Bundle size monitoring
- API response time tracking

## 🔄 CI/CD Pipeline

### 1. Development Workflow
```
Feature Branch → PR → Code Review → Tests → Merge → Deploy
```

### 2. Automated Checks
- TypeScript compilation
- ESLint and Prettier
- Unit and integration tests
- Build verification

### 3. Deployment Strategy
- Vercel for frontend hosting
- Environment-specific configurations
- Rollback capabilities

## 📈 Monitoring and Observability

### 1. Application Metrics
- Core Web Vitals tracking
- API response times
- Error rates and types
- User interaction analytics

### 2. Business Metrics
- Dashboard usage patterns
- Feature adoption rates
- Performance impact on business KPIs

### 3. Alerting
- API failure notifications
- Performance degradation alerts
- Error threshold monitoring

This architecture provides a solid foundation for the email marketing analytics dashboard while maintaining flexibility for future enhancements and scaling requirements.
