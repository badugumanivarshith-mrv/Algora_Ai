import type { CurriculumTopic, LearningPath, SupportedLanguage } from "../types";

export const CURRICULUM_TOPICS: CurriculumTopic[] = [
  {
    id: "py-basics",
    slug: "python-fundamentals",
    title: "Python Core & Data Structures",
    language: "Python",
    description: "Master Python syntax, list comprehensions, dicts, tuples, OOP, and standard algorithms.",
    iconName: "FileCode",
    totalProblems: 45,
    completedProblems: 32,
    progress: 71,
    difficultyBreakdown: {
      easy: 20,
      medium: 18,
      hard: 7,
    },
    modules: [
      {
        id: "py-m1",
        title: "Variables, Types & Logic Flow",
        status: "completed",
        progress: 100,
        lessons: [
          { id: "py-l1", title: "Dynamic typing & memory references", type: "lesson", duration: "10 min", status: "completed", xp: 20 },
          { id: "py-l2", title: "String slices & formatting", type: "example", duration: "8 min", status: "completed", xp: 25 },
          { id: "py-l3", title: "Two Sum — First Step", type: "problem", duration: "15 min", status: "completed", problemSlug: "two-sum", xp: 50 },
        ],
      },
      {
        id: "py-m2",
        title: "Lists, Sets & Hash Dictionaries",
        status: "completed",
        progress: 100,
        lessons: [
          { id: "py-l4", title: "List comprehension patterns", type: "lesson", duration: "12 min", status: "completed", xp: 25 },
          { id: "py-l5", title: "Valid Anagram implementation", type: "problem", duration: "15 min", status: "completed", problemSlug: "valid-anagram", xp: 50 },
        ],
      },
      {
        id: "py-m3",
        title: "Recursion & Dynamic Programming",
        status: "active",
        progress: 45,
        lessons: [
          { id: "py-l6", title: "Memoization vs Tabulation", type: "lesson", duration: "20 min", status: "completed", xp: 30 },
          { id: "py-l7", title: "Longest Palindromic Substring", type: "problem", duration: "30 min", status: "active", problemSlug: "longest-palindromic-substring", xp: 100 },
          { id: "py-l8", title: "DP Quiz & Complexity Assessment", type: "quiz", duration: "15 min", status: "locked", xp: 40 },
        ],
      },
    ],
  },
  {
    id: "cpp-mastery",
    slug: "cpp-stl-algorithms",
    title: "C++ Modern & STL Systems",
    language: "C++",
    description: "Pointers, memory management, STL containers, iterators, templates, and high-performance competitive programming.",
    iconName: "Cpu",
    totalProblems: 60,
    completedProblems: 28,
    progress: 46,
    difficultyBreakdown: {
      easy: 15,
      medium: 30,
      hard: 15,
    },
    modules: [
      {
        id: "cpp-m1",
        title: "Pointers, References & RAII",
        status: "completed",
        progress: 100,
        lessons: [
          { id: "cpp-l1", title: "Raw vs Smart Pointers (std::unique_ptr)", type: "lesson", duration: "18 min", status: "completed", xp: 30 },
          { id: "cpp-l2", title: "Move Semantics & Rvalue References", type: "example", duration: "15 min", status: "completed", xp: 35 },
        ],
      },
      {
        id: "cpp-m2",
        title: "STL Containers & Priority Queues",
        status: "active",
        progress: 50,
        lessons: [
          { id: "cpp-l3", title: "std::priority_queue and custom comparators", type: "lesson", duration: "14 min", status: "completed", xp: 25 },
          { id: "cpp-l4", title: "Merge k Sorted Lists", type: "problem", duration: "35 min", status: "active", problemSlug: "merge-k-sorted-lists", xp: 200 },
        ],
      },
    ],
  },
  {
    id: "java-dsa",
    slug: "java-enterprise-dsa",
    title: "Java Object-Oriented DSA",
    language: "Java",
    description: "Generics, Collections framework, Binary Trees, Graph traversals, Concurrency, and technical interview design.",
    iconName: "Code2",
    totalProblems: 50,
    completedProblems: 19,
    progress: 38,
    difficultyBreakdown: {
      easy: 18,
      medium: 22,
      hard: 10,
    },
    modules: [
      {
        id: "java-m1",
        title: "OOP Design & Java Collections",
        status: "completed",
        progress: 100,
        lessons: [
          { id: "java-l1", title: "HashMap internal structure & collisions", type: "lesson", duration: "15 min", status: "completed", xp: 25 },
        ],
      },
      {
        id: "java-m2",
        title: "Trees, Graphs & Recursive DFS",
        status: "active",
        progress: 30,
        lessons: [
          { id: "java-l2", title: "Binary Tree DFS vs BFS traversal", type: "lesson", duration: "18 min", status: "completed", xp: 30 },
          { id: "java-l3", title: "Binary Tree Maximum Path Sum", type: "problem", duration: "40 min", status: "active", problemSlug: "binary-tree-maximum-path-sum", xp: 200 },
        ],
      },
    ],
  },
  {
    id: "c-systems",
    slug: "c-systems-programming",
    title: "C Low-Level & Data Structures",
    language: "C",
    description: "Manual memory allocation (malloc/free), structs, bit manipulation, linked lists, and hardware architecture.",
    iconName: "Terminal",
    totalProblems: 35,
    completedProblems: 22,
    progress: 62,
    difficultyBreakdown: {
      easy: 15,
      medium: 12,
      hard: 8,
    },
    modules: [
      {
        id: "c-m1",
        title: "Memory Layout & Pointers",
        status: "completed",
        progress: 100,
        lessons: [
          { id: "c-l1", title: "Stack vs Heap memory in C", type: "lesson", duration: "12 min", status: "completed", xp: 20 },
          { id: "c-l2", title: "Reverse Linked List pointer manipulation", type: "problem", duration: "20 min", status: "completed", problemSlug: "reverse-linked-list", xp: 50 },
        ],
      },
    ],
  },
];

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "dsa-interview",
    title: "Data Structures & Algorithms Mastery",
    description: "The complete technical interview roadmap with 150+ curated algorithm patterns.",
    color: "var(--blue)",
    totalModules: 14,
    completedModules: 7,
    progress: 50,
    topics: CURRICULUM_TOPICS,
  },
  {
    id: "competitive-prog",
    title: "Competitive Programming & Contest Prep",
    description: "Advanced graph theory, segment trees, number theory, and contest speed drills.",
    color: "var(--violet)",
    totalModules: 10,
    completedModules: 3,
    progress: 30,
    topics: [CURRICULUM_TOPICS[1]],
  },
  {
    id: "systems-foundations",
    title: "Systems Programming & Memory",
    description: "Understand hardware-close code, memory caches, pointers, and concurrency.",
    color: "var(--cyan)",
    totalModules: 8,
    completedModules: 5,
    progress: 62,
    topics: [CURRICULUM_TOPICS[3]],
  },
];
