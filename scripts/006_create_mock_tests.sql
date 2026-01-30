-- Mock Tests Schema
CREATE TABLE IF NOT EXISTS mock_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL, -- 'cbse_9', 'cbse_10', 'cbse_11', 'cbse_12', 'jee_mains', 'jee_advanced'
  subject TEXT NOT NULL, -- 'physics', 'chemistry', 'mathematics', 'biology'
  test_name TEXT NOT NULL,
  total_questions INT NOT NULL,
  total_marks INT NOT NULL,
  time_limit_minutes INT NOT NULL,
  difficulty_level TEXT NOT NULL, -- 'easy', 'medium', 'hard'
  marking_scheme JSONB NOT NULL, -- { "correct": 4, "incorrect": -2, "unattempted": 0 }
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'in_progress'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mock_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mock_test_id UUID NOT NULL REFERENCES mock_tests(id) ON DELETE CASCADE,
  question_number INT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL, -- 'single_correct', 'multiple_correct'
  options JSONB NOT NULL, -- [{ "id": "a", "text": "option text" }, ...]
  correct_options TEXT[] NOT NULL, -- ['a', 'b'] for multiple correct
  marks INT NOT NULL,
  negative_marks INT NOT NULL,
  solution TEXT, -- detailed explanation
  difficulty TEXT NOT NULL, -- 'easy', 'medium', 'hard'
  topic TEXT, -- subject topic
  pyq_year INT, -- previous year paper year
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mock_test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mock_test_id UUID NOT NULL REFERENCES mock_tests(id) ON DELETE CASCADE,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  total_time_spent INT, -- in seconds
  obtained_marks DECIMAL(10, 2),
  total_marks INT,
  status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'auto_submitted'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mock_test_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES mock_test_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES mock_questions(id) ON DELETE CASCADE,
  selected_options TEXT[] NOT NULL, -- ['a', 'b'] for multiple selections
  is_correct BOOLEAN,
  marks_obtained DECIMAL(10, 2),
  time_spent INT, -- in seconds
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mock_test_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES mock_test_attempts(id) ON DELETE CASCADE,
  total_correct INT,
  total_incorrect INT,
  total_unattempted INT,
  accuracy_percentage DECIMAL(5, 2),
  subject_wise_analysis JSONB, -- { "physics": { "correct": 5, "incorrect": 2, "accuracy": 71.4 }, ... }
  difficulty_wise_analysis JSONB, -- { "easy": { "correct": 10 }, "medium": { "correct": 5 }, "hard": { "correct": 1 } }
  rank_estimate INT,
  percentile_estimate DECIMAL(5, 2),
  strength_areas TEXT[],
  weakness_areas TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_test_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_test_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own mock tests" ON mock_tests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create mock tests" ON mock_tests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view questions in their mock tests" ON mock_questions
  FOR SELECT USING (
    mock_test_id IN (
      SELECT id FROM mock_tests WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own attempts" ON mock_test_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create attempts" ON mock_test_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attempts" ON mock_test_attempts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own responses" ON mock_test_responses
  FOR SELECT USING (
    attempt_id IN (
      SELECT id FROM mock_test_attempts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create responses" ON mock_test_responses
  FOR INSERT WITH CHECK (
    attempt_id IN (
      SELECT id FROM mock_test_attempts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own analysis" ON mock_test_analysis
  FOR SELECT USING (
    attempt_id IN (
      SELECT id FROM mock_test_attempts WHERE user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_mock_tests_user_id ON mock_tests(user_id);
CREATE INDEX idx_mock_tests_exam_type ON mock_tests(exam_type);
CREATE INDEX idx_mock_questions_test_id ON mock_questions(mock_test_id);
CREATE INDEX idx_mock_attempts_user_id ON mock_test_attempts(user_id);
CREATE INDEX idx_mock_attempts_test_id ON mock_test_attempts(mock_test_id);
CREATE INDEX idx_mock_responses_attempt_id ON mock_test_responses(attempt_id);
CREATE INDEX idx_mock_analysis_attempt_id ON mock_test_analysis(attempt_id);
