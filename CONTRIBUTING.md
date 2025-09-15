# Contributing to Email Marketing Analytics Dashboard

We welcome contributions to the Email Marketing Analytics Dashboard! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Git latest version
- Klaviyo API key (for testing)
- Triple Whale API key (for testing)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/email-marketing-dashboard.git
   cd email-marketing-dashboard
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env.local
   # Add your API keys to .env.local
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📋 Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Active development branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Commit Convention
We use [Conventional Commits](https://www.conventionalcommits.org/) for clear commit messages:

```
feat: add new customer segmentation feature
fix: resolve data sync issue with Klaviyo API
docs: update README installation guide
style: improve dashboard responsive design
refactor: optimize data fetching logic
test: add unit tests for MetricCard component
chore: update dependencies
```

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write clean, well-documented code
   - Follow existing code style and patterns
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm run lint
   npm run type-check
   npm test
   npm run build
   ```

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: your descriptive commit message"
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Use the PR template
   - Provide clear description of changes
   - Link related issues
   - Add screenshots for UI changes

## 🎯 Code Style Guidelines

### TypeScript
- Use strict TypeScript configuration
- Define proper interfaces and types
- Avoid `any` types - use specific types
- Use Zod for runtime validation

### React/Next.js
- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for performance optimization
- Follow Next.js App Router conventions

### Styling
- Use Tailwind CSS utility classes
- Follow Shadcn/ui component patterns
- Ensure responsive design (mobile-first)
- Maintain consistent spacing (8px grid)

### API Routes
- Use proper HTTP status codes
- Implement comprehensive error handling
- Add input validation with Zod
- Include proper TypeScript types

## 🧪 Testing Guidelines

### Unit Tests
```bash
# Run all tests
npm test

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
```

## 📝 Documentation

### Code Documentation
- Add JSDoc comments for functions and components
- Document complex business logic
- Include usage examples for components
- Update README for new features

### API Documentation
- Document all API endpoints
- Include request/response examples
- Add error response documentation
- Update OpenAPI/Swagger specs

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Bug Description**
   - Clear description of the issue
   - Expected vs actual behavior

2. **Reproduction Steps**
   - Step-by-step instructions
   - Minimal code example if applicable

3. **Environment**
   - OS and version
   - Node.js version
   - Browser (if applicable)
   - API key configuration status

4. **Screenshots/Logs**
   - Console errors
   - Network requests
   - Visual issues

## 💡 Feature Requests

For new features, please provide:

1. **Use Case**
   - Business justification
   - User story format

2. **Detailed Description**
   - Functional requirements
   - Technical considerations

3. **Mockups/Wireframes**
   - Visual representation
   - User flow diagrams

## 🏗️ Architecture Guidelines

### Component Structure
```
src/components/
├── ui/           # Shadcn/ui components
├── dashboard/    # Dashboard-specific components
├── charts/       # Chart components
└── shared/       # Reusable components
```

### API Structure
```
src/app/api/
├── klaviyo/      # Klaviyo endpoints
├── triple-whale/ # Triple Whale endpoints
├── sync/         # Data synchronization
└── analytics/    # Analytics endpoints
```

### Data Flow
1. User interaction triggers data fetch
2. React Query manages caching and loading states
3. API routes handle external API calls
4. MCP clients normalize data formats
5. Components render with proper error handling

## 🔒 Security Guidelines

### API Keys
- Never commit API keys to version control
- Use environment variables
- Implement proper key rotation

### Input Validation
- Validate all user inputs
- Use Zod schemas for API validation
- Sanitize data before processing

### Error Handling
- Don't expose sensitive information in errors
- Log errors securely
- Provide user-friendly error messages

## 📊 Performance Guidelines

### Optimization Techniques
- Implement lazy loading for large components
- Use React.memo for expensive components
- Optimize bundle size with dynamic imports
- Cache API responses appropriately

### Monitoring
- Track Core Web Vitals
- Monitor API response times
- Measure bundle size impact
- Test on various devices

## 🎨 Design System

### Colors
- Primary: `#3B82F6` (Blue)
- Secondary: `#8B5CF6` (Purple)
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Amber)
- Error: `#EF4444` (Red)

### Typography
- Font Family: Inter
- Headings: 32px, 24px, 20px, 18px, 16px
- Body: 16px regular, 14px small
- Line Height: 1.5 for body, 1.2 for headings

### Spacing
- Base unit: 8px
- Common values: 4px, 8px, 16px, 24px, 32px, 48px

## 🤝 Community

### Communication
- GitHub Issues for bug reports and feature requests
- GitHub Discussions for general questions
- Discord for real-time chat (coming soon)

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow project guidelines

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to the Email Marketing Analytics Dashboard!
