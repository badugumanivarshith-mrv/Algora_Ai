# ALGORA Production Backend API Specification

Base URL: `http://localhost:3000/api`

## Authentication Endpoints

### 1. Register User
* **POST** `/auth/register`
* **Request Body**:
  ```json
  {
    "name": "Arjun Sharma",
    "email": "arjun@algora.ai",
    "password": "Password123!",
    "college": "IIT Bombay",
    "targetCompany": "Google"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "user": { "id": "usr_...", "name": "Arjun Sharma", "email": "arjun@algora.ai", "role": "student", "xp": 100, "level": 1 },
      "tokens": {
        "accessToken": "eyJhbGci...",
        "refreshToken": "eyJhbGci..."
      }
    }
  }
  ```

### 2. User Login
* **POST** `/auth/login`
* **Request Body**:
  ```json
  {
    "email": "arjun@algora.ai",
    "password": "Password123!"
  }
  ```
* **Response (200 OK)**: Returns user profile and signed JWT `accessToken` & `refreshToken`.

### 3. Refresh Access Token
* **POST** `/auth/refresh`
* **Request Body**: `{ "refreshToken": "..." }`
* **Response (200 OK)**: Returns fresh `{ "accessToken": "..." }`.

### 4. Password Reset Flow
* **POST** `/auth/password-reset-request`: Accepts `{ "email": "..." }` and issues secure reset token.
* **POST** `/auth/password-reset`: Accepts `{ "resetToken": "...", "newPassword": "..." }`.

---

## Learning & Topic Progression Endpoints

* **GET** `/learning/tracks`: Retrieves all tracks with completion stats.
* **GET** `/learning/tracks/:trackId`: Retrieves track syllabus with ordered topics.
* **GET** `/learning/topics/:topicId`: Retrieves full 8-stage topic data (*Concept, Syntax, Examples, Mistakes, Practice Problems, Assignment, Project, Interview Questions*).
* **POST** `/learning/topics/:topicId/stage`: Enforces stage unlock and awards progression XP.

---

## Problems & Code Evaluation Endpoints

* **GET** `/problems`: Search and filter problems by `topicId`, `difficulty`, `company`, `tag`, and keyword.
* **GET** `/problems/:idOrSlug`: Detailed problem description, starter codes, and constraints.
* **GET** `/problems/:problemId/hints`: Retrieves tiered Socratic hints.
* **POST** `/problems/run`: Runs fast test cases against student code with memory/time telemetry.
* **POST** `/problems/submit`: Official judge evaluation, XP award, and auto-queuing into Daily Review.

---

## Projects Workbench Endpoints

* **GET** `/projects`: Catalog of Beginner, Intermediate, and Advanced real-world projects.
* **GET** `/projects/:projectId`: Milestones, interactive task checklists, and evaluation rubrics.
* **POST** `/projects/:projectId/enroll`: Enrolls student into project workbench.
* **POST** `/projects/:projectId/tasks/toggle`: Toggles milestone task completion.
* **POST** `/projects/:projectId/submit`: Submits repo/demo URLs and generates automated rubric feedback.

---

## AI Mentor & Intelligence Endpoints

* **POST** `/ai/mentor/chat`: Socratic AI Mentor responding in `learn`, `practice`, `project`, or `interview` mode with tiered scaffolding (*Hint → Approach → Algorithm → Pseudocode → Partial Code*).
* **GET** `/ai/analyst/report`: Algorithmic radar analysis, weak topic diagnostics, and decay alerts.

---

## Daily Review (Spaced Repetition) Endpoints

* **GET** `/reviews/queue`: Active recall flashcard queue due today.
* **POST** `/reviews/:reviewId/rate`: Submits SuperMemo-2 quality score (0-5) to adjust interval decay.

---

## Analytics & Faculty Endpoints

* **GET** `/analytics/dashboard`: Student weekly problem accuracy, skill distribution, and streaks.
* **GET** `/analytics/faculty`: Cohort performance, student dropout/risk warnings, topic mastery class averages.
* **GET** `/leaderboard`: Global, weekly, and college leaderboard rankings with rank deltas.
