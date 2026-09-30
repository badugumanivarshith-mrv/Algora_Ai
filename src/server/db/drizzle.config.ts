/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Drizzle ORM Configuration File
 */

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./src/server/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/algora_db"
  }
});
