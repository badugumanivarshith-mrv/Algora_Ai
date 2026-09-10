# Algora AI - System Architecture Specification

## 1. Executive Summary & Vision

**Algora AI** is an intelligent, visual education and knowledge mastery platform. It synthesizes advanced generative AI with visual cognitive tools—principally interactive hierarchical mind maps, automated multimodal content ingestion (text, PDFs, lecture transcripts, URLs), adaptive spaced-repetition flashcards, automated quiz synthesis, and a contextual Socratic AI tutor.

This document outlines the end-to-end technical and architectural blueprint for Algora AI, designed to serve students, educators, and lifelong learners across web and mobile viewports.

---

## 2. High-Level Architectural Diagram

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|  +-----------------------------------------------------------------------------+  |
|  |                React 19 + TypeScript + Vite + Tailwind CSS                  |  |
|  |                                                                             |  |
|  |  +-------------------+  +--------------------+  +------------------------+  |  |
|  |  |   App Shell &     |  | Visual Mind Map    |  |  Study Suite & AI      |  |  |
|  |  | Navigation System |  | Infinite Canvas    |  | Flashcards / Quizzes   |  |  |
|  |  | (Sidebar, Header, |  | (DOM + SVG Node-   |  | (Spaced Repetition,    |  |  |
|  |  |  Breadcrumbs)     |  |  Edge Engine)      |  |  Socratic Chat Drawer) |  |  |
|  |  +-------------------+  +--------------------+  +------------------------+  |  |
|  |                                                                             |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  |  | State & Data Layer: Canvas Graph Store, Study Session Store, Auth Context|  |
|  +-----------------------------------------------------------------------------+  |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / REST & Server-Sent Events
                                           v
+-----------------------------------------------------------------------------------+
|                             BACKEND API SERVICE LAYER                             |
|  +-----------------------------------------------------------------------------+  |
|  |                      Node.js / Express Application Server                   |  |
|  |                                                                             |  |
|  |  +-----------------+  +--------------------+  +--------------------------+  |  |
|  |  |  Auth & User    |  | Workspace & Graph  |  | AI Ingestion & Synthesis |  |  |
|  |  |  Management     |  | Persistence API    |  | Pipeline Controller      |  |  |
|  |  +-----------------+  +--------------------+  +--------------------------+  |  |
|  |           |                     |                           |               |  |
|  |           v                     v                           v               |  |
|  |  +-----------------------------------------+  +--------------------------+  |  |
|  |  | Relational Database / Persistent Store  |  | Google GenAI SDK         |  |  |
|  |  | (PostgreSQL / Firestore)                |  | (Gemini 2.5/Flash-Pro)   |  |  |
|  |  +-----------------------------------------+  +--------------------------+  |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 3. Frontend Architecture

### 3.1 Technology Stack
- **Framework**: React 19 (functional components, concurrent hooks, optimized memoization)
- **Language**: TypeScript 5.8 (strict type safety, comprehensive interface definitions)
- **Bundler & Tooling**: Vite 6 (instant HMR, optimized production rollup bundle)
- **Styling**: Tailwind CSS v4 (design token utility classes, mobile-first responsive layout)
- **Animations & Transitions**: `motion/react` (canvas transitions, drawer slides, card flip effects)
- **Icons**: `lucide-react` (uniform stroke, tree-shakeable icon set)

### 3.2 Directory & Modular Structure
```
src/
├── assets/             # Static logos, illustration SVGs, branding
├── components/
│   ├── common/         # Atomic primitives: Button, Input, Modal, Badge, Tooltip, Avatar
│   ├── layout/         # AppShell, SidebarNav, HeaderBar, WorkspaceHeader, BottomNav
│   ├── canvas/         # InfiniteCanvas, MindMapNode, ConnectorLines, CanvasToolbar, Minimap
│   ├── study/          # FlashcardViewer, QuizCard, SpacedRepetitionHUD, ResultsModal
│   ├── ai/             # CopilotDrawer, PromptInput, DocumentExtractorModal, GenerationStream
│   └── dashboard/      # RecentMapsGrid, QuickActionCards, StreakTracker, FolderList
├── context/            # AuthContext, ThemeContext, CanvasContext, StudyContext
├── hooks/              # useCanvasTransform, useMindMapGraph, useSpacedRepetition, useAIStream
├── lib/                # Canvas math, graph layout algorithms (tree, radial, organic), utils
├── services/           # Typed API clients for workspaces, nodes, AI generation, study decks
├── types/              # Comprehensive TypeScript interfaces & enums
├── views/              # Route views: DashboardView, CanvasView, StudyView, LibraryView, SettingsView
├── App.tsx             # Main view router & shell orchestrator
├── index.css           # Global Tailwind imports & custom canvas utility classes
└── main.tsx            # Application entry mount
```

### 3.3 Visual Canvas Engine Architecture
The core value proposition of Algora AI is its responsive visual Mind Map Canvas.
- **Rendering Strategy**: Hybrid DOM + SVG Canvas.
  - **SVG Layer**: Renders high-performance cubic bezier curved connector lines (`path` elements) with branch color accents, dashed preview connectors, and arrow markers.
  - **DOM Layer**: Renders rich interactive HTML nodes enabling native inline text editing, markdown rendering, LaTeX formulas, thumbnail images, audio narration buttons, and sub-branch collapse/expand toggles.
- **Transform & Navigation**:
  - Zoom range: `0.1x` to `3.0x` with smooth mouse-wheel and pinch-to-zoom gestures.
  - Pan / Infinite Canvas: Middle-click drag, Spacebar + drag, or dedicated Hand Tool.
  - Minimap: Real-time scaled overview showing canvas bounding box and active viewport viewport rectangle.
  - Auto-Layout Engine: Hierarchical Tree Layout, Horizontal Mind Map, and Radial Cluster layouts computed via mathematical spacing vectors to avoid node collisions.

---

## 4. Backend & AI Service Architecture

### 4.1 Server Architecture
- **Runtime**: Node.js with Express 4.x / 5.x.
- **Vite Integration**: Middleware mode in development; production static asset serving from `dist/` with SPA fallback.
- **Security Boundary**: Server-side proxy for all Generative AI interactions via `@google/genai`. Zero browser exposure of private API credentials.
- **Streaming Support**: Server-Sent Events (SSE) or chunked HTTP streaming for real-time node generation, topic expansion, and tutor dialogues.

### 4.2 AI Synthesis Pipeline
1. **Multimodal Ingestion**:
   - Accepts raw text input, uploaded PDF/document contents, YouTube/web lecture URLs, or topic prompts.
   - Cleans, chunk-tokenizes, and creates an outline hierarchy.
2. **Graph Structure Generation**:
   - Model generates a strictly validated JSON structure: Central Topic -> Major Branches -> Sub-Concepts -> Detailed Leaves.
   - Assigns semantic weights, concise summaries, key formula definitions, and mnemonic hooks.
3. **Study Asset Generation**:
   - **Flashcards**: Generates front (concept prompt / question) and back (concise answer + visual hint + explanation).
   - **Quizzes**: Generates multiple-choice options with distractor rationales and verified ground-truth answer citing specific node IDs.
4. **Context-Aware Socratic Tutor**:
   - Grounded directly on the current node graph and source materials.
   - Answers student queries, elaborates on complex nodes, tests understanding, and suggests branch expansions.

---

## 5. Data Flow & State Management

```
[User Action: Upload Syllabus / Topic]
                 │
                 ▼
[Client: Dispatch Ingestion API Request]
                 │
                 ▼
[Express Server: Validate Request & Format Prompt]
                 │
                 ▼
[Gemini API: Structured Schema Extraction]
                 │
                 ▼ (Streamed JSON Graph)
[Express Server: Normalize Nodes & Edges]
                 │
                 ▼
[Client Canvas Store: Layout Computation & Animated Node Placement]
                 │
                 ▼
[User Edits / Reorganizes / Expands Branches]
                 │
                 ▼
[Persistence: Debounced Autosave to Database / Local Cache]
```

---

## 6. Non-Functional Requirements & Guardrails

- **Performance**:
  - Smooth 60 FPS viewport panning and zooming up to 500 nodes per map.
  - Debounced graph layout calculations (<16ms per frame computation).
- **Accessibility & Inclusion**:
  - Full WCAG AA color contrast compliance.
  - Dyslexia-friendly typography toggle (OpenDyslexic / clean high-legibility geometric sans).
  - Screen reader accessible tree-view representation of mind map node hierarchies.
  - Complete keyboard navigation (arrow keys to traverse nodes, Enter to edit, Tab to add child, Delete to remove).
- **Responsiveness**:
  - Fluid adaptation across mobile phones (375px+), tablets, laptops, and 4K ultra-wide monitors.
  - Collapsible sidebars and mobile bottom navigation bars.
- **Reliability & Offline Tolerance**:
  - Optimistic client-side graph updates with queued synchronization.
  - Local session caching to protect against accidental browser refreshes or connectivity drops.
