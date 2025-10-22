# Slidr - Interactive Presentation Platform

## Overview

Slidr is a web-based interactive presentation platform designed for real-time audience engagement. It allows presenters to create interactive presentations with live polls, quizzes, word clouds, and Q&A sessions. Audiences can join presentations via a simple room code without requiring downloads or authentication, fostering dynamic interaction. The platform aims to provide a robust, full-stack solution for engaging presentations with a focus on real-time capabilities and ease of use.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The frontend uses React 18 with TypeScript, built with Vite. It incorporates Shadcn/ui components (based on Radix UI) and Tailwind CSS for styling, following a "New York" design variant with a custom color palette, typography (Inter and Space Grotesk), and dark mode support. State management primarily uses TanStack Query for server state and React hooks for local UI state.

### Technical Implementations

The application is a full-stack TypeScript project. The frontend is a React application, while the backend uses Express.js. Real-time communication is handled by Socket.IO, replacing earlier raw WebSocket implementations for improved proxy compatibility and automatic reconnection. Data persistence is managed with a PostgreSQL database and Drizzle ORM.

Key features include:
- **Dual Access Model:** Authenticated users (presenters) manage presentations, while anonymous participants (audience) interact via session codes.
- **Real-time Interaction:** Socket.IO facilitates live updates for slide changes, response submissions, and participant tracking using a room-based broadcasting pattern.
- **File Import:** Supports conversion of PPTX (via ConvertAPI) and PDF (via `pdf-to-png-converter`) files into image slides.
- **Image Upload:** Allows authenticated users to upload individual images as slides, with robust security checks (MIME type and magic byte validation).
- **Slide Element System:** Enables embedding and positioning images within slides (not as separate slides). Images can be dragged and resized with optimistic local state updates and debounced (500ms) persistence to prevent request flooding. Elements use percentage-based positioning for responsive scaling.
- **Note-Taking:** Authenticated users can take and save notes on slides during presentations, accessible from a dedicated notes page.
- **Slidr Watermark:** A custom watermark component is present on all slides for branding, indicating the platform's free tier offering.

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