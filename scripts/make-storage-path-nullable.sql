-- Make storage_path nullable since we're extracting text only
ALTER TABLE file_attachments ALTER COLUMN storage_path DROP NOT NULL;
