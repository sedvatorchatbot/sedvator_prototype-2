-- Add chat_history_enabled column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS chat_history_enabled boolean DEFAULT true;
