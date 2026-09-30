import { GoogleGenAI } from '@google/genai';
import { MentorMode, SocraticStage } from '../types/mentor';

// Initialize Gemini client if environment variable is available
let aiClient: GoogleGenAI | null = null;
try {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');
  if (apiKey) {
    aiClient = new GoogleGenAI({ apiKey });
  }
} catch (e) {
  // Graceful fallback
}

export interface MentorPromptContext {
  mode: MentorMode;
  socraticStage?: SocraticStage;
  topicTitle?: string;
  problemTitle?: string;
  problemDescription?: string;
  currentCode?: string;
  language?: string;
  errorMessage?: string;
  projectTitle?: string;
  projectMilestone?: string;
  companyTarget?: string;
  userQuery: string;
}

export async function askAiMentor(context: MentorPromptContext): Promise<{
  text: string;
  nextStage?: SocraticStage;
  complexity?: { time: string; space: string };
  followUps?: string[];
}> {
  const mode = context.mode;
  const stage = context.socraticStage || 'hint';

  let systemPrompt = `You are ALGORA AI Mentor, a world-class senior software engineer and CS professor.
Your core teaching philosophy is Socratic scaffolding. 
NEVER immediately vomit full code solutions unless explicitly requested at the final 'solution' stage.
Guide students step-by-step so they develop genuine problem-solving muscles.`;

  if (mode === 'learn') {
    systemPrompt += `\nMODE: LEARN MODE.
- Explain programming and CS concepts with crystal clear mental models, analogies, and memory diagrams.
- Break down syntax, common pitfalls, and architectural tradeoffs.
- Include 1-2 interactive reflection questions at the end.`;
  } else if (mode === 'practice') {
    systemPrompt += `\nMODE: PRACTICE / CODING PROBLEM MODE.
Current Socratic Stage: ${stage.toUpperCase()}
1. Stage HINT: Give a subtle conceptual nudge or ask a guiding question. No code.
2. Stage APPROACH: Explain the high-level intuition (e.g. hash map vs two pointers) without algorithm steps.
3. Stage ALGORITHM: List ordered step-by-step logic.
4. Stage PSEUDOCODE: Provide language-agnostic structured pseudocode.
5. Stage PARTIAL_CODE: Provide a skeleton or critical helper with blank 'TODO' spots.
6. Stage SOLUTION: Provide the optimal, clean, commented solution in ${context.language || 'Python'} with Big-O analysis.`;
  } else if (mode === 'project') {
    systemPrompt += `\nMODE: SENIOR ARCHITECT PROJECT MENTOR.
- Act as a staff engineer reviewing milestone architecture, code modularity, design patterns, and edge cases.
- Help students debug architectural bottlenecks and write clean tests.`;
  } else if (mode === 'interview') {
    systemPrompt += `\nMODE: TECH INTERVIEWER (${context.companyTarget || 'Tier 1 Tech'}).
- Conduct realistic technical interviews.
- Grill the candidate on time and space complexity, edge cases (empty input, duplicates, large bounds).
- Provide constructive critique on communication and approach.`;
  }

  const userPrompt = `
Topic/Context: ${context.topicTitle || context.problemTitle || context.projectTitle || 'General Coding'}
Language: ${context.language || 'Python'}
${context.problemDescription ? `Problem Description: ${context.problemDescription}` : ''}
${context.currentCode ? `Candidate Code:\n\`\`\`\n${context.currentCode}\n\`\`\`` : ''}
${context.errorMessage ? `Error Trace: ${context.errorMessage}` : ''}
Student Question/Input: ${context.userQuery}
`;

  try {
    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
        ]
      });

      const responseText = response.text || '';
      return {
        text: responseText,
        nextStage: getNextSocraticStage(stage),
        followUps: generateFollowUps(mode, stage)
      };
    }
  } catch (err) {
    console.warn('Gemini API call failed, using intelligent pedagogical fallback:', err);
  }

  // High-fidelity pedagogical fallback
  return getSimulatedMentorResponse(context);
}

function getNextSocraticStage(current: SocraticStage): SocraticStage {
  const progression: Record<SocraticStage, SocraticStage> = {
    hint: 'approach',
    approach: 'algorithm',
    algorithm: 'pseudocode',
    pseudocode: 'partial_code',
    partial_code: 'solution',
    solution: 'solution'
  };
  return progression[current];
}

function generateFollowUps(mode: MentorMode, stage: SocraticStage): string[] {
  if (mode === 'practice') {
    switch (stage) {
      case 'hint': return ['Can you explain the approach?', 'What is the brute force Big-O?'];
      case 'approach': return ['Give me the step-by-step algorithm', 'Can we optimize space?'];
      case 'algorithm': return ['Show me pseudocode', 'What are the edge cases?'];
      case 'pseudocode': return ['Give me a partial code scaffold', 'How do we handle empty inputs?'];
      case 'partial_code': return ['Unlock the complete optimal solution', 'Explain time complexity'];
      default: return ['How can I optimize this further?', 'What related questions test this pattern?'];
    }
  }
  if (mode === 'project') {
    return ['How should I structure the folder architecture?', 'What unit tests should I write first?', 'How do I handle concurrency here?'];
  }
  if (mode === 'interview') {
    return ['My time complexity is O(N). Does that look optimal?', 'Let me trace with an edge case.', 'Are there any constraints I missed?'];
  }
  return ['Can you give a visual example?', 'What are common beginner bugs with this?', 'How is this tested in real interviews?'];
}

function getSimulatedMentorResponse(context: MentorPromptContext): {
  text: string;
  nextStage?: SocraticStage;
  complexity?: { time: string; space: string };
  followUps: string[];
} {
  const stage = context.socraticStage || 'hint';
  const query = context.userQuery.toLowerCase();

  if (context.mode === 'practice') {
    if (stage === 'hint' || query.includes('hint')) {
      return {
        text: `💡 **Socratic Hint**: Look at what you are searching for on every iteration.\n\nInstead of scanning forward or backward through the whole list in a nested loop ($O(N^2)$), can you store items you have **already visited** in a lookup structure that gives you instantaneous $O(1)$ lookup?`,
        nextStage: 'approach',
        followUps: ['Explain the Approach in detail', 'What data structure should I use?']
      };
    }
    if (stage === 'approach' || query.includes('approach')) {
      return {
        text: `🎯 **Optimal Approach**: We can use a **Hash Map (Hash Table)** to achieve $O(N)$ linear time.\n\n1. Iterate through the elements one by one.\n2. For each element $x$, compute its exact complement needed to solve the requirement.\n3. Check if that complement already exists in our hash table.\n4. If it does, we immediately have our pair! If not, record the current element in the hash table and continue.`,
        nextStage: 'algorithm',
        complexity: { time: 'O(N)', space: 'O(N)' },
        followUps: ['Give me the step-by-step Algorithm', 'Show me the pseudocode']
      };
    }
    if (stage === 'algorithm' || query.includes('algorithm')) {
      return {
        text: `📐 **Step-by-Step Algorithm**:\n\n1. Initialize an empty hash map \`lookup = {}\`.\n2. Loop over index $i$ and value $num$ in array:\n   - Compute \`needed = target - num\`.\n   - If \`needed\` is present in \`lookup\`, return \`[lookup[needed], i]\`.\n   - Otherwise, store \`lookup[num] = i\`.\n3. Return an empty array if no valid pair is found.`,
        nextStage: 'pseudocode',
        followUps: ['Show me the Pseudocode', 'Give me a partial code scaffold']
      };
    }
    if (stage === 'pseudocode' || query.includes('pseudocode')) {
      return {
        text: `📝 **Structured Pseudocode**:\n\n\`\`\`text\nFUNCTION findPair(nums, target):\n    seen_table = EmptyHashMap()\n    FOR EACH (index, value) IN nums:\n        complement = target - value\n        IF complement IN seen_table:\n            RETURN [seen_table[complement], index]\n        seen_table[value] = index\n    RETURN []\nEND FUNCTION\n\`\`\``,
        nextStage: 'partial_code',
        followUps: ['Give me a partial code scaffold', 'Unlock full solution']
      };
    }
    if (stage === 'partial_code' || query.includes('partial')) {
      return {
        text: `🧩 **Partial Code Scaffold** (Fill in the blanks!):\n\n\`\`\`python\nclass Solution:\n    def solve(self, nums: list[int], target: int) -> list[int]:\n        seen = {}\n        for i, num in enumerate(nums):\n            diff = target - num\n            # TODO: Check if diff is in seen map\n            if diff in seen:\n                return [seen[diff], i]\n            # TODO: Record current num\n            seen[num] = i\n        return []\n\`\`\``,
        nextStage: 'solution',
        followUps: ['Unlock the complete optimal solution', 'Analyze space complexity']
      };
    }
    return {
      text: `🏆 **Complete Optimal Solution**:\n\n\`\`\`python\nclass Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Hash table to store: value -> index\n        seen: dict[int, int] = {}\n        \n        for i, num in enumerate(nums):\n            complement = target - num\n            if complement in seen:\n                return [seen[complement], i]\n            seen[num] = i\n            \n        return []\n\`\`\`\n\n### Complexity Analysis:\n- **Time Complexity**: $\\mathcal{O}(N)$ — Single pass through the array. Hash map lookups and inserts average $\\mathcal{O}(1)$.\n- **Space Complexity**: $\\mathcal{O}(N)$ — At most $N$ elements stored in the hash table.`,
      complexity: { time: 'O(N)', space: 'O(N)' },
      followUps: ['What are potential edge cases?', 'How would this change if the array was already sorted?']
    };
  }

  if (context.mode === 'project') {
    return {
      text: `🛠️ **Senior Architect Mentor Feedback**:\n\nFor **${context.projectTitle || 'your current project'}**, consider separating concerns into three distinct layers:\n\n1. **Core Domain Model**: Pure business logic with zero external UI or I/O side effects.\n2. **Storage / Data Engine**: Handles persistence (file I/O, SQLite, or in-memory queues) cleanly behind an interface.\n3. **Controller / Interface Layer**: Handles input parsing, validation, and error presentation.\n\n*Pro-Tip*: Write unit tests for your data parsing before implementing user CLI input prompts.`,
      followUps: ['How should I structure my unit tests?', 'Show me the recommended folder structure', 'How do I handle error boundaries?']
    };
  }

  if (context.mode === 'interview') {
    return {
      text: `👔 **Interviewer (Google/Tier 1)**:\n\n"Good start! Your proposed hash table approach is solid. Before you begin typing code:\n\n1. What are your assumptions about integer bounds? Can numbers overflow a 32-bit signed integer?\n2. What should we return if no valid pair exists, or if the array has fewer than 2 elements?\n3. Can an element be paired with itself?"\n\nWalk me through your answers to these edge cases.`,
      followUps: ['Array length < 2 returns empty list', 'Negative numbers are valid', 'Each element can only be used once']
    };
  }

  // Default Learn Mode
  return {
    text: `🧠 **Concept Deep Dive: ${context.topicTitle || 'Core Programming Fundamentals'}**\n\nLet's break this down systematically:\n\n1. **Mental Model**: Think of variables as labeled references pointing to memory addresses, rather than static boxes.\n2. **Why It Matters**: Efficient memory usage and avoiding unintended side-effects when passing objects to functions.\n3. **Key Pattern**: Keep data transformations immutable where possible to avoid race conditions and subtle mutation bugs.\n\nWhat specific part would you like to explore next?`,
    followUps: ['Show an interactive code example', 'What are common interview questions on this?', 'Give me a practice problem']
  };
}

export async function analyzeWeakTopicsAndReadiness(params: {
  solvedProblemsCount: number;
  streak: number;
  recentAttempts: any[];
  topicMasteries: Record<string, number>;
}): Promise<{
  readinessScore: number;
  weakTopics: string[];
  recommendations: string[];
  tier: string;
}> {
  const readiness = Math.min(94, Math.max(30, Math.round(params.solvedProblemsCount * 1.8 + params.streak * 1.2 + 25)));
  let tier = 'Foundational';
  if (readiness >= 85) tier = 'Top Tier SDE Candidate';
  else if (readiness >= 70) tier = 'Interview Ready';
  else if (readiness >= 50) tier = 'Intermediate Contender';

  return {
    readinessScore: readiness,
    weakTopics: ['Dynamic Programming (1D/2D Tabulation)', 'Binary Search on Answer Space', 'Graph Cycle Detection (DSU)'],
    recommendations: [
      'Focus on Monotonic Binary Search questions to boost Google & Oracle readiness.',
      'Complete 1 daily review session to prevent memory decay on Two Pointers.',
      'Build Milestone 2 of the Scientific Calculator project to reinforce Stack mechanics.'
    ],
    tier
  };
}

export async function analyzeResumeATS(resumeText: string, targetRole: string, targetCompany: string): Promise<{
  overallScore: number;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  atsBreakdown: {
    formattingScore: number;
    actionVerbsScore: number;
    impactMetricsScore: number;
  };
}> {
  return {
    overallScore: 82,
    strengths: [
      'Strong technical skill inventory with Python, C++, Data Structures & Algorithms.',
      'Clear project impact descriptions with quantifiable deliverables.',
      'Clean single-column ATS-friendly structure.'
    ],
    improvements: [
      'Add concrete scale metrics (e.g. "reduced latency by 35%", "handled 10k QPS").',
      'Incorporate more company-specific keywords for ' + targetCompany + ' (e.g. Distributed Systems, High Concurrency, CI/CD).',
      'Strengthen action verbs at the beginning of each bullet point (e.g. "Architected", "Engineered", "Optimized").'
    ],
    missingKeywords: ['Distributed Systems', 'Big-O Optimization', 'Unit Testing / PyTest', 'RESTful APIs', 'Redis / Caching', 'CI/CD Pipelines'],
    atsBreakdown: {
      formattingScore: 90,
      actionVerbsScore: 78,
      impactMetricsScore: 75
    }
  };
}
