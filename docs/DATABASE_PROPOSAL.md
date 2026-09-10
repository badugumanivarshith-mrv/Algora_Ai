# Algora AI - Database Architecture & Schema Proposal

## 1. Overview & Technology Evaluation

Algora AI manages hierarchical graph models (Mind Maps with nodes and edges), adaptive spaced repetition schedules (Leitner/SM-2 flashcards), formative assessments (Quizzes), and multimodal ingestion sources.

### Technology Recommendation:
- **Primary Model**: Relational Database with JSONB extensions (PostgreSQL) or Hybrid Document Store (Firestore).
- **Relational Fit**: Strong foreign key referential integrity between users, folders, mind maps, nodes, edges, flashcards, and review logs ensures consistency during node deletions or branch pruning.
- **Document Fit**: Node trees and chat histories can also be stored as nested documents for low-latency full-map retrieval.
- **Hybrid Approach**: Normalized relational tables for entities and review schedules, with JSONB columns for flexible node styling properties and quiz option payloads.

---

## 2. Entity-Relationship Model (ERD)

```
+---------------+        1:N       +----------------+
|     User      | ---------------- |   Workspace /  |
| (Auth/Profile)|                  |     Folder     |
+---------------+                  +----------------+
        |                                  |
        | 1:N                              | 1:N
        v                                  v
+---------------+        1:N       +----------------+
|  StudyReview  | <--------------- |    MindMap     |
|     Logs      |                  | (Graph Header) |
+---------------+                  +----------------+
        ^                                  |
        | 1:N                              | 1:N (Cascading)
+---------------+        1:N               +----------------+
|   Flashcard   | <---------------+        |  MindMapNode   |
| (SM-2 State)  |                 |        | (Concept Data) |
+---------------+                 |        +----------------+
        ^                         |                |
        | 1:N                     |                | 1:N
+---------------+                 |        +----------------+
| FlashcardDeck | <---------------+        |  MindMapEdge   |
+---------------+                          | (Connections)  |
        ^                                  +----------------+
        | 1:N                                      ^
+---------------+                                  |
|  Quiz / Quiz  | ---------------------------------+ (Optional node citation)
|   Questions   |
+---------------+
```

---

## 3. Schema Definitions

### 3.1 `users`
Represents student, teacher, or learner accounts and global learning metrics.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID / VARCHAR(36)` | PRIMARY KEY | Unique user identifier. |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | User email address. |
| `display_name`| `VARCHAR(100)` | NOT NULL | Profile display name. |
| `avatar_url` | `VARCHAR(500)` | NULLABLE | CDN URL for profile avatar image. |
| `role` | `VARCHAR(20)` | NOT NULL, DEFAULT 'student' | `student`, `educator`, `institution_admin`. |
| `current_streak`| `INT` | NOT NULL, DEFAULT 0 | Consecutive days of platform study. |
| `total_points`| `INT` | NOT NULL, DEFAULT 0 | Gamified retention score. |
| `preferences` | `JSONB` | NOT NULL, DEFAULT '{}' | UI settings: theme (dark/light), dyslexiaFont (bool), language. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | DEFAULT NOW() | Record creation timestamp. |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | DEFAULT NOW() | Last update timestamp. |

---

### 3.2 `folders` (Course / Subject taxonomy)
Allows users to categorize mind maps by subject (e.g., Biology, World History, Calculus).

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID / VARCHAR(36)` | PRIMARY KEY | Unique folder identifier. |
| `user_id` | `UUID / VARCHAR(36)` | REFERENCES `users(id)` ON DELETE CASCADE | Owner of the folder. |
| `title` | `VARCHAR(120)` | NOT NULL | Name of the subject or course. |
| `color_hex` | `VARCHAR(7)` | DEFAULT '#6366F1' | Accent color token for sidebar tagging. |
| `icon_name` | `VARCHAR(50)` | DEFAULT 'Folder' | Lucide icon identifier. |
| `parent_id` | `UUID / VARCHAR(36)` | NULLABLE, REFERENCES `folders(id)` | Supports nested sub-folders. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | DEFAULT NOW() | Timestamp. |

---

### 3.3 `mind_maps`
Metadata container representing a single concept map or visual study graph.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID / VARCHAR(36)` | PRIMARY KEY | Unique map identifier. |
| `user_id` | `UUID / VARCHAR(36)` | REFERENCES `users(id)` ON DELETE CASCADE | Author of the mind map. |
| `folder_id` | `UUID / VARCHAR(36)` | NULLABLE, REFERENCES `folders(id)` | Associated subject folder. |
| `title` | `VARCHAR(255)` | NOT NULL | Title of the topic (e.g. "Cellular Respiration"). |
| `description` | `TEXT` | NULLABLE | High-level summary or syllabus context. |
| `layout_type` | `VARCHAR(30)` | DEFAULT 'horizontal_tree' | `horizontal_tree`, `vertical_tree`, `radial`. |
| `is_public` | `BOOLEAN` | DEFAULT FALSE | Whether discoverable in Community Library. |
| `view_count` | `INT` | DEFAULT 0 | Analytics counter. |
| `fork_count` | `INT` | DEFAULT 0 | Number of times cloned by peers. |
| `viewport_meta`| `JSONB` | DEFAULT '{"x": 0, "y": 0, "zoom": 1.0}' | Last saved pan and zoom state. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | DEFAULT NOW() | Creation timestamp. |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | DEFAULT NOW() | Modification timestamp. |

---

### 3.4 `mind_map_nodes`
Individual concept blocks within a mind map.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID / VARCHAR(36)` | PRIMARY KEY | Node identifier. |
| `map_id` | `UUID / VARCHAR(36)` | REFERENCES `mind_maps(id)` ON DELETE CASCADE | Parent map. |
| `parent_id` | `UUID / VARCHAR(36)` | NULLABLE, REFERENCES `mind_map_nodes(id)` | Parent node in hierarchy (NULL if root). |
| `title` | `VARCHAR(255)` | NOT NULL | Short concept title or keyword. |
| `notes_markdown`| `TEXT` | NULLABLE | Extended explanation, bullet points, definitions. |
| `formula_latex`| `TEXT` | NULLABLE | Math/physics LaTeX string (e.g., $E = mc^2$). |
| `color_token` | `VARCHAR(30)` | DEFAULT 'indigo' | Color assigned to branch subtree. |
| `order_index` | `INT` | DEFAULT 0 | Sibling sorting index. |
| `pos_x` | `FLOAT` | NOT NULL, DEFAULT 0.0 | Calculated canvas X coordinate. |
| `pos_y` | `FLOAT` | NOT NULL, DEFAULT 0.0 | Calculated canvas Y coordinate. |
| `is_collapsed`| `BOOLEAN` | DEFAULT FALSE | Whether child branches are folded. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | DEFAULT NOW() | Timestamp. |

---

### 3.5 `mind_map_edges`
Explicit or cross-branch semantic relationships between nodes.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID / VARCHAR(36)` | PRIMARY KEY | Edge identifier. |
| `map_id` | `UUID / VARCHAR(36)` | REFERENCES `mind_maps(id)` ON DELETE CASCADE | Parent map. |
| `source_node_id`| `UUID / VARCHAR(36)`| REFERENCES `mind_map_nodes(id)` | Origin node. |
| `target_node_id`| `UUID / VARCHAR(36)`| REFERENCES `mind_map_nodes(id)` | Destination node. |
| `label` | `VARCHAR(100)` | NULLABLE | Semantic relation (e.g., "causes", "produces"). |
| `line_style` | `VARCHAR(20)` | DEFAULT 'bezier' | `bezier`, `straight`, `orthogonal`. |
| `color` | `VARCHAR(30)` | NULLABLE | Custom path stroke color. |

---

### 3.6 `flashcard_decks` & `flashcards`
Spaced-repetition study units synthesized from maps or created manually.

#### `flashcard_decks`
- `id`: UUID (PK)
- `user_id`: UUID (FK to users)
- `map_id`: UUID (Nullable FK to mind_maps)
- `title`: VARCHAR(255)
- `card_count`: INT (Cached count)
- `last_studied_at`: TIMESTAMP
- `created_at`: TIMESTAMP

#### `flashcards`
- `id`: UUID (PK)
- `deck_id`: UUID (FK to flashcard_decks ON DELETE CASCADE)
- `source_node_id`: UUID (Nullable FK to mind_map_nodes)
- `front_prompt`: TEXT (Question or concept cue)
- `back_solution`: TEXT (Detailed answer and mnemonic)
- `interval_days`: INT (Current SM-2 interval, e.g., 1, 3, 7, 21)
- `repetition_count`: INT (Consecutive successful reviews)
- `ease_factor`: FLOAT (Default 2.5)
- `next_due_date`: DATE (Target review date)
- `status`: VARCHAR(20) (`new`, `learning`, `review`, `mastered`)

---

### 3.7 `quizzes`, `quiz_questions`, & `quiz_attempts`
Formative assessment engine with node-referenced AI explanations.

#### `quizzes`
- `id`: UUID (PK)
- `user_id`: UUID (FK)
- `map_id`: UUID (FK)
- `title`: VARCHAR(255)
- `created_at`: TIMESTAMP

#### `quiz_questions`
- `id`: UUID (PK)
- `quiz_id`: UUID (FK)
- `source_node_id`: UUID (Nullable FK to cite relevant concept)
- `question_text`: TEXT
- `question_type`: VARCHAR(20) (`multiple_choice`, `true_false`, `fill_blank`)
- `options`: JSONB (Array of choices `{ id: "a", text: "..." }`)
- `correct_option_id`: VARCHAR(10)
- `explanation`: TEXT (AI explanation of the answer)

---

### 3.8 `ai_chat_messages`
Contextual tutor dialogues linked to a specific mind map session.

- `id`: UUID (PK)
- `map_id`: UUID (FK to mind_maps)
- `user_id`: UUID (FK to users)
- `sender_role`: VARCHAR(20) (`user`, `assistant`, `system`)
- `message_text`: TEXT
- `cited_node_ids`: JSONB (Array of referenced node IDs)
- `created_at`: TIMESTAMP

---

## 4. Indexing & Optimization Strategy

1. **Foreign Key Indexes**:
   - `CREATE INDEX idx_maps_user ON mind_maps(user_id);`
   - `CREATE INDEX idx_nodes_map ON mind_map_nodes(map_id);`
   - `CREATE INDEX idx_nodes_parent ON mind_map_nodes(parent_id);`
   - `CREATE INDEX idx_edges_map ON mind_map_edges(map_id);`
2. **Spaced Repetition Schedule Index**:
   - `CREATE INDEX idx_cards_due ON flashcards(user_id, next_due_date, status);`
3. **Full-Text Search Index**:
   - `CREATE INDEX idx_library_search ON mind_maps USING gin(to_tsvector('english', title || ' ' || coalesce(description, '')));`
