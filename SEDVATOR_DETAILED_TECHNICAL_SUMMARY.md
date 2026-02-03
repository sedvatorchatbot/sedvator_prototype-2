# SEDVATOR - COMPLETE TECHNICAL SUMMARY

## TABLE OF CONTENTS
1. [Routine/Timetable Features](#routine-timetable)
2. [Quiz & Games Features](#quiz-games)
3. [Chatbot Features](#chatbot)
4. [Database Schema](#database)
5. [API Architecture](#api-architecture)

---

## ROUTINE/TIMETABLE FEATURES {#routine-timetable}

### Overview
The routine/timetable feature allows users to create optimized study schedules using AI. The system generates personalized routines based on user goals, then stores them in the database with automatic alarm reminders.

### Tech Stack & APIs Used

#### 1. **AI Provider: Groq LLM**
- **Model**: `llama-3.3-70b-versatile`
- **API Endpoint**: `https://api.groq.com/openai/v1/chat/completions`
- **API Key**: `GROQ_API_KEY` (environment variable)
- **Why Groq?**: Fast inference (lowest latency), free tier, OpenAI-compatible API

**Location**: `/lib/ai-provider.ts`
```typescript
export async function generateAIResponse(options: GenerateOptions): Promise<string> {
  // Uses Groq API with llama-3.3-70b model
  // Returns string response from AI
}
```

#### 2. **Backend API Route**
- **Endpoint**: `POST /api/routine/generate-ai`
- **File**: `/app/api/routine/generate-ai/route.ts`
- **Function**: Receives user prompt → sends to Groq → parses JSON → stores in database

**Process Flow**:
```
User Input (goal/subject) 
  ↓
/api/routine/generate-ai (receives prompt)
  ↓
generateAIResponse() calls Groq API
  ↓
AI returns JSON with routine structure:
  {
    name: "Physics Exam Prep",
    description: "...",
    daily_hours: 8,
    sessions: [
      {
        session_name: "Mechanics",
        subject: "Physics",
        start_time: "09:00",
        end_time: "10:30",
        is_break: false,
        notes: "..."
      }
    ]
  }
  ↓
insertBreaksIntoSchedule() adds breaks automatically
  ↓
Database INSERT into 'routines' and 'routine_sessions'
```

#### 3. **Database Storage**
- **Service**: Supabase (PostgreSQL)
- **Tables**:
  - `routines` - Main routine records
  - `routine_sessions` - Individual study sessions for each routine
  - `routine_reminders` - Reminder settings

**Routine Table Schema**:
```sql
CREATE TABLE routines (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  daily_hours INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**Routine Sessions Table Schema**:
```sql
CREATE TABLE routine_sessions (
  id UUID PRIMARY KEY,
  routine_id UUID NOT NULL (Foreign Key),
  session_name VARCHAR NOT NULL,
  subject VARCHAR NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INT NOT NULL,
  session_order INT NOT NULL,
  is_break BOOLEAN,
  notes TEXT,
  created_at TIMESTAMP
)
```

#### 4. **Frontend Component**
- **Component**: `AIRoutineGenerator` (`/components/ai-routine-generator.tsx`)
- **Purpose**: UI for generating routines
- **Features**:
  - Text input for routine name
  - Textarea for study goal/prompt
  - Loading state during generation
  - Error handling and display

```typescript
// Component calls:
const response = await fetch('/api/routine/generate-ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt, routineName })
})
```

#### 5. **Alarm System**
- **Functions**: `setDeviceAlarm()`, `startAlarmChecker()`, `stopAlarmChecker()`
- **File**: `/lib/notifications.ts`
- **Features**:
  - Schedules alarms at session times
  - Periodic background checking (every 30 seconds)
  - Vibration feedback + alarm sound
  - Browser notifications

**Why This Approach?**
- Web browsers can't wake apps from background
- Solution: Check every 30 seconds to catch alarms within 30-sec window
- When alarm triggers: vibration + sound + notification

---

## QUIZ & GAMES FEATURES {#quiz-games}

### Overview
Sedvator offers 6 interactive games that are **FULLY AI-GENERATED** based on user input (topics or uploaded PDFs). Each quiz and game is unique and created on-demand.

### Games List
1. **Quiz Game** - Multiple choice questions
2. **Flashcard Game** - Memory-based term/definition pairs
3. **Speed Quiz** - Fast-paced question answering
4. **Memory Match** - Card matching game
5. **Fill Blanks** - Fill-in-the-blank exercises
6. **Word Match** - Match words to definitions

### Tech Stack & APIs

#### 1. **AI Provider: Groq LLM** (Same as Routines)
- **Model**: `llama-3.3-70b-versatile`
- **Why**: Fast generation, suitable for quick content creation
- **Temperature**: 0.7 (creative but consistent)
- **Max Tokens**: 2048 (for longer content)

---

### QUIZ GENERATION (`/api/quiz/generate`)

#### Endpoint Details
- **Method**: POST
- **File**: `/app/api/quiz/generate/route.ts`
- **Requires**: Topic OR content (from PDF)
- **Difficulty Levels**: basic, intermediate, advanced, expert

#### Generation Process
```
User Request (topic + difficulty)
  ↓
/api/quiz/generate/route.ts
  ↓
generateWithAI() sends prompt to Groq
  ↓
Prompt Example:
"Generate 5 multiple choice questions about Biology.
 Balanced questions testing understanding.
 Return ONLY valid JSON array:
 [{"question":"Q?","options":["A","B","C","D"],"correctIndex":0,"explanation":"Why"}]"
  ↓
Groq Returns JSON Array with questions
  ↓
sanitizeJSON() function cleans response (removes markdown, fixes JSON)
  ↓
Database INSERT into 'quizzes' and 'quiz_questions'
  ↓
Supabase stores quiz with all questions
  ↓
Frontend receives quiz_id + questions array
```

#### Database Schema
```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title VARCHAR NOT NULL,
  topic VARCHAR NOT NULL,
  difficulty VARCHAR,
  created_at TIMESTAMP
)

CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY,
  quiz_id UUID NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- ["option1", "option2", "option3", "option4"]
  correct_index INT NOT NULL,
  explanation TEXT NOT NULL,
  question_order INT,
  created_at TIMESTAMP
)
```

#### JSON Sanitization
```typescript
function sanitizeJSON(str: string): string {
  // Remove markdown code blocks
  str = str.replace(/```json\s*/gi, "").replace(/```\s*/gi, "")
  
  // Extract JSON array
  const startIndex = str.indexOf("[")
  const endIndex = str.lastIndexOf("]")
  str = str.slice(startIndex, endIndex + 1)
  
  // Fix trailing commas, smart quotes, control characters
  return str
}
```

#### Fallback System
If AI generation fails, system returns hardcoded fallback quiz:
```typescript
function generateFallbackQuiz(topic: string, count: number): any[] {
  // Returns 3 basic quiz questions as backup
  // Prevents complete failure
}
```

#### Frontend Component
- **Component**: `QuizGame` (`/components/quiz-game.tsx`)
- **Features**:
  - Multiple choice UI
  - Progress bar
  - Show result + explanation after answer
  - Score tracking
  - Time tracking
  - Save attempt to database via `/api/quiz/attempt`

---

### FLASHCARD GENERATION (`/api/flashcards/generate`)

#### Endpoint Details
- **Method**: POST
- **File**: `/app/api/flashcards/generate/route.ts`
- **Requires**: Topic OR content (from PDF upload)
- **Card Count**: 5-15 cards (configurable)
- **Difficulty**: 4 levels with different instruction sets

#### Generation Process
```
User Request (topic + content source + difficulty)
  ↓
/api/flashcards/generate/route.ts
  ↓
Difficulty Instructions:
  - basic: "Simple terms with straightforward definitions"
  - intermediate: "Core concepts with clear explanations"
  - advanced: "Detailed definitions with nuances"
  - expert: "Advanced terminology with complex relationships"
  ↓
generateWithAI() sends prompt to Groq
  ↓
Prompt:
"Generate 15 flashcards about Biology (Difficulty: INTERMEDIATE)
 Create flashcards covering core concepts with clear explanations.
 Return ONLY JSON array:
 [{"term":"Key concept","definition":"Clear definition"}]"
  ↓
Groq returns array of term-definition pairs
  ↓
JSON parsing extracts flashcard data
  ↓
Database INSERT into 'flashcard_sets' and 'flashcards'
  ↓
Supabase stores complete set
```

#### Database Schema
```sql
CREATE TABLE flashcard_sets (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title VARCHAR NOT NULL,
  topic VARCHAR NOT NULL,
  difficulty VARCHAR,
  cards JSONB NOT NULL, -- Array of {term, definition}
  created_at TIMESTAMP
)
```

#### Frontend Component
- **Component**: `FlashcardGame` (`/components/flashcard-game.tsx`)
- **Features**:
  - Card flip animation
  - "Known" vs "Review" categorization
  - Progress tracking
  - Score saving to database
  - Replay functionality

---

### OTHER GAMES (Memory Match, Fill Blanks, Word Match, Speed Quiz)

#### Components
- **Memory Match**: `/components/memory-match-game.tsx`
- **Fill Blanks**: `/components/fill-blanks-game.tsx`
- **Word Match**: `/components/word-match-game.tsx`
- **Speed Quiz**: `/components/speed-quiz.tsx`

#### How They Work
1. Use AI-generated quiz data as source
2. Reformat data for game-specific UI
3. Track scores via `/api/game/score` endpoint
4. All are dynamically generated, not hardcoded

#### Score Tracking API
- **Endpoint**: `POST /api/game/score`
- **File**: `/app/api/game/score/route.ts`
- **Stores**: gameType, score, streak, metadata
- **Database**: `game_scores` table

---

## CHATBOT FEATURES {#chatbot}

### Overview
AI-powered chatbot using Groq LLM with internet search capabilities and text-to-speech.

### Tech Stack

#### 1. **Core AI: Groq LLM**
- **Model**: `llama-3.3-70b-versatile`
- **Endpoint**: `/api/chat/route.ts`
- **Features**: Streaming responses, context awareness

#### 2. **Internet Search API**
- **Service**: SearchAPI (SEARCHAPI_API_KEY)
- **Purpose**: Real-time information retrieval
- **Used For**: Current events, latest information, web resources

#### 3. **Text-to-Speech (TTS)**
- **Endpoint**: `POST /api/tts/route.ts`
- **Browser API**: Web Speech API (native browser support)
- **Features**: Read responses aloud

#### 4. **File Upload**
- **Endpoint**: `POST /api/files/upload/route.ts`
- **Storage**: Vercel Blob storage
- **Purpose**: Upload study materials (PDFs, documents)
- **Extract**: PDF text for quiz/flashcard generation

#### 5. **Frontend Component**
- **Component**: `ChatInterface` (`/components/chat-interface.tsx`)
- **Features**:
  - Message history
  - Voice input (speech recognition)
  - Text input
  - Streaming responses
  - File upload button
  - Speaker button for TTS
  - Grade-based response adaptation

---

## DATABASE SCHEMA {#database}

### Core Tables (Supabase/PostgreSQL)

```sql
-- Users (via Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR,
  full_name VARCHAR,
  grade_level VARCHAR,
  preferred_language VARCHAR,
  created_at TIMESTAMP
)

-- Routines
CREATE TABLE routines (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id),
  name VARCHAR NOT NULL,
  description TEXT,
  daily_hours INT,
  created_at TIMESTAMP
)

-- Routine Sessions (individual study blocks)
CREATE TABLE routine_sessions (
  id UUID PRIMARY KEY,
  routine_id UUID NOT NULL REFERENCES routines(id),
  session_name VARCHAR NOT NULL,
  subject VARCHAR NOT NULL,
  start_time TIME,
  end_time TIME,
  duration_minutes INT NOT NULL,
  session_order INT NOT NULL,
  is_break BOOLEAN,
  notes TEXT
)

-- Quizzes (AI-generated)
CREATE TABLE quizzes (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title VARCHAR,
  topic VARCHAR,
  difficulty VARCHAR,
  created_at TIMESTAMP
)

-- Quiz Questions
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES quizzes(id),
  question TEXT,
  options JSONB,
  correct_index INT,
  explanation TEXT
)

-- Quiz Attempts (user answers)
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL,
  score INT,
  total_questions INT,
  time_taken INT, -- seconds
  answers JSONB,
  created_at TIMESTAMP
)

-- Flashcard Sets
CREATE TABLE flashcard_sets (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title VARCHAR,
  topic VARCHAR,
  cards JSONB,
  created_at TIMESTAMP
)

-- Game Scores
CREATE TABLE game_scores (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  game_type VARCHAR,
  score INT,
  streak INT,
  metadata JSONB,
  created_at TIMESTAMP
)

-- Chat History
CREATE TABLE chat_history (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  message TEXT,
  response TEXT,
  source VARCHAR, -- 'ai' or 'search'
  created_at TIMESTAMP
)

-- Reminders
CREATE TABLE reminders (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title VARCHAR,
  time TIME,
  days VARCHAR[],
  enabled BOOLEAN,
  created_at TIMESTAMP
)

-- Routine Reminders (linked to sessions)
CREATE TABLE routine_reminders (
  id UUID PRIMARY KEY,
  routine_id UUID NOT NULL REFERENCES routines(id),
  session_id UUID NOT NULL REFERENCES routine_sessions(id),
  user_id UUID NOT NULL,
  enabled BOOLEAN
)

-- File Attachments (for chat uploads)
CREATE TABLE file_attachments (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  chat_id UUID,
  file_name VARCHAR,
  file_type VARCHAR,
  storage_path VARCHAR,
  extracted_text TEXT,
  created_at TIMESTAMP
)
```

---

## API ARCHITECTURE {#api-architecture}

### Summary of All 19 API Routes

#### Authentication APIs
```
POST   /api/auth/signup      - Create new user account
POST   /api/auth/login       - User login
DELETE /api/account/delete   - Delete user account
```

#### Routine APIs
```
GET    /api/routine          - Get user's routines
POST   /api/routine          - Create routine manually
GET    /api/routine/[id]     - Get specific routine
PUT    /api/routine/[id]     - Update routine
DELETE /api/routine/[id]     - Delete routine
POST   /api/routine/generate-ai - Generate routine with AI
POST   /api/routine/advanced - Advanced routine builder
```

#### Quiz APIs
```
POST   /api/quiz/generate    - Generate quiz with AI
POST   /api/quiz/attempt     - Save quiz attempt/score
```

#### Flashcard APIs
```
POST   /api/flashcards/generate - Generate flashcards with AI
```

#### Game APIs
```
POST   /api/game/score       - Save game scores
```

#### Chatbot APIs
```
POST   /api/chat            - Send chat message, get AI response
POST   /api/search          - Internet search via SearchAPI
POST   /api/tts             - Text-to-speech
POST   /api/files/upload    - Upload study materials
```

#### Notification APIs
```
POST   /api/notifications/permissions - Save notification preferences
POST   /api/reminders/sync           - Sync reminders with device
```

#### Other APIs
```
POST   /api/mood             - Track user mood/wellness
POST   /api/mock-test/attempt - Save mock test attempts
```

---

## WHY THIS ARCHITECTURE?

### 1. **Groq LLM for Generation**
- ✓ Fast inference (100+ req/sec)
- ✓ Free tier available
- ✓ OpenAI-compatible API (easy integration)
- ✓ Excellent for real-time content generation
- ✓ Good for high volume (student usage)

### 2. **Supabase for Storage**
- ✓ PostgreSQL reliability
- ✓ Real-time capabilities
- ✓ Built-in authentication
- ✓ Row-level security for data privacy
- ✓ Easy REST API

### 3. **Service Worker + Browser APIs for Notifications**
- ✓ Works on mobile and desktop
- ✓ Background-capable (on supported browsers)
- ✓ Native vibration support on mobile
- ✓ Audio context for alarm sounds
- ✓ No external dependencies

### 4. **Vercel Deployment**
- ✓ Serverless functions (auto-scaling)
- ✓ Edge functions for low latency
- ✓ Built-in CI/CD with GitHub
- ✓ Zero-config deployments
- ✓ Environment variables management

### 5. **Tailwind CSS + shadcn/ui**
- ✓ Rapid development
- ✓ Consistent design system
- ✓ Accessible components
- ✓ Mobile-first responsive design
- ✓ Easy theming (light/dark mode)

---

## FLOW DIAGRAM: HOW IT ALL CONNECTS

```
┌─────────────────────────────────────────────────────────────────┐
│                          SEDVATOR PLATFORM                       │
└─────────────────────────────────────────────────────────────────┘

USER INPUTS
    │
    ├─→ Study Goal (Routine Generation)
    │       │
    │       └─→ AIRoutineGenerator Component
    │           └─→ /api/routine/generate-ai
    │               └─→ Groq LLM (llama-3.3-70b)
    │                   └─→ Parse JSON Response
    │                       └─→ Supabase: routines + routine_sessions
    │                           └─→ setDeviceAlarm()
    │                               └─→ Browser Notifications + Vibration
    │
    ├─→ Quiz Topic/PDF Upload
    │       │
    │       └─→ /api/quiz/generate
    │           └─→ Groq LLM
    │               └─→ Generate Multiple Choice Questions
    │                   └─→ Supabase: quizzes + quiz_questions
    │                       └─→ QuizGame Component (UI)
    │                           └─→ /api/quiz/attempt
    │                               └─→ Save Score + Answers
    │
    ├─→ Flashcard Topic/PDF
    │       │
    │       └─→ /api/flashcards/generate
    │           └─→ Groq LLM
    │               └─→ Generate Term-Definition Pairs
    │                   └─→ Supabase: flashcard_sets
    │                       └─→ FlashcardGame Component
    │                           └─→ /api/game/score
    │
    ├─→ Chat Message
    │       │
    │       ├─→ /api/chat
    │       │   └─→ Groq LLM (with context)
    │       │       └─→ Return streaming response
    │       │
    │       └─→ Optional: /api/search
    │           └─→ SearchAPI
    │               └─→ Internet results
    │
    └─→ Voice/Text Input
        └─→ Web Speech API (browser native)
            └─→ Convert to text
                └─→ Send to /api/chat

PERSISTENCE LAYER
    │
    └─→ Supabase PostgreSQL
        ├─→ User Profiles
        ├─→ Routines & Sessions
        ├─→ Quizzes & Questions
        ├─→ Game Scores
        ├─→ Chat History
        ├─→ Flashcards
        └─→ Reminders
```

---

## KEY TAKEAWAYS

✓ **All Content is AI-Generated** - Quizzes, flashcards, routines are created dynamically using Groq LLM
✓ **Groq is the AI Engine** - Used for routine planning, quiz/flashcard generation, and chatbot
✓ **Supabase is the Database** - Stores all generated content and user progress
✓ **Native Browser APIs** - Notifications, vibration, speech for device integration
✓ **Modular Architecture** - Each feature is independent but interconnected
✓ **Scalable Design** - Serverless APIs can handle high student volume
