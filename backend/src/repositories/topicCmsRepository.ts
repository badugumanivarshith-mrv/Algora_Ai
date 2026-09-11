import { TopicCMSEntity } from "../types";

const DEFAULT_TOPICS: TopicCMSEntity[] = [
  {
    id: "top-arrays-hashing",
    slug: "arrays-and-hashing",
    title: "Arrays & Hashing",
    language: "Python / C++",
    description: "Core contiguous array memory layouts, hash tables, frequency tracking, amortized O(1) lookups, and set algebra.",
    iconName: "Grid",
    orderIndex: 1,
    prerequisites: ["Basic Programming Syntax"],
    learningObjectives: [
      "Analyze array indexing and cache locality",
      "Understand hash collisions and load factors",
      "Implement frequency maps for string & numeric problems",
      "Apply prefix sums for range query acceleration",
    ],
    isPublished: true,
    problemCount: 18,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "top-two-pointers",
    slug: "two-pointers",
    title: "Two Pointers & Sliding Window",
    language: "Python / C++",
    description: "Converging pointer paradigms, fast/slow runners, dynamic contiguous windows, and monotonic deques.",
    iconName: "MoveHorizontal",
    orderIndex: 2,
    prerequisites: ["Arrays & Hashing"],
    learningObjectives: [
      "Identify monotonicity in sorted arrays",
      "Optimize O(n^2) nested loops to O(n) window contractions",
      "Detect cycles using Floyd's Tortoise and Hare algorithm",
    ],
    isPublished: true,
    problemCount: 14,
    createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "top-dp",
    slug: "dynamic-programming",
    title: "Dynamic Programming",
    language: "Python / C++ / Java",
    description: "Optimal substructure, overlapping subproblems, memoization vs tabulation, state compression, and knapsack variants.",
    iconName: "Layers",
    orderIndex: 3,
    prerequisites: ["Recursion", "Arrays & Hashing"],
    learningObjectives: [
      "Derive state transition relations rigorously",
      "Identify bottom-up vs top-down trade-offs",
      "Compress auxiliary 2D state matrices into O(1) or O(N) rolling arrays",
    ],
    isPublished: true,
    problemCount: 22,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "top-graphs",
    slug: "graph-algorithms",
    title: "Graph Algorithms",
    language: "Python / C++",
    description: "Adjacency representations, BFS, DFS, Dijkstra, Topological Sort, Union-Find, and Minimum Spanning Trees.",
    iconName: "Network",
    orderIndex: 4,
    prerequisites: ["Queues", "Recursion"],
    learningObjectives: [
      "Implement BFS for shortest paths in unweighted graphs",
      "Apply Dijkstra with min-heaps for non-negative weighted graphs",
      "Model real-world dependency chains using Kahn's algorithm",
    ],
    isPublished: true,
    problemCount: 16,
    createdAt: new Date(Date.now() - 22 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "top-binary-search",
    slug: "binary-search",
    title: "Binary Search",
    language: "Python / C++",
    description: "Logarithmic search on monotonic answer spaces, lower/upper bounds, and rotated array invariants.",
    iconName: "Search",
    orderIndex: 5,
    prerequisites: ["Arrays & Hashing"],
    learningObjectives: [
      "Master boundary conditions and middle index overflow prevention",
      "Apply binary search on predicate functions and answer ranges",
    ],
    isPublished: true,
    problemCount: 12,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "top-trees",
    slug: "trees-and-bst",
    title: "Trees & Binary Search Trees",
    language: "Python / Java",
    description: "Hierarchical recursive data structures, DFS traversals, LCA algorithms, balanced AVL / Red-Black trees, and Tries.",
    iconName: "GitFork",
    orderIndex: 6,
    prerequisites: ["Recursion", "Queues"],
    learningObjectives: [
      "Execute pre-order, in-order, and post-order recursive & iterative traversals",
      "Validate BST properties and query subtree bounds",
      "Build Prefix Tries for high-speed string autocompletion",
    ],
    isPublished: true,
    problemCount: 15,
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class TopicCmsRepository {
  private inMemoryTopics: Map<string, TopicCMSEntity> = new Map();

  constructor() {
    DEFAULT_TOPICS.forEach((t) => this.inMemoryTopics.set(t.id, t));
  }

  public async getAll(): Promise<TopicCMSEntity[]> {
    return Array.from(this.inMemoryTopics.values()).sort((a, b) => a.orderIndex - b.orderIndex);
  }

  public async getById(id: string): Promise<TopicCMSEntity | null> {
    return this.inMemoryTopics.get(id) || null;
  }

  public async getBySlug(slug: string): Promise<TopicCMSEntity | null> {
    const list = Array.from(this.inMemoryTopics.values());
    return list.find((t) => t.slug === slug) || null;
  }

  public async create(
    topic: Omit<TopicCMSEntity, "id" | "createdAt" | "updatedAt">
  ): Promise<TopicCMSEntity> {
    const id = `top-${topic.slug || Date.now()}`;
    const now = new Date().toISOString();
    const newTopic: TopicCMSEntity = {
      ...topic,
      id,
      orderIndex: topic.orderIndex || this.inMemoryTopics.size + 1,
      createdAt: now,
      updatedAt: now,
    };

    this.inMemoryTopics.set(id, newTopic);
    return newTopic;
  }

  public async update(id: string, updates: Partial<TopicCMSEntity>): Promise<TopicCMSEntity | null> {
    const existing = this.inMemoryTopics.get(id);
    if (!existing) return null;

    const updated: TopicCMSEntity = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };

    this.inMemoryTopics.set(id, updated);
    return updated;
  }

  public async delete(id: string): Promise<boolean> {
    return this.inMemoryTopics.delete(id);
  }

  public async togglePublish(id: string): Promise<TopicCMSEntity | null> {
    const existing = this.inMemoryTopics.get(id);
    if (!existing) return null;

    existing.isPublished = !existing.isPublished;
    existing.updatedAt = new Date().toISOString();
    this.inMemoryTopics.set(id, existing);
    return existing;
  }

  public async reorder(orderedIds: string[]): Promise<TopicCMSEntity[]> {
    orderedIds.forEach((id, index) => {
      const item = this.inMemoryTopics.get(id);
      if (item) {
        item.orderIndex = index + 1;
        item.updatedAt = new Date().toISOString();
      }
    });

    return this.getAll();
  }
}

export const topicCmsRepository = new TopicCmsRepository();
