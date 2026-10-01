/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Production Migration and Seeder Script
 */

import { pool } from "./db";
import { seedDatabase } from "./seed";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Starting Production PostgreSQL Database Setup...");

  try {
    // 1. Check Pool connection
    console.log("🔗 Connecting to PostgreSQL...");
    const client = await pool.connect();
    console.log("✅ Successfully connected to PostgreSQL!");

    // 2. Read schema.sql content
    const schemaPath = path.join(process.cwd(), "src", "server", "db", "schema.sql");
    console.log(`📖 Reading schema file from: ${schemaPath}`);
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");

    // 3. Execute migrations
    console.log("⚡ Executing database schema migrations...");
    await client.query(schemaSql);
    console.log("✅ Database schema migrations executed successfully!");

    // Release client back to pool
    client.release();

    // 4. Seed database records
    console.log("🌱 Executing database records seeder...");
    await seedDatabase();
    console.log("✅ Seeding completed successfully!");

    console.log("🎉 Production PostgreSQL Database is fully configured and ready!");
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Fatal Database Setup Error:", err.message);
    process.exit(1);
  }
}

main();
