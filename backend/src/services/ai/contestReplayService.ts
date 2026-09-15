import { ContestRepository } from "../../repositories/contestRepository";

export class ContestReplayService {
  public static async getContestReplay(contestId: string): Promise<{
    contestId: string;
    timeline: Array<{
      minute: number;
      userId: string;
      problemId: string;
      verdict: string;
      scoreDelta: number;
    }>;
  }> {
    const submissions = await ContestRepository.getSubmissions(contestId);

    const timeline = submissions.map((sub, idx) => ({
      minute: Math.min(120, idx * 8 + 5),
      userId: sub.user_id,
      problemId: sub.problem_id,
      verdict: sub.verdict,
      scoreDelta: sub.verdict === "Accepted" ? 100 : 0,
    }));

    return { contestId, timeline };
  }
}
