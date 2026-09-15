import { EnterpriseRepository, UniversityEntity } from "../../repositories/enterpriseRepository";
import { RedisManager } from "../../redis/redisClient";

export class UniversityService {
  public static async getUniversities(): Promise<UniversityEntity[]> {
    let universities = await EnterpriseRepository.getUniversities();
    if (universities.length === 0) {
      universities = await this.seedDefaultUniversity();
    }
    return universities;
  }

  public static async getUniversityById(id: string): Promise<UniversityEntity | null> {
    return await EnterpriseRepository.getUniversityById(id);
  }

  public static async createUniversity(data: { name: string; code: string; location?: string }): Promise<UniversityEntity> {
    return await EnterpriseRepository.createUniversity(data);
  }

  private static async seedDefaultUniversity(): Promise<UniversityEntity[]> {
    const u1 = await EnterpriseRepository.createUniversity({
      name: "Stanford Institute of Technology & Computer Science",
      code: "STANFORD-SIT",
      location: "Palo Alto, CA",
    });

    const u2 = await EnterpriseRepository.createUniversity({
      name: "Indian Institute of Technology (IIT) Algora Campus",
      code: "IIT-ALGORA",
      location: "Tech City, India",
    });

    return [u1, u2];
  }
}
