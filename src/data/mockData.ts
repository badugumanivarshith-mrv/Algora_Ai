import { LearningTrack } from '../types/learn';
import { Problem } from '../types/problem';
import { Project } from '../types/project';
import { Flashcard } from '../types/review';
import { CompanyTrack } from '../types/career';
import { Badge, LeaderboardEntry } from '../types/gamification';
import { User } from '../types/auth';

export const INITIAL_USER: User = {
  id: 'usr_algora_demo',
  name: 'Mani Varshith',
  email: 'badugumanivarshith@gmail.com',
  role: 'student',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'Aspiring Software Development Engineer aiming for Tier-1 Tech companies. Mastering Data Structures, Systems, and Clean Code.',
  targetCompany: 'Google',
  targetRole: 'Software Engineer (SDE I)',
  preferredLanguage: 'python',
  dailyGoalMinutes: 45,
  streak: 12,
  longestStreak: 24,
  lastActiveDate: new Date().toISOString(),
  xp: 3450,
  level: 5,
  createdAt: '2026-08-15T00:00:00Z',
};

export const INITIAL_TRACKS: LearningTrack[] = [
  {
    id: 'track-python',
    slug: 'python-mastery',
    title: 'Python Programming',
    category: 'language',
    language: 'python',
    icon: 'Terminal',
    description: 'Master modern Python 3 from core syntax and OOP to generators, decorators, and high-performance algorithms.',
    difficulty: 'Beginner',
    totalTopics: 12,
    completedTopics: 8,
    estimatedHours: 35,
    bannerGradient: 'from-blue-600 to-emerald-600',
    topics: [
      {
        id: 'py-01',
        trackId: 'track-python',
        title: 'Variables, Data Types & Memory References',
        slug: 'variables-data-types',
        order: 1,
        summary: 'Understand mutable vs immutable types, variable binding, and Python memory management.',
        prerequisiteTopicIds: [],
        masteryPercentage: 95,
        estimatedMinutes: 25,
        conceptNotes: `### Core Concept
In Python, variables are not memory containers with fixed types; they are **named pointers (labels)** pointing to objects in memory.

#### Immutable vs Mutable Types
- **Immutable**: \`int\`, \`float\`, \`str\`, \`tuple\`, \`frozenset\`. Modifying them creates a new object.
- **Mutable**: \`list\`, \`dict\`, \`set\`, custom class instances. In-place modifications change the object itself.

\`\`\`python
# Variable reference demonstration
a = [1, 2, 3]
b = a
b.append(4)
print(a) # Output: [1, 2, 3, 4] -> because 'a' and 'b' point to the exact same memory id!
\`\`\`
`,
        syntaxBreakdown: [
          {
            language: 'Python',
            code: 'x = 42\nname: str = "Algora"\nis_active: bool = True',
            explanation: 'Type hints in modern Python provide static analysis safety without runtime enforcement overhead.'
          }
        ],
        interactiveExamples: [
          {
            title: 'Shallow vs Deep Copying',
            language: 'python',
            code: `import copy
original = [[1, 2], [3, 4]]
shallow = list(original)
deep = copy.deepcopy(original)

original[0][0] = 99
print("Shallow:", shallow) # Modified nested list
print("Deep:", deep)       # Fully independent`,
            explanation: 'Shallow copy copies references of nested items; deep copy recursively duplicates every object graph.',
            output: 'Shallow: [[99, 2], [3, 4]]\nDeep: [[1, 2], [3, 4]]'
          }
        ],
        commonMistakes: [
          {
            title: 'Mutable Default Arguments in Functions',
            badCode: 'def append_to(item, target_list=[]):\n    target_list.append(item)\n    return target_list',
            goodCode: 'def append_to(item, target_list=None):\n    if target_list is None:\n        target_list = []\n    target_list.append(item)\n    return target_list',
            explanation: 'Default arguments in Python are evaluated once at function definition time, NOT at every invocation.'
          }
        ],
        assignment: {
          id: 'asg-py-01',
          title: 'Deep Matrix Identity Validator',
          instructions: 'Implement a function `verify_matrix_isolation(matrix)` that takes a 2D list, creates an isolated deep copy, increments each element by 1, and verifies the original remains unaffected.',
          starterCode: 'def verify_matrix_isolation(matrix):\n    # TODO: Write your code here\n    pass',
          solutionPattern: 'deepcopy',
          testCases: [
            { input: '[[1, 2], [3, 4]]', expected: 'True' }
          ]
        },
        interviewQuestions: [
          {
            question: 'How does Python garbage collection work under the hood?',
            type: 'conceptual',
            expectedAnswer: 'Python primarily uses Reference Counting. When an object reference count drops to zero, its memory is deallocated immediately. To resolve cyclic references (e.g. A refs B and B refs A), Python runs a cyclic garbage collector using generational heuristic stages (Generation 0, 1, 2).',
            companyTags: ['Google', 'Meta', 'Amazon']
          }
        ],
        relatedProblemIds: ['prob-two-sum', 'prob-valid-anagram'],
        relatedProjectIds: ['proj-calc', 'proj-quiz']
      },
      {
        id: 'py-02',
        trackId: 'track-python',
        title: 'Lists, Slicing & Comprehensions',
        slug: 'lists-slicing-comprehensions',
        order: 2,
        summary: 'High performance list operations, step slicing, and clean declarative comprehensions.',
        prerequisiteTopicIds: ['py-01'],
        masteryPercentage: 88,
        estimatedMinutes: 30,
        conceptNotes: `### Lists & Slice Mechanics
Python list slicing syntax is \`sequence[start:stop:step]\`.
- Time complexity of list index access: \`O(1)\`
- Time complexity of slice copy: \`O(k)\` where \`k\` is slice length.
- List comprehensions execute in C-speed bytecode loops, noticeably faster than standard \`.append()\` in \`for\` loops.
`,
        syntaxBreakdown: [
          {
            language: 'Python',
            code: 'squared_evens = [x**2 for x in nums if x % 2 == 0]',
            explanation: 'Filters and transforms elements in a single readable, optimized expression.'
          }
        ],
        interactiveExamples: [
          {
            title: 'Palindromic String via Step Slicing',
            language: 'python',
            code: `s = "racecar"
is_palindrome = (s == s[::-1])
print(f"Is '{s}' a palindrome?", is_palindrome)`,
            explanation: '`[::-1]` creates a reversed copy with a negative step of 1.',
            output: "Is 'racecar' a palindrome? True"
          }
        ],
        commonMistakes: [
          {
            title: 'Modifying a List While Iterating Over It',
            badCode: 'for x in nums:\n    if x < 0:\n        nums.remove(x) # Skips elements!',
            goodCode: 'nums = [x for x in nums if x >= 0]',
            explanation: 'Mutating the list during iteration alters internal index pointers, causing missed elements.'
          }
        ],
        assignment: {
          id: 'asg-py-02',
          title: 'Matrix Transpose Comprehension',
          instructions: 'Write a single-line nested list comprehension to transpose a matrix of size N x M into M x N.',
          starterCode: 'def transpose(matrix):\n    # TODO\n    return []',
          solutionPattern: '[[row[i] for row in matrix] for i in range(len(matrix[0]))]',
          testCases: [
            { input: '[[1, 2, 3], [4, 5, 6]]', expected: '[[1, 4], [2, 5], [3, 6]]' }
          ]
        },
        interviewQuestions: [
          {
            question: 'What is the time complexity difference between `list.pop(0)` and `collections.deque.popleft()`?',
            type: 'complexity',
            expectedAnswer: '`list.pop(0)` takes O(N) time because all remaining elements must shift left in contiguous array memory. `collections.deque.popleft()` takes O(1) time because deque is implemented as a doubly linked list of fixed-size blocks.',
            companyTags: ['Amazon', 'Microsoft', 'Bloomberg']
          }
        ],
        relatedProblemIds: ['prob-contains-duplicate', 'prob-best-time-stock'],
        relatedProjectIds: ['proj-expense']
      },
      {
        id: 'py-03',
        trackId: 'track-python',
        title: 'Dictionaries, Hash Maps & Set Theory',
        slug: 'dicts-hashmaps-sets',
        order: 3,
        summary: 'Hash collisions, open addressing, constant time lookups, and dictionary internals.',
        prerequisiteTopicIds: ['py-02'],
        masteryPercentage: 75,
        estimatedMinutes: 35,
        conceptNotes: `### Hash Tables in Python
Python dictionaries and sets are implemented with compact hash tables using perturbation collision resolution.
- Key requirements: Keys must be **hashable** (must implement \`__hash__\` and \`__eq__\`).
- Average lookup/insert: \`O(1)\`. Worst case: \`O(N)\` when hash collisions degenerate.
`,
        syntaxBreakdown: [
          {
            language: 'Python',
            code: 'from collections import defaultdict, Counter\nfreq = Counter("banana")\nlookup = defaultdict(list)',
            explanation: 'Standard library utilities streamline frequency counting and graph adjacency lists.'
          }
        ],
        interactiveExamples: [
          {
            title: 'Frequency Counter Counting Anagrams',
            language: 'python',
            code: `from collections import Counter
word1 = "listen"
word2 = "silent"
print(Counter(word1) == Counter(word2))`,
            explanation: 'Counters compare key-value element multiplicities in O(N) time.',
            output: 'True'
          }
        ],
        commonMistakes: [
          {
            title: 'Using Mutable Types as Dict Keys',
            badCode: 'd = {}\nd[[1, 2]] = "Coordinates" # TypeError: unhashable type: list',
            goodCode: 'd = {}\nd[(1, 2)] = "Coordinates" # Tuples are immutable and hashable!',
            explanation: 'Lists can mutate, invalidating their hash value and corrupting hash table buckets.'
          }
        ],
        assignment: {
          id: 'asg-py-03',
          title: 'Top K Frequent Elements',
          instructions: 'Implement `top_k_frequent(nums, k)` returning the k most frequent numbers.',
          starterCode: 'def top_k_frequent(nums, k):\n    pass',
          solutionPattern: 'Counter(nums).most_common(k)',
          testCases: [
            { input: '[1,1,1,2,2,3], 2', expected: '[1, 2]' }
          ]
        },
        interviewQuestions: [
          {
            question: 'How did Python 3.7+ guarantee dictionary insertion order preservation with 30% less memory?',
            type: 'conceptual',
            expectedAnswer: 'Python split the hash table into two arrays: a sparse indices table mapping hash buckets to dense entries array `[hash, key, value]`. Keys are appended in order into the dense array, making iteration ordered and memory compact.',
            companyTags: ['Google', 'Oracle']
          }
        ],
        relatedProblemIds: ['prob-two-sum', 'prob-group-anagrams'],
        relatedProjectIds: ['proj-student-mgmt']
      }
    ]
  },
  {
    id: 'track-dsa',
    slug: 'data-structures-algorithms',
    title: 'Data Structures & Algorithms',
    category: 'cs_core',
    icon: 'Binary',
    description: 'Master Big-O analysis, Two Pointers, Trees, Graphs, Dynamic Programming, and Greedy Algorithms.',
    difficulty: 'Intermediate',
    totalTopics: 18,
    completedTopics: 10,
    estimatedHours: 50,
    bannerGradient: 'from-violet-600 to-indigo-700',
    topics: [
      {
        id: 'dsa-01',
        trackId: 'track-dsa',
        title: 'Two Pointers & Sliding Window Patterns',
        slug: 'two-pointers-sliding-window',
        order: 1,
        summary: 'Reduce quadratic O(N²) nested loops to linear O(N) operations using dual pointer coordinates.',
        prerequisiteTopicIds: [],
        masteryPercentage: 92,
        estimatedMinutes: 40,
        conceptNotes: `### The Two Pointer Pattern
Used heavily on sorted arrays, linked lists, and subarray optimization problems.
1. **Opposite Ends**: \`left = 0\`, \`right = len(arr) - 1\` (e.g. Two Sum Sorted, Container With Most Water).
2. **Fast & Slow**: \`slow\`, \`fast\` (e.g. Floyd's Cycle Detection, Remove Duplicates).
3. **Sliding Window**: Expand \`right\` to satisfy constraint, shrink \`left\` to minimize/restore valid state.
`,
        syntaxBreakdown: [
          {
            language: 'Python',
            code: 'left, right = 0, len(nums) - 1\nwhile left < right:\n    curr = nums[left] + nums[right]\n    if curr == target: return [left, right]\n    elif curr < target: left += 1\n    else: right -= 1',
            explanation: 'Linear time search on monotonic sorted arrays.'
          }
        ],
        interactiveExamples: [
          {
            title: 'Container With Most Water',
            language: 'python',
            code: `heights = [1, 8, 6, 2, 5, 4, 8, 3, 7]
l, r = 0, len(heights) - 1
max_area = 0
while l < r:
    h = min(heights[l], heights[r])
    max_area = max(max_area, h * (r - l))
    if heights[l] < heights[r]:
        l += 1
    else:
        r -= 1
print("Max Water Trapped:", max_area)`,
            explanation: 'Greedily move the pointer with the smaller height to search for potential taller boundaries.',
            output: 'Max Water Trapped: 49'
          }
        ],
        commonMistakes: [
          {
            title: 'Wrong Window Shrink Condition',
            badCode: 'while window_len > k:\n    # Shrinking unconditionally without updating window state counts',
            goodCode: 'while window_sum > target:\n    window_sum -= nums[left]\n    left += 1',
            explanation: 'Always update frequency maps / accumulated sums BEFORE moving the left pointer.'
          }
        ],
        assignment: {
          id: 'asg-dsa-01',
          title: 'Minimum Size Subarray Sum',
          instructions: 'Given an array of positive integers and a target sum, return the minimal length of a contiguous subarray whose sum is greater than or equal to target.',
          starterCode: 'def min_sub_array_len(target, nums):\n    pass',
          solutionPattern: 'sliding_window',
          testCases: [
            { input: '7, [2,3,1,2,4,3]', expected: '2' }
          ]
        },
        interviewQuestions: [
          {
            question: 'When should you choose Sliding Window over a Hash Map for subarray problems?',
            type: 'conceptual',
            expectedAnswer: 'When the array contains strictly non-negative numbers where expanding the window is strictly monotonic (increasing sum). If negative numbers exist, monotonic properties break, requiring Prefix Sum + Hash Map (O(N) space) instead of Sliding Window (O(1) space).',
            companyTags: ['Amazon', 'Google', 'Adobe']
          }
        ],
        relatedProblemIds: ['prob-two-sum-sorted', 'prob-max-water', 'prob-longest-substr'],
        relatedProjectIds: ['proj-online-judge']
      },
      {
        id: 'dsa-02',
        trackId: 'track-dsa',
        title: 'Binary Search & Monotonic Predicates',
        slug: 'binary-search-predicates',
        order: 2,
        summary: 'Mastering exact match, lower bound, upper bound, and Binary Search on the Answer Space.',
        prerequisiteTopicIds: ['dsa-01'],
        masteryPercentage: 84,
        estimatedMinutes: 45,
        conceptNotes: `### Beyond Array Searching
Binary search applies whenever a problem exhibits a monotonic Boolean predicate: \`F, F, F, ..., T, T, T\`.
- Range: \`[low, high]\`
- Mid Calculation: \`mid = low + (high - low) // 2\` (prevents 32-bit integer overflow).
- Invariant Preservation: Always maintain boundaries so the answer remains within \`[low, high]\`.
`,
        syntaxBreakdown: [
          {
            language: 'Python',
            code: 'while low <= high:\n    mid = low + (high - low) // 2\n    if is_feasible(mid):\n        ans = mid\n        high = mid - 1 # Search for smaller valid answer\n    else:\n        low = mid + 1',
            explanation: 'Binary Search on the Answer Space (Minimize Maximum).'
          }
        ],
        interactiveExamples: [
          {
            title: 'Koko Eating Bananas Simulation',
            language: 'python',
            code: `import math
piles = [3, 6, 7, 11]
h = 8

def hours_needed(speed):
    return sum(math.ceil(p / speed) for p in piles)

low, high = 1, max(piles)
best_speed = high
while low <= high:
    mid = (low + high) // 2
    if hours_needed(mid) <= h:
        best_speed = mid
        high = mid - 1
    else:
        low = mid + 1

print("Optimal Speed k:", best_speed)`,
            explanation: 'Monotonic function: faster speed strictly decreases or maintains total hours required.',
            output: 'Optimal Speed k: 4'
          }
        ],
        commonMistakes: [
          {
            title: 'Infinite Loop off-by-one errors',
            badCode: 'while low < high:\n    mid = (low + high) // 2\n    if valid(mid): low = mid # Can stall when low == high - 1',
            goodCode: 'mid = (low + high + 1) // 2 # Ceil mid when moving low to mid',
            explanation: 'When assigning `low = mid`, integer floor division can create an infinite loop.'
          }
        ],
        assignment: {
          id: 'asg-dsa-02',
          title: 'Search in Rotated Sorted Array',
          instructions: 'Search for target in an array rotated at some pivot in O(log N) time.',
          starterCode: 'def search_rotated(nums, target):\n    pass',
          solutionPattern: 'binary_search_rotated',
          testCases: [
            { input: '[4,5,6,7,0,1,2], 0', expected: '4' }
          ]
        },
        interviewQuestions: [
          {
            question: 'How do you determine if a problem can be solved with Binary Search on Answer?',
            type: 'conceptual',
            expectedAnswer: 'Check if: 1) You are asked to maximize a minimum or minimize a maximum, 2) The answer lies in a bounded continuous range [min_val, max_val], and 3) Given a candidate speed/capacity X, you can verify if X is valid in polynomial time (e.g. O(N)).',
            companyTags: ['Google', 'Microsoft', 'Oracle']
          }
        ],
        relatedProblemIds: ['prob-binary-search', 'prob-rotated-sorted'],
        relatedProjectIds: ['proj-online-judge']
      }
    ]
  },
  {
    id: 'track-cpp',
    slug: 'cpp-systems',
    title: 'C++ Systems & STL',
    category: 'language',
    language: 'cpp',
    icon: 'Cpu',
    description: 'Pointers, RAII, modern C++20 smart pointers, memory layouts, STL containers, and competitive templates.',
    difficulty: 'Intermediate',
    totalTopics: 14,
    completedTopics: 5,
    estimatedHours: 40,
    bannerGradient: 'from-cyan-600 to-blue-700',
    topics: []
  },
  {
    id: 'track-java',
    slug: 'java-enterprise',
    title: 'Java OOP & Collections',
    category: 'language',
    language: 'java',
    icon: 'Coffee',
    description: 'JVM architecture, Generics, Collections Framework, Multithreading, and Design Patterns.',
    difficulty: 'Beginner',
    totalTopics: 15,
    completedTopics: 6,
    estimatedHours: 42,
    bannerGradient: 'from-orange-600 to-amber-700',
    topics: []
  },
  {
    id: 'track-c',
    slug: 'c-low-level',
    title: 'C Fundamentals & Memory',
    category: 'language',
    language: 'c',
    icon: 'Terminal',
    description: 'Manual memory allocation, pointer arithmetic, struct alignment, dynamic memory leaks, and POSIX basics.',
    difficulty: 'Beginner',
    totalTopics: 10,
    completedTopics: 4,
    estimatedHours: 30,
    bannerGradient: 'from-slate-600 to-zinc-800',
    topics: []
  },
  {
    id: 'track-interview',
    slug: 'interview-mastery',
    title: 'Interview Preparation & System Design',
    category: 'interview',
    icon: 'Briefcase',
    description: 'Behavioral STAR methodology, scalable system architecture, coding patterns, and mock interviews.',
    difficulty: 'Advanced',
    totalTopics: 16,
    completedTopics: 7,
    estimatedHours: 48,
    bannerGradient: 'from-rose-600 to-pink-700',
    topics: []
  }
];

export const INITIAL_PROBLEMS: Problem[] = [
  {
    id: 'prob-two-sum',
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    topicId: 'py-03',
    topicTitle: 'Hash Maps & Dictionaries',
    subtopic: 'Single-pass Hash Table',
    tags: ['Array', 'Hash Table'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Adobe', 'Apple'],
    learningObjectives: [
      'Understand how hash maps achieve O(1) average lookup times.',
      'Trade O(N) auxiliary space to reduce O(N²) brute force time to O(N).'
    ],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have **exactly one solution**, and you may not use the *same* element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'nums[1] + nums[2] == 6, we return [1, 2].'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    starterCode: {
      python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Write your code here\n        pass`,
      cpp: `#include <vector>\n#include <unordered_map>\n\nclass Solution {\npublic:\n    std::vector<int> twoSum(std::vector<int>& nums, int target) {\n        // Write your code here\n        return {};\n    }\n};`,
      java: `import java.util.HashMap;\nimport java.util.Map;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}`,
      c: `/**\n * Note: The returned array must be malloced, assume caller calls free().\n */\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    // Write your code here\n    *returnSize = 2;\n    int* res = (int*)malloc(sizeof(int) * 2);\n    return res;\n}`
    },
    hints: [
      {
        level: 1,
        title: 'Identify the Inverse Search',
        content: 'For every number `x` at index `i`, what exact complement value are you looking for to equal `target`?'
      },
      {
        level: 2,
        title: 'Fast Lookup Data Structure',
        content: 'Instead of re-scanning the array from 0 to i with a nested loop (which takes O(N²)), what data structure lets you check if `target - x` has already been seen in O(1) time?'
      },
      {
        level: 3,
        title: 'Single Pass Algorithm',
        content: 'Iterate through the array. For each number `num` and index `i`, calculate `complement = target - num`. If `complement` is already in your hash map, return `[map[complement], i]`. Otherwise, store `map[num] = i`.'
      },
      {
        level: 4,
        title: 'Pseudocode Structure',
        content: `seen = {}
for i from 0 to len(nums)-1:
    diff = target - nums[i]
    if diff in seen:
        return [seen[diff], i]
    seen[nums[i]] = i`
      }
    ],
    solutionApproach: {
      optimalTimeComplexity: 'O(N)',
      optimalSpaceComplexity: 'O(N)',
      intuition: 'Store previously visited elements along with their index in a hash map to achieve instant O(1) complement lookups.',
      algorithm: 'Single-pass Hash Map iteration.'
    },
    acceptanceRate: 52.4,
    totalSubmissions: 14820,
    xpReward: 50
  },
  {
    id: 'prob-valid-anagram',
    title: 'Valid Anagram',
    slug: 'valid-anagram',
    difficulty: 'Easy',
    topicId: 'py-03',
    topicTitle: 'Hash Maps & Dictionaries',
    subtopic: 'Frequency Counting',
    tags: ['String', 'Hash Table', 'Sorting'],
    companies: ['Amazon', 'Google', 'Adobe'],
    learningObjectives: [
      'Learn character frequency hash tables and fixed-size 26-element array optimizations.'
    ],
    description: `Given two strings \`s\` and \`t\`, return \`true\` *if* \`t\` *is an anagram of* \`s\`, *and* \`false\` *otherwise*.

An **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    examples: [
      {
        input: 's = "anagram", t = "nagaram"',
        output: 'true'
      },
      {
        input: 's = "rat", t = "car"',
        output: 'false'
      }
    ],
    constraints: [
      '1 <= s.length, t.length <= 5 * 10^4',
      's and t consist of lowercase English letters.'
    ],
    starterCode: {
      python: `class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        pass`,
      cpp: `class Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        return false;\n    }\n};`,
      java: `class Solution {\n    public boolean isAnagram(String s, String t) {\n        return false;\n    }\n}`,
      c: `bool isAnagram(char* s, char* t) {\n    return false;\n}`
    },
    hints: [
      {
        level: 1,
        title: 'Length check',
        content: 'If `len(s) != len(t)`, can they ever be anagrams?'
      },
      {
        level: 2,
        title: 'Frequency parity',
        content: 'Every character must appear with the exact same frequency count in both strings.'
      },
      {
        level: 3,
        title: 'Fixed Array vs Hash Table',
        content: 'Since all characters are lowercase letters a-z, you can use a fixed-size integer array of length 26 to count frequencies in O(1) auxiliary space.'
      },
      {
        level: 4,
        title: 'Pseudocode Structure',
        content: `counts = [0] * 26
for char in s: counts[ord(char) - ord('a')] += 1
for char in t: counts[ord(char) - ord('a')] -= 1
return all(count == 0 for count in counts)`
      }
    ],
    solutionApproach: {
      optimalTimeComplexity: 'O(N)',
      optimalSpaceComplexity: 'O(1) (bounded by 26 lowercase alphabet characters)',
      intuition: 'Track character frequency counts. Add counts for string s and decrement for string t.',
      algorithm: '26-bucket array frequency table.'
    },
    acceptanceRate: 64.1,
    totalSubmissions: 9400,
    xpReward: 40
  },
  {
    id: 'prob-max-water',
    title: 'Container With Most Water',
    slug: 'container-with-most-water',
    difficulty: 'Medium',
    topicId: 'dsa-01',
    topicTitle: 'Two Pointers & Sliding Window',
    subtopic: 'Dual End Converging Pointers',
    tags: ['Array', 'Two Pointers', 'Greedy'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Adobe', 'Oracle'],
    learningObjectives: [
      'Master greedy pointer movements to eliminate unpromising solution spaces.'
    ],
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i\`th line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return *the maximum amount of water a container can store*.

**Notice** that you may not slant the container.`,
    examples: [
      {
        input: 'height = [1,8,6,2,5,4,8,3,7]',
        output: '49',
        explanation: 'The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water the container can contain is 49 (between index 1 and index 8).'
      }
    ],
    constraints: [
      'n == height.length',
      '2 <= n <= 10^5',
      '0 <= height[i] <= 10^4'
    ],
    starterCode: {
      python: `class Solution:\n    def maxArea(self, height: list[int]) -> int:\n        pass`,
      cpp: `class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        return 0;\n    }\n};`,
      java: `class Solution {\n    public int maxArea(int[] height) {\n        return 0;\n    }\n}`,
      c: `int maxArea(int* height, int heightSize) {\n    return 0;\n}`
    },
    hints: [
      {
        level: 1,
        title: 'Area Formula',
        content: 'Area between indices `l` and `r` is `min(height[l], height[r]) * (r - l)`.'
      },
      {
        level: 2,
        title: 'Starting Configuration',
        content: 'Start with the widest possible container: `l = 0`, `r = len(height) - 1`.'
      },
      {
        level: 3,
        title: 'Greedy Move Strategy',
        content: 'As you move pointers closer, the width `(r - l)` strictly decreases. To find a larger area, the new height must increase. Which pointer should you move: the shorter line or the taller line?'
      },
      {
        level: 4,
        title: 'Pseudocode Structure',
        content: `l = 0, r = len(height) - 1, max_water = 0
while l < r:
    h = min(height[l], height[r])
    max_water = max(max_water, h * (r - l))
    if height[l] < height[r]:
        l += 1
    else:
        r -= 1
return max_water`
      }
    ],
    solutionApproach: {
      optimalTimeComplexity: 'O(N)',
      optimalSpaceComplexity: 'O(1)',
      intuition: 'The container capacity is bounded by the shorter line. Moving the taller line can never increase water because width decreases and height is still bounded by the shorter line.',
      algorithm: 'Two Pointers converging inward from outer bounds.'
    },
    acceptanceRate: 54.8,
    totalSubmissions: 8120,
    xpReward: 80
  },
  {
    id: 'prob-longest-substr',
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    difficulty: 'Medium',
    topicId: 'dsa-01',
    topicTitle: 'Two Pointers & Sliding Window',
    subtopic: 'Dynamic Sliding Window',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Oracle', 'Bloomberg'],
    learningObjectives: [
      'Maintain an active window with invariant constraints using last-seen index mapping.'
    ],
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.'
      }
    ],
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.'
    ],
    starterCode: {
      python: `class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        pass`,
      cpp: `class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        return 0;\n    }\n};`,
      java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        return 0;\n    }\n}`,
      c: `int lengthOfLongestSubstring(char* s) {\n    return 0;\n}`
    },
    hints: [
      {
        level: 1,
        title: 'Sliding Window definition',
        content: 'Maintain a window `[left, right]` where every character inside is unique.'
      },
      {
        level: 2,
        title: 'Tracking duplicate index',
        content: 'Use a hash map to store the last seen index of each character.'
      },
      {
        level: 3,
        title: 'Window jump logic',
        content: 'When `s[right]` was seen at index `last_seen[s[right]] >= left`, jump `left = last_seen[s[right]] + 1`.'
      },
      {
        level: 4,
        title: 'Pseudocode Structure',
        content: `seen = {}
left = 0, max_len = 0
for right, ch in enumerate(s):
    if ch in seen and seen[ch] >= left:
        left = seen[ch] + 1
    seen[ch] = right
    max_len = max(max_len, right - left + 1)
return max_len`
      }
    ],
    solutionApproach: {
      optimalTimeComplexity: 'O(N)',
      optimalSpaceComplexity: 'O(min(N, M)) where M is alphabet size',
      intuition: 'Store each character last index to instantly jump the left window bound past duplicates.',
      algorithm: 'Sliding Window with Hash Map index jump.'
    },
    acceptanceRate: 34.5,
    totalSubmissions: 12050,
    xpReward: 85
  },
  {
    id: 'prob-median-arrays',
    title: 'Median of Two Sorted Arrays',
    slug: 'median-of-two-sorted-arrays',
    difficulty: 'Hard',
    topicId: 'dsa-02',
    topicTitle: 'Binary Search & Monotonic Predicates',
    subtopic: 'Binary Search on Partition',
    tags: ['Array', 'Binary Search', 'Divide and Conquer'],
    companies: ['Google', 'Microsoft', 'Amazon', 'Adobe'],
    learningObjectives: [
      'Perform logarithmic binary search partitioning simultaneously across two non-merged arrays.'
    ],
    description: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return **the median** of the two sorted arrays.

The overall run time complexity should be \`O(log (m+n))\`.`,
    examples: [
      {
        input: 'nums1 = [1,3], nums2 = [2]',
        output: '2.00000',
        explanation: 'merged array = [1,2,3] and median is 2.'
      },
      {
        input: 'nums1 = [1,2], nums2 = [3,4]',
        output: '2.50000',
        explanation: 'merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.'
      }
    ],
    constraints: [
      'nums1.length == m',
      'nums2.length == n',
      '0 <= m <= 1000',
      '0 <= n <= 1000',
      '1 <= m + n <= 2000',
      '-10^6 <= nums1[i], nums2[i] <= 10^6'
    ],
    starterCode: {
      python: `class Solution:\n    def findMedianSortedArrays(self, nums1: list[int], nums2: list[int]) -> float:\n        pass`,
      cpp: `class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        return 0.0;\n    }\n};`,
      java: `class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        return 0.0;\n    }\n}`,
      c: `double findMedianSortedArrays(int* nums1, int nums1Size, int* nums2, int nums2Size) {\n    return 0.0;\n}`
    },
    hints: [
      {
        level: 1,
        title: 'Partition Concept',
        content: 'Median divides a combined sorted array into equal left and right halves.'
      },
      {
        level: 2,
        title: 'Binary search on smaller array',
        content: 'Always run binary search on the shorter array `A` so time complexity is `O(log(min(M, N)))`.'
      },
      {
        level: 3,
        title: 'Partition boundary conditions',
        content: 'For partition `i` in A and `j` in B, check `A[i-1] <= B[j]` and `B[j-1] <= A[i]` using infinity sentinels for out-of-bounds.'
      },
      {
        level: 4,
        title: 'Pseudocode Structure',
        content: `A, B = (nums1, nums2) if len(nums1) <= len(nums2) else (nums2, nums1)
total = len(A) + len(B)
half = total // 2
l, r = 0, len(A) - 1
while True:
    i = (l + r) // 2 # A partition
    j = half - i - 2 # B partition
    Aleft = A[i] if i >= 0 else -inf
    Aright = A[i+1] if (i+1) < len(A) else inf
    Bleft = B[j] if j >= 0 else -inf
    Bright = B[j+1] if (j+1) < len(B) else inf
    if Aleft <= Bright and Bleft <= Aright:
        if total % 2: return min(Aright, Bright)
        return (max(Aleft, Bleft) + min(Aright, Bright)) / 2
    elif Aleft > Bright:
        r = i - 1
    else:
        l = i + 1`
      }
    ],
    solutionApproach: {
      optimalTimeComplexity: 'O(log(min(M, N)))',
      optimalSpaceComplexity: 'O(1)',
      intuition: 'Partition both arrays simultaneously such that left half contains (M+N)/2 elements and all left elements <= right elements.',
      algorithm: 'Binary Search partition.'
    },
    acceptanceRate: 38.2,
    totalSubmissions: 5410,
    xpReward: 150
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-calc',
    title: 'Scientific Calculator & Expression Parser',
    slug: 'scientific-calculator',
    level: 'Beginner',
    trackId: 'track-python',
    trackTitle: 'Python Programming',
    summary: 'Build an AST (Abstract Syntax Tree) arithmetic parser that evaluates nested parentheses, operator precedence, and trigonometric functions without using `eval()`.',
    overview: 'A rite-of-passage project that elevates basic coding into computer science. You will implement the Shunting-Yard Algorithm to convert infix expressions to Reverse Polish Notation (RPN) and evaluate expressions safely with full tokenization.',
    bannerImage: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=800&auto=format&fit=crop&q=80',
    requirements: [
      'Tokenize strings into numbers, operators, and parenthesis tokens.',
      'Handle operator precedence (*, / before +, -).',
      'Support nested brackets of arbitrary depth: (3 + (2 * 4)).',
      'Provide clean error handling for division by zero and unmatched parentheses.'
    ],
    learningGoals: [
      'Master Stack data structures and Postfix notation.',
      'Write robust input sanitization without insecure `eval()`.',
      'Design modular functions with high test coverage.'
    ],
    technologies: ['Python', 'Data Structures (Stack)', 'Unit Testing'],
    estimatedHours: 8,
    xpReward: 250,
    milestones: [
      {
        id: 'm1',
        order: 1,
        title: 'Milestone 1: Lexical Tokenizer',
        description: 'Convert raw input strings like `12 + (3.5 * 4)` into structured tokens: `[Token(NUM, 12), Token(PLUS), Token(LPAREN), Token(NUM, 3.5), Token(MUL), Token(NUM, 4), Token(RPAREN)]`.',
        estimatedHours: 2,
        deliverable: 'Tokenizer class with unit tests for multi-digit floats and whitespace.',
        aiReviewPrompt: 'Review the tokenizer code for handling negative numbers and floating point edge cases.',
        tasks: [
          {
            id: 't1-1',
            title: 'Define Token data class or named tuple',
            description: 'Create an enum for TokenType (NUMBER, OPERATOR, LPAREN, RPAREN) and Token structure.',
            hints: ['Use Python dataclasses for clean immutable token representation.'],
            isCompleted: true,
            learningOutcome: 'Enums and data modeling in Python'
          },
          {
            id: 't1-2',
            title: 'Implement character-by-character scanner',
            description: 'Iterate through string skipping whitespaces, accumulating continuous digit chunks into floats.',
            hints: ['Keep an index pointer `i` and advance while `s[i].isdigit() or s[i] == "."`.'],
            isCompleted: true,
            learningOutcome: 'String scanning techniques'
          }
        ]
      },
      {
        id: 'm2',
        order: 2,
        title: 'Milestone 2: Shunting-Yard Infix to Postfix Converter',
        description: 'Convert infix token streams to Reverse Polish Notation (RPN) using Edsger Dijkstra’s classic stack algorithm.',
        estimatedHours: 3,
        deliverable: 'Parser class outputting a postfix queue.',
        aiReviewPrompt: 'Evaluate stack operator precedence popping logic and parenthesis matching.',
        tasks: [
          {
            id: 't2-1',
            title: 'Define operator precedence map',
            description: 'Define precedence: `^: 4, *: 3, /: 3, +: 2, -: 2`.',
            hints: ['Use a dictionary mapping operator strings to precedence integers.'],
            isCompleted: false,
            learningOutcome: 'Precedence modeling'
          },
          {
            id: 't2-2',
            title: 'Implement Shunting-Yard Stack logic',
            description: 'Push operators onto stack, pop higher/equal precedence operators to output queue.',
            hints: ['When seeing `(`, push to stack. When seeing `)`, pop to output until `(` is encountered.'],
            isCompleted: false,
            learningOutcome: 'Stack algorithm execution'
          }
        ]
      },
      {
        id: 'm3',
        order: 3,
        title: 'Milestone 3: RPN Stack Evaluator & Interactive CLI',
        description: 'Evaluate the postfix queue and build an interactive terminal interface with history support.',
        estimatedHours: 3,
        deliverable: 'Complete runnable application with calculation history.',
        aiReviewPrompt: 'Check for ZeroDivisionError catches and stack underflow validation.',
        tasks: [
          {
            id: 't3-1',
            title: 'Evaluate RPN with operand stack',
            description: 'Iterate postfix queue: if number push to stack, if operator pop two operands, compute and push result.',
            hints: ['Remember order: for `b = pop(), a = pop()`, result is `a / b` not `b / a`.'],
            isCompleted: false,
            learningOutcome: 'Evaluation stack logic'
          },
          {
            id: 't3-2',
            title: 'Add calculation memory & command loop',
            description: 'Allow variables like `ans` to reference previous results.',
            hints: ['Maintain state dictionary in the evaluator instance.'],
            isCompleted: false,
            learningOutcome: 'Stateful application design'
          }
        ]
      }
    ],
    evaluationCriteria: [
      { category: 'Correctness & Precedence', maxScore: 40, criteria: 'Correctly evaluates complex expressions like 2 + 3 * 4 / (1 - 5) ^ 2.' },
      { category: 'Error Handling', maxScore: 30, criteria: 'Gracefully catches division by zero, mismatched parens, and invalid characters.' },
      { category: 'Code Cleanliness & Typing', maxScore: 30, criteria: 'Clean classes, type annotations, and absence of `eval()` or unsafe built-ins.' }
    ],
    architectureDiagramNotes: 'Raw String -> [Tokenizer] -> Token List -> [Shunting Yard] -> RPN Queue -> [Stack Evaluator] -> Float Result',
    recommendedNextProject: 'proj-expense'
  },
  {
    id: 'proj-quiz',
    title: 'Interactive Terminal Quiz App with Analytics',
    slug: 'interactive-quiz-app',
    level: 'Beginner',
    trackId: 'track-python',
    trackTitle: 'Python Programming',
    summary: 'Develop a categorized quiz engine with JSON question banks, timed responses, streak scoring, and performance summary export.',
    overview: 'Build a modular educational quiz console application that tests object-oriented programming, JSON persistence, and user timer threads.',
    bannerImage: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&auto=format&fit=crop&q=80',
    requirements: [
      'Load question banks from structured JSON files.',
      'Implement multi-choice and true/false question types.',
      'Score multiplier based on answer speed and streaks.',
      'Export final score breakdown to JSON/CSV report.'
    ],
    learningGoals: ['File I/O and JSON parsing', 'OOP class hierarchies for Question types', 'CLI styling and score tracking'],
    technologies: ['Python', 'JSON', 'Object-Oriented Design'],
    estimatedHours: 6,
    xpReward: 200,
    milestones: [],
    evaluationCriteria: [],
    architectureDiagramNotes: 'JSON Store -> QuizLoader -> QuizEngine -> UserCLI -> ReportExporter'
  },
  {
    id: 'proj-student-mgmt',
    title: 'Student Record & Grade Management System',
    slug: 'student-record-system',
    level: 'Beginner',
    trackId: 'track-python',
    trackTitle: 'Python Programming',
    summary: 'Build a relational in-memory record store with CSV export, GPA computation, searching, sorting, and academic standing flags.',
    overview: 'Learn data validation, binary search on sorted records, CSV persistence, and statistics calculation.',
    bannerImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    requirements: ['CRUD operations for students and courses', 'Compute weighted GPA', 'Filter by department and academic probation (< 2.0 GPA)'],
    learningGoals: ['Dictionaries and dataclasses', 'Sorting algorithms with custom keys', 'File persistence'],
    technologies: ['Python', 'CSV', 'Data Modeling'],
    estimatedHours: 8,
    xpReward: 220,
    milestones: [],
    evaluationCriteria: [],
    architectureDiagramNotes: 'Student Repository -> GPA Calculator -> Filtering Service -> CLI View'
  },
  {
    id: 'proj-banking',
    title: 'Banking Ledger & Transaction Simulation',
    slug: 'banking-ledger-system',
    level: 'Beginner',
    trackId: 'track-java',
    trackTitle: 'Java OOP & Collections',
    summary: 'Implement a double-entry banking ledger with account types (Savings, Checking), interest compounding, transaction histories, and fraud checks.',
    overview: 'A foundational Java OOP project demonstrating encapsulation, polymorphism, inheritance, exception handling, and transaction safety.',
    bannerImage: 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=800&auto=format&fit=crop&q=80',
    requirements: ['Support Deposit, Withdraw, Transfer with atomic rollback on failure', 'Account polymorphism for interest calculation', 'Audit log for suspicious large withdrawals'],
    learningGoals: ['Java Class Hierarchies & Abstract Classes', 'Custom Exceptions (e.g. InsufficientFundsException)', 'Transaction atomicity concepts'],
    technologies: ['Java', 'OOP', 'Collections Framework'],
    estimatedHours: 10,
    xpReward: 280,
    milestones: [],
    evaluationCriteria: [],
    architectureDiagramNotes: 'Account -> [SavingsAccount | CheckingAccount] -> LedgerService -> TransactionHistory'
  },
  {
    id: 'proj-expense',
    title: 'Personal Expense & Budget Tracker',
    slug: 'expense-budget-tracker',
    level: 'Intermediate',
    trackId: 'track-python',
    trackTitle: 'Python Programming',
    summary: 'Build a comprehensive CLI expense tracker with recurring expense detection, category budgets, monthly trends, and ASCII bar chart visualizations.',
    overview: 'An intermediate project focusing on date math, statistical aggregation, categorization heuristics, and persistent SQLite database integration.',
    bannerImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
    requirements: ['Record expenses with tags and dates', 'Set monthly category budget limits with warning threshold alerts', 'Generate text/ASCII visual spending charts'],
    learningGoals: ['SQLite database queries & aggregation', 'Datetime manipulation and periodicity', 'Data visualization in terminal'],
    technologies: ['Python', 'SQLite', 'Tabulate'],
    estimatedHours: 14,
    xpReward: 400,
    milestones: [],
    evaluationCriteria: [],
    architectureDiagramNotes: 'ExpenseModel -> SQLite DB -> BudgetManager -> VisualizationEngine'
  },
  {
    id: 'proj-online-judge',
    title: 'Distributed Online Judge Sandbox & Code Runner',
    slug: 'online-judge-engine',
    level: 'Advanced',
    trackId: 'track-dsa',
    trackTitle: 'Data Structures & Algorithms',
    summary: 'Architect a secure code execution engine that compiles, executes, enforces resource limits (Time/Memory), and grades submissions against test cases.',
    overview: 'Build the core engine powering platforms like LeetCode and Algora. You will implement subprocess execution, resource limit enforcement with `setrlimit`, sandboxing security checks, diff comparison, and test case orchestration.',
    bannerImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    requirements: [
      'Compile and execute Python, C++, and Java in isolated subprocesses.',
      'Enforce CPU time limit (e.g. 1.0s) and memory caps (e.g. 256MB).',
      'Catch Time Limit Exceeded (TLE), Memory Limit Exceeded (MLE), Runtime Errors, and Output Diffs.',
      'Format unified execution verdicts with exact runtime milliseconds and memory consumption.'
    ],
    learningGoals: [
      'Process management & POSIX signals',
      'Resource monitoring (`resource` module / `cgroups`)',
      'Security sandboxing principles against malicious code injection'
    ],
    technologies: ['Python / C++', 'Subprocess / POSIX IPC', 'Linux Sandboxing', 'System Architecture'],
    estimatedHours: 25,
    xpReward: 800,
    milestones: [],
    evaluationCriteria: [],
    architectureDiagramNotes: 'Submission API -> Queue -> Judge Worker -> Sandbox Isolator -> Compiler -> Runner -> Comparator -> Verdict Store'
  },
  {
    id: 'proj-chat-app',
    title: 'High-Concurrency Real-Time Chat Engine',
    slug: 'realtime-chat-engine',
    level: 'Intermediate',
    trackId: 'track-python',
    trackTitle: 'Python Programming',
    summary: 'Build an async WebSocket chat server with room routing, heartbeat health checks, message history persistence, and online presence tracking.',
    overview: 'Master asynchronous networking, event loops, WebSocket protocol handshakes, and pub/sub room broadcasts.',
    bannerImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    requirements: ['Multi-room broadcasting', 'Presence heartbeat detection', 'Chat message persistence with timestamps'],
    learningGoals: ['Asyncio event loops', 'WebSocket protocol frames', 'Pub/Sub state management'],
    technologies: ['Python (asyncio / websockets)', 'SQLite / Redis', 'JSON Protocol'],
    estimatedHours: 16,
    xpReward: 450,
    milestones: [],
    evaluationCriteria: [],
    architectureDiagramNotes: 'WebSocket Client <-> Asyncio Server <-> Room Registry <-> DB Store'
  },
  {
    id: 'proj-ai-assistant',
    title: 'Semantic Code Search & AI Assistant Platform',
    slug: 'ai-code-assistant',
    level: 'Advanced',
    trackId: 'track-interview',
    trackTitle: 'Interview Preparation',
    summary: 'Build a code repository indexing tool with vector embeddings, AST function chunking, and Retrieval Augmented Generation (RAG) code explanations.',
    overview: 'Combine modern Gemini AI APIs with tree-sitter AST parsing to build an intelligent assistant that indexes entire codebases and answers architectural questions.',
    bannerImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
    requirements: ['Parse Python/JS files into function-level AST chunks', 'Compute embeddings and vector similarity', 'Synthesize answers using Gemini 2.5 Flash'],
    learningGoals: ['Tree-sitter AST parsing', 'Vector similarity cosine ranking', 'Prompt engineering with structured code context'],
    technologies: ['TypeScript / Python', 'Gemini API', 'Vector Embeddings', 'AST Parsers'],
    estimatedHours: 28,
    xpReward: 900,
    milestones: [],
    evaluationCriteria: [],
    architectureDiagramNotes: 'Repository -> AST Chunker -> Gemini Embeddings -> Vector Store -> Query Engine -> AI Response'
  }
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-01',
    topicId: 'py-01',
    topicTitle: 'Python Fundamentals',
    subtopic: 'Memory References',
    question: 'What happens when you pass a list to a function and modify it via `.append()` inside the function?',
    codeSnippet: 'def add_one(items):\n    items.append(1)\n\nlst = [0]\nadd_one(lst)',
    answer: 'The original list `lst` outside the function is modified in-place to `[0, 1]`.',
    explanation: 'Python passes arguments by object reference (call-by-sharing). Because lists are mutable, in-place mutations affect the exact same memory object.',
    keyTakeaway: 'Lists are mutable; reassigning variable pointers creates new bindings, but calling mutator methods alters the shared object.',
    intervalDays: 4,
    repetitionCount: 3,
    easeFactor: 2.5,
    dueDate: new Date(Date.now() - 3600 * 1000).toISOString(), // Due today!
    decayScore: 65
  },
  {
    id: 'fc-02',
    topicId: 'dsa-01',
    topicTitle: 'Data Structures & Algorithms',
    subtopic: 'Two Pointers',
    question: 'Why does the Two Pointer technique fail to find subarray sums in O(N) when array contains negative numbers?',
    answer: 'Negative numbers break the monotonic expansion/contraction property.',
    explanation: 'With strictly positive numbers, advancing the right pointer strictly INCREASES the window sum, and advancing left strictly DECREASES it. Negative numbers destroy this monotonic guarantee, requiring Prefix Sum + Hash Map instead.',
    keyTakeaway: 'Two pointers require monotonic behavior. For non-monotonic subarray sums, use Prefix Sums + Hash Map.',
    intervalDays: 2,
    repetitionCount: 2,
    easeFactor: 2.3,
    dueDate: new Date().toISOString(),
    decayScore: 50
  },
  {
    id: 'fc-03',
    topicId: 'dsa-02',
    topicTitle: 'Data Structures & Algorithms',
    subtopic: 'Binary Search',
    question: 'What is the formula to calculate `mid` in binary search to prevent 32-bit signed integer overflow in languages like C++ and Java?',
    codeSnippet: 'int mid = low + (high - low) / 2;',
    answer: '`low + (high - low) / 2` (or unsigned bitshift `(low + high) >>> 1` in Java).',
    explanation: 'Direct addition `(low + high)` can exceed `2^31 - 1` (2,147,483,647) when low and high are large, resulting in negative overflow. `low + (high - low) / 2` is mathematically identical and overflow-safe.',
    keyTakeaway: 'Always use `low + (high - low) / 2` to prevent arithmetic overflow.',
    intervalDays: 6,
    repetitionCount: 4,
    easeFactor: 2.6,
    dueDate: new Date(Date.now() - 7200 * 1000).toISOString(),
    decayScore: 40
  },
  {
    id: 'fc-04',
    topicId: 'py-03',
    topicTitle: 'Hash Maps & Dictionaries',
    subtopic: 'Hash Collisions',
    question: 'What is the worst-case time complexity of inserting an item into a hash table, and when does it occur?',
    answer: 'O(N) time complexity, occurring when all keys hash to the same bucket (severe hash collision) or during table resizing / rehashing.',
    explanation: 'Average lookup and insert is O(1). However, when collisions degenerate into a single bucket chain or open addressing cluster, searching the bucket takes linear O(N) time.',
    keyTakeaway: 'Hash maps provide O(1) average time, but O(N) worst-case under pathological collisions.',
    intervalDays: 1,
    repetitionCount: 1,
    easeFactor: 2.1,
    dueDate: new Date().toISOString(),
    decayScore: 35
  }
];

export const INITIAL_COMPANIES: CompanyTrack[] = [
  {
    id: 'comp-google',
    name: 'Google',
    logoBadge: 'G',
    category: 'Tier 1 / Big Tech',
    accentColor: 'from-blue-500 to-emerald-500',
    description: 'High emphasis on clean algorithmic design, edge-case thoroughness, logarithmic complexity, Trees & Graphs, and DP.',
    hiringFocus: ['Data Structures & Graph Traversals', 'Dynamic Programming', 'Scalability & Clean Architecture', 'Googleyness & Ambiguity Handling'],
    frequentlyAskedTopics: [
      { topic: 'Trees & Graphs (BFS, DFS, Dijkstra)', frequencyPercentage: 35, importance: 'Critical', topQuestionIds: ['prob-median-arrays'] },
      { topic: 'Dynamic Programming', frequencyPercentage: 25, importance: 'Critical', topQuestionIds: [] },
      { topic: 'Two Pointers & Sliding Window', frequencyPercentage: 20, importance: 'High', topQuestionIds: ['prob-max-water', 'prob-longest-substr'] },
      { topic: 'Binary Search Monotonic Predicates', frequencyPercentage: 15, importance: 'High', topQuestionIds: ['prob-median-arrays'] }
    ],
    codingPatterns: [
      { name: 'Binary Search on Solution Space', description: 'Transform optimization problems into feasible decision predicates.', exampleProblems: ['Koko Eating Bananas', 'Split Array Largest Sum'] },
      { name: 'Topological Sort / DAG Dependency', description: 'Schedule tasks or resolve build orders with Kahn’s Algorithm or DFS coloring.', exampleProblems: ['Course Schedule I & II', 'Alien Dictionary'] },
      { name: 'Disjoint Set Union (DSU / Union-Find)', description: 'Maintain connected components and detect graph cycles dynamically.', exampleProblems: ['Number of Connected Components', 'Redundant Connection'] }
    ],
    interviewStages: [
      { stage: 'Stage 1: Online Assessment (OA)', format: '90 mins, 2 Algorithmic Coding Problems on HackerRank/Codility', focusAreas: ['Clean code without helper libraries', 'Speed & Edge case resilience'], tips: ['Aim for 100% test case pass rate with optimal Big-O.'] },
      { stage: 'Stage 2: Technical Phone Screen', format: '45 mins with Google SDE over Google Meet + Google Docs', focusAreas: ['Live coding without IDE autocomplete', 'Thinking out loud', 'Complexity analysis'], tips: ['State your approach and Big-O before writing the first line of code.'] },
      { stage: 'Stage 3: Onsite / Virtual Rounds (4x)', format: '4 rounds: 3 Coding/Algorithms + 1 Googleyness/Leadership', focusAreas: ['Complex algorithmic problem solving', 'System tradeoffs', 'Collaborative communication'], tips: ['Treat the interviewer as a teammate; validate constraints proactively.'] }
    ],
    preparationRoadmapWeeks: [
      { week: 1, title: 'Arrays, Strings & Hash Tables Mastery', goals: ['Solve 15 Easy/Medium two pointer and hash map problems', 'Master O(1) space optimizations'], recommendedProblemIds: ['prob-two-sum', 'prob-valid-anagram', 'prob-max-water'] },
      { week: 2, title: 'Binary Search & Sliding Window Depth', goals: ['Master binary search variants', 'Solve 10 sliding window questions'], recommendedProblemIds: ['prob-longest-substr', 'prob-median-arrays'] },
      { week: 3, title: 'Trees, BST & Graph Traversals', goals: ['BFS/DFS graph patterns', 'Trie prefix trees', 'Dijkstra shortest path'], recommendedProblemIds: [] },
      { week: 4, title: 'Dynamic Programming & Mock Interview Sprints', goals: ['1D/2D DP state transitions', 'Complete 3 full mock interviews under 45m timer'], recommendedProblemIds: [] }
    ]
  },
  {
    id: 'comp-amazon',
    name: 'Amazon',
    logoBadge: 'A',
    category: 'Tier 1 / Big Tech',
    accentColor: 'from-amber-500 to-orange-600',
    description: 'Heavy integration of 16 Leadership Principles into every technical round. Top questions focus on Hash Tables, BFS/DFS, Heaps, and Slotted Intervals.',
    hiringFocus: ['Customer Obsession & Ownership', 'Heaps & Priority Queues', 'BFS Level Order & Grid Traversals', 'Object-Oriented System Design (LLD)'],
    frequentlyAskedTopics: [
      { topic: 'Hash Tables & Two Pointers', frequencyPercentage: 30, importance: 'Critical', topQuestionIds: ['prob-two-sum', 'prob-max-water'] },
      { topic: 'Heaps & Top-K Elements', frequencyPercentage: 25, importance: 'Critical', topQuestionIds: [] },
      { topic: 'Grid BFS / DFS (Zombie / Rotting Oranges)', frequencyPercentage: 25, importance: 'Critical', topQuestionIds: [] },
      { topic: 'Object-Oriented Design (Parking Lot, Locker System)', frequencyPercentage: 20, importance: 'High', topQuestionIds: [] }
    ],
    codingPatterns: [
      { name: 'Top-K with Min-Heap', description: 'Keep a heap of size K to find Kth largest elements in O(N log K) time.', exampleProblems: ['K Closest Points', 'Top K Frequent Words'] },
      { name: 'Multi-source BFS', description: 'Initialize queue with all starting seed nodes simultaneously.', exampleProblems: ['Rotting Oranges', '01 Matrix'] }
    ],
    interviewStages: [
      { stage: 'Stage 1: Amazon OA (Coding + Work Simulation)', format: '2 Coding questions + Work Style Assessment', focusAreas: ['Algorithmic correctness', 'Amazon Leadership Principles decision scenarios'], tips: ['Always align choices with Customer Obsession and Bias for Action.'] },
      { stage: 'Stage 2: Virtual Loop (4x rounds)', format: 'Each round is 20m LP behavioral + 35m Coding/LLD', focusAreas: ['STAR method stories for LPs', 'Production-ready clean code with error handling'], tips: ['Prepare 2 distinct STAR stories for every major Leadership Principle.'] }
    ],
    preparationRoadmapWeeks: [
      { week: 1, title: 'Leadership Principles & Top Amazon Problems', goals: ['Draft 10 STAR stories', 'Solve 15 top Amazon tagged array/heap questions'], recommendedProblemIds: ['prob-two-sum', 'prob-max-water'] }
    ]
  },
  {
    id: 'comp-microsoft',
    name: 'Microsoft',
    logoBadge: 'M',
    category: 'Tier 1 / Big Tech',
    accentColor: 'from-blue-600 to-indigo-600',
    description: 'Focuses on fundamental Data Structures (Linked Lists, Trees, Strings), clean maintainable code, test case generation, and practical debugging.',
    hiringFocus: ['Linked Lists & Trees', 'String Manipulation', 'Test-Driven Debugging', 'Growth Mindset & Collaboration'],
    frequentlyAskedTopics: [
      { topic: 'Strings & Arrays', frequencyPercentage: 35, importance: 'Critical', topQuestionIds: ['prob-two-sum', 'prob-valid-anagram', 'prob-longest-substr'] },
      { topic: 'Trees & Linked Lists', frequencyPercentage: 30, importance: 'Critical', topQuestionIds: [] },
      { topic: 'Dynamic Programming & Recursion', frequencyPercentage: 20, importance: 'High', topQuestionIds: [] }
    ],
    codingPatterns: [
      { name: 'In-Place Linked List Mutation', description: 'Reverse pointers, reorder lists, merge sorted lists with O(1) space.', exampleProblems: ['Reverse Linked List', 'LRU Cache'] }
    ],
    interviewStages: [
      { stage: 'Stage 1: Codility Screening', format: '3 problems in 90 minutes', focusAreas: ['Edge cases, empty inputs, null pointers'], tips: ['Test with single elements and maximum constraints.'] },
      { stage: 'Stage 2: Onsite Technical Rounds', format: '4 rounds with engineering managers and SDEs', focusAreas: ['Live coding, data structure choices, team culture fit'], tips: ['Write unit test cases before the interviewer asks for them.'] }
    ],
    preparationRoadmapWeeks: [
      { week: 1, title: 'Strings, Linked Lists & Trees', goals: ['Master tree traversals and pointer manipulation', 'Review Microsoft top questions'], recommendedProblemIds: ['prob-two-sum', 'prob-longest-substr'] }
    ]
  },
  {
    id: 'comp-adobe',
    name: 'Adobe',
    logoBadge: 'Ad',
    category: 'Tier 1 / Creative Tech',
    accentColor: 'from-red-500 to-rose-600',
    description: 'High focus on math, geometry, dynamic programming, backtracking, and core language depth (C++ / Java memory model).',
    hiringFocus: ['Recursion & Backtracking', 'Dynamic Programming', 'Math & Geometry', 'Core CS Fundamentals'],
    frequentlyAskedTopics: [
      { topic: 'Dynamic Programming', frequencyPercentage: 35, importance: 'Critical', topQuestionIds: [] },
      { topic: 'Backtracking & Permutations', frequencyPercentage: 25, importance: 'High', topQuestionIds: [] },
      { topic: 'Arrays & Math', frequencyPercentage: 25, importance: 'High', topQuestionIds: ['prob-two-sum', 'prob-max-water'] }
    ],
    codingPatterns: [
      { name: 'Backtracking Template', description: 'Choose, Explore recursion, Unchoose back to valid state.', exampleProblems: ['Subsets', 'N-Queens', 'Word Search'] }
    ],
    interviewStages: [
      { stage: 'Stage 1: Online Assessment', format: 'Coding + CS Core MCQs (OS, DBMS, OOP)', focusAreas: ['Algorithms and fundamental theory'], tips: ['Revise OS memory paging and OOP principles.'] },
      { stage: 'Stage 2: Technical Rounds', format: '3-4 technical rounds', focusAreas: ['DSA depth and low-level understanding'], tips: ['Explain memory allocation tradeoffs.'] }
    ],
    preparationRoadmapWeeks: [
      { week: 1, title: 'DP & Backtracking Masterclass', goals: ['Solve 20 classical DP and backtracking problems'], recommendedProblemIds: ['prob-max-water'] }
    ]
  },
  {
    id: 'comp-oracle',
    name: 'Oracle',
    logoBadge: 'O',
    category: 'Tier 1 / Cloud Infrastructure',
    accentColor: 'from-red-600 to-amber-700',
    description: 'Emphasis on Database internals, Concurrency, Trees, Graphs, and Cloud-scale distributed architectures.',
    hiringFocus: ['Java / C++ Concurrency', 'Database Indexing & B-Trees', 'Graph Algorithms', 'Distributed Systems'],
    frequentlyAskedTopics: [
      { topic: 'Trees & Binary Search', frequencyPercentage: 30, importance: 'Critical', topQuestionIds: ['prob-median-arrays'] },
      { topic: 'Hash Tables & String Search', frequencyPercentage: 25, importance: 'High', topQuestionIds: ['prob-two-sum', 'prob-longest-substr'] },
      { topic: 'Concurrency & Multi-threading', frequencyPercentage: 25, importance: 'Critical', topQuestionIds: [] }
    ],
    codingPatterns: [
      { name: 'Producer-Consumer & Locks', description: 'Thread safety, semaphores, and condition variables.', exampleProblems: ['Bounded Blocking Queue', 'FizzBuzz Multithreaded'] }
    ],
    interviewStages: [
      { stage: 'Stage 1: Technical OA', format: 'Coding + System MCQs', focusAreas: ['Algorithms and SQL query optimization'], tips: ['Review B+ Tree indexing and ACID transactions.'] },
      { stage: 'Stage 2: Virtual Technical Interview', format: 'DSA + Java Concurrency Deep Dive', focusAreas: ['Thread synchronization, Collections, Big-O analysis'], tips: ['Be prepared to write thread-safe singleton or queue implementations.'] }
    ],
    preparationRoadmapWeeks: [
      { week: 1, title: 'Trees, Systems & Concurrency', goals: ['Implement thread-safe structures', 'Master Tree BFS/DFS'], recommendedProblemIds: ['prob-median-arrays'] }
    ]
  }
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge-first-code',
    title: 'Hello, World!',
    description: 'Successfully submitted your first accepted coding solution.',
    icon: 'Sparkles',
    category: 'learning',
    tier: 'bronze',
    unlockedAt: '2026-08-16T10:00:00Z',
    progress: 1,
    maxProgress: 1
  },
  {
    id: 'badge-streak-7',
    title: 'Streak Novice',
    description: 'Maintained a 7-day learning streak.',
    icon: 'Flame',
    category: 'streak',
    tier: 'silver',
    unlockedAt: '2026-08-23T14:30:00Z',
    progress: 12,
    maxProgress: 7
  },
  {
    id: 'badge-streak-30',
    title: 'Unstoppable Momentum',
    description: 'Reach a 30-day continuous learning streak.',
    icon: 'Flame',
    category: 'streak',
    tier: 'gold',
    progress: 12,
    maxProgress: 30
  },
  {
    id: 'badge-problem-solver',
    title: 'Algorithm Apprentice',
    description: 'Solve 25 coding challenges with optimal Big-O.',
    icon: 'Code',
    category: 'problem_solving',
    tier: 'silver',
    unlockedAt: '2026-09-10T18:00:00Z',
    progress: 25,
    maxProgress: 25
  },
  {
    id: 'badge-century-solver',
    title: 'Centurion of Code',
    description: 'Solve 100 coding challenges.',
    icon: 'Trophy',
    category: 'problem_solving',
    tier: 'platinum',
    progress: 28,
    maxProgress: 100
  },
  {
    id: 'badge-project-builder',
    title: 'Architect in the Making',
    description: 'Complete your first end-to-end software project.',
    icon: 'Layers',
    category: 'projects',
    tier: 'gold',
    unlockedAt: '2026-09-02T16:00:00Z',
    progress: 1,
    maxProgress: 1
  },
  {
    id: 'badge-spaced-master',
    title: 'Retention Guru',
    description: 'Review 50 flashcards using active recall without lapse.',
    icon: 'Brain',
    category: 'mastery',
    tier: 'gold',
    progress: 34,
    maxProgress: 50
  }
];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: 'usr_arjun',
    name: 'Arjun Mehta',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    xp: 6820,
    streak: 42,
    solvedCount: 142,
    level: 9,
    badgeCount: 14
  },
  {
    rank: 2,
    userId: 'usr_sarah',
    name: 'Sarah Chen',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    xp: 5940,
    streak: 31,
    solvedCount: 118,
    level: 8,
    badgeCount: 12
  },
  {
    rank: 3,
    userId: 'usr_algora_demo',
    name: 'Mani Varshith (You)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    xp: 3450,
    streak: 12,
    solvedCount: 28,
    level: 5,
    badgeCount: 5,
    isCurrentUser: true
  },
  {
    rank: 4,
    userId: 'usr_devon',
    name: 'Devon Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    xp: 3120,
    streak: 18,
    solvedCount: 45,
    level: 5,
    badgeCount: 6
  },
  {
    rank: 5,
    userId: 'usr_priya',
    name: 'Priya Sharma',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    xp: 2890,
    streak: 9,
    solvedCount: 39,
    level: 4,
    badgeCount: 4
  }
];
