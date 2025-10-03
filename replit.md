# Slidr - Interactive Presentation Platform

## Overview

Slidr is a web-based interactive presentation platform that enables real-time audience engagement through live polls, quizzes, word clouds, and Q&A sessions. The application allows presenters to create presentations with various interactive slide types and share them with audiences via simple room codes, requiring no downloads or participant authentication.

The platform is built as a full-stack TypeScript application with a React frontend and Express backend, using WebSockets for real-time bidirectional communication between presenters and audience members.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for the UI layer
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query (React Query) for server state management and caching

**Component Library:**
- Shadcn/ui components built on Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Component composition pattern following the "New York" Shadcn style variant
- Dark mode support with CSS variables and class-based theme switching

**Design System:**
- Custom color palette with HSL-based CSS variables for theming
- Typography using Inter (UI/body) and Space Grotesk (headings) from Google Fonts
- Consistent spacing and elevation system using custom Tailwind utilities
- Hover and active state elevations implemented via custom CSS classes

**State Management:**
- React Query for server state with infinite stale time (manual invalidation)
- Local component state with React hooks for UI interactions
- Custom WebSocket hook (`useWebSocket`) for real-time communication
- Toast notifications using Radix UI Toast primitives

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript for HTTP API endpoints
- WebSocket Server (ws library) for real-time communication
- Session-based architecture without authentication (anonymous participation)
- Development mode integrates Vite middleware for HMR

**API Design:**
- RESTful HTTP endpoints for CRUD operations on presentations, slides, and sessions
- WebSocket protocol for real-time events (slide changes, response submissions, participant tracking)
- Separation of presenter and audience WebSocket roles
- Broadcasting pattern for session-wide updates

**WebSocket Message Types:**
- `session_joined` - Initial connection with session data
- `slide_changed` - Presenter navigates to new slide
- `new_response` - Audience member submits answer
- `participant_count` - Live participant tracking
- `session_update` - Session state changes
- `session_ended` - Presenter closes session

**Data Layer:**
- In-memory storage implementation (`MemStorage`) for development
- Interface-based storage abstraction (`IStorage`) allows database swapping
- Drizzle ORM configured for PostgreSQL (production-ready)
- UUID-based primary keys for all entities

### Data Storage

**Database Schema (PostgreSQL via Drizzle ORM):**

**Presentations Table:**
- Stores presentation metadata (title, timestamps)
- UUID primary key
- Auto-managed created/updated timestamps

**Slides Table:**
- Polymorphic slide types (multiple_choice, word_cloud, open_ended, heading)
- Foreign key to presentation with cascade delete
- Order field for slide sequencing
- JSONB config field for type-specific settings
- Text array for multiple choice options

**Sessions Table:**
- Live presentation instances with unique 6-character codes
- Tracks current slide index and active state
- Foreign key to presentation with cascade delete
- Started timestamp for analytics

**Responses Table:**
- Stores participant answers during sessions
- Links to both session and slide with cascade delete
- Participant ID (generated on join, no authentication)
- Submission timestamp for ordering

**Schema Validation:**
- Zod schemas generated from Drizzle tables using `drizzle-zod`
- Type-safe insert/update operations
- Runtime validation of API payloads

### Authentication & Authorization

**Current Approach: Intentionally Anonymous**
- No user authentication system implemented
- Session codes serve as the only access control
- Participant IDs generated client-side (UUID)
- Presenter role determined by WebSocket connection type

**Rationale:**
- Reduces friction for audience participation
- Aligns with "no downloads required" value proposition
- Suitable for one-off presentations and events
- Can be extended later with optional authentication

### Real-time Communication

**WebSocket Architecture:**
- Single WebSocket server instance handling all connections
- Client metadata stored in Map<WebSocket, WSClient>
- Room-based broadcasting using session IDs
- Automatic reconnection logic with exponential backoff
- Connection state tracking per client

**Message Flow:**
1. Presenter creates session → HTTP POST returns session code
2. Presenter connects via WebSocket → joins as presenter role
3. Audience navigates to /audience/:code → HTTP validates session
4. Audience connects via WebSocket → receives full session state
5. Presenter changes slide → broadcasts to all audience members
6. Audience submits response → stored in DB, broadcast to presenter
7. Presenter ends session → broadcasts closure, cleans up connections

**Error Handling:**
- WebSocket reconnection with timeout management
- Toast notifications for connection state changes
- Graceful degradation when WebSocket unavailable
- Session validation before joining

## External Dependencies

### Third-party Services

**None currently integrated.** The application is fully self-contained with no external API dependencies.

**Future Integration Points:**
- Email service for presentation sharing (SendGrid, Postmark)
- Analytics platform (Mixpanel, Amplitude)
- Cloud storage for media uploads (S3, Cloudinary)
- Authentication provider if adding user accounts (Auth0, Clerk)

### Database

**Primary Database: PostgreSQL**
- Accessed via Neon Serverless driver (`@neondatabase/serverless`)
- Connection pooling handled by Neon driver
- Connection string from `DATABASE_URL` environment variable
- Drizzle ORM for migrations and query building

**Migration Strategy:**
- Drizzle Kit for schema migrations (`npm run db:push`)
- Migrations output to `/migrations` directory
- Schema defined in `/shared/schema.ts`

### UI Component Libraries

**Radix UI Primitives:**
- Complete set of unstyled, accessible components
- Dialog, Dropdown, Popover, Toast, and 20+ other primitives
- ARIA-compliant implementations
- Keyboard navigation support

**Supporting Libraries:**
- `class-variance-authority` - Component variant management
- `cmdk` - Command menu component
- `embla-carousel-react` - Carousel/slider functionality
- `react-day-picker` - Date picker implementation
- `recharts` - Chart visualizations for poll results
- `vaul` - Drawer component for mobile

### Development Tools

**Replit-specific Plugins:**
- `@replit/vite-plugin-runtime-error-modal` - Error overlay
- `@replit/vite-plugin-cartographer` - Code navigation
- `@replit/vite-plugin-dev-banner` - Development indicator

**Build & Type Checking:**
- TypeScript compiler with strict mode enabled
- ESBuild for server-side bundling in production
- TSX for running TypeScript directly in development
- Path aliases for cleaner imports (`@/`, `@shared/`, `@assets/`)

### Fonts

**Google Fonts:**
- Inter - UI components, body text, data display
- Space Grotesk - Display headings, presentation titles
- Additional fonts loaded for potential use: Architects Daughter, DM Sans, Fira Code, Geist Mono

### Asset Management

Static images stored in `/attached_assets/generated_images/`:
- Hero mockup image
- Empty state illustration
- Served via Vite's static asset handling
- Imported directly in components with type safety