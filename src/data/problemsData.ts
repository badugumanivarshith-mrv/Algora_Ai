/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Comprehensive Problem Bank & Socratic Hint Engine
 */

import { Problem } from '../types/problem';

export const PROBLEM_BANK: Problem[] = [
  // ==========================================
  // ARRAYS & HASHING (Easy / Medium / Hard)
  // ==========================================
  {
    id: 'two-sum',
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    topicId: 'arrays-hashing',
    topicTitle: 'Arrays & Hashing',
    subtopic: 'Hash Table Lookup',
    tags: ['Array', 'Hash Table'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'],
    learningObjectives: [
      'Master O(N) single-pass hash map complement search',
      'Understand time-space trade-offs in array searching'
    ],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.\n\nYou may assume that each input would have ***exactly one solution***, and you may not use the same element twice.\n\nYou can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]'
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    starterCode: {
      python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Write your solution here\n        pass`,
      cpp: `#include <vector>\n#include <unordered_map>\n\nclass Solution {\npublic:\n    std::vector<int> twoSum(std::vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};`,
      java: `import java.util.HashMap;\nimport java.util.Map;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}`,
      c: `#include <stdlib.h>\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    *returnSize = 2;\n    int* result = (int*)malloc(2 * sizeof(int));\n    // Write your solution here\n    return result;\n}`
    },
    hints: [
      {
        level: 1,
        title: 'Level 1: General Hint',
        content: 'Instead of searching for two arbitrary numbers that sum to target, for each element X you visit, calculate the exact required complement: complement = target - X.'
      },
      {
        level: 2,
        title: 'Level 2: Data Structure Approach',
        content: 'Use a Hash Map (Dictionary / Unordered Map). As you iterate through the array, store each visited value as a key and its array index as the value.'
      },
      {
        level: 3,
        title: 'Level 3: Algorithm Steps',
        content: '1. Initialize an empty hash map `seen`.\n2. Iterate through `nums` with index `i`.\n3. Compute `diff = target - nums[i]`.\n4. If `diff` is in `seen`, return `[seen[diff], i]`.\n5. Otherwise, store `seen[nums[i]] = i`.'
      },
      {
        level: 4,
        title: 'Level 4: Pseudocode',
        content: `seen = HashMap()
for i from 0 to len(nums) - 1:
    diff = target - nums[i]
    if seen.contains(diff):
        return [seen.get(diff), i]
    seen.put(nums[i], i)
return []`
      },
      {
        level: 5,
        title: 'Level 5: Partial Code Skeleton',
        content: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, num in enumerate(nums):
            # Fill in: check complement in seen dictionary
            if ...:
                return [...]
            seen[num] = i
        return []`,
        codeSnippet: `if (target - num) in seen:\n    return [seen[target - num], i]`
      },
      {
        level: 6,
        title: 'Level 6: Full Solution & Analysis',
        content: 'Optimal O(N) Time and O(N) Auxiliary Space solution using single-pass Hash Table lookup.',
        codeSnippet: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in seen:
                return [seen[diff], i]
            seen[num] = i
        return []`
      }
    ],
    solutionApproach: {
      optimalTimeComplexity: 'O(N)',
      optimalSpaceComplexity: 'O(N)',
      intuition: 'By trading O(N) memory for a hash map, we eliminate the need for nested O(N²) comparisons.',
      algorithm: 'Single-pass Hash Map Lookup'
    },
    acceptanceRate: 52.4,
    totalSubmissions: 28400,
    xpReward: 50
  },
  {
    id: 'contains-duplicate',
    title: 'Contains Duplicate',
    slug: 'contains-duplicate',
    difficulty: 'Easy',
    topicId: 'arrays-hashing',
    topicTitle: 'Arrays & Hashing',
    subtopic: 'Set Membership',
    tags: ['Array', 'Hash Table', 'Sorting'],
    companies: ['Amazon', 'Microsoft', 'Apple'],
    learningObjectives: ['Utilize Hash Sets for O(1) duplicate checks'],
    description: `Given an integer array \`nums\`, return \`true\` if any value appears **at least twice** in the array, and return \`false\` if every element is distinct.`,
    examples: [
      { input: 'nums = [1,2,3,1]', output: 'true' },
      { input: 'nums = [1,2,3,4]', output: 'false' },
      { input: 'nums = [1,1,1,3,3,4,3,2,4,2]', output: 'true' }
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9'],
    starterCode: {
      python: `class Solution:\n    def containsDuplicate(self, nums: list[int]) -> bool:\n        pass`,
      cpp: `#include <vector>\n#include <unordered_set>\n\nclass Solution {\npublic:\n    bool containsDuplicate(std::vector<int>& nums) {\n        return false;\n    }\n};`,
      java: `import java.util.HashSet;\nimport java.util.Set;\n\nclass Solution {\n    public boolean containsDuplicate(int[] nums) {\n        return false;\n    }\n}`,
      c: `bool containsDuplicate(int* nums, int numsSize) {\n    return false;\n}`
    },
    hints: [
      {
        level: 1,
        title: 'Level 1: Concept Hint',
        content: 'Think about set mathematical properties: sets store only unique elements.'
      },
      {
        level: 2,
        title: 'Level 2: Approach',
        content: 'Compare length of array vs length of set formed from array, or insert elements into a set one by one.'
      },
      {
        level: 3,
        title: 'Level 3: Algorithm',
        content: 'Return `len(nums) != len(set(nums))` or iterate through `nums` maintaining a `seen` set.'
      },
      {
        level: 4,
        title: 'Level 4: Pseudocode',
        content: `seen = HashSet()
for x in nums:
    if x in seen: return True
    seen.add(x)
return False`
      },
      {
        level: 5,
        title: 'Level 5: Partial Code',
        content: `class Solution:\n    def containsDuplicate(self, nums: list[int]) -> bool:\n        return len(nums) != len(...)`
      },
      {
        level: 6,
        title: 'Level 6: Full Solution',
        content: 'Time Complexity: O(N), Space Complexity: O(N).',
        codeSnippet: `class Solution:\n    def containsDuplicate(self, nums: list[int]) -> bool:\n        return len(nums) != len(set(nums))`
      }
    ],
    acceptanceRate: 61.2,
    totalSubmissions: 19800,
    xpReward: 40
  },
  {
    id: 'valid-anagram',
    title: 'Valid Anagram',
    slug: 'valid-anagram',
    difficulty: 'Easy',
    topicId: 'arrays-hashing',
    topicTitle: 'Arrays & Hashing',
    subtopic: 'Frequency Counting',
    tags: ['String', 'Hash Table', 'Sorting'],
    companies: ['Google', 'Amazon', 'Adobe'],
    learningObjectives: ['Master frequency mapping with bounded fixed arrays'],
    description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.`,
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true' },
      { input: 's = "rat", t = "car"', output: 'false' }
    ],
    constraints: ['1 <= s.length, t.length <= 5 * 10^4', 's and t consist of lowercase English letters.'],
    starterCode: {
      python: `class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        pass`,
      cpp: `class Solution {\npublic:\n    bool isAnagram(std::string s, std::string t) {\n        return false;\n    }\n};`,
      java: `class Solution {\n    public boolean isAnagram(String s, String t) {\n        return false;\n    }\n}`,
      c: `bool isAnagram(char* s, char* t) {\n    return false;\n}`
    },
    hints: [
      { level: 1, title: 'Level 1: Length check', content: 'If s and t have different lengths, can they be anagrams?' },
      { level: 2, title: 'Level 2: Character counts', content: 'Count occurrences of each character in s, then decrement using t.' },
      { level: 3, title: 'Level 3: Fixed Array', content: 'Since inputs contain lowercase English letters, an array of size 26 works in O(1) space.' },
      { level: 4, title: 'Level 4: Pseudocode', content: `counts = [0] * 26\nfor c in s: counts[ord(c) - 97] += 1\nfor c in t: counts[ord(c) - 97] -= 1\nreturn all(x == 0 for x in counts)` },
      { level: 5, title: 'Level 5: Partial Code', content: `class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        if len(s) != len(t): return False\n        # Use Counter or 26-size array\n        ...` },
      { level: 6, title: 'Level 6: Full Solution', content: 'Time: O(N), Space: O(1).', codeSnippet: `from collections import Counter\nclass Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        return Counter(s) == Counter(t)` }
    ],
    acceptanceRate: 64.1,
    totalSubmissions: 22100,
    xpReward: 40
  },
  {
    id: 'group-anagrams',
    title: 'Group Anagrams',
    slug: 'group-anagrams',
    difficulty: 'Medium',
    topicId: 'arrays-hashing',
    topicTitle: 'Arrays & Hashing',
    subtopic: 'Tuple Keys & Frequency Hashing',
    tags: ['Array', 'Hash Table', 'String', 'Sorting'],
    companies: ['Amazon', 'Google', 'Meta', 'Uber'],
    learningObjectives: ['Design custom immutable hash keys for grouping equivalent entities'],
    description: `Given an array of strings \`strs\`, group the anagrams together. You can return the answer in **any order**.`,
    examples: [
      {
        input: 'strs = ["eat","tea","tan","ate","nat","bat"]',
        output: '[["bat"],["nat","tan"],["ate","eat","tea"]]'
      },
      { input: 'strs = [""]', output: '[[""]]' },
      { input: 'strs = ["a"]', output: '[["a"]]' }
    ],
    constraints: ['1 <= strs.length <= 10^4', '0 <= strs[i].length <= 100', 'strs[i] consists of lowercase English letters.'],
    starterCode: {
      python: `class Solution:\n    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:\n        pass`,
      cpp: `#include <vector>\n#include <string>\n#include <unordered_map>\n\nclass Solution {\npublic:\n    std::vector<std::vector<std::string>> groupAnagrams(std::vector<std::string>& strs) {\n        return {};\n    }\n};`,
      java: `import java.util.*;\n\nclass Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        return new ArrayList<>();\n    }\n}`,
      c: `char*** groupAnagrams(char** strs, int strsSize, int* returnSize, int** returnColumnSizes) {\n    *returnSize = 0;\n    return NULL;\n}`
    },
    hints: [
      { level: 1, title: 'Level 1: Key Design', content: 'How can you map two different words like "eat" and "tea" to the exact same hash key?' },
      { level: 2, title: 'Level 2: Canonical Representation', content: 'Either sort characters of each string (e.g. "aet") or generate a tuple of 26 character counts.' },
      { level: 3, title: 'Level 3: Hash Map Grouping', content: 'Map `key -> list of original strings`. For each string, compute key, append to map[key].' },
      { level: 4, title: 'Level 4: Pseudocode', content: `groups = defaultdict(list)
for s in strs:
    key = tuple(count_char_frequencies(s))
    groups[key].append(s)
return list(groups.values())` },
      { level: 5, title: 'Level 5: Partial Code', content: `class Solution:\n    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:\n        res = defaultdict(list)\n        for s in strs:\n            count = [0] * 26\n            for c in s:\n                count[ord(c) - ord('a')] += 1\n            res[tuple(count)].append(s)\n        return list(res.values())` },
      { level: 6, title: 'Level 6: Full Solution', content: 'O(N * K) time where N is number of strings and K is max length of a string.', codeSnippet: `from collections import defaultdict\nclass Solution:\n    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:\n        res = defaultdict(list)\n        for s in strs:\n            count = [0] * 26\n            for c in s:\n                count[ord(c) - ord('a')] += 1\n            res[tuple(count)].append(s)\n        return list(res.values())` }
    ],
    acceptanceRate: 67.8,
    totalSubmissions: 15400,
    xpReward: 100
  },
  {
    id: 'top-k-frequent-elements',
    title: 'Top K Frequent Elements',
    slug: 'top-k-frequent-elements',
    difficulty: 'Medium',
    topicId: 'arrays-hashing',
    topicTitle: 'Arrays & Hashing',
    subtopic: 'Bucket Sort & Priority Queue',
    tags: ['Array', 'Hash Table', 'Divide and Conquer', 'Bucket Sort', 'Heap'],
    companies: ['Amazon', 'Google', 'Meta', 'Netflix'],
    learningObjectives: ['Implement O(N) Bucket Sort for frequency selection'],
    description: `Given an integer array \`nums\` and an integer \`k\`, return the \`k\` most frequent elements. You may return the answer in **any order**.`,
    examples: [
      { input: 'nums = [1,1,1,2,2,3], k = 2', output: '[1,2]' },
      { input: 'nums = [1], k = 1', output: '[1]' }
    ],
    constraints: ['1 <= nums.length <= 10^5', 'k is in the range [1, the number of unique elements in the array].', 'The answer is guaranteed to be unique.'],
    starterCode: {
      python: `class Solution:\n    def topKFrequent(self, nums: list[int], k: int) -> list[int]:\n        pass`,
      cpp: `#include <vector>\n#include <unordered_map>\n\nclass Solution {\npublic:\n    std::vector<int> topKFrequent(std::vector<int>& nums, int k) {\n        return {};\n    }\n};`,
      java: `import java.util.*;\n\nclass Solution {\n    public int[] topKFrequent(int[] nums, int k) {\n        return new int[]{};\n    }\n}`,
      c: `int* topKFrequent(int* nums, int numsSize, int k, int* returnSize) {\n    *returnSize = k;\n    int* res = (int*)malloc(k * sizeof(int));\n    return res;\n}`
    },
    hints: [
      { level: 1, title: 'Level 1: Frequency map', content: 'First count frequencies using a hash map: element -> count.' },
      { level: 2, title: 'Level 2: O(N) Bucket Sort idea', content: 'Create buckets where index = frequency count (0 to N). Store elements in their frequency bucket.' },
      { level: 3, title: 'Level 3: Algorithm', content: 'Iterate backwards from bucket N down to 0, collecting elements until k elements are retrieved.' },
      { level: 4, title: 'Level 4: Pseudocode', content: `counts = Counter(nums)\nbuckets = [[] for _ in range(len(nums) + 1)]\nfor num, freq in counts.items(): buckets[freq].append(num)\nres = []\nfor i in range(len(buckets)-1, 0, -1):\n    for num in buckets[i]:\n        res.append(num)\n        if len(res) == k: return res` },
      { level: 5, title: 'Level 5: Partial Code', content: `class Solution:\n    def topKFrequent(self, nums: list[int], k: int) -> list[int]:\n        count = Counter(nums)\n        buckets = [[] for _ in range(len(nums) + 1)]\n        for num, freq in count.items():\n            buckets[freq].append(num)\n        ...` },
      { level: 6, title: 'Level 6: Full Solution', content: 'Bucket Sort achieves linear O(N) time complexity.', codeSnippet: `from collections import Counter\nclass Solution:\n    def topKFrequent(self, nums: list[int], k: int) -> list[int]:\n        count = Counter(nums)\n        buckets = [[] for _ in range(len(nums) + 1)]\n        for num, freq in count.items():\n            buckets[freq].append(num)\n        res = []\n        for i in range(len(buckets) - 1, 0, -1):\n            for n in buckets[i]:\n                res.append(n)\n                if len(res) == k: return res\n        return res` }
    ],
    acceptanceRate: 63.5,
    totalSubmissions: 12900,
    xpReward: 100
  },
  {
    id: 'product-of-array-except-self',
    title: 'Product of Array Except Self',
    slug: 'product-of-array-except-self',
    difficulty: 'Medium',
    topicId: 'arrays-hashing',
    topicTitle: 'Arrays & Hashing',
    subtopic: 'Prefix & Suffix Products',
    tags: ['Array', 'Prefix Sum'],
    companies: ['Amazon', 'Microsoft', 'Google', 'Apple'],
    learningObjectives: ['Compute prefix and suffix accumulator arrays without division in O(N) time'],
    description: `Given an integer array \`nums\`, return an array \`answer\` such that \`answer[i]\` is equal to the product of all the elements of \`nums\` except \`nums[i]\`.\n\nYou must write an algorithm that runs in **O(n)** time and without using the division operation.`,
    examples: [
      { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]' },
      { input: 'nums = [-1,1,0,-3,3]', output: '[0,0,9,0,0]' }
    ],
    constraints: ['2 <= nums.length <= 10^5', '-30 <= nums[i] <= 30', 'The product of any prefix or suffix fits in a 32-bit integer.'],
    starterCode: {
      python: `class Solution:\n    def productExceptSelf(self, nums: list[int]) -> list[int]:\n        pass`,
      cpp: `#include <vector>\n\nclass Solution {\npublic:\n    std::vector<int> productExceptSelf(std::vector<int>& nums) {\n        return {};\n    }\n};`,
      java: `class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        return new int[]{};\n    }\n}`,
      c: `int* productExceptSelf(int* nums, int numsSize, int* returnSize) {\n    *returnSize = numsSize;\n    int* res = (int*)malloc(numsSize * sizeof(int));\n    return res;\n}`
    },
    hints: [
      { level: 1, title: 'Level 1: Prefix and Suffix Decomposition', content: 'For position i, total product except nums[i] = (product of elements before i) * (product of elements after i).' },
      { level: 2, title: 'Level 2: Two Passes', content: 'Pass 1 (Left to Right): store accumulated prefix product at index i. Pass 2 (Right to Left): multiply accumulated suffix product into result.' },
      { level: 3, title: 'Level 3: Algorithm', content: 'Initialize `res` array with 1s. Set `prefix = 1`. For i in range(N): `res[i] = prefix; prefix *= nums[i]`. Set `postfix = 1`. For i in range(N-1, -1, -1): `res[i] *= postfix; postfix *= nums[i]`.' },
      { level: 4, title: 'Level 4: Pseudocode', content: `res = [1] * N
prefix = 1
for i from 0 to N-1:
    res[i] = prefix
    prefix *= nums[i]
postfix = 1
for i from N-1 down to 0:
    res[i] *= postfix
    postfix *= nums[i]
return res` },
      { level: 5, title: 'Level 5: Partial Code', content: `class Solution:\n    def productExceptSelf(self, nums: list[int]) -> list[int]:\n        n = len(nums)\n        res = [1] * n\n        prefix = 1\n        for i in range(n):\n            res[i] = prefix\n            prefix *= nums[i]\n        # Fill in postfix pass...\n        return res` },
      { level: 6, title: 'Level 6: Full Solution', content: 'O(N) Time and O(1) Auxiliary Space (output array does not count as extra space).', codeSnippet: `class Solution:\n    def productExceptSelf(self, nums: list[int]) -> list[int]:\n        n = len(nums)\n        res = [1] * n\n        prefix = 1\n        for i in range(n):\n            res[i] = prefix\n            prefix *= nums[i]\n        postfix = 1\n        for i in range(n - 1, -1, -1):\n            res[i] *= postfix\n            postfix *= nums[i]\n        return res` }
    ],
    acceptanceRate: 65.4,
    totalSubmissions: 18200,
    xpReward: 100
  },
  {
    id: 'first-missing-positive',
    title: 'First Missing Positive',
    slug: 'first-missing-positive',
    difficulty: 'Hard',
    topicId: 'arrays-hashing',
    topicTitle: 'Arrays & Hashing',
    subtopic: 'Cyclic Sort & In-place Hashing',
    tags: ['Array', 'Hash Table'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    learningObjectives: ['Utilize array index range as an in-place hash map to achieve O(N) time and O(1) space'],
    description: `Given an unsorted integer array \`nums\`, return the smallest positive integer that is not present in \`nums\`.\n\nYou must implement an algorithm that runs in **O(n)** time and uses **O(1)** auxiliary space.`,
    examples: [
      { input: 'nums = [1,2,0]', output: '3' },
      { input: 'nums = [3,4,-1,1]', output: '2' },
      { input: 'nums = [7,8,9,11,12]', output: '1' }
    ],
    constraints: ['1 <= nums.length <= 10^5', '-2^31 <= nums[i] <= 2^31 - 1'],
    starterCode: {
      python: `class Solution:\n    def firstMissingPositive(self, nums: list[int]) -> int:\n        pass`,
      cpp: `#include <vector>\n\nclass Solution {\npublic:\n    int firstMissingPositive(std::vector<int>& nums) {\n        return 1;\n    }\n};`,
      java: `class Solution {\n    public int firstMissingPositive(int[] nums) {\n        return 1;\n    }\n}`,
      c: `int firstMissingPositive(int* nums, int numsSize) {\n    return 1;\n}`
    },
    hints: [
      { level: 1, title: 'Level 1: Pigeonhole Principle', content: 'For an array of size N, the first missing positive number MUST lie within the range [1, N + 1].' },
      { level: 2, title: 'Level 2: Cyclic Swap / In-place Hashing', content: 'Try placing each number x (where 1 <= x <= N) at index x - 1 using swaps.' },
      { level: 3, title: 'Level 3: Algorithm', content: 'Loop through array. While `1 <= nums[i] <= N` and `nums[nums[i]-1] != nums[i]`, swap `nums[i]` with `nums[nums[i]-1]`. Afterwards, scan from 0 to N-1: first index where `nums[i] != i + 1` gives missing positive `i + 1`.' },
      { level: 4, title: 'Level 4: Pseudocode', content: `N = len(nums)
for i from 0 to N-1:
    while 1 <= nums[i] <= N and nums[nums[i]-1] != nums[i]:
        swap(nums[i], nums[nums[i]-1])
for i from 0 to N-1:
    if nums[i] != i + 1: return i + 1
return N + 1` },
      { level: 5, title: 'Level 5: Partial Code', content: `class Solution:\n    def firstMissingPositive(self, nums: list[int]) -> int:\n        n = len(nums)\n        for i in range(n):\n            while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:\n                correct_idx = nums[i] - 1\n                nums[i], nums[correct_idx] = nums[correct_idx], nums[i]\n        ...` },
      { level: 6, title: 'Level 6: Full Solution', content: 'Achieves strict O(N) time and O(1) space constraints.', codeSnippet: `class Solution:\n    def firstMissingPositive(self, nums: list[int]) -> int:\n        n = len(nums)\n        for i in range(n):\n            while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
                idx = nums[i] - 1
                nums[i], nums[idx] = nums[idx], nums[i]
        for i in range(n):
            if nums[i] != i + 1:
                return i + 1
        return n + 1` }
    ],
    acceptanceRate: 37.9,
    totalSubmissions: 9800,
    xpReward: 200
  },

  // ==========================================
  // TWO POINTERS & SLIDING WINDOW
  // ==========================================
  {
    id: 'valid-palindrome',
    title: 'Valid Palindrome',
    slug: 'valid-palindrome',
    difficulty: 'Easy',
    topicId: 'two-pointers',
    topicTitle: 'Two Pointers & Sliding Window',
    subtopic: 'Two-Pointer Character Cleanup',
    tags: ['Two Pointers', 'String'],
    companies: ['Meta', 'Amazon', 'Microsoft'],
    learningObjectives: ['Filter non-alphanumeric characters and verify symmetry using converging pointers'],
    description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string \`s\`, return \`true\` *if it is a palindrome, or \`false\` otherwise*.`,
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true', explanation: '"amanaplanacanalpanama" is a palindrome.' },
      { input: 's = "race a car"', output: 'false', explanation: '"raceacar" is not a palindrome.' },
      { input: 's = " "', output: 'true' }
    ],
    constraints: ['1 <= s.length <= 2 * 10^5', 's consists only of printable ASCII characters.'],
    starterCode: {
      python: `class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        pass`,
      cpp: `#include <string>\n#include <cctype>\n\nclass Solution {\npublic:\n    bool isPalindrome(std::string s) {\n        return false;\n    }\n};`,
      java: `class Solution {\n    public boolean isPalindrome(String s) {\n        return false;\n    }\n}`,
      c: `bool isPalindrome(char* s) {\n    return false;\n}`
    },
    hints: [
      { level: 1, title: 'Level 1: Converging Pointers', content: 'Initialize left pointer at start (0) and right pointer at end (len(s)-1).' },
      { level: 2, title: 'Level 2: Skipping Noise', content: 'Advance left pointer while s[left] is not alphanumeric. Move right pointer back while s[right] is not alphanumeric.' },
      { level: 3, title: 'Level 3: Algorithm', content: 'Compare lowercased s[left] and s[right]. If mismatch, return False. Else advance both.' },
      { level: 4, title: 'Level 4: Pseudocode', content: `l, r = 0, len(s) - 1
while l < r:
    while l < r and not s[l].isalnum(): l += 1
    while l < r and not s[r].isalnum(): r -= 1
    if s[l].lower() != s[r].lower(): return False
    l += 1; r -= 1
return True` },
      { level: 5, title: 'Level 5: Partial Code', content: `class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        l, r = 0, len(s) - 1\n        while l < r:\n            while l < r and not s[l].isalnum(): l += 1\n            ...\n            l += 1; r -= 1\n        return True` },
      { level: 6, title: 'Level 6: Full Solution', content: 'O(N) Time and O(1) Auxiliary Space.', codeSnippet: `class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        l, r = 0, len(s) - 1\n        while l < r:\n            while l < r and not s[l].isalnum(): l += 1\n            while l < r and not s[r].isalnum(): r -= 1\n            if s[l].lower() != s[r].lower(): return False\n            l += 1; r -= 1\n        return True` }
    ],
    acceptanceRate: 46.8,
    totalSubmissions: 24100,
    xpReward: 40
  },
  {
    id: 'three-sum',
    title: '3Sum',
    slug: '3sum',
    difficulty: 'Medium',
    topicId: 'two-pointers',
    topicTitle: 'Two Pointers & Sliding Window',
    subtopic: 'Sort + Dual Pointer Convergence',
    tags: ['Array', 'Two Pointers', 'Sorting'],
    companies: ['Amazon', 'Google', 'Meta', 'Apple', 'Microsoft'],
    learningObjectives: ['Combine array sorting with outer loop iteration and inner two-pointer duplicate avoidance'],
    description: `Given an integer array nums, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.\n\nNotice that the solution set must not contain duplicate triplets.`,
    examples: [
      { input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]' },
      { input: 'nums = [0,1,1]', output: '[]' },
      { input: 'nums = [0,0,0]', output: '[[0,0,0]]' }
    ],
    constraints: ['3 <= nums.length <= 3000', '-10^5 <= nums[i] <= 10^5'],
    starterCode: {
      python: `class Solution:\n    def threeSum(self, nums: list[int]) -> list[list[int]]:\n        pass`,
      cpp: `#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    std::vector<std::vector<int>> threeSum(std::vector<int>& nums) {\n        return {};\n    }\n};`,
      java: `import java.util.*;\n\nclass Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        return new ArrayList<>();\n    }\n}`,
      c: `int** threeSum(int* nums, int numsSize, int* returnSize, int** returnColumnSizes) {\n    *returnSize = 0;\n    return NULL;\n}`
    },
    hints: [
      { level: 1, title: 'Level 1: Sorting Strategy', content: 'Sort the array first! Sorting allows us to use two pointers and easily skip duplicate numbers.' },
      { level: 2, title: 'Level 2: Reduce to Two Sum', content: 'Fix the first element `nums[i]`. Now search for two numbers in `nums[i+1:]` that sum to `-nums[i]`.' },
      { level: 3, title: 'Level 3: Duplicate Skipping', content: 'If `i > 0 and nums[i] == nums[i-1]`, skip `i`. In the inner two-pointer loop, after finding a match, advance `l` and decrement `r` past identical values.' },
      { level: 4, title: 'Level 4: Pseudocode', content: `nums.sort()
res = []
for i in range(len(nums)-2):
    if i > 0 and nums[i] == nums[i-1]: continue
    l, r = i + 1, len(nums) - 1
    while l < r:
        total = nums[i] + nums[l] + nums[r]
        if total == 0:
            res.append([nums[i], nums[l], nums[r]])
            while l < r and nums[l] == nums[l+1]: l += 1
            while l < r and nums[r] == nums[r-1]: r -= 1
            l += 1; r -= 1
        elif total < 0: l += 1
        else: r -= 1
return res` },
      { level: 5, title: 'Level 5: Partial Code', content: `class Solution:\n    def threeSum(self, nums: list[int]) -> list[list[int]]:\n        nums.sort()\n        res = []\n        for i in range(len(nums) - 2):\n            if nums[i] > 0: break # Optimization\n            if i > 0 and nums[i] == nums[i-1]: continue\n            ...\n        return res` },
      { level: 6, title: 'Level 6: Full Solution', content: 'O(N²) Time Complexity and O(1) extra space.', codeSnippet: `class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        nums.sort()
        res = []
        for i in range(len(nums) - 2):
            if nums[i] > 0: break
            if i > 0 and nums[i] == nums[i - 1]: continue
            l, r = i + 1, len(nums) - 1
            while l < r:
                s = nums[i] + nums[l] + nums[r]
                if s == 0:
                    res.append([nums[i], nums[l], nums[r]])
                    while l < r and nums[l] == nums[l + 1]: l += 1
                    while l < r and nums[r] == nums[r - 1]: r -= 1
                    l += 1; r -= 1
                elif s < 0: l += 1
                else: r -= 1
        return res` }
    ],
    acceptanceRate: 34.2,
    totalSubmissions: 31200,
    xpReward: 100
  },
  {
    id: 'minimum-window-substring',
    title: 'Minimum Window Substring',
    slug: 'minimum-window-substring',
    difficulty: 'Hard',
    topicId: 'two-pointers',
    topicTitle: 'Two Pointers & Sliding Window',
    subtopic: 'Dynamic Window Contracting',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    companies: ['Google', 'Meta', 'Amazon', 'Microsoft'],
    learningObjectives: ['Contract dynamic sliding window while maintaining requirement match invariants'],
    description: `Given two strings \`s\` and \`t\` of lengths \`m\` and \`n\` respectively, return the **minimum window substring** of \`s\` such that every character in \`t\` (including duplicates) is included in the window. If there is no such substring, return the empty string \`""\`.\n\nThe testcases will be generated such that the answer is **unique**.`,
    examples: [
      { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"', explanation: 'The minimum window substring "BANC" includes A, B, and C from string t.' },
      { input: 's = "a", t = "a"', output: '"a"' },
      { input: 's = "a", t = "aa"', output: '""' }
    ],
    constraints: ['m == s.length', 'n == t.length', '1 <= m, n <= 10^5', 's and t consist of uppercase and lowercase English letters.'],
    starterCode: {
      python: `class Solution:\n    def minWindow(self, s: str, t: str) -> str:\n        pass`,
      cpp: `#include <string>\n#include <unordered_map>\n\nclass Solution {\npublic:\n    std::string minWindow(std::string s, std::string t) {\n        return "";\n    }\n};`,
      java: `import java.util.*;\n\nclass Solution {\n    public String minWindow(String s, String t) {\n        return "";\n    }\n}`,
      c: `char* minWindow(char* s, char* t) {\n    return "";\n}`
    },
    hints: [
      { level: 1, title: 'Level 1: Sliding Window Expansion', content: 'Expand right pointer `r` to include characters until window contains all required characters from `t`.' },
      { level: 2, title: 'Level 2: Contraction phase', content: 'Once all characters are satisfied, increment left pointer `l` to shrink window as much as possible while maintaining validity.' },
      { level: 3, title: 'Level 3: Match Tracker', content: 'Maintain `have` count (how many unique characters satisfy frequency requirement) vs `need` count (total unique characters in `t`).' },
      { level: 4, title: 'Level 4: Pseudocode', content: `target_map = Counter(t)
window_map = defaultdict(int)
have, need = 0, len(target_map)
res, res_len = [-1, -1], float('inf')
l = 0
for r, char in enumerate(s):
    window_map[char] += 1
    if char in target_map and window_map[char] == target_map[char]:
        have += 1
    while have == need:
        if (r - l + 1) < res_len:
            res = [l, r]
            res_len = r - l + 1
        window_map[s[l]] -= 1
        if s[l] in target_map and window_map[s[l]] < target_map[s[l]]:
            have -= 1
        l += 1
return s[res[0]:res[1]+1] if res_len != float('inf') else ""` },
      { level: 5, title: 'Level 5: Partial Code', content: `class Solution:\n    def minWindow(self, s: str, t: str) -> str:\n        if not t or not s: return ""\n        target = Counter(t)\n        window = {}\n        have, need = 0, len(target)\n        ...\n` },
      { level: 6, title: 'Level 6: Full Solution', content: 'O(N + M) Time Complexity and O(N + M) Space.', codeSnippet: `from collections import Counter, defaultdict
class Solution:
    def minWindow(self, s: str, t: str) -> str:
        if not t or not s: return ""
        target = Counter(t)
        window = defaultdict(int)
        have, need = 0, len(target)
        res, res_len = [-1, -1], float('inf')
        l = 0
        for r, c in enumerate(s):
            window[c] += 1
            if c in target and window[c] == target[c]:
                have += 1
            while have == need:
                if (r - l + 1) < res_len:
                    res = [l, r]
                    res_len = r - l + 1
                window[s[l]] -= 1
                if s[l] in target and window[s[l]] < target[s[l]]:
                    have -= 1
                l += 1
        l, r = res
        return s[l:r+1] if res_len != float('inf') else ""` }
    ],
    acceptanceRate: 41.5,
    totalSubmissions: 11200,
    xpReward: 200
  }
];
