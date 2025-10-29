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
- **Presenter View:** Fully mobile-optimized with responsive layout ensuring slides are always visible. Mobile header is compact (hides presentation title on <sm, shows participant count, compact slide navigation with icon-only buttons), with responsive slide counter ("1/5" on mobile, "Slide 1 / 5" on desktop). The cast button is positioned at the end of navigation controls with responsive sizing (h-9 w-9 on mobile, expanding with "Cast" label on larger screens) matching other header buttons for consistency. Layout uses vertical stacking on mobile with slides taking priority (flex-1) and sidebar limited to 40vh with independent scrolling. Slide area has reduced padding on mobile (p-4 vs p-12 desktop) to maximize content space. Slide content scales responsively (text-2xl on mobile vs text-5xl desktop for headings, max-h-40vh vs max-h-70vh for images). Room code display is compact on mobile with smaller text (text-2xl vs text-5xl) and QR code (120px vs 160px). All presenter features (timer, notes, preview, reactions, responses, casting) remain accessible via scrolling on small screens. No overlap between slides and sidebar content.
- Headers use consistent Tailwind responsive utilities (sm, lg breakpoints) to prevent overflow and ensure accessibility on all devices

### Technical Implementations

The application is a full-stack TypeScript project. The frontend is a React application, while the backend uses Express.js. Real-time communication is handled by Socket.IO, replacing earlier raw WebSocket implementations for improved proxy compatibility and automatic reconnection. Data persistence is managed with a PostgreSQL database and Drizzle ORM.

Key features include:
- **Dual Access Model:** Authenticated users (presenters) manage presentations, while anonymous participants (audience) interact via session codes.
- **Real-time Interaction:** Socket.IO facilitates live updates for slide changes, response submissions, and participant tracking using a room-based broadcasting pattern.
- **File Import:** Supports conversion of PPTX (via ConvertAPI) and PDF (via `pdf-to-png-converter`) files into image slides.
- **Image Upload:** Allows authenticated users to upload individual images as slides, with robust security checks (MIME type and magic byte validation).
- **Slide Element System:** Enables embedding and positioning both images and text elements within slides. Elements support drag-and-drop repositioning, resizing, and editing with optimistic local state updates and debounced (500ms) persistence to prevent request flooding. Elements use percentage-based positioning for responsive scaling across devices.
  - **Image Elements:** Can be uploaded and embedded on slides (not as separate slides). Images are draggable and resizable with corner handles controlling width and height. Full MIME type and magic byte validation ensures security.
  - **Text Elements:** Fully moveable, resizable, and rotatable text that can be positioned anywhere on slides. Text elements support double-click inline editing with immediate visual feedback. Users can customize font size (via resize handles), font weight (normal/bold), text alignment (left/center/right), rotation (0-360 degrees via rotation handle), and color (inherits from template or custom). Resizing adjusts fontSize proportionally to width changes for intuitive scaling. Text inherits template colors when available, ensuring visual consistency. Full touch support enables mobile editing with touchstart/touchmove/touchend events for drag, resize, and rotate operations. Corner-aware resize logic properly handles all four corners (NW, NE, SW, SE) with position and width adjustments, preventing negative widths and NaN fontSize values through proper validation guards. Rotation is applied via CSS transform with center origin, and the rotation handle appears at the top center of selected text elements, enabling intuitive drag-to-rotate interaction. All three transformations (position, size, rotation) work independently and persist correctly.
- **Note-Taking:** Authenticated users can take and save notes on slides during presentations, accessible from a dedicated notes page.
- **Presenter View Enhancements:** The presenter mode includes three speaker-only features: (1) Presentation Timer - a stopwatch with start/pause/reset controls displaying time in MM:SS or H:MM:SS format; (2) Private Notes - slide-specific notes that can be edited and saved during presentations, persisting in the database and accessible only to the presenter; (3) Upcoming Slide Preview - a preview of the next slide that updates as the presenter navigates, showing "No more slides" on the final slide. These features are integrated into the presenter sidebar alongside existing reaction tracking and response monitoring.
- **Screen Casting:** Presenters can cast their presentation to TV screens and compatible devices using the native Web Presentation API. The cast button in the presenter header allows searching for available devices (Chromecast, Smart TVs, AirPlay-compatible displays) and initiating casting sessions. The feature includes device discovery, connection management, visual feedback for active casting sessions, and automatic termination when the presenter exits or cancels the presentation to prevent orphaned cast connections. Implemented using React forwardRef and useImperativeHandle for clean teardown.
- **Audience Q&A:** Anonymous audience members can submit questions and upvote others' questions during presentations. Questions are displayed to the presenter sorted by upvote count (highest first). Each participant can upvote a question once (toggling removes the upvote). Real-time updates via Socket.IO ensure questions and upvotes appear immediately for all participants. The audience UI provides visual feedback showing which questions the current participant has upvoted (filled thumbs-up icon).
- **Slide Analytics:** Authenticated users can view comprehensive engagement metrics for their presentations via an Analytics page accessible from the presentation card dropdown menu. Analytics aggregate data across all sessions and display: total sessions presented, unique participant count (from all interaction types: responses, reactions, feedback, questions), total reactions (likes/hearts), questions asked, and slide-by-slide breakdowns showing reactions, poll responses, and feedback counts per slide. The analytics endpoint properly deduplicates participants across all interaction types to ensure accurate unique participant counts.
- **Publish to Library:** Authenticated users can publish their presentations to a public library where all users (including anonymous visitors) can browse and view published presentations. The library page includes search functionality to filter presentations by title. Users can only publish/unpublish their own presentations (authorization enforced on the backend).
- **Ownership Differentiation:** The library distinguishes between user-owned and other presentations. Owned presentations display a "Yours" badge and a "Present" button (launches presenter mode), while others' presentations show a "View" button (opens read-only viewer). Unauthenticated visitors see all presentations with "View" buttons only. The read-only viewer (`/view/:id`) allows browsing slides with keyboard navigation (arrow keys, ESC) without editing capabilities.
- **Slidr Watermark:** A custom watermark component is present on all slides for branding, indicating the platform's free tier offering.
- **Notification System:** A lightweight custom notification system replaces traditional toast notifications. Notifications appear at the top-right corner with color-coded backgrounds (green for success, red for errors, blue for info), include dismiss buttons, and auto-hide after 3 seconds. Implemented via `NotificationProvider` context and `useNotification` hook for consistent user feedback across all operations.
- **Floating Emoji Reactions:** Real-time emoji reactions (👏🔥❤️😂👍🎉) float across all participants' screens during presentations. Audience members select emojis from an interactive selector, which triggers Socket.IO broadcasts to all session participants including the presenter. Emojis animate from bottom to top over 3 seconds using framer-motion, with random horizontal positioning for natural spread. The feature is non-disruptive with pointer-events-none and high z-index layering.

### System Design Choices

The backend features RESTful HTTP endpoints for CRUD operations and a Socket.IO server for real-time events. A session-based architecture supports anonymous audience participation. The data layer uses PostgreSQL with Drizzle ORM, employing UUIDs for primary keys and Zod schemas for validation. Authentication for presenters uses Passport.js with a local strategy and bcrypt for password hashing.

**Presentation Templates:** The system provides pre-built templates with curated color schemes to help users start their presentations with professional styling. When creating a new presentation, users select from 8 default templates (Professional Blue, Modern Dark, Warm Sunset, Fresh Green, Elegant Purple, Bold Red, Ocean Blue, Minimal Gray) via a visual template selector dialog. Each template defines a color palette including primary, secondary, accent, background, text, and muted text colors. The selected templateId is stored with the presentation for future reference. When a template is selected, the system automatically creates an initial heading slide with the template's background and text colors applied, providing users with an immediate visual preview of their chosen theme. Templates are seeded automatically on server startup and displayed in a responsive grid with color swatches and preview text.

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