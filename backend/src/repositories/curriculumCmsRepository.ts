import {
  CurriculumPathEntity,
  CurriculumModuleEntity,
  CurriculumLessonEntity,
} from "../types";

const DEFAULT_PATHS: CurriculumPathEntity[] = [
  {
    id: "path-python-core",
    slug: "python-fundamentals",
    title: "Python Core & Data Structures",
    language: "Python",
    description: "Master Python 3 syntax, list comprehensions, dicts, tuples, OOP, recursion, and core interview patterns.",
    targetRole: "Full Stack Engineer & Python Specialist",
    difficulty: "Beginner to Intermediate",
    estimatedHours: 35,
    iconName: "FileCode",
    orderIndex: 1,
    isPublished: true,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    modules: [
      {
        id: "mod-py-1",
        pathId: "path-python-core",
        title: "Variables, Types & Logic Flow",
        description: "Foundational syntax, reference mechanics, memory model, and conditional execution.",
        orderIndex: 1,
        status: "active",
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        lessons: [
          { id: "les-py-1", moduleId: "mod-py-1", title: "Dynamic typing & memory references", lessonType: "lesson", duration: "10 min", xpReward: 20, orderIndex: 1, createdAt: new Date().toISOString() },
          { id: "les-py-2", moduleId: "mod-py-1", title: "String slices & formatting", lessonType: "example", duration: "8 min", xpReward: 25, orderIndex: 2, createdAt: new Date().toISOString() },
          { id: "les-py-3", moduleId: "mod-py-1", title: "Two Sum — First Step", lessonType: "problem", duration: "15 min", problemSlug: "two-sum", xpReward: 50, orderIndex: 3, createdAt: new Date().toISOString() },
        ],
      },
      {
        id: "mod-py-2",
        pathId: "path-python-core",
        title: "Lists, Sets & Hash Dictionaries",
        description: "High-performance built-in collection operations and amortized analysis.",
        orderIndex: 2,
        status: "active",
        createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
        lessons: [
          { id: "les-py-4", moduleId: "mod-py-2", title: "List comprehension patterns", lessonType: "lesson", duration: "12 min", xpReward: 25, orderIndex: 1, createdAt: new Date().toISOString() },
          { id: "les-py-5", moduleId: "mod-py-2", title: "Valid Anagram implementation", lessonType: "problem", duration: "15 min", problemSlug: "valid-anagram", xpReward: 50, orderIndex: 2, createdAt: new Date().toISOString() },
        ],
      },
      {
        id: "mod-py-3",
        pathId: "path-python-core",
        title: "Recursion & Dynamic Programming",
        description: "Mastering recursion trees, memoization caching, and state transitions.",
        orderIndex: 3,
        status: "active",
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
        lessons: [
          { id: "les-py-6", moduleId: "mod-py-3", title: "Memoization vs Tabulation", lessonType: "lesson", duration: "20 min", xpReward: 30, orderIndex: 1, createdAt: new Date().toISOString() },
          { id: "les-py-7", moduleId: "mod-py-3", title: "Longest Palindromic Substring", lessonType: "problem", duration: "30 min", problemSlug: "longest-palindromic-substring", xpReward: 100, orderIndex: 2, createdAt: new Date().toISOString() },
          { id: "les-py-8", moduleId: "mod-py-3", title: "DP Quiz & Complexity Assessment", lessonType: "quiz", duration: "15 min", xpReward: 40, orderIndex: 3, createdAt: new Date().toISOString() },
        ],
      },
    ],
  },
  {
    id: "path-cpp-mastery",
    slug: "cpp-stl-algorithms",
    title: "C++ Modern & STL Systems",
    language: "C++",
    description: "Pointers, memory management, STL containers, iterators, templates, and high-performance competitive programming.",
    targetRole: "Systems & High Frequency Trading Engineer",
    difficulty: "Intermediate to Advanced",
    estimatedHours: 45,
    iconName: "Cpu",
    orderIndex: 2,
    isPublished: true,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    modules: [
      {
        id: "mod-cpp-1",
        pathId: "path-cpp-mastery",
        title: "STL Containers & Memory Invariants",
        description: "Vectors, deques, unordered_map hashes, and cache line friendly layouts.",
        orderIndex: 1,
        status: "active",
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        lessons: [
          { id: "les-cpp-1", moduleId: "mod-cpp-1", title: "Vector amortized doubling", lessonType: "lesson", duration: "15 min", xpReward: 25, orderIndex: 1, createdAt: new Date().toISOString() },
          { id: "les-cpp-2", moduleId: "mod-cpp-1", title: "Median of Two Sorted Arrays", lessonType: "problem", duration: "35 min", problemSlug: "median-of-two-sorted-arrays", xpReward: 200, orderIndex: 2, createdAt: new Date().toISOString() },
        ],
      },
    ],
  },
];

export class CurriculumCmsRepository {
  private inMemoryPaths: Map<string, CurriculumPathEntity> = new Map();

  constructor() {
    DEFAULT_PATHS.forEach((p) => this.inMemoryPaths.set(p.id, p));
  }

  public async getAllPaths(): Promise<CurriculumPathEntity[]> {
    return Array.from(this.inMemoryPaths.values()).sort((a, b) => a.orderIndex - b.orderIndex);
  }

  public async getPathById(id: string): Promise<CurriculumPathEntity | null> {
    return this.inMemoryPaths.get(id) || null;
  }

  public async getPathBySlug(slug: string): Promise<CurriculumPathEntity | null> {
    const list = Array.from(this.inMemoryPaths.values());
    return list.find((p) => p.slug === slug) || null;
  }

  public async createPath(
    pathData: Omit<CurriculumPathEntity, "id" | "createdAt" | "updatedAt">
  ): Promise<CurriculumPathEntity> {
    const id = `path-${pathData.slug || Date.now()}`;
    const now = new Date().toISOString();
    const newPath: CurriculumPathEntity = {
      ...pathData,
      id,
      orderIndex: pathData.orderIndex || this.inMemoryPaths.size + 1,
      modules: pathData.modules || [],
      createdAt: now,
      updatedAt: now,
    };

    this.inMemoryPaths.set(id, newPath);
    return newPath;
  }

  public async updatePath(
    id: string,
    updates: Partial<CurriculumPathEntity>
  ): Promise<CurriculumPathEntity | null> {
    const existing = this.inMemoryPaths.get(id);
    if (!existing) return null;

    const updated: CurriculumPathEntity = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };

    this.inMemoryPaths.set(id, updated);
    return updated;
  }

  public async deletePath(id: string): Promise<boolean> {
    return this.inMemoryPaths.delete(id);
  }

  public async togglePublishPath(id: string): Promise<CurriculumPathEntity | null> {
    const existing = this.inMemoryPaths.get(id);
    if (!existing) return null;

    existing.isPublished = !existing.isPublished;
    existing.updatedAt = new Date().toISOString();
    this.inMemoryPaths.set(id, existing);
    return existing;
  }

  public async addModule(
    pathId: string,
    moduleData: Omit<CurriculumModuleEntity, "id" | "pathId" | "createdAt">
  ): Promise<CurriculumModuleEntity | null> {
    const path = this.inMemoryPaths.get(pathId);
    if (!path) return null;

    const modId = `mod-${Date.now()}`;
    const newMod: CurriculumModuleEntity = {
      ...moduleData,
      id: modId,
      pathId,
      orderIndex: moduleData.orderIndex || (path.modules?.length || 0) + 1,
      lessons: moduleData.lessons || [],
      createdAt: new Date().toISOString(),
    };

    if (!path.modules) path.modules = [];
    path.modules.push(newMod);
    path.updatedAt = new Date().toISOString();
    return newMod;
  }

  public async addLesson(
    pathId: string,
    moduleId: string,
    lessonData: Omit<CurriculumLessonEntity, "id" | "moduleId" | "createdAt">
  ): Promise<CurriculumLessonEntity | null> {
    const path = this.inMemoryPaths.get(pathId);
    if (!path || !path.modules) return null;

    const mod = path.modules.find((m) => m.id === moduleId);
    if (!mod) return null;

    const lesId = `les-${Date.now()}`;
    const newLesson: CurriculumLessonEntity = {
      ...lessonData,
      id: lesId,
      moduleId,
      orderIndex: lessonData.orderIndex || (mod.lessons?.length || 0) + 1,
      createdAt: new Date().toISOString(),
    };

    if (!mod.lessons) mod.lessons = [];
    mod.lessons.push(newLesson);
    path.updatedAt = new Date().toISOString();
    return newLesson;
  }
}

export const curriculumCmsRepository = new CurriculumCmsRepository();
