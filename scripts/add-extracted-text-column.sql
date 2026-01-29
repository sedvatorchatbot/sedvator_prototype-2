-- Add extracted_text column to file_attachments table
ALTER TABLE file_attachments ADD COLUMN IF NOT EXISTS extracted_text TEXT;

-- Update the updated_at timestamp
UPDATE file_attachments SET updated_at = NOW() WHERE extracted_text IS NULL;
