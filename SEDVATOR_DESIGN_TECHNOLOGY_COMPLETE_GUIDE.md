# SEDVATOR - COMPLETE DESIGN & TECHNOLOGY STACK GUIDE

## 1. DESIGN SYSTEM

### Color Scheme (OKLCH Color Space)
Used modern OKLCH color format for perceptually uniform colors across light/dark modes.

**Dark Mode (Default):**
- Background: `oklch(0.08 0.01 240)` - Very dark blue-black
- Foreground: `oklch(0.95 0.01 240)` - Almost white
- Primary: `oklch(0.7 0.15 200)` - Cyan/Light Blue
- Accent: `oklch(0.65 0.2 200)` - Bright Cyan
- Card: `oklch(0.12 0.015 240)` - Slightly lighter than background
- Border: `oklch(0.25 0.03 240)` - Subtle borders
- Destructive: `oklch(0.55 0.22 25)` - Red for delete/danger

**Light Mode:**
- Background: `oklch(1 0 0)` - Pure white
- Foreground: `oklch(0.145 0 0)` - Dark black
- Primary: `oklch(0.205 0 0)` - Dark navy
- Accent: `oklch(0.55 0.2 200)` - Bright cyan

**Why OKLCH?**
- Perceptually uniform (equal differences in numbers = equal visual differences)
- Better accessibility than traditional RGB/Hex
- Superior color consistency across light/dark modes
- Better saturation control

### Typography
```
Font Family: Geist (Primary)
Font Family: Geist Mono (Code/Technical)
- Loaded from Google Fonts
- Antialiased rendering
- Font smoothing applied for better readability
```

### Spacing & Radius
```
Base Radius: 0.625rem (10px)
- Radius-sm: 6px
- Radius-md: 8px
- Radius-lg: 10px (default)
- Radius-xl: 14px
```

---

## 2. UI COMPONENTS LIBRARY

### Component Framework: **shadcn/ui + Radix UI**
All UI components built on Radix UI primitives with shadcn/ui styling.

### Core UI Components Used:

| Component | Purpose | Feature |
|-----------|---------|---------|
| **Button** | CTAs, actions | Multiple variants (default, outline, ghost, destructive) |
| **Card** | Content containers | Rounded border, padding, shadow |
| **Input** | Text fields | Validation, placeholder, focus states |
| **Label** | Form labels | Accessibility, associated with inputs |
| **Select** | Dropdowns | Multi-select support, searchable |
| **Tabs** | Section switching | Keyboard navigation support |
| **Dialog/Modal** | Popups | Focus trap, escape to close |
| **Dropdown Menu** | Context menus | Keyboard accessible |
| **Progress** | Progress bars | Animated fill |
| **Switch** | Toggle switches | Accessibility features |
| **Textarea** | Multi-line input | Auto-resizing support |
| **Tooltip** | Help text | Hover/focus triggered |

### Why shadcn/ui?
- Fully accessible (WCAG 2.1 compliant)
- Customizable styling with Tailwind
- Copy-paste components (no black box)
- Lightweight (only use what you need)
- Built on production-ready Radix UI

---

## 3. ANIMATION SYSTEM

### Tailwind CSS Animations
Used `tailwindcss-animate` and `tw-animate-css` for smooth animations.

### Custom Animations in globals.css:

#### Jarvis Avatar Animations
```css
.jarvis-glow {
  box-shadow: 0 0 30px oklch(0.6 0.2 200 / 0.3),
              0 0 60px oklch(0.6 0.2 200 / 0.15);
}
/* Glow effect on active state */

.jarvis-pulse {
  animation: jarvis-pulse 2s ease-in-out infinite;
}
/* Pulse from 0.8 to 1.0 opacity with 1.02x scale */

.jarvis-ring {
  animation: jarvis-ring 3s linear infinite;
}
/* 360° rotation every 3 seconds */

.listening-wave {
  animation: listening-wave 1s ease-in-out infinite;
}
/* Vertical scale animation when listening */
```

**Why these animations?**
- Jarvis glow: Visual feedback that AI is processing
- Jarvis pulse: Indicates speaking state
- Jarvis ring: Shows active listening
- Listening wave: Real-time feedback during speech recognition

#### Chat Animations
- Fade-in for new messages
- Smooth scroll to bottom
- Loading spinner (built-in Tailwind)

#### Lightning Cursor
```javascript
Canvas-based animation with:
- Real-time mouse tracking
- Tile grid system (40px tiles)
- Brightness interpolation
- Smooth fade effects
```

**Why Canvas?**
- Better performance than DOM updates
- Smooth 60fps animations
- No layout recalculations

---

## 4. FEATURE-SPECIFIC TECHNOLOGY

### A. CHATBOT INTERFACE

**Components:**
- `ChatInterface.tsx` - Main chat container
- `MessageBubble.tsx` - Individual messages
- `JarvisAvatar.tsx` - AI avatar with animations
- `AnimatedLogo.tsx` - Loading animation

**Technologies:**
```
Frontend:
- Web Speech API (voice input)
- Speech Synthesis API (voice output)
- React hooks for state management
- Supabase for message history storage

Backend APIs:
- POST /api/chat - Groq LLM integration
- POST /api/search - SearchAPI for web results
- POST /api/tts - Text-to-speech

Design Elements:
- Cyan gradient avatar
- Message bubbles with timestamps
- Typing indicator animation
- Voice waveform visualization
```

**Why this stack?**
- Native browser APIs eliminate external dependencies
- Groq provides fast, free LLM inference
- SearchAPI gives real-time web information
- Message history persists across sessions

### B. GAME & QUIZ FEATURES

**Games Included:**
1. **Flashcard Game** - Flip animation, progress tracking
2. **Quiz Game** - MCQ with immediate feedback
3. **Memory Match Game** - Grid-based card flipping
4. **Speed Quiz** - Timed questions
5. **Fill Blanks Game** - Word completion
6. **Word Match Game** - Matching pairs

**Technology Stack:**
```
Generation:
- Groq LLM generates unique content
- JSON structure for consistency
- Difficulty levels (1-4)

Frontend:
- React hooks for game state
- Tailwind animations for flipping/transitions
- Local score tracking
- Session storage for offline mode

Backend:
- POST /api/quiz/generate - Creates MCQ questions
- POST /api/flashcards/generate - Creates flashcard sets
- POST /api/game/score - Saves game scores

Database:
- Supabase PostgreSQL tables:
  - quizzes (quiz metadata)
  - quiz_questions (individual questions)
  - flashcard_sets (flashcard collections)
  - game_scores (user scores)
```

**Why Groq for generation?**
- Lightning-fast (50+ tokens/sec)
- Free tier sufficient
- Consistent JSON output
- Cost-effective for AI-generated content

### C. STUDY ROUTINE FEATURES

**Components:**
- `AIRoutineGenerator.tsx` - AI-powered schedule creation
- `AdvancedRoutineBuilder.tsx` - Manual schedule builder
- `RoutineDashboard.tsx` - View & manage routines
- `RoutineCard.tsx` - Individual routine display

**Technology Stack:**
```
Generation:
- Groq LLM creates optimized schedules
- Cognitive science principles (harder subjects when fresh)
- Break insertion algorithm
- Time slot calculation

Frontend:
- React components with form validation
- Time picker for manual input
- Visual timeline display
- Drag-drop for reordering (optional)

Backend:
- POST /api/routine/generate-ai - AI schedule
- POST /api/routine/advanced - Manual builder
- CRUD /api/routine/[id] - Manage routines

Database:
- routines table (schedule metadata)
- routine_sessions table (individual sessions)
  - session_name, start_time, end_time
  - duration_minutes, session_order
  - is_break, notes

Notifications:
- Browser notifications (Web Notifications API)
- Phone alarms (Vibration API + Audio Context)
- Background checking (periodic 30-second checks)
```

**Why this architecture?**
- Groq creates cognitively optimized schedules
- Supabase stores persistent routines
- Web APIs provide cross-platform notifications
- Periodic checker catches missed alarms

### D. NOTIFICATION & ALARM SYSTEM

**Features:**
- Browser notifications (Chrome, Firefox, Edge)
- Phone vibrations
- Alarm sound generation
- Permission management

**Technology Stack:**
```
APIs Used:
- Web Notifications API (desktop alerts)
- Vibration API (phone feedback)
- Web Audio API (alarm sound generation)
- Service Worker (background notifications)

Components:
- NotificationPermissionManager.tsx
- ReminderModal.tsx

Libraries (lib/notifications.ts):
- playAlarmSound() - Audio Context oscillator
- sendBrowserNotification() - Notification display
- setDeviceAlarm() - Schedule alarms
- startAlarmChecker() - Periodic verification

Why this approach?
- Native APIs = no external dependencies
- Works across browsers and mobile
- Graceful degradation if unsupported
- Service Workers enable background mode
```

### E. AUTHENTICATION

**Technology:**
```
- Supabase Auth (built-in)
- PostgreSQL for user storage
- JWT tokens for sessions
- Encrypted password storage

Components:
- LoginForm.tsx
- SignUpForm.tsx
- ProtectedRoutes (middleware)

Why Supabase?
- Free tier includes unlimited users
- Row-Level Security (RLS) built-in
- Handles password hashing (bcrypt)
- Session management automatic
```

---

## 5. LAYOUT & RESPONSIVE DESIGN

### Layout Method: **CSS Flexbox (Primary)**

**Why Flexbox?**
- Simpler than Grid for most layouts
- Perfect alignment capabilities
- Mobile-responsive by default
- Easier to understand and maintain

### Responsive Breakpoints (Tailwind):
```
Mobile:    < 640px
Tablet:    640px - 1024px
Desktop:   > 1024px

Prefixes:
sm: → 640px
md: → 768px
lg: → 1024px
xl: → 1280px
2xl: → 1536px
```

### Example Layout Patterns:

**Hero Section (Chatbot):**
```jsx
<div className="flex flex-col items-center justify-center min-h-screen">
  <JarvisAvatar size="lg" />
  <Input className="w-full max-w-md" />
</div>
```
- Centered vertically & horizontally
- Responsive width capping

**Game Grid:**
```jsx
<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {games.map(game => <GameCard />)}
</div>
```
- 1 column on mobile
- 2 columns on tablet
- 3 columns on desktop

---

## 6. STATE MANAGEMENT

### Frontend State:
- React `useState` for component state
- `useCallback` for memoized functions
- `useEffect` for side effects
- `useRef` for DOM references

### Backend State:
- Supabase PostgreSQL for persistent storage
- Session storage for temporary data
- Browser localStorage (minimal use)

### Why minimal external state?
- React hooks sufficient for component scope
- Supabase handles complex queries
- Simpler debugging
- Fewer dependencies

---

## 7. PERFORMANCE OPTIMIZATIONS

### Code Splitting:
```
Dynamic imports for game components
Lazy loading for heavy features
Route-based code splitting (Next.js)
```

### Image Optimization:
```
- SVG icons (Lucide React)
- PNG for app icons
- WebP support where possible
- Responsive sizing
```

### Animation Performance:
```
- Canvas for complex animations (lightning cursor)
- CSS transforms (not layout properties)
- Will-change hints for heavy animations
- Hardware acceleration enabled
```

### Bundle Size:
```
Dependencies optimized:
- shadcn/ui: Only import used components
- Lucide React: ~100KB for all icons
- Groq SDK: Lightweight (~50KB)
- Tailwind: Purged unused CSS
```

---

## 8. SECURITY IMPLEMENTATION

### Authentication:
```
- Supabase JWT tokens
- HTTP-only cookies (session management)
- Secure session storage
```

### Data Encryption:
```
- lib/encryption.ts handles message encryption
- AES-256 encryption for sensitive content
- Encrypted storage in database
```

### API Security:
```
- Row-Level Security (RLS) on Supabase
- Environment variables for API keys
- Server-side validation
- SQL injection prevention (parameterized queries)
```

---

## 9. COMPLETE TECH STACK SUMMARY

```
Frontend:
├─ React 19.2.0 (UI framework)
├─ Next.js 16.0.10 (Full-stack framework)
├─ TypeScript (Type safety)
├─ Tailwind CSS 4.1.9 (Styling)
├─ shadcn/ui (Component library)
├─ Radix UI (Accessibility primitives)
└─ Lucide React (Icons)

State & Data:
├─ Supabase (Database & Auth)
├─ React Hooks (Local state)
└─ SessionStorage (Temporary data)

AI & Intelligence:
├─ Groq API (LLM for chat/generation)
├─ Web Speech API (Voice I/O)
├─ Speech Synthesis API (TTS)
└─ SearchAPI (Web search)

Storage:
├─ Supabase PostgreSQL
├─ Browser Storage (temporary)
└─ Vercel Blob (File uploads)

Animations:
├─ Tailwind CSS Animations
├─ CSS Keyframes (custom)
├─ Canvas (complex animations)
└─ CSS Transforms (performance)

Notifications:
├─ Web Notifications API
├─ Vibration API
├─ Web Audio API
└─ Service Workers

Build & Deployment:
├─ Vercel (Hosting & CDN)
├─ Next.js Build System
└─ GitHub (Version control)

Monitoring:
└─ Vercel Analytics

Development:
├─ ESLint (Code quality)
├─ TypeScript (Type checking)
└─ Tailwind CSS (Build-time optimization)
```

---

## 10. WHY EACH TECHNOLOGY WAS CHOSEN

| Technology | Why Chosen |
|-----------|-----------|
| **React** | Component-based UI, large ecosystem, performance |
| **Next.js 16** | SSR, API routes, built-in optimization, Vercel integration |
| **Groq** | Fast inference (50+ tok/s), free tier, OpenAI-compatible |
| **Supabase** | Open-source PostgreSQL, easy auth, RLS security, free tier |
| **Tailwind CSS** | Utility-first, responsive, small bundle, rapid development |
| **shadcn/ui** | Accessible, customizable, copy-paste components |
| **Web APIs** | Native browser support, no external dependencies |
| **Canvas** | Smooth 60fps animations without layout recalculations |
| **Vercel** | Next.js native hosting, global CDN, instant deploys |

---

## 11. COMPONENT HIERARCHY

```
App
├─ RootLayout
│  ├─ ThemeProvider (Light/Dark)
│  ├─ Analytics
│  └─ Children
│
├─ HomePage
│  ├─ Hero Section
│  ├─ Features Grid
│  └─ CTA Buttons
│
├─ ChatPage
│  ├─ ChatInterface
│  │  ├─ JarvisAvatar (animated)
│  │  ├─ MessageBubble (styled)
│  │  ├─ Input Field
│  │  └─ Voice Controls
│  ├─ Sidebar Navigation
│  └─ ThemeToggle
│
├─ RoutinePage
│  ├─ RoutineDashboard
│  │  ├─ AIRoutineGenerator
│  │  ├─ AdvancedRoutineBuilder
│  │  └─ RoutineCard[]
│  ├─ NotificationManager
│  └─ ReminderModal
│
└─ GamesPage
   ├─ GamesHub
   ├─ FlashcardGame
   ├─ QuizGame
   ├─ MemoryMatchGame
   ├─ SpeedQuiz
   ├─ FillBlanksGame
   └─ WordMatchGame
```

---

## 12. DATA FLOW EXAMPLE: Quiz Generation

```
User Input (Topic, Difficulty)
    ↓
ChatInterface captures input
    ↓
Frontend sends POST to /api/quiz/generate
    ↓
API receives request + user ID
    ↓
Groq LLM generates MCQ JSON
    ↓
Validation & formatting
    ↓
Save to Supabase (quizzes table)
    ↓
Return quiz data to frontend
    ↓
QuizGame component renders questions
    ↓
User answers
    ↓
Score calculation & save to game_scores table
    ↓
Display results with animations
```

---

## CONCLUSION

Sedvator combines:
- **Modern Frontend**: React + Next.js + Tailwind
- **Fast AI**: Groq LLM for instant content
- **Secure Backend**: Supabase with RLS
- **Beautiful Design**: OKLCH colors + smooth animations
- **Native APIs**: No external dependencies for notifications/voice
- **Scalable**: Serverless on Vercel

This architecture ensures **performance**, **accessibility**, **security**, and **user experience** at scale.
