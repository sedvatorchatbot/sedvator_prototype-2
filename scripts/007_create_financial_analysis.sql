-- Financial Analysis Tables

-- Store financial datasets and documents
CREATE TABLE IF NOT EXISTS financial_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL, -- 'pdf', 'csv', 'json', 'text'
  file_size INTEGER,
  storage_path TEXT,
  extracted_content TEXT,
  document_metadata JSONB DEFAULT '{}', -- stores summary, page_count, tables_found, etc
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store financial analysis results
CREATE TABLE IF NOT EXISTS financial_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES financial_documents(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  analysis_type TEXT NOT NULL, -- 'summary', 'insights', 'trends', 'qa', 'comparison'
  analysis_result JSONB NOT NULL, -- stores summary, metrics, insights, recommendations
  confidence_score NUMERIC,
  source_data JSONB DEFAULT '{}', -- stores which APIs/documents were used
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store cached market data to reduce API calls
CREATE TABLE IF NOT EXISTS market_data_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL,
  data_type TEXT NOT NULL, -- 'stock_price', 'company_info', 'news', 'technical'
  cached_data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ticker, data_type)
);

-- Store API usage for rate limiting
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_name TEXT NOT NULL, -- 'finnhub', 'twelve_data', 'alpha_vantage'
  endpoint TEXT NOT NULL,
  status_code INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE financial_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for financial_documents
CREATE POLICY "Users can view their own financial documents"
  ON financial_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create financial documents"
  ON financial_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial documents"
  ON financial_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial documents"
  ON financial_documents FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for financial_analyses
CREATE POLICY "Users can view their own analyses"
  ON financial_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create analyses"
  ON financial_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for api_usage_logs
CREATE POLICY "Users can view their own API usage"
  ON api_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can log API usage"
  ON api_usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_financial_documents_user_id ON financial_documents(user_id);
CREATE INDEX idx_financial_analyses_user_id ON financial_analyses(user_id);
CREATE INDEX idx_financial_analyses_document_id ON financial_analyses(document_id);
CREATE INDEX idx_api_usage_user_id ON api_usage_logs(user_id);
CREATE INDEX idx_market_data_cache_ticker ON market_data_cache(ticker);
