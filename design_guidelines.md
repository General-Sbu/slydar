# Slidr Design Guidelines

## Design Approach

**Selected Approach:** Hybrid (Reference-based + Modern Design Patterns)

**Primary References:**
- **Linear** - Clean typography, modern spacing, professional interface
- **Notion** - Versatile component design, intuitive navigation
- **Figma** - Collaborative features presentation, vibrant accent colors
- **AhaSlides** - Core interaction patterns and presentation flow

**Design Philosophy:** Create a professional yet engaging platform that balances credibility with interactivity. The design should feel modern and trustworthy for corporate users while maintaining the energy needed for live audience engagement.

---

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background: 222 15% 8% (deep charcoal)
- Surface: 222 15% 12% (elevated panels)
- Border: 222 10% 20% (subtle divisions)
- Primary: 262 80% 65% (vibrant purple - presentation mode, CTAs)
- Success: 142 70% 55% (live status, correct answers)
- Accent: 190 75% 60% (interactive elements, highlights)
- Text Primary: 0 0% 95%
- Text Secondary: 0 0% 70%

**Light Mode:**
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Border: 220 13% 91%
- Primary: 262 80% 50% (deeper purple)
- Text Primary: 222 15% 15%

### B. Typography

**Font Stack:**
- Primary: Inter (via Google Fonts) - UI, body text, data
- Display: Space Grotesk (via Google Fonts) - Headings, presentation titles

**Type Scale:**
- Hero/Display: text-6xl to text-7xl, font-bold (Space Grotesk)
- Page Titles: text-4xl, font-semibold (Space Grotesk)
- Section Headers: text-2xl, font-semibold (Inter)
- Body: text-base, font-normal (Inter)
- Labels: text-sm, font-medium (Inter)
- Captions: text-xs, font-normal (Inter)

### C. Layout System

**Spacing Primitives:** Consistent use of 4, 8, 12, 16, 24, 32 (Tailwind units)
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-24
- Card gaps: gap-6 to gap-8
- Button padding: px-6 py-3

**Container Strategy:**
- Max width: max-w-7xl for main content
- Dashboard grids: grid with gap-6
- Sidebar: Fixed width w-64 to w-72
- Presentation view: Full viewport with controlled max-width

### D. Component Library

**Navigation:**
- Top navbar: Sticky, backdrop-blur with border-b
- Sidebar (Dashboard): Fixed left, collapsible on mobile, subtle hover states
- Breadcrumbs: For presentation editing context

**Presentation Builder:**
- Left panel: Slide type selector with icon + label cards
- Center: Live preview canvas with zoom controls
- Right panel: Properties and settings for selected slide

**Interactive Elements:**
- Poll cards: Elevated surfaces with smooth transitions
- Live charts: Animated bars/donuts with percentage labels
- Word clouds: Dynamic size-based text rendering
- Answer buttons: Large touch targets with instant feedback
- Room code display: Prominent, copyable, monospace font

**Data Display:**
- Real-time charts: Animated progress bars, donut charts
- Participant counter: Live updating with smooth number transitions
- Response grid: Cards showing individual submissions
- Leaderboard: Ranked list with position badges

**Forms & Inputs:**
- Slide editor: Inline editing with clear focus states
- Question input: Large textarea with character count
- Options builder: Drag-to-reorder list items
- Settings toggles: Clear on/off states with labels

**Feedback & States:**
- Loading: Subtle skeleton screens and pulse animations
- Success: Green checkmarks with slide-in animations
- Errors: Red borders with shake animation
- Empty states: Illustrations with helpful CTAs

### E. Presentation Views

**Presenter Dashboard:**
- Split view: Current slide (left 70%) + Controls/Stats (right 30%)
- Floating controls: Next/Prev arrows, timer, participant count
- Live feed: Scrollable response stream
- Slide navigation: Thumbnail grid drawer

**Audience Participation View:**
- Minimal header: Room code + branding
- Full-screen question display: Large, readable text
- Answer zone: Grid of touch-friendly buttons (2-column on mobile, 3-4 on desktop)
- Submitted state: Confirmation with waiting message

**Results Display:**
- Animated chart reveals: Stagger animation for bars
- Percentage overlays: Bold, contrasting text
- Winner highlights: Subtle glow effect for top choice
- Word cloud: Smooth size transitions as votes come in

---

## Page-Specific Designs

### Landing Page (Marketing)

**Hero Section:**
- Full-width gradient background (purple to blue subtle gradient)
- Large headline with Space Grotesk bold
- Animated mockup of presentation in action (positioned right side)
- Primary CTA: "Start Creating Free" (prominent, purple)
- Social proof: "Trusted by 50,000+ presenters" with logos

**Features Section:**
- 3-column grid on desktop, stack on mobile
- Icon + title + description cards
- Subtle hover lift effect
- Features: Live Polls, Interactive Quizzes, Real-time Q&A, Word Clouds, Analytics, No Login Required

**How It Works:**
- 3-step visual flow with connecting lines
- Large numbered steps with screenshots
- Clear, concise copy

**Pricing:**
- Card comparison layout
- Free tier prominently featured
- Highlight most popular plan

### Dashboard (App)

**Layout:**
- Sidebar navigation (collapsed on mobile)
- Main content area: Grid of presentation cards
- Top bar: Search, create button, user menu
- Presentation cards: Thumbnail, title, last edited, participant count

### Slide Builder

**Editor Interface:**
- Three-panel layout (slide types | canvas | properties)
- Canvas: Centered, max-w-4xl, aspect-ratio-video
- Slide types: Scrollable left panel with categorized sections
- Properties panel: Contextual based on selected slide type
- Bottom toolbar: Save, preview, present buttons

### Live Presentation

**Fullscreen Mode:**
- Clean, distraction-free
- Slide content: Centered, large text
- Controls: Fixed bottom bar with minimal footprint
- Exit button: Top-left, subtle

---

## Images

**Hero Image:**
- Large animated presentation mockup showing live poll results
- Position: Right 50% of hero section
- Style: Modern device frame (laptop/tablet) with glowing screen
- Content: Show colorful bar chart with live updating animation

**Feature Section Images:**
- Screenshot: Live poll interface with audience responses flowing in
- Screenshot: Word cloud forming in real-time
- Screenshot: Quiz leaderboard with participant names

**Dashboard:**
- Empty state illustration: Friendly character holding presentation clicker
- Presentation thumbnails: Auto-generated from first slide

---

## Accessibility & Interaction

- Minimum touch target: 44x44px for all interactive elements
- Focus indicators: 2px purple ring with offset
- Dark mode: Default with toggle in user menu
- Reduced motion: Respect prefers-reduced-motion
- Keyboard navigation: Full support with visible focus states
- Screen readers: Proper ARIA labels for all interactive components

---

## Animation Principles

**Use Sparingly:**
- Page transitions: Simple fade (150ms)
- Chart animations: Stagger bars (300ms total)
- Hover states: Scale 1.02 (100ms)
- Button clicks: Brief scale down (100ms)
- Real-time updates: Gentle slide-in for new responses

**Avoid:**
- Continuous looping animations
- Decorative motion
- Parallax effects
- Complex transitions

---

## Key Differentiators

- **Professional Polish:** Clean, modern interface for corporate trust
- **Vibrant Interactions:** Colorful, engaging for live audience moments
- **Instant Feedback:** Real-time visual responses to all actions
- **Minimal Friction:** No login for participants, simple room codes
- **Data Clarity:** Clear, readable charts and statistics