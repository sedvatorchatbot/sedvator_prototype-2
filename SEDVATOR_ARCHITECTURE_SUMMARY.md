# SEDVATOR - Complete Architecture & Components Summary

## 🏗️ PROJECT STRUCTURE OVERVIEW

Sedvator is an AI-powered educational platform with voice/text chatbot, gamified learning, and personalized study routines.

---

## 📱 PAGES & ROUTES

### 1. **Homepage** (`/app/page.tsx`)
- **Purpose**: Landing page showcasing app features
- **Features Highlighted**: Voice/text input, grade-based learning, internet search, study routines, games & quizzes
- **Components Used**: Feature cards
- **Design**: Hero section with feature cards grid

### 2. **Chat Page** (`/app/chat/page.tsx`)
- **Purpose**: Main AI chatbot interface for voice and text conversations
- **Components Used**: ChatInterface
- **APIs Used**: `/api/chat` (AI response), `/api/tts` (text-to-speech), `/api/search` (internet search)

### 3. **Games Hub** (`/app/games/page.tsx`)
- **Purpose**: Central hub for all learning games
- **Components Used**: GamesHub
- **Games Available**: Flashcards, Memory Match, Quiz, Speed Quiz, Fill Blanks, Word Match
- **APIs Used**: `/api/quiz/generate`, `/api/flashcards/generate`, `/api/game/score`

### 4. **Study Routines** (`/app/routine/page.tsx`)
- **Purpose**: Manage and create personalized study schedules
- **Components Used**: RoutineDashboard, AIRoutineGenerator, AdvancedRoutineBuilder
- **APIs Used**: `/api/routine/*` (CRUD operations), `/api/routine/generate-ai` (AI-powered routine creation)
- **Features**: Auto-generate routines, manual builder, reminders with alarms

### 5. **Authentication Pages** (`/app/auth/`)
- **Login** (`login/page.tsx`): User login interface
- **Sign Up** (`sign-up/page.tsx`): User registration
- **Sign Up Success** (`sign-up-success/page.tsx`): Success confirmation
- **APIs Used**: `/api/auth/login`, `/api/auth/signup`

---

## 🎯 CORE COMPONENTS

### **CHATBOT FEATURES**

#### 1. **ChatInterface** (`components/chat-interface.tsx`)
- **Purpose**: Main chatbot UI component for conversations
- **Features**:
  - Text and voice input modes
  - Message history display
  - Real-time conversation
  - File attachments support
- **APIs**: 
  - `/api/chat` - Get AI responses
  - `/api/tts` - Convert text to speech
  - `/api/search` - Get web search results
  - `/api/files/upload` - Upload files
- **Design**: Message bubbles, input area, conversation history
- **Libraries**: Lucide icons, custom styling

#### 2. **MessageBubble** (`components/message-bubble.tsx`)
- **Purpose**: Display individual chat messages
- **Features**: Different styling for user vs AI messages
- **Design**: Rounded bubbles with different background colors
- **Used In**: ChatInterface

#### 3. **JarvisAvatar** (`components/jarvis-avatar.tsx`)
- **Purpose**: Animated AI avatar for visual feedback
- **Features**: Speaking animation, visual indicator when AI is responding
- **Design**: Animated avatar element
- **Used In**: ChatInterface

#### 4. **LightningCursor** (`components/lightning-cursor.tsx`)
- **Purpose**: Custom interactive cursor effect
- **Design**: Visual enhancement with lightning effect on cursor movement
- **Used In**: Throughout app for UI polish

---

### **GAMES & QUIZZES**

#### 1. **GamesHub** (`components/games-hub.tsx`)
- **Purpose**: Central hub displaying all available games
- **Components Displayed**: 
  - FlashcardGame
  - MemoryMatchGame
  - QuizGame
  - SpeedQuiz
  - FillBlanksGame
  - WordMatchGame
- **Design**: Grid layout with game cards
- **Used In**: `/app/games` page

#### 2. **FlashcardGame** (`components/flashcard-game.tsx`)
- **Purpose**: Interactive flashcard learning
- **Features**:
  - Flip cards to reveal answers
  - Track progress
  - Generate cards from AI
- **APIs**: `/api/flashcards/generate` (Generate flashcards), `/api/game/score` (Save scores)
- **Design**: Card-based UI with flip animation
- **Why Used**: Effective for memorization and vocabulary

#### 3. **QuizGame** (`components/quiz-game.tsx`)
- **Purpose**: Traditional multiple choice quiz
- **Features**:
  - Multiple choice questions
  - Instant feedback
  - Score tracking
  - Question timer
- **APIs**: `/api/quiz/generate` (Generate questions), `/api/quiz/attempt` (Submit answers), `/api/game/score` (Save scores)
- **Design**: Question display, multiple choice buttons, progress bar
- **Why Used**: Assessments and knowledge verification

#### 4. **SpeedQuiz** (`components/speed-quiz.tsx`)
- **Purpose**: Timed rapid-fire quiz
- **Features**:
  - Timer-based gameplay
  - Quick questions
  - Score multiplier for speed
  - Leaderboard potential
- **APIs**: `/api/quiz/generate`, `/api/game/score`
- **Design**: Minimal UI focused on timer and question
- **Why Used**: Gamified engagement with time pressure

#### 5. **MemoryMatchGame** (`components/memory-match-game.tsx`)
- **Purpose**: Classic memory/matching game
- **Features**:
  - Card matching mechanics
  - Difficulty levels
  - Move counter
  - Score tracking
- **APIs**: `/api/game/score` (Save scores)
- **Design**: Grid of cards with flip animation
- **Why Used**: Visual memory training, cognitive development

#### 6. **FillBlanksGame** (`components/fill-blanks-game.tsx`)
- **Purpose**: Fill-in-the-blank exercise
- **Features**:
  - Text input for blanks
  - Instant correction
  - Hint system
- **APIs**: `/api/quiz/generate` (Get content), `/api/game/score`
- **Design**: Sentence display with input fields
- **Why Used**: Active recall and language learning

#### 7. **WordMatchGame** (`components/word-match-game.tsx`)
- **Purpose**: Match words with definitions
- **Features**:
  - Drag-and-drop matching
  - Difficulty levels
  - Vocabulary building
- **APIs**: `/api/game/score` (Save scores)
- **Design**: Two columns for dragging/matching
- **Why Used**: Vocabulary and definition association

---

### **STUDY ROUTINES & SCHEDULING**

#### 1. **RoutineDashboard** (`components/routine-dashboard.tsx`)
- **Purpose**: Manage user's study routines
- **Features**:
  - View all routines
  - Create new routines
  - Edit existing routines
  - Set alarms and reminders
  - Delete routines
- **APIs**: 
  - `/api/routine` (List routines)
  - `/api/routine/[id]` (Get, update, delete)
  - `/api/reminders/sync` (Sync reminders)
- **Components Used**: RoutineCard, AIRoutineGenerator, AdvancedRoutineBuilder
- **Design**: Card-based layout with action buttons
- **Used In**: `/app/routine` page

#### 2. **RoutineCard** (`components/routine-card.tsx`)
- **Purpose**: Display individual routine details
- **Features**:
  - Show routine name and sessions
  - Display time information
  - Quick action buttons (edit, delete, alarms)
- **Design**: Card component with session list
- **Used In**: RoutineDashboard

#### 3. **AIRoutineGenerator** (`components/ai-routine-generator.tsx`)
- **Purpose**: Generate study routines using AI
- **Features**:
  - Natural language input for study goals
  - AI parses goals and creates optimized schedule
  - Suggest study sessions with optimal timing
  - Add breaks automatically
- **APIs**: 
  - `/api/routine/generate-ai` (AI generates routine)
  - `/api/routine` (Save routine to database)
- **Libraries**: Groq AI (for fast LLM inference)
- **Design**: Input form + loading state + preview
- **Why Used**: Provides intelligent, personalized schedules based on user goals

#### 4. **AdvancedRoutineBuilder** (`components/advanced-routine-builder.tsx`)
- **Purpose**: Manual routine creation with full control
- **Features**:
  - Add/edit/delete sessions manually
  - Set specific times and durations
  - Organize session order
  - Add notes and details
- **APIs**: `/api/routine/advanced` (Save advanced routine)
- **Design**: Form with dynamic session inputs
- **Why Used**: Power users who want complete control

#### 5. **SimpleRoutineGenerator** (`components/simple-routine-generator.tsx`)
- **Purpose**: Quick routine generation with basic inputs
- **Features**:
  - Simple form for routine creation
  - Fewer options than advanced builder
  - Quick setup
- **APIs**: `/api/routine` (Save routine)
- **Design**: Simplified input form
- **Why Used**: Quick onboarding for new users

#### 6. **ReminderModal** (`components/reminder-modal.tsx`)
- **Purpose**: Set reminders and alarms for study sessions
- **Features**:
  - Configure reminder times
  - Set alarm sounds and vibration
  - Enable/disable reminders
  - Recurring reminders
- **APIs**: `/api/reminders/sync` (Sync reminders)
- **Libraries**: Notifications API
- **Design**: Modal dialog with reminder options
- **Why Used**: Keeps users on track with study schedules

---

### **NOTIFICATIONS & ALARMS**

#### 1. **NotificationPermissionManager** (`components/notification-permission-manager.tsx`)
- **Purpose**: Manage browser and phone notification permissions
- **Features**:
  - Request browser notification permission
  - Request phone alarm/vibration permission
  - Test notifications
  - Test phone alarms
  - Show permission status
- **APIs**: `/api/notifications/permissions` (Save preferences)
- **Libraries**: Notifications API, Vibration API
- **Design**: Permission cards with enable/test buttons
- **Used In**: Settings or onboarding flow

---

### **UI & DESIGN COMPONENTS**

#### 1. **AnimatedLogo** (`components/animated-logo.tsx`)
- **Purpose**: Animated Sedvator logo for branding
- **Design**: SVG animation with brand colors
- **Used In**: Navbar, header

#### 2. **ThemeProvider** (`components/theme-provider.tsx`)
- **Purpose**: Manage light/dark theme
- **Features**: Toggle between light and dark mode
- **Libraries**: next-themes
- **Used In**: App layout wrapper

#### 3. **ThemeToggle** (`components/theme-toggle.tsx`)
- **Purpose**: UI button to switch themes
- **Features**: Visual toggle between light/dark
- **Design**: Icon button with Sun/Moon icons
- **Used In**: Header/navbar

#### 4. **OnboardingModal** (`components/onboarding-modal.tsx`)
- **Purpose**: First-time user onboarding experience
- **Features**:
  - Introduction to app features
  - Permission requests
  - Setup guide
- **Design**: Modal with step-by-step guide
- **Used In**: First app visit

#### 5. **UI Components** (`components/ui/`)
- **Button**: Reusable button with variants
- **Card**: Card container for content
- **Input**: Text input fields
- **Label**: Form labels
- **Select**: Dropdown selection
- **Switch**: Toggle switches
- **Tabs**: Tab navigation
- **Textarea**: Multi-line text input
- **Progress**: Progress bars
- **Dropdown Menu**: Menu dropdowns
- **Tooltip**: Hover tooltips
- **All from**: shadcn/ui library

---

## 🔌 API ROUTES & FUNCTIONALITY

### **CHATBOT APIs**

| API | Method | Purpose | Used By |
|-----|--------|---------|---------|
| `/api/chat` | POST | Get AI response from Groq/LLM | ChatInterface |
| `/api/tts` | POST | Convert text to speech | ChatInterface |
| `/api/search` | GET | Search internet for answers | ChatInterface |
| `/api/files/upload` | POST | Upload and process documents | ChatInterface |

### **AUTHENTICATION APIs**

| API | Method | Purpose | Used By |
|-----|--------|---------|---------|
| `/api/auth/login` | POST | User login | Login page |
| `/api/auth/signup` | POST | User registration | Sign up page |
| `/api/account/delete` | DELETE | Delete user account | Settings |

### **GAMES & QUIZZES APIs**

| API | Method | Purpose | Used By |
|-----|--------|---------|---------|
| `/api/quiz/generate` | POST | Generate quiz questions | Quiz games |
| `/api/quiz/attempt` | POST | Submit quiz answers | Quiz games |
| `/api/flashcards/generate` | POST | Generate flashcards | Flashcard game |
| `/api/game/score` | POST | Save game scores | All games |
| `/api/mock-test/attempt` | POST | Submit mock test answers | Mock test feature |

### **ROUTINE APIs**

| API | Method | Purpose | Used By |
|-----|--------|---------|---------|
| `/api/routine` | GET, POST | List and create routines | RoutineDashboard |
| `/api/routine/[id]` | GET, PUT, DELETE | Get, update, delete routine | RoutineCard, RoutineDashboard |
| `/api/routine/generate-ai` | POST | Generate routine using AI | AIRoutineGenerator |
| `/api/routine/advanced` | POST | Create advanced routine | AdvancedRoutineBuilder |

### **REMINDER & NOTIFICATION APIs**

| API | Method | Purpose | Used By |
|-----|--------|---------|---------|
| `/api/reminders/sync` | POST | Sync reminders with server | RoutineDashboard |
| `/api/notifications/permissions` | POST | Save notification preferences | NotificationPermissionManager |
| `/api/mood` | POST | Track study mood/progress | Various |

---

## 🎨 DESIGN SYSTEM

### **Color Palette**
- **Primary**: Cyan/Blue (study focus)
- **Secondary**: Purple (interactive elements)
- **Neutral**: Gray scale for text and backgrounds
- **Accent**: Green for success, Red for errors

### **Typography**
- **Font Family**: Geist (sans-serif)
- **Headings**: Bold, large scale
- **Body**: Regular weight, 14-16px
- **Code**: Geist Mono

### **Layout**
- **Responsive**: Mobile-first design
- **Grid System**: Tailwind CSS grid (sm, md, lg breakpoints)
- **Spacing**: 4px-based scale (gap-4, p-6, etc.)
- **Layout Method**: Flexbox for most layouts, Grid for complex 2D layouts

### **Components Style**
- **Cards**: Rounded corners, subtle shadows, hover effects
- **Buttons**: Multiple variants (default, outline, ghost)
- **Inputs**: Clean border, focus states
- **Icons**: Lucide React icons (24px standard)

---

## 🔄 DATA FLOW

### **Chat Feature Flow**
1. User inputs text or voice → ChatInterface
2. Text sent to `/api/chat` → Groq AI processes
3. AI response returned → Display in ChatInterface
4. Optional: Text-to-speech via `/api/tts`
5. Optional: Web search via `/api/search` for context

### **Games Feature Flow**
1. User selects game → GamesHub
2. Game component loads
3. Game generates content via `/api/quiz/generate` or `/api/flashcards/generate`
4. User plays game
5. Score saved via `/api/game/score`
6. Results displayed

### **Routine Feature Flow**
1. User navigates to `/routine` → RoutineDashboard
2. User can:
   - **Create with AI**: AIRoutineGenerator → `/api/routine/generate-ai`
   - **Create manually**: AdvancedRoutineBuilder → `/api/routine/advanced`
   - **View routines**: Fetch from `/api/routine`
3. Routines saved to Supabase database
4. Reminders set up via ReminderModal
5. Alarms trigger at scheduled times using Notifications API

### **Authentication Flow**
1. User signs up → `/api/auth/signup` → Supabase Auth
2. User logs in → `/api/auth/login` → Supabase Auth
3. Session managed with cookies
4. Protected routes check authentication

---

## 🛠️ TECHNOLOGY STACK

### **Frontend**
- **Framework**: Next.js 16 (React)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Animation**: CSS animations
- **Form Handling**: React hooks

### **Backend**
- **API**: Next.js API Routes
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **AI**: Groq LLM (fast inference)
- **Search**: SearchAPI integration
- **Text-to-Speech**: Web Speech API

### **Libraries**
- **AI SDK**: Vercel AI SDK v6 (for LLM integration)
- **Theme**: next-themes (dark/light mode)
- **Notifications**: Web Notifications API
- **Vibration**: Vibration API
- **Speech**: Web Speech API

---

## 📊 DATABASE SCHEMA

### **Tables**
- **profiles**: User profile data
- **routines**: Study routines
- **routine_sessions**: Individual sessions in routines
- **routine_reminders**: Reminders for routines
- **chat_history**: Chat conversation history
- **quizzes**: Quiz questions and answers
- **flashcards**: Flashcard sets
- **game_scores**: User game scores
- **reminders**: Scheduled reminders
- **files**: Uploaded file metadata

---

## ✨ KEY FEATURES EXPLAINED

### **1. Why Groq for AI?**
- Super fast LLM inference (~0.1-0.5s response time)
- Cost-effective for high-volume requests
- Good quality responses for educational content
- Better for real-time chat experiences

### **2. Why Games?**
- **Gamification**: Increases user engagement and retention
- **Active Recall**: Games force memory retrieval vs passive reading
- **Spaced Repetition**: Different game formats for memory consolidation
- **Motivation**: Rewards and score tracking drive learning

### **3. Why Voice/Text Hybrid?**
- **Accessibility**: Users can choose their input method
- **Flexibility**: Some prefer typing, some prefer speaking
- **On-the-go**: Voice input allows studying while mobile
- **Multiple Learning Styles**: Caters to different preferences

### **4. Why Study Routines?**
- **Organization**: Helps students structure their study time
- **Consistency**: Regular schedules improve retention
- **AI-Powered**: Balances subjects based on cognitive load
- **Reminders**: Automated notifications ensure adherence

### **5. Why Personalization?**
- **Adaptive Learning**: Content adjusts to grade level
- **Custom Routines**: AI generates routines based on goals
- **Progress Tracking**: Games and quizzes provide feedback
- **Student-Centric**: Focuses on individual learning pace

---

## 📈 Component Hierarchy

```
Layout (app/layout.tsx)
├── ThemeProvider
├── Pages
│   ├── HomePage (/)
│   ├── ChatPage (/chat)
│   │   └── ChatInterface
│   │       ├── MessageBubble
│   │       ├── JarvisAvatar
│   │       └── LightningCursor
│   ├── GamesPage (/games)
│   │   └── GamesHub
│   │       ├── FlashcardGame
│   │       ├── QuizGame
│   │       ├── SpeedQuiz
│   │       ├── MemoryMatchGame
│   │       ├── FillBlanksGame
│   │       └── WordMatchGame
│   └── RoutinePage (/routine)
│       └── RoutineDashboard
│           ├── RoutineCard
│           ├── AIRoutineGenerator
│           ├── AdvancedRoutineBuilder
│           └── ReminderModal
└── Shared
    ├── ThemeToggle
    ├── NotificationPermissionManager
    └── UI Components (Button, Card, Input, etc.)
```

---

This comprehensive architecture document outlines how Sedvator combines AI chatbots, gamified learning, and personalized study planning into an integrated educational platform.
