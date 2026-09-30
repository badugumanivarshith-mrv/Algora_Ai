# ALGORA Database Schema Documentation

## Relational Entity Architecture (PostgreSQL)

```
+----------------+        +-------------------+        +--------------------+
|     users      | 1----* | user_topic_prog.  | *----1 |       topics       |
+----------------+        +-------------------+        +--------------------+
        | 1                                                       | 1
        |                                                         |
        | *                                                       | *
+----------------+        +-------------------+        +--------------------+
|  submissions   | *----1 |     problems      | 1----* |   problem_hints    |
+----------------+        +-------------------+        +--------------------+
        | 1
        |
        | *
+----------------+        +-------------------+        +--------------------+
|  daily_reviews |        |   user_projects   | *----1 |      projects      |
+----------------+        +-------------------+        +--------------------+
```

### Table Definitions

1. `users`: Stores user identity, bcrypt password hash, role (`student`, `faculty`, `admin`), XP, level, streak, and target company.
2. `refresh_tokens`: Revokable JWT refresh session tokens.
3. `password_reset_tokens`: Time-bounded password reset tokens.
4. `learning_tracks`: Curriculum tracks (`cs-core`, `languages`, `interview-prep`).
5. `topics`: Granular syllabus topics containing concept theory, syntax cheatsheets, interactive code examples, common mistakes, and interview questions.
6. `user_topic_progress`: Tracks student stage completion through the mandatory 8-stage learning workflow.
7. `problems`: Coding problems with difficulty tags, company tags, starter code templates, and test cases.
8. `problem_hints`: Socratic ladder hints tiered by cognitive depth (*Hint → Approach → Algorithm → Pseudocode → Partial Code → Solution*).
9. `submissions`: Judge evaluation history recording language, execution time in ms, memory in MB, and status (`Accepted`, `Wrong Answer`, `TLE`).
10. `projects`: Real-world project definitions categorized into Beginner, Intermediate, and Advanced tiers.
11. `project_milestones`: Project milestone definitions and discrete tasks.
12. `user_projects`: Student project workbench state, completion progress, reflection notes, and rubric scores.
13. `daily_reviews`: SuperMemo-2 (SM-2) spaced repetition queue for active recall flashcards.
14. `ai_conversations` & `ai_messages`: AI Mentor conversation history with topic and mode tags.
15. `user_analytics`: Aggregated skill radar snapshots, weak topic flags, and retention rates.
