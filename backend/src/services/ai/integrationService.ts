import { ProductivityRepository } from "../../repositories/productivityRepository";
import { logger } from "../../utils/logger";

export class IntegrationService {
  private static SUPPORTED_SERVICES = ['GitHub', 'GitLab', 'Jira', 'Trello', 'Notion', 'Slack', 'Discord'];

  public static async connectService(userId: string, serviceName: string, accessToken: string, metadata: any = {}) {
    if (!this.SUPPORTED_SERVICES.includes(serviceName)) {
      throw new Error(`Service ${serviceName} is not supported.`);
    }

    const integration = await ProductivityRepository.upsertIntegration(
      userId, 
      serviceName, 
      'Connected', 
      ['read', 'write'], 
      metadata
    );

    logger.info(`[Integration] User ${userId} connected to ${serviceName}`);
    return integration;
  }

  public static async getConnections(userId: string) {
    return await ProductivityRepository.getIntegrations(userId);
  }

  public static async syncIntegration(userId: string, serviceName: string) {
    logger.info(`[Integration] Syncing ${serviceName} for user ${userId}`);
    // In a real implementation, this would call the external API
    await ProductivityRepository.upsertIntegration(userId, serviceName, 'Connected', [], { last_sync_status: 'Success' });
    return { status: 'success', synced_at: new Date().toISOString() };
  }
}
