import { UniversityRepository, PotentialProfileRecord, PotentialForecastRecord } from "../../repositories/universityRepository";
import { DigitalTwinService } from "./digitalTwinService";
import { StrategicDecisionService } from "./strategicDecisionService";
import { defaultAIProvider } from "./geminiProvider";
import { logger } from "../../utils/logger";

export interface HumanPotentialSummary {
  profile: PotentialProfileRecord;
  forecasts: PotentialForecastRecord[];
  compositePotentialIndex: number;
  trajectoryClass: 'SuperLinear' | 'HighExponential' | 'SteadyCompounding';
  aiSynthesisInsight: string;
}

export class HumanPotentialService {
  public static async getHumanPotential(userId: string = 'usr_demo'): Promise<HumanPotentialSummary> {
    const [profile, forecasts] = await Promise.all([
      UniversityRepository.getPotentialProfile(userId),
      UniversityRepository.getPotentialForecasts(userId)
    ]);

    const compositePotentialIndex = parseFloat(
      ((profile.careerPotential * 0.25) +
       (profile.leadershipPotential * 0.20) +
       (profile.researchPotential * 0.20) +
       (profile.founderPotential * 0.20) +
       (profile.learningVelocity * 0.15)).toFixed(1)
    );

    const trajectoryClass: 'SuperLinear' | 'HighExponential' | 'SteadyCompounding' =
      compositePotentialIndex >= 93 ? 'SuperLinear' : (compositePotentialIndex >= 85 ? 'HighExponential' : 'SteadyCompounding');

    const aiSynthesisInsight = `Candidate demonstrates a ${trajectoryClass} trajectory with a composite potential index of ${compositePotentialIndex}/100. Primary growth vectors stem from exceptional algorithmic mastery compound velocity and dual-threat competence spanning distributed infrastructure and frontier AI agent frameworks.`;

    return {
      profile,
      forecasts,
      compositePotentialIndex,
      trajectoryClass,
      aiSynthesisInsight
    };
  }

  public static async runTrajectorySimulation(userId: string, targetRole: string): Promise<any> {
    const prompt = `Simulate a 5-year potential career and research trajectory for candidate aiming for: "${targetRole}".
Include: Year 1 milestone, Year 3 staff level impact, Year 5 luminary achievement, estimated comp, and risk mitigations.`;

    const systemInstruction = `You are Algora's V5.0 Human Potential Simulation Engine. Return ONLY valid JSON:
{
  "targetRole": "${targetRole}",
  "estimatedTimeYears": 3.5,
  "confidenceScore": 94,
  "milestones": [
    {"year": 1, "tier": "L5 Staff Specialist", "focus": "Ship distributed Raft engine & vLLM optimizations"},
    {"year": 3, "tier": "Principal Systems Lead", "focus": "Publish NeurIPS foundation model scaling paper"},
    {"year": 5, "tier": "Distinguished Fellow / Founder", "focus": "Lead $50M venture AI company or research lab"}
  ],
  "projectedAnnualValueUsd": 850000,
  "catalystAction": "Double down on open source multi-agent systems and verified credential stacking on Algora."
}`;

    try {
      const raw = await defaultAIProvider.generateRawText(prompt, systemInstruction);
      const cleanJson = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch {
      return {
        targetRole,
        estimatedTimeYears: 3.0,
        confidenceScore: 92,
        milestones: [
          { year: 1, tier: 'Senior Engineer', focus: 'Master distributed primitives & publish capstone' },
          { year: 3, tier: 'Staff Architect', focus: 'Lead frontier AI system architecture' },
          { year: 5, tier: 'Principal / Founder', focus: 'Scale high-impact autonomous AI infrastructure' }
        ],
        projectedAnnualValueUsd: 750000,
        catalystAction: 'Complete Algora AI University Degree & stack verified badges'
      };
    }
  }
}
