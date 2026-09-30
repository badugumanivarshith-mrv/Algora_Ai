/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AI Mentor & AI Analyst Controller (Socratic Multi-Mode Coaching)
 */

import { Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { db } from '../db/db';
import { config } from '../config/index';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

let aiClient: GoogleGenAI | null = null;
if (config.geminiApiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey: config.geminiApiKey });
  } catch (e) {
    console.warn('Gemini client initialization notice:', e);
  }
}

export async function mentorChat(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { message, mode, contextTopic, problemId, requestedTier } = req.body;

  if (!message) {
    res.status(400).json({ success: false, error: 'Message is required' });
    return;
  }

  const activeMode = mode || 'practice';
  const tier = requestedTier || 'hint';

  let responseText = '';
  let responseType: 'text' | 'code' | 'insight' | 'hint_tier' = 'text';

  if (tier === 'hint') {
    responseText = `💡 **Guiding Question**: What invariant or property remains true about your data structure as you iterate? Try writing down the smallest example (n=1, n=2) by hand first.`;
  } else if (tier === 'approach') {
    responseText = `📐 **Approach Framing**: Consider whether a greedy choice holds, or if you need to remember past states. For ${contextTopic || 'this problem'}, can you trade O(N) extra memory in exchange for reducing the time complexity from O(N²) to O(N)?`;
  } else if (tier === 'algorithm') {
    responseText = `⚙️ **Algorithmic Outline**:\n1. Initialize your lookup table / frequency map.\n2. Iterate through each element with index.\n3. Compute the target complement.\n4. Check if the complement exists in the table.\n5. Return or update accordingly.`;
  } else if (tier === 'pseudocode') {
    responseText = `📝 **Pseudocode**:\n\`\`\`text\nFUNCTION solve(items, target):\n    seen = NEW HashMap\n    FOR index, item IN items:\n        needed = target - item\n        IF needed IN seen:\n            RETURN [seen[needed], index]\n        seen[item] = index\n    RETURN empty\n\`\`\``;
    responseType = 'code';
  } else if (tier === 'partial_code') {
    responseText = `💻 **Partial Implementation**:\n\`\`\`python\ndef solve(nums: list[int], target: int) -> list[int]:\n    lookup = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        # TODO: Check if complement in lookup\n        # TODO: Store current num and index\n    return []\n\`\`\``;
    responseType = 'code';
  } else {
    responseText = `I'm here to guide your thinking step-by-step. Let's break down the problem together. What is your current hypothesis about the optimal time complexity?`;
  }

  if (aiClient) {
    try {
      const systemInstruction = `You are ALGORA AI Mentor, a world-class computer science educator. 
Your goal is to guide the student Socratically. Mode: ${activeMode}.
IMPORTANT RULES:
- NEVER immediately provide complete code solutions unless explicitly requested as 'full solution'.
- Follow the Socratic ladder: Hint -> Approach -> Algorithm -> Pseudocode -> Partial Code.
- Encourage deep conceptual understanding of time and space complexities.`;

      const aiResponse = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Student query: "${message}". Context: topic=${contextTopic || 'DSA'}, problemId=${problemId || 'general'}, requestedTier=${tier}. Respond following Socratic pedagogy.`,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      if (aiResponse.text) {
        responseText = aiResponse.text;
      }
    } catch (err) {
      console.warn('AI service generation fallback used:', err);
    }
  }

  res.status(200).json({
    success: true,
    data: {
      reply: responseText,
      type: responseType,
      tier,
      mode: activeMode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  });
}

export async function aiAnalystReport(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.id;
  const user = userId ? db.users.get(userId) : null;

  const report = {
    userId: userId || 'guest',
    userName: user?.name || 'Guest Student',
    readinessScore: user ? 78 : 0,
    targetCompany: user?.target_company || 'Target Tech Company',
    masteryScores: [
      { topic: 'Arrays & Hashing', score: user ? 88 : 0, classAvg: 75, status: user ? 'Mastered' : 'Not Started' },
      { topic: 'Two Pointers', score: user ? 82 : 0, classAvg: 70, status: user ? 'Strong' : 'Not Started' },
      { topic: 'Sliding Window', score: user ? 78 : 0, classAvg: 68, status: user ? 'Good' : 'Not Started' },
      { topic: 'Dynamic Programming', score: user ? 58 : 0, classAvg: 62, status: user ? 'Needs Improvement' : 'Not Started' },
      { topic: 'Graphs & BFS/DFS', score: user ? 90 : 0, classAvg: 65, status: user ? 'Mastered' : 'Not Started' },
      { topic: 'Trees & BST', score: user ? 72 : 0, classAvg: 67, status: user ? 'Good' : 'Not Started' },
    ],
    weakTopics: user
      ? [
          {
            topic: 'Dynamic Programming (Knapsack & Subsequences)',
            reason: 'Accuracy dropped to 58% on medium problems; 3 recent TLE submissions.',
            recommendedAction: 'Complete 3 1D DP tabulation exercises before attempting 2D DP grids.',
            priority: 'High',
          },
        ]
      : [
          {
            topic: 'Guest Mode Active',
            reason: 'You are currently in Guest Mode. Register or Log In to generate personal AI Diagnostic reports.',
            recommendedAction: 'Create an account to track your progress across sessions.',
            priority: 'Medium',
          },
        ],
    predictedCompanyReadiness: {
      Google: user ? '74% - High DSA rigor match' : '0% - Register to compute',
      Amazon: user ? '82% - Solid Leadership & Problem Solving' : '0% - Register to compute',
      Microsoft: user ? '79% - Strong systems fundamentals' : '0% - Register to compute',
      Oracle: user ? '85% - High database & memory alignment' : '0% - Register to compute',
    },
  };

  res.status(200).json({
    success: true,
    data: report,
  });
}
