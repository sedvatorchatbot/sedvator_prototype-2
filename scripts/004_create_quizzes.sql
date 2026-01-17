-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  topic TEXT,
  source_type TEXT NOT NULL DEFAULT 'topic', -- 'topic' or 'pdf'
  questions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quiz attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_taken INTEGER, -- seconds
  answers JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create flashcard sets table
CREATE TABLE IF NOT EXISTS flashcard_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  topic TEXT,
  cards JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create game scores table
CREATE TABLE IF NOT EXISTS game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_type TEXT NOT NULL, -- 'speed_quiz', 'flashcard_memory'
  score INTEGER NOT NULL,
  streak INTEGER DEFAULT 0,
  time_taken INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quizzes
CREATE POLICY "quizzes_select_own" ON quizzes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "quizzes_insert_own" ON quizzes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "quizzes_delete_own" ON quizzes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for quiz_attempts
CREATE POLICY "attempts_select_own" ON quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "attempts_insert_own" ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for flashcard_sets
CREATE POLICY "flashcards_select_own" ON flashcard_sets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "flashcards_insert_own" ON flashcard_sets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "flashcards_delete_own" ON flashcard_sets FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for game_scores
CREATE POLICY "scores_select_own" ON game_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "scores_insert_own" ON game_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
