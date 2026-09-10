# Algora AI - API Specification & Contract Proposal

## 1. Overview & Architecture

The Algora AI API follows modern RESTful conventions, communicating via standard JSON payloads over HTTPS, with Server-Sent Events (SSE) streaming for real-time generative AI features.

### Conventions:
- **Base URL**: `/api/v1`
- **Authentication**: Bearer token (`Authorization: Bearer <session_token>`)
- **Content Type**: `application/json; charset=utf-8`
- **Streaming Content Type**: `text/event-stream`
- **Timestamps**: ISO 8601 UTC strings (`2026-09-10T16:20:00Z`)

---

## 2. API Endpoint Catalog

### 2.1 Workspace & Mind Maps

#### `GET /api/v1/maps`
Lists user's mind maps with optional folder filtering and search.
- **Query Params**: `folderId` (UUID), `search` (string), `limit` (default 20), `offset` (default 0)
- **Response**:
```json
{
  "maps": [
    {
      "id": "map_01j8m49",
      "title": "Cellular Respiration & Krebs Cycle",
      "description": "Comprehensive biological energy synthesis map",
      "folderId": "fld_bio_101",
      "nodeCount": 24,
      "updatedAt": "2026-09-10T14:30:00Z",
      "isPublic": false
    }
  ],
  "total": 1
}
```

#### `POST /api/v1/maps`
Creates a new blank or initialized mind map.
- **Request Body**:
```json
{
  "title": "Quantum Physics Fundamentals",
  "folderId": "fld_phys_201",
  "layoutType": "horizontal_tree"
}
```

#### `GET /api/v1/maps/:mapId`
Retrieves the complete graph payload (nodes and edges) for the canvas editor.
- **Response**:
```json
{
  "map": {
    "id": "map_01j8m49",
    "title": "Cellular Respiration",
    "layoutType": "horizontal_tree",
    "viewport": { "x": 0, "y": 0, "zoom": 1.0 },
    "nodes": [
      {
        "id": "node_root",
        "parentId": null,
        "title": "Cellular Respiration",
        "notesMarkdown": "Metabolic pathway breaking down glucose to produce ATP.",
        "colorToken": "indigo",
        "orderIndex": 0,
        "posX": 400,
        "posY": 300,
        "isCollapsed": false
      },
      {
        "id": "node_glycolysis",
        "parentId": "node_root",
        "title": "Glycolysis",
        "notesMarkdown": "Anaerobic cytoplasmic breakdown of glucose into pyruvate.",
        "colorToken": "emerald",
        "orderIndex": 0,
        "posX": 700,
        "posY": 150,
        "isCollapsed": false
      }
    ],
    "edges": [
      {
        "id": "edge_01",
        "sourceNodeId": "node_root",
        "targetNodeId": "node_glycolysis",
        "label": "Phase 1",
        "lineStyle": "bezier"
      }
    ]
  }
}
```

#### `PUT /api/v1/maps/:mapId`
Autosave endpoint updating graph title, layout, or viewport settings.

#### `POST /api/v1/maps/:mapId/batch-sync`
High-performance debounced endpoint updating modified nodes and positions.
- **Request Body**:
```json
{
  "upsertNodes": [ ... ],
  "deleteNodeIds": [ "node_old_01" ],
  "upsertEdges": [ ... ],
  "deleteEdgeIds": []
}
```

---

### 2.2 AI Generation & Knowledge Synthesis

#### `POST /api/v1/ai/generate-map` (Streaming SSE)
Extracts a structured hierarchical mind map from raw text, document upload, or topic prompt.
- **Request Body**:
```json
{
  "sourceType": "text | document | topic | url",
  "content": "Full lecture transcript or textbook excerpt...",
  "detailLevel": "summary | balanced | comprehensive",
  "targetLanguage": "en"
}
```
- **SSE Stream Output**:
  - `event: status`: `{"stage": "analyzing_text", "progress": 20}`
  - `event: concept`: `{"id": "node_1", "parent": null, "title": "Main Idea"}`
  - `event: concept`: `{"id": "node_2", "parent": "node_1", "title": "Subtopic A"}`
  - `event: complete`: `{"mapId": "map_new_823", "nodeCount": 18}`

#### `POST /api/v1/ai/expand-node`
Generates sub-concepts for an existing canvas node based on its parent branch context.
- **Request Body**:
```json
{
  "mapId": "map_01j8m49",
  "nodeId": "node_glycolysis",
  "requestedCount": 4
}
```
- **Response**:
```json
{
  "newNodes": [
    {
      "id": "node_atp_investment",
      "parentId": "node_glycolysis",
      "title": "Energy Investment Phase",
      "notesMarkdown": "Consumes 2 ATP molecules to phosphorylate glucose.",
      "colorToken": "emerald"
    },
    {
      "id": "node_atp_payoff",
      "parentId": "node_glycolysis",
      "title": "Energy Payoff Phase",
      "notesMarkdown": "Yields 4 ATP (net 2) and 2 NADH molecules.",
      "colorToken": "emerald"
    }
  ]
}
```

#### `POST /api/v1/ai/tutor-chat` (Streaming SSE)
Socratic chat assistant answering queries using current mind map concepts as citations.
- **Request Body**:
```json
{
  "mapId": "map_01j8m49",
  "message": "Why does glycolysis occur in the cytoplasm rather than mitochondria?",
  "activeNodeId": "node_glycolysis"
}
```
- **Response**: Token stream with citation anchors `[node:node_glycolysis]`.

---

### 2.3 Flashcards & Spaced Repetition

#### `POST /api/v1/flashcards/generate-from-map`
Generates a study deck directly from mind map concepts.
- **Request Body**:
```json
{
  "mapId": "map_01j8m49",
  "cardCount": 15
}
```

#### `GET /api/v1/flashcards/decks/:deckId/due`
Retrieves cards scheduled for review today based on SM-2 calculation.

#### `POST /api/v1/flashcards/:cardId/review`
Submits student review rating to update Leitner interval.
- **Request Body**:
```json
{
  "rating": 1 | 2 | 3 | 4, // 1: Again, 2: Hard, 3: Good, 4: Easy
  "durationMs": 4200
}
```
- **Response**:
```json
{
  "cardId": "crd_881",
  "nextDueDate": "2026-09-14",
  "intervalDays": 4,
  "easeFactor": 2.5
}
```

---

### 2.4 Quizzes & Assessments

#### `POST /api/v1/quizzes/generate-from-map`
Generates a 5 to 20 question diagnostic quiz from concept nodes.

#### `POST /api/v1/quizzes/:quizId/submit`
Evaluates student answers, calculates mastery score, and provides AI explanations.
- **Request Body**:
```json
{
  "responses": [
    { "questionId": "q_01", "selectedOptionId": "b" },
    { "questionId": "q_02", "selectedOptionId": "a" }
  ]
}
```
- **Response**:
```json
{
  "score": 80,
  "correctCount": 4,
  "totalQuestions": 5,
  "feedback": [
    {
      "questionId": "q_01",
      "isCorrect": true,
      "explanation": "Correct! Glycolysis yields a net gain of 2 ATP per glucose molecule.",
      "citedNodeId": "node_glycolysis"
    }
  ]
}
```

---

### 2.5 Library & Community Sharing

#### `GET /api/v1/library/search`
- **Query Params**: `query`, `subject`, `level`, `sort` (popular, newest)

#### `POST /api/v1/library/:mapId/clone`
Clones a public community mind map and all its nodes into the active user's workspace.

---

## 3. Standard Error Envelope
All error responses adhere to a uniform structure:
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The specified mind map does not exist or access is restricted.",
    "details": { "mapId": "map_999" }
  }
}
```
- `400 Bad Request`: Schema validation error.
- `401 Unauthorized`: Missing or expired authentication.
- `403 Forbidden`: Insufficient permissions on private map.
- `404 Not Found`: Entity missing.
- `429 Too Many Requests`: Rate limit or AI quota exceeded.
- `500 Internal Server Error`: Unhandled server exception.
