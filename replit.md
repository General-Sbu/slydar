# Slidr - Interactive Presentation Platform

## Overview

Slidr is a web-based interactive presentation platform that enables real-time audience engagement through live polls, quizzes, word clouds, and Q&A sessions. The application allows presenters to create presentations with various interactive slide types and share them with audiences via simple room codes, requiring no downloads or participant authentication.

The platform is built as a full-stack TypeScript application with a React frontend and Express backend, using Socket.IO for real-time bidirectional communication between presenters and audience members.

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
- Socket.IO server for real-time communication (replaced raw WebSockets for better proxy compatibility)
- Session-based architecture without authentication (anonymous participation)
- Development mode integrates Vite middleware for HMR

**API Design:**
- RESTful HTTP endpoints for CRUD operations on presentations, slides, and sessions
- Socket.IO events for real-time communication (slide changes, response submissions, participant tracking)
- Separation of presenter and audience Socket.IO roles
- Room-based broadcasting pattern for session-wide updates

**Socket.IO Event Types:**
- `session_joined` - Initial connection with session data
- `slide_changed` - Presenter navigates to new slide
- `new_response` - Audience member submits answer
- `participant_count` - Live participant tracking
- `session_update` - Session state changes
- `session_ended` - Presenter closes session

**Data Layer:**
- PostgreSQL database with Drizzle ORM for persistent storage
- Interface-based storage abstraction (`IStorage`) allows database swapping
- UUID-based primary keys for all entities
- Authenticated user system with Passport.js local strategy

### Data Storage

**Database Schema (PostgreSQL via Drizzle ORM):**

**Presentations Table:**
- Stores presentation metadata (title, timestamps)
- UUID primary key
- Auto-managed created/updated timestamps

**Slides Table:**
- Polymorphic slide types (multiple_choice, word_cloud, open_ended, heading, image)
- Foreign key to presentation with cascade delete
- Order field for slide sequencing
- JSONB config field for type-specific settings
- Text array for multiple choice options
- For image slides: question field stores the image path

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

**Users Table:**
- Stores authenticated user accounts
- Fields: id (UUID), username (unique), email (unique), password (hashed with bcrypt)
- Auto-managed created/updated timestamps

**Notes Table:**
- Stores slide notes for authenticated users
- Links to users, slides, and presentations with cascade delete
- Each user can have one note per slide (upsert on save)
- Auto-managed created/updated timestamps

**Schema Validation:**
- Zod schemas generated from Drizzle tables using `drizzle-zod`
- Type-safe insert/update operations
- Runtime validation of API payloads

### Authentication & Authorization

**Dual Access Model:**

**Authenticated Users (Presenters):**
- Username/password authentication using Passport.js local strategy
- Password hashing with bcrypt (10 rounds)
- Session-based authentication with express-session
- Required for creating and managing presentations
- Can take notes on slides during presentations (logged-in audience members)
- Access to personal notes page showing all saved notes

**Anonymous Participants (Audience):**
- No authentication required for audience participation
- Session codes serve as the only access control
- Participant IDs generated client-side (UUID)
- Can view and interact with presentations
- Cannot save notes (requires login)

**Note-Taking Feature:**
- Authenticated users can take notes on any slide during audience participation
- Notes are saved with slide references and auto-saved on change
- Notes page displays all notes organized by presentation
- Each user can have one note per slide (updates existing note on save)

### Real-time Communication

**Socket.IO Architecture:**
- Socket.IO server instance handling all connections with automatic fallback transports
- Client metadata stored on socket.data for each connection
- Room-based broadcasting using session IDs (Socket.IO rooms)
- Automatic reconnection logic with exponential backoff
- Connection state tracking per client
- Polling + WebSocket transports for better proxy compatibility

**Message Flow:**
1. Presenter creates session → HTTP POST returns session code
2. Presenter connects via Socket.IO → joins session room as presenter role
3. Audience navigates to /audience/:code → HTTP validates session
4. Audience connects via Socket.IO → receives full session state
5. Presenter changes slide → broadcasts to all session room members
6. Audience submits response → stored in DB, broadcast to presenter
7. Presenter ends session → broadcasts closure, cleans up connections

**Error Handling:**
- Socket.IO automatic reconnection with configurable attempts and delays
- Toast notifications for connection state changes
- Graceful fallback to long-polling when WebSocket unavailable
- Session validation before joining

**Migration Notes:**
- Replaced raw WebSockets (ws library) with Socket.IO in October 2025
- Reason: Better compatibility with reverse proxies (Replit infrastructure)
- Socket.IO provides automatic transport fallback and reconnection handling
- Client hook uses ref pattern to prevent reconnection loops

### File Import Feature

**PPTX/PDF Import (Updated October 2025):**
- Converts PowerPoint (.pptx) and PDF files into presentation slides as images
- Backend endpoint: `POST /api/presentations/:id/import`
- **PDF files:** Converted to images using `pdf-to-png-converter` library
- **PowerPoint files:** Converted to PDF using LibreOffice, then to images (PPTX format only)
- Uses `multer` middleware for file upload handling (memory storage, 50MB limit)

**File to Image Conversion:**
- PDF pages are converted to PNG images at 2x scale for quality
- PPTX slides are first converted to PDF using `libreoffice-convert`, then to PNG
- Images saved to `/public/uploads/presentation-{id}-{timestamp}/` directory
- Each image becomes an "image" type slide with path stored in question field
- Images served statically from the public directory

**PowerPoint Conversion Process:**
- PPTX → PDF conversion using LibreOffice (via libreoffice-convert npm package)
- PDF → PNG conversion using pdf-to-png-converter
- Preserves slide layout and formatting as images
- Temp file processing with automatic cleanup

**Implementation Details:**
- File upload via `multipart/form-data` with MIME type validation
- Temp file written to `/tmp` during processing (timestamp-prefixed)
- PDF processing uses `pdf-to-png-converter` with configurable viewport scale
- Automatic cleanup of temp files via `finally` block
- Slides appended to existing presentation with proper ordering
- Image files organized by presentation ID and timestamp

**Error Handling:**
- 400 error for missing file or invalid MIME type
- 500 error for parsing/conversion failures
- Guaranteed temp file deletion even on errors
- Frontend shows toast notifications for success/failure

**Security Measures:**
- File type restriction (.pptx, .pdf only)
- 50MB file size limit
- Server-side MIME validation
- Isolated temp file processing
- Images stored in organized directory structure

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