-- Add file_attachments table to store uploaded files metadata
CREATE TABLE file_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for file_attachments
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "file_attachments_select_own" ON file_attachments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "file_attachments_insert_own" ON file_attachments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "file_attachments_delete_own" ON file_attachments
  FOR DELETE USING (auth.uid() = user_id);

-- Update chat_messages table to include file attachment IDs
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS file_attachment_ids UUID[] DEFAULT '{}';

-- Create indexes for faster queries
CREATE INDEX file_attachments_user_id_idx ON file_attachments(user_id);
CREATE INDEX file_attachments_message_id_idx ON file_attachments(message_id);
CREATE INDEX chat_messages_file_attachment_ids_idx ON chat_messages USING GIN(file_attachment_ids);
