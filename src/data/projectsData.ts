/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Project Hub — 12 Production Projects (Beginner, Intermediate, Advanced)
 */

import { Project } from "../types/project";

export const PROJECTS_BANK: Project[] = [
  // ==========================================
  // BEGINNER PROJECTS
  // ==========================================
  {
    id: "proj-calculator",
    title: "Scientific Calculator & Expression Parser",
    slug: "scientific-calculator",
    level: "Beginner",
    trackId: "track-python",
    trackTitle: "Python & Core Logic",
    summary: "Build an AST (Abstract Syntax Tree) expression parser evaluating nested mathematical expressions without eval().",
    overview: "Develop a secure mathematical expression engine that converts string math expressions into Abstract Syntax Trees using the Shunting-Yard algorithm and evaluates them safely.",
    bannerImage: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=800&auto=format&fit=crop&q=80",
    requirements: [
      "Tokenize raw expression strings into structured number, operator, and parenthesis tokens",
      "Implement operator precedence (*, / before +, -) and unary negation (-x)",
      "Support arbitrarily nested parentheses and trigonometric functions (sin, cos, tan)",
      "Handle divide-by-zero, syntax errors, and unmatched parentheses gracefully"
    ],
    learningGoals: [
      "Master Stack data structures and Reverse Polish Notation (RPN)",
      "Write safe input lexers without insecure `eval()` vulnerabilities",
      "Understand Operator Precedence Parsing"
    ],
    technologies: ["Python / C++", "Stack Data Structures", "Lexical Tokenization", "Unit Testing"],
    estimatedHours: 8,
    xpReward: 250,
    architectureDiagramNotes: "User Input String -> Lexer Tokenizer -> Shunting-Yard Parser (Infix to Postfix) -> Stack Evaluator -> Result",
    evaluationCriteria: [
      { category: "Tokenization & Lexing", maxScore: 25, criteria: "Correctly handles floating point numbers, whitespace, and negative values" },
      { category: "Precedence & Parentheses", maxScore: 35, criteria: "Accurately parses nested brackets and respects standard math operator precedence" },
      { category: "Error Safety", maxScore: 20, criteria: "Catches divide-by-zero, unmatched brackets, and invalid syntax without crashing" },
      { category: "Code Quality & Tests", maxScore: 20, criteria: "Clean modular functions with comprehensive test cases" }
    ],
    milestones: [
      {
        id: "calc-m1",
        order: 1,
        title: "Milestone 1: Lexical Tokenizer Engine",
        description: "Transform raw string inputs into a stream of typed Tokens.",
        estimatedHours: 2,
        deliverable: "Tokenizer class with full unit tests.",
        aiReviewPrompt: "Review the tokenization loop for handling floats and negative sign ambiguity.",
        tasks: [
          { id: "calc-t1", title: "Define Token data model and TokenType enum", description: "NUMBER, OPERATOR, LPAREN, RPAREN, FUNCTION", hints: ["Use dataclass or Enum"], isCompleted: false, learningOutcome: "Domain modeling" },
          { id: "calc-t2", title: "Implement string scanner with character lookahead", description: "Scan digits, decimal points, and multi-letter function names", hints: ["Loop while index < length"], isCompleted: false, learningOutcome: "Lexing algorithms" }
        ]
      },
      {
        id: "calc-m2",
        order: 2,
        title: "Milestone 2: Shunting-Yard Infix to Postfix Converter",
        description: "Convert token stream into Reverse Polish Notation using an operator stack.",
        estimatedHours: 3,
        deliverable: "RPN Converter producing postfix queue.",
        aiReviewPrompt: "Check operator stack popping conditions and bracket matching.",
        tasks: [
          { id: "calc-t3", title: "Define precedence dictionary", description: "^: 4, *: 3, /: 3, +: 2, -: 2", hints: ["Map operator strings to rank integers"], isCompleted: false, learningOutcome: "Precedence modeling" },
          { id: "calc-t4", title: "Implement Shunting-Yard algorithm loop", description: "Process tokens, manage operator stack and output queue", hints: ["Pop higher/equal precedence operators before pushing"], isCompleted: false, learningOutcome: "Stack manipulation" }
        ]
      },
      {
        id: "calc-m3",
        order: 3,
        title: "Milestone 3: Postfix Evaluator & CLI Interface",
        description: "Evaluate postfix queue to compute final numerical result.",
        estimatedHours: 3,
        deliverable: "CLI Application & Unit Test Suite.",
        aiReviewPrompt: "Evaluate error handling for divide-by-zero and empty expression.",
        tasks: [
          { id: "calc-t5", title: "Implement RPN Stack Evaluation", description: "Pop operands, apply operator, push result back", hints: ["Ensure at least 2 operands exist for binary operators"], isCompleted: false, learningOutcome: "RPN evaluation" }
        ]
      }
    ]
  },
  {
    id: "proj-quiz",
    title: "Interactive Adaptive Testing & Quiz Engine",
    slug: "quiz-app",
    level: "Beginner",
    trackId: "track-js",
    trackTitle: "Full Stack & Web",
    summary: "Build an interactive CLI and Web Quiz platform with timed questions, category filters, and score cards.",
    overview: "Architect an adaptive testing engine featuring multiple-choice questions, category selection, instant answer feedback, countdown timer, and performance breakdown.",
    bannerImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
    requirements: [
      "Load question bank from JSON file with question text, options, correct answer index, and explanations",
      "Support category filtering (DSA, Python, Systems, Web) and difficulty levels",
      "Include a countdown timer per question with auto-submit on timeout",
      "Display comprehensive end-of-quiz statistics and review breakdown"
    ],
    learningGoals: ["State Management", "JSON Data I/O & File Operations", "Asynchronous Timers"],
    technologies: ["TypeScript / Python", "JSON Parsing", "Timer Asynchrony"],
    estimatedHours: 6,
    xpReward: 200,
    architectureDiagramNotes: "Quiz Runner -> Question Service -> JSON Storage -> State Store -> Results Engine",
    evaluationCriteria: [
      { category: "State Management", maxScore: 30, criteria: "Accurately maintains active question index, score, and user selected choices" },
      { category: "Timer Integration", maxScore: 25, criteria: "Countdown timer runs accurately and handles time expiry gracefully" },
      { category: "Data Decoupling", maxScore: 25, criteria: "Questions loaded dynamically from JSON without hardcoded static arrays" },
      { category: "User Experience", maxScore: 20, criteria: "Clear feedback indicators, progress bar, and score report" }
    ],
    milestones: [
      {
        id: "quiz-m1",
        order: 1,
        title: "Milestone 1: Question Bank Schema & Loader",
        description: "Define question interfaces and load JSON data.",
        estimatedHours: 2,
        deliverable: "Question Repository module.",
        aiReviewPrompt: "Check schema validation for missing answer indices.",
        tasks: [
          { id: "quiz-t1", title: "Create Question and QuizSession interfaces", description: "Include id, prompt, options, correctIndex, explanation", hints: ["Use strict TypeScript interfaces"], isCompleted: false, learningOutcome: "Type modeling" }
        ]
      },
      {
        id: "quiz-m2",
        order: 2,
        title: "Milestone 2: Session Controller & Timer",
        description: "Manage active question state, countdown clock, and submission scoring.",
        estimatedHours: 4,
        deliverable: "Complete Quiz Engine application.",
        aiReviewPrompt: "Evaluate score calculation and timer cleanup logic.",
        tasks: [
          { id: "quiz-t2", title: "Implement QuizSessionController", description: "Advance question, score answers, calculate final percentage", hints: ["Keep score state immutable"], isCompleted: false, learningOutcome: "State machines" }
        ]
      }
    ]
  },
  {
    id: "proj-banking",
    title: "Core Banking & Ledger Engine",
    slug: "banking-system",
    level: "Beginner",
    trackId: "track-systems",
    trackTitle: "Systems & Architecture",
    summary: "Build an ACID-compliant double-entry banking ledger tracking account balances and transaction histories.",
    overview: "Develop a secure banking ledger engine supporting multi-account transfers, overdraft protection, transaction rollbacks, and tamper-evident audit logging.",
    bannerImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
    requirements: [
      "Create accounts with unique IDs, owner metadata, and starting balances",
      "Support atomic deposits, withdrawals, and inter-account transfers",
      "Enforce double-entry accounting invariants: Total ledger deposits == Total credits",
      "Generate immutable transaction logs with timestamps and transaction UUIDs"
    ],
    learningGoals: ["Double-Entry Accounting Mechanics", "Concurrency & Atomicity Invariants", "Defensive Programming"],
    technologies: ["Python / C++ / Java", "Double-Entry Ledger", "File Persistence"],
    estimatedHours: 10,
    xpReward: 300,
    architectureDiagramNotes: "Account Controller -> Transfer Service -> Double-Entry Ledger Repository -> File Audit Log",
    evaluationCriteria: [
      { category: "Atomicity & Invariants", maxScore: 40, criteria: "Transfers never create or destroy funds, even during failure simulation" },
      { category: "Audit Log Integrity", maxScore: 30, criteria: "Every transaction generates a complete timestamped audit entry" },
      { category: "Edge Case Safety", maxScore: 30, criteria: "Handles negative amounts, insufficient funds, and invalid target accounts" }
    ],
    milestones: [
      {
        id: "bank-m1",
        order: 1,
        title: "Milestone 1: Account Entity & Balance State",
        description: "Define the Account class with encapsulated balance state.",
        estimatedHours: 3,
        deliverable: "Account class with invariant checks.",
        aiReviewPrompt: "Review deposit and withdrawal input validation.",
        tasks: [
          { id: "bank-t1", title: "Create Account model with private balance field", description: "Prevent direct external balance mutations", hints: ["Use getter methods"], isCompleted: false, learningOutcome: "Encapsulation" }
        ]
      },
      {
        id: "bank-m2",
        order: 2,
        title: "Milestone 2: Atomic Transfer Engine & Audit Ledger",
        description: "Implement transfer function with double-entry balance updates.",
        estimatedHours: 7,
        deliverable: "Ledger Service with file persistent transaction log.",
        aiReviewPrompt: "Check atomicity during withdrawal failure.",
        tasks: [
          { id: "bank-t2", title: "Implement LedgerService.transfer(fromId, toId, amount)", description: "Ensure source deduction and target credit happen atomically", hints: ["Deduct source balance first, credit destination second; revert if debit fails"], isCompleted: false, learningOutcome: "Atomic transactions" }
        ]
      }
    ]
  },
  {
    id: "proj-student",
    title: "Academic Record & Student Management System",
    slug: "student-management",
    level: "Beginner",
    trackId: "track-db",
    trackTitle: "Data Management",
    summary: "Build an academic tracking database calculating semester CGPA, course enrollment, and attendance records.",
    overview: "Design a data management application allowing academic advisors to register students, enroll them in courses, assign grades, and calculate Cumulative Grade Point Averages (CGPA).",
    bannerImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
    requirements: [
      "Manage Student, Course, and Grade Enrollment entities",
      "Calculate weighted GPA based on course credit hours and grade points (A=4, B=3, C=2, D=1, F=0)",
      "Search students by department, roll number, or name substring",
      "Persist database records to local disk storage (JSON/CSV)"
    ],
    learningGoals: ["Relational Entity Mapping (1-to-N, N-to-N)", "GPA Calculation Logic", "File I/O Serialization"],
    technologies: ["Java / Python", "Data Modeling", "CSV / JSON Persistence"],
    estimatedHours: 8,
    xpReward: 250,
    architectureDiagramNotes: "CLI / Web UI -> Academic Manager -> Relational In-Memory Store -> Disk File Persistence",
    evaluationCriteria: [
      { category: "GPA Accuracy", maxScore: 35, criteria: "Accurately computes credit-weighted GPA across multiple semesters" },
      { category: "Entity Relationships", maxScore: 35, criteria: "Correctly manages student-to-course N-to-N enrollment mappings" },
      { category: "Search & Filtering", maxScore: 30, criteria: "Efficient lookup by student ID, course code, or department" }
    ],
    milestones: [
      {
        id: "stud-m1",
        order: 1,
        title: "Milestone 1: Domain Entities & Grade Map",
        description: "Model Student, Course, and Enrollment classes.",
        estimatedHours: 4,
        deliverable: "Academic Models with CGPA math functions.",
        aiReviewPrompt: "Verify weighted GPA math formula.",
        tasks: [
          { id: "stud-t1", title: "Implement Student and Course entities", description: "Include rollNumber, name, department, creditHours", hints: ["Store course list in student"], isCompleted: false, learningOutcome: "Domain modeling" }
        ]
      }
    ]
  },

  // ==========================================
  // INTERMEDIATE PROJECTS
  // ==========================================
  {
    id: "proj-expense",
    title: "Personal Finance & Expense Tracker Engine",
    slug: "expense-tracker",
    level: "Intermediate",
    trackId: "track-fullstack",
    trackTitle: "Full-Stack Development",
    summary: "Architect a personal budgeting tool with monthly breakdown analytics, tag aggregation, and spending limits.",
    overview: "Build a robust financial manager allowing users to record income/expenses, categorize transactions, set monthly budget limits, and generate visual spending distribution reports.",
    bannerImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop&q=80",
    requirements: [
      "RESTful CRUD operations for transactions (amount, category, date, description, type)",
      "Set budget thresholds per category with warning triggers on exceedance",
      "Generate monthly summary reports (Total Income, Total Expense, Net Savings Rate)",
      "Filter transactions by date range, category tags, and payment mode"
    ],
    learningGoals: ["RESTful API Design", "Date & Currency Math Precision", "Data Aggregations"],
    technologies: ["TypeScript / Node.js", "Express", "SQLite / PostgreSQL"],
    estimatedHours: 14,
    xpReward: 400,
    architectureDiagramNotes: "React Dashboard -> Express REST API -> Expense Controller -> PostgreSQL Database",
    evaluationCriteria: [
      { category: "REST API Compliance", maxScore: 30, criteria: "Clean HTTP status codes (200, 201, 400, 404) and payload structure" },
      { category: "Aggregation Queries", maxScore: 35, criteria: "Fast SQL aggregation for monthly category breakdowns" },
      { category: "Validation & Precision", maxScore: 35, criteria: "Prevents floating point currency inaccuracies using fixed integers/cents" }
    ],
    milestones: [
      {
        id: "exp-m1",
        order: 1,
        title: "Milestone 1: Database Schema & Transaction API",
        description: "Set up PostgreSQL schema and CRUD endpoints.",
        estimatedHours: 6,
        deliverable: "Express CRUD REST API.",
        aiReviewPrompt: "Check monetary storage precision (cents vs floats).",
        tasks: [
          { id: "exp-t1", title: "Design transactions table schema", description: "Use INTEGER for amount in cents", hints: ["Never store currency in float"], isCompleted: false, learningOutcome: "Financial DB schema" }
        ]
      }
    ]
  },
  {
    id: "proj-library",
    title: "Digital Library Asset & Catalog System",
    slug: "library-management",
    level: "Intermediate",
    trackId: "track-backend",
    trackTitle: "Backend Engineering",
    summary: "Build an asset checkout system managing book borrowing, reservation queues, and automated overdue fine calculation.",
    overview: "Architect a digital library management platform that tracks book availability, manages user loan limits, enforces return deadlines, and calculates overdue penalty fees.",
    bannerImage: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop&q=80",
    requirements: [
      "Manage Book ISBN catalog, Author records, and physical Copy Inventory",
      "Implement borrowing flow with copy allocation and max loan duration (e.g. 14 days)",
      "Auto-calculate overdue fine ($0.50/day) on late returns",
      "Queue book reservations when zero copies are available"
    ],
    learningGoals: ["Inventory State Management", "Date Arithmetic & Penalty Schedules", "FIFO Reservation Queues"],
    technologies: ["Node.js / Express", "PostgreSQL / Prisma", "Date-fns"],
    estimatedHours: 16,
    xpReward: 450,
    architectureDiagramNotes: "Catalog Service -> Reservation Queue -> Loan Manager -> Fine Calculator -> Database",
    evaluationCriteria: [
      { category: "Inventory Consistency", maxScore: 35, criteria: "Available copies count never drops below zero during concurrent checkouts" },
      { category: "Overdue Math", maxScore: 35, criteria: "Accurately computes days overdue and penalty fee amounts" },
      { category: "Reservation Queue", maxScore: 30, criteria: "Automatically notifies first queued reservation when a book is returned" }
    ],
    milestones: [
      {
        id: "lib-m1",
        order: 1,
        title: "Milestone 1: Catalog & Inventory Schema",
        description: "Design books, copies, and borrowing tables.",
        estimatedHours: 5,
        deliverable: "Relational DB migration files.",
        aiReviewPrompt: "Verify foreign key constraints between Books and Copies.",
        tasks: [
          { id: "lib-t1", title: "Create Books and Loans database schema", description: "Include isbn, title, total_copies, available_copies", hints: ["Use foreign keys"], isCompleted: false, learningOutcome: "Relational schemas" }
        ]
      }
    ]
  },
  {
    id: "proj-inventory",
    title: "Supply Chain & Inventory Control Engine",
    slug: "inventory-system",
    level: "Intermediate",
    trackId: "track-systems",
    trackTitle: "Systems & Cloud",
    summary: "Design an automated warehouse inventory manager with stock reorder alerts and supplier tracking.",
    overview: "Build a warehouse management engine that tracks SKU stock levels across multiple locations, triggers low-stock reorder notices, and manages purchase order flows.",
    bannerImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80",
    requirements: [
      "Track SKU catalog with reorder thresholds and unit cost",
      "Log inbound stock receipts (restock) and outbound order shipments (deduct)",
      "Generate automated Low-Stock Alerts when inventory falls below minimum threshold",
      "Export inventory valuation reports (FIFO / LIFO accounting method)"
    ],
    learningGoals: ["Stock Movement Invariants", "FIFO / LIFO Cost Valuation Algorithms", "Alert Notifications"],
    technologies: ["TypeScript", "Express / PostgreSQL", "Chart.js"],
    estimatedHours: 15,
    xpReward: 420,
    architectureDiagramNotes: "Inventory Service -> SKU Movement Log -> Reorder Watcher -> Valuation Calculator",
    evaluationCriteria: [
      { category: "Stock Accuracy", maxScore: 40, criteria: "SKU quantity reflects sum of inbound minus outbound movement logs" },
      { category: "Valuation Logic", maxScore: 30, criteria: "Accurately implements FIFO inventory cost calculations" },
      { category: "Alert Triggers", maxScore: 30, criteria: "Triggers low-stock warnings immediately when stock crosses threshold" }
    ],
    milestones: [
      {
        id: "inv-m1",
        order: 1,
        title: "Milestone 1: SKU Catalog & Stock Movement Ledger",
        description: "Build inventory movement logging and SKU management.",
        estimatedHours: 6,
        deliverable: "Inventory Controller API.",
        aiReviewPrompt: "Review stock deduction concurrency guards.",
        tasks: [
          { id: "inv-t1", title: "Create Stock Log schema", description: "Record sku_id, movement_type, quantity, unit_price, timestamp", hints: ["Use audit log pattern"], isCompleted: false, learningOutcome: "Stock logging" }
        ]
      }
    ]
  },
  {
    id: "proj-chat",
    title: "Real-Time Messaging & Chat Application",
    slug: "chat-application",
    level: "Intermediate",
    trackId: "track-realtime",
    trackTitle: "Real-Time Systems",
    summary: "Architect a multi-room real-time messaging engine with WebSocket connections, typing indicators, and message history.",
    overview: "Build a high-performance chat system supporting public/private channels, real-time message broadcasting via WebSockets, online user presence, and message persistence.",
    bannerImage: "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=800&auto=format&fit=crop&q=80",
    requirements: [
      "Establish bi-directional WebSocket connections with automatic reconnection",
      "Support chat room joining, leaving, and channel-based message broadcasting",
      "Display real-time typing indicators and online/offline user presence dots",
      "Persist message history in database with dynamic pagination on scroll"
    ],
    learningGoals: ["WebSocket Protocol & Event Handlers", "Real-Time Pub/Sub Patterns", "Presence Tracking"],
    technologies: ["Node.js / Socket.io / ws", "React", "Redis / PostgreSQL"],
    estimatedHours: 18,
    xpReward: 500,
    architectureDiagramNotes: "React Chat Client -> WebSocket Server (Socket.io) -> Room Pub/Sub Router -> DB Message Persistence",
    evaluationCriteria: [
      { category: "Real-Time Sub-100ms Latency", maxScore: 40, criteria: "Messages broadcast instantly to all room participants" },
      { category: "Presence & Typing", maxScore: 30, criteria: "Accurate online user list and typing state timers" },
      { category: "Message Persistence", maxScore: 30, criteria: "Old messages load seamlessly on channel switch" }
    ],
    milestones: [
      {
        id: "chat-m1",
        order: 1,
        title: "Milestone 1: WebSocket Server & Room Handshake",
        description: "Set up WebSocket server and room broadcast events.",
        estimatedHours: 7,
        deliverable: "Real-Time Server Application.",
        aiReviewPrompt: "Evaluate socket connection authorization and room isolation.",
        tasks: [
          { id: "chat-t1", title: "Implement WebSocket connection handler", description: "Handle join_room, send_message, and disconnect events", hints: ["Use Socket.io room rooms"], isCompleted: false, learningOutcome: "WebSockets" }
        ]
      }
    ]
  },

  // ==========================================
  // ADVANCED PROJECTS
  // ==========================================
  {
    id: "proj-lms",
    title: "Enterprise Learning Management System (LMS)",
    slug: "lms",
    level: "Advanced",
    trackId: "track-architecture",
    trackTitle: "Enterprise Systems",
    summary: "Build an end-to-end LMS platform with role-based access control (RBAC), course content delivery, and video progress tracking.",
    overview: "Architect an enterprise LMS supporting Student, Instructor, and Admin roles. Features include course creation, video module progression, interactive quizzes, assignment submissions, and student completion certificates.",
    bannerImage: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&auto=format&fit=crop&q=80",
    requirements: [
      "Role-Based Access Control (RBAC middleware) for Student, Instructor, and Super Admin",
      "Course creation portal with video lessons, downloadable resources, and chapter ordering",
      "Track granular student video progress percentage and milestone unlock conditions",
      "Issue automated PDF Completion Certificates upon 100% course fulfillment"
    ],
    learningGoals: ["Complex RBAC Architecture", "Media Delivery & Content Pipeline", "Certificate Generation"],
    technologies: ["Next.js / Express", "PostgreSQL / Prisma", "JWT Auth", "PDFkit"],
    estimatedHours: 24,
    xpReward: 750,
    architectureDiagramNotes: "Client Portal -> Express API Gate (RBAC Middleware) -> Course Service / Progress Engine -> DB Storage",
    evaluationCriteria: [
      { category: "RBAC Security", maxScore: 35, criteria: "Students cannot access instructor management endpoints" },
      { category: "Progress Calculation", maxScore: 35, criteria: "Accurately calculates overall course progress across lessons and quizzes" },
      { category: "Certificate Pipeline", maxScore: 30, criteria: "Generates tamper-verified completion certificates upon course finish" }
    ],
    milestones: [
      {
        id: "lms-m1",
        order: 1,
        title: "Milestone 1: RBAC Middleware & Course Catalog Schema",
        description: "Design multi-role authorization guards and course hierarchy.",
        estimatedHours: 8,
        deliverable: "RBAC Authorization Engine.",
        aiReviewPrompt: "Audit RBAC middleware against permission escalation attacks.",
        tasks: [
          { id: "lms-t1", title: "Create RBAC middleware verifyRole(['admin', 'instructor'])", description: "Reject unauthorized HTTP requests with 403 Forbidden", hints: ["Extract role from verified JWT token"], isCompleted: false, learningOutcome: "RBAC Security" }
        ]
      }
    ]
  },
  {
    id: "proj-online-judge",
    title: "Distributed Online Code Judge Engine",
    slug: "online-judge",
    level: "Advanced",
    trackId: "track-distributed",
    trackTitle: "Distributed Systems",
    summary: "Architect a sandboxed code execution queue evaluating multi-language programs against hidden test suites.",
    overview: "Design a high-throughput online judge queue with isolated sandbox workers, CPU/memory limits, testcase assertion runners, and real-time execution telemetry.",
    bannerImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    requirements: [
      "Process asynchronously submitted code snippets in C, C++, Java, and Python",
      "Isolate subprocess execution using cgroups/Docker containers with strict RAM (e.g. 256MB) and CPU (1s) limits",
      "Evaluate program stdout against expected test case files and generate verdicts (AC, WA, TLE, MLE, CE, RE)",
      "Distribute execution jobs across worker nodes using a Redis background job queue"
    ],
    learningGoals: ["Process Sandboxing & Resource Isolation", "Asynchronous Job Queues", "System Call Filtering"],
    technologies: ["Node.js / Python", "Docker / Subprocess Isolation", "Redis BullMQ", "PostgreSQL"],
    estimatedHours: 28,
    xpReward: 850,
    architectureDiagramNotes: "Code Submission API -> Redis Job Queue -> Isolated Worker Sandbox Containers -> Verdict Dispatcher",
    evaluationCriteria: [
      { category: "Sandbox Security", maxScore: 40, criteria: "Prevents malicious system calls, filesystem tampering, and infinite fork bombs" },
      { category: "Metering Accuracy", maxScore: 30, criteria: "Precise millisecond runtime and kilobyte memory measurement" },
      { category: "Queue Throughput", maxScore: 30, criteria: "Handles concurrent job queueing gracefully under load" }
    ],
    milestones: [
      {
        id: "oj-m1",
        order: 1,
        title: "Milestone 1: Subprocess Isolation & Timeout Watcher",
        description: "Build language execution adapter with SIGKILL process watchers.",
        estimatedHours: 10,
        deliverable: "Sandboxed Runner Adapter.",
        aiReviewPrompt: "Audit process cleanup on SIGKILL time-limit-exceeded.",
        tasks: [
          { id: "oj-t1", title: "Create LanguageRunner adapter", description: "Spawn compiler and child process with timeout guards", hints: ["Use child_process.spawn with timeout options"], isCompleted: false, learningOutcome: "OS Subprocesses" }
        ]
      }
    ]
  },
  {
    id: "proj-ai-assistant",
    title: "Context-Aware AI Assistant & Knowledge Agent",
    slug: "ai-assistant",
    level: "Advanced",
    trackId: "track-ai",
    trackTitle: "Artificial Intelligence",
    summary: "Architect a retrieval-augmented AI assistant featuring conversation memory, tool calling, and document grounding.",
    overview: "Build a context-aware AI assistant leveraging Gemini API, conversational sliding-window memory, vector similarity search for document retrieval (RAG), and function calling capabilities.",
    bannerImage: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80",
    requirements: [
      "Integrate Gemini 2.5/3.7 API via @google/genai SDK for multi-turn conversations",
      "Implement sliding-window conversation memory with summary compression",
      "Enable Function Calling / Tool Calling for live data lookup (e.g. weather, database search)",
      "Ground responses using document embeddings and vector search (Retrieval-Augmented Generation)"
    ],
    learningGoals: ["LLM API Orchestration & Function Calling", "Prompt Engineering & Guardrails", "Vector Embeddings & RAG"],
    technologies: ["TypeScript / Python", "@google/genai SDK", "Vector DB (PGVector / Memory)", "Express"],
    estimatedHours: 22,
    xpReward: 800,
    architectureDiagramNotes: "User Query -> Conversation Memory -> Vector Search Grounding -> Gemini Model Call -> Tool Execution -> Response",
    evaluationCriteria: [
      { category: "Tool Calling Precision", maxScore: 35, criteria: "Accurately extracts arguments and executes function calls" },
      { category: "Context Retention", maxScore: 35, criteria: "Maintains multi-turn context without exceeding token window limits" },
      { category: "Grounding Accuracy", maxScore: 30, criteria: "Answers cite retrieved documents without hallucination" }
    ],
    milestones: [
      {
        id: "ai-m1",
        order: 1,
        title: "Milestone 1: Gemini SDK Integration & Memory Engine",
        description: "Build multi-turn chat controller with token-window memory.",
        estimatedHours: 8,
        deliverable: "Conversational Agent Service.",
        aiReviewPrompt: "Evaluate memory summarization strategy when chat history exceeds threshold.",
        tasks: [
          { id: "ai-t1", title: "Integrate @google/genai SDK with system prompt", description: "Pass system instructions and chat history array", hints: ["Use GoogleGenAI client"], isCompleted: false, learningOutcome: "LLM Orchestration" }
        ]
      }
    ]
  },
  {
    id: "proj-ecommerce",
    title: "Microservices E-Commerce Platform & Payment Gateway",
    slug: "e-commerce-platform",
    level: "Advanced",
    trackId: "track-fullstack",
    trackTitle: "Full-Stack & Cloud",
    summary: "Architect a high-concurrency online store with product catalog, shopping cart, order queue, and payment Webhooks.",
    overview: "Build an enterprise e-commerce platform with product searching/filtering, persistent shopping cart, checkout order pipeline, Stripe payment gateway Webhook processing, and inventory deduction.",
    bannerImage: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop&q=80",
    requirements: [
      "Product catalog with search, category filtering, price bounds, and pagination",
      "Persistent Shopping Cart with item quantity updates and stock availability checks",
      "Checkout Order Service creating pending orders with unique payment intent tokens",
      "Idempotent Payment Webhook handler processing Stripe events to finalize orders"
    ],
    learningGoals: ["Payment Gateway Security & Webhook Idempotency", "Order Lifecycle State Machines", "Inventory Lock Concurrency"],
    technologies: ["Node.js / Express", "React", "PostgreSQL / Prisma", "Stripe API Webhooks"],
    estimatedHours: 26,
    xpReward: 850,
    architectureDiagramNotes: "React Storefront -> Product API -> Order Service -> Stripe Gateway -> Payment Webhook -> DB Fulfillment",
    evaluationCriteria: [
      { category: "Webhook Idempotency", maxScore: 40, criteria: "Duplicate Webhook deliveries never result in duplicate orders or double charges" },
      { category: "Order State Machine", maxScore: 30, criteria: "Order transitions cleanly from PENDING -> PAID -> SHIPPED -> DELIVERED" },
      { category: "Stock Reservation", maxScore: 30, criteria: "Locks stock during checkout to prevent double-selling limited items" }
    ],
    milestones: [
      {
        id: "ecom-m1",
        order: 1,
        title: "Milestone 1: Order State Machine & Webhook Idempotency",
        description: "Implement checkout flow and Stripe Webhook event receiver.",
        estimatedHours: 10,
        deliverable: "Payment & Order Processing Microservice.",
        aiReviewPrompt: "Audit Webhook secret verification and event id deduplication.",
        tasks: [
          { id: "ecom-t1", title: "Implement Stripe Webhook handler with signature verification", description: "Verify constructEvent and record processed event_id", hints: ["Use raw request body for signature check"], isCompleted: false, learningOutcome: "Payment Security" }
        ]
      }
    ]
  }
];
