# Slidr - Interactive Presentation Platform

## Overview

Slidr is a web-based interactive presentation platform designed for real-time audience engagement. It allows presenters to create interactive presentations with live polls, quizzes, word clouds, and Q&A sessions. Audiences can join presentations via a simple room code without requiring downloads or authentication, fostering dynamic interaction. The platform aims to provide a robust, full-stack solution for engaging presentations with a focus on real-time capabilities and ease of use.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The frontend uses React 18 with TypeScript, built with Vite. It incorporates Shadcn/ui components (based on Radix UI) and Tailwind CSS for styling, following a "New York" design variant with a custom color palette, typography (Inter and Space Grotesk), and dark mode support. State management primarily uses TanStack Query for server state and React hooks for local UI state.

**Mobile Responsiveness:** All page headers are fully responsive and optimized for mobile viewports:
- **Landing Page:** Desktop shows all navigation buttons; mobile uses a hamburger menu with a Sheet component containing all navigation options (Library, Pricing, Join Presentation, Sign In, Get Started)
- **Dashboard & Library:** Logos and buttons adapt to screen size, showing icon-only versions on mobile (<sm breakpoint) and including text labels on larger screens
- **Presenter View:** Fully mobile-optimized with responsive layout ensuring slides are always visible. Mobile header is compact (hides presentation title on <sm, shows participant count, compact slide navigation with icon-only buttons), with responsive slide counter ("1/5" on mobile, "Slide 1 / 5" on desktop). Layout uses vertical stacking on mobile with slides taking priority (flex-1) and sidebar limited to 40vh with independent scrolling. Slide area has reduced padding on mobile (p-4 vs p-12 desktop) to maximize content space. Slide content scales responsively (text-2xl on mobile vs text-5xl desktop for headings, max-h-40vh vs max-h-70vh for images). Room code display is compact on mobile with smaller text (text-2xl vs text-5xl) and QR code (120px vs 160px). All presenter features (timer, notes, preview, reactions, responses) remain accessible via scrolling on small screens. No overlap between slides and sidebar content.
- Headers use consistent Tailwind responsive utilities (sm, lg breakpoints) to prevent overflow and ensure accessibility on all devices

### Technical Implementations

The application is a full-stack TypeScript project. The frontend is a React application, while the backend uses Express.js. Real-time communication is handled by Socket.IO, replacing earlier raw WebSocket implementations for improved proxy compatibility and automatic reconnection. Data persistence is managed with a PostgreSQL database and Drizzle ORM.

Key features include:
- **Dual Access Model:** Authenticated users (presenters) manage presentations, while anonymous participants (audience) interact via session codes.
- **Real-time Interaction:** Socket.IO facilitates live updates for slide changes, response submissions, and participant tracking using a room-based broadcasting pattern.
- **File Import:** Supports conversion of PPTX (via ConvertAPI) and PDF (via `pdf-to-png-converter`) files into image slides.
- **Image Upload:** Allows authenticated users to upload individual images as slides, with robust security checks (MIME type and magic byte validation).
- **Slide Element System:** Enables embedding and positioning images within slides (not as separate slides). Images can be dragged and resized with optimistic local state updates and debounced (500ms) persistence to prevent request flooding. Elements use percentage-based positioning for responsive scaling.
- **Note-Taking:** Authenticated users can take and save notes on slides during presentations, accessible from a dedicated notes page.
- **Presenter View Enhancements:** The presenter mode includes three speaker-only features: (1) Presentation Timer - a stopwatch with start/pause/reset controls displaying time in MM:SS or H:MM:SS format; (2) Private Notes - slide-specific notes that can be edited and saved during presentations, persisting in the database and accessible only to the presenter; (3) Upcoming Slide Preview - a preview of the next slide that updates as the presenter navigates, showing "No more slides" on the final slide. These features are integrated into the presenter sidebar alongside existing reaction tracking and response monitoring.
- **Audience Q&A:** Anonymous audience members can submit questions and upvote others' questions during presentations. Questions are displayed to the presenter sorted by upvote count (highest first). Each participant can upvote a question once (toggling removes the upvote). Real-time updates via Socket.IO ensure questions and upvotes appear immediately for all participants. The audience UI provides visual feedback showing which questions the current participant has upvoted (filled thumbs-up icon).
- **Slide Analytics:** Authenticated users can view comprehensive engagement metrics for their presentations via an Analytics page accessible from the presentation card dropdown menu. Analytics aggregate data across all sessions and display: total sessions presented, unique participant count (from all interaction types: responses, reactions, feedback, questions), total reactions (likes/hearts), questions asked, and slide-by-slide breakdowns showing reactions, poll responses, and feedback counts per slide. The analytics endpoint properly deduplicates participants across all interaction types to ensure accurate unique participant counts.
- **Publish to Library:** Authenticated users can publish their presentations to a public library where all users (including anonymous visitors) can browse and view published presentations. The library page includes search functionality to filter presentations by title. Users can only publish/unpublish their own presentations (authorization enforced on the backend).
- **Ownership Differentiation:** The library distinguishes between user-owned and other presentations. Owned presentations display a "Yours" badge and a "Present" button (launches presenter mode), while others' presentations show a "View" button (opens read-only viewer). Unauthenticated visitors see all presentations with "View" buttons only. The read-only viewer (`/view/:id`) allows browsing slides with keyboard navigation (arrow keys, ESC) without editing capabilities.
- **Slidr Watermark:** A custom watermark component is present on all slides for branding, indicating the platform's free tier offering.
- **Notification System:** A lightweight custom notification system replaces traditional toast notifications. Notifications appear at the top-right corner with color-coded backgrounds (green for success, red for errors, blue for info), include dismiss buttons, and auto-hide after 3 seconds. Implemented via `NotificationProvider` context and `useNotification` hook for consistent user feedback across all operations.

### System Design Choices

The backend features RESTful HTTP endpoints for CRUD operations and a Socket.IO server for real-time events. A session-based architecture supports anonymous audience participation. The data layer uses PostgreSQL with Drizzle ORM, employing UUIDs for primary keys and Zod schemas for validation. Authentication for presenters uses Passport.js with a local strategy and bcrypt for password hashing.

## External Dependencies

### Third-party Services

- **ConvertAPI:** Used for cloud-based PPTX to PNG conversion (requires `CONVERTAPI_SECRET`).
- **Google Fonts:** Inter and Space Grotesk are used for typography.

### Database

- **PostgreSQL:** Primary database accessed via Neon Serverless driver.
- **Drizzle ORM:** Used for database schema definition, migrations, and query building.

### UI Component Libraries

- **Radix UI Primitives:** Provides accessible, unstyled UI components.
- **Shadcn/ui:** Component library built on Radix UI and styled with Tailwind CSS.
- **Tailwind CSS:** Utility-first CSS framework for styling.
- **Supporting Libraries:** `class-variance-authority`, `cmdk`, `embla-carousel-react`, `react-day-picker`, `recharts`, `vaul`.

### Development Tools

- **Vite:** Frontend build tool and development server.
- **TypeScript:** For type-safe development across the stack.
- **ESBuild:** For server-side bundling in production.
- **TSX:** For running TypeScript directly in development.
- **Replit-specific Plugins:** `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`.

### Asset Management

- Static images are stored in `/attached_assets/generated_images/` and served via Vite.