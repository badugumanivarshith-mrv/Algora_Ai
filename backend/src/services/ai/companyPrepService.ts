import { CompanyPrepRepository, CompanyTrack, CompanyRoadmapWeek, CompanyProblemMapping, CompanyInterviewPatternRound } from "../../repositories/companyPrepRepository";
import { RedisManager } from "../../redis/redisClient";

export class CompanyPrepService {
  public static async getTracks(): Promise<CompanyTrack[]> {
    const redisKey = `company:tracks:all`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Fall through
      }
    }

    const tracks = await CompanyPrepRepository.getCompanyTracks();
    await RedisManager.set(redisKey, JSON.stringify(tracks), 3600);
    return tracks;
  }

  public static async getTrackDetails(companyId: string): Promise<{
    track: CompanyTrack | null;
    roadmap: CompanyRoadmapWeek[];
    interviewPattern: CompanyInterviewPatternRound[];
    highFreqProblems: CompanyProblemMapping[];
  }> {
    const redisKey = `company:track:${companyId.toLowerCase()}`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Fall through
      }
    }

    const track = await CompanyPrepRepository.getCompanyTrack(companyId);
    const roadmap = await CompanyPrepRepository.getRoadmap(companyId);
    const interviewPattern = await CompanyPrepRepository.getInterviewPattern(companyId);
    const highFreqProblems = await CompanyPrepRepository.getProblemMappings(companyId);

    const result = { track, roadmap, interviewPattern, highFreqProblems };
    await RedisManager.set(redisKey, JSON.stringify(result), 3600);
    return result;
  }

  public static async getProblems(companyId?: string, topic?: string, difficulty?: string): Promise<CompanyProblemMapping[]> {
    return CompanyPrepRepository.getProblemMappings(companyId, topic, difficulty);
  }
}
