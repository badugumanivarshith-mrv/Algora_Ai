import { HiringRepository, HiringPipelineEntity } from "../../repositories/hiringRepository";

export class HiringPipelineService {
  public static async getCompanyPipelines(company: string): Promise<HiringPipelineEntity[]> {
    let pipelines = await HiringRepository.getHiringPipelines(company);
    if (pipelines.length === 0) {
      pipelines = await this.seedDefaultPipeline(company);
    }
    return pipelines;
  }

  private static async seedDefaultPipeline(company: string): Promise<HiringPipelineEntity[]> {
    const defaultStages = [
      { company, stageName: "Resume & Profile Screening", description: "Automated candidate ATS review and skill indexing." },
      { company, stageName: "Online Coding Assessment (OA)", description: "60-90 minute timed algorithmic OA challenge." },
      { company, stageName: "Technical Interview Round 1", description: "45-minute live pair coding & data structures." },
      { company, stageName: "Technical System Design Round", description: "Scalability, architecture, and low-level design." },
      { company, stageName: "HR & Leadership Principles Round", description: "Behavioral assessment & culture fit evaluation." },
    ];

    const created: HiringPipelineEntity[] = [];
    for (const s of defaultStages) {
      const res = await HiringRepository.createHiringPipeline(s);
      created.push(res);
    }
    return created;
  }
}
