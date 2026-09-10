import { Database } from "./connection";
import { Migrator } from "./migrator";
import { Seeder } from "./seeds";
import { logger } from "../utils/logger";

export * from "./connection";
export * from "./migrator";
export * from "./seeds";

export async function initializeDatabase(): Promise<void> {
  try {
    Database.initialize();
    const migrationResult = await Migrator.runMigrations();
    logger.info(`[Database] Migrations verified: ${migrationResult.currentVersion} (Applied: ${migrationResult.applied.length})`);
    await Seeder.runSeeds();
  } catch (err: any) {
    logger.error(`[Database] Initialization error: ${err.message}`);
  }
}
