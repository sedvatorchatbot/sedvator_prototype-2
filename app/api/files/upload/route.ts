import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as pdfParse from 'pdf-parse'
import * as mammoth from 'mammoth'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const userId = formData.get('userId') as string
    const messageId = formData.get('messageId') as string | null

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const fileAttachments: any[] = []

    for (const file of files) {
      // Check file size (25MB limit)
      if (file.size > 25 * 1024 * 1024) {
        continue // Skip files larger than 25MB
      }

      let extractedText = ''
      const fileType = file.type

      try {
        const buffer = await file.arrayBuffer()
        const uint8Array = new Uint8Array(buffer)

        if (fileType === 'application/pdf') {
          // Extract text from PDF
          const pdf = await pdfParse(Buffer.from(uint8Array))
          extractedText = pdf.text
        } else if (
          fileType ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
          // Extract text from DOCX
          const result = await mammoth.extractRawText({ arrayBuffer: buffer })
          extractedText = result.value
        } else if (fileType === 'text/plain' || fileType === 'text/markdown') {
          // Extract text from TXT/MD
          extractedText = new TextDecoder().decode(uint8Array)
        } else if (fileType.startsWith('image/')) {
          // For images, we'll use a placeholder
          extractedText = `[Image: ${file.name}]\nFile size: ${(file.size / 1024).toFixed(2)} KB`
        } else if (
          fileType ===
          'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ) {
          // For PPTX, extract as text (limited)
          extractedText = `[Presentation: ${file.name}]\nFile size: ${(file.size / 1024 / 1024).toFixed(2)} MB`
        } else if (fileType === 'text/csv') {
          // Extract CSV as text
          extractedText = new TextDecoder().decode(uint8Array)
        } else {
          // For other formats, show file info
          extractedText = `[File: ${file.name}]\nType: ${fileType}\nSize: ${(file.size / 1024 / 1024).toFixed(2)} MB`
        }
      } catch (error) {
        console.error('[v0] Error extracting text from file:', error)
        extractedText = `[File: ${file.name}]\nFailed to extract text. Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`
      }

      // Store file attachment in database (message_id is optional for now)
      const { data, error } = await supabase
        .from('file_attachments')
        .insert({
          message_id: messageId || null,
          user_id: userId,
          file_name: file.name,
          file_type: fileType,
          file_size: file.size,
          extracted_text: extractedText.substring(0, 50000), // Limit to 50k chars
        })
        .select()
        .single()

      if (error) {
        console.error('[v0] Error storing file attachment:', error)
        continue
      }

      fileAttachments.push({
        id: data.id,
        fileName: file.name,
        fileType: fileType,
        extractedText: extractedText,
      })
    }

    return NextResponse.json({
      success: true,
      attachments: fileAttachments,
    })
  } catch (error) {
    console.error('[v0] File upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process files' },
      { status: 500 }
    )
  }
}
