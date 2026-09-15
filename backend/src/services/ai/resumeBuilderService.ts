import { CareerRepository, ResumeVersionEntity } from "../../repositories/careerRepository";
import { RedisManager } from "../../redis/redisClient";
import { defaultAIProvider } from "./geminiProvider";
import { logger } from "../../utils/logger";

export class ResumeBuilderService {
  public static async generateResume(params: {
    userId: string;
    title: string;
    targetRole: string; // Software Engineer, Backend Developer, Frontend Developer, Full Stack Developer, AI Engineer, Data Engineer, ML Engineer
    experienceLevel?: string;
    existingSkills?: string[];
    projects?: any[];
  }): Promise<ResumeVersionEntity> {
    const prompt = `You are a FAANG Senior Technical Recruiter & Resume Writer.
Generate a professional, ATS-optimized resume JSON for a candidate targeting role: "${params.targetRole}".
Experience Level: "${params.experienceLevel || "Mid-Level"}"
Known Skills: ${JSON.stringify(params.existingSkills || ["TypeScript", "Node.js", "React", "SQL"])}

Return valid JSON with schema:
{
  "summary": "Impactful professional summary with quantified achievements",
  "skills": {
    "languages": ["TypeScript", "Python", ...],
    "frameworks": ["React", "Express", "Next.js", ...],
    "databases": ["PostgreSQL", "Redis", ...],
    "cloud": ["GCP", "AWS", ...]
  },
  "experience": [
    {
      "company": "Tech Corp",
      "role": "${params.targetRole}",
      "duration": "2023 - Present",
      "bullets": [
        "Architected high-throughput microservice handling 10M+ daily events using Node.js and Redis.",
        "Reduced latency by 42% through query optimization in PostgreSQL."
      ]
    }
  ],
  "projects": [
    {
      "name": "Distributed Real-time Platform",
      "techStack": ["TypeScript", "WebSockets", "Redis"],
      "description": "Engineered real-time collaborative platform supporting 500+ concurrent users."
    }
  ],
  "atsScore": 92
}`;

    let contentJson: any;
    let atsScore = 88;

    try {
      const responseText = await defaultAIProvider.generateRawText(prompt);
      contentJson = JSON.parse(responseText.replace(/```json|```/g, "").trim());
      atsScore = contentJson.atsScore || 88;
    } catch (e) {
      contentJson = {
        summary: `High-performing ${params.targetRole} with expertise in building scalable web applications and cloud architectures.`,
        skills: {
          languages: ["TypeScript", "Python", "SQL"],
          frameworks: ["React", "Node.js", "Express"],
          databases: ["PostgreSQL", "Redis"],
          tools: ["Docker", "Git", "Jest"],
        },
        experience: [
          {
            company: "Tech Solutions",
            role: params.targetRole,
            duration: "2022 - Present",
            bullets: [
              "Designed and deployed REST/GraphQL APIs serving 50k active users.",
              "Improved test coverage to 90% and reduced release regression bugs.",
            ],
          },
        ],
        projects: [
          {
            name: "Full Stack Collaborative Engine",
            techStack: ["TypeScript", "React", "PostgreSQL"],
            description: "Built scalable collaborative engine with real-time state synchronization.",
          },
        ],
      };
    }

    const resume = await CareerRepository.createResumeVersion({
      userId: params.userId,
      title: params.title || `${params.targetRole} Resume`,
      targetRole: params.targetRole,
      contentJson,
      atsScore,
    });

    const redisKey = `career:resume:${params.userId}`;
    await RedisManager.set(redisKey, JSON.stringify(resume), 3600);

    return resume;
  }

  public static async getResumes(userId: string): Promise<ResumeVersionEntity[]> {
    const redisKey = `career:resume:${userId}`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
        return [parsed];
      } catch (e) {
        // Fallback
      }
    }

    const resumes = await CareerRepository.getResumeVersions(userId);
    if (resumes.length > 0) {
      await RedisManager.set(redisKey, JSON.stringify(resumes), 3600);
    }
    return resumes;
  }
}
