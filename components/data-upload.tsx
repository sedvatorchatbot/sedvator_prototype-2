'use client'

import React, { useState, useRef } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface DataUploadProps {
  onUpload: (content: string, fileType: string, fileName: string) => void
  isLoading?: boolean
}

export function DataUpload({ onUpload, isLoading = false }: DataUploadProps) {
  const [content, setContent] = useState('')
  const [fileType, setFileType] = useState('text')
  const [fileName, setFileName] = useState('Raw Input')
  const [dragActive, setDragActive] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer?.files
    if (files && files[0]) {
      processFile(files[0])
    }
  }

  const processFile = async (file: File) => {
    console.log('[v0] Processing file:', file.name, file.type)

    setFileName(file.name)

    // Validate file size
    const maxSize = file.type === 'application/pdf' ? 50 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      setUploadStatus('error')
      setTimeout(() => setUploadStatus('idle'), 3000)
      return
    }

    // Determine file type
    let type = 'text'
    if (file.name.endsWith('.csv')) {
      type = 'csv'
    } else if (file.name.endsWith('.json')) {
      type = 'json'
    } else if (file.type === 'application/pdf') {
      type = 'pdf'
    }

    setFileType(type)

    // For PDFs and other files, use server-side processing
    if (type === 'pdf' || type === 'csv' || type === 'json') {
      try {
        console.log('[v0] Uploading file to server for processing')
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/finance/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          console.error('[v0] Upload error:', error)
          setUploadStatus('error')
          setTimeout(() => setUploadStatus('idle'), 3000)
          return
        }

        const result = await response.json()
        console.log('[v0] File uploaded successfully')

        setContent(result.document.content)
        setUploadStatus('success')
        setTimeout(() => setUploadStatus('idle'), 2000)
        onUpload(result.document.content, type, file.name)
      } catch (error) {
        console.error('[v0] Upload error:', error)
        setUploadStatus('error')
        setTimeout(() => setUploadStatus('idle'), 3000)
      }
      return
    }

    // For plain text, read client-side
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setContent(text)
      setUploadStatus('success')
      setTimeout(() => setUploadStatus('idle'), 2000)
      onUpload(text, type, file.name)
    }

    reader.readAsText(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files[0]) {
      processFile(files[0])
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData?.getData('text')
    if (text) {
      setContent(text)
      setFileType('text')
      setFileName('Pasted Content')
      onUpload(text, 'text', 'Pasted Content')
    }
  }

  const handleTextSubmit = () => {
    if (!content.trim()) return
    onUpload(content, fileType, fileName)
  }

  return (
    <div className="space-y-4">
      {/* Drag & Drop Area */}
      <Card
        className={`border-2 border-dashed transition-all ${
          dragActive ? 'border-cyan-500 bg-cyan-500/5' : 'border-border'
        } p-6 text-center cursor-pointer hover:border-cyan-500/50`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
        <h3 className="font-semibold text-foreground mb-1">Upload Financial Document</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Drag & drop CSV, JSON, PDF, or text files (max 50MB for PDFs, 10MB for others)
        </p>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileInput}
          accept=".csv,.json,.txt,.pdf"
        />

        <Button variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-2" />
          Choose File
        </Button>

        {/* Upload Status */}
        {uploadStatus === 'success' && (
          <div className="mt-3 text-sm text-green-600 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            File uploaded and processed successfully
          </div>
        )}
        {uploadStatus === 'error' && (
          <div className="mt-3 text-sm text-red-600 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            File too large or upload failed
          </div>
        )}
      </Card>

      {/* Text Input Alternative */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Or paste content directly:</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onPaste={handlePaste}
          placeholder="Paste financial data, CSV, JSON, or financial report text here..."
          className="w-full h-32 p-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* File Type Selector */}
      <div className="grid grid-cols-3 gap-2">
        {['text', 'csv', 'json'].map((type) => (
          <button
            key={type}
            onClick={() => setFileType(type)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              fileType === type
                ? 'bg-cyan-500 text-white'
                : 'border border-border text-foreground hover:border-cyan-500'
            }`}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Submit Button */}
      {content.trim() && (
        <Button
          onClick={handleTextSubmit}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Document'}
        </Button>
      )}
    </div>
  )
}
