import { GoogleGenAI } from "@google/genai";
import {
  IAIProvider,
  AIChatOptions,
  AIChatResult,
  HintOptions,
  CodeReviewOptions,
  CodeReviewResult,
  ComplexityAnalysisResult,
} from "./aiProvider";
import { MonitoringService } from "../monitoringService";
import { logger } from "../../utils/logger";

export class GeminiAIProvider implements IAIProvider {
  public readonly name = "Gemini AI";
  private client: GoogleGenAI | null = null;
  private readonly defaultModel = "gemini-3.6-flash";
  private readonly fallbackModels = ["gemini-3.7-flash", "gemini-3.8-flash", "gemini-flash-latest"];

  private getClient(): GoogleGenAI | null {
    if (!this.client && process.env.GEMINI_API_KEY) {
      try {
        this.client = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });
      } catch (err: any) {
        logger.warn(`[GeminiAIProvider] Failed to initialize GoogleGenAI client: ${err?.message || err}`);
        this.client = null;
      }
    }
    return this.client;
  }

  public isAvailable(): boolean {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  /**
   * Helper to execute Gemini generation with model fallback and automatic retry
   * to gracefully handle 503 (High Demand / Spikes) and 429 (Rate Limits).
   */
  private async generateWithFallback(
    client: GoogleGenAI,
    params: {
      contents: any;
      config?: any;
    }
  ): Promise<any> {
    const candidateModels = [this.defaultModel, ...this.fallbackModels];
    let lastError: any = null;

    for (const model of candidateModels) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await client.models.generateContent({
            model,
            contents: params.contents,
            config: params.config,
          });
          if (response) return { response, model };
        } catch (err: any) {
          lastError = err;
          const isModelNotFound =
            err?.status === "NOT_FOUND" ||
            err?.message?.includes("404") ||
            err?.message?.includes("no longer available");

          const isRetryable =
            isModelNotFound ||
            err?.status === "UNAVAILABLE" ||
            err?.message?.includes("503") ||
            err?.message?.includes("high demand") ||
            err?.message?.includes("429") ||
            err?.message?.includes("RESOURCE_EXHAUSTED");

          if (!isModelNotFound && isRetryable && attempt === 0) {
            // Short backoff before retry
            await new Promise((r) => setTimeout(r, 400));
            continue;
          }
          // If model failed on retryable or model retirement error, try next candidate model
          if (isRetryable) break;
          // For non-retryable errors (e.g. auth/param), throw immediately
          throw err;
        }
      }
    }
    throw lastError;
  }

  public async generateMentorResponse(prompt: string, options: AIChatOptions = {}): Promise<AIChatResult> {
    const startTime = Date.now();
    const client = this.getClient();

    const systemInstruction = `You are Algora's premier Socratic Algorithm & Data Structures AI Mentor.
Your mission is to guide students to deep algorithmic mastery through inquiry, pattern recognition, invariant verification, and debugging discipline.

CRITICAL PEDAGOGICAL & CONTEST SAFETY RULES:
1. NEVER output a complete, copy-pasteable full code solution to the user's active problem or contest challenge.
2. If the user asks for "the answer" or full code, explain the conceptual recurrence or state transition, ask a guiding question, and show only minimal 2-3 line pseudocode skeletons or conceptual diagrams.
3. If contest mode is active (${options.isContestMode ? "YES" : "NO"}), provide strictly high-level algorithmic hints and asymptotic checks, NEVER code templates.
4. Keep explanations concise, mathematically clear, friendly, and structured with bold highlights and bullet points.
5. Emphasize Time/Space complexity, edge cases (empty array, single element, negative numbers, overflow), and invariants.`;

    if (!client) {
      const latency = Date.now() - startTime;
      const fallbackText = this.getFallbackMentorResponse(prompt, options);
      return {
        text: fallbackText,
        type: "text",
        promptTokens: 120,
        completionTokens: 180,
        totalTokens: 300,
        model: "deterministic-socratic-fallback",
        latencyMs: latency,
        provider: "Algora Built-in Engine",
      };
    }

    try {
      const contents: string[] = [];
      if (options.topic) {
        contents.push(`[Topic Context: ${options.topic}]`);
      }
      if (options.problemTitle) {
        contents.push(`[Problem: ${options.problemTitle}]`);
      }
      if (options.problemDescription) {
        contents.push(`[Problem Description: ${options.problemDescription.slice(0, 1000)}]`);
      }
      if (options.userCode) {
        contents.push(`[Student Code (${options.language || "Unknown"}):\n${options.userCode.slice(0, 2000)}\n]`);
      }
      if (options.history && options.history.length > 0) {
        const historyText = options.history
          .map((m) => `${m.role === "user" ? "Student" : "Mentor"}: ${m.content}`)
          .join("\n");
        contents.push(`[Conversation History:\n${historyText}\n]`);
      }

      contents.push(`Student Query: ${prompt}`);

      const { response, model: usedModel } = await this.generateWithFallback(client, {
        contents: contents.join("\n\n"),
        config: {
          systemInstruction,
          temperature: options.temperature ?? 0.6,
        },
      });

      const latencyMs = Date.now() - startTime;
      const text = response.text || "I'm reasoning through your algorithm. Let's inspect the invariant at your loop boundary.";

      const promptTokens = response.usageMetadata?.promptTokenCount || Math.ceil(contents.join(" ").length / 4);
      const completionTokens = response.usageMetadata?.candidatesTokenCount || Math.ceil(text.length / 4);
      const totalTokens = promptTokens + completionTokens;

      MonitoringService.recordAIUsage({
        userId: options.userId,
        feature: "mentor_chat",
        model: usedModel,
        promptTokens,
        completionTokens,
        totalTokens,
        latencyMs,
        status: "success",
      });

      return {
        text,
        type: text.includes("```") ? "code" : "text",
        promptTokens,
        completionTokens,
        totalTokens,
        model: usedModel,
        latencyMs,
        provider: "Google Gemini",
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      logger.warn(`[GeminiAIProvider] Mentor response fallback activated: ${err.message}`);

      MonitoringService.recordAIUsage({
        userId: options.userId,
        feature: "mentor_chat",
        model: this.defaultModel,
        promptTokens: 50,
        completionTokens: 50,
        totalTokens: 100,
        latencyMs,
        status: "error",
        errorMessage: err.message || "Unknown error",
      });

      return {
        text: this.getFallbackMentorResponse(prompt, options),
        type: "text",
        promptTokens: 50,
        completionTokens: 100,
        totalTokens: 150,
        model: "fallback-recovery",
        latencyMs,
        provider: "Algora Socratic Engine",
      };
    }
  }

  public async generateProgressiveHint(options: HintOptions): Promise<{ hint: string; level: number; followUpQuestion: string }> {
    const startTime = Date.now();
    const client = this.getClient();

    const tierDescriptions = {
      1: "Tier 1: High-level intuition & mental model without naming specific complex data structures.",
      2: "Tier 2: Subproblem breakdown, state variables, or auxiliary data structure choice (e.g. Monotonic Stack, Two Pointers).",
      3: "Tier 3: Boundary edge cases, recurrence formula, or step-by-step invariant check (STRICTLY NO FULL CODE).",
    };

    if (!client) {
      return this.getFallbackHint(options);
    }

    try {
      const systemInstruction = `You are an expert competitive programming coach delivering a progressive hint.
Target Level: ${tierDescriptions[options.hintLevel]}
CRITICAL RULE: DO NOT provide the full solution code under any circumstances. Formulate your response as an empowering insight followed by a diagnostic question.`;

      const prompt = `Problem: ${options.problemTitle}
Description: ${options.problemDescription.slice(0, 1200)}
${options.userCode ? `Current Student Code:\n${options.userCode.slice(0, 1500)}` : ""}

Generate a level ${options.hintLevel} progressive hint.`;

      const { response, model: usedModel } = await this.generateWithFallback(client, {
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      const text = response.text || "";
      const latencyMs = Date.now() - startTime;
      const promptTokens = response.usageMetadata?.promptTokenCount || 200;
      const completionTokens = response.usageMetadata?.candidatesTokenCount || 150;

      MonitoringService.recordAIUsage({
        feature: "hint",
        model: usedModel,
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        latencyMs,
        status: "success",
      });

      return {
        hint: text,
        level: options.hintLevel,
        followUpQuestion: `How does this transition affect your auxiliary space complexity?`,
      };
    } catch (err: any) {
      logger.warn(`[GeminiAIProvider] Hint generation fallback activated: ${err.message}`);
      return this.getFallbackHint(options);
    }
  }

  public async generateCodeReview(options: CodeReviewOptions): Promise<CodeReviewResult> {
    const startTime = Date.now();
    const client = this.getClient();

    if (!client) {
      return this.analyzeCodeReviewOffline(options);
    }

    try {
      const systemInstruction = `You are a Senior Staff Software Engineer and Technical Interview Evaluator.
Review the provided code solution for correctness, algorithmic efficiency, clean code style, and edge case safety.
Respond ONLY with a valid JSON object matching this structure:
{
  "overview": "string",
  "strengths": ["string", "string"],
  "improvements": ["string", "string"],
  "edgeCases": ["string", "string"],
  "idiomaticTips": ["string"],
  "timeComplexityEstimate": "string",
  "spaceComplexityEstimate": "string"
}`;

      const prompt = `Problem Title: ${options.problemTitle || "Algorithm Challenge"}
Language: ${options.language}
Code:
${options.code}

Review this code thoroughly.`;

      const { response, model: usedModel } = await this.generateWithFallback(client, {
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      });

      const latencyMs = Date.now() - startTime;
      const parsed = JSON.parse(response.text || "{}");

      MonitoringService.recordAIUsage({
        feature: "code_review",
        model: usedModel,
        promptTokens: response.usageMetadata?.promptTokenCount || 300,
        completionTokens: response.usageMetadata?.candidatesTokenCount || 200,
        totalTokens:
          (response.usageMetadata?.promptTokenCount || 300) +
          (response.usageMetadata?.candidatesTokenCount || 200),
        latencyMs,
        status: "success",
      });

      return {
        overview: parsed.overview || "Review completed.",
        strengths: Array.isArray(parsed.strengths) && parsed.strengths.length ? parsed.strengths : ["Clean structural logic"],
        improvements: Array.isArray(parsed.improvements) && parsed.improvements.length ? parsed.improvements : ["Check edge boundaries"],
        edgeCases: Array.isArray(parsed.edgeCases) && parsed.edgeCases.length ? parsed.edgeCases : ["Empty input bounds"],
        idiomaticTips: Array.isArray(parsed.idiomaticTips) && parsed.idiomaticTips.length ? parsed.idiomaticTips : ["Follow language idioms"],
        timeComplexityEstimate: parsed.timeComplexityEstimate || "O(N)",
        spaceComplexityEstimate: parsed.spaceComplexityEstimate || "O(1)",
      };
    } catch (err: any) {
      logger.warn(`[GeminiAIProvider] Upstream high demand/unavailable during code review (${err.message}), using static analysis fallback`);
      return this.analyzeCodeReviewOffline(options);
    }
  }

  public async generateComplexityAnalysis(
    code: string,
    language: string,
    problemContext?: string
  ): Promise<ComplexityAnalysisResult> {
    const startTime = Date.now();
    const client = this.getClient();

    if (!client) {
      return this.analyzeComplexityOffline(code, language);
    }

    try {
      const systemInstruction = `You are a Theoretical Computer Science Professor specializing in asymptotic analysis and recurrence relations.
Analyze the provided code and return ONLY a valid JSON object matching:
{
  "timeComplexity": "string (e.g. O(N log N))",
  "timeExplanation": "string",
  "spaceComplexity": "string (e.g. O(N))",
  "spaceExplanation": "string",
  "bottlenecks": ["string", "string"],
  "optimizationTips": ["string", "string"]
}`;

      const prompt = `Language: ${language}
Context: ${problemContext || "General Algorithm"}
Code to Analyze:
${code}`;

      const { response, model: usedModel } = await this.generateWithFallback(client, {
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      });

      const latencyMs = Date.now() - startTime;
      const parsed = JSON.parse(response.text || "{}");

      MonitoringService.recordAIUsage({
        feature: "complexity",
        model: usedModel,
        promptTokens: response.usageMetadata?.promptTokenCount || 250,
        completionTokens: response.usageMetadata?.candidatesTokenCount || 150,
        totalTokens:
          (response.usageMetadata?.promptTokenCount || 250) +
          (response.usageMetadata?.candidatesTokenCount || 150),
        latencyMs,
        status: "success",
      });

      return {
        timeComplexity: parsed.timeComplexity || "O(N)",
        timeExplanation: parsed.timeExplanation || "Linear time complexity based on loop structure.",
        spaceComplexity: parsed.spaceComplexity || "O(1)",
        spaceExplanation: parsed.spaceExplanation || "Constant auxiliary space allocation.",
        bottlenecks: Array.isArray(parsed.bottlenecks) ? parsed.bottlenecks : [],
        optimizationTips: Array.isArray(parsed.optimizationTips) ? parsed.optimizationTips : [],
      };
    } catch (err: any) {
      logger.warn(`[GeminiAIProvider] Upstream high demand/unavailable during complexity analysis (${err.message}), using static analysis fallback`);
      return this.analyzeComplexityOffline(code, language);
    }
  }

  // --- Static Algorithmic Heuristics & Deterministic Fallbacks ---

  private analyzeComplexityOffline(code: string, language: string): ComplexityAnalysisResult {
    const codeStr = code || "";
    const forCount = (codeStr.match(/for\s*\(|for\s+[a-zA-Z0-9_]+\s+in/g) || []).length;
    const whileCount = (codeStr.match(/while\s*\(/g) || []).length;
    const hasSort = /\.sort\(|sorted\(|sort\(/i.test(codeStr);
    const hasBinarySearch = />>>|mid\s*=|binary_search|bisect/i.test(codeStr);
    const hasMapOrDict = /Map<|unordered_map|dict\(|\{[\s\S]*\}|seen\s*=/i.test(codeStr);
    const hasNested = /(for[\s\S]{1,80}for)|(while[\s\S]{1,80}while)|(for[\s\S]{1,80}while)/.test(codeStr);

    let timeComplexity = "O(N)";
    let timeExplanation = "Single sequential loop pass through the primary input elements.";
    let spaceComplexity = "O(1)";
    let spaceExplanation = "Constant auxiliary space with fixed pointer allocations.";

    if (hasNested) {
      timeComplexity = "O(N²)";
      timeExplanation = "Quadratic runtime resulting from nested loop iteration over the input collection.";
    } else if (hasSort) {
      timeComplexity = "O(N log N)";
      timeExplanation = "Dominated by comparison-based sorting operation across N elements.";
    } else if (hasBinarySearch) {
      timeComplexity = "O(log N)";
      timeExplanation = "Logarithmic search space reduction by halving the active interval per iteration.";
    } else if (forCount === 0 && whileCount === 0) {
      timeComplexity = "O(1)";
      timeExplanation = "Direct arithmetic or constant-time hash lookup with no iterative loops.";
    }

    if (hasMapOrDict) {
      spaceComplexity = "O(N)";
      spaceExplanation = "Linear auxiliary space utilized for hash table/dictionary lookups.";
    }

    return {
      timeComplexity,
      timeExplanation,
      spaceComplexity,
      spaceExplanation,
      bottlenecks: hasNested
        ? ["Nested loop structure creating O(N²) quadratic cost on large arrays"]
        : ["Sequential memory access patterns"],
      optimizationTips: hasNested
        ? ["Consider using a Hash Map or Frequency Array to reduce lookup from O(N) to O(1)"]
        : ["Ensure variables are allocated outside loop scopes where applicable"],
    };
  }

  private analyzeCodeReviewOffline(options: CodeReviewOptions): CodeReviewResult {
    const complexity = this.analyzeComplexityOffline(options.code, options.language);

    return {
      overview: `Algorithmic analysis indicates ${complexity.timeComplexity} time complexity and ${complexity.spaceComplexity} auxiliary memory. Control flow is well-organized.`,
      strengths: [
        "Structured control flow and distinct variable naming",
        "Clear loop termination conditions",
        "Consistent typing conventions",
      ],
      improvements: [
        "Add explicit guards for empty, single-element, and extreme constraint boundary inputs",
        "Check for potential integer overflow if cumulative sums exceed standard integer bounds",
      ],
      edgeCases: [
        "Empty array / collection: length = 0",
        "Single element list: length = 1",
        "All negative values or zero elements",
        "Large inputs near upper constraint bound ($N \\ge 10^5$)",
      ],
      idiomaticTips: [
        `Leverage native ${options.language} collections and early return guard clauses to flatten nested blocks`,
      ],
      timeComplexityEstimate: complexity.timeComplexity,
      spaceComplexityEstimate: complexity.spaceComplexity,
    };
  }

  private getFallbackHint(options: HintOptions): { hint: string; level: number; followUpQuestion: string } {
    if (options.hintLevel === 1) {
      return {
        hint: `Consider how the problem can be reduced by maintaining an invariant across your traversal. What state remains unchanged when you process element $i$?`,
        level: 1,
        followUpQuestion: `What is the theoretical lower bound on time complexity for this constraint size?`,
      };
    }
    if (options.hintLevel === 2) {
      return {
        hint: `Can you trade $O(N)$ extra space (such as a Hash Table, Monotonic Stack, or Frequency Array) to avoid a redundant inner scan?`,
        level: 2,
        followUpQuestion: `If you store previous values as you iterate, what exact lookup would tell you if a match exists?`,
      };
    }
    return {
      hint: `Check the exact boundary conditions: what happens if the array is already sorted, or all elements are identical? Ensure your interval check does not skip index $0$ or index $N-1$.`,
      level: 3,
      followUpQuestion: `What is your loop termination condition: is it left < right or left <= right?`,
    };
  }

  private getFallbackMentorResponse(prompt: string, options: AIChatOptions): string {
    const lower = prompt.toLowerCase();
    if (lower.includes("hint")) {
      return `### 💡 Socratic Guidance on ${options.topic || "Algorithm Invariants"}\n\n1. **Identify the Invariant**: What property must remain true after each iteration?\n2. **State Transition**: Does solving a smaller subproblem of size $(N-1)$ directly yield the solution for $N$?\n3. **Tradeoffs**: Can you trade $O(N)$ extra space (e.g., a Hash Map or Frequency Array) to eliminate an $O(N^2)$ nested scan?`;
    }
    if (lower.includes("explain") || lower.includes("how")) {
      return `### 🧠 Algorithmic Concept Breakdown\n\nWhen approaching **${options.topic || "this problem"}**:\n\n- **Base Case**: What is the simplest possible input that can be answered immediately?\n- **Recursive Step / Loop**: How do you transition from the current state to the next without recomputing intermediate states?\n- **Edge Cases**: Always test $N=0$, $N=1$, and duplicate values before confirming your approach.`;
    }
    return `That's a key observation regarding **${options.topic || "your implementation"}**.\n\nLet's evaluate the invariant: what condition guarantees that your pointers or search bounds do not cross or skip a valid candidate? Think about whether your interval is inclusive \`[left, right]\` or half-open \`[left, right)\`.`;
  }
}

export const defaultAIProvider = new GeminiAIProvider();

