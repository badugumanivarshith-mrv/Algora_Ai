import { Database } from "../db/connection";
import {
  ProblemCMSEntity,
  ProblemVersionEntity,
  ProblemDifficulty,
} from "../types";
import { logger } from "../utils/logger";

const INITIAL_PROBLEMS: ProblemCMSEntity[] = [
  {
    id: 1,
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    language: "Python",
    topic: "Arrays & Hashing",
    tags: ["Array", "Hash Table"],
    xpReward: 50,
    acceptance: "49.8%",
    description: "Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.<br/><br/>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.<br/><br/>You can return the answer in any order.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    hints: [
      "A really brute force way would be to search for all possible pairs of numbers but that would be slow. Can you do it in O(n) time?",
      "Can we use extra space? What if we stored each number we have seen so far in a hash table mapping value to index?",
    ],
    starterCodes: {
      Python: "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        seen = {}\n        for i, num in enumerate(nums):\n            diff = target - num\n            if diff in seen:\n                return [seen[diff], i]\n            seen[num] = i\n        return []",
      "C++": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> seen;\n        for (int i = 0; i < nums.size(); i++) {\n            int diff = target - nums[i];\n            if (seen.find(diff) != seen.end()) return {seen[diff], i};\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};",
      Java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int comp = target - nums[i];\n            if (map.containsKey(comp)) return new int[] { map.get(comp), i };\n            map.put(nums[i], i);\n        }\n        return new int[] {};\n    }\n}",
      C: "int* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    *returnSize = 2;\n    int* res = (int*)malloc(2 * sizeof(int));\n    for (int i = 0; i < numsSize; i++) {\n        for (int j = i + 1; j < numsSize; j++) {\n            if (nums[i] + nums[j] == target) {\n                res[0] = i; res[1] = j; return res;\n            }\n        }\n    }\n    return res;\n}",
    },
    solutionCodes: {
      Python: "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        seen = {}\n        for i, num in enumerate(nums):\n            diff = target - num\n            if diff in seen:\n                return [seen[diff], i]\n            seen[num] = i\n        return []",
    },
    testCases: [
      { id: "tc-1", input: "nums = [2,7,11,15], target = 9", expectedOutput: "[0,1]", actualOutput: "[0,1]", passed: true, runtimeMs: 4, memoryMb: 14.8 },
      { id: "tc-2", input: "nums = [3,2,4], target = 6", expectedOutput: "[1,2]", actualOutput: "[1,2]", passed: true, runtimeMs: 3, memoryMb: 14.6 },
    ],
    hiddenTestCases: [
      { id: "tc-h1", input: "nums = [3,3], target = 6", expectedOutput: "[0,1]", isHidden: true },
      { id: "tc-h2", input: "nums = [-1,-2,-3,-4,-5], target = -8", expectedOutput: "[2,4]", isHidden: true },
      { id: "tc-h3", input: "nums = [1000000, 500, 2000000], target = 3000000", expectedOutput: "[0,2]", isHidden: true },
    ],
    status: "published",
    authorId: "usr-arjun-patel",
    authorName: "Arjun Patel",
    viewCount: 1420,
    submissionCount: 890,
    acceptedCount: 443,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    slug: "longest-palindromic-substring",
    title: "Longest Palindromic Substring",
    difficulty: "Medium",
    language: "Python",
    topic: "Dynamic Programming",
    tags: ["String", "Dynamic Programming", "Two Pointers"],
    xpReward: 100,
    acceptance: "32.4%",
    description: "Given a string <code>s</code>, return <em>the longest palindromic substring</em> in <code>s</code>.",
    examples: [
      { input: 's = "babad"', output: '"bab"', explanation: '"aba" is also a valid answer.' },
      { input: 's = "cbbd"', output: '"bb"', explanation: 'The longest palindrome is "bb".' },
    ],
    constraints: ["1 <= s.length <= 1000", "s consist of only digits and English letters."],
    hints: ["Try expanding around each center candidate."],
    starterCodes: {
      Python: "class Solution:\n    def longestPalindrome(self, s: str) -> str:\n        # Write your code here\n        return ''",
      "C++": "class Solution {\npublic:\n    string longestPalindrome(string s) {\n        return \"\";\n    }\n};",
      Java: "class Solution {\n    public String longestPalindrome(String s) {\n        return \"\";\n    }\n}",
      C: "char* longestPalindrome(char* s) {\n    return s;\n}",
    },
    testCases: [
      { id: "tc-1", input: 's = "babad"', expectedOutput: '"bab"', passed: true, runtimeMs: 38, memoryMb: 16.9 },
      { id: "tc-2", input: 's = "cbbd"', expectedOutput: '"bb"', passed: true, runtimeMs: 24, memoryMb: 16.5 },
    ],
    hiddenTestCases: [
      { id: "tc-h1", input: 's = "a"', expectedOutput: '"a"', isHidden: true },
      { id: "tc-h2", input: 's = "ac"', expectedOutput: '"a"', isHidden: true },
    ],
    status: "published",
    authorId: "usr-arjun-patel",
    authorName: "Arjun Patel",
    viewCount: 1120,
    submissionCount: 650,
    acceptedCount: 211,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    slug: "median-of-two-sorted-arrays",
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    language: "Python",
    topic: "Binary Search",
    tags: ["Array", "Binary Search", "Divide and Conquer"],
    xpReward: 200,
    acceptance: "36.8%",
    description: "Given two sorted arrays <code>nums1</code> and <code>nums2</code> of size <code>m</code> and <code>n</code> respectively, return <strong>the median</strong> of the two sorted arrays.<br/><br/>The overall run time complexity should be <code>O(log (m+n))</code>.",
    examples: [
      { input: "nums1 = [1,3], nums2 = [2]", output: "2.00000", explanation: "merged array = [1,2,3] and median is 2." },
      { input: "nums1 = [1,2], nums2 = [3,4]", output: "2.50000", explanation: "merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5." },
    ],
    constraints: ["nums1.length == m", "nums2.length == n", "0 <= m <= 1000", "0 <= n <= 1000", "1 <= m + n <= 2000"],
    hints: ["Binary search on the partition point of the smaller array."],
    starterCodes: {
      Python: "class Solution:\n    def findMedianSortedArrays(self, nums1: list[int], nums2: list[int]) -> float:\n        return 0.0",
      "C++": "class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        return 0.0;\n    }\n};",
      Java: "class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        return 0.0;\n    }\n}",
      C: "double findMedianSortedArrays(int* nums1, int nums1Size, int* nums2, int nums2Size) {\n    return 0.0;\n}",
    },
    testCases: [
      { id: "tc-1", input: "nums1 = [1,3], nums2 = [2]", expectedOutput: "2.00000", passed: true, runtimeMs: 58, memoryMb: 17.8 },
    ],
    hiddenTestCases: [
      { id: "tc-h1", input: "nums1 = [0,0], nums2 = [0,0]", expectedOutput: "0.00000", isHidden: true },
    ],
    status: "published",
    authorId: "usr-arjun-patel",
    authorName: "Arjun Patel",
    viewCount: 940,
    submissionCount: 420,
    acceptedCount: 154,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    slug: "valid-anagram",
    title: "Valid Anagram",
    difficulty: "Easy",
    language: "Python",
    topic: "Arrays & Hashing",
    tags: ["Hash Table", "String", "Sorting"],
    xpReward: 50,
    acceptance: "63.2%",
    description: "Given two strings <code>s</code> and <code>t</code>, return <code>true</code> if <code>t</code> is an anagram of <code>s</code>, and <code>false</code> otherwise.",
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: "true" },
      { input: 's = "rat", t = "car"', output: "false" },
    ],
    constraints: ["1 <= s.length, t.length <= 5 * 10^4", "s and t consist of lowercase English letters."],
    hints: ["Count characters or sort both strings."],
    starterCodes: {
      Python: "class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        return sorted(s) == sorted(t)",
      "C++": "class Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        if (s.size() != t.size()) return false;\n        sort(s.begin(), s.end()); sort(t.begin(), t.end());\n        return s == t;\n    }\n};",
      Java: "class Solution {\n    public boolean isAnagram(String s, String t) {\n        if (s.length() != t.length()) return false;\n        char[] a = s.toCharArray(); char[] b = t.toCharArray();\n        Arrays.sort(a); Arrays.sort(b);\n        return Arrays.equals(a, b);\n    }\n}",
      C: "bool isAnagram(char* s, char* t) {\n    return false;\n}",
    },
    testCases: [
      { id: "tc-1", input: 's = "anagram", t = "nagaram"', expectedOutput: "true", passed: true, runtimeMs: 3, memoryMb: 14.5 },
      { id: "tc-2", input: 's = "rat", t = "car"', expectedOutput: "false", passed: true, runtimeMs: 3, memoryMb: 14.4 },
    ],
    hiddenTestCases: [
      { id: "tc-h1", input: 's = "a", t = "ab"', expectedOutput: "false", isHidden: true },
    ],
    status: "published",
    authorId: "usr-arjun-patel",
    authorName: "Arjun Patel",
    viewCount: 1800,
    submissionCount: 1200,
    acceptedCount: 758,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    slug: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    language: "Python",
    topic: "Dynamic Programming",
    tags: ["Math", "Dynamic Programming", "Memoization"],
    xpReward: 50,
    acceptance: "52.1%",
    description: "You are climbing a staircase. It takes <code>n</code> steps to reach the top.<br/><br/>Each time you can either climb <code>1</code> or <code>2</code> steps. In how many distinct ways can you climb to the top?",
    examples: [
      { input: "n = 2", output: "2", explanation: "1. 1 step + 1 step\n2. 2 steps" },
      { input: "n = 3", output: "3", explanation: "1. 1+1+1\n2. 1+2\n3. 2+1" },
    ],
    constraints: ["1 <= n <= 45"],
    hints: ["To reach step n, you came from n-1 or n-2."],
    starterCodes: {
      Python: "class Solution:\n    def climbStairs(self, n: int) -> int:\n        if n <= 2: return n\n        a, b = 1, 2\n        for _ in range(3, n + 1):\n            a, b = b, a + b\n        return b",
      "C++": "class Solution {\npublic:\n    int climbStairs(int n) {\n        if (n <= 2) return n;\n        int a = 1, b = 2;\n        for (int i = 3; i <= n; i++) {\n            int c = a + b; a = b; b = c;\n        }\n        return b;\n    }\n};",
      Java: "class Solution {\n    public int climbStairs(int n) {\n        if (n <= 2) return n;\n        int a = 1, b = 2;\n        for (int i = 3; i <= n; i++) {\n            int c = a + b; a = b; b = c;\n        }\n        return b;\n    }\n}",
      C: "int climbStairs(int n) {\n    if (n <= 2) return n;\n    int a = 1, b = 2, c = 0;\n    for (int i = 3; i <= n; i++) {\n        c = a + b; a = b; b = c;\n    }\n    return b;\n}",
    },
    testCases: [
      { id: "tc-1", input: "n = 2", expectedOutput: "2", passed: true, runtimeMs: 2, memoryMb: 14.2 },
      { id: "tc-2", input: "n = 3", expectedOutput: "3", passed: true, runtimeMs: 2, memoryMb: 14.1 },
    ],
    hiddenTestCases: [
      { id: "tc-h1", input: "n = 1", expectedOutput: "1", isHidden: true },
      { id: "tc-h2", input: "n = 35", expectedOutput: "14930352", isHidden: true },
    ],
    status: "published",
    authorId: "usr-arjun-patel",
    authorName: "Arjun Patel",
    viewCount: 1540,
    submissionCount: 980,
    acceptedCount: 510,
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 6,
    slug: "network-delay-time",
    title: "Network Delay Time (Dijkstra)",
    difficulty: "Medium",
    language: "Python",
    topic: "Graph Algorithms",
    tags: ["Graph", "Breadth-First Search", "Shortest Path", "Heap"],
    xpReward: 100,
    acceptance: "53.4%",
    description: "You are given a network of <code>n</code> nodes, labeled from <code>1</code> to <code>n</code>. You are also given <code>times</code>, a list of travel times as directed edges <code>times[i] = (ui, vi, wi)</code>, where <code>ui</code> is the source node, <code>vi</code> is the target node, and <code>wi</code> is the time it takes for a signal to travel from source to target.<br/><br/>We will send a signal from a given node <code>k</code>. Return <em>the <strong>minimum time</strong> it takes for all the <code>n</code> nodes to receive the signal</em>. If it is impossible for all the <code>n</code> nodes to receive the signal, return <code>-1</code>.",
    examples: [
      { input: "times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2", output: "2" },
      { input: "times = [[1,2,1]], n = 2, k = 1", output: "1" },
      { input: "times = [[1,2,1]], n = 2, k = 2", output: "-1" },
    ],
    constraints: ["1 <= k <= n <= 100", "1 <= times.length <= 6000", "times[i].length == 3"],
    hints: ["Use Dijkstra's algorithm with a min-heap priority queue."],
    starterCodes: {
      Python: "import heapq\n\nclass Solution:\n    def networkDelayTime(self, times: list[list[int]], n: int, k: int) -> int:\n        graph = {i: [] for i in range(1, n + 1)}\n        for u, v, w in times:\n            graph[u].append((v, w))\n        heap = [(0, k)]\n        dist = {}\n        while heap:\n            d, u = heapq.heappop(heap)\n            if u in dist: continue\n            dist[u] = d\n            for v, w in graph[u]:\n                if v not in dist:\n                    heapq.heappush(heap, (d + w, v))\n        return max(dist.values()) if len(dist) == n else -1",
      "C++": "class Solution {\npublic:\n    int networkDelayTime(vector<vector<int>>& times, int n, int k) {\n        return 0;\n    }\n};",
      Java: "class Solution {\n    public int networkDelayTime(int[][] times, int n, int k) {\n        return 0;\n    }\n}",
      C: "int networkDelayTime(int** times, int timesSize, int* timesColSize, int n, int k) {\n    return 0;\n}",
    },
    testCases: [
      { id: "tc-1", input: "times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2", expectedOutput: "2", passed: true, runtimeMs: 35, memoryMb: 17.5 },
    ],
    hiddenTestCases: [
      { id: "tc-h1", input: "times = [[1,2,1]], n = 2, k = 2", expectedOutput: "-1", isHidden: true },
    ],
    status: "published",
    authorId: "usr-arjun-patel",
    authorName: "Arjun Patel",
    viewCount: 880,
    submissionCount: 460,
    acceptedCount: 245,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class ProblemCmsRepository {
  private inMemoryProblems: Map<number, ProblemCMSEntity> = new Map();
  private inMemoryVersions: Map<string, ProblemVersionEntity[]> = new Map();
  private nextId: number = 7;

  constructor() {
    INITIAL_PROBLEMS.forEach((p) => {
      this.inMemoryProblems.set(p.id, p);
      // seed initial v1 for each
      const v1: ProblemVersionEntity = {
        id: `ver-${p.id}-1`,
        problemId: p.id,
        versionNumber: 1,
        title: p.title,
        slug: p.slug,
        difficulty: p.difficulty,
        description: p.description,
        testCases: p.testCases,
        hiddenTestCases: p.hiddenTestCases,
        starterCodes: p.starterCodes,
        changedBy: p.authorId,
        changerName: p.authorName || "Arjun Patel",
        changeSummary: "Initial problem creation and test case specification",
        createdAt: p.createdAt,
      };
      this.inMemoryVersions.set(String(p.id), [v1]);
    });
  }

  public async getAll(filters?: {
    search?: string;
    difficulty?: ProblemDifficulty;
    topic?: string;
    status?: "draft" | "published" | "archived";
    language?: string;
  }): Promise<ProblemCMSEntity[]> {
    let list = Array.from(this.inMemoryProblems.values());

    if (filters) {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.slug.toLowerCase().includes(q) ||
            p.topic.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      if (filters.difficulty) {
        list = list.filter((p) => p.difficulty === filters.difficulty);
      }
      if (filters.topic) {
        list = list.filter((p) => p.topic.toLowerCase() === filters.topic?.toLowerCase());
      }
      if (filters.status) {
        list = list.filter((p) => p.status === filters.status);
      }
      if (filters.language) {
        list = list.filter((p) => p.language.toLowerCase() === filters.language?.toLowerCase());
      }
    }

    return list.sort((a, b) => a.id - b.id);
  }

  public async getById(id: number): Promise<ProblemCMSEntity | null> {
    return this.inMemoryProblems.get(id) || null;
  }

  public async getBySlug(slug: string): Promise<ProblemCMSEntity | null> {
    const list = Array.from(this.inMemoryProblems.values());
    return list.find((p) => p.slug === slug) || null;
  }

  public async create(
    problemData: Omit<ProblemCMSEntity, "id" | "viewCount" | "submissionCount" | "acceptedCount" | "createdAt" | "updatedAt">,
    creatorId?: string,
    creatorName?: string
  ): Promise<ProblemCMSEntity> {
    const id = this.nextId++;
    const now = new Date().toISOString();

    const newProblem: ProblemCMSEntity = {
      ...problemData,
      id,
      viewCount: 0,
      submissionCount: 0,
      acceptedCount: 0,
      authorId: creatorId || "usr-arjun-patel",
      authorName: creatorName || "Administrator",
      createdAt: now,
      updatedAt: now,
    };

    this.inMemoryProblems.set(id, newProblem);

    // Create v1
    const v1: ProblemVersionEntity = {
      id: `ver-${id}-1`,
      problemId: id,
      versionNumber: 1,
      title: newProblem.title,
      slug: newProblem.slug,
      difficulty: newProblem.difficulty,
      description: newProblem.description,
      testCases: newProblem.testCases,
      hiddenTestCases: newProblem.hiddenTestCases,
      starterCodes: newProblem.starterCodes,
      changedBy: creatorId,
      changerName: creatorName || "Administrator",
      changeSummary: "Initial version created via Admin CMS",
      createdAt: now,
    };

    this.inMemoryVersions.set(String(id), [v1]);
    return newProblem;
  }

  public async update(
    id: number,
    updates: Partial<ProblemCMSEntity>,
    editorId?: string,
    editorName?: string,
    changeSummary?: string
  ): Promise<ProblemCMSEntity | null> {
    const existing = this.inMemoryProblems.get(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updated: ProblemCMSEntity = {
      ...existing,
      ...updates,
      id: existing.id, // cannot change id
      updatedAt: now,
    };

    this.inMemoryProblems.set(id, updated);

    // Save new version
    const existingVersions = this.inMemoryVersions.get(String(id)) || [];
    const nextVer = existingVersions.length + 1;
    const newVersion: ProblemVersionEntity = {
      id: `ver-${id}-${nextVer}`,
      problemId: id,
      versionNumber: nextVer,
      title: updated.title,
      slug: updated.slug,
      difficulty: updated.difficulty,
      description: updated.description,
      testCases: updated.testCases,
      hiddenTestCases: updated.hiddenTestCases,
      starterCodes: updated.starterCodes,
      changedBy: editorId,
      changerName: editorName || "Administrator",
      changeSummary: changeSummary || `Updated fields: ${Object.keys(updates).join(", ")}`,
      createdAt: now,
    };

    existingVersions.unshift(newVersion);
    this.inMemoryVersions.set(String(id), existingVersions);

    return updated;
  }

  public async delete(id: number): Promise<boolean> {
    const exists = this.inMemoryProblems.has(id);
    if (exists) {
      this.inMemoryProblems.delete(id);
      this.inMemoryVersions.delete(String(id));
      return true;
    }
    return false;
  }

  public async togglePublish(id: number): Promise<ProblemCMSEntity | null> {
    const existing = this.inMemoryProblems.get(id);
    if (!existing) return null;

    existing.status = existing.status === "published" ? "draft" : "published";
    existing.updatedAt = new Date().toISOString();
    this.inMemoryProblems.set(id, existing);
    return existing;
  }

  public async getVersions(problemId: number): Promise<ProblemVersionEntity[]> {
    return this.inMemoryVersions.get(String(problemId)) || [];
  }

  public static async findBySlug(slug: string): Promise<ProblemCMSEntity | null> {
    return problemCmsRepository.getBySlug(slug);
  }

  public static async findById(id: number): Promise<ProblemCMSEntity | null> {
    return problemCmsRepository.getById(id);
  }
}

export const problemCmsRepository = new ProblemCmsRepository();
