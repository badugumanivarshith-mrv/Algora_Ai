import { EnterpriseRepository, PlacementDriveEntity, PlacementRegistrationEntity } from "../../repositories/enterpriseRepository";
import { UniversityService } from "./universityService";
import { RedisManager } from "../../redis/redisClient";

export class PlacementDriveService {
  public static async getPlacementDrives(universityId?: string): Promise<PlacementDriveEntity[]> {
    let drives = await EnterpriseRepository.getPlacementDrives(universityId);
    if (drives.length === 0) {
      drives = await this.seedDefaultPlacementDrives(universityId);
    }
    return drives;
  }

  public static async getDriveDetails(driveId: string): Promise<PlacementDriveEntity | null> {
    const redisKey = `placement:drive:${driveId}`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback
      }
    }

    const drives = await EnterpriseRepository.getPlacementDrives();
    const drive = drives.find(d => d.id === driveId) || null;
    if (drive) {
      await RedisManager.set(redisKey, JSON.stringify(drive), 3600);
    }
    return drive;
  }

  public static async createPlacementDrive(data: { universityId: string; company: string; title: string; minCgpa?: number; driveDate?: Date }): Promise<PlacementDriveEntity> {
    const drive = await EnterpriseRepository.createPlacementDrive(data);
    const redisKey = `placement:drive:${drive.id}`;
    await RedisManager.set(redisKey, JSON.stringify(drive), 3600);
    return drive;
  }

  public static async registerForDrive(driveId: string, userId: string): Promise<PlacementRegistrationEntity> {
    return await EnterpriseRepository.registerForPlacementDrive(driveId, userId);
  }

  private static async seedDefaultPlacementDrives(universityId?: string): Promise<PlacementDriveEntity[]> {
    const universities = await UniversityService.getUniversities();
    const targetId = universityId || universities[0]?.id || "univ_default";

    const p1 = await EnterpriseRepository.createPlacementDrive({
      universityId: targetId,
      company: "Google",
      title: "Google Software Engineer (SDE-1) Campus Placement Drive 2026",
      minCgpa: 8.0,
      driveDate: new Date(Date.now() + 10 * 86400000),
    });

    const p2 = await EnterpriseRepository.createPlacementDrive({
      universityId: targetId,
      company: "Amazon",
      title: "Amazon AWS Cloud & SDE Specialist University Campus Drive",
      minCgpa: 7.5,
      driveDate: new Date(Date.now() + 15 * 86400000),
    });

    const p3 = await EnterpriseRepository.createPlacementDrive({
      universityId: targetId,
      company: "Microsoft",
      title: "Microsoft IDC Campus Recruitment Drive - Software Engineer & Data AI",
      minCgpa: 7.8,
      driveDate: new Date(Date.now() + 20 * 86400000),
    });

    return [p1, p2, p3];
  }
}
