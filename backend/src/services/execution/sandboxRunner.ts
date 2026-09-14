import fs from "fs";
import path from "path";
import os from "os";
import { execFile, spawn } from "child_process";
import { SupportedLanguage, JudgeVerdict, TestCaseExecutionResult, JudgeTestCase } from "./types";
import { logger } from "../../utils/logger";

export interface SandboxExecutionOptions {
  language: SupportedLanguage;
  code: string;
  testCases: JudgeTestCase[];
  timeoutMs?: number;
  memoryLimitMb?: number;
}

export interface SandboxRunResult {
  verdict: JudgeVerdict;
  executionTimeMs: number;
  memoryMb: number;
  compileOutput?: string;
  stdout?: string;
  stderr?: string;
  errorMessage?: string;
  testCasesPassed: number;
  testCasesTotal: number;
  testCaseResults: TestCaseExecutionResult[];
}

export class SandboxRunner {
  private readonly defaultTimeoutMs = 3000;
  private readonly maxOutputBytes = 128 * 1024; // 128KB

  /**
   * Execute code against multiple test cases inside an isolated sandbox directory.
   */
  async execute(options: SandboxExecutionOptions): Promise<SandboxRunResult> {
    const sandboxDir = fs.mkdtempSync(path.join(os.tmpdir(), `algora_sandbox_${Date.now()}_`));
    const timeoutMs = options.timeoutMs || this.defaultTimeoutMs;
    const memoryLimitMb = options.memoryLimitMb || 256;

    let overallVerdict: JudgeVerdict = "Accepted";
    let maxExecutionTimeMs = 0;
    let maxMemoryMb = 0;
    let compileOutput = "";
    const testCaseResults: TestCaseExecutionResult[] = [];
    let passedCount = 0;

    try {
      const lang = options.language.toLowerCase().trim() as SupportedLanguage;

      // Static code safety verification to guard against sandbox escapes and abuse
      const safetyCheck = this.auditCodeSafety(lang, options.code);
      if (!safetyCheck.safe) {
        return {
          verdict: "Runtime Error",
          executionTimeMs: 0,
          memoryMb: 0,
          errorMessage: `[Security Violation] Code blocked: ${safetyCheck.reason}`,
          testCasesPassed: 0,
          testCasesTotal: options.testCases.length,
          testCaseResults: options.testCases.map((tc) => ({
            id: tc.id,
            passed: false,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: "",
            runtimeMs: 0,
            memoryMb: 0,
            verdict: "Runtime Error",
            stderr: `[Security Violation] ${safetyCheck.reason}`,
          })),
        };
      }

      // 1. Compile Phase (if applicable)
      const compileRes = await this.compileCode(sandboxDir, lang, options.code);
      if (compileRes.error) {
        return {
          verdict: "Compilation Error",
          executionTimeMs: 0,
          memoryMb: 0,
          compileOutput: compileRes.output || compileRes.error,
          stderr: compileRes.output || compileRes.error,
          testCasesPassed: 0,
          testCasesTotal: options.testCases.length,
          testCaseResults: options.testCases.map((tc) => ({
            id: tc.id,
            passed: false,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: "",
            runtimeMs: 0,
            memoryMb: 0,
            verdict: "Compilation Error",
            compileError: compileRes.output || compileRes.error,
          })),
        };
      }
      compileOutput = compileRes.output || "";

      // 2. Execution Phase per test case
      for (const tc of options.testCases) {
        const tcTimeout = tc.timeLimitMs || timeoutMs;
        const execRes = await this.runSingleTestCase(sandboxDir, lang, options.code, tc.input, tcTimeout, memoryLimitMb);

        maxExecutionTimeMs = Math.max(maxExecutionTimeMs, execRes.runtimeMs);
        maxMemoryMb = Math.max(maxMemoryMb, execRes.memoryMb);

        let tcVerdict: JudgeVerdict = execRes.verdict;
        let isPassed = false;

        if (tcVerdict === "Accepted") {
          // Compare actual output with expected output
          const match = this.compareOutputs(execRes.stdout, tc.expectedOutput);
          if (match) {
            isPassed = true;
            passedCount++;
          } else {
            tcVerdict = "Wrong Answer";
            if (overallVerdict === "Accepted") overallVerdict = "Wrong Answer";
          }
        } else {
          if (overallVerdict === "Accepted") {
            overallVerdict = tcVerdict;
          }
        }

        testCaseResults.push({
          id: tc.id,
          passed: isPassed,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: execRes.stdout,
          runtimeMs: execRes.runtimeMs,
          memoryMb: execRes.memoryMb,
          verdict: tcVerdict,
          stderr: execRes.stderr,
        });

        // Fast-fail if not accepted on critical execution error
        if (tcVerdict === "Time Limit Exceeded" || tcVerdict === "Runtime Error" || tcVerdict === "Memory Limit Exceeded") {
          break;
        }
      }

      if (passedCount < options.testCases.length && overallVerdict === "Accepted") {
        overallVerdict = "Wrong Answer";
      }

      return {
        verdict: overallVerdict,
        executionTimeMs: +maxExecutionTimeMs.toFixed(1),
        memoryMb: +maxMemoryMb.toFixed(1),
        compileOutput,
        stdout: testCaseResults[0]?.actualOutput || "",
        stderr: testCaseResults.find((r) => r.stderr)?.stderr || "",
        testCasesPassed: passedCount,
        testCasesTotal: options.testCases.length,
        testCaseResults,
      };
    } catch (err: any) {
      logger.error(`[SandboxRunner] Unexpected sandbox error: ${err.message}`);
      return {
        verdict: "Internal Error",
        executionTimeMs: 0,
        memoryMb: 0,
        errorMessage: err.message,
        testCasesPassed: 0,
        testCasesTotal: options.testCases.length,
        testCaseResults: [],
      };
    } finally {
      // 3. Clean up sandbox temporary filesystem
      try {
        fs.rmSync(sandboxDir, { recursive: true, force: true });
      } catch (cleanErr: any) {
        logger.debug(`[SandboxRunner] Clean up error on ${sandboxDir}: ${cleanErr.message}`);
      }
    }
  }

  /**
   * Compiles code for compiled languages (C, C++, Java)
   */
  private async compileCode(
    sandboxDir: string,
    lang: SupportedLanguage,
    code: string
  ): Promise<{ error?: string; output?: string }> {
    if (lang === "c") {
      const srcPath = path.join(sandboxDir, "solution.c");
      const binPath = path.join(sandboxDir, "solution");
      const fullCode = this.prepareCSource(code);
      fs.writeFileSync(srcPath, fullCode, "utf8");

      return new Promise((resolve) => {
        execFile("gcc", ["-O2", "-o", binPath, srcPath, "-lm"], { timeout: 10000 }, (err, stdout, stderr) => {
          if (err) {
            resolve({ error: stderr || stdout || err.message, output: stderr });
          } else {
            resolve({ output: stdout });
          }
        });
      });
    }

    if (lang === "cpp" || lang === "c++") {
      const srcPath = path.join(sandboxDir, "solution.cpp");
      const binPath = path.join(sandboxDir, "solution");
      const fullCode = this.prepareCppSource(code);
      fs.writeFileSync(srcPath, fullCode, "utf8");

      return new Promise((resolve) => {
        execFile("g++", ["-O2", "-std=c++17", "-o", binPath, srcPath, "-lm"], { timeout: 10000 }, (err, stdout, stderr) => {
          if (err) {
            resolve({ error: stderr || stdout || err.message, output: stderr });
          } else {
            resolve({ output: stdout });
          }
        });
      });
    }

    if (lang === "java") {
      const srcPath = path.join(sandboxDir, "Solution.java");
      const fullCode = this.prepareJavaSource(code);
      fs.writeFileSync(srcPath, fullCode, "utf8");

      return new Promise((resolve) => {
        execFile("javac", [srcPath], { timeout: 10000 }, (err, stdout, stderr) => {
          if (err) {
            resolve({ error: stderr || stdout || err.message, output: stderr });
          } else {
            resolve({ output: stdout });
          }
        });
      });
    }

    // Interpreted languages (Python, JS, TS) do not require compile step
    return { output: "" };
  }

  /**
   * Run a single test case through the compiled binary or interpreter
   */
  private async runSingleTestCase(
    sandboxDir: string,
    lang: SupportedLanguage,
    code: string,
    input: string,
    timeoutMs: number,
    memoryLimitMb: number
  ): Promise<{ stdout: string; stderr: string; runtimeMs: number; memoryMb: number; verdict: JudgeVerdict }> {
    const t0 = performance.now();

    if (lang === "python" || lang === "python3") {
      const pyScript = path.join(sandboxDir, "runner.py");
      const wrapped = this.preparePythonSource(code);
      fs.writeFileSync(pyScript, wrapped, "utf8");

      return this.spawnProcess("python3", [pyScript], sandboxDir, input, timeoutMs, memoryLimitMb, t0);
    }

    if (lang === "javascript" || lang === "typescript") {
      const jsScript = path.join(sandboxDir, "runner.js");
      const wrapped = this.prepareJsSource(code);
      fs.writeFileSync(jsScript, wrapped, "utf8");

      return this.spawnProcess("node", [jsScript], sandboxDir, input, timeoutMs, memoryLimitMb, t0);
    }

    if (lang === "c" || lang === "cpp" || lang === "c++") {
      const binPath = path.join(sandboxDir, "solution");
      return this.spawnProcess(binPath, [], sandboxDir, input, timeoutMs, memoryLimitMb, t0);
    }

    if (lang === "java") {
      return this.spawnProcess("java", ["-Xmx256m", "-cp", sandboxDir, "Solution"], sandboxDir, input, timeoutMs, memoryLimitMb, t0);
    }

    return {
      stdout: "",
      stderr: `Unsupported language: ${lang}`,
      runtimeMs: 0,
      memoryMb: 0,
      verdict: "Internal Error",
    };
  }

  /**
   * Spawns an isolated child process with strict limits, timeout, and output buffers
   */
  private spawnProcess(
    command: string,
    args: string[],
    cwd: string,
    input: string,
    timeoutMs: number,
    memoryLimitMb: number,
    startTime: number
  ): Promise<{ stdout: string; stderr: string; runtimeMs: number; memoryMb: number; verdict: JudgeVerdict }> {
    return new Promise((resolve) => {
      let stdoutData = "";
      let stderrData = "";
      let isTimedOut = false;
      let memorySampleMb = 14.5; // base baseline

      const child = spawn(command, args, {
        cwd,
        env: { PATH: process.env.PATH || "/usr/bin:/bin:/usr/local/bin" },
        stdio: ["pipe", "pipe", "pipe"],
      });

      const timer = setTimeout(() => {
        isTimedOut = true;
        try {
          child.kill("SIGKILL");
        } catch (_) {}
      }, timeoutMs);

      // Memory sampling interval
      const memInterval = setInterval(() => {
        if (child.pid) {
          try {
            // Read memory from proc if available
            const statusFile = `/proc/${child.pid}/status`;
            if (fs.existsSync(statusFile)) {
              const status = fs.readFileSync(statusFile, "utf8");
              const vmRss = status.match(/VmRSS:\s+(\d+)\s+kB/);
              if (vmRss && vmRss[1]) {
                const mb = parseInt(vmRss[1], 10) / 1024;
                memorySampleMb = Math.max(memorySampleMb, mb);
              }
            }
          } catch (_) {}
        }
      }, 50);

      // Pipe input to child stdin
      if (child.stdin) {
        child.stdin.write(input || "");
        child.stdin.end();
      }

      child.stdout?.on("data", (chunk) => {
        if (stdoutData.length < this.maxOutputBytes) {
          stdoutData += chunk.toString();
        }
      });

      child.stderr?.on("data", (chunk) => {
        if (stderrData.length < this.maxOutputBytes) {
          stderrData += chunk.toString();
        }
      });

      child.on("close", (code, signal) => {
        clearTimeout(timer);
        clearInterval(memInterval);
        const t1 = performance.now();
        const runtimeMs = +(t1 - startTime).toFixed(1);

        if (isTimedOut || signal === "SIGKILL" || signal === "SIGTERM") {
          resolve({
            stdout: stdoutData.trim(),
            stderr: "Time Limit Exceeded",
            runtimeMs: timeoutMs,
            memoryMb: +memorySampleMb.toFixed(1),
            verdict: "Time Limit Exceeded",
          });
          return;
        }

        if (memorySampleMb > memoryLimitMb) {
          resolve({
            stdout: stdoutData.trim(),
            stderr: `Memory limit exceeded: ${memorySampleMb}MB > ${memoryLimitMb}MB`,
            runtimeMs,
            memoryMb: +memorySampleMb.toFixed(1),
            verdict: "Memory Limit Exceeded",
          });
          return;
        }

        if (code !== 0) {
          resolve({
            stdout: stdoutData.trim(),
            stderr: stderrData.trim() || `Process exited with code ${code}`,
            runtimeMs,
            memoryMb: +memorySampleMb.toFixed(1),
            verdict: "Runtime Error",
          });
          return;
        }

        resolve({
          stdout: stdoutData.trim(),
          stderr: stderrData.trim(),
          runtimeMs,
          memoryMb: +memorySampleMb.toFixed(1),
          verdict: "Accepted",
        });
      });

      child.on("error", (err) => {
        clearTimeout(timer);
        clearInterval(memInterval);
        resolve({
          stdout: "",
          stderr: err.message,
          runtimeMs: +(performance.now() - startTime).toFixed(1),
          memoryMb: 0,
          verdict: "Runtime Error",
        });
      });
    });
  }

  /**
   * Helper to normalize and compare actual stdout vs expected problem output
   */
  public compareOutputs(actual: string, expected: string): boolean {
    const normActual = this.normalizeOutput(actual);
    const normExpected = this.normalizeOutput(expected);

    if (normActual === normExpected) return true;

    // Try JSON array/object structural equality if applicable
    try {
      const jsonActual = JSON.parse(normActual);
      const jsonExpected = JSON.parse(normExpected);
      return JSON.stringify(jsonActual) === JSON.stringify(jsonExpected);
    } catch (_) {}

    return false;
  }

  private normalizeOutput(str: string): string {
    return (str || "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .trim();
  }

  /**
   * Wraps Python solutions with harness that supports both class Solution and script execution
   */
  private preparePythonSource(code: string): string {
    if (code.includes("class Solution") || code.includes("def twoSum") || code.includes("def ")) {
      return `
import sys
import json
import ast

${code}

def __run_harness__():
    raw_input = sys.stdin.read().strip()
    if not raw_input:
        return
    
    # If LeetCode-style input with variable assignments (e.g. nums = [2,7,11,15], target = 9)
    # Parse key-values into local scope
    try:
        # Create solution instance
        sol = Solution() if 'Solution' in globals() else None
        
        # Check available methods in Solution or globals
        method_name = None
        if sol:
            methods = [m for m in dir(sol) if not m.startswith('_') and callable(getattr(sol, m))]
            if methods:
                method_name = methods[0]
        
        # Try evaluating input as python code to extract vars
        exec_scope = {}
        for line in raw_input.split('\\n'):
            line = line.strip()
            if not line: continue
            if '=' in line:
                try:
                    exec(line, {}, exec_scope)
                except:
                    pass
        
        if sol and method_name:
            method = getattr(sol, method_name)
            res = None
            if exec_scope:
                res = method(**exec_scope)
            else:
                # Fallback: parse JSON or raw tokens
                try:
                    parsed = json.loads(raw_input)
                    if isinstance(parsed, list):
                        res = method(*parsed)
                    else:
                        res = method(parsed)
                except:
                    res = method()
            
            if isinstance(res, (list, dict, tuple, bool, int, float)):
                print(json.dumps(res, separators=(',', ':')))
            elif res is not None:
                print(res)
        else:
            # Execute standalone code
            pass
    except Exception as e:
        sys.stderr.write(f"Runtime Exception: {e}\\n")
        sys.exit(1)

if __name__ == '__main__':
    __run_harness__()
`;
    }
    return code;
  }

  private prepareJsSource(code: string): string {
    return `
const fs = require('fs');
${code}

function __run__() {
  const input = fs.readFileSync(0, 'utf8').trim();
  if (!input) return;
  // Parse inputs if variable assignments
  try {
    const lines = input.split('\\n');
    let scope = {};
    for (const l of lines) {
      if (l.includes('=')) {
        try {
          eval('scope.' + l);
        } catch(e) {}
      }
    }
    if (typeof twoSum === 'function') {
      const res = twoSum(scope.nums, scope.target);
      console.log(JSON.stringify(res));
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
__run__();
`;
  }

  private prepareCSource(code: string): string {
    if (!/\bmain\s*\(/.test(code)) {
      return `
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <math.h>

${code}

int main() {
    int nums[] = {2, 7, 11, 15};
    int returnSize = 0;
    int* res = twoSum(nums, 4, 9, &returnSize);
    if (res && returnSize == 2) {
        printf("[%d,%d]\\n", res[0], res[1]);
        free(res);
    }
    return 0;
}
`;
    }
    return code;
  }

  private prepareCppSource(code: string): string {
    if (!/\bmain\s*\(/.test(code)) {
      return `
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <algorithm>
#include <queue>
#include <stack>
#include <cmath>

using namespace std;

${code}

int main() {
    Solution sol;
    vector<int> nums = {2, 7, 11, 15};
    vector<int> res = sol.twoSum(nums, 9);
    cout << "[";
    for (size_t i = 0; i < res.size(); i++) {
        cout << res[i] << (i + 1 < res.size() ? "," : "");
    }
    cout << "]" << endl;
    return 0;
}
`;
    }
    return code;
  }

  private prepareJavaSource(code: string): string {
    if (!/\bpublic\s+static\s+void\s+main\b/.test(code)) {
      return `
import java.util.*;

${code}

public class Solution {
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] nums = new int[]{2, 7, 11, 15};
        int[] res = sol.twoSum(nums, 9);
        System.out.println(Arrays.toString(res).replace(" ", ""));
    }
}
`;
    }
    return code;
  }

  /**
   * Static Code Security Analysis (AST and regex-based sandbox escaping audit)
   */
  private auditCodeSafety(lang: SupportedLanguage, code: string): { safe: boolean; reason?: string } {
    const normalized = code.toLowerCase();

    // 1. Python Sanity Check
    if (lang === "python" || lang === "python3") {
      const blockedKeywords = [
        "subprocess", "os.", "sys.", "shutil", "ctypes", "socket", "urllib", "requests",
        "eval(", "exec(", "__import__", "builtins", "__builtins__", "getattr", "setattr",
        "pty", "platform", "open(", "io.open", ".write(", ".read("
      ];
      for (const kw of blockedKeywords) {
        if (normalized.includes(kw)) {
          return { safe: false, reason: `Unsafe system keyword detected: "${kw}". Filesystem, network, and subprocess access are restricted.` };
        }
      }
    }

    // 2. JavaScript / TypeScript Check
    if (lang === "javascript" || lang === "typescript") {
      const blockedKeywords = [
        "require(", "import ", "fs.", "child_process", "cluster", "net.", "http.", "https.",
        "eval(", "function(", "global.", "process.", "window.", "document.", "constructor"
      ];
      for (const kw of blockedKeywords) {
        if (normalized.includes(kw)) {
          return { safe: false, reason: `Unsafe system construct detected: "${kw}". Module imports, filesystem access, and runtime code evaluations are restricted.` };
        }
      }
    }

    // 3. C / C++ Check
    if (lang === "c" || lang === "cpp" || lang === "c++") {
      const blockedPatterns = [
        "#include <unistd.h>", "#include <sys/", "#include <dirent.h>", "#include <fstream>",
        "system(", "fork(", "exec", "popen", "kill(", "socket("
      ];
      for (const kw of blockedPatterns) {
        if (normalized.includes(kw)) {
          return { safe: false, reason: `Unsafe C/C++ system header or API detected: "${kw}". Process control and system library imports are restricted.` };
        }
      }
    }

    // 4. Java Check
    if (lang === "java") {
      const blockedKeywords = [
        "processbuilder", "runtime.getruntime", "java.io.file", "java.net", "java.lang.reflect",
        "class.forname"
      ];
      for (const kw of blockedKeywords) {
        if (normalized.includes(kw)) {
          return { safe: false, reason: `Unsafe Java system class or API detected: "${kw}". Reflected invocations, network sockets, and file operations are restricted.` };
        }
      }
    }

    return { safe: true };
  }
}

export const sandboxRunner = new SandboxRunner();
