import { JudgeTestCase } from "./types";

export const PROBLEM_TEST_CASES: Record<string, JudgeTestCase[]> = {
  "two-sum": [
    {
      id: "tc-1",
      input: "nums = [2,7,11,15]\ntarget = 9",
      expectedOutput: "[0,1]",
      timeLimitMs: 2000,
      memoryLimitMb: 128,
    },
    {
      id: "tc-2",
      input: "nums = [3,2,4]\ntarget = 6",
      expectedOutput: "[1,2]",
      timeLimitMs: 2000,
      memoryLimitMb: 128,
    },
    {
      id: "tc-3",
      input: "nums = [3,3]\ntarget = 6",
      expectedOutput: "[0,1]",
      timeLimitMs: 2000,
      memoryLimitMb: 128,
    },
    {
      id: "tc-4",
      input: "nums = [1,5,8,12,19,25]\ntarget = 27",
      expectedOutput: "[2,4]",
      isHidden: true,
      timeLimitMs: 2000,
      memoryLimitMb: 128,
    },
  ],
  "valid-anagram": [
    {
      id: "tc-1",
      input: "s = 'anagram'\nt = 'nagaram'",
      expectedOutput: "true",
      timeLimitMs: 2000,
      memoryLimitMb: 128,
    },
    {
      id: "tc-2",
      input: "s = 'rat'\nt = 'car'",
      expectedOutput: "false",
      timeLimitMs: 2000,
      memoryLimitMb: 128,
    },
    {
      id: "tc-3",
      input: "s = 'a'\nt = 'ab'",
      expectedOutput: "false",
      isHidden: true,
      timeLimitMs: 2000,
      memoryLimitMb: 128,
    },
  ],
  "container-with-most-water": [
    {
      id: "tc-1",
      input: "height = [1,8,6,2,5,4,8,3,7]",
      expectedOutput: "49",
      timeLimitMs: 2000,
      memoryLimitMb: 128,
    },
    {
      id: "tc-2",
      input: "height = [1,1]",
      expectedOutput: "1",
      timeLimitMs: 2000,
      memoryLimitMb: 128,
    },
  ],
  "reverse-linked-list": [
    {
      id: "tc-1",
      input: "head = [1,2,3,4,5]",
      expectedOutput: "[5,4,3,2,1]",
      timeLimitMs: 2000,
      memoryLimitMb: 128,
    },
    {
      id: "tc-2",
      input: "head = [1,2]",
      expectedOutput: "[2,1]",
      timeLimitMs: 2000,
      memoryLimitMb: 128,
    },
  ],
  "3sum": [
    {
      id: "tc-1",
      input: "nums = [-1,0,1,2,-1,-4]",
      expectedOutput: "[[-1,-1,2],[-1,0,1]]",
      timeLimitMs: 2500,
      memoryLimitMb: 128,
    },
    {
      id: "tc-2",
      input: "nums = [0,1,1]",
      expectedOutput: "[]",
      timeLimitMs: 2000,
      memoryLimitMb: 128,
    },
  ],
};

export function getProblemTestCases(problemSlug: string, isSubmit = false): JudgeTestCase[] {
  const cases = PROBLEM_TEST_CASES[problemSlug] || [
    {
      id: "tc-default-1",
      input: "nums = [2,7,11,15]\ntarget = 9",
      expectedOutput: "[0,1]",
      timeLimitMs: 2000,
      memoryLimitMb: 128,
    },
    {
      id: "tc-default-2",
      input: "nums = [3,2,4]\ntarget = 6",
      expectedOutput: "[1,2]",
      timeLimitMs: 2000,
      memoryLimitMb: 128,
    },
  ];

  if (!isSubmit) {
    // For 'Run Code', run against visible example test cases
    return cases.filter((tc) => !tc.isHidden);
  }
  // For 'Submit', run against all test cases including hidden
  return cases;
}
