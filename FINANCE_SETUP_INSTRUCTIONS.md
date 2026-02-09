# Data & Finance Analysis - Setup Instructions

## Quick Setup Guide

### 1. Database Migration ✅ (Already Done)
The database migration has been executed successfully:
\`\`\`bash
scripts/007_create_financial_analysis.sql
\`\`\`

**Created Tables:**
- `financial_documents` - Store uploaded documents
- `financial_analyses` - Store analysis results
- `market_data_cache` - Cache market data (24-hour TTL)
- `api_usage_logs` - Track API usage

All tables include RLS policies for security.

---

## 2. Environment Variables Setup

### Required API Keys
Add these to your Vercel project environment variables (Settings → Environment Variables):

#### **Option A: Using All Three Providers (Recommended)**
For maximum reliability with automatic fallback:

\`\`\`
FINNHUB_API_KEY=your_finnhub_api_key
TWELVE_DATA_API_KEY=your_twelve_data_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
\`\`\`

#### **Option B: Using Only Finnhub (Minimal)**
If you only want to use one provider:

\`\`\`
FINNHUB_API_KEY=your_finnhub_api_key
TWELVE_DATA_API_KEY=
ALPHA_VANTAGE_API_KEY=
\`\`\`

### How to Get API Keys

#### Finnhub API (Primary - Recommended)
1. Go to https://finnhub.io
2. Sign up for free account
3. Navigate to API Dashboard
4. Copy your API key
5. Free tier: 60 requests/minute, strong community feedback

#### Twelve Data API (Fallback)
1. Go to https://twelvedata.com
2. Sign up for free account
3. Go to API Keys section
4. Copy your API key
5. Free tier: 800 requests/day, generous limits

#### Alpha Vantage API (Secondary Fallback)
1. Go to https://www.alphavantage.co
2. Sign up for free account
3. Check email for API key
4. Copy the key
5. Free tier: 500 requests/day, historical data available

---

## 3. Verification Checklist

After setup, verify everything is working:

### ✓ Database Tables
\`\`\`sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'financial_%';
\`\`\`

Should return:
- `financial_documents`
- `financial_analyses`
- `market_data_cache`
- `api_usage_logs`

### ✓ Environment Variables
Check Vercel dashboard:
1. Go to Settings → Environment Variables
2. Verify all finance API keys are present
3. Ensure keys are set for all environments (Production, Preview, Development)

### ✓ Feature Access
1. Navigate to your app's homepage
2. Look for "Finance" link in navigation
3. Click Finance → should load `/finance` page
4. Try uploading a CSV or pasting text

---

## 4. First-Time User Flow

### Test with Sample Data

**Sample CSV:**
\`\`\`csv
Date,Revenue,Profit,Growth
Q1-2023,1000000,150000,5%
Q2-2023,1100000,180000,10%
Q3-2023,1250000,220000,12%
Q4-2023,1500000,280000,15%
\`\`\`

**Sample JSON:**
\`\`\`json
{
  "company": "TechCorp",
  "revenue": "$2.5B",
  "profit_margin": "18%",
  "growth_rate": "25% YoY",
  "key_products": ["SaaS", "Analytics", "AI"]
}
\`\`\`

**Test Steps:**
1. Copy sample data above
2. Go to `/finance` page
3. Paste into the text area
4. Click "Analyze Document"
5. Wait for analysis to complete
6. Try each analysis type (Summary, Metrics, Insights, Q&A)

---

## 5. Troubleshooting

### Problem: "Analysis failed" error

**Solution:** Check that at least one API key is configured:
\`\`\`bash
# Verify in Vercel terminal
env | grep -i api_key
\`\`\`

### Problem: Market data returning 429 (Too Many Requests)

**Solution:** This is normal - the system will automatically fallback to next provider:
- Finnhub (60 req/min)
- → Twelve Data (800 req/day)
- → Alpha Vantage (500 req/day)

To reduce API calls:
- The system caches results for 24 hours
- Restart the server to clear in-memory counts

### Problem: Can't upload files

**Solution:** Check file requirements:
- Maximum file size: 10MB
- Supported formats: CSV, JSON, TXT, plain text
- PDF: Convert to text first, then paste

### Problem: Confidence score too low

**Solution:** This is expected for certain content:
- Complex documents may have lower confidence
- Try specific analysis type (Summary, Metrics, etc)
- Larger documents provide better results

---

## 6. Feature Access

### User-Facing URL
\`\`\`
https://your-domain.com/finance
\`\`\`

### Navigation Links
- Homepage: New "Finance" button in navbar
- Direct: `/finance` route

### Features Available
1. **Data Upload**
   - Drag & drop files
   - Paste content
   - File type selection

2. **Analysis Types**
   - Summary: Document overview
   - Metrics: Financial data extraction
   - Insights: Key findings
   - Q&A: Ask questions about data

3. **Market Data** (Coming in UI)
   - Real-time stock prices
   - Company information
   - Financial news

---

## 7. Advanced Configuration

### Adjust Rate Limits

In `lib/finance-api.ts`, modify:
\`\`\`typescript
private requestLimits: Record<string, number> = {
  finnhub: 60,        // requests per minute
  twelve_data: 800,   // requests per day
  alpha_vantage: 500, // requests per day
}
\`\`\`

### Change Cache Duration

In `app/api/finance/market-data/route.ts`:
\`\`\`typescript
// Currently set to 24 hours
const expiresAt = new Date()
expiresAt.setHours(expiresAt.getHours() + 24)  // Change this
\`\`\`

### Customize Analysis

In `app/api/finance/analyze/route.ts`:
\`\`\`typescript
// Modify analysis logic in the switch statement
switch (analysisType) {
  case 'summary':
    // Add custom summary logic here
    break;
  // ... etc
}
\`\`\`

---

## 8. Performance Optimization

### Database Indexes
Already included in migration:
- `idx_financial_documents_user_id`
- `idx_financial_analyses_user_id`
- `idx_api_usage_user_id`
- `idx_market_data_cache_ticker`

### Caching Strategy
- Market data: 24 hours
- Analysis results: Stored indefinitely
- API counts: Reset daily (in-memory)

### Recommended Optimizations
1. Add pagination to results (show 10 at a time)
2. Implement search in stored analyses
3. Archive old documents after 90 days
4. Set up CloudFlare caching for static responses

---

## 9. Monitoring & Logging

### View API Usage
\`\`\`sql
SELECT 
  DATE(created_at),
  api_name,
  COUNT(*) as request_count,
  SUM(CASE WHEN status_code = 200 THEN 1 ELSE 0 END) as successful
FROM api_usage_logs
GROUP BY DATE(created_at), api_name
ORDER BY created_at DESC;
\`\`\`

### Check Cache Effectiveness
\`\`\`sql
SELECT 
  ticker,
  data_type,
  COUNT(*) as cache_hits,
  MAX(updated_at) as last_updated
FROM market_data_cache
WHERE expires_at > NOW()
GROUP BY ticker, data_type
ORDER BY cache_hits DESC;
\`\`\`

### Monitor User Activity
\`\`\`sql
SELECT 
  user_id,
  COUNT(*) as total_analyses,
  AVG(confidence_score) as avg_confidence,
  MAX(created_at) as last_analysis
FROM financial_analyses
GROUP BY user_id
ORDER BY total_analyses DESC;
\`\`\`

---

## 10. Next Steps

After successful setup:

1. **Test thoroughly** with various document types
2. **Gather user feedback** on analysis quality
3. **Monitor API usage** and costs
4. **Plan Phase 2** with LLM integration for deeper insights
5. **Add visualizations** for financial metrics

---

## Support Contact

For issues:
1. Check `/FINANCE_FEATURE_DOCUMENTATION.md` for detailed help
2. Review console logs for `[v0]` debug messages
3. Verify environment variables in Vercel dashboard
4. Check Supabase connection and table permissions

---

**Setup Status**: Ready to go! ✅
**Estimated Setup Time**: 5-10 minutes
**Required Config Items**: 3 API keys
**Database Tables Created**: 4
**UI Routes Available**: 1 (`/finance`)
