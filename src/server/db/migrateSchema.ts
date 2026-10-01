/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { pool } from "./db";
import fs from "fs";
import path from "path";

async function run() {
  const schemaPath = path.join(process.cwd(), "src", "server", "db", "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf-8");
  await pool.query(sql);
  console.log("Migration applied.");
  process.exit(0);
}
run();
