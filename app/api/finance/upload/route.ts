import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processDocumentFile } from '@/lib/document-processor'

export const runtime = 'nodejs'
export const maxDuration = 120

/**
 * POST /api/finance/upload
 * Handles file uploads (PDF, CSV, JSON, text) and extracts content server-side
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Finance upload request received')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('[v0] Processing uploaded file:', file.name, 'Type:', file.type, 'Size:', file.size)

    // Validate file size (max 50MB for PDFs, 10MB for others)
    const maxSize = file.type === 'application/pdf' ? 50 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit` },
        { status: 400 }
      )
    }

    // Read file as buffer
    const buffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)

    // Process document
    console.log('[v0] Extracting text from file')
    const parsed = await processDocumentFile(uint8Array as any, file.type, file.name)

    console.log('[v0] File processed successfully, content length:', parsed.content.length)

    // Store in database
    const { data: doc, error: insertError } = await supabase
      .from('financial_documents')
      .insert({
        user_id: user.id,
        document_name: file.name,
        document_type: parsed.type,
        extracted_content: parsed.content,
        file_size: file.size,
        extraction_method: parsed.extractionMethod,
        page_count: parsed.pageCount,
      })
      .select()
      .single()

    if (insertError) {
      console.error('[v0] Database insert error:', insertError)
      return NextResponse.json({ error: 'Failed to store document' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      document: {
        id: doc.id,
        name: doc.document_name,
        type: doc.document_type,
        content: doc.extracted_content,
        extractionMethod: parsed.extractionMethod,
        pageCount: parsed.pageCount,
      },
    })
  } catch (error) {
    console.error('[v0] Upload error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
