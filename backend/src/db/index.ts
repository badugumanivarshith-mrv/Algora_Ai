import { Database } from "./connection";
import { Migrator } from "./migrator";
import { Seeder } from "./seeds";
import { logger } from "../utils/logger";
import { config } from "../config/env";

export * from "./connection";
export * from "./migrator";
export * from "./seeds";

export async function initializeDatabase(): Promise<void> {
  const maxRetries = 5;
  let attempt = 1;
  let delayMs = 1000;
  let connected = false;

  Database.initialize();

  if (config.databaseUrl && config.databaseUrl.trim().length > 0) {
    logger.info(`[Database] Initiating startup validation checks against PostgreSQL server...`);
    
    while (attempt <= maxRetries) {
      try {
        const pool = Database.getPool();
        if (pool) {
          const client = await pool.connect();
          try {
            await client.query("SELECT 1;");
            connected = true;
            logger.info(`[Database] Connection pool validated successfully on attempt ${attempt}.`);
            break;
          } finally {
            client.release();
          }
        }
      } catch (err: any) {
        logger.warn(`[Database] Connection attempt ${attempt} failed: ${err.message}. Retrying in ${delayMs}ms...`);
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs *= 2; // Exponential backoff
      }
    }

    if (!connected) {
      if (config.nodeEnv === "production" || config.nodeEnv === "staging") {
        logger.error(`[Database] CRITICAL: Failed to establish production database connection after ${maxRetries} attempts.`);
        throw new Error("PRODUCTION_DATABASE_CONNECTION_FAILED");
      } else {
        logger.warn(`[Database] Failed to connect to PostgreSQL. Gracefully reverting to High-Performance Memory-Backed engine.`);
      }
    }
  }

  try {
    const migrationResult = await Migrator.runMigrations();
    logger.info(`[Database] Migrations verified: ${migrationResult.currentVersion} (Applied: ${migrationResult.applied.length})`);
    await Seeder.runSeeds();
  } catch (err: any) {
    logger.error(`[Database] Initialization error: ${err.message}`);
    if (config.nodeEnv === "production" || config.nodeEnv === "staging") {
      throw err;
    }
  }
}

