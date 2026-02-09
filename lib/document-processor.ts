/**
 * Document Processing Utilities
 * Handles PDF text extraction, CSV, JSON, and text parsing
 * Note: For PDFs, we extract text that's already embedded. For scanned PDFs, users should paste text.
 */

interface DocumentChunk {
  content: string
  pageNumber?: number
  metadata?: Record<string, unknown>
}

interface ParsedData {
  type: 'text' | 'csv' | 'json' | 'pdf'
  content: string
  records?: Record<string, unknown>[]
  tables?: string[][]
  summary?: string
  extractionMethod?: 'text' | 'native'
  pageCount?: number
}

/**
 * Extract text from PDF buffer using pure JavaScript
 * Works for PDFs with embedded text. For scanned PDFs, users should paste text.
 */
export async function extractPDFText(buffer: Buffer): Promise<{
  text: string
  pageCount: number
  extractionMethod: 'text'
}> {
  console.log('[v0] Extracting text from PDF')

  try {
    // Convert buffer to string to search for text content
    const pdfString = buffer.toString('latin1')

    // Simple text extraction from PDF streams
    // PDFs contain text in various forms - we'll extract visible text
    let text = ''

    // Find text in BT...ET blocks (text blocks in PDF)
    const textPattern = /BT\s+(.*?)\s+ET/gs
    let match
    while ((match = textPattern.exec(pdfString)) !== null) {
      const content = match[1]
      // Extract text from Tj and TJ operators
      const textMatches = content.match(/\((.*?)\)/g)
      if (textMatches) {
        textMatches.forEach((textMatch) => {
          let extracted = textMatch.slice(1, -1) // Remove parentheses
          // Decode common PDF escapes
          extracted = extracted.replace(/\\n/g, '\n').replace(/\\\(/g, '(').replace(/\\\)/g, ')')
          text += extracted + ' '
        })
      }
    }

    // If no text found in streams, try to extract from object streams
    if (!text.trim()) {
      // Look for common text patterns in PDF
      const commonPatterns = /[A-Za-z0-9\s\.\,\!\?\:\;\-]{20,}/g
      const matches = pdfString.match(commonPatterns)
      if (matches) {
        text = matches.join('\n')
      }
    }

    // Count approximate pages (rough estimate based on Page objects)
    const pageCount = (pdfString.match(/\/Type\s*\/Page[^s]/g) || []).length || 1

    console.log('[v0] PDF extraction successful, pages:', pageCount, 'text length:', text.length)

    return {
      text: text.trim() || '[PDF content could not be extracted. This may be a scanned PDF or image-based document. Please paste the text content instead.]',
      pageCount: Math.max(1, pageCount),
      extractionMethod: 'text',
    }
  } catch (error) {
    console.error('[v0] PDF extraction failed:', error)
    throw new Error('Failed to extract text from PDF: ' + (error instanceof Error ? error.message : String(error)))
  }
}

/**
 * Process document file based on type and extract text
 */
export async function processDocumentFile(buffer: Buffer, fileType: string, fileName: string): Promise<ParsedData> {
  console.log('[v0] Processing document:', fileName, 'Type:', fileType)

  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    const { text, pageCount } = await extractPDFText(buffer)

    return {
      type: 'pdf',
      content: text,
      pageCount,
      extractionMethod: 'text',
    }
  }

  // For other file types, convert buffer to string
  const content = buffer.toString('utf-8')

  if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
    return parseCSV(content)
  }

  if (fileType === 'application/json' || fileName.endsWith('.json')) {
    return parseJSON(content)
  }

  // Default: treat as plain text
  return {
    type: 'text',
    content: content.trim(),
    extractionMethod: 'text',
  }
}

/**
 * Extract text from document content
 * Handles different formats: PDF text, raw text, CSV, JSON
 */
export function parseDocumentContent(content: string, fileType: string): ParsedData {
  console.log('[v0] Parsing document of type:', fileType)

  if (fileType === 'csv') {
    return parseCSV(content)
  }

  if (fileType === 'json') {
    return parseJSON(content)
  }

  // Default: treat as plain text
  return {
    type: 'text',
    content: content.trim(),
    extractionMethod: 'text',
  }
}

/**
 * Parse CSV content into structured data
 */
function parseCSV(content: string): ParsedData {
  const lines = content.split('\n').filter((line) => line.trim())
  const headers = lines[0]?.split(',').map((h) => h.trim()) || []

  const records: Record<string, unknown>[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim())
    const record: Record<string, unknown> = {}
    headers.forEach((header, index) => {
      record[header] = values[index]
    })
    records.push(record)
  }

  return {
    type: 'csv',
    content,
    records,
    extractionMethod: 'text',
  }
}

/**
 * Parse JSON content into structured data
 */
function parseJSON(content: string): ParsedData {
  let records: Record<string, unknown>[] = []

  try {
    const data = JSON.parse(content)
    records = Array.isArray(data) ? data : [data]
  } catch (error) {
    console.error('[v0] JSON parse error:', error)
  }

  return {
    type: 'json',
    content,
    records,
    extractionMethod: 'text',
  }
}

/**
 * Split large documents into chunks for efficient processing
 * Maintains context by including overlapping content
 */
export function chunkContent(content: string, chunkSize = 1000, overlap = 200): DocumentChunk[] {
  console.log('[v0] Chunking content into pieces of', chunkSize, 'characters')

  const chunks: DocumentChunk[] = []
  let position = 0

  while (position < content.length) {
    const end = Math.min(position + chunkSize, content.length)
    const chunk = content.substring(position, end)

    chunks.push({
      content: chunk.trim(),
      metadata: {
        startPosition: position,
        endPosition: end,
        size: chunk.length,
      },
    })

    position += chunkSize - overlap
  }

  return chunks
}

/**
 * Extract key metrics from financial documents
 * Looks for common financial terms and patterns
 */
export function extractFinancialMetrics(content: string): Record<string, unknown> {
  console.log('[v0] Extracting financial metrics')

  const metrics: Record<string, unknown> = {}

  // Revenue patterns: "revenue: $XXX", "sales: $XXX", etc
  const revenueMatch = content.match(/revenue[:\s]+(\$?[\d,]+\.?\d*)/i)
  if (revenueMatch) {
    metrics.revenue = revenueMatch[1]
  }

  // Profit patterns
  const profitMatch = content.match(/(?:net\s+)?profit[:\s]+(\$?[\d,]+\.?\d*)/i)
  if (profitMatch) {
    metrics.profit = profitMatch[1]
  }

  // Growth rate patterns: "grew X%", "growth of X%", etc
  const growthMatch = content.match(/growth[:\s]+(\d+(?:\.\d+)?%)/i)
  if (growthMatch) {
    metrics.growth_rate = growthMatch[1]
  }

  // Operating margin patterns
  const marginMatch = content.match(/(?:operating\s+)?margin[:\s]+(\d+(?:\.\d+)?%)/i)
  if (marginMatch) {
    metrics.operating_margin = marginMatch[1]
  }

  // EPS patterns
  const epsMatch = content.match(/eps[:\s]+(\$?[\d,]+\.?\d*)/i)
  if (epsMatch) {
    metrics.eps = epsMatch[1]
  }

  // P/E Ratio patterns
  const peMatch = content.match(/p\/e(?:\s+ratio)?[:\s]+(\d+(?:\.\d+)?)/i)
  if (peMatch) {
    metrics.pe_ratio = peMatch[1]
  }

  return metrics
}

/**
 * Generate a summary of document content
 * Uses simple statistical approach: extracts key sentences
 */
export function generateDocumentSummary(content: string, sentenceCount = 3): string {
  console.log('[v0] Generating document summary')

  // Split into sentences
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 20)

  if (sentences.length <= sentenceCount) {
    return sentences.join('. ') + '.'
  }

  // Score sentences by word frequency
  const words = content.toLowerCase().match(/\b\w+\b/g) || []
  const wordFreq: Record<string, number> = {}

  words.forEach((word) => {
    if (word.length > 3) {
      // Only consider words longer than 3 characters
      wordFreq[word] = (wordFreq[word] || 0) + 1
    }
  })

  // Score sentences
  const scoredSentences = sentences.map((sentence, index) => {
    let score = 0
    const sentenceWords = sentence.toLowerCase().match(/\b\w+\b/g) || []
    sentenceWords.forEach((word) => {
      score += wordFreq[word] || 0
    })
    return { sentence: sentence.trim(), score, index }
  })

  // Get top sentences and sort by original order
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, sentenceCount)
    .sort((a, b) => a.index - b.index)

  return topSentences.map((s) => s.sentence).join('. ') + '.'
}

/**
 * Identify tables and structured data in text
 */
export function identifyDataStructures(content: string): {
  hasStructuredData: boolean
  estimatedTables: number
  estimatedRecords: number
} {
  console.log('[v0] Identifying data structures')

  // Count possible table indicators
  let estimatedTables = 0
  let estimatedRecords = 0

  // Look for pipe-separated rows (common table format)
  const pipeRows = content.match(/\|[\w\s]+\|/g)
  if (pipeRows) {
    estimatedTables += 1
    estimatedRecords += pipeRows.length
  }

  // Look for comma-separated patterns
  const csvPatterns = content.match(/^[\w,.-]+\n[\w,.-\d]+(?:\n[\w,.-\d]+){2,}/gm)
  if (csvPatterns) {
    estimatedTables += csvPatterns.length
    csvPatterns.forEach((pattern) => {
      estimatedRecords += pattern.split('\n').length
    })
  }

  return {
    hasStructuredData: estimatedTables > 0,
    estimatedTables,
    estimatedRecords,
  }
}
