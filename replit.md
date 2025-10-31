# Slidr - Interactive Presentation Platform

## Overview

Slidr is a web-based interactive presentation platform designed for real-time audience engagement. It enables presenters to create interactive presentations featuring live polls, quizzes, word clouds, and Q&A sessions. Audiences can easily join presentations using a simple room code, promoting dynamic interaction without requiring downloads or authentication. The platform aims to be a robust, full-stack solution for engaging presentations with a strong focus on real-time capabilities and user-friendliness.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The frontend is built with React 18 and TypeScript, using Vite. It leverages Shadcn/ui components (based on Radix UI) and Tailwind CSS for styling, adhering to a "New York" design with a custom color palette, Inter and Space Grotesk typography, and dark mode support. State management uses TanStack Query for server state and React hooks for local UI state. The interface is fully mobile-responsive across all key views including the landing page, dashboard, library, and presenter view, ensuring adaptive layouts, compact navigation, and scalable content for various screen sizes.

### Technical Implementations

Slidr is a full-stack TypeScript application with a React frontend and an Express.js backend. Real-time communication is facilitated by Socket.IO. Data is persisted using PostgreSQL and Drizzle ORM. Key features include:

-   **Dual Access Model:** Separate experiences for authenticated presenters and anonymous audience participants.
-   **Real-time Interaction:** Socket.IO enables live updates for slides, responses, and participant tracking.
-   **File Import & Image Upload:** Supports conversion of PPTX and PDF files to image slides, and secure direct image uploads.
-   **Slide Element System:** Allows embedding, repositioning, resizing, and editing of image and text elements on slides, with optimistic updates and debounced persistence. Text elements support rich customization (font size, weight, alignment, rotation, color) and touch interactions.
-   **Note-Taking:** Presenters can create and save slide-specific notes.
-   **Presenter View Enhancements:** Includes a presentation timer, private notes, and an upcoming slide preview.
-   **Screen Casting:** Utilizes the Web Presentation API for casting presentations to external displays.
-   **Audience Q&A:** Anonymous audience members can submit and upvote questions in real-time.
-   **Slide Analytics:** Provides presenters with engagement metrics, including unique participants, reactions, and poll responses.
-   **Slide Editor Toolbar:** Offers tools to add text/image elements, change slide background colors, duplicate, and delete slides.
-   **Publish to Library:** Presenters can publish presentations to a public library with search functionality.
-   **Ownership Differentiation:** Differentiates between user-owned and public presentations in the library, offering distinct actions (Present vs. View).
-   **Slidr Watermark:** A branding watermark is displayed on all slides.
-   **Notification System:** A custom, context-based notification system provides user feedback.
-   **Floating Emoji Reactions:** Real-time emoji reactions animate across participants' screens.

### System Design Choices

The backend uses RESTful HTTP endpoints for CRUD operations and a Socket.IO server for real-time events. It employs a session-based architecture for anonymous participation. PostgreSQL with Drizzle ORM handles data, using UUIDs for primary keys and Zod for validation. Presenter authentication uses Passport.js with a local strategy and bcrypt. The system offers pre-built presentation templates with curated color schemes. New slides are pre-populated with editable, movable, resizable, and rotatable text elements, providing flexible content management.

## External Dependencies

### Third-party Services

-   **ConvertAPI:** For PPTX to PNG conversion.
-   **Google Fonts:** For typography (Inter and Space Grotesk).

### Database

-   **PostgreSQL:** Primary database.
-   **Drizzle ORM:** For database interaction and schema definition.

### UI Component Libraries

-   **Radix UI Primitives:** Accessible, unstyled UI components.
-   **Shadcn/ui:** Component library built on Radix UI and Tailwind CSS.
-   **Tailwind CSS:** Utility-first CSS framework.

### Development Tools

-   **Vite:** Frontend build tool.
-   **TypeScript:** For type-safe development.