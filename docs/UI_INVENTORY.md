# Algora AI - UI & Design System Inventory

## 1. Overview
This document specifies the complete inventory of pages, views, layouts, reusable UI components, and design tokens derived from the Algora Education Platform design language.

---

## 2. Views & Screens Inventory

| Screen / View ID | View Name | Route / Modal | Purpose & Key Interactions |
| :--- | :--- | :--- | :--- |
| **SCR-01** | **Dashboard / Home** | `/` or `/dashboard` | Primary hub featuring quick AI creation actions, folder taxonomy, recent mind maps list/grid, learning streak tracker, and study recommendations. |
| **SCR-02** | **Mind Map Canvas Workspace** | `/workspace/:mapId` | Full-featured infinite canvas for visual concept mapping, node editing, branch styling, AI topic expansions, auto-layout, and multi-format exporting. |
| **SCR-03** | **Document & Map Split Study** | `/workspace/:mapId/document` | Dual-pane study view: Left pane shows structured source notes/PDF summary; Right pane displays the interactive linked concept graph. |
| **SCR-04** | **Flashcard Deck Hub** | `/flashcards` | Library of all flashcard decks generated from mind maps, organized by subject, due date, and mastery score. |
| **SCR-05** | **Spaced Repetition Study Session** | `/flashcards/:deckId/study` | Distraction-free interactive 3D card flip study interface with Leitner / SM-2 rating controls (Again, Hard, Good, Easy) and audio pronunciation. |
| **SCR-06** | **Quiz & Assessment Arena** | `/quiz/:quizId` | Formative evaluation view supporting multiple-choice, true/false, and concept explanation questions with immediate AI rationales and score analytics. |
| **SCR-07** | **Community Library** | `/library` | Searchable public repository of educational mind maps and decks created by teachers and verified peers; supports search, tag filters, and 1-click forking. |
| **SCR-08** | **Settings & Preferences** | `/settings` | User profile, learning goals, subscription tier management, accessibility toggles (dyslexia font, color blindness palettes), and AI model settings. |
| **MDL-01** | **AI Generation Modal** | Overlay / Dialog | Omnichannel ingestion dialog allowing users to generate maps from raw text prompts, document uploads (PDF, TXT, DOCX), or lecture URLs. |
| **MDL-02** | **Export & Share Dialog** | Overlay / Dialog | Export canvas to PNG, SVG, PDF, Markdown outline, or Anki package; shareable link generator with view/edit permissions. |
| **MDL-03** | **Node Detail Inspector** | Floating / Slide Drawer | Detailed rich-text notes, math formulas ($LaTeX$), image attachments, and AI elaboration for the currently selected canvas node. |

---

## 3. Layout Systems

### 3.1 Standard Application Shell (`AppShell`)
- **Navigation Sidebar (Left, 260px wide, collapsible to 72px icon rail)**:
  - App Logo & Brand mark ("Algora AI")
  - Primary Navigation links: Dashboard, Mind Maps, Flashcards, Quizzes, Library
  - Folder hierarchy tree (Subjects / Courses)
  - Storage & Credit Usage indicator bar
  - User profile menu trigger
- **Header Bar (Top, 64px high)**:
  - Breadcrumb trail (`Home / Biology / Cell Division`)
  - Global Command Search input (`Cmd + K`)
  - Quick "+ New Map" CTA button
  - Streak badge with flame indicator (e.g., "7 Days")
  - Notification dropdown
  - User avatar with status ring
- **Content Viewport**: Flexible container with subtle neutral background (`bg-slate-50 / dark:bg-slate-950`).

### 3.2 Immersive Canvas Shell (`CanvasShell`)
- **Workspace Header (Top, floating or edge-to-edge 56px)**:
  - Back to Dashboard arrow
  - Inline editable Mind Map Title
  - Autosave status indicator ("All changes saved")
  - Collaboration avatars ("3 active users")
  - Undo / Redo controls
  - AI Generation trigger button
  - Study Mode trigger ("Convert to Flashcards / Quiz")
  - Export & Share CTA buttons
- **Main Canvas Viewport (Infinite Stage)**:
  - SVG connection rendering layer
  - HTML node positioning layer
  - Floating Canvas HUD:
    - Zoom In / Out / Reset to 100% / Fit to Screen
    - Pan (Hand tool) vs Select tool toggle
    - Auto-layout button (Hierarchical, Horizontal, Radial)
    - Minimap toggle & draggable preview box
- **Collapsible Right AI Copilot Drawer (380px wide)**:
  - Contextual Socratic tutor chat
  - Node expansion suggestions
  - Instant definitions and citations

---

## 4. Reusable Component Inventory

### 4.1 Core Primitives
- `Button`: Primary, Secondary, Outline, Ghost, Danger, Icon-only. Includes loading spinner states and sizes (`xs`, `sm`, `md`, `lg`).
- `Input` & `Textarea`: Clean high-contrast borders, focus rings, leading/trailing icon slots, validation error labels.
- `Badge`: Status badges (e.g., "AI Generated", "Due Today", "Mastered", "Draft"), with rounded pill geometry.
- `Card`: Flat container with 1px border (`border-slate-200 / dark:border-slate-800`), 12px border radius, and subtle elevation on hover.
- `Modal / Dialog`: Accessible dialog backdrop with backdrop-blur, title header, body container, and action footer with keyboard `Esc` listener.
- `Tabs`: Segmented pill or underline tab headers for switching view contexts.
- `Tooltip`: Instant micro-interaction hints for icon controls.
- `Avatar` & `AvatarGroup`: User profile pictures with fallback initials and active presence indicators.
- `ProgressBar`: Smooth animated progress fill for learning streaks and quiz completion.

### 4.2 Canvas-Specific Components
- `MindMapNode`:
  - Central Root Node: High-emphasis gradient border, bold typography, expanded padding.
  - Branch Node: Color-coded left/top accent bar matching parent branch color, title, optional note preview icon, child count pill.
  - Leaf Node: Compact minimalist pill node with concise concept label.
  - Collapse / Expand Handle: Circular button (+/-) at node edge to fold child subtrees.
  - Quick Node Action Bar (On Hover/Select): Add Child (+), Add Sibling, Ask AI, Change Color, Delete.
- `ConnectorPath`:
  - Smooth SVG cubic bezier curve connecting parent outlet to child inlet.
  - Configurable stroke color matching branch taxonomy, with animated stroke-dasharray during AI expansion.
- `Minimap`:
  - Mini thumbnail canvas rendered in lower-right corner with interactive viewport bounding rectangle.
- `CanvasToolbar`:
  - Floating pill toolbar docked at bottom-center with Selection, Node, Connector, Note, and Eraser tools.

### 4.3 Study & AI Components
- `Flashcard3D`:
  - Double-sided flip card with smooth CSS perspective transform (`preserve-3d`).
  - Front: Concept prompt, category tag, "Flip card" indicator, optional text-to-speech button.
  - Back: Clear answer explanation, mnemonic bullet points, and key takeaways.
- `RatingControls`:
  - Leitner / SuperMemo buttons: "Again" (Red, <1d), "Hard" (Amber, 2d), "Good" (Blue, 4d), "Easy" (Emerald, 7d).
- `QuizQuestionCard`:
  - Question header, interactive option radio pills, immediate feedback state (green for correct, red with strike-through for incorrect), and detailed AI explanation box.
- `CopilotChatDrawer`:
  - Chat thread history with distinct User and AI message bubbles, formatted markdown, copy code/text buttons, and prompt recommendation chips.

---

## 5. Design Tokens System

### 5.1 Color Tokens
| Token Name | Light Value | Dark Value | Purpose |
| :--- | :--- | :--- | :--- |
| `primary-50` | `#EEF2FF` | `#1E1B4B` | Primary tinted backgrounds |
| `primary-500` | `#6366F1` | `#6366F1` | Brand Indigo, primary buttons, root nodes |
| `primary-600` | `#4F46E5` | `#4338CA` | Hover states, active links |
| `accent-teal` | `#06B6D4` | `#0891B2` | AI features, glowing action accents |
| `accent-violet`| `#8B5CF6` | `#7C3AED` | Secondary branch color token |
| `accent-amber` | `#F59E0B` | `#D97706` | Tertiary branch color token |
| `accent-emerald`| `#10B981` | `#059669` | Success, mastered concepts |
| `accent-rose`  | `#F43F5E` | `#E11D48` | Danger, card repetition trigger |
| `surface-bg`   | `#F8FAFC` | `#090D16` | Main viewport canvas background |
| `surface-card` | `#FFFFFF` | `#111827` | Card & node surface |
| `border-subtle`| `#E2E8F0` | `#1F2937` | Standard component borders |
| `text-primary` | `#0F172A` | `#F8FAFC` | Headings and high-contrast labels |
| `text-muted`   | `#64748B` | `#94A3B8` | Subtitles, helper text, timestamps |

### 5.2 Typography Tokens
- **Font Stack Primary**: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` (clean, high legibility)
- **Dyslexia-Friendly Alternate**: Accessible sans with open counter-spaces and weighted bases
- **Code & Formulas**: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
- **Scale**:
  - `Display / H1`: 32px (2.0rem), line-height: 1.25, font-weight: 700
  - `H2 (Section Header)`: 24px (1.5rem), line-height: 1.33, font-weight: 600
  - `H3 (Node Root / Card Title)`: 18px (1.125rem), line-height: 1.4, font-weight: 600
  - `Body Standard`: 16px (1.0rem), line-height: 1.6, font-weight: 400
  - `Body Small / Sub-node`: 14px (0.875rem), line-height: 1.5, font-weight: 400
  - `Caption / Badge`: 12px (0.75rem), line-height: 1.4, font-weight: 500

### 5.3 Spacing & Geometry Tokens
- **Base Grid**: 4px unit (4, 8, 12, 16, 20, 24, 32, 48, 64)
- **Container Padding**: 16px to 32px
- **Border Radii**:
  - Buttons & Inputs: `8px` (`rounded-lg`)
  - Standard Cards & Node Containers: `12px` (`rounded-xl`)
  - Badges & Control Pills: `9999px` (`rounded-full`)
- **Elevation / Shadows**:
  - `shadow-sm`: Subtle separation for list items (`0 1px 2px rgba(0,0,0,0.05)`)
  - `shadow-md`: Standard elevation for canvas nodes and floating HUDs
  - `shadow-xl`: Deep elevation for modal dialogs and dropdown menus
