# Algora AI - Navigation & Route Map

## 1. Overview
This document defines the routing taxonomy, screen state transitions, deep-linking schema, and interaction navigation paths across Algora AI.

---

## 2. Route Inventory

| Route Path | View / Component | Layout Wrapper | Description & Primary Actions |
| :--- | :--- | :--- | :--- |
| `/` | `DashboardView` | `AppShell` | Overview of learning activities, quick AI generation triggers, recent mind maps, and subjects. |
| `/dashboard` | `DashboardView` | `AppShell` | Explicit alias for main user dashboard. |
| `/workspace/:mapId` | `CanvasView` | `CanvasShell` | Interactive Mind Map infinite canvas editor; supports node creation, graph manipulation, and AI tools. |
| `/workspace/:mapId/document` | `SplitStudyView` | `CanvasShell` | Split-screen study view comparing synthesized notes/document on the left and concept map on the right. |
| `/flashcards` | `DecksListView` | `AppShell` | Listing of all flashcard decks generated from user maps, with mastery badges and due counts. |
| `/flashcards/:deckId/study` | `StudySessionView` | `FocusedStudyShell` | Focused distraction-free spaced-repetition card review session with Leitner rating controls. |
| `/quiz/:quizId` | `QuizView` | `FocusedStudyShell` | Formative evaluation quiz with real-time feedback, grading, and node-referenced explanations. |
| `/library` | `LibraryView` | `AppShell` | Public directory of curated educational mind maps, searchable by grade level and discipline. |
| `/library/:publicMapId` | `PublicMapView` | `PublicShell` | Read-only visual preview of a community-published mind map with a "Clone to My Workspace" action. |
| `/settings` | `SettingsView` | `AppShell` | Account preferences, profile, accessibility options (dyslexia font, color theme), and AI model tier. |

---

## 3. Contextual Drawer & Modal Routing

The application maintains deep-linkable URL search parameters for ephemeral modals and contextual drawers to ensure back-button compatibility and reproducible study states:

| Parameter Key | Permitted Values | Function |
| :--- | :--- | :--- |
| `?modal=create` | `text`, `document`, `audio`, `url` | Launches the Omnichannel AI Generation Modal pre-tabbed to the selected source type. |
| `?modal=export` | `png`, `svg`, `pdf`, `anki`, `markdown` | Opens the canvas export dialog. |
| `?modal=share` | `invite`, `public-link`, `embed` | Opens workspace sharing and collaborator permissions modal. |
| `?drawer=copilot` | `true`, `false` | Slides out the contextual Socratic AI Tutor panel grounded on the active map. |
| `?drawer=node` | `nodeId=<string>` | Opens the rich-text note editor and formula inspector for the focused node. |
| `?view=tree` | `true`, `false` | Switches canvas presentation into an accessible outline/tree list view. |

---

## 4. User Journey Flows

### 4.1 Flow 1: Document to Interactive Mind Map (Core Creation)
```
[User on Dashboard]
       │
       ▼
Click "+ Create with AI" Button
       │
       ▼
Opens Ingestion Modal (?modal=create&source=document)
       │
       ├── User uploads lecture notes PDF or pastes syllabus text
       ├── Selects Granularity: "Summary" / "Balanced" / "Comprehensive"
       └── Clicks "Generate Mind Map"
       │
       ▼
Streamed Generation Animation (Displaying extracted topics in real-time)
       │
       ▼
Navigates to `/workspace/:newMapId`
       │
       ▼
Canvas renders hierarchical root and color-coded branches with auto-layout
```

### 4.2 Flow 2: Visual Concept Exploration & Branch Expansion
```
[User inside `/workspace/:mapId`]
       │
       ▼
Selects concept node (e.g., "Mitochondria")
       │
       ├── Quick Action: "Expand with AI"
       │      │
       │      └── AI generates 4 sub-nodes (Cristae, Matrix, ATP Synthase, Inner Membrane)
       │          Canvas smoothly auto-adjusts layout to prevent overlapping
       │
       ├── Quick Action: "Open Notes"
       │      └── Opens right inspector drawer (?drawer=node&nodeId=xyz) with rich definitions
       │
       └── Quick Action: "Ask AI Tutor"
              └── Opens Copilot Drawer (?drawer=copilot) pre-filled with: "Explain this concept simply"
```

### 4.3 Flow 3: Retention & Spaced Repetition (Mind Map -> Mastery)
```
[User finishes reviewing map in `/workspace/:mapId`]
       │
       ▼
Clicks "Study as Flashcards" in Workspace Header
       │
       ▼
AI synthesizes 15 Q&A flashcards directly from the node graph
       │
       ▼
Navigates to `/flashcards/:deckId/study`
       │
       ▼
Interactive 3D Study Session:
  - User reads Front prompt
  - Presses [Spacebar] to flip card
  - Reads Back explanation & mnemonic
  - Rates confidence: [Again] [Hard] [Good] [Easy]
       │
       ▼
Deck completed -> Displays retention mastery score & next scheduled review date
```

---

## 5. Keyboard Navigation & Accessibility Matrix

| Key Combination | Scope / View | Action Executed |
| :--- | :--- | :--- |
| `Cmd / Ctrl + K` | Global | Opens Command Palette (jump to map, search library, run AI prompt) |
| `Tab` | Canvas | Creates a new child node connected to currently selected node |
| `Enter` | Canvas | Creates a new sibling node at the same hierarchical depth |
| `Delete / Backspace` | Canvas | Removes selected node(s) and cascading connections |
| `Spacebar + Mouse Drag` | Canvas | Pans the infinite stage freely without moving nodes |
| `Cmd / Ctrl + Scroll` | Canvas | Smooth zoom into cursor position |
| `0` (Zero) | Canvas | Resets viewport zoom to 100% centered on root node |
| `Spacebar` | Study Session | Flips the current flashcard |
| `1, 2, 3, 4` | Study Session | Submits spaced-repetition ratings: (1) Again, (2) Hard, (3) Good, (4) Easy |
| `Esc` | Modals / Drawers | Closes active drawer or modal dialog |
