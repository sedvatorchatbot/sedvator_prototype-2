-- Drop old routine tables if they exist
DROP TABLE IF EXISTS routine_sessions CASCADE;
DROP TABLE IF EXISTS study_routines CASCADE;

-- Create improved study routines table supporting 16+ hours
CREATE TABLE study_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  daily_hours INT NOT NULL CHECK (daily_hours > 0 AND daily_hours <= 24),
  subjects TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);

-- Create routine sessions table for flexible time slot management
CREATE TABLE routine_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES study_routines(id) ON DELETE CASCADE,
  session_name VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INT NOT NULL,
  session_order INT NOT NULL,
  is_break BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create reminders table synced with routine sessions
CREATE TABLE routine_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES routine_sessions(id) ON DELETE CASCADE,
  routine_id UUID NOT NULL REFERENCES study_routines(id) ON DELETE CASCADE,
  reminder_time TIME NOT NULL,
  notification_sent BOOLEAN DEFAULT false,
  last_notified TIMESTAMP WITH TIME ZONE,
  reminder_type VARCHAR(50) DEFAULT 'browser' CHECK (reminder_type IN ('browser', 'phone', 'both')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(session_id)
);

-- Create notification permission tracking
CREATE TABLE notification_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  browser_notifications_enabled BOOLEAN DEFAULT false,
  phone_notifications_enabled BOOLEAN DEFAULT false,
  last_permission_requested TIMESTAMP WITH TIME ZONE,
  permission_granted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE study_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_permissions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own routines"
  ON study_routines FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create routines"
  ON study_routines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routines"
  ON study_routines FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routines"
  ON study_routines FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their routine sessions"
  ON routine_sessions FOR SELECT
  USING (routine_id IN (SELECT id FROM study_routines WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their routine sessions"
  ON routine_sessions FOR INSERT
  WITH CHECK (routine_id IN (SELECT id FROM study_routines WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their reminders"
  ON routine_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their reminders"
  ON routine_reminders FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their notification permissions"
  ON notification_permissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their notification permissions"
  ON notification_permissions FOR ALL
  USING (auth.uid() = user_id);
