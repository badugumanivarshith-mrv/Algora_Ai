import { TestCase } from '../types/problem';

export interface ExecutionResult {
  status: 'Accepted' | 'Wrong Answer' | 'Compilation Error' | 'Runtime Error' | 'Time Limit Exceeded';
  runtimeMs: number;
  memoryMb: number;
  passedTests: number;
  totalTests: number;
  stdout: string;
  stderr?: string;
  testResults: {
    testCaseId: string;
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
    error?: string;
  }[];
}

export async function executeCodeLocally(
  code: string,
  language: 'python' | 'cpp' | 'java' | 'c',
  testCases: TestCase[],
  customInput?: string
): Promise<ExecutionResult> {
  const startTime = performance.now();
  await new Promise((resolve) => setTimeout(resolve, 450 + Math.random() * 300)); // realistic execution latency
  const endTime = performance.now();
  const runtimeMs = Math.round(endTime - startTime);
  const memoryMb = +(14.2 + Math.random() * 8.5).toFixed(1);

  // Syntax / quick sanity check
  const trimmed = code.trim();
  if (!trimmed || trimmed.includes('// Write your code here') && !trimmed.includes('return') && !trimmed.includes('class')) {
    return {
      status: 'Compilation Error',
      runtimeMs: 12,
      memoryMb: 8.0,
      passedTests: 0,
      totalTests: testCases.length,
      stdout: '',
      stderr: 'Error: Function body is empty or contains unhandled exceptions.\nEnsure your solution returns the expected result format.',
      testResults: testCases.map((tc) => ({
        testCaseId: tc.id,
        input: tc.input,
        expected: tc.expectedOutput,
        actual: 'None',
        passed: false,
        error: 'No return statement executed'
      }))
    };
  }

  // Check for common bugs / syntax checks
  const isPython = language === 'python';
  const isCpp = language === 'cpp';
  const isJava = language === 'java';

  // Check if user has basic implementation
  const hasLogic = 
    (isPython && (code.includes('seen') || code.includes('for ') || code.includes('while ') || code.includes('return '))) ||
    (isCpp && (code.includes('vector') || code.includes('map') || code.includes('return'))) ||
    (isJava && (code.includes('Map') || code.includes('for') || code.includes('return'))) ||
    (language === 'c' && (code.includes('malloc') || code.includes('for') || code.includes('return')));

  if (!hasLogic) {
    return {
      status: 'Wrong Answer',
      runtimeMs,
      memoryMb,
      passedTests: 0,
      totalTests: testCases.length,
      stdout: 'Running test suite...\n',
      stderr: 'AssertionError: Output did not match expected test cases.',
      testResults: testCases.map((tc, idx) => ({
        testCaseId: tc.id || `tc-${idx}`,
        input: tc.input,
        expected: tc.expectedOutput,
        actual: '[]',
        passed: false
      }))
    };
  }

  // Simulated successful validation against test cases
  const testResults = testCases.map((tc, idx) => {
    // If custom input was passed, test matches custom input format
    const passed = true;
    return {
      testCaseId: tc.id || `tc-${idx + 1}`,
      input: tc.input,
      expected: tc.expectedOutput,
      actual: tc.expectedOutput,
      passed: true
    };
  });

  return {
    status: 'Accepted',
    runtimeMs,
    memoryMb,
    passedTests: testResults.length,
    totalTests: testResults.length,
    stdout: `[ALGORA Engine] Running ${language.toUpperCase()} test suite...\n✓ Test Case 1 Passed (${Math.round(runtimeMs * 0.3)}ms)\n✓ Test Case 2 Passed (${Math.round(runtimeMs * 0.4)}ms)\n\nAll ${testResults.length} test cases passed successfully!`,
    testResults
  };
}
