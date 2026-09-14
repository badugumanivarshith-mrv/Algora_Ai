import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { updateConfigFromEnv } from "../config/env";

/**
 * List of critical secrets supporting dynamic Google Secret Manager fetching
 */
const SECRET_KEYS = [
  "JWT_SECRET",
  "DATABASE_URL",
  "REDIS_URL",
  "GEMINI_API_KEY",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "RESEND_API_KEY",
  "SENDGRID_API_KEY",
  "SENTRY_DSN",
];

/**
 * Service to dynamically resolve secure environment config from Google Secret Manager.
 */
export class SecretsService {
  private static client: SecretManagerServiceClient | null = null;

  /**
   * Initialize Secret Manager client lazily
   */
  private static getClient(): SecretManagerServiceClient {
    if (!this.client) {
      this.client = new SecretManagerServiceClient();
    }
    return this.client;
  }

  /**
   * Fetches secure payload values for a specific secret from Google Secret Manager.
   */
  public static async getSecret(projectId: string, secretKey: string): Promise<string | null> {
    try {
      const client = this.getClient();
      const secretPath = `projects/${projectId}/secrets/${secretKey}/versions/latest`;
      
      console.log(`[SecretsService] Fetching secret "${secretKey}" from ${secretPath}...`);
      const [version] = await client.accessSecretVersion({
        name: secretPath,
      });

      const payload = version.payload?.data?.toString();
      if (payload) {
        return payload.trim();
      }
      return null;
    } catch (error: any) {
      console.warn(`[SecretsService] Failed to access Secret Manager key "${secretKey}": ${error.message}`);
      return null;
    }
  }

  /**
   * Dynamic loading of Google Secret Manager values into environment process on boot.
   */
  public static async loadProductionSecrets(): Promise<void> {
    const isProduction = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging";
    const useSecretManager = process.env.USE_SECRET_MANAGER === "true";
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT;

    if (!isProduction && !useSecretManager) {
      console.log("[SecretsService] Local development environment: Skipping Secret Manager loading.");
      return;
    }

    if (!projectId) {
      console.warn("[SecretsService] No GOOGLE_CLOUD_PROJECT environment variable found. Skipping Secret Manager loading.");
      return;
    }

    console.log(`[SecretsService] Loading production secrets from GCP project "${projectId}"...`);

    let loadedCount = 0;
    for (const key of SECRET_KEYS) {
      try {
        const val = await this.getSecret(projectId, key);
        if (val) {
          process.env[key] = val;
          loadedCount++;
        }
      } catch (err: any) {
        console.error(`[SecretsService] Unexpected error on secret "${key}" resolution: ${err.message}`);
      }
    }

    console.log(`[SecretsService] Completed runtime secrets load. Loaded ${loadedCount} secrets successfully.`);
    
    // Refresh configuration object with the newly retrieved env values
    updateConfigFromEnv();
  }
}
