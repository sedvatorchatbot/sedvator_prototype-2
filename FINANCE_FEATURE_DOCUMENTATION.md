# Data & Finance Analysis Feature - Implementation Guide

## Overview
The Data & Finance Analysis feature is a production-ready, modular addition to Sedvator AI that enables users to:
- Upload and analyze financial documents (PDF, CSV, JSON, text)
- Extract financial metrics and key information
- Perform AI-powered analysis with multiple strategies
- Query documents with natural language Q&A
- Access real-time market data with automatic API fallback

## Architecture

### Database Schema (`scripts/007_create_financial_analysis.sql`)
**Tables created:**
- `financial_documents` - Stores uploaded documents with extracted content
- `financial_analyses` - Stores analysis results and metadata
- `market_data_cache` - Caches market data to reduce API calls (24-hour TTL)
- `api_usage_logs` - Tracks API usage for rate limiting and analytics

All tables include:
- Row Level Security (RLS) for user isolation
- Proper indexes for performance
- JSON columns for flexible metadata storage

### API Abstraction Layer (`lib/finance-api.ts`)
**FinanceAPIManager Class:**
- Implements smart fallback strategy: Finnhub → Twelve Data → Alpha Vantage
- Tracks request counts for rate limiting
- Three main methods:
  - `getStockPrice(ticker)` - Real-time stock data
  - `getCompanyInfo(ticker)` - Company fundamentals
  - `getNews(ticker)` - Financial news and sentiment

**Key Features:**
- Automatic provider switching on API limits
- Request counting per provider
- Error handling and logging

### Document Processing (`lib/document-processor.ts`)
**Core Functions:**
- `parseDocumentContent()` - Handles text, CSV, JSON formats
- `chunkContent()` - Splits large documents into overlapping chunks
- `extractFinancialMetrics()` - Regex-based metric extraction
- `generateDocumentSummary()` - Sentence scoring and selection
- `identifyDataStructures()` - Detects tables and structured data

**Why this approach:**
- Token-efficient for LLM processing
- Handles various financial document formats
- Maintains context with overlapping chunks

### API Routes

#### 1. `/api/finance/analyze` (POST)
**Purpose:** Analyzes financial documents and generates insights
**Payload:**
\`\`\`json
{
  "analysisType": "summary|metrics|insights|qa",
  "rawContent": "string (document content)",
  "query": "string (for Q&A mode)",
  "documentId": "uuid (optional, if previously uploaded)"
}
\`\`\`

**Analysis Types:**
- `summary`: Document summarization + structure detection
- `metrics`: Financial metric extraction using regex patterns
- `insights`: Multi-faceted analysis (metrics, risks, growth opportunities)
- `qa`: Natural language Q&A with keyword matching and context extraction

**Response:**
\`\`\`json
{
  "success": true,
  "analysis": {
    // Type-specific analysis results
  },
  "confidence": 0.75,
  "analysisId": "uuid",
  "timestamp": "ISO-8601"
}
\`\`\`

#### 2. `/api/finance/market-data` (POST/GET)
**Purpose:** Fetches real-time market data with caching
**Payload:**
\`\`\`json
{
  "ticker": "AAPL",
  "dataType": "price|company_info|news",
  "useCache": true
}
\`\`\`

**Features:**
- Automatic caching (24-hour TTL)
- Provider fallback strategy
- API usage logging
- Rate limit handling

## UI Components

### 1. `DataUpload` Component (`components/data-upload.tsx`)
**Features:**
- Drag & drop file upload
- Text paste alternative
- File type selection (text/csv/json)
- File size validation (10MB max)
- Upload status feedback
- Multiple input methods

**Supported Formats:**
- CSV with header row
- JSON (array or object)
- Plain text (including extracted PDF text)

### 2. `AnalysisResults` Component (`components/analysis-results.tsx`)
**Features:**
- Confidence score visualization
- Type-specific result rendering
- Metric display in grid format
- Insight cards with recommendations
- Q&A display with excerpts
- Responsive design

### 3. Finance Analysis Page (`app/finance/page.tsx`)
**Layout:**
- Left sidebar: Document upload and info
- Right column: Analysis controls and results
- 4-tab analysis interface (Summary/Metrics/Insights/Q&A)
- Loading states and empty states
- Feature highlights grid

## Security & Performance

### Security Measures
1. **Row Level Security (RLS)**
   - All user data is isolated at the database level
   - Users can only access their own documents and analyses

2. **API Key Management**
   - All API keys stored in environment variables
   - Never exposed to frontend
   - Server-side only API calls

3. **Input Validation**
   - File size limits (10MB)
   - File type restrictions
   - Content length validation

### Performance Optimizations
1. **Caching Strategy**
   - Market data cached for 24 hours
   - Reduces duplicate API calls
   - Automatic cache expiration

2. **Rate Limiting**
   - Request counting per provider
   - Automatic fallback on limits
   - API usage logging

3. **Document Chunking**
   - Large documents split into manageable chunks
   - Overlapping context maintained
   - Token-efficient for LLM processing

## Environment Variables Required

\`\`\`bash
# Finance APIs
FINNHUB_API_KEY=your_finnhub_key          # Primary provider
TWELVE_DATA_API_KEY=your_twelve_data_key  # Fallback provider
ALPHA_VANTAGE_API_KEY=your_alpha_key      # Secondary fallback

# Supabase (Already configured)
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
\`\`\`

## Usage Flow

### User Journey
1. **Upload**: User navigates to `/finance`
2. **Select Data**: Upload file or paste content
3. **Choose Analysis**: Select analysis type (Summary/Metrics/Insights/Q&A)
4. **View Results**: Results displayed with confidence score
5. **Ask Questions**: Use Q&A mode for specific queries
6. **Market Data**: Fetch real-time data alongside analysis

### Data Flow
\`\`\`
User Input → Upload/Paste → Parse Document → Run Analysis → Save to DB → Display Results
                                   ↓
                         Market Data API (optional)
                                   ↓
                         Cache Results (24h)
\`\`\`

## Future Enhancements

### Phase 2 Potential Features
1. **Advanced Market Integration**
   - Real-time sentiment analysis
   - Technical indicator calculations
   - Portfolio tracking

2. **AI/LLM Integration**
   - Use Groq LLM for deeper analysis
   - Conversational financial insights
   - Report generation

3. **Visualization**
   - Charts for financial metrics
   - Trend graphs
   - Portfolio dashboards

4. **Export Features**
   - PDF report generation
   - CSV export of metrics
   - Email reports

5. **Collaboration**
   - Share analyses with others
   - Comments and notes
   - Document versioning

## Testing Checklist

- [ ] Database migration runs successfully
- [ ] Can upload and parse CSV files
- [ ] Can upload and parse JSON files
- [ ] Can paste and analyze text content
- [ ] Summary analysis works correctly
- [ ] Metrics extraction identifies financial terms
- [ ] Insights generation provides useful recommendations
- [ ] Q&A mode responds to queries
- [ ] Market data API calls work with fallback
- [ ] Caching reduces duplicate API calls
- [ ] RLS policies prevent cross-user data access
- [ ] File size validation (>10MB rejected)
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Error messages are helpful
- [ ] Confidence scores reflect data quality

## Code Organization

\`\`\`
app/
  finance/
    page.tsx                 # Main page component
  api/
    finance/
      analyze/route.ts       # Analysis API
      market-data/route.ts   # Market data API
scripts/
  007_create_financial_analysis.sql  # Database schema
lib/
  finance-api.ts            # API abstraction layer
  document-processor.ts     # Document processing utilities
components/
  data-upload.tsx           # File upload component
  analysis-results.tsx      # Results display component
\`\`\`

## Modular Design Benefits

1. **Reusability**: Components can be used independently
2. **Maintainability**: Clear separation of concerns
3. **Scalability**: Easy to add new analysis types or providers
4. **Testability**: Each function has single responsibility
5. **Performance**: Efficient caching and API management

## Support & Troubleshooting

### Common Issues

**Q: API calls returning 429 (Too Many Requests)**
- A: System automatically falls back to next provider. Increase rate limits in finance-api.ts

**Q: Market data cache not working**
- A: Check Supabase connection and market_data_cache table permissions

**Q: Analysis results seem incomplete**
- A: Confidence score indicates data quality. Try different analysis types or larger documents

**Q: Document upload fails**
- A: Ensure file is <10MB. For PDFs, convert to text first and paste content
