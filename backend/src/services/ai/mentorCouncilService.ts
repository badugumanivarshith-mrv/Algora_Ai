import { UniversityRepository, MentorProfileRecord, MentorSessionRecord } from "../../repositories/universityRepository";
import { ExecutiveCouncilRepository } from "../../repositories/executiveCouncilRepository";
import { defaultAIProvider } from "./geminiProvider";
import { logger } from "../../utils/logger";

export interface DebatePromptRequest {
  topic: string;
  mentorArchetypes?: string[];
}

export class MentorCouncilService {
  public static async getMentors(): Promise<MentorProfileRecord[]> {
    return await UniversityRepository.getMentors();
  }

  public static async getMentorSessions(userId: string): Promise<MentorSessionRecord[]> {
    return await UniversityRepository.getMentorSessions(userId);
  }

  public static async conductMentorDebate(
    userId: string,
    topic: string,
    mentorArchetypes?: string[]
  ): Promise<MentorSessionRecord> {
    const allMentors = await UniversityRepository.getMentors();
    const activeMentors = mentorArchetypes && mentorArchetypes.length > 0
      ? allMentors.filter(m => mentorArchetypes.includes(m.archetype))
      : allMentors;

    const mentorProfilesPrompt = activeMentors.map(m =>
      `[Mentor: ${m.name} (${m.role}) | Archetype: ${m.archetype} | Core Principle: ${m.corePrinciples.join('; ')} | Personality: ${m.debatePersonality}]`
    ).join('\n');

    const systemInstruction = `You are Algora's V5.0 Autonomous AI Mentor Council consisting of world-class domain masters.
Generate a structured multi-mentor debate on the candidate's strategic topic: "${topic}".
Each mentor must speak with their distinctive worldview and rigorous domain perspectives.

Return ONLY valid JSON with this exact structure:
{
  "transcript": [
    {
      "mentorName": "Dr. Marcus Vance",
      "mentorArchetype": "SoftwareEngineering",
      "statement": "We must verify deterministic state boundaries and crash-recovery before optimizing speculative features.",
      "stance": "Conservative Systems Engineering",
      "confidence": 95
    },
    {
      "mentorName": "Dr. Elena Rostova",
      "mentorArchetype": "AI",
      "statement": "An agentic feedback loop will discover invariants faster than manual formal modeling.",
      "stance": "Frontier AI Automation",
      "confidence": 92
    },
    {
      "mentorName": "Jaxson Thorne",
      "mentorArchetype": "Startup",
      "statement": "Ship the prototype to paying customers this week. Theoretical debate without user telemetry is wasted runway.",
      "stance": "Rapid Market Validation",
      "confidence": 98
    },
    {
      "mentorName": "Sarah Chen",
      "mentorArchetype": "Career",
      "statement": "Positioning this as a proven distributed AI capstone maximizes tier-1 compensation leverage.",
      "stance": "Strategic Career Leverage",
      "confidence": 90
    }
  ],
  "consensusDecision": "Synthesized consensus: Execute a dual-phase roadmap where the core consensus engine is verified in days 1-3, followed immediately by an agentic orchestration layer and live beta deployment.",
  "actionItems": [
    "Complete formal chaos-testing on storage write-ahead log",
    "Deploy multi-agent evaluation benchmark against baseline",
    "Publish verifiable demo video and share with institutional talent networks"
  ]
}`;

    let sessionData: any;
    try {
      const raw = await defaultAIProvider.generateRawText(
        `Conduct high-level council debate on topic: "${topic}"\nActive Council Members:\n${mentorProfilesPrompt}`,
        systemInstruction
      );
      const cleanJson = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      sessionData = JSON.parse(cleanJson);
    } catch (err) {
      logger.warn(`[MentorCouncilService] Gemini debate generation fallback: ${err}`);
      sessionData = {
        transcript: activeMentors.slice(0, 4).map(m => ({
          mentorName: m.name,
          mentorArchetype: m.archetype,
          statement: `${m.name} emphasizes: Apply '${m.corePrinciples[0]}' to solve "${topic}". Ensure rigorous empirical verification and scalable architecture.`,
          stance: m.specialty,
          confidence: 94
        })),
        consensusDecision: `Council Consensus: Unify engineering rigor with rapid feedback loops to systematically de-risk "${topic}".`,
        actionItems: [
          `Execute targeted drills aligned with ${activeMentors[0]?.specialty || 'Distributed Systems'}`,
          `Validate milestones against industry benchmarks`,
          `Review results with Mentor Council in 7 days`
        ]
      };
    }

    const session: MentorSessionRecord = {
      id: `msess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      topic,
      sessionType: 'Debate',
      participatingMentorIds: activeMentors.map(m => m.id),
      transcript: sessionData.transcript || [],
      consensusDecision: sessionData.consensusDecision || 'Consensus reached.',
      actionItems: sessionData.actionItems || [],
      createdAt: new Date().toISOString()
    };

    await UniversityRepository.saveMentorSession(session);
    return session;
  }

  public static async requestPersonalizedIntervention(userId: string, mentorId: string, query: string): Promise<any> {
    const mentors = await UniversityRepository.getMentors();
    const mentor = mentors.find(m => m.id === mentorId) || mentors[0];

    const systemInstruction = `You are ${mentor.name}, ${mentor.role}. Your specialty is ${mentor.specialty}.
Provide an empathetic, deeply technical, and actionable 1-on-1 personalized intervention.
Core Principles: ${mentor.corePrinciples.join(', ')}.`;

    let responseText = '';
    try {
      responseText = await defaultAIProvider.generateRawText(`Candidate Query: ${query}`, systemInstruction);
    } catch {
      responseText = `I have analyzed your situation through the lens of ${mentor.specialty}. My immediate recommendation: focus on fundamentals, test your assumptions with hard telemetry, and execute with disciplined daily cadence.`;
    }

    return {
      mentor,
      query,
      advice: responseText,
      timestamp: new Date().toISOString()
    };
  }
}
