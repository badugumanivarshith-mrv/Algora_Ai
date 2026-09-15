import { CareerRepository, CareerRoadmapEntity } from "../../repositories/careerRepository";
import { defaultAIProvider } from "./geminiProvider";

import { CourseService } from "./courseService";
import { PlacementDriveService } from "./placementDriveService";
import { ProjectAnalyticsService } from "./projectAnalyticsService";
import { ResearchRepository } from "../../repositories/researchRepository";
import { AgentRepository } from "../../repositories/agentRepository";

export class CareerRoadmapService {
  public static async generateRoadmap(params: {
    userId: string;
    targetCompany: string;
    targetRole: string;
    interviewDate?: string;
    availableHoursPerDay?: number;
    universityId?: string;
    semester?: number;
  }): Promise<CareerRoadmapEntity> {
    // V4.0 AI OS Integration: Log agent decision
    await AgentRepository.saveMemory("career-agent", params.userId, `roadmap_${Date.now()}`, `Generated roadmap for ${params.targetRole} at ${params.targetCompany}`, 8);

    // Fetch university curriculum & upcoming placement drives for semester-based alignment
    let curriculumContext = "";
    let projectContext = "";
    let researchContext = "";
    try {
      const courses = await CourseService.getCourses(params.universityId);
      const drives = await PlacementDriveService.getPlacementDrives(params.universityId);
      curriculumContext = `University Semester ${params.semester || 5} Courses: ${courses.map(c => c.title).join(", ")}. Placement Drives: ${drives.map(d => `${d.company} (${d.title})`).join(", ")}.`;
      
      const projectSummary = await ProjectAnalyticsService.getUserProjectSummary(params.userId);
      projectContext = `User Project Experience: ${projectSummary.totalWorkspaces} active projects, ${projectSummary.avgCompletion}% average completion.`;

      const researchAnalytics = await ResearchRepository.getResearchAnalytics(params.userId);
      const ossHistory = await ResearchRepository.getContributionHistory(params.userId);
      researchContext = `Research/OSS Context: Impact Factor ${researchAnalytics?.impact_factor || 0}, OSS Contributions: ${ossHistory.length}. Leverage these for high-tier company targeting.`;
    } catch (e) {
      // Fallback
    }

    const prompt = `Generate a personalized Career Readiness Roadmap:
Target Company: ${params.targetCompany}
Target Role: ${params.targetRole}
University Context: ${curriculumContext}
Project Context: ${projectContext}
Research/OSS Context: ${researchContext}
Interview Date: ${params.interviewDate || "In 30 days"}
Available Hours/Day: ${params.availableHoursPerDay || 3}

Return JSON:
{
  "dailyPlan": [
    { "day": 1, "topic": "Arrays & Two Pointers", "problems": ["Two Sum", "3Sum"], "durationHours": 3 }
  ],
  "weeklyPlan": [
    { "week": 1, "focus": "Data Structures Mastery", "milestones": ["Solve 25 LeetCode Mediums", "Master Hash Tables"] }
  ],
  "monthlyPlan": [
    { "month": 1, "phase": "Core DSA & Mock Interviews", "goal": "90%+ Readiness Score" }
  ],
  "revisionSchedule": [
    { "date": "Day 7", "topics": ["Trees", "Sliding Window"] }
  ],
  "mockSchedule": [
    { "day": 14, "type": "Mock Technical Interview with Gemini Recruiter" }
  ]
}`;

    let roadmapData: any;
    try {
      const responseText = await defaultAIProvider.generateRawText(prompt);
      roadmapData = JSON.parse(responseText.replace(/```json|```/g, "").trim());
    } catch (e) {
      roadmapData = {
        dailyPlan: [
          { day: 1, topic: "Arrays & Hashing", problems: ["Two Sum", "Group Anagrams"], durationHours: 3 },
          { day: 2, topic: "Two Pointers", problems: ["3Sum", "Container With Most Water"], durationHours: 3 },
          { day: 3, topic: "Sliding Window", problems: ["Longest Substring Without Repeating Characters"], durationHours: 3 },
        ],
        weeklyPlan: [
          { week: 1, focus: "Data Structures & Core Patterns", milestones: ["Master Hash Maps", "Solve 15 Problems"] },
          { week: 2, focus: "Trees & Graphs", milestones: ["BFS/DFS Traversals", "Cycle Detection"] },
        ],
        monthlyPlan: [
          { month: 1, phase: "Comprehensive Interview Preparation", goal: "Complete 50 Target Problems" },
        ],
        revisionSchedule: [{ date: "Day 7", topics: ["Arrays", "Sliding Window"] }],
        mockSchedule: [{ day: 10, type: "Full Bar Raiser Mock Interview" }],
      };
    }

    return await CareerRepository.saveRoadmap({
      userId: params.userId,
      targetCompany: params.targetCompany,
      targetRole: params.targetRole,
      interviewDate: params.interviewDate,
      dailyPlan: roadmapData.dailyPlan || [],
      weeklyPlan: roadmapData.weeklyPlan || [],
      monthlyPlan: roadmapData.monthlyPlan || [],
      revisionSchedule: roadmapData.revisionSchedule || [],
      mockSchedule: roadmapData.mockSchedule || [],
    });
  }

  public static async getRoadmap(userId: string): Promise<CareerRoadmapEntity | null> {
    return await CareerRepository.getRoadmap(userId);
  }
}
